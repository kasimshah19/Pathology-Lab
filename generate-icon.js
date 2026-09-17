const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgCode = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Rounded Square Background -->
  <rect width="512" height="512" rx="100" fill="#0d9488" />
  
  <!-- Microscope / Lab Flask Silhouette -->
  <!-- Base -->
  <rect x="180" y="380" width="152" height="32" rx="16" fill="white" />
  <!-- Arm -->
  <path d="M 220 380 Q 150 250 220 120 L 250 120 Q 180 250 250 380 Z" fill="white" />
  <path d="M 190 250 A 60 60 0 0 0 310 250" fill="none" stroke="white" stroke-width="24" stroke-linecap="round"/>
  <!-- Stage -->
  <rect x="220" y="280" width="120" height="20" rx="8" fill="white" />
  <!-- Tube -->
  <rect x="270" y="100" width="60" height="150" rx="8" fill="white" transform="rotate(30, 300, 150)" />
  <!-- Eyepiece -->
  <rect x="360" y="60" width="40" height="20" rx="4" fill="white" transform="rotate(30, 380, 70)" />
</svg>
`;

async function generate() {
  const dir = path.join(__dirname, 'frontend', 'public', 'icons');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await sharp(Buffer.from(svgCode))
    .resize(192, 192)
    .png()
    .toFile(path.join(dir, 'icon-192x192.png'));

  await sharp(Buffer.from(svgCode))
    .resize(512, 512)
    .png()
    .toFile(path.join(dir, 'icon-512x512.png'));
    
  console.log('Icons generated successfully.');
}

generate().catch(console.error);
