import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
if (!output.startsWith(root + path.sep) || (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink())) throw Error('Unsafe output directory');
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'adatok.json'), 'utf8'));
const content = snapshot.siteContent;
const home = content.fooldal;
const ownPhotos = content.galeria.elemek.slice(0, 5).concat(content.galeria.elemek[5], content.galeria.elemek[7]);
const photos = ownPhotos.map((x, i) => ({ src: `/assets/work-${i + 1}.jpg`, alt: x.kepAlt }));
const groups = [
  { prefix: ['Építés', 'Töltés'], image: 'work-1.jpg', imageAlt: photos[0].alt, href: '/mukorom-epites-toltes/' },
  { prefix: ['Díszítés'], image: 'work-3.jpg', imageAlt: photos[2].alt, href: '/korom-diszites-nail-art-tatabanya/' },
  { prefix: ['Gél lakk'], image: 'work-7.jpg', imageAlt: photos[6].alt, href: '/gel-lakk-tatabanya/' },
  { prefix: ['Manikűr'], image: 'work-5.jpg', imageAlt: photos[4].alt, href: '/manikur-tatabanya/' },
].map((x, i) => ({ ...x, ...home.szolgaltatasok.kartyak[i], rows: snapshot.services.filter(s => x.prefix.some(p => s.name.startsWith(p))) }));
const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
const arrow = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const button = (label, href, secondary = false) => `<a class="action${secondary ? ' action-secondary' : ''}" href="${esc(href)}">${esc(label)}${arrow}</a>`;
const booking = () => button('Időpontot foglalok', 'https://luminails.hu/foglalas/');
const image = (photo, options = '') => `<img src="${photo.src}" alt="${esc(photo.alt)}" width="1350" height="1800" ${options}>`;
const photoButton = (photo, i, className = '') => `<button class="photo-button ${className}" type="button" data-photo="${i}" aria-label="${esc(photo.alt)} Nagyítás">${image(photo, i > 2 ? 'loading="lazy"' : '')}<span class="photo-caption">${esc(photo.alt)}${arrow}</span></button>`;
const photoDialog = `<dialog class="lightbox" aria-label="Munka nagyított képe"><button type="button" class="lightbox-close" aria-label="Nagyítás bezárása">Bezárás <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button><figure><img src="/assets/work-1.jpg" alt="" width="1350" height="1800"><figcaption></figcaption></figure></dialog>`;
function header() {
  const links = '<a href="/#szofi">Szofi</a><a href="/#szolgaltatasok">Szolgáltatások</a><a href="/arlista/">Árlista</a><a href="/#munkak">Munkák</a>';
  return `<header class="site-head"><a class="wordmark" href="/">Lumi Nails</a><nav class="desktop-nav" aria-label="Fő navigáció">${links}</nav><a class="header-booking" href="https://luminails.hu/foglalas/">Időpontfoglalás ${arrow}</a><details class="mobile-menu"><summary aria-label="Menü megnyitása"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg></summary><nav aria-label="Mobil navigáció">${links}<a href="https://luminails.hu/foglalas/">Időpontfoglalás</a></nav></details></header>`;
}
function notice() { return home.ertesito.aktiv ? `<aside class="notice" aria-label="Aktuális információ"><strong>${esc(home.ertesito.cimke)}</strong><p>${esc(home.ertesito.szoveg)}</p></aside>` : ''; }
function footer() { return `<footer class="site-foot"><a class="wordmark" href="/">Lumi Nails</a><div><p>${esc(content.kapcsolat.cim)}</p><a href="mailto:${esc(content.kapcsolat.email)}">${esc(content.kapcsolat.email)}</a></div><nav aria-label="További oldalak"><a href="${esc(content.kapcsolat.instagram)}">Instagram</a><a href="https://luminails.hu/fiokom/">Saját fiókom</a><a href="https://luminails.hu/adatkezeles/">Adatkezelés</a><a href="https://luminails.hu/">Jelenlegi weboldal</a></nav><p class="footer-note">${esc(content.lablec.jogok)} <span>Tervezési előnézet</span></p></footer>`; }
function about() { const paragraphs = home.bemutatkozas.bekezdesek.flatMap(text => text.split(/\n\s*\n/)).map(text => text.trim()).filter(Boolean); return `<section class="about-band" id="szofi"><div class="about section"><div class="about-photo"><img src="/assets/szofi.jpg" alt="${esc(home.bemutatkozas.kepAlt)}" width="900" height="1200" loading="lazy"></div><div class="about-copy"><h2>${esc(home.bemutatkozas.cim)}</h2><div class="about-body">${paragraphs.map(x => `<p>${esc(x)}</p>`).join('')}</div><a class="text-link" href="${esc(content.kapcsolat.instagram)}">Instagramon írok ${arrow}</a></div></div></section>`; }
function services() { return `<section class="section services" id="szolgaltatasok"><div class="section-heading"><h2>Szolgáltatások</h2><p>${esc(home.szolgaltatasok.leiras)}</p></div><div class="service-rows">${groups.map(g => `<a class="service-row" href="https://luminails.hu${g.href}"><h3>${esc(g.cim)}</h3><p>${esc(g.leiras)}</p><span>Részletek ${arrow}</span></a>`).join('')}</div><div class="section-end">${button('Teljes árlista', '/arlista/', true)}</div></section>`; }
function gallery() { return `<section class="section gallery-section" id="munkak"><div class="section-heading"><h2>${esc(content.galeria.cim)}</h2><p>${esc(content.galeria.leiras)}</p></div><div class="gallery-grid">${photos.slice(0, 6).map((p, i) => photoButton(p, i)).join('')}</div><div class="section-end">${button('Teljes galéria', 'https://luminails.hu/galeria/', true)}</div></section>`; }
function invitation() { return `<section class="invitation section"><h2>${esc(home.foglalasAtvezeto.cim)}</h2><div><p>${esc(home.foglalasAtvezeto.leiras)}</p>${booking()}<p class="availability-note">${esc(content.kapcsolat.nyitvatartas.megjegyzes)}</p></div></section>`; }
function prices(g) { return `<dl class="price-lines">${g.rows.map(r => `<div><dt>${esc(r.name)}<small>${r.duration_minutes ? esc(r.duration_minutes) + ' perc' : ''}</small></dt><dd>${esc(r.price_text)}</dd></div>`).join('')}</dl>`; }
function hero() { return `<section class="hero-opening" aria-label="Lumi Nails nyitókép"><div class="hero-heading section"><h1 class="hero-wordmark">${home.hero.cim.split(/\s+/).map(word => '<span>' + esc(word) + '</span>').join(' ')}</h1><div class="hero-deck"><p>${esc(home.hero.leiras)}</p>${booking()}</div></div><figure class="hero-photo"><img src="/assets/work-1.jpg" alt="${esc(photos[0].alt)}" width="1200" height="1600" fetchpriority="high"></figure></section>`; }

function shell(title, body) { return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#873b59"><title>${esc(title)} · Lumi Nails előnézet</title><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/preview.css"><script src="/assets/preview.js" defer></script></head><body class="new-home"><a class="skip-link" href="#main">Ugrás a tartalomhoz</a>${header()}${notice()}<main id="main">${body}</main>${footer()}${photoDialog}</body></html>`; }

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
for (const file of fs.readdirSync(path.join(root, 'design-preview/media'))) if (/\.(jpg|woff2|css|txt)$/.test(file)) fs.copyFileSync(path.join(root, 'design-preview/media', file), path.join(output, 'assets', file));
for (const file of ['preview.css', 'preview.js']) fs.copyFileSync(path.join(root, 'design-preview', file), path.join(output, 'assets', file));
function write(relative, text) { const file = path.join(output, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
write('index.html', shell('Lumi Nails', hero() + about() + services() + gallery() + invitation()));
write('arlista/index.html', shell('Árlista', `<section class="section full-prices"><h1>Árlista</h1><p>${esc(content.arlista.leiras)}</p>${groups.map(g => `<section><h2>${esc(g.cim)}</h2>${prices(g)}</section>`).join('')}<section><h2>Egyéb</h2>${prices({ rows: snapshot.services.filter(x => x.name.startsWith('Egyéb')) })}</section>${booking()}</section>`));
write('404.html', shell('Nem található', `<section class="section"><h1>Ez az előnézet nem található.</h1>${button('Vissza a változatokhoz', '/')}</section>`));
write('robots.txt', 'User-agent: *\nDisallow: /\n');
write('_headers', '/*\n  Cache-Control: no-cache\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
write('deployment.json', JSON.stringify({ preview: true, codeRevision: process.env.CF_PAGES_COMMIT_SHA || 'local', sourceContentHash: snapshot.contentFingerprint, layout: 'hero-about' }) + '\n');
console.log('Preview ready: header, large hero, immediate introduction, services and gallery; no API client.');
