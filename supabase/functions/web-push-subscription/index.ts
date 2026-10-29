import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPushNotification } from "npm:@mmmike/web-push@1.3.0/send";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json({ ok: false, error: "missing_environment" }, 500);
    }

    const token = bearerToken(req.headers.get("authorization"));
    if (!token) return json({ ok: false, error: "not_authorized" }, 401);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    const user = authError ? null : authData?.user;

    if (!user?.id) {
      return json({ ok: false, error: "not_authorized" }, 403);
    }
    const { data: isAdmin, error: roleError } = await authClient.rpc("is_lumi_admin");
    if (roleError || isAdmin !== true) {
      return json({ ok: false, error: "not_authorized" }, 403);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const config = await loadPushConfig(adminClient);
    if (!config.publicKey) return json({ ok: false, error: "push_not_configured" }, 503);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "").trim();

    if (action === "config") {
      return json({ ok: true, vapid_public_key: config.publicKey });
    }

    if (action === "test") {
      const endpoint = String(body.endpoint || "").trim();
      if (!validEndpoint(endpoint)) return json({ ok: false, error: "invalid_endpoint" }, 400);
      const { data: subscription, error } = await adminClient.from("web_push_subscriptions")
        .select("endpoint,p256dh,auth_secret").eq("user_id", user.id).eq("endpoint", endpoint).is("disabled_at", null).maybeSingle();
      if (error) return json({ ok: false, error: "subscription_lookup_failed" }, 503);
      if (!subscription) return json({ ok: false, error: "subscription_not_found" }, 404);
      if (!config.privateKey) return json({ ok: false, error: "push_not_configured" }, 503);
      const sent = await sendPushNotification({ endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth_secret } }, {
        title: "Lumi Nails próbaértesítés", body: "A telefonos értesítések működnek ezen az eszközön.",
        icon: "/kepek/favicon-192.png", badge: "/kepek/favicon-96.png", tag: "lumi-admin-push-test", data: { url: "/admin/?tab=settings" },
      }, { publicKey: config.publicKey, privateKey: config.privateKey, subject: config.subject });
      if (!sent) return json({ ok: false, error: "push_delivery_failed" }, 502);
      return json({ ok: true });
    }

    if (action === "subscribe") {
      const subscription = normalizeSubscription(body.subscription);
      if (!subscription) return json({ ok: false, error: "invalid_subscription" }, 400);

      const now = new Date().toISOString();
      const { error } = await adminClient
        .from("web_push_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth_secret: subscription.keys.auth,
          user_agent: String(req.headers.get("user-agent") || "").slice(0, 500),
          updated_at: now,
          last_seen_at: now,
          disabled_at: null,
        }, { onConflict: "endpoint" });

      if (error) {
        console.error("web-push-subscription upsert failed", error.message);
        return json({ ok: false, error: "subscription_save_failed" }, 500);
      }
      return json({ ok: true, subscribed: true });
    }

    if (action === "unsubscribe") {
      const endpoint = String(body.endpoint || "").trim();
      if (!validEndpoint(endpoint)) return json({ ok: false, error: "invalid_endpoint" }, 400);

      const { error } = await adminClient
        .from("web_push_subscriptions")
        .update({ disabled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("endpoint", endpoint);

      if (error) {
        console.error("web-push-subscription disable failed", error.message);
        return json({ ok: false, error: "subscription_remove_failed" }, 500);
      }
      return json({ ok: true, subscribed: false });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (error) {
    console.error("web-push-subscription unexpected error", errorMessage(error));
    return json({ ok: false, error: "unexpected_error" }, 500);
  }
});

async function loadPushConfig(client: any) {
  const { data, error } = await client.rpc("get_web_push_server_config");
  if (error) throw new Error(`push_config: ${error.message}`);
  const value = data && typeof data === "object" ? data : {};
  return { publicKey: String(value.vapid_public_key || "").trim(), privateKey: String(value.vapid_private_key || "").trim(), subject: String(value.vapid_subject || "").trim() };
}

function normalizeSubscription(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const keys = source.keys && typeof source.keys === "object" ? source.keys as Record<string, unknown> : {};
  const endpoint = String(source.endpoint || "").trim();
  const p256dh = String(keys.p256dh || "").trim();
  const auth = String(keys.auth || "").trim();
  if (!validEndpoint(endpoint) || p256dh.length < 20 || auth.length < 8) return null;
  if (endpoint.length > 4000 || p256dh.length > 1000 || auth.length > 1000) return null;
  return { endpoint, keys: { p256dh, auth } };
}

function validEndpoint(value: string) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

function bearerToken(header: string | null) {
  const match = String(header || "").match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "unknown_error");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
