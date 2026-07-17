-- Remove colunas duplicadas em português da tabela leads (nicho, cidade, origem,
-- indicado_por, anotacoes, estagio), criadas antes de o schema ter migrations
-- versionadas. Eram duplicatas das colunas em inglês já em uso (niche, city,
-- source, referred_by, notes, stage). Confirmado via grep completo do
-- repositório + workflows n8n que nenhum código lê ou escreve nelas
-- (estagio tinha apenas um DEFAULT 'identificado' no banco, sem uso
-- funcional). Todas as 6 estavam vazias ou só com o valor default, sem dado
-- real perdido.

ALTER TABLE leads
  DROP COLUMN IF EXISTS nicho,
  DROP COLUMN IF EXISTS cidade,
  DROP COLUMN IF EXISTS origem,
  DROP COLUMN IF EXISTS indicado_por,
  DROP COLUMN IF EXISTS anotacoes,
  DROP COLUMN IF EXISTS estagio;
