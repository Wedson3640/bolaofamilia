"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { BolaoRow, ParticipanteRow } from "@/lib/supabase";

type Participante = {
  id: number;
  nome: string;
  placarCasa: string;
  placarFora: string;
  pago: boolean;
};

const fromDB = (p: ParticipanteRow): Participante => ({
  id: p.id,
  nome: p.nome,
  placarCasa: p.placar_brasil,
  placarFora: p.placar_haiti,
  pago: p.pago,
});

function formatarData(iso: string) {
  const d = new Date(iso);
  return {
    data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function GerenciarBolaoPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = params.slug as string;

  const [bolao, setBolao]                     = useState<BolaoRow | null>(null);
  const [participantes, setParticipantes]     = useState<Participante[]>([]);
  const [carregando, setCarregando]           = useState(true);
  const [linkCopiado, setLinkCopiado]         = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState<number | null>(null);
  const [toggling, setToggling]               = useState<number | null>(null);

  // Carrega bolão verificando que é dono
  useEffect(() => {
    const carregar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data, error } = await supabase
        .from("boloes")
        .select("*")
        .eq("slug", slug)
        .eq("user_id", user.id)
        .single();

      if (error || !data) { router.push("/dashboard"); return; }
      setBolao(data as BolaoRow);
      setCarregando(false);
    };
    carregar();
  }, [slug, router]);

  // Busca participantes
  const buscarParticipantes = useCallback(async () => {
    if (!bolao?.id) return;
    const { data } = await supabase
      .from("participantes")
      .select("*")
      .eq("bolao_id", bolao.id)
      .order("criado_em", { ascending: true });
    if (data) setParticipantes(data.map(fromDB));
  }, [bolao?.id]);

  useEffect(() => {
    if (!bolao?.id) return;
    buscarParticipantes();

    const canal = supabase
      .channel(`admin_${bolao.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "participantes", filter: `bolao_id=eq.${bolao.id}` },
        () => buscarParticipantes()
      )
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [bolao?.id, buscarParticipantes]);

  const togglePagamento = async (p: Participante) => {
    setToggling(p.id);
    // Optimistic
    setParticipantes((prev) => prev.map((x) => x.id === p.id ? { ...x, pago: !x.pago } : x));
    await supabase.from("participantes").update({ pago: !p.pago }).eq("id", p.id);
    setToggling(null);
  };

  const removerParticipante = async (id: number) => {
    setParticipantes((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("participantes").delete().eq("id", id);
    setConfirmarExcluir(null);
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/bolao/${slug}`);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2500);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  if (!bolao) return null;

  const { data: dataJogo, hora } = formatarData(bolao.jogo_data);
  const pagantes    = participantes.filter((p) => p.pago);
  const pendentes   = participantes.filter((p) => !p.pago);
  const arrecadado  = pagantes.length * Number(bolao.valor_cota);
  const taxaAdmin   = arrecadado * (Number(bolao.taxa_admin_pct) / 100);
  const premio      = arrecadado - taxaAdmin;
  const bandeiraCasa = (bolao as BolaoRow & { bandeira_casa?: string }).bandeira_casa;
  const bandeiraFora = (bolao as BolaoRow & { bandeira_fora?: string }).bandeira_fora;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-gradient-to-b from-green-700 to-green-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard" className="text-green-200 hover:text-white text-sm font-semibold shrink-0">
              ← Dashboard
            </Link>
            <span className="text-green-400 shrink-0">·</span>
            <h1 className="font-black text-sm truncate">{bolao.titulo}</h1>
          </div>
          <Link href={`/bolao/${slug}`} target="_blank">
            <button className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
              👁 Ver público
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-5">

        {/* Info + Compartilhar */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="font-black text-gray-800 text-lg">{bolao.titulo}</h2>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-0.5">
                {bandeiraCasa && <Image src={`https://flagcdn.com/w20/${bandeiraCasa}.png`} alt="" width={20} height={13} unoptimized className="rounded" />}
                {bolao.jogo_time_casa}
                <span className="text-gray-300">×</span>
                {bolao.jogo_time_fora}
                {bandeiraFora && <Image src={`https://flagcdn.com/w20/${bandeiraFora}.png`} alt="" width={20} height={13} unoptimized className="rounded" />}
                · {dataJogo} {hora}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-auto">
              <span className="text-gray-400 font-mono text-xs truncate flex-1">/bolao/{slug}</span>
              <button
                onClick={copiarLink}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${linkCopiado ? "bg-green-500 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
              >
                {linkCopiado ? "✅ Copiado!" : "🔗 Copiar link"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Apostadores", valor: participantes.length, cor: "text-gray-800" },
              { label: "Pagantes", valor: pagantes.length, cor: "text-green-700" },
              { label: "Arrecadado", valor: `R$ ${arrecadado.toFixed(2).replace(".", ",")}`, cor: "text-green-700" },
              { label: "Prêmio (75%)", valor: `R$ ${premio.toFixed(2).replace(".", ",")}`, cor: "text-blue-700" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <p className="text-gray-400 text-xs font-semibold">{s.label}</p>
                <p className={`font-black text-lg ${s.cor}`}>{s.valor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Instrução de validação manual */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
          <span className="text-2xl shrink-0 mt-0.5">📲</span>
          <div>
            <p className="text-amber-800 font-black text-sm mb-1">Como validar os pagamentos</p>
            <ol className="text-amber-700 text-xs space-y-1 leading-5 list-decimal list-inside">
              <li>Abra o app do seu banco e confira os PIX recebidos</li>
              <li>Identifique o apostador pelo nome ou valor da cota</li>
              <li>Na lista abaixo, clique em <strong>&quot;✅ Marcar Pago&quot;</strong> ao lado do nome dele</li>
            </ol>
            <p className="text-amber-600 text-xs mt-1.5 font-semibold">
              ⚠️ A confirmação é manual — somente você vê os pagamentos recebidos na sua conta.
            </p>
          </div>
        </div>

        {/* Pendentes em destaque */}
        {pendentes.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl overflow-hidden">
            <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
              <span className="text-white font-black text-sm">⏳ Pagamentos Pendentes</span>
              <span className="bg-white text-red-600 text-xs font-black px-2 py-0.5 rounded-full">{pendentes.length}</span>
            </div>
            <ul className="divide-y divide-red-100">
              {pendentes.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-red-100/50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.nome}</p>
                    <p className="text-xs text-gray-400">
                      {bolao.jogo_time_casa} {p.placarCasa} × {p.placarFora} {bolao.jogo_time_fora}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePagamento(p)}
                    disabled={toggling === p.id}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-all"
                  >
                    {toggling === p.id ? "…" : "✅ Marcar Pago"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabela completa */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-green-700 px-4 py-2.5 flex items-center justify-between">
            <span className="text-white font-black text-sm">📋 Todos os Apostadores</span>
            <span className="text-green-200 text-xs font-semibold">{participantes.length} no total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-50 border-b border-green-100 text-gray-600 text-xs font-bold uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-center">{bolao.jogo_time_casa}</th>
                  <th className="px-4 py-2 text-center">{bolao.jogo_time_fora}</th>
                  <th className="px-4 py-2 text-center">Pago</th>
                  <th className="px-4 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {participantes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                      Nenhuma aposta ainda. Compartilhe o link! 🔗
                    </td>
                  </tr>
                ) : participantes.map((p, i) => (
                  <tr key={p.id} className={`border-b border-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50`}>
                    <td className="px-4 py-2.5 text-gray-500 text-sm">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-gray-800 text-sm">{p.nome}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="bg-green-100 text-green-800 font-black text-sm w-8 h-8 rounded-lg inline-flex items-center justify-center border border-green-200">
                        {p.placarCasa}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="bg-blue-50 text-blue-700 font-black text-sm w-8 h-8 rounded-lg inline-flex items-center justify-center border border-blue-100">
                        {p.placarFora}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => togglePagamento(p)}
                        disabled={toggling === p.id}
                        className={`inline-flex items-center gap-1 text-sm font-bold transition-all disabled:opacity-60 cursor-pointer hover:opacity-70 ${p.pago ? "text-green-600" : "text-red-500"}`}
                      >
                        {p.pago ? "✅ Pago" : "✕ Pendente"}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {confirmarExcluir === p.id ? (
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={() => removerParticipante(p.id)} className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded">Sim</button>
                          <button onClick={() => setConfirmarExcluir(null)} className="bg-gray-200 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded">Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmarExcluir(p.id)} className="text-red-400 hover:text-red-600 text-xs p-1 rounded transition-colors">
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-700 text-white text-xs">
                  <td colSpan={6} className="px-4 py-2">
                    <div className="flex justify-between">
                      <span>Total: <strong>{participantes.length}</strong></span>
                      <span>✅ <strong>{pagantes.length}</strong> · ✕ <strong>{pendentes.length}</strong></span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
