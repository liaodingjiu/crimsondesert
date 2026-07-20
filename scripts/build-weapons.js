#!/usr/bin/env node
/**
 * build-weapons.js
 * Generates individual weapon detail pages at weapons/{slug}/index.html
 *
 * Usage: node scripts/build-weapons.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'weapons.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'weapons');

if (!fs.existsSync(DATA_FILE)) { console.error('weapons.json not found'); process.exit(1); }

const weapons = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

const TYPE_LABELS = {
  'one-handed-sword': '1H Sword', 'two-handed-sword': '2H Sword',
  'spear': 'Spear', 'axe': 'Axe', 'dagger': 'Dagger', 'bow': 'Bow',
  'one-handed-axe': '1H Axe', 'two-handed-axe': '2H Axe',
};

const CLASS_LABELS = { 'one-handed': 'One-Handed', 'two-handed': 'Two-Handed' };

let generated = 0;

for (const w of weapons) {
  const dir = path.join(OUTPUT_DIR, w.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const imagePlaceholder = w.image || '/images/weapons/placeholder.webp';
  const typeLabel = TYPE_LABELS[w.type] || w.type;
  const classLabel = CLASS_LABELS[w.class] || w.class;

  // Build character restriction badges
  const charBadges = (w.character_restrictions || []).length > 0
    ? w.character_restrictions.map(c =>
        `<span class="char-badge">${c.charAt(0).toUpperCase() + c.slice(1)} Only</span>`).join('\n          ')
    : '<span class="tag">All Characters</span>';

  // Build acquisition info
  let acqHtml = '';
  if (w.acquisition) {
    const a = w.acquisition;
    if (a.method === 'crafting') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Crafting</span></div>`;
    if (a.method === 'location') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Found in World</span></div>`;
    if (a.method === 'boss_drop') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Boss Drop</span></div>`;
    if (a.method === 'vendor') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Vendor Purchase</span></div>`;
    if (a.recipe_slug) acqHtml += `<div class="info-row"><span class="info-label">Recipe</span><span class="info-value">${a.recipe_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div>`;
    if (a.vendor) acqHtml += `<div class="info-row"><span class="info-label">Vendor</span><span class="info-value">${a.vendor.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span></div>`;
    if (a.boss_drop) acqHtml += `<div class="info-row"><span class="info-label">Boss</span><span class="info-value">${a.boss_drop.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span></div>`;
    if (a.location) acqHtml += `<div class="info-row"><span class="info-label">Location</span><span class="info-value">${a.location.charAt(0).toUpperCase() + a.location.slice(1)}</span></div>`;
  }

  // Stat boxes
  const stats = w.stats || {};
  const statEntries = [
    ['Attack', stats.attack, ''],
    ['Defense', stats.defense, ''],
    ['Attack Speed', stats.attack_speed, stats.attack_speed > 0 ? 'Lv' : ''],
    ['Critical Rate', stats.critical_rate, stats.critical_rate > 0 ? 'Lv' : ''],
    ['Movement Speed', stats.movement_speed, stats.movement_speed > 0 ? 'Lv' : ''],
    ['Stamina Regen', stats.stamina_regen, stats.stamina_regen > 0 ? '%' : ''],
    ['Spirit Regen', stats.spirit_regen, stats.spirit_regen > 0 ? '/sec' : ''],
  ];

  const statBoxes = statEntries.map(([label, val, suffix]) => {
    if (val === 0 && label !== 'Attack' && label !== 'Defense') return '';
    return `<div class="stat-box">
      <div class="stat-value">${val > 0 && (label.includes('Speed') || label.includes('Rate')) ? suffix + ' ' + val : val}${val > 0 && label.includes('Regen') ? ' ' + suffix : ''}</div>
      <div class="stat-label">${label}</div>
    </div>`;
  }).filter(Boolean).join('\n          ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2NNCE5PJ6S"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-2NNCE5PJ6S');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<title>${w.name} — ${typeLabel} | CrimsonDesertDB</title>
<meta name="description" content="${w.name} — ${typeLabel} (${classLabel}). ATK ${stats.attack}, Speed ${stats.attack_speed}, Crit ${stats.critical_rate}. ${w.description}">
<meta name="keywords" content="${w.name}, Crimson Desert ${typeLabel}, Crimson Desert weapon, ${w.rarity} weapon, ${classLabel} weapon, Crimson Desert ${w.name}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://pyweldb.com/weapons/${w.slug}/">
<meta property="og:title" content="${w.name} — Crimson Desert ${typeLabel}">
<meta property="og:description" content="ATK ${stats.attack} | Speed ${stats.attack_speed} | Crit ${stats.critical_rate} — ${w.rarity.toUpperCase()}">
<meta property="og:image" content="https://pyweldb.com/images/og-default.webp">
<meta property="og:type" content="website">
<meta property="og:url" content="https://pyweldb.com/weapons/${w.slug}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${w.name} — Crimson Desert ${typeLabel}">
<meta name="twitter:description" content="ATK ${stats.attack} | Speed ${stats.attack_speed} | Crit ${stats.critical_rate} — ${w.rarity.toUpperCase()}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/shared.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "${w.name}",
  "description": "${w.description.replace(/"/g, '\\"')}",
  "category": "Weapon > ${typeLabel}",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Attack", "value": "${stats.attack}" },
    { "@type": "PropertyValue", "name": "Attack Speed", "value": "${stats.attack_speed}" },
    { "@type": "PropertyValue", "name": "Critical Rate", "value": "${stats.critical_rate}" },
    { "@type": "PropertyValue", "name": "Rarity", "value": "${w.rarity}" },
    { "@type": "PropertyValue", "name": "Tier", "value": "${w.tier}" }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": ${w.tier},
    "bestRating": 5,
    "worstRating": 1,
    "ratingCount": 1
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pyweldb.com/" },
    { "@type": "ListItem", "position": 2, "name": "Weapons", "item": "https://pyweldb.com/weapons/" },
    { "@type": "ListItem", "position": 3, "name": "${w.name}", "item": "https://pyweldb.com/weapons/${w.slug}/" }
  ]
}
</script>
</head>
<body>
<div class="top-bar">Crimson Desert Database — Your data-driven companion for Crimson Desert</div>
<nav aria-label="Main navigation">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-icon">CD</span>Crimson<span>DB</span></a>
    <a href="/weapons/" class="nav-link">Weapons</a><a href="/armor/" class="nav-link">Armor</a><a href="/accessories/" class="nav-link">Accessories</a><a href="/skills/" class="nav-link">Skills</a><a href="/abyss-gears/" class="nav-link">Abyss Gears</a><a href="/characters/" class="nav-link">Characters</a><a href="/enemies/" class="nav-link">Enemies</a><a href="/crafting/" class="nav-link">Crafting</a><a href="/tools/map/" class="nav-link">Map</a>
  </div>
</nav>

<div class="page">
  <div class="detail-hero">
    <nav class="breadcrumb">
      <a href="/">Home</a> <span class="sep">/</span>
      <a href="/weapons/">Weapons</a> <span class="sep">/</span>
      <span>${w.name}</span>
    </nav>
    <div class="detail-header">
      <div class="detail-icon"><img src="${imagePlaceholder}" alt="${w.name}" onerror="this.parentElement.textContent='⚔️'"></div>
      <div class="detail-title-block">
        <h1>${w.name} <span class="rarity-badge r-${w.rarity}">${w.rarity.toUpperCase()}</span></h1>
        <p class="detail-sub">${typeLabel} · ${classLabel} · Tier ${w.tier}</p>
        <p class="detail-sub">Required Level: ${w.required_level}</p>
        <div class="detail-tags">
${charBadges}
          ${w.stats && w.stats.attack_speed > 0 ? `<span class="tag">⚡ Atk Speed Lv ${w.stats.attack_speed}</span>` : ''}
          ${w.stats && w.stats.critical_rate > 0 ? `<span class="tag">💥 Crit Lv ${w.stats.critical_rate}</span>` : ''}
        </div>
      </div>
    </div>
  </div>

  <div class="ad-box ad-banner ad-placeholder">Advertisement</div>

  <section class="info-section">
    <h2>Stats</h2>
    <div class="stats-panel">
${statBoxes}
    </div>
  </section>

  ${w.description ? `
  <section class="info-section">
    <h2>Description</h2>
    <p>${w.description}</p>
  </section>` : ''}

  ${acqHtml ? `
  <section class="info-section">
    <h2>Acquisition</h2>
    <div class="info-grid">
${acqHtml}
    </div>
  </section>` : ''}

  <div class="ad-box ad-rectangle ad-placeholder">Advertisement</div>

  <p class="suggest-edit">See something wrong? <a href="/contact.html">Suggest an edit</a>.</p>
</div>

<footer>
  <div class="footer-inner">
    <div class="footer-col"><h4>Database</h4><a href="/weapons/">Weapons</a><a href="/armor/">Armor</a><a href="/accessories/">Accessories</a><a href="/skills/">Skills</a><a href="/abyss-gears/">Abyss Gears</a><a href="/enemies/">Enemies</a><a href="/crafting/">Crafting</a></div>
    <div class="footer-col"><h4>Tools</h4><a href="/tools/map/">Interactive Map</a><a href="/tools/build-calculator/">Build Calculator</a><a href="/tools/skill-planner/">Skill Planner</a></div>
    <div class="footer-col"><h4>Site</h4><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Use</a><a href="/contact.html">Contact</a></div>
  </div>
  <div class="footer-bottom">CrimsonDesertDB is a fan-made database. Crimson Desert is a trademark of <a href="https://pearlabyss.com" rel="noopener" target="_blank">Pearl Abyss</a>.</div>
</footer>
<script src="/cookie-consent.js"></script>
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "xmc7yr076a");
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  generated++;
}

console.log(`Generated ${generated} weapon detail pages.`);
