import sharp from 'sharp';
import { join } from 'path';

const SPRITES = 'C:/Users/Brian/Documents/ninja-ballerina/public/sprites';

async function removeGreen(inputPath) {
  const { data, info } = await sharp(inputPath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Aggressive green screen removal: green channel dominant over both red and blue
    if (g > 100 && g > r * 1.2 && g > b * 1.2) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

async function makeSheet(prefix, count) {
  const frameSize = 1024;
  const frames = [];

  for (let i = 1; i <= count; i++) {
    const path = join(SPRITES, `${prefix}-${i}.png`);
    console.log(`Processing ${path}...`);
    const cleaned = await removeGreen(path);
    const buf = await cleaned.toBuffer();
    frames.push(buf);
  }

  const composites = frames.map((buf, i) => ({
    input: buf,
    left: i * frameSize,
    top: 0,
  }));

  const sheetWidth = frameSize * count;
  await sharp({
    create: {
      width: sheetWidth,
      height: frameSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(join(SPRITES, `${prefix}-sheet.png`));

  console.log(`Created ${prefix}-sheet.png (${sheetWidth}x${frameSize})`);
}

await makeSheet('ballerina-idle', 4);
await makeSheet('ballerina-run', 4);
await makeSheet('ballerina-jump', 4);
await makeSheet('ballerina-spin', 4);
console.log('Done!');
