"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Cuenta creada. Revisa tu email si Supabase requiere confirmación. Luego inicia sesión.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-xl font-bold">RealProfit COD OS</div>
          <CardTitle className="mt-1">{mode === "login" ? "Login" : "Crear cuenta"}</CardTitle>
          <div className="text-xs text-white/55 mt-2">
            Proyecto interno. Un solo usuario.
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs text-white/65 mb-1">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>
          <div>
            <div className="text-xs text-white/65 mb-1">Password</div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {msg && <div className="text-sm text-yellow">{msg}</div>}

          <Button onClick={submit} disabled={loading || !email || !password} className="w-full">
            {loading ? "..." : (mode === "login" ? "Entrar" : "Crear cuenta")}
          </Button>

          <button
            className="text-xs text-white/60 hover:text-white"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "No tengo cuenta → Crear" : "Ya tengo cuenta → Login"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
