import { SCREEN } from "../config"
import type { LevelData } from "./level1"

const FLOOR_Y = SCREEN.HEIGHT - 48
const FLOOR_H = 48

const level3: LevelData = {
  name: "The Training Grounds",
  bgTint: [150, 220, 150],
  width: 3800,
  playerSpawn: { x: 160, y: FLOOR_Y - 10 },
  platforms: [
    // Floor segments
    { type: "solid", x: 0, y: FLOOR_Y, width: 700, height: FLOOR_H },
    { type: "solid", x: 860, y: FLOOR_Y, width: 500, height: FLOOR_H },
    { type: "solid", x: 1560, y: FLOOR_Y, width: 400, height: FLOOR_H },
    { type: "solid", x: 2200, y: FLOOR_Y, width: 500, height: FLOOR_H },
    { type: "solid", x: 2900, y: FLOOR_Y, width: 400, height: FLOOR_H },
    { type: "solid", x: 3480, y: FLOOR_Y, width: 320, height: FLOOR_H },

    // Bamboo scaffolding — layered one-way platforms
    { type: "one-way", x: 250, y: FLOOR_Y - 130, width: 160, height: 12 },
    { type: "one-way", x: 450, y: FLOOR_Y - 240, width: 140, height: 12 },
    { type: "one-way", x: 300, y: FLOOR_Y - 350, width: 160, height: 12 },

    // Solid training platforms
    { type: "solid", x: 650, y: FLOOR_Y - 180, width: 140, height: 16 },
    { type: "solid", x: 900, y: FLOOR_Y - 260, width: 160, height: 16 },
    { type: "solid", x: 1150, y: FLOOR_Y - 160, width: 180, height: 16 },

    // Relief zone 1 (~1/3 mark)
    { type: "solid", x: 1180, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Dash corridor — tight platforms requiring cartwheel
    { type: "solid", x: 1400, y: FLOOR_Y - 120, width: 120, height: 16 },
    { type: "solid", x: 1600, y: FLOOR_Y - 200, width: 140, height: 16 },
    { type: "solid", x: 1800, y: FLOOR_Y - 140, width: 120, height: 16 },

    // Swing platforms
    { type: "swing", x: 1050, y: FLOOR_Y - 380, width: 90, height: 12, swingRange: 100, swingSpeed: 1.5 },
    { type: "swing", x: 2700, y: FLOOR_Y - 250, width: 100, height: 12, swingRange: 120, swingSpeed: 1.7 },

    // Upper scaffolding
    { type: "one-way", x: 2000, y: FLOOR_Y - 280, width: 140, height: 12 },
    { type: "one-way", x: 2250, y: FLOOR_Y - 200, width: 160, height: 12 },
    { type: "solid", x: 2450, y: FLOOR_Y - 300, width: 140, height: 16 },

    // Relief zone 2 (~2/3 mark)
    { type: "solid", x: 2500, y: FLOOR_Y, width: 300, height: FLOOR_H },

    // Bouncy
    { type: "bouncy", x: 2100, y: FLOOR_Y - 16, width: 80, height: 16 },

    // End gauntlet
    { type: "solid", x: 3000, y: FLOOR_Y - 160, width: 140, height: 16 },
    { type: "one-way", x: 3200, y: FLOOR_Y - 260, width: 120, height: 12 },
    { type: "solid", x: 3400, y: FLOOR_Y - 180, width: 160, height: 16 },
    { type: "one-way", x: 3550, y: FLOOR_Y - 300, width: 120, height: 12 },
  ],
  enemies: [
    // Butter Pats
    { type: "butterPat", x: 400, y: FLOOR_Y, patrolRange: 100 },
    { type: "butterPat", x: 1000, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 2400, y: FLOOR_Y, patrolRange: 100 },

    // Gluten Blobs on platforms
    { type: "glutenBlob", x: 700, y: FLOOR_Y - 180 },
    { type: "glutenBlob", x: 1200, y: FLOOR_Y - 160 },
    { type: "glutenBlob", x: 2500, y: FLOOR_Y - 300 },

    // More butter pats in end section
    { type: "butterPat", x: 3050, y: FLOOR_Y, patrolRange: 80 },
    { type: "butterPat", x: 3550, y: FLOOR_Y, patrolRange: 60 },
  ],
  pickups: [
    // Ninja powerups — one early, one mid-level
    { type: "ninjaPowerup", x: 500, y: FLOOR_Y - 270 },
    { type: "ninjaPowerup", x: 1850, y: FLOOR_Y - 170 },

    // Katana pickup — new weapon
    { type: "katana", x: 1200, y: FLOOR_Y - 190 },

    // Sequins along first floor
    { type: "sequin", x: 220, y: FLOOR_Y - 20 },
    { type: "sequin", x: 290, y: FLOOR_Y - 20 },
    { type: "sequin", x: 360, y: FLOOR_Y - 20 },
    { type: "sequin", x: 500, y: FLOOR_Y - 20 },
    { type: "sequin", x: 570, y: FLOOR_Y - 20 },

    // Sequins on scaffolding
    { type: "sequin", x: 300, y: FLOOR_Y - 155 },
    { type: "sequin", x: 490, y: FLOOR_Y - 265 },
    { type: "sequin", x: 350, y: FLOOR_Y - 375 },

    // Sequins on solid platforms
    { type: "sequin", x: 700, y: FLOOR_Y - 205 },
    { type: "sequin", x: 950, y: FLOOR_Y - 285 },

    // Sequins along floor 2
    { type: "sequin", x: 920, y: FLOOR_Y - 20 },
    { type: "sequin", x: 990, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1060, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1200, y: FLOOR_Y - 20 },

    // Relief zone 1 sequins
    { type: "sequin", x: 1240, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1310, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1380, y: FLOOR_Y - 20 },

    // Dash corridor sequins
    { type: "sequin", x: 1440, y: FLOOR_Y - 145 },
    { type: "sequin", x: 1650, y: FLOOR_Y - 225 },
    { type: "sequin", x: 1840, y: FLOOR_Y - 165 },

    // Sequins floor 3
    { type: "sequin", x: 1620, y: FLOOR_Y - 20 },
    { type: "sequin", x: 1700, y: FLOOR_Y - 20 },

    // Upper section
    { type: "sequin", x: 2050, y: FLOOR_Y - 305 },
    { type: "sequin", x: 2300, y: FLOOR_Y - 225 },

    // Relief zone 2 sequins
    { type: "sequin", x: 2560, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2630, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2700, y: FLOOR_Y - 20 },

    // Sequins floor 4
    { type: "sequin", x: 2280, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2400, y: FLOOR_Y - 20 },
    { type: "sequin", x: 2520, y: FLOOR_Y - 20 },

    // End section
    { type: "sequin", x: 2960, y: FLOOR_Y - 20 },
    { type: "sequin", x: 3050, y: FLOOR_Y - 185 },
    { type: "sequin", x: 3250, y: FLOOR_Y - 285 },
    { type: "sequin", x: 3450, y: FLOOR_Y - 205 },
    { type: "sequin", x: 3600, y: FLOOR_Y - 325 },

    // Ribbons (hard-to-reach collectibles)
    { type: "ribbon", x: 360, y: FLOOR_Y - 430 },
    { type: "ribbon", x: 1100, y: FLOOR_Y - 430 },
    { type: "ribbon", x: 3600, y: FLOOR_Y - 420 },
  ],
  destructibles: [
    // Barriers requiring katana to break through
    { x: 840, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1540, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 1540, y: FLOOR_Y - 96, width: 48, height: 48 },
    { x: 2880, y: FLOOR_Y - 48, width: 48, height: 48 },
    { x: 3460, y: FLOOR_Y - 48, width: 48, height: 48 },
  ],
}

export default level3
