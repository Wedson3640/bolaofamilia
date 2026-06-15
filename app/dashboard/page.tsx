import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CopiarLink } from "./CopiarLink";
import type { BolaoRow } from "@/lib/supabase";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verifica se pagou
  const { data: registro } = await supabase
    .from("usuarios_bolao")
    .select("pago")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!registro?.pago) redirect("/pagar");

  // Busca bolões do usuário
  const { data: boloes } = await supabase
    .from("boloes")
    .select("*")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  const nome = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Usuário";

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-gradient-to-b from-green-700 to-green-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="font-black text-base leading-tight">bolao.online</h1>
              <p className="text-green-200 text-xs">Olá, {nome.split(" ")[0]}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/novo">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-black text-sm px-4 py-2 rounded-xl border border-yellow-500 transition-all">
                ➕ Novo Bolão
              </button>
            </Link>
            <form action="/api/logout" method="POST">
              <button type="submit" className="text-green-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-800 transition-all">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 py-6">

        <h2 className="text-gray-800 font-black text-xl mb-4">Meus Bolões</h2>

        {!boloes || boloes.length === 0 ? (
          /* Estado vazio */
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center flex flex-col items-center gap-4">
            <span className="text-5xl">⚽</span>
            <h3 className="text-gray-700 font-black text-lg">Nenhum bolão ainda</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              Crie seu primeiro bolão e compartilhe o link com a galera!
            </p>
            <Link href="/dashboard/novo">
              <button className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl transition-all shadow">
                🎯 Criar meu primeiro bolão
              </button>
            </Link>
          </div>
        ) : (
          /* Lista de bolões */
          <div className="flex flex-col gap-4">
            {(boloes as BolaoRow[]).map((b) => (
              <div key={b.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${b.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {b.ativo ? "● Ativo" : "○ Inativo"}
                    </span>
                    <h3 className="font-black text-gray-800 text-base">{b.titulo}</h3>
                    <p className="text-gray-500 text-sm">
                      {b.jogo_time_casa} × {b.jogo_time_fora} · {formatarData(b.jogo_data)}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Cota: R$ {Number(b.valor_cota).toFixed(2).replace(".", ",")} · Taxa: {Number(b.taxa_admin_pct).toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <Link href={`/dashboard/${b.slug}`}>
                      <button className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shadow">
                        ⚙️ Gerenciar
                      </button>
                    </Link>
                    <Link href={`/bolao/${b.slug}`} target="_blank">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-4 py-2 rounded-xl transition-all">
                        👁 Ver público
                      </button>
                    </Link>
                  </div>
                </div>
                {/* Link de compartilhamento */}
                <div className="border-t border-gray-100 px-5 py-2.5 bg-gray-50 flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-mono flex-1 truncate">
                    /bolao/{b.slug}
                  </span>
                  <CopiarLink slug={b.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
