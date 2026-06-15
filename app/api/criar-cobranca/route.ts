import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getOrCreateCustomer, criarCobrancaPix, buscarQrCodePix } from "@/lib/asaas";

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

    const cpfLimpo = cpf?.replace(/\D/g, "") ?? "";
    if (cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
      return NextResponse.json({ error: "CPF ou CNPJ inválido" }, { status: 400 });
    }

    // ── Usuário autenticado (getSession lê JWT do cookie — sem chamada de rede) ──
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // ── Verifica se já tem cobrança ou já pagou ──────────────────────────────
    const admin = supabaseAdmin();

    const { data: registro, error: registroError } = await admin
      .from("usuarios_bolao")
      .select("pago, asaas_cobranca_id, asaas_pix_qr_code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (registroError) {
      console.error("[criar-cobranca] SELECT usuarios_bolao:", registroError);
      return NextResponse.json({ error: "Erro ao verificar cadastro" }, { status: 500 });
    }

    if (registro?.pago) {
      return NextResponse.json({ error: "Acesso já liberado" }, { status: 400 });
    }

    // Reutiliza cobrança existente (evita duplicatas)
    if (registro?.asaas_pix_qr_code) {
      let qrCode = registro.asaas_pix_qr_code;
      let qrImagem: string | undefined;

      if (registro.asaas_cobranca_id) {
        try {
          const qr = await buscarQrCodePix(registro.asaas_cobranca_id);
          qrCode = qr.pixPayload;
          qrImagem = qr.pixImagem;
        } catch (err) {
          console.warn("[criar-cobranca] QR existente sem imagem Asaas:", err);
        }
      }

      return NextResponse.json({
        qrCode,
        qrImagem,
        cobrancaId: registro.asaas_cobranca_id,
      });
    }

    if (!registro) {
      const { error: insertError } = await admin.from("usuarios_bolao").insert({
        user_id: user.id,
        email: user.email ?? "",
        nome: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
        pago: false,
      });

      if (insertError) {
        console.error("[criar-cobranca] INSERT usuarios_bolao:", insertError);
        return NextResponse.json({ error: "Erro ao criar cadastro" }, { status: 500 });
      }
    }

    // ── Cria customer + cobrança no Asaas ───────────────────────────────────
    const nome  = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Cliente";
    const email = user.email ?? "";

    const customerId = await getOrCreateCustomer(nome, email, cpfLimpo);

    const cobranca = await criarCobrancaPix({
      customerId,
      valor:             5.00,
      descricao:         "bolaofamilia.online — Acesso Copa 2026",
      externalReference: user.id,   // ⭐ chave para o webhook identificar o user
      expirarHoras:      24,
    });

    // ── Salva no banco ────────────────────────────────────────────────────────
    await admin
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
