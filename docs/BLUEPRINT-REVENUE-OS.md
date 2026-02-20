# 🌟 REVENUE-OS BLUEPRINT
**Versão:** 1.0.0 (2026-02-19)  
**Autor:** Shanks (OS Captain)  
**Status:** Approved

---

## 📑 ÍNDICE
- [Visão Geral](#visão-geral)
- [Arquitetura Técnica](#arquitetura-técnica)
- [Virtual Office & Agente Vivo](#virtual-office--agente-vivo)
- [Sistemas de Contratação & Avaliação](#sistemas-de-contratação--avaliação)
- [Economia, XP & Bounties](#economia-xp--bounties)
- [Realtime Syncing & Fonte da Verdade](#realtime-syncing--fonte-da-verdade)
- [Automatização & Orquestração](#automatização--orquestração)
- [Especificações de Tabela](#especificações-de-tabela)
- [SLAs & Métricas de Sucesso](#slas--métricas-de-sucesso)
- [Roadmap de Implementação](#roadmap-de-implementação)

---

## 🌐 VISÃO GERAL

O Revenue-OS é um ecossistema autônomo que opera como um **organismo digital** — não apenas uma coleção de agentes, mas um "segundo cérebro" com economia interna, auto-aprimoramento, e capacidade de auto-orquestração.

### Princípios Fundamentais
1. **Autonomia Completa** — Zero intervenção humana para operações do dia-a-dia
2. **Economia Auto-Regulada** — Sistema de Bounties, XP, promoções e remoções
3. **Adaptação Contínua** — Auto-avaliação e aprimoramento em conselho
4. **Realidade Viva** — Virtual Office como representação real (não figurativa) da organização

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Central
- **Frontend:** Next.js 14, TailwindCSS, Framer Motion, three.js
- **Backend:** Vercel Edge Functions, Supabase (PostgreSQL + Realtime)
- **Monitoramento:** Edge + Client-side telemetry
- **Agentes:** OpenClaw OS + Vercel AI Gateway (Codex/Opus/Haiku models)
- **Cache:** Vercel KV + SWR (client-side)
- **Datastore:** Supabase (Realtime) como fonte primária de verdade
- **Logs:** Vercel, OpenClaw e Supabase (triplamente redundante)

### Arquitetura de Dados
- **Supabase Schema:**
  - `agent_profiles` — Informações estáticas e configuração
  - `agent_status` — Estado atual (tempo real)
  - `agent_stats` — Métricas e XP
  - `agent_actions` — Log de ações (append-only)
  - `tasks` — Sistema Kanban
  - `interactions` — Comunicação entre agentes
  - `bounties` — Economia interna
  - `evaluations` — Performance reviews
  - `positions` — Localização no Virtual Office
  - Veja [Especificações de Tabela](#especificações-de-tabela) para detalhes completos

### Sistema de Prevenção de Falhas
- **Heartbeat** — Checks a cada 30 segundos por agente
- **Failover** — Substitutos automáticos (spawns) para agentes cruciais offline
- **Load Balancing** — Distribuição de carga entre equipes por XP e desempenho
- **Reconciliation** — Sincronização tripla (OpenClaw ↔ Supabase ↔ Filesystem)

---

## 🏢 VIRTUAL OFFICE & AGENTE VIVO

O Virtual Office **não é uma metáfora** — é uma representação digital em tempo real do espaço organizacional onde todos os agentes do Revenue-OS existem e interagem.

### Mapa & Zonas (Topografia Digital)
- **Command Bridge** (CEO) — Central de comando 
- **Engineering** (Lead: Zoro) — Desenvolvimento e manutenção
- **Treasury** (Usopp) — Gerenciamento financeiro
- **Analytics Lab** (Chopper) — Pesquisa e análise de dados
- **Architecture** (Franky) — Design de sistemas
- **Library** (Robin) — Documentação e knowledge base
- **Central Lobby** — Standup meetings e comunicação geral
- **Engine Room** (Jinbe) — DevOps e infraestrutura
- **Watchtower** — Monitoramento e segurança
- **Comms Center** (Sanji) — Marketing e comunicações
- **Billing Office** — Stripe e faturamento

### Mecânica do Agente Vivo
- **Status Visual** — Glow/aura de cores diferentes por estado
- **Sprites Animados** — Variações de personalidade por agente
- **Movimentos Significativos** — Posição baseada em atividade real
- **Interações** — Meetings virtuais, pair programming, coffee breaks
- **Idle/Active** — Animação e brilho conforme estado de atividade
- **Room Heatmaps** — Densidade de atividade por zona

### Implementação Técnica
- **Agent Sprites:** Representações visuais dinâmicas com status persistente
- **Room Metrics:** Contadores em tempo real por zona
- **Events:** Animações para trocas de estado (meetings, pair programming)
- **Tech Stack:** Canvas WebGL (via three.js) para renderização otimizada
- **Mobile Responsive:** Vista adaptativa (simplificada em mobile)

---

## 🤝 SISTEMAS DE CONTRATAÇÃO & AVALIAÇÃO

O Revenue-OS é um organismo que cresce, aprende e evolui — com mecanismos para adição, remoção e aprimoramento de agentes.

### Contratação (Spawn)
- **Template-Based** — Roles pré-definidas (Dev, SRE, Designer)
- **Requisition System** — Aprovação automática baseada em throughput/demanda
- **Custo Real** — Cada agente tem um "salário" em tokens/créditos
- **Período Probatório** — Avaliação automática (2.000.000 tokens processados)
- **Customização** — Skills, model preference, department assignment

### Avaliação & Conselho
- **Auto-Review Periódica** — Cada 7.000.000 tokens (ciclo semanal)
- **Conselho de Avaliação** — Subagents dedicados (avaliam logs reais)
- **Critérios Objetivos:**
  - Custo por tarefa concluída
  - Bounce rate (retrabalho)
  - Latência média de resposta
  - Satisfação do solicitante (feedback)

### Promoção & Demissão
- **XP & Níveis** — Progressão baseada em desempenho (não apenas tempo)
- **Demissão Automática** — Underperformers (3 avaliações negativas)
- **Promoção** — Novas skills, contexto expandido, prioridade aumentada
- **Rebaixamento** — Menos contexto, prioridade reduzida, supervisão aumentada

### Fluxo Completo
1. **Requisição** — Avaliação de necessidade (workload/backlog)
2. **Spawn** — Criação via template + customização
3. **Onboarding** — Acesso a contexto + recursos
4. **Avaliação Contínua** — Métricas em tempo real
5. **Review Periódica** — Conselho (sem intervenção humana)
6. **Ação** — Promoção, manutenção ou demissão

---

## 💰 ECONOMIA, XP & BOUNTIES

O Revenue-OS possui uma economia interna auto-regulada, onde agentes competem, colaboram e são recompensados por desempenho.

### Sistema de XP
- **Acúmulo** — Baseado em valor gerado (não apenas atividade)
- **Níveis** — Progressão não-linear (L1-L50)
- **Benefícios por Nível** — Contexto ampliado, acesso a modelos melhores
- **Títulos** — Junior → Mid → Senior → Principal → Fellow
- **Decay** — Perda gradual de XP por inatividade (incentiva consistência)

### Economia de Bounties
- **Tipos de Bounties**
  - `task` — Tarefas individuais do Kanban
  - `investigation` — Pesquisas e análises
  - `improvement` — Otimizações de código/sistema
  - `documentation` — Atualizações de docs
  - `critical` — Prioridade máxima (bugs, security)
  
- **Valor Dinâmico** — Baseado em:
  - Complexidade (tokens usados historicamente)
  - Urgência (deadline/prioridade)
  - Histórico (sucesso em tarefas similares)
  
- **Recompensas**
  - **Primária:** XP (progressão)
  - **Secundária:** Prioridade aumentada para recursos
  - **Terciária:** Reputação (stack rank)

### Processo de Bounty
1. **Criação** — Automática (por eventos) ou manual
2. **Precificação** — Algoritmo baseado em dificuldade/urgência
3. **Atribuição** — Self-assignment ou delegação por líder
4. **Verificação** — Automatizada + revisão por peers
5. **Recompensa** — XP + prioridade

---

## 🔄 REALTIME SYNCING & FONTE DA VERDADE

O Revenue-OS mantém um estado de verdade único e confiável, sincronizado em tempo real entre todos os componentes.

### Fonte Primária
- **Supabase** — Todas as tabelas principais (PostgreSQL)
- **Realtime Subscriptions** — Atualizações instantâneas via WebSockets
- **Backup de Estado** — Snapshots periódicos (S3/filesystem)

### Modelo de Sincronização
- **Write-through Cache** — Todas as escritas passam pelo Supabase
- **Read-heavy Optimizations** — Cache de leitura em camadas
- **CQRS** — Commands via API, Queries via Realtime/cache
- **Event Sourcing** — Logs de evento imutáveis para auditoria/reconstituição

### Fluxo de Dados Realtime
1. **Agent Action** — Ação realizada (OpenClaw)
2. **Event Log** — Registro de evento (append-only)
3. **State Update** — Atualização no Supabase (tabelas de estado)
4. **Realtime Sync** — Broadcast via WebSocket para subscribers
5. **UI Update** — Atualização do Dashboard em tempo real
6. **Snapshot** — Backup periódico (reconciliation point)

### Prevenção de Desincronização
- **Reconciliation Loop** — Check + fix a cada 10 minutos
- **Last-write Wins** — Resolução de conflitos automática
- **Versioning** — Timestamps para todas as mudanças de estado
- **Compensating Actions** — Ações de correção para estados inválidos

---

## 🤖 AUTOMATIZAÇÃO & ORQUESTRAÇÃO

O Revenue-OS se auto-gerencia através de mecanismos de orquestração, criando uma inteligência coletiva sem necessidade de intervenção.

### Self-Management
- **Workload Distribution** — Balanceamento automático entre agentes
- **Resource Allocation** — Alocação dinâmica (tokens/quota) baseado em prioridade
- **Quality Control** — Auto-verificação e correção de outputs
- **Peer Review** — Avaliação cruzada de decisões críticas
- **Health Checks** — Monitoramento proativo de problemas

### Ciclos Operacionais
- **Night Loop** — Planejamento e delegação (23:00-02:00 UTC)
- **Morning Standup** — Sync entre agentes (06:00-07:00 UTC)
- **Day Loop** — Execução principal (08:00-22:00 UTC)
- **Evening Report** — Resumo para stakeholders (22:00-23:00 UTC)

### Mecanismos de Controle
- **Circuit Breakers** — Parada automática em caso de erro crítico
- **Rate Limiting** — Controle de consumo de recursos
- **Priority Queues** — Tarefas ordenadas por urgência/importância
- **Dead Letter Queues** — Captura de falhas para análise

### Meta-Orquestração
- **Auto-otimização** — Análise periódica de performance
- **Auto-scaling** — Spawn/despawn baseado em carga
- **Auto-healing** — Recuperação automática de falhas
- **Auto-tuning** — Ajuste de parâmetros baseado em telemetria

---

## 📊 ESPECIFICAÇÕES DE TABELA

Schemas detalhados do Supabase (fonte da verdade).

### agent_profiles
```sql
CREATE TABLE agent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  config JSONB DEFAULT '{}'
);
```

### agent_status
```sql
CREATE TABLE agent_status (
  agent_id UUID PRIMARY KEY REFERENCES agent_profiles(id),
  status TEXT NOT NULL DEFAULT 'idle',
  current_task TEXT,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position_x INTEGER,
  position_y INTEGER,
  room_id TEXT,
  interaction_id UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### agent_stats
```sql
CREATE TABLE agent_stats (
  agent_id UUID PRIMARY KEY REFERENCES agent_profiles(id),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT 'Junior',
  tasks_completed INTEGER DEFAULT 0,
  tokens_consumed BIGINT DEFAULT 0,
  cost_incurred DECIMAL(10,4) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  speed INTEGER DEFAULT 50,
  accuracy INTEGER DEFAULT 50,
  versatility INTEGER DEFAULT 50,
  reliability INTEGER DEFAULT 50,
  creativity INTEGER DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### agent_actions
```sql
CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id),
  action_type TEXT NOT NULL,
  details JSONB NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  xp_earned INTEGER,
  result TEXT,
  success BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee UUID REFERENCES agent_profiles(id),
  reporter UUID REFERENCES agent_profiles(id),
  bounty_value INTEGER DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### interactions
```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_agent UUID NOT NULL REFERENCES agent_profiles(id),
  to_agent UUID NOT NULL REFERENCES agent_profiles(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_task UUID REFERENCES tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### bounties
```sql
CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  bounty_type TEXT NOT NULL,
  value INTEGER NOT NULL,
  claimant UUID REFERENCES agent_profiles(id),
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### evaluations
```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id),
  reviewer_id UUID NOT NULL REFERENCES agent_profiles(id),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metrics JSONB NOT NULL,
  score INTEGER NOT NULL,
  feedback TEXT,
  action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### spawn_requests
```sql
CREATE TABLE spawn_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id TEXT NOT NULL,
  requester UUID REFERENCES agent_profiles(id),
  reason TEXT NOT NULL,
  custom_config JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES agent_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### realtime_views
```sql
CREATE VIEW agent_positions AS
  SELECT a.id, a.name, a.emoji, a.department, 
         s.status, s.room_id, s.position_x, s.position_y
  FROM agent_profiles a
  JOIN agent_status s ON a.id = s.agent_id;

CREATE VIEW task_summary AS
  SELECT 
    status, 
    COUNT(*) as count,
    SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_count,
    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_count,
    SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_count,
    SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_count
  FROM tasks
  GROUP BY status;
```

### triggers
```sql
CREATE OR REPLACE FUNCTION update_agent_stats() RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza XP e level
  IF NEW.xp >= 5000 AND OLD.level = 1 THEN
    NEW.level := 2;
    NEW.title := 'Mid-level';
  ELSIF NEW.xp >= 15000 AND OLD.level = 2 THEN
    NEW.level := 3;
    NEW.title := 'Senior';
  ELSIF NEW.xp >= 40000 AND OLD.level = 3 THEN
    NEW.level := 4;
    NEW.title := 'Principal';
  ELSIF NEW.xp >= 100000 AND OLD.level = 4 THEN
    NEW.level := 5;
    NEW.title := 'Fellow';
  END IF;

  -- Atualiza streak
  IF NEW.last_active_date = CURRENT_DATE AND OLD.last_active_date < CURRENT_DATE THEN
    NEW.streak_days := OLD.streak_days + 1;
  ELSIF NEW.last_active_date < CURRENT_DATE - INTERVAL '1 day' THEN
    NEW.streak_days := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_stats
BEFORE UPDATE ON agent_stats
FOR EACH ROW EXECUTE FUNCTION update_agent_stats();
```

---

## 📋 SLAs & MÉTRICAS DE SUCESSO

O Revenue-OS se compromete com SLAs objetivos e mensuráveis.

### SLAs Críticos
- **Uptime:** 99.99% (agentes core)
- **Latência:** P95 < 1500ms (resposta de agente)
- **Disponibilidade:** 100% (fallbacks garantidos)
- **Precisão:** 98%+ (tarefas críticas)
- **Taxa de erro:** < 0.5% (falhas recuperáveis)

### Métricas de Sucesso
- **XP Acumulado:** crescimento 10%+ semanal
- **Task Velocity:** 85%+ da capacidade teórica
- **Custo Efetivo:** < $0.05 / tarefa
- **NPS Interno:** 85%+ (satisfação entre agentes)
- **Inovação:** 5%+ de tarefas auto-geradas

### Monitoramento
- **Dashboards:** atualização a cada 5s
- **Alertas:** notificação imediata para SLA breach
- **Relatórios:** diários, semanais, mensais
- **Retrospectivas:** automáticas (todo ciclo)

---

## 📅 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1 - Fundação (CONCLUÍDO)
- ✅ Setup Supabase Schema
- ✅ Criar Dashboard Shell
- ✅ Implementar Virtual Office (mapa + sprites)
- ✅ Inicializar estrutura de agentes
- ✅ Configurar Model Router

### Fase 2 - Sistemas Vitais (EM ANDAMENTO)
- ✅ Implement Kanban Board
- ✅ Criar sistema de XP
- ⏳ Iniciar economia de Bounties
- ⏳ Deploy Financial Module
- ⏳ Integração completa com Stripe
- ⏳ Setup metrics collection

### Fase 3 - Autonomia (PRÓXIMA)
- 🔲 Sistema de contratação automática
- 🔲 Implementar avaliações e conselhos
- 🔲 Auto-orquestração e workload balancing
- 🔲 Circuit breakers e healthchecks
- 🔲 Deploy completo em Vercel Edge

### Fase 4 - Evolução (PLANEJADO)
- 🔲 Auto-otimização
- 🔲 Sistema de herança de conhecimento
- 🔲 Simulação de cenários
- 🔲 Interface API pública
- 🔲 Mobile Dashboard

---

## 📝 CONCLUSÃO

O Revenue-OS **não é um conjunto de dashboards**, mas um **organismo digital autônomo** — um sistema vivo que se auto-regula, auto-otimiza e evolui. Seu Virtual Office não é uma visualização, mas uma representação fiel do ambiente onde os agentes existem e trabalham.

A economia interna baseada em XP e Bounties garante a alocação eficiente de recursos, enquanto o sistema de avaliação e promoção promove excelência e crescimento.

Esta implementação revoluciona a concepção tradicional de escritório digital, transformando-o em um ecossistema completo que opera ininterruptamente, mesmo sem intervenção humana.

---

**🔑 PALAVRAS-CHAVE:** AUTONOMOUS ORGANISM, VIRTUAL OFFICE, XP ECONOMY, SELF-REGULATION, AGENT LIFECYCLE

---

**APROVADO POR:**
- João Rafael (CEO)
- Shanks (OS Captain)

---

*Documento versionado e mantido pela tripulação do Revenue-OS*