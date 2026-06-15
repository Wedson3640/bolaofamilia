# 🔄 Fluxo do Usuário — bolão.online

## Jornada do Organizador (quem cria o bolão)

```
┌─────────────────────────────────────────────────────────┐
│  1. LANDING PAGE  /                                     │
│                                                         │
│   "Crie seu bolão em 5 minutos!"                        │
│   [✅ Botão: Criar meu Bolão — R$ 50]                   │
└────────────────────┬────────────────────────────────────┘
                     │ clica
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. LOGIN SOCIAL  /login                                │
│                                                         │
│   [G  Entrar com Google]                                │
│   [⬡  Entrar com GitHub]                               │
│                                                         │
│   Supabase Auth cria o user_id automaticamente          │
└────────────────────┬────────────────────────────────────┘
                     │ autenticado
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. PAGAMENTO  /pagar                                   │
│                                                         │
│   QR Code PIX — R$ 50,00                               │
│   Chave: [PIX do admin da plataforma]                   │
│   [📋 Copiar código PIX]                               │
│                                                         │
│   ⏳ Aguardando confirmação do pagamento...             │
│   (Admin confirma manualmente no painel)                │
└────────────────────┬────────────────────────────────────┘
                     │ admin confirma pago = true
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. DASHBOARD  /dashboard                               │
│                                                         │
│   [➕ Criar Novo Bolão]                                 │
│   Lista de bolões criados                               │
│   • Bolão Copa 2026  → [Gerenciar] [Copiar Link]       │
└────────────────────┬────────────────────────────────────┘
                     │ cria novo
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. CONFIGURAR BOLÃO  /dashboard/novo                   │
│                                                         │
│   Título: _______________                               │
│   Jogo: [▼ Selecionar da Copa]  ← lista pré-cadastrada │
│         OU times personalizados                         │
│   Data/hora: _______________                            │
│   Valor da cota: R$ ___                                 │
│   Taxa admin: ___ %                                     │
│   Chave PIX: _______________                            │
│   PIX Copia e Cola: _______________                     │
│   Slug da URL: bolao.online/bolao/___                   │
│                                                         │
│   [✅ Criar Bolão]                                      │
└────────────────────┬────────────────────────────────────┘
                     │ criado
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. BOLÃO CRIADO!                                       │
│                                                         │
│   🔗 bolao.online/bolao/meu-bolao-2026                 │
│   [📋 Copiar link]  [📲 Compartilhar WhatsApp]         │
│                                                         │
│   Agora compartilhe o link com os participantes!        │
└─────────────────────────────────────────────────────────┘
```

---

## Jornada do Apostador (quem participa)

```
┌─────────────────────────────────────────────────────────┐
│  Recebe link do WhatsApp:                               │
│  bolao.online/bolao/turma-do-ze-2026                   │
└────────────────────┬────────────────────────────────────┘
                     │ acessa no celular
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PÁGINA PÚBLICA DO BOLÃO  /bolao/[slug]                 │
│                                                         │
│  🏆 Bolão Copa 2026 — Turma do Zé                      │
│  Brasil 🇧🇷  VS  Haiti 🇭🇹                             │
│  📅 19/06/2026  🕙 21h30                               │
│  💰 R$ 10,00 por aposta                                 │
│                                                         │
│  Tabela de apostadores (em tempo real)                  │
│                                                         │
│  [🎯 Apostar Agora!]                                    │
└────────────────────┬────────────────────────────────────┘
                     │ clica Apostar
                     ▼
┌─────────────────────────────────────────────────────────┐
│  MODAL — ETAPA 1: Palpite                               │
│                                                         │
│  Nome: _______________                                  │
│  Brasil [2] × Haiti [0]                                 │
│                                                         │
│  [✅ Confirmar Aposta]                                  │
└────────────────────┬────────────────────────────────────┘
                     │ confirma → salva no banco
                     ▼
┌─────────────────────────────────────────────────────────┐
│  MODAL — ETAPA 2: Pagamento                             │
│                                                         │
│  🎉 Aposta confirmada! João Silva — Brasil 2 × Haiti 0 │
│                                                         │
│  💸 Pague R$ 10,00 via PIX                             │
│  [QR Code do organizador]                               │
│  [📋 Copiar código PIX]                                │
│  Chave: organizador@gmail.com                           │
│                                                         │
│  📜 Regras: 75% para ganhadores, 25% para organização  │
│                                                         │
│  [Fechar]                                               │
└─────────────────────────────────────────────────────────┘
```

---

## Fluxo Admin da Plataforma (dono do bolão.online)

```
Painel admin especial (rota protegida /admin)
    │
    ├── Ver todos os usuários que pagaram R$ 50
    ├── Confirmar pagamentos manualmente (pago = true)
    └── Ver estatísticas: bolões criados, receita total
```

---

*Referência: [[README]] · [[banco-de-dados]]*
