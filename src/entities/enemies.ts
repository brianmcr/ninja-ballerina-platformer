import { ENEMY } from "../config"

export function createButterPat(x: number, y: number, patrolRange = 100) {
  const e = ENEMY.BUTTER_PAT
  let hp = e.HP
  let dir = 1
  const spawnX = x

  const enemy = add([
    rect(e.WIDTH, e.HEIGHT),
    pos(x, y),
    area(),
    body(),
    anchor("bot"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    "enemy",
    "butterPat",
    {
      hurt(dmg: number) {
        hp -= dmg
        if (hp <= 0) {
          spawnSlipperyPatch(enemy.pos.x, enemy.pos.y)
          destroy(enemy)
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
    rect(e.SIZE, e.SIZE),
    pos(x, y),
    area(),
    body(),
    anchor("bot"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    "enemy",
    "glutenBlob",
    {
      hurt(dmg: number) {
        hp -= dmg
        if (hp <= 0) {
          destroy(enemy)
        } else {
          enemy.color = rgb(e.HIT_COLOR[0], e.HIT_COLOR[1], e.HIT_COLOR[2])
        }
      },
    },
  ])

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
    rect(e.SIZE, e.SIZE),
    pos(x, y),
    area(),
    anchor("center"),
    color(e.COLOR[0], e.COLOR[1], e.COLOR[2]),
    "enemy",
    "syrupDripper",
    {
      hurt(_dmg: number, type?: string) {
        if (type === "ranged") {
          destroy(enemy)
        }
      },
    },
  ])

  enemy.onUpdate(() => {
    dropTimer -= dt()
    if (dropTimer <= 0) {
      dropTimer = e.DROP_INTERVAL
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
    rect(e.WIDTH, e.HEIGHT),
    pos(x, y),
    area(),
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
          destroy(enemy)
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
