import { FEEL, PLAYER, PICKUP } from "../config"

let shakeOffsetX = 0
let shakeOffsetY = 0
let shakeIntensity = 0
let shakeTimeLeft = 0
let shakeDuration = 0
let shakeActive = false

export function screenShake(intensity: number, duration: number) {
  shakeIntensity = Math.max(shakeIntensity, intensity)
  shakeTimeLeft = Math.max(shakeTimeLeft, duration)
  shakeDuration = shakeTimeLeft
  if (!shakeActive) {
    shakeActive = true
    const ev = onUpdate(() => {
      const cp = getCamPos()
      setCamPos(cp.x - shakeOffsetX, cp.y - shakeOffsetY)
      shakeTimeLeft -= dt()
      if (shakeTimeLeft <= 0) {
        shakeOffsetX = 0
        shakeOffsetY = 0
        shakeIntensity = 0
        shakeActive = false
        ev.cancel()
        return
      }
      const fade = Math.max(0, shakeTimeLeft / shakeDuration)
      shakeOffsetX = (Math.random() * 2 - 1) * shakeIntensity * fade
      shakeOffsetY = (Math.random() * 2 - 1) * shakeIntensity * fade
      const cp2 = getCamPos()
      setCamPos(cp2.x + shakeOffsetX, cp2.y + shakeOffsetY)
    })
  }
}

export function shakeOnHit() {
  screenShake(FEEL.SHAKE_HIT.intensity, FEEL.SHAKE_HIT.duration)
}

export function shakeOnEnemyDefeat() {
  screenShake(FEEL.SHAKE_ENEMY_DEFEAT.intensity, FEEL.SHAKE_ENEMY_DEFEAT.duration)
}

export function shakeOnBossPhase() {
  screenShake(FEEL.SHAKE_BOSS_PHASE.intensity, FEEL.SHAKE_BOSS_PHASE.duration)
}

export function shakeOnLand() {
  screenShake(FEEL.SHAKE_LAND.intensity, FEEL.SHAKE_LAND.duration)
}

export function enemyDefeatPop(x: number, y: number) {
  const circle = add([
    rect(8, 8),
    pos(x, y),
    anchor("center"),
    color(255, 255, 255),
    opacity(0.8),
    z(50),
  ])
  let elapsed = 0
  circle.onUpdate(() => {
    elapsed += dt()
    const scale = 1 + elapsed * 15
    circle.width = 8 * scale
    circle.height = 8 * scale
    circle.opacity = Math.max(0, 0.8 - elapsed * 4)
    if (circle.opacity <= 0) destroy(circle)
  })
}

export function sequinCollectPop(x: number, y: number) {
  // Particle burst
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const spd = 80 + Math.random() * 40
    const vx = Math.cos(angle) * spd
    const vy = Math.sin(angle) * spd
    const p = add([
      rect(4, 4),
      pos(x, y),
      anchor("center"),
      color(PICKUP.SEQUIN_COLOR[0], PICKUP.SEQUIN_COLOR[1], PICKUP.SEQUIN_COLOR[2]),
      opacity(1),
      z(50),
    ])
    let t = 0
    p.onUpdate(() => {
      t += dt()
      p.pos.x += vx * dt()
      p.pos.y += vy * dt()
      p.opacity = Math.max(0, 1 - t * 5)
      if (p.opacity <= 0) destroy(p)
    })
  }

  // Floating "+1" text
  const label = add([
    text("+1", { size: 16 }),
    pos(x, y - 10),
    anchor("center"),
    color(255, 215, 0),
    opacity(1),
    z(51),
  ])
  let lt = 0
  label.onUpdate(() => {
    lt += dt()
    label.pos.y -= 40 * dt()
    label.opacity = Math.max(0, 1 - lt * 2)
    if (label.opacity <= 0) destroy(label)
  })
}

export function spawnDashTrail(x: number, y: number, w: number, h: number, c: [number, number, number]) {
  const trail = add([
    rect(w, h),
    pos(x, y),
    anchor("bot"),
    color(c[0], c[1], c[2]),
    opacity(0.4),
    z(-1),
  ])
  let t = 0
  trail.onUpdate(() => {
    t += dt()
    trail.opacity = Math.max(0, 0.4 - (t / FEEL.DASH_TRAIL_FADE) * 0.4)
    if (trail.opacity <= 0) destroy(trail)
  })
}

export function landSquash(player: any) {
  const origW = PLAYER.WIDTH
  const origH = PLAYER.HEIGHT
  player.width = origW * 1.4
  player.height = origH * 0.7
  let t = 0
  const ev = onUpdate(() => {
    t += dt()
    const progress = Math.min(1, t / FEEL.LAND_SQUASH_DURATION)
    player.width = origW * 1.4 + (origW - origW * 1.4) * progress
    player.height = origH * 0.7 + (origH - origH * 0.7) * progress
    if (progress >= 1) {
      player.width = origW
      player.height = origH
      ev.cancel()
    }
  })
}

export function freezeFrame(duration: number): Promise<void> {
  return new Promise((resolve) => {
    const paused = new Set<any>()
    // We'll just briefly pause via timeScale if available, otherwise skip
    // Kaplay doesn't expose global pause easily, so we simulate with a brief wait
    wait(duration, resolve)
  })
}

export function floatingText(x: number, y: number, msg: string, c: [number, number, number]) {
  const label = add([
    text(msg, { size: 14 }),
    pos(x, y - 10),
    anchor("center"),
    color(c[0], c[1], c[2]),
    opacity(1),
    z(51),
  ])
  let t = 0
  label.onUpdate(() => {
    t += dt()
    label.pos.y -= 40 * dt()
    label.opacity = Math.max(0, 1 - t * 1.5)
    if (label.opacity <= 0) destroy(label)
  })
}

export function flashWhite(entity: any, duration = 0.1) {
  const origColor = entity.color?.clone()
  entity.color = rgb(255, 255, 255)
  wait(duration, () => {
    if (entity.exists() && origColor) {
      entity.color = origColor
    }
  })
}
