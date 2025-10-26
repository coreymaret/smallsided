import sharp from 'sharp';
import path from 'path';

const inputSVG = path.join('public', 'favicon.svg');
const outputDir = 'public';

const sizes = [16, 32, 48, 64, 128, 192, 180, 512];

for (const size of sizes) {
  let outputFile;
  if (size === 180) {
    outputFile = path.join(outputDir, 'apple-touch-icon.png');
  } else {
    outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
  }

  sharp(inputSVG)
    .resize(size, size)
    .png()
    .toFile(outputFile)
    .then(() => console.log(`Generated ${outputFile}`))
    .catch(err => console.error(err));
}
