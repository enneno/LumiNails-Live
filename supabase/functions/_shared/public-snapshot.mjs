// Shared by the build and publication endpoint. Never include customer records here.
export const PUBLIC_CONTENT_KEYS = ['marka', 'navigacio', 'lablec', 'seo', 'kapcsolat', 'fooldal', 'szolgaltatasOldalak', 'arlista', 'galeria', 'foglalas'];

export function publicContent(snapshot) {
  const source = snapshot.siteContent || {};
  return {
    schemaVersion: 1,
    siteContent: Object.fromEntries(PUBLIC_CONTENT_KEYS.filter(key => Object.hasOwn(source, key)).map(key => [key, source[key]])),
    services: snapshot.services || [],
    phoneVisible: snapshot.phoneVisible ?? null,
    priceEffectiveAt: snapshot.priceEffectiveAt ?? null,
  };
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

export async function contentFingerprint(snapshot) {
  const bytes = new TextEncoder().encode(canonicalJson(publicContent(snapshot)));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function loadPublicSnapshot({ url, key, fetchImpl = fetch }) {
  async function read(table, query) {
    const endpoint = new URL('/rest/v1/' + table, url);
    for (const [name, value] of Object.entries(query)) endpoint.searchParams.set(name, value);
    const response = await fetchImpl(endpoint, {
      headers: { apikey: key, Authorization: 'Bearer ' + key },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error('public_snapshot_' + table + '_' + response.status);
    return response.json();
  }
  const [services, settings] = await Promise.all([
    read('services', {
      select: 'name,description,price_text,price_amount,price_unit,price_suffix,duration_minutes,active,sort_order',
      active: 'eq.true', order: 'sort_order.asc,name.asc',
    }),
    read('site_settings', { select: 'key,value,updated_at', key: 'in.(site_content,arlista_ervenyesseg,telefon_lathato)' }),
  ]);
  const row = key => settings?.find(item => item.key === key);
  const content = row('site_content');
  if (!Array.isArray(services) || !services.length || !content?.value || typeof content.value !== 'object') {
    throw new Error('public_snapshot_incomplete');
  }
  const price = row('arlista_ervenyesseg');
  return {
    ...publicContent({
      siteContent: content.value, services,
      priceEffectiveAt: price?.value?.effective_since || price?.updated_at || null,
      phoneVisible: typeof row('telefon_lathato')?.value?.visible === 'boolean' ? row('telefon_lathato').value.visible : null,
    }),
    contentUpdatedAt: content.updated_at || new Date(0).toISOString(),
  };
}
