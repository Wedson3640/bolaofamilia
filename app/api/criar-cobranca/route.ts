import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getOrCreateCustomer, criarCobrancaPix } from "@/lib/asaas";

// Supabase admin (service role) — necessário para contornar RLS no webhook
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const { cpf } = (await req.json()) as { cpf: string };

    if (!cpf || cpf.replace(/\D/g, "").length < 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    // ── Usuário autenticado ──────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // ── Verifica se já tem cobrança ou já pagou ──────────────────────────────
    const { data: registro } = await supabaseAdmin()
      .from("usuarios_bolao")
      .select("pago, asaas_cobranca_id, asaas_pix_qr_code")
      .eq("user_id", user.id)
      .single();

    if (registro?.pago) {
      return NextResponse.json({ error: "Acesso já liberado" }, { status: 400 });
    }

    // Reutiliza cobrança existente (evita duplicatas)
    if (registro?.asaas_pix_qr_code) {
      return NextResponse.json({
        qrCode:    registro.asaas_pix_qr_code,
        cobrancaId: registro.asaas_cobranca_id,
      });
    }

    // ── Cria customer + cobrança no Asaas ───────────────────────────────────
    const nome  = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Cliente";
    const email = user.email ?? "";
    const cpfLimpo = cpf.replace(/\D/g, "");

    const customerId = await getOrCreateCustomer(nome, email, cpfLimpo);

    const cobranca = await criarCobrancaPix({
      customerId,
      valor:             49.90,
      descricao:         "bolaofamilia.online — Acesso Copa 2026",
      externalReference: user.id,   // ⭐ chave para o webhook identificar o user
      expirarHoras:      24,
    });

    // ── Salva no banco ────────────────────────────────────────────────────────
    await supabaseAdmin()
      .from("usuarios_bolao")
      .update({
        asaas_cobranca_id: cobranca.id,
        asaas_pix_qr_code: cobranca.pixPayload,
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      qrCode:    cobranca.pixPayload,
      qrImagem:  cobranca.pixImagem,   // base64 — exibido como <img src="data:image/png;base64,..." />
      cobrancaId: cobranca.id,
      vencimento: cobranca.dueDate,
    });

  } catch (err) {
    console.error("[criar-cobranca]", err);
    return NextResponse.json({ error: "Erro ao gerar cobrança PIX" }, { status: 500 });
  }
}
