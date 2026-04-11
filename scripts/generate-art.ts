/**
 * DALL-E art generation script for Ninja Ballerina
 * Usage: npx tsx scripts/generate-art.ts <prompt-name>
 *
 * Available prompts: ballerina, ninja, villain, butterPat, glutenBlob,
 *                    syrupDripper, milkCarton, tileset, collectibles, ui
 */

import OpenAI from "openai"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY environment variable")
  process.exit(1)
}

const client = new OpenAI({ apiKey: OPENAI_API_KEY })

const SPRITES_DIR = join(__dirname, "..", "public", "sprites")
if (!existsSync(SPRITES_DIR)) mkdirSync(SPRITES_DIR, { recursive: true })

const STYLE_PREFIX = `2D side-scrolling platformer game character, cartoon illustration style, vibrant sparkly kid-friendly aesthetic for ages 8-12. Warm pink/purple/gold palette. Clean smooth lines, NOT pixel art. Similar style to a colorful mobile game or animated series. White/transparent background.`

const PROMPTS: Record<string, { prompt: string; filename: string; size?: "1024x1024" | "1792x1024" | "1024x1792" }> = {
  ballerina: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails, large expressive brown eyes, wearing a bright pink ballet tutu, white leotard, pink ballet slippers. Standing in a graceful idle pose (first position). She looks confident and cheerful. Full body, side-view profile facing right. The character should be suitable for a sprite — clean edges, no complex background elements.`,
    filename: "ballerina-idle.png",
  },

  ballerinaRun: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails wearing a bright pink ballet tutu and white leotard, mid-run pose. Right leg forward, left leg back, arms flowing gracefully like a dancer running. Side-view profile facing right. Full body, dynamic motion. Pink sparkle trail behind her.`,
    filename: "ballerina-run.png",
  },

  ballerinaJump: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails wearing a bright pink ballet tutu and white leotard, jumping in an arabesque pose — one leg extended behind, arms reaching up gracefully. Side-view profile facing right. Full body, airborne, pink sparkles around her.`,
    filename: "ballerina-jump.png",
  },

  ballerinaSpin: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails wearing a bright pink ballet tutu, mid-pirouette spin. Arms extended, tutu flaring out, sparkle/star trail around her body showing the spin motion. Side-view. Full body. Gold and pink sparkle effects.`,
    filename: "ballerina-spin.png",
  },

  ballerinaWhip: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails wearing a bright pink ballet tutu, attacking with a flowing pink gymnastic ribbon whip extending forward from her right hand. Dynamic action pose. Side-view profile facing right. The ribbon creates a flowing arc. Full body.`,
    filename: "ballerina-whip.png",
  },

  ninja: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails wearing a pink tutu over a black lace-up ninja corset/leotard, black arm sleeves with hot pink trim and lacing, hot pink headband with flowing ribbon tails, ballet slippers. Confident combat stance — one hand forward, other hand holding a golden shuriken. She looks powerful and sparkly. Side-view profile facing right. Full body. The outfit blends ballet and ninja aesthetics — magical girl meets martial arts warrior.`,
    filename: "ninja-idle.png",
  },

  ninjaShuriken: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails in ninja-ballerina outfit (pink tutu, black corset, hot pink headband with ribbon tails, black arm sleeves). Throwing a golden shuriken star — arm extended forward releasing the star with a gold energy trail. Dynamic action pose. Side-view facing right. Full body.`,
    filename: "ninja-shuriken.png",
  },

  ninjaKatana: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails in ninja-ballerina outfit (pink tutu, black corset, hot pink headband). Swinging a short katana sword with a wide blue energy slash arc in front of her. Dynamic attack pose. Side-view facing right. Full body. Blue energy trail from the blade.`,
    filename: "ninja-katana.png",
  },

  ninjaSais: {
    prompt: `${STYLE_PREFIX} Young caucasian girl with brown pigtails in ninja-ballerina outfit (pink tutu, black corset, hot pink headband with trailing ribbons). Holding two small red trident-shaped tools, one in each hand, in a dynamic ballet pose with arms extended forward. Confident expression. Side-view facing right. Full body. Red and pink energy glow around the tools. Magical girl action pose.`,
    filename: "ninja-sais.png",
  },

  villain: {
    prompt: `${STYLE_PREFIX} Villain character — anthropomorphic soggy waffle. A humanoid body made of a large golden-brown waffle, soggy and droopy with thick maple syrup dripping from edges and hands. Wearing a black ninja headband with trailing tails. Angry cartoonish eyes and smirking mouth. Muscular waffle-textured arms crossed menacingly. Visible waffle grid squares on body. Goofy but intimidating — a breakfast villain. Full body, side-view facing left (opposing the hero). Amber, golden brown, and dark chocolate colors.`,
    filename: "soggy-waffle.png",
  },

  butterPat: {
    prompt: `${STYLE_PREFIX} Small enemy character — a cute anthropomorphic pat of butter. Flat yellow-gold rectangle shape with a shiny melting surface, tiny cute dot eyes, stubby little feet. Slightly melting at edges. Simple, adorable, about half the size of the main character. Side-view facing left. Butter yellow and gold with white highlight sheen.`,
    filename: "butter-pat.png",
  },

  glutenBlob: {
    prompt: `${STYLE_PREFIX} Enemy character — an amorphous blob creature made of raw bread dough/gluten. Tan, stretchy, gooey ball shape. Has beady suspicious eyes poking out of the dough. Stringy gluten strands stretching from its body. Sitting on ground, slightly jiggling. Gross but cute, like a living ball of bread dough. Side-view. Tan, beige, off-white colors.`,
    filename: "gluten-blob.png",
  },

  syrupDripper: {
    prompt: `${STYLE_PREFIX} Enemy character — ceiling-mounted syrup dispenser creature. Looks like an upside-down amber crystalline stalactite or syrup bottle with tiny angry glowing eyes. Dark amber body hanging from above. A thick syrup drip forming at its tip, stretching downward. Menacing but cartoony. Dark amber and chocolate brown with golden drip highlights.`,
    filename: "syrup-dripper.png",
  },

  milkCarton: {
    prompt: `${STYLE_PREFIX} Enemy character — anthropomorphic school-cafeteria milk carton with arms, legs, and attitude. White carton body with light blue "MILK" label, red flip-top cap worn like a helmet. Uses its front panel as a shield, held in front. Stern determined expression, marching pose. Tough but silly — a milk carton knight. Side-view facing left. White, light blue, and red colors.`,
    filename: "milk-carton.png",
  },

  collectibles: {
    prompt: `${STYLE_PREFIX} Game collectible items arranged in a row on white background: (1) a sparkling golden sequin gem/diamond shape with pink sparkle rays, (2) a golden shuriken ninja star with orange glow aura, (3) a flowing purple and pink gymnastic ribbon coiled in a spiral, (4) a short blue katana sword with energy glow, (5) a pair of crossed red sais with metallic sheen. Each item has a sparkly aura/glow effect. Vibrant, eye-catching. Items are evenly spaced.`,
    filename: "collectibles.png",
    size: "1792x1024",
  },

  titleLogo: {
    prompt: `Game title logo design: "NINJA BALLERINA" in stylized text. The word "NINJA" is in bold black with hot pink outline and shuriken stars as decorations. The word "BALLERINA" is in elegant flowing pink script with sparkle effects. Below in smaller text: "The Stolen Show". Background is transparent/white. Sparkle and ribbon decorations around the text. Vibrant, kid-friendly, magical girl aesthetic. Pink, black, gold, and purple colors.`,
    filename: "title-logo.png",
    size: "1792x1024",
  },
}

async function generate(name: string) {
  const entry = PROMPTS[name]
  if (!entry) {
    console.error(`Unknown prompt: ${name}`)
    console.log(`Available: ${Object.keys(PROMPTS).join(", ")}`)
    process.exit(1)
  }

  console.log(`Generating "${name}"...`)

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: entry.prompt,
    n: 1,
    size: entry.size || "1024x1024",
    quality: "hd",
    response_format: "b64_json",
  })

  const b64 = response.data[0].b64_json!
  const outPath = join(SPRITES_DIR, entry.filename)
  writeFileSync(outPath, Buffer.from(b64, "base64"))
  console.log(`Saved: ${outPath}`)

  const revisedPrompt = response.data[0].revised_prompt
  if (revisedPrompt) {
    console.log(`DALL-E revised prompt: ${revisedPrompt.substring(0, 200)}...`)
  }
}

async function generateAll() {
  for (const name of Object.keys(PROMPTS)) {
    try {
      await generate(name)
    } catch (err: any) {
      console.error(`Failed "${name}": ${err.message}`)
    }
  }
}

const arg = process.argv[2]
if (arg === "all") {
  generateAll()
} else if (arg) {
  generate(arg)
} else {
  console.log("Usage: npx tsx scripts/generate-art.ts <name|all>")
  console.log(`Available: ${Object.keys(PROMPTS).join(", ")}, all`)
}
