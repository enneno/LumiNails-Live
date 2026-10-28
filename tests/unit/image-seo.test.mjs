import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import imageSeo from '../../scripts/image-seo.js';

const { publicPageImages, appendGalleryMetadata, imageSitemapEntries } = imageSeo;
const origin = 'https://example.test';

test('public image discovery uses original photos, removes duplicates and excludes private surfaces', () => {
    const { document } = parseHTML(`<html><body><div class="galeria-racs">
        <button class="galeria-kep-gomb" data-src="/photos/full.jpg?a=1&b=2"><img src="/photos/thumb.jpg" alt="Francia körömdíszítés"></button>
        <button class="galeria-kep-gomb" data-src="/photos/full.jpg?a=1&b=2"><img src="/photos/other-thumb.jpg"></button>
        <img src="javascript:alert(1)">
    </div><img src="/private/inspiration.jpg"></body></html>`);
    const images = publicPageImages(document, '/galeria/', origin);
    assert.equal(images.length, 1);
    assert.equal(images[0].contentUrl, origin + '/photos/full.jpg?a=1&b=2');
    assert.equal(images[0].thumbnailUrl, origin + '/photos/thumb.jpg');
    for (const route of ['/foglalas/', '/fiokom/', '/admin/', '/adatkezeles/']) {
        assert.deepEqual(publicPageImages(document, route, origin), []);
    }
    const xml = imageSitemapEntries(images);
    assert.ok(xml.includes('?a=1&amp;b=2'));
    assert.ok(!xml.includes('thumb.jpg') && !xml.includes('private'));
});

test('gallery metadata preserves captions without inventing keywords or allowing script injection', () => {
    const { document } = parseHTML('<html><head><title>Körmös munkák Tatabánya</title><meta name="description" content="Manikűr és gél lakk"></head><body><div class="galeria-racs"><img src="/photo.jpg"></div></body></html>');
    const caption = '</script><script>alert(1)</script>';
    document.querySelector('img').alt = caption;
    appendGalleryMetadata(document, origin);
    appendGalleryMetadata(document, origin);
    assert.equal(document.querySelectorAll('#lumi-gallery-images').length, 1);
    const raw = document.getElementById('lumi-gallery-images').textContent;
    assert.ok(!raw.includes('<'));
    const metadata = JSON.parse(raw);
    assert.equal(metadata.image[0].caption, caption);
    assert.equal(metadata.image[0].contentUrl, origin + '/photo.jpg');
    assert.equal(metadata.name, document.title);
    assert.equal(metadata.image[0].creator, undefined);
    assert.equal(metadata.image[0].license, undefined);
    const reparsed = parseHTML(document.toString()).document;
    assert.equal(reparsed.querySelectorAll('script').length, 1);
});
