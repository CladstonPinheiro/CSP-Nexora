ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS resumo_conversa_ia TEXT,
  ADD COLUMN IF NOT EXISTS motivo_contato_ia TEXT,
  ADD COLUMN IF NOT EXISTS resumo_atualizado_em TIMESTAMPTZ;

COMMENT ON COLUMN leads.resumo_conversa_ia IS 'Resumo da conversa gerado por IA pelo workflow n8n "3- CRM"';
COMMENT ON COLUMN leads.motivo_contato_ia IS 'Motivo do contato identificado por IA a partir da conversa';
COMMENT ON COLUMN leads.resumo_atualizado_em IS 'Timestamp da última atualização do resumo por IA, útil para priorizar follow-up';
