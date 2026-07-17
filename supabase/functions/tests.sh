#!/usr/bin/env bash
# Roteiro de testes da API de agendamento (CSP Nexora).
# Rodar SOMENTE depois do deploy das 3 Edge Functions e da migration.
#
# Uso:
#   export SUPABASE_URL="https://SEU_PROJETO.supabase.co"
#   export SERVICE_ROLE_KEY="a_service_role_key_do_projeto"
#   export LEAD_ID="uuid-de-um-lead-existente-na-tabela-leads"
#   bash supabase/functions/tests.sh
#
# Requer: curl. jq é opcional (só melhora a leitura do output);
# o script funciona sem jq também.

set -uo pipefail

: "${SUPABASE_URL:?defina SUPABASE_URL}"
: "${SERVICE_ROLE_KEY:?defina SERVICE_ROLE_KEY}"
: "${LEAD_ID:?defina LEAD_ID (um id existente em leads)}"

BASE="$SUPABASE_URL/functions/v1"
AUTH=(-H "Authorization: Bearer $SERVICE_ROLE_KEY" -H "Content-Type: application/json")

PROXIMA_SEGUNDA=$(date -d "next monday" +%F)
PROXIMO_SABADO=$(date -d "next saturday" +%F)
DATA_PASSADA=$(date -d "yesterday" +%F)

pretty() {
  if command -v jq >/dev/null 2>&1; then jq .; else cat; fi
}

titulo() {
  echo ""
  echo "=============================================================="
  echo "$1"
  echo "=============================================================="
}

# --- 1. Consultar horários livres de um dia útil futuro ---------------
titulo "1. GET horários disponíveis — $PROXIMA_SEGUNDA (dia útil, esperado HORARIOS_DISPONIVEIS com slots)"
curl -s -X GET "$BASE/agendamentos-horarios?data=$PROXIMA_SEGUNDA" "${AUTH[@]}" | pretty

# --- 2. Criar agendamento com sucesso ----------------------------------
titulo "2. POST criar agendamento — $PROXIMA_SEGUNDA 10:00 (esperado 201 AGENDAMENTO_CRIADO)"
RESP_CRIAR=$(curl -s -X POST "$BASE/agendamentos" "${AUTH[@]}" -d "{
  \"lead_id\": \"$LEAD_ID\",
  \"assunto\": \"Reunião de Briefing (teste automatizado)\",
  \"data\": \"$PROXIMA_SEGUNDA\",
  \"hora\": \"10:00\"
}")
echo "$RESP_CRIAR" | pretty

AGENDAMENTO_ID=$(echo "$RESP_CRIAR" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo ">> AGENDAMENTO_ID capturado: ${AGENDAMENTO_ID:-<não encontrado — confira o JSON acima>}"

# --- 3. Tentar criar no mesmo horário (conflito) -----------------------
titulo "3. POST criar no MESMO horário — $PROXIMA_SEGUNDA 10:00 (esperado 200 HORARIO_OCUPADO + sugestoes)"
curl -s -X POST "$BASE/agendamentos" "${AUTH[@]}" -d "{
  \"lead_id\": \"$LEAD_ID\",
  \"assunto\": \"Deveria falhar por conflito\",
  \"data\": \"$PROXIMA_SEGUNDA\",
  \"hora\": \"10:00\"
}" | pretty

# --- 4. Tentar criar em dia fechado (sábado) ---------------------------
titulo "4. POST criar em dia fechado — $PROXIMO_SABADO 10:00 (esperado 200 AGENDA_FECHADA)"
curl -s -X POST "$BASE/agendamentos" "${AUTH[@]}" -d "{
  \"lead_id\": \"$LEAD_ID\",
  \"assunto\": \"Deveria falhar por agenda fechada\",
  \"data\": \"$PROXIMO_SABADO\",
  \"hora\": \"10:00\"
}" | pretty

# --- 5. Tentar criar em data passada ------------------------------------
titulo "5. POST criar em data passada — $DATA_PASSADA (esperado 200 DATA_PASSADA)"
curl -s -X POST "$BASE/agendamentos" "${AUTH[@]}" -d "{
  \"lead_id\": \"$LEAD_ID\",
  \"assunto\": \"Deveria falhar por data passada\",
  \"data\": \"$DATA_PASSADA\",
  \"hora\": \"10:00\"
}" | pretty

if [ -z "${AGENDAMENTO_ID:-}" ]; then
  echo ""
  echo "!! Não foi possível capturar o AGENDAMENTO_ID do passo 2 — pulando os testes 6-9."
  echo "!! Rode manualmente com o id retornado no passo 2."
  exit 1
fi

# --- 6. Reagendar --------------------------------------------------------
titulo "6. PUT reagendar $AGENDAMENTO_ID — $PROXIMA_SEGUNDA 11:00 (esperado 200 AGENDAMENTO_REAGENDADO)"
curl -s -X PUT "$BASE/agendamentos-id/$AGENDAMENTO_ID" "${AUTH[@]}" -d "{
  \"data\": \"$PROXIMA_SEGUNDA\",
  \"hora\": \"11:00\"
}" | pretty

# --- 7. Confirmar que 10:00 voltou a ficar livre após o reagendamento ---
titulo "7. GET horários — $PROXIMA_SEGUNDA (esperado: 10:00 livre de novo, 11:00 ocupado)"
curl -s -X GET "$BASE/agendamentos-horarios?data=$PROXIMA_SEGUNDA" "${AUTH[@]}" | pretty

# --- 8. Cancelar (soft delete) -------------------------------------------
titulo "8. DELETE cancelar $AGENDAMENTO_ID (esperado 200 AGENDAMENTO_CANCELADO)"
curl -s -X DELETE "$BASE/agendamentos-id/$AGENDAMENTO_ID" "${AUTH[@]}" -d '{}' | pretty

# --- 9. Confirmar que 11:00 voltou a ficar livre após o cancelamento ----
titulo "9. GET horários — $PROXIMA_SEGUNDA (esperado: 11:00 livre de novo — slot liberado pelo cancelamento)"
curl -s -X GET "$BASE/agendamentos-horarios?data=$PROXIMA_SEGUNDA&hora=11:00" "${AUTH[@]}" | pretty

# --- 10. Extras: reações a estados inválidos -----------------------------
titulo "10a. DELETE de novo no mesmo id (esperado 422 AGENDAMENTO_JA_CANCELADO)"
curl -s -X DELETE "$BASE/agendamentos-id/$AGENDAMENTO_ID" "${AUTH[@]}" -d '{}' | pretty

titulo "10b. PUT reagendar um agendamento já cancelado (esperado 422 AGENDAMENTO_CANCELADO_NAO_REAGENDAVEL)"
curl -s -X PUT "$BASE/agendamentos-id/$AGENDAMENTO_ID" "${AUTH[@]}" -d "{
  \"data\": \"$PROXIMA_SEGUNDA\",
  \"hora\": \"12:00\"
}" | pretty

titulo "10c. POST sem lead_id (esperado 422 CAMPO_OBRIGATORIO_AUSENTE)"
curl -s -X POST "$BASE/agendamentos" "${AUTH[@]}" -d "{
  \"data\": \"$PROXIMA_SEGUNDA\",
  \"hora\": \"14:00\"
}" | pretty

titulo "10d. POST com lead_id inexistente (esperado 404 LEAD_NAO_ENCONTRADO)"
curl -s -X POST "$BASE/agendamentos" "${AUTH[@]}" -d "{
  \"lead_id\": \"00000000-0000-0000-0000-000000000000\",
  \"data\": \"$PROXIMA_SEGUNDA\",
  \"hora\": \"14:00\"
}" | pretty

titulo "10e. POST com data em formato inválido (esperado 422 FORMATO_INVALIDO)"
curl -s -X POST "$BASE/agendamentos" "${AUTH[@]}" -d "{
  \"lead_id\": \"$LEAD_ID\",
  \"data\": \"10/07/2026\",
  \"hora\": \"14:00\"
}" | pretty

titulo "10f. GET sem Authorization (esperado 401 TOKEN_INVALIDO)"
curl -s -X GET "$BASE/agendamentos-horarios?data=$PROXIMA_SEGUNDA"
echo ""

titulo "FIM DOS TESTES"
