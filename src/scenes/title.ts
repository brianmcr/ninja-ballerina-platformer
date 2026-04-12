import { SCREEN } from "../config"
import { loadProgress } from "../components/progress"
import { fadeIn, fadeOut } from "../components/transition"

export default function title() {
  fadeIn(0.3)

  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(20, 20, 50),
    z(-200),
  ])

  add([sprite("bg-far"), pos(0, 0), scale(720 / 1024), fixed(), z(-100), opacity(0.6)])
  add([sprite("bg-mid"), pos(0, 0), scale(720 / 1024), fixed(), z(-90), opacity(0.3)])

  // Title logo sprite
  add([
    sprite("title-logo"),
    scale(600 / 1792),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 60),
    anchor("center"),
  ])

  add([
    text("A Platformer Adventure", { size: 24, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 20),
    anchor("center"),
    color(200, 180, 220),
  ])

  const prompt = add([
    text("Press SPACE to Start", { size: 20, font: "Bangers" }),
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
      fadeOut(0.3, () => go("levelSelect"))
    } else {
      fadeOut(0.3, () => go("cutscene"))
    }
  }

  onKeyPress("space", start)
  onKeyPress("enter", start)
}
