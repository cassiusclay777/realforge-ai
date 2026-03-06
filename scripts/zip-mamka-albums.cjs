/**
 * Projde mamka-reality-fotky a u složek bez .zip vytvoří ZIP z všech .jpg/.jpeg.
 * Použití: node scripts/zip-mamka-albums.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const AdmZip = require('adm-zip');

const ROOT = path.join(__dirname, '..', 'mamka-reality-fotky');

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error('Složka mamka-reality-fotky neexistuje.');
    process.exit(1);
  }

  const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let created = 0;
  let skipped = 0;

  for (const dirName of dirs) {
    const dirPath = path.join(ROOT, dirName);
    const files = fs.readdirSync(dirPath);
    const zips = files.filter(f => /\.zip$/i.test(f));
    const images = files.filter(f => /\.(jpg|jpeg)$/i.test(f)).sort();

    if (images.length === 0) {
      console.log(`[skip] ${dirName} – žádné JPG`);
      skipped++;
      continue;
    }

    if (zips.length > 0) {
      console.log(`[ok]   ${dirName} – už má ZIP`);
      skipped++;
      continue;
    }

    const zip = new AdmZip();
    for (const img of images) {
      zip.addLocalFile(path.join(dirPath, img), '', img);
    }
    const zipName = dirName.replace(/[<>:"/\\|?*]/g, '_') + '.zip';
    const zipPath = path.join(dirPath, zipName);
    zip.writeZip(zipPath);
    console.log(`[new]  ${dirName} → ${zipName} (${images.length} fotek)`);
    created++;
  }

  console.log('\nHotovo. Vytvořeno:', created, ', přeskočeno:', skipped);
}

main();
