import { SCREEN } from "../config"
import { loadProgress, isLevelUnlocked } from "../components/progress"
import { fadeIn, fadeOut } from "../components/transition"

interface LevelEntry {
  id: string
  name: string
  tint: [number, number, number]
}

const LEVELS: LevelEntry[] = [
  { id: "level1", name: "Welcome to the Studio", tint: [255, 200, 200] },
  { id: "level2", name: "Silk & Shadows", tint: [150, 150, 255] },
  { id: "level3", name: "The Training Grounds", tint: [150, 220, 150] },
  { id: "level4", name: "The Sticky Kitchen", tint: [220, 180, 120] },
  { id: "level5", name: "Above the Rafters", tint: [120, 120, 200] },
  { id: "level6", name: "The Gauntlet", tint: [255, 140, 120] },
  { id: "boss", name: "Soggy Waffle Showdown", tint: [200, 100, 100] },
]

const CARD_W = 140
const CARD_H = 100
const COL_SPACING = 160
const COLS = 4
const ROW1_Y = 220
const ROW2_Y = 350
const START_X = (SCREEN.WIDTH - COLS * COL_SPACING) / 2 + COL_SPACING / 2

function gridPos(index: number): { col: number; row: number } {
  if (index < 4) return { col: index, row: 0 }
  return { col: index - 4, row: 1 }
}

function cardCenter(index: number): { x: number; y: number } {
  const { col, row } = gridPos(index)
  return {
    x: START_X + col * COL_SPACING,
    y: row === 0 ? ROW1_Y : ROW2_Y,
  }
}

export default function levelSelect() {
  fadeIn(0.3)

  const progress = loadProgress()
  let selected = 0

  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(30, 25, 50),
    z(-200),
  ])

  add([sprite("bg-far"), pos(0, 0), scale(720 / 1024), fixed(), z(-100), opacity(0.6)])
  add([sprite("bg-mid"), pos(0, 0), scale(720 / 1024), fixed(), z(-90), opacity(0.3)])

  add([
    text("SELECT LEVEL", { size: 48, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, 60),
    anchor("center"),
    color(255, 105, 180),
  ])

  const cards: { border: any; bg: any; overlay: any }[] = []

  for (let i = 0; i < LEVELS.length; i++) {
    const lv = LEVELS[i]
    const { x, y } = cardCenter(i)
    const unlocked = isLevelUnlocked(lv.id)
    const completed = progress.levelsCompleted.includes(lv.id)
    const bestSeq = progress.bestSequins[lv.id] ?? 0

    const borderColor = unlocked ? [255, 215, 0] : [68, 68, 68]
    const border = add([
      rect(CARD_W + 4, CARD_H + 4, { radius: 6 }),
      pos(x, y),
      anchor("center"),
      color(borderColor[0], borderColor[1], borderColor[2]),
      z(1),
    ])

    const t = lv.tint
    const bgR = Math.floor(40 + (t[0] - 40) * 0.4)
    const bgG = Math.floor(30 + (t[1] - 30) * 0.4)
    const bgB = Math.floor(50 + (t[2] - 50) * 0.4)
    const bg = add([
      rect(CARD_W, CARD_H, { radius: 4 }),
      pos(x, y),
      anchor("center"),
      color(bgR, bgG, bgB),
      z(2),
    ])

    const numText = lv.id === "boss" ? "VS" : `${i + 1}`
    add([
      text(numText, { size: 32, font: "Bangers" }),
      pos(x, y - 14),
      anchor("center"),
      color(255, 255, 255),
      z(3),
    ])

    const displayName = lv.name.length > 18 ? lv.name.slice(0, 16) + ".." : lv.name
    add([
      text(displayName, { size: 12, font: "Bangers" }),
      pos(x, y + 18),
      anchor("center"),
      color(200, 200, 200),
      z(3),
    ])

    if (!unlocked) {
      add([
        text("🔒 LOCKED", { size: 12, font: "Bangers" }),
        pos(x, y + 38),
        anchor("center"),
        color(120, 120, 120),
        z(3),
      ])
    } else if (completed) {
      add([
        text(`✓ Best: ${bestSeq}`, { size: 12, font: "Bangers" }),
        pos(x, y + 38),
        anchor("center"),
        color(100, 255, 100),
        z(3),
      ])
    }

    let overlay = null
    if (!unlocked) {
      overlay = add([
        rect(CARD_W, CARD_H, { radius: 4 }),
        pos(x, y),
        anchor("center"),
        color(0, 0, 0),
        opacity(0.5),
        z(4),
      ])
    }

    cards.push({ border, bg, overlay })
  }

  function updateSelection() {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      const unlocked = isLevelUnlocked(LEVELS[i].id)
      if (i === selected) {
        card.border.color = rgb(255, 105, 180)
        card.border.use(scale(1.05))
        card.bg.use(scale(1.05))
      } else {
        const bc = unlocked ? [255, 215, 0] : [68, 68, 68]
        card.border.color = rgb(bc[0], bc[1], bc[2])
        card.border.use(scale(1))
        card.bg.use(scale(1))
      }
    }
  }

  updateSelection()

  let pulseTime = 0
  onUpdate(() => {
    pulseTime += dt()
    const card = cards[selected]
    card.border.opacity = 0.7 + 0.3 * Math.sin(pulseTime * 4)
  })

  add([
    text("←→↑↓ Select   SPACE/ENTER Play   ESC Back", { size: 16, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT - 40),
    anchor("center"),
    color(150, 150, 150),
  ])

  onKeyPress("right", () => {
    const { col, row } = gridPos(selected)
    const maxCol = row === 0 ? 3 : Math.min(2, LEVELS.length - 5)
    if (col < maxCol) {
      selected++
      updateSelection()
    }
  })

  onKeyPress("left", () => {
    const { col } = gridPos(selected)
    if (col > 0) {
      selected--
      updateSelection()
    }
  })

  onKeyPress("down", () => {
    const { col, row } = gridPos(selected)
    if (row === 0) {
      const newIdx = 4 + col
      if (newIdx < LEVELS.length) {
        selected = newIdx
        updateSelection()
      }
    }
  })

  onKeyPress("up", () => {
    const { col, row } = gridPos(selected)
    if (row === 1) {
      selected = col
      updateSelection()
    }
  })

  function play() {
    const lv = LEVELS[selected]
    if (!isLevelUnlocked(lv.id)) return
    fadeOut(0.3, () => go("game", lv.id))
  }

  onKeyPress("space", play)
  onKeyPress("enter", play)
  onKeyPress("escape", () => fadeOut(0.3, () => go("title")))
}
