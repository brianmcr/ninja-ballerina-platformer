import { SCREEN, PLATFORM, CAMERA, ENEMY, PICKUP, DESTRUCTIBLE } from "../config"
import createPlayer from "../entities/player"
import { createButterPat, createGlutenBlob, createSyrupDripper, createMilkCartonGuard } from "../entities/enemies"
import { createNinjaPowerup, createSequin, createWeaponPickup } from "../entities/pickups"
import { hitPlayer } from "../components/health"
import type { LevelData, PlatformData, EnemySpawn, PickupSpawn, DestructibleData } from "./level1"

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

  // Kill zone: falling off costs a life
  player.onUpdate(() => {
    if (player.pos.y > SCREEN.HEIGHT + 200) {
      hitPlayer(player, levelData.playerSpawn.x, levelData.playerSpawn.y)
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

  // Player-enemy collision: stomp or take damage
  player.onCollide("enemy", (e: any, col: any) => {
    // Stomp: player is falling and lands on top of enemy
    if (player.vel.y > 0 && col.isBottom()) {
      player.jump(PICKUP.STOMP_BOUNCE)
      const fromDir = player.pos.x < e.pos.x ? -1 : 1
      if (e.hurt?.length >= 2) {
        e.hurt(1, fromDir)
      } else {
        e.hurt?.(1)
      }
      return
    }
    // Otherwise take damage
    hitPlayer(player, levelData.playerSpawn.x, levelData.playerSpawn.y)
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
    case "katana": return createWeaponPickup(p.x, p.y, "katana")
    case "sais": return createWeaponPickup(p.x, p.y, "sais")
  }
}

function spawnDestructible(d: DestructibleData) {
  add([
    rect(d.width, d.height),
    pos(d.x, d.y),
    area(),
    body({ isStatic: true }),
    anchor("bot"),
    color(DESTRUCTIBLE.COLOR[0], DESTRUCTIBLE.COLOR[1], DESTRUCTIBLE.COLOR[2]),
    "destructible",
  ])
}
