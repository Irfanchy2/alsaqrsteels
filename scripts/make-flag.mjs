// Draws the soft, waving UAE flag used behind the premium announcement banner
// (public/img/ann/uae-flag-banner-*.webp). Generated here, so there are no
// image rights to worry about. A wide (12:1) version of the flag's layout so
// the stripes run across the whole banner: a red band at the hoist and three
// equal horizontal stripes, green, white and black.
import sharp from "sharp";

const W = 4800, H = 400;
const RED = 520;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="wave" x="-2%" y="-10%" width="104%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0009 0.006" numOctaves="2" seed="11" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="folds" x1="0" y1="0" x2="1" y2="0.04">
      ${Array.from({ length: 29 }, (_, i) => {
        const light = i % 2 === 0;
        return `<stop offset="${(i / 28).toFixed(3)}" stop-color="${light ? "#ffffff" : "#000000"}" stop-opacity="${light ? 0.14 : 0.3}"/>`;
      }).join("")}
    </linearGradient>
  </defs>
  <g filter="url(#wave)">
    <rect x="-40" y="-40" width="${W + 80}" height="${H / 3 + 40}" fill="#00732f"/>
    <rect x="-40" y="${H / 3}" width="${W + 80}" height="${H / 3}" fill="#ffffff"/>
    <rect x="-40" y="${(2 * H) / 3}" width="${W + 80}" height="${H / 3 + 40}" fill="#000000"/>
    <rect x="-40" y="-40" width="${RED + 40}" height="${H + 80}" fill="#ce1126"/>
    <rect x="-40" y="-40" width="${W + 80}" height="${H + 80}" fill="url(#folds)"/>
  </g>
</svg>`;

// Crop inside the edges the wave pulls in, then soften slightly.
const buf = await sharp(Buffer.from(svg)).extract({ left: 70, top: 22, width: 4660, height: 356 }).blur(1.5).toBuffer();
await sharp(buf).resize(2400, 183).webp({ quality: 72 }).toFile("public/img/ann/uae-flag-banner-2400.webp");
await sharp(buf).resize(1200, 92).webp({ quality: 72 }).toFile("public/img/ann/uae-flag-banner-1200.webp");
console.log("make-flag: wrote public/img/ann/uae-flag-banner-2400.webp and -1200.webp");
