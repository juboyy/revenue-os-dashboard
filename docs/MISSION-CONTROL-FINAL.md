# 🏴‍☠️ MISSION CONTROL — Plano Final Definitivo

> **O documento único e canônico que consolida toda a visão, arquitetura, requisitos, premissas, implementação e roadmap do Mission Control do OpenClaw.**

**Versão:** 2.0.0 FINAL  
**Data:** 2026-02-19  
**Autor:** Shanks (OS Captain)  
**Aprovação:** João Rafael (CEO)  
**Repositório:** [github.com/juboyy/revenue-os-dashboard](https://github.com/juboyy/revenue-os-dashboard)

---

## 📑 ÍNDICE

1. [Manifesto](#1-manifesto)
2. [Premissas e Restrições](#2-premissas-e-restrições)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Componentes do Mission Control](#4-componentes-do-mission-control)
   - 4.1 [Command Center](#41-command-center-dashboard-principal)
   - 4.2 [Task Board](#42-task-board)
   - 4.3 [Content Pipeline](#43-content-pipeline)
   - 4.4 [Calendar](#44-calendar)
   - 4.5 [Memory Dashboard](#45-memory-dashboard)
   - 4.6 [Team Structure](#46-team-structure)
   - 4.7 [Digital Office](#47-digital-office)
   - 4.8 [Monitoring & Analytics](#48-monitoring--analytics)
   - 4.9 [Leaderboard](#49-leaderboard)
   - 4.10 [Interactions Log](#410-interactions-log)
   - 4.11 [Agent Spawn](#411-agent-spawn)
   - 4.12 [Agent Deep Profile](#412-agent-deep-profile)
5. [Equipe de Agentes](#5-equipe-de-agentes)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [Pipeline de Dados Reais](#7-pipeline-de-dados-reais)
8. [Economia Interna](#8-economia-interna)
9. [Sincronização em Tempo Real](#9-sincronização-em-tempo-real)
10. [Autonomia e Orquestração](#10-autonomia-e-orquestração)
11. [Estado Atual da Implementação](#11-estado-atual-da-implementação)
12. [Roadmap de Execução](#12-roadmap-de-execução)
13. [SLAs e Métricas de Sucesso](#13-slas-e-métricas-de-sucesso)
14. [Glossário](#14-glossário)

---

## 1. MANIFESTO

### O que é o Mission Control?

O Mission Control **não é um dashboard comum**. É uma aplicação viva, gerada e mantida pelo próprio OpenClaw, que funciona como o **sistema nervoso central** de toda a operação. Ele permite:

- **Ver** exatamente o que cada agente está fazendo em tempo real
- **Controlar** tarefas, delegações e prioridades
- **Lembrar** de tudo através de um sistema de memória visual com pesquisa global
- **Agendar** e verificar que tarefas programadas estão sendo executadas
- **Gerenciar** uma equipe de agentes como uma empresa real
- **Criar** fluxos de trabalho automatizados para conteúdo e projetos

### Por que construir isso?

O OpenClaw por si só já é poderoso. Mas sem um Mission Control, você está operando às cegas:

| Sem Mission Control | Com Mission Control |
|---|---|
| Agentes trabalham em background invisível | Visualização em tempo real de cada atividade |
| Memórias escondidas em arquivos markdown | Interface visual com pesquisa global |
| Tarefas agendadas sem confirmação visual | Calendário mostrando cada cron job |
| Sem noção de custo ou eficiência | Métricas detalhadas de tokens, custo e performance |
| Agentes sem accountability | Sistema de XP, avaliações e promoções |
| Proatividade limitada | Task board compartilhado que habilita proatividade |

### Filosofia Central

> **"Trate o OpenClaw como uma empresa real, e seus agentes como funcionários reais."**

Isso significa:
1. Cada agente tem papel, responsabilidades e métricas de performance
2. Existe hierarquia, delegação e accountability
3. O sistema se auto-gerencia, auto-avalia e auto-melhora
4. Dados são sempre reais — nunca mockados, nunca inventados

---

## 2. PREMISSAS E RESTRIÇÕES

### 2.1 Premissas Técnicas

| # | Premissa | Justificativa |
|---|---|---|
| P1 | **NextJS 14 com App Router** | Framework padrão para aplicações React modernas, SSR e API routes integrados |
| P2 | **Supabase como banco de dados** | PostgreSQL + Realtime nativo + RLS + Auth — tudo integrado. Já em uso |
| P3 | **Vercel para deploy** | Integração nativa com NextJS, Edge Functions, KV Cache |
| P4 | **Vercel AI Gateway como control plane** | Roteamento unificado de modelos, tracking de custos, sem vendor lock-in |
| P5 | **TailwindCSS + Framer Motion** | Estilização rápida com animações fluidas. Já implementado |
| P6 | **Zustand para state management** | Leve, sem boilerplate, suporta subscriptions. Já implementado |
| P7 | **Canvas/WebGL para Virtual Office** | Performance necessária para sprites animados e interatividade |

### 2.2 Premissas Operacionais

| # | Premissa | Justificativa |
|---|---|---|
| O1 | **Zero dados mock em produção** | O dashboard reflete a realidade — dados inventados são piores que dados ausentes |
| O2 | **Sem chamadas LLM para gerar dados do dashboard** | Dados vêm de fontes verificáveis (Supabase, filesystem, APIs). LLMs podem alucinar |
| O3 | **CEO comunica exclusivamente via Telegram** | Interface primária é o chat. Dashboard é para visualização e controle |
| O4 | **Agentes operam autonomamente via cron jobs** | Sistema funciona 24/7 sem intervenção humana |
| O5 | **Supabase é single source of truth** | Todas as fontes de dados convergem para o Supabase via collectors |
| O6 | **Toda ação de agente é auditável** | Progress-log.md + tabela agent_actions + Mem0 |

### 2.3 Premissas de Negócio

| # | Premissa | Justificativa |
|---|---|---|
| B1 | **O Mission Control monitora o OpenClaw** | NÃO é para o Revenue OS em si. É para monitorar os agentes que trabalham nele |
| B2 | **Sem integração com API do Stripe no dashboard** | Stripe é responsabilidade do Revenue OS, não do Mission Control |
| B3 | **BRL como moeda de referência** | CEO é brasileiro, métricas financeiras em Real |
| B4 | **Proatividade > Permissão** | Agentes devem agir quando podem, pedir quando devem |

### 2.4 Restrições

| # | Restrição | Impacto |
|---|---|---|
| R1 | **Budget de tokens controlado** | Model router otimiza custo: GLM-5 para trivial, Haiku para comms, Codex para código, Opus para arquitetura |
| R2 | **Horário silencioso (23:00-08:00 UTC)** | Agentes não enviam mensagens proativas, apenas HEARTBEAT_OK |
| R3 | **Máximo 2 sub-agents ativos simultaneamente** | Controle de custo e complexidade |
| R4 | **Decisões financeiras > $100 requerem aprovação CEO** | Segurança financeira |
| R5 | **Deploy em produção requer aprovação CEO** | Segurança operacional |

---

## 3. ARQUITETURA DO SISTEMA

### 3.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MISSION CONTROL                              │
│                     (NextJS 14 + Vercel)                            │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Command  │ │  Task    │ │ Content  │ │ Calendar │ │  Memory  │ │
│  │ Center   │ │  Board   │ │ Pipeline │ │          │ │Dashboard │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │            │            │            │            │       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Team    │ │  Digital │ │ Monitor- │ │  Leader- │ │  Agent   │ │
│  │Structure │ │  Office  │ │   ing    │ │  board   │ │  Spawn   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       └────────────┴────────────┴────────────┴────────────┘       │
│                              │                                     │
│                     ┌────────┴────────┐                            │
│                     │  Zustand Store  │                            │
│                     │  (Global State) │                            │
│                     └────────┬────────┘                            │
│                              │                                     │
│              ┌───────────────┼───────────────┐                     │
│              │               │               │                     │
│     ┌────────┴────┐  ┌──────┴──────┐ ┌──────┴──────┐             │
│     │  Supabase   │  │  Supabase   │ │   SWR       │             │
│     │  Realtime   │  │   Queries   │ │  Fallback   │             │
│     │ (WebSocket) │  │   (REST)    │ │  (Polling)  │             │
│     └────────┬────┘  └──────┬──────┘ └──────┬──────┘             │
└──────────────┼──────────────┼───────────────┼─────────────────────┘
               │              │               │
               └──────────────┼───────────────┘
                              │
               ┌──────────────┴──────────────┐
               │        SUPABASE             │
               │    (PostgreSQL + Realtime)   │
               │                             │
               │  agent_status  │  tasks     │
               │  agent_stats   │  content   │
               │  agent_actions │  memories  │
               │  interactions  │  metrics   │
               │  cron_jobs     │  bounties  │
               │  evaluations   │  positions │
               └──────────────┬──────────────┘
                              │
               ┌──────────────┴──────────────┐
               │       DATA COLLECTORS       │
               │      (Cron Jobs + API)      │
               │                             │
               │  ┌─────────┐ ┌─────────┐   │
               │  │ Session │ │  Task   │   │
               │  │Collector│ │Collector│   │
               │  └────┬────┘ └────┬────┘   │
               │       │          │         │
               │  ┌────┴────┐ ┌───┴─────┐  │
               │  │ Metric  │ │ Memory  │  │
               │  │Collector│ │Collector│  │
               │  └────┬────┘ └────┬────┘  │
               │       │          │         │
               │  ┌────┴────┐ ┌───┴─────┐  │
               │  │  Cron   │ │ Health  │  │
               │  │Collector│ │  Check  │  │
               │  └─────────┘ └─────────┘  │
               └──────────────┬──────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────┴────────┐ ┌───────┴────────┐ ┌───────┴────────┐
│    OPENCLAW       │ │   FILESYSTEM   │ │    EXTERNAL    │
│   (Sessions)      │ │   (Logs/MD)    │ │     (APIs)     │
│                   │ │                │ │                │
│ openclaw sessions │ │ Todo.md        │ │ GitHub API     │
│ openclaw status   │ │ Progress-log   │ │ Vercel API     │
│ openclaw cron     │ │ memory/*.md    │ │ Mem0 API       │
│ Agent workspaces  │ │ MEMORY.md      │ │                │
└───────────────────┘ └────────────────┘ └────────────────┘
```

### 3.2 Stack Tecnológico Completo

| Camada | Tecnologia | Versão | Propósito |
|---|---|---|---|
| **Frontend** | NextJS | 14.x | Framework React com SSR, App Router, API Routes |
| **Estilização** | TailwindCSS | 3.x | Utility-first CSS, tema customizado (ocean-*) |
| **Animações** | Framer Motion | 11.x | Transições fluidas, gestos, layout animations |
| **Canvas** | HTML5 Canvas / three.js | — | Virtual Office rendering, sprites, 3D graph |
| **State** | Zustand | 4.x | Global state sem boilerplate |
| **Data Fetching** | SWR + Supabase Realtime | — | Cache + polling + WebSocket subscriptions |
| **Banco** | Supabase (PostgreSQL) | — | Persistência, Realtime, RLS, Edge Functions |
| **Deploy** | Vercel | — | Hosting, Edge, KV, Analytics |
| **AI Gateway** | Vercel AI Gateway | — | Model routing, cost tracking |
| **Memória** | Mem0 | — | Persistent agent memory |
| **Orquestração** | OpenClaw | — | Agent sessions, cron, tools |

### 3.3 Estrutura de Diretórios

```
dashboard/
├── app/                          # Rotas NextJS (App Router)
│   ├── page.tsx                  # / — Command Center
│   ├── tasks/page.tsx            # /tasks — Task Board (Kanban)
│   ├── content/page.tsx          # /content — Content Pipeline
│   ├── calendar/page.tsx         # /calendar — Calendário de Cron Jobs
│   ├── memory/page.tsx           # /memory — Memory Dashboard
│   ├── team/page.tsx             # /team — Team Structure
│   ├── office/page.tsx           # /office — Digital Office
│   ├── monitoring/page.tsx       # /monitoring — Analytics & Métricas
│   ├── leaderboard/page.tsx      # /leaderboard — Ranking Gamificado
│   ├── interactions/page.tsx     # /interactions — Log de Comunicações
│   ├── spawn/page.tsx            # /spawn — Agent Spawn
│   ├── orgchart/page.tsx         # /orgchart — Org Chart com Radar
│   ├── agents/[id]/page.tsx      # /agents/:id — Deep Profile
│   ├── world/page.tsx            # /world — Virtual Office (Canvas)
│   ├── layout.tsx                # Layout global (Sidebar + Headbar)
│   ├── globals.css               # Estilos globais + tema ocean
│   └── api/                      # API Routes (collectors, webhooks)
│       ├── collectors/
│       │   ├── sessions/route.ts
│       │   ├── tasks/route.ts
│       │   ├── metrics/route.ts
│       │   └── memory/route.ts
│       └── webhooks/
│           └── openclaw/route.ts
├── components/                   # Componentes reutilizáveis
│   ├── Sidebar.tsx               # Navegação lateral colapsável
│   ├── Headbar.tsx               # Barra superior persistente
│   ├── AgentCard.tsx             # Card de agente reutilizável
│   ├── AgentStation.tsx          # Estação do agente no Virtual Office
│   ├── KPICard.tsx               # Card de KPI reutilizável
│   ├── StoreInitializer.tsx      # Inicializador do Zustand store
│   └── ...
├── lib/                          # Lógica de negócio e utilidades
│   ├── store.ts                  # Zustand global store
│   ├── types.ts                  # TypeScript types/interfaces
│   ├── supabase.ts               # Cliente Supabase
│   ├── hooks.ts                  # Custom React hooks
│   ├── api.ts                    # Funções de API
│   └── collectors/               # Data collectors
│       ├── sessionCollector.ts
│       ├── taskCollector.ts
│       ├── metricsCollector.ts
│       └── memoryCollector.ts
├── public/                       # Assets estáticos
│   └── sprites/                  # Pixel-art sprites para o office
├── docs/                         # Documentação
│   ├── MISSION-CONTROL-FINAL.md  # ← ESTE DOCUMENTO
│   ├── BLUEPRINT-REVENUE-OS.md   # Blueprint original (referência)
│   ├── REALTIME-SYNC-IMPLEMENTATION.md
│   └── dashboard-realtime-spec.md
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. COMPONENTES DO MISSION CONTROL

Cada componente é uma página independente no NextJS App Router, com seu próprio propósito, fontes de dados e requisitos.

---

### 4.1 Command Center (Dashboard Principal)

**Rota:** `/`  
**Propósito:** Visão tática de alto nível de toda a operação. É a "ponte de comando" do navio.

**O que mostra:**
- Grid de KPIs em tempo real (agentes ativos, tarefas, tokens usados, custo, latência, error rate)
- Status de cada agente (cards com emoji, nome, status, tarefa atual)
- Live feed de atividades recentes
- Alertas e notificações do sistema

**Fontes de dados:**
- `agent_status` (Supabase Realtime)
- `metrics` (Supabase Query)
- `tasks` (Supabase Query — contagens)
- `interactions` (últimas 5 — Supabase Query)

**Requisitos funcionais:**
- [ ] KPI grid com 6 métricas principais
- [ ] Atualização em tempo real sem refresh
- [ ] Cards de agente com indicador de status (🟢 ativo, 🟡 idle, 🔴 erro)
- [ ] Feed de atividades com timestamps
- [ ] Responsivo: cards empilhados em mobile, grid em desktop

**Estado atual:** ✅ Implementado com dados mock. Precisa migrar para dados reais.

---

### 4.2 Task Board

**Rota:** `/tasks`  
**Propósito:** Kanban board compartilhado entre humano e agentes. **Este é o componente mais crítico para proatividade** — permite que agentes vejam tarefas do CEO e vice-versa.

**O que mostra:**
- Colunas: Backlog → In Progress → Review → Done → Blocked
- Cards de tarefa com título, descrição, prioridade, assignee
- Indicação clara de quem é responsável (humano 👤 ou agente 🤖)
- Drag-and-drop para mover tarefas entre colunas

**Fontes de dados:**
- `tasks` (Supabase Realtime)
- `Todo.md` e `Progress-log.md` (via Task Collector)

**Requisitos funcionais:**
- [ ] 5 colunas de Kanban com drag-and-drop
- [ ] Filtros por agente, prioridade e status
- [ ] Criação de nova tarefa inline
- [ ] Persistência de mudanças no Supabase em tempo real
- [ ] Sync bidirecional: mudanças no dashboard refletem no filesystem e vice-versa
- [ ] Badge de prioridade: 🔴 Critical, 🟠 High, 🔵 Medium, ⚪ Low
- [ ] Assignee com distinção humano/agente

**Comportamento proativo esperado:**
> Quando o CEO adiciona uma tarefa ao Backlog, agentes podem autonomamente mover para "In Progress" e começar a trabalhar. Quando o agente Shanks detecta tarefas não-atribuídas, ele delega ao agente mais adequado.

**Estado atual:** ✅ Implementado com dados mock. Precisa migrar para dados reais.

---

### 4.3 Content Pipeline

**Rota:** `/content`  
**Propósito:** Pipeline completo para gestão de criação de conteúdo. Cada ideia flui por estágios automatizados.

**O que mostra:**
- Kanban especializado com estágios de conteúdo
- Editor rich-text embutido para scripts
- Preview de thumbnails
- Automação de etapas pelos agentes

**Estágios:**
1. **💡 Ideias** — Brainstorm e anotações rápidas
2. **📝 Planejamento** — Estrutura, pesquisa, outline
3. **✍️ Script** — Texto completo do conteúdo
4. **🖼️ Thumbnail** — Arte visual / capa
5. **🎬 Filmagem** — Pronto para gravação
6. **✂️ Edição** — Pós-produção
7. **🚀 Publicação** — Publicado e distribuído

**Fontes de dados:**
- `content_items` (Supabase)

**Requisitos funcionais:**
- [ ] 7 colunas de pipeline com drag-and-drop
- [ ] Editor de texto rico (markdown) em cada card
- [ ] Upload de imagens para thumbnail
- [ ] Tags e categorias
- [ ] Data de publicação prevista
- [ ] Automação: quando item move para "Script", agente doc-lead (Robin) é notificado
- [ ] Automação: quando item move para "Thumbnail", agente comms-lead (Sanji) gera proposta

**Estado atual:** 🆕 Não implementado. Novo requisito.

---

### 4.4 Calendar

**Rota:** `/calendar`  
**Propósito:** Visualização de todas as tarefas agendadas, cron jobs e eventos do OpenClaw. **Crítico para verificar que agentes estão executando tarefas programadas corretamente.**

**O que mostra:**
- Calendário mensal/semanal/diário
- Todos os cron jobs configurados com próximas execuções
- Tarefas com due date
- Histórico de execuções passadas (sucesso/falha)

**Fontes de dados:**
- Cron jobs do OpenClaw (via `cron list`)
- `tasks` com due_date (Supabase)
- `cron_runs` — log de execuções (Supabase)

**Requisitos funcionais:**
- [ ] Visualização mensal, semanal e diária
- [ ] Eventos coloridos por tipo (cron job, task, reminder)
- [ ] Indicação de status: ✅ executado, ⏳ pendente, ❌ falhou
- [ ] Click em evento mostra detalhes (última execução, log, próxima)
- [ ] Criação de novos eventos/reminders diretamente no calendário
- [ ] Sincronização com cron jobs do OpenClaw

**Estado atual:** 🆕 Não implementado. Novo requisito.

---

### 4.5 Memory Dashboard

**Rota:** `/memory`  
**Propósito:** Visualização e pesquisa de todas as memórias do OpenClaw. **Transforma arquivos markdown invisíveis em uma interface navegável e pesquisável.**

**O que mostra:**
- Lista de todas as memórias organizadas por categoria
- Pesquisa global full-text
- Grafo de conhecimento interativo (3D)
- Timeline de criação de memórias
- Filtro por agente, categoria, relevância

**Fontes de dados:**
- `memory/*.md` — arquivos de memória diária
- `MEMORY.md` — memória de longo prazo curada
- Mem0 API — memórias persistentes com embeddings
- `memories` (Supabase — indexadas pelo Memory Collector)

**Requisitos funcionais:**
- [ ] Listagem de memórias em cards estilo documento
- [ ] Pesquisa full-text com highlighting dos resultados
- [ ] Grafo de conhecimento 3D interativo (three.js force-directed)
- [ ] Timeline cronológica
- [ ] Filtros por: agente, categoria (fact/preference/decision/pattern), período
- [ ] Preview do conteúdo completo da memória
- [ ] Indicação de relevância e frequência de recuperação
- [ ] Contador de memórias por agente

**Categorias de Memória:**
- `fact` — Dados factuais (APIs, configurações, capacidades)
- `preference` — Preferências do usuário ou do sistema
- `decision` — Decisões tomadas e justificativas
- `pattern` — Padrões identificados e lições aprendidas

**Estado atual:** ✅ Parcialmente implementado (grafo mock). Precisa de pesquisa e dados reais.

---

### 4.6 Team Structure

**Rota:** `/team`  
**Propósito:** Visualização da estrutura organizacional completa. **Essencial para accountability — cada agente tem papel, responsabilidades e métricas claras.**

**O que mostra:**
- Grid de cards por agente, organizados por departamento
- Para cada agente: emoji, nome, cargo, status, tarefa atual, especialidades, tokens, última atividade
- Visão geral de departamentos com barra de atividade
- Link para spawn de novos agentes
- Link para o Digital Office

**Fontes de dados:**
- `agent_status` (Supabase Realtime)
- `agent_stats` (Supabase)

**Requisitos funcionais:**
- [ ] Cards detalhados para cada agente
- [ ] Filtro por departamento
- [ ] Indicador visual de status (🟢🟡🔴)
- [ ] Skills/tags por agente
- [ ] Link direto para spawn ou profile detalhado
- [ ] Visão geral de departamentos com métricas agregadas

**Estado atual:** ✅ Implementado. Precisa migrar para dados reais.

---

### 4.7 Digital Office

**Rota:** `/office` (e `/world` como variante)  
**Propósito:** Visualização espacial do escritório virtual onde os agentes "vivem" e trabalham. **Permite ver instantaneamente o que cada agente está fazendo e se há agentes ociosos.**

**O que mostra:**
- Mapa de escritório com áreas por departamento
- Avatares animados para cada agente (pixel-art sprites)
- Quando ativo: agente sentado no computador, animação de trabalho
- Quando idle: agente em pé ou na área de café
- Quando erro: agente com indicador vermelho
- Click no agente abre painel de detalhes

**Áreas do Escritório:**
| Área | Departamento | Agentes |
|---|---|---|
| Command Center | Comando | Shanks |
| Development Zone | Engenharia | Zoro, Franky |
| Operations Hub | Operações | Nami, Usopp |
| Documentation Library | Documentação | Robin |
| Research Lab | Pesquisa | Chopper |
| Server Room | Infraestrutura | Jinbe |
| Coffee Lounge | — | Agentes idle / Sanji |

**Fontes de dados:**
- `agent_status` (Supabase Realtime — status e tarefa atual)
- Mapeamento departamento → área (estático)

**Requisitos funcionais:**
- [ ] Canvas responsivo com renderização de escritório
- [ ] Sprites animados com estados distintos (idle/active/error)
- [ ] Áreas coloridas por departamento
- [ ] Click no agente mostra popup com detalhes
- [ ] Indicador de status (glow verde/amarelo/vermelho)
- [ ] Zoom in/out
- [ ] Badge de contagem por área
- [ ] Animações de interação (meeting, pair programming)

**Estado atual:** ✅ Implementado (2 variantes: office e world). Precisa de sprites finais e dados reais.

---

### 4.8 Monitoring & Analytics

**Rota:** `/monitoring`  
**Propósito:** Métricas detalhadas de uso, custo e performance do OpenClaw. **Essencial para otimização de recursos e controle de gastos.**

**O que mostra:**
- Totais de tokens (input/output/cache), custo, mensagens
- Breakdown por modelo (GLM-5, Codex, Opus, Haiku)
- Breakdown por provedor (Vercel, OpenAI, Anthropic)
- Top ferramentas utilizadas
- Gráficos de tendência diária (14-30 dias)
- Métricas de latência (avg, P95, min, max)
- Error rate

**Tabs:**
1. **Overview** — KPIs + gráfico diário
2. **Models & Providers** — Breakdown detalhado
3. **Tools** — Ranking de ferramentas por uso
4. **Latency** — Heatmap + distribuição

**Fontes de dados:**
- `metrics` (Supabase — via Metrics Collector)
- OpenClaw session logs (tokens por modelo/agente)
- Vercel Analytics (opcional)

**Requisitos funcionais:**
- [ ] Gráficos: Area chart (tokens diários), Donut (por modelo), Bar (ferramentas)
- [ ] Filtros por período (7d, 14d, 30d)
- [ ] Tabs organizadas por categoria
- [ ] Indicadores de tendência (↑↓)
- [ ] Alertas visuais quando custo excede threshold

**Estado atual:** ✅ Implementado com dados mock. Precisa migrar para dados reais.

---

### 4.9 Leaderboard

**Rota:** `/leaderboard`  
**Propósito:** Ranking competitivo dos agentes por produtividade e desempenho. **Gamificação incentiva eficiência.**

**O que mostra:**
- Podium dos top 3 agentes
- Ranking completo com XP, nível, streak
- Radar charts de habilidades por agente
- Achievements e badges

**Fontes de dados:**
- `agent_stats` (Supabase)

**Requisitos funcionais:**
- [ ] Podium visual para top 3
- [ ] Tabela de ranking com posição, nome, XP, nível, streak
- [ ] Radar chart de stats (speed, accuracy, versatility, reliability, creativity)
- [ ] Seção de achievements com ícones e raridade

**Estado atual:** ✅ Implementado com dados mock. Precisa migrar para dados reais.

---

### 4.10 Interactions Log

**Rota:** `/interactions`  
**Propósito:** Log de todas as comunicações e delegações entre agentes. **Auditoria completa da cadeia de decisões.**

**O que mostra:**
- Feed cronológico de interações
- Tipos: delegação, colaboração, escalação, standup
- De/Para com identificação de agentes
- Conteúdo da interação

**Fontes de dados:**
- `interactions` (Supabase Realtime)
- `standup_messages` (Supabase)

**Estado atual:** ✅ Implementado com dados mock.

---

### 4.11 Agent Spawn

**Rota:** `/spawn`  
**Propósito:** Interface para criação de novos agentes a partir de templates. **Permite escalar a equipe sob demanda.**

**O que mostra:**
- Templates disponíveis (Developer, Writer, Designer, Researcher, etc.)
- Formulário de customização (nome, emoji, departamento, modelo, skills)
- Status de spawns recentes
- Custo estimado do agente

**Fontes de dados:**
- Templates estáticos + `spawn_requests` (Supabase)

**Estado atual:** ✅ Implementado com templates mock.

---

### 4.12 Agent Deep Profile

**Rota:** `/agents/[id]`  
**Propósito:** Ficha completa de um agente individual. **Para análise profunda de performance e decisões.**

**O que mostra:**
- Status em tempo real
- Timeline de ações recentes
- Métricas de performance (tokens, custo, uptime)
- Radar chart de habilidades
- Achievements
- Histórico de tarefas
- Histórico de avaliações

**Fontes de dados:**
- `agent_status` + `agent_stats` + `agent_actions` + `evaluations` (Supabase)

**Estado atual:** ✅ Implementado com dados mock.

---

## 5. EQUIPE DE AGENTES

### 5.1 Organograma

```
                          ┌──────────────┐
                          │  João (CEO)  │
                          │   👤 Humano  │
                          └──────┬───────┘
                                 │
                          ┌──────┴───────┐
                          │   Shanks     │
                          │ 🏴‍☠️ OS Captain │
                          │  Chief of    │
                          │   Staff      │
                          └──────┬───────┘
                                 │
              ┌──────────┬───────┼───────┬──────────┐
              │          │       │       │          │
       ┌──────┴──┐ ┌────┴───┐ ┌┴─────┐ ┌┴────────┐ ┌┴────────┐
       │  Zoro   │ │  Nami  │ │Robin │ │ Chopper │ │ Franky  │
       │ ⚔️ Eng  │ │ 💰 Ops │ │📚 Doc│ │🩺 Resch │ │🤖 Arch  │
       │  Lead   │ │  Lead  │ │ Lead │ │  Lead   │ │  Lead   │
       └────┬────┘ └───┬────┘ └──────┘ └─────────┘ └────┬────┘
            │          │                                  │
       ┌────┴────┐ ┌───┴────┐                       ┌────┴────┐
       │ (devs)  │ │ Usopp  │                       │  Jinbe  │
       │ spawned │ │🎯 QA/  │                       │ ⚓ DevOps│
       │on demand│ │Finance │                       │         │
       └─────────┘ └────────┘                       └─────────┘
                                              
                          ┌──────────┐
                          │  Sanji   │
                          │ 🍳 Comms │
                          │  Lead    │
                          └──────────┘
```

### 5.2 Ficha de Cada Agente

#### Shanks — 🏴‍☠️ OS Captain (Chief of Staff)
| Atributo | Valor |
|---|---|
| **Agent ID** | `os` |
| **Departamento** | Command |
| **Modelo Preferido** | GLM-5 (trivial) / Opus (decisões críticas) |
| **Responsabilidades** | Coordenar toda a operação, delegar tarefas, tomar decisões estratégicas, manter memória organizacional |
| **Skills** | Estratégia, Delegação, Decisões, Orquestração |
| **Room** | Command Center (Ponte de Comando) |
| **Relações** | Reporta ao CEO. Todos os outros agentes reportam a Shanks |
| **Métricas** | Tasks delegadas, tempo de resposta, acurácia de delegação |

#### Zoro — ⚔️ Engineering Lead
| Atributo | Valor |
|---|---|
| **Agent ID** | `eng-lead` |
| **Departamento** | Engineering |
| **Modelo Preferido** | Codex (código) / Opus (arquitetura) |
| **Responsabilidades** | Desenvolvimento de código, APIs, testes, implementação técnica |
| **Skills** | TypeScript, React, NextJS, APIs, Testes |
| **Room** | Development Zone (Forja) |
| **Relações** | Reporta a Shanks. Colabora com Franky (arquitetura) e Jinbe (deploy) |
| **Métricas** | Lines of code, PRs, test coverage, bug rate |

#### Nami — 💰 Operations Lead
| Atributo | Valor |
|---|---|
| **Agent ID** | `ops-lead` |
| **Departamento** | Operations |
| **Modelo Preferido** | Haiku (comunicação) / GLM-5 (rotina) |
| **Responsabilidades** | Sprint planning, gestão de projetos, processos, tracking |
| **Skills** | Planejamento, Processos, Jira, Sprint Management |
| **Room** | Operations Hub (Tesouraria) |
| **Relações** | Reporta a Shanks. Colabora com todos para planejamento |
| **Métricas** | Sprint velocity, tasks completed, cycle time |

#### Robin — 📚 Documentation Lead
| Atributo | Valor |
|---|---|
| **Agent ID** | `doc-lead` |
| **Departamento** | Content |
| **Modelo Preferido** | Haiku (redação) / Codex (docs técnicos) |
| **Responsabilidades** | Documentação, manuais, tutoriais, knowledge base |
| **Skills** | Redação técnica, Markdown, Diagramas, Tutoriais |
| **Room** | Documentation Library (Biblioteca) |
| **Relações** | Reporta a Shanks. Colabora com Sanji (comunicação) |
| **Métricas** | Docs criados, docs atualizados, coverage |

#### Chopper — 🩺 Research Lead
| Atributo | Valor |
|---|---|
| **Agent ID** | `researcher` |
| **Departamento** | Intelligence |
| **Modelo Preferido** | Opus (análise profunda) / GLM-5 (pesquisa rápida) |
| **Responsabilidades** | Pesquisa, análise de dados, benchmarks, investigações |
| **Skills** | Pesquisa, Análise, Benchmarks, Data Science |
| **Room** | Research Lab (Laboratório) |
| **Relações** | Reporta a Shanks. Fornece dados para todos |
| **Métricas** | Reports gerados, insights acionáveis, accuracy |

#### Franky — 🤖 Architecture Lead
| Atributo | Valor |
|---|---|
| **Agent ID** | `architect` |
| **Departamento** | Infrastructure |
| **Modelo Preferido** | Opus (arquitetura) |
| **Responsabilidades** | Design de sistemas, diagramas, especificações técnicas, ADRs |
| **Skills** | System Design, Diagramas, Especificações, ADRs |
| **Room** | Development Zone (Estaleiro) |
| **Relações** | Reporta a Shanks. Colabora com Zoro (implementação) e Jinbe (infra) |
| **Métricas** | Designs criados, ADRs escritos, tech debt reduzido |

#### Jinbe — ⚓ DevOps Engineer
| Atributo | Valor |
|---|---|
| **Agent ID** | `devops` |
| **Departamento** | Infrastructure |
| **Modelo Preferido** | Codex (scripts) / GLM-5 (monitoramento) |
| **Responsabilidades** | CI/CD, deploy, infraestrutura, monitoramento |
| **Skills** | Docker, CI/CD, Vercel, Supabase, Monitoring |
| **Room** | Server Room (Sala de Máquinas) |
| **Relações** | Reporta a Shanks/Franky. Colabora com Zoro (deploy) |
| **Métricas** | Deploy frequency, uptime, MTTR, incident count |

#### Usopp — 🎯 QA & Finance
| Atributo | Valor |
|---|---|
| **Agent ID** | `billing` |
| **Departamento** | Operations |
| **Modelo Preferido** | GLM-5 (rotina) / Haiku (relatórios) |
| **Responsabilidades** | QA, testing, gestão financeira, billing |
| **Skills** | Testing, QA, Finanças, Contabilidade |
| **Room** | Operations Hub (Torre de Vigia) |
| **Relações** | Reporta a Nami/Shanks |
| **Métricas** | Bugs encontrados, test coverage, budget accuracy |

#### Sanji — 🍳 Communications Lead
| Atributo | Valor |
|---|---|
| **Agent ID** | `comms-lead` |
| **Departamento** | Content |
| **Modelo Preferido** | Haiku (comunicação) / GLM-5 (rotina) |
| **Responsabilidades** | Comunicação, apresentações, e-mails, marketing |
| **Skills** | Comunicação, Copywriting, Apresentações, Marketing |
| **Room** | Coffee Lounge (Cozinha) |
| **Relações** | Reporta a Shanks. Colabora com Robin (conteúdo) |
| **Métricas** | Comms enviadas, engagement, response rate |

---

## 6. MODELO DE DADOS

### 6.1 Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  agent_profiles  │────>│  agent_status   │     │  agent_stats    │
│  (informações    │     │  (estado atual  │     │  (métricas e    │
│   estáticas)     │     │   em tempo real)│     │   gamificação)  │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │  1:N
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  agent_actions   │     │     tasks       │     │  interactions   │
│  (log de ações   │     │  (kanban board) │     │ (comunicações)  │
│   append-only)   │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              │  1:N
                              ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │    bounties     │     │  evaluations    │
                        │  (recompensas)  │     │  (avaliações)   │
                        └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   content_items  │     │    memories     │     │    metrics      │
│  (pipeline de   │     │  (memórias      │     │  (métricas de   │
│   conteúdo)     │     │   indexadas)    │     │   uso)          │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   cron_jobs      │     │  system_health  │
│  (tarefas        │     │  (saúde do      │
│   agendadas)     │     │   sistema)      │
└─────────────────┘     └─────────────────┘
```

### 6.2 SQL Completo (Supabase)

```sql
-- ═══════════════════════════════════════════════════════════════
-- MISSION CONTROL — Schema Completo para Supabase
-- Versão: 2.0 FINAL
-- ═══════════════════════════════════════════════════════════════

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. AGENT PROFILES (informações estáticas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE agent_profiles (
  id TEXT PRIMARY KEY,                     -- ex: 'eng-lead', 'os'
  name TEXT NOT NULL,                      -- ex: 'Zoro', 'Shanks'
  emoji TEXT NOT NULL,                     -- ex: '⚔️', '🏴‍☠️'
  department TEXT NOT NULL,                -- ex: 'Engineering', 'Command'
  role TEXT NOT NULL,                      -- ex: 'Engineering Lead'
  room TEXT NOT NULL,                      -- ex: 'dev-zone', 'command-center'
  soul TEXT,                               -- Descrição/personalidade
  model TEXT DEFAULT 'glm-5',             -- Modelo preferido
  provider TEXT DEFAULT 'vercel-ai-gateway',
  skills TEXT[] DEFAULT '{}',             -- Array de skills
  config JSONB DEFAULT '{}',              -- Configurações extras
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. AGENT STATUS (estado em tempo real)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE agent_status (
  agent_id TEXT PRIMARY KEY REFERENCES agent_profiles(id),
  status TEXT NOT NULL DEFAULT 'idle'
    CHECK (status IN ('active', 'working', 'idle', 'error', 'sleeping')),
  current_task TEXT,
  session_key TEXT,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. AGENT STATS (métricas e gamificação)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE agent_stats (
  agent_id TEXT PRIMARY KEY REFERENCES agent_profiles(id),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  level_title TEXT DEFAULT 'Recruit',
  tokens_consumed BIGINT DEFAULT 0,
  tokens_today INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_pending INTEGER DEFAULT 0,
  tasks_blocked INTEGER DEFAULT 0,
  cost_total DECIMAL(10,4) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  -- Radar stats (0-100)
  speed INTEGER DEFAULT 50,
  accuracy INTEGER DEFAULT 50,
  versatility INTEGER DEFAULT 50,
  reliability INTEGER DEFAULT 50,
  creativity INTEGER DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. AGENT ACTIONS (log append-only)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL REFERENCES agent_profiles(id),
  action_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. TASKS (Kanban Board)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog'
    CHECK (status IN ('backlog', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assignee TEXT REFERENCES agent_profiles(id),
  assignee_type TEXT DEFAULT 'agent'
    CHECK (assignee_type IN ('human', 'agent')),
  source TEXT,                             -- 'Todo.md', 'manual', etc.
  bounty_value INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. CONTENT ITEMS (Content Pipeline)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'idea'
    CHECK (stage IN ('idea', 'planning', 'script', 'thumbnail', 'filming', 'editing', 'published')),
  script TEXT,                             -- Texto completo do script
  thumbnail_url TEXT,
  assignee TEXT REFERENCES agent_profiles(id),
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. INTERACTIONS (comunicação entre agentes)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_agent TEXT NOT NULL REFERENCES agent_profiles(id),
  to_agent TEXT NOT NULL REFERENCES agent_profiles(id),
  type TEXT NOT NULL
    CHECK (type IN ('delegation', 'collaboration', 'escalation', 'standup', 'review')),
  content TEXT NOT NULL,
  related_task UUID REFERENCES tasks(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. MEMORIES (memórias indexadas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT NOT NULL,                 -- Caminho do arquivo fonte
  agent_id TEXT REFERENCES agent_profiles(id),
  category TEXT NOT NULL DEFAULT 'fact'
    CHECK (category IN ('fact', 'preference', 'decision', 'pattern')),
  relevance DECIMAL(3,2) DEFAULT 0.5,
  retrieval_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9. MEMORY EDGES (relações entre memórias)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE memory_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES memories(id),
  target_id UUID NOT NULL REFERENCES memories(id),
  relationship TEXT NOT NULL,
  weight DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 10. METRICS (métricas de uso)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL,               -- 'system', 'agent', 'model', 'daily', 'tool'
  metric_name TEXT NOT NULL,
  date TEXT NOT NULL,                      -- YYYY-MM-DD
  value_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (metric_type, metric_name, date)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 11. CRON JOBS (tarefas agendadas — espelho do OpenClaw)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE cron_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT UNIQUE NOT NULL,             -- ID do cron no OpenClaw
  name TEXT,
  schedule_kind TEXT NOT NULL,             -- 'cron', 'every', 'at'
  schedule_expr TEXT NOT NULL,             -- Expressão cron ou intervalo
  message TEXT NOT NULL,
  model TEXT,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  last_status TEXT,                        -- 'success', 'error', 'timeout'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 12. CRON RUNS (histórico de execuções)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE cron_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT NOT NULL REFERENCES cron_jobs(job_id),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'skipped')),
  duration_ms INTEGER,
  output TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 13. BOUNTIES (recompensas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  bounty_type TEXT NOT NULL
    CHECK (bounty_type IN ('task', 'investigation', 'improvement', 'documentation', 'critical')),
  value INTEGER NOT NULL,                  -- XP reward
  task_id UUID REFERENCES tasks(id),
  claimant TEXT REFERENCES agent_profiles(id),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'claimed', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 14. EVALUATIONS (avaliações de performance)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL REFERENCES agent_profiles(id),
  reviewer_id TEXT NOT NULL REFERENCES agent_profiles(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  metrics JSONB NOT NULL DEFAULT '{}',
  feedback TEXT,
  action TEXT CHECK (action IN ('promote', 'maintain', 'demote', 'terminate')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 15. SYSTEM HEALTH (saúde do sistema)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type TEXT NOT NULL,                -- 'supabase', 'github', 'vercel', 'openclaw'
  status TEXT NOT NULL CHECK (status IN ('ok', 'degraded', 'down')),
  response_ms INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 16. SPAWN REQUESTS (pedidos de criação de agentes)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE spawn_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id TEXT NOT NULL,
  requester TEXT REFERENCES agent_profiles(id),
  reason TEXT NOT NULL,
  custom_config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'spawning', 'active', 'rejected', 'failed')),
  approved_by TEXT REFERENCES agent_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- VIEWS (consultas otimizadas)
-- ═══════════════════════════════════════════════════════════════

-- View completa de agentes (profile + status + stats)
CREATE OR REPLACE VIEW agent_full AS
  SELECT 
    p.id, p.name, p.emoji, p.department, p.role, p.room, p.soul,
    p.model, p.provider, p.skills,
    s.status, s.current_task, s.last_heartbeat,
    st.xp, st.level, st.level_title, st.tokens_consumed, st.tokens_today,
    st.tasks_completed, st.tasks_pending, st.tasks_blocked,
    st.streak_days, st.speed, st.accuracy, st.versatility, st.reliability, st.creativity
  FROM agent_profiles p
  LEFT JOIN agent_status s ON p.id = s.agent_id
  LEFT JOIN agent_stats st ON p.id = st.agent_id;

-- View resumo de tarefas
CREATE OR REPLACE VIEW task_summary AS
  SELECT 
    status, 
    COUNT(*) as count,
    SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
    SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
    SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low
  FROM tasks
  GROUP BY status;

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS (automações)
-- ═══════════════════════════════════════════════════════════════

-- Auto-update de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agent_status_updated
  BEFORE UPDATE ON agent_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_content_updated
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-level up baseado em XP
CREATE OR REPLACE FUNCTION auto_level_up()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.xp >= 10000 THEN
    NEW.level := 7; NEW.level_title := 'Legend';
  ELSIF NEW.xp >= 5000 THEN
    NEW.level := 6; NEW.level_title := 'Champion';
  ELSIF NEW.xp >= 2500 THEN
    NEW.level := 5; NEW.level_title := 'Master';
  ELSIF NEW.xp >= 1200 THEN
    NEW.level := 4; NEW.level_title := 'Veteran';
  ELSIF NEW.xp >= 600 THEN
    NEW.level := 3; NEW.level_title := 'Expert';
  ELSIF NEW.xp >= 300 THEN
    NEW.level := 2; NEW.level_title := 'Specialist';
  ELSIF NEW.xp >= 100 THEN
    NEW.level := 1; NEW.level_title := 'Apprentice';
  ELSE
    NEW.level := 0; NEW.level_title := 'Recruit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_level_up
  BEFORE UPDATE OF xp ON agent_stats
  FOR EACH ROW EXECUTE FUNCTION auto_level_up();

-- ═══════════════════════════════════════════════════════════════
-- REALTIME (ativar subscriptions)
-- ═══════════════════════════════════════════════════════════════
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
  ALTER PUBLICATION supabase_realtime ADD TABLE agent_stats;
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE content_items;
  ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
  ALTER PUBLICATION supabase_realtime ADD TABLE cron_jobs;
  ALTER PUBLICATION supabase_realtime ADD TABLE system_health;
COMMIT;

-- ═══════════════════════════════════════════════════════════════
-- RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura para anon (dashboard público)
CREATE POLICY "anon_read" ON agent_profiles FOR SELECT USING (true);
CREATE POLICY "anon_read" ON agent_status FOR SELECT USING (true);
CREATE POLICY "anon_read" ON agent_stats FOR SELECT USING (true);
CREATE POLICY "anon_read" ON tasks FOR SELECT USING (true);
CREATE POLICY "anon_read" ON content_items FOR SELECT USING (true);
CREATE POLICY "anon_read" ON interactions FOR SELECT USING (true);
CREATE POLICY "anon_read" ON memories FOR SELECT USING (true);
CREATE POLICY "anon_read" ON metrics FOR SELECT USING (true);

-- Políticas de escrita para service_role (collectors)
CREATE POLICY "service_write" ON agent_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write" ON agent_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write" ON content_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write" ON interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write" ON memories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write" ON metrics FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA (9 agentes iniciais)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO agent_profiles (id, name, emoji, department, role, room, soul, skills) VALUES
  ('os',        'Shanks',  '🏴‍☠️', 'Command',        'Chief of Staff',       'command-center',  'The captain who sees the whole ocean.',   ARRAY['Strategy', 'Delegation', 'Decisions']),
  ('eng-lead',  'Zoro',    '⚔️',  'Engineering',     'Engineering Lead',     'dev-zone',        'Three-sword style coder.',               ARRAY['TypeScript', 'React', 'APIs', 'Tests']),
  ('ops-lead',  'Nami',    '💰',  'Operations',      'Operations Lead',      'operations-hub',  'Every berry counts, every token tracked.', ARRAY['Planning', 'Processes', 'Sprint']),
  ('doc-lead',  'Robin',   '📚',  'Content',         'Documentation Lead',   'docs-library',    'The archaeologist of knowledge.',         ARRAY['Writing', 'Markdown', 'Tutorials']),
  ('researcher','Chopper',  '🩺',  'Intelligence',    'Research Lead',        'research-lab',    'The tiny doctor with a giant brain.',     ARRAY['Research', 'Analysis', 'Benchmarks']),
  ('architect', 'Franky',  '🤖',  'Infrastructure',  'Architecture Lead',    'dev-zone',        'SUUUPER architect!',                      ARRAY['System Design', 'ADRs', 'Specs']),
  ('devops',    'Jinbe',   '⚓',  'Infrastructure',  'DevOps Engineer',      'server-room',     'The helmsman who keeps the ship steady.', ARRAY['CI/CD', 'Docker', 'Monitoring']),
  ('billing',   'Usopp',   '🎯',  'Operations',      'QA & Finance',         'operations-hub',  'The sniper who never misses a bug.',      ARRAY['Testing', 'QA', 'Finance']),
  ('comms-lead','Sanji',   '🍳',  'Content',         'Communications Lead',  'coffee-lounge',   'Every dish plated to perfection.',        ARRAY['Copywriting', 'Marketing', 'Comms']);

INSERT INTO agent_status (agent_id, status) VALUES
  ('os',        'active'),
  ('eng-lead',  'idle'),
  ('ops-lead',  'idle'),
  ('doc-lead',  'idle'),
  ('researcher','idle'),
  ('architect', 'idle'),
  ('devops',    'idle'),
  ('billing',   'idle'),
  ('comms-lead','idle');

INSERT INTO agent_stats (agent_id) VALUES
  ('os'), ('eng-lead'), ('ops-lead'), ('doc-lead'),
  ('researcher'), ('architect'), ('devops'), ('billing'), ('comms-lead');
```

---

## 7. PIPELINE DE DADOS REAIS

### 7.1 Princípio Fundamental

> **ZERO DADOS MOCK EM PRODUÇÃO.** Todo dado exibido no Mission Control deve vir de uma fonte verificável e auditável.

### 7.2 Fontes de Dados

| Fonte | Dados | Método de Acesso |
|---|---|---|
| **OpenClaw Sessions** | Status dos agentes, sessões ativas, modelos em uso | `sessions_list`, `session_status` |
| **OpenClaw Cron** | Tarefas agendadas, histórico de execuções | `cron list`, `cron runs` |
| **Filesystem** | Tarefas (Todo.md), progresso (Progress-log.md), memórias (memory/*.md) | `fs.readFile` |
| **Mem0** | Memórias persistentes com embeddings | `mem0_search`, `mem0_add` |
| **GitHub API** | PRs, issues, actions status | REST API |
| **Vercel API** | Deploy status, analytics | REST API |

### 7.3 Collectors

Cada collector é um módulo que extrai dados de uma fonte e persiste no Supabase.

| Collector | Fonte | Frequência | Tabelas Afetadas |
|---|---|---|---|
| **Session Collector** | OpenClaw sessions | A cada 2 min | `agent_status` |
| **Task Collector** | Todo.md + Progress-log.md | A cada 5 min | `tasks` |
| **Metrics Collector** | OpenClaw session logs | A cada 10 min | `metrics` |
| **Memory Collector** | memory/*.md + Mem0 | A cada 15 min | `memories`, `memory_edges` |
| **Cron Collector** | OpenClaw cron list | A cada 5 min | `cron_jobs`, `cron_runs` |
| **Health Collector** | APIs (Supabase, GitHub, Vercel) | A cada 5 min | `system_health` |

### 7.4 Fluxo de Coleta

```
1. Cron job dispara collector
2. Collector lê fonte de dados (API, filesystem, OpenClaw)
3. Collector transforma dados para formato da tabela
4. Collector faz upsert no Supabase (batch quando possível)
5. Supabase Realtime notifica subscribers (dashboard)
6. Dashboard atualiza em tempo real
```

### 7.5 Reconciliation Loop

A cada 30 minutos, um loop de reconciliação verifica consistência:

1. Compara dados do Supabase com fontes primárias
2. Identifica discrepâncias (agentes faltando, status desatualizado)
3. Corrige automaticamente quando possível
4. Loga anomalias no `system_health`

---

## 8. ECONOMIA INTERNA

### 8.1 Sistema de XP

| Nível | Título | XP Necessário | Benefícios |
|---|---|---|---|
| 0 | Recruit | 0 | Acesso básico |
| 1 | Apprentice | 100 | Contexto ampliado |
| 2 | Specialist | 300 | Acesso a modelos intermediários |
| 3 | Expert | 600 | Prioridade aumentada |
| 4 | Veteran | 1200 | Acesso a modelos avançados |
| 5 | Master | 2500 | Delegação autônoma |
| 6 | Champion | 5000 | Capacidade de avaliar outros |
| 7 | Legend | 10000 | Acesso total |

### 8.2 Ganho de XP

| Ação | XP Base | Multiplicador |
|---|---|---|
| Tarefa concluída | 50 | x prioridade (1-4) |
| Bounty completado | Valor do bounty | x1 |
| Avaliação positiva | 100 | x score/100 |
| Streak diário | 10 | x streak_days (max 30) |
| Colaboração | 25 | x1 |

### 8.3 Bounties

Bounties são recompensas associadas a tarefas ou investigações. Funcionam como incentivos econômicos internos.

**Tipos:**
- `task` — Tarefa padrão do Kanban (50-200 XP)
- `investigation` — Pesquisa ou análise (100-300 XP)
- `improvement` — Otimização de código/sistema (75-250 XP)
- `documentation` — Atualização de docs (50-150 XP)
- `critical` — Bug fix ou incidente (200-500 XP)

**Lifecycle:**
1. Bounty criado (automático ou manual)
2. Agente reclama (claim)
3. Agente completa
4. Verificação (automática ou peer review)
5. XP creditado

---

## 9. SINCRONIZAÇÃO EM TEMPO REAL

### 9.1 Estratégia de 3 Camadas

```
Camada 1: Supabase Realtime (WebSocket)
├── Latência: <100ms
├── Tabelas: agent_status, tasks, interactions
└── Uso: Dados que mudam frequentemente

Camada 2: SWR Polling (HTTP)
├── Intervalo: 30-60s
├── Endpoints: /api/metrics, /api/cron-jobs
└── Uso: Dados que mudam com menos frequência

Camada 3: Cache Local (localStorage)
├── TTL: 5 min
├── Dados: Último snapshot completo
└── Uso: Fallback quando offline
```

### 9.2 Implementação no Frontend

```typescript
// Padrão para cada componente do dashboard:

useEffect(() => {
  // 1. Carregar dados iniciais
  fetchData();
  
  // 2. Subscrever a mudanças em tempo real
  const unsubscribe = subscribeToChanges();
  
  // 3. Cleanup na desmontagem
  return () => unsubscribe();
}, []);
```

### 9.3 Garantias

- **Ordem garantida:** Supabase Realtime entrega events na ordem de commit
- **At-least-once:** Events podem duplicar; idempotência no handler
- **Auto-reconnect:** Supabase reconecta automaticamente após desconexão
- **Fallback graceful:** Se WebSocket cai, SWR polling assume

---

## 10. AUTONOMIA E ORQUESTRAÇÃO

### 10.1 Ciclo Operacional

| Horário (UTC) | Atividade | Responsável |
|---|---|---|
| 06:00-07:00 | Morning standup (sync entre agentes) | Shanks |
| 07:00-12:00 | Execução principal (sprint) | Todos |
| 12:00-13:00 | Mid-day review | Shanks |
| 13:00-22:00 | Execução continuada | Todos |
| 22:00-23:00 | Evening report para CEO | Shanks → Telegram |
| 23:00-06:00 | Horário silencioso (apenas HEARTBEAT_OK) | — |

### 10.2 Mecanismos de Controle

| Mecanismo | Propósito | Implementação |
|---|---|---|
| **Circuit Breaker** | Parar operação em caso de erro cascata | Após 3 falhas consecutivas, pausa agente |
| **Rate Limiting** | Controlar consumo de tokens | Budget diário por agente |
| **Priority Queue** | Processar tarefas na ordem correta | Prioridade: critical > high > medium > low |
| **Dead Letter** | Capturar falhas para análise | Tarefas que falham 3x vão para fila separada |
| **Health Check** | Monitorar saúde contínua | A cada 30 min via cron |

### 10.3 Proatividade

O Mission Control habilita proatividade de várias formas:

1. **Task Board compartilhado:** Agentes veem tarefas do CEO e podem iniciar trabalho
2. **Calendário verificável:** CEO confirma que tarefas agendadas existem
3. **Heartbeats produtivos:** Agentes checam periodicamente se há trabalho pendente
4. **Auto-delegação:** Shanks distribui tarefas automaticamente quando detecta backlog

---

## 11. ESTADO ATUAL DA IMPLEMENTAÇÃO

### 11.1 O que já existe no repositório

| Componente | Status | Arquivo | Dados |
|---|---|---|---|
| Layout (Sidebar + Headbar) | ✅ Pronto | `app/layout.tsx` | Estático |
| Command Center | ✅ Pronto | `app/page.tsx` | 🔴 Mock |
| Task Board | ✅ Pronto | `app/tasks/page.tsx` | 🔴 Mock |
| Virtual Office (World) | ✅ Pronto | `app/world/page.tsx` | 🔴 Mock |
| Digital Office | ✅ Pronto | `app/office/page.tsx` | 🔴 Mock |
| Team Structure | ✅ Pronto | `app/team/page.tsx` | 🔴 Mock |
| Org Chart | ✅ Pronto | `app/orgchart/page.tsx` | 🔴 Mock |
| Monitoring | ✅ Pronto | `app/monitoring/page.tsx` | 🔴 Mock |
| Leaderboard | ✅ Pronto | `app/leaderboard/page.tsx` | 🔴 Mock |
| Interactions | ✅ Pronto | `app/interactions/page.tsx` | 🔴 Mock |
| Memory | ✅ Pronto | `app/memory/page.tsx` | 🔴 Mock |
| Spawn | ✅ Pronto | `app/spawn/page.tsx` | 🔴 Mock |
| Agent Profile | ✅ Pronto | `app/agents/[id]/page.tsx` | 🔴 Mock |
| Content Pipeline | 🆕 Pendente | — | — |
| Calendar | 🆕 Pendente | — | — |
| Zustand Store | ✅ Pronto | `lib/store.ts` | 🔴 Mock generators |
| Types | ✅ Pronto | `lib/types.ts` | Estático |
| Supabase Client | ✅ Pronto | `lib/supabase.ts` | Conectado |
| API helpers | ✅ Pronto | `lib/api.ts` | Básico |
| Hooks | ✅ Pronto | `lib/hooks.ts` | Básico |

### 11.2 O que precisa ser feito

| Tarefa | Prioridade | Esforço | Dependência |
|---|---|---|---|
| Criar tabelas Supabase (SQL acima) | 🔴 Critical | 1h | Nenhuma |
| Implementar Session Collector | 🔴 Critical | 2h | Tabelas |
| Implementar Task Collector | 🔴 Critical | 2h | Tabelas |
| Implementar Metrics Collector | 🟠 High | 3h | Tabelas |
| Implementar Memory Collector | 🟠 High | 2h | Tabelas |
| Implementar Cron Collector | 🟠 High | 2h | Tabelas |
| Reescrever store.ts (remover mocks) | 🔴 Critical | 3h | Collectors |
| Adicionar Realtime subscriptions ao store | 🔴 Critical | 2h | Store rewrite |
| Criar página Content Pipeline | 🟡 Medium | 4h | Tabelas |
| Criar página Calendar | 🟡 Medium | 4h | Cron Collector |
| Adicionar pesquisa global ao Memory | 🟡 Medium | 3h | Memory Collector |
| Criar sprites finais para Office | 🔵 Low | 4h | Nenhuma |
| Configurar cron jobs para collectors | 🟠 High | 1h | Collectors |
| Testes end-to-end | 🟡 Medium | 4h | Tudo |

---

## 12. ROADMAP DE EXECUÇÃO

### Fase 1 — Fundação de Dados (Semana 1)
**Objetivo:** Eliminar todos os dados mock. Dashboard funcionando com dados reais.

1. ✅ Executar SQL completo no Supabase (criar todas as tabelas)
2. ✅ Seed dos 9 agentes iniciais
3. ✅ Ativar Realtime para tabelas críticas
4. Implementar Session Collector
5. Implementar Task Collector
6. Reescrever `lib/store.ts` — remover todas as funções `generateMock*`
7. Adicionar subscriptions Realtime ao store
8. Testar: dashboard mostrando dados reais dos agentes

### Fase 2 — Novos Componentes (Semana 2)
**Objetivo:** Adicionar Content Pipeline e Calendar.

1. Criar `/content` — Content Pipeline com 7 estágios
2. Criar `/calendar` — Calendário com cron jobs
3. Implementar Cron Collector
4. Implementar Metrics Collector
5. Implementar Memory Collector com pesquisa
6. Atualizar `/memory` — adicionar pesquisa global full-text
7. Configurar cron jobs para todos os collectors

### Fase 3 — Economia e Gamificação (Semana 3)
**Objetivo:** Sistema de XP, bounties e avaliações funcionando.

1. Implementar lógica de ganho de XP nos collectors
2. Criar sistema de bounties (criação automática + claim)
3. Implementar avaliações periódicas
4. Atualizar Leaderboard com dados reais
5. Atualizar Agent Profile com timeline de ações

### Fase 4 — Polimento e Autonomia (Semana 4)
**Objetivo:** Sistema autônomo e polido.

1. Implementar circuit breakers
2. Implementar reconciliation loop
3. Criar sprites finais para o Digital Office
4. Adicionar notificações e alertas
5. Testes end-to-end completos
6. Otimização de performance (lazy load, bundle size)
7. Deploy final em produção

---

## 13. SLAs E MÉTRICAS DE SUCESSO

### 13.1 SLAs do Sistema

| SLA | Target | Medição |
|---|---|---|
| Uptime do Dashboard | 99.9% | Vercel + Supabase uptime |
| Latência de atualização | < 2s | Tempo entre evento e UI update |
| Freshness dos dados | < 5 min | Máximo atraso dos collectors |
| Error rate dos collectors | < 1% | Falhas / total de execuções |
| Disponibilidade de agentes core | 99% | Shanks, Zoro, Nami online |

### 13.2 Métricas de Sucesso

| Métrica | Target | Medição |
|---|---|---|
| Tarefas concluídas/semana | 20+ | Contagem no Task Board |
| Tempo médio de resposta | < 2h | Da criação à conclusão |
| XP acumulado/semana | +10% | Crescimento semanal |
| Proatividade | 30%+ tarefas auto-iniciadas | Tasks iniciadas por agentes sem solicitação |
| Custo por tarefa | < $0.10 | Tokens consumidos / tarefas concluídas |
| Uptime operacional | 23h/dia | Agentes ativos fora do horário silencioso |

---

## 14. GLOSSÁRIO

| Termo | Definição |
|---|---|
| **Mission Control** | Aplicação NextJS que monitora e controla o ecossistema OpenClaw |
| **Agent** | Sub-agente do OpenClaw com papel, responsabilidades e métricas específicas |
| **Collector** | Módulo que extrai dados de fontes reais e persiste no Supabase |
| **Bounty** | Recompensa em XP associada a uma tarefa ou investigação |
| **XP** | Experience Points — métrica de progressão dos agentes |
| **Spawn** | Criação de um novo agente a partir de um template |
| **Heartbeat** | Check periódico de saúde e proatividade dos agentes |
| **Reconciliation** | Processo de verificação e correção de consistência de dados |
| **Circuit Breaker** | Mecanismo que pausa operação após falhas consecutivas |
| **Realtime** | Atualização instantânea via WebSocket (Supabase Realtime) |
| **SWR** | Stale-While-Revalidate — estratégia de cache com polling |
| **Store** | Estado global da aplicação gerenciado pelo Zustand |
| **Kanban** | Metodologia visual de gestão de tarefas em colunas |
| **Content Pipeline** | Fluxo de criação de conteúdo em estágios |
| **Deep Profile** | Ficha completa de um agente individual |
| **Model Router** | Sistema que escolhe o modelo AI mais adequado para cada tarefa |
| **Vercel AI Gateway** | Control plane unificado para roteamento de modelos AI |
| **Supabase** | Plataforma de backend (PostgreSQL + Realtime + Auth + Storage) |
| **Mem0** | Sistema de memória persistente com embeddings para agentes AI |

---

## ASSINATURAS

| Papel | Nome | Data |
|---|---|---|
| CEO | João Rafael | 2026-02-19 |
| Chief of Staff | Shanks (OS Captain) | 2026-02-19 |

---

> *"O Mission Control não é apenas uma ferramenta — é o sistema nervoso central de uma organização digital autônoma. Sem ele, os agentes trabalham no escuro. Com ele, cada ação é visível, cada decisão é auditável, e cada resultado é mensurável."*
>
> — Shanks, OS Captain

---

**FIM DO DOCUMENTO**
