// Supabase Edge Function: proxy
// Handles keepAlive and acts as a stable CORS-friendly endpoint
// IMPORTANT: Do not import app code here.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Dynamic CORS - echo Origin when present (required for credentials)
function buildCorsHeaders(origin?: string | null) {
  const allowedOrigin = origin || "https://lovable.dev"; // default to lovable.dev per user request
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  } as Record<string, string>;
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const origin = req.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Parse body safely
  let body: any = null;
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      body = await req.json();
    }
  } catch {
    // ignore
  }

  const pathParam = url.searchParams.get("path") || body?.path || "";
  const isKeepAlive = pathParam === "keepAlive" || url.pathname.endsWith("/keepAlive");

  if (isKeepAlive || req.method === "GET") {
    // Always return 200 OK, with required CORS headers
    const payload = {
      ok: true,
      endpoint: "keepAlive",
      timestamp: Date.now(),
      meta: {
        note: "Stable keep-alive response with strict CORS",
      },
      headersEcho: {
        "Access-Control-Allow-Origin": corsHeaders["Access-Control-Allow-Origin"],
        "Access-Control-Allow-Credentials": corsHeaders["Access-Control-Allow-Credentials"],
      },
    };
    return new Response(JSON.stringify(payload), { status: 200, headers: corsHeaders });
  }

  // Default route (noop)
  return new Response(
    JSON.stringify({ ok: true, message: "proxy function online" }),
    { status: 200, headers: corsHeaders }
  );
});
