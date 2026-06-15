"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { BolaoRow, ParticipanteRow } from "@/lib/supabase";

// ─── Helpers ────────────────────────────────────────────────────────────────

const capitalizarNome = (texto: string) =>
  texto.toLowerCase().replace(/(?:^|\s)\S/g, (l) => l.toUpperCase());

const formatarData = (iso: string) => {
  const d = new Date(iso);
  return {
    data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
};

// Código ISO da bandeira a partir do nome do time
const BANDEIRAS: Record<string, string> = {
  brasil: "br", argentina: "ar", franca: "fr", frança: "fr",
  alemanha: "de", portugal: "pt", espanha: "es", uruguai: "uy",
  colombia: "co", colômbia: "co", chile: "cl", mexico: "mx",
  méxico: "mx", eua: "us", haiti: "ht", equador: "ec",
  paraguai: "py", bolivia: "bo", bolívia: "bo", peru: "pe",
  venezuela: "ve", jamaica: "jm", honduras: "hn",
};

function getBandeira(time: string): string | null {
  const key = time.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return BANDEIRAS[key] ?? null;
}

// ─── Tipos internos ──────────────────────────────────────────────────────────

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

// ─── Componente ─────────────────────────────────────────────────────────────

export default function BolaoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [bolao, setBolao] = useState<BolaoRow | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Admin
  const [adminLogado, setAdminLogado] = useState(false);
  const [donoLogado, setDonoLogado] = useState(false);
  const [mostrarPendentes, setMostrarPendentes] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState<number | null>(null);

  // Modal apostar
  const [mostrarApostar, setMostrarApostar] = useState(false);
  const [apostaNome, setApostaNome] = useState("");
  const [apostaCasa, setApostaCasa] = useState("");
  const [apostaFora, setApostaFora] = useState("");
  const [apostaCopied, setApostaCopied] = useState(false);
  const [apostaEnviada, setApostaEnviada] = useState(false);
  const [apostaErro, setApostaErro] = useState("");
  const [apostaEnviando, setApostaEnviando] = useState(false);
  const enviandoRef = useRef(false); // guard síncrono contra duplo clique

  // PIX na tela principal
  const [pixMainCopied, setPixMainCopied] = useState(false);

  // Resolve params async (Next.js 15+)
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // ── Buscar bolão ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;

    const carregar = async () => {
      setCarregando(true);

      const { data: bolaoData, error: bolaoErr } = await supabase
        .from("boloes")
        .select("*")
        .eq("slug", slug)
        .eq("ativo", true)
        .single();

      if (bolaoErr || !bolaoData) {
        setErro("Bolão não encontrado ou inativo.");
        setCarregando(false);
        return;
      }

      setBolao(bolaoData as BolaoRow);
      setCarregando(false);
    };

    carregar();
  }, [slug]);

  // ── Buscar participantes ──────────────────────────────────────────────────
  const buscarParticipantes = useCallback(async () => {
    if (!bolao?.id) return;
    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .eq("bolao_id", bolao.id)
      .order("criado_em", { ascending: true });
    if (!error && data) setParticipantes(data.map(fromDB));
  }, [bolao?.id]);

  useEffect(() => {
    if (!bolao?.id) return;
    buscarParticipantes();

    const canal = supabase
      .channel(`bolao_${bolao.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participantes", filter: `bolao_id=eq.${bolao.id}` },
        () => buscarParticipantes()
      )
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [bolao?.id, buscarParticipantes]);

  useEffect(() => {
    if (!bolao?.user_id) return;

    supabase.auth.getUser().then(({ data: { user } }) => {
      const ehDono = user?.id === bolao.user_id;
      setDonoLogado(ehDono);
      if (!ehDono) setAdminLogado(false);
    });
  }, [bolao?.user_id]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const togglePagamento = async (id: number) => {
    if (!adminLogado) return;
    const atual = participantes.find((p) => p.id === id);
    if (!atual) return;
    setParticipantes((prev) => prev.map((p) => p.id === id ? { ...p, pago: !p.pago } : p));
    await supabase.from("participantes").update({ pago: !atual.pago }).eq("id", id);
  };

  const removerParticipante = async (id: number) => {
    setParticipantes((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("participantes").delete().eq("id", id);
  };

  const enviarAposta = async () => {
    if (enviandoRef.current) return; // bloqueia duplo clique antes do re-render
    if (!apostaNome.trim() || !apostaCasa || !apostaFora || !bolao) return;
    enviandoRef.current = true;
    setApostaEnviando(true);
    setApostaErro("");
    const { data, error } = await supabase
      .from("participantes")
      .insert({
        bolao_id: bolao.id,
        nome: capitalizarNome(apostaNome.trim()),
        placar_brasil: apostaCasa,
        placar_haiti: apostaFora,
        pago: false,
      })
      .select()
      .single();
    setApostaEnviando(false);
    enviandoRef.current = false;
    if (error) { setApostaErro("Erro ao salvar. Tente novamente."); return; }
    if (data) setParticipantes((prev) => [...prev, fromDB(data as ParticipanteRow)]);
    setApostaEnviada(true);
  };

  const copiarPix = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setApostaCopied(true);
    setTimeout(() => setApostaCopied(false), 2500);
  };

  const fecharApostar = () => {
    setMostrarApostar(false);
    setApostaNome(""); setApostaCasa(""); setApostaFora("");
    setApostaCopied(false); setApostaEnviada(false);
    setApostaErro(""); setApostaEnviando(false);
    enviandoRef.current = false;
  };

  // ── Renderização ──────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="animate-spin w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span className="font-semibold">Carregando bolão...</span>
        </div>
      </div>
    );
  }

  if (erro || !bolao) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <span className="text-5xl block mb-4">😕</span>
          <h1 className="text-gray-800 font-black text-xl mb-2">Bolão não encontrado</h1>
          <p className="text-gray-500 text-sm">{erro ?? "Verifique o link e tente novamente."}</p>
        </div>
      </div>
    );
  }

  const { data: dataJogo, hora: horaJogo } = formatarData(bolao.jogo_data);
  const bandeiraCasa = getBandeira(bolao.jogo_time_casa);
  const bandeiraFora = getBandeira(bolao.jogo_time_fora);
  const qrPixUrl = bolao.payload_pix
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bolao.payload_pix)}`
    : null;
  const pagantes = participantes.filter((p) => p.pago);
  const arrecadado = pagantes.length * Number(bolao.valor_cota);
  const taxaAdmin = arrecadado * (Number(bolao.taxa_admin_pct) / 100);
  const premioTotal = arrecadado - taxaAdmin;
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ══════════════════ CABEÇALHO ══════════════════ */}
      <header className="bg-gradient-to-b from-green-700 to-green-600 shadow-xl">
        <div className="max-w-4xl mx-auto px-3 py-2 flex flex-col items-center gap-1.5">

          {/* Título do bolão */}
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h1 className="text-base font-black text-white tracking-wide uppercase drop-shadow text-center">
              {bolao.titulo}
            </h1>
            <span className="text-base">🏆</span>
          </div>

          {/* Nome do responsável */}
          {bolao.nome_responsavel && (
            <p className="text-green-200 text-xs font-semibold">
              👤 Organizado por{" "}
              <strong className="text-white">
                {bolao.nome_responsavel.split(" ").slice(0, 2).join(" ")}
              </strong>
            </p>
          )}

          {/* Valor da cota */}
          <div className="bg-yellow-400 text-green-900 font-black text-xs px-4 py-0.5 rounded-full shadow border border-yellow-500">
            💰 Cota: R$ {Number(bolao.valor_cota).toFixed(2).replace(".", ",")}
          </div>

          {/* Times + VS */}
          <div className="flex items-center gap-3 sm:gap-6">

            {/* Time da casa */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-black text-sm tracking-wide drop-shadow">
                {bolao.jogo_time_casa}
              </span>
              {bandeiraCasa ? (
                <Image
                  src={`https://flagcdn.com/w160/${bandeiraCasa}.png`}
                  alt={`Bandeira ${bolao.jogo_time_casa}`}
                  width={96} height={64}
                  className="rounded-lg shadow-md border-2 border-white/40 object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-24 h-16 rounded-lg bg-white/20 flex items-center justify-center text-2xl">
                  ⚽
                </div>
              )}
            </div>

            {/* VS + data */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-black text-lg sm:text-xl bg-green-900/50 px-4 py-0.5 rounded-lg border border-yellow-400 drop-shadow">
                VS
              </span>
              <div className="text-center text-white font-semibold bg-green-900/40 rounded-md px-2 py-1 leading-5">
                <div className="text-[11px]">📅 {dataJogo}</div>
                <div className="text-[11px]">🕙 {horaJogo}</div>
              </div>
            </div>

            {/* Time visitante */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-black text-sm tracking-wide drop-shadow">
                {bolao.jogo_time_fora}
              </span>
              {bandeiraFora ? (
                <Image
                  src={`https://flagcdn.com/w160/${bandeiraFora}.png`}
                  alt={`Bandeira ${bolao.jogo_time_fora}`}
                  width={96} height={64}
                  className="rounded-lg shadow-md border-2 border-white/40 object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-24 h-16 rounded-lg bg-white/20 flex items-center justify-center text-2xl">
                  ⚽
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ══════════════════ CONTEÚDO ══════════════════ */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* Botão Apostar */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setMostrarApostar(true)}
            className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-green-900 font-black text-base sm:text-lg px-8 sm:px-10 py-2.5 sm:py-3 rounded-2xl shadow-lg border-2 border-yellow-500 transition-all flex items-center gap-2"
          >
            🎯 Apostar Agora!
          </button>
        </div>

        {/* Barra de ações */}
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h2 className="text-gray-700 text-base sm:text-xl font-bold">📋 Planilha</h2>
          {donoLogado && (
          <div className="flex gap-2">
            {adminLogado ? (
              <button
                onClick={() => setAdminLogado(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm shadow transition-all"
              >
                Fechar aprovações
              </button>
            ) : (
              <button
                onClick={() => setAdminLogado(true)}
                className="bg-white hover:bg-gray-50 text-green-700 font-bold px-4 py-2 rounded-lg text-sm shadow transition-all border border-green-300"
              >
                Aprovar pagamentos
              </button>
            )}
          </div>
          )}
        </div>

        {/* Painel admin */}
        {adminLogado && (
          <div className="mb-4 flex flex-col gap-3">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 font-semibold text-sm px-4 py-2 rounded-lg inline-flex items-center gap-2 self-start">
              Modo aprovação — clique no status para aprovar ou desfazer pagamentos
            </div>
            <button
              onClick={() => setMostrarPendentes((v) => !v)}
              className="self-start flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-sm px-4 py-2 rounded-lg transition-all"
            >
              <span className="font-black">✕</span>
              {mostrarPendentes ? "Ocultar" : "Ver"} pagamentos pendentes
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {participantes.filter((p) => !p.pago).length}
              </span>
            </button>
            {mostrarPendentes && (
              <div className="bg-white border-2 border-red-200 rounded-2xl overflow-hidden shadow">
                <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
                  <span className="text-white font-black text-sm">⏳ Pendentes</span>
                  <span className="bg-white text-red-600 text-xs font-black px-2 py-0.5 rounded-full">
                    {participantes.filter((p) => !p.pago).length}
                  </span>
                </div>
                {participantes.filter((p) => !p.pago).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">🎉 Todos pagaram!</p>
                ) : (
                  <ul className="divide-y divide-red-50">
                    {participantes.filter((p) => !p.pago).map((p) => (
                      <li key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-red-50">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{p.nome}</p>
                          <p className="text-xs text-gray-400">
                            {bolao.jogo_time_casa} {p.placarCasa} × {p.placarFora} {bolao.jogo_time_fora}
                          </p>
                        </div>
                        <button
                          onClick={() => togglePagamento(p.id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-black px-3 py-1.5 rounded-lg"
                        >
                          ✅ Marcar Pago
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TABELA ── */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-black text-xs sm:text-sm w-8 sm:w-12">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black text-xs sm:text-sm">Nome</th>

                  {/* Mobile: coluna única "Casa × Fora" */}
                  <th className="table-cell sm:hidden px-2 py-2 text-center font-black text-xs">
                    <div className="flex items-center justify-center gap-1">
                      {bandeiraCasa
                        ? <Image src={`https://flagcdn.com/w40/${bandeiraCasa}.png`} alt="" width={18} height={12} className="rounded" unoptimized />
                        : <span className="text-[10px]">{bolao.jogo_time_casa.slice(0, 3)}</span>
                      }
                      <span className="text-[10px]">×</span>
                      {bandeiraFora
                        ? <Image src={`https://flagcdn.com/w40/${bandeiraFora}.png`} alt="" width={18} height={12} className="rounded" unoptimized />
                        : <span className="text-[10px]">{bolao.jogo_time_fora.slice(0, 3)}</span>
                      }
                    </div>
                  </th>

                  {/* Desktop: duas colunas */}
                  <th className="hidden sm:table-cell px-4 py-3 text-center font-black text-sm">
                    <div className="flex flex-col items-center gap-0.5">
                      {bandeiraCasa && <Image src={`https://flagcdn.com/w40/${bandeiraCasa}.png`} alt="" width={28} height={19} className="rounded shadow" unoptimized />}
                      <span>{bolao.jogo_time_casa}</span>
                    </div>
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-center font-black text-sm">
                    <div className="flex flex-col items-center gap-0.5">
                      {bandeiraFora && <Image src={`https://flagcdn.com/w40/${bandeiraFora}.png`} alt="" width={28} height={19} className="rounded shadow" unoptimized />}
                      <span>{bolao.jogo_time_fora}</span>
                    </div>
                  </th>

                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-black text-xs sm:text-sm">Pago</th>
                  {adminLogado && <th className="px-2 sm:px-4 py-2 sm:py-3 w-8 sm:w-12"></th>}
                </tr>
              </thead>

              <tbody>
                {participantes.length === 0 ? (
                  <tr>
                    <td colSpan={adminLogado ? 6 : 5} className="text-center py-12 text-gray-400 text-sm">
                      Nenhuma aposta ainda. Seja o primeiro! 🎯
                    </td>
                  </tr>
                ) : participantes.map((p, index) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50`}
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <span className="bg-green-700 text-white font-black text-[10px] sm:text-xs w-5 h-5 sm:w-7 sm:h-7 rounded-full inline-flex items-center justify-center">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm block max-w-[110px] sm:max-w-none">
                        {p.nome}
                      </span>
                    </td>
                    {/* Mobile */}
                    <td className="table-cell sm:hidden px-2 py-2 text-center">
                      <span className="inline-flex items-center gap-1 font-black text-xs">
                        <span className="text-green-700">{p.placarCasa}</span>
                        <span className="text-gray-400">×</span>
                        <span className="text-blue-700">{p.placarFora}</span>
                      </span>
                    </td>
                    {/* Desktop */}
                    <td className="hidden sm:table-cell px-4 py-3 text-center">
                      <span className="bg-green-100 text-green-800 font-black text-lg w-10 h-10 rounded-lg inline-flex items-center justify-center border-2 border-green-300">
                        {p.placarCasa}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-center">
                      <span className="bg-blue-50 text-blue-700 font-black text-lg w-10 h-10 rounded-lg inline-flex items-center justify-center border-2 border-blue-200">
                        {p.placarFora}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <button
                        onClick={() => togglePagamento(p.id)}
                        disabled={!adminLogado}
                        className={`inline-flex items-center gap-0.5 sm:gap-1 font-bold transition-all ${adminLogado ? "cursor-pointer hover:opacity-70" : "cursor-default"} ${p.pago ? "text-green-600" : "text-red-500"}`}
                      >
                        {p.pago ? (
                          <><span className="text-sm sm:text-base">✅</span><span className="hidden sm:inline text-sm">Pago</span></>
                        ) : (
                          <><span className="font-black text-sm sm:text-base">✕</span><span className="hidden sm:inline text-sm">Pendente</span></>
                        )}
                      </button>
                    </td>
                    {adminLogado && (
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                        {confirmarExcluir === p.id ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-red-600 font-bold">Excluir?</span>
                            <div className="flex gap-1">
                              <button onClick={() => { removerParticipante(p.id); setConfirmarExcluir(null); }} className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded">Sim</button>
                              <button onClick={() => setConfirmarExcluir(null)} className="bg-gray-200 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded">Não</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmarExcluir(p.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg px-1.5 sm:px-2 py-1 text-xs font-bold" title="Excluir">
                            🗑️
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-green-700 text-white">
                  <td colSpan={adminLogado ? 6 : 5} className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <div className="flex justify-between items-center flex-wrap gap-1 text-xs sm:text-sm">
                      <span className="font-semibold">Total: <strong>{participantes.length}</strong></span>
                      <div className="flex gap-3">
                        <span>✅ <strong>{pagantes.length}</strong></span>
                        <span>✕ <strong>{participantes.filter(p => !p.pago).length}</strong></span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Banner PIX */}
        <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-2xl overflow-hidden">
          {/* Cabeçalho */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-green-200">
            <span className="text-2xl">💸</span>
            <div className="flex-1">
              <p className="text-green-800 font-black text-sm">
                Pague sua cota — R$ {Number(bolao.valor_cota).toFixed(2).replace(".", ",")} via PIX
              </p>
              <p className="text-gray-500 text-xs">
                Chave: <strong className="text-green-700 select-all">{bolao.chave_pix}</strong>
              </p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(bolao.chave_pix); setPixMainCopied(true); setTimeout(() => setPixMainCopied(false), 2500); }}
              className="shrink-0 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow"
            >
              {pixMainCopied ? "✅ Copiado!" : "📋 Copiar chave"}
            </button>
          </div>

          {/* QR + copia-e-cola (só aparece se tiver payload) */}
          {bolao.payload_pix && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-1.5 rounded-xl border-2 border-green-300 shadow shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(bolao.payload_pix)}`}
                  alt="QR Code PIX"
                  width={140}
                  height={140}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2 w-full">
                <p className="text-xs text-gray-500 font-semibold">📷 Escaneie o QR ou copie o código:</p>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                  <span className="flex-1 text-gray-400 font-mono text-xs truncate">
                    {bolao.payload_pix.slice(0, 42)}…
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(bolao.payload_pix!); setPixMainCopied(true); setTimeout(() => setPixMainCopied(false), 2500); }}
                    className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${pixMainCopied ? "bg-green-500 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                  >
                    {pixMainCopied ? "✅ Copiado!" : "📋 Copiar código"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="mt-3 flex gap-3 justify-center flex-wrap text-gray-500 text-xs sm:text-sm">
          <div className="flex items-center gap-1"><span className="text-green-600 font-bold">✅</span><span>Pago</span></div>
          <div className="flex items-center gap-1"><span className="text-red-500 font-bold">✕</span><span>Pendente</span></div>
          {donoLogado && !adminLogado && (
            <div className="flex items-center gap-1 text-gray-400"><span>🔐</span><span>Dono aprova pagamentos</span></div>
          )}
        </div>

        <footer className="text-center mt-8 text-gray-400 text-xs">
          🏆 {bolao.titulo} · bolaofamilia.online
        </footer>

      </main>

      {/* ══════════════════ MODAIS ══════════════════ */}

      {/* Modal apostar */}
      {mostrarApostar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">

            {/* Header do modal */}
            <div className="bg-green-700 rounded-t-2xl px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-black text-xl">🎯 Fazer sua Aposta</h3>
              <button onClick={fecharApostar} className="text-white/70 hover:text-white text-2xl font-bold leading-none">✕</button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Etapa 1: formulário */}
              {!apostaEnviada ? (
                <>
                  <div>
                    <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">👤 Seu nome</label>
                    <input
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={apostaNome}
                      onChange={(e) => setApostaNome(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-2.5 text-gray-800 outline-none transition-colors"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold block mb-2 uppercase tracking-wide">⚽ Seu palpite</label>
                    <div className="flex items-center gap-3">
                      {/* Time da casa */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        {bandeiraCasa
                          ? <Image src={`https://flagcdn.com/w40/${bandeiraCasa}.png`} alt={bolao.jogo_time_casa} width={36} height={24} className="rounded shadow" unoptimized />
                          : <span className="text-2xl">⚽</span>
                        }
                        <span className="text-xs font-bold text-gray-600">{bolao.jogo_time_casa}</span>
                        <input
                          type="number" min="0" max="20" placeholder="0"
                          value={apostaCasa}
                          onChange={(e) => setApostaCasa(e.target.value)}
                          className="w-full border-2 border-green-300 focus:border-green-600 rounded-xl px-3 py-2 text-center text-xl font-black text-green-800 outline-none"
                        />
                      </div>
                      <span className="text-gray-400 font-black text-2xl pb-4">×</span>
                      {/* Time visitante */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        {bandeiraFora
                          ? <Image src={`https://flagcdn.com/w40/${bandeiraFora}.png`} alt={bolao.jogo_time_fora} width={36} height={24} className="rounded shadow" unoptimized />
                          : <span className="text-2xl">⚽</span>
                        }
                        <span className="text-xs font-bold text-gray-600">{bolao.jogo_time_fora}</span>
                        <input
                          type="number" min="0" max="20" placeholder="0"
                          value={apostaFora}
                          onChange={(e) => setApostaFora(e.target.value)}
                          className="w-full border-2 border-blue-200 focus:border-blue-500 rounded-xl px-3 py-2 text-center text-xl font-black text-blue-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {apostaErro && (
                    <div className="bg-red-50 border border-red-300 text-red-700 text-sm font-semibold px-4 py-2 rounded-xl text-center">
                      ⚠️ {apostaErro}
                    </div>
                  )}

                  <button
                    onClick={enviarAposta}
                    disabled={!apostaNome.trim() || !apostaCasa || !apostaFora || apostaEnviando}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-base py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2"
                  >
                    {apostaEnviando ? (
                      <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Salvando...</>
                    ) : <>✅ Confirmar Aposta</>}
                  </button>
                </>

              ) : (
                /* Etapa 2: Pagamento */
                <div className="flex flex-col gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex flex-col items-center gap-1 text-center">
                    <span className="text-3xl">🎉</span>
                    <p className="text-green-700 font-black text-base">Aposta confirmada!</p>
                    <p className="text-gray-500 text-sm">
                      <strong>{apostaNome}</strong> —{" "}
                      <strong className="text-green-700">{bolao.jogo_time_casa} {apostaCasa}</strong>
                      {" × "}
                      <strong className="text-blue-700">{bolao.jogo_time_fora} {apostaFora}</strong>
                    </p>
                  </div>

                  {/* PIX */}
                  <div className="bg-white border-2 border-green-300 rounded-2xl p-4 flex flex-col items-center gap-3">
                    <p className="text-green-800 font-black text-sm">💸 Agora realize o pagamento via PIX</p>
                    <p className="text-gray-500 text-xs text-center">
                      Valor: <strong className="text-green-700">R$ {Number(bolao.valor_cota).toFixed(2).replace(".", ",")}</strong> — confirmação pelo admin após o pagamento.
                    </p>
                    {qrPixUrl && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <div className="bg-white p-2 rounded-xl border-2 border-green-300 shadow">
                          <img src={qrPixUrl} alt="QR Code PIX" width={170} height={170} />
                        </div>
                        <p className="text-xs text-gray-400">📷 Escaneie para pagar</p>
                      </>
                    )}
                    {bolao.payload_pix && (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full">
                        <span className="flex-1 text-gray-500 font-mono text-xs truncate">{bolao.payload_pix.slice(0, 38)}…</span>
                        <button
                          onClick={() => copiarPix(bolao.payload_pix!)}
                          className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${apostaCopied ? "bg-green-500 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                        >
                          {apostaCopied ? "✅ Copiado!" : "📋 Copiar"}
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Chave: <strong className="text-gray-600">{bolao.chave_pix}</strong></p>
                  </div>

                  {/* Regras */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-amber-800 font-black text-sm mb-2">📜 Regras do Bolão</p>
                    <ul className="text-gray-600 text-xs space-y-1.5 leading-relaxed">
                      <li className="flex gap-2"><span>💰</span><span>Cota: <strong>R$ {Number(bolao.valor_cota).toFixed(2).replace(".", ",")}</strong> via PIX antes do jogo.</span></li>
                      <li className="flex gap-2"><span>🏆</span><span><strong>{Number(bolao.taxa_admin_pct).toFixed(0)}%</strong> da arrecadação vai para o organizador.</span></li>
                      <li className="flex gap-2"><span>🎉</span><span><strong>{(100 - Number(bolao.taxa_admin_pct)).toFixed(0)}%</strong> rateados entre quem acertar o placar exato <strong>e tiver pago</strong>.</span></li>
                      <li className="flex gap-2"><span>⚠️</span><span>Apostas <strong>pendentes</strong> não concorrem ao prêmio.</span></li>
                    </ul>
                    <div className="mt-3 bg-white rounded-xl border border-amber-200 px-3 py-2 text-xs text-gray-500">
                      <p className="font-bold text-amber-700 mb-1">📊 {pagantes.length} pagantes até agora:</p>
                      <div className="flex justify-between"><span>Arrecadado:</span><strong>R$ {arrecadado.toFixed(2).replace(".", ",")}</strong></div>
                      <div className="flex justify-between text-green-700"><span>Admin ({Number(bolao.taxa_admin_pct).toFixed(0)}%):</span><strong>R$ {taxaAdmin.toFixed(2).replace(".", ",")}</strong></div>
                      <div className="flex justify-between text-blue-700"><span>Prêmio:</span><strong>R$ {premioTotal.toFixed(2).replace(".", ",")}</strong></div>
                    </div>
                  </div>

                  <button onClick={fecharApostar} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 rounded-xl transition-all">
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
