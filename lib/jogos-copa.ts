export type Jogo = {
  id: number;
  timeCasa: string;
  codigoCasa: string;
  timeFora: string;
  codigoFora: string;
  data: string;
  fase: string;
};

export const JOGOS_COPA_2026: Jogo[] = [
  { id: 1,  timeCasa: "Brasil",     codigoCasa: "br", timeFora: "Haiti",      codigoFora: "ht", data: "2026-06-19T21:30:00-03:00", fase: "Grupo D" },
  { id: 2,  timeCasa: "Argentina",  codigoCasa: "ar", timeFora: "Colômbia",   codigoFora: "co", data: "2026-06-20T18:00:00-03:00", fase: "Grupo B" },
  { id: 3,  timeCasa: "França",     codigoCasa: "fr", timeFora: "Alemanha",   codigoFora: "de", data: "2026-06-21T15:00:00-03:00", fase: "Grupo A" },
  { id: 4,  timeCasa: "Portugal",   codigoCasa: "pt", timeFora: "Espanha",    codigoFora: "es", data: "2026-06-22T21:00:00-03:00", fase: "Grupo E" },
  { id: 5,  timeCasa: "Inglaterra", codigoCasa: "gb", timeFora: "EUA",        codigoFora: "us", data: "2026-06-23T18:00:00-03:00", fase: "Grupo C" },
  { id: 10, timeCasa: "Brasil",     codigoCasa: "br", timeFora: "Argentina",  codigoFora: "ar", data: "2026-07-04T21:00:00-03:00", fase: "Oitavas" },
  { id: 11, timeCasa: "França",     codigoCasa: "fr", timeFora: "Portugal",   codigoFora: "pt", data: "2026-07-05T18:00:00-03:00", fase: "Oitavas" },
  // Jogo personalizado — organizador preenche manualmente
  { id: 99, timeCasa: "",           codigoCasa: "",   timeFora: "",           codigoFora: "",   data: "", fase: "Personalizado" },
];
