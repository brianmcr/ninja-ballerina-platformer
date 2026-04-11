import { SCREEN } from "../config"

export interface GameOverData {
  levelId: string
  sequins: number
}

export default function gameOver(data: GameOverData) {
  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(40, 10, 10),
  ])

  add([
    text("GAME OVER", { size: 72 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 80),
    anchor("center"),
    color(255, 50, 50),
  ])

  add([
    text(`Sequins collected: ${data.sequins}`, { size: 24 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 10),
    anchor("center"),
    color(255, 215, 0),
  ])

  add([
    text("Press SPACE to Try Again", { size: 22 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 80),
    anchor("center"),
    color(200, 200, 200),
  ])

  add([
    text("Press ESCAPE for Level Select", { size: 18 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 120),
    anchor("center"),
    color(150, 150, 150),
  ])

  onKeyPress("space", () => {
    if (data.levelId === "boss") {
      go("game", "boss")
    } else {
      go("game")
    }
  })

  onKeyPress("escape", () => go("levelSelect"))
}
