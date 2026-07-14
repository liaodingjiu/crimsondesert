#!/usr/bin/env node
/**
 * build-data-js.js
 * Reads each JSON file from data/ and generates a JS file in the
 * corresponding category directory, assigning the array to window.__XXX__.
 *
 * Usage: node scripts/build-data-js.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const VAR_MAP = {
  'weapons.json':      { dir: 'weapons',      var: '__WEAPONS__' },
  'armor.json':        { dir: 'armor',         var: '__ARMOR__' },
  'accessories.json':  { dir: 'accessories',   var: '__ACCESSORIES__' },
  'skills.json':       { dir: 'skills',        var: '__SKILLS__' },
  'abyss-gears.json':  { dir: 'abyss-gears',   var: '__ABYSS_GEARS__' },
  'enemies.json':      { dir: 'enemies',       var: '__ENEMIES__' },
  'crafting-recipes.json': { dir: 'crafting',  var: '__CRAFTING__' },
  'cooking-recipes.json':  { dir: 'cooking',   var: '__COOKING__' },
  'alchemy-recipes.json':  { dir: 'alchemy',   var: '__ALCHEMY__' },
  'mounts.json':       { dir: 'mounts',        var: '__MOUNTS__' },
  'materials.json':    { dir: 'materials',     var: '__MATERIALS__' },
  'characters.json':   { dir: 'characters',    var: '__CHARACTERS__' },
};

let count = 0;

for (const [filename, config] of Object.entries(VAR_MAP)) {
  const jsonPath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(jsonPath)) {
    console.log(`  SKIP ${filename} — file not found`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const targetDir = path.join(__dirname, '..', config.dir);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const outPath = path.join(targetDir, `${config.dir}-data.js`);
  const js = `window.${config.var} = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(outPath, js, 'utf-8');
  console.log(`  OK   ${filename} → ${config.dir}/${config.dir}-data.js (${data.length} entries)`);
  count++;
}

console.log(`\nDone. Generated ${count} data JS files.`);
