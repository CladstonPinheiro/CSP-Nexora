-- Habilita atendimento aos sábados (09h-14h) na Agenda Própria, alinhando com
-- o horário já oferecido pela tool Agendar da Kátia via Google Calendar.
-- Nenhuma mudança de schema necessária - agenda_hours já suporta horários
-- por dia, slots.ts já é genérico.

UPDATE agenda_hours
SET aberto = true, hora_inicio = '09:00', hora_fim = '14:00'
WHERE dia = 'sabado';
