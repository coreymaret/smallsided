import sharp from 'sharp';              // Import the Sharp image-processing library
import path from 'path';                // Import Node's path module for handling file paths

// Path to the input SVG file located in the public folder
const inputSVG = path.join('public', 'favicon.svg');

// Output directory where all generated PNG icons will be saved
const outputDir = 'public';

// List of icon sizes to generate (in pixels)
const sizes = [16, 32, 48, 64, 128, 192, 180, 512];

// Loop through each desired size
for (const size of sizes) {

  let outputFile;

  // Apple uses a special 180x180 PNG for iOS home screen icons
  if (size === 180) {
    outputFile = path.join(outputDir, 'apple-touch-icon.png');
  } else {
    // All other sizes follow the format "favicon-SIZExSIZE.png"
    outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
  }

  // Use Sharp to:
  // 1. Read the SVG
  // 2. Resize it to the current size
  // 3. Convert it to PNG
  // 4. Save it to the output file path
  sharp(inputSVG)
    .resize(size, size)               // Set the width and height
    .png()                            // Output format is PNG
    .toFile(outputFile)               // Write the file to disk
    .then(() => console.log(`Generated ${outputFile}`)) // Log success
    .catch(err => console.error(err));                  // Log any errors
}
