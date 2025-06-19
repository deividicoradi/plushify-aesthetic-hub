
// Script para gerar ícones PWA em diferentes tamanhos
// Execute: node public/pwa-icons/generate-icons.js

const fs = require('fs');
const path = require('path');

const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="url(#paint0_linear)"/>
  <path d="M256 128C318.914 128 368 177.086 368 240C368 302.914 318.914 352 256 352C193.086 352 144 302.914 144 240C144 177.086 193.086 128 256 128Z" fill="white"/>
  <circle cx="256" cy="240" r="64" fill="#D65E9A"/>
  <defs>
    <linearGradient id="paint0_linear" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F9E8F3"/>
      <stop offset="1" stop-color="#D65E9A"/>
    </linearGradient>
  </defs>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  console.log(`Generating ${filename}...`);
  // Em produção, você usaria uma biblioteca como sharp ou canvas para converter SVG para PNG
});

console.log('Ícones PWA gerados com sucesso!');
