import { SCREEN } from "../config"
import type { LevelData } from "./level1"

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const level5: LevelData = {
  name: "Above the Rafters",
  bgTint: [120, 120, 200],
  width: 4400,
  playerSpawn: { x: 140, y: FLOOR_Y - 10 },
  platforms: [
    // Sparse floor — long drops, tight corridors
    { type: "solid", x: 0, y: FLOOR_Y, width: 500, height: FLOOR_H },
    { type: "solid", x: 650, y: FLOOR_Y, width: 300, height: FLOOR_H },
    { type: "solid", x: 1200, y: FLOOR_Y, width: 350, height: FLOOR_H },
    { type: "solid", x: 1850, y: FLOOR_Y, width: 300, height: FLOOR_H },
    // Stepping stone for 350px gap (2150-2500)
    { type: "one-way", x: 2320, y: FLOOR_Y - 40, width: 100, height: 12 },
    { type: "solid", x: 2500, y: FLOOR_Y, width: 300, height: FLOOR_H },
    { type: "solid", x: 3100, y: FLOOR_Y, width: 300, height: FLOOR_H },
    // Stepping stone for 300px gap (3400-3700)
    { type: "one-way", x: 3530, y: FLOOR_Y - 40, width: 100, height: 12 },
    { type: "solid", x: 3700, y: FLOOR_Y, width: 300, height: FLOOR_H },
    { type: "solid", x: 4100, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Rafter platforms — lots of vertical play
    { type: "solid", x: 150, y: FLOOR_Y - 160, width: 140, height: 16 },
    { type: "one-way", x: 350, y: FLOOR_Y - 300, width: 120, height: 12 },
    { type: "solid", x: 500, y: FLOOR_Y - 420, width: 140, height: 16 },

    // Precision one-ways over gaps
    { type: "one-way", x: 480, y: FLOOR_Y - 120, width: 100, height: 12 },
    { type: "one-way", x: 580, y: FLOOR_Y - 200, width: 80, height: 12 },

    // Mid-height platforms
    { type: "solid", x: 800, y: FLOOR_Y - 240, width: 120, height: 16 },
    { type: "solid", x: 1000, y: FLOOR_Y - 160, width: 140, height: 16 },
    { type: "one-way", x: 1100, y: FLOOR_Y - 320, width: 100, height: 12 },

    // Relief zone 1 (~1/3 mark)
    { type: "solid", x: 1400, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Tight corridor section
    { type: "solid", x: 1350, y: FLOOR_Y - 140, width: 100, height: 16 },
    { type: "solid", x: 1500, y: FLOOR_Y - 240, width: 100, height: 16 },
    { type: "solid", x: 1650, y: FLOOR_Y - 160, width: 100, height: 16 },
    { type: "solid", x: 1800, y: FLOOR_Y - 280, width: 100, height: 16 },

    // Swing gauntlet
    { type: "swing", x: 1050, y: FLOOR_Y - 440, width: 80, height: 12, swingRange: 90, swingSpeed: 2.0 },
    { type: "swing", x: 2000, y: FLOOR_Y - 200, width: 80, height: 12, swingRange: 120, swingSpeed: 2.2 },
    { type: "swing", x: 2250, y: FLOOR_Y - 320, width: 80, height: 12, swingRange: 100, swingSpeed: 1.8 },
    { type: "swing", x: 3500, y: FLOOR_Y - 240, width: 80, height: 12, swingRange: 110, swingSpeed: 2.0 },

    // Upper rafter walkways
    { type: "solid", x: 2100, y: FLOOR_Y - 180, width: 120, height: 16 },
    { type: "one-way", x: 2350, y: FLOOR_Y - 260, width: 100, height: 12 },
    { type: "solid", x: 2550, y: FLOOR_Y - 180, width: 120, height: 16 },
    { type: "one-way", x: 2750, y: FLOOR_Y - 300, width: 100, height: 12 },

    // Bouncy platforms for vertical traversal
    { type: "bouncy", x: 950, y: FLOOR_Y - 16, width: 60, height: 16 },
    { type: "bouncy", x: 2850, y: FLOOR_Y - 16, width: 60, height: 16 },

    // Relief zone 2 (~2/3 mark)
    { type: "solid", x: 2900, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // High platforms
    { type: "solid", x: 2900, y: FLOOR_Y - 380, width: 120, height: 16 },
    { type: "one-way", x: 3050, y: FLOOR_Y - 160, width: 100, height: 12 },
    { type: "solid", x: 3200, y: FLOOR_Y - 260, width: 120, height: 16 },

    // Final approach
    { type: "one-way", x: 3400, y: FLOOR_Y - 140, width: 100, height: 12 },
    { type: "solid", x: 3600, y: FLOOR_Y - 200, width: 120, height: 16 },
    { type: "one-way", x: 3800, y: FLOOR_Y - 300, width: 100, height: 12 },
    { type: "solid", x: 3950, y: FLOOR_Y - 180, width: 120, height: 16 },
    { type: "one-way", x: 4150, y: FLOOR_Y - 260, width: 100, height: 12 },
  ],
  enemies: [
    // All enemy types, dense placement
    { type: "butterPat", x: 400, y: FLOOR_Y, patrolRange: 60 },
    { type: "butterPat", x: 700, y: FLOOR_Y, patrolRange: 60 },
    { type: "butterPat", x: 1450, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 2600, y: FLOOR_Y, patrolRange: 60 },

    { type: "glutenBlob", x: 1050, y: FLOOR_Y - 160 },
    { type: "glutenBlob", x: 1900, y: FLOOR_Y - 140 },
    { type: "glutenBlob", x: 2600, y: FLOOR_Y - 180 },
    { type: "glutenBlob", x: 3650, y: FLOOR_Y - 200 },

    { type: "syrupDripper", x: 500, y: 60 },
    { type: "syrupDripper", x: 1250, y: 60 },
    { type: "syrupDripper", x: 1700, y: 60 },
    { type: "syrupDripper", x: 2200, y: 60 },
    { type: "syrupDripper", x: 3000, y: 60 },
    { type: "syrupDripper", x: 4100, y: 60 },

    { type: "milkCarton", x: 1950, y: FLOOR_Y, patrolRange: 60 },
    { type: "milkCarton", x: 3200, y: FLOOR_Y, patrolRange: 80 },
    { type: "milkCarton", x: 3800, y: FLOOR_Y, patrolRange: 60 },
  ],
  pickups: [
    // Ninja powerup early
    { type: "ninjaPowerup", x: 400, y: FLOOR_Y - 330 },
    { type: "ninjaPowerup", x: 2800, y: FLOOR_Y - 280 },

    // Katana pickup
    { type: "katana", x: 1550, y: FLOOR_Y - 270 },

    // Sequins floor 1
    { type: "sequin", x: 200, y: FLOOR_Y - 20 },
    { type: "sequin", x: 270, y: FLOOR_Y - 20 },
    { type: "sequin", x: 340, y: FLOOR_Y - 20 },

    // Rafter sequins (fewer on platforms, more on floor)
    { type: "sequin", x: 400, y: FLOOR_Y - 325 },

    // Floor path sequins
    { type: "sequin", x: 680, y: FLOOR_Y - 20 },
    { type: "sequin", x: 750, y: FLOOR_Y - 20 },
    { type: "sequin", x: 820, y: FLOOR_Y - 20 },
    { type: "sequin", x: 890, y: FLOOR_Y - 20 },

    // Floor 2 sequins
    { type: "sequin", x: 1910, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1980, y: FLOOR_Y - 20 },
    { type: "sequin", x: 850, y: FLOOR_Y - 265 },
    { type: "sequin", x: 1050, y: FLOOR_Y - 185 },

    // Floor 3
    { type: "sequin", x: 1260, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1330, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1400, y: FLOOR_Y - 165 },

    // Relief zone 1 sequins
    { type: "sequin", x: 1460, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1530, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1600, y: FLOOR_Y - 20 },

    // Tight corridor
    { type: "sequin", x: 1550, y: FLOOR_Y - 265 },
    { type: "sequin", x: 1700, y: FLOOR_Y - 185 },
    { type: "sequin", x: 1850, y: FLOOR_Y - 305 },

    // Swing section
    { type: "sequin", x: 2050, y: FLOOR_Y - 225 },
    { type: "sequin", x: 2300, y: FLOOR_Y - 345 },
    { type: "sequin", x: 2150, y: FLOOR_Y - 205 },

    // Relief zone 2 sequins
    { type: "sequin", x: 2960, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3030, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3100, y: FLOOR_Y - 20 },

    // Floor 5-6
    { type: "sequin", x: 2560, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2630, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2800, y: FLOOR_Y - 325 },
    { type: "sequin", x: 2950, y: FLOOR_Y - 405 },

    // End gauntlet — mix of floor and platform
    { type: "sequin", x: 3160, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3230, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3300, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3450, y: FLOOR_Y - 165 },
    { type: "sequin", x: 3760, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3830, y: FLOOR_Y - 20 },
    { type: "sequin", x: 4160, y: FLOOR_Y - 20 },
    { type: "sequin", x: 4230, y: FLOOR_Y - 20 },

    // Ribbons (hard-to-reach collectibles)
    { type: "ribbon", x: 550, y: FLOOR_Y - 500 },
    { type: "ribbon", x: 1150, y: FLOOR_Y - 460 },
    { type: "ribbon", x: 2950, y: FLOOR_Y - 480 },
  ],
  destructibles: [
    { x: 630, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1180, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1830, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 2480, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 3080, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 3680, y: FLOOR_Y - 48, width: 48, height: 48 },
  ],
  checkpoints: [
    { x: 1300, y: FLOOR_Y - 10 },
    { x: 2900, y: FLOOR_Y - 10 },
  ],
  questionBlocks: [
    { x: 550, y: FLOOR_Y - 150, contains: "sequin" },
    { x: 1500, y: FLOOR_Y - 190, contains: "sequin" },
    { x: 2400, y: FLOOR_Y - 170, contains: "ninjaPowerup" },
    { x: 3300, y: FLOOR_Y - 210, contains: "sequin" },
    { x: 4000, y: FLOOR_Y - 150, contains: "sequin" },
  ],
}

export default level5
