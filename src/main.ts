import kaplay from "kaplay"
import { SCREEN, GRAVITY } from "./config"
import game from "./scenes/game"
import cutscene, { level1Intro } from "./scenes/cutscene"
import title from "./scenes/title"
import levelSelect from "./scenes/levelSelect"
import levelComplete from "./scenes/levelComplete"
import type { LevelCompleteData } from "./scenes/levelComplete"
import gameOver from "./scenes/gameOver"
import type { GameOverData } from "./scenes/gameOver"
import { saveProgress, loadProgress } from "./components/progress"

kaplay({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  background: [50, 50, 80],
  canvas: document.querySelector("#game") as HTMLCanvasElement ?? undefined,
})

setGravity(GRAVITY)

scene("title", () => title())
scene("cutscene", () => {
  cutscene({
    ...level1Intro,
    nextScene: "game",
  })
})
scene("game", (levelName?: string) => game(levelName))
scene("levelSelect", () => levelSelect())
scene("levelComplete", (data: LevelCompleteData) => levelComplete(data))
scene("gameOver", (data: GameOverData) => gameOver(data))
scene("victory", () => {
  // Mark boss complete
  const p = loadProgress()
  if (!p.levelsCompleted.includes("boss")) {
    p.levelsCompleted.push("boss")
  }
  p.firstPlayDone = true
  saveProgress(p)

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
    text("The golden ballet slippers have been recovered.\nPress SPACE to continue.", { size: 20 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 40),
    anchor("center"),
    color(200, 200, 200),
  ])
  onKeyPress("space", () => go("title"))
})

go("title")
