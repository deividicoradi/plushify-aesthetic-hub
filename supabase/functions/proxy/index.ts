// Supabase Edge Function: proxy
// Handles keepAlive and acts as a stable CORS-friendly endpoint
// IMPORTANT: Do not import app code here.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Robust CORS headers for all requests
function buildCorsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": "*", // Always allow all origins for keepAlive
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, x-client-info, apikey",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Credentials": "false", // Simplified for public endpoint
    "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
    "Cache-Control": "no-store, no-cache",
    "Content-Type": "application/json; charset=utf-8",
    "X-Powered-By": "Supabase Edge Functions",
    "X-Function": "keepAlive-proxy"
  } as Record<string, string>;
}

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders();

  // Handle CORS preflight with proper response
  if (req.method === "OPTIONS") {
    console.log("[PROXY] CORS preflight request handled");
    return new Response(null, { 
      headers: corsHeaders, 
      status: 204 
    });
  }

  // Parse body safely for keepAlive detection
  let body: any = null;
  try {
    const contentType = req.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const text = await req.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    }
  } catch (error) {
    console.warn("[PROXY] Body parsing warning:", (error as Error).message);
  }

  // Detect keepAlive request from multiple sources
  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || body?.path || "";
  const isKeepAlive = pathParam === "keepAlive" || 
                     url.pathname.includes("keepAlive") || 
                     req.method === "GET";

  // Always return successful keepAlive response
  const payload = {
    ok: true,
    endpoint: "keepAlive",
    timestamp: Date.now(),
    method: req.method,
    userAgent: req.headers.get("user-agent")?.substring(0, 50) || "unknown",
    status: "healthy",
    version: "1.0.0"
  };

  console.log(`[PROXY] KeepAlive request processed successfully - ${req.method} ${url.pathname}`);
  
  return new Response(JSON.stringify(payload), { 
    status: 200, 
    headers: corsHeaders 
  });
});
