import { PLAYER, SCREEN } from "../config"

export default function game() {
  const FLOOR_HEIGHT = 48

  add([
    rect(SCREEN.WIDTH, FLOOR_HEIGHT),
    pos(0, SCREEN.HEIGHT - FLOOR_HEIGHT),
    area(),
    body({ isStatic: true }),
    color(34, 139, 34),
    "floor",
  ])

  const player = add([
    rect(32, 48),
    pos(200, SCREEN.HEIGHT - FLOOR_HEIGHT - 100),
    area(),
    body(),
    color(255, 105, 180),
    "player",
  ])

  onKeyDown("left", () => {
    player.move(-PLAYER.RUN_SPEED, 0)
  })

  onKeyDown("right", () => {
    player.move(PLAYER.RUN_SPEED, 0)
  })

  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(PLAYER.JUMP_FORCE)
    }
  })
}
