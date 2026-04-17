import { SCREEN, PLATFORM, CAMERA, ENEMY, PICKUP, DESTRUCTIBLE } from "../config"
import createPlayer from "../entities/player"
import { createButterPat, createGlutenBlob, createSyrupDripper, createMilkCartonGuard } from "../entities/enemies"
import { createNinjaPowerup, createSequin, createWeaponPickup, createRibbon } from "../entities/pickups"
import { hitPlayer } from "../components/health"
import { edgeFlash, popText } from "../components/effects"
import { playStomp, getStompChain, resetStompChain } from "../components/audio"
import type { LevelData, PlatformData, EnemySpawn, PickupSpawn, DestructibleData, CheckpointData } from "./level1"

function spawnPlatform(p: PlatformData) {
  if (p.type === "swing") {
    const plat = add([
      rect(p.width, p.height, { radius: 3 }),
      pos(p.x, p.y),
      area(),
      body({ isStatic: true }),
      color(139, 94, 160),
      "platform",
      "swing",
      {
        originX: p.x,
        swingRange: p.swingRange ?? PLATFORM.SWING_DEFAULT_RANGE,
        swingSpeed: p.swingSpeed ?? PLATFORM.SWING_DEFAULT_SPEED,
        elapsed: 0,
      },
    ])
    // Gold top edge
    plat.add([
      rect(p.width, 3),
      pos(0, 0),
      color(255, 220, 100),
    ])
    // Chain/rope visual above platform
    plat.add([
      rect(4, 40),
      pos(p.width / 2 - 2, -40),
      color(60, 60, 60),
      z(-1),
    ])
    return plat
  }

  if (p.type === "one-way") {
    // Glow behind one-way too
    add([
      rect(p.width + 4, 4),
      pos(p.x - 2, p.y - 2),
      color(180, 255, 180),
      opacity(0.3),
      z(-1),
    ])
    const plat = add([
      rect(p.width, p.height, { radius: 2 }),
      pos(p.x, p.y),
      area(),
      body({ isStatic: true }),
      color(91, 140, 90),
      opacity(0.85),
      "platform",
      "one-way",
    ])
    // Dashed gold line on top — same visual language as solid platforms
    const dashW = 8
    const gap = 12
    for (let dx = 4; dx < p.width - dashW; dx += gap) {
      plat.add([
        rect(dashW, 3),
        pos(dx, 0),
        color(255, 220, 100),
        opacity(0.8),
      ])
    }
    // Grain lines
    const grainOffsets = [0.35, 0.65]
    for (let g = 0; g < grainOffsets.length; g++) {
      const gw = p.width * 0.6
      const gx = (g % 2 === 0) ? p.width * 0.1 : p.width * 0.25
      plat.add([
        rect(gw, 1),
        pos(gx, p.height * grainOffsets[g]),
        color(80, 125, 78),
        opacity(0.25),
      ])
    }
    return plat
  }

  if (p.type === "bouncy") {
    const plat = add([
      rect(p.width, p.height, { radius: 4 }),
      pos(p.x, p.y),
      area(),
      body({ isStatic: true }),
      color(232, 134, 58),
      "platform",
      "bouncy",
    ])
    // Bright gold top edge
    plat.add([
      rect(p.width, 3),
      pos(0, 0),
      color(255, 220, 100),
    ])
    // Pulsing glow behind platform
    const glow = plat.add([
      rect(p.width + 6, p.height + 6),
      pos(-3, -3),
      color(255, 200, 50),
      opacity(0.25),
      z(-1),
    ])
    glow.onUpdate(() => {
      glow.opacity = 0.2 + Math.sin(time() * 4) * 0.15
    })
    return plat
  }

  // solid — wood plank effect with bright gold top edge so it reads
  // as "standable" against similarly-colored background elements.
  // Glow strip behind the platform adds separation from the parallax.
  add([
    rect(p.width + 4, 4),
    pos(p.x - 2, p.y - 2),
    color(255, 220, 100),
    opacity(0.35),
    z(-1),
  ])
  const plat = add([
    rect(p.width, p.height, { radius: 3 }),
    pos(p.x, p.y),
    area(),
    body({ isStatic: true }),
    color(139, 99, 64),
    "platform",
    "solid",
  ])
  // Bright gold top edge — the universal "you can stand here" signal
  plat.add([
    rect(p.width, 3),
    pos(0, 0),
    color(255, 220, 100),
  ])
  // Shadow strip on bottom
  plat.add([
    rect(p.width, 2),
    pos(0, p.height - 2),
    color(90, 61, 40),
  ])
  // Wood grain lines
  const grainYs = [0.15, 0.35, 0.55, 0.75]
  const grainXOffsets = [0.05, 0.18, 0.08, 0.22]
  for (let g = 0; g < grainYs.length; g++) {
    const gw = p.width * 0.7
    plat.add([
      rect(gw, 1),
      pos(p.width * grainXOffsets[g], p.height * grainYs[g]),
      color(g % 2 === 0 ? 155 : 120, g % 2 === 0 ? 112 : 85, g % 2 === 0 ? 74 : 55),
      opacity(g % 2 === 0 ? 0.25 : 0.2),
    ])
  }
  return plat
}

function addParallaxLayers() {
  const IMG_W = 1792
  const IMG_H = 1024
  const viewH = SCREEN.HEIGHT
  const scaleY = viewH / IMG_H
  const scaledW = IMG_W * scaleY
  const tilesNeeded = Math.ceil(SCREEN.WIDTH / scaledW) + 2

  const layers: { name: string; scrollFactor: number; z: number }[] = [
    { name: "bg-far", scrollFactor: 0.1, z: -100 },
    { name: "bg-mid", scrollFactor: 0.3, z: -90 },
    { name: "bg-near", scrollFactor: 0.6, z: -80 },
  ]

  for (const layer of layers) {
    const tiles: { posX: (x: number) => void }[] = []
    for (let i = 0; i < tilesNeeded; i++) {
      const tile = add([
        sprite(layer.name),
        pos(i * scaledW, 0),
        scale(scaleY),
        z(layer.z),
        fixed(),
        opacity(layer.name.includes("near") ? 0.4 : 1),
      ])
      tiles.push({ posX: (x: number) => { tile.pos.x = x } })
    }

    const factor = layer.scrollFactor
    onUpdate(() => {
      const camX = getCamPos().x
      const offset = -(camX * factor) % scaledW
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].posX(offset + i * scaledW)
      }
    })
  }
}

export default function loadLevel(levelData: LevelData, levelId: string = "level1") {
  addParallaxLayers()

  if (levelData.bgTint) {
    add([
      rect(width(), height()),
      pos(0, 0),
      color(levelData.bgTint[0], levelData.bgTint[1], levelData.bgTint[2]),
      opacity(0.15),
      fixed(),
      z(-75),
    ])
  }

  const platforms: any[] = []

  for (const p of levelData.platforms) {
    platforms.push(spawnPlatform(p))
  }

  const player = createPlayer(levelData.playerSpawn.x, levelData.playerSpawn.y)

  // Active respawn point — updated when the player touches a checkpoint.
  const currentSpawn = { x: levelData.playerSpawn.x, y: levelData.playerSpawn.y }

  // Spawn checkpoint flags. A flag is a tall pole with a banner that turns
  // gold once activated. Touching it updates currentSpawn and plays a pop.
  if (levelData.checkpoints) {
    for (const cp of levelData.checkpoints) {
      spawnCheckpoint(cp, currentSpawn)
    }
  }

  // One-way platform logic: disable collision when player is clearly below
  player.onBeforePhysicsResolve((col: any) => {
    if (col.target.is("one-way")) {
      // Only collide from above: player must be moving down and feet above/near platform top
      // player anchor is "bot", so player.pos.y is the bottom (feet)
      // Use velocity check + generous tolerance to prevent tunneling and false passes
      if (player.vel.y < 0 || player.pos.y > col.target.pos.y + 10) {
        col.preventResolution()
      }
    }
  })

  // Bouncy platform: launch player upward on land
  player.onCollide("bouncy", (_plat: any, col: any) => {
    if (col.isBottom()) {
      player.jump(PLATFORM.BOUNCY_FORCE)
    }
  })

  // Swing platform update
  onUpdate("swing", (s: any) => {
    s.elapsed += dt()
    s.pos.x = s.originX + Math.sin(s.elapsed * s.swingSpeed) * s.swingRange
  })

  // Camera follow — clamp both X and Y so the camera never shows empty
  // void below the level floor
  const halfW = SCREEN.WIDTH / 2
  const halfH = SCREEN.HEIGHT / 2
  const minCamX = halfW
  const maxCamX = levelData.width - halfW
  const maxCamY = halfH // camera never drops below its default resting y

  onUpdate(() => {
    const targetX = Math.max(minCamX, Math.min(maxCamX, player.pos.x))
    const targetY = Math.min(
      maxCamY,
      Math.max(halfH, player.pos.y + CAMERA.VERTICAL_OFFSET),
    )

    const cp = getCamPos()
    setCamPos(
      lerp(cp.x, targetX, CAMERA.LERP_SPEED),
      lerp(cp.y, targetY, CAMERA.VERTICAL_LERP),
    )
  })

  // Kill zone: fall below the visible playfield → lose a life and respawn
  // Also clamp horizontal position to level bounds so player can't walk
  // off the left or right edge.
  player.onUpdate(() => {
    if (player.pos.y > SCREEN.HEIGHT + 60) {
      // Void fall: teleport out of the kill zone first so this handler
      // cannot re-fire on subsequent frames while the death animation
      // plays, then force-respawn bypassing invincibility/state checks so
      // a dash-clip or lingering invincible flag can't trap the player.
      // Respawn at the active checkpoint, not the level start.
      player.pos.x = currentSpawn.x
      player.pos.y = currentSpawn.y
      player.vel.x = 0
      player.vel.y = 0
      hitPlayer(player, currentSpawn.x, currentSpawn.y, levelId, true)
      return
    }
    // Horizontal bounds
    if (player.pos.x < 16) {
      player.pos.x = 16
      if (player.vel.x < 0) player.vel.x = 0
    } else if (player.pos.x > levelData.width - 16) {
      player.pos.x = levelData.width - 16
      if (player.vel.x > 0) player.vel.x = 0
    }
  })

  // Spawn enemies
  const enemies: any[] = []
  if (levelData.enemies) {
    for (const e of levelData.enemies) {
      enemies.push(spawnEnemy(e))
    }
  }

  // Spawn pickups
  if (levelData.pickups) {
    for (const p of levelData.pickups) {
      spawnPickup(p)
    }
  }

  // Spawn destructibles
  if (levelData.destructibles) {
    for (const d of levelData.destructibles) {
      spawnDestructible(d)
    }
  }

  // Goal marker at end of level — pole + waving flag + sparkles
  const goalX = levelData.width - 200
  const goalY = SCREEN.HEIGHT - 48
  const pole = add([
    rect(6, 80),
    pos(goalX, goalY),
    anchor("bot"),
    color(90, 61, 40),
    area(),
    "goal",
  ])
  // Flag at top of pole
  const flag = pole.add([
    rect(30, 20),
    pos(3, -80),
    color(255, 215, 0),
    anchor("left"),
    rotate(0),
  ])
  flag.onUpdate(() => {
    flag.angle = Math.sin(time() * 3) * 10
  })
  // Sparkle particles
  let sparkleTimer = 0
  pole.onUpdate(() => {
    sparkleTimer += dt()
    if (sparkleTimer >= 0.5) {
      sparkleTimer -= 0.5
      const sp = add([
        rect(4, 4),
        pos(goalX + rand(-20, 30), goalY - 80 + rand(-15, 15)),
        color(255, 215, 0),
        opacity(1),
        lifespan(0.5, { fade: 0.5 }),
        z(10),
      ])
    }
  })

  // Player-enemy collision — clear rules:
  //   1. Attacking (spin/dash/whip) → always kill the enemy
  //   2. Falling onto enemy from above → stomp (kill + bounce)
  //   3. Invincible (post-hit frames) → no interaction
  //   4. Otherwise → player takes damage
  const killEnemy = (e: any, fromDir: number) => {
    if (e.hurt?.length >= 2) e.hurt(99, fromDir)
    else e.hurt?.(99)
  }
  player.onCollide("enemy", (e: any, col: any) => {
    // Attacking states always kill on contact. Also honor a 0.25s attack
    // input buffer so a kid who pressed Z/X/C a frame too late still wins
    // the race vs. contact damage.
    const ATTACK_BUFFER = 0.25
    const recentAttack = player.lastAttackPressTime > 0
      && time() - player.lastAttackPressTime < ATTACK_BUFFER
    if (
      player.state === "spin" ||
      player.state === "dash" ||
      player.state === "whip" ||
      recentAttack
    ) {
      const fromDir = player.pos.x < e.pos.x ? -1 : 1
      killEnemy(e, fromDir)
      return
    }
    // Post-hit invincibility — no damage, no kill
    if (player.isInvincible) return
    // Stomp detection: player must be ABOVE the enemy (position-based
    // check rules out horizontal walk-in), AND either moving downward OR
    // Kaplay reports the collision on the player's bottom edge.
    const clearlyAbove = player.pos.y < e.pos.y - 4
    const fallingVel = player.vel.y > 10
    const stompByCol = col && typeof col.isBottom === "function" && col.isBottom()
    const stomp = clearlyAbove && (fallingVel || stompByCol)
    if (stomp) {
      // Scale the bounce up with consecutive aerial stomps — reward
      // chains the way Mario does.
      const chain = getStompChain()
      const bounce = PICKUP.STOMP_BOUNCE * (1 + Math.min(chain, 5) * 0.08)
      player.jump(bounce)
      playStomp()
      killEnemy(e, 0) // fromDir=0 signals stomp (bypasses shields)
      edgeFlash(120, 255, 120) // green = safe kill
      const chainText = chain > 0 ? `STOMP x${chain + 1}!` : "STOMP!"
      const chainColor: [number, number, number] = chain >= 3
        ? [255, 215, 0]
        : chain > 0 ? [255, 180, 80] : [120, 255, 120]
      popText(e.pos.x, e.pos.y - 30, chainText, chainColor, 22 + Math.min(chain, 5) * 2)
      return
    }
    // Otherwise take damage
    edgeFlash(255, 60, 60) // red = took damage
    popText(player.pos.x, player.pos.y - 40, "OUCH!", [255, 100, 100], 22)
    hitPlayer(player, currentSpawn.x, currentSpawn.y)
  })

  // Slippery patch effect: active while overlapping
  ;(player as any).onCollideUpdate("slippery", () => {
    player.isSlippery = true
  })
  ;(player as any).onCollideEnd("slippery", () => {
    player.isSlippery = false
  })

  // Syrup puddle effect: active while overlapping
  ;(player as any).onCollideUpdate("syrup-puddle", () => {
    (player as any).isSyrupy = true
  })
  ;(player as any).onCollideEnd("syrup-puddle", () => {
    (player as any).isSyrupy = false
  })

  // Vignette overlay for cinematic framing
  for (let i = 0; i < 4; i++) {
    add([
      rect(width(), height() * 0.05),
      pos(0, i * height() * 0.05),
      color(0, 0, 0),
      opacity(0.12 - i * 0.03),
      fixed(),
      z(80),
    ])
  }
  for (let i = 0; i < 4; i++) {
    add([
      rect(width(), height() * 0.05),
      pos(0, height() - (i + 1) * height() * 0.05),
      color(0, 0, 0),
      opacity(0.12 - i * 0.03),
      fixed(),
      z(80),
    ])
  }

  return { player, platforms, enemies }
}

function spawnEnemy(e: EnemySpawn) {
  switch (e.type) {
    case "butterPat": return createButterPat(e.x, e.y, e.patrolRange)
    case "glutenBlob": return createGlutenBlob(e.x, e.y)
    case "syrupDripper": return createSyrupDripper(e.x, e.y)
    case "milkCarton": return createMilkCartonGuard(e.x, e.y, e.patrolRange)
  }
}

function spawnPickup(p: PickupSpawn) {
  switch (p.type) {
    case "ninjaPowerup": return createNinjaPowerup(p.x, p.y)
    case "sequin": return createSequin(p.x, p.y)
    case "ribbon": return createRibbon(p.x, p.y)
    case "katana": return createWeaponPickup(p.x, p.y, "katana")
    case "sais": return createWeaponPickup(p.x, p.y, "sais")
  }
}

function spawnCheckpoint(cp: CheckpointData, currentSpawn: { x: number; y: number }) {
  // Pole
  const pole = add([
    rect(6, 90),
    pos(cp.x, cp.y),
    // Generous hitbox: 80 wide x 160 tall, centered on the pole, so a
    // jumping player mid-arc still intersects even when their feet clear
    // the pole base.
    area({ shape: new Rect(vec2(-40, -160), 80, 160) }),
    anchor("bot"),
    color(80, 80, 100),
    "checkpoint",
    { activated: false },
  ])
  // Banner — starts gray, turns gold on activation
  const banner = pole.add([
    rect(28, 18, { radius: 2 }),
    pos(3, -82),
    color(160, 160, 170),
    anchor("left"),
    rotate(0),
  ])
  // Gentle wave
  banner.onUpdate(() => {
    banner.angle = Math.sin(time() * 2.5) * 6
  })

  pole.onCollide("player", () => {
    if (pole.activated) return
    pole.activated = true
    banner.color = rgb(255, 215, 0)
    currentSpawn.x = cp.x
    currentSpawn.y = cp.y
    popText(cp.x, cp.y - 110, "CHECKPOINT!", [255, 215, 0], 22)
    // Sparkle burst
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const spd = 80 + Math.random() * 40
      const sp = add([
        circle(2),
        pos(cp.x, cp.y - 80),
        color(255, 215, 0),
        opacity(1),
        z(60),
      ])
      let age = 0
      sp.onUpdate(() => {
        age += dt()
        sp.pos.x += Math.cos(angle) * spd * dt()
        sp.pos.y += Math.sin(angle) * spd * dt()
        sp.opacity = Math.max(0, 1 - age * 2.5)
        if (sp.opacity <= 0) destroy(sp)
      })
    }
  })
}

function spawnDestructible(d: DestructibleData) {
  const block = add([
    rect(d.width, d.height),
    pos(d.x, d.y),
    area(),
    body({ isStatic: true }),
    anchor("bot"),
    color(DESTRUCTIBLE.COLOR[0], DESTRUCTIBLE.COLOR[1], DESTRUCTIBLE.COLOR[2]),
    "destructible",
  ])
  // Crack lines to suggest breakability
  const crackColor = [
    Math.max(0, DESTRUCTIBLE.COLOR[0] - 30),
    Math.max(0, DESTRUCTIBLE.COLOR[1] - 30),
    Math.max(0, DESTRUCTIBLE.COLOR[2] - 20),
  ]
  const crackPositions = [0.25, 0.5, 0.75]
  for (const frac of crackPositions) {
    const crackW = d.width * 0.4
    const offsetX = (d.width - crackW) * (frac < 0.5 ? 0.1 : 0.5)
    block.add([
      rect(crackW, 1),
      pos(offsetX, -d.height * frac),
      color(crackColor[0], crackColor[1], crackColor[2]),
    ])
  }
}
