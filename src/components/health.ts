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
  starTimer: number  // Mario star power — full invincibility + auto-kill
}

export function initHealth(player: any) {
  player.health = {
    lives: PLAYER.STARTING_LIVES,
    isNinja: false,
    sequins: 0,
    ribbons: 0,
    invincibleTimer: 1.0, // tutorial-length spawn grace: kid has a full second to orient and jump at the first powerup before enemies can touch them
    starTimer: 0,
  } as PlayerHealth
  player.isInvincible = true
}

export function collectStar(player: any) {
  const h = player.health as PlayerHealth
  h.starTimer = 8.0 // 8 seconds of star power
  player.isInvincible = true
}

export function hitPlayer(player: any, spawnX: number, spawnY: number, levelId?: string, force: boolean = false) {
  if (!force && player.isInvincible) return
  if (!force && (player.state === "spin" || player.state === "dash" || player.state === "whip")) return

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
  // Classic Mario death: player pops up in place, briefly hangs, then
  // falls off screen. During the animation player.vel is controlled
  // manually. Isolated from normal physics/collisions via isInvincible.
  player.isInvincible = true
  // Freeze physics by canceling velocity and temporarily parking the
  // entity outside of the collision resolve loop (kaplay body stays,
  // but we'll override vel each frame of the animation).
  const startX = player.pos.x
  const startY = player.pos.y
  let elapsed = 0
  const totalDur = 1.4
  const popUpDur = 0.45 // reaches apex by this time
  const popUpHeight = 120
  const ev = onUpdate(() => {
    elapsed += dt()
    // Ignore normal physics by zeroing horizontal motion + overriding y
    player.vel.x = 0
    player.angle += dt() * 540
    if (elapsed < popUpDur) {
      // Parabolic pop up: smooth arc from 0 to popUpHeight
      const n = elapsed / popUpDur
      const h = Math.sin(n * Math.PI / 2) * popUpHeight
      player.pos.x = startX
      player.pos.y = startY - h
      player.vel.y = 0
    } else {
      // Fall phase — real gravity + accel until either duration elapses
      // or player goes off the bottom of the screen
      const fallT = elapsed - popUpDur
      player.pos.y = startY - popUpHeight + (1600 * fallT * fallT) / 2
      player.vel.y = 1600 * fallT
    }
    // Fade out in the back half of the animation
    if (elapsed > totalDur * 0.6) {
      player.opacity = Math.max(0, 1 - (elapsed - totalDur * 0.6) / (totalDur * 0.4))
    }
    if (elapsed >= totalDur) {
      ev.cancel()
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
  // Star power trumps regular invincibility flash — rainbow cycle
  if (h.starTimer > 0) {
    h.starTimer -= dt()
    player.isInvincible = true
    // Rainbow hue cycle by tinting the sprite
    const hue = (h.starTimer * 8) % 1
    const r = Math.abs(Math.sin(hue * Math.PI * 2)) * 255
    const g = Math.abs(Math.sin(hue * Math.PI * 2 + Math.PI * 2 / 3)) * 255
    const b = Math.abs(Math.sin(hue * Math.PI * 2 + Math.PI * 4 / 3)) * 255
    player.color = rgb(Math.floor(r), Math.floor(g), Math.floor(b))
    player.opacity = 1
    // Warning flash in last second
    if (h.starTimer < 1.0) {
      const warn = Math.floor(h.starTimer / 0.1) % 2 === 0
      player.opacity = warn ? 0.5 : 1.0
    }
    if (h.starTimer <= 0) {
      h.starTimer = 0
      player.color = rgb(255, 255, 255)
      player.opacity = 1
      player.isInvincible = false
    }
    return
  }
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
