import { SCREEN } from "../config"
import { fadeIn, fadeOut } from "../components/transition"

export interface GameOverData {
  levelId: string
  sequins: number
}

export default function gameOver(data: GameOverData) {
  fadeIn(0.3)
  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(40, 10, 10),
    z(-200),
  ])

  add([sprite("bg-far"), pos(0, 0), scale(720 / 1024), fixed(), z(-100), opacity(0.6)])
  add([sprite("bg-mid"), pos(0, 0), scale(720 / 1024), fixed(), z(-90), opacity(0.3)])

  add([
    text("GAME OVER", { size: 72, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 80),
    anchor("center"),
    color(255, 50, 50),
  ])

  add([
    text(`Sequins collected: ${data.sequins}`, { size: 24, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 10),
    anchor("center"),
    color(255, 215, 0),
  ])

  add([
    text("Press SPACE to Try Again", { size: 22, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 80),
    anchor("center"),
    color(200, 200, 200),
  ])

  add([
    text("Press ESCAPE for Level Select", { size: 18, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 120),
    anchor("center"),
    color(150, 150, 150),
  ])

  onKeyPress("space", () => {
    fadeOut(0.3, () => go("game", data.levelId))
  })

  onKeyPress("escape", () => fadeOut(0.3, () => go("levelSelect")))
}
