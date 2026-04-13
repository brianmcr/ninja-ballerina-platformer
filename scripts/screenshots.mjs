#!/usr/bin/env node
// Take a tour of the game and save screenshots at each key state.
// Usage: node scripts/screenshots.mjs

import { chromium } from "playwright"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUT_DIR = path.resolve(__dirname, "..", ".playtest", "tour")

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

  // Ensure clean state
  await page.goto(URL)
  await page.evaluate(() => localStorage.clear())
  await page.goto(URL)
  await sleep(2500)
  await shoot(page, "01-title")

  // Advance to game
  await page.evaluate(() => {
    localStorage.setItem("ninja-ballerina-progress", JSON.stringify({
      levelsCompleted: ["level1","level2","level3","level4","level5","level6"],
      bestSequins: {}, ribbonsFound: {}, firstPlayDone: true,
    }))
    go("game", "level1")
  })
  await sleep(2000)
  await shoot(page, "02-level1-start")

  // Walk right
  await page.keyboard.down("ArrowRight")
  await sleep(1200)
  await page.keyboard.up("ArrowRight")
  await sleep(200)
  await shoot(page, "03-level1-walked")

  // Trigger a spin
  await page.keyboard.press("z")
  await sleep(200)
  await shoot(page, "04-spinning")

  // Make player ninja and screenshot to show overlay
  await page.evaluate(() => {
    const p = get("player")[0]
    if (p?.health) p.health.isNinja = true
  })
  await sleep(300)
  await shoot(page, "05-ninja-form")

  // Load boss
  await page.evaluate(() => go("game", "boss"))
  await sleep(2000)
  await shoot(page, "06-boss-arena")

  // Level select
  await page.evaluate(() => go("levelSelect"))
  await sleep(1500)
  await shoot(page, "07-level-select")

  await browser.close()
  console.log(`\nDone. Output: ${OUT_DIR}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
