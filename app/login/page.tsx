"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Modo = "entrar" | "cadastrar";

function LoginForm() {
  const params    = useSearchParams();
  const erroParam = params.get("erro");

  const [modo,          setModo]          = useState<Modo>("entrar");
  const [email,         setEmail]         = useState("");
  const [senha,         setSenha]         = useState("");
  const [loadingEmail,  setLoadingEmail]  = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [erroLocal,     setErroLocal]     = useState("");
  const [mensagem,      setMensagem]      = useState("");

  // ── Redireciona após login bem-sucedido ──────────────────────────────────────
  async function redirecionarAposLogin() {
    try {
      const res = await fetch("/api/auth/pos-login", { method: "POST" });
      const data = (await res.json()) as { redirectTo?: string; error?: string };

      if (!res.ok || !data.redirectTo) {
        setErroLocal(data.error ?? "Erro ao preparar redirecionamento.");
        return;
      }

      window.location.assign(data.redirectTo);
    } catch (e) {
      console.error("[login] redirecionarAposLogin:", e);
      setErroLocal("Erro inesperado. Tente novamente.");
    }
  }

  // ── Login com Google ─────────────────────────────────────────────────────────
  const loginGoogle = async () => {
    setLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoadingGoogle(false);
  };

  // ── Login / Cadastro com e-mail ──────────────────────────────────────────────
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErroLocal("");
    setMensagem("");

    if (senha.length < 6) {
      setErroLocal("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoadingEmail(true);

    if (modo === "entrar") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

      if (error) {
        setErroLocal("E-mail ou senha incorretos.");
      } else if (data.user) {
        await redirecionarAposLogin();
      }

    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErroLocal(
          error.message.includes("already registered")
            ? "Este e-mail já está cadastrado. Tente fazer login."
            : "Erro ao criar conta. Tente novamente.",
        );
      } else if (data.user && data.session) {
        // Confirmação desabilitada → sessão imediata
        await redirecionarAposLogin();
      } else if (data.user) {
        // Confirmação ainda ativa → tenta login automático mesmo assim
        const { data: signIn } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (signIn?.user) {
          await redirecionarAposLogin();
        } else {
          // Usuário criado mas e-mail não confirmado — instrui o próximo passo
          setErroLocal("Conta criada, mas não consegui iniciar a sessão automaticamente. Tente entrar com seu e-mail e senha.");
        }
      } else {
        setErroLocal("Erro ao criar conta. Tente novamente.");
      }
    }

    setLoadingEmail(false);
  };

  const trocarModo = (novo: Modo) => {
    setModo(novo);
    setErroLocal("");
    setMensagem("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#050816] overflow-hidden">

      {/* Fundo estádio */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-estadio.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050816]/80 via-[#050816]/60 to-[#050816]/95" />
      </div>

      {/* Grade + brilho */}
      <div className="hero-grid absolute inset-0 z-0 opacity-40" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-400/15 blur-[130px] z-0 pointer-events-none" />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Voltar */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
        >
          ← Voltar
        </Link>

        {/* Card */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0b1024]/90 p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-[#050816]">
              <Trophy size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              bolaofamilia<span className="text-emerald-400">.online</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Copa 2026 — Bolão da família</p>
          </div>

          {/* Abas Entrar / Criar conta */}
          <div className="mb-5 flex rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => trocarModo("entrar")}
              className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
                modo === "entrar"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => trocarModo("cadastrar")}
              className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
                modo === "cadastrar"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Erro */}
          {(erroParam || erroLocal) && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-center text-sm font-semibold text-red-300">
              ⚠️ {erroLocal || "Falha ao autenticar. Tente novamente."}
            </div>
          )}

          {/* Mensagem de sucesso (ex: confirmar e-mail) */}
          {mensagem && (
            <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-center text-sm font-semibold text-emerald-300">
              ✅ {mensagem}
            </div>
          )}

          {/* Formulário e-mail + senha */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
            <input
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30 transition"
            />
            <input
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              required
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30 transition"
            />
            <button
              type="submit"
              disabled={loadingEmail}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3.5 font-black text-[#050816] transition active:scale-[0.98]"
            >
              {loadingEmail
                ? "Aguarde…"
                : modo === "entrar" ? "Entrar" : "Criar minha conta"}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 font-semibold">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Botão Google */}
          <button
            onClick={loginGoogle}
            disabled={loadingGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loadingGoogle ? "Abrindo Google…" : "Continuar com Google"}
          </button>

          {/* Nota PIX */}
          <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center text-xs leading-5 text-slate-500">
            🔒 Após o login, libere o acesso com pagamento único de{" "}
            <strong className="text-slate-300">R$ 49,90</strong> via PIX
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
