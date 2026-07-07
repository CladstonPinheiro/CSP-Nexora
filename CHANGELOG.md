# Changelog

Todas as mudanças relevantes do projeto CSP Nexora são documentadas aqui, em ordem cronológica reversa.

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
