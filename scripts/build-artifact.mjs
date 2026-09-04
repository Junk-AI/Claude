// Bundle the built app into one self-contained HTML file for publishing as an
// Artifact. Artifacts are a single page with no build step and a CSP that
// blocks external stylesheets, so the CSS and the JS bundle are inlined.
//
//   npm run build:artifact   ->   dist-artifact/geo-revise.html
//
// The output omits <!doctype>, <html>, <head> and <body>: the Artifact host
// supplies those and wraps this file's contents.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const OUT_DIR = 'dist-artifact';
const OUT = join(OUT_DIR, 'geo-revise.html');

const assets = readdirSync(join(DIST, 'assets'));
const jsFile = assets.find((f) => f.endsWith('.js'));
const cssFile = assets.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) throw new Error('Run `npm run build` first: no dist/assets bundle found.');

const css = readFileSync(join(DIST, 'assets', cssFile), 'utf8');
let js = readFileSync(join(DIST, 'assets', jsFile), 'utf8');

// A literal </script> inside a string would close the inline script early.
js = js.replace(/<\/script>/gi, '<\\/script>');

const html = `<title>Geo Revise</title>
<style>
${css}
</style>

<div id="root">
  <!-- Static shell, replaced by the app on load, so the page is never a blank
       frame while the bundle parses. -->
  <div style="max-width:940px;margin:0 auto;padding:26px 20px">
    <h1 style="font-size:1.6rem;margin:0 0 2px">Geo Revise</h1>
    <p style="color:#5A6069;margin:0">Secondary 2 Geography. Three topics, learn then test.</p>
  </div>
</div>

<script type="module">
${js}
</script>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html);
console.log(`${OUT}  ${(Buffer.byteLength(html) / 1024).toFixed(0)} kB`);
