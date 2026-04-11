import loadLevel from "../levels/loader"
import level1 from "../levels/level1"
import type { PlayerHealth } from "../components/health"

export default function game() {
  const { player } = loadLevel(level1)

  const stateLabel = add([
    text("State: idle", { size: 16 }),
    pos(12, 12),
    fixed(),
    color(255, 255, 255),
  ])

  const livesLabel = add([
    text("Lives: 3", { size: 16 }),
    pos(12, 36),
    fixed(),
    color(255, 255, 255),
  ])

  const sequinLabel = add([
    text("Sequins: 0", { size: 16 }),
    pos(width() - 12, 12),
    fixed(),
    anchor("topright"),
    color(255, 215, 0),
  ])

  const ninjaLabel = add([
    text("", { size: 16 }),
    pos(12, 58),
    fixed(),
    color(255, 165, 0),
  ])

  add([
    text("Arrows/WASD: Move | Space: Jump/Float | Z: Spin | X: Dash | C: Whip", { size: 14 }),
    pos(12, 80),
    fixed(),
    color(200, 200, 200),
  ])

  player.onUpdate(() => {
    const h = player.health as PlayerHealth
    stateLabel.text = `State: ${player.state}`
    livesLabel.text = `Lives: ${h.lives}`
    sequinLabel.text = `Sequins: ${h.sequins}`
    ninjaLabel.text = h.isNinja ? "NINJA" : ""
  })
}
