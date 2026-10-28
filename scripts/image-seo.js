'use strict';

const SERVICE_PATHS = new Set([
    '/mukorom-epites-toltes/', '/gel-lakk-tatabanya/',
    '/manikur-tatabanya/', '/korom-diszites-nail-art-tatabanya/'
]);

function publicPageImages(document, pathname, origin) {
    const selector = pathname === '/'
        ? '#hero img, #bemutatkozas img, #galeria-atvezeto img'
        : pathname === '/galeria/'
            ? '.galeria-racs img'
            : SERVICE_PATHS.has(pathname)
                ? '.seo-szolgaltatas-hero-kep img, .seo-szolgaltatas-kepracs img'
                : null;
    if (!selector) return [];

    const absolute = value => {
        if (!value) return null;
        try {
            const url = new URL(value, origin);
            return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
        } catch { return null; }
    };
    const images = new Map();
    for (const image of document.querySelectorAll(selector)) {
        const full = image.dataset.fullSrc || image.closest('.galeria-kep-gomb')?.dataset.src || image.getAttribute('src');
        const contentUrl = full && absolute(full);
        if (!contentUrl || images.has(contentUrl)) continue;
        images.set(contentUrl, {
            contentUrl,
            thumbnailUrl: absolute(image.getAttribute('src')) || contentUrl,
            caption: (image.getAttribute('alt') || '').trim()
        });
    }
    return [...images.values()];
}

function appendGalleryMetadata(document, origin) {
    const images = publicPageImages(document, '/galeria/', origin);
    document.getElementById('lumi-gallery-images')?.remove();
    if (!images.length) return;
    const metadata = {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        url: new URL('/galeria/', origin).href,
        name: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        image: images.map(image => ({ '@type': 'ImageObject', ...image }))
    };
    const script = document.createElement('script');
    script.id = 'lumi-gallery-images';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(metadata).replace(/</g, '\\u003c');
    document.head.appendChild(script);
}

function imageSitemapEntries(images) {
    const xml = value => value.replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
    })[character]);
    return images.map(image => `        <image:image><image:loc>${xml(image.contentUrl)}</image:loc></image:image>\n`).join('');
}

module.exports = { publicPageImages, appendGalleryMetadata, imageSitemapEntries };
