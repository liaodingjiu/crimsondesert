#!/usr/bin/env python3
"""Add 'Related Items' section to all 67 equipment/skill detail pages."""

import json, re, os

ROOT = '/Users/judy/Knowledge/ObsidianVault/70-Projects/wangzhan/CrimsonDesert'

def load_json(path):
    with open(os.path.join(ROOT, 'data', path), 'r') as f:
        return json.load(f)

weapons = load_json('weapons.json')
armor = load_json('armor.json')
accessories = load_json('accessories.json')
skills = load_json('skills.json')

# ── Build lookup maps ──
weapon_by_slug = {w['slug']: w for w in weapons}
armor_by_slug = {a['slug']: a for a in armor}
acc_by_slug = {a['slug']: a for a in accessories}
skill_by_slug = {s['slug']: s for s in skills}

def rarity_order(r):
    return {'legendary':5,'epic':4,'rare':3,'uncommon':2,'common':1}.get(r,0)

def find_related_weapons(item):
    """Find related weapons: same type, or same boss_drop, or same rarity tier."""
    slug = item['slug']
    related = {}

    # Same boss drop
    boss = (item.get('acquisition') or {}).get('boss_drop')
    if boss:
        for w in weapons:
            if w['slug'] == slug: continue
            wboss = (w.get('acquisition') or {}).get('boss_drop')
            if wboss == boss:
                related[w['slug']] = (w, 'Same Boss')

    # Same weapon type
    for w in weapons:
        if w['slug'] == slug or w['slug'] in related: continue
        if w['type'] == item['type']:
            related[w['slug']] = (w, 'Same Type')

    # Same rarity (fill to at least 3)
    if len(related) < 3:
        same_rarity = [w for w in weapons if w['slug'] != slug and w['slug'] not in related and w['rarity'] == item['rarity']]
        same_rarity.sort(key=lambda w: rarity_order(w['rarity']), reverse=True)
        for w in same_rarity[:3 - len(related)]:
            related[w['slug']] = (w, 'Same Rarity')

    return list(related.values())[:4]

def find_related_armor(item):
    slug = item['slug']
    related = {}

    # Same set
    set_name = item.get('set_name')
    if set_name:
        for a in armor:
            if a['slug'] == slug: continue
            if a.get('set_name') == set_name:
                related[a['slug']] = (a, 'Same Set')

    # Same slot
    for a in armor:
        if a['slug'] == slug or a['slug'] in related: continue
        if a['slot'] == item['slot'] and a['type'] == item['type']:
            related[a['slug']] = (a, 'Same Slot')

    # Same rarity fill
    if len(related) < 3:
        for a in armor:
            if a['slug'] == slug or a['slug'] in related: continue
            if a['rarity'] == item['rarity']:
                related[a['slug']] = (a, 'Same Rarity')
                if len(related) >= 3: break

    return list(related.values())[:4]

def find_related_accessories(item):
    slug = item['slug']
    related = {}

    # Same type
    for a in accessories:
        if a['slug'] == slug: continue
        if a['type'] == item['type']:
            related[a['slug']] = (a, 'Same Type')

    # Same acquisition method (boss_drop)
    acq = (item.get('acquisition') or {}).get('method')
    if acq:
        for a in accessories:
            if a['slug'] == slug or a['slug'] in related: continue
            if (a.get('acquisition') or {}).get('method') == acq:
                related[a['slug']] = (a, 'Same Source')

    # Same rarity fill
    if len(related) < 3:
        for a in accessories:
            if a['slug'] == slug or a['slug'] in related: continue
            if a['rarity'] == item['rarity']:
                related[a['slug']] = (a, 'Same Rarity')
                if len(related) >= 3: break

    return list(related.values())[:4]

def find_related_skills(item):
    slug = item['slug']
    related = {}

    # Same character
    for s in skills:
        if s['slug'] == slug: continue
        if s['character'] == item['character'] and s['skill_tree'] == item['skill_tree']:
            related[s['slug']] = (s, 'Same Tree')

    # Same skill type (Ultimate, Active, Passive)
    for s in skills:
        if s['slug'] == slug or s['slug'] in related: continue
        if s['skill_type'] == item['skill_type'] and s['character'] == item['character']:
            related[s['slug']] = (s, 'Same Character')

    return list(related.values())[:4]

def make_related_html(items, base_url):
    if not items: return ''
    cards = ''
    for item, reason in items:
        rarity = item.get('rarity', 'common')
        stats = item.get('stats', {})
        stats_str = ''
        if stats.get('attack'): stats_str += f" ATK {stats['attack']}"
        if stats.get('defense'): stats_str += f" DEF {stats['defense']}"
        # Skills display
        if item.get('skill_type'):
            stype = item.get('skill_type','?').title()
            stats_str = f"{stype} · {item.get('character','?').title()}"
        cards += f'<a href="{base_url}{item["slug"]}/" class="item-card"><span class="item-rarity r-{rarity}">{rarity.upper()}</span><div class="item-img">⚡</div><span class="item-name">{item["name"]}</span><span class="item-meta">{stats_str.strip() or "—"}</span><span class="item-meta" style="color:var(--accent-d);font-size:12px">{reason}</span></a>'
    return f'''<div style="margin-top:24px">
  <h2 style="font-size:20px;font-weight:600;margin-bottom:12px;color:var(--text);padding-bottom:10px;border-bottom:1px solid var(--border)">Related Items</h2>
  <div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">{cards}</div>
</div>'''

def update_file(filepath, related_html):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove any existing Related Items sections (handles duplicates from previous runs)
    content = re.sub(
        r'<div style="margin-top:24px">\s*<h2[^>]*>Related Items</h2>.*?</div>\s*</div>\s*</div>\s*</div>',
        '', content, flags=re.DOTALL
    )
    content = re.sub(
        r'<div style="margin-top:24px">\s*<h2[^>]*>Related Items</h2>.*?</div>\s*</div>',
        '', content, flags=re.DOTALL
    )

    # Remove double-closing divs that might remain after removal
    content = re.sub(r'(\n</div>){3,}', '\n</div>\n</div>', content)

    # Insert before closing </div> that precedes <footer>
    if related_html:
        # Try to find the right insertion point — before the last </div> before <footer>
        # Pattern: ...</div>\n\n<footer> or ...</div>\n<footer> or ...</div></div><footer>
        if re.search(r'</div>\s*\n\s*<footer>', content):
            content = re.sub(r'(</div>\s*\n\s*<footer>)', related_html + r'\n\1', content)
        elif re.search(r'</div></div><footer>', content):
            content = re.sub(r'(</div></div><footer>)', related_html + r'\1', content)
        elif re.search(r'</div>\s*<footer>', content):
            content = re.sub(r'(</div>\s*<footer>)', related_html + r'\n\1', content)
        else:
            # Fallback: insert before </body>
            content = content.replace('</body>', related_html + '\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

updated = 0
total_links = 0

# Process weapons
for w in weapons:
    filepath = os.path.join(ROOT, 'weapons', w['slug'], 'index.html')
    if os.path.exists(filepath):
        related = find_related_weapons(w)
        html = make_related_html(related, '/weapons/')
        update_file(filepath, html)
        updated += 1
        total_links += len(related)
        print(f'  ✅ weapons/{w["slug"]}/ → {len(related)} related')

# Process armor
for a in armor:
    filepath = os.path.join(ROOT, 'armor', a['slug'], 'index.html')
    if os.path.exists(filepath):
        related = find_related_armor(a)
        html = make_related_html(related, '/armor/')
        update_file(filepath, html)
        updated += 1
        total_links += len(related)
        print(f'  ✅ armor/{a["slug"]}/ → {len(related)} related')

# Process accessories
for a in accessories:
    filepath = os.path.join(ROOT, 'accessories', a['slug'], 'index.html')
    if os.path.exists(filepath):
        related = find_related_accessories(a)
        html = make_related_html(related, '/accessories/')
        update_file(filepath, html)
        updated += 1
        total_links += len(related)
        print(f'  ✅ accessories/{a["slug"]}/ → {len(related)} related')

# Process skills
for s in skills:
    filepath = os.path.join(ROOT, 'skills', s['slug'], 'index.html')
    if os.path.exists(filepath):
        related = find_related_skills(s)
        html = make_related_html(related, '/skills/')
        update_file(filepath, html)
        updated += 1
        total_links += len(related)
        print(f'  ✅ skills/{s["slug"]}/ → {len(related)} related')

print(f'\n{updated}/67 pages updated with {total_links} total related links.')
