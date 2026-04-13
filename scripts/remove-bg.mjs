import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SPRITES_DIR = path.resolve('public/sprites');
// Source DALL-E images live outside public/ so Vite doesn't ship them.
const ORIGINALS_DIR = path.resolve('sprite-sources/originals');

const SPRITES = [
  'ballerina-idle.png', 'ballerina-jump.png', 'ballerina-run.png',
  'ballerina-spin.png', 'ballerina-whip.png', 'butter-pat.png',
  'collectibles.png', 'gluten-blob.png', 'milk-carton.png',
  'ninja-idle.png', 'ninja-katana.png', 'ninja-sais.png',
  'ninja-shuriken.png', 'soggy-waffle.png', 'syrup-dripper.png',
  'title-logo.png',
  'sequin.png', 'ribbon.png', 'ninja-powerup.png',
  'weapon-katana.png', 'weapon-sais.png', 'weapon-shuriken.png',
];

// Per-sprite config
const CONFIG = {
  'soggy-waffle.png': { cropEdges: 100, bgMode: 'multi', bgColors: [[254,255,248],[253,255,247],[255,255,250],[255,255,255]], bgTolerance: 40 },
  'milk-carton.png': { bgMode: 'blueChecker', cropRight: 0.32 },
  'ninja-shuriken.png': { bgMode: 'neutralGray' },
  'syrup-dripper.png': { bgMode: 'neutralGray' },
  'title-logo.png': { bgMode: 'neutralGray' },
  'ballerina-whip.png': { bgMode: 'neutralGray' },
  'ballerina-spin.png': { bgMode: 'neutralGray' },
  'ballerina-jump.png': { bgMode: 'neutralGray' },
  'ballerina-idle.png': { bgMode: 'multi', bgColors: [[113, 204, 136], [118, 205, 136], [108, 199, 131]], bgTolerance: 55 },
  'ballerina-run.png': { bgMode: 'greenScreen' },
  'sequin.png': { bgMode: 'greenishBg' },
  'ribbon.png': { bgMode: 'greenishBg' },
  'ninja-powerup.png': { bgMode: 'greenishBg' },
  'weapon-katana.png': { bgMode: 'greenishBg' },
  'weapon-sais.png': { bgMode: 'greenishBg' },
  'weapon-shuriken.png': { bgMode: 'greenishBg' },
};

function colorDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function sampleBgColor(data, width, height) {
  const s = 10;
  let rS = 0, gS = 0, bS = 0, c = 0;
  for (const [sx, sy] of [[0,0],[width-s,0],[0,height-s],[width-s,height-s]]) {
    for (let dy = 0; dy < s; dy++) {
      for (let dx = 0; dx < s; dx++) {
        const pi = ((sy+dy)*width+(sx+dx))*4;
        if (data[pi+3] > 200) { rS += data[pi]; gS += data[pi+1]; bS += data[pi+2]; c++; }
      }
    }
  }
  if (c === 0) return null;
  return [Math.round(rS/c), Math.round(gS/c), Math.round(bS/c)];
}

function floodFill(data, width, height, matchFn, aaTolerance) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total * 2);
  let head = 0, tail = 0;
  const enqueue = (x, y) => { queue[tail++] = x; queue[tail++] = y; };

  // Seed from all edges
  for (let x = 0; x < width; x++) {
    if (!visited[x]) { visited[x] = 1; enqueue(x, 0); }
    const bi = (height-1)*width+x;
    if (!visited[bi]) { visited[bi] = 1; enqueue(x, height-1); }
  }
  for (let y = 1; y < height-1; y++) {
    const li = y*width;
    const ri = y*width+width-1;
    if (!visited[li]) { visited[li] = 1; enqueue(0, y); }
    if (!visited[ri]) { visited[ri] = 1; enqueue(width-1, y); }
  }

  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  let removed = 0;

  while (head < tail) {
    const cx = queue[head++];
    const cy = queue[head++];
    const pi = (cy*width+cx)*4;
    const score = matchFn(data[pi], data[pi+1], data[pi+2], data[pi+3]);

    if (score <= 1.0) {
      // score 0 = perfect bg match, 1.0 = at tolerance edge
      if (score <= 0.7) {
        data[pi+3] = 0;
        removed++;
      } else {
        // Anti-alias zone
        const alpha = Math.round(((score - 0.7) / 0.3) * 255);
        data[pi+3] = Math.min(data[pi+3], alpha);
        removed++;
      }

      // Expand to neighbors
      for (const [dx, dy] of dirs) {
        const nx = cx+dx, ny = cy+dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = ny*width+nx;
          if (!visited[ni]) {
            visited[ni] = 1;
            const npi = ni*4;
            const ns = matchFn(data[npi], data[npi+1], data[npi+2], data[npi+3]);
            if (ns <= 1.3) { // slightly beyond tolerance for AA
              enqueue(nx, ny);
            }
          }
        }
      }
    }
    // score > 1.0 = not background, don't remove or expand
  }

  return removed;
}

function makeColorMatcher(bgColors, tolerance) {
  return (r, g, b, a) => {
    if (a < 10) return 0; // already transparent
    let minDist = Infinity;
    for (const [br, bg, bb] of bgColors) {
      minDist = Math.min(minDist, colorDist(r, g, b, br, bg, bb));
    }
    return minDist / tolerance; // 0 = exact match, 1.0 = at tolerance
  };
}

function makeNeutralGrayMatcher() {
  // Matches any neutral/near-neutral gray-white from ~130 to ~255 brightness
  // Allows warm-tinted grays (from glow blending with checker patterns)
  return (r, g, b, a) => {
    if (a < 10) return 0;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const saturation = maxC - minC;
    const brightness = (r + g + b) / 3;

    // Hard cutoff: clearly saturated colors
    if (saturation > 35) return 2.0;
    // Hard cutoff: too dark
    if (brightness < 130) return 2.0;

    // Score: lower = more background-like
    // Perfectly neutral gray scores 0
    // Slightly warm/cool gray scores proportionally higher
    const satScore = saturation / 35; // 0-1
    const brightScore = brightness >= 160 ? 0 : (160 - brightness) / 30 * 0.3; // dimmer grays score slightly worse
    return satScore * 0.6 + brightScore;
  };
}

function makeBlueCheckerMatcher() {
  // Milk-carton has a blue checkered bg: R=55-95, G=90-130, B=115-155
  // The blue channel is always highest, green is mid, red is lowest
  return (r, g, b, a) => {
    if (a < 10) return 0;
    // Must have blue > green > red ordering
    if (b <= g || g <= r) return 2.0;
    // Must be in the blue range
    if (r < 45 || r > 110) return 2.0;
    if (g < 80 || g > 145) return 2.0;
    if (b < 110 || b > 165) return 2.0;
    // Score based on how "blue checker" it looks
    const blueExcess = b - r; // should be ~50-70
    if (blueExcess < 30) return 1.5;
    return 0.3; // good match
  };
}

function makeGreenScreenMatcher() {
  return (r, g, b, a) => {
    if (a < 10) return 0;
    // Pure green screen: g high, r and b low
    if (g > 180 && r < 100 && b < 100) return 0;
    // Edge anti-alias zone
    if (g > 150 && r < 120 && b < 120) {
      const greenness = (g - Math.max(r, b)) / g;
      return greenness < 0.3 ? 1.5 : (1.0 - greenness);
    }
    return 2.0;
  };
}

// Catches any greenish / teal gradient background (DALL-E radial fills).
// Accepts pixels where green is dominant over red and blue isn't dominant
// over green. Blue-dominant flames and warm/neutral subjects are preserved.
function makeGreenishBgMatcher() {
  return (r, g, b, a) => {
    if (a < 10) return 0;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC - minC;
    // Unsaturated (white/gray/black highlights) → keep
    if (sat < 18) return 2.0;
    // Green must dominate red, and blue must not dominate green
    const gOverR = g - r;
    const gOverB = g - b;
    if (gOverR < 6) return 2.0;      // not green enough vs red
    if (gOverB < -18) return 2.0;    // too blue (preserve blue flame)
    // Score: strongly green-dominant → 0; marginal → ~0.7
    const score = 1.0 - Math.min(1, (gOverR + Math.max(0, gOverB)) / 60);
    return score * 0.9;
  };
}

function clearEdgeColumns(data, width, height, edgeWidth) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < edgeWidth; x++) data[(y*width+x)*4+3] = 0;
    for (let x = width-edgeWidth; x < width; x++) data[(y*width+x)*4+3] = 0;
  }
}

async function processSprite(filename) {
  const origPath = path.join(ORIGINALS_DIR, filename);
  const outPath = path.join(SPRITES_DIR, filename);
  const cfg = CONFIG[filename] || {};

  const image = sharp(origPath);
  const { width, height } = await image.metadata();
  const rawBuffer = await image.ensureAlpha().raw().toBuffer();
  const data = new Uint8Array(rawBuffer);

  // Step 0: Crop right portion (for multi-sprite DALL-E images)
  if (cfg.cropRight) {
    const cropCols = Math.round(width * cfg.cropRight);
    console.log(`  Clearing right ${cropCols}px (${(cfg.cropRight*100).toFixed(0)}%)...`);
    for (let y = 0; y < height; y++) {
      for (let x = width - cropCols; x < width; x++) {
        data[(y * width + x) * 4 + 3] = 0;
      }
    }
  }

  // Step 1: Crop edge columns if needed
  if (cfg.cropEdges) {
    console.log(`  Clearing ${cfg.cropEdges}px edge columns...`);
    clearEdgeColumns(data, width, height, cfg.cropEdges);
  }

  // Step 2: Build matcher and flood fill
  let matcher;
  const tolerance = cfg.bgTolerance || 40;

  if (cfg.bgMode === 'greenScreen') {
    console.log(`  Mode: green screen chroma key`);
    matcher = makeGreenScreenMatcher();
  } else if (cfg.bgMode === 'neutralGray') {
    console.log(`  Mode: neutral gray removal`);
    matcher = makeNeutralGrayMatcher();
  } else if (cfg.bgMode === 'greenishBg') {
    console.log(`  Mode: greenish gradient removal`);
    matcher = makeGreenishBgMatcher();
  } else if (cfg.bgMode === 'blueChecker') {
    console.log(`  Mode: blue checker removal`);
    matcher = makeBlueCheckerMatcher();
  } else if (cfg.bgMode === 'multi' && cfg.bgColors) {
    console.log(`  Mode: multi-color, ${cfg.bgColors.length} bg colors`);
    matcher = makeColorMatcher(cfg.bgColors, tolerance);
  } else {
    // Auto-detect from corners
    const bg = sampleBgColor(data, width, height);
    if (!bg) {
      console.log(`  No opaque bg detected, skipping.`);
      fs.copyFileSync(origPath, outPath);
      return;
    }
    console.log(`  Mode: auto, bg rgb(${bg.join(',')})`);
    matcher = makeColorMatcher([bg], tolerance);
  }

  const removed = floodFill(data, width, height, matcher);

  await sharp(Buffer.from(data.buffer), { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outPath);

  const total = width * height;
  console.log(`  ${removed}/${total} pixels removed (${(removed/total*100).toFixed(1)}%)`);
}

async function main() {
  if (!fs.existsSync(ORIGINALS_DIR)) {
    console.error('originals/ not found'); process.exit(1);
  }

  console.log(`Processing ${SPRITES.length} sprites...\n`);
  for (const sprite of SPRITES) {
    console.log(`Processing: ${sprite}`);
    try {
      await processSprite(sprite);
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
    console.log('');
  }
  console.log('Done.');
}

main();
