import { SCREEN } from "../config"

export interface PlatformData {
  type: "solid" | "one-way" | "bouncy" | "swing"
  x: number
  y: number
  width: number
  height: number
  swingRange?: number
  swingSpeed?: number
}

export interface EnemySpawn {
  type: "butterPat" | "glutenBlob" | "syrupDripper" | "milkCarton"
  x: number
  y: number
  patrolRange?: number
}

export interface PickupSpawn {
  type: "ninjaPowerup" | "sequin" | "katana" | "sais" | "ribbon"
  x: number
  y: number
}

export interface DestructibleData {
  x: number
  y: number
  width: number
  height: number
}

export interface CheckpointData {
  x: number
  y: number
}

export interface LevelData {
  name: string
  width: number
  playerSpawn: { x: number; y: number }
  platforms: PlatformData[]
  enemies?: EnemySpawn[]
  pickups?: PickupSpawn[]
  destructibles?: DestructibleData[]
  checkpoints?: CheckpointData[]
  bgTint?: [number, number, number]
}

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const level1: LevelData = {
  name: "Welcome to the Studio",
  bgTint: [255, 200, 200],
  width: 3200,
  playerSpawn: { x: 200, y: FLOOR_Y - 10 },
  platforms: [
    // Floor segments — wide, forgiving gaps
    { type: "solid", x: 0, y: FLOOR_Y, width: 900, height: FLOOR_H },
    { type: "solid", x: 1020, y: FLOOR_Y, width: 700, height: FLOOR_H },
    { type: "solid", x: 1840, y: FLOOR_Y, width: 600, height: FLOOR_H },
    { type: "solid", x: 2560, y: FLOOR_Y, width: 640, height: FLOOR_H },

    // Low balance beams
    { type: "solid", x: 350, y: FLOOR_Y - 100, width: 200, height: 16 },
    { type: "solid", x: 700, y: FLOOR_Y - 160, width: 160, height: 16 },

    // One-way platforms
    { type: "one-way", x: 500, y: FLOOR_Y - 240, width: 160, height: 12 },
    { type: "one-way", x: 1150, y: FLOOR_Y - 180, width: 180, height: 12 },
    { type: "one-way", x: 1500, y: FLOOR_Y - 240, width: 150, height: 12 },

    // Mid-level solid platforms — widened for forgiveness on the spike
    { type: "solid", x: 1880, y: FLOOR_Y - 200, width: 240, height: 16 },
    { type: "solid", x: 2180, y: FLOOR_Y - 140, width: 220, height: 16 },

    // Bouncy platform — teach the mechanic
    { type: "bouncy", x: 1400, y: FLOOR_Y - 16, width: 80, height: 16 },

    // Staircase of one-ways near end
    { type: "one-way", x: 2700, y: FLOOR_Y - 100, width: 120, height: 12 },
    { type: "one-way", x: 2820, y: FLOOR_Y - 180, width: 120, height: 12 },
    { type: "one-way", x: 2940, y: FLOOR_Y - 260, width: 120, height: 12 },
  ],
  enemies: [
    // Tutorial: first contact within 10 seconds of spawn so the player
    // gets to feel an attack connect before they've had time to get bored.
    { type: "butterPat", x: 780, y: FLOOR_Y, patrolRange: 50 },
    { type: "butterPat", x: 1200, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 2200, y: FLOOR_Y, patrolRange: 80 },
  ],
  pickups: [
    // Ninja powerups — first one floats in open air at a height a single
    // ground jump can reach, so pressing Space once grabs it. No beam
    // landing required. Subsequent powerups reward exploration.
    { type: "ninjaPowerup", x: 350, y: FLOOR_Y - 80 },
    { type: "ninjaPowerup", x: 540, y: FLOOR_Y - 270 },
    { type: "ninjaPowerup", x: 1960, y: FLOOR_Y - 230 },

    // Sequins along floor path (section 1)
    { type: "sequin", x: 260, y: FLOOR_Y - 20 },
    { type: "sequin", x: 320, y: FLOOR_Y - 20 },
    { type: "sequin", x: 380, y: FLOOR_Y - 20 },
    { type: "sequin", x: 440, y: FLOOR_Y - 20 },
    { type: "sequin", x: 560, y: FLOOR_Y - 20 },
    { type: "sequin", x: 620, y: FLOOR_Y - 20 },
    { type: "sequin", x: 680, y: FLOOR_Y - 20 },

    // Sequins on low platforms
    { type: "sequin", x: 400, y: FLOOR_Y - 125 },
    { type: "sequin", x: 480, y: FLOOR_Y - 125 },
    { type: "sequin", x: 750, y: FLOOR_Y - 185 },

    // Sequins along floor (section 2)
    { type: "sequin", x: 1080, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1150, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1220, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1350, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1420, y: FLOOR_Y - 20 },

    // Sequins on one-way platforms
    { type: "sequin", x: 1190, y: FLOOR_Y - 205 },
    { type: "sequin", x: 1260, y: FLOOR_Y - 205 },
    { type: "sequin", x: 1540, y: FLOOR_Y - 265 },

    // Sequins along floor (section 3)
    { type: "sequin", x: 1900, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1970, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2100, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2170, y: FLOOR_Y - 20 },

    // Sequins on mid platforms
    { type: "sequin", x: 1960, y: FLOOR_Y - 225 },
    { type: "sequin", x: 2260, y: FLOOR_Y - 165 },

    // Sequins along final floor + staircase
    { type: "sequin", x: 2620, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2690, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2750, y: FLOOR_Y - 125 },
    { type: "sequin", x: 2870, y: FLOOR_Y - 205 },
    { type: "sequin", x: 2990, y: FLOOR_Y - 285 },

    // Ribbons (hard-to-reach collectibles)
    { type: "ribbon", x: 800, y: FLOOR_Y - 350 },
    { type: "ribbon", x: 1540, y: FLOOR_Y - 380 },
    { type: "ribbon", x: 3050, y: FLOOR_Y - 350 },
  ],
  destructibles: [
    { x: 1550, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 2350, y: FLOOR_Y - 48, width: 48, height: 48 },
  ],
  checkpoints: [
    // First checkpoint ~40% through: on the second floor segment, just
    // before the 1720 floor gap. Saves a retry back to spawn if the kid
    // dies on the upcoming mid-section.
    { x: 1600, y: FLOOR_Y - 10 },
    // Second checkpoint ~65% through: on the third floor segment, past
    // the first hard gap. Anchors the mid-level spike.
    { x: 1880, y: FLOOR_Y - 10 },
  ],
}

export default level1
