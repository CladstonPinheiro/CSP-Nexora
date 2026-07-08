# Changelog

Todas as mudanças relevantes do projeto CSP Nexora são documentadas aqui, em ordem cronológica reversa.

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
