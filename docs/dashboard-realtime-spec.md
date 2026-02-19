# Revenue‑OS — Dashboard Realtime (Sem LLM)
**Versão base:** `16b8a0f` (sprites refinados)
**Objetivo:** construir um “segundo cérebro” em tempo real, com conceito de escritório virtual, alimentado apenas por **dados reais** (Supabase + APIs + filesystem). **Zero chamadas LLM para o dashboard.**

---

## 0) Princípios Obrigatórios
1. **Sem LLM no dashboard** (nenhum prompt para gerar dados ou inferências).  
2. **Realtime verdadeiro** via Supabase Realtime + polling leve (fallback).  
3. **Auditável**: toda métrica deve ter origem clara (tabela, log ou API).  
4. **Alta disponibilidade**: garantir 100% uptime percebido (fallbacks + cache + redundância).  
5. **Source of Truth**: Supabase é o backbone de dados (tabelas + views).  

---

## 1) Arquitetura de Dados (sem LLM)
### 1.1 Fontes
- **Supabase**: agent_status, agent_stats, tasks, interactions, monitoring_metrics, memory_graph, standup_messages, tool_usage, model_usage, errors, latency
- **Filesystem** (OpenClaw): `Progress-log.md`, `Todo.md`, `memory/*.md`, cron runs (`.jsonl`)
- **Stripe API**: billing, invoices, MRR, usage
- **GitHub API**: PRs, issues, actions status
- **OpenClaw Sessions**: health + status snapshots

### 1.2 Pipeline (Realtime)
1. **Collectors** (cron/worker) → escreve em Supabase (batch + realtime)
2. **Realtime subscriptions** (Supabase channels) → updates no dashboard
3. **Fallback**: SWR polling 30–60s para endpoints críticos

---

## 2) Páginas e Requisitos

### 2.1 `/` — Command Center
**Propósito:** visão tática da operação (KPIs + status).  
**Dados:** `monitoring_metrics`, `agent_status`, `standup_messages`, `tool_usage`, `model_usage`  
**Componentes:**
- KPI Grid (Agents ativos, Tasks concluídas, Tokens, Custo, Latência P95, Error Rate)
- Crew Status (cards por agente + status glow)
- Live Feed (Top Providers, Top Tools, Latest Standup)
**Integração:**
- `agent_status` (realtime)
- `monitoring_metrics` (daily + totals)
- `standup_messages` (realtime)

### 2.2 `/world` — Virtual Office (escritório vivo)
**Propósito:** mapa pixel-art com agentes “vivos” e status.  
**Dados:** `agent_status`, `agent_positions`, `agent_interactions`  
**Requisitos:**
- Mapa com salas (ROOMS)
- Agentes como sprites (status glow, animação, emoji grande)
- Contagem por sala (badge)
- Interações (meeting, coffee, pairing)  
**Integração:**
- `agent_positions` (computed: dept → room)
- `agent_interactions` (realtime)
- `agent_status` (status + task atual)

### 2.3 `/orgchart` — Org Chart & Radar KPIs
**Propósito:** hierarquia + perfil profundo do agente.  
**Dados:** `agent_stats`, `agent_status`, `agent_profile`  
**Requisitos:**
- Node cards por departamento
- Radar chart (Canvas)
- Lifecycle panel (logs/last tasks)
**Integração:**
- `agent_stats` (speed, accuracy, creativity, etc.)
- `agent_profile` (XP, level, streak)

### 2.4 `/tasks` — Kanban Board
**Propósito:** tarefas do time com drag‑drop.  
**Dados:** `tasks`  
**Requisitos:**
- Colunas: Backlog/In Progress/Review/Done/Blocked
- Drag & drop persiste no Supabase
- Filtros por agente e prioridade

### 2.5 `/monitoring` — Infra & Cost Analytics
**Propósito:** custo, performance e métricas de infra.  
**Dados:** `monitoring_metrics`, `model_usage`, `provider_usage`, `tool_usage`  
**Requisitos:**
- Tabs (Overview, Pricing, Providers & Models, Tools)
- Charts (Area, Line, Donut)
- Breakdown de tokens e custos

### 2.6 `/interactions` — Communications Log
**Propósito:** comunicação entre agentes + standup.  
**Dados:** `interactions`, `standup_messages`  
**Requisitos:**
- Log com tipo (delegation, escalation, collaboration)
- Standup feed com timestamps

### 2.7 `/leaderboard` — Ranking e Gamificação
**Propósito:** produtividade em formato competitivo.  
**Dados:** `agent_stats`  
**Requisitos:**
- Podium top 3
- Ranking completo
- Radar/Stats cards

### 2.8 `/memory` — Knowledge Graph (Mem0)
**Propósito:** memória institucional.  
**Dados:** `memory_graph` (nodes + edges)  
**Requisitos:**
- 3D Graph (three.js)
- Timeline
- Search
- Agent brains

### 2.9 `/spawn` — Spawn Agents
**Propósito:** UI para criação de agentes.  
**Dados:** `agent_templates`, `agent_spawn_log`  
**Requisitos:**
- Templates reais
- Spawn = trigger backend
- Status (spawning/ok/error)

### 2.10 `/agents/[id]` — Deep Profile
**Propósito:** ficha completa do agente.  
**Dados:** `agent_profile`, `agent_status`, `agent_logs`, `usage_metrics`  
**Requisitos:**
- Status realtime
- Timeline de ações
- Uptime + cost

---

## 3) Integração Realtime (Supabase)
### Tabelas mínimas
- `agent_status` (id, name, emoji, status, dept, task, updated_at)
- `agent_stats` (id, speed, accuracy, xp, streak, etc)
- `monitoring_metrics` (daily, totals, latency, errors)
- `interactions` (from, to, type, content, timestamp)
- `standup_messages`
- `tasks`
- `memory_graph` (nodes, edges)

### Estratégia
- Subscribe por tabela crítica (agent_status, monitoring_metrics, interactions)
- SWR fallback 30–60s
- WebSocket reconnect automático

---

## 4) Disponibilidade 100% (SLO)
### Camadas
1. **Frontend cache** (SWR + stale‑while‑revalidate)
2. **Edge caching** (Vercel) para páginas estáticas
3. **Fallback local** (último snapshot JSON em localStorage)
4. **Health check** (cron) → status visible no dashboard
5. **Supabase Realtime redundancy** (auto‑reconnect)

### Observabilidade
- `monitoring_metrics` com uptime de API
- alertas para falhas de conexão

---

## 5) Segurança e Consistência
- Sem dados sensíveis no client
- API routes → fetch seguro para Stripe/GitHub
- Logs auditáveis

---

## 6) Próximos Passos
1. Confirmar este SPEC
2. Mapear todas tabelas + seeds
3. Implementar collectors (cron)
4. Ativar realtime

---

## Pendências de Clarificação
1. O que significa exatamente “**Cássio perfeita**”? (Cache? Cascade? outro?)
2. “**Site hospedado no universal**” → confirmar stack (Vercel? outro?).
3. Definir SLO real: 100% percebido (fallback) ou 99.9% real?
