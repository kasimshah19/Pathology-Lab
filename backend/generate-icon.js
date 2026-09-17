import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgString = `<svg width="800" height="800" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
  <path fill="#0d5c63" d="M48 64C48 46.3 62.3 32 80 32H112c17.7 0 32 14.3 32 32V96H48V64zM224 160V144c0-8.8-7.2-16-16-16H200V84.8C209.6 81.3 216 72.3 216 61.9c0-14.3-11.6-25.9-25.9-25.9H169.9C155.6 36 144 47.6 144 61.9c0 10.4 6.4 19.4 16 22.9V128H152c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h6.7c-5 13-8.8 26.6-11 40.5C118.8 206.1 106.8 192 92.5 192c-15.3 0-29.3 6.9-38.5 17.7c-2.4 2.8-6 4.3-9.7 4.1L24.8 212.7c-13.4-1-24.8 9.9-24.8 23.4v73.7c0 10 6.6 18.7 16.2 21.7l33 10.4c16 5 33.3-3.6 38.9-19.3l4-11c5.2-14.5 18-24.6 33-25.6h1.2c-1 6.5-1.5 13.1-1.5 19.8V352c0 17.7-14.3 32-32 32H64c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V416c0-17.7-14.3-32-32-32H288c-17.7 0-32-14.3-32-32V305.8c0-8.7 .6-17.3 1.7-25.8h6.3c8.8 0 16-7.2 16-16V248c0-8.8-7.2-16-16-16H231.1C244 204.6 256 177.3 256 160v-6.6c11.7-1.3 22-9 27-20.1c7.2-16 0-34.8-15.6-42.6L256 85.5V64c0-17.7-14.3-32-32-32H208c-17.7 0-32 14.3-32 32v24.2l5.7 2.7c15.6 7.3 22.8 25.8 15.6 41.8c-2.7 6.1-7.5 10.9-13.3 13.3V160zM128 352H141.6c6.1 0 11.9-2.3 16.4-6.3l37.2-33.1c11.1-9.9 19.7-22.1 25.2-35.6c4.6-11.3 7-23.4 7.2-35.7H192c0 23.3-15.8 45.4-38.3 54c0 0 0 0 0 0s0 0 0 0c-4.4 1.7-8.9 2.9-13.6 3.7c1.4-6.4 2-13.1 2-19.9V264c0-13.3-10.7-24-24-24s-24 10.7-24 24v88z"/>
</svg>`;

async function generate() {
  const dir = path.join(__dirname, 'assets');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const outPath = path.join(dir, 'microscope-watermark.png');
  await sharp(Buffer.from(svgString))
    .png()
    .toFile(outPath);
  
  console.log('Successfully generated microscope-watermark.png');
}

generate().catch(console.error);
