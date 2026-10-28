'use strict';

const PUBLIC_ROOT_FILES = new Set([
    'index.html',
    '404.html',
    'adatkezeles.html',
    'admin.html',
    'arlista.html',
    'foglalas.html',
    'galeria.html',
    'admin-content.js',
    'admin-export.js',
    'admin-supabase.js',
    'booking.js',
    'booking-manage.js',
    'booking-manage.css',
    'home-account-strip.js',
    'home-account-strip.css',
    'typography-tuning.css',
    'account-entry.js',
    'account.js',
    'script.js',
    'style.css',
    'admin-v2.css',
    'supabase-config.js',
    'pwa.js',
    'pwa-admin-shell.js',
    'sw.js',
    'manifest.webmanifest',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    'adatok.json',
    'deployment.json'
]);
const PUBLIC_DIRECTORIES = new Set([
    'assets',
    'adatkezeles',
    'admin',
    'arlista',
    'fiokom',
    'foglalas',
    'galeria',
    'gel-lakk-tatabanya',
    'kepek',
    'korom-diszites-nail-art-tatabanya',
    'manikur-tatabanya',
    'mukorom-epites-toltes'
]);
const PUBLIC_NESTED_EXTENSIONS = new Set(['.html', '.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico']);

module.exports = { PUBLIC_ROOT_FILES, PUBLIC_DIRECTORIES, PUBLIC_NESTED_EXTENSIONS };
