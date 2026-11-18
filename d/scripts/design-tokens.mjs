#!/usr/bin/env node
/**
 * Writes d/docs/design-tokens.md from D's CSS (d/src/styles/global.css): every CSS variable,
 * colour, font, font size, font weight, radius, shadow and spacing value used in D, with where
 * it is used. Run by d/build.sh, so the document always matches the CSS.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// --- tiny CSS walker: collects [selector, property, value] (also inside @media) ---
const decls = [];
(function walk(text, ctx) {
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i); if (open < 0) break;
    const sel = text.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
    const body = text.slice(open + 1, j - 1);
    if (sel.startsWith('@media') || sel.startsWith('@supports')) walk(body, sel);
    else if (!sel.startsWith('@keyframes') && !sel.startsWith('@property')) {
      for (const d of body.split(';')) {
        const k = d.indexOf(':'); if (k < 0) continue;
        const prop = d.slice(0, k).trim(), val = d.slice(k + 1).trim().replace(/\s+/g, ' ');
        if (prop && val) decls.push({ sel: (ctx ? `${ctx} → ` : '') + sel.replace(/\s+/g, ' '), prop, val });
      }
    }
    i = j;
  }
})(css, '');

const group = (filter, extract) => {
  const m = new Map();
  for (const d of decls) {
    if (!filter(d)) continue;
    for (const v of extract(d)) {
      if (!m.has(v)) m.set(v, { n: 0, where: new Set() });
      const e = m.get(v); e.n++; if (e.where.size < 3) e.where.add(d.sel.slice(0, 60));
    }
  }
  return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
};
const table = (rows, head) => [`| ${head} | Uses | Where (examples) |`, '|---|---|---|', ...rows.map(([v, e]) => `| \`${v}\` | ${e.n} | ${[...e.where].map((w) => `\`${w}\``).join(', ')} |`)].join('\n');

const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;
const vars = decls.filter((d) => d.prop.startsWith('--'));
const varRows = ['| Variable | Value | Defined in |', '|---|---|---|', ...vars.map((d) => `| \`${d.prop}\` | \`${d.val}\` | \`${d.sel.slice(0, 50)}\` |`)].join('\n');

const out = `# Version D – design tokens

Generated from \`d/src/styles/global.css\` by \`d/scripts/design-tokens.mjs\` (run on every D build),
so this list always matches the CSS. "Uses" = number of declarations; "Where" = example selectors.

## 1. CSS variables (custom properties)

${varRows}

## 2. Colours (literal values, besides the variables above)

${table(group((d) => !d.prop.startsWith('--') && COLOR.test(d.val) && (COLOR.lastIndex = 0, true), (d) => (d.val.match(COLOR) || []).map((c) => c.toLowerCase().replace(/\s+/g, ''))), 'Colour')}

## 3. Fonts

${table(group((d) => d.prop === 'font-family', (d) => [d.val]), 'Font family')}

## 4. Font sizes

${table(group((d) => d.prop === 'font-size', (d) => [d.val]), 'Font size')}

## 5. Font weights

${table(group((d) => d.prop === 'font-weight', (d) => [d.val]), 'Font weight')}

## 6. Radii

${table(group((d) => /^border(-[a-z]+)*-radius$/.test(d.prop), (d) => [d.val]), 'Radius')}

## 7. Shadows

${table(group((d) => d.prop === 'box-shadow' && d.val !== 'none', (d) => [d.val]), 'Shadow')}

## 8. Spacing (padding, margin, gap)

${table(group((d) => /^(padding|margin|gap|row-gap|column-gap)(-[a-z]+)?$/.test(d.prop), (d) => d.val.split(' ').filter((x) => /^-?\d/.test(x))), 'Value')}
`;
writeFileSync(join(root, 'docs/design-tokens.md'), out);
console.log(`design-tokens.md: ${vars.length} variables, ${decls.length} declarations scanned`);
