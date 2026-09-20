const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Génère un fichier PNG valide en pur JavaScript (Node.js natif via zlib)
 * @param {number} width 
 * @param {number} height 
 * @param {[number, number, number, number]} rgba Couleur de remplissage [R, G, B, A]
 * @returns {Buffer}
 */
function createSolidPngBuffer(width, height, rgba = [79, 70, 229, 255]) {
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((1 + rowBytes) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowBytes);
    rawData[rowOffset] = 0; // PNG filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = rgba[0];
      rawData[pixelOffset + 1] = rgba[1];
      rawData[pixelOffset + 2] = rgba[2];
      rawData[pixelOffset + 3] = rgba[3];
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // CRC32 helper
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const check = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(check, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: Standard
  ihdr[12] = 0; // Interlace: None
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Assure la présence des icônes PWA nécessaires pour le Manifest
 */
async function ensurePwaIcons() {
  const iconsDir = path.join(__dirname, '../../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgPath = path.join(__dirname, '../../public/icons/icon.svg');
  const fallbackSvgPath = path.join(__dirname, '../../public/favicon.svg');
  const actualSvgPath = fs.existsSync(svgPath) ? svgPath : fallbackSvgPath;

  const targets = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'maskable-512.png', size: 512 }
  ];

  let canvasModule = null;
  try {
    canvasModule = require('@napi-rs/canvas');
  } catch (e) {
    // Mode fallback pur Node si le binding natif n'est pas dispo
  }

  if (canvasModule && fs.existsSync(actualSvgPath)) {
    try {
      const { createCanvas, loadImage } = canvasModule;
      const img = await loadImage(actualSvgPath);

      for (const { name, size } of targets) {
        const targetFile = path.join(iconsDir, name);
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const buf = canvas.toBuffer('image/png');
        fs.writeFileSync(targetFile, buf);
        console.log(`[PWA] Icône générée via Canvas (${buf.length} bytes): public/icons/${name}`);
      }
      return;
    } catch (canvasErr) {
      console.warn('[PWA] Échec génération Canvas avec loadImage:', canvasErr.message);
    }
  }

  // Fallback si canvas indisponible
  for (const { name, size } of targets) {
    const targetFile = path.join(iconsDir, name);
    if (!fs.existsSync(targetFile)) {
      try {
        const fallbackBuf = createSolidPngBuffer(size, size, [79, 70, 229, 255]);
        fs.writeFileSync(targetFile, fallbackBuf);
        console.log(`[PWA] Icône générée via Fallback PNG : public/icons/${name}`);
      } catch (fbErr) {
        console.error(`[PWA] Impossible de créer ${name}:`, fbErr);
      }
    }
  }
}

module.exports = {
  ensurePwaIcons,
  createSolidPngBuffer
};
