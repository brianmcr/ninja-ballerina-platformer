import { PICKUP, WEAPON } from "../config"
import { collectSequin, collectNinjaPowerup, collectRibbon, collectStar } from "../components/health"
import { sequinCollectPop, popText, starburstParticles } from "../components/effects"
import { playCoin, playPowerup } from "../components/audio"
import type { PlayerHealth } from "../components/health"
import type { WeaponType } from "../components/weapons"

export function createNinjaPowerup(x: number, y: number) {
  const originY = y
  let elapsed = 0

  // Rotating glow ring
  const glowRing = add([
    rect(PICKUP.NINJA_SIZE * 2.2, PICKUP.NINJA_SIZE * 2.2),
    pos(x, y),
    anchor("center"),
    color(255, 200, 50),
    opacity(0.15),
    rotate(0),
    z(-1),
  ])

  const ninjaScale = PICKUP.NINJA_SIZE / 1024 * 1.6
  // Desired world-space hit area, divided by entity scale so post-scale size matches
  const hitSize = (PICKUP.NINJA_SIZE * 3) / ninjaScale
  const pickup = add([
    sprite("ninja-powerup-sprite"),
    pos(x, y),
    area({ shape: new Rect(vec2(0), hitSize, hitSize) }),
    anchor("center"),
    opacity(1),
    scale(ninjaScale),
    "pickup",
    "ninjaPowerup",
  ])

  let sparkleTimer = 0
  pickup.onUpdate(() => {
    elapsed += dt()
    const bobY = originY + Math.sin(elapsed * PICKUP.NINJA_BOB_SPEED) * PICKUP.NINJA_BOB_RANGE
    pickup.pos.y = bobY
    pickup.opacity = 0.7 + 0.3 * Math.sin(elapsed * 4)

    const s = ninjaScale * (1 + Math.sin(time() * 2) * 0.15)
    pickup.scale = vec2(s)

    glowRing.pos.x = pickup.pos.x
    glowRing.pos.y = pickup.pos.y
    glowRing.angle += dt() * 90
    glowRing.opacity = 0.1 + Math.sin(time() * 3) * 0.08

    sparkleTimer -= dt()
    if (sparkleTimer <= 0) {
      sparkleTimer = 0.8
      const sp = add([
        circle(1.5),
        pos(pickup.pos.x + (Math.random() - 0.5) * PICKUP.NINJA_SIZE, pickup.pos.y + (Math.random() - 0.5) * PICKUP.NINJA_SIZE),
        anchor("center"),
        color(255, 215, 0),
        opacity(1),
        z(50),
      ])
      let st = 0
      sp.onUpdate(() => {
        st += dt()
        sp.opacity = Math.max(0, 1 - st / 0.3)
        if (sp.opacity <= 0) destroy(sp)
      })
    }
  })

  pickup.onCollide("player", (p: any) => {
    collectNinjaPowerup(p)
    playPowerup()
    destroy(glowRing)
    destroy(pickup)
  })

  return pickup
}

// Mario-style star power — rare pickup that grants ~8s of full
// invincibility with rainbow flash and enemies auto-die on touch.
export function createStarPowerup(x: number, y: number) {
  const sz = 28
  const originY = y
  let elapsed = 0
  const star = add([
    rect(sz, sz, { radius: 4 }),
    pos(x, y),
    area({ shape: new Rect(vec2(-sz * 2, -sz * 2), sz * 4, sz * 4) }),
    anchor("center"),
    color(255, 230, 80),
    rotate(0),
    z(20),
    "pickup",
    "starPowerup",
  ])
  // Star points — 5 small triangles arranged as a star
  for (let i = 0; i < 5; i++) {
    const ang = i * (Math.PI * 2 / 5) - Math.PI / 2
    star.add([
      rect(6, 10),
      pos(Math.cos(ang) * 8, Math.sin(ang) * 8),
      anchor("center"),
      rotate((ang * 180 / Math.PI) + 90),
      color(255, 255, 200),
    ])
  }
  // Glow
  const glow = add([
    rect(sz * 1.8, sz * 1.8, { radius: 6 }),
    pos(x, y),
    anchor("center"),
    color(255, 230, 100),
    opacity(0.3),
    z(19),
  ])
  star.onUpdate(() => {
    elapsed += dt()
    star.pos.y = originY + Math.sin(elapsed * 2) * 6
    star.angle = elapsed * 80
    glow.pos.x = star.pos.x
    glow.pos.y = star.pos.y
    glow.opacity = 0.2 + Math.sin(elapsed * 5) * 0.15
  })
  star.onCollide("player", (p: any) => {
    collectStar(p)
    playPowerup()
    starburstParticles(star.pos.x, star.pos.y, 20)
    popText(star.pos.x, star.pos.y - 30, "STAR POWER!", [255, 230, 100], 22)
    destroy(glow)
    destroy(star)
  })
  return star
}

export function createSequin(x: number, y: number) {
  const originY = y
  let elapsed = Math.random() * 6
  const sz = PICKUP.SEQUIN_SIZE

  // Glow aura behind sequin
  const glow = add([
    rect(sz * 2, sz * 2),
    pos(x, y),
    anchor("center"),
    color(255, 215, 0),
    opacity(0.15),
    rotate(45),
    z(-1),
  ])

  const spriteScale = sz / 1024 * 1.6
  // Very generous hit area in world space (4x visual), compensated for scale
  const hitSize = (sz * 4) / spriteScale
  const seq = add([
    sprite("sequin-sprite"),
    pos(x, y),
    area({ shape: new Rect(vec2(0), hitSize, hitSize) }),
    anchor("center"),
    scale(spriteScale),
    "pickup",
    "sequin",
  ])

  seq.onUpdate(() => {
    elapsed += dt()
    seq.pos.y = originY + Math.sin(elapsed * PICKUP.SEQUIN_BOB_SPEED) * PICKUP.SEQUIN_BOB_RANGE

    const s = spriteScale * (1 + Math.sin(time() * 3) * 0.1)
    seq.scale = vec2(s)

    glow.pos.x = seq.pos.x
    glow.pos.y = seq.pos.y
    glow.opacity = 0.1 + Math.sin(time() * 4) * 0.08
  })

  seq.onCollide("player", (p: any) => {
    sequinCollectPop(seq.pos.x, seq.pos.y)
    const gotLife = collectSequin(p)
    playCoin()
    popText(seq.pos.x, seq.pos.y - 20, "+1", [255, 215, 0], 18)
    if (gotLife) {
      popText(p.pos.x, p.pos.y - 80, "1UP!", [120, 255, 120], 32)
    }
    destroy(glow)
    destroy(seq)
  })

  return seq
}

export function createRibbon(x: number, y: number) {
  const originY = y
  let elapsed = Math.random() * 6
  const sz = PICKUP.RIBBON_SIZE

  // Trailing ribbon tail (3 pieces at decreasing opacity)
  const trail1 = add([
    rect(sz * 0.6, sz * 0.4),
    pos(x, y + sz * 0.7),
    anchor("center"),
    color(255, 105, 180),
    opacity(0.5),
    z(-1),
  ])
  const trail2 = add([
    rect(sz * 0.5, sz * 0.35),
    pos(x, y + sz * 1.2),
    anchor("center"),
    color(255, 105, 180),
    opacity(0.3),
    z(-1),
  ])
  const trail3 = add([
    rect(sz * 0.4, sz * 0.3),
    pos(x, y + sz * 1.6),
    anchor("center"),
    color(255, 105, 180),
    opacity(0.1),
    z(-1),
  ])

  const ribbonScale = sz / 1024 * 1.6
  const rHit = (sz * 3) / ribbonScale
  const ribbon = add([
    sprite("ribbon-sprite"),
    pos(x, y),
    area({ shape: new Rect(vec2(0), rHit, rHit) }),
    anchor("center"),
    scale(ribbonScale),
    rotate(0),
    opacity(1),
    "pickup",
    "ribbon",
  ])

  ribbon.onUpdate(() => {
    elapsed += dt()
    const baseY = originY + Math.sin(elapsed * PICKUP.RIBBON_BOB_SPEED) * PICKUP.RIBBON_BOB_RANGE
    ribbon.pos.y = baseY + Math.sin(time() * 2 + 1.5) * 0.5
    ribbon.angle = elapsed * PICKUP.RIBBON_ROTATE_SPEED * 60
    ribbon.opacity = 0.7 + 0.3 * Math.sin(elapsed * 2)

    trail1.pos.x = ribbon.pos.x
    trail1.pos.y = ribbon.pos.y + sz * 0.7
    trail1.opacity = 0.35 + 0.15 * Math.sin(elapsed * 3)

    trail2.pos.x = ribbon.pos.x
    trail2.pos.y = ribbon.pos.y + sz * 1.2
    trail2.opacity = 0.2 + 0.1 * Math.sin(elapsed * 3 + 1)

    trail3.pos.x = ribbon.pos.x
    trail3.pos.y = ribbon.pos.y + sz * 1.6
    trail3.opacity = 0.05 + 0.05 * Math.sin(elapsed * 3 + 2)
  })

  ribbon.onCollide("player", (p: any) => {
    sequinCollectPop(ribbon.pos.x, ribbon.pos.y)
    collectRibbon(p)
    playPowerup()
    destroy(trail1)
    destroy(trail2)
    destroy(trail3)
    destroy(ribbon)
  })

  return ribbon
}

export function createWeaponPickup(x: number, y: number, weaponType: "katana" | "sais") {
  let elapsed = 0
  const c = weaponType === "katana" ? WEAPON.PICKUP_KATANA_COLOR : WEAPON.PICKUP_SAIS_COLOR
  const sz = WEAPON.PICKUP_SIZE
  const weaponSprite = weaponType === "katana" ? "weapon-katana-sprite" : "weapon-sais-sprite"
  const weaponScale = sz / 1024 * 1.6

  // Glowing pedestal beneath weapon
  const pedestal = add([
    rect(sz * 1.4, 4),
    pos(x, y + sz * 0.55),
    anchor("center"),
    color(
      Math.min(c[0] + 60, 255),
      Math.min(c[1] + 60, 255),
      Math.min(c[2] + 60, 255),
    ),
    opacity(0.6),
    z(-1),
  ])

  const wHit = (sz * 3) / weaponScale
  const pickup = add([
    sprite(weaponSprite),
    pos(x, y),
    area({ shape: new Rect(vec2(0), wHit, wHit) }),
    anchor("center"),
    scale(weaponScale),
    opacity(1),
    "pickup",
    "weaponPickup",
    // originY is on the entity so repositioning (tests, dynamic moves)
    // can update both pos AND the bob baseline without the next frame
    // snapping back to the original spawn height.
    { weaponType: weaponType as WeaponType, originY: y },
  ])

  let wpnSparkleTimer = 0
  pickup.onUpdate(() => {
    elapsed += dt()
    const floatY = pickup.originY + Math.sin(elapsed * WEAPON.PICKUP_BOB_SPEED) * WEAPON.PICKUP_BOB_RANGE
    pickup.pos.y = floatY + Math.sin(time() * 2) * 0.5

    pedestal.pos.x = pickup.pos.x
    pedestal.pos.y = pickup.pos.y + sz * 0.55
    pedestal.opacity = 0.4 + 0.2 * Math.sin(time() * 3)

    wpnSparkleTimer -= dt()
    if (wpnSparkleTimer <= 0) {
      wpnSparkleTimer = 0.8
      const sp = add([
        circle(1.5),
        pos(pickup.pos.x + (Math.random() - 0.5) * sz, pickup.pos.y + (Math.random() - 0.5) * sz),
        anchor("center"),
        color(255, 215, 0),
        opacity(1),
        z(50),
      ])
      let st = 0
      sp.onUpdate(() => {
        st += dt()
        sp.opacity = Math.max(0, 1 - st / 0.3)
        if (sp.opacity <= 0) destroy(sp)
      })
    }
  })

  pickup.onCollide("player", (p: any) => {
    const h = p.health as PlayerHealth
    if (!h.isNinja) return
    p.currentWeapon = weaponType
    playPowerup()
    destroy(pedestal)
    destroy(pickup)
  })

  return pickup
}
