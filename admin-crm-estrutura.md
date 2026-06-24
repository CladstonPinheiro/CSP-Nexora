# Estrutura Admin / CRM — CSP Nexora

## Páginas (`app/admin/`)

| Rota | Arquivo | Descrição |
|---|---|---|
| `/admin/login` | `app/admin/login/page.tsx` | Autenticação Supabase |
| `/admin` | `app/admin/(panel)/page.tsx` | Dashboard inicial |
| `/admin/leads` | `app/admin/(panel)/leads/page.tsx` | Pipeline de leads |
| `/admin/clientes` | `app/admin/(panel)/clientes/page.tsx` | Lista de clientes |
| `/admin/projetos` | `app/admin/(panel)/projetos/page.tsx` | Projetos vinculados |
| `/admin/tarefas` | `app/admin/(panel)/tarefas/page.tsx` | Tarefas |

---

## Tabela `leads`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | PK |
| `company_name` | text | Nome da empresa |
| `contact_name` | text | Nome do contato |
| `niche` | text | Nicho (imobiliaria, administradora_imoveis, administradora_condominios, outro) |
| `city` | text | Cidade |
| `phone` | text | Telefone |
| `email` | text | E-mail |
| `linkedin` | text | LinkedIn |
| `instagram` | text | Instagram |
| `website` | text | Site |
| `source` | enum Origem | whatsapp / formulario / contato_site / email / instagram / indicacao / telefone / prospeccao_ia |
| `referred_by` | text | Indicado por |
| `score` | enum Score | alto / medio / baixo (manual) |
| `stage` | enum Estagio | identificado / briefing_agendado / briefing_realizado / proposta_enviada / em_retorno / fechado / perdido |
| `notes` | text | Observações livres |
| `ai_score` | enum | alto / medio / baixo (gerado por IA Gemini) |
| `ai_reasoning` | text | Justificativa da IA |
| `ai_qualified_at` | timestamp | Quando a IA qualificou o lead |
| `created_at` | timestamp | Criação do registro |

### Pipeline de estágios (ordem)
```
identificado
  → briefing_agendado
  → briefing_realizado
  → proposta_enviada
  → em_retorno
  → fechado   (ganho)
  → perdido   (saída lateral)
```

### Origens possíveis
- `whatsapp` — contato direto pelo WhatsApp
- `formulario` — formulário do site
- `contato_site` — página de contato
- `email` — e-mail direto
- `instagram` — Instagram
- `indicacao` — indicação (campo `referred_by`)
- `telefone` — ligação
- `prospeccao_ia` — prospecção automatizada por IA

---

## Tabela `clientes`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | PK |
| `lead_id` | uuid | FK → leads (origem do cliente) |
| `company_name` | text | Nome da empresa |
| `contact_name` | text | Contato principal |
| `phone` | text | Telefone |
| `email` | text | E-mail |
| `niche` | text | Nicho (saude / educacao / tecnologia / varejo / servicos / industria / imobiliario / juridico / outros) |
| `status` | text | ativo / pausado / encerrado |
| `started_at` | timestamp | Data de início do contrato |

---

## Tabela `projetos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | PK |
| `client_id` | uuid | FK → clientes |
| `title` | text | Título do projeto |
| `scope` | text | Escopo / descrição |
| `status` | text | ativo / pausado / concluido / cancelado |
| `setup_value` | numeric | Valor de implantação (R$) |
| `monthly_value` | numeric | Valor mensal recorrente (R$) |
| `start_date` | date | Data de início |
| `delivery_date` | date | Data de entrega prevista |
| `notes` | text | Observações |
| `created_at` | timestamp | Criação do registro |

---

## Relações entre tabelas

```
leads
  └─(lead_id)──► clientes
                    └─(client_id)──► projetos
```

- Um lead vira cliente quando o negócio é fechado
- Um cliente pode ter múltiplos projetos
- O painel de cliente exibe o lead de origem com link direto

---

## Componentes principais

| Arquivo | Função |
|---|---|
| `leads/_components/types.ts` | Tipos TypeScript + configs de estilo para stages/origens/score |
| `leads/_components/LeadPanel.tsx` | Painel lateral de detalhes do lead |
| `leads/_components/LeadModal.tsx` | Modal de criação/edição de lead |
| `leads/actions.ts` | Server Actions para mutações de leads |
| `clientes/_components/ClientePanel.tsx` | Painel lateral de detalhes do cliente |
| `projetos/_components/ProjetoPanel.tsx` | Painel lateral de detalhes do projeto |
| `_components/AdminShell.tsx` | Shell geral do admin |
| `_components/AdminSidebar.tsx` | Sidebar com navegação |

---

## APIs relacionadas

| Rota | Método | Função |
|---|---|---|
| `app/api/leads/route.ts` | POST | Cria lead via API |
| `app/api/leads/[id]/close/route.ts` | POST | Fecha/encerra um lead |
| `app/api/contato/route.ts` | POST | Recebe contato do site público |

---

## Observações importantes

- **Landing `/oferta`** usa `formsubmit.co` — leads gerados lá **não entram automaticamente** na tabela `leads`. Integração pendente.
- **IA de qualificação** usa Gemini (`lib/gemini.ts`) para pontuar leads com `ai_score` e `ai_reasoning`.
- **Autenticação** via Supabase SSR (`lib/supabase-server.ts` + `middleware.ts`).
- **Nichos na tabela `leads`** são diferentes dos nichos em `clientes` — leads têm foco imobiliário, clientes têm categorias mais amplas.
