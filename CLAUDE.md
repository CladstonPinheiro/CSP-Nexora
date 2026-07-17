# CSP Nexora — Contexto do Projeto

## Stack
Next.js 15 + TypeScript + Supabase + Gemini 2.5 Flash + Vercel

## Repositório
C:\Users\clads\projetos\CSP-Nexora

## Site
https://cspnexora.com.br

## Supabase
Região: São Paulo

## Estado atual (atualizado em 16/07/2026)

### Arquitetura de tema claro/escuro do painel admin (16/07/2026)
O painel admin (`app/admin/(panel)/...`) tem tema claro/escuro via `next-themes` (`attribute="class"`, toggle no rodapé da `AdminSidebar`). Toda cor de UI usa tokens semânticos centralizados em `app/globals.css`, nunca hex/opacidade hardcoded: `--color-page`, `--color-surface`, `--color-inset`, `--color-border`, `--color-border-strong`, `--color-primary`, `--color-secondary`, `--color-muted`, `--color-brand-navy`, `--color-brand-orange`. **Qualquer tela nova do admin deve usar esses tokens** (ex: `bg-surface`, `text-primary`, `border-border`) em vez de cores fixas — caso contrário a tela fica com aparência incorreta ou ilegível quando o usuário troca de tema (já aconteceu 2x nesta sessão: eventos do calendário e notificações de sucesso/erro usavam cor fixa pensada só para fundo escuro, e ficaram com contraste ~1.6:1 no tema claro). O site público (`/`, `/servicos`, `/oferta`, etc.) não usa esse sistema — continua com cores fixas próprias, sem tema alternável.

### Regra de horários da Reunião de Briefing — divergente do expediente geral (14/07/2026)
Decisão tomada: Reunião de Briefing usa uma janela de horários própria, mais restrita que o expediente comercial geral — divergência proposital, não inconsistência.

- `agenda_hours` continua representando o expediente comercial geral da CSP Nexora, incluindo sábado (09h–14h, decisão de 12/07 mantida e correta) — tabela não foi alterada nesta sessão.
- `_shared/slots.ts` agora aplica uma regra própria para Briefing, independente do que `agenda_hours` permitir: apenas 4 horários fixos por dia (`09:00`, `11:00`, `15:00`, `17:00`) e nenhum agendamento aos sábados (checagem `dia === 'sabado'` retorna `AGENDA_FECHADA` antes até de consultar `agenda_hours`).
- Essa mesma função passou a checar também a nova tabela `feriados` (criada em 14/07/2026, colunas `data` PK + `descricao`): qualquer data cadastrada lá bloqueia totalmente a agenda de Briefing (`AGENDA_FECHADA`). Populada atualmente com os feriados nacionais + DF de 2026.
- ⚠️ Lembrete: `feriados` precisa de atualização manual todo ano (dezembro/janeiro) — datas móveis como Carnaval e Corpus Christi mudam de ano para ano.
- Deploy das 3 Edge Functions (`agendamentos-horarios`, `agendamentos`, `agendamentos-id`) feito via `npx supabase functions deploy --project-ref visjhadwewvxnqwekpdk`, autenticado com `SUPABASE_ACCESS_TOKEN` (Personal Access Token pessoal, salvo no `.env.local`). Confirmado com testes de fumaça em produção.

### Pendências gerais (atualizado em 15/07/2026)
- 🔴 Alta — chaves do Supabase expostas ainda não revogadas/regeneradas (Service Role legada + Secret Key nova). Adiado novamente hoje. A Secret Key nova já está em uso na credencial Header Auth do n8n (node "6- Eventos Agenda Própria"), criada hoje — ao rotacionar, atualizar em pelo menos 4 lugares: `.env.local`, Vercel, secrets das Edge Functions no Supabase, e essa credencial no n8n.
- 🔴 Alta — 2 credenciais reais distintas das acima (token UaZapi e access_token do Chatwoot) estiveram hardcoded em texto puro nos workflows n8n exportados em `n8n-workflows/` (achado em 15/07/2026). Já foram corrigidas na origem — movidas para credenciais gerenciadas do n8n antes do primeiro commit — mas os valores antigos chegaram a ficar em texto puro; rotacionar/regenerar essas 2 chaves por segurança, mesmo com a correção já aplicada.
- 🟡 Média — resíduo de debug em `supabase/functions/_shared/auth.ts` (linhas ~22-24): `console.log` do tamanho do token recebido vs. da service role key, esquecido de uma sessão anterior de diagnóstico do erro `TOKEN_INVALIDO`. Não expõe o valor da chave, mas é código de debug esquecido em produção — limpar quando houver tempo.
- 🟡 Média — mesmo após a correção do bug de estouro de contexto do Follow-up (15/07/2026, ver CHANGELOG), os 2 leads já afetados antes da correção (telefones `5561985543774` e `5561984202578`) continuam com histórico poluído na tabela `n8n_chat_histories` (mensagens de até ~150 mil caracteres cada). O bug parou de crescer daqui para frente, mas o lixo já gravado nessas 2 sessões específicas não foi limpo — considerar deletar/truncar essas linhas manualmente.
- ✅ Concluído (15/07/2026) — tabela `servicos` populada com os 9 serviços reais da CSP Nexora, extraídos de `app/servicos/page.tsx` (conteúdo provisório; pode ser refinado depois quando o manual de marca da CSP Nexora ficar pronto).
- ✅ Concluído (15/07/2026) — persona genérica "Alice/Dra. Juliana Prado" (resíduo do template original de nutricionista) removida dos workflows "1- Follow UP 20min" e "2- Follow UP 24 horas", substituída por "Kátia Andrea/CSP Nexora".
- ⏳ Em andamento — migração da tool `Agendar` da Kátia de Google Calendar para a Agenda Própria (ver seção abaixo).
- ⏳ Em andamento (15/07/2026) — redesign da agenda do painel admin: substituição da grade semanal feita à mão pela biblioteca FullCalendar. Etapa 1 (visualização read-only) implementada; drag-and-drop e criação/edição direto no calendário ainda pendentes.
- ⏳ Novo — redesign completo do painel admin com tema claro/escuro alternável (toggle), motivado por desconforto do Cladston com tema escuro por longos períodos (acessibilidade visual). Ainda não iniciado; planejado para depois da migração da Agenda estar completa.

### Migração da tool "Agendar" da Kátia: Google Calendar → Agenda Própria — em andamento (12/07/2026)
Decisão tomada: migrar de vez para a Agenda Própria (Supabase), em vez de manter o Google Calendar.

- Duração da Reunião de Briefing definida em 60 minutos (era 30 min no Google Calendar; a Agenda Própria já usa 60 min via trigger no banco desde a implementação original — sem mudança de schema, só ajuste de texto nos prompts das tools quando migradas).
- Campos descartados por serem redundantes ou específicos do template genérico de nutricionista/clínica de origem: `nome_lead`, `tipo_consulta`, `url_chatwoot` — sem coluna correspondente em `agendamentos` e sem sentido no contexto CSP Nexora (reunião única de Briefing).
- Migration `supabase/migrations/20260712185021_habilitar_sabado_agenda.sql`: habilita atendimento aos sábados (09h–14h) em `agenda_hours`, alinhando com o horário já oferecido via Google Calendar. Sem mudança de schema — `agenda_hours` já é modelada por dia da semana, `_shared/slots.ts` já é genérico. Aplicada e confirmada no Supabase.
- Endpoints das 3 Edge Functions confirmados para uso nos nodes HTTP Request do n8n — base `https://visjhadwewvxnqwekpdk.supabase.co/functions/v1/`:
  - `POST /agendamentos` (criar) — body: `lead_id`, `data` (YYYY-MM-DD), `hora` (HH:MM), `assunto` (opcional), `observacoes` (opcional)
  - `PUT`/`DELETE /agendamentos-id/<uuid>` (reagendar/cancelar) — PUT body: `data`, `hora`
  - `GET /agendamentos-horarios?data=YYYY-MM-DD` (consultar horários)
  - Autenticação nas 3: header `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
- Novo workflow n8n: **"6- Eventos Agenda Própria | CSP Nexora"** — trigger "When Executed by Another Workflow" (7 inputs: `whatsapp_lead`, `evento`, `inicio_reuniao`, `final_reuniao`, `assunto`, `id_agendamento`, `data_consulta`), Switch por `evento` (`agendamento` / `VerHorarios` / `reagendamento` / `cancelamento`), nova credencial Header Auth no n8n com a Secret Key.
  - ✅ Caminhos **Cancelamento** e **VerHorarios**: construídos e testados com sucesso.
  - ⏳ Caminhos **Agendamento** e **Reagendamento**: ainda não construídos — vão precisar de um passo extra de buscar `lead_id` na tabela `leads` via `whatsapp_lead` antes de chamar a Edge Function (mesmo padrão do workflow "3- CRM").
- Depois de completar os 4 caminhos: atualizar as 4 tools (`criar_reuniao`, `VerHorarios`, `reagendar_reuniao`, `cancelar_reuniao`) do workflow "4- Agente IA (agendamento) | Template Base" para apontar para "6- Eventos Agenda Própria" em vez de "5- Eventos Agenda" (Google Calendar); ajustar textos de duração (30→60 min); testar fluxo completo via WhatsApp; só depois decidir o destino do Google Calendar (fallback ou desativar).

### LeadPanel — nova seção "Resumo da Conversa (IA)" (12/07/2026)
Exibe `resumo_conversa_ia`, `motivo_contato_ia` e um badge de tempo relativo de `resumo_atualizado_em` (via nova `formatRelativeTime()` em `lib/utils.ts`, usando `Intl.RelativeTimeFormat` nativo — date-fns não está instalado no projeto e não foi adicionado). Posicionada logo abaixo do funil/botões de ação, antes de "Informações do Lead". Seção omitida por completo (sem estado vazio) quando `resumo_conversa_ia` é `null`. Tipo `Lead` em `types.ts` atualizado com os 3 campos opcionais/nullable. Testado visualmente.

### Limpeza de colunas duplicadas em `leads` (12/07/2026)
Migration `supabase/migrations/20260712180958_remove_colunas_duplicadas_leads.sql` removeu `nicho`, `cidade`, `origem`, `indicado_por`, `anotacoes`, `estagio` — duplicatas em português das colunas em inglês já em uso (`niche`, `city`, `source`, `referred_by`, `notes`, `stage`), resquício de antes do schema ter migrations versionadas. Confirmado via grep completo (repo + n8n) que nada lia/escrevia nelas. Aplicada e confirmada no Supabase.

### Investigação de emojis/reações do WhatsApp — resolvida, não era bug (12/07/2026)
Reações nativas do WhatsApp (tap-and-hold) são sempre representadas pelo UaZapi/Chatwoot como o texto literal "👍 [ reação ]", independente do emoji real escolhido — limitação da integração, não bug nosso. Emojis digitados como texto normal são preservados corretamente. A regra de 09/07 sobre citações/"Responder" no prompt da Kátia já cobre esse padrão.

### Auditoria de sub-workflows e nodes órfãos no n8n (12/07/2026)
- "Verificar Lead Existente" e "Registrar Novo Lead" auditados: sem node de IA, sem risco de prompt de template genérico contaminado, apontam corretamente para `leads`.
- Node "Se1" não existe mais no workflow (removido em sessão não documentada).
- Node "deletar_linha_CRM" é ferramenta administrativa intencional (reset manual de dados de teste), mantida sem conexão no fluxo automático — comportamento esperado.
- Workflows duplicados "Ellegance Clínica Integrada": material de estudo do curso, não é cliente real — sem risco, decisão de não mexer.

### ⚠️ Ação de segurança pendente (09/07/2026)
Duas chaves do Supabase foram expostas acidentalmente durante debug em chat: a **Service Role Key legada** e a **Secret Key nova** (`sb_secret_...`). Ambas precisam ser **revogadas e regeneradas** no dashboard do Supabase o quanto antes. Depois de regenerar, atualizar a chave usada pelas Edge Functions de agendamento (ver seção abaixo) e qualquer outro lugar que dependa dela (`lib/supabase.ts` / `createAdminClient` usa a Service Role Key legada).

### Kátia Andrea — refinamentos pós-teste real (09/07/2026)
- **Perda de contexto após saudações (corrigido):** mesmo após o reforço de 08/07, a IA ainda reiniciava o atendimento ("Como posso ajudar você hoje?") ao receber "Oi"/"Boa tarde" no meio de conversas com agendamento pendente. Reforço adicional no prompt (`prompt-katia-andrea-csp-nexora.md`): regra ultra-explícita no topo do documento (antes de "Identidade") + exemplo few-shot em "Retomada de Contexto". Confirmado funcionando em teste real.
- **Suporte a "Responder/citar" do WhatsApp (implementado):** novo node "Se2" no workflow n8n detecta `content_attributes.in_reply_to` no payload do Chatwoot, busca via HTTP o texto da mensagem citada, e o node "Editar campos1" combina citação + resposta antes de repassar à IA. Testado e funcionando.
- **Credencial `chatwoot_cspnexora` corrigida:** mesmo padrão de bug da credencial OpenAI (valor placeholder `__n8n_BLANK_VALUE_...` em vez do token real).

### Agenda própria (Supabase) — API pronta e testada, ainda isolada (09/07/2026)
Decisão de produto: construir uma agenda própria (Supabase + Edge Functions) para a reunião de Briefing, reaproveitando a arquitetura de um sistema já existente noutro projeto (Clínica de Estética), simplificada para 1 agenda única, sem tabela de tokens própria e sem gatilho automático ligando agendamento à conversão Lead→Cliente.

- Migration em `supabase/migrations/20260708150000_agenda_schema.sql` (tabelas `agenda_hours` e `agendamentos`, referenciando `leads.id`) e 3 Edge Functions em `supabase/functions/` (`agendamentos`, `agendamentos-id`, `agendamentos-horarios`) deployadas manualmente via dashboard. `data_hora_fim` é calculado por trigger (`calcular_data_hora_fim`, BEFORE INSERT/UPDATE), não por coluna `GENERATED` — o Postgres rejeita `timestamptz + interval` como expressão `IMMUTABLE`.
- ✅ **Roteiro completo de testes (`supabase/functions/tests.sh`) rodado contra as 3 Edge Functions em produção — 100% aprovado**: consulta de horários, criação, conflito de horário com sugestões, dia fechado, data passada, reagendamento, cancelamento (soft delete) com liberação do horário, bloqueios de estado inválido, validações de campo, e bloqueio sem autenticação.
- Pendência menor, não bloqueante: confirmar no Table Editor do Supabase se o campo `assunto` com acento (ex: "Reunião") foi salvo corretamente — suspeita de que a exibição corrompida foi só do terminal Git Bash do Windows, não do dado em si.
- **Ainda não conectado à Kátia/n8n** — a tool `Agendar` atual continua usando Google Calendar normalmente. Próxima decisão: conectar a API à Kátia primeiro, ou ajustar o painel admin (visualização de agendamentos) antes.

### ✅ Kátia Andrea respondendo no WhatsApp (08/07/2026)
Automação validada com teste real no WhatsApp após corrigir duas causas raiz (ver seção abaixo). Pendência anterior de "Insufficient quota" **resolvida**.

### Automação WhatsApp — Secretaria IA "Kátia Andrea" (n8n) (08/07/2026)
Sessão de trabalho fora do repositório de código (n8n, Chatwoot, Supabase) — documentada aqui para contexto futuro.

- Workflow duplicado a partir do template do curso ("1- Secretaria IA | Template Base")
- Prompt completo do agente escrito e documentado em arquivo separado (`prompt-katia-andrea-csp-nexora.md`), com 9 seções: Identidade, Função, Tom de Voz, Fluxo de Atendimento (state machine com 10 estados), Regras de Atendimento, Memória e Contexto, Raciocínio Operacional, Tools Disponíveis, Data e Hora
- Duas novas tools criadas como sub-workflows n8n, usando o nó Supabase nativo:
  - "Verificar Lead Existente" — consulta a tabela `leads` pelo campo `phone`
  - "Registrar Novo Lead" — insere novo lead (`contact_name`, `company_name`, `niche`, `phone`, `maior_desafio`, `porte`, `stage='identificado'`)
- Nova coluna `leads.porte` (TEXT) adicionada ao banco para suportar a nova tool
- Tools conectadas ao agente principal no n8n como "Call n8n Workflow Tool", seguindo o mesmo padrão de "servicoTool" e "Agendar" já existentes

**Bugs corrigidos durante os testes:**
- Chatwoot: atribuição automática de conversas estava ativada na caixa de entrada "cspnexora", fazendo com que toda conversa nova fosse atribuída a um humano e a IA nunca respondesse. Desativada em Configurações > Agentes > Atribuição de conversa
- n8n (nó "If1"): a condição que filtra por número de telefone usava o campo `sender.identifier` (formato `556184202578@s.whatsapp.net`, sem o 9º dígito), mas o valor fixo configurado tinha o 9º dígito, causando falha silenciosa no match e nenhuma resposta. Corrigido o valor de comparação para bater com o formato real sem o 9

**Correção crítica — Kátia Andrea finalmente respondendo:**
- Causa raiz #1: credencial `openAI_cspnexora` do node do modelo (gpt-4.1-mini) estava salva com valor placeholder interno do n8n (`__n8n_BLANK_VALUE_...`) em vez da chave de API real. Corrigido: chave antiga revogada na OpenAI Platform, nova chave `agente_cspnexora_v2` gerada e colada no node
- Causa raiz #2: node "Se1" (entre Webhook3 e Interruptor1, no workflow "1- Secretaria IA | Base de modelo") continha filtro hardcoded comparando o remetente com um número de teste pessoal do fundador — qualquer outro número caía no ramo falso sem conexão, interrompendo o fluxo antes de chegar à IA. Corrigido: "Se1" desconectado do fluxo principal (mantido no canvas sem conexão), Webhook3 conectado direto ao Interruptor1, workflow republicado
- Resultado: teste real no WhatsApp confirmado, Kátia Andrea respondendo mensagens de clientes
- Pendências: deletar formalmente o node "Se1" quando houver tempo; revisar se há outros filtros de teste esquecidos em outros nodes de roteamento (ex: Switch3)

### SEO / Indexação (07/07/2026)
- Propriedade cspnexora.com.br verificada no Google Search Console (método: arquivo HTML em `public/`)
- Sitemap enviado
- Indexação da home solicitada manualmente
- Site ainda não indexado no Google — aguardando processamento, sem bloqueios técnicos identificados

### Ajustes de conteúdo — Home, Serviços, Diferenciais, Diagnóstico (07/07/2026)
- Headline e subheadline do Hero reescritos com novo ângulo (dor do cliente: retrabalho, processos manuais, informações espalhadas), com destaque em gradiente ciano/roxo no trecho-chave
- Badge do Hero e os 4 "trust indicators" trocados de nomes de marcas terceiras (OpenAI/Stripe/Vercel/Notion) para termos do próprio negócio (Processos Automatizados, Sistemas Integrados, Atendimento Inteligente, Operação Escalável)
- Nova seção "Você enfrenta algum destes problemas?" (8 itens com checkbox) inserida logo após o Hero
- Nova seção "Especialistas em Administradoras de Condomínios e Imobiliárias" inserida antes da seção Jornada/Processo
- Seção "Nossa Missão" (`About.tsx`) com novo título e parágrafos
- 4 cards de serviço na home (Automação com IA, Agentes Inteligentes, Integração de Sistemas, Automação de WhatsApp) com novas descrições
- Seção "Jornada" (4 etapas) com novas descrições
- Seção "Resultados" (`Impact.tsx`) expandida de 4 para 5 itens — cards agora mostram frase única (sem separação número+legenda), 5º item com largura total
- CTA final com novo título/subtítulo; rodapé (`Footer.tsx`) com novo texto institucional
- Página `/servicos`: 8 serviços reordenados (Atendimento, IA Atendimento, Chatbot, WhatsApp, Gestão, Integração, Dashboard, Automação), "Agentes Inteligentes" mantido como 9º item extra fora da ordem; serviços "Atendimento", "Gestão" e "Dashboard" criados do zero; "Automação com IA" renomeado para "Automação"
- Seção Diferenciais: 8 cards com novo título + descrição curta abaixo de cada um, mantendo ícone e estrutura de card
- Formulário de Diagnóstico: subtítulo reescrito (não promete diagnóstico na primeira ligação), nova seção "Como funciona" (3 passos), popup de confirmação atualizado, botão trocado para "Receba um diagnóstico gratuito", campo "Nicho" reduzido a 3 opções (Administradora de Condomínios, Imobiliária - Adm de Imóveis, Outros), novo campo opcional "Qual é o maior desafio da sua empresa hoje?" salvo em `leads.maior_desafio`

### Pendências desta sessão
- ⚠️ Alinhamento horizontal dos 4 "trust indicators" do Hero não resolvido — `justify-between` + `w-full` aplicados, mas os itens continuam visualmente alinhados à esquerda. Precisa investigação mais profunda (inspeção via DevTools em runtime) na árvore de flex/grid de `components/Hero.tsx`

### Funcionalidades implementadas
- Admin panel com Supabase Auth, sidebar, dashboard de métricas
- CRM de leads com funil de 4 estágios (prospecção geral)
- Funil GMN separado: Identificado → Proposta Enviada → Em Atendimento → Briefing Agendado → Briefing Realizado → Em Retorno → Fechado
- Módulo GMN: extração de dados via Gemini 2.5 Flash, paleta de cores, BriefingModal com Score de Perfil, export PDF
- Rotas GMN protegidas com verificação de autenticação via Supabase SSR
- Botão "Enviar Proposta" com mensagem + gatilho escassez 48h
- Botão "Enviar Lembrete de Expiração" com mensagem personalizada
- Lógica de expiração demo: 48h=alerta âmbar, 72h=expirado vermelho
- Filtro "Demo Expirado" + banner de alertas na lista de leads
- Qualificação IA de leads via Gemini (ai_score, ai_reasoning, ai_qualified_at)
- Dashboard "Inteligência Comercial" com funil e distribuição de scores
- Conversão automática Lead → Cliente ao atingir estágio "fechado" (dashboard usa .eq('status', 'ativo') corretamente)
- Cadeia visual Lead → Cliente → Projeto no admin
- reCAPTCHA v3 no formulário de diagnóstico
- Página /oferta com plano Sob Consulta
- Sitemap com as 4 rotas públicas (/, /servicos, /oferta, /contato) — rotas /admin corretamente excluídas
- RLS em todas as tabelas, function search paths corrigidos
- Sistema de perfis (perfis table) com roles admin/editor
- .env.example atualizado com placeholders descritivos

### Bugs corrigidos (29/06/2026)
1. ✅ Card "Clientes Ativos" — já estava correto com .eq('status', 'ativo')
2. ✅ Logs de debug removidos/condicionados a NODE_ENV em app/api/gmn/extract/route.ts
3. ✅ Sitemap confirmado completo (rotas admin corretamente fora)
4. ✅ Rotas GMN confirmadas com autenticação via Supabase SSR
5. ✅ .env.example atualizado com placeholders, variável não usada removida

### Próximos itens (médio prazo)
- Vinculação de tarefas a projetos
- Prospecção IA
- Controle de parcelas
- Logos reais dos clientes
- Automação site demo GMN
