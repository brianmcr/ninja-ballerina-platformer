import { ENEMY } from "../config"
import { shakeOnEnemyDefeat, enemyDefeatPop, flashWhite, floatingText, enemyHitFlash, hitImpact } from "../components/effects"
import { playCoin, playHit } from "../components/audio"
import { createSequin } from "./pickups"

// Spawn 1-2 sequins above a defeated enemy — Mario's "kill → coin"
// feedback. They pop out with a brief upward tween before settling into
// the usual bob so the drop feels dynamic.
function spawnDropSequins(x: number, y: number, count: number = 1) {
  for (let i = 0; i < count; i++) {
    const offsetX = (Math.random() - 0.5) * 40
    const seq = createSequin(x + offsetX, y - 40) as any
    if (!seq) continue
    // Brief arc tween: sequin floats up then its bob animation takes over
    let t = 0
    const startY = y - 40
    const arcUpdate = onUpdate(() => {
      if (!seq.exists()) { arcUpdate.cancel(); return }
      t += dt()
      if (t >= 0.35) { arcUpdate.cancel(); return }
      const arc = -Math.sin(t / 0.35 * Math.PI) * 24
      seq.pos.y = startY + arc
    })
  }
}

const ENEMY_SCALE = 0.08

export function createButterPat(x: number, y: number, patrolRange = 100) {
  const e = ENEMY.BUTTER_PAT
  let hp = e.HP
  let dir = 1
  const spawnX = x

  const enemy = add([
    sprite("butter-pat"),
    scale(ENEMY_SCALE),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.WIDTH / ENEMY_SCALE, e.HEIGHT / ENEMY_SCALE) }),
    body(),
    anchor("bot"),
    rotate(0),
    "enemy",
    "butterPat",
    {
      hurt(dmg: number) {
        hp -= dmg
        if (hp <= 0) {
          hitImpact(enemy, dir)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y - e.HEIGHT / 2)
          playCoin()
          spawnDropSequins(enemy.pos.x, enemy.pos.y, 1)
          spawnSlipperyPatch(enemy.pos.x, enemy.pos.y)
          wait(0.18, () => { if (enemy.exists()) destroy(enemy) })
        }
      },
    },
  ])



  let warnCooldown = 0
  enemy.onUpdate(() => {
    enemy.move(e.SPEED * dir, 0)
    if (enemy.pos.x > spawnX + patrolRange) dir = -1
    if (enemy.pos.x < spawnX - patrolRange) dir = 1
    // Wobble animation
    enemy.angle = Math.sin(time() * 5) * 8
    enemy.scale = vec2(ENEMY_SCALE * (1 + Math.abs(Math.sin(time() * 5)) * 0.05))

    // Proximity warning
    warnCooldown -= dt()
    if (warnCooldown <= 0) {
      const players = get("player")
      if (players.length > 0) {
        const dist = enemy.pos.dist(players[0].pos)
        if (dist < 150) {
          warnCooldown = 2
          const warn = add([
            text("!", { size: 16, font: "Bangers" }),
            pos(enemy.pos.x, enemy.pos.y - e.HEIGHT - 10),
            anchor("center"),
            color(255, 50, 50),
            opacity(1),
            z(51),
          ])
          let wt = 0
          warn.onUpdate(() => {
            wt += dt()
            warn.pos.x = enemy.pos.x
            warn.pos.y = enemy.pos.y - e.HEIGHT - 10
            warn.opacity = Math.max(0, 1 - wt * 2)
            if (wt >= 0.5) destroy(warn)
          })
        }
      }
    }
  })

  return enemy
}

function spawnSlipperyPatch(x: number, y: number) {
  const e = ENEMY.BUTTER_PAT
  const patch = add([
    rect(40, 8),
    pos(x, y),
    area(),
    anchor("bot"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    opacity(0.5),
    "slippery",
  ])

  wait(e.SLIPPERY_DURATION, () => destroy(patch))
}

export function createGlutenBlob(x: number, y: number) {
  const e = ENEMY.GLUTEN_BLOB
  let hp = e.HP

  const enemy = add([
    sprite("gluten-blob"),
    scale(ENEMY_SCALE),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.SIZE / ENEMY_SCALE, e.SIZE / ENEMY_SCALE) }),
    body(),
    anchor("bot"),
    opacity(1),
    "enemy",
    "glutenBlob",
    {
      hurt(dmg: number) {
        hp -= dmg
        if (hp <= 0) {
          hitImpact(enemy, 0)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y - e.SIZE / 2)
          playCoin()
          spawnDropSequins(enemy.pos.x, enemy.pos.y, 2)
          wait(0.18, () => { if (enemy.exists()) destroy(enemy) })
        } else {
          playHit()
          enemy.opacity = 0.5
          wait(0.1, () => { if (enemy.exists()) enemy.opacity = 1 })
        }
      },
    },
  ])



  const glutenBaseScale = ENEMY_SCALE
  let hopTimer = 2.5
  let telegraphing = false
  let telegraphTimer = 0
  let telegraphOutline: any = null
  enemy.onUpdate(() => {
    // Breathing animation (only when not telegraphing)
    if (!telegraphing) {
      const breathe = Math.sin(time() * 3) * 0.08
      enemy.scale = vec2(glutenBaseScale * (1 + breathe), glutenBaseScale * (1 - breathe))
    }
    if (telegraphing) {
      telegraphTimer -= dt()
      const t = 1 - Math.max(0, telegraphTimer / 0.3)
      enemy.width = e.SIZE * (1 + t * 0.3)
      enemy.height = e.SIZE * (1 - t * 0.25)
      if (telegraphTimer <= 0) {
        telegraphing = false
        enemy.width = e.SIZE
        enemy.height = e.SIZE
        if (telegraphOutline) { telegraphOutline.destroy(); telegraphOutline = null }
        const players = get("player")
        if (players.length > 0) {
          const dir = players[0].pos.x > enemy.pos.x ? 1 : -1
          enemy.vel.x = dir * 80
          enemy.jump(200)
        }
      }
      return
    }
    hopTimer -= dt()
    if (hopTimer <= 0 && enemy.isGrounded()) {
      hopTimer = 2 + Math.random()
      telegraphing = true
      telegraphTimer = 0.5
      telegraphOutline = add([
        rect(e.SIZE + 8, e.SIZE + 8),
        pos(enemy.pos.x, enemy.pos.y),
        anchor("bot"),
        color(255, 0, 0),
        opacity(0.5),
        z(-1),
      ])
      telegraphOutline.onUpdate(() => {
        if (!enemy.exists()) { telegraphOutline.destroy(); telegraphOutline = null; return }
        telegraphOutline.pos.x = enemy.pos.x
        telegraphOutline.pos.y = enemy.pos.y
        telegraphOutline.opacity = 0.4 + 0.3 * Math.sin(time() * 8 * Math.PI * 2)
      })
    }
  })

  enemy.onCollide("player", (p: any) => {
    if (p.state !== "spin" && p.state !== "dash" && p.state !== "whip") {
      if (!p.isSticky) {
        p.isSticky = true
        wait(e.STICKY_DURATION, () => { p.isSticky = false })
      }
    }
  })

  return enemy
}

export function createSyrupDripper(x: number, y: number) {
  const e = ENEMY.SYRUP_DRIPPER
  let dropTimer = e.DROP_INTERVAL

  const enemy = add([
    sprite("syrup-dripper"),
    scale(ENEMY_SCALE),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.SIZE / ENEMY_SCALE, e.SIZE / ENEMY_SCALE) }),
    anchor("center"),
    opacity(1),
    "enemy",
    "syrupDripper",
    {
      hurt(_dmg: number, type?: string | number) {
        if (type === "ranged") {
          hitImpact(enemy, 0)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y)
          playCoin()
          spawnDropSequins(enemy.pos.x, enemy.pos.y, 1)
          wait(0.18, () => { if (enemy.exists()) destroy(enemy) })
        } else {
          playHit()
          floatingText(enemy.pos.x, enemy.pos.y - e.SIZE / 2, "Ranged only!", [255, 100, 100])
          const players = get("player")
          if (players.length > 0) {
            const p = players[0]
            const kb = p.pos.x < enemy.pos.x ? -1 : 1
            p.vel.x = kb * 300
          }
        }
      },
    },
  ])

  let telegraphing = false
  let growingDrip: any = null
  enemy.onUpdate(() => {
    // Dripping animation — scale only, no position drift
    enemy.scale = vec2(ENEMY_SCALE * (1 + Math.sin(time() * 2) * 0.05))

    dropTimer -= dt()
    if (dropTimer <= 0.5 && !telegraphing) {
      telegraphing = true
      let flashT = 0
      const flashEv = onUpdate(() => {
        flashT += dt()
        const pulse = Math.sin(flashT * 20) > 0
        if (enemy.exists()) {
          enemy.opacity = pulse ? 0.4 : 1
        }
        if (flashT >= 0.5 || !enemy.exists()) {
          if (enemy.exists()) enemy.opacity = 1
          flashEv.cancel()
        }
      })
      // Growing drip visual
      growingDrip = add([
        rect(4, 2),
        pos(enemy.pos.x, enemy.pos.y + e.SIZE / 2),
        anchor("top"),
        color(200, 140, 50),
        opacity(0.8),
        z(49),
      ])
      const dripStart = time()
      growingDrip.onUpdate(() => {
        if (!enemy.exists()) { growingDrip.destroy(); growingDrip = null; return }
        const elapsed = time() - dripStart
        const progress = Math.min(1, elapsed / 0.5)
        growingDrip.height = 2 + 18 * progress
        growingDrip.pos.x = enemy.pos.x
        growingDrip.pos.y = enemy.pos.y + e.SIZE / 2
      })
    }
    if (dropTimer <= 0) {
      dropTimer = e.DROP_INTERVAL
      telegraphing = false
      if (growingDrip) { growingDrip.destroy(); growingDrip = null }
      dropSyrup(enemy.pos.x, enemy.pos.y + e.SIZE / 2)
    }
  })

  return enemy
}

function dropSyrup(x: number, y: number) {
  const e = ENEMY.SYRUP_DRIPPER
  const drop = add([
    rect(8, 8),
    pos(x, y),
    area(),
    body(),
    anchor("center"),
    color(e.PUDDLE_COLOR[0], e.PUDDLE_COLOR[1], e.PUDDLE_COLOR[2]),
    "syrup-drop",
  ])

  drop.onGround(() => {
    const landPos = drop.pos.clone()
    destroy(drop)
    const puddle = add([
      rect(e.PUDDLE_SIZE, 6),
      pos(landPos.x, landPos.y),
      area(),
      anchor("bot"),
      color(e.PUDDLE_COLOR[0], e.PUDDLE_COLOR[1], e.PUDDLE_COLOR[2]),
      opacity(0.6),
      "syrup-puddle",
    ])
    wait(e.PUDDLE_DURATION, () => destroy(puddle))
  })
}

export function createMilkCartonGuard(x: number, y: number, patrolRange = 100) {
  const e = ENEMY.MILK_CARTON
  let hp = e.HP
  let dir = 1
  let facing = 1
  const spawnX = x

  const enemy = add([
    sprite("milk-carton"),
    scale(ENEMY_SCALE),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.WIDTH / ENEMY_SCALE, e.HEIGHT / ENEMY_SCALE) }),
    body(),
    anchor("bot"),
    opacity(1),
    "enemy",
    "milkCarton",
    {
      get facing() { return facing },
      hurt(dmg: number, fromDir?: number) {
        // fromDir=0 means stomp from above — bypasses the shield
        if (fromDir !== undefined && fromDir !== 0 && fromDir === facing) {
          enemy.opacity = 0.5
          wait(0.15, () => {
            if (enemy.exists()) enemy.opacity = 1
          })
          // Shield flash on block
          const shield = add([
            rect(e.WIDTH, e.HEIGHT),
            pos(enemy.pos.x, enemy.pos.y),
            anchor("bot"),
            color(255, 255, 255),
            opacity(0.7),
            z(51),
          ])
          let st = 0
          shield.onUpdate(() => {
            st += dt()
            shield.opacity = Math.max(0, 0.7 * (1 - st / 0.2))
            if (st >= 0.2) destroy(shield)
          })
          return
        }
        hp -= dmg
        if (hp <= 0) {
          hitImpact(enemy, fromDir ?? 0)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y - e.HEIGHT / 2)
          playCoin()
          spawnDropSequins(enemy.pos.x, enemy.pos.y, 2)
          wait(0.18, () => { if (enemy.exists()) destroy(enemy) })
        }
      },
    },
  ])

  enemy.onUpdate(() => {
    enemy.move(e.SPEED * dir, 0)
    facing = dir
    if (enemy.pos.x > spawnX + patrolRange) dir = -1
    if (enemy.pos.x < spawnX - patrolRange) dir = 1
    // Stiff marching animation — scale only, no position drift
    enemy.scale = vec2(ENEMY_SCALE * (1 + Math.abs(Math.sin(time() * 8)) * 0.06))
  })

  return enemy
}
