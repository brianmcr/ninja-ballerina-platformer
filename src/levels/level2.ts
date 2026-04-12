import { SCREEN } from "../config"
import type { LevelData } from "./level1"

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const level2: LevelData = {
  name: "Silk & Shadows",
  bgTint: [150, 150, 255],
  width: 3600,
  playerSpawn: { x: 180, y: FLOOR_Y - 10 },
  platforms: [
    // Floor segments — gaps require floating
    { type: "solid", x: 0, y: FLOOR_Y, width: 600, height: FLOOR_H },
    { type: "solid", x: 880, y: FLOOR_Y, width: 400, height: FLOOR_H },
    { type: "solid", x: 1600, y: FLOOR_Y, width: 500, height: FLOOR_H },
    { type: "solid", x: 2400, y: FLOOR_Y, width: 400, height: FLOOR_H },
    { type: "solid", x: 3100, y: FLOOR_Y, width: 500, height: FLOOR_H },

    // Vertical climbing — one-way ledges going up
    { type: "one-way", x: 300, y: FLOOR_Y - 140, width: 140, height: 12 },
    { type: "one-way", x: 200, y: FLOOR_Y - 260, width: 140, height: 12 },
    { type: "one-way", x: 400, y: FLOOR_Y - 370, width: 140, height: 12 },

    // Solid platforms at height
    { type: "solid", x: 650, y: FLOOR_Y - 300, width: 160, height: 16 },
    { type: "solid", x: 1050, y: FLOOR_Y - 240, width: 180, height: 16 },
    { type: "solid", x: 1350, y: FLOOR_Y - 180, width: 140, height: 16 },

    // Swing platforms — the key mechanic
    { type: "swing", x: 750, y: FLOOR_Y - 160, width: 100, height: 12, swingRange: 100, swingSpeed: 1.6 },
    { type: "swing", x: 1250, y: FLOOR_Y - 320, width: 100, height: 12, swingRange: 130, swingSpeed: 1.4 },
    { type: "swing", x: 1900, y: FLOOR_Y - 200, width: 90, height: 12, swingRange: 140, swingSpeed: 1.8 },
    { type: "swing", x: 2150, y: FLOOR_Y - 300, width: 90, height: 12, swingRange: 110, swingSpeed: 2.0 },

    // High platforms requiring swing + float
    { type: "solid", x: 1700, y: FLOOR_Y - 350, width: 140, height: 16 },
    { type: "one-way", x: 2000, y: FLOOR_Y - 400, width: 120, height: 12 },
    { type: "solid", x: 2300, y: FLOOR_Y - 200, width: 160, height: 16 },

    // Relief zone 1 (~1/3 mark)
    { type: "solid", x: 1100, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Relief zone 2 (~2/3 mark)
    { type: "solid", x: 2200, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Bouncy for fun
    { type: "bouncy", x: 2500, y: FLOOR_Y - 16, width: 80, height: 16 },

    // End section platforms
    { type: "one-way", x: 2800, y: FLOOR_Y - 140, width: 140, height: 12 },
    { type: "one-way", x: 2950, y: FLOOR_Y - 250, width: 120, height: 12 },
    { type: "solid", x: 3200, y: FLOOR_Y - 180, width: 160, height: 16 },
  ],
  enemies: [
    // Butter Pats on floors
    { type: "butterPat", x: 350, y: FLOOR_Y, patrolRange: 100 },
    { type: "butterPat", x: 1000, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 1700, y: FLOOR_Y, patrolRange: 100 },

    // Gluten Blobs — new enemy introduction
    { type: "glutenBlob", x: 700, y: FLOOR_Y - 300 },
    { type: "glutenBlob", x: 1100, y: FLOOR_Y - 240 },
    { type: "glutenBlob", x: 2350, y: FLOOR_Y - 200 },

    // More butter pats later
    { type: "butterPat", x: 2550, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 3250, y: FLOOR_Y, patrolRange: 100 },
  ],
  pickups: [
    // Ninja powerups — one early, one mid-level
    { type: "ninjaPowerup", x: 350, y: FLOOR_Y - 400 },
    { type: "ninjaPowerup", x: 1760, y: FLOOR_Y - 400 },

    // Sequins along first floor
    { type: "sequin", x: 240, y: FLOOR_Y - 20 },
    { type: "sequin", x: 310, y: FLOOR_Y - 20 },
    { type: "sequin", x: 380, y: FLOOR_Y - 20 },
    { type: "sequin", x: 450, y: FLOOR_Y - 20 },
    { type: "sequin", x: 520, y: FLOOR_Y - 20 },

    // Sequins on vertical climb
    { type: "sequin", x: 340, y: FLOOR_Y - 165 },
    { type: "sequin", x: 240, y: FLOOR_Y - 285 },
    { type: "sequin", x: 440, y: FLOOR_Y - 395 },

    // Sequins along swing path
    { type: "sequin", x: 800, y: FLOOR_Y - 185 },
    { type: "sequin", x: 710, y: FLOOR_Y - 325 },
    { type: "sequin", x: 1300, y: FLOOR_Y - 345 },

    // Sequins on floor 2
    { type: "sequin", x: 940, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1010, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1100, y: FLOOR_Y - 265 },
    { type: "sequin", x: 1170, y: FLOOR_Y - 265 },

    // Relief zone 1 sequins
    { type: "sequin", x: 1160, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1230, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1300, y: FLOOR_Y - 20 },

    // Relief zone 2 sequins
    { type: "sequin", x: 2260, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2330, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2400, y: FLOOR_Y - 20 },

    // Sequins along mid section
    { type: "sequin", x: 1660, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1730, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1800, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1760, y: FLOOR_Y - 375 },

    // Sequins on swings 3+4
    { type: "sequin", x: 1950, y: FLOOR_Y - 225 },
    { type: "sequin", x: 2200, y: FLOOR_Y - 325 },

    // Sequins floor 4
    { type: "sequin", x: 2460, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2530, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2600, y: FLOOR_Y - 20 },

    // End section
    { type: "sequin", x: 2850, y: FLOOR_Y - 165 },
    { type: "sequin", x: 3000, y: FLOOR_Y - 275 },
    { type: "sequin", x: 3260, y: FLOOR_Y - 205 },
    { type: "sequin", x: 3350, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3420, y: FLOOR_Y - 20 },

    // Ribbons (hard-to-reach collectibles)
    { type: "ribbon", x: 450, y: FLOOR_Y - 450 },
    { type: "ribbon", x: 2050, y: FLOOR_Y - 460 },
    { type: "ribbon", x: 3000, y: FLOOR_Y - 400 },
  ],
  destructibles: [
    { x: 1400, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 2700, y: FLOOR_Y - 48, width: 48, height: 48 },
  ],
}

export default level2
