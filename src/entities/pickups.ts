import { PICKUP } from "../config"
import { collectSequin, collectNinjaPowerup } from "../components/health"

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
    collectSequin(p)
    destroy(seq)
  })

  return seq
}
