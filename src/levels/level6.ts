import { SCREEN } from "../config"
import type { LevelData } from "./level1"

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const level6: LevelData = {
  name: "The Gauntlet",
  width: 4800,
  playerSpawn: { x: 120, y: FLOOR_Y - 10 },
  platforms: [
    // Sparse, dangerous floor
    { type: "solid", x: 0, y: FLOOR_Y, width: 350, height: FLOOR_H },
    { type: "solid", x: 600, y: FLOOR_Y, width: 300, height: FLOOR_H },
    { type: "solid", x: 1150, y: FLOOR_Y, width: 300, height: FLOOR_H },
    { type: "solid", x: 1700, y: FLOOR_Y, width: 250, height: FLOOR_H },
    { type: "solid", x: 2200, y: FLOOR_Y, width: 300, height: FLOOR_H },
    { type: "solid", x: 2750, y: FLOOR_Y, width: 250, height: FLOOR_H },
    { type: "solid", x: 3250, y: FLOOR_Y, width: 300, height: FLOOR_H },
    { type: "solid", x: 3800, y: FLOOR_Y, width: 250, height: FLOOR_H },
    { type: "solid", x: 4300, y: FLOOR_Y, width: 250, height: FLOOR_H },
    { type: "solid", x: 4550, y: FLOOR_Y, width: 250, height: FLOOR_H },

    // Dense platform mix — all types
    // Section 1: Opening gauntlet
    { type: "solid", x: 150, y: FLOOR_Y - 160, width: 120, height: 16 },
    { type: "one-way", x: 350, y: FLOOR_Y - 280, width: 100, height: 12 },
    { type: "solid", x: 500, y: FLOOR_Y - 180, width: 100, height: 16 },
    { type: "one-way", x: 420, y: FLOOR_Y - 400, width: 100, height: 12 },

    // Section 2: Swing chain
    { type: "swing", x: 700, y: FLOOR_Y - 200, width: 80, height: 12, swingRange: 100, swingSpeed: 2.0 },
    { type: "swing", x: 950, y: FLOOR_Y - 300, width: 80, height: 12, swingRange: 110, swingSpeed: 2.2 },
    { type: "solid", x: 1050, y: FLOOR_Y - 180, width: 100, height: 16 },

    // Section 3: Vertical climb
    { type: "one-way", x: 1200, y: FLOOR_Y - 140, width: 100, height: 12 },
    { type: "solid", x: 1300, y: FLOOR_Y - 260, width: 100, height: 16 },
    { type: "one-way", x: 1400, y: FLOOR_Y - 380, width: 100, height: 12 },
    { type: "solid", x: 1500, y: FLOOR_Y - 200, width: 100, height: 16 },

    // Relief zone 1 (~1/3 mark)
    { type: "solid", x: 1500, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Section 4: Bouncy + precision
    { type: "bouncy", x: 1650, y: FLOOR_Y - 16, width: 60, height: 16 },
    { type: "one-way", x: 1750, y: FLOOR_Y - 320, width: 80, height: 12 },
    { type: "solid", x: 1900, y: FLOOR_Y - 200, width: 100, height: 16 },
    { type: "bouncy", x: 2050, y: FLOOR_Y - 16, width: 60, height: 16 },

    // Section 5: Dash corridor
    { type: "solid", x: 2250, y: FLOOR_Y - 140, width: 80, height: 16 },
    { type: "solid", x: 2400, y: FLOOR_Y - 220, width: 80, height: 16 },
    { type: "solid", x: 2550, y: FLOOR_Y - 160, width: 80, height: 16 },
    { type: "one-way", x: 2350, y: FLOOR_Y - 360, width: 80, height: 12 },

    // Relief zone 2 (~2/3 mark)
    { type: "solid", x: 3050, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Section 6: Triple swing
    { type: "swing", x: 2850, y: FLOOR_Y - 200, width: 70, height: 12, swingRange: 90, swingSpeed: 2.3 },
    { type: "swing", x: 3050, y: FLOOR_Y - 300, width: 70, height: 12, swingRange: 100, swingSpeed: 2.0 },
    { type: "swing", x: 3250, y: FLOOR_Y - 200, width: 70, height: 12, swingRange: 90, swingSpeed: 2.5 },

    // Section 7: Final gauntlet
    { type: "solid", x: 3350, y: FLOOR_Y - 160, width: 100, height: 16 },
    { type: "one-way", x: 3500, y: FLOOR_Y - 280, width: 80, height: 12 },
    { type: "solid", x: 3650, y: FLOOR_Y - 180, width: 100, height: 16 },
    { type: "one-way", x: 3800, y: FLOOR_Y - 320, width: 80, height: 12 },
    { type: "solid", x: 3950, y: FLOOR_Y - 200, width: 100, height: 16 },

    // Section 8: Last push
    { type: "bouncy", x: 4100, y: FLOOR_Y - 16, width: 60, height: 16 },
    { type: "one-way", x: 4200, y: FLOOR_Y - 280, width: 80, height: 12 },
    { type: "solid", x: 4350, y: FLOOR_Y - 160, width: 100, height: 16 },
    { type: "one-way", x: 4500, y: FLOOR_Y - 240, width: 100, height: 12 },
  ],
  enemies: [
    // Dense enemy placement — hardest configurations
    // Butter Pats
    { type: "butterPat", x: 200, y: FLOOR_Y, patrolRange: 60 },
    { type: "butterPat", x: 700, y: FLOOR_Y, patrolRange: 60 },
    { type: "butterPat", x: 1250, y: FLOOR_Y, patrolRange: 60 },
    { type: "butterPat", x: 2300, y: FLOOR_Y, patrolRange: 60 },
    { type: "butterPat", x: 3350, y: FLOOR_Y, patrolRange: 60 },

    // Gluten Blobs on platforms
    { type: "glutenBlob", x: 550, y: FLOOR_Y - 180 },
    { type: "glutenBlob", x: 1350, y: FLOOR_Y - 260 },
    { type: "glutenBlob", x: 1950, y: FLOOR_Y - 200 },
    { type: "glutenBlob", x: 2600, y: FLOOR_Y - 160 },
    { type: "glutenBlob", x: 3700, y: FLOOR_Y - 180 },

    // Syrup Drippers everywhere
    { type: "syrupDripper", x: 400, y: 60 },
    { type: "syrupDripper", x: 900, y: 60 },
    { type: "syrupDripper", x: 1400, y: 60 },
    { type: "syrupDripper", x: 1900, y: 60 },
    { type: "syrupDripper", x: 2500, y: 60 },
    { type: "syrupDripper", x: 3100, y: 60 },
    { type: "syrupDripper", x: 3700, y: 60 },
    { type: "syrupDripper", x: 4200, y: 60 },

    // Multiple Milk Carton Guards — the real challenge
    { type: "milkCarton", x: 1800, y: FLOOR_Y, patrolRange: 60 },
    { type: "milkCarton", x: 2500, y: FLOOR_Y, patrolRange: 60 },
    { type: "milkCarton", x: 2850, y: FLOOR_Y, patrolRange: 60 },
    { type: "milkCarton", x: 3500, y: FLOOR_Y, patrolRange: 60 },
    { type: "milkCarton", x: 4400, y: FLOOR_Y, patrolRange: 60 },
  ],
  pickups: [
    // 2 ninja powerups
    { type: "ninjaPowerup", x: 400, y: FLOOR_Y - 310 },
    { type: "ninjaPowerup", x: 2400, y: FLOOR_Y - 390 },

    // Sais pickup
    { type: "sais", x: 1950, y: FLOOR_Y - 230 },

    // Section 1 sequins
    { type: "sequin", x: 180, y: FLOOR_Y - 20 },
    { type: "sequin", x: 250, y: FLOOR_Y - 20 },
    { type: "sequin", x: 200, y: FLOOR_Y - 185 },
    { type: "sequin", x: 400, y: FLOOR_Y - 305 },
    { type: "sequin", x: 470, y: FLOOR_Y - 425 },

    // Section 2 sequins
    { type: "sequin", x: 660, y: FLOOR_Y - 20 },
    { type: "sequin", x: 750, y: FLOOR_Y - 225 },
    { type: "sequin", x: 1000, y: FLOOR_Y - 325 },
    { type: "sequin", x: 1100, y: FLOOR_Y - 205 },

    // Section 3 sequins
    { type: "sequin", x: 1210, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1250, y: FLOOR_Y - 165 },
    { type: "sequin", x: 1350, y: FLOOR_Y - 285 },
    { type: "sequin", x: 1450, y: FLOOR_Y - 405 },

    // Relief zone 1 sequins
    { type: "sequin", x: 1560, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1630, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1700, y: FLOOR_Y - 20 },

    // Section 4 sequins
    { type: "sequin", x: 1760, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1800, y: FLOOR_Y - 345 },

    // Section 5 sequins
    { type: "sequin", x: 2260, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2300, y: FLOOR_Y - 165 },
    { type: "sequin", x: 2450, y: FLOOR_Y - 245 },
    { type: "sequin", x: 2400, y: FLOOR_Y - 385 },

    // Section 6 sequins
    { type: "sequin", x: 2810, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2900, y: FLOOR_Y - 225 },
    { type: "sequin", x: 3100, y: FLOOR_Y - 325 },
    { type: "sequin", x: 3300, y: FLOOR_Y - 225 },

    // Relief zone 2 sequins
    { type: "sequin", x: 3110, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3180, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3250, y: FLOOR_Y - 20 },

    // Section 7 sequins
    { type: "sequin", x: 3310, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3400, y: FLOOR_Y - 185 },
    { type: "sequin", x: 3550, y: FLOOR_Y - 305 },
    { type: "sequin", x: 3700, y: FLOOR_Y - 205 },
    { type: "sequin", x: 3850, y: FLOOR_Y - 345 },

    // Section 8 sequins
    { type: "sequin", x: 4000, y: FLOOR_Y - 225 },
    { type: "sequin", x: 4250, y: FLOOR_Y - 305 },
    { type: "sequin", x: 4400, y: FLOOR_Y - 185 },
    { type: "sequin", x: 4550, y: FLOOR_Y - 265 },

    // Ribbons (hard-to-reach collectibles)
    { type: "ribbon", x: 470, y: FLOOR_Y - 490 },
    { type: "ribbon", x: 1500, y: FLOOR_Y - 470 },
    { type: "ribbon", x: 3850, y: FLOOR_Y - 460 },
  ],
  destructibles: [
    { x: 580, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1130, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1680, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 2180, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 2730, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 3230, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 3780, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 4280, y: FLOOR_Y - 48, width: 48, height: 48 },
  ],
}

export default level6
