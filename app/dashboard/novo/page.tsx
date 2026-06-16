"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface JogoCopa {
  id:                  number;
  data:                string;   // "2026-06-13"
  horario:             string;   // "19:00:00"
  fase:                string;
  mandante:            string;
  visitante:           string;
  jogo:                string;
  bandeira_mandante:   string | null;
  bandeira_visitante:  string | null;
}

// ── Utilitários ───────────────────────────────────────────────────────────────
function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function dataHoraParaInput(data: string, horario: string) {
  // data: "2026-06-13", horario: "19:00:00" → "2026-06-13T19:00"
  return `${data}T${horario.slice(0, 5)}`;
}

function formatarDataExibicao(data: string, horario: string) {
  // "2026-06-13" + "19:00:00" → "13/06 19:00"
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano.slice(2)} ${horario.slice(0, 5)}`;
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function NovoBolaoPage() {
  const router = useRouter();
  const [salvando,    setSalvando]    = useState(false);
  const [erro,        setErro]        = useState("");
  const [jogos,       setJogos]       = useState<JogoCopa[]>([]);
  const [loadingJogos, setLoadingJogos] = useState(true);

  // Campos do formulário
  const [jogoId,       setJogoId]       = useState<number | "">("");
  const [titulo,       setTitulo]       = useState("");
  const [slug,         setSlug]         = useState("");
  const [timeCasa,     setTimeCasa]     = useState("");
  const [timeFora,     setTimeFora]     = useState("");
  const [bandeiraCasa, setBandeiraCasa] = useState("");
  const [bandeiraFora, setBandeiraFora] = useState("");
  const [jogoData,     setJogoData]     = useState("");
  const [valorCota,    setValorCota]    = useState("5.00");
  const [taxaAdmin,    setTaxaAdmin]    = useState("25");
  const [chavePix,     setChavePix]     = useState("");
  const [payloadPix,   setPayloadPix]   = useState("");
  const [userIdPrefix,  setUserIdPrefix]  = useState("");

  // ── Carrega prefixo do user ID (6 chars do UUID) ───────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserIdPrefix(user.id.replace(/-/g, "").slice(0, 6));
    });
  }, []);

  // ── Carrega jogos do banco ──────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("jogos_copa2026")
      .select("*")
      .order("data", { ascending: true })
      .order("horario", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("[novo] jogos_copa2026:", error);
        else setJogos(data ?? []);
        setLoadingJogos(false);
      });
  }, []);

  // ── Auto-gera título e slug quando times mudam ─────────────────────────────
  useEffect(() => {
    if (timeCasa && timeFora) {
      const novoTitulo = `Bolão ${timeCasa} × ${timeFora}`;
      setTitulo(novoTitulo);
      const base = gerarSlug(novoTitulo).slice(0, 40);
      setSlug(userIdPrefix ? `${base}-${userIdPrefix}` : base);
    }
  }, [timeCasa, timeFora, userIdPrefix]);

  // ── Seleciona jogo e auto-preenche campos ───────────────────────────────────
  const selecionarJogo = (id: number | "") => {
    setJogoId(id);

    if (id === "") return;

    // Jogo personalizado
    if (id === -1) {
      setTimeCasa(""); setTimeFora("");
      setBandeiraCasa(""); setBandeiraFora("");
      setJogoData("");
      setTitulo(""); setSlug("");
      return;
    }

    const jogo = jogos.find((j) => j.id === id);
    if (!jogo) return;

    setTimeCasa(jogo.mandante);
    setTimeFora(jogo.visitante);
    setBandeiraCasa(jogo.bandeira_mandante ?? "");
    setBandeiraFora(jogo.bandeira_visitante ?? "");
    setJogoData(dataHoraParaInput(jogo.data, jogo.horario));
    // título e slug são gerados automaticamente pelo useEffect em timeCasa/timeFora
  };

  // ── Salvar bolão ────────────────────────────────────────────────────────────
  const salvar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (salvando) return;
    setErro("");

    if (!titulo || !timeCasa || !timeFora || !jogoData || !chavePix || !slug) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Busca o nome salvo em usuarios_bolao (evita usar e-mail como nome)
    const { data: perfil } = await supabase
      .from("usuarios_bolao")
      .select("nome")
      .eq("user_id", user.id)
      .maybeSingle();

    const nomeResponsavel =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      perfil?.nome ??
      user.email?.split("@")[0] ??
      null;

    const { data, error } = await supabase
      .from("boloes")
      .insert({
        user_id:          user.id,
        slug:             slug.toLowerCase().trim(),
        titulo,
        nome_responsavel: nomeResponsavel,
        jogo_time_casa:   timeCasa,
        jogo_time_fora:   timeFora,
        bandeira_casa:    bandeiraCasa || null,
        bandeira_fora:    bandeiraFora || null,
        jogo_data:        new Date(jogoData).toISOString(),
        valor_cota:       parseFloat(valorCota),
        taxa_admin_pct:   parseFloat(taxaAdmin),
        chave_pix:        chavePix.trim(),
        payload_pix:      payloadPix.trim() || null,
        ativo:            true,
      })
      .select()
      .single();

    setSalvando(false);

    if (error) {
      if (error.code === "23505") setErro("Esse slug já está em uso. Escolha outro.");
      else setErro("Erro ao criar bolão: " + error.message);
      return;
    }

    router.push(`/dashboard/${data.slug}`);
  };

  // ── Agrupa jogos por fase para o <optgroup> ─────────────────────────────────
  const fases = Array.from(new Set(jogos.map((j) => j.fase)));

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-gradient-to-b from-green-700 to-green-600 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-green-200 hover:text-white text-sm font-semibold transition-colors">
            ← Dashboard
          </Link>
          <span className="text-green-400">·</span>
          <h1 className="font-black text-base">Criar Novo Bolão</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={salvar} className="flex flex-col gap-5">

          {/* ── Selecionar jogo ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <h2 className="font-black text-gray-800 mb-3">⚽ Jogo</h2>

            <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">
              Selecionar da Copa 2026
            </label>

            <select
              value={jogoId}
              onChange={(e) => selecionarJogo(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={loadingJogos}
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2.5 text-gray-700 outline-none transition-colors mb-4 disabled:opacity-50"
            >
              <option value="">{loadingJogos ? "Carregando jogos…" : "Selecione um jogo…"}</option>

              {fases.map((fase) => (
                <optgroup key={fase} label={fase}>
                  {jogos
                    .filter((j) => j.fase === fase)
                    .map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.mandante} × {j.visitante} — {formatarDataExibicao(j.data, j.horario)}
                      </option>
                    ))}
                </optgroup>
              ))}

              <optgroup label="─────────────">
                <option value={-1}>✏️ Personalizado</option>
              </optgroup>
            </select>

            {/* Preview bandeiras quando jogo selecionado */}
            {bandeiraCasa && bandeiraFora && (
              <div className="flex items-center justify-center gap-4 mb-4 bg-gray-50 rounded-xl py-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bandeiraCasa} alt={timeCasa} width={32} height={24} className="rounded shadow-sm" />
                  <span className="font-bold text-gray-700 text-sm">{timeCasa}</span>
                </div>
                <span className="text-gray-400 font-black">×</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700 text-sm">{timeFora}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bandeiraFora} alt={timeFora} width={32} height={24} className="rounded shadow-sm" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Time da casa *</label>
                <input
                  type="text" placeholder="Ex: Brasil"
                  value={timeCasa} onChange={(e) => setTimeCasa(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Time visitante *</label>
                <input
                  type="text" placeholder="Ex: Marrocos"
                  value={timeFora} onChange={(e) => setTimeFora(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-gray-500 font-bold block mb-1">Data e hora do jogo *</label>
              <input
                type="datetime-local"
                value={jogoData} onChange={(e) => setJogoData(e.target.value)}
                required
                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
              />
            </div>
          </div>

          {/* ── Configurações do bolão ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <h2 className="font-black text-gray-800 mb-3">🏆 Bolão</h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">Título</label>
                <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2 text-gray-700 font-semibold min-h-[42px] flex items-center">
                  {titulo || <span className="text-gray-400 font-normal text-sm">Gerado ao selecionar o jogo</span>}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">Link do Bolão</label>
                <div className="flex items-center gap-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2 min-h-[42px]">
                  <span className="text-gray-400 text-xs font-mono shrink-0">…/bolao/</span>
                  <span className="text-green-700 font-mono text-sm font-bold break-all">
                    {slug || <span className="text-gray-400 font-normal">gerado-automaticamente</span>}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1">Valor da cota (R$) *</label>
                  <input
                    type="number" min="1" max="9999" step="0.01"
                    value={valorCota} onChange={(e) => setValorCota(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1">Taxa admin (%) *</label>
                  <input
                    type="number" min="0" max="50" step="1"
                    value={taxaAdmin} onChange={(e) => setTaxaAdmin(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── PIX ──────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <h2 className="font-black text-gray-800 mb-3">💸 PIX (seus apostadores pagam aqui)</h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">Chave PIX *</label>
                <input
                  type="text" placeholder="email@exemplo.com, CPF ou telefone"
                  value={chavePix} onChange={(e) => setChavePix(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">
                  PIX Copia e Cola <span className="text-gray-400 font-normal normal-case">(opcional — gera QR Code)</span>
                </label>

                {/* Orientação */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-2">
                  <p className="text-blue-800 text-xs font-bold mb-1">📱 Como gerar o código:</p>
                  <ol className="text-blue-700 text-xs space-y-1 list-decimal list-inside leading-5">
                    <li>Abra o app do seu banco</li>
                    <li>Vá em <strong>PIX → Cobrar</strong> (ou &quot;Receber&quot;)</li>
                    <li>Digite o valor da cota do bolão: <strong>R$ {valorCota || "—"}</strong></li>
                    <li>Gere a cobrança e copie o código <strong>&quot;Pix Copia e Cola&quot;</strong></li>
                    <li>Cole o código no campo abaixo</li>
                  </ol>
                  <p className="text-blue-600 text-xs mt-2 font-semibold">
                    ⚠️ O QR Code ficará visível para os apostadores na página do bolão.
                  </p>
                </div>

                <textarea
                  placeholder="00020101021226530014br.gov.bcb.pix…"
                  value={payloadPix} onChange={(e) => setPayloadPix(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none font-mono text-xs resize-none"
                />
                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-semibold mt-1">
                  ⚠️ A confirmação de cada pagamento é <strong>manual</strong>: você confere o PIX no seu banco e marca como pago no painel do bolão.
                </p>
              </div>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
              ⚠️ {erro}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pb-8">
            <Link href="/dashboard" className="flex-1">
              <button type="button" className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-all">
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2"
            >
              {salvando ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Criando…</>
              ) : "✅ Criar Bolão"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
