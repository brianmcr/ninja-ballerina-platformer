import loadLevel from "../levels/loader"
import level1 from "../levels/level1"
import level2 from "../levels/level2"
import level3 from "../levels/level3"
import level4 from "../levels/level4"
import level5 from "../levels/level5"
import level6 from "../levels/level6"
import bossArena from "../levels/bossArena"
import type { LevelData } from "../levels/level1"
import type { PlayerHealth } from "../components/health"
import { runBossFight } from "../entities/soggyWaffle"
import { SCREEN } from "../config"
import { fadeIn, fadeOut } from "../components/transition"

const LEVEL_MAP: Record<string, LevelData> = {
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  boss: bossArena,
}

const LEVEL_ORDER = ["level1", "level2", "level3", "level4", "level5", "level6", "boss"]

function getNextLevel(current: string): string | null {
  const idx = LEVEL_ORDER.indexOf(current)
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null
  return LEVEL_ORDER[idx + 1]
}

export default function game(levelName?: string) {
  const levelId = levelName ?? "level1"
  fadeIn(0.3)

  const isBoss = levelId === "boss"
  const levelData: LevelData = LEVEL_MAP[levelId] ?? level1
  const { player } = loadLevel(levelData)

  let levelTime = 0
  let showDebug = false

  // --- HUD background panels ---
  const hudPanelLeft = add([
    rect(160, 90),
    pos(4, 4),
    fixed(),
    color(0, 0, 0),
    opacity(0.3),
    z(99),
  ])

  const hudPanelRight = add([
    rect(100, 32),
    pos(width() - 4, 4),
    anchor("topright"),
    fixed(),
    color(0, 0, 0),
    opacity(0.3),
    z(99),
  ])

  // --- HUD: lives as red diamonds ---
  const MAX_HEARTS = 5
  const heartIcons: any[] = []
  for (let i = 0; i < MAX_HEARTS; i++) {
    const h = add([
      rect(12, 12),
      pos(18 + i * 22, 18),
      anchor("center"),
      rotate(45),
      color(220, 40, 60),
      fixed(),
      scale(1),
      opacity(1),
      z(101),
    ])
    heartIcons.push(h)
  }

  let prevLives = -1

  // --- HUD: sequin counter (gold diamond + text) ---
  const sequinIcon = add([
    rect(8, 8),
    pos(width() - 80, 20),
    anchor("center"),
    rotate(45),
    color(255, 215, 0),
    fixed(),
    scale(1),
    z(101),
  ])

  const sequinLabel = add([
    text("0", { size: 18, font: "Bangers" }),
    pos(width() - 66, 12),
    fixed(),
    color(255, 255, 255),
    z(101),
  ])

  let prevSequins = -1

  // --- HUD: ninja indicator ---
  const ninjaIcon = add([
    rect(10, 10),
    pos(18, 40),
    anchor("center"),
    color(255, 165, 0),
    fixed(),
    opacity(0),
    z(101),
  ])

  const ninjaLabel = add([
    text("", { size: 16, font: "Bangers" }),
    pos(32, 34),
    fixed(),
    color(255, 200, 80),
    z(101),
  ])

  // --- HUD: ribbons ---
  const ribbonIcon = add([
    rect(10, 10),
    pos(18, 58),
    anchor("center"),
    rotate(45),
    color(200, 100, 200),
    fixed(),
    opacity(0),
    z(101),
  ])

  const ribbonLabel = add([
    text("", { size: 16, font: "Bangers" }),
    pos(32, 52),
    fixed(),
    color(220, 160, 220),
    z(101),
  ])

  // --- HUD: weapon ---
  const weaponIcon = add([
    rect(10, 10),
    pos(18, 76),
    anchor("center"),
    color(180, 200, 255),
    fixed(),
    opacity(0),
    z(101),
  ])

  const weaponLabel = add([
    text("", { size: 14, font: "Bangers" }),
    pos(32, 70),
    fixed(),
    color(220, 230, 255),
    z(101),
  ])

  // Debug state label (toggled with F1)
  const stateLabel = add([
    text("", { size: 14, font: "Bangers" }),
    pos(12, 108),
    fixed(),
    color(200, 200, 200),
    opacity(0),
    z(100),
  ])

  // Controls hint (smaller, fades out)
  const controlsHint = add([
    text("Arrows/WASD: Move | Space: Jump | Z: Spin | X: Dash | C: Whip | V: Weapon", { size: 12, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT - 16),
    anchor("center"),
    fixed(),
    color(180, 180, 180),
    opacity(0.8),
    z(100),
  ])

  // Level intro overlay
  const introOverlay = add([
    rect(SCREEN.WIDTH, SCREEN.HEIGHT),
    pos(0, 0),
    fixed(),
    color(0, 0, 0),
    opacity(0.6),
    z(100),
  ])

  const levelIdx = LEVEL_ORDER.indexOf(levelId)
  const levelNumStr = levelIdx >= 0 ? `Level ${levelIdx + 1}` : levelId
  const levelBannerNum = add([
    text(levelNumStr, { size: 64, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 30),
    anchor("center"),
    fixed(),
    color(255, 255, 255),
    opacity(1),
    z(101),
  ])

  const levelBanner = add([
    text(levelData.name, { size: 28, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 30),
    anchor("center"),
    fixed(),
    color(200, 200, 255),
    opacity(1),
    z(101),
  ])

  const LEVEL_HINTS: Record<string, string> = {
    level1: "JUMP on enemies or Z/X/C to attack. TOUCHING them hurts you!",
    level2: "Hold SPACE to float! Time your swings!",
    level3: "X to dash through barriers!",
    level4: "Watch for syrup floors! V for weapons!",
    level5: "Use everything you've learned!",
    level6: "The final test...",
    boss: "Defeat Soggy Waffle!",
  }

  const hintMsg = LEVEL_HINTS[levelId] ?? ""
  const hintLabel = add([
    text(hintMsg, { size: 18, font: "Bangers" }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 + 70),
    anchor("center"),
    fixed(),
    color(200, 200, 255),
    opacity(1),
    z(101),
  ])

  let bannerTimer = 0
  onUpdate(() => {
    bannerTimer += dt()
    // Hold for 1s, then fade out over 1.5s
    if (bannerTimer > 1) {
      const fadeRate = dt() / 1.5
      introOverlay.opacity = Math.max(0, introOverlay.opacity - fadeRate * 0.6)
      levelBannerNum.opacity = Math.max(0, levelBannerNum.opacity - fadeRate)
      levelBanner.opacity = Math.max(0, levelBanner.opacity - fadeRate)
      hintLabel.opacity = Math.max(0, hintLabel.opacity - fadeRate)
    }
    // Fade controls hint after 5s
    if (bannerTimer > 15) {
      controlsHint.opacity = Math.max(0, controlsHint.opacity - dt())
    }
  })

  // Goal direction arrow
  if (!isBoss) {
    add([
      text("→", { size: 24, font: "Bangers" }),
      pos(width() - 40, height() / 2),
      anchor("center"),
      color(255, 215, 0),
      opacity(0.5),
      fixed(),
      z(90),
    ])
  }

  // F1 toggles debug
  onKeyPress("f1", () => {
    showDebug = !showDebug
    stateLabel.opacity = showDebug ? 1 : 0
  })

  // Track time
  onUpdate(() => {
    levelTime += dt()
  })

  player.onUpdate(() => {
    const h = player.health as PlayerHealth

    // Update heart icons visibility + damage pulse
    if (h.lives !== prevLives) {
      for (let i = 0; i < MAX_HEARTS; i++) {
        heartIcons[i].opacity = i < h.lives ? 1 : 0.15
      }
      if (prevLives > 0 && h.lives < prevLives) {
        // Pulse remaining hearts on damage
        for (let i = 0; i < h.lives; i++) {
          heartIcons[i].scaleTo(1.4)
          const icon = heartIcons[i]
          let t = 0
          const ev = onUpdate(() => {
            t += dt()
            const s = 1 + 0.4 * Math.max(0, 1 - t * 5)
            icon.scaleTo(s)
            if (t > 0.2) ev.cancel()
          })
        }
      }
      prevLives = h.lives
    }

    // Update sequin counter + pulse on change
    if (h.sequins !== prevSequins) {
      sequinLabel.text = `${h.sequins}`
      if (prevSequins >= 0 && h.sequins > prevSequins) {
        sequinIcon.scaleTo(1.5)
        let t = 0
        const ev = onUpdate(() => {
          t += dt()
          const s = 1 + 0.5 * Math.max(0, 1 - t * 5)
          sequinIcon.scaleTo(s)
          if (t > 0.2) ev.cancel()
        })
      }
      prevSequins = h.sequins
    }

    // Ninja indicator
    if (h.isNinja) {
      ninjaIcon.opacity = 1
      ninjaLabel.text = "NINJA"
    } else {
      ninjaIcon.opacity = 0
      ninjaLabel.text = ""
    }

    // Ribbons
    if (h.ribbons > 0) {
      ribbonIcon.opacity = 1
      ribbonLabel.text = `${h.ribbons}/3`
    } else {
      ribbonIcon.opacity = 0
      ribbonLabel.text = ""
    }

    // Weapon
    if (player.currentWeapon !== "none") {
      weaponIcon.opacity = 1
      const wColors: Record<string, [number, number, number]> = {
        shuriken: [255, 215, 0],
        katana: [180, 200, 255],
        sais: [255, 80, 80],
      }
      const wc = wColors[player.currentWeapon] ?? [180, 200, 255]
      weaponIcon.color = rgb(wc[0], wc[1], wc[2])
      weaponLabel.text = player.currentWeapon
    } else {
      weaponIcon.opacity = 0
      weaponLabel.text = ""
    }

    if (showDebug) {
      stateLabel.text = `State: ${player.state}`
    }
  })

  // Game over check
  player.onUpdate(() => {
    const h = player.health as PlayerHealth
    if (h.lives <= 0) {
      fadeOut(0.3, () => go("gameOver", { levelId, sequins: h.sequins } as any))
    }
  })

  if (isBoss) {
    runBossFight(player, levelData.playerSpawn.x, levelData.playerSpawn.y)
  } else {
    // Transition to level complete when player touches goal marker
    let triggered = false
    player.onCollide("goal", () => {
      if (!triggered) {
        triggered = true
        const h = player.health as PlayerHealth
        const next = getNextLevel(levelId)
        fadeOut(0.3, () => go("levelComplete", {
          levelId,
          sequins: h.sequins,
          ribbons: h.ribbons,
          lives: h.lives,
          time: levelTime,
          nextLevel: next,
        } as any))
      }
    })
  }
}
