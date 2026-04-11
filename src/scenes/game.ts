import loadLevel from "../levels/loader"
import level1 from "../levels/level1"

export default function game() {
  const { player } = loadLevel(level1)

  // HUD: show current state
  const stateLabel = add([
    text("State: idle", { size: 16 }),
    pos(12, 12),
    fixed(),
    color(255, 255, 255),
  ])

  add([
    text("Arrows/WASD: Move | Space: Jump/Float | Z: Spin | X: Dash | C: Whip", { size: 14 }),
    pos(12, 36),
    fixed(),
    color(200, 200, 200),
  ])

  player.onUpdate(() => {
    stateLabel.text = `State: ${player.state}`
  })
}
