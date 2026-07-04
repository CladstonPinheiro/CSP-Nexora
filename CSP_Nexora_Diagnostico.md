# CSP Nexora — Diagnóstico Técnico Completo

**Gerado em:** 25 de junho de 2026  
**Fonte:** análise estática do código-fonte + histórico git

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Técnica Completa](#2-stack-técnica-completa)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Rotas e Páginas](#4-rotas-e-páginas)
5. [APIs Externas](#5-apis-externas)
6. [Banco de Dados — Schema](#6-banco-de-dados--schema)
7. [Módulo GMN](#7-módulo-gmn)
8. [Pagamento PIX](#8-pagamento-pix)
9. [Painel Admin — CRM](#9-painel-admin--crm)
10. [Funcionalidades Implementadas](#10-funcionalidades-implementadas)
11. [Bugs Identificados](#11-bugs-identificados)
12. [O que Está em Andamento / Incompleto](#12-o-que-está-em-andamento--incompleto)
13. [Roadmap Inferido](#13-roadmap-inferido)
14. [Arquivos de Configuração e Contexto](#14-arquivos-de-configuração-e-contexto)
15. [Últimos 10 Commits](#15-últimos-10-commits)

---

## 1. Visão Geral do Projeto

**CSP Nexora** é uma empresa de automação com Inteligência Artificial sediada em Brasília/DF. Este repositório contém dois produtos distintos num único monorepo Next.js:

1. **Site institucional público** (`cspnexora.com.br`) — landing page de captação de leads voltada para empresas que buscam automação de processos, agentes inteligentes e chatbots.
2. **Painel administrativo interno** (`/admin`) — CRM completo para gestão do pipeline comercial, com qualificação de leads via IA, ferramenta de prospecção Google Meu Negócio (GMN) e dashboards analíticos.

**Público-alvo dual:**
- *Externo:* PMEs brasileiras nos setores imobiliário, saúde, educação, advocacia, contabilidade, etc.
- *Interno:* equipe comercial da CSP Nexora (uso privado, via autenticação Supabase).

O projeto originou-se de um template do Google AI Studio (`metadata.json` + README original), mas foi substancialmente transformado em produto real — o DNA do AI Studio persiste apenas em vestígios como o `name: "ai-studio-applet"` no `package.json`.

---

## 2. Stack Técnica Completa

### Linguagens & Framework

| Tecnologia | Versão | Uso |
|---|---|---|
| TypeScript | `5.9.3` | Toda a codebase |
| Next.js (App Router) | `^15.4.9` | Framework principal — SSR, RSC, API Routes, Server Actions |
| React + React DOM | `^19.2.1` | UI |

### Bibliotecas Frontend

| Biblioteca | Versão | Uso |
|---|---|---|
| Tailwind CSS v4 | `4.1.11` | Estilo (via `@tailwindcss/postcss`) |
| Motion (Framer fork) | `^12.23.24` | Animações (`whileInView`, Hero orb) |
| Lucide React | `^0.553.0` | Ícones |
| clsx + tailwind-merge | latest | Utilitário `cn()` para classes condicionais |
| class-variance-authority | `^0.7.1` | Variantes de componentes |
| @hookform/resolvers | `^5.2.1` | Validação de formulários |
| tw-animate-css | `^1.4.0` | Animações CSS extras |
| @tailwindcss/typography | `^0.5.19` | Tipografia |

### Serviços / APIs Externas

| Serviço | Uso | Credencial |
|---|---|---|
| **Supabase** | PostgreSQL + Auth + Storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Google Gemini** | Extração GMN + qualificação de leads | `GEMINI_API_KEY` |
| **Zoho SMTP** | E-mails transacionais (notificações de leads) | `ZOHO_SMTP_USER`, `ZOHO_SMTP_PASS` |
| **Google reCAPTCHA v3** | Anti-spam nos formulários públicos | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` |
| **Google Fonts** | Inter + Outfit (via `next/font`) | — |
| **ImgBB** | Hospedagem de logo no fluxo GMN (URL manual) | — |
| **Vercel** | Hosting + deploy | — |

### Bibliotecas Backend

| Biblioteca | Versão | Uso |
|---|---|---|
| nodemailer | `^9.0.1` | Envio de e-mails via Zoho SMTP |
| @supabase/ssr | `^0.12.0` | Auth SSR com cookies (middleware + server components) |
| @supabase/supabase-js | `^2.108.2` | Cliente Supabase |

### Variáveis de Ambiente Necessárias

```bash
# Gemini
GEMINI_API_KEY=

# Supabase (cliente público)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase (servidor — nunca expor no frontend)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Zoho SMTP
ZOHO_SMTP_USER=
ZOHO_SMTP_PASS=
NOTIFICATION_EMAIL=

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

---

## 3. Estrutura de Pastas

### Raiz do Projeto

```
CSP-Nexora/
├── admin-crm-estrutura.md      ← documentação interna do schema CRM
├── eslint.config.mjs
├── metadata.json               ← herança do template Google AI Studio
├── middleware.ts               ← auth guard para /admin/*
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md                   ← README do template AI Studio (não do projeto real)
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── hooks/
│   └── use-mobile.ts
├── lib/
│   ├── gemini.ts               ← qualificação de leads com Gemini
│   ├── mailer.ts               ← 3 funções de e-mail (lead, GMN, contato)
│   ├── supabase.ts             ← 3 clientes: browser singleton, SSR browser, admin service role
│   ├── supabase-server.ts      ← cliente SSR para Server Components (cookies)
│   └── utils.ts                ← função cn() (clsx + tailwind-merge)
├── public/
│   ├── logo.png
│   ├── og-image.png            ← Open Graph 1200×630
│   ├── robots.txt
│   └── README.md               ← readme do AI Studio (não relevante)
└── .claude/
    └── settings.local.json     ← permissões Claude Code
```

### `app/` — Rotas Next.js

```
app/
├── error.tsx
├── globals.css
├── layout.tsx                          ← RootLayout (fonts Inter+Outfit, metadata global)
├── page.tsx                            ← homepage pública (JSON-LD + 10 seções)
├── sitemap.ts
├── contato/
│   └── page.tsx
├── oferta/
│   └── page.tsx                        ← landing "Site em 24h" com planos PIX
├── servicos/
│   └── page.tsx
├── admin/
│   ├── login/
│   │   └── page.tsx                    ← auth pública
│   └── (panel)/                        ← route group — rotas protegidas
│       ├── layout.tsx                  ← AdminShell + AdminSidebar
│       ├── page.tsx                    ← dashboard (Server Component)
│       ├── _components/
│       │   ├── AdminShell.tsx
│       │   └── AdminSidebar.tsx
│       ├── leads/
│       │   ├── page.tsx
│       │   ├── actions.ts              ← Server Actions: create/update/delete lead
│       │   └── _components/
│       │       ├── types.ts            ← tipos TS + configs de badge
│       │       ├── LeadModal.tsx       ← modal criar/editar lead
│       │       └── LeadPanel.tsx       ← painel lateral de detalhes
│       ├── clientes/
│       │   ├── page.tsx
│       │   └── _components/
│       │       └── ClientePanel.tsx
│       ├── projetos/
│       │   ├── page.tsx
│       │   └── _components/
│       │       └── ProjetoPanel.tsx
│       ├── tarefas/
│       │   └── page.tsx                ← CRUD de tarefas com modal inline
│       └── gmn/
│           └── page.tsx                ← ferramenta de prospecção GMN
└── api/
    ├── leads/
    │   ├── route.ts                    ← POST cria lead público (com reCAPTCHA)
    │   └── [id]/
    │       └── close/
    │           └── route.ts            ← POST fecha lead e converte em cliente
    ├── contato/
    │   └── route.ts                    ← POST formulário de contato
    └── gmn/
        ├── extract/
        │   └── route.ts                ← POST extrai dados GMN via Gemini
        └── prospects/
            ├── route.ts                ← GET lista últimos 20 prospects
            └── [id]/
                └── route.ts            ← DELETE + PATCH prospect individual
```

### `components/`

```
components/
├── About.tsx
├── CTAFinal.tsx
├── Diagnostic.tsx              ← formulário de lead com reCAPTCHA v3
├── Differentials.tsx
├── Footer.tsx
├── Hero.tsx
├── Impact.tsx
├── Navbar.tsx
├── Process.tsx
├── Services.tsx
└── oferta/                     ← seções exclusivas da landing /oferta
    ├── BeneficiosOferta.tsx    ← ProblemaSection + BeneficiosSection + GoogleComparativoSection
    ├── FAQContato.tsx          ← FAQSection + ContatoSection
    ├── HeroOferta.tsx
    ├── NavbarOferta.tsx
    └── PlanosOferta.tsx        ← EntregaSection + ProcessoSection + PlanosSection + PixModal
```

---

## 4. Rotas e Páginas

### Frontend (páginas)

| URL | Arquivo | Acesso | Descrição |
|---|---|---|---|
| `/` | `app/page.tsx` | Público | Homepage com 10 seções + JSON-LD |
| `/contato` | `app/contato/page.tsx` | Público | Formulário de contato livre |
| `/servicos` | `app/servicos/page.tsx` | Público | Página de serviços |
| `/oferta` | `app/oferta/page.tsx` | Público | Landing "Site em 24h" com planos PIX |
| `/admin/login` | `app/admin/login/page.tsx` | Público | Login Supabase |
| `/admin` | `app/admin/(panel)/page.tsx` | **Privado** | Dashboard com KPIs + funil + score IA |
| `/admin/leads` | `app/admin/(panel)/leads/page.tsx` | **Privado** | Pipeline completo de leads |
| `/admin/clientes` | `app/admin/(panel)/clientes/page.tsx` | **Privado** | Gestão de clientes |
| `/admin/projetos` | `app/admin/(panel)/projetos/page.tsx` | **Privado** | Projetos por cliente |
| `/admin/tarefas` | `app/admin/(panel)/tarefas/page.tsx` | **Privado** | Tarefas / follow-ups |
| `/admin/gmn` | `app/admin/(panel)/gmn/page.tsx` | **Privado** | Ferramenta de prospecção GMN |

### Backend (API Routes)

| Método | URL | Autenticação | Função |
|---|---|---|---|
| `POST` | `/api/leads` | reCAPTCHA v3 (exceto `prospeccao_ia` e `prospeccao_gmn`) | Cria lead público |
| `POST` | `/api/leads/[id]/close` | Supabase Auth (cookie) | Fecha lead e cria cliente automaticamente |
| `POST` | `/api/contato` | Nenhuma | Submete formulário de contato |
| `POST` | `/api/gmn/extract` | Nenhuma | Extrai dados GMN com Gemini |
| `GET` | `/api/gmn/prospects` | Nenhuma | Lista últimos 20 prospects salvos |
| `DELETE` | `/api/gmn/prospects/[id]` | Nenhuma | Remove prospect |
| `PATCH` | `/api/gmn/prospects/[id]` | Nenhuma | Atualiza prospect (ex: `lead_cadastrado: true`) |

> **Atenção:** As rotas GMN não têm autenticação própria — dependem de estarem acessíveis apenas via painel admin no frontend.

---

## 5. APIs Externas

### Google Gemini

**Chamada 1 — Qualificação de leads** (`lib/gemini.ts`)
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...
```
- Acionada após cada novo lead inserido, de forma assíncrona (sem `await` no caller)
- Prompt diferente dependendo de `source === 'prospeccao_gmn'` vs outros
- Salva em `leads.ai_score` + `leads.ai_reasoning` + `leads.ai_qualified_at`
- Output: `{ "score": "alto|medio|baixo", "reasoning": "até 2 frases" }`
- Parâmetros: `temperature: 0.2`, `responseMimeType: "application/json"`

**Chamada 2 — Extração GMN** (`app/api/gmn/extract/route.ts`)
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=...
```
- Acionada pelo operador na página `/admin/gmn`
- Extrai 30+ campos estruturados de texto bruto do Google Meu Negócio
- Parâmetros: `temperature: 0.1`, `responseMimeType: "application/json"`
- Retry automático em HTTP 503 (aguarda 2s e tenta uma segunda vez)

---

### Google reCAPTCHA v3

```
POST https://www.google.com/recaptcha/api/siteverify
  body: { secret: RECAPTCHA_SECRET_KEY, response: token }
```
- Chamado em toda submissão pública (`/api/leads` via formulário de diagnóstico)
- Exige `score >= 0.5`
- **Pulado** para `source === 'prospeccao_ia'` ou `source === 'prospeccao_gmn'`

---

### Supabase (via SDK)

| Operação | Tabela | Onde |
|---|---|---|
| `insert` + `select` | `leads` | `/api/leads`, `leads/actions.ts` |
| `update` (stage, ai_score) | `leads` | `/api/leads/[id]/close`, `lib/gemini.ts` |
| `select` | `leads`, `clientes`, `tarefas`, `projetos` | Dashboard (`admin/(panel)/page.tsx`) |
| `insert` + `select` | `clientes` | `/api/leads/[id]/close` |
| `insert` + `select` | `gmn_prospects` | `/api/gmn/extract` |
| `select` | `gmn_prospects` | `/api/gmn/prospects` |
| `delete`, `update` | `gmn_prospects` | `/api/gmn/prospects/[id]` |
| `select/insert/update/delete` | `tarefas` | `admin/tarefas/page.tsx` |
| `select/insert/update/delete` | `projetos` | `admin/projetos/page.tsx` |
| `signInWithPassword` | Auth | `admin/login/page.tsx` |
| `getUser` | Auth | `middleware.ts`, rotas protegidas |

**Dois clientes distintos:**
- `createAdminClient()` — service role, ignora RLS, usado em API Routes e Server Actions
- `createSupabaseBrowserClient()` — anon key + cookies, usado em Client Components

---

### Zoho SMTP (`smtp.zoho.com:587`)

Via Nodemailer em `lib/mailer.ts`. Três funções:

| Função | Acionada em | Assunto do e-mail |
|---|---|---|
| `sendLeadNotification()` | `/api/leads` (formulário público) | `[Novo Lead] Nome — Empresa` |
| `sendLeadGMNNotification()` | `/api/leads` com `source: 'prospeccao_gmn'` | `[Lead GMN] [Estágio] — Empresa` (inclui código PIX) |
| `sendContatoNotification()` | `/api/contato` | `[Contato] Assunto — Nome` |

Destinatário: variável `NOTIFICATION_EMAIL`.

---

### WhatsApp (`wa.me`)

Não é API — links `https://wa.me/5561984202578?text=...` que abrem WhatsApp Web com mensagem pré-preenchida. Usado no modal PIX da `/oferta`.

### ImgBB (`i.ibb.co`)

Não é API — URLs hardcoded para QR Codes PIX e logos inseridas manualmente pelo operador.

---

## 6. Banco de Dados — Schema

### Tabela `leads`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | — |
| `company_name` | text | Nome da empresa |
| `contact_name` | text | Nome do contato |
| `niche` | text | `imobiliaria` / `administradora_imoveis` / `administradora_condominios` / `outro` (leads) |
| `city` | text | Cidade |
| `phone` | text | Telefone |
| `email` | text | E-mail |
| `linkedin` | text | LinkedIn |
| `instagram` | text | Instagram |
| `website` | text | Site |
| `source` | enum | `whatsapp` / `formulario` / `contato_site` / `email` / `instagram` / `indicacao` / `telefone` / `prospeccao_ia` / `prospeccao_gmn` |
| `referred_by` | text | Quem indicou |
| `score` | enum | `alto` / `medio` / `baixo` (manual) |
| `stage` | enum | `identificado` / `briefing_agendado` / `briefing_realizado` / `proposta_enviada` / `em_retorno` / `fechado` / `perdido` |
| `notes` | text | Observações livres |
| `ai_score` | enum | `alto` / `medio` / `baixo` (gerado por Gemini) |
| `ai_reasoning` | text | Justificativa da IA |
| `ai_qualified_at` | timestamp | Quando a IA qualificou |
| `created_at` | timestamp | Criação do registro |

### Tabela `clientes`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | — |
| `lead_id` | uuid FK → leads | Lead de origem |
| `company_name` | text | — |
| `contact_name` | text | — |
| `phone` | text | — |
| `email` | text | — |
| `niche` | text | `saude` / `educacao` / `tecnologia` / `varejo` / `servicos` / `industria` / `imobiliario` / `juridico` / `outros` |
| `status` | text | `ativo` / `pausado` / `encerrado` |
| `started_at` | timestamp | Data de início do contrato |

### Tabela `projetos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | — |
| `client_id` | uuid FK → clientes | — |
| `title` | text | Título |
| `scope` | text | Escopo / descrição |
| `status` | text | `ativo` / `pausado` / `concluido` / `cancelado` |
| `setup_value` | numeric | Valor de implantação (R$) |
| `monthly_value` | numeric | Valor mensal recorrente (R$) |
| `start_date` | date | — |
| `delivery_date` | date | Entrega prevista |
| `notes` | text | — |
| `created_at` | timestamp | — |

### Tabela `tarefas`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | — |
| `lead_id` | uuid FK → leads | Vínculo com lead (não usado na UI atual) |
| `client_id` | uuid FK → clientes | Vínculo com cliente (não usado na UI atual) |
| `type` | text | `ligacao` / `email` / `reuniao` / `entrega` / `outros` |
| `title` | text | Descrição da tarefa |
| `due_at` | timestamp | Prazo |
| `channel` | text | Canal (WhatsApp, Email...) |
| `done` | boolean | Concluída? |
| `responsavel_id` | uuid | Responsável (não usado na UI atual) |
| `created_at` | timestamp | — |

### Tabela `gmn_prospects`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | — |
| `company_name` | text | — |
| `slogan` | text | — |
| `phone` | text | — |
| `address` | text | — |
| `city` | text | — |
| `instagram` | text | — |
| `facebook` | text | — |
| `whatsapp` | text | — |
| `description` | text | Descrição completa |
| `niche` | text | — |
| `services` | text[] | Array de serviços |
| `logo_url` | text | URL da logo (ImgBB) |
| `maps_url` | text | URL Google Maps |
| `business_hours` | jsonb | Objeto por dia |
| `areas_served` | text[] | Regiões atendidas |
| `differentials` | text[] | Diferenciais extraídos |
| `raw_text` | text | Texto original colado |
| `lead_cadastrado` | boolean | Se virou lead no CRM |
| `lead_id` | uuid FK → leads | Lead gerado |
| `created_at` | timestamp | — |

### Relações

```
leads
  └─(lead_id)──► clientes
                    └─(client_id)──► projetos
                    └─(client_id)──► tarefas
leads
  └─(lead_id)──► tarefas

gmn_prospects
  └─(lead_id)──► leads
```

---

## 7. Módulo GMN

### Pipeline Completo

```
Operador copia texto do Google Meu Negócio (manualmente)
          ↓
    /admin/gmn
    textarea: texto bruto do GMN
    input: URL da logo (opcional, ImgBB)
          ↓
   POST /api/gmn/extract
          ↓
   Gemini 2.0-flash (temperature: 0.1)
   prompt com 30+ campos estruturados
   regras explícitas (phone só dígitos, instagram sem @, etc.)
          ↓
   Resposta JSON do Gemini
          ↓
   inferFields() — enriquecimento local (sem custo de API)
          ↓
   Salva em gmn_prospects (Supabase)
          ↓
   Retorna { data: GmnExtracted, prospectId }
          ↓
   UI exibe resultado com todos os campos
          ↓
   Operador clica "Cadastrar no CRM"
          ↓
   POST /api/leads (source: 'prospeccao_gmn')
   + PATCH /api/gmn/prospects/[id] { lead_cadastrado: true, lead_id }
   + qualificarLead() dispara qualificação Gemini 2.5-flash em background
   + sendLeadGMNNotification() envia e-mail via Zoho
```

### O que o Gemini Extrai

```typescript
interface GmnExtracted {
  // Identificação
  company_name      // Nome do negócio
  slogan            // Slogan/tagline
  gmn_category      // Categoria principal (ex: "Lavanderia")
  niche             // "imobiliaria" | "administradora_imoveis" |
                    // "administradora_condominios" | "outro"

  // Contato
  phone             // Apenas dígitos (ex: "61999990000")
  email
  whatsapp          // Inferido: fallback para phone
  instagram         // Handle sem @ (ex: "minha.loja")
  instagram_url     // Inferido: "https://www.instagram.com/{instagram}"
  facebook          // Handle sem URL
  facebook_url      // Inferido: "https://www.facebook.com/{facebook}"
  website
  maps_url          // URL Google Maps se presente no texto

  // Localização
  address           // Endereço completo
  city
  neighborhood      // Inferido: primeira parte do address antes da vírgula
  cep               // Inferido: regex /\d{5}-?\d{3}/ no address
  state             // Inferido: sigla 2 letras maiúsculas no address

  // Descrição
  description_full  // Texto completo exatamente como aparece
  description_short // Inferido: primeiras 2 frases da description_full

  // Operação
  business_hours    // Objeto por dia: { "Segunda": "09:00–18:00" }
  is_open_24h       // Inferido: regex "24h|aberto 24|funciona 24"
  parking
  service_options   // ["Atendimento no local", "Online"]

  // Conteúdo
  logo_url          // URL manual fornecida pelo operador (ImgBB)
  services          // Array de serviços listados
  areas_served      // Bairros/regiões atendidas
  differentials     // Inferido: frases com palavras-chave de qualidade
                    // mín 15 chars, máx 5 itens, sem pontuação final

  // Avaliação
  rating            // Número decimal
  total_reviews     // Número inteiro
}
```

### Palavras-chave para Diferenciais (inferField)

```
moderno/a/s, 24, seguro/a, limpo/a, rápido/a, fácil,
qualidade, experiência, anos, atendimento, especializado,
exclusivo, completo, tecnologia, automatizado
```

### Resiliência

- Retry manual em HTTP 503: aguarda 2s, tenta novamente uma vez
- Log detalhado de `finishReason` do Gemini para diagnóstico em prod
- Parsing seguro com try/catch; retorna erro HTTP 500 com `rawPreview` para debug

### Botão "Copiar JSON para AI Studio"

Copia `JSON.stringify(extracted, null, 2)` para a área de transferência — permite usar os dados estruturados em prompts no Google AI Studio para gerar sites, textos de marketing, etc.

---

## 8. Pagamento PIX

### O que Está Implementado (código rodando)

**`components/oferta/PlanosOferta.tsx` — componente `PixModal`:**

**Etapa 1 — Identificação:**
- Formulário com nome, empresa, telefone
- Gera código único: `GMN-DDMM-RAND4` (ex: `GMN-2506-4821`) via `gerarCodigo()`
- POST `/api/leads` com `source: 'prospeccao_gmn'`, `stage: 'proposta_enviada'`, `notes: "Lead GMN — pagamento iniciado — {plano} — código: {codigo}"`
- E-mail disparado: `sendLeadGMNNotification()` com o código

**Etapa 2 — Pagamento:**

| Plano | Valor | QR Code | Chave PIX |
|---|---|---|---|
| À vista | R$ 500 | `i.ibb.co/n8ZBcrb0/QR-CODE-500.png` | EMV payload hardcoded |
| 2× parcelas | R$ 350/parcela | `i.ibb.co/gLmRVHVd/QR-CODE-350.png` | EMV payload hardcoded |
| 12× parcelas | R$ 120/parcela | `i.ibb.co/HLGp71Xm/QR-CODE-120.png` | EMV payload hardcoded |

- Chave PIX copiável com feedback visual (CheckCheck)
- Botão "Já paguei — confirmar pelo WhatsApp" → abre `wa.me/5561984202578` com mensagem pré-preenchida incluindo código, nome, empresa e instrução de comprovante

### O que Ainda É Manual

| Etapa | Status |
|---|---|
| Verificar se o PIX foi recebido | Manual — extrato bancário |
| Confirmar pagamento ao cliente | Manual — WhatsApp com comprovante |
| Controlar 2ª, 3ª… 12ª parcelas | Não implementado |
| Ativar/criar o site do cliente | Manual — equipe faz o trabalho |
| Emitir nota fiscal / recibo | Não implementado |
| Webhook de confirmação automática | Não implementado |

> Não existe integração com nenhuma gateway de pagamento. As chaves PIX são estáticas de CPF/CNPJ do proprietário (`CLADSTON DA SILVA PINHEIR` — visível no payload EMV hardcoded).

---

## 9. Painel Admin — CRM

### Dashboard (`/admin`)

Server Component que busca métricas diretamente no banco:

- **4 cards KPI:** Total de Leads, Leads este Mês, Clientes Ativos, Tarefas Pendentes
- **Origem dos Leads:** Site Público vs Prospecção GMN (contagens separadas)
- **Inteligência Comercial:**
  - Taxa de conversão (fechados ÷ total)
  - Ticket médio (setup_value + monthly_value por projeto)
  - Tempo médio para fechar (created_at → ai_qualified_at)
  - Funil de leads com barra de progresso por estágio
  - Distribuição de score IA (alto/médio/baixo/sem score)

### Pipeline de Leads (`/admin/leads`)

- Tabela com filtro por estágio e origem
- CRUD completo via Server Actions (`leads/actions.ts`)
- `LeadModal` — criar/editar (todos os campos da tabela)
- `LeadPanel` — painel lateral de detalhes com badges de estágio, origem, score manual e score IA
- Botão "Fechar Lead" → `POST /api/leads/[id]/close`:
  1. Atualiza `stage = 'fechado'`
  2. Verifica se já existe cliente (`lead_id`)
  3. Cria cliente automaticamente com guard de race condition (`23505`)
  4. Retorna `{ clienteCriado, clienteId }`
- Botão "Excluir" com modal de confirmação

### Estágios do Pipeline (em ordem)

```
identificado → briefing_agendado → briefing_realizado
→ proposta_enviada → em_retorno → fechado (ganho)
                                ↘ perdido (saída lateral)
```

### Origens Reconhecidas

```
whatsapp | formulario | contato_site | email | instagram
indicacao | telefone | prospeccao_ia | prospeccao_gmn
```

### Clientes (`/admin/clientes`)

- Lista com filtros por status e nicho
- CRUD completo (direto no Supabase browser client)
- `ClientePanel` — painel lateral com link para lead de origem

### Projetos (`/admin/projetos`)

- Lista com filtros por status
- CRUD completo com select de cliente vinculado
- Campos financeiros: `setup_value` e `monthly_value`
- `ProjetoPanel` — painel lateral de detalhes

### Tarefas (`/admin/tarefas`)

- Lista com filtros por tipo e status (pendente/concluída)
- Toggle de conclusão inline
- CRUD com modal `TarefaModal`
- Tipos: ligação, email, reunião, entrega, outros
- Campos: título, tipo, canal, prazo (datetime-local), concluída

### Ferramenta GMN (`/admin/gmn`)

- Coluna esquerda: textarea para texto GMN + input URL logo + histórico de prospects
- Coluna direita: resultado estruturado + botões de ação
- Histórico: últimos 20 prospects com badge "CRM" se já cadastrado
- Botão deletar prospect (remove do histórico e do Supabase)
- Carregar prospect anterior → preenche painel direito

### Autenticação

- `middleware.ts` intercepta `/admin/:path*`
- Não autenticado → redirect `/admin/login`
- Autenticado em `/admin/login` → redirect `/admin`
- Client: `supabase.auth.signInWithPassword()`
- Server: `createSupabaseServerClient()` → `auth.getUser()`

---

## 10. Funcionalidades Implementadas

### Site Público

| Componente | Status | Notas |
|---|---|---|
| Navbar | ✅ | — |
| Hero | ✅ | Orb animado com Motion, CTA duplo |
| About | ✅ | — |
| Services | ✅ | 7 serviços com cards de gradiente |
| Differentials | ✅ | — |
| Process | ✅ | — |
| Impact | ✅ | Stats: +95% eficiência, +70% redução custos, 24h, Ready |
| CTAFinal | ✅ | — |
| Diagnostic | ✅ | reCAPTCHA v3, select com 17 nichos, máscara telefone BR, lock localStorage |
| Footer | ✅ | — |
| `/contato` | ✅ | Formulário livre → `/api/contato` |
| `/servicos` | ✅ | — |
| `/oferta` | ✅ | Landing completa com 8 seções + modal PIX |
| JSON-LD | ✅ | Organization + LocalBusiness + WebSite + WebPage |
| OG/Twitter cards | ✅ | Via Next.js Metadata API |
| Sitemap | ⚠️ | Só `/` e `/servicos` — faltam `/oferta` e `/contato` |
| robots.txt | ✅ | Arquivo estático |

### Painel Admin

| Módulo | Status | Notas |
|---|---|---|
| Login Supabase | ✅ | — |
| Dashboard com KPIs | ✅ | Server Component |
| Pipeline de Leads | ✅ | Filtros, CRUD, painel lateral |
| Qualificação IA (Gemini) | ✅ | Assíncrona, badge ai_score |
| Fechamento lead → cliente | ✅ | Automático com guard de race condition |
| Clientes | ✅ | — |
| Projetos | ✅ | Com valores financeiros |
| Tarefas | ✅ | Toggle inline, modal CRUD |
| Prospecção GMN | ✅ | Extração + histórico + cadastro CRM |
| Notificações e-mail | ✅ | 3 templates Zoho SMTP |

---

## 11. Bugs Identificados

### Bug 1 — Coluna errada no card "Clientes Ativos" (dashboard)

**Arquivo:** `app/admin/(panel)/page.tsx:44`

```typescript
// ERRADO — coluna 'ativo' não existe na tabela clientes
supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('ativo', true)

// CORRETO
supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('status', 'ativo')
```

**Impacto:** card "Clientes Ativos" sempre mostra 0.

---

### Bug 2 — Logs de debug em produção

**Arquivo:** `app/api/gmn/extract/route.ts`

Deixados no commit `a6aefa6`:
```typescript
console.log('[gmn/extract] API key presente, primeiros 8 chars:', apiKey.slice(0, 8) + '...')
console.log('[GMN] parsed.address:', parsed.address)
console.log('[GMN] enriched.neighborhood:', enriched.neighborhood, 'cep:', enriched.cep ...)
```

**Impacto:** expõe prefixo da API key nos logs da Vercel.

---

### Bug 3 — Sitemap incompleto

**Arquivo:** `app/sitemap.ts`

`/oferta` e `/contato` existem mas não estão listadas.

---

### Bug 4 — `.env.example` desatualizado

Faltam 7 das 10 variáveis de ambiente necessárias: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ZOHO_SMTP_USER`, `ZOHO_SMTP_PASS`, `NOTIFICATION_EMAIL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`.

---

### Bug 5 — Rotas GMN sem autenticação

`/api/gmn/extract`, `/api/gmn/prospects` e `/api/gmn/prospects/[id]` não verificam autenticação. Qualquer pessoa que descubra as URLs pode consultar, deletar ou atualizar prospects.

---

## 12. O que Está em Andamento / Incompleto

### Campos Definidos no Schema Mas Sem UI

| Campo | Tabela | Situação |
|---|---|---|
| `lead_id` | tarefas | Schema existe, modal de tarefa não permite vincular |
| `client_id` | tarefas | Idem |
| `responsavel_id` | tarefas | Schema existe, sem lógica de usuários/equipe |
| `linkedin` | leads | Campo no tipo TS, sem evidência de preenchimento sistemático |
| `referred_by` | leads | Campo no tipo TS, disponível no `LeadModal` mas sem campo `referred_by` na form visível |
| `started_at` | clientes | Sem datepicker na UI de criação |

### Integrações Pendentes

- **`prospeccao_ia`** — origem reservada nos tipos e badges, mas não existe ferramenta de prospecção IA além da GMN
- **Controle de parcelas** — plano 12× não tem nenhum rastreamento de pagamentos recorrentes
- **Webhook PIX** — confirmação de pagamento é totalmente manual
- **`admin-crm-estrutura.md`** — menciona "integração pendente" entre `/oferta` e CRM (parcialmente corrigida no commit `ab4678d`, mas documento não atualizado)

### Trust Indicators no Hero

`components/Hero.tsx` exibe `OPENAI`, `STRIPE`, `VERCEL`, `NOTION` como texto puro sem logos reais — aparenta ser placeholder.

---

## 13. Roadmap Inferido

### Curto Prazo (bugs / débitos técnicos)

- [ ] Corrigir `.eq('ativo', true)` → `.eq('status', 'ativo')` no dashboard
- [ ] Remover `console.log` de debug do módulo GMN
- [ ] Completar `sitemap.ts` com `/oferta` e `/contato`
- [ ] Adicionar auth nas rotas `/api/gmn/*`
- [ ] Atualizar `.env.example` com todas as variáveis

### Médio Prazo (funcionalidades em evolução)

- [ ] Vinculação de tarefas a leads/clientes na UI (modal já tem os campos no schema)
- [ ] Ferramenta de prospecção `prospeccao_ia` (equivalente à GMN para outros canais)
- [ ] Controle de parcelas para plano 12× (tabela `pagamentos` ou campo `installment_count`)
- [ ] Logos reais dos parceiros no Hero (OpenAI, Stripe, Vercel, Notion)
- [ ] Automação do envio de site demo a prospect GMN

### Longo Prazo (arquitetura futura)

- [ ] **Multi-usuário no admin** — `responsavel_id` em tarefas indica planejamento para times
- [ ] **Portal do cliente** — lógica client_id em projetos e tarefas sugere área para clientes acompanharem status
- [ ] **Geração automática de site** — a extração GMN estrutura os dados do negócio; passo lógico é usar esses dados + IA para gerar o site automaticamente
- [ ] **Webhook PIX / gateway de pagamento** — integrar Mercado Pago, Pagar.me ou EFI (ex-Gerencianet) para confirmação automática
- [ ] **Dashboard financeiro** — MRR, ARR, churn, LTV por nicho a partir da tabela `projetos`

---

## 14. Arquivos de Configuração e Contexto

### CLAUDE.md

**Não existe** no projeto. O `find` retornou apenas arquivos dentro de `node_modules` (dependências `nodemailer` e `universal-analytics`), sem relação com o projeto.

### `.claude/settings.local.json` — Conteúdo completo

```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)",
      "Bash(git commit -m ' *)",
      "Bash(git push *)",
      "Bash(vercel *)",
      "Bash(npm install *)",
      "Bash(npx tsc *)",
      "PowerShell(Copy-Item *)",
      "PowerShell(cd \"C:\\\\Users\\\\clads\\\\projetos\\\\CSP-Nexora\" && Get-ChildItem public/ | Select-Object Name, @{N='KB';E={[math]::Round\\($_.Length/1KB,1\\)}} | Sort-Object KB -Descending)",
      "Bash(git *)",
      "Bash(node -e \"require\\('nodemailer'\\)\")",
      "Bash(curl *)",
      "Bash(mkdir -p app/oferta)",
      "Bash(mkdir -p components/oferta)",
      "Bash(code . *)",
      "Bash(npm run *)",
      "Bash(xargs grep -l \"supabase\")"
    ]
  }
}
```

### `.env.example` — Conteúdo completo (desatualizado)

```bash
# GEMINI_API_KEY: Required for Gemini AI API calls.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
APP_URL="MY_APP_URL"

# SUPABASE CONFIGURATION:
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
```

### `metadata.json` — Conteúdo completo

```json
{
  "name": "CSP Nexora",
  "description": "Automação Inteligente e Ecossistemas de IA para empresas que querem escalar.",
  "requestFramePermissions": [],
  "majorCapabilities": [
    "MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"
  ]
}
```

### `admin-crm-estrutura.md`

Documento de arquitetura interna do CRM com schema completo, tipos, enums, relações e observações de integração. Funciona como especificação viva do banco de dados. Observação relevante ainda presente (parcialmente desatualizada):

> **Landing `/oferta`** usa `formsubmit.co` — leads gerados lá **não entram automaticamente** na tabela `leads`. Integração pendente.

*(O commit `ab4678d` corrigiu para `/api/leads`, mas o documento não foi atualizado.)*

---

## 15. Últimos 10 Commits

| Hash | Data | Mensagem |
|---|---|---|
| `a486bfc` | 2026-06-24 | `fix: troca modelo Gemini para gemini-2.0-flash` |
| `34c11fb` | 2026-06-24 | `fix: troca modelo para gemini-1.5-flash e adiciona retry em 503` |
| `a6aefa6` | 2026-06-24 | `debug: logs temporários de inferFields para diagnóstico na Vercel` |
| `793c297` | 2026-06-24 | `fix: botão copiar JSON em âmbar com feedback visual` |
| `75ccf92` | 2026-06-24 | `fix: differentials GMN filtro mínimo 15 chars, sem pontuação final, máx 5 itens` |
| `72e61aa` | 2026-06-24 | `debug: logging detalhado de erros Gemini na rota GMN extract` |
| `4f3e7aa` | 2026-06-24 | `feat: campo URL da logo manual na página GMN` |
| `cfcd5a8` | 2026-06-24 | `refactor: inferência de campos GMN movida para TypeScript pós-Gemini` |
| `6578576` | 2026-06-24 | `feat: prompt GMN com inferência inteligente de 12 campos` |
| `1729bda` | 2026-06-24 | `feat: botão deletar prospecção GMN e botão copiar JSON em azul` |

**Contexto:** todos os 10 últimos commits são do mesmo dia (2026-06-24), em sessão intensa de desenvolvimento do módulo GMN. A sequência revela iteração típica: feature → debug em produção (Vercel) → troca de modelo Gemini (`1.5-flash` → `2.0-flash`) → refinamentos de UX e regras de extração.

---

*Fim do diagnóstico. Documento gerado a partir de análise estática completa do código-fonte.*
