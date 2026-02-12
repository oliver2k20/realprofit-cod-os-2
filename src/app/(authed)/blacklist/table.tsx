"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Row = { id: string; phone: string; name: string|null; reason: string|null; is_active: boolean; created_at: string; };

export default function Blacklist() {
  const [rows, setRows] = useState<Row[]>([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/blacklist", { cache: "no-store" });
    const data = await res.json();
    setRows(data.items ?? []);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    await fetch("/api/blacklist", {
      method:"POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ phone, name, reason }),
    });
    setPhone(""); setName(""); setReason("");
    await load();
  }

  async function toggle(id: string, is_active: boolean) {
    await fetch(`/api/blacklist/${id}`, {
      method:"POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ is_active: !is_active }),
    });
    await load();
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-4">
        <Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" />
        <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name (optional)" />
        <Input value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Reason (optional)" />
        <Button onClick={add} disabled={!phone}>Add</Button>
      </div>

      <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>

      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Reason</th>
              <th className="text-left p-3">Active</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 font-semibold">{r.phone}</td>
                <td className="p-3">{r.name ?? "-"}</td>
                <td className="p-3 text-white/70">{r.reason ?? "-"}</td>
                <td className="p-3">{r.is_active ? "✅" : "—"}</td>
                <td className="p-3">
                  <Button variant="secondary" onClick={()=>toggle(r.id, r.is_active)}>
                    {r.is_active ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={5} className="p-4 text-white/60">No blacklist entries.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
