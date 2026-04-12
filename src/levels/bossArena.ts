import { SCREEN, BOSS } from "../config"
import type { LevelData } from "./level1"

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const bossArena: LevelData = {
  name: "Soggy Waffle's Lair",
  bgTint: [200, 100, 100],
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
    // Left platform (reachable with normal jump)
    { type: "solid", x: 300, y: FLOOR_Y - 160, width: 200, height: 16 },
    // Center platform (reachable from side platforms)
    { type: "solid", x: 700, y: FLOOR_Y - 300, width: 200, height: 16 },
    // Right platform (reachable with normal jump)
    { type: "solid", x: 1100, y: FLOOR_Y - 160, width: 200, height: 16 },
  ],
  pickups: [
    // Ninja powerup at the start
    { type: "ninjaPowerup", x: 100, y: FLOOR_Y - 40 },
    // Weapon pickups spread around
    { type: "katana", x: 500, y: FLOOR_Y - 200 },
    { type: "sais", x: 1000, y: FLOOR_Y - 200 },
  ],
}

export default bossArena
