import { PICKUP, WEAPON } from "../config"
import { collectSequin, collectNinjaPowerup } from "../components/health"
import { sequinCollectPop } from "../components/effects"
import type { PlayerHealth } from "../components/health"
import type { WeaponType } from "../components/weapons"

export function createNinjaPowerup(x: number, y: number) {
  const originY = y
  let elapsed = 0

  const pickup = add([
    rect(PICKUP.NINJA_SIZE, PICKUP.NINJA_SIZE),
    pos(x, y),
    area(),
    anchor("center"),
    color(PICKUP.NINJA_COLOR[0], PICKUP.NINJA_COLOR[1], PICKUP.NINJA_COLOR[2]),
    opacity(1),
    "pickup",
    "ninjaPowerup",
  ])

  pickup.onUpdate(() => {
    elapsed += dt()
    pickup.pos.y = originY + Math.sin(elapsed * PICKUP.NINJA_BOB_SPEED) * PICKUP.NINJA_BOB_RANGE
    pickup.opacity = 0.7 + 0.3 * Math.sin(elapsed * 4)
  })

  pickup.onCollide("player", (p: any) => {
    collectNinjaPowerup(p)
    destroy(pickup)
  })

  return pickup
}

export function createSequin(x: number, y: number) {
  const originY = y
  let elapsed = Math.random() * 6

  const seq = add([
    rect(PICKUP.SEQUIN_SIZE, PICKUP.SEQUIN_SIZE),
    pos(x, y),
    area(),
    anchor("center"),
    color(PICKUP.SEQUIN_COLOR[0], PICKUP.SEQUIN_COLOR[1], PICKUP.SEQUIN_COLOR[2]),
    rotate(45),
    "pickup",
    "sequin",
  ])

  seq.onUpdate(() => {
    elapsed += dt()
    seq.pos.y = originY + Math.sin(elapsed * PICKUP.SEQUIN_BOB_SPEED) * PICKUP.SEQUIN_BOB_RANGE
  })

  seq.onCollide("player", (p: any) => {
    sequinCollectPop(seq.pos.x, seq.pos.y)
    collectSequin(p)
    destroy(seq)
  })

  return seq
}

export function createWeaponPickup(x: number, y: number, weaponType: "katana" | "sais") {
  const originY = y
  let elapsed = 0
  const c = weaponType === "katana" ? WEAPON.PICKUP_KATANA_COLOR : WEAPON.PICKUP_SAIS_COLOR
  const label = weaponType === "katana" ? "K" : "S"

  const pickup = add([
    rect(WEAPON.PICKUP_SIZE, WEAPON.PICKUP_SIZE),
    pos(x, y),
    area(),
    anchor("center"),
    color(c[0], c[1], c[2]),
    opacity(1),
    "pickup",
    "weaponPickup",
    { weaponType: weaponType as WeaponType },
  ])

  const txt = add([
    text(label, { size: 14 }),
    pos(x, y),
    anchor("center"),
    color(255, 255, 255),
  ])

  pickup.onUpdate(() => {
    elapsed += dt()
    pickup.pos.y = originY + Math.sin(elapsed * WEAPON.PICKUP_BOB_SPEED) * WEAPON.PICKUP_BOB_RANGE
    txt.pos.x = pickup.pos.x
    txt.pos.y = pickup.pos.y
  })

  pickup.onCollide("player", (p: any) => {
    const h = p.health as PlayerHealth
    if (!h.isNinja) {
      debug.log("Need ninja form!")
      return
    }
    p.currentWeapon = weaponType
    debug.log(`${weaponType} equipped!`)
    destroy(txt)
    destroy(pickup)
  })

  return pickup
}
