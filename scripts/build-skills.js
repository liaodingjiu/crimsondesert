#!/usr/bin/env node
const fs = require('fs'); const path = require('path');
const DATA = path.join(__dirname, '..', 'data', 'skills.json');
const OUT = path.join(__dirname, '..', 'skills');
if (!fs.existsSync(DATA)) { console.error('skills.json not found'); process.exit(1); }
const items = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
const CHAR_LABELS = { kliff:'Kliff', oongka:'Oongka', damiane:'Damiane' };
const TREE_LABELS = { warrior:'Warrior', defender:'Defender', tactician:'Tactician', destroyer:'Destroyer', juggernaut:'Juggernaut', mystic:'Mystic', elementalist:'Elementalist' };
const TYPE_LABELS = { active:'Active', passive:'Passive', ultimate:'Ultimate' };
let n = 0;

for (const sk of items) {
  const dir = path.join(OUT, sk.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const cl = CHAR_LABELS[sk.character] || sk.character;
  const trl = TREE_LABELS[sk.skill_tree] || sk.skill_tree;
  const stl = TYPE_LABELS[sk.skill_type] || sk.skill_type;

  const skillInfo = [];
  if (sk.cost) skillInfo.push(`<div class="info-row"><span class="info-label">Cost</span><span class="info-value">${sk.cost.amount} ${sk.cost.type}</span></div>`);
  if (sk.cooldown>0) skillInfo.push(`<div class="info-row"><span class="info-label">Cooldown</span><span class="info-value">${sk.cooldown}s</span></div>`);
  if (sk.damage_multiplier>0) skillInfo.push(`<div class="info-row"><span class="info-label">Damage Multiplier</span><span class="info-value">×${sk.damage_multiplier}</span></div>`);
  if (sk.weapon_required) skillInfo.push(`<div class="info-row"><span class="info-label">Weapon Required</span><span class="info-value">${sk.weapon_required.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}</span></div>`);
  const infoHtml = skillInfo.join('\n          ');

  // Effects list
  let effectsHtml = '';
  if (sk.effects && sk.effects.length > 0) {
    effectsHtml = sk.effects.map(e => {
      let desc = `<strong>${e.type.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</strong>`;
      if (e.base_damage) desc += ` — ${e.base_damage} damage`;
      if (e.radius) desc += `, Radius: ${e.radius}m`;
      if (e.duration) desc += `, Duration: ${e.duration}s`;
      if (e.stat) desc += `, ${e.stat}: ${e.amount>0?'+'+e.amount:e.amount}`;
      return `<p>${desc}</p>`;
    }).join('\n            ');
  }

  // Upgrade levels
  let upgradesHtml = '';
  if (sk.upgrade_levels && sk.upgrade_levels.length > 0) {
    upgradesHtml = '<div class="info-grid">' + sk.upgrade_levels.map(u => {
      const props = Object.entries(u).filter(([k])=>k!=='level').map(([k,v])=>`${k.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}: ${typeof v==='boolean'?(v?'Yes':'No'):v}`).join(', ');
      return `<div class="info-row"><span class="info-label">Level ${u.level}</span><span class="info-value">${props}</span></div>`;
    }).join('') + '</div>';
  }
  const desc = (sk.description||'').replace(/"/g,'\\"');
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
<title>${sk.name} — ${cl} ${stl} Skill | CrimsonDesertDB</title>
<meta name="description" content="${sk.name} — ${cl}'s ${trl} tree, ${stl} skill. ${sk.description||''}">
<meta name="keywords" content="${sk.name}, Crimson Desert skill, ${cl} skill, ${stl} skill, ${trl} tree, Crimson Desert ${sk.name}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://pyweldb.com/skills/${sk.slug}/">
<meta property="og:title" content="${sk.name} — ${cl} Skill | CrimsonDesertDB">
<meta property="og:description" content="${stl} · ${trl} Tree · ${cl}${sk.weapon_required?' · Requires '+sk.weapon_required:''}">
<meta property="og:image" content="https://pyweldb.com/images/og-default.webp">
<meta property="og:type" content="website"><meta property="og:url" content="https://pyweldb.com/skills/${sk.slug}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${sk.name} — ${cl} Skill | CrimsonDesertDB">
<meta name="twitter:description" content="${stl} · ${trl} Tree · ${cl}${sk.weapon_required?' · Requires '+sk.weapon_required:''}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/shared.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":"${sk.name}","description":"${desc}","category":"Skill > ${cl}","additionalProperty":[{"@type":"PropertyValue","name":"Character","value":"${cl}"},{"@type":"PropertyValue","name":"Skill Tree","value":"${trl}"},{"@type":"PropertyValue","name":"Type","value":"${stl}"}],"aggregateRating":{"@type":"AggregateRating","ratingValue":${sk.tier},"bestRating":3,"worstRating":1,"ratingCount":1}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://pyweldb.com/"},{"@type":"ListItem","position":2,"name":"Skills","item":"https://pyweldb.com/skills/"},{"@type":"ListItem","position":3,"name":"${sk.name}","item":"https://pyweldb.com/skills/${sk.slug}/"}]}
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
<nav class="breadcrumb"><a href="/">Home</a> <span class="sep">/</span> <a href="/skills/">Skills</a> <span class="sep">/</span> <span>${sk.name}</span></nav>
<div class="detail-header">
<div class="detail-icon"><img src="${sk.image||'/images/skills/placeholder.webp'}" alt="${sk.name}" onerror="this.parentElement.textContent='⚡'"></div>
<div class="detail-title-block">
<h1>${sk.name} <span class="rarity-badge" style="background:var(--accent-l);color:var(--accent-d);">${stl.toUpperCase()}</span></h1>
<p class="detail-sub">${cl} · ${trl} Tree · ${stl} Skill · Tier ${sk.tier}</p>
${sk.prerequisites&&sk.prerequisites.length>0?`<p class="detail-sub">Prerequisites: ${sk.prerequisites.map(p=>p.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())).join(', ')}</p>`:''}
<div class="detail-tags"><span class="tag">${cl}</span><span class="tag">${trl}</span>${sk.weapon_required?`<span class="tag">${sk.weapon_required.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}</span>`:''}</div>
</div></div></div>
<div class="ad-box ad-banner ad-placeholder">Advertisement</div>
${infoHtml?`<section class="info-section"><h2>Skill Info</h2><div class="info-grid">${infoHtml}</div></section>`:''}
${sk.description?`<section class="info-section"><h2>Description</h2><p>${sk.description}</p></section>`:''}
${effectsHtml?`<section class="info-section"><h2>Effects</h2>${effectsHtml}</section>`:''}
${upgradesHtml?`<section class="info-section"><h2>Upgrade Levels</h2>${upgradesHtml}</section>`:''}
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
  n++;
}
console.log(`Generated ${n} skill detail pages.`);
