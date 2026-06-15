# ⚽ Jogos da Copa — Lista Pré-cadastrada

> Usada no formulário de configuração do bolão para o organizador escolher o jogo

```ts
// lib/jogos-copa.ts

export type Jogo = {
  id: number;
  timeCasa: string;
  codigoCasa: string;   // ISO 3166-1 alpha-2 para flagcdn.com
  timeFora: string;
  codigoFora: string;
  data: string;         // ISO 8601
  fase: string;
};

export const JOGOS_COPA_2026: Jogo[] = [
  // Fase de Grupos — Exemplos
  { id: 1,  timeCasa: "Brasil",    codigoCasa: "br", timeFora: "Haiti",     codigoFora: "ht", data: "2026-06-19T21:30:00-03:00", fase: "Grupo D" },
  { id: 2,  timeCasa: "Argentina", codigoCasa: "ar", timeFora: "Colômbia",  codigoFora: "co", data: "2026-06-20T18:00:00-03:00", fase: "Grupo B" },
  { id: 3,  timeCasa: "França",    codigoCasa: "fr", timeFora: "Alemanha",  codigoFora: "de", data: "2026-06-21T15:00:00-03:00", fase: "Grupo A" },
  { id: 4,  timeCasa: "Portugal",  codigoCasa: "pt", timeFora: "Espanha",   codigoFora: "es", data: "2026-06-22T21:00:00-03:00", fase: "Grupo E" },
  { id: 5,  timeCasa: "Inglaterra",codigoCasa: "gb", timeFora: "EUA",       codigoFora: "us", data: "2026-06-23T18:00:00-03:00", fase: "Grupo C" },

  // Fase Eliminatória (datas ilustrativas)
  { id: 10, timeCasa: "Brasil",    codigoCasa: "br", timeFora: "Argentina", codigoFora: "ar", data: "2026-07-04T21:00:00-03:00", fase: "Oitavas" },
  { id: 11, timeCasa: "França",    codigoCasa: "fr", timeFora: "Portugal",  codigoFora: "pt", data: "2026-07-05T18:00:00-03:00", fase: "Oitavas" },

  // Jogo personalizado — o organizador preenche os campos manualmente
  { id: 99, timeCasa: "",          codigoCasa: "",   timeFora: "",          codigoFora: "",   data: "", fase: "Personalizado" },
];
```

---

## Como usar no formulário

```tsx
// components/ConfigurarBolao.tsx (trecho)

import { JOGOS_COPA_2026 } from "@/lib/jogos-copa";

// ...
<select onChange={(e) => selecionarJogo(Number(e.target.value))}>
  <option value="">Selecione um jogo da Copa...</option>
  {JOGOS_COPA_2026.map((j) => (
    <option key={j.id} value={j.id}>
      {j.fase} — {j.timeCasa} vs {j.timeFora}
    </option>
  ))}
</select>
```

Ao selecionar, preenche automaticamente:
- `timeCasa`, `tiomeFora`
- `bandeiraCasa`, `bandeiraFora` (código ISO para flagcdn.com)
- `jogoData` (data/hora do jogo)

---

*Referência: [[README]] · [[banco-de-dados]]*
