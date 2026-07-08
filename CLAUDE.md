# CSP Nexora — Contexto do Projeto

## Stack
Next.js 15 + TypeScript + Supabase + Gemini 2.5 Flash + Vercel

## Repositório
C:\Users\clads\projetos\CSP-Nexora

## Site
https://cspnexora.com.br

## Supabase
Região: São Paulo

## Estado atual (atualizado em 08/07/2026)

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
