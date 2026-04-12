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
import { fadeIn, fadeOut } from "./components/transition"

kaplay({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  background: [20, 15, 35],
  canvas: document.querySelector("#game") as HTMLCanvasElement ?? undefined,
})

setGravity(GRAVITY)

// Load custom font
loadFont("Bangers", "fonts/Bangers-Regular.ttf")

// Character sprites - Ballerina (single frame per state, procedural animation)
loadSprite("ballerina-idle", "sprites/ballerina-idle.png")
loadSprite("ballerina-run", "sprites/ballerina-run.png")
loadSprite("ballerina-jump", "sprites/ballerina-jump.png")
loadSprite("ballerina-spin", "sprites/ballerina-spin.png")
loadSprite("ballerina-whip", "sprites/ballerina-whip.png")

// Character sprites - Ninja
loadSprite("ninja-idle", "sprites/ninja-idle.png")
loadSprite("ninja-shuriken", "sprites/ninja-shuriken.png")
loadSprite("ninja-katana", "sprites/ninja-katana.png")
loadSprite("ninja-sais", "sprites/ninja-sais.png")

// Enemy sprites
loadSprite("soggy-waffle", "sprites/soggy-waffle.png")
loadSprite("butter-pat", "sprites/butter-pat.png")
loadSprite("gluten-blob", "sprites/gluten-blob.png")
loadSprite("syrup-dripper", "sprites/syrup-dripper.png")
loadSprite("milk-carton", "sprites/milk-carton.png")

// Background parallax layers
loadSprite("bg-far", "sprites/bg-far.png")
loadSprite("bg-mid", "sprites/bg-mid.png")
loadSprite("bg-near", "sprites/bg-near.png")

// Pickup sprites
loadSprite("sequin-sprite", "sprites/sequin.png")
loadSprite("ribbon-sprite", "sprites/ribbon.png")
loadSprite("ninja-powerup-sprite", "sprites/ninja-powerup.png")
loadSprite("weapon-katana-sprite", "sprites/weapon-katana.png")
loadSprite("weapon-sais-sprite", "sprites/weapon-sais.png")
loadSprite("weapon-shuriken-sprite", "sprites/weapon-shuriken.png")

// Other
loadSprite("title-logo", "sprites/title-logo.png")

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
  fadeIn(0.3)

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
    z(-200),
  ])

  add([sprite("bg-far"), pos(0, 0), scale(720 / 1024), fixed(), z(-100), opacity(0.6)])
  add([sprite("bg-mid"), pos(0, 0), scale(720 / 1024), fixed(), z(-90), opacity(0.3)])

  add([
    text("VICTORY!", { size: 64, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 40),
    anchor("center"),
    color(255, 215, 0),
  ])
  add([
    text("The golden ballet slippers have been recovered.\nPress SPACE to continue.", { size: 20, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 40),
    anchor("center"),
    color(200, 200, 200),
  ])
  onKeyPress("space", () => fadeOut(0.3, () => go("title")))
})

go("title")
