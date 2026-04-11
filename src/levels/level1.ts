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
  type: "ninjaPowerup" | "sequin" | "katana" | "sais"
  x: number
  y: number
}

export interface DestructibleData {
  x: number
  y: number
  width: number
  height: number
}

export interface LevelData {
  name: string
  width: number
  playerSpawn: { x: number; y: number }
  platforms: PlatformData[]
  enemies?: EnemySpawn[]
  pickups?: PickupSpawn[]
  destructibles?: DestructibleData[]
}

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const level1: LevelData = {
  name: "Training Studio",
  width: 3200,
  playerSpawn: { x: 200, y: FLOOR_Y - 10 },
  platforms: [
    // Floor segments (with gaps for floating/dashing across)
    { type: "solid", x: 0, y: FLOOR_Y, width: 800, height: FLOOR_H },
    { type: "solid", x: 960, y: FLOOR_Y, width: 600, height: FLOOR_H },
    { type: "solid", x: 1760, y: FLOOR_Y, width: 500, height: FLOOR_H },
    { type: "solid", x: 2460, y: FLOOR_Y, width: 740, height: FLOOR_H },

    // Low solid platforms (balance beams)
    { type: "solid", x: 300, y: FLOOR_Y - 120, width: 200, height: 16 },
    { type: "solid", x: 700, y: FLOOR_Y - 200, width: 160, height: 16 },
    { type: "solid", x: 1100, y: FLOOR_Y - 140, width: 180, height: 16 },

    // One-way platforms (bamboo scaffolding) - jump up through
    { type: "one-way", x: 500, y: FLOOR_Y - 260, width: 160, height: 12 },
    { type: "one-way", x: 850, y: FLOOR_Y - 320, width: 140, height: 12 },
    { type: "one-way", x: 1300, y: FLOOR_Y - 280, width: 180, height: 12 },
    { type: "one-way", x: 1600, y: FLOOR_Y - 200, width: 150, height: 12 },

    // Higher solid platforms
    { type: "solid", x: 1800, y: FLOOR_Y - 250, width: 200, height: 16 },
    { type: "solid", x: 2100, y: FLOOR_Y - 180, width: 180, height: 16 },
    { type: "solid", x: 2500, y: FLOOR_Y - 300, width: 160, height: 16 },

    // Bouncy platform (punching bag launcher)
    { type: "bouncy", x: 1450, y: FLOOR_Y - 16, width: 80, height: 16 },

    // Staircase of one-ways near end
    { type: "one-way", x: 2700, y: FLOOR_Y - 120, width: 120, height: 12 },
    { type: "one-way", x: 2820, y: FLOOR_Y - 200, width: 120, height: 12 },
    { type: "one-way", x: 2940, y: FLOOR_Y - 280, width: 120, height: 12 },

    // Swinging platform (hanging silk)
    { type: "swing", x: 2000, y: FLOOR_Y - 380, width: 100, height: 12, swingRange: 120, swingSpeed: 1.8 },
  ],
  enemies: [
    // Butter Pats on floor segments
    { type: "butterPat", x: 400, y: FLOOR_Y, patrolRange: 120 },
    { type: "butterPat", x: 1100, y: FLOOR_Y, patrolRange: 100 },

    // Gluten Blobs on platforms
    { type: "glutenBlob", x: 350, y: FLOOR_Y - 120 },
    { type: "glutenBlob", x: 1150, y: FLOOR_Y - 140 },

    // Syrup Drippers on ceiling above gaps
    { type: "syrupDripper", x: 880, y: 60 },
    { type: "syrupDripper", x: 1650, y: 60 },

    // Milk Carton Guards on wider floor segments
    { type: "milkCarton", x: 2000, y: FLOOR_Y, patrolRange: 80 },
    { type: "milkCarton", x: 2600, y: FLOOR_Y, patrolRange: 100 },
  ],
  pickups: [
    // Ninja powerups
    { type: "ninjaPowerup", x: 860, y: FLOOR_Y - 350 },
    { type: "ninjaPowerup", x: 2500, y: FLOOR_Y - 340 },

    // Sequins along floor paths
    { type: "sequin", x: 250, y: FLOOR_Y - 20 },
    { type: "sequin", x: 320, y: FLOOR_Y - 20 },
    { type: "sequin", x: 390, y: FLOOR_Y - 20 },
    { type: "sequin", x: 460, y: FLOOR_Y - 20 },
    { type: "sequin", x: 530, y: FLOOR_Y - 20 },
    { type: "sequin", x: 600, y: FLOOR_Y - 20 },

    // Sequins on low platforms
    { type: "sequin", x: 350, y: FLOOR_Y - 145 },
    { type: "sequin", x: 420, y: FLOOR_Y - 145 },
    { type: "sequin", x: 750, y: FLOOR_Y - 225 },
    { type: "sequin", x: 800, y: FLOOR_Y - 225 },

    // Sequins along second floor segment
    { type: "sequin", x: 1000, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1070, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1200, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1270, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1340, y: FLOOR_Y - 20 },

    // Sequins on one-way platforms
    { type: "sequin", x: 540, y: FLOOR_Y - 285 },
    { type: "sequin", x: 590, y: FLOOR_Y - 285 },
    { type: "sequin", x: 890, y: FLOOR_Y - 345 },
    { type: "sequin", x: 1350, y: FLOOR_Y - 305 },
    { type: "sequin", x: 1640, y: FLOOR_Y - 225 },

    // Sequins along third floor segment
    { type: "sequin", x: 1850, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1920, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1990, y: FLOOR_Y - 20 },

    // Sequins on higher platforms
    { type: "sequin", x: 1860, y: FLOOR_Y - 275 },
    { type: "sequin", x: 1930, y: FLOOR_Y - 275 },
    { type: "sequin", x: 2150, y: FLOOR_Y - 205 },

    // Sequins along final floor + staircase
    { type: "sequin", x: 2550, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2620, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2750, y: FLOOR_Y - 145 },
    { type: "sequin", x: 2870, y: FLOOR_Y - 225 },
    { type: "sequin", x: 2990, y: FLOOR_Y - 305 },

    // Weapon pickups
    { type: "katana", x: 1200, y: FLOOR_Y - 170 },
    { type: "sais", x: 2200, y: FLOOR_Y - 210 },
  ],
  destructibles: [
    { x: 1550, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1900, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 2350, y: FLOOR_Y - 48, width: 48, height: 48 },
  ],
}

export default level1
