import { SCREEN } from "../config"
import type { LevelData } from "./level1"

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const level4: LevelData = {
  name: "The Sticky Kitchen",
  width: 4000,
  playerSpawn: { x: 150, y: FLOOR_Y - 10 },
  platforms: [
    // Floor segments — more gaps, trickier layout
    { type: "solid", x: 0, y: FLOOR_Y, width: 500, height: FLOOR_H },
    { type: "solid", x: 700, y: FLOOR_Y, width: 400, height: FLOOR_H },
    { type: "solid", x: 1300, y: FLOOR_Y, width: 350, height: FLOOR_H },
    { type: "solid", x: 1900, y: FLOOR_Y, width: 400, height: FLOOR_H },
    { type: "solid", x: 2550, y: FLOOR_Y, width: 350, height: FLOOR_H },
    { type: "solid", x: 3150, y: FLOOR_Y, width: 400, height: FLOOR_H },
    { type: "solid", x: 3700, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Kitchen counter platforms (solid)
    { type: "solid", x: 200, y: FLOOR_Y - 160, width: 200, height: 16 },
    { type: "solid", x: 550, y: FLOOR_Y - 280, width: 160, height: 16 },
    { type: "solid", x: 800, y: FLOOR_Y - 180, width: 180, height: 16 },
    { type: "solid", x: 1100, y: FLOOR_Y - 240, width: 160, height: 16 },

    // One-way shelves
    { type: "one-way", x: 1400, y: FLOOR_Y - 140, width: 140, height: 12 },
    { type: "one-way", x: 1600, y: FLOOR_Y - 260, width: 120, height: 12 },
    { type: "one-way", x: 1800, y: FLOOR_Y - 180, width: 140, height: 12 },

    // Combo section — dash + float required
    { type: "solid", x: 2000, y: FLOOR_Y - 200, width: 120, height: 16 },
    { type: "one-way", x: 2200, y: FLOOR_Y - 320, width: 100, height: 12 },
    { type: "solid", x: 2400, y: FLOOR_Y - 240, width: 120, height: 16 },

    // Swing platforms
    { type: "swing", x: 1050, y: FLOOR_Y - 380, width: 90, height: 12, swingRange: 100, swingSpeed: 1.6 },
    { type: "swing", x: 2700, y: FLOOR_Y - 200, width: 90, height: 12, swingRange: 130, swingSpeed: 2.0 },
    { type: "swing", x: 3050, y: FLOOR_Y - 300, width: 80, height: 12, swingRange: 100, swingSpeed: 1.8 },

    // Bouncy platforms
    { type: "bouncy", x: 1700, y: FLOOR_Y - 16, width: 80, height: 16 },
    { type: "bouncy", x: 2850, y: FLOOR_Y - 16, width: 80, height: 16 },

    // End section
    { type: "solid", x: 3250, y: FLOOR_Y - 160, width: 140, height: 16 },
    { type: "one-way", x: 3450, y: FLOOR_Y - 260, width: 120, height: 12 },
    { type: "solid", x: 3600, y: FLOOR_Y - 180, width: 140, height: 16 },
    { type: "one-way", x: 3750, y: FLOOR_Y - 300, width: 120, height: 12 },
  ],
  enemies: [
    // Butter Pats
    { type: "butterPat", x: 300, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 850, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 2050, y: FLOOR_Y, patrolRange: 80 },

    // Gluten Blobs
    { type: "glutenBlob", x: 260, y: FLOOR_Y - 160 },
    { type: "glutenBlob", x: 850, y: FLOOR_Y - 180 },
    { type: "glutenBlob", x: 2050, y: FLOOR_Y - 200 },

    // Syrup Drippers — more of them in the kitchen
    { type: "syrupDripper", x: 600, y: 60 },
    { type: "syrupDripper", x: 1200, y: 60 },
    { type: "syrupDripper", x: 1800, y: 60 },
    { type: "syrupDripper", x: 2500, y: 60 },
    { type: "syrupDripper", x: 3300, y: 60 },

    // Milk Carton Guards — new enemy
    { type: "milkCarton", x: 1500, y: FLOOR_Y, patrolRange: 80 },
    { type: "milkCarton", x: 2700, y: FLOOR_Y, patrolRange: 100 },
    { type: "milkCarton", x: 3400, y: FLOOR_Y, patrolRange: 80 },
  ],
  pickups: [
    // Ninja powerups — one early, one mid-level
    { type: "ninjaPowerup", x: 600, y: FLOOR_Y - 310 },
    { type: "ninjaPowerup", x: 2450, y: FLOOR_Y - 270 },

    // Sais pickup — new weapon
    { type: "sais", x: 2050, y: FLOOR_Y - 230 },

    // Sequins floor 1
    { type: "sequin", x: 200, y: FLOOR_Y - 20 },
    { type: "sequin", x: 270, y: FLOOR_Y - 20 },
    { type: "sequin", x: 340, y: FLOOR_Y - 20 },
    { type: "sequin", x: 410, y: FLOOR_Y - 20 },

    // Sequins on counter platforms
    { type: "sequin", x: 260, y: FLOOR_Y - 185 },
    { type: "sequin", x: 340, y: FLOOR_Y - 185 },
    { type: "sequin", x: 600, y: FLOOR_Y - 305 },
    { type: "sequin", x: 860, y: FLOOR_Y - 205 },

    // Sequins floor 2
    { type: "sequin", x: 760, y: FLOOR_Y - 20 },
    { type: "sequin", x: 830, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1000, y: FLOOR_Y - 20 },

    // Sequins on shelves
    { type: "sequin", x: 1150, y: FLOOR_Y - 265 },
    { type: "sequin", x: 1440, y: FLOOR_Y - 165 },
    { type: "sequin", x: 1650, y: FLOOR_Y - 285 },

    // Sequins floor 3
    { type: "sequin", x: 1360, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1430, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1550, y: FLOOR_Y - 20 },

    // Combo section sequins
    { type: "sequin", x: 2040, y: FLOOR_Y - 225 },
    { type: "sequin", x: 2230, y: FLOOR_Y - 345 },
    { type: "sequin", x: 2440, y: FLOOR_Y - 265 },

    // Sequins floor 4-5
    { type: "sequin", x: 1960, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2100, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2620, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2750, y: FLOOR_Y - 20 },

    // Swing path sequins
    { type: "sequin", x: 2750, y: FLOOR_Y - 225 },
    { type: "sequin", x: 3100, y: FLOOR_Y - 325 },

    // End section
    { type: "sequin", x: 3220, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3300, y: FLOOR_Y - 185 },
    { type: "sequin", x: 3500, y: FLOOR_Y - 285 },
    { type: "sequin", x: 3650, y: FLOOR_Y - 205 },
    { type: "sequin", x: 3800, y: FLOOR_Y - 325 },

    // Ribbons (hard-to-reach collectibles)
    { type: "ribbon", x: 600, y: FLOOR_Y - 420 },
    { type: "ribbon", x: 1100, y: FLOOR_Y - 430 },
    { type: "ribbon", x: 3800, y: FLOOR_Y - 430 },
  ],
  destructibles: [
    { x: 680, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1280, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1880, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 2530, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 3130, y: FLOOR_Y - 48, width: 48, height: 48 },
  ],
}

export default level4
