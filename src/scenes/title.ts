import { SCREEN } from "../config"
import { loadProgress } from "../components/progress"

export default function title() {
  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(20, 20, 50),
  ])

  // Title logo sprite
  add([
    sprite("title-logo"),
    scale(600 / 1792),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 60),
    anchor("center"),
  ])

  add([
    text("A Platformer Adventure", { size: 24 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 20),
    anchor("center"),
    color(200, 180, 220),
  ])

  const prompt = add([
    text("Press SPACE to Start", { size: 20 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT - 100),
    anchor("center"),
    color(255, 255, 255),
    opacity(1),
  ])

  // Blink effect
  let blinkTimer = 0
  onUpdate(() => {
    blinkTimer += dt()
    prompt.opacity = Math.sin(blinkTimer * 3) > 0 ? 1 : 0.2
  })

  function start() {
    const progress = loadProgress()
    if (progress.firstPlayDone) {
      go("levelSelect")
    } else {
      go("cutscene")
    }
  }

  onKeyPress("space", start)
  onKeyPress("enter", start)
}
