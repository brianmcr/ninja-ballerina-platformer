import { PLAYER, COLORS, NINJA_COLORS, ENEMY, GRAVITY, FEEL } from "../config"
import { applyFloat, startDash, updateDash } from "../components/movement"
import { initHealth, updateHealth } from "../components/health"
import { fireShuriken, swingKatana, stabSais, updateWeaponCooldown } from "../components/weapons"
import { landSquash, shakeOnLand, spawnDashTrail } from "../components/effects"
import { playJump, playLand, playSpin, playDash, playWhip } from "../components/audio"
import type { PlayerHealth } from "../components/health"
import type { WeaponType } from "../components/weapons"

type PlayerState = "idle" | "run" | "jump" | "float" | "spin" | "dash" | "whip"

export default function createPlayer(x: number, y: number) {
  const player = add([
    sprite("ballerina-idle"),
    scale(0.11),
    pos(x, y),
    area({ shape: new Rect(vec2(0), PLAYER.WIDTH, PLAYER.HEIGHT) }),
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
  const NINJA_SPRITES: Record<string, string> = {
    idle: "ninja-idle",
    run: "ninja-idle",
    jump: "ninja-idle",
    float: "ninja-idle",
    spin: "ninja-idle",
    dash: "ninja-idle",
    whip: "ninja-idle",
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

  function moveSpeed() {
    let s = PLAYER.RUN_SPEED
    if (player.isSticky) s *= ENEMY.GLUTEN_BLOB.STICKY_SPEED_MULT
    if (player.isSyrupy) s *= ENEMY.SYRUP_DRIPPER.PUDDLE_SPEED_MULT
    if (player.isSlippery) s *= ENEMY.BUTTER_PAT.SLIPPERY_SPEED_MULT
    return s
  }

  // Movement: track target velocity, lerp in onUpdate
  let targetVelX = 0

  // Jump with coyote time and input buffering
  function tryJump() {
    if (!canAct()) return
    const grounded = player.isGrounded()
    const coyote = time() - player.lastGroundedTime < FEEL.COYOTE_TIME

    if (grounded || coyote) {
      player.jump(PLAYER.JUMP_FORCE)
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
  onKeyPress("z", () => {
    if (!canAct()) return
    setState("spin")
    playSpin()
    player.spinTimer = PLAYER.SPIN_DURATION

    const enemies = get("enemy")
    for (const e of enemies) {
      if (player.pos.dist(e.pos) < PLAYER.SPIN_RADIUS) {
        const fromDir = player.pos.x < e.pos.x ? -1 : 1
        if (e.hurt?.length >= 2) {
          e.hurt(1, fromDir)
        } else {
          e.hurt?.(1)
        }
      }
    }
  })

  // Cartwheel Dash (X)
  onKeyPress("x", () => {
    if (!canAct()) return
    setState("dash")
    playDash()
    player.dashState = startDash(player)
    player.dashTrailTimer = 0
  })

  // Ribbon Whip (C)
  onKeyPress("c", () => {
    if (!canAct()) return
    setState("whip")
    playWhip()
    player.whipTimer = PLAYER.WHIP_DURATION

    const whipX = player.pos.x + player.facing * (PLAYER.WIDTH / 2 + PLAYER.WHIP_RANGE / 2)
    const whipY = player.pos.y - PLAYER.HEIGHT / 2
    player.whipHitbox = add([
      rect(PLAYER.WHIP_RANGE * 0.7, PLAYER.WHIP_WIDTH),
      pos(whipX, whipY),
      area(),
      anchor("center"),
      color(...COLORS.whip),
      opacity(0.3),
      "whip-hitbox",
    ])

    player.whipHitbox.onCollide("enemy", (e: any) => {
      const fromDir = player.pos.x < e.pos.x ? -1 : 1
      if (e.hurt?.length >= 2) {
        e.hurt(1, fromDir)
      } else {
        e.hurt?.(1)
      }
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
    const baseScale = 0.11

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

    // Fall gravity multiplier: snappier falling
    if (!player.isGrounded() && player.vel.y > 0 && player.state !== "float" && player.state !== "dash") {
      const extraGrav = GRAVITY * (FEEL.FALL_GRAVITY_MULT - 1) * dt()
      player.vel.y += extraGrav
    }

    // Spin timer
    if (player.state === "spin") {
      player.spinTimer -= dt()
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
    // Landing squash if fell far enough
    const fallDist = player.pos.y - player.lastFallY
    if (fallDist > FEEL.LAND_SQUASH_THRESHOLD) {
      landSquash(player)
      shakeOnLand()
      playLand()
    }

    // Jump buffer: if player pressed jump recently, auto-execute
    if (player.lastJumpPressTime > 0 && time() - player.lastJumpPressTime < FEEL.JUMP_BUFFER) {
      player.lastJumpPressTime = -1
      player.jump(PLAYER.JUMP_FORCE)
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
