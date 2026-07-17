-- Agenda de Briefing — CSP Nexora
-- Agenda única (sem conceito de múltiplos profissionais/recursos).
-- lead_id referencia a tabela `leads` já existente no projeto.

-- ENUMs
CREATE TYPE agendamento_status AS ENUM (
  'agendado', 'confirmado', 'realizado', 'faltou', 'cancelado'
);

CREATE TYPE dia_semana AS ENUM (
  'domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'
);

-- Grade de horário semanal única
CREATE TABLE agenda_hours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia         dia_semana NOT NULL UNIQUE,
  aberto      BOOLEAN NOT NULL DEFAULT false,
  hora_inicio TIME,
  hora_fim    TIME,
  CONSTRAINT check_horas CHECK (
    (aberto = false) OR (hora_inicio IS NOT NULL AND hora_fim IS NOT NULL)
  )
);

-- Agendamentos (reuniões de Briefing)
-- data_hora_fim é TIMESTAMPTZ normal (não GENERATED): o Postgres rejeita
-- "data_hora_inicio + interval" como coluna gerada por não considerar essa
-- expressão IMMUTABLE. O valor é calculado via trigger (abaixo).
CREATE TABLE agendamentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id          UUID NOT NULL REFERENCES leads(id),
  assunto          TEXT,
  data_hora_inicio TIMESTAMPTZ NOT NULL,
  data_hora_fim    TIMESTAMPTZ,
  status           agendamento_status NOT NULL DEFAULT 'agendado',
  observacoes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: calcula data_hora_fim = data_hora_inicio + 60 minutos
CREATE OR REPLACE FUNCTION calcular_data_hora_fim()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_hora_fim := NEW.data_hora_inicio + interval '60 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_data_hora_fim
  BEFORE INSERT OR UPDATE OF data_hora_inicio ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION calcular_data_hora_fim();

-- Índices
CREATE INDEX idx_agendamentos_data   ON agendamentos(data_hora_inicio);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_lead   ON agendamentos(lead_id);

-- RLS (mesmo padrão de leads/clientes/projetos)
ALTER TABLE agenda_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "autenticado_select" ON agendamentos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "autenticado_insert" ON agendamentos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "autenticado_update" ON agendamentos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "autenticado_select" ON agenda_hours FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "autenticado_update" ON agenda_hours FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed: horário comercial atual do CSP Nexora (seg-sex 09h-18h)
INSERT INTO agenda_hours (dia, aberto, hora_inicio, hora_fim) VALUES
  ('domingo', false, NULL,    NULL),
  ('segunda', true,  '09:00', '18:00'),
  ('terca',   true,  '09:00', '18:00'),
  ('quarta',  true,  '09:00', '18:00'),
  ('quinta',  true,  '09:00', '18:00'),
  ('sexta',   true,  '09:00', '18:00'),
  ('sabado',  false, NULL,    NULL);
