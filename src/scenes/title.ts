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

  add([sprite("bg-far"), pos(0, 0), scale(720 / 1024), fixed(), z(-100), opacity(0.7)])
  add([sprite("bg-mid"), pos(0, 0), scale(720 / 1024), fixed(), z(-90), opacity(0.4)])

  // Backing panel for title text readability
  add([
    rect(820, 180, { radius: 12 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 80),
    anchor("center"),
    color(20, 10, 35),
    opacity(0.65),
    z(1),
  ])

  // Main title — stacked two lines for impact
  add([
    text("NINJA", { size: 84, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 120),
    anchor("center"),
    color(255, 80, 160),
    z(2),
  ])
  add([
    text("BALLERINA", { size: 84, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 50),
    anchor("center"),
    color(255, 220, 120),
    z(2),
  ])

  // Show the actual character next to the title
  add([
    sprite("ballerina-idle"),
    pos(SCREEN.WIDTH / 2 + 320, SCREEN.HEIGHT / 2 + 40),
    scale(0.18),
    anchor("center"),
    z(2),
  ])

  // Subtitle
  add([
    text("The Stolen Show", { size: 32, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 30),
    anchor("center"),
    color(255, 255, 255),
    z(2),
  ])

  const prompt = add([
    text("Press SPACE or ENTER to Start", { size: 24, font: "Bangers" }),
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
