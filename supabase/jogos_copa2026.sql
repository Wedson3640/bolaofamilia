-- ── Tabela de jogos Copa do Mundo 2026 ───────────────────────────────────────
-- Execute no Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS jogos_copa2026 (
  id                  SERIAL PRIMARY KEY,
  data                DATE NOT NULL,
  horario             TIME NOT NULL,
  fase                TEXT NOT NULL,
  mandante            TEXT NOT NULL,
  visitante           TEXT NOT NULL,
  jogo                TEXT NOT NULL,
  bandeira_mandante   TEXT,
  bandeira_visitante  TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE jogos_copa2026 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura publica jogos" ON jogos_copa2026;
CREATE POLICY "leitura publica jogos" ON jogos_copa2026
  FOR SELECT USING (true);

-- ── Limpa dados anteriores (para re-executar sem duplicar) ───────────────────
TRUNCATE jogos_copa2026 RESTART IDENTITY;

-- ── Fase de Grupos ────────────────────────────────────────────────────────────
INSERT INTO jogos_copa2026 (data, horario, fase, mandante, visitante, jogo, bandeira_mandante, bandeira_visitante) VALUES
('2026-06-11','16:00','Grupo A','México','África do Sul','México x África do Sul','https://flagcdn.com/w80/mx.png','https://flagcdn.com/w80/za.png'),
('2026-06-11','23:00','Grupo A','Coreia do Sul','Tchéquia','Coreia do Sul x Tchéquia','https://flagcdn.com/w80/kr.png','https://flagcdn.com/w80/cz.png'),
('2026-06-12','16:00','Grupo B','Canadá','Bósnia e Herzegovina','Canadá x Bósnia e Herzegovina','https://flagcdn.com/w80/ca.png','https://flagcdn.com/w80/ba.png'),
('2026-06-12','22:00','Grupo D','Estados Unidos','Paraguai','Estados Unidos x Paraguai','https://flagcdn.com/w80/us.png','https://flagcdn.com/w80/py.png'),
('2026-06-13','16:00','Grupo B','Catar','Suíça','Catar x Suíça','https://flagcdn.com/w80/qa.png','https://flagcdn.com/w80/ch.png'),
('2026-06-13','19:00','Grupo C','Brasil','Marrocos','Brasil x Marrocos','https://flagcdn.com/w80/br.png','https://flagcdn.com/w80/ma.png'),
('2026-06-13','22:00','Grupo C','Haiti','Escócia','Haiti x Escócia','https://flagcdn.com/w80/ht.png','https://flagcdn.com/w80/gb-sct.png'),
('2026-06-14','01:00','Grupo D','Austrália','Turquia','Austrália x Turquia','https://flagcdn.com/w80/au.png','https://flagcdn.com/w80/tr.png'),
('2026-06-14','14:00','Grupo E','Alemanha','Curaçao','Alemanha x Curaçao','https://flagcdn.com/w80/de.png','https://flagcdn.com/w80/cw.png'),
('2026-06-14','17:00','Grupo F','Holanda','Japão','Holanda x Japão','https://flagcdn.com/w80/nl.png','https://flagcdn.com/w80/jp.png'),
('2026-06-14','20:00','Grupo E','Costa do Marfim','Equador','Costa do Marfim x Equador','https://flagcdn.com/w80/ci.png','https://flagcdn.com/w80/ec.png'),
('2026-06-14','23:00','Grupo F','Suécia','Tunísia','Suécia x Tunísia','https://flagcdn.com/w80/se.png','https://flagcdn.com/w80/tn.png'),
('2026-06-15','13:00','Grupo H','Espanha','Cabo Verde','Espanha x Cabo Verde','https://flagcdn.com/w80/es.png','https://flagcdn.com/w80/cv.png'),
('2026-06-15','16:00','Grupo G','Bélgica','Egito','Bélgica x Egito','https://flagcdn.com/w80/be.png','https://flagcdn.com/w80/eg.png'),
('2026-06-15','19:00','Grupo H','Arábia Saudita','Uruguai','Arábia Saudita x Uruguai','https://flagcdn.com/w80/sa.png','https://flagcdn.com/w80/uy.png'),
('2026-06-15','22:00','Grupo G','Irã','Nova Zelândia','Irã x Nova Zelândia','https://flagcdn.com/w80/ir.png','https://flagcdn.com/w80/nz.png'),
('2026-06-16','16:00','Grupo I','França','Senegal','França x Senegal','https://flagcdn.com/w80/fr.png','https://flagcdn.com/w80/sn.png'),
('2026-06-16','19:00','Grupo I','Iraque','Noruega','Iraque x Noruega','https://flagcdn.com/w80/iq.png','https://flagcdn.com/w80/no.png'),
('2026-06-16','22:00','Grupo J','Argentina','Argélia','Argentina x Argélia','https://flagcdn.com/w80/ar.png','https://flagcdn.com/w80/dz.png'),
('2026-06-17','01:00','Grupo J','Áustria','Jordânia','Áustria x Jordânia','https://flagcdn.com/w80/at.png','https://flagcdn.com/w80/jo.png'),
('2026-06-17','14:00','Grupo K','Portugal','RD Congo','Portugal x RD Congo','https://flagcdn.com/w80/pt.png','https://flagcdn.com/w80/cd.png'),
('2026-06-17','17:00','Grupo L','Inglaterra','Croácia','Inglaterra x Croácia','https://flagcdn.com/w80/gb-eng.png','https://flagcdn.com/w80/hr.png'),
('2026-06-17','20:00','Grupo L','Gana','Panamá','Gana x Panamá','https://flagcdn.com/w80/gh.png','https://flagcdn.com/w80/pa.png'),
('2026-06-17','23:00','Grupo K','Uzbequistão','Colômbia','Uzbequistão x Colômbia','https://flagcdn.com/w80/uz.png','https://flagcdn.com/w80/co.png'),
('2026-06-18','13:00','Grupo A','Tchéquia','África do Sul','Tchéquia x África do Sul','https://flagcdn.com/w80/cz.png','https://flagcdn.com/w80/za.png'),
('2026-06-18','16:00','Grupo B','Suíça','Bósnia e Herzegovina','Suíça x Bósnia e Herzegovina','https://flagcdn.com/w80/ch.png','https://flagcdn.com/w80/ba.png'),
('2026-06-18','19:00','Grupo B','Canadá','Catar','Canadá x Catar','https://flagcdn.com/w80/ca.png','https://flagcdn.com/w80/qa.png'),
('2026-06-18','22:00','Grupo A','México','Coreia do Sul','México x Coreia do Sul','https://flagcdn.com/w80/mx.png','https://flagcdn.com/w80/kr.png'),
('2026-06-19','16:00','Grupo D','Estados Unidos','Austrália','Estados Unidos x Austrália','https://flagcdn.com/w80/us.png','https://flagcdn.com/w80/au.png'),
('2026-06-19','19:00','Grupo C','Escócia','Marrocos','Escócia x Marrocos','https://flagcdn.com/w80/gb-sct.png','https://flagcdn.com/w80/ma.png'),
('2026-06-19','21:30','Grupo C','Brasil','Haiti','Brasil x Haiti','https://flagcdn.com/w80/br.png','https://flagcdn.com/w80/ht.png'),
('2026-06-20','00:00','Grupo D','Turquia','Paraguai','Turquia x Paraguai','https://flagcdn.com/w80/tr.png','https://flagcdn.com/w80/py.png'),
('2026-06-20','14:00','Grupo F','Holanda','Suécia','Holanda x Suécia','https://flagcdn.com/w80/nl.png','https://flagcdn.com/w80/se.png'),
('2026-06-20','17:00','Grupo E','Alemanha','Costa do Marfim','Alemanha x Costa do Marfim','https://flagcdn.com/w80/de.png','https://flagcdn.com/w80/ci.png'),
('2026-06-20','21:00','Grupo E','Equador','Curaçao','Equador x Curaçao','https://flagcdn.com/w80/ec.png','https://flagcdn.com/w80/cw.png'),
('2026-06-21','01:00','Grupo F','Tunísia','Japão','Tunísia x Japão','https://flagcdn.com/w80/tn.png','https://flagcdn.com/w80/jp.png'),
('2026-06-21','13:00','Grupo H','Espanha','Arábia Saudita','Espanha x Arábia Saudita','https://flagcdn.com/w80/es.png','https://flagcdn.com/w80/sa.png'),
('2026-06-21','16:00','Grupo G','Bélgica','Irã','Bélgica x Irã','https://flagcdn.com/w80/be.png','https://flagcdn.com/w80/ir.png'),
('2026-06-21','19:00','Grupo H','Uruguai','Cabo Verde','Uruguai x Cabo Verde','https://flagcdn.com/w80/uy.png','https://flagcdn.com/w80/cv.png'),
('2026-06-21','22:00','Grupo G','Nova Zelândia','Egito','Nova Zelândia x Egito','https://flagcdn.com/w80/nz.png','https://flagcdn.com/w80/eg.png'),
('2026-06-22','14:00','Grupo J','Argentina','Áustria','Argentina x Áustria','https://flagcdn.com/w80/ar.png','https://flagcdn.com/w80/at.png'),
('2026-06-22','18:00','Grupo I','França','Iraque','França x Iraque','https://flagcdn.com/w80/fr.png','https://flagcdn.com/w80/iq.png'),
('2026-06-22','21:00','Grupo I','Noruega','Senegal','Noruega x Senegal','https://flagcdn.com/w80/no.png','https://flagcdn.com/w80/sn.png'),
('2026-06-23','00:00','Grupo J','Jordânia','Argélia','Jordânia x Argélia','https://flagcdn.com/w80/jo.png','https://flagcdn.com/w80/dz.png'),
('2026-06-23','14:00','Grupo K','Portugal','Uzbequistão','Portugal x Uzbequistão','https://flagcdn.com/w80/pt.png','https://flagcdn.com/w80/uz.png'),
('2026-06-23','17:00','Grupo L','Inglaterra','Gana','Inglaterra x Gana','https://flagcdn.com/w80/gb-eng.png','https://flagcdn.com/w80/gh.png'),
('2026-06-23','20:00','Grupo L','Panamá','Croácia','Panamá x Croácia','https://flagcdn.com/w80/pa.png','https://flagcdn.com/w80/hr.png'),
('2026-06-23','23:00','Grupo K','Colômbia','RD Congo','Colômbia x RD Congo','https://flagcdn.com/w80/co.png','https://flagcdn.com/w80/cd.png'),
('2026-06-24','16:00','Grupo B','Suíça','Canadá','Suíça x Canadá','https://flagcdn.com/w80/ch.png','https://flagcdn.com/w80/ca.png'),
('2026-06-24','16:00','Grupo B','Bósnia e Herzegovina','Catar','Bósnia e Herzegovina x Catar','https://flagcdn.com/w80/ba.png','https://flagcdn.com/w80/qa.png'),
('2026-06-24','19:00','Grupo C','Escócia','Brasil','Escócia x Brasil','https://flagcdn.com/w80/gb-sct.png','https://flagcdn.com/w80/br.png'),
('2026-06-24','19:00','Grupo C','Marrocos','Haiti','Marrocos x Haiti','https://flagcdn.com/w80/ma.png','https://flagcdn.com/w80/ht.png'),
('2026-06-24','22:00','Grupo A','Tchéquia','México','Tchéquia x México','https://flagcdn.com/w80/cz.png','https://flagcdn.com/w80/mx.png'),
('2026-06-24','22:00','Grupo A','África do Sul','Coreia do Sul','África do Sul x Coreia do Sul','https://flagcdn.com/w80/za.png','https://flagcdn.com/w80/kr.png'),
('2026-06-25','17:00','Grupo E','Equador','Alemanha','Equador x Alemanha','https://flagcdn.com/w80/ec.png','https://flagcdn.com/w80/de.png'),
('2026-06-25','17:00','Grupo E','Curaçao','Costa do Marfim','Curaçao x Costa do Marfim','https://flagcdn.com/w80/cw.png','https://flagcdn.com/w80/ci.png'),
('2026-06-25','20:00','Grupo F','Tunísia','Holanda','Tunísia x Holanda','https://flagcdn.com/w80/tn.png','https://flagcdn.com/w80/nl.png'),
('2026-06-25','20:00','Grupo F','Japão','Suécia','Japão x Suécia','https://flagcdn.com/w80/jp.png','https://flagcdn.com/w80/se.png'),
('2026-06-25','23:00','Grupo D','Turquia','Estados Unidos','Turquia x Estados Unidos','https://flagcdn.com/w80/tr.png','https://flagcdn.com/w80/us.png'),
('2026-06-25','23:00','Grupo D','Paraguai','Austrália','Paraguai x Austrália','https://flagcdn.com/w80/py.png','https://flagcdn.com/w80/au.png'),
('2026-06-26','16:00','Grupo I','Noruega','França','Noruega x França','https://flagcdn.com/w80/no.png','https://flagcdn.com/w80/fr.png'),
('2026-06-26','16:00','Grupo I','Senegal','Iraque','Senegal x Iraque','https://flagcdn.com/w80/sn.png','https://flagcdn.com/w80/iq.png'),
('2026-06-26','21:00','Grupo H','Uruguai','Espanha','Uruguai x Espanha','https://flagcdn.com/w80/uy.png','https://flagcdn.com/w80/es.png'),
('2026-06-26','21:00','Grupo H','Cabo Verde','Arábia Saudita','Cabo Verde x Arábia Saudita','https://flagcdn.com/w80/cv.png','https://flagcdn.com/w80/sa.png'),
('2026-06-27','00:00','Grupo G','Nova Zelândia','Bélgica','Nova Zelândia x Bélgica','https://flagcdn.com/w80/nz.png','https://flagcdn.com/w80/be.png'),
('2026-06-27','00:00','Grupo G','Egito','Irã','Egito x Irã','https://flagcdn.com/w80/eg.png','https://flagcdn.com/w80/ir.png'),
('2026-06-27','18:00','Grupo L','Panamá','Inglaterra','Panamá x Inglaterra','https://flagcdn.com/w80/pa.png','https://flagcdn.com/w80/gb-eng.png'),
('2026-06-27','18:00','Grupo L','Croácia','Gana','Croácia x Gana','https://flagcdn.com/w80/hr.png','https://flagcdn.com/w80/gh.png'),
('2026-06-27','20:30','Grupo K','Colômbia','Portugal','Colômbia x Portugal','https://flagcdn.com/w80/co.png','https://flagcdn.com/w80/pt.png'),
('2026-06-27','20:30','Grupo K','RD Congo','Uzbequistão','RD Congo x Uzbequistão','https://flagcdn.com/w80/cd.png','https://flagcdn.com/w80/uz.png'),
('2026-06-27','23:00','Grupo J','Jordânia','Argentina','Jordânia x Argentina','https://flagcdn.com/w80/jo.png','https://flagcdn.com/w80/ar.png'),
('2026-06-27','23:00','Grupo J','Argélia','Áustria','Argélia x Áustria','https://flagcdn.com/w80/dz.png','https://flagcdn.com/w80/at.png');

-- ── 32 Avos de Final ──────────────────────────────────────────────────────────
INSERT INTO jogos_copa2026 (data, horario, fase, mandante, visitante, jogo, bandeira_mandante, bandeira_visitante) VALUES
('2026-06-28','16:00','32 avos','2º Grupo A','2º Grupo B','Jogo 73: 2º Grupo A x 2º Grupo B',NULL,NULL),
('2026-06-29','14:00','32 avos','1º Grupo C','2º Grupo F','Jogo 76: 1º Grupo C x 2º Grupo F',NULL,NULL),
('2026-06-29','17:30','32 avos','1º Grupo E','3º de A/B/C/D/F','Jogo 74: 1º Grupo E x 3º de A/B/C/D/F',NULL,NULL),
('2026-06-29','22:00','32 avos','1º Grupo F','2º Grupo C','Jogo 75: 1º Grupo F x 2º Grupo C',NULL,NULL),
('2026-06-30','14:00','32 avos','2º Grupo E','2º Grupo I','Jogo 78: 2º Grupo E x 2º Grupo I',NULL,NULL),
('2026-06-30','18:00','32 avos','1º Grupo I','3º de C/D/F/G/H','Jogo 77: 1º Grupo I x 3º de C/D/F/G/H',NULL,NULL),
('2026-06-30','22:00','32 avos','1º Grupo A','3º de C/E/F/H/I','Jogo 79: 1º Grupo A x 3º de C/E/F/H/I',NULL,NULL),
('2026-07-01','13:00','32 avos','1º Grupo L','3º de E/H/I/J/K','Jogo 80: 1º Grupo L x 3º de E/H/I/J/K',NULL,NULL),
('2026-07-01','17:00','32 avos','1º Grupo G','3º de A/E/H/I/J','Jogo 82: 1º Grupo G x 3º de A/E/H/I/J',NULL,NULL),
('2026-07-01','21:00','32 avos','1º Grupo D','3º de B/E/F/I/J','Jogo 81: 1º Grupo D x 3º de B/E/F/I/J',NULL,NULL),
('2026-07-02','16:00','32 avos','1º Grupo H','2º Grupo J','Jogo 84: 1º Grupo H x 2º Grupo J',NULL,NULL),
('2026-07-02','20:00','32 avos','2º Grupo K','2º Grupo L','Jogo 83: 2º Grupo K x 2º Grupo L',NULL,NULL),
('2026-07-03','00:00','32 avos','1º Grupo B','3º de E/F/G/I/J','Jogo 85: 1º Grupo B x 3º de E/F/G/I/J',NULL,NULL),
('2026-07-03','15:00','32 avos','2º Grupo D','2º Grupo G','Jogo 88: 2º Grupo D x 2º Grupo G',NULL,NULL),
('2026-07-03','19:00','32 avos','1º Grupo J','2º Grupo H','Jogo 86: 1º Grupo J x 2º Grupo H',NULL,NULL),
('2026-07-03','22:30','32 avos','1º Grupo K','3º de D/E/I/J/L','Jogo 87: 1º Grupo K x 3º de D/E/I/J/L',NULL,NULL);

-- ── Oitavas de Final ──────────────────────────────────────────────────────────
INSERT INTO jogos_copa2026 (data, horario, fase, mandante, visitante, jogo, bandeira_mandante, bandeira_visitante) VALUES
('2026-07-04','14:00','Oitavas','Vencedor 73','Vencedor 75','Jogo 90: Vencedor 73 x Vencedor 75',NULL,NULL),
('2026-07-04','18:00','Oitavas','Vencedor 74','Vencedor 77','Jogo 89: Vencedor 74 x Vencedor 77',NULL,NULL),
('2026-07-05','17:00','Oitavas','Vencedor 76','Vencedor 78','Jogo 91: Vencedor 76 x Vencedor 78',NULL,NULL),
('2026-07-05','21:00','Oitavas','Vencedor 79','Vencedor 80','Jogo 92: Vencedor 79 x Vencedor 80',NULL,NULL),
('2026-07-06','16:00','Oitavas','Vencedor 83','Vencedor 84','Jogo 93: Vencedor 83 x Vencedor 84',NULL,NULL),
('2026-07-06','21:00','Oitavas','Vencedor 81','Vencedor 82','Jogo 94: Vencedor 81 x Vencedor 82',NULL,NULL),
('2026-07-07','13:00','Oitavas','Vencedor 86','Vencedor 88','Jogo 95: Vencedor 86 x Vencedor 88',NULL,NULL),
('2026-07-07','17:00','Oitavas','Vencedor 85','Vencedor 87','Jogo 96: Vencedor 85 x Vencedor 87',NULL,NULL);

-- ── Quartas de Final ──────────────────────────────────────────────────────────
INSERT INTO jogos_copa2026 (data, horario, fase, mandante, visitante, jogo, bandeira_mandante, bandeira_visitante) VALUES
('2026-07-09','17:00','Quartas','Vencedor 89','Vencedor 90','Jogo 97: Vencedor 89 x Vencedor 90',NULL,NULL),
('2026-07-10','16:00','Quartas','Vencedor 93','Vencedor 94','Jogo 98: Vencedor 93 x Vencedor 94',NULL,NULL),
('2026-07-11','18:00','Quartas','Vencedor 91','Vencedor 92','Jogo 99: Vencedor 91 x Vencedor 92',NULL,NULL),
('2026-07-11','22:00','Quartas','Vencedor 95','Vencedor 96','Jogo 100: Vencedor 95 x Vencedor 96',NULL,NULL);

-- ── Semifinais ────────────────────────────────────────────────────────────────
INSERT INTO jogos_copa2026 (data, horario, fase, mandante, visitante, jogo, bandeira_mandante, bandeira_visitante) VALUES
('2026-07-14','16:00','Semifinal','Vencedor 97','Vencedor 98','Jogo 101: Vencedor 97 x Vencedor 98',NULL,NULL),
('2026-07-15','16:00','Semifinal','Vencedor 99','Vencedor 100','Jogo 102: Vencedor 99 x Vencedor 100',NULL,NULL);

-- ── 3º Lugar e Final ──────────────────────────────────────────────────────────
INSERT INTO jogos_copa2026 (data, horario, fase, mandante, visitante, jogo, bandeira_mandante, bandeira_visitante) VALUES
('2026-07-18','18:00','3º lugar','Perdedor 101','Perdedor 102','Jogo 103: Perdedor 101 x Perdedor 102',NULL,NULL),
('2026-07-19','16:00','Final','Vencedor 101','Vencedor 102','Jogo 104: Vencedor 101 x Vencedor 102',NULL,NULL);
