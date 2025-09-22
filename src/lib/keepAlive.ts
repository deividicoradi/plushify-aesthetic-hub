import { supabase } from "@/integrations/supabase/client";

export type KeepAliveResult = {
  ok: boolean;
  endpoint: string;
  timestamp: number;
  headersEcho?: Record<string, string>;
};

// Calls the Supabase Edge Function "proxy" to keep the app/session alive
export async function pingKeepAlive(): Promise<KeepAliveResult | null> {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase.functions.invoke("proxy", {
      body: { path: "keepAlive" },
      headers: { 
        "cache-control": "no-store",
        "content-type": "application/json"
      },
    });
    
    if (error) {
      console.error("[KEEPALIVE] Supabase function error:", error);
      throw error;
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`[KEEPALIVE] ✅ 200 OK (${responseTime}ms)`, {
      ok: data?.ok,
      endpoint: data?.endpoint,
      timestamp: data?.timestamp
    });
    
    return data as KeepAliveResult;
  } catch (err: any) {
    console.error("[KEEPALIVE] ❌ FAILED:", {
      name: err?.name || "Unknown",
      message: err?.message || "No message",
      details: err?.details || "No details",
      hint: err?.hint || "No hint"
    });
    return null;
  }
}
