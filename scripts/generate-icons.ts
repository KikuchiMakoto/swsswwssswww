import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Radial Gradient for Circular Badge -->
    <radialGradient id="circleBg" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#131e36" />
      <stop offset="70%" stop-color="#0c1220" />
      <stop offset="100%" stop-color="#070b13" />
    </radialGradient>

    <!-- Bezel Gradient -->
    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="35%" stop-color="#059669" stop-opacity="0.5" />
      <stop offset="70%" stop-color="#047857" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#1e293b" stop-opacity="0.6" />
    </linearGradient>

    <!-- Inner Glow Ring -->
    <linearGradient id="innerRing" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </linearGradient>

    <!-- Primary Emerald-to-Cyan Wave Gradient -->
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="45%" stop-color="#34d399" />
      <stop offset="75%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Glow Gradient -->
    <linearGradient id="waveGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.45" />
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.45" />
    </linearGradient>

    <!-- Subtle Harmonic Wave Gradient -->
    <linearGradient id="harmonicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#0284c7" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.35" />
    </linearGradient>

    <!-- Center Radial Glow -->
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#090d16" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Full Canvas Background for PWA Safe Zone & Masking -->
  <rect width="512" height="512" fill="#090d16" />

  <!-- Circular Badge Container (r=186px fits well within the 204.8px safe zone) -->
  <circle cx="256" cy="256" r="186" fill="url(#circleBg)" stroke="url(#bezelGrad)" stroke-width="7" />
  <circle cx="256" cy="256" r="182" fill="url(#innerRing)" />
  <circle cx="256" cy="256" r="150" fill="url(#centerGlow)" />

  <!-- Oscilloscope / Synthesizer Center Reticle & Grid Lines -->
  <line x1="102" y1="256" x2="410" y2="256" stroke="#334155" stroke-width="2" stroke-dasharray="3 5" opacity="0.4" />
  <line x1="256" y1="112" x2="256" y2="400" stroke="#334155" stroke-width="2" stroke-dasharray="3 5" opacity="0.3" />

  <!-- Grid Range Markers (Top & Bottom limits) -->
  <line x1="180" y1="172" x2="332" y2="172" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.6" />
  <line x1="180" y1="340" x2="332" y2="340" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.6" />

  <!-- Secondary Harmonic Wave (Subtle high frequency / carrier) -->
  <path
    d="M 124 256 C 145 228, 160 228, 180 256 C 200 284, 218 284, 238 256 C 258 228, 276 228, 296 256 C 316 284, 334 284, 354 256 C 370 234, 382 238, 388 256"
    fill="none"
    stroke="url(#harmonicGrad)"
    stroke-width="5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Main Sound Wave - Outer Ambient Glow -->
  <path
    d="M 112 256 C 138.2 200, 157.8 200, 184 256 C 210.2 340, 229.8 340, 256 256 C 282.2 172, 301.8 172, 328 256 C 354.2 312, 373.8 312, 400 256"
    fill="none"
    stroke="url(#waveGlowGrad)"
    stroke-width="32"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity="0.4"
  />

  <!-- Main Sound Wave - Intermediate Glow -->
  <path
    d="M 112 256 C 138.2 200, 157.8 200, 184 256 C 210.2 340, 229.8 340, 256 256 C 282.2 172, 301.8 172, 328 256 C 354.2 312, 373.8 312, 400 256"
    fill="none"
    stroke="url(#waveGlowGrad)"
    stroke-width="22"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity="0.75"
  />

  <!-- Main Sound Wave - Crisp Core Line -->
  <path
    d="M 112 256 C 138.2 200, 157.8 200, 184 256 C 210.2 340, 229.8 340, 256 256 C 282.2 172, 301.8 172, 328 256 C 354.2 312, 373.8 312, 400 256"
    fill="none"
    stroke="url(#waveGrad)"
    stroke-width="14"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Inner High-Intensity Core Highlight -->
  <path
    d="M 114 256 C 139 204, 157 204, 184 256 C 210.2 336, 229.8 336, 256 256 C 282.2 176, 301.8 176, 328 256 C 354 308, 373 308, 398 256"
    fill="none"
    stroke="#ecfdf5"
    stroke-width="3.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity="0.8"
  />

  <!-- Endpoint Terminal Dots -->
  <circle cx="112" cy="256" r="6" fill="#10b981" />
  <circle cx="400" cy="256" r="6" fill="#06b6d4" />

  <!-- Center Origin Marker -->
  <circle cx="256" cy="256" r="3" fill="#34d399" opacity="0.9" />
</svg>`;

const publicDir = resolve(import.meta.dir, '../public');

// 1. Write favicon.svg
writeFileSync(resolve(publicDir, 'favicon.svg'), svgContent, 'utf-8');
console.log('Saved public/favicon.svg');

// Render PNGs at target sizes
function renderPng(width: number, filename: string) {
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  writeFileSync(resolve(publicDir, filename), pngBuffer);
  console.log(`Saved public/${filename} (${width}x${width}, ${pngBuffer.length} bytes)`);
}

// 2. pwa-192x192.png
renderPng(192, 'pwa-192x192.png');

// 3. pwa-512x512.png
renderPng(512, 'pwa-512x512.png');

// 4. apple-touch-icon.png (180x180)
renderPng(180, 'apple-touch-icon.png');

// 5. maskable-icon-512x512.png (512x512)
renderPng(512, 'maskable-icon-512x512.png');

// 6. Generate favicon.ico (containing 32x32 PNG)
const icoResvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: 32 } });
const png32 = icoResvg.render().asPng();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type 1 = icon
icoHeader.writeUInt16LE(1, 4); // 1 image
icoHeader.writeUInt8(32, 6);   // width 32
icoHeader.writeUInt8(32, 7);   // height 32
icoHeader.writeUInt8(0, 8);    // color count (0 = >=256)
icoHeader.writeUInt8(0, 9);    // reserved
icoHeader.writeUInt16LE(1, 10); // planes
icoHeader.writeUInt16LE(32, 12); // bit count
icoHeader.writeUInt32LE(png32.length, 14); // image size
icoHeader.writeUInt32LE(22, 18); // offset 22
writeFileSync(resolve(publicDir, 'favicon.ico'), Buffer.concat([icoHeader, png32]));
console.log(`Saved public/favicon.ico (32x32 embedded PNG, ${icoHeader.length + png32.length} bytes)`);

console.log('All icons generated successfully!');
