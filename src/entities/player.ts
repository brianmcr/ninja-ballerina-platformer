import { PLAYER, COLORS, NINJA_COLORS, ENEMY, GRAVITY, FEEL } from "../config"
import { applyFloat, startDash, updateDash } from "../components/movement"
import { initHealth, updateHealth } from "../components/health"
import { fireShuriken, swingKatana, stabSais, updateWeaponCooldown } from "../components/weapons"
import { landSquash, shakeOnLand, spawnDashTrail } from "../components/effects"
import type { PlayerHealth } from "../components/health"
import type { WeaponType } from "../components/weapons"

type PlayerState = "idle" | "run" | "jump" | "float" | "spin" | "dash" | "whip"

export default function createPlayer(x: number, y: number) {
  const player = add([
    rect(PLAYER.WIDTH, PLAYER.HEIGHT),
    pos(x, y),
    area(),
    body(),
    anchor("bot"),
    color(...COLORS.idle),
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

  function setState(s: PlayerState) {
    player.state = s
    if (s === "dash") player.isInvincible = true
    const palette = (player.health as PlayerHealth)?.isNinja ? NINJA_COLORS : COLORS
    const c = palette[s]
    player.color = rgb(c[0], c[1], c[2])
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

  // Movement
  onKeyDown("left", () => {
    if (!canAct()) return
    player.move(-moveSpeed(), 0)
    player.facing = -1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  onKeyDown("right", () => {
    if (!canAct()) return
    player.move(moveSpeed(), 0)
    player.facing = 1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  onKeyDown("a", () => {
    if (!canAct()) return
    player.move(-moveSpeed(), 0)
    player.facing = -1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  onKeyDown("d", () => {
    if (!canAct()) return
    player.move(moveSpeed(), 0)
    player.facing = 1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  // Jump with coyote time and input buffering
  function tryJump() {
    if (!canAct()) return
    const grounded = player.isGrounded()
    const coyote = time() - player.lastGroundedTime < FEEL.COYOTE_TIME

    if (grounded || coyote) {
      player.jump(PLAYER.JUMP_FORCE)
      setState("jump")
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
    player.dashState = startDash(player)
    player.dashTrailTimer = 0
  })

  // Ribbon Whip (C)
  onKeyPress("c", () => {
    if (!canAct()) return
    setState("whip")
    player.whipTimer = PLAYER.WHIP_DURATION

    const whipX = player.pos.x + player.facing * (PLAYER.WIDTH / 2 + PLAYER.WHIP_RANGE / 2)
    const whipY = player.pos.y - PLAYER.HEIGHT / 2
    player.whipHitbox = add([
      rect(PLAYER.WHIP_RANGE, PLAYER.WHIP_WIDTH),
      pos(whipX, whipY),
      area(),
      anchor("center"),
      color(...COLORS.whip),
      opacity(0.7),
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
    switch (player.currentWeapon) {
      case "shuriken": fireShuriken(player); break
      case "katana": swingKatana(player); break
      case "sais": stabSais(player); break
    }
  })

  // Main update loop
  player.onUpdate(() => {
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
      if (!isKeyDown("left") && !isKeyDown("right") && !isKeyDown("a") && !isKeyDown("d")) {
        if (player.state === "run") setState("idle")
      }
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
    }

    // Jump buffer: if player pressed jump recently, auto-execute
    if (player.lastJumpPressTime > 0 && time() - player.lastJumpPressTime < FEEL.JUMP_BUFFER) {
      player.lastJumpPressTime = -1
      player.jump(PLAYER.JUMP_FORCE)
      setState("jump")
      return
    }

    if (player.state === "jump" || player.state === "float") {
      setState("idle")
    }
  })

  return player
}
