'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { PUBLIC_ROOT_FILES, PUBLIC_DIRECTORIES, PUBLIC_NESTED_EXTENSIONS } = require('./public-files');
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'dist');

function run(script, args = [], env = {}) {
    const result = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
        cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env }
    });
    if (result.status !== 0) throw new Error('A build megszakadt: ' + script);
}

function buildSite() {
    const environment = process.env.LUMI_DEPLOY_ENV || 'test';
    const origin = process.env.LUMI_SITE_ORIGIN;
    if (!['test', 'live'].includes(environment) || !origin) {
        throw new Error('LUMI_SITE_ORIGIN szükséges; LUMI_DEPLOY_ENV=test vagy live.');
    }
    const site = new URL(origin);
    if (site.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(site.hostname)) throw new Error('HTTPS oldalazonosító szükséges.');
    if (site.username || site.password || site.pathname !== '/' || site.search || site.hash) throw new Error('Csak a webhely eredete adható meg.');
    if (environment === 'test' && ['luminails.hu', 'www.luminails.hu'].includes(site.hostname)) throw new Error('TEST build nem célozhat éles domaint.');
    run('build-assets.js');
    // Verify the absolute deletion target, including any existing junction, before recursive removal.
    if (path.resolve(OUTPUT) !== path.join(ROOT, 'dist') || !OUTPUT.startsWith(ROOT + path.sep)
        || (fs.existsSync(OUTPUT) && fs.lstatSync(OUTPUT).isSymbolicLink())) throw new Error('Nem biztonságos kiadási célkönyvtár.');
    fs.rmSync(OUTPUT, { recursive: true, force: true });
    fs.mkdirSync(OUTPUT, { recursive: true });
    function copy(relative) {
        const source = path.join(ROOT, relative);
        if (!fs.existsSync(source) || fs.lstatSync(source).isSymbolicLink()) return;
        if (fs.statSync(source).isDirectory()) {
            for (const entry of fs.readdirSync(source)) copy(path.join(relative, entry));
        } else if (PUBLIC_ROOT_FILES.has(relative) || (relative.includes(path.sep) && PUBLIC_NESTED_EXTENSIONS.has(path.extname(relative).toLowerCase()))) {
            const destination = path.join(OUTPUT, relative);
            fs.mkdirSync(path.dirname(destination), { recursive: true });
            fs.copyFileSync(source, destination);
        }
    }
    for (const relative of [...PUBLIC_ROOT_FILES, ...PUBLIC_DIRECTORIES]) copy(relative);
    run('prerender-public.js', ['--out-dir', OUTPUT], { LUMI_SITE_ORIGIN: site.origin, LUMI_DEPLOY_ENV: environment });

    const assetMap = {};
    fs.mkdirSync(path.join(OUTPUT, 'assets'), { recursive: true });
    for (const name of PUBLIC_ROOT_FILES) {
        if (!/\.(css|js)$/.test(name) || name === 'sw.js' || !fs.existsSync(path.join(OUTPUT, name))) continue;
        const bytes = fs.readFileSync(path.join(OUTPUT, name));
        const extension = path.extname(name);
        const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16);
        const fingerprinted = name.slice(0, -extension.length) + '.' + hash + extension;
        fs.writeFileSync(path.join(OUTPUT, 'assets', fingerprinted), bytes);
        assetMap['/' + name] = '/assets/' + fingerprinted;
    }
    function rewriteHtml(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const file = path.join(directory, entry.name);
            if (entry.isDirectory()) rewriteHtml(file);
            else if (entry.name.endsWith('.html')) {
                let html = fs.readFileSync(file, 'utf8');
                html = html.replace(/((?:src|href)=['"])(\/[^'"?]+\.(?:js|css))(?:\?[^'"]*)?(['"])/g,
                    (match, before, asset, after) => assetMap[asset] ? before + assetMap[asset] + after : match);
                html = html.replace('</head>', '<script type="application/json" id="lumi-asset-map">' + JSON.stringify(assetMap) + '</script>\n</head>');
                if (environment === 'test') {
                    html = /<meta name="robots"/.test(html)
                        ? html.replace(/(<meta name="robots" content=")[^"]*(")/, '$1noindex, nofollow$2')
                        : html.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>');
                }
                fs.writeFileSync(file, html);
            }
        }
    }
    rewriteHtml(OUTPUT);
    fs.writeFileSync(path.join(OUTPUT, '_headers'),
        '/*\n  Cache-Control: public, max-age=0, must-revalidate\n  X-Content-Type-Options: nosniff\n/assets/*\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n/deployment.json\n  Access-Control-Allow-Origin: *\n/sw.js\n  ! Cache-Control\n  Cache-Control: no-cache\n');
    if (environment === 'test') fs.writeFileSync(path.join(OUTPUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    console.log('STATIC SITE READY: dist (' + environment + ')');
}

if (require.main === module) {
    try { buildSite(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { buildSite };
