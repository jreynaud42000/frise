const fs = require('fs');
const path = require('path');

// Build a valid multi-resolution ICO by embedding raw PNG payloads for each size
// (supported natively since Windows Vista) — no external image library needed.
const sizes = [16, 32, 48, 64, 128, 256];
const dir = process.argv[2];
const outPath = process.argv[3];

const images = sizes.map(s => fs.readFileSync(path.join(dir, `icon-${s}.png`)));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);

let offset = 6 + images.length * 16;
const entries = [];
images.forEach((img, i) => {
  const s = sizes[i];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(s >= 256 ? 0 : s, 0);
  entry.writeUInt8(s >= 256 ? 0 : s, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(img.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += img.length;
  entries.push(entry);
});

fs.writeFileSync(outPath, Buffer.concat([header, ...entries, ...images]));
console.log('Wrote', outPath, 'with sizes', sizes.join(','));
