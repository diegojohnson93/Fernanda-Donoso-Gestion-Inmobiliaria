"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Contraseña incorrecta");
      setBusy(false);
    }
  };

  return (
    <div className="grid h-full place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            FD
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Fernanda Donoso</div>
            <div className="text-xs text-muted">Gestión Inmobiliaria</div>
          </div>
        </div>
        <input
          type="password"
          autoFocus
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-bad">{error}</p>}
        <button
          disabled={busy || !password}
          className="w-full rounded-lg bg-brand py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
