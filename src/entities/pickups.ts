import { PICKUP, WEAPON } from "../config"
import { collectSequin, collectNinjaPowerup, collectRibbon } from "../components/health"
import { sequinCollectPop } from "../components/effects"
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

  const ninjaScale = PICKUP.NINJA_SIZE / 1024 * 2.4
  const pickup = add([
    sprite("ninja-powerup-sprite"),
    pos(x, y),
    area(),
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

  const spriteScale = sz / 1024 * 2.4
  const seq = add([
    sprite("sequin-sprite"),
    pos(x, y),
    area(),
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
    collectSequin(p)
    playCoin()
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

  const ribbonScale = sz / 1024 * 2.4
  const ribbon = add([
    sprite("ribbon-sprite"),
    pos(x, y),
    area(),
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
  const originY = y
  let elapsed = 0
  const c = weaponType === "katana" ? WEAPON.PICKUP_KATANA_COLOR : WEAPON.PICKUP_SAIS_COLOR
  const sz = WEAPON.PICKUP_SIZE
  const weaponSprite = weaponType === "katana" ? "weapon-katana-sprite" : "weapon-sais-sprite"
  const weaponScale = sz / 1024 * 2.4

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

  const pickup = add([
    sprite(weaponSprite),
    pos(x, y),
    area(),
    anchor("center"),
    scale(weaponScale),
    opacity(1),
    "pickup",
    "weaponPickup",
    { weaponType: weaponType as WeaponType },
  ])

  let wpnSparkleTimer = 0
  pickup.onUpdate(() => {
    elapsed += dt()
    const floatY = originY + Math.sin(elapsed * WEAPON.PICKUP_BOB_SPEED) * WEAPON.PICKUP_BOB_RANGE
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
