import { SCREEN, BOSS } from "../config"
import type { LevelData } from "./level1"

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const bossArena: LevelData = {
  name: "Soggy Waffle's Lair",
  width: BOSS.ARENA_WIDTH,
  playerSpawn: { x: 200, y: FLOOR_Y - 10 },
  platforms: [
    // Full-width floor
    { type: "solid", x: 0, y: FLOOR_Y, width: BOSS.ARENA_WIDTH, height: FLOOR_H },

    // Left wall
    { type: "solid", x: 0, y: 200, width: 32, height: FLOOR_Y - 200 },
    // Right wall
    { type: "solid", x: BOSS.ARENA_WIDTH - 32, y: 200, width: 32, height: FLOOR_Y - 200 },

    // Elevated platforms for Phase 2 (3 at different heights)
    // Left platform
    { type: "solid", x: 300, y: FLOOR_Y - 200, width: 200, height: 16 },
    // Center platform (highest)
    { type: "solid", x: 700, y: FLOOR_Y - 320, width: 200, height: 16 },
    // Right platform
    { type: "solid", x: 1100, y: FLOOR_Y - 200, width: 200, height: 16 },
  ],
  pickups: [
    // Ninja powerup at the start
    { type: "ninjaPowerup", x: 100, y: FLOOR_Y - 40 },
    // Weapon pickups spread around
    { type: "katana", x: 500, y: FLOOR_Y - 240 },
    { type: "sais", x: 1000, y: FLOOR_Y - 240 },
  ],
}

export default bossArena
