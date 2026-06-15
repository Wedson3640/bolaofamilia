# 🗃 Banco de Dados — bolão.online

> SQL completo para rodar no Supabase SQL Editor

```sql
-- ============================================================
-- BOLÃO ONLINE — Setup completo do banco de dados
-- Rode no Supabase → SQL Editor → Run
-- ============================================================

-- ── 1. Tabela de donos de bolão (quem pagou R$ 50) ──────────
CREATE TABLE IF NOT EXISTS usuarios_bolao (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  nome        TEXT,
  pago        BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE usuarios_bolao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario_le_proprio"
  ON usuarios_bolao FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "usuario_cria_proprio"
  ON usuarios_bolao FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_atualiza_usuario"
  ON usuarios_bolao FOR UPDATE
  USING (true); -- admin confirma pagamento


-- ── 2. Tabela de bolões ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS boloes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,
  titulo          TEXT NOT NULL,
  jogo_time_casa  TEXT NOT NULL DEFAULT 'Brasil',
  jogo_time_fora  TEXT NOT NULL DEFAULT 'Haiti',
  bandeira_casa   TEXT DEFAULT 'br',    -- código ISO ex: "br", "ar", "fr"
  bandeira_fora   TEXT DEFAULT 'ht',
  jogo_data       TIMESTAMPTZ NOT NULL,
  valor_cota      NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  taxa_admin_pct  NUMERIC(5,2)  NOT NULL DEFAULT 25.00,
  chave_pix       TEXT NOT NULL,
  payload_pix     TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE boloes ENABLE ROW LEVEL SECURITY;

-- Dono gerencia seus bolões
CREATE POLICY "dono_le_bolao"
  ON boloes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "dono_cria_bolao"
  ON boloes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "dono_edita_bolao"
  ON boloes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "dono_exclui_bolao"
  ON boloes FOR DELETE
  USING (user_id = auth.uid());

-- Leitura pública por slug (página do bolão acessível por qualquer um)
CREATE POLICY "leitura_publica_bolao"
  ON boloes FOR SELECT
  USING (ativo = TRUE);


-- ── 3. Incrementar tabela participantes existente ────────────
ALTER TABLE participantes
  ADD COLUMN IF NOT EXISTS bolao_id UUID REFERENCES boloes(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_participantes_bolao_id ON participantes(bolao_id);

-- Atualizar políticas de participantes para respeitar bolao_id
-- (As políticas existentes continuam para o projeto original com bolao_id NULL)
CREATE POLICY "admin_atualiza_por_bolao"
  ON participantes FOR UPDATE
  USING (
    bolao_id IN (SELECT id FROM boloes WHERE user_id = auth.uid())
    OR bolao_id IS NULL  -- compatibilidade com projeto original
  );

CREATE POLICY "admin_exclui_por_bolao"
  ON participantes FOR DELETE
  USING (
    bolao_id IN (SELECT id FROM boloes WHERE user_id = auth.uid())
    OR bolao_id IS NULL
  );


-- ── 4. Realtime ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE boloes;
ALTER PUBLICATION supabase_realtime ADD TABLE usuarios_bolao;
-- participantes já está na publicação


-- ── 5. View útil: bolão com contagem de apostadores ──────────
CREATE OR REPLACE VIEW boloes_resumo AS
  SELECT
    b.*,
    COUNT(p.id)                          AS total_apostadores,
    COUNT(p.id) FILTER (WHERE p.pago)   AS total_pagantes,
    COUNT(p.id) FILTER (WHERE p.pago) * b.valor_cota AS total_arrecadado
  FROM boloes b
  LEFT JOIN participantes p ON p.bolao_id = b.id
  GROUP BY b.id;
```

---

## 📊 Diagrama de Relacionamento

```
auth.users
    │
    ├──── usuarios_bolao (1:1 por enquanto)
    │
    └──── boloes (1:N)
               │
               └──── participantes (1:N)
                         • id
                         • nome
                         • placar_brasil
                         • placar_haiti
                         • pago
                         • bolao_id ← FK para boloes
                         • criado_em
```

---

*Referência: [[README]] · [[banco-de-dados]]*
