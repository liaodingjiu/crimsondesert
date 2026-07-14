#!/usr/bin/env python3
"""Batch-update nav and footer across all HTML files for Plan B restructuring."""

import re, os, glob

ROOT = '/Users/judy/Knowledge/ObsidianVault/70-Projects/wangzhan/CrimsonDesert'

NEW_NAV = '''<nav aria-label="Main navigation">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-icon">CD</span>Crimson<span>DB</span></a>
    <div class="nav-dropdown">
      <span class="nav-dropdown-toggle">Equipment</span>
      <div class="nav-dropdown-menu">
        <a href="/equipment/">All Equipment</a>
        <a href="/weapons/">Weapons</a>
        <a href="/armor/">Armor</a>
        <a href="/accessories/">Accessories</a>
      </div>
    </div>
    <div class="nav-dropdown">
      <span class="nav-dropdown-toggle">Skills &amp; Gears</span>
      <div class="nav-dropdown-menu">
        <a href="/skills/">Skills</a>
        <a href="/abyss-gears/">Abyss Gears</a>
      </div>
    </div>
    <a href="/characters/" class="nav-link">Characters</a>
    <div class="nav-dropdown">
      <span class="nav-dropdown-toggle">World</span>
      <div class="nav-dropdown-menu">
        <a href="/enemies/">Enemies &amp; Bosses</a>
        <a href="/tools/map/">Interactive Map</a>
        <a href="/mounts/">Mounts</a>
      </div>
    </div>
    <div class="nav-dropdown">
      <span class="nav-dropdown-toggle">Crafting</span>
      <div class="nav-dropdown-menu">
        <a href="/crafting/">Crafting Recipes</a>
        <a href="/cooking/">Cooking</a>
        <a href="/alchemy/">Alchemy</a>
        <a href="/guides/">Guides</a>
      </div>
    </div>
    <div class="nav-dropdown">
      <span class="nav-dropdown-toggle">Tools</span>
      <div class="nav-dropdown-menu">
        <a href="/tools/build-calculator/">Build Calculator</a>
        <a href="/tools/skill-planner/">Skill Planner</a>
        <a href="/tools/recipe-finder/">Recipe Finder</a>
        <a href="/tools/equipment-compare/">Equipment Compare</a>
      </div>
    </div>
  </div>
</nav>'''

NEW_FOOTER = '''<footer>
  <div class="footer-inner">
    <div class="footer-col">
      <h4>Equipment</h4>
      <a href="/equipment/">All Equipment</a>
      <a href="/weapons/">Weapons</a>
      <a href="/armor/">Armor</a>
      <a href="/accessories/">Accessories</a>
    </div>
    <div class="footer-col">
      <h4>Systems</h4>
      <a href="/skills/">Skills</a>
      <a href="/abyss-gears/">Abyss Gears</a>
      <a href="/characters/">Characters</a>
      <a href="/enemies/">Enemies &amp; Bosses</a>
    </div>
    <div class="footer-col">
      <h4>Crafting &amp; World</h4>
      <a href="/crafting/">Crafting</a>
      <a href="/cooking/">Cooking</a>
      <a href="/alchemy/">Alchemy</a>
      <a href="/mounts/">Mounts</a>
      <a href="/guides/">Guides</a>
      <a href="/tools/map/">Interactive Map</a>
    </div>
    <div class="footer-col">
      <h4>Tools &amp; Site</h4>
      <a href="/tools/build-calculator/">Build Calculator</a>
      <a href="/tools/skill-planner/">Skill Planner</a>
      <a href="/tools/recipe-finder/">Recipe Finder</a>
      <a href="/tools/equipment-compare/">Equipment Compare</a>
      <a href="/privacy.html">Privacy Policy</a>
      <a href="/terms.html">Terms of Use</a>
      <a href="/contact.html">Contact</a>
    </div>
  </div>
  <div class="footer-bottom">
    CrimsonDesertDB is a fan-made database and is not affiliated with Pearl Abyss.
    Crimson Desert is a trademark of <a href="https://pearlabyss.com" target="_blank" rel="noopener">Pearl Abyss</a>.
    Game data is sourced from public community resources.
  </div>
</footer>'''

def update_file(filepath, dry_run=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = 0

    # Replace nav block
    nav_pattern = re.compile(r'<nav[^>]*>.*?</nav>', re.DOTALL)
    if nav_pattern.search(content):
        content = nav_pattern.sub(NEW_NAV.strip(), content)
        changes += 1

    # Replace footer block
    footer_pattern = re.compile(r'<footer>.*?</footer>', re.DOTALL)
    if footer_pattern.search(content):
        content = footer_pattern.sub(NEW_FOOTER.strip(), content)
        changes += 1

    if content != original:
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        rel = os.path.relpath(filepath, ROOT)
        print(f'  {"[DRY RUN]" if dry_run else "UPDATED"} {rel} ({changes} blocks)')
        return True
    return False

def main():
    import sys
    dry_run = '--apply' not in sys.argv

    print(f'{"DRY RUN" if dry_run else "APPLYING"} — Plan B nav/footer update')
    print(f'Root: {ROOT}\n')

    html_files = glob.glob(os.path.join(ROOT, '**/*.html'), recursive=True)
    # Exclude design-preview and characters-preview
    html_files = [f for f in html_files if 'design-preview' not in f and 'characters-preview' not in f]

    updated = 0
    for f in sorted(html_files):
        if update_file(f, dry_run=dry_run):
            updated += 1

    print(f'\n{updated}/{len(html_files)} files would be updated.' if dry_run else f'\n{updated}/{len(html_files)} files updated.')
    if dry_run:
        print('Run with --apply to write changes.')

if __name__ == '__main__':
    main()
