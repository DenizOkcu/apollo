/**
 * build-agc-index.js
 *
 * Copies Apollo 11 AGC source files (.agc) from Apollo-11/Luminary099 and
 * Apollo-11/Comanche055 into app/public/agc/ and generates a JSON manifest
 * (agc-index.json) listing all files grouped by module.
 *
 * Run: node app/scripts/build-agc-index.js
 */

import { readdir, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const MODULES = [
  { name: 'Luminary099', label: 'LUNAR MODULE (LM)' },
  { name: 'Comanche055', label: 'COMMAND MODULE (CM)' },
];

const SRC_DIR = join(ROOT, 'Apollo-11');
const OUT_DIR = join(ROOT, 'app', 'public', 'agc');

async function build() {
  const index = { modules: [] };

  for (const mod of MODULES) {
    const srcPath = join(SRC_DIR, mod.name);
    const destPath = join(OUT_DIR, mod.name);

    await mkdir(destPath, { recursive: true });

    const entries = await readdir(srcPath);
    const agcFiles = entries.filter(f => f.endsWith('.agc')).sort();

    for (const file of agcFiles) {
      await copyFile(join(srcPath, file), join(destPath, file));
    }

    index.modules.push({
      name: mod.name,
      label: mod.label,
      files: agcFiles,
    });

    console.log(`  ${mod.name}: ${agcFiles.length} files copied`);
  }

  await writeFile(
    join(OUT_DIR, 'agc-index.json'),
    JSON.stringify(index, null, 2) + '\n',
  );

  console.log('  agc-index.json written');
  console.log('Done.');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
