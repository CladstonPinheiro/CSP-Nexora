# Changelog

Todas as mudanças relevantes do projeto CSP Nexora são documentadas aqui, em ordem cronológica reversa.

## 18/07/2026

### Pendência de 13/07 fechada — tools de agendamento confirmadas apontando para "6"
- Verificado diretamente em `n8n-workflows/4-agente-ia-agendamento-template-base.json`: as 4 tools (`criar_reuniao`, `VerHorarios`, `reagendar_reuniao`, `cancelar_reuniao`) têm `workflowId.value = "HlsbghQRkVelOyLi"` (ID de "6- Eventos Agenda Própria | CSP Nexora"), confirmado tanto na seção `nodes` quanto em `activeVersion.nodes` (versão publicada). Nenhuma referencia `toRrh1FpDb8VRHUV` (ID de "5- Eventos Agenda", Google Calendar legado). A suspeita registrada em 13/07/2026 de que as tools pudessem ainda apontar para o workflow legado não se confirmou.
- O workflow "5- Eventos Agenda | Template Base" está órfão — nenhuma tool ativa o chama. Segue com `"active": true` no export do n8n (nunca foi desativado/arquivado); decisão de desativá-lo formalmente ainda pendente.

## 17/07/2026

### Segurança — Rotação de credenciais
- Rotacionado o access_token do Agent Bot "Template Base" no Chatwoot,
  atualizado na credencial "chatwoot_access_token_body" do n8n. Validado
  via teste direto no node "obter_informacoes" (workflow de integração
  UaZapi/Chatwoot).
- Rotacionada a Secret Key do Supabase (substituindo a antiga "default").
  Nova chave propagada para: .env.local, Vercel (produção), Edge Functions
  (via secret automático SUPABASE_SECRET_KEYS do Supabase), e credencial
  "supabase_service_role_cspnexora" no n8n.
- Corrigido bug de formato de header na credencial "supabase_service_role_cspnexora":
  faltava o prefixo "Bearer " antes do token, causando erro
  "Authorization failed" em todos os 4 branches do workflow "6- Eventos
  Agenda Própria" (agendamento, VerHorarios, reagendamento, cancelamento).

### Correção de bug de build (produção)
- Corrigido erro de build na Vercel: a função formatRelativeTime em
  lib/utils.ts existia apenas no diretório de trabalho local, nunca havia
  sido commitada. Build validado localmente (cache limpo) antes do commit.

### Versionamento (débito técnico resolvido)
- Versionadas pela primeira vez as Edge Functions do Supabase
  (agendamentos, agendamentos-id, agendamentos-horarios, e módulos
  compartilhados _shared/auth.ts, errors.ts, slots.ts).
- Versionadas 4 migrations SQL existentes (agenda_schema, leads_resumo_ia,
  remove_colunas_duplicadas_leads, habilitar_sabado_agenda) e criada nova
  migration documentando a tabela "feriados" (schema já aplicado em
  produção, sem alteração remota).
- Script de correção fix-verhorarios.js movido de solto na raiz para
  n8n-workflows/scripts/, com log de debug removido.
- tsconfig.json atualizado para excluir supabase/functions/** da checagem
  de tipos do Next.js (código Deno, incompatível com o tsconfig principal).
- 3 novos campos opcionais adicionados ao tipo Lead (types.ts):
  resumo_conversa_ia, motivo_contato_ia, resumo_atualizado_em.

Commit: e356397

## 16/07/2026

Sessão de repositório: continuação do redesign da agenda (Etapas 1 e 2) e implementação completa do tema claro/escuro no painel admin, incluindo uma série de correções de contraste identificadas depois da migração.

1. **[`app/admin/(panel)/agenda/`, neste repo]** Redesign completo da agenda do painel admin: grade semanal feita à mão substituída pela biblioteca FullCalendar (`@fullcalendar/react` + `core` + `daygrid` + `timegrid` + `interaction`), com visões mensal (`dayGridMonth`) e semanal (`timeGridWeek`) alternáveis pelo `headerToolbar` nativo. Drag-and-drop implementado (`eventDrop`) reagendando via a mesma Edge Function já usada pelo modal manual — em caso de rejeição (horário indisponível, feriado, fora do expediente), o evento reverte visualmente (`arg.revert()`) e mostra notificação de erro. Clique em data/horário vazio (`dateClick`) abre o modal de novo agendamento pré-preenchido. Restrição visual best-effort aos 4 horários fixos do Briefing e fins de semana via `eventAllow` — a validação real continua sendo feita pela Edge Function.
2. **[`app/globals.css` + 24 arquivos do admin, neste repo]** Implementado tema claro/escuro em todo o painel admin: `next-themes` com `attribute="class"`, tokens semânticos centralizados via CSS variables em `app/globals.css` (`--color-page`, `--color-surface`, `--color-inset`, `--color-border`, `--color-border-strong`, `--color-primary`, `--color-secondary`, `--color-muted`, `--color-brand-navy`, `--color-brand-orange`) substituindo 202 ocorrências de cores hardcoded (hex ou opacidade fixa tipo `border-white/10`) espalhadas em 25 arquivos, e toggle sol/lua no rodapé da `AdminSidebar`. Durante a migração, corrigido um bug pré-existente e não relacionado: `border-white\10` (contrabarra inválida, classe Tailwind nunca aplicada) em `clientes/page.tsx`, `tarefas/page.tsx` e `projetos/page.tsx`, para `border-white/10` correto.
3. **[`calendario-fullcalendar.css`, `CalendarioFullCalendar.tsx`, `page.tsx` da agenda, `globals.css`, neste repo]** Série de correções de contraste no tema claro, cada uma verificada por cálculo real de contraste (fórmula WCAG), não só visualmente: status "cancelado" dos agendamentos (contraste calculado de 1.6:1 → cores sólidas por tema, ~5.3:1 em ambos), botões da toolbar do calendário ("Hoje" e navegação — 2.59:1 → texto branco fixo, já que o fundo navy do botão não muda por tema), linhas de grade do calendário (1.24:1 → override local a 0.25 de alfa, sem alterar o token `--color-border` global), e notificações de sucesso/erro do sistema (mesmo padrão do "cancelado": overlay translúcido calibrado só para fundo escuro dava 1.6:1/2.42:1 no claro, trocado por tokens `--notify-success-*`/`--notify-error-*` sólidos, ~4.6–6.9:1). Também corrigido bug estrutural separado: eventos do calendário podiam ficar sem o bloco de fundo preenchido na visão mensal por ausência de `eventDisplay="block"` (o padrão do FullCalendar renderiza como "list-item" nessa visão).

## 15/07/2026

Sessão de investigação e diagnóstico via API do n8n e Supabase (leitura), com as correções aplicadas diretamente nas interfaces do n8n/Supabase (fora deste repositório) com base nos diagnósticos — exceto os itens 3, 4 e 6, que envolvem mudanças reais no repositório.

1. **[n8n, sem versionamento neste repo]** Corrigido bug crítico de duplicação de leads: o node "PuxarNumeroLead" no workflow "3- CRM" consultava tabela/campo errados (`leads.phone` em vez de `crm_leads.whatsapp_lead`), fazendo a checagem de "lead já existe" falhar sempre e permitindo criação de leads duplicados a cada nova mensagem recebida. Corrigido para consultar `crm_leads` pelo campo `whatsapp_lead`.
2. **[n8n, sem versionamento neste repo]** Corrigido bug crítico de estouro de contexto — causa raiz de 88% das falhas de execução em produção detectadas (938 execuções com erro, taxa de falha de 64,6%) — nos workflows "1- Follow UP 20min" e "2- Follow UP 24 horas". Causa: o node Agent montava manualmente o prompt serializando `JSON.stringify()` de todo o histórico (via node redundante "Chat Memory Manager"), e essa string gigante era automaticamente regravada como nova mensagem pela memória nativa do próprio Agent (`ai_memory`) a cada execução — um ciclo de auto-inclusão que dobrava de tamanho a cada rodada até estourar os 128k tokens do `gpt-4o-mini`. Corrigido desconectando o "Chat Memory Manager" do fluxo principal e simplificando o campo `text` do Agent para uma instrução direta, deixando o histórico de conversa inteiramente a cargo do mecanismo nativo `ai_memory`. Aproveitada a correção para trocar a persona genérica "Alice/Dra. Juliana Prado" (resíduo do template original) por "Kátia Andrea/CSP Nexora" nos dois workflows.
3. **[`n8n-workflows/export.js`, neste repo]** Novo script para exportar workflows do n8n como JSON versionado neste repositório, cobrindo a lacuna de histórico de mudanças feitas direto na interface do n8n. Antes do primeiro commit, identificadas e corrigidas 2 credenciais reais hardcoded em texto puro nos workflows exportados — token UaZapi e access_token do Chatwoot (workflow "0- Integração UAZAPI com Chatwoot") — movidas para credenciais gerenciadas do n8n.
4. **[Supabase, dado — sem migration]** Tabela `servicos` populada com os 9 serviços reais da CSP Nexora, usando o texto (título + descrição) já existente em `app/servicos/page.tsx` como fonte.
5. **[n8n, sem versionamento neste repo]** Corrigida credencial `gemini_cspnexora`, desatualizada desde a criação em 02/07/2026 (antes da rotação de tokens de 05/07), causando erro 404 no node "2.5 flash" do workflow "2- servicoTool".
6. **[`app/admin/(panel)/agenda/`, `package.json`, neste repo]** Iniciado redesign da agenda do painel admin. A pasta `agenda/`, criada em sessão anterior e nunca commitada, foi commitada como baseline de segurança antes de qualquer alteração. Decidida a substituição da grade semanal feita à mão pela biblioteca FullCalendar (`@fullcalendar/react` + `core` + `daygrid` + `timegrid` + `interaction`), com visões mensal e semanal nativas e drag-and-drop planejado para uma etapa futura. Etapa 1 — novo componente `CalendarioFullCalendar.tsx`, somente leitura, reaproveitando os modais/painel já existentes — implementada, com build validado; `CalendarioSemana.tsx` mantido como backup, ainda não removido.

## 14/07/2026

Sessão com trabalho misto: itens 1, 2 e 4 foram feitos diretamente na interface do n8n (nodes de código dentro dos workflows "6- Eventos Agenda Própria" e "4- Agente IA (agendamento)"), rodando numa instância separada (Easypanel) — sem controle de versão neste repositório, portanto sem arquivo ou commit correspondente, apenas este registro textual. Itens 3 e 5 são mudanças no próprio repositório.

1. **[n8n, sem versionamento neste repo]** Corrigido loop infinito no workflow "6- Eventos Agenda Própria" (branch "Ver Horários"), causado por uma conexão duplicada entre os nodes "HTTP Request" e "Code in JavaScript".
2. **[n8n, sem versionamento neste repo]** Corrigido bug de timezone no node "Code in JavaScript" do mesmo workflow: a geração de datas usava o timezone local do servidor (UTC) em vez de America/Sao_Paulo, causando deslocamento de um dia em horários noturnos. Corrigido com `Intl.DateTimeFormat` explícito.
3. **[`supabase/functions/_shared/slots.ts`, neste repo]** Nova regra de negócio: Reunião de Briefing agora oferece apenas 4 horários fixos por dia (09h, 11h, 15h, 17h), não disponível aos sábados, e bloqueada em feriados nacionais/DF, via nova tabela `feriados` no banco.
4. **[n8n, sem versionamento neste repo]** Limite de sugestão de dias reduzido de 5 para 3 dias úteis por consulta, no mesmo node "Code in JavaScript" do workflow "6" (parâmetro `diasResultado.length`).
5. **[Supabase, neste repo]** Deploy das Edge Functions `agendamentos-horarios`, `agendamentos` e `agendamentos-id` realizado via Supabase CLI.

## 13/07/2026

Sessão focada em concluir a migração da tool "Agendar" da Kátia: Google Calendar → Agenda Própria (trabalho iniciado em 12/07).

### Migração da Agenda Própria concluída
Os dois caminhos que faltavam no workflow n8n "6- Eventos Agenda Própria | CSP Nexora" — **Agendamento** e **Reagendamento** — foram construídos e testados com sucesso, completando os 4 caminhos (junto com Cancelamento e VerHorarios, já concluídos em 12/07).

**Bugs corrigidos durante a construção:**
- Node "SepararDataHora" estava referenciando o campo errado, corrigido.
- Expressões JSON com `"="` duplicado (erro de sintaxe introduzido durante a montagem dos nodes), corrigido.
- Variável `now` faltando no node "proximos_dias", causando falha de execução — adicionada.

**Bug crítico de cálculo de ano (corrigido):** a IA calculava datas relativas ("amanhã", "semana que vem") usando o ano 2024 em vez de 2026. Resolvido implementando correção automática de ano via código nos caminhos VerHorarios, Agendamento e Reagendamento.

**Tools da Kátia migradas:** as 4 tools (`criar_reuniao`, `VerHorarios`, `reagendar_reuniao`, `cancelar_reuniao`) do workflow "4- Agente IA (agendamento) | Template Base" foram atualizadas para apontar para "6- Eventos Agenda Própria" (em vez do antigo "5- Eventos Agenda" no Google Calendar) e testadas.

**Bug identificado, não corrigido:** a busca de lead por telefone falha quando o número está formatado com parênteses/traço (ex: `(61) 98420-2578`). Não bloqueante — leads reais chegam via WhatsApp sem formatação (apenas dígitos). Registrado para referência futura caso o padrão de entrada mude.

### Correções da sessão de teste real via WhatsApp

**Bug corrigido — node "Code in JavaScript" quebrava com data_consulta vazio:** no branch VER HORÁRIOS do workflow "6- Eventos Agenda Própria", o código quebrava com "Cannot read properties of undefined (reading 'split')" quando o lead pedia horários disponíveis sem especificar uma data (ex: "quais horários vocês têm?"), já que `data_consulta` chegava vazio/undefined. Corrigido com lógica de fallback: quando `data_consulta` é vazio, o ponto de partida da busca passa a ser calculado como "agora + 24 horas" (nunca "hoje"/"agora mesmo"), formatado como `YYYY-MM-DD`, deixando a Edge Function `agendamentos-horarios` (que já cruza `agenda_hours` + `agendamentos` reais) encontrar os próximos horários genuinamente livres a partir desse ponto. Quando `data_consulta` vem preenchido, a lógica original de correção de ano é mantida inalterada.

**Bug corrigido — Switch1 sem regra para `conversation_updated`:** no workflow "1- Secretaria IA", o node Switch1 não tinha regra de roteamento para o evento `conversation_updated` do webhook do Chatwoot, causando extração nula de dados (`whatsapp_lead`, conversa e timestamp todos vindo `null`) sempre que esse tipo de evento chegava. Corrigido com nova Routing Rule "ignorar_evento", que descarta esse tipo de webhook antes de processar.

**Configuração adicionada — timeout de 10s nos HTTP Request:** todos os nodes "HTTP Request" do workflow "6- Eventos Agenda Própria" (branches Ver Horários, Agendamento, Reagendamento, Cancelamento) passaram a ter timeout de 10 segundos, evitando que chamadas à Edge Function travem indefinidamente.

**Configuração adicionada — Max Iterations nos agentes de IA:** "Max Iterations: 10" configurado no agente "Katia Andrea" (workflow "1- Secretaria IA") e no agente "Agendar" (workflow "4- Agente IA (agendamento)") — nenhum dos dois tinha esse limite antes, permitindo teoricamente loops ilimitados de chamada de tool.

**Configuração adicionada — timeout de execução do n8n:** `EXECUTIONS_TIMEOUT=120` configurado como variável de ambiente do serviço n8n via Easypanel, evitando que qualquer execução de workflow fique travada indefinidamente.

**Pendência aberta — tools do agendamento podem ainda apontar para o workflow legado:** suspeita de que o node "VerHorarios" (e possivelmente os outros 3: `criar_reuniao`, `reagendar_reuniao`, `cancelar_reuniao`) dentro do workflow "4- Agente IA (agendamento)" ainda esteja apontando para o workflow antigo "5- Eventos Agenda" (Google Calendar, legado) em vez do novo "6- Eventos Agenda Própria" (Supabase, já corrigido acima). Isso explicaria por que a Kátia ainda falha ao consultar horários mesmo após todas as correções desta sessão. A verificar na próxima sessão.

## 12/07/2026

Sessão com trabalho misto: a maior parte foi feita direto no n8n (fora do repositório), mas com mudanças reais de código e migrations documentadas abaixo.

### Investigação de "corrupção de encoding" em emojis — resolvida, não era bug
Suspeita inicial: emoji ☝️ chegando na IA representado como 👍. Investigado e descartado como bug do nosso lado — a causa real é que reações nativas do WhatsApp (tap-and-hold numa mensagem) são sempre representadas pelo UaZapi/Chatwoot como o texto literal "👍 [ reação ]", independente do emoji escolhido de verdade pelo usuário — é um padrão/limitação da integração, não algo corrigível no nosso código. Emojis digitados como texto normal (fora do recurso de reação) são preservados corretamente, confirmado via teste real. A regra adicionada ontem (09/07) no prompt da Kátia sobre reconhecer citações/"Responder" do WhatsApp sem chamar tools já cobre esse padrão adequadamente.

### Auditoria de prompts órfãos nos sub-workflows restantes — concluída, sem contaminação
Workflows "Verificar Lead Existente" e "Registrar Novo Lead" auditados em busca do mesmo tipo de resíduo já visto em credenciais anteriores. Ambos são simples — nó nativo do Supabase (`Get many rows` / `Create a row`), sem nenhum node de IA — logo sem risco de contaminação por prompt de template genérico. Confirmado que ambos apontam corretamente para a tabela `leads`.

### Nova seção "Resumo da Conversa (IA)" no painel de leads
Implementada exibição do resumo de conversa gerado por IA (gravado na tabela `leads` desde 11/07) no `LeadPanel.tsx`:
- Campos exibidos: `resumo_conversa_ia` (corpo principal), `motivo_contato_ia` (rótulo secundário "Motivo do contato:"), badge com tempo relativo de `resumo_atualizado_em` (ex: "Atualizado há 2 horas")
- Tempo relativo calculado por nova função `formatRelativeTime()` em `lib/utils.ts`, usando `Intl.RelativeTimeFormat` nativo — sem adicionar dependência nova (date-fns não estava instalado no projeto)
- Seção posicionada logo abaixo do funil/botões de ação, antes de "Informações do Lead"
- Seção inteira omitida (sem estado vazio) quando `resumo_conversa_ia` é `null` — cobre leads antigos (de antes da correção que passou a gravar o resumo) e leads muito recentes sem conversa completa ainda
- Tipo `Lead` em `types.ts` atualizado com os 3 campos como opcionais/nullable
- Testado visualmente: seção aparece corretamente com dado, some por completo sem dado

### Limpeza de colunas duplicadas em português na tabela `leads`
Migration `supabase/migrations/20260712180958_remove_colunas_duplicadas_leads.sql` remove 6 colunas legadas em português (`nicho`, `cidade`, `origem`, `indicado_por`, `anotacoes`, `estagio`), duplicatas das colunas em inglês já em uso (`niche`, `city`, `source`, `referred_by`, `notes`, `stage`) — resquício de quando o schema do banco ainda não tinha migrations versionadas. Confirmado via grep completo do repositório (incluindo `n8n-workflows/`) que nenhum código lia ou escrevia nessas 6 colunas; `estagio` tinha apenas um `DEFAULT 'identificado'` sem uso funcional. Todas as 6 estavam vazias ou só com valor default — nenhum dado real perdido. Migration aplicada e confirmada no Supabase.

### Revisão de nodes órfãos no n8n — decisões tomadas
- Node "Se1" (o filtro de teste hardcoded corrigido em 08/07) não existe mais no workflow atual — já havia sido removido antes, provavelmente numa sessão não documentada.
- Node "deletar_linha_CRM" identificado como ferramenta administrativa **intencional** (agrupado num sticky note "ADM" junto com "DELETAR HISTORICO"), usado manualmente para resetar dados de teste. Mantido como está, sem conexão no fluxo automático — comportamento correto e esperado, não é bug.

### Workflows duplicados "Ellegance" — esclarecido, sem ação necessária
Confirmado que "Ellegance Clínica Integrada" é material de estudo/referência fornecido pelo professor do curso (não é cliente real da CSP Nexora), usado como modelo de agenda com múltiplos profissionais por especialidade. A duplicata de workflow com o mesmo nome não representa risco — decisão de não mexer.

### Migração da tool "Agendar" da Kátia: Google Calendar → Agenda Própria (em andamento)
Decisão tomada: migrar de vez a tool `Agendar` da Kátia para a Agenda Própria (Supabase), em vez de manter o Google Calendar.

- Duração da Reunião de Briefing definida em 60 minutos (era 30 min no Google Calendar; a Agenda Própria já usa 60 min via trigger no banco desde a implementação original — nenhuma mudança de schema necessária, só ajuste de texto nos prompts das tools quando migradas)
- Campos descartados na migração por serem redundantes ou específicos do template genérico de nutricionista/clínica de origem: `nome_lead`, `tipo_consulta`, `url_chatwoot` — sem coluna correspondente em `agendamentos` e sem sentido no contexto CSP Nexora (reunião única de Briefing)
- Migration `supabase/migrations/20260712185021_habilitar_sabado_agenda.sql`: habilita atendimento aos sábados (09h–14h) em `agenda_hours`, alinhando com o horário que já era oferecido via Google Calendar. Nenhuma mudança de schema necessária — `agenda_hours` já é modelada por dia da semana, `_shared/slots.ts` já é genérico. Aplicada e confirmada no Supabase.
- Endpoints das 3 Edge Functions confirmados e documentados para uso nos nodes HTTP Request do n8n:
  - `POST .../functions/v1/agendamentos` (criar) — body: `lead_id`, `data` (YYYY-MM-DD), `hora` (HH:MM), `assunto` (opcional), `observacoes` (opcional)
  - `PUT`/`DELETE .../functions/v1/agendamentos-id/<uuid>` (reagendar/cancelar) — PUT body: `data`, `hora`
  - `GET .../functions/v1/agendamentos-horarios?data=YYYY-MM-DD` (consultar horários)
  - Autenticação: header `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` nas 3
- Novo workflow n8n criado: **"6- Eventos Agenda Própria | CSP Nexora"**
  - Trigger "When Executed by Another Workflow" com 7 inputs: `whatsapp_lead`, `evento`, `inicio_reuniao`, `final_reuniao`, `assunto`, `id_agendamento`, `data_consulta`
  - Switch roteando por `evento` (`agendamento` / `VerHorarios` / `reagendamento` / `cancelamento`), com Rename Output ativado em cada saída
  - Nova credencial no n8n: Header Auth com `Authorization: Bearer <service_role_key>`, para autenticar contra as Edge Functions
  - Caminho **Cancelamento** (`DELETE /agendamentos-id/<id>`): construído e testado com sucesso (retornou `404 AGENDAMENTO_NAO_ENCONTRADO` com UUID falso, confirmando autenticação e lógica corretas)
  - Caminho **VerHorarios** (`GET /agendamentos-horarios`): construído e testado com sucesso (retornou `slots_disponiveis` reais para data de teste). Nota para referência futura: a regra do Switch para "VerHorarios" teve um bug de caractere invisível (provavelmente colado de outro lugar), que exigiu apagar e redigitar manualmente o valor de comparação — vale lembrar disso se "Switch não roteia mesmo com valores aparentemente iguais" aparecer de novo em outros nodes
  - Caminhos **Agendamento** e **Reagendamento**: ainda não construídos — ambos vão precisar de um passo extra de buscar `lead_id` na tabela `leads` via `whatsapp_lead` antes de chamar a Edge Function (mesmo padrão já usado no workflow "3- CRM")
- Pendente após completar os 4 caminhos: atualizar as 4 tools (`criar_reuniao`, `VerHorarios`, `reagendar_reuniao`, `cancelar_reuniao`) dentro do workflow "4- Agente IA (agendamento) | Template Base" para apontar para "6- Eventos Agenda Própria" em vez do atual "5- Eventos Agenda" (Google Calendar); ajustar textos de duração (30→60 min); testar fluxo completo via WhatsApp; só depois decidir o que fazer com o Google Calendar (manter como fallback ou desativar)

### Pendências atualizadas
- 🔴 Alta: revogar/regenerar as chaves do Supabase expostas (Service Role legada + Secret Key nova) — **ainda pendente, adiada novamente hoje**. A Secret Key nova já foi usada hoje para criar a credencial Header Auth do node "6- Eventos Agenda Própria" no n8n — quando for rotacionada, atualizar em pelo menos 4 lugares: `.env.local`, Vercel, secrets das Edge Functions no Supabase, e essa credencial no n8n
- 🟡 Média: resíduo de debug em `supabase/functions/_shared/auth.ts` (linhas ~22-24) — `console.log` imprimindo o tamanho (não o valor) do token recebido vs. a service role key, esquecido de uma sessão anterior de diagnóstico do erro `TOKEN_INVALIDO`. Não expõe a chave, mas é código de debug esquecido em produção — limpar quando houver tempo
- ⏸️ Pausado: popular a tabela `servicos` — aguardando manual de marca da CSP Nexora, sendo produzido em outra ferramenta (ChatGPT)
- ⏳ Em andamento: completar a migração da Agenda Própria (ver seção acima) — caminhos Agendamento e Reagendamento ainda pendentes
- ⏳ Novo, identificado hoje: redesign completo do painel admin com tema claro/escuro alternável (toggle) — motivado por desconforto do Cladston com tema escuro por longos períodos (acessibilidade visual). Ainda não iniciado — planejado para depois da migração da Agenda estar completa

## 09/07/2026

Sessão iniciada em 08/07/2026, estendida até a madrugada de 09/07/2026.

### Parte 1 — Ajustes na Kátia Andrea (testes reais de atendimento)

**Bug crítico corrigido: perda de contexto após saudações**
Mesmo após o reforço inicial no prompt (08/07), testes reais mostraram que a IA continuava reiniciando o atendimento ("Como posso ajudar você hoje?") ao receber saudações simples ("Oi", "Boa tarde") no meio de conversas com agendamento pendente. Resolvido com reforço adicional no prompt (`prompt-katia-andrea-csp-nexora.md`): regra ultra-explícita logo no topo do documento (antes da seção Identidade) proibindo a frase padrão de reinício, mais um exemplo prático (few-shot) na seção Retomada de Contexto mostrando o comportamento correto vs. incorreto. Confirmado funcionando em teste real após a correção.

**Suporte a mensagens "Responder/citar" do WhatsApp**
A IA não reconhecia quando o cliente usava a função nativa do WhatsApp de citar/responder uma mensagem específica (ex: responder a uma oferta de horário com "Esse fica melhor pra mim"). Implementada nova lógica no workflow n8n ("1- Secretaria IA | Base de modelo"):
- Node "Se2" detecta a presença de `content_attributes.in_reply_to` no payload do webhook do Chatwoot
- Se existir, uma chamada HTTP à API do Chatwoot busca o texto da mensagem original citada
- Node "Editar campos1" combina citação + resposta do cliente num texto único e claro antes de repassar à IA

Testado e confirmado funcionando — a Kátia reconheceu corretamente a data citada em teste real.

**Correção de credencial do Chatwoot no n8n**
Durante a implementação acima, foi descoberta e corrigida uma segunda credencial (`chatwoot_cspnexora`) com o mesmo padrão de bug da credencial OpenAI dos dias anteriores: valor placeholder vazio (`__n8n_BLANK_VALUE_...`) em vez do token real.

### Parte 2 — Início da Agenda Própria (substituindo Google Calendar)

Decisão de produto: construir uma agenda própria (Supabase + Edge Functions) para a reunião de Briefing, reaproveitando a arquitetura de um sistema já existente em outro projeto (Clínica de Estética). Definições:
- 1 agenda única (não múltiplos profissionais, ao contrário do sistema original)
- Sem tabela de tokens própria — autenticação via a mesma chave de serviço já usada no resto do projeto
- Sem gatilho automático ligando `agendamentos.status` à conversão Lead→Cliente (processos independentes no funil do CSP Nexora)

**Implementado:**
- Migration SQL (`supabase/migrations/20260708150000_agenda_schema.sql`): tabelas `agenda_hours` (grade semanal, seg-sex 09h-18h) e `agendamentos` (referenciando `leads.id` existente, soft delete para cancelamento)
- 3 Edge Functions deployadas manualmente via dashboard do Supabase (`supabase/functions/`): `agendamentos` (criar), `agendamentos-id` (reagendar/cancelar), `agendamentos-horarios` (disponibilidade)
- Lógica de slots (geração de horários livres, detecção de conflito) adaptada do sistema original, sem o conceito de múltiplas agendas
- Bug de timezone corrigido durante a implementação: cálculo de "agora" em São Paulo estava ~3h defasado, o que permitiria agendar em horários já passados

**Resolvido durante os testes:**
- Erro de token (`TOKEN_INVALIDO`): as chaves "Legacy service_role" (formato JWT longo) e a nova "secret" do Supabase (formato `sb_secret_...`, mais curto) não são a mesma coisa — o projeto está usando o sistema novo internamente, então as Edge Functions precisam da chave "secret" nova, não a legada
- `GET /agendamentos-horarios` confirmado funcionando (retorna slots corretamente)

**Nota técnica — repositório desatualizado em relação à produção:** ao aplicar a migration manualmente, o cálculo de `data_hora_fim` como coluna `GENERATED ALWAYS AS (data_hora_inicio + interval '60 minutes') STORED` (como está hoje em `supabase/migrations/20260708150000_agenda_schema.sql`) esbarrou numa limitação do Postgres — a operação `timestamptz + interval` não é `IMMUTABLE`, exigência para colunas geradas — e foi contornado com um trigger direto no banco. O arquivo de migration versionado no repositório ainda **não reflete** essa mudança; reaplicá-lo do zero reproduziria o mesmo erro. Atualizar o arquivo é pendência para uma próxima sessão.

**Pendente para o próximo dia:**
- Investigar por que os testes POST (criar agendamento) estão retornando "Método não permitido. Use GET." — suspeita forte de que o conteúdo de `index.ts` da function `agendamentos` foi colado incorretamente com o código de `agendamentos-horarios` durante o deploy manual
- Rodar o roteiro de testes completo (`supabase/functions/tests.sh`) após a correção
- Planejar a ligação futura entre a Kátia/n8n e a nova agenda — **ainda não conectado**, o Google Calendar continua em uso normal pela tool `Agendar` atual

**⚠️ Segurança — ação pendente:** revogar e regenerar duas chaves expostas acidentalmente durante debug em chat: a Service Role Key legada e a Secret Key nova do Supabase.

### Parte 3 — Agenda Própria: correções finais e testes completos

**Migration sincronizada com produção**
Corrigido `supabase/migrations/20260708150000_agenda_schema.sql`: a coluna `data_hora_fim`, que originalmente usava `GENERATED ALWAYS AS (...) STORED` (rejeitada pelo Postgres por não ser `IMMUTABLE`), foi alterada para coluna `TIMESTAMPTZ` normal, calculada por um trigger (`calcular_data_hora_fim` + `trg_calcular_data_hora_fim`), igual ao que já estava funcionando em produção desde ontem. Arquivo do repositório agora reflete fielmente o que está deployado.

**Bug do POST corrigido**
A Edge Function `agendamentos` (criar agendamento) estava com o conteúdo errado colado durante o deploy manual de ontem — continha a lógica da function `agendamentos-horarios` (só aceitava `GET`), causando "Método não permitido" em todos os testes de criação. Corrigido recolando o conteúdo correto do arquivo local `supabase/functions/agendamentos/index.ts` (ajustando os imports de `'../_shared/'` para `'./_shared/'`, necessário no editor via navegador do Supabase).

**Testes completos — 100% aprovados**
Rodado o roteiro completo `supabase/functions/tests.sh` contra as 3 Edge Functions em produção. Todos os cenários passaram: consulta de horários disponíveis, criação de agendamento, detecção de conflito de horário (com sugestões), bloqueio de dia fechado, bloqueio de data passada, reagendamento (liberando o horário antigo), cancelamento via soft delete (liberando o horário), bloqueio de cancelar/reagendar duas vezes, validações de campos obrigatórios, lead inexistente, formato inválido, e bloqueio de requisição sem autenticação (tratado pela própria plataforma Supabase antes mesmo de chegar no código).

**Pendência menor identificada (não bloqueante)**
Um teste de criação de agendamento salvou o campo `assunto` com um caractere acentuado ("Reunião") aparecendo corrompido no output do terminal Git Bash do Windows. Suspeita de ser apenas um problema de exibição do terminal (encoding), não corrupção real dos dados salvos. Verificação pendente: conferir diretamente no Table Editor do Supabase se o valor está armazenado corretamente.

**Status da Agenda Própria**
API 100% funcional e testada, mas ainda **isolada** — não conectada à Kátia/n8n. A tool `Agendar` continua usando Google Calendar normalmente. Próxima decisão (pendente para a próxima sessão): conectar a nova API à Kátia primeiro, ou ajustar o painel admin (visualização de agendamentos) antes.

**Segurança — ação ainda pendente**
Reforçando pendência dos dias anteriores: duas chaves do Supabase (Service Role Key legada e Secret Key nova) foram expostas acidentalmente durante debug no chat e ainda precisam ser revogadas/regeneradas.

## 08/07/2026

Sessão de trabalho fora do repositório de código (n8n, Chatwoot, Supabase) — documentada aqui para contexto futuro.

### Automação WhatsApp — Secretaria IA "Kátia Andrea" (n8n)
- Workflow duplicado a partir do template do curso ("1- Secretaria IA | Template Base")
- Prompt completo do agente escrito e documentado em arquivo separado (`prompt-katia-andrea-csp-nexora.md`), com 9 seções: Identidade, Função, Tom de Voz, Fluxo de Atendimento (state machine com 10 estados), Regras de Atendimento, Memória e Contexto, Raciocínio Operacional, Tools Disponíveis, Data e Hora
- Duas novas tools criadas como sub-workflows n8n, usando o nó Supabase nativo:
  - "Verificar Lead Existente" — consulta a tabela `leads` pelo campo `phone`
  - "Registrar Novo Lead" — insere novo lead (`contact_name`, `company_name`, `niche`, `phone`, `maior_desafio`, `porte`, `stage='identificado'`)
- Nova coluna `leads.porte` (TEXT) adicionada ao banco Supabase para suportar a nova tool
- Tools conectadas ao agente principal no n8n como "Call n8n Workflow Tool", seguindo o mesmo padrão de "servicoTool" e "Agendar" já existentes

### Bugs corrigidos durante os testes
- Chatwoot: atribuição automática de conversas estava ativada na caixa de entrada "cspnexora", fazendo com que toda conversa nova fosse atribuída a um humano e a IA nunca respondesse. Desativada em Configurações > Agentes > Atribuição de conversa
- n8n (nó "If1"): a condição que filtra por número de telefone usava o campo `sender.identifier` (formato `556184202578@s.whatsapp.net`, sem o 9º dígito), mas o valor fixo configurado tinha o 9º dígito, causando falha silenciosa no match e nenhuma resposta. Corrigido o valor de comparação para bater com o formato real sem o 9

### Correção crítica: Kátia Andrea (WhatsApp AI) finalmente respondendo

**Problema identificado**
A automação WhatsApp "Kátia Andrea" (via n8n) não estava respondendo mensagens reais, apresentando erro "Insufficient quota" ao testar.

**Causa raiz #1 — Credencial OpenAI vazia**
A credencial `openAI_cspnexora` usada no node do modelo (gpt-4.1-mini) estava salva com um valor placeholder interno do n8n (`__n8n_BLANK_VALUE_...`) em vez da chave de API real — provavelmente resultado de uma exportação/importação de workflow ou duplicação de credencial sem preencher o valor.

**Correção #1**
- Revogada a chave antiga na OpenAI Platform
- Gerada nova chave `agente_cspnexora_v2` (Default project, permissões: All)
- Chave nova colada corretamente no campo de credencial do node no n8n
- Conexão testada com sucesso

**Causa raiz #2 — Filtro de teste esquecido no fluxo**
O node "Se1" (dentro do workflow "1- Secretaria IA | Base de modelo"), posicionado entre o Webhook3 e o Interruptor1, continha uma condição hardcoded comparando o identificador do remetente da mensagem com um número de telefone específico (número de teste pessoal do fundador). Qualquer mensagem vinda de outro número caía no "ramo falso" (sem conexão), interrompendo o fluxo silenciosamente antes de chegar ao Interruptor1 e, consequentemente, nunca alcançando o node da IA (Kátia Andrea).

**Correção #2**
- Node "Se1" desconectado do fluxo principal (mantido no canvas, mas sem conexão, para referência futura — pode ser deletado com segurança)
- Webhook3 conectado diretamente ao Interruptor1
- Workflow publicado (estava em "Publicado" antigo, precisou nova publicação para ativar as mudanças)

**Resultado**
- Teste real no WhatsApp: Kátia Andrea respondendo mensagens de clientes com sucesso.

**Pendências relacionadas**
- Deletar formalmente o node "Se1" do canvas quando houver confiança/tempo para isso
- Revisar se existem outros filtros de teste similares esquecidos em outras partes do workflow (ex: dentro do Switch3 ou outros nodes de roteamento)

## 07/07/2026

### SEO / Indexação
- Propriedade `cspnexora.com.br` verificada no Google Search Console (arquivo HTML em `public/`)
- Sitemap enviado ao Search Console
- Indexação da home solicitada manualmente
- Site ainda não indexado no Google — aguardando processamento, sem bloqueios técnicos identificados

### Home
- Headline e subheadline do Hero reescritos com novo ângulo, focado na dor do cliente (retrabalho, processos manuais, informações espalhadas)
- Destaque em gradiente ciano/roxo aplicado ao trecho-chave do novo headline
- Badge do Hero trocado: "Automação Inteligente de Próxima Geração" → "Ecossistemas Inteligentes para Administradoras"
- Os 4 "trust indicators" do Hero trocados de marcas terceiras (OpenAI, Stripe, Vercel, Notion) para termos do próprio negócio (Processos Automatizados, Sistemas Integrados, Atendimento Inteligente, Operação Escalável)
- Nova seção "Você enfrenta algum destes problemas?" com 8 itens em formato checkbox, inserida logo após o Hero
- Nova seção "Especialistas em Administradoras de Condomínios e Imobiliárias", inserida antes da seção Jornada/Processo
- Seção "Nossa Missão" (`About.tsx`): novo título e parágrafos
- 4 cards de serviço na home (Automação com IA, Agentes Inteligentes, Integração de Sistemas, Automação de WhatsApp) com novas descrições
- Seção "Jornada" (4 etapas numeradas): novas descrições para cada etapa
- Seção "Resultados" (`Impact.tsx`): expandida de 4 para 5 itens; cards passam a mostrar frase única (sem mais separação número grande + legenda pequena); 5º item ocupa a largura total da linha
- CTA final: novo título e subtítulo
- Rodapé (`Footer.tsx`): novo texto institucional abaixo da logo

### Página de Serviços (`/servicos`)
- 8 serviços reordenados: Atendimento, IA Atendimento, Chatbot, WhatsApp, Gestão, Integração, Dashboard, Automação
- "Agentes Inteligentes" mantido como 9º item extra, fora da ordem especificada
- Serviços "Atendimento", "Gestão" e "Dashboard" criados do zero (não existiam antes)
- "Automação com IA" renomeado para "Automação"

### Seção Diferenciais
- 8 cards com descrição curta adicionada abaixo de cada título, mantendo ícone e estrutura de card existente

### Formulário de Diagnóstico
- Subtítulo reescrito para não prometer diagnóstico já na primeira ligação
- Nova seção "Como funciona" com 3 passos: Diagnóstico da Operação, Apresentação da Solução, Proposta Personalizada
- Texto do popup de confirmação de envio atualizado
- Botão de envio trocado: "Fale com especialista" → "Receba um diagnóstico gratuito"
- Campo "Nicho" reduzido para 3 opções: Administradora de Condomínios, Imobiliária - Adm de Imóveis, Outros
- Novo campo opcional "Qual é o maior desafio da sua empresa hoje?" (textarea), salvo na coluna `leads.maior_desafio`

### Pendências / Próximos passos
- ⚠️ Alinhamento horizontal dos 4 "trust indicators" do Hero ainda não resolvido — `justify-between` + `w-full` aplicados no container, mas os itens continuam visualmente alinhados à esquerda. Requer investigação mais profunda em runtime (DevTools) na árvore de flex/grid de `components/Hero.tsx`
