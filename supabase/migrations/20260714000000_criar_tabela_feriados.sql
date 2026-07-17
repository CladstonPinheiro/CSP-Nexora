CREATE TABLE IF NOT EXISTS feriados (
  data DATE PRIMARY KEY,
  descricao TEXT NOT NULL
);

COMMENT ON TABLE feriados IS 'Feriados nacionais/regionais usados para bloquear briefings da Kátia';
