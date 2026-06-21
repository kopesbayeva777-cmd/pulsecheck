import sharp from 'sharp';

const { data, info } = await sharp('public/mascot.png')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = new Uint8Array(data);
for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
  if (r > 200 && g > 200 && b > 200) {
    pixels[i+3] = 0;
  }
}

await sharp(Buffer.from(pixels), {
  raw: { width: info.width, height: info.height, channels: 4 }
}).png().toFile('public/mascot.png');

console.log('Done!');
