"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── Máscara CPF (11 dígitos) ou CNPJ (14 dígitos) ────────────────────────────
function mascaraCpfCnpj(v: string) {
  const nums = v.replace(/\D/g, "").slice(0, 14);
  if (nums.length <= 11) {
    return nums
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return nums
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

// ── Estados possíveis da tela ─────────────────────────────────────────────────
type Tela = "cpf" | "gerando" | "pix" | "confirmado" | "redirecionando";

const pageBg = "min-h-screen flex items-center justify-center p-4";

const pageStyle = {
  background:
    "radial-gradient(circle at 18% 18%, rgba(34,197,94,0.20), transparent 30%), radial-gradient(circle at 82% 12%, rgba(0,87,255,0.16), transparent 32%), linear-gradient(135deg, #001030 0%, #001847 44%, #002B6B 100%)",
};

const cardClass =
  "bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20";

export default function PagarPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [userId,   setUserId]   = useState<string | null>(null);
  const [tela,     setTela]     = useState<Tela>("cpf");
  const [cpfCnpj,  setCpfCnpj] = useState("");
  const [inputErr, setInputErr] = useState("");
  const [qrCode,   setQrCode]   = useState("");   // copia-e-cola (EMV)
  const [qrImagem, setQrImagem] = useState("");   // base64 PNG do Asaas
  const [copiado,  setCopiado]  = useState(false);
  const [erroApi,  setErroApi]  = useState("");

  // ── Carrega usuário ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserName(user.user_metadata?.full_name?.split(" ")[0] ?? "");
      setUserId(user.id);

      // Se já tem QR ou já pagou, pula etapa do CPF
      supabase
        .from("usuarios_bolao")
        .select("pago, asaas_pix_qr_code")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.pago)              { router.push("/dashboard"); return; }
          if (data?.asaas_pix_qr_code) { setQrCode(data.asaas_pix_qr_code); setTela("pix"); }
        });
    });
  }, [router]);

  // ── Sequência de popups após confirmação ────────────────────────────────────
  function iniciarConfirmacao() {
    setTela("confirmado");                     // popup 1 — 4 s
    setTimeout(() => {
      setTela("redirecionando");               // popup 2 — 4 s → redirect
      setTimeout(() => router.push("/dashboard/novo"), 4000);
    }, 4000);
  }

  // ── Realtime: dispara quando pago=true ──────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const canal = supabase
      .channel(`pago_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usuarios_bolao",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => { if (payload.new?.pago) iniciarConfirmacao(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Fallback polling a cada 5 s (caso Realtime falhe) ────────────────────────
  useEffect(() => {
    if (!userId || tela !== "pix") return;

    const intervalo = setInterval(async () => {
      const { data } = await supabase
        .from("usuarios_bolao")
        .select("pago")
        .eq("user_id", userId)
        .single();
      if (data?.pago) iniciarConfirmacao();
    }, 5000);

    return () => clearInterval(intervalo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tela]);

  // ── Gera cobrança PIX personalizada via Asaas ────────────────────────────────
  async function gerarPix() {
    const limpo = cpfCnpj.replace(/\D/g, "");
    if (limpo.length !== 11 && limpo.length !== 14) {
      setInputErr("Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }
    setInputErr("");
    setErroApi("");
    setTela("gerando");

    try {
      const res  = await fetch("/api/criar-cobranca", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cpf: limpo }),   // a rota aceita CPF ou CNPJ
      });
      const data = await res.json();

      if (!res.ok) {
        setErroApi(data.error ?? "Erro ao gerar PIX");
        setTela("cpf");
        return;
      }

      setQrCode(data.qrCode);
      if (data.qrImagem) setQrImagem(data.qrImagem);
      setTela("pix");

    } catch {
      setErroApi("Erro de conexão. Tente novamente.");
      setTela("cpf");
    }
  }

  const copiar = () => {
    navigator.clipboard.writeText(qrCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const sair = async () => { await supabase.auth.signOut(); router.push("/"); };

  return (
    <div className={pageBg} style={pageStyle}>

      {/* ── POPUP 1: Pagamento confirmado ─────────────────────────────────────── */}
      {tela === "confirmado" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-green-100 animate-ping opacity-40" />
              <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">Pagamento realizado</h2>
              <h2 className="text-2xl font-black text-green-600">com sucesso! 🎉</h2>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3 w-full">
              <p className="text-sm text-green-700 font-semibold">✅ R$ 49,90 confirmado via PIX</p>
              <p className="text-xs text-green-600 mt-0.5">bolaofamilia.online — Copa 2026</p>
            </div>
            <p className="text-gray-400 text-sm">Preparando seu bolão…</p>
          </div>
        </div>
      )}

      {/* ── POPUP 2: Redirecionando ───────────────────────────────────────────── */}
      {tela === "redirecionando" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b1024] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-400/30 border-t-emerald-400 animate-spin" />
            <div>
              <p className="text-white font-black text-lg">Aguarde…</p>
              <p className="text-slate-400 text-sm mt-1.5 leading-5">
                Você será redirecionado para a<br />
                <strong className="text-emerald-400">página de configuração do bolão</strong>
              </p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="progress-bar h-full bg-emerald-400 rounded-full" />
            </div>
            <style>{`
              @keyframes progress { from { width:0% } to { width:100% } }
              .progress-bar { animation: progress 4s linear forwards; }
            `}</style>
          </div>
        </div>
      )}

      {/* ── CARD PRINCIPAL ────────────────────────────────────────────────────── */}
      <div className={cardClass}>

        {/* Header verde */}
        <div className="bg-[linear-gradient(135deg,#006B35_0%,#009344_52%,#002B6B_100%)] px-6 py-5 text-white text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="font-black text-xl">
            Quase lá{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="text-green-200 text-sm mt-1">
            Pague <strong>R$ 49,90</strong> via PIX para liberar seu bolão
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">

          {/* ── ETAPA 1: CPF / CNPJ ──────────────────────────────────────────── */}
          {(tela === "cpf" || tela === "gerando") && (
            <>
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 text-sm text-yellow-800 font-semibold text-center">
                ⚡ PIX gerado na hora — confirmação automática em segundos
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  PIX do pagador
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CPF ou CNPJ do pagador"
                  value={cpfCnpj}
                  onChange={(e) => { setCpfCnpj(mascaraCpfCnpj(e.target.value)); setInputErr(""); }}
                  onKeyDown={(e) => e.key === "Enter" && gerarPix()}
                  disabled={tela === "gerando"}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-gray-800 text-base font-mono outline-none tracking-wider disabled:opacity-60"
                  autoFocus
                />
                {inputErr && <p className="text-red-500 text-xs mt-1 font-semibold">{inputErr}</p>}
                <p className="text-gray-400 text-xs mt-1">
                  Informe o CPF ou CNPJ vinculado à sua chave PIX
                </p>
              </div>

              {erroApi && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-semibold text-center">
                  ⚠️ {erroApi}
                </div>
              )}

              <button
                onClick={gerarPix}
                disabled={tela === "gerando"}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-base"
              >
                {tela === "gerando" ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Gerando PIX…
                  </>
                ) : "💸 Gerar meu PIX"}
              </button>
            </>
          )}

          {/* ── ETAPA 2: QR Code personalizado ───────────────────────────────── */}
          {tela === "pix" && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-semibold text-center">
                ✅ PIX gerado! Escaneie ou copie o código abaixo
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-2xl border-2 border-green-400 shadow-md">
                  {qrImagem ? (
                    // imagem base64 do Asaas (melhor qualidade)
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:image/png;base64,${qrImagem}`}
                      alt="QR Code PIX"
                      width={220}
                      height={220}
                    />
                  ) : (
                    // fallback: gera via API pública
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qrCode)}`}
                      alt="QR Code PIX"
                      width={220}
                      height={220}
                    />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  QR Code PIX — R$ 49,90
                </span>
              </div>

              {/* Copia e cola */}
              {qrCode && (
                <div>
                  <p className="text-gray-500 text-xs font-bold mb-1.5 uppercase tracking-wide">
                    📋 Pix Copia e Cola
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                    <p className="font-mono text-[11px] text-gray-500 break-all leading-4 select-all">
                      {qrCode}
                    </p>
                    <button
                      onClick={copiar}
                      className={`w-full text-sm font-black py-2.5 rounded-lg transition-all ${
                        copiado
                          ? "bg-green-500 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {copiado ? "✅ Código copiado!" : "📋 Copiar código PIX"}
                    </button>
                  </div>
                </div>
              )}

              {/* Aguardando */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <svg className="animate-spin w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-blue-700 text-sm font-semibold">
                  Aguardando confirmação automática do pagamento…
                </p>
              </div>

              <p className="text-center text-xs text-gray-400">
                Após pagar, o acesso é liberado automaticamente em segundos 🚀
              </p>
            </>
          )}

          <button
            onClick={sair}
            className="text-gray-400 hover:text-gray-600 text-xs font-semibold text-center transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
