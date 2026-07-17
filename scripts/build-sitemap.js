#!/usr/bin/env node
const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://pyweldb.com';

const STATIC = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/weapons/', priority: '0.9', changefreq: 'weekly' },
  { url: '/armor/', priority: '0.9', changefreq: 'weekly' },
  { url: '/accessories/', priority: '0.9', changefreq: 'weekly' },
  { url: '/skills/', priority: '0.9', changefreq: 'weekly' },
  { url: '/abyss-gears/', priority: '0.8', changefreq: 'weekly' },
  { url: '/characters/', priority: '0.8', changefreq: 'weekly' },
  { url: '/enemies/', priority: '0.8', changefreq: 'weekly' },
  { url: '/crafting/', priority: '0.8', changefreq: 'weekly' },
  { url: '/equipment/', priority: '0.8', changefreq: 'weekly' },
  { url: '/cooking/', priority: '0.7', changefreq: 'monthly' },
  { url: '/alchemy/', priority: '0.5', changefreq: 'monthly' },
  { url: '/mounts/', priority: '0.7', changefreq: 'monthly' },
  { url: '/guides/', priority: '0.7', changefreq: 'monthly' },
  { url: '/best-early-game/', priority: '0.7', changefreq: 'monthly' },
  { url: '/tools/map/', priority: '0.8', changefreq: 'monthly' },
  { url: '/tools/build-calculator/', priority: '0.7', changefreq: 'monthly' },
  { url: '/tools/skill-planner/', priority: '0.6', changefreq: 'monthly' },
  { url: '/tools/recipe-finder/', priority: '0.6', changefreq: 'monthly' },
  { url: '/tools/equipment-compare/', priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms.html', priority: '0.3', changefreq: 'yearly' },
  { url: '/contact.html', priority: '0.3', changefreq: 'yearly' },
];

function findDetailPages(dir, urlPrefix) {
  const entries = [];
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return entries;
  const items = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory() && !['.','..'].includes(item.name)) {
      const detailPath = path.join(fullDir, item.name, 'index.html');
      if (fs.existsSync(detailPath)) {
        entries.push({
          url: `/${dir}/${item.name}/`,
          priority: '0.7',
          changefreq: 'monthly',
        });
      }
    }
  }
  return entries;
}

const detailDirs = ['weapons', 'armor', 'accessories', 'skills', 'abyss-gears'];
let allEntries = [...STATIC];
for (const d of detailDirs) {
  allEntries = allEntries.concat(findDetailPages(d));
}

const urls = allEntries.map(e =>
  `  <url><loc>${BASE}${e.url}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`Sitemap generated: ${allEntries.length} URLs`);
