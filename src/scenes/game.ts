import loadLevel from "../levels/loader"
import level1 from "../levels/level1"
import bossArena from "../levels/bossArena"
import type { LevelData } from "../levels/level1"
import type { PlayerHealth } from "../components/health"
import { runBossFight } from "../entities/soggyWaffle"
import { SCREEN } from "../config"

export default function game(levelName?: string) {
  const isBoss = levelName === "boss"
  const levelId = isBoss ? "boss" : "level1"
  const levelData: LevelData = isBoss ? bossArena : level1
  const { player } = loadLevel(levelData)

  let levelTime = 0
  let showDebug = false

  // HUD: lives as hearts
  const livesLabel = add([
    text("♥♥♥", { size: 24 }),
    pos(12, 12),
    fixed(),
    color(255, 80, 120),
    z(100),
  ])

  // HUD: sequins
  const sequinLabel = add([
    text("✦ 0", { size: 20 }),
    pos(width() - 12, 12),
    fixed(),
    anchor("topright"),
    color(255, 215, 0),
    z(100),
  ])

  // HUD: ninja indicator
  const ninjaLabel = add([
    text("", { size: 18 }),
    pos(12, 42),
    fixed(),
    color(255, 165, 0),
    z(100),
  ])

  // HUD: weapon
  const weaponLabel = add([
    text("", { size: 16 }),
    pos(12, 64),
    fixed(),
    color(180, 200, 255),
    z(100),
  ])

  // Debug state label (toggled with F1)
  const stateLabel = add([
    text("", { size: 14 }),
    pos(12, 86),
    fixed(),
    color(200, 200, 200),
    opacity(0),
    z(100),
  ])

  // Controls hint (smaller, fades out)
  const controlsHint = add([
    text("Arrows/WASD: Move | Space: Jump | Z: Spin | X: Dash | C: Whip | V: Weapon", { size: 12 }),
    pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT - 16),
    anchor("center"),
    fixed(),
    color(180, 180, 180),
    opacity(0.8),
    z(100),
  ])

  // Level name banner (fade out after 2s)
  const levelBanner = add([
    text(levelData.name, { size: 32 }),
    pos(SCREEN.WIDTH / 2, 60),
    anchor("center"),
    fixed(),
    color(255, 255, 255),
    opacity(1),
    z(100),
  ])

  let bannerTimer = 0
  onUpdate(() => {
    bannerTimer += dt()
    if (bannerTimer > 2) {
      levelBanner.opacity = Math.max(0, levelBanner.opacity - dt() * 2)
    }
    // Fade controls hint after 5s
    if (bannerTimer > 5) {
      controlsHint.opacity = Math.max(0, controlsHint.opacity - dt())
    }
  })

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
    livesLabel.text = "♥".repeat(h.lives)
    sequinLabel.text = `✦ ${h.sequins}`
    ninjaLabel.text = h.isNinja ? "🥷 NINJA" : ""
    weaponLabel.text = player.currentWeapon !== "none" ? `⚔ ${player.currentWeapon}` : ""
    if (showDebug) {
      stateLabel.text = `State: ${player.state}`
    }
  })

  // Game over check — patched into player update
  player.onUpdate(() => {
    const h = player.health as PlayerHealth
    if (h.lives <= 0) {
      go("gameOver", { levelId, sequins: h.sequins } as any)
    }
  })

  if (isBoss) {
    runBossFight(player, levelData.playerSpawn.x, levelData.playerSpawn.y)
  } else {
    // Transition to level complete when player reaches end of level1
    let triggered = false
    player.onUpdate(() => {
      if (!triggered && player.pos.x > 3100) {
        triggered = true
        const h = player.health as PlayerHealth
        go("levelComplete", {
          levelId: "level1",
          sequins: h.sequins,
          lives: h.lives,
          time: levelTime,
        } as any)
      }
    })
  }
}
