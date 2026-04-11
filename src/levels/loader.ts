import { SCREEN, PLATFORM, CAMERA, ENEMY } from "../config"
import createPlayer from "../entities/player"
import { createButterPat, createGlutenBlob, createSyrupDripper, createMilkCartonGuard } from "../entities/enemies"
import type { LevelData, PlatformData, EnemySpawn } from "./level1"

function spawnPlatform(p: PlatformData) {
  const colors: Record<PlatformData["type"], [number, number, number]> = {
    solid: [139, 90, 43],
    "one-way": [107, 142, 35],
    bouncy: [255, 140, 0],
    swing: [147, 112, 219],
  }

  const c = colors[p.type]

  if (p.type === "swing") {
    const plat = add([
      rect(p.width, p.height),
      pos(p.x, p.y),
      area(),
      body({ isStatic: true }),
      color(c[0], c[1], c[2]),
      "platform",
      "swing",
      {
        originX: p.x,
        swingRange: p.swingRange ?? PLATFORM.SWING_DEFAULT_RANGE,
        swingSpeed: p.swingSpeed ?? PLATFORM.SWING_DEFAULT_SPEED,
        elapsed: 0,
      },
    ])
    return plat
  }

  if (p.type === "one-way") {
    const plat = add([
      rect(p.width, p.height),
      pos(p.x, p.y),
      area(),
      body({ isStatic: true }),
      color(c[0], c[1], c[2]),
      "platform",
      "one-way",
    ])
    return plat
  }

  if (p.type === "bouncy") {
    const plat = add([
      rect(p.width, p.height),
      pos(p.x, p.y),
      area(),
      body({ isStatic: true }),
      color(c[0], c[1], c[2]),
      "platform",
      "bouncy",
    ])
    return plat
  }

  // solid
  const plat = add([
    rect(p.width, p.height),
    pos(p.x, p.y),
    area(),
    body({ isStatic: true }),
    color(c[0], c[1], c[2]),
    "platform",
    "solid",
  ])
  return plat
}

export default function loadLevel(levelData: LevelData) {
  const platforms: any[] = []

  for (const p of levelData.platforms) {
    platforms.push(spawnPlatform(p))
  }

  const player = createPlayer(levelData.playerSpawn.x, levelData.playerSpawn.y)

  // One-way platform logic: disable collision when player is below
  player.onBeforePhysicsResolve((col: any) => {
    if (col.target.is("one-way")) {
      // Only collide if player bottom was above platform top before collision
      // player anchor is "bot", so player.pos.y is the bottom
      if (player.pos.y > col.target.pos.y + 2) {
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

  // Camera follow
  const halfW = SCREEN.WIDTH / 2
  const halfH = SCREEN.HEIGHT / 2
  const minCamX = halfW
  const maxCamX = levelData.width - halfW

  onUpdate(() => {
    const targetX = Math.max(minCamX, Math.min(maxCamX, player.pos.x))
    const targetY = Math.max(halfH, player.pos.y + CAMERA.VERTICAL_OFFSET)

    const cp = getCamPos()
    setCamPos(
      lerp(cp.x, targetX, CAMERA.LERP_SPEED),
      lerp(cp.y, targetY, CAMERA.VERTICAL_LERP),
    )
  })

  // Kill zone: reset player if they fall off
  player.onUpdate(() => {
    if (player.pos.y > SCREEN.HEIGHT + 200) {
      player.pos.x = levelData.playerSpawn.x
      player.pos.y = levelData.playerSpawn.y
      player.vel.x = 0
      player.vel.y = 0
    }
  })

  // Spawn enemies
  const enemies: any[] = []
  if (levelData.enemies) {
    for (const e of levelData.enemies) {
      enemies.push(spawnEnemy(e))
    }
  }

  // Player-enemy collision (placeholder until hit system in Step 5)
  player.onCollide("enemy", (_e: any) => {
    if (player.state !== "spin" && player.state !== "dash" && player.state !== "whip" && !player.isInvincible) {
      debug.log("Player hit!")
    }
  })

  // Slippery patch effect
  player.onCollide("slippery", () => {
    if (!(player as any).isSlippery) {
      (player as any).isSlippery = true
      wait(0.5, () => { (player as any).isSlippery = false })
    }
  })

  // Syrup puddle effect
  player.onCollide("syrup-puddle", () => {
    if (!(player as any).isSticky) {
      (player as any).isSticky = true
      wait(0.5, () => { (player as any).isSticky = false })
    }
  })

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
