import { ENEMY } from "../config"
import { shakeOnEnemyDefeat, enemyDefeatPop, flashWhite, floatingText } from "../components/effects"
import { playCoin, playHit } from "../components/audio"

export function createButterPat(x: number, y: number, patrolRange = 100) {
  const e = ENEMY.BUTTER_PAT
  let hp = e.HP
  let dir = 1
  const spawnX = x

  const enemy = add([
    sprite("butter-pat"),
    scale(e.WIDTH / 1024),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.WIDTH, e.HEIGHT) }),
    body(),
    anchor("bot"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    "enemy",
    "butterPat",
    {
      hurt(dmg: number) {
        hp -= dmg
        if (hp <= 0) {
          flashWhite(enemy, 0.08)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y - e.HEIGHT / 2)
          playCoin()
          spawnSlipperyPatch(enemy.pos.x, enemy.pos.y)
          wait(0.08, () => { if (enemy.exists()) destroy(enemy) })
        }
      },
    },
  ])

  enemy.onUpdate(() => {
    enemy.move(e.SPEED * dir, 0)
    if (enemy.pos.x > spawnX + patrolRange) dir = -1
    if (enemy.pos.x < spawnX - patrolRange) dir = 1
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
    scale(e.SIZE / 1024),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.SIZE, e.SIZE) }),
    body(),
    anchor("bot"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    "enemy",
    "glutenBlob",
    {
      hurt(dmg: number) {
        hp -= dmg
        if (hp <= 0) {
          flashWhite(enemy, 0.08)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y - e.SIZE / 2)
          playCoin()
          wait(0.08, () => { if (enemy.exists()) destroy(enemy) })
        } else {
          playHit()
          enemy.color = rgb(e.HIT_COLOR[0], e.HIT_COLOR[1], e.HIT_COLOR[2])
        }
      },
    },
  ])

  let hopTimer = 2.5
  let telegraphing = false
  let telegraphTimer = 0
  enemy.onUpdate(() => {
    if (telegraphing) {
      telegraphTimer -= dt()
      const t = 1 - Math.max(0, telegraphTimer / 0.3)
      enemy.width = e.SIZE * (1 + t * 0.3)
      enemy.height = e.SIZE * (1 - t * 0.25)
      if (telegraphTimer <= 0) {
        telegraphing = false
        enemy.width = e.SIZE
        enemy.height = e.SIZE
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
      telegraphTimer = 0.3
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
    scale(e.SIZE / 1024),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.SIZE, e.SIZE) }),
    anchor("center"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    "enemy",
    "syrupDripper",
    {
      hurt(_dmg: number, type?: string | number) {
        if (type === "ranged") {
          flashWhite(enemy, 0.08)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y)
          playCoin()
          wait(0.08, () => { if (enemy.exists()) destroy(enemy) })
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
  enemy.onUpdate(() => {
    dropTimer -= dt()
    if (dropTimer <= 0.5 && !telegraphing) {
      telegraphing = true
      const origR = e.COLOR[0]
      const origG = e.COLOR[1]
      const origB = e.COLOR[2]
      let flashT = 0
      const flashEv = onUpdate(() => {
        flashT += dt()
        const pulse = Math.sin(flashT * 20) > 0
        if (enemy.exists()) {
          enemy.color = pulse ? rgb(255, 100, 100) : rgb(origR, origG, origB)
        }
        if (flashT >= 0.5 || !enemy.exists()) {
          if (enemy.exists()) enemy.color = rgb(origR, origG, origB)
          flashEv.cancel()
        }
      })
    }
    if (dropTimer <= 0) {
      dropTimer = e.DROP_INTERVAL
      telegraphing = false
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
    scale(e.WIDTH / 1024),
    pos(x, y),
    area({ shape: new Rect(vec2(0), e.WIDTH, e.HEIGHT) }),
    body(),
    anchor("bot"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    "enemy",
    "milkCarton",
    {
      get facing() { return facing },
      hurt(dmg: number, fromDir?: number) {
        if (fromDir !== undefined && fromDir === facing) {
          enemy.color = rgb(e.SHIELD_COLOR[0], e.SHIELD_COLOR[1], e.SHIELD_COLOR[2])
          wait(0.15, () => {
            if (enemy.exists()) {
              enemy.color = rgb(e.COLOR[0], e.COLOR[1], e.COLOR[2])
            }
          })
          return
        }
        hp -= dmg
        if (hp <= 0) {
          flashWhite(enemy, 0.08)
          shakeOnEnemyDefeat()
          enemyDefeatPop(enemy.pos.x, enemy.pos.y - e.HEIGHT / 2)
          playCoin()
          wait(0.08, () => { if (enemy.exists()) destroy(enemy) })
        }
      },
    },
  ])

  enemy.onUpdate(() => {
    enemy.move(e.SPEED * dir, 0)
    facing = dir
    if (enemy.pos.x > spawnX + patrolRange) dir = -1
    if (enemy.pos.x < spawnX - patrolRange) dir = 1
  })

  return enemy
}
