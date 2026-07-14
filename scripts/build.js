#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const SCRIPTS = path.join(__dirname);

const steps = [
  ['build-data-js.js', 'Generate data JS files'],
  ['build-weapons.js', 'Generate weapon detail pages'],
  ['build-armor.js', 'Generate armor detail pages'],
  ['build-accessories.js', 'Generate accessory detail pages'],
  ['build-skills.js', 'Generate skill detail pages'],
  ['build-sitemap.js', 'Generate sitemap.xml'],
];

let ok = 0, fail = 0;
for (const [script, desc] of steps) {
  const scriptPath = path.join(SCRIPTS, script);
  console.log(`\n── ${desc} ──`);
  try {
    execSync(`node "${scriptPath}"`, { cwd: path.join(SCRIPTS, '..'), stdio: 'inherit' });
    ok++;
  } catch (e) {
    console.error(`  FAIL: ${script}`);
    fail++;
  }
}
console.log(`\n=== Build complete: ${ok} OK, ${fail} FAILED ===`);
