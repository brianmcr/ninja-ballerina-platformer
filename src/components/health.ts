import { PLAYER } from "../config"
import { shakeOnHit } from "./effects"

export interface PlayerHealth {
  lives: number
  isNinja: boolean
  sequins: number
  invincibleTimer: number
}

export function initHealth(player: any) {
  player.health = {
    lives: PLAYER.STARTING_LIVES,
    isNinja: false,
    sequins: 0,
    invincibleTimer: 0,
  } as PlayerHealth
}

export function hitPlayer(player: any, spawnX: number, spawnY: number) {
  if (player.isInvincible) return
  if (player.state === "spin" || player.state === "dash" || player.state === "whip") return

  const h = player.health as PlayerHealth

  shakeOnHit()

  if (h.isNinja) {
    h.isNinja = false
    player.currentWeapon = "none"
    startInvincibility(player)
    debug.log("Lost ninja form!")
  } else {
    h.lives--
    if (h.lives <= 0) {
      return
    }
    player.pos.x = spawnX
    player.pos.y = spawnY
    player.vel.x = 0
    player.vel.y = 0
    startInvincibility(player)
  }
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
    debug.log("Extra life!")
    return true
  }
  return false
}

export function collectNinjaPowerup(player: any) {
  const h = player.health as PlayerHealth
  h.isNinja = true
  player.currentWeapon = "shuriken"
  debug.log("Ninja form! Shuriken equipped.")
}
