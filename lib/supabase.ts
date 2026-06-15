import { createClient } from "@supabase/supabase-js";

// Fallback vazio evita erro "supabaseUrl is required" durante o prerender do build.
// Em runtime (dev e produção) as env vars reais estão presentes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Tipos do banco ──────────────────────────────────────────────────────────

export type BolaoRow = {
  id: string;
  user_id: string;
  slug: string;
  titulo: string;
  nome_responsavel: string | null;   // nome completo do criador do bolão
  jogo_time_casa: string;
  jogo_time_fora: string;
  jogo_data: string;
  valor_cota: number;
  taxa_admin_pct: number;
  chave_pix: string;
  payload_pix: string | null;
  ativo: boolean;
  criado_em: string;
};

export type ParticipanteRow = {
  id: number;
  bolao_id: string;
  nome: string;
  placar_brasil: string;   // placar do time da casa
  placar_haiti: string;    // placar do time visitante
  pago: boolean;
  criado_em: string;
};
