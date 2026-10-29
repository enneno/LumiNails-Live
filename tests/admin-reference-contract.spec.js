const {test,expect}=require('playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'src/admin-reference');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const manifest=JSON.parse(read('src/admin-reference/reference-source.json'));

test('shared reference components and CSS are the actual copied sources',()=>{
 expect(manifest.files.filter(file=>file.exact).length).toBeGreaterThanOrEqual(36);
 for(const file of manifest.files){const bytes=fs.readFileSync(path.join(source,file.file));expect(hash(bytes),file.file).toBe(file.localSha256);if(file.exact)expect(hash(bytes),file.file).toBe(file.sourceSha256);}
 for(const file of ['components/admin-studio.module.css','components/admin-overlays.module.css','components/admin-editor-sheet.tsx','components/admin-overview.tsx','components/admin-list-pagination.tsx','components/admin-select-menu.tsx','components/admin-temporal-input.tsx','components/admin-week-picker.tsx'])expect(manifest.files.find(row=>row.file===file)?.exact,file).toBe(true);
 const bookings=read('src/admin-reference/components/admin-bookings-tab.tsx').replace(/\r\n/g,'\n'),start=bookings.indexOf('<article'),card=bookings.slice(start,bookings.indexOf('</article>',start)+10);expect(hash(card)).toBe(manifest.bookingCardMarkupSha256);
});

test('the admin has one active stylesheet and static React assets in the release allowlist',()=>{
 const html=read('admin/index.html'),styles=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^\"]+)"/g)].map(match=>match[1]).filter(href=>href.startsWith('/'));expect(styles).toHaveLength(1);expect(styles[0]).toMatch(/^\/admin-reference.css\?v=/);expect(html).toMatch(/type="module" src="\/admin-reference.js/);expect(html).not.toContain('href="/admin-v2.css');expect(html).not.toContain('href="/style.css');expect(html).toContain('admin-reference-active');
 expect(read('scripts/public-files.js')).toContain('admin-reference.js');expect(read('scripts/public-files.js')).toContain('admin-reference.css');
 expect(read('scripts/build-assets.js')).toContain('build-admin-reference.js');expect(read('scripts/build-admin-reference.js')).toContain("entryPoints: ['src/admin-reference/main.tsx']");
 for(const match of html.matchAll(/(?:src|href)="\/([^"?]+)\?v=([a-f0-9]{12})"/g))if(/\.(js|css)$/.test(match[1]))expect(hash(fs.readFileSync(path.join(root,match[1]))).slice(0,12),match[1]).toBe(match[2]);
});

test('LumiNails owns data writes and standalone browser zoom remains disabled',()=>{
 const backend=read('src/admin/35-reference-backend.js');expect(backend).toContain('referenceRequireAdmin');expect(backend).toContain('foglalasStatuszokMentese({recordKeys:');expect(read('src/admin/10-bookings-events.js')).toContain("rpc('apply_admin_booking_changes'");expect(read('src/admin/20-services.js')).toContain("rpc('save_public_services'");expect(read('admin-content.js')).toContain("rpc('save_public_site_content'");
 expect(read('pwa-admin-shell.js')).toContain('maximum-scale=1, user-scalable=no');const calendar=read('src/admin-reference/components/admin-week-calendar-mobile.tsx');expect(calendar).toContain('event.preventDefault()');
 const files=manifest.files.filter(file=>/\.(ts|tsx)$/.test(file.file));for(const file of files)expect(fs.readFileSync(path.join(source,file.file),'utf8'),file.file).not.toMatch(/https:\/\/[^\s"']+\.supabase\.co|process\.env\.|service_role|NEXT_PUBLIC_SUPABASE/);
});
