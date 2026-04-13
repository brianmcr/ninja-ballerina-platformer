#!/usr/bin/env node
// Capture a sequence showing combat visual feedback (stomp, damage)

import { chromium } from "playwright"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUT_DIR = path.resolve(__dirname, "..", ".playtest", "combat")

const URL = process.argv.find((a) => a.startsWith("--url="))?.split("=")[1] || "http://localhost:5186"

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function shoot(page, name) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) })
  console.log(`  → ${name}.png`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  await page.goto(URL)
  await page.evaluate(() => localStorage.clear())
  await page.goto(URL)
  await sleep(2500)

  // Load level1 and disable spawn grace
  await page.evaluate(() => {
    localStorage.setItem("ninja-ballerina-progress", JSON.stringify({
      levelsCompleted: ["level1","level2","level3","level4","level5","level6"],
      bestSequins: {}, ribbonsFound: {}, firstPlayDone: true,
    }))
    go("game", "level1")
  })
  await sleep(2000)

  // Clear invincibility
  await page.evaluate(() => {
    const p = get("player")[0]
    if (p) {
      p.isInvincible = false
      if (p.health) p.health.invincibleTimer = 0
      p.opacity = 1
    }
  })

  // --- Stomp scenario: drop player onto an enemy from above ---
  const stomp = await page.evaluate(() => {
    const enemies = get("enemy")
    if (enemies.length === 0) return { error: "no enemies" }
    const t = enemies[0]
    const p = get("player")[0]
    p.pos.x = t.pos.x
    p.pos.y = t.pos.y - 120
    p.vel.y = 100
    p.state = "jump"
    return { enemyX: t.pos.x, enemyY: t.pos.y }
  })
  if (!stomp.error) {
    // Take shots while player falls + stomps
    for (let i = 0; i < 6; i++) {
      await sleep(80)
      await shoot(page, `stomp-${String(i).padStart(2, "0")}`)
    }
  }

  await sleep(500)

  // --- Damage scenario: walk into an enemy at same y ---
  await page.evaluate(() => go("game", "level1"))
  await sleep(1800)
  await page.evaluate(() => {
    const p = get("player")[0]
    if (p) {
      p.isInvincible = false
      if (p.health) p.health.invincibleTimer = 0
    }
  })
  const dmg = await page.evaluate(() => {
    const enemies = get("enemy")
    if (enemies.length === 0) return { error: "no enemies" }
    const t = enemies[0]
    const p = get("player")[0]
    p.pos.x = t.pos.x - 50
    p.pos.y = t.pos.y
    p.state = "idle"
    return { ok: true }
  })
  if (!dmg.error) {
    await page.keyboard.down("ArrowRight")
    for (let i = 0; i < 5; i++) {
      await sleep(80)
      await shoot(page, `damage-${String(i).padStart(2, "0")}`)
    }
    await page.keyboard.up("ArrowRight")
    await sleep(200)
    await shoot(page, `damage-05-after`)
  }

  await browser.close()
  console.log(`\nDone. Output: ${OUT_DIR}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
