import { SCREEN } from "../config"
import { markLevelComplete } from "../components/progress"

export interface LevelCompleteData {
  levelId: string
  sequins: number
  lives: number
  time: number
}

export default function levelComplete(data: LevelCompleteData) {
  markLevelComplete(data.levelId, data.sequins, 0)

  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(20, 30, 50),
  ])

  add([
    text("Level Complete!", { size: 56 }),
    pos(SCREEN.WIDTH / 2, 120),
    anchor("center"),
    color(255, 215, 0),
  ])

  const mins = Math.floor(data.time / 60)
  const secs = Math.floor(data.time % 60)
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`

  add([
    text(`Time: ${timeStr}`, { size: 28 }),
    pos(SCREEN.WIDTH / 2, 240),
    anchor("center"),
    color(200, 200, 200),
  ])

  add([
    text(`Sequins: ${data.sequins}`, { size: 28 }),
    pos(SCREEN.WIDTH / 2, 290),
    anchor("center"),
    color(255, 215, 0),
  ])

  add([
    text(`Lives Remaining: ${data.lives}`, { size: 28 }),
    pos(SCREEN.WIDTH / 2, 340),
    anchor("center"),
    color(255, 105, 180),
  ])

  const prompt = add([
    text("Press SPACE to continue", { size: 22 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT - 100),
    anchor("center"),
    color(255, 255, 255),
    opacity(1),
  ])

  let blinkTimer = 0
  onUpdate(() => {
    blinkTimer += dt()
    prompt.opacity = Math.sin(blinkTimer * 3) > 0 ? 1 : 0.2
  })

  onKeyPress("space", () => go("levelSelect"))
  onKeyPress("enter", () => go("levelSelect"))
}
