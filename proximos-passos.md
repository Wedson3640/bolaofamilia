# ✅ Próximos Passos — bolão.online

## Antes de começar a codar

- [ ] Definir domínio: **bolao.online** (verificar disponibilidade no registro.br)
- [ ] Configurar Supabase Auth:
  - Supabase Dashboard → Authentication → Providers
  - Habilitar **Google** (precisa de projeto no Google Cloud Console)
  - Habilitar **GitHub** (precisa de OAuth App no GitHub)
- [ ] Rodar o SQL de [[banco-de-dados]] no Supabase SQL Editor

## Criar o projeto

```powershell
# Na pasta de projetos
cd C:\Users\udpl1652
npx create-next-app@latest bolao-online --typescript --tailwind --app --no-src-dir
cd bolao-online

# Instalar Supabase
npm install @supabase/supabase-js @supabase/ssr

# Copiar lib/supabase.ts do projeto bolao existente
Copy-Item "..\bolao\lib\supabase.ts" "lib\supabase.ts"
```

## Configurar .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://imlffgsouyopbfsdqaft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# URL do app (para redirect após login)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PIX do admin da PLATAFORMA (recebe os R$ 50 de cada dono de bolão)
NEXT_PUBLIC_PIX_PLATAFORMA_CHAVE=seu-pix-admin@gmail.com
NEXT_PUBLIC_PIX_PLATAFORMA_PAYLOAD=00020101...
```

## Melhorias herdadas do projeto bolao original

> Já validadas em produção — copiar exatamente como estão no projeto `C:\Users\udpl1652\bolao`

### 1. 💸 Banner PIX na tela inicial (abaixo da tabela de apostadores)

Exibe a chave PIX do organizador do bolão sem o apostador precisar clicar em "Apostar".
O valor da cota e a chave vêm da tabela `boloes` (campo `chave_pix` e `valor_cota`).

```tsx
{/* Banner PIX — abaixo da tabela, antes da legenda */}
<div className="mt-4 bg-green-50 border-2 border-green-300 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
  <div className="flex items-center gap-3">
    <span className="text-2xl">💸</span>
    <div>
      <p className="text-green-800 font-black text-sm">
        Pague sua cota — R$ {bolao.valorCota.toFixed(2)} via PIX
      </p>
      <p className="text-gray-500 text-xs">
        Chave: <strong className="text-green-700 select-all">{bolao.chavePix}</strong>
      </p>
    </div>
  </div>
  <button
    onClick={() => navigator.clipboard.writeText(bolao.chavePix)}
    className="shrink-0 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow"
  >
    📋 Copiar chave PIX
  </button>
</div>
```

---

### 2. 🔒 Trava contra duplo-clique no botão "Confirmar Aposta"

Sem a trava, um clique rápido duplo dispara dois INSERTs no Supabase antes do estado
`apostaEnviando` re-renderizar o botão como desabilitado.

**Solução:** `useRef` como guard síncrono + deduplicação no optimistic update.

```tsx
// Importar useRef junto com useState, useEffect, useCallback
import { useState, useEffect, useCallback, useRef } from "react";

// Dentro do componente, antes dos estados do modal
const enviandoRef = useRef(false);

// Função enviarAposta
const enviarAposta = async () => {
  if (enviandoRef.current) return;          // bloqueia imediatamente
  if (!apostaNome.trim() || !apostaBrasil || !apostaHaiti) return;

  enviandoRef.current = true;
  setApostaEnviando(true);
  setApostaErro("");

  const { data, error } = await supabase
    .from("participantes")
    .insert({ nome, placar_brasil, placar_haiti, pago: false, bolao_id: bolao.id })
    .select()
    .single();

  enviandoRef.current = false;
  setApostaEnviando(false);

  if (error) { setApostaErro("Erro ao salvar aposta. Tente novamente."); return; }

  // Deduplicação: só adiciona se o realtime ainda não trouxe o registro
  if (data) {
    setParticipantes((prev) =>
      prev.some((p) => p.id === data.id) ? prev : [...prev, fromDB(data)]
    );
  }

  setApostaEnviada(true);
};
```

> **Por que `useRef` e não só `disabled`?**
> O `useState` é assíncrono — o React agrupa as atualizações e re-renderiza depois.
> Num duplo-clique rápido, os dois eventos chegam antes da re-renderização.
> O `useRef` atualiza **de forma síncrona e imediata**, bloqueando o segundo clique na hora.

---

## Ordem de desenvolvimento

1. **Setup base** — layout, tema verde, tipografia
2. **Landing page** `/` — hero, features, CTA
3. **Auth** — login social Google, redirect pós-login
4. **Pagamento dos R$ 50** — tela de PIX + aguardando confirmação
5. **Dashboard** `/dashboard` — protegido por auth + pago
6. **Criar bolão** `/dashboard/novo` — formulário completo
7. **Página pública** `/bolao/[slug]` — tabela + modal apostar *(aplicar melhorias 1 e 2 aqui)*
8. **Gerenciar bolão** — admin marca pagamentos, exclui apostadores
9. **Deploy** Vercel + domínio bolao.online

## Perguntas a responder antes da fase 2

- [ ] Qual banco para processar PIX automático? (Mercado Pago / Efí Bank / Pagar.me)
- [ ] Precisa de CNPJ para receber via API PIX?
- [ ] Limite de bolões por usuário? (1 no plano básico, ilimitado no premium?)
- [ ] Prazo de expiração do bolão? (arquivar após o jogo?)

---

*Atualizado: 2026-06-15*
