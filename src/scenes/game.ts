import { SCREEN } from "../config"
import createPlayer from "../entities/player"

export default function game() {
  const FLOOR_HEIGHT = 48

  // Floor
  add([
    rect(SCREEN.WIDTH, FLOOR_HEIGHT),
    pos(0, SCREEN.HEIGHT - FLOOR_HEIGHT),
    area(),
    body({ isStatic: true }),
    color(34, 139, 34),
    "floor",
  ])

  // Platforms for testing jumps and floats
  add([
    rect(200, 16),
    pos(300, SCREEN.HEIGHT - FLOOR_HEIGHT - 120),
    area(),
    body({ isStatic: true }),
    color(100, 100, 100),
    "platform",
  ])

  add([
    rect(200, 16),
    pos(600, SCREEN.HEIGHT - FLOOR_HEIGHT - 220),
    area(),
    body({ isStatic: true }),
    color(100, 100, 100),
    "platform",
  ])

  add([
    rect(150, 16),
    pos(900, SCREEN.HEIGHT - FLOOR_HEIGHT - 320),
    area(),
    body({ isStatic: true }),
    color(100, 100, 100),
    "platform",
  ])

  // Test enemy (punching bag)
  add([
    rect(32, 32),
    pos(500, SCREEN.HEIGHT - FLOOR_HEIGHT - 32),
    area(),
    anchor("bot"),
    color(255, 0, 0),
    "enemy",
    {
      hurt(dmg: number) {
        debug.log(`Enemy hit for ${dmg}!`)
      },
    },
  ])

  // Player
  const player = createPlayer(200, SCREEN.HEIGHT - FLOOR_HEIGHT - 10)

  // HUD: show current state
  const stateLabel = add([
    text("State: idle", { size: 16 }),
    pos(12, 12),
    fixed(),
    color(255, 255, 255),
  ])

  const controlsLabel = add([
    text("Arrows/WASD: Move | Space: Jump/Float | Z: Spin | X: Dash | C: Whip", { size: 14 }),
    pos(12, 36),
    fixed(),
    color(200, 200, 200),
  ])

  player.onUpdate(() => {
    stateLabel.text = `State: ${player.state}`
  })
}
