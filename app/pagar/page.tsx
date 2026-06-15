"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PIX_CHAVE   = process.env.NEXT_PUBLIC_PIX_PLATAFORMA_CHAVE  ?? "";
const PIX_PAYLOAD = process.env.NEXT_PUBLIC_PIX_PLATAFORMA_PAYLOAD ?? "";
const QR_URL      = PIX_PAYLOAD
  ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PIX_PAYLOAD)}`
  : null;

export default function PagarPage() {
  const router = useRouter();
  const [copiado, setCopiado]     = useState(false);
  const [userName, setUserName]   = useState("");
  const [userId, setUserId]       = useState<string | null>(null);

  // Carrega usuário + escuta confirmação de pagamento em tempo real
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserName(user.user_metadata?.full_name ?? user.email ?? "");
      setUserId(user.id);
    });
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    // Polling: verifica se admin confirmou pagamento
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
        (payload) => {
          if (payload.new?.pago) router.push("/dashboard");
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [userId, router]);

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const sair = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-green-700 px-6 py-5 text-white text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="font-black text-xl">Quase lá{userName ? `, ${userName.split(" ")[0]}` : ""}!</h1>
          <p className="text-green-200 text-sm mt-1">
            Pague R$ 50,00 via PIX para liberar seu bolão
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">

          {/* Instrução */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 text-sm text-yellow-800 font-semibold text-center">
            ⚡ Após o pagamento, o acesso é liberado em até 5 minutos
          </div>

          {/* QR Code */}
          {QR_URL ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-600 text-sm font-semibold">📷 Escaneie com o app do banco:</p>
              <div className="bg-white p-2 rounded-xl border-2 border-green-300 shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={QR_URL} alt="QR Code PIX" width={200} height={200} />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
              QR Code PIX não configurado.<br />
              Configure <code>NEXT_PUBLIC_PIX_PLATAFORMA_PAYLOAD</code> no .env.local
            </div>
          )}

          {/* Copia e cola */}
          {PIX_PAYLOAD && (
            <div>
              <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">Ou use copia e cola:</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <span className="flex-1 font-mono text-xs text-gray-400 truncate">
                  {PIX_PAYLOAD.slice(0, 40)}…
                </span>
                <button
                  onClick={() => copiar(PIX_PAYLOAD)}
                  className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    copiado ? "bg-green-500 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {copiado ? "✅ Copiado!" : "📋 Copiar"}
                </button>
              </div>
            </div>
          )}

          {/* Chave PIX */}
          {PIX_CHAVE && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-green-800 font-black text-sm">Chave PIX</p>
                <p className="text-green-700 text-xs select-all font-mono">{PIX_CHAVE}</p>
              </div>
              <button
                onClick={() => copiar(PIX_CHAVE)}
                className="shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                Copiar
              </button>
            </div>
          )}

          {/* Aguardando */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <svg className="animate-spin w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-blue-700 text-sm font-semibold">
              Aguardando confirmação do pagamento…
            </p>
          </div>

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
