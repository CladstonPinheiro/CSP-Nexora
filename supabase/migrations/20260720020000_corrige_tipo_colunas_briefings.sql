ALTER TABLE briefings ALTER COLUMN numero_colaboradores TYPE TEXT USING numero_colaboradores::TEXT;
ALTER TABLE briefings ALTER COLUMN clientes_atendidos_mes TYPE TEXT USING clientes_atendidos_mes::TEXT;
