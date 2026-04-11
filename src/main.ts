import kaplay from "kaplay"
import { SCREEN, GRAVITY } from "./config"
import game from "./scenes/game"

kaplay({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  background: [50, 50, 80],
  canvas: document.querySelector("#game") as HTMLCanvasElement ?? undefined,
})

setGravity(GRAVITY)

scene("game", game)

go("game")
