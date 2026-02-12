"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Row = { id: string; customer_name: string|null; phone: string|null; city: string|null; status: string; call_attempts: number; order_number: string|null; created_at_shopify: string|null; };

export default function CallQueue() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/call-queue", { cache: "no-store" });
    const data = await res.json();
    setRows(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function logAttempt(id: string) {
    await fetch(`/api/orders/${id}/call-attempt`, { method: "POST" });
    await load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}/status`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div className="space-y-3">
      <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>

      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Attempts</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 font-semibold">{r.order_number ?? "-"}</td>
                <td className="p-3">{r.customer_name ?? "-"}</td>
                <td className="p-3">{r.phone ?? "-"}</td>
                <td className="p-3 text-white/70">{r.city ?? "-"}</td>
                <td className="p-3"><span className="rounded-lg border border-white/10 px-2 py-1 bg-white/5">{r.status}</span></td>
                <td className="p-3">{r.call_attempts}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={()=>logAttempt(r.id)}>+ Attempt</Button>
                    <Button onClick={()=>setStatus(r.id,"confirmado")}>Confirm</Button>
                    <Button variant="secondary" onClick={()=>setStatus(r.id,"llamar_hoy")}>Call Today</Button>
                    <Button variant="danger" onClick={()=>setStatus(r.id,"cancelado")}>Cancel</Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={7} className="p-4 text-white/60">No pending calls.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
