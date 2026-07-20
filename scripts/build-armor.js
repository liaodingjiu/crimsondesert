#!/usr/bin/env node
const fs = require('fs'); const path = require('path');
const DATA_FILE = path.join(__dirname, '..', 'data', 'armor.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'armor');
if (!fs.existsSync(DATA_FILE)) { console.error('armor.json not found'); process.exit(1); }
const items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const TYPE_LABELS = { plate:'Plate', leather:'Leather', cloth:'Cloth' };
const SLOT_LABELS = { head:'Head', chest:'Chest', gloves:'Gloves', boots:'Boots', cloak:'Cloak' };
let generated = 0;

for (const a of items) {
  const dir = path.join(OUTPUT_DIR, a.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tl = TYPE_LABELS[a.type] || a.type;
  const sl = SLOT_LABELS[a.slot] || a.slot;
  const charBadges = (a.character_restrictions||[]).length > 0
    ? a.character_restrictions.map(c => `<span class="char-badge">${c.charAt(0).toUpperCase()+c.slice(1)} Only</span>`).join('\n          ')
    : '<span class="tag">All Characters</span>';
  let acqHtml = '';
  const ac = a.acquisition || {};
  if (ac.method==='crafting') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Crafting</span></div>`;
  if (ac.method==='location') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Found in World</span></div>`;
  if (ac.method==='boss_drop') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Boss Drop</span></div>`;
  if (ac.method==='vendor') acqHtml += `<div class="info-row"><span class="info-label">Method</span><span class="info-value">Vendor Purchase</span></div>`;
  if (ac.recipe_slug) acqHtml += `<div class="info-row"><span class="info-label">Recipe</span><span class="info-value">${ac.recipe_slug.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</span></div>`;
  if (ac.vendor) acqHtml += `<div class="info-row"><span class="info-label">Vendor</span><span class="info-value">${ac.vendor.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}</span></div>`;
  if (ac.location) acqHtml += `<div class="info-row"><span class="info-label">Location</span><span class="info-value">${ac.location.charAt(0).toUpperCase()+ac.location.slice(1)}</span></div>`;
  const s = a.stats || {};
  const statBoxes = [
    ['Defense', s.defense, ''], ['Attack', s.attack, ''],
    ['Attack Speed', s.attack_speed, ''], ['Critical Rate', s.critical_rate, ''],
    ['Movement Speed', s.movement_speed, ''], ['Stamina Regen', s.stamina_regen, '%'],
    ['Spirit Regen', s.spirit_regen, '/sec']
  ].map(([label, val, suffix]) => {
    if (val === 0 && label !== 'Defense' && label !== 'Attack') return '';
    return `<div class="stat-box"><div class="stat-value">${val}${val>0&&suffix?' '+suffix:''}</div><div class="stat-label">${label}</div></div>`;
  }).filter(Boolean).join('\n          ');
  const setBonusHtml = a.set_bonus ? `
  <section class="info-section"><h2>Set Bonus — ${a.set_name||'Set'}</h2><p>${a.set_bonus.description}</p><p style="color:var(--text3);font-size:13px;margin-top:4px;">Requires ${a.set_bonus.pieces_required} pieces equipped.</p></section>` : '';
  const desc = (a.description||'').replace(/"/g, '\\"');
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
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<title>${a.name} — ${tl} ${sl} | CrimsonDesertDB</title>
<meta name="description" content="${a.name} — ${tl} ${sl}. DEF ${s.defense}${s.attack?', ATK '+s.attack:''}. ${a.description||''}">
<meta name="keywords" content="${a.name}, Crimson Desert armor, ${tl} armor, ${sl} armor, ${a.rarity} armor, Crimson Desert ${a.name}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://pyweldb.com/armor/${a.slug}/">
<meta property="og:title" content="${a.name} — Crimson Desert ${tl} ${sl}">
<meta property="og:description" content="DEF ${s.defense}${s.attack?' | ATK '+s.attack:''} — ${a.rarity.toUpperCase()}${a.set_name?' | '+a.set_name:''}">
<meta property="og:image" content="https://pyweldb.com/images/og-default.webp">
<meta property="og:type" content="website">
<meta property="og:url" content="https://pyweldb.com/armor/${a.slug}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${a.name} — Crimson Desert ${tl} ${sl}">
<meta name="twitter:description" content="DEF ${s.defense}${s.attack?' | ATK '+s.attack:''} — ${a.rarity.toUpperCase()}${a.set_name?' | '+a.set_name:''}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/shared.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":"${a.name}","description":"${desc}","category":"Armor > ${tl} > ${sl}","additionalProperty":[{"@type":"PropertyValue","name":"Defense","value":"${s.defense||0}"},{"@type":"PropertyValue","name":"Type","value":"${tl}"},{"@type":"PropertyValue","name":"Slot","value":"${sl}"},{"@type":"PropertyValue","name":"Rarity","value":"${a.rarity}"}],"aggregateRating":{"@type":"AggregateRating","ratingValue":${a.tier},"bestRating":4,"worstRating":1,"ratingCount":1}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://pyweldb.com/"},{"@type":"ListItem","position":2,"name":"Armor","item":"https://pyweldb.com/armor/"},{"@type":"ListItem","position":3,"name":"${a.name}","item":"https://pyweldb.com/armor/${a.slug}/"}]}
</script>
</head>
<body>
<div class="top-bar">Crimson Desert Database — Your data-driven companion for Crimson Desert</div>
<nav aria-label="Main navigation"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-icon">CD</span>Crimson<span>DB</span></a>
  <a href="/weapons/" class="nav-link">Weapons</a><a href="/armor/" class="nav-link">Armor</a><a href="/accessories/" class="nav-link">Accessories</a><a href="/skills/" class="nav-link">Skills</a><a href="/abyss-gears/" class="nav-link">Abyss Gears</a><a href="/characters/" class="nav-link">Characters</a><a href="/enemies/" class="nav-link">Enemies</a><a href="/crafting/" class="nav-link">Crafting</a><a href="/tools/map/" class="nav-link">Map</a>
</div></nav>
<div class="page">
<div class="detail-hero">
<nav class="breadcrumb"><a href="/">Home</a> <span class="sep">/</span> <a href="/armor/">Armor</a> <span class="sep">/</span> <span>${a.name}</span></nav>
<div class="detail-header">
<div class="detail-icon"><img src="${a.image||'/images/armor/placeholder.webp'}" alt="${a.name}" onerror="this.parentElement.textContent='🛡️'"></div>
<div class="detail-title-block">
<h1>${a.name} <span class="rarity-badge r-${a.rarity}">${a.rarity.toUpperCase()}</span></h1>
<p class="detail-sub">${tl} · ${sl} · Tier ${a.tier}${a.set_name?' · '+a.set_name:''}</p>
<p class="detail-sub">Required Level: ${a.required_level}</p>
<div class="detail-tags">${charBadges}</div></div></div></div>
<div class="ad-box ad-banner ad-placeholder">Advertisement</div>
<section class="info-section"><h2>Stats</h2><div class="stats-panel">${statBoxes}</div></section>
${a.description?`<section class="info-section"><h2>Description</h2><p>${a.description}</p></section>`:''}
${setBonusHtml}
${acqHtml?`<section class="info-section"><h2>Acquisition</h2><div class="info-grid">${acqHtml}</div></section>`:''}
<div class="ad-box ad-rectangle ad-placeholder">Advertisement</div>
<p class="suggest-edit">See something wrong? <a href="/contact.html">Suggest an edit</a>.</p>
</div>
<footer><div class="footer-inner"><div class="footer-col"><h4>Database</h4><a href="/weapons/">Weapons</a><a href="/armor/">Armor</a><a href="/accessories/">Accessories</a><a href="/skills/">Skills</a><a href="/abyss-gears/">Abyss Gears</a><a href="/enemies/">Enemies</a><a href="/crafting/">Crafting</a></div><div class="footer-col"><h4>Tools</h4><a href="/tools/map/">Interactive Map</a><a href="/tools/build-calculator/">Build Calculator</a><a href="/tools/skill-planner/">Skill Planner</a></div><div class="footer-col"><h4>Site</h4><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Use</a><a href="/contact.html">Contact</a></div></div><div class="footer-bottom">CrimsonDesertDB is a fan-made database. Crimson Desert is a trademark of <a href="https://pearlabyss.com" rel="noopener" target="_blank">Pearl Abyss</a>.</div></footer>
<script src="/cookie-consent.js"></script>
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "xmc7yr076a");
</script>
</body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  generated++;
}
console.log(`Generated ${generated} armor detail pages.`);
