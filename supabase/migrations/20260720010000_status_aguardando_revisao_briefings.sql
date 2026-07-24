ALTER TABLE briefings DROP CONSTRAINT briefings_status_check;

ALTER TABLE briefings ADD CONSTRAINT briefings_status_check
  CHECK (status = ANY (ARRAY['em_andamento'::text, 'aguardando_revisao_ia'::text, 'concluido'::text]));
