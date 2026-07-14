#!/usr/bin/env python3
"""Batch-optimize <title> and <meta description> for 67 entity detail pages."""

import json, re, os

ROOT = '/Users/judy/Knowledge/ObsidianVault/70-Projects/wangzhan/CrimsonDesert'

def load_json(path):
    with open(os.path.join(ROOT, 'data', path), 'r') as f:
        return json.load(f)

def rarity_label(r):
    return {'common':'Common','uncommon':'Uncommon','rare':'Rare','epic':'Epic','legendary':'Legendary'}.get(r, r.title())

def type_label_weapon(t):
    return {'one-handed-sword':'1H Sword','two-handed-sword':'2H Sword','spear':'Spear','axe':'Axe','dagger':'Dagger','bow':'Bow'}.get(t, t)

def type_label_armor(t):
    return {'plate':'Plate','leather':'Leather','cloth':'Cloth'}.get(t, t.title())

def slot_label(s):
    return {'head':'Helmet','chest':'Armor','gloves':'Gloves','boots':'Boots','cloak':'Cloak'}.get(s, s.title())

def acq_text(acq):
    m = acq.get('method', '')
    if m == 'boss_drop':
        boss = acq.get('boss_drop', 'boss').replace('-', ' ').title()
        loc = acq.get('location', '').replace('-', ' ').title()
        return f'Dropped by {boss} in {loc}'
    elif m == 'location':
        loc = acq.get('location', '').replace('-', ' ').title()
        return f'Found in {loc}'
    elif m == 'crafting':
        return 'Obtained via crafting'
    elif m == 'vendor':
        return 'Purchased from vendors'
    return ''

def set_name(item):
    """Extract set name from armor item name if part of a set."""
    name = item['name']
    sets = {
        'Plate Armor of the Shadows': 'Shadow Set',
        'Plate Cloak of the Shadows': 'Shadow Set',
        'Plate Boots of the Shadows': 'Shadow Set',
        'Plate Gloves of the Shadows': 'Shadow Set',
        'Plate Helmet of the Shadows': 'Shadow Set',
        'Leather Cloak of the Fallen Kingdom': 'Fallen Kingdom Set',
        'Leather Helm of the Fallen Kingdom': 'Fallen Kingdom Set',
        'Leather Armor of the Fallen Kingdom': 'Fallen Kingdom Set',
        'Plate Boots of the Fallen Kingdom': 'Fallen Kingdom Set',
        'Plate Gloves of the Fallen Kingdom': 'Fallen Kingdom Set',
        'Cloth Armor of the Dark Ringleader': 'Dark Ringleader Set',
        'Leather Gloves of the Dark Ringleader': 'Dark Ringleader Set',
        'Cloth Helm of the Dark Ringleader': 'Dark Ringleader Set',
    }
    return sets.get(name, '')

def make_weapon_title(w):
    r = rarity_label(w['rarity'])
    t = type_label_weapon(w['type'])
    return f"{w['name']} — {r} {t} Stats & Location | CrimsonDesertDB"

def make_weapon_meta(w):
    r = rarity_label(w['rarity'])
    t = type_label_weapon(w['type'])
    stats_parts = []
    s = w['stats']
    if s.get('attack'): stats_parts.append(f"ATK {s['attack']}")
    if s.get('attack_speed'): stats_parts.append(f"Speed {s['attack_speed']}")
    if s.get('critical_rate'): stats_parts.append(f"Crit {s['critical_rate']}")
    acq = acq_text(w.get('acquisition', {}))
    chars = w.get('character_restrictions', [])
    char_str = f" ({', '.join(c.title() for c in chars)} only)" if chars else ''
    desc = w.get('description', '').split('.')[0] + '.'
    meta = f"{w['name']} — {r} {t}{char_str}. {' | '.join(stats_parts)}. {desc} {acq}. Full stat breakdown, build suggestions, and related weapons at CrimsonDesertDB."
    return meta[:160] + '…' if len(meta) > 160 else meta

def make_armor_title(a):
    r = rarity_label(a['rarity'])
    t = type_label_armor(a['type'])
    sl = slot_label(a['slot'])
    s = set_name(a)
    set_str = f" | {s}" if s else ''
    return f"{a['name']}{set_str} — {r} {t} {sl} Stats | CrimsonDesertDB"

def make_armor_meta(a):
    r = rarity_label(a['rarity'])
    t = type_label_armor(a['type'])
    sl = slot_label(a['slot'])
    s = set_name(a)
    set_str = f' Part of the {s}.' if s else ''
    acq = acq_text(a.get('acquisition', {}))
    desc = a.get('description', '').split('.')[0] + '.'
    stats_parts = []
    st = a['stats']
    if st.get('defense'): stats_parts.append(f"DEF {st['defense']}")
    meta = f"{a['name']} — {r} {t} {sl}.{set_str} {' | '.join(stats_parts)}. {desc} {acq}. Full stat breakdown at CrimsonDesertDB."
    return meta[:160] + '…' if len(meta) > 160 else meta

def make_acc_title(acc):
    r = rarity_label(acc['rarity'])
    t = acc['type'].title()
    return f"{acc['name']} — {r} {t} Stats & How to Get | CrimsonDesertDB"

def make_acc_meta(acc):
    r = rarity_label(acc['rarity'])
    t = acc['type'].title()
    acq = acq_text(acc.get('acquisition', {}))
    desc = acc.get('description', '').split('.')[0] + '.'
    stats_parts = []
    st = acc['stats']
    if st.get('attack'): stats_parts.append(f"ATK {st['attack']}")
    if st.get('defense'): stats_parts.append(f"DEF {st['defense']}")
    if st.get('attack_speed'): stats_parts.append(f"Speed {st['attack_speed']}")
    if st.get('critical_rate'): stats_parts.append(f"Crit {st['critical_rate']}")
    if st.get('movement_speed'): stats_parts.append(f"Move {st['movement_speed']}")
    meta = f"{acc['name']} — {r} {t}. {' | '.join(stats_parts) if stats_parts else ''}. {desc} {acq}. Full stat breakdown at CrimsonDesertDB."
    return meta[:160] + '…' if len(meta) > 160 else meta

def make_skill_title(sk):
    char = sk['character'].title()
    tree = sk['skill_tree'].replace('-', ' ').title()
    stype = sk['skill_type'].title()
    return f"{sk['name']} | {char} {tree} — {stype} Skill Stats | CrimsonDesertDB"

def make_skill_meta(sk):
    char = sk['character'].title()
    tree = sk['skill_tree'].replace('-', ' ').title()
    stype = sk['skill_type'].title()
    desc = sk.get('description', '').split('.')[0] + '.'
    cost = sk.get('cost') or {}
    cost_str = f" Cost: {cost['amount']} {cost['type']}." if cost.get('amount') else ''
    cd = sk.get('cooldown', 0)
    cd_str = f" Cooldown: {cd}s." if cd else ''
    meta = f"{sk['name']} is {char}'s {stype} skill in the {tree} tree.{cost_str}{cd_str} {desc} Full stats and build context at CrimsonDesertDB."
    return meta[:160] + '…' if len(meta) > 160 else meta

def update_html(filepath, new_title, new_meta):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', content)
    # Update meta description
    content = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" content="{new_meta}">',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    weapons = load_json('weapons.json')
    armor = load_json('armor.json')
    accessories = load_json('accessories.json')
    skills = load_json('skills.json')

    updated = 0

    for w in weapons:
        filepath = os.path.join(ROOT, 'weapons', w['slug'], 'index.html')
        if os.path.exists(filepath):
            title = make_weapon_title(w)
            meta = make_weapon_meta(w)
            update_html(filepath, title, meta)
            print(f'  ✅ weapons/{w["slug"]}/')
            print(f'     → {title}')
            updated += 1

    for a in armor:
        filepath = os.path.join(ROOT, 'armor', a['slug'], 'index.html')
        if os.path.exists(filepath):
            title = make_armor_title(a)
            meta = make_armor_meta(a)
            update_html(filepath, title, meta)
            print(f'  ✅ armor/{a["slug"]}/')
            print(f'     → {title}')
            updated += 1

    for a in accessories:
        filepath = os.path.join(ROOT, 'accessories', a['slug'], 'index.html')
        if os.path.exists(filepath):
            title = make_acc_title(a)
            meta = make_acc_meta(a)
            update_html(filepath, title, meta)
            print(f'  ✅ accessories/{a["slug"]}/')
            print(f'     → {title}')
            updated += 1

    for s in skills:
        filepath = os.path.join(ROOT, 'skills', s['slug'], 'index.html')
        if os.path.exists(filepath):
            title = make_skill_title(s)
            meta = make_skill_meta(s)
            update_html(filepath, title, meta)
            print(f'  ✅ skills/{s["slug"]}/')
            print(f'     → {title}')
            updated += 1

    print(f'\n{updated}/67 entity pages updated.')

if __name__ == '__main__':
    main()
