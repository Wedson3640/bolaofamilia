"use client";

import { useState } from "react";
import { X, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ── Modal de login ─────────────────────────────────────────────────────────── */

function LoginModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
    // Se chegou aqui é porque o redirecionamento ainda não aconteceu
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0b1024] p-8 shadow-2xl">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-[#050816]">
            <Trophy size={28} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Criar seu bolão</h2>
          <p className="mt-2 text-sm leading-5 text-slate-400">
            Entre com Google para criar seu bolão da Copa 2026 em minutos
          </p>
        </div>

        {/* Botão Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* Logo Google */}
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? "Abrindo Google…" : "Continuar com Google"}
        </button>

        {/* Nota de pagamento */}
        <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center text-xs leading-5 text-slate-500">
          <span>🔒</span>{" "}
          Após o login, você libera o acesso com pagamento único de{" "}
          <strong className="text-slate-300">R$ 50,00</strong> via PIX e já
          configura seu bolão.
        </div>
      </div>
    </div>
  );
}

/* ── Botão que abre o modal ─────────────────────────────────────────────────── */

export function CriarAgoraButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && <LoginModal onClose={() => setOpen(false)} />}
    </>
  );
}
