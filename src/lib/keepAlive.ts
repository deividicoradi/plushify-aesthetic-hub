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
    const { data, error } = await supabase.functions.invoke("proxy", {
      body: { path: "keepAlive" },
      headers: { "cache-control": "no-store" },
    });
    if (error) throw error;
    console.log("[KEEPALIVE] 200 OK", data);
    return data as KeepAliveResult;
  } catch (err) {
    console.warn("[KEEPALIVE] failed", err);
    return null;
  }
}
