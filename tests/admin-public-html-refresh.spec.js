const { test, expect } = require('playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/admin/18-public-html-refresh.js'), 'utf8');

function createRefresh(hostname, response = { data: { ok: true }, error: null }) {
    const calls = [];
    const allapot = {
        session: {},
        kliens: { functions: { invoke: async (...args) => {
            calls.push(args);
            if (response instanceof Error) throw response;
            return response;
        } } }
    };
    const window = { location: { hostname } };
    vm.runInNewContext(source, { window, allapot, console: { warn() {} } });
    return { allapot, calls, refresh: window.lumiPublikusHtmlFrissitesKerese };
}

for (const [hostname, target] of [
    ['luminails.hu', 'request-live-site-rebuild'],
    ['www.luminails.hu', 'request-live-site-rebuild'],
    ['enneno.github.io', 'request-site-rebuild'],
    ['127.0.0.1', 'request-site-rebuild'],
    ['localhost', 'request-site-rebuild'],
    ['luminails.hu.example.com', 'request-site-rebuild']
]) {
    test(`public HTML refresh uses the correct environment on ${hostname}`, async () => {
        const fixture = createRefresh(hostname);
        expect((await fixture.refresh('x'.repeat(100))).ok).toBe(true);
        expect(fixture.calls).toHaveLength(1);
        expect(fixture.calls[0][0]).toBe(target);
        expect(fixture.calls[0][1].body.reason).toHaveLength(80);
    });
}

test('public HTML refresh does not invoke a function without an admin session', async () => {
    const fixture = createRefresh('luminails.hu');
    fixture.allapot.session = null;
    expect((await fixture.refresh()).reason).toBe('nincs_admin_munkamenet');
    expect(fixture.calls).toHaveLength(0);
});

for (const [label, response, reason] of [
    ['authorization error', { data: null, error: { message: 'not_authorized' } }, 'not_authorized'],
    ['network error', new Error('network unavailable'), 'network unavailable']
]) {
    test(`public HTML refresh reports ${label} without retrying elsewhere`, async () => {
        const fixture = createRefresh('luminails.hu', response);
        const result = await fixture.refresh();
        expect(result.ok).toBe(false);
        expect(result.reason).toBe(reason);
        expect(fixture.calls).toHaveLength(1);
        expect(fixture.calls[0][0]).toBe('request-live-site-rebuild');
    });
}
