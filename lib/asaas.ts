// ─── Cliente Asaas para bolaofamilia.online ──────────────────────────────────
// Baseado no padrão do projeto gicex-arquitetura/apps/platform/src/lib/asaas.ts

const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL ?? "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY  = process.env.ASAAS_API_KEY  ?? "";

async function asaasFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      "access_token": ASAAS_API_KEY,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asaas ${res.status} em ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ── Customer ─────────────────────────────────────────────────────────────────

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

/**
 * Busca customer pelo CPF/CNPJ, cria se não existir.
 * Retorna o ID do customer no Asaas.
 */
export async function getOrCreateCustomer(
  nome: string,
  email: string,
  cpfCnpj: string,
): Promise<string> {
  // Busca por CPF/CNPJ existente
  const search = await asaasFetch<{ totalCount: number; data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`,
  );

  if (search.totalCount > 0) return search.data[0].id;

  // Cria novo customer
  const customer = await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({ name: nome, email, cpfCnpj }),
  });

  return customer.id;
}

// ── PIX Cobrança ─────────────────────────────────────────────────────────────

export interface CobrancaPixResult {
  id:          string;
  dueDate:     string;   // YYYY-MM-DD
  pixPayload:  string;   // copia-e-cola
  pixImagem:   string;   // base64 PNG do QR Code
}

export async function buscarQrCodePix(paymentId: string) {
  const qr = await asaasFetch<{ payload: string; encodedImage: string }>(
    `/payments/${paymentId}/pixQrCode`,
  );

  return {
    pixPayload: qr.payload,
    pixImagem:  qr.encodedImage,
  };
}

/**
 * Cria uma cobrança PIX no Asaas.
 * externalReference = user_id do Supabase (usado no webhook para identificar quem pagou).
 */
export async function criarCobrancaPix({
  customerId,
  valor,
  descricao,
  externalReference,
  expirarHoras = 24,
}: {
  customerId:         string;
  valor:              number;
  descricao:          string;
  externalReference:  string; // user_id do Supabase Auth
  expirarHoras?:      number;
}): Promise<CobrancaPixResult> {
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + expirarHoras);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  // 1. Cria o pagamento
  const payment = await asaasFetch<{ id: string; dueDate: string }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer:          customerId,
      billingType:       "PIX",
      value:             valor,
      dueDate:           dueDateStr,
      description:       descricao,
      externalReference: externalReference,
    }),
  });

  // 2. Busca o QR Code
  const qr = await buscarQrCodePix(payment.id);

  return {
    id:         payment.id,
    dueDate:    payment.dueDate,
    pixPayload: qr.pixPayload,
    pixImagem:  qr.pixImagem,
  };
}
