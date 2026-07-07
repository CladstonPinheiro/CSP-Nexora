# CSP Nexora — Contexto do Projeto

## Stack
Next.js 15 + TypeScript + Supabase + Gemini 2.5 Flash + Vercel

## Repositório
C:\Users\clads\projetos\CSP-Nexora

## Site
https://cspnexora.com.br

## Supabase
Região: São Paulo

## Estado atual (atualizado em 07/07/2026)

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
