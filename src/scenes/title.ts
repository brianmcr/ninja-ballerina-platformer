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

  // Show the actual character next to the title — animated bob + gentle spin
  const ballerina = add([
    sprite("ballerina-idle"),
    pos(SCREEN.WIDTH / 2 + 320, SCREEN.HEIGHT / 2 + 40),
    scale(0.18),
    rotate(0),
    anchor("center"),
    z(2),
  ])
  const ballerinaBaseY = SCREEN.HEIGHT / 2 + 40
  ballerina.onUpdate(() => {
    ballerina.pos.y = ballerinaBaseY + Math.sin(time() * 2) * 8
    ballerina.angle = Math.sin(time() * 1.3) * 4
    ballerina.scale = vec2(0.18 * (1 + Math.sin(time() * 3) * 0.025))
  })

  // Floating sequins around the logo
  for (let i = 0; i < 8; i++) {
    const seq = add([
      rect(10, 10, { radius: 1 }),
      pos(SCREEN.WIDTH / 2 + (i - 3.5) * 90, SCREEN.HEIGHT / 2 - 210),
      anchor("center"),
      rotate(45),
      color(255, 215, 0),
      z(2),
    ])
    const baseY = SCREEN.HEIGHT / 2 - 210
    const phase = i * 0.4
    seq.onUpdate(() => {
      seq.pos.y = baseY + Math.sin(time() * 2 + phase) * 10
      seq.angle = 45 + Math.sin(time() * 3 + phase) * 15
    })
  }

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
