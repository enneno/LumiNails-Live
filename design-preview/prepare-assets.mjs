import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'design-preview/media');
const snapshot = JSON.parse(await fs.readFile(path.join(root, 'adatok.json'), 'utf8'));
await fs.mkdir(target, { recursive: true });
const photos = snapshot.siteContent.galeria.elemek.slice(0, 5).map((x, i) => ({ name: `work-${i + 1}.jpg`, origin: x.kep, alt: x.kepAlt }));
photos.push({ name: 'hero.jpg', origin: snapshot.siteContent.fooldal.hero.kep, alt: snapshot.siteContent.fooldal.hero.kepAlt });
photos.push({ name: 'szofi.jpg', origin: snapshot.siteContent.fooldal.bemutatkozas.kep, alt: snapshot.siteContent.fooldal.bemutatkozas.kepAlt });
for (const [name, source] of [['work-6.jpg', 'galeria/optimized/large/image4.jpg'], ['work-7.jpg', 'galeria/optimized/large/image7.jpg']]) {
  await fs.copyFile(path.join(root, source), path.join(target, name));
  photos.push({ name, origin: source, alt: name });
}
for (const photo of photos.filter(x => x.origin.startsWith('https:'))) {
  if (new URL(photo.origin).hostname !== 'htbpzvmlegapaphsipax.supabase.co') throw Error('Unexpected media origin');
  const destination = path.join(target, photo.name);
  try { await fs.access(destination); continue; } catch { /* First download only. */ }
  const response = await fetch(photo.origin, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error(`Photo download failed: ${photo.name}`);
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}
const fontUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap';
const response = await fetch(fontUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' }, signal: AbortSignal.timeout(30000) });
if (!response.ok) throw Error('Font stylesheet unavailable');
const stylesheet = await response.text();
let css = '';
for (const match of stylesheet.matchAll(/\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[\s\S]*?\})/g)) {
  let block = match[2];
  for (const item of block.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)) {
    const name = 'font-' + createHash('sha256').update(item[1]).digest('hex').slice(0, 12) + '.woff2';
    const font = await fetch(item[1], { signal: AbortSignal.timeout(30000) });
    if (!font.ok) throw Error('Font download failed');
    await fs.writeFile(path.join(target, name), Buffer.from(await font.arrayBuffer()));
    block = block.replaceAll(item[1], './' + name);
  }
  css += `/* ${match[1]} */\n${block}\n`;
}
if (!css.includes('DM Sans') || !css.includes('Playfair Display')) throw Error('Expected fonts missing');
await fs.writeFile(path.join(target, 'fonts.css'), css);
await fs.writeFile(path.join(target, 'provenance.json'), JSON.stringify({ photos, fonts: { origin: fontUrl, license: 'SIL Open Font License; Google Fonts DM Sans and Playfair Display' }, imageProcessing: 'Existing project images copied without changing pixels.' }, null, 2) + '\n');
console.log('Own photographs and self-hosted fonts prepared.');
