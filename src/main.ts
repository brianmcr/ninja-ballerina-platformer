import kaplay from "kaplay"
import { SCREEN, GRAVITY } from "./config"
import game from "./scenes/game"
import cutscene, { level1Intro } from "./scenes/cutscene"

kaplay({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  background: [50, 50, 80],
  canvas: document.querySelector("#game") as HTMLCanvasElement ?? undefined,
})

setGravity(GRAVITY)

scene("cutscene", () => cutscene(level1Intro))
scene("game", (levelName?: string) => game(levelName))
scene("victory", () => {
  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(20, 20, 40),
  ])
  add([
    text("VICTORY!", { size: 64 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 40),
    anchor("center"),
    color(255, 215, 0),
  ])
  add([
    text("The golden ballet slippers have been recovered.\nPress SPACE to play again.", { size: 20 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 40),
    anchor("center"),
    color(200, 200, 200),
  ])
  onKeyPress("space", () => go("cutscene"))
})

go("cutscene")
