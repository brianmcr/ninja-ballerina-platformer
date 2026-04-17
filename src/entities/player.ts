import { PLAYER, COLORS, NINJA_COLORS, ENEMY, GRAVITY, FEEL } from "../config"
import { applyFloat, startDash, updateDash } from "../components/movement"
import { initHealth, updateHealth } from "../components/health"
import { fireShuriken, swingKatana, stabSais, updateWeaponCooldown } from "../components/weapons"
import { landSquash, shakeOnLand, spawnDashTrail } from "../components/effects"
import { playJump, playLand, playSpin, playDash, playWhip, resetStompChain } from "../components/audio"
import type { PlayerHealth } from "../components/health"
import type { WeaponType } from "../components/weapons"

type PlayerState = "idle" | "run" | "jump" | "float" | "spin" | "dash" | "whip"

const PLAYER_SCALE = 0.11

export default function createPlayer(x: number, y: number) {
  const player = add([
    sprite("ballerina-idle"),
    scale(PLAYER_SCALE),
    pos(x, y),
    // Shape is in pre-scale local coords. Divide by entity scale so the
    // world-space hitbox comes out to PLAYER.WIDTH x PLAYER.HEIGHT pixels.
    // Kaplay applies the anchor translation automatically — no manual offset.
    area({ shape: new Rect(vec2(0), PLAYER.WIDTH / PLAYER_SCALE, PLAYER.HEIGHT / PLAYER_SCALE) }),
    body(),
    anchor("bot"),
    rotate(0),
    "player",
    {
      state: "idle" as PlayerState,
      facing: 1,
      dashState: null as { timer: number; dir: number } | null,
      spinTimer: 0,
      whipTimer: 0,
      whipHitbox: null as any,
      isInvincible: false,
      isSticky: false,
      isSlippery: false,
      isSyrupy: false,
      health: null as PlayerHealth | null,
      currentWeapon: "none" as WeaponType,
      weaponCooldown: 0,
      lastGroundedTime: 0,
      lastJumpPressTime: -1,
      lastFallY: 0,
      wasGrounded: true,
      dashTrailTimer: 0,
      lastAttackPressTime: -1,
    },
  ])

  initHealth(player)

  // Use ONE consistent sprite for all states — DALL-E can't maintain character
  // consistency across separate generations. Procedural animation handles state visuals.
  const BALLERINA_SPRITES: Record<string, string> = {
    idle: "ballerina-idle",
    run: "ballerina-idle",
    jump: "ballerina-idle",
    float: "ballerina-idle",
    spin: "ballerina-idle",
    dash: "ballerina-idle",
    whip: "ballerina-idle",
  }
  // Ninja form uses the SAME ballerina sprite — she's the same character.
  // A headband overlay + dark tint signal the transformation visually.
  const NINJA_SPRITES: Record<string, string> = {
    idle: "ballerina-idle",
    run: "ballerina-idle",
    jump: "ballerina-idle",
    float: "ballerina-idle",
    spin: "ballerina-idle",
    dash: "ballerina-idle",
    whip: "ballerina-idle",
  }

  // Ninja headband overlay — spawned on ninja form, destroyed on loss
  let ninjaHeadband: any = null
  let ninjaRibbonL: any = null
  let ninjaRibbonR: any = null
  let ninjaAura: any = null

  function spawnTransformBurst() {
    // Pink sparkle burst to signal the transformation
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2
      const spd = 120 + Math.random() * 60
      const vx = Math.cos(angle) * spd
      const vy = Math.sin(angle) * spd - 40
      const p = add([
        rect(5, 5),
        pos(player.pos.x, player.pos.y - 50),
        anchor("center"),
        rotate(45),
        color(255, 105, 180),
        opacity(1),
        z(60),
      ])
      let age = 0
      p.onUpdate(() => {
        age += dt()
        p.pos.x += vx * dt()
        p.pos.y += vy * dt()
        p.opacity = Math.max(0, 1 - age * 2)
        p.angle += dt() * 360
        if (p.opacity <= 0) destroy(p)
      })
    }
  }

  function updateNinjaOverlay() {
    const h = player.health as PlayerHealth
    if (h?.isNinja && !ninjaHeadband) {
      spawnTransformBurst()
      // Dark power aura — a circle pulsing behind the player that tells
      // the eye "this character is POWERED UP." Renders behind sprite.
      ninjaAura = add([
        circle(60),
        pos(player.pos.x, player.pos.y - 48),
        anchor("center"),
        color(180, 30, 180),
        opacity(0.25),
        z(-1),
        "ninja-gear",
      ])
      // Black headband across the top of the head
      ninjaHeadband = add([
        rect(40, 6),
        pos(player.pos.x, player.pos.y - 90),
        anchor("center"),
        color(20, 20, 30),
        z(5),
        "ninja-gear",
      ])
      // Two pink ribbon tails flowing behind
      ninjaRibbonL = add([
        rect(22, 4),
        pos(player.pos.x - 18, player.pos.y - 86),
        anchor("right"),
        color(255, 20, 147),
        rotate(-10),
        z(4),
        "ninja-gear",
      ])
      ninjaRibbonR = add([
        rect(22, 4),
        pos(player.pos.x + 18, player.pos.y - 86),
        anchor("left"),
        color(255, 20, 147),
        rotate(10),
        z(4),
        "ninja-gear",
      ])
    } else if (!h?.isNinja && ninjaHeadband) {
      destroy(ninjaHeadband)
      destroy(ninjaRibbonL)
      destroy(ninjaRibbonR)
      if (ninjaAura) destroy(ninjaAura)
      ninjaHeadband = null
      ninjaRibbonL = null
      ninjaRibbonR = null
      ninjaAura = null
    }
    if (ninjaHeadband) {
      const bob = Math.sin(time() * 8) * 1
      ninjaHeadband.pos.x = player.pos.x
      ninjaHeadband.pos.y = player.pos.y - 90
      ninjaRibbonL.pos.x = player.pos.x - 18
      ninjaRibbonL.pos.y = player.pos.y - 86 + bob
      ninjaRibbonL.angle = -10 + Math.sin(time() * 3) * 8
      ninjaRibbonR.pos.x = player.pos.x + 18
      ninjaRibbonR.pos.y = player.pos.y - 86 - bob
      ninjaRibbonR.angle = 10 - Math.sin(time() * 3) * 8
      if (ninjaAura) {
        ninjaAura.pos.x = player.pos.x
        ninjaAura.pos.y = player.pos.y - 24
        ninjaAura.opacity = 0.2 + Math.sin(time() * 4) * 0.1
      }
    }
  }

  let prevState: PlayerState | null = null

  function setState(s: PlayerState) {
    if (s === player.state && s === prevState) return // Don't re-trigger same state
    prevState = s
    player.state = s
    if (s === "dash") player.isInvincible = true
    const isNinja = (player.health as PlayerHealth)?.isNinja
    const spriteMap = isNinja ? NINJA_SPRITES : BALLERINA_SPRITES
    const spriteName = spriteMap[s] || (isNinja ? "ninja-idle" : "ballerina-idle")
    player.use(sprite(spriteName))
    player.flipX = player.facing < 0
  }

  function canAct() {
    return player.state !== "spin" && player.state !== "dash"
  }

  // Sprint ramp: running in one direction for >0.4s builds speed up to
  // 1.35x over another ~0.8s. Mario-style "run button" feel without
  // needing a separate sprint key.
  let sprintHoldTime = 0
  function moveSpeed() {
    let s = PLAYER.RUN_SPEED
    // Ninja form: 25% faster so the transformation actually feels like power
    if ((player.health as PlayerHealth)?.isNinja) s *= 1.25
    // Sprint ramp
    if (sprintHoldTime > 0.4) {
      const rampT = Math.min(1, (sprintHoldTime - 0.4) / 0.8)
      s *= 1 + rampT * 0.35
    }
    if (player.isSticky) s *= ENEMY.GLUTEN_BLOB.STICKY_SPEED_MULT
    if (player.isSyrupy) s *= ENEMY.SYRUP_DRIPPER.PUDDLE_SPEED_MULT
    if (player.isSlippery) s *= ENEMY.BUTTER_PAT.SLIPPERY_SPEED_MULT
    return s
  }

  // Jump force — ninja form gets 15% more air
  function jumpForce() {
    const base = PLAYER.JUMP_FORCE
    return (player.health as PlayerHealth)?.isNinja ? base * 1.15 : base
  }

  // Movement: track target velocity, lerp in onUpdate
  let targetVelX = 0

  // Jump with coyote time and input buffering
  function tryJump() {
    if (!canAct()) return
    const grounded = player.isGrounded()
    const coyote = time() - player.lastGroundedTime < FEEL.COYOTE_TIME

    if (grounded || coyote) {
      player.jump(jumpForce())
      setState("jump")
      playJump()
      player.lastJumpPressTime = -1
      player.lastGroundedTime = -1 // prevent double coyote jump
    } else {
      // Buffer the jump input
      player.lastJumpPressTime = time()
    }
  }

  onKeyPress("space", tryJump)
  onKeyPress("w", tryJump)

  // Variable jump height: release space/w early to cut jump short
  function jumpCut() {
    if (!player.isGrounded() && player.vel.y < 0 && player.state === "jump") {
      player.vel.y *= FEEL.JUMP_CUT_MULTIPLIER
    }
  }

  onKeyRelease("space", () => {
    if (player.state === "float") {
      setState("jump")
    } else {
      jumpCut()
    }
  })

  onKeyRelease("w", jumpCut)

  // Float (hold space while airborne and falling)
  onKeyDown("space", () => {
    if (!player.isGrounded() && player.vel.y > 0 && canAct()) {
      const didFloat = applyFloat(player, true)
      if (didFloat && player.state !== "whip") setState("float")
    }
  })

  // Pirouette Spin (Z)
  // Damages on press AND every update during the spin, so timing is
  // forgiving — any enemy that enters the radius during the 0.4s spin dies.
  function spinAOE() {
    const enemies = get("enemy")
    for (const e of enemies) {
      if (player.pos.dist(e.pos) < PLAYER.SPIN_RADIUS) {
        if (e.hurt?.length >= 2) e.hurt(99, 0)
        else e.hurt?.(99)
      }
    }
  }
  onKeyPress("z", () => {
    player.lastAttackPressTime = time()
    if (!canAct()) return
    setState("spin")
    playSpin()
    player.spinTimer = PLAYER.SPIN_DURATION
    // Visible AOE ring so the player can actually see the hit area
    const ring = add([
      circle(PLAYER.SPIN_RADIUS),
      pos(player.pos.x, player.pos.y - PLAYER.HEIGHT / 2),
      anchor("center"),
      color(255, 220, 120),
      opacity(0.35),
      z(55),
    ])
    let rt = 0
    ring.onUpdate(() => {
      rt += dt()
      ring.pos.x = player.pos.x
      ring.pos.y = player.pos.y - PLAYER.HEIGHT / 2
      ring.opacity = Math.max(0, 0.35 * (1 - rt / PLAYER.SPIN_DURATION))
      if (rt >= PLAYER.SPIN_DURATION) destroy(ring)
    })
    spinAOE()
  })

  // Cartwheel Dash (X)
  onKeyPress("x", () => {
    player.lastAttackPressTime = time()
    if (!canAct()) return
    setState("dash")
    playDash()
    player.dashState = startDash(player)
    player.dashTrailTimer = 0
  })

  // Ribbon Whip (C)
  onKeyPress("c", () => {
    player.lastAttackPressTime = time()
    if (!canAct()) return
    setState("whip")
    playWhip()
    player.whipTimer = PLAYER.WHIP_DURATION

    const whipX = player.pos.x + player.facing * (PLAYER.WIDTH / 2 + PLAYER.WHIP_RANGE / 2)
    const whipY = player.pos.y - PLAYER.HEIGHT / 2
    // Invisible collision rectangle — the visual is a layered ribbon streak.
    player.whipHitbox = add([
      rect(PLAYER.WHIP_RANGE * 0.7, PLAYER.WHIP_WIDTH * 2),
      pos(whipX, whipY),
      area(),
      anchor("center"),
      opacity(0),
      z(55),
      "whip-hitbox",
    ])

    // Ribbon visual — a curved arc of pink/magenta streaks that fade out.
    // Not attached to the hitbox, so collision and visual are decoupled.
    const isNinja = (player.health as PlayerHealth)?.isNinja
    const palette = isNinja ? NINJA_COLORS.whip : COLORS.whip
    const ribbons: any[] = []
    const streakCount = 5
    for (let i = 0; i < streakCount; i++) {
      const offY = (i - (streakCount - 1) / 2) * 6
      const lenMult = 1 - Math.abs(i - (streakCount - 1) / 2) / streakCount
      const streakLen = PLAYER.WHIP_RANGE * 0.7 * (0.5 + lenMult * 0.5)
      const streak = add([
        rect(streakLen, 3, { radius: 1.5 }),
        pos(whipX - PLAYER.WHIP_RANGE * 0.35, whipY + offY),
        anchor("left"),
        color(palette[0], palette[1], palette[2]),
        opacity(0.9),
        z(54),
        rotate(player.facing < 0 ? 180 : 0),
        "whip-ribbon",
      ])
      if (player.facing < 0) {
        streak.pos.x = whipX + PLAYER.WHIP_RANGE * 0.35
      }
      ribbons.push(streak)
    }
    // Bright core flash at spawn point for impact
    const flash = add([
      circle(12),
      pos(player.pos.x + player.facing * PLAYER.WIDTH / 2, whipY),
      anchor("center"),
      color(255, 240, 200),
      opacity(0.9),
      z(56),
    ])
    let rAge = 0
    const rUpdate = onUpdate(() => {
      rAge += dt()
      const t = rAge / PLAYER.WHIP_DURATION
      for (const r of ribbons) {
        r.opacity = Math.max(0, 0.9 * (1 - t) * (1 - t))
      }
      flash.opacity = Math.max(0, 0.9 * (1 - t * 3))
      if (t >= 1) {
        for (const r of ribbons) destroy(r)
        destroy(flash)
        rUpdate.cancel()
      }
    })

    // Whip always kills enemies it touches
    player.whipHitbox.onCollide("enemy", (e: any) => {
      const fromDir = player.pos.x < e.pos.x ? -1 : 1
      if (e.hurt?.length >= 2) e.hurt(99, fromDir)
      else e.hurt?.(99)
    })
  })

  // Weapon attack (V)
  onKeyPress("v", () => {
    const h = player.health as PlayerHealth
    if (!h.isNinja || player.currentWeapon === "none") return
    const weaponSprites: Record<string, string> = {
      shuriken: "ninja-shuriken",
      katana: "ninja-katana",
      sais: "ninja-sais",
    }
    const ws = weaponSprites[player.currentWeapon]
    if (ws) player.use(sprite(ws))
    switch (player.currentWeapon) {
      case "shuriken": fireShuriken(player); break
      case "katana": swingKatana(player); break
      case "sais": stabSais(player); break
    }
  })

  // Animation state — ONLY use scale/angle, NEVER modify pos directly
  let spinAngleAccum = 0

  // Main update loop
  player.onUpdate(() => {
    updateNinjaOverlay()
    const baseScale = PLAYER_SCALE

    if (player.state === "idle") {
      // Breathing scale pulse — no position changes
      player.scale = vec2(baseScale + Math.sin(time() * 2) * 0.006)
      player.angle = 0
    } else if (player.state === "run") {
      // Subtle tilt to simulate run motion
      player.angle = Math.sin(time() * 12) * 3
      player.scale = vec2(baseScale)
    } else if (player.state === "spin") {
      spinAngleAccum += dt() * 540
      player.angle = spinAngleAccum
      player.scale = vec2(baseScale)
    } else if (player.state === "jump" || player.state === "dash") {
      // Squash-stretch via scale only (no position changes)
      if (player.vel.y < 0) {
        player.scale = vec2(
          lerp(player.scale.x, baseScale * 0.9, 0.1),
          lerp(player.scale.y, baseScale * 1.1, 0.1)
        )
      } else if (player.vel.y > 0) {
        player.scale = vec2(
          lerp(player.scale.x, baseScale * 1.1, 0.1),
          lerp(player.scale.y, baseScale * 0.9, 0.1)
        )
      } else {
        player.scale = vec2(lerp(player.scale.x, baseScale, 0.1), lerp(player.scale.y, baseScale, 0.1))
      }
      player.angle = 0
    } else if (player.state === "float") {
      player.scale = vec2(baseScale)
      player.angle = Math.sin(time() * 1) * 5
    } else {
      player.scale = vec2(baseScale)
      player.angle = 0
      spinAngleAccum = 0
    }

    // Reset spin accumulator when not spinning
    if (player.state !== "spin") {
      spinAngleAccum = 0
    }
    // Horizontal acceleration/deceleration
    const left = isKeyDown("left") || isKeyDown("a")
    const right = isKeyDown("right") || isKeyDown("d")
    // Sprint hold time: grows when holding a direction on ground, resets
    // when direction released or changed.
    if (canAct() && player.isGrounded() && (left !== right)) {
      sprintHoldTime += dt()
    } else {
      sprintHoldTime = 0
    }
    if (canAct()) {
      if (left && !right) {
        targetVelX = -moveSpeed()
        player.facing = -1
        player.flipX = true
        if (player.isGrounded() && player.state !== "whip") setState("run")
      } else if (right && !left) {
        targetVelX = moveSpeed()
        player.facing = 1
        player.flipX = false
        if (player.isGrounded() && player.state !== "whip") setState("run")
      } else {
        targetVelX = 0
      }
    } else {
      targetVelX = 0
    }
    const rawFactor = targetVelX !== 0 ? FEEL.ACCEL : FEEL.DECEL
    const lerpFactor = 1 - Math.pow(1 - rawFactor, dt() * 60)
    player.vel.x = player.vel.x + (targetVelX - player.vel.x) * lerpFactor

    // Track grounded time for coyote time
    if (player.isGrounded()) {
      player.lastGroundedTime = time()
      // Track fall start position when we leave ground
      player.lastFallY = player.pos.y
    }

    // Track when player leaves the ground to measure fall distance
    if (!player.isGrounded() && player.wasGrounded) {
      player.lastFallY = player.pos.y
    }
    player.wasGrounded = player.isGrounded()

    // Jump-feel gravity shaping:
    // - Near the apex of the jump (|vy| small) → reduce gravity for
    //   Mario-style hang time. The player gets a beat of floatiness at
    //   the top of the arc, which makes jumps feel more controllable.
    // - While falling → boost gravity for snappier landings.
    if (!player.isGrounded() && player.state !== "float" && player.state !== "dash") {
      const absVy = Math.abs(player.vel.y)
      if (absVy < FEEL.APEX_VEL_THRESHOLD) {
        // Counter-act part of gravity to simulate hang time
        const counter = GRAVITY * (1 - FEEL.APEX_GRAVITY_MULT) * dt()
        player.vel.y -= counter
      } else if (player.vel.y > 0) {
        // Falling — heavier gravity for snappy drop
        const extraGrav = GRAVITY * (FEEL.FALL_GRAVITY_MULT - 1) * dt()
        player.vel.y += extraGrav
      }
    }

    // Spin timer — damage every frame so enemies walking into the spin
    // during its active window still get killed.
    if (player.state === "spin") {
      player.spinTimer -= dt()
      spinAOE()
      if (player.spinTimer <= 0) {
        setState(player.isGrounded() ? "idle" : "jump")
      }
      return
    }

    // Dash update with trail
    if (player.state === "dash" && player.dashState) {
      player.dashTrailTimer -= dt()
      if (player.dashTrailTimer <= 0) {
        player.dashTrailTimer = FEEL.DASH_TRAIL_INTERVAL
        const palette = (player.health as PlayerHealth)?.isNinja ? NINJA_COLORS : COLORS
        const c = palette.dash
        spawnDashTrail(player.pos.x, player.pos.y, PLAYER.WIDTH, PLAYER.HEIGHT, [c[0], c[1], c[2]])
      }
      const active = updateDash(player, player.dashState)
      if (!active) {
        player.dashState = null
        // Clear dash-granted invincibility so kill zones and damage can
        // register again. Without this, isInvincible sticks forever.
        player.isInvincible = false
        setState(player.isGrounded() ? "idle" : "jump")
      }
      return
    }

    // Whip timer + follow player
    if (player.state === "whip") {
      player.whipTimer -= dt()
      if (player.whipTimer <= 0) {
        if (player.whipHitbox) {
          destroy(player.whipHitbox)
          player.whipHitbox = null
        }
        setState(player.isGrounded() ? "idle" : "jump")
      } else if (player.whipHitbox) {
        player.whipHitbox.pos.x = player.pos.x + player.facing * (PLAYER.WIDTH / 2 + PLAYER.WHIP_RANGE / 2)
        player.whipHitbox.pos.y = player.pos.y - PLAYER.HEIGHT / 2
      }
    }

    // Idle detection when grounded and no keys held
    if (player.isGrounded() && player.state !== "whip") {
      if (targetVelX === 0 && player.state === "run") setState("idle")
    }

    // Airborne state (if not floating/whipping)
    if (!player.isGrounded() && player.state !== "float" && player.state !== "whip") {
      if (player.state !== "jump") setState("jump")
    }

    updateHealth(player)
    updateWeaponCooldown(player)
  })

  // Landing detection with squash and jump buffer
  player.onGround(() => {
    // Reset stomp chain when feet touch ground — chain is for aerial
    // consecutive stomps, Mario-style.
    resetStompChain()
    // Landing feedback — squash+shake for big falls, subtle land sound
    // for any jump so every landing has audio confirmation.
    const fallDist = player.pos.y - player.lastFallY
    if (fallDist > FEEL.LAND_SQUASH_THRESHOLD) {
      landSquash(player)
      shakeOnLand()
      playLand()
    } else if (fallDist > 20) {
      // Quiet step-down for small hops
      playLand()
    }

    // Jump buffer: if player pressed jump recently, auto-execute
    if (player.lastJumpPressTime > 0 && time() - player.lastJumpPressTime < FEEL.JUMP_BUFFER) {
      player.lastJumpPressTime = -1
      player.jump(jumpForce())
      setState("jump")
      playJump()
      return
    }

    if (player.state === "jump" || player.state === "float") {
      setState("idle")
    }
  })

  return player
}
