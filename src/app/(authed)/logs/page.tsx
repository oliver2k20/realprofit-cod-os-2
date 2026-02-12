import { supabaseAdmin } from "@/lib/supabase/admin";

async function getStoreId() {
  const env = process.env.DEFAULT_STORE_ID;
  if (env) return env;
  const { data } = await supabaseAdmin.from("stores").select("id").limit(1);
  return data?.[0]?.id as string | undefined;
}

export default async function LogsPage() {
  const storeId = await getStoreId();
  const { data } = storeId
    ? await supabaseAdmin.from("webhook_events").select("*").eq("store_id", storeId).order("received_at", { ascending: false }).limit(100)
    : { data: [] as any[] };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">Logs</div>
        <div className="text-sm text-white/60">Latest webhook events (last 100).</div>
      </div>
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="text-left p-3">Time</th>
              <th className="text-left p-3">Topic</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Payload</th>
              <th className="text-left p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((e: any) => (
              <tr key={e.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 text-white/70">{new Date(e.received_at).toLocaleString()}</td>
                <td className="p-3 font-semibold">{e.topic}</td>
                <td className="p-3">{e.status_code ?? "-"}</td>
                <td className="p-3 font-mono text-xs text-white/70">{e.payload_hash?.slice(0,12) ?? "-"}</td>
                <td className="p-3 text-white/70">{e.error ?? ""}</td>
              </tr>
            ))}
            {(data ?? []).length===0 && <tr><td colSpan={5} className="p-4 text-white/60">No events yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
