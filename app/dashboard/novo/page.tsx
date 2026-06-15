"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { JOGOS_COPA_2026 } from "@/lib/jogos-copa";
import Link from "next/link";

// Gera slug a partir do título
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

// Formata data ISO para input datetime-local
function isoParaInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function NovoBolaoPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Campos do formulário
  const [jogoId, setJogoId]             = useState<number | "">("");
  const [titulo, setTitulo]             = useState("");
  const [slug, setSlug]                 = useState("");
  const [timeCasa, setTimeCasa]         = useState("");
  const [timeFora, setTimeFora]         = useState("");
  const [bandeiraCasa, setBandeiraCasa] = useState("");
  const [bandeiraFora, setBandeiraFora] = useState("");
  const [jogoData, setJogoData]         = useState("");
  const [valorCota, setValorCota]       = useState("5.00");
  const [taxaAdmin, setTaxaAdmin]       = useState("25");
  const [chavePix, setChavePix]         = useState("");
  const [payloadPix, setPayloadPix]     = useState("");
  const [slugManual, setSlugManual]     = useState(false);

  // Auto-preenche campos ao selecionar jogo da Copa
  const selecionarJogo = (id: number | "") => {
    setJogoId(id);
    if (id === "" || id === 99) {
      if (id === 99) { setTimeCasa(""); setTimeFora(""); setBandeiraCasa(""); setBandeiraFora(""); setJogoData(""); }
      return;
    }
    const jogo = JOGOS_COPA_2026.find((j) => j.id === id);
    if (!jogo) return;
    setTimeCasa(jogo.timeCasa);
    setTimeFora(jogo.timeFora);
    setBandeiraCasa(jogo.codigoCasa);
    setBandeiraFora(jogo.codigoFora);
    setJogoData(isoParaInput(jogo.data));
    if (!titulo || !slugManual) {
      const novoTitulo = `Bolão ${jogo.timeCasa} × ${jogo.timeFora}`;
      setTitulo(novoTitulo);
      setSlug(gerarSlug(novoTitulo));
    }
  };

  // Auto-gera slug quando o título muda (se não foi editado manualmente)
  useEffect(() => {
    if (!slugManual && titulo) setSlug(gerarSlug(titulo));
  }, [titulo, slugManual]);

  const salvar = async (e: React.FormEvent) => {
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

    const { data, error } = await supabase
      .from("boloes")
      .insert({
        user_id:       user.id,
        slug:          slug.toLowerCase().trim(),
        titulo,
        jogo_time_casa: timeCasa,
        jogo_time_fora: timeFora,
        bandeira_casa:  bandeiraCasa || null,
        bandeira_fora:  bandeiraFora || null,
        jogo_data:      new Date(jogoData).toISOString(),
        valor_cota:     parseFloat(valorCota),
        taxa_admin_pct: parseFloat(taxaAdmin),
        chave_pix:      chavePix.trim(),
        payload_pix:    payloadPix.trim() || null,
        ativo:          true,
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

          {/* Selecionar jogo da Copa */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <h2 className="font-black text-gray-800 mb-3">⚽ Jogo</h2>

            <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">
              Selecionar da Copa 2026
            </label>
            <select
              value={jogoId}
              onChange={(e) => selecionarJogo(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2.5 text-gray-700 outline-none transition-colors mb-4"
            >
              <option value="">Selecione um jogo…</option>
              {JOGOS_COPA_2026.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.fase} — {j.id === 99 ? "Personalizado" : `${j.timeCasa} × ${j.timeFora}`}
                </option>
              ))}
            </select>

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
                  type="text" placeholder="Ex: Haiti"
                  value={timeFora} onChange={(e) => setTimeFora(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Código bandeira casa</label>
                <input
                  type="text" placeholder="br, ar, fr…"
                  value={bandeiraCasa} onChange={(e) => setBandeiraCasa(e.target.value.toLowerCase())}
                  maxLength={2}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Código bandeira visitante</label>
                <input
                  type="text" placeholder="ht, co, de…"
                  value={bandeiraFora} onChange={(e) => setBandeiraFora(e.target.value.toLowerCase())}
                  maxLength={2}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none font-mono"
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

          {/* Configurações do bolão */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <h2 className="font-black text-gray-800 mb-3">🏆 Bolão</h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">Título *</label>
                <input
                  type="text" placeholder="Ex: Bolão Copa 2026 - Turma do Zé"
                  value={titulo} onChange={(e) => setTitulo(e.target.value)}
                  required maxLength={80}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wide">
                  Slug da URL *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm font-mono shrink-0">/bolao/</span>
                  <input
                    type="text" placeholder="meu-bolao-2026"
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                    required maxLength={50}
                    pattern="[a-z0-9\-]+"
                    className="flex-1 border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none font-mono text-sm"
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">Só letras minúsculas, números e hífens.</p>
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

          {/* PIX */}
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
                <textarea
                  placeholder="00020101021226530014br.gov.bcb.pix…"
                  value={payloadPix} onChange={(e) => setPayloadPix(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-gray-800 outline-none font-mono text-xs resize-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Gere pelo app do banco → &quot;Cobrar via PIX&quot; → copie o código.
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
