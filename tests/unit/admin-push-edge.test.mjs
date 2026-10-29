import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';
import { normalizePushPreferences, pushKind } from '../../supabase/functions/_shared/admin-push-policy.mjs';

// Execute the real Edge handlers with only the Supabase/push transport replaced.
async function handler(slug, options = {}) {
  const sent = [], reads = [];
  const config = { vapid_public_key: 'synthetic-public', vapid_private_key: 'synthetic-private', vapid_subject: 'mailto:admin@example.test', webhook_secret: 'synthetic-secret' };
  const tables = {
    site_settings: [{ key: 'admin_push_preferences', value: options.preferences || {} }],
    services: [{ id: 'service', name: 'Synthetic manicure' }],
    customer_profiles: [{ user_id: 'guest', full_name: 'Synthetic guest' }],
    admin_error_events: [{ id: 42, source: 'booking_email', title: 'Email failure', detail: '8/8 attempts' }],
    web_push_subscriptions: [{ id: 'subscription', user_id: 'admin', endpoint: 'https://push.example.test/admin', p256dh: 'synthetic-key', auth_secret: 'synthetic-auth', disabled_at: null },
      { id: 'other-subscription', user_id: 'other', endpoint: 'https://push.example.test/other', p256dh: 'synthetic-key', auth_secret: 'synthetic-auth', disabled_at: null }],
  };
  class Query {
    constructor(table) { this.table = table; this.filters = []; reads.push(table); }
    select() { return this; }
    eq(key, value) { this.filters.push(row => String(row[key]) === String(value)); return this; }
    is(key, value) { this.filters.push(row => row[key] === value); return this; }
    update(value) { this.patch = value; return this; }
    upsert() { return this; }
    maybeSingle() { this.single = true; return this; }
    then(resolve, reject) {
      if (options.preferencesError && this.table === 'site_settings') return Promise.resolve({ error: { code: 'synthetic-error' } }).then(resolve, reject);
      const rows = (tables[this.table] || []).filter(row => this.filters.every(filter => filter(row)));
      if (this.patch) for (const row of rows) Object.assign(row, this.patch);
      return Promise.resolve({ data: this.single ? rows[0] || null : rows, error: null }).then(resolve, reject);
    }
  }
  const client = {
    from: table => new Query(table),
    rpc: async name => ({ data: name === 'get_web_push_server_config' ? config : options.admin !== false, error: null }),
    auth: {
      getUser: async token => ({ data: { user: token === 'valid-jwt' ? { id: 'admin', email: 'admin@example.test' } : null }, error: null }),
      admin: { getUserById: async () => ({ data: { user: { email: 'guest@example.test', email_confirmed_at: options.unconfirmed ? null : '2026-01-01', is_anonymous: false } }, error: null }) },
    },
  };
  const compiled = await build({ entryPoints: [`supabase/functions/${slug}/index.ts`], bundle: true, write: false, platform: 'node', format: 'cjs',
    external: ['https://*', 'npm:*'], logLevel: 'silent' });
  const sandbox = { TextEncoder, Response, Request, URL, Date, Intl, console: { error() {}, warn() {} },
    Deno: { env: { get: key => ({ SUPABASE_URL: 'https://synthetic.example.test', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service', SUPABASE_ANON_KEY: 'synthetic-anon' })[key] } },
    require: name => name.includes('/server.ts') ? { serve: fn => sandbox.handler = fn }
      : name.includes('supabase-js') ? { createClient: () => client }
        : { sendPushNotification: async (...args) => { sent.push(args); return true; } },
  };
  vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  return { sent, reads, tables, invoke: async (body, headers = {}, method = 'POST') => {
    const response = await sandbox.handler(new Request('https://synthetic.example.test', { method, headers: { 'content-type': 'application/json', ...headers }, body: method === 'POST' ? JSON.stringify(body) : undefined }));
    return { status: response.status, data: JSON.parse(await response.text()) };
  } };
}

test('push delivery: all four categories are filtered server-side and admin cancellation is ignored', async () => {
  assert.deepEqual(normalizePushPreferences({ newBooking: false, cancellation: 'false', unrelated: false }), { newBooking: false, cancellation: true, guestRegistration: true, bookingEmailFailure: true });
  assert.equal(pushKind({ type: 'UPDATE', record: { status: 'cancelled' }, old_record: { status: 'confirmed' } }), '');
  const cases = [
    ['newBooking', { type: 'INSERT', record: { id: 'booking', customer_name: 'Synthetic guest', starts_at: '2026-10-30T09:00:00Z', service_id: 'service' } }],
    ['cancellation', { type: 'UPDATE', record: { id: 'booking', status: 'cancelled_by_customer', customer_name: 'Synthetic guest' }, old_record: { status: 'confirmed' } }],
    ['guestRegistration', { kind: 'guestRegistration', record: { user_id: 'guest' } }],
    ['bookingEmailFailure', { kind: 'bookingEmailFailure', record: { id: 42, detail: 'Do not trust webhook body' } }],
  ];
  for (const [kind, body] of cases) {
    const off = await handler('send-web-push', { preferences: { [kind]: false } });
    assert.equal((await off.invoke(body, { 'x-lumi-web-push-secret': 'synthetic-secret' })).data.reason, 'category_disabled');
    assert.equal(off.sent.length, 0); assert.equal(off.reads.includes('web_push_subscriptions'), false);
    const on = await handler('send-web-push');
    assert.equal((await on.invoke(body, { 'x-lumi-web-push-secret': 'synthetic-secret' })).data.sent, 2);
    const payload = on.sent[0][1];
    assert.match(payload.body, kind === 'bookingEmailFailure' ? /8\/8 attempts/ : /Synthetic guest/);
    assert.doesNotMatch(payload.body, /Do not trust webhook body/);
    assert.match(payload.data.url, /\?tab=/);
  }
});

test('push delivery: webhook authentication, preference lookup failure and unconfirmed accounts do not send', async () => {
  const edge = await handler('send-web-push');
  assert.equal((await edge.invoke({ type: 'INSERT', record: {} })).status, 401);
  assert.equal(edge.sent.length, 0);
  const failure = await handler('send-web-push', { preferencesError: true });
  assert.equal((await failure.invoke({ type: 'INSERT', record: {} }, { 'x-lumi-web-push-secret': 'synthetic-secret' })).status, 503);
  assert.equal(failure.sent.length, 0);
  const unconfirmed = await handler('send-web-push', { unconfirmed: true });
  assert.equal((await unconfirmed.invoke({ kind: 'guestRegistration', record: { user_id: 'guest' } }, { 'x-lumi-web-push-secret': 'synthetic-secret' })).data.skipped, true);
  assert.equal(unconfirmed.sent.length, 0);
});

test('push subscription: JWT and current admin role required; config is public-key only; test targets own active device', async () => {
  const edge = await handler('web-push-subscription');
  assert.equal((await edge.invoke({ action: 'config' })).status, 401);
  assert.equal((await edge.invoke({ action: 'config' }, { authorization: 'Bearer invalid-jwt' })).status, 403);
  const denied = await handler('web-push-subscription', { admin: false });
  assert.equal((await denied.invoke({ action: 'test', endpoint: 'https://push.example.test/admin' }, { authorization: 'Bearer valid-jwt' })).status, 403);
  assert.equal(denied.sent.length, 0);
  const config = await edge.invoke({ action: 'config' }, { authorization: 'Bearer valid-jwt' });
  assert.deepEqual(config.data, { ok: true, vapid_public_key: 'synthetic-public' });
  assert.equal((await edge.invoke({ action: 'test', endpoint: 'https://push.example.test/other' }, { authorization: 'Bearer valid-jwt' })).status, 404);
  assert.equal(edge.sent.length, 0);
  assert.equal((await edge.invoke({ action: 'test', endpoint: 'https://push.example.test/admin' }, { authorization: 'Bearer valid-jwt' })).data.ok, true);
  assert.equal(edge.sent.length, 1);
  assert.equal(edge.sent[0][0].endpoint, 'https://push.example.test/admin');
  await edge.invoke({ action: 'unsubscribe', endpoint: 'https://push.example.test/admin' }, { authorization: 'Bearer valid-jwt' });
  assert.equal((await edge.invoke({ action: 'test', endpoint: 'https://push.example.test/admin' }, { authorization: 'Bearer valid-jwt' })).status, 404);
  assert.equal(edge.tables.web_push_subscriptions[1].disabled_at, null);
});
