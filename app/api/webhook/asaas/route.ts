// ─── Webhook Asaas → bolaofamilia.online ────────────────────────────────────
// Padrão idêntico ao gicex-arquitetura/backend/app/routers/energia/webhook.py
//
// Configure no painel Asaas:
//   URL: https://bolaofamilia.online/api/webhook/asaas
//   Token: mesmo valor de ASAAS_WEBHOOK_TOKEN

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN ?? "";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    // ── Valida token (header asaas-access-token) ─────────────────────────────
    const token = req.headers.get("asaas-access-token");
    if (!WEBHOOK_TOKEN || token !== WEBHOOK_TOKEN) {
      console.warn("[webhook/asaas] token inválido:", token);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await req.json() as {
      event: string;
      payment?: {
        id: string;
        value: number;
        status: string;
        externalReference?: string; // user_id do Supabase
      };
    };

    const { event, payment } = body;
    console.log(`[webhook/asaas] evento=${event} payment=${payment?.id}`);

    // ── PAYMENT_RECEIVED → libera acesso ─────────────────────────────────────
    if (event === "PAYMENT_RECEIVED" && payment?.externalReference) {
      const userId = payment.externalReference;

      const { error } = await supabaseAdmin()
        .from("usuarios_bolao")
        .update({
          pago:    true,
          pago_em: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("[webhook/asaas] erro ao atualizar usuario:", error);
        return NextResponse.json({ error: "Erro ao liberar acesso" }, { status: 500 });
      }

      console.log(`[webhook/asaas] ✅ acesso liberado para user_id=${userId}`);
    }

    // Outros eventos (OVERDUE, DELETED, REFUNDED) — apenas loga por ora
    // Futuramente: marcar cobrança como vencida/estornada se necessário

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("[webhook/asaas] erro interno:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
