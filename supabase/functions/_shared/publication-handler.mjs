import { loadPublicSnapshot, contentFingerprint } from './public-snapshot.mjs';

export function publicationHandler({ environment, env, createClient, fetchImpl = fetch }) {
  return async request => {
    const configuredOrigin = env('LUMI_' + environment.toUpperCase() + '_SITE_URL');
    const origin = request.headers.get('origin');
    const allowed = new Set([configuredOrigin, ...(env('LUMI_PUBLICATION_ALLOWED_ORIGINS') || '').split(',').map(x => x.trim())].filter(Boolean));
    if (environment === 'test') ['http://127.0.0.1:8101', 'http://127.0.0.1:8102', 'http://localhost:8101'].forEach(x => allowed.add(x));
    const headers = {
      'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin',
      ...(origin && allowed.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    };
    const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
    if (origin && !allowed.has(origin)) return reply({ ok: false, error: 'origin_not_allowed' }, 403);
    if (request.method === 'OPTIONS') return reply({ ok: true });
    if (request.method !== 'POST') return reply({ ok: false, error: 'method_not_allowed' }, 405);
    let stage = 'authentication';
    let privateClient;
    let claimedHash;
    try {
      const url = env('SUPABASE_URL');
      const publicKey = env('SUPABASE_ANON_KEY');
      const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
      if (!url || !publicKey || !serviceKey) return reply({ ok: false, error: 'missing_environment' }, 503);
      const authorization = request.headers.get('authorization') || '';
      if (!/^Bearer\s+\S+$/i.test(authorization)) return reply({ ok: false, error: 'not_authenticated' }, 401);
      const auth = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
      const client = createClient(url, publicKey, { global: { headers: { Authorization: authorization } }, auth });
      const user = await client.auth.getUser();
      if (user.error || !user.data?.user?.id) return reply({ ok: false, error: 'not_authenticated' }, 401);
      const admin = await client.rpc('is_lumi_admin');
      if (admin.error || admin.data !== true) return reply({ ok: false, error: 'not_authorized' }, 403);
      if (!configuredOrigin) return reply({ ok: false, error: 'publication_not_configured' }, 503);
      const site = new URL(configuredOrigin);
      if (site.protocol !== 'https:' || site.username || site.password || site.origin !== configuredOrigin) {
        return reply({ ok: false, error: 'invalid_site_origin' }, 503);
      }
      const text = await request.text();
      if (new TextEncoder().encode(text).length > 4096) return reply({ ok: false, error: 'request_too_large' }, 413);
      let body;
      try { body = text ? JSON.parse(text) : {}; }
      catch (_) { return reply({ ok: false, error: 'invalid_request' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return reply({ ok: false, error: 'invalid_request' }, 400);
      const action = body.action || 'publish';
      if (!['publish', 'status'].includes(action)) return reply({ ok: false, error: 'invalid_action' }, 400);
      stage = 'snapshot';
      const snapshot = await loadPublicSnapshot({ url, key: publicKey, fetchImpl });
      const hash = await contentFingerprint(snapshot);
      stage = 'verify';
      const deployed = await fetchImpl(new URL('/deployment.json', configuredOrigin), {
        cache: 'no-store', redirect: 'error', headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10000),
      });
      let manifest = null;
      if (deployed.ok) manifest = await deployed.json();
      else if (deployed.status !== 404) return reply({ ok: false, error: 'publication_verification_unavailable' }, 503);
      const matches = manifest?.schemaVersion === 1 && manifest.environment === environment
        && manifest.origin === configuredOrigin && manifest.contentHash === hash;
      const common = { ok: true, contentHash: hash, siteUrl: configuredOrigin, environment };
      if (matches) return reply({ ...common, state: 'published', published: true, queued: false });
      privateClient = createClient(url, serviceKey, { auth });
      if (action === 'status') {
        const state = await privateClient.rpc('lumi_publication_state', { p_environment: environment });
        if (state.error) return reply({ ok: false, error: 'publication_migration_required' }, 503);
        return reply({ ...common, state: state.data?.content_hash === hash && Date.parse(state.data?.claimed_until) > Date.now() ? 'pending' : 'unpublished', published: false });
      }
      const hookValue = env('CLOUDFLARE_' + environment.toUpperCase() + '_DEPLOY_HOOK');
      if (!hookValue) return reply({ ok: false, error: 'publication_not_configured' }, 503);
      const hook = new URL(hookValue);
      if (hook.protocol !== 'https:' || !hook.hostname.endsWith('.cloudflare.com') || hook.username || hook.password) {
        return reply({ ok: false, error: 'invalid_deploy_hook' }, 503);
      }
      stage = 'claim';
      const claim = await privateClient.rpc('lumi_claim_publication', { p_environment: environment, p_content_hash: hash });
      if (claim.error || typeof claim.data !== 'boolean') return reply({ ok: false, error: 'publication_migration_required' }, 503);
      if (claim.data !== true) return reply({ ...common, state: 'pending', published: false, queued: false });
      claimedHash = hash;
      stage = 'hook';
      const dispatched = await fetchImpl(hook, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!dispatched.ok) throw new Error('hook_rejected');
      return reply({ ...common, state: 'pending', published: false, queued: true }, 202);
    } catch (_) {
      if (claimedHash && privateClient) {
        try { await privateClient.rpc('lumi_release_publication', { p_environment: environment, p_content_hash: claimedHash }); }
        catch (_) { /* A failed release expires automatically; preserve the original error response. */ }
      }
      // Never log hook URLs, tokens, payloads, users or raw exceptions.
      console.error('publication_request_failed', { environment, stage });
      return reply({ ok: false, error: 'publication_' + stage + '_failed' }, 502);
    }
  };
}
