"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── Máscara de CPF ─────────────────────────────────────────────────────────────
function mascaraCpf(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// ── Estados possíveis da tela ─────────────────────────────────────────────────
type Tela = "cpf" | "gerando" | "pix" | "confirmado";

export default function PagarPage() {
  const router = useRouter();

  const [userName, setUserName]   = useState("");
  const [userId, setUserId]       = useState<string | null>(null);
  const [tela, setTela]           = useState<Tela>("cpf");
  const [cpf, setCpf]             = useState("");
  const [cpfErro, setCpfErro]     = useState("");
  const [qrCode, setQrCode]       = useState("");      // copia-e-cola
  const [qrImagem, setQrImagem]   = useState("");      // base64
  const [copiado, setCopiado]     = useState(false);
  const [erroApi, setErroApi]     = useState("");

  // ── Carrega usuário ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserName(user.user_metadata?.full_name?.split(" ")[0] ?? "");
      setUserId(user.id);

      // Se já tem QR code no banco, pula a etapa do CPF
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

  // ── Realtime: redireciona quando pago=true ────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const canal = supabase
      .channel(`pago_${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "usuarios_bolao", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.new?.pago) {
            setTela("confirmado");
            setTimeout(() => router.push("/dashboard"), 2000);
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [userId, router]);

  // ── Gera cobrança via API ──────────────────────────────────────────────────────
  async function gerarPix() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) { setCpfErro("Digite um CPF válido (11 dígitos)."); return; }
    setCpfErro("");
    setErroApi("");
    setTela("gerando");

    try {
      const res  = await fetch("/api/criar-cobranca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfLimpo }),
      });
      const data = await res.json();

      if (!res.ok) { setErroApi(data.error ?? "Erro ao gerar PIX"); setTela("cpf"); return; }

      setQrCode(data.qrCode);
      if (data.qrImagem) setQrImagem(data.qrImagem);
      setTela("pix");

    } catch {
      setErroApi("Erro de conexão. Tente novamente.");
      setTela("cpf");
    }
  }

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const sair = async () => { await supabase.auth.signOut(); router.push("/"); };

  // ── Confirmado ─────────────────────────────────────────────────────────────────
  if (tela === "confirmado") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center flex flex-col items-center gap-4">
          <span className="text-6xl">🎉</span>
          <h2 className="text-2xl font-black text-green-700">Pagamento confirmado!</h2>
          <p className="text-gray-500 text-sm">Redirecionando para o dashboard…</p>
          <svg className="animate-spin w-6 h-6 text-green-600 mt-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-green-700 px-6 py-5 text-white text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="font-black text-xl">
            Quase lá{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="text-green-200 text-sm mt-1">
            Pague <strong>R$ 49,90</strong> via PIX para liberar seu bolão
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">

          {/* ── ETAPA 1: CPF ─────────────────────────────────────────── */}
          {(tela === "cpf" || tela === "gerando") && (
            <>
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 text-sm text-yellow-800 font-semibold text-center">
                ⚡ PIX gerado na hora — confirmação automática em segundos
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Seu CPF
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => { setCpf(mascaraCpf(e.target.value)); setCpfErro(""); }}
                  onKeyDown={(e) => e.key === "Enter" && gerarPix()}
                  disabled={tela === "gerando"}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-gray-800 text-lg font-mono outline-none tracking-wider disabled:opacity-60"
                  autoFocus
                />
                {cpfErro && <p className="text-red-500 text-xs mt-1 font-semibold">{cpfErro}</p>}
                <p className="text-gray-400 text-xs mt-1">Necessário para emissão do PIX via Asaas</p>
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

          {/* ── ETAPA 2: QR Code gerado ──────────────────────────────── */}
          {tela === "pix" && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-semibold text-center">
                ✅ PIX gerado! Escaneie ou copie o código abaixo
              </div>

              {/* QR Code — imagem base64 do Asaas ou via API pública */}
              <div className="flex justify-center">
                <div className="bg-white p-2 rounded-xl border-2 border-green-300 shadow">
                  {qrImagem ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`data:image/png;base64,${qrImagem}`}
                      alt="QR Code PIX"
                      width={200}
                      height={200}
                    />
                  ) : (
                    /* Fallback: gera QR via API pública caso não tenha imagem */
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                      alt="QR Code PIX"
                      width={200}
                      height={200}
                    />
                  )}
                </div>
              </div>

              {/* Copia e cola */}
              {qrCode && (
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">
                    Ou copia e cola:
                  </p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <span className="flex-1 font-mono text-xs text-gray-400 truncate">
                      {qrCode.slice(0, 44)}…
                    </span>
                    <button
                      onClick={() => copiar(qrCode)}
                      className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        copiado ? "bg-green-500 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {copiado ? "✅ Copiado!" : "📋 Copiar"}
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
