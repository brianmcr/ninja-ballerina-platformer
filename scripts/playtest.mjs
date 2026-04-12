#!/usr/bin/env node
/*
 * Automated playtest harness for Ninja Ballerina.
 *
 * Launches the game in a headed Chromium, skips the intro, drives the
 * ballerina through Level 1, and checks physics behavior.
 *
 * Usage:
 *   1. Start the dev server in another terminal: npm run dev
 *   2. Run: node scripts/playtest.mjs [--url=http://localhost:5186]
 *
 * Reports pass/fail for each check with actual runtime values
 * (worldArea, player pos, pickup state) so bugs are visible without guessing.
 */

import { chromium } from "playwright"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SHOTS_DIR = path.resolve(__dirname, "..", ".playtest")

const URL =
  process.argv.find((a) => a.startsWith("--url="))?.split("=")[1] ||
  "http://localhost:5186"
const HEADLESS = process.argv.includes("--headless")

const results = []
function record(name, pass, detail) {
  results.push({ name, pass, detail })
  const symbol = pass ? "✓" : "✗"
  console.log(`${symbol} ${name}${detail ? "  " + detail : ""}`)
}

async function shoot(page, name) {
  if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true })
  const fp = path.join(SHOTS_DIR, `${name}.png`)
  await page.screenshot({ path: fp, fullPage: false })
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function pressHold(page, key, ms) {
  await page.keyboard.down(key)
  await sleep(ms)
  await page.keyboard.up(key)
}

async function evalInGame(page, fn) {
  return await page.evaluate(fn)
}

async function main() {
  console.log(`Launching browser → ${URL}${HEADLESS ? " (headless)" : ""}`)
  const browser = await chromium.launch({ headless: HEADLESS })
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()

  page.on("pageerror", (err) => console.log(`[page error] ${err.message}`))
  page.on("console", (msg) => {
    const t = msg.type()
    if (t === "error" || t === "warning") console.log(`[console ${t}] ${msg.text()}`)
  })

  try {
    // Load the game and clear progress so we start fresh at title
    await page.goto(URL)
    await page.evaluate(() => {
      try { localStorage.clear() } catch (e) {}
    })
    await page.goto(URL)
    await sleep(2500)
    await shoot(page, "01-title")

    // ------------------------------------------------------------------
    // Jump straight to game scene via Kaplay global (skip title+cutscene)
    // ------------------------------------------------------------------
    await page.evaluate(() => {
      // Mark first-play done so cutscene is skipped
      const p = { levelsCompleted: [], bestSequins: {}, ribbonsFound: {}, firstPlayDone: true }
      localStorage.setItem("ninja-ballerina-progress", JSON.stringify(p))
      go("game", "level1")
    })
    await sleep(2500) // wait for scene load + fade-in + level intro hold

    // Confirm we landed in game scene
    const sceneOk = await evalInGame(page, () => typeof get === "function" && get("player").length > 0)
    record("Enter level 1", sceneOk, sceneOk ? "" : "- player entity not present")
    if (!sceneOk) {
      await shoot(page, "02-no-player")
      throw new Error("Failed to enter game scene")
    }
    await shoot(page, "02-level-start")

    // ------------------------------------------------------------------
    // Physics check 1: Player stands on floor
    // ------------------------------------------------------------------
    const rest = await evalInGame(page, () => {
      const p = get("player")[0]
      return {
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: p.vel.x, y: p.vel.y },
        grounded: p.isGrounded(),
        state: p.state,
        scale: { x: p.scale.x, y: p.scale.y },
      }
    })
    const onFloor =
      rest.grounded && Math.abs(rest.vel.y) < 10 && rest.pos.y > 600 && rest.pos.y < 700
    record(
      "Player rests on floor",
      onFloor,
      `pos=(${rest.pos.x.toFixed(0)}, ${rest.pos.y.toFixed(0)}) vel.y=${rest.vel.y.toFixed(2)} grounded=${rest.grounded} state=${rest.state}`,
    )

    // Read the world-space hitbox bounds from Kaplay's own worldArea()
    const hitbox = await evalInGame(page, () => {
      const p = get("player")[0]
      const wa = p.worldArea()
      if (!wa || !wa.pts) return { error: "worldArea returned invalid" }
      const xs = wa.pts.map((v) => v.x)
      const ys = wa.pts.map((v) => v.y)
      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      }
    })
    const hw = hitbox.maxX - hitbox.minX
    const hh = hitbox.maxY - hitbox.minY
    const hitOk = hw > 15 && hw < 200 && hh > 20 && hh < 200
    record(
      "Player hitbox reasonable",
      hitOk,
      `${hw.toFixed(1)}x${hh.toFixed(1)} world-px  bounds=(${hitbox.minX.toFixed(0)},${hitbox.minY.toFixed(0)})→(${hitbox.maxX.toFixed(0)},${hitbox.maxY.toFixed(0)})`,
    )

    // Confirm the hitbox is aligned with the visible sprite (feet at pos.y)
    const feetOk = Math.abs(hitbox.maxY - rest.pos.y) < 5
    record(
      "Hitbox feet align with player pos",
      feetOk,
      `hitbox.maxY=${hitbox.maxY.toFixed(1)}  player.pos.y=${rest.pos.y.toFixed(1)}`,
    )

    // ------------------------------------------------------------------
    // Physics check 2: Player can walk right
    // ------------------------------------------------------------------
    const startX = rest.pos.x
    await pressHold(page, "ArrowRight", 1500)
    await sleep(200)
    const afterWalk = await evalInGame(page, () => {
      const p = get("player")[0]
      return { x: p.pos.x, y: p.pos.y, grounded: p.isGrounded() }
    })
    const walkedDist = afterWalk.x - startX
    record(
      "Walk right for 1.5s",
      walkedDist > 200 && afterWalk.grounded,
      `moved ${walkedDist.toFixed(0)}px  still grounded=${afterWalk.grounded}  final y=${afterWalk.y.toFixed(0)}`,
    )
    await shoot(page, "03-after-walk")

    // ------------------------------------------------------------------
    // Physics check 3: Pickups collect on overlap
    // Use the player.health.sequins counter as ground truth (it increments
    // on collision). Compare before/after the first walk.
    // ------------------------------------------------------------------
    const collected = await evalInGame(page, () => get("player")[0].health?.sequins ?? 0)
    record(
      "Sequin collection works",
      collected > 0,
      `player.health.sequins=${collected} after first walk`,
    )
    await shoot(page, "04-after-walk-hud")

    // ------------------------------------------------------------------
    // Physics check 4: Jump works
    // ------------------------------------------------------------------
    const beforeJumpY = afterWalk.y
    await page.keyboard.press("Space")
    await sleep(150)
    const midJump = await evalInGame(page, () => {
      const p = get("player")[0]
      return { y: p.pos.y, vy: p.vel.y, grounded: p.isGrounded() }
    })
    const wentUp = midJump.y < beforeJumpY - 5 || midJump.vy < -50
    record(
      "Jump produces upward motion",
      wentUp,
      `before=${beforeJumpY.toFixed(0)} midJump y=${midJump.y.toFixed(0)} vy=${midJump.vy.toFixed(0)}`,
    )

    // Wait for landing
    await sleep(1500)
    const afterJump = await evalInGame(page, () => {
      const p = get("player")[0]
      return { y: p.pos.y, vy: p.vel.y, grounded: p.isGrounded() }
    })
    record(
      "Lands after jump",
      afterJump.grounded,
      `y=${afterJump.y.toFixed(0)} grounded=${afterJump.grounded}`,
    )
    await shoot(page, "05-after-jump")

    // ------------------------------------------------------------------
    // Physics check 5: Player doesn't drift down while standing
    // ------------------------------------------------------------------
    const y0 = afterJump.y
    await sleep(1000)
    const y1 = await evalInGame(page, () => get("player")[0].pos.y)
    const drifted = Math.abs(y1 - y0)
    record(
      "No position drift while idle",
      drifted < 3,
      `y0=${y0.toFixed(2)} → y1=${y1.toFixed(2)} (drift=${drifted.toFixed(2)}px)`,
    )

    // ------------------------------------------------------------------
    // Combat check: spin attack kills enemies in range
    // ------------------------------------------------------------------
    // Teleport player next to the first enemy and run spin
    const spinKilled = await evalInGame(page, async () => {
      const p = get("player")[0]
      const enemies = get("enemy")
      if (enemies.length === 0) return { error: "no enemies" }
      const target = enemies[0]
      const before = get("enemy").length
      p.pos.x = target.pos.x - 30
      p.pos.y = target.pos.y
      // Simulate pressing Z by calling the spin directly via the player state.
      // The onKeyPress("z") handler is bound; we trigger it by dispatching a key.
      return { before, targetX: target.pos.x }
    })
    if (!spinKilled.error) {
      await sleep(50)
      await page.keyboard.press("z")
      await sleep(300)
      const after = await evalInGame(page, () => get("enemy").length)
      const killed = spinKilled.before - after
      record(
        "Spin (Z) kills nearby enemies",
        killed > 0,
        `enemies ${spinKilled.before} → ${after} (killed ${killed})`,
      )
    }
    await shoot(page, "06-after-spin")

    // ------------------------------------------------------------------
    // Combat check: stomp kills an enemy when falling from above
    // Reset player state/invincibility so the stomp path is reached.
    // ------------------------------------------------------------------
    const stompSetup = await evalInGame(page, () => {
      const enemies = get("enemy")
      if (enemies.length === 0) return { error: "no enemies" }
      const target = enemies[0]
      const p = get("player")[0]
      p.state = "idle"
      p.isInvincible = false
      p.spinTimer = 0
      p.pos.x = target.pos.x
      p.pos.y = target.pos.y - 80
      p.vel.y = 100
      return {
        before: enemies.length,
        targetX: target.pos.x,
        targetY: target.pos.y,
      }
    })
    if (!stompSetup.error) {
      await sleep(800)
      const stompResult = await evalInGame(page, () => {
        const p = get("player")[0]
        return { count: get("enemy").length, state: p.state, inv: p.isInvincible, py: p.pos.y, vy: p.vel.y }
      })
      const killed = stompSetup.before - stompResult.count
      record(
        "Stomp kills enemy from above",
        killed > 0,
        `enemies ${stompSetup.before} → ${stompResult.count}  playerY=${stompResult.py.toFixed(0)} state=${stompResult.state} inv=${stompResult.inv}`,
      )
    }

    // ------------------------------------------------------------------
    // Combat check: touching enemy without attacking damages player
    // ------------------------------------------------------------------
    const dmgSetup = await evalInGame(page, () => {
      const enemies = get("enemy")
      if (enemies.length === 0) return { error: "no enemies left" }
      const target = enemies[0]
      const p = get("player")[0]
      const h = p.health
      // Clear invincibility
      p.isInvincible = false
      p.state = "idle"
      // Place player next to enemy horizontally
      p.pos.x = target.pos.x - 10
      p.pos.y = target.pos.y
      p.vel.y = 0
      return { livesBefore: h?.lives ?? 0 }
    })
    if (!dmgSetup.error) {
      await sleep(500)
      const dmgAfter = await evalInGame(page, () => {
        const p = get("player")[0]
        return { lives: p.health?.lives ?? 0, isNinja: p.health?.isNinja ?? false }
      })
      const tookDmg =
        dmgSetup.livesBefore > dmgAfter.lives || dmgAfter.isNinja === false
      record(
        "Touching enemy (not attacking) damages player",
        tookDmg,
        `lives ${dmgSetup.livesBefore} → ${dmgAfter.lives}  ninja=${dmgAfter.isNinja}`,
      )
    }

    // ------------------------------------------------------------------
    // Kill zone: falling below the level respawns the player
    // ------------------------------------------------------------------
    const fallSetup = await evalInGame(page, () => {
      const p = get("player")[0]
      p.isInvincible = false
      p.state = "idle"
      p.pos.x = 1000
      p.pos.y = 1500
      p.vel.y = 100
      return { livesBefore: p.health?.lives ?? 0 }
    })
    await sleep(400)
    const fallResult = await evalInGame(page, () => {
      const p = get("player")[0]
      return {
        x: p.pos.x,
        y: p.pos.y,
        lives: p.health?.lives ?? 0,
      }
    })
    const respawned = fallResult.x < 300 && fallResult.y < 800
    record(
      "Fall below level triggers respawn",
      respawned,
      `pos=(${fallResult.x.toFixed(0)}, ${fallResult.y.toFixed(0)}) lives ${fallSetup.livesBefore} → ${fallResult.lives}`,
    )

    // ------------------------------------------------------------------
    // Ninja overlay check: spawning ninja gear on powerup
    // ------------------------------------------------------------------
    const overlayCheck = await evalInGame(page, () => {
      const p = get("player")[0]
      const h = p.health
      if (!h) return { error: "no health" }
      h.isNinja = true
      return { ok: true }
    })
    if (!overlayCheck.error) {
      await sleep(200)
      const hasOverlay = await evalInGame(page, () => get("ninja-gear").length)
      record(
        "Ninja overlay spawns when isNinja=true",
        hasOverlay > 0,
        `ninja-gear entities: ${hasOverlay}`,
      )
      await shoot(page, "07-ninja-overlay")
    }

    // ------------------------------------------------------------------
    // Dump all entity hitboxes for reference
    // ------------------------------------------------------------------
    const allHitboxes = await evalInGame(page, () => {
      const result = {}
      const tags = ["player", "enemy", "sequin", "ninjaPowerup", "platform", "goal"]
      for (const tag of tags) {
        const objs = get(tag)
        if (objs.length === 0) continue
        result[tag] = objs.slice(0, 3).map((o) => {
          try {
            const wa = o.worldArea()
            if (!wa?.pts) return { pos: o.pos, err: "no pts" }
            const xs = wa.pts.map((v) => v.x)
            const ys = wa.pts.map((v) => v.y)
            return {
              pos: { x: Math.round(o.pos.x), y: Math.round(o.pos.y) },
              scale: o.scale?.x ?? 1,
              bounds: {
                w: (Math.max(...xs) - Math.min(...xs)).toFixed(1),
                h: (Math.max(...ys) - Math.min(...ys)).toFixed(1),
                minX: Math.min(...xs).toFixed(0),
                minY: Math.min(...ys).toFixed(0),
                maxX: Math.max(...xs).toFixed(0),
                maxY: Math.max(...ys).toFixed(0),
              },
            }
          } catch (e) {
            return { pos: o.pos, err: String(e) }
          }
        })
      }
      return result
    })
    console.log("\n=== Entity hitbox dump ===")
    console.log(JSON.stringify(allHitboxes, null, 2))
    console.log("==========================\n")
  } catch (err) {
    console.error("\n[playtest error]", err.message)
    record("Harness completed without errors", false, err.message)
    try { await shoot(page, "error-final") } catch (_) {}
  } finally {
    await browser.close()
  }

  const pass = results.filter((r) => r.pass).length
  const total = results.length
  console.log(`\n=== ${pass}/${total} checks passed ===`)
  console.log(`Screenshots: ${SHOTS_DIR}`)
  process.exit(pass === total ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
