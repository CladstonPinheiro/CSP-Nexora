# CSP Nexora — Guia para Claude Code

## Estado atual

**Última sessão:** 26/06/2026

**O que foi feito:**
- Módulo GMN completo: fallback Gemini 2.5, extração completa, paleta de cores, differentials curtos, endereço correto, preview paleta na UI
- BriefingModal: Score de Perfil do Cliente Ideal, export PDF com logo em base64, nome do arquivo automático
- Novos campos GMN: youtube, tiktok, linkedin, catalog_url, has_delivery
- Campo site_demo nos leads + botão "Enviar Proposta via WhatsApp" com mensagem personalizada + gatilho de escassez 48h (pendente de commit)
- Funil GMN separado: Identificado → Proposta Enviada → Em Atendimento → Briefing Agendado → Briefing Realizado → Em Retorno → Fechado
- Página /oferta: reordenada, plano Sob Consulta, botões finalizados
- Bugs corrigidos: auth rotas GMN, card Clientes Ativos, sitemap, .env.example
- Número WhatsApp atualizado: 61920043098

**Pendentes CSP Nexora:**
- Botão "Enviar Lembrete de Expiração" no LeadPanel
- Mensagem de aviso de expiração (aprovada: prazo 48h)
- Badge vermelho para leads que precisam de lembrete
