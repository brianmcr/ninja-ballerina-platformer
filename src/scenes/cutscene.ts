import { SCREEN } from "../config"
import { fadeIn, fadeOut } from "../components/transition"

interface CutsceneFrame {
  text: string
  duration: number
  bgColor?: [number, number, number]
  shake?: boolean
}

export interface CutsceneData {
  frames: CutsceneFrame[]
  nextScene: string
}

export const level1Intro: CutsceneData = {
  frames: [
    { text: "The Dojo Studio... a place of grace and discipline.", duration: 2 },
    { text: "*CRASH!*", duration: 0.5, shake: true },
    { text: "Soggy Waffle bursts through the wall!", duration: 2 },
    { text: "\"Your golden ballet slippers are MINE now!\"\n— Soggy Waffle", duration: 3 },
    { text: "He escapes into the dojo... you must chase him down!", duration: 2 },
  ],
  nextScene: "game",
}

export default function cutscene(data: CutsceneData) {
  fadeIn(0.3)

  add([sprite("bg-far"), pos(0, 0), scale(720 / 1024), fixed(), z(-100), opacity(0.4)])

  const bg = add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(30, 30, 50),
    fixed(),
    z(-150),
  ])

  const label = add([
    text("", { size: 28, width: SCREEN.WIDTH - 120, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(1),
  ])

  const skipHint = add([
    text("Press SPACE or ENTER to skip", { size: 14, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT - 40),
    anchor("center"),
    color(150, 150, 150),
    fixed(),
    z(1),
  ])

  let frameIndex = 0
  let charIndex = 0
  let charTimer = 0
  let frameTimer = 0
  let typewriterDone = false
  const TYPE_SPEED = 0.03

  function startFrame() {
    if (frameIndex >= data.frames.length) {
      fadeOut(0.3, () => go(data.nextScene))
      return
    }
    const f = data.frames[frameIndex]
    charIndex = 0
    charTimer = 0
    frameTimer = 0
    typewriterDone = false
    label.text = ""

    if (f.bgColor) {
      bg.color = rgb(f.bgColor[0], f.bgColor[1], f.bgColor[2])
    } else {
      bg.color = rgb(30, 30, 50)
    }

    if (f.shake) {
      shake(8)
    }
  }

  startFrame()

  onUpdate(() => {
    if (frameIndex >= data.frames.length) return
    const f = data.frames[frameIndex]

    if (!typewriterDone) {
      charTimer += dt()
      while (charTimer >= TYPE_SPEED && charIndex < f.text.length) {
        charTimer -= TYPE_SPEED
        charIndex++
        label.text = f.text.slice(0, charIndex)
      }
      if (charIndex >= f.text.length) {
        typewriterDone = true
        label.text = f.text
      }
    } else {
      frameTimer += dt()
      if (frameTimer >= f.duration) {
        frameIndex++
        startFrame()
      }
    }
  })

  function advance() {
    if (frameIndex >= data.frames.length) return
    if (!typewriterDone) {
      const f = data.frames[frameIndex]
      label.text = f.text
      charIndex = f.text.length
      typewriterDone = true
      frameTimer = 0
    } else {
      frameIndex++
      startFrame()
    }
  }

  onKeyPress("space", advance)
  onKeyPress("enter", advance)

  void skipHint
}
