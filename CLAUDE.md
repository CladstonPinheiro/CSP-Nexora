# CSP Nexora — Contexto do Projeto

## Stack
Next.js 15 + TypeScript + Supabase + Gemini 2.5 Flash + Vercel

## Repositório
C:\Users\clads\projetos\CSP-Nexora

## Site
https://cspnexora.com.br

## Supabase
Região: São Paulo

## Estado atual (atualizado em 29/06/2026)

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
