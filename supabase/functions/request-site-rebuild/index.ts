import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")
    return json({ ok: false, error: "method_not_allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const adminEmail = (
      Deno.env.get("ADMIN_EMAIL") ||
      Deno.env.get("OWNER_EMAIL") ||
      ""
    )
      .trim()
      .toLowerCase();
    const githubToken = Deno.env.get("GITHUB_DISPATCH_TOKEN") || "";
    const githubRepository =
      Deno.env.get("GITHUB_REPOSITORY") || "enneno/enneno.github.io";
    const authorization = req.headers.get("Authorization") || "";

    if (!supabaseUrl || !anonKey || !adminEmail || !githubToken) {
      return json({ ok: false, error: "missing_environment" }, 503);
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await supabase.auth.getUser();
    const email = String(data.user?.email || "")
      .trim()
      .toLowerCase();
    if (error || !email || email !== adminEmail) {
      return json({ ok: false, error: "not_authorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const reason = String(body?.reason || "admin_content_updated").slice(0, 80);
    const githubResponse = await fetch(
      `https://api.github.com/repos/${githubRepository}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "LumiNails-Supabase-Rebuild",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          event_type: "site-content-updated",
          client_payload: { reason, requested_at: new Date().toISOString() },
        }),
      },
    );

    if (!githubResponse.ok) {
      console.error("GitHub dispatch failed", githubResponse.status);
      return json({ ok: false, error: "github_dispatch_failed" }, 502);
    }

    return json({ ok: true, queued: true }, 202);
  } catch (error) {
    console.error(
      "request-site-rebuild failed",
      error instanceof Error ? error.message : String(error),
    );
    return json({ ok: false, error: "unexpected_error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
