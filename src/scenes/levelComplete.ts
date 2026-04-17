import { SCREEN } from "../config"
import { markLevelComplete } from "../components/progress"
import { fadeIn, fadeOut } from "../components/transition"
import { playCoin } from "../components/audio"

export interface LevelCompleteData {
  levelId: string
  sequins: number
  ribbons: number
  lives: number
  time: number
  nextLevel?: string | null
}

export default function levelComplete(data: LevelCompleteData) {
  fadeIn(0.3)
  markLevelComplete(data.levelId, data.sequins, data.ribbons ?? 0)

  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(20, 30, 50),
    z(-200),
  ])

  add([sprite("bg-far"), pos(0, 0), scale(720 / 1024), fixed(), z(-100), opacity(0.6)])
  add([sprite("bg-mid"), pos(0, 0), scale(720 / 1024), fixed(), z(-90), opacity(0.3)])

  add([
    text("Level Complete!", { size: 56, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, 120),
    anchor("center"),
    color(255, 215, 0),
  ])

  const mins = Math.floor(data.time / 60)
  const secs = Math.floor(data.time % 60)
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`

  add([
    text(`Time: ${timeStr}`, { size: 28, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, 240),
    anchor("center"),
    color(200, 200, 200),
  ])

  // Mario-style tally: score ticks up from zero, playing coin chime
  // every ~50 points so the payoff feels earned.
  const targetScore = data.sequins * 100 + (data.ribbons ?? 0) * 500
  const sequinsLine = add([
    text(`Sequins: 0`, { size: 28, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, 290),
    anchor("center"),
    color(255, 215, 0),
  ])
  const scoreLine = add([
    text(`Score: 0`, { size: 28, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, 340),
    anchor("center"),
    color(255, 255, 255),
  ])

  add([
    text(`Ribbons: ${data.ribbons ?? 0}/3`, { size: 28, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, 390),
    anchor("center"),
    color(200, 100, 200),
  ])

  add([
    text(`Lives: ${data.lives}`, { size: 24, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, 440),
    anchor("center"),
    color(255, 105, 180),
  ])

  // Animate the tally
  let tallyT = 0
  let tallySequins = 0
  let tallyScore = 0
  let coinTick = 0
  onUpdate(() => {
    tallyT += dt()
    const tallyDur = 1.5
    const n = Math.min(1, tallyT / tallyDur)
    const newSequins = Math.floor(data.sequins * n)
    const newScore = Math.floor(targetScore * n)
    if (newSequins !== tallySequins || newScore !== tallyScore) {
      tallySequins = newSequins
      tallyScore = newScore
      sequinsLine.text = `Sequins: ${tallySequins}`
      scoreLine.text = `Score: ${tallyScore}`
      coinTick++
      if (coinTick % 3 === 0 && tallyT < tallyDur) playCoin()
    }
  })

  const nextLabel = data.nextLevel
    ? "Press SPACE for next level  |  ESC for level select"
    : "Press SPACE to continue"

  const prompt = add([
    text(nextLabel, { size: 20, font: "Bangers" }),
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

  function advance() {
    if (data.nextLevel) {
      fadeOut(0.3, () => go("game", data.nextLevel))
    } else {
      fadeOut(0.3, () => go("levelSelect"))
    }
  }

  onKeyPress("space", advance)
  onKeyPress("enter", advance)
  onKeyPress("escape", () => fadeOut(0.3, () => go("levelSelect")))
}
