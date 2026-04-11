import { SCREEN } from "../config"
import { loadProgress, isLevelUnlocked } from "../components/progress"

interface LevelEntry {
  id: string
  name: string
}

const LEVELS: LevelEntry[] = [
  { id: "level1", name: "1. Welcome to the Studio" },
  { id: "boss", name: "BOSS: Soggy Waffle Showdown" },
]

export default function levelSelect() {
  const progress = loadProgress()
  let selected = 0

  add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    color(30, 25, 50),
  ])

  add([
    text("SELECT LEVEL", { size: 48 }),
    pos(SCREEN.WIDTH / 2, 80),
    anchor("center"),
    color(255, 105, 180),
  ])

  const entries: any[] = []
  const startY = 200
  const gap = 70

  for (let i = 0; i < LEVELS.length; i++) {
    const lv = LEVELS[i]
    const unlocked = isLevelUnlocked(lv.id)
    const completed = progress.levelsCompleted.includes(lv.id)
    const bestSeq = progress.bestSequins[lv.id] ?? 0

    const label = unlocked ? lv.name : `🔒 ${lv.name}`
    const statusText = completed ? `  ✓  Best: ${bestSeq} sequins` : ""

    const entry = add([
      text(label + statusText, { size: 24 }),
      pos(SCREEN.WIDTH / 2, startY + i * gap),
      anchor("center"),
      color(unlocked ? 255 : 100, unlocked ? 255 : 100, unlocked ? 255 : 100),
    ])
    entries.push(entry)
  }

  const cursor = add([
    text("▶", { size: 28 }),
    pos(0, 0),
    anchor("center"),
    color(255, 215, 0),
  ])

  function updateCursor() {
    cursor.pos.x = SCREEN.WIDTH / 2 - 280
    cursor.pos.y = startY + selected * gap
  }
  updateCursor()

  add([
    text("↑↓ Select   SPACE/ENTER Play   ESC Back", { size: 16 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT - 50),
    anchor("center"),
    color(150, 150, 150),
  ])

  onKeyPress("up", () => {
    selected = (selected - 1 + LEVELS.length) % LEVELS.length
    updateCursor()
  })

  onKeyPress("down", () => {
    selected = (selected + 1) % LEVELS.length
    updateCursor()
  })

  function play() {
    const lv = LEVELS[selected]
    if (!isLevelUnlocked(lv.id)) return
    if (lv.id === "boss") {
      go("game", "boss")
    } else {
      go("game")
    }
  }

  onKeyPress("space", play)
  onKeyPress("enter", play)
  onKeyPress("escape", () => go("title"))
}
