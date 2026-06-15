# 🏆 Bolão Online — Plataforma SaaS de Bolões Esportivos

> Plataforma onde qualquer pessoa paga R$ 50 e cria seu próprio bolão personalizado, com login social, configuração de jogos, chave PIX e planilha de apostadores isolada por usuário.

---

## 📌 Visão Geral

| Item | Detalhe |
|------|---------|
| **Produto** | SaaS de bolões esportivos |
| **Monetização** | R$ 50,00 por bolão criado (pagamento único) |
| **Base** | Projeto `bolao` existente (Next.js + Supabase) |
| **Stack** | Next.js 16 · TypeScript · Tailwind v4 · Supabase |
| **Autenticação** | Login social (Google / GitHub via Supabase Auth) |
| **DB** | Mesma instância Supabase — tabela `participantes` incrementada com `id_user` |

---

## 🗂 Estrutura de Pastas

```
bolao-online/
├── app/
│   ├── page.tsx                  # Landing page (marketing + CTA pagar R$50)
│   ├── login/page.tsx            # Login social (Google / GitHub)
│   ├── dashboard/page.tsx        # Painel do dono do bolão (configurar + ver apostas)
│   ├── bolao/[slug]/page.tsx     # Página pública do bolão (apostadores acessam aqui)
│   └── api/
│       ├── criar-bolao/route.ts  # Cria bolão após confirmação de pagamento
│       └── webhook-pix/route.ts  # (futuro) webhook de confirmação de pagamento
├── lib/
│   ├── supabase.ts               # Client Supabase
│   └── auth.ts                  # Helpers de autenticação
├── components/
│   ├── TabelaApostadores.tsx     # Tabela reutilizável
│   ├── ModalApostar.tsx          # Modal 2 etapas
│   └── ConfigurarBolao.tsx       # Formulário de configuração
└── .env.local
```

---

## 🗃 Banco de Dados — Incremento das Tabelas

### Tabela `usuarios_bolao` *(nova)*
Cada linha = um dono de bolão que pagou os R$ 50.

```sql
CREATE TABLE usuarios_bolao (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  nome        TEXT,
  pago        BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela `boloes` *(nova)*
Um usuário pode ter N bolões.

```sql
CREATE TABLE boloes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,         -- URL amigável: /bolao/meu-bolao-2025
  titulo          TEXT NOT NULL,
  jogo_time_casa  TEXT NOT NULL,               -- Ex: "Brasil"
  jogo_time_fora  TEXT NOT NULL,               -- Ex: "Haiti"
  jogo_data       TIMESTAMPTZ NOT NULL,
  valor_cota      NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  taxa_admin_pct  NUMERIC(5,2)  NOT NULL DEFAULT 25.00,  -- % do admin
  chave_pix       TEXT NOT NULL,
  payload_pix     TEXT,                         -- código "copia e cola"
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela `participantes` *(incrementada)*
Adicionar `bolao_id` na tabela existente.

```sql
-- Adiciona coluna bolao_id na tabela existente
ALTER TABLE participantes
  ADD COLUMN bolao_id UUID REFERENCES boloes(id) ON DELETE CASCADE;

-- Índice para busca rápida por bolão
CREATE INDEX idx_participantes_bolao_id ON participantes(bolao_id);
```

> **Compatibilidade:** o projeto `bolao` original continua funcionando — `bolao_id` aceita NULL, os registros antigos ficam com NULL e só aparecem no projeto original.

### RLS (Row Level Security)
```sql
-- Bolões: dono vê/edita apenas os seus
ALTER TABLE boloes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dono_le_bolao"
  ON boloes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "dono_cria_bolao"
  ON boloes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "dono_edita_bolao"
  ON boloes FOR UPDATE
  USING (user_id = auth.uid());

-- Participantes: leitura pública por bolao_id, escrita pública (quem aposta)
CREATE POLICY "leitura_por_bolao"
  ON participantes FOR SELECT
  USING (true);                            -- público (qualquer um vê o bolão)

CREATE POLICY "insercao_aposta"
  ON participantes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin_atualiza"
  ON participantes FOR UPDATE
  USING (
    bolao_id IN (SELECT id FROM boloes WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_exclui"
  ON participantes FOR DELETE
  USING (
    bolao_id IN (SELECT id FROM boloes WHERE user_id = auth.uid())
  );
```

---

## 🔐 Autenticação — Login Social

Usando **Supabase Auth** com providers:

| Provider | Configuração |
|----------|-------------|
| Google   | Supabase Dashboard → Auth → Providers → Google |
| GitHub   | Supabase Dashboard → Auth → Providers → GitHub |

```ts
// lib/auth.ts
import { supabase } from "./supabase";

export const loginComGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });

export const loginComGitHub = () =>
  supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });

export const logout = () => supabase.auth.signOut();
```

---

## 💰 Fluxo de Pagamento dos R$ 50

```
Usuário clica "Criar meu Bolão"
        ↓
Tela de login social (Google/GitHub)
        ↓
Tela de pagamento PIX — R$ 50,00
  • QR Code gerado dinamicamente
  • Copia e cola do payload PIX fixo do admin
        ↓
Usuário paga → Admin confirma manualmente no dashboard
  (ou webhook automático no futuro)
        ↓
Campo `pago = true` em `usuarios_bolao`
        ↓
Usuário acessa /dashboard para configurar o bolão
```

> **Fase 1:** confirmação manual pelo admin (igual ao projeto atual).  
> **Fase 2:** integração com API PIX (Mercado Pago / Efí Bank) para confirmação automática via webhook.

---

## ⚙️ Configuração do Bolão (Dashboard)

O dono do bolão preenche:

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Título | texto | "Bolão Copa 2026 - Turma do Zé" |
| Time da casa | texto + bandeira | Brasil 🇧🇷 |
| Time visitante | texto + bandeira | Haiti 🇭🇹 |
| Data/hora do jogo | datetime | 19/06/2025 21:30 |
| Valor da cota | número | R$ 10,00 |
| Taxa administrativa | % | 25% |
| Chave PIX | texto | exemplo@gmail.com |
| PIX Copia e Cola | textarea | 0002010102... |
| Slug da URL | texto | meu-bolao-2025 |

### Jogos da Copa Disponíveis *(lista pré-cadastrada)*
```ts
const JOGOS_COPA = [
  { id: 1, timeCasa: "Brasil",    timeFora: "Haiti",    data: "2025-06-19T21:30:00-03:00" },
  { id: 2, timeCasa: "Argentina", timeFora: "Colômbia", data: "2025-06-20T18:00:00-03:00" },
  { id: 3, timeCasa: "França",    timeFora: "Alemanha", data: "2025-06-21T15:00:00-03:00" },
  // ... outros jogos
];
```

---

## 🌐 Fluxo de Páginas

```
/                           → Landing page
/login                      → Login social
/dashboard                  → Painel do dono (requer auth + pago)
  /dashboard/novo           → Configurar novo bolão
  /dashboard/[slug]         → Gerenciar bolão específico
/bolao/[slug]               → Página pública do bolão (qualquer um acessa)
```

### `/bolao/[slug]` — Página pública
- Mostra cabeçalho com os times e data
- Tabela de apostadores (só os do `bolao_id` desse bolão)
- Botão "Apostar" → modal 2 etapas
- Valor da cota e chave PIX do dono do bolão
- Regras com taxa administrativa configurada

---

## 🚀 Roadmap de Desenvolvimento

### Fase 1 — MVP (2 semanas)
- [ ] Criar projeto Next.js baseado no `bolao` existente
- [ ] Configurar Supabase Auth (Google)
- [ ] Criar tabelas `usuarios_bolao` e `boloes`
- [ ] Alterar tabela `participantes` (adicionar `bolao_id`)
- [ ] Landing page com CTA
- [ ] Tela de login social
- [ ] Fluxo de pagamento manual (PIX + confirmação admin)
- [ ] Dashboard de configuração do bolão
- [ ] Página pública `/bolao/[slug]`
- [ ] Deploy na Vercel

### Fase 2 — Automação (1 mês)
- [ ] Webhook PIX automático (Mercado Pago ou Efí Bank)
- [ ] Lista de jogos da Copa pré-cadastrada com seleção
- [ ] Email de boas-vindas com link do bolão
- [ ] Compartilhamento via WhatsApp com link direto
- [ ] Página de resultado com cálculo automático do prêmio

### Fase 3 — Escala
- [ ] Multi-bolão por usuário
- [ ] Bolões por rodada (múltiplos jogos)
- [ ] Ranking geral entre todos os bolões
- [ ] Plano mensal / anual para organizadores frequentes

---

## 💡 Diferencial Competitivo

| Feature | bolão.online | Concorrentes |
|---------|-------------|-------------|
| Setup em < 5 min | ✅ | ❌ |
| PIX integrado | ✅ | ❌ |
| Atualização em tempo real | ✅ (Supabase Realtime) | ❌ |
| Mobile first | ✅ | Parcial |
| Sem app para baixar | ✅ | ❌ |
| Personalização de taxa | ✅ | ❌ |

---

## 🔗 Links e Referências

- [[bolao-original]] — Projeto base (`C:\Users\udpl1652\bolao`)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel Deploy](https://vercel.com/docs)

---

## 📋 Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://imlffgsouyopbfsdqaft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://bolao.online

# Pagamento PIX do admin (recebe os R$ 50)
NEXT_PUBLIC_PIX_ADMIN_CHAVE=seu-pix@email.com
NEXT_PUBLIC_PIX_ADMIN_PAYLOAD=00020101...
```

---

*Criado em: 2026-06-14 · Projeto: bolão.online*
