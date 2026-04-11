const STORAGE_KEY = "ninja-ballerina-progress"

const LEVEL_ORDER = ["level1", "level2", "level3", "level4", "level5", "level6", "boss"]

export interface GameProgress {
  levelsCompleted: string[]
  bestSequins: Record<string, number>
  ribbonsFound: Record<string, number>
  firstPlayDone: boolean
}

function defaultProgress(): GameProgress {
  return {
    levelsCompleted: [],
    bestSequins: {},
    ribbonsFound: {},
    firstPlayDone: false,
  }
}

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return { ...defaultProgress(), ...JSON.parse(raw) }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress: GameProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markLevelComplete(levelId: string, sequins: number, ribbons: number) {
  const p = loadProgress()
  if (!p.levelsCompleted.includes(levelId)) {
    p.levelsCompleted.push(levelId)
  }
  p.bestSequins[levelId] = Math.max(p.bestSequins[levelId] ?? 0, sequins)
  p.ribbonsFound[levelId] = Math.max(p.ribbonsFound[levelId] ?? 0, ribbons)
  p.firstPlayDone = true
  saveProgress(p)
}

export function isLevelUnlocked(levelId: string): boolean {
  if (levelId === "level1") return true
  const idx = LEVEL_ORDER.indexOf(levelId)
  if (idx <= 0) return false
  const prev = LEVEL_ORDER[idx - 1]
  const p = loadProgress()
  return p.levelsCompleted.includes(prev)
}
