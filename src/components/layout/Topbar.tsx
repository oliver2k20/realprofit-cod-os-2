"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@supabase/supabase-js";

export function Topbar() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-panel2/40 px-6 py-4">
      <div className="text-sm text-white/70">COD Ops + Profit Dashboard</div>
      <Button variant="secondary" onClick={logout}>Logout</Button>
    </div>
  );
}
