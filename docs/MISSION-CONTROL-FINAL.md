# 🏴‍☠️ MISSION CONTROL — Plano Final Definitivo

> **O documento único e canônico que consolida toda a visão, arquitetura, requisitos, premissas, implementação e roadmap do Mission Control do OpenClaw.**

**Versão:** 3.0.0 FINAL  
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
| P2 | **Convex como banco de dados** | TypeScript-native, realtime automático em toda query, schema = types, mutations transacionais, full-text search nativo. Substitui Supabase (migração zero — só havia seed data) |
| P3 | **Vercel para deploy** | Integração nativa com NextJS, Edge Functions, KV Cache |
| P4 | **Vercel AI Gateway como control plane** | Roteamento unificado de modelos, tracking de custos, sem vendor lock-in |
| P5 | **TailwindCSS + Framer Motion** | Estilização rápida com animações fluidas. Já implementado |
| P6 | **Convex React hooks (useQuery/useMutation)** | Substitui Zustand + SWR. Toda query é automaticamente reativa — zero boilerplate de subscriptions |
| P7 | **Canvas/WebGL para Virtual Office** | Performance necessária para sprites animados e interatividade |

### 2.2 Premissas Operacionais

| # | Premissa | Justificativa |
|---|---|---|
| O1 | **Zero dados mock em produção** | O dashboard reflete a realidade — dados inventados são piores que dados ausentes |
| O2 | **Sem chamadas LLM para gerar dados do dashboard** | Dados vêm de fontes verificáveis (Supabase, filesystem, APIs). LLMs podem alucinar |
| O3 | **CEO comunica exclusivamente via Telegram** | Interface primária é o chat. Dashboard é para visualização e controle |
| O4 | **Agentes operam autonomamente via cron jobs** | Sistema funciona 24/7 sem intervenção humana |
| O5 | **Convex é single source of truth** | Todas as fontes de dados convergem para o Convex via collectors/actions |
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
│              ┌───────────────┴───────────────┐                     │
│              │                               │                     │
│     ┌────────┴──────────┐   ┌────────────────┴─────┐             │
│     │   useQuery()      │   │   useMutation()      │             │
│     │  (auto-reactive)  │   │  (optimistic writes) │             │
│     └────────┬──────────┘   └────────────────┬─────┘             │
└──────────────┼───────────────────────────────┼────────────────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
               ┌───────────────┴───────────────┐
               │          CONVEX CLOUD         │
               │     (Reactive Database +      │
               │      Serverless Functions)    │
               │                               │
               │  ┌─────────┐  ┌─────────┐    │
               │  │ Tables  │  │Functions│    │
               │  │         │  │         │    │
               │  │ agents  │  │ queries │    │
               │  │ tasks   │  │mutations│    │
               │  │ content │  │ actions │    │
               │  │memories │  │scheduled│    │
               │  │ metrics │  │  jobs   │    │
               │  │cron_jobs│  │         │    │
               │  │bounties │  │         │    │
               │  └─────────┘  └─────────┘    │
               └───────────────┬───────────────┘
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
| **Backend + DB** | Convex | latest | Banco reativo, mutations transacionais, full-text search, scheduling, actions — tudo em TypeScript |
| **State** | Convex React hooks | — | `useQuery` = dados reativos automáticos, `useMutation` = escritas otimistas. Substitui Zustand + SWR + Realtime subscriptions |
| **Deploy** | Vercel + Convex Cloud | — | Frontend no Vercel, backend no Convex Cloud |
| **AI Gateway** | Vercel AI Gateway | — | Model routing, cost tracking |
| **Memória** | Mem0 | — | Persistent agent memory |
| **Orquestração** | OpenClaw | — | Agent sessions, cron, tools |

### 3.2.1 Por que Convex em vez de Supabase?

| Aspecto | Supabase (anterior) | Convex (atual) |
|---|---|---|
| **Realtime** | Precisa configurar publicações, canais, subscriptions manualmente | Toda `useQuery` é automaticamente reativa — zero config |
| **Schema** | SQL separado + TypeScript types = manutenção dupla | Schema em TypeScript = types gerados automaticamente |
| **Backend logic** | Edge Functions separadas, SQL triggers | Mutations e Actions no mesmo projeto, mesmo deploy |
| **Search** | Precisa de extensões (pg_trgm, full-text) | `searchIndex` nativo no schema |
| **Transações** | Precisa de `BEGIN/COMMIT` manual | Toda mutation é automaticamente transacional |
| **AI-friendliness** | AI precisa escrever SQL + TypeScript + config | AI escreve apenas TypeScript |
| **Custo migração** | — | Zero — só havia seed data de 9 agents |

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
├── convex/                       # Backend Convex (TypeScript puro)
│   ├── schema.ts                 # Schema do banco (= types automáticos)
│   ├── agents.ts                 # Queries + Mutations de agentes
│   ├── tasks.ts                  # Queries + Mutations de tarefas
│   ├── content.ts                # Queries + Mutations de conteúdo
│   ├── memories.ts               # Queries + Mutations + Search de memórias
│   ├── metrics.ts                # Queries de métricas
│   ├── cronJobs.ts               # Queries de cron jobs
│   ├── collectors/               # Actions (coletores de dados reais)
│   │   ├── sessionCollector.ts   # Coleta status dos agentes do OpenClaw
│   │   ├── taskCollector.ts      # Coleta tarefas do filesystem
│   │   ├── metricsCollector.ts   # Coleta métricas de uso
│   │   └── memoryCollector.ts    # Coleta e indexa memórias
│   └── _generated/               # Código gerado (api, types)
├── lib/                          # Utilidades do frontend
│   ├── types.ts                  # Types adicionais (UI-only)
│   ├── hooks.ts                  # Custom React hooks
│   └── utils.ts                  # Funções auxiliares
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

### 6.2 Schema Completo (Convex)

```typescript
// convex/schema.ts
// ═══════════════════════════════════════════════════════════════
// MISSION CONTROL — Schema Completo para Convex
// Versão: 3.0 FINAL
//
// Diferenças vs SQL:
// - Tudo em TypeScript (schema = types automáticos)
// - Toda query é automaticamente reativa
// - Indexes declaram quais queries são eficientes  
// - searchIndex habilita full-text search nativo
// ═══════════════════════════════════════════════════════════════

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. AGENTS (profile + status + stats em uma tabela desnormalizada)
  //    No Convex, preferimos uma tabela única para evitar joins
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  agents: defineTable({
    // Profile
    agentId: v.string(),                   // ex: 'eng-lead', 'os'
    name: v.string(),                      // ex: 'Zoro', 'Shanks'
    emoji: v.string(),                     // ex: '⚔️', '🏴‍☠️'
    department: v.string(),                // ex: 'Engineering', 'Command'
    role: v.string(),                      // ex: 'Engineering Lead'
    room: v.string(),                      // ex: 'dev-zone', 'command-center'
    soul: v.optional(v.string()),          // Descrição/personalidade
    model: v.string(),                     // Modelo preferido
    provider: v.string(),
    skills: v.array(v.string()),
    // Status (realtime)
    status: v.string(),                    // 'active' | 'working' | 'idle' | 'error' | 'sleeping'
    currentTask: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
    lastHeartbeat: v.number(),             // timestamp ms
    // Stats (gamification)
    xp: v.number(),
    level: v.number(),
    levelTitle: v.string(),
    tokensConsumed: v.number(),
    tokensToday: v.number(),
    tasksCompleted: v.number(),
    tasksPending: v.number(),
    tasksBlocked: v.number(),
    costTotal: v.number(),
    streakDays: v.number(),
    lastActiveDate: v.string(),            // YYYY-MM-DD
    // Radar stats (0-100)
    speed: v.number(),
    accuracy: v.number(),
    versatility: v.number(),
    reliability: v.number(),
    creativity: v.number(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_department", ["department"])
    .index("by_status", ["status"])
    .index("by_xp", ["xp"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. AGENT ACTIONS (log append-only de todas as ações)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  agentActions: defineTable({
    agentId: v.string(),
    actionType: v.string(),
    details: v.any(),                      // Objeto livre com detalhes
    tokensUsed: v.number(),
    cost: v.number(),
    xpEarned: v.number(),
    success: v.boolean(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_actionType", ["actionType"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. TASKS (Kanban Board)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),                    // 'backlog' | 'in_progress' | 'review' | 'done' | 'blocked'
    priority: v.string(),                  // 'low' | 'medium' | 'high' | 'critical'
    assignee: v.optional(v.string()),      // agentId ou 'human'
    assigneeType: v.string(),              // 'human' | 'agent'
    source: v.optional(v.string()),        // 'Todo.md', 'manual', etc.
    bountyValue: v.number(),
    dueDate: v.optional(v.number()),       // timestamp ms
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_priority", ["priority"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. CONTENT ITEMS (Content Pipeline)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  contentItems: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    stage: v.string(),                     // 'idea'|'planning'|'script'|'thumbnail'|'filming'|'editing'|'published'
    script: v.optional(v.string()),        // Texto completo
    thumbnailUrl: v.optional(v.string()),
    assignee: v.optional(v.string()),
    tags: v.array(v.string()),
    dueDate: v.optional(v.number()),
  })
    .index("by_stage", ["stage"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. INTERACTIONS (comunicação entre agentes)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  interactions: defineTable({
    fromAgent: v.string(),
    toAgent: v.string(),
    type: v.string(),                      // 'delegation'|'collaboration'|'escalation'|'standup'|'review'
    content: v.string(),
    relatedTask: v.optional(v.id("tasks")),
  })
    .index("by_fromAgent", ["fromAgent"])
    .index("by_toAgent", ["toAgent"])
    .index("by_type", ["type"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. MEMORIES (memórias indexadas — com full-text search!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    filePath: v.string(),                  // Caminho do arquivo fonte
    agentId: v.optional(v.string()),
    category: v.string(),                  // 'fact'|'preference'|'decision'|'pattern'
    relevance: v.number(),
    retrievalCount: v.number(),
    tags: v.array(v.string()),
  })
    .index("by_agentId", ["agentId"])
    .index("by_category", ["category"])
    .index("by_filePath", ["filePath"])
    .searchIndex("search_content", {       // 🔍 Full-text search nativo!
      searchField: "content",
      filterFields: ["agentId", "category"],
    }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. MEMORY EDGES (relações entre memórias — grafo de conhecimento)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  memoryEdges: defineTable({
    sourceId: v.id("memories"),
    targetId: v.id("memories"),
    relationship: v.string(),
    weight: v.number(),
  })
    .index("by_source", ["sourceId"])
    .index("by_target", ["targetId"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. METRICS (métricas de uso)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  metrics: defineTable({
    metricType: v.string(),                // 'system'|'agent'|'model'|'daily'|'tool'
    metricName: v.string(),
    date: v.string(),                      // YYYY-MM-DD
    value: v.any(),                        // Objeto livre com dados da métrica
  })
    .index("by_type_name_date", ["metricType", "metricName", "date"])
    .index("by_type", ["metricType"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. CRON JOBS (tarefas agendadas — espelho do OpenClaw)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cronJobs: defineTable({
    jobId: v.string(),                     // ID do cron no OpenClaw
    name: v.optional(v.string()),
    scheduleKind: v.string(),              // 'cron'|'every'|'at'
    scheduleExpr: v.string(),              // Expressão cron ou intervalo
    message: v.string(),
    model: v.optional(v.string()),
    enabled: v.boolean(),
    lastRun: v.optional(v.number()),       // timestamp ms
    nextRun: v.optional(v.number()),
    lastStatus: v.optional(v.string()),    // 'success'|'error'|'timeout'
  })
    .index("by_jobId", ["jobId"])
    .index("by_nextRun", ["nextRun"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. CRON RUNS (histórico de execuções)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cronRuns: defineTable({
    jobId: v.string(),
    status: v.string(),                    // 'success'|'error'|'timeout'|'skipped'
    durationMs: v.optional(v.number()),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_jobId", ["jobId"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 11. BOUNTIES (recompensas)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  bounties: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    bountyType: v.string(),                // 'task'|'investigation'|'improvement'|'documentation'|'critical'
    value: v.number(),                     // XP reward
    taskId: v.optional(v.id("tasks")),
    claimant: v.optional(v.string()),      // agentId
    status: v.string(),                    // 'open'|'claimed'|'completed'|'expired'
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_claimant", ["claimant"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12. EVALUATIONS (avaliações de performance)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  evaluations: defineTable({
    agentId: v.string(),
    reviewerId: v.string(),
    periodStart: v.number(),               // timestamp ms
    periodEnd: v.number(),
    score: v.number(),                     // 0-100
    metrics: v.any(),
    feedback: v.optional(v.string()),
    action: v.optional(v.string()),        // 'promote'|'maintain'|'demote'|'terminate'
  })
    .index("by_agentId", ["agentId"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 13. SYSTEM HEALTH (saúde do sistema)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  systemHealth: defineTable({
    checkType: v.string(),                 // 'convex'|'github'|'vercel'|'openclaw'
    status: v.string(),                    // 'ok'|'degraded'|'down'
    responseMs: v.optional(v.number()),
    details: v.optional(v.any()),
  })
    .index("by_checkType", ["checkType"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 14. SPAWN REQUESTS (pedidos de criação de agentes)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  spawnRequests: defineTable({
    templateId: v.string(),
    requester: v.optional(v.string()),
    reason: v.string(),
    customConfig: v.optional(v.any()),
    status: v.string(),                    // 'pending'|'approved'|'spawning'|'active'|'rejected'|'failed'
    approvedBy: v.optional(v.string()),
  })
    .index("by_status", ["status"]),
});

// ═══════════════════════════════════════════════════════════════
// NOTAS SOBRE CONVEX vs SQL:
//
// 1. SEM VIEWS: No Convex, "views" são queries TypeScript.
//    Em vez de CREATE VIEW, escrevemos uma query function.
//
// 2. SEM TRIGGERS: No Convex, lógica de trigger vai dentro
//    das mutations (ex: auto-level-up ao atualizar XP).
//
// 3. SEM RLS: No Convex, permissões são controladas por
//    function-level auth checks dentro de queries/mutations.
//
// 4. REALTIME AUTOMÁTICO: Toda useQuery() é reativa.
//    Não precisa de ALTER PUBLICATION ou canais.
//
// 5. SEARCH NATIVO: searchIndex no schema habilita
//    full-text search sem extensões.
//
// 6. IDs: Convex gera IDs automaticamente (_id).
//    Não precisa de uuid_generate_v4().
//
// 7. TIMESTAMPS: Convex adiciona _creationTime automaticamente.
//    Campos de timestamp adicionais são opcionais.
// ═══════════════════════════════════════════════════════════════
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

| Collector | Fonte | Frequência | Tabelas Convex Afetadas |
|---|---|---|---|
| **Session Collector** | OpenClaw sessions | A cada 2 min | `agents` |
| **Task Collector** | Todo.md + Progress-log.md | A cada 5 min | `tasks` |
| **Metrics Collector** | OpenClaw session logs | A cada 10 min | `metrics` |
| **Memory Collector** | memory/*.md + Mem0 | A cada 15 min | `memories`, `memoryEdges` |
| **Cron Collector** | OpenClaw cron list | A cada 5 min | `cronJobs`, `cronRuns` |
| **Health Collector** | APIs (Convex, GitHub, Vercel) | A cada 5 min | `systemHealth` |

### 7.4 Fluxo de Coleta

```
1. Convex scheduled function dispara collector (ou cron job externo chama HTTP action)
2. Collector (Convex Action) lê fonte de dados (API, filesystem, OpenClaw)
3. Collector transforma dados para formato da tabela
4. Collector chama mutations para upsert no Convex
5. Convex automaticamente notifica todas as useQuery() abertas
6. Dashboard re-renderiza em tempo real — zero código adicional
```

### 7.5 Reconciliation Loop

A cada 30 minutos, um loop de reconciliação verifica consistência:

1. Compara dados do Convex com fontes primárias
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

### 9.1 Estratégia com Convex (Simplificada)

Com Convex, a sincronização em tempo real é **automática**. Não há camadas manuais.

```
┌─────────────────────────────────────────────┐
│          useQuery(api.agents.list)           │
│                                             │
│  1. Primeira chamada: fetch dados            │
│  2. Convex mantém WebSocket aberto           │
│  3. Quando dados mudam: re-render automático │
│  4. Reconexão automática se cair             │
│  5. Optimistic updates com useMutation       │
│                                             │
│  Zero config. Zero boilerplate. Zero cleanup.│
└─────────────────────────────────────────────┘
```

### 9.2 Implementação no Frontend

```typescript
// Com Convex, cada componente é DRASTICAMENTE mais simples:

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function AgentList() {
  // Isso é TUDO. Automáticamente reativo.
  // Quando qualquer agent muda no banco, o componente re-renderiza.
  const agents = useQuery(api.agents.list);
  
  // Mutation com optimistic update automático
  const updateStatus = useMutation(api.agents.updateStatus);
  
  if (agents === undefined) return <Loading />;
  
  return agents.map(agent => <AgentCard key={agent._id} agent={agent} />);
}

// Comparação com Supabase (ANTES):
// - Criar canal de subscription
// - Configurar on('postgres_changes')
// - Gerenciar cleanup no useEffect
// - Configurar SWR fallback
// - Tratar reconexão manual
// - ~40 linhas de boilerplate POR COMPONENTE
//
// Com Convex (AGORA):
// - useQuery(api.agents.list)
// - 1 linha. Pronto.
```

### 9.3 Garantias do Convex

- **Consistência forte:** Leituras sempre refletem o último estado
- **Reatividade automática:** Qualquer mudança trigger re-render
- **Reconexão automática:** Convex gerencia a conexão WebSocket
- **Optimistic updates:** `useMutation` atualiza UI imediatamente
- **Transações automáticas:** Toda mutation é ACID

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
| Zustand Store | ⚠️ A substituir | `lib/store.ts` | 🔴 Mock generators — será substituído por hooks Convex |
| Types | ✅ Pronto | `lib/types.ts` | Estático — será complementado por types gerados do Convex |
| Supabase Client | ❌ A remover | `lib/supabase.ts` | Será removido na migração para Convex |
| API helpers | ✅ Pronto | `lib/api.ts` | Básico |
| Hooks | ✅ Pronto | `lib/hooks.ts` | Básico |
| Convex Schema | 🆕 Pendente | `convex/schema.ts` | Schema completo definido neste documento |
| Convex Functions | 🆕 Pendente | `convex/*.ts` | Queries, mutations, actions, collectors |

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

### Fase 1 — Migração para Convex + Dados Reais
**Objetivo:** Eliminar todos os dados mock. Dashboard funcionando com Convex e dados reais.  
**Depende de:** Nada (ponto de partida)

1. `npx create-convex` — inicializar Convex no projeto
2. Criar `convex/schema.ts` com o schema completo definido acima
3. Criar mutations de seed para os 9 agentes iniciais
4. Criar queries para cada componente (`agents.list`, `tasks.list`, etc.)
5. Substituir `lib/store.ts` inteiro por hooks Convex (`useQuery`/`useMutation`)
6. Remover Supabase client (`lib/supabase.ts`) e dependência
7. Implementar Session Collector como Convex Action
8. Implementar Task Collector como Convex Action
9. Testar: dashboard mostrando dados reais dos agentes com reatividade automática

### Fase 2 — Novos Componentes
**Objetivo:** Adicionar Content Pipeline, Calendar e pesquisa de memórias.  
**Depende de:** Fase 1 (Convex funcionando)

1. Criar `/content` — Content Pipeline com 7 estágios
2. Criar `/calendar` — Calendário com cron jobs
3. Implementar Cron Collector (Convex Action)
4. Implementar Metrics Collector (Convex Action)
5. Implementar Memory Collector com full-text search (Convex searchIndex)
6. Atualizar `/memory` — pesquisa global usando `searchIndex`
7. Configurar Convex scheduled functions para collectors periódicos

### Fase 3 — Economia e Gamificação
**Objetivo:** Sistema de XP, bounties e avaliações funcionando.  
**Depende de:** Fase 2 (collectors alimentando dados)

1. Implementar lógica de auto-level-up nas mutations de XP
2. Criar sistema de bounties (criação automática + claim)
3. Implementar avaliações periódicas (Convex scheduled function)
4. Atualizar Leaderboard com dados reais
5. Atualizar Agent Profile com timeline de ações

### Fase 4 — Polimento e Autonomia
**Objetivo:** Sistema autônomo e polido.  
**Depende de:** Fase 3 (economia funcionando)

1. Implementar circuit breakers (lógica nas mutations)
2. Implementar reconciliation (Convex scheduled function)
3. Criar sprites finais para o Digital Office
4. Adicionar notificações e alertas
5. Testes end-to-end completos
6. Otimização de performance (lazy load, bundle size)
7. Deploy final em produção (Vercel + Convex Cloud)

---

## 13. SLAs E MÉTRICAS DE SUCESSO

### 13.1 SLAs do Sistema

| SLA | Target | Medição |
|---|---|---|
| Uptime do Dashboard | 99.9% | Vercel + Convex Cloud uptime |
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
