const http = require('http');
const path = require('path');
const fs = require('fs');

console.log('Testing PWA files integrity...');

const files = [
  'public/manifest.webmanifest',
  'public/sw.js',
  'public/offline.html',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/icons/maskable-512.png',
  'public/icons/icon.svg'
];

for (const f of files) {
  const p = path.join(__dirname, '..', f);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing file: ${f}`);
  }
  const stat = fs.statSync(p);
  console.log(`✓ ${f} (${stat.size} bytes)`);
}

// Check manifest properties
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/manifest.webmanifest'), 'utf8'));
if (!manifest.name || !manifest.icons || manifest.icons.length < 3) {
  throw new Error('Manifest is missing required fields');
}
console.log('✓ Manifest schema & icons OK');

// Check SW contents
const swContent = fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf8');
if (!swContent.includes('install') || !swContent.includes('fetch') || !swContent.includes('offline.html')) {
  throw new Error('Service worker is missing critical lifecycle events');
}
console.log('✓ Service Worker handlers OK');

// Check storageManager
const smContent = fs.readFileSync(path.join(__dirname, '../public/storageManager.js'), 'utf8');
if (!smContent.includes('DB_VERSION = 2') || !smContent.includes('outbox') || !smContent.includes('queueOutboxAction')) {
  throw new Error('storageManager.js does not have DB v2 or outbox methods');
}
console.log('✓ storageManager.js DB v2 & Outbox OK');

console.log('\nAll PWA integrity tests passed successfully!');
