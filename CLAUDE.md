# CSP Nexora — Guia para Claude Code

## Estado atual

**Última sessão:** 27/06/2026

**O que foi feito:**
- Módulo GMN completo: fallback Gemini 2.5, extração completa, paleta de cores, differentials curtos, endereço correto, preview paleta na UI
- BriefingModal: Score de Perfil do Cliente Ideal, export PDF com logo em base64, nome do arquivo automático
- Novos campos GMN: youtube, tiktok, linkedin, catalog_url, has_delivery
- Campo site_demo nos leads + botão "Enviar Proposta via WhatsApp" com mensagem personalizada + gatilho de escassez 48h
- Funil GMN separado: Identificado → Proposta Enviada → Em Atendimento → Briefing Agendado → Briefing Realizado → Em Retorno → Fechado
- Página /oferta: reordenada, plano Sob Consulta, botões finalizados
- Bugs corrigidos: auth rotas GMN, card Clientes Ativos, sitemap, .env.example
- Número WhatsApp atualizado: 61920043098
- Botão "Enviar Lembrete de Expiração" (âmbar, ícone Bell) no LeadPanel — aparece quando site_demo preenchido e stage !== 'fechado'
- Badge pulsante âmbar no funil (leads GMN em identificado/proposta_enviada com site_demo)
- Banner âmbar na lista de leads com contagem de leads aguardando lembrete — clicável para filtrar
- Lógica de expiração 48h/72h baseada em created_at: getDemoStatus() retorna 'ok' | 'alerta' | 'expirado'
- Coluna Estágio na lista: badge "Demo Expirado" (vermelho) ou "⚠️ 48H" (âmbar) quando aplicável
- Opção "Demo Expirado" no dropdown de filtro de estágios
- Badge no topo do LeadPanel: "Demo Expirado" (vermelho) ou "⚠️ Enviar lembrete hoje" (âmbar)

**Pendentes CSP Nexora:**
- (nenhum pendente registrado)
