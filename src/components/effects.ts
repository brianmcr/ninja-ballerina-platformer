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
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const spd = 80 + Math.random() * 60
    const vx = Math.cos(angle) * spd
    const vy = Math.sin(angle) * spd
    const p = add([
      circle(3),
      pos(x, y),
      anchor("center"),
      color(255, 255, 200),
      opacity(1),
      z(50),
    ])
    let age = 0
    p.onUpdate(() => {
      age += dt()
      p.pos.x += vx * dt()
      p.pos.y += vy * dt()
      const t = Math.min(1, age / 0.4)
      p.color = rgb(255, Math.floor(255 - t * 100), Math.floor(200 - t * 200))
      p.opacity = Math.max(0, 1 - age * 2.5)
      if (p.opacity <= 0) destroy(p)
    })
  }
}

export function enemyHitFlash(entity: any) {
  const origColor = entity.color?.clone()
  entity.color = rgb(255, 255, 255)
  let t = 0
  const wobbleOriginX = entity.pos.x
  const ev = onUpdate(() => {
    t += dt()
    if (t < 0.1 && entity.exists()) {
      entity.color = rgb(255, 255, 255)
    } else if (entity.exists() && origColor) {
      entity.color = origColor
    }
    if (t < 0.2 && entity.exists()) {
      entity.pos.x = wobbleOriginX + Math.sin(t * 60) * 2
    } else if (entity.exists()) {
      entity.pos.x = wobbleOriginX
    }
    if (t >= 0.2) {
      if (entity.exists()) entity.pos.x = wobbleOriginX
      ev.cancel()
    }
  })
}

// Quick colored screen-edge flash — colored border fade that frames the
// action without obscuring gameplay. Used for stomp/damage feedback.
export function edgeFlash(r: number, g: number, b: number) {
  const w = width()
  const h = height()
  const border = 20 // thickness
  const strips = [
    { x: 0, y: 0, w, h: border },              // top
    { x: 0, y: h - border, w, h: border },     // bottom
    { x: 0, y: 0, w: border, h },              // left
    { x: w - border, y: 0, w: border, h },     // right
  ]
  for (const s of strips) {
    const el = add([
      rect(s.w, s.h),
      pos(s.x, s.y),
      color(r, g, b),
      opacity(0.6),
      fixed(),
      z(200),
    ])
    let t = 0
    el.onUpdate(() => {
      t += dt()
      el.opacity = Math.max(0, 0.6 - t * 3)
      if (el.opacity <= 0) destroy(el)
    })
  }
}

// Floating feedback text at an entity location — "STOMP!", "OUCH!", etc.
export function popText(x: number, y: number, text_: string, rgb_: [number, number, number], sizePx = 20) {
  const label = add([
    text(text_, { size: sizePx, font: "Bangers" }),
    pos(x, y),
    anchor("center"),
    color(rgb_[0], rgb_[1], rgb_[2]),
    opacity(1),
    z(200),
  ])
  let t = 0
  label.onUpdate(() => {
    t += dt()
    label.pos.y -= 50 * dt()
    label.opacity = Math.max(0, 1 - t * 1.5)
    if (label.opacity <= 0) destroy(label)
  })
}

export function sequinCollectPop(x: number, y: number) {
  // Particle burst
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2
    const spd = 80 + Math.random() * 60
    const vx = Math.cos(angle) * spd
    const vy = Math.sin(angle) * spd
    const r = 2 + Math.random() * 2
    const p = add([
      circle(r),
      pos(x, y),
      anchor("center"),
      color(255, 215, 0),
      opacity(1),
      z(50),
    ])
    let age = 0
    p.onUpdate(() => {
      age += dt()
      p.pos.x += vx * dt()
      p.pos.y += vy * dt()
      const t = Math.min(1, age / 0.4)
      p.color = rgb(
        Math.floor(255 - t * 55),
        Math.floor(215 - t * 65),
        Math.floor(t * 50),
      )
      p.opacity = Math.max(0, 1 - age * 3)
      if (p.opacity <= 0) destroy(p)
    })
  }

  // Floating "+1" text
  const label = add([
    text("+1", { size: 16, font: "Bangers" }),
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
    const progress = t / FEEL.DASH_TRAIL_FADE
    trail.color = rgb(
      Math.floor(c[0] * Math.max(0, 1 - progress * 0.5)),
      Math.floor(c[1] * Math.max(0, 1 - progress * 0.5)),
      Math.floor(c[2] * Math.max(0, 1 - progress * 0.5)),
    )
    trail.opacity = Math.max(0, 0.4 - progress * 0.4)
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
    text(msg, { size: 14, font: "Bangers" }),
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

export function flashScreen(startOpacity = 0.6, fadeDuration = 0.5) {
  const flash = add([
    rect(width(), height()),
    pos(0, 0),
    color(255, 255, 255),
    opacity(startOpacity),
    fixed(),
    z(300),
  ])
  let t = 0
  flash.onUpdate(() => {
    t += dt()
    flash.opacity = Math.max(0, startOpacity * (1 - t / fadeDuration))
    if (flash.opacity <= 0) destroy(flash)
  })
}

export function starburstParticles(x: number, y: number, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const spd = 120 + Math.random() * 100
    const vx = Math.cos(angle) * spd
    const vy = Math.sin(angle) * spd
    const r = 2 + Math.random() * 3
    const startG = 215 + Math.floor(Math.random() * 40)
    const startB = Math.floor(Math.random() * 100)
    const p = add([
      circle(r),
      pos(x, y),
      anchor("center"),
      color(255, startG, startB),
      opacity(1),
      z(150),
    ])
    let age = 0
    p.onUpdate(() => {
      age += dt()
      p.pos.x += vx * dt()
      p.pos.y += vy * dt() + 100 * age * dt()
      const t = Math.min(1, age / 0.67)
      p.color = rgb(
        Math.floor(255 - t * 55),
        Math.floor(startG - t * (startG - 100)),
        Math.floor(startB + t * (50 - startB)),
      )
      p.opacity = Math.max(0, 1 - age * 1.5)
      if (p.opacity <= 0) destroy(p)
    })
  }
}
