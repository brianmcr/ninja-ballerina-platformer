import { BOSS, SCREEN, ENEMY } from "../config"
import { hitPlayer } from "../components/health"
import { createButterPat } from "./enemies"
import { shakeOnBossPhase, screenShake, flashWhite, enemyDefeatPop } from "../components/effects"

export function createSoggyWaffle(x: number, y: number) {
  const boss = add([
    rect(BOSS.WIDTH, BOSS.HEIGHT),
    pos(x, y),
    area(),
    body(),
    anchor("bot"),
    color(BOSS.COLOR[0], BOSS.COLOR[1], BOSS.COLOR[2]),
    opacity(1),
    "enemy",
    "boss",
    "soggyWaffle",
    {
      hp: BOSS.TOTAL_HP as number,
      phase: 1,
      isInvincible: false,
      dir: 1,
      hurt(dmg: number) {
        if (boss.isInvincible) return
        boss.hp -= dmg
        // Flash white on hit
        boss.color = rgb(255, 255, 255)
        wait(0.1, () => {
          if (boss.exists()) boss.color = rgb(BOSS.COLOR[0], BOSS.COLOR[1], BOSS.COLOR[2])
        })
      },
    },
  ])

  // Headband stripe (visual child positioned relative to boss)
  const headband = add([
    rect(BOSS.WIDTH, 10),
    pos(x, y - BOSS.HEIGHT + 8),
    anchor("bot"),
    color(BOSS.HEADBAND_COLOR[0], BOSS.HEADBAND_COLOR[1], BOSS.HEADBAND_COLOR[2]),
    z(1),
  ])

  headband.onUpdate(() => {
    if (!boss.exists()) { destroy(headband); return }
    headband.pos.x = boss.pos.x
    headband.pos.y = boss.pos.y - BOSS.HEIGHT + 8
  })

  return boss
}

export function runBossFight(player: any, spawnX: number, spawnY: number) {
  const FLOOR_Y = SCREEN.HEIGHT - 48
  const arenaW = BOSS.ARENA_WIDTH

  const boss = createSoggyWaffle(arenaW - 300, FLOOR_Y - 10)

  let phase = 1
  let phaseHits = 0
  let bombTimer: number = BOSS.SYRUP_BOMB_INTERVAL
  let tauntTimer = BOSS.TAUNT_INTERVAL
  let transitioning = false
  let defeated = false
  const summonedEnemies: any[] = []
  let summonTimer = 5
  let floodOverlay: any = null
  let tauntLabel: any = null

  // Boss health bar UI
  const barBg = add([
    rect(400, 20),
    pos(SCREEN.WIDTH / 2, 30),
    anchor("center"),
    color(60, 60, 60),
    fixed(),
    z(100),
  ])

  const barFill = add([
    rect(400, 20),
    pos(SCREEN.WIDTH / 2 - 200, 20),
    anchor("topleft"),
    color(220, 40, 40),
    fixed(),
    z(101),
  ])

  const bossLabel = add([
    text("Soggy Waffle", { size: 18 }),
    pos(SCREEN.WIDTH / 2, 14),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(102),
  ])

  const phaseLabel = add([
    text("Phase 1", { size: 14 }),
    pos(SCREEN.WIDTH / 2, 52),
    anchor("center"),
    color(200, 200, 200),
    fixed(),
    z(102),
  ])

  function updateHealthBar() {
    const ratio = Math.max(0, boss.hp / BOSS.TOTAL_HP)
    barFill.width = 400 * ratio
  }

  // Platform positions for Phase 2 teleportation
  const platformSpots = [
    { x: 400, y: FLOOR_Y - 200 - 10 },
    { x: 800, y: FLOOR_Y - 320 - 10 },
    { x: 1200, y: FLOOR_Y - 200 - 10 },
  ]
  let currentPlatIndex = 1 // start at center (highest)

  function showPhaseText(txt: string) {
    const label = add([
      text(txt, { size: 48 }),
      pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2),
      anchor("center"),
      color(255, 255, 100),
      fixed(),
      z(200),
    ])
    wait(1.5, () => { if (label.exists()) destroy(label) })
  }

  function showTaunt(msg: string) {
    if (tauntLabel && tauntLabel.exists()) destroy(tauntLabel)
    tauntLabel = add([
      text(msg, { size: 16 }),
      pos(boss.pos.x, boss.pos.y - BOSS.HEIGHT - 20),
      anchor("center"),
      color(255, 200, 100),
      z(50),
    ])
    wait(2, () => { if (tauntLabel && tauntLabel.exists()) destroy(tauntLabel) })
  }

  function transitionToPhase(newPhase: number) {
    transitioning = true
    boss.isInvincible = true
    phase = newPhase
    boss.phase = newPhase
    phaseHits = 0

    // Flash boss
    let flashCount = 0
    const flashInterval = loop(0.1, () => {
      flashCount++
      boss.opacity = flashCount % 2 === 0 ? 1 : 0.3
      if (flashCount >= 15) {
        flashInterval.cancel()
        boss.opacity = 1
      }
    })

    shakeOnBossPhase()
    showPhaseText(`Phase ${newPhase}!`)
    phaseLabel.text = `Phase ${newPhase}`

    wait(BOSS.INVINCIBLE_DURATION, () => {
      boss.isInvincible = false
      transitioning = false

      if (newPhase === 2) setupPhase2()
      if (newPhase === 3) setupPhase3()
    })
  }

  function setupPhase2() {
    // Teleport boss to top center platform
    currentPlatIndex = 1
    boss.pos.x = platformSpots[1].x
    boss.pos.y = platformSpots[1].y
    boss.gravityScale = 0
    boss.vel.y = 0

    // Flood floor with syrup overlay
    floodOverlay = add([
      rect(arenaW, 12),
      pos(0, FLOOR_Y - 6),
      area(),
      color(BOSS.SYRUP_PUDDLE_COLOR[0], BOSS.SYRUP_PUDDLE_COLOR[1], BOSS.SYRUP_PUDDLE_COLOR[2]),
      opacity(0.5),
      "syrup-puddle",
      "boss-syrup-flood",
    ])
  }

  function setupPhase3() {
    // Drop boss back to floor
    boss.gravityScale = 1
    boss.pos.x = arenaW / 2
    boss.pos.y = FLOOR_Y - 100

    // Remove flood
    if (floodOverlay && floodOverlay.exists()) destroy(floodOverlay)

    // Clean up summoned enemies
    for (const e of summonedEnemies) {
      if (e.exists()) destroy(e)
    }
  }

  function throwSyrupBomb() {
    if (!boss.exists() || transitioning || defeated) return
    const bx = boss.pos.x
    const by = boss.pos.y - BOSS.HEIGHT / 2

    const dx = player.pos.x - bx
    const dy = player.pos.y - by
    const dist = Math.sqrt(dx * dx + dy * dy)
    const speed = BOSS.SYRUP_BOMB_SPEED
    const vx = (dx / (dist || 1)) * speed
    const vy = -300 // arc upward

    const bomb = add([
      rect(BOSS.SYRUP_BOMB_SIZE, BOSS.SYRUP_BOMB_SIZE),
      pos(bx, by),
      area(),
      anchor("center"),
      color(BOSS.SYRUP_BOMB_COLOR[0], BOSS.SYRUP_BOMB_COLOR[1], BOSS.SYRUP_BOMB_COLOR[2]),
      "syrup-bomb",
      { vx, vy: vy },
    ])

    bomb.onUpdate(() => {
      (bomb as any).vy += 800 * dt()
      bomb.move(bomb.vx, (bomb as any).vy)

      // Hit the floor
      if (bomb.pos.y >= FLOOR_Y - 6) {
        const puddle = add([
          rect(BOSS.SYRUP_PUDDLE_WIDTH, 8),
          pos(bomb.pos.x, FLOOR_Y),
          area(),
          anchor("bot"),
          color(BOSS.SYRUP_PUDDLE_COLOR[0], BOSS.SYRUP_PUDDLE_COLOR[1], BOSS.SYRUP_PUDDLE_COLOR[2]),
          opacity(0.6),
          "syrup-puddle",
        ])
        wait(5, () => { if (puddle.exists()) destroy(puddle) })
        destroy(bomb)
      }

      // Off-screen cleanup
      if (bomb.pos.y > SCREEN.HEIGHT + 100 || bomb.pos.x < -100 || bomb.pos.x > arenaW + 100) {
        destroy(bomb)
      }
    })

    bomb.onCollide("player", (p: any) => {
      hitPlayer(p, spawnX, spawnY)
      destroy(bomb)
    })
  }

  function throwGlutenBlob() {
    if (!boss.exists() || transitioning || defeated) return
    const bx = boss.pos.x
    const by = boss.pos.y - BOSS.HEIGHT / 2

    const dx = player.pos.x - bx
    const dy = player.pos.y - by
    const dist = Math.sqrt(dx * dx + dy * dy)
    const speed = BOSS.GLUTEN_BLOB_SPEED
    const vx = (dx / (dist || 1)) * speed
    const vy = (dy / (dist || 1)) * speed

    const blob = add([
      rect(BOSS.GLUTEN_BLOB_SIZE, BOSS.GLUTEN_BLOB_SIZE),
      pos(bx, by),
      area(),
      anchor("center"),
      color(BOSS.GLUTEN_BLOB_COLOR[0], BOSS.GLUTEN_BLOB_COLOR[1], BOSS.GLUTEN_BLOB_COLOR[2]),
      "gluten-projectile",
      { vx, vy, stuck: false },
    ])

    blob.onUpdate(() => {
      if (blob.stuck) return
      blob.move(blob.vx, blob.vy)

      if (blob.pos.y > SCREEN.HEIGHT + 100 || blob.pos.x < -100 || blob.pos.x > arenaW + 100) {
        destroy(blob)
      }
    })

    blob.onCollide("platform", () => {
      blob.stuck = true
      blob.vx = 0
      blob.vy = 0
      wait(4, () => { if (blob.exists()) destroy(blob) })
    })

    blob.onCollide("player", (p: any) => {
      hitPlayer(p, spawnX, spawnY)
      destroy(blob)
    })
  }

  function summonButterPats() {
    if (!boss.exists() || transitioning || defeated) return
    const e1 = createButterPat(400, FLOOR_Y, 150)
    const e2 = createButterPat(1200, FLOOR_Y, 150)
    summonedEnemies.push(e1, e2)
  }

  function teleportBoss() {
    // Move to a different platform
    let newIdx = (currentPlatIndex + 1) % platformSpots.length
    if (newIdx === currentPlatIndex) newIdx = (newIdx + 1) % platformSpots.length
    currentPlatIndex = newIdx
    const spot = platformSpots[currentPlatIndex]
    boss.pos.x = spot.x
    boss.pos.y = spot.y
    boss.vel.y = 0
  }

  function victory() {
    defeated = true
    boss.isInvincible = true
    screenShake(12, 0.5)
    enemyDefeatPop(boss.pos.x, boss.pos.y - BOSS.HEIGHT / 2)

    // Shrink and fade
    let shrinkTimer = 0
    boss.onUpdate(() => {
      shrinkTimer += dt()
      boss.opacity = Math.max(0, 1 - shrinkTimer / 2)
      const s = Math.max(0.1, 1 - shrinkTimer / 2)
      boss.width = BOSS.WIDTH * s
      boss.height = BOSS.HEIGHT * s
    })

    const victoryText = add([
      text("Golden Ballet Slippers Recovered!", { size: 32 }),
      pos(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2),
      anchor("center"),
      color(255, 215, 0),
      fixed(),
      z(200),
    ])

    wait(3, () => {
      // Clean up UI
      if (barBg.exists()) destroy(barBg)
      if (barFill.exists()) destroy(barFill)
      if (bossLabel.exists()) destroy(bossLabel)
      if (phaseLabel.exists()) destroy(phaseLabel)
      if (victoryText.exists()) destroy(victoryText)
      if (boss.exists()) destroy(boss)
      if (floodOverlay && floodOverlay.exists()) destroy(floodOverlay)
      go("victory")
    })
  }

  // Player attacks hitting boss
  player.onCollide("boss", (_b: any, col: any) => {
    if (defeated || transitioning || boss.isInvincible) return
    // Stomp
    if (player.vel.y > 0 && col.isBottom()) {
      player.jump(400)
      boss.hurt(1)
      onBossHit()
      return
    }
    // Otherwise player takes damage
    hitPlayer(player, spawnX, spawnY)
  })

  // Weapon collisions with boss
  onCollide("shuriken-proj", "boss", (proj: any) => {
    if (defeated || transitioning || boss.isInvincible) return
    boss.hurt(1)
    destroy(proj)
    onBossHit()
  })

  onCollide("katana-hitbox", "boss", () => {
    if (defeated || transitioning || boss.isInvincible) return
    boss.hurt(1)
    onBossHit()
  })

  onCollide("sai-hitbox", "boss", () => {
    if (defeated || transitioning || boss.isInvincible) return
    boss.hurt(1)
    onBossHit()
  })

  onCollide("whip-hitbox", "boss", () => {
    if (defeated || transitioning || boss.isInvincible) return
    boss.hurt(1)
    onBossHit()
  })

  function onBossHit() {
    phaseHits++
    updateHealthBar()

    if (boss.hp <= 0) {
      victory()
      return
    }

    if (phaseHits >= BOSS.HITS_PER_PHASE) {
      if (phase === 1) transitionToPhase(2)
      else if (phase === 2) {
        transitionToPhase(3)
      } else if (phase === 3 && boss.hp > 0) {
        // shouldn't happen since 3 phases x 3 hits = 9 total HP, but just in case
        phaseHits = 0
      }
    }

    // Phase 2: teleport after each hit
    if (phase === 2 && !transitioning) {
      teleportBoss()
    }
  }

  // Main boss update loop
  const taunts = ["You can't reach me!", "Getting tired?", "Give up already!", "Too slow!"]
  let glutenTimer = 2

  onUpdate(() => {
    if (!boss.exists() || defeated) return

    updateHealthBar()

    if (transitioning) return

    if (phase === 1) {
      // Patrol back and forth
      boss.move(BOSS.SPEED * boss.dir, 0)
      if (boss.pos.x > arenaW - 100) boss.dir = -1
      if (boss.pos.x < 100) boss.dir = 1

      // Throw syrup bombs
      bombTimer -= dt()
      if (bombTimer <= 0) {
        bombTimer = BOSS.SYRUP_BOMB_INTERVAL
        throwSyrupBomb()
      }
    }

    if (phase === 2) {
      // Boss stays on platform, doesn't patrol
      boss.vel.y = 0

      // Summon butter pats periodically
      summonTimer -= dt()
      if (summonTimer <= 0) {
        summonTimer = 6
        summonButterPats()
      }

      // Taunts
      tauntTimer -= dt()
      if (tauntTimer <= 0) {
        tauntTimer = BOSS.TAUNT_INTERVAL
        const t = taunts[Math.floor(Math.random() * taunts.length)]
        showTaunt(t)
      }
    }

    if (phase === 3) {
      // Enraged: faster patrol
      const speed = BOSS.SPEED * BOSS.ENRAGED_SPEED_MULT
      boss.move(speed * boss.dir, 0)
      if (boss.pos.x > arenaW - 100) boss.dir = -1
      if (boss.pos.x < 100) boss.dir = 1

      // Faster syrup bombs
      bombTimer -= dt()
      if (bombTimer <= 0) {
        bombTimer = BOSS.SYRUP_BOMB_INTERVAL_ENRAGED
        throwSyrupBomb()
      }

      // Gluten blobs
      glutenTimer -= dt()
      if (glutenTimer <= 0) {
        glutenTimer = 2.5
        throwGlutenBlob()
      }
    }
  })

  return boss
}
