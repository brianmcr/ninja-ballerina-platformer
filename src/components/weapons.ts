import { WEAPON } from "../config"
import { playShuriken, playWhip, playCoin } from "./audio"
import { popText } from "./effects"
import { createSequin } from "../entities/pickups"

// Break a destructible with fragment particles + dropped sequin,
// Mario-block style. Used by every attack that can break blocks so the
// feedback is consistent regardless of weapon.
export function breakDestructible(d: any) {
  if (!d.exists()) return
  const x = d.pos.x + (d.width ?? 24) / 2
  const y = d.pos.y - (d.height ?? 24) / 2
  // 4-6 fragment cubes flying outward
  const count = 5
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.5
    const spd = 180 + Math.random() * 80
    const vx = Math.cos(angle) * spd
    const vy = Math.sin(angle) * spd
    const frag = add([
      rect(6, 6),
      pos(x, y),
      anchor("center"),
      color(139, 100, 60),
      rotate(Math.random() * 360),
      z(40),
    ])
    let age = 0
    frag.onUpdate(() => {
      age += dt()
      frag.pos.x += vx * dt()
      frag.pos.y += vy * dt() + 800 * age * dt()
      frag.angle += dt() * 360
      if (age > 0.6) destroy(frag)
    })
  }
  // Drop a sequin
  const seq = createSequin(x, y - 20) as any
  if (seq) {
    let t = 0
    const arcUpdate = onUpdate(() => {
      if (!seq.exists()) { arcUpdate.cancel(); return }
      t += dt()
      if (t >= 0.35) { arcUpdate.cancel(); return }
      seq.pos.y = (y - 20) - Math.sin(t / 0.35 * Math.PI) * 30
    })
  }
  playCoin()
  popText(x, y - 30, "+1", [255, 215, 0], 16)
  destroy(d)
}

export type WeaponType = "none" | "shuriken" | "katana" | "sais"

export function fireShuriken(player: any) {
  if (player.weaponCooldown > 0) return
  player.weaponCooldown = WEAPON.SHURIKEN.COOLDOWN
  playShuriken()

  const projX = player.pos.x + player.facing * (32 / 2 + 4)
  const projY = player.pos.y - 24
  const dir = player.facing

  const star = add([
    rect(WEAPON.SHURIKEN.SIZE, WEAPON.SHURIKEN.SIZE),
    pos(projX, projY),
    area(),
    anchor("center"),
    color(WEAPON.SHURIKEN.COLOR[0], WEAPON.SHURIKEN.COLOR[1], WEAPON.SHURIKEN.COLOR[2]),
    "shuriken-proj",
    { dir },
  ])

  star.onUpdate(() => {
    star.move(dir * WEAPON.SHURIKEN.SPEED, 0)
    if (Math.abs(star.pos.x - projX) > 800) destroy(star)
  })

  star.onCollide("enemy", (e: any) => {
    if (e.hurt) {
      if (e.is("syrupDripper")) {
        e.hurt(1, "ranged")
      } else {
        const fromDir = star.pos.x < e.pos.x ? -1 : 1
        if (e.hurt.length >= 2) {
          e.hurt(99, fromDir)
        } else {
          e.hurt(99)
        }
      }
    }
    destroy(star)
  })

  star.onCollide("platform", () => destroy(star))
}

export function swingKatana(player: any) {
  if (player.weaponCooldown > 0) return
  player.weaponCooldown = WEAPON.KATANA.DURATION
  playWhip()

  const hitX = player.pos.x + player.facing * (32 / 2 + WEAPON.KATANA.WIDTH / 2)
  const hitY = player.pos.y - 24

  const blade = add([
    rect(WEAPON.KATANA.WIDTH, WEAPON.KATANA.HEIGHT),
    pos(hitX, hitY),
    area(),
    anchor("center"),
    color(WEAPON.KATANA.COLOR[0], WEAPON.KATANA.COLOR[1], WEAPON.KATANA.COLOR[2]),
    opacity(0.7),
    "katana-hitbox",
  ])

  const hit = new Set<any>()

  blade.onCollide("enemy", (e: any) => {
    if (hit.has(e)) return
    hit.add(e)
    if (e.hurt) {
      if (e.is("syrupDripper")) return // katana can't kill syrup drippers
      const fromDir = player.pos.x < e.pos.x ? -1 : 1
      if (e.hurt.length >= 2) {
        e.hurt(1, fromDir)
      } else {
        e.hurt(1)
      }
    }
  })

  blade.onCollide("destructible", (d: any) => {
    breakDestructible(d)
  })

  blade.onCollide("syrup-drop", (d: any) => {
    destroy(d)
  })

  const timer = { t: WEAPON.KATANA.DURATION }
  blade.onUpdate(() => {
    timer.t -= dt()
    blade.pos.x = player.pos.x + player.facing * (32 / 2 + WEAPON.KATANA.WIDTH / 2)
    blade.pos.y = player.pos.y - 24
    if (timer.t <= 0) destroy(blade)
  })
}

export function stabSais(player: any) {
  if (player.weaponCooldown > 0) return
  player.weaponCooldown = WEAPON.SAIS.COOLDOWN
  playShuriken()

  const hitX = player.pos.x + player.facing * (32 / 2 + WEAPON.SAIS.WIDTH / 2)
  const hitY = player.pos.y - 24

  const sai = add([
    rect(WEAPON.SAIS.WIDTH, WEAPON.SAIS.HEIGHT),
    pos(hitX, hitY),
    area(),
    anchor("center"),
    color(WEAPON.SAIS.COLOR[0], WEAPON.SAIS.COLOR[1], WEAPON.SAIS.COLOR[2]),
    opacity(0.7),
    "sai-hitbox",
  ])

  const hit = new Set<any>()

  sai.onCollide("enemy", (e: any) => {
    if (hit.has(e)) return
    hit.add(e)
    if (e.hurt) {
      if (e.is("syrupDripper")) return // sais can't kill syrup drippers directly (use deflected drops)
      const fromDir = player.pos.x < e.pos.x ? -1 : 1
      if (e.hurt.length >= 2) {
        e.hurt(1, fromDir)
      } else {
        e.hurt(1)
      }
    }
  })

  sai.onCollide("syrup-drop", (d: any) => {
    if (d.is("deflected")) return
    d.gravityScale = 0
    d.vel.y = -400
    d.use("deflected")

    d.onCollide("syrupDripper", (dripper: any) => {
      if (dripper.hurt) dripper.hurt(1, "ranged")
      destroy(d)
    })
  })

  const timer = { t: WEAPON.SAIS.DURATION }
  sai.onUpdate(() => {
    timer.t -= dt()
    sai.pos.x = player.pos.x + player.facing * (32 / 2 + WEAPON.SAIS.WIDTH / 2)
    sai.pos.y = player.pos.y - 24
    if (timer.t <= 0) destroy(sai)
  })
}

export function updateWeaponCooldown(player: any) {
  if (player.weaponCooldown > 0) {
    player.weaponCooldown -= dt()
    if (player.weaponCooldown < 0) player.weaponCooldown = 0
  }
}
