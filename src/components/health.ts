import { PLAYER } from "../config"
import { shakeOnHit } from "./effects"
import { playHit, playDefeat } from "./audio"
import { fadeOut } from "./transition"

export interface PlayerHealth {
  lives: number
  isNinja: boolean
  sequins: number
  ribbons: number
  invincibleTimer: number
}

export function initHealth(player: any) {
  player.health = {
    lives: PLAYER.STARTING_LIVES,
    isNinja: false,
    sequins: 0,
    ribbons: 0,
    invincibleTimer: 0.3, // brief spawn grace
  } as PlayerHealth
  player.isInvincible = true
}

export function hitPlayer(player: any, spawnX: number, spawnY: number, levelId?: string) {
  if (player.isInvincible) return
  if (player.state === "spin" || player.state === "dash" || player.state === "whip") return

  const h = player.health as PlayerHealth

  shakeOnHit()

  if (h.isNinja) {
    h.isNinja = false
    player.currentWeapon = "none"
    playHit()
    startInvincibility(player)
  } else {
    h.lives--
    if (h.lives <= 0) {
      playDefeat()
      // Game over: freeze the player and transition to gameOver scene
      player.isInvincible = true
      player.vel.x = 0
      player.vel.y = 0
      const lvl = levelId ?? "level1"
      fadeOut(0.4, () => {
        try {
          go("gameOver", { levelId: lvl, sequins: h.sequins })
        } catch (e) {
          go("title")
        }
      })
      return
    }
    playHit()
    playDeathAnimation(player, spawnX, spawnY)
  }
}

function playDeathAnimation(player: any, spawnX: number, spawnY: number) {
  player.isInvincible = true
  const origWidth = PLAYER.WIDTH
  const origHeight = PLAYER.HEIGHT
  let elapsed = 0
  const duration = 0.3
  const ev = onUpdate(() => {
    elapsed += dt()
    const t = Math.min(1, elapsed / duration)
    player.width = origWidth * (1 - t * 0.8)
    player.height = origHeight * (1 - t * 0.8)
    player.opacity = 1 - t
    player.angle += dt() * 720
    if (t >= 1) {
      ev.cancel()
      player.width = origWidth
      player.height = origHeight
      player.opacity = 1
      player.angle = 0
      player.pos.x = spawnX
      player.pos.y = spawnY
      player.vel.x = 0
      player.vel.y = 0
      startInvincibility(player)
    }
  })
}

function startInvincibility(player: any) {
  const h = player.health as PlayerHealth
  h.invincibleTimer = PLAYER.INVINCIBILITY_DURATION
  player.isInvincible = true
}

export function updateHealth(player: any) {
  const h = player.health as PlayerHealth
  if (h.invincibleTimer > 0) {
    h.invincibleTimer -= dt()
    const flash = Math.floor(h.invincibleTimer / 0.1) % 2 === 0
    player.opacity = flash ? 0.3 : 1.0
    if (h.invincibleTimer <= 0) {
      h.invincibleTimer = 0
      player.opacity = 1.0
      if (player.state !== "dash") {
        player.isInvincible = false
      }
    }
  }
}

export function collectSequin(player: any): boolean {
  const h = player.health as PlayerHealth
  h.sequins++
  if (h.sequins >= PLAYER.SEQUINS_FOR_EXTRA_LIFE) {
    h.sequins -= PLAYER.SEQUINS_FOR_EXTRA_LIFE
    h.lives++
    return true
  }
  return false
}

export function collectRibbon(player: any) {
  const h = player.health as PlayerHealth
  h.ribbons++
}

export function collectNinjaPowerup(player: any) {
  const h = player.health as PlayerHealth
  h.isNinja = true
  player.currentWeapon = "shuriken"
}
