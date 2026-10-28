const { test, expect } = require('playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');

const source = fs.readFileSync(path.join(__dirname, '../src/admin/18-public-html-refresh.js'), 'utf8');

function createRefresh(hostname, response = { data: { ok: true, published: true, state: 'published' }, error: null }, manifest = null) {
    const calls = [];
    const allapot = {
        session: {},
        kliens: { functions: { invoke: async (...args) => {
            calls.push(args);
            if (response instanceof Error) throw response;
            return response;
        } } }
    };
    const { document } = parseHTML('<html><body><main class="admin-workspace-main"></main></body></html>');
    const window = { location: { hostname }, setTimeout: () => 1, clearTimeout() {} };
    vm.runInNewContext(source, { window, document, allapot, URL, AbortSignal,
        fetch: async () => ({ ok: true, json: async () => manifest }), console: { warn() {} } });
    return { allapot, calls, document, refresh: window.lumiPublikusHtmlFrissitesKerese };
}

for (const [hostname, target] of [
    ['luminails.hu', 'publish-live-site-content'],
    ['www.luminails.hu', 'publish-live-site-content'],
    ['enneno.github.io', 'publish-site-content'],
    ['127.0.0.1', 'publish-site-content'],
    ['localhost', 'publish-site-content'],
    ['luminails.hu.example.com', 'publish-site-content']
]) {
    test(`public HTML refresh uses the correct environment on ${hostname}`, async () => {
        const fixture = createRefresh(hostname);
        expect((await fixture.refresh('x'.repeat(100))).ok).toBe(true);
        expect(fixture.calls).toHaveLength(1);
        expect(fixture.calls[0][0]).toBe(target);
        expect(fixture.calls[0][1].body.reason).toHaveLength(80);
        expect(fixture.document.querySelector('#admin-publication-status').dataset.publicationState).toBe('published');
    });
}

test('public HTML refresh does not invoke a function without an admin session', async () => {
    const fixture = createRefresh('luminails.hu');
    fixture.allapot.session = null;
    expect((await fixture.refresh()).reason).toBe('nincs_admin_munkamenet');
    expect(fixture.calls).toHaveLength(0);
});

for (const [label, response, reason] of [
    ['authorization error', { data: null, error: { message: 'not_authorized' } }, 'publication_request_failed'],
    ['network error', new Error('network unavailable'), 'publication_request_failed']
]) {
    test(`public HTML refresh reports ${label} without retrying elsewhere`, async () => {
        const fixture = createRefresh('luminails.hu', response);
        const result = await fixture.refresh();
        expect(result.ok).toBe(false);
        expect(result.reason).toBe(reason);
        expect(fixture.calls).toHaveLength(1);
        expect(fixture.calls[0][0]).toBe('publish-live-site-content');
    });
}

test('queued build is not shown as published until the served manifest matches', async () => {
    const data = { ok: true, state: 'pending', published: false, contentHash: 'a'.repeat(64), siteUrl: 'https://test.example', environment: 'test' };
    const fixture = createRefresh('localhost', { data, error: null }, { schemaVersion: 1, contentHash: 'b'.repeat(64), origin: data.siteUrl, environment: 'test' });
    await fixture.refresh();
    await new Promise(resolve => setImmediate(resolve));
    expect(fixture.document.querySelector('#admin-publication-status').dataset.publicationState).toBe('pending');
});

test('served content hash confirms publication', async () => {
    const data = { ok: true, state: 'pending', published: false, contentHash: 'a'.repeat(64), siteUrl: 'https://test.example', environment: 'test' };
    const fixture = createRefresh('localhost', { data, error: null }, { schemaVersion: 1, contentHash: data.contentHash, origin: data.siteUrl, environment: 'test' });
    await fixture.refresh();
    await new Promise(resolve => setImmediate(resolve));
    expect(fixture.document.querySelector('#admin-publication-status').dataset.publicationState).toBe('published');
});

test('publication requests after separate saves are serialized while identical status reads coalesce', async () => {
    const saves = createRefresh('localhost');
    await Promise.all([saves.refresh('first-save'), saves.refresh('second-save')]);
    expect(saves.calls).toHaveLength(2);
    const checks = createRefresh('localhost');
    await Promise.all([checks.refresh('check', 'status'), checks.refresh('check', 'status')]);
    expect(checks.calls).toHaveLength(1);
});
