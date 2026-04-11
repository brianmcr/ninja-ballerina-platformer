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

export interface LevelData {
  name: string
  width: number
  playerSpawn: { x: number; y: number }
  platforms: PlatformData[]
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
}

export default level1
