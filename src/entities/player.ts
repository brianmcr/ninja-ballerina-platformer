import { PLAYER, COLORS } from "../config"
import { applyFloat, startDash, updateDash } from "../components/movement"

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
    },
  ])

  function setState(s: PlayerState) {
    player.state = s
    player.isInvincible = s === "dash"
    const c = COLORS[s]
    player.color = rgb(c[0], c[1], c[2])
  }

  function canAct() {
    return player.state !== "spin" && player.state !== "dash"
  }

  // Movement
  onKeyDown("left", () => {
    if (!canAct()) return
    player.move(-PLAYER.RUN_SPEED, 0)
    player.facing = -1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  onKeyDown("right", () => {
    if (!canAct()) return
    player.move(PLAYER.RUN_SPEED, 0)
    player.facing = 1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  onKeyDown("a", () => {
    if (!canAct()) return
    player.move(-PLAYER.RUN_SPEED, 0)
    player.facing = -1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  onKeyDown("d", () => {
    if (!canAct()) return
    player.move(PLAYER.RUN_SPEED, 0)
    player.facing = 1
    if (player.isGrounded() && player.state !== "whip") setState("run")
  })

  // Jump (space and W)
  function tryJump() {
    if (player.isGrounded() && canAct()) {
      player.jump(PLAYER.JUMP_FORCE)
      setState("jump")
    }
  }

  onKeyPress("space", tryJump)
  onKeyPress("w", tryJump)

  // Float (hold space while airborne and falling)
  onKeyDown("space", () => {
    if (!player.isGrounded() && player.vel.y > 0 && canAct()) {
      const didFloat = applyFloat(player, true)
      if (didFloat && player.state !== "whip") setState("float")
    }
  })

  onKeyRelease("space", () => {
    if (player.state === "float") setState("jump")
  })

  // Pirouette Spin (Z)
  onKeyPress("z", () => {
    if (!canAct()) return
    setState("spin")
    player.spinTimer = PLAYER.SPIN_DURATION

    // Damage enemies in range
    const enemies = get("enemy")
    for (const e of enemies) {
      if (player.pos.dist(e.pos) < PLAYER.SPIN_RADIUS) {
        e.hurt?.(1)
      }
    }
  })

  // Cartwheel Dash (X)
  onKeyPress("x", () => {
    if (!canAct()) return
    setState("dash")
    player.dashState = startDash(player)
  })

  // Ribbon Whip (C)
  onKeyPress("c", () => {
    if (!canAct()) return
    setState("whip")
    player.whipTimer = PLAYER.WHIP_DURATION

    // Create temporary hitbox in front of player
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
      e.hurt?.(1)
    })
  })

  // Main update loop
  player.onUpdate(() => {
    // Spin timer
    if (player.state === "spin") {
      player.spinTimer -= dt()
      if (player.spinTimer <= 0) {
        setState(player.isGrounded() ? "idle" : "jump")
      }
      return // can't move during spin
    }

    // Dash update
    if (player.state === "dash" && player.dashState) {
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
  })

  // Landing detection
  player.onGround(() => {
    if (player.state === "jump" || player.state === "float") {
      setState("idle")
    }
  })

  return player
}
