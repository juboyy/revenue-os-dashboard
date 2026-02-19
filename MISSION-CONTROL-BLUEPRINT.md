# OpenClaw Mission Control - Blueprint Completo

## Visão Geral

O Mission Control é uma aplicação personalizada gerada pelo OpenClaw que transforma fundamentalmente a experiência de uso, permitindo:

1. **Monitoramento em tempo real** de todos os agentes e operações
2. **Ferramentas customizadas** para maximizar eficiência e produtividade
3. **Sistema de memória aprimorado** com visualização e pesquisa
4. **Escritório digital** para visualização da equipe e atribuição de tarefas
5. **Fluxos de trabalho automatizados** para conteúdo e projetos

Este blueprint consolida tudo que já implementamos e adiciona os novos requisitos em um único sistema coerente.

## Stack Tecnológico

- **Frontend:** NextJS 14 (App Router)
- **Estilização:** TailwindCSS + HeadlessUI
- **Banco de Dados:** Convex (para persistência, realtime e funções)
- **Autenticação:** NextAuth.js (opcional)
- **Integração com OpenClaw:** Coletores automatizados via cron jobs

## Componentes do Mission Control

### 1. Command Center (Dashboard Principal)
![Command Center](https://i.imgur.com/vKD7QnT.png)

**Funcionalidade:**
- Visão geral de alto nível de todo o sistema
- KPIs e métricas em tempo real (agentes ativos, tarefas, tokens)
- Status de saúde do sistema
- Links rápidos para todas as seções

**Implementação:**
- Cards de métricas com dados reais do OpenClaw
- Gráficos de atividade e utilização
- Notificações e alertas em tempo real
- Acesso rápido às funcionalidades principais

### 2. Task Board
![Task Board](https://i.imgur.com/3Jg6RKs.png)

**Funcionalidade:**
- Kanban board para todas as tarefas no sistema
- Visualização clara de quem está atribuído (humano ou agente)
- Filtros por status, prioridade e atribuição
- Facilita proatividade dos agentes

**Implementação:**
- Colunas para: Backlog, Em Progresso, Revisão, Concluído
- Integração com Todo.md e Progress-log.md do OpenClaw
- Drag-and-drop para mover tarefas entre estágios
- Sincronização em tempo real via Convex

```jsx
// Exemplo de componente de Task Card
function TaskCard({ task, onDragStart }) {
  return (
    <div 
      className="glass-card p-3 mb-2 cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-medium">{task.title}</h3>
        <div className={`text-xs px-1.5 py-0.5 rounded-full ${
          task.priority === 'high' ? 'bg-red-900/50 text-red-300' :
          task.priority === 'medium' ? 'bg-amber-900/50 text-amber-300' :
          'bg-blue-900/50 text-blue-300'
        }`}>
          {task.priority}
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            task.assignee_type === 'human' ? 'bg-purple-400' : 'bg-blue-400'
          }`}></span>
          <span className="text-gray-400">
            {task.assignee || 'Não atribuído'}
          </span>
        </div>
        <span className="text-gray-500">
          {new Date(task.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
```

### 3. Content Pipeline
![Content Pipeline](https://i.imgur.com/pQWJA8R.png)

**Funcionalidade:**
- Pipeline completo para criação de conteúdo
- Rastreamento do progresso de ideias até publicação
- Automação de etapas pelo OpenClaw (scripts, thumbnails)
- Armazenamento de todos os ativos relacionados

**Implementação:**
- Kanban com colunas: Ideias, Planejamento, Script, Thumbnail, Filmagem, Edição, Publicação
- Editor rich-text embutido para scripts
- Upload/geração de imagens para thumbnails
- Gatilhos para ações automatizadas dos agentes

```jsx
// Modelo Convex para o pipeline de conteúdo
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  content_items: defineTable({
    title: v.string(),
    description: v.string(),
    stage: v.string(), // 'idea', 'planning', 'script', 'thumbnail', 'filming', 'editing', 'published'
    script: v.optional(v.string()),
    thumbnail_url: v.optional(v.string()),
    assignee: v.optional(v.string()),
    tags: v.array(v.string()),
    due_date: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_stage", ["stage"])
    .index("by_created", ["created_at"])
});
```

### 4. Calendar View
![Calendar](https://i.imgur.com/XJVTnJL.png)

**Funcionalidade:**
- Visualização de todas as tarefas agendadas e cron jobs
- Garantia que tarefas programadas serão executadas
- Facilita proatividade e planejamento a longo prazo
- Visualizações por dia, semana e mês

**Implementação:**
- Integração com cron jobs do OpenClaw
- Visualização de calendário com biblioteca react-big-calendar
- Eventos coloridos por tipo e status
- Modal de detalhes para cada evento

```jsx
// Exemplo de componente de Calendário
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useDashboardStore } from '../lib/store';

const localizer = momentLocalizer(moment);

export default function CalendarView() {
  const { cronJobs, fetchCronJobs } = useDashboardStore();
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    fetchCronJobs();
  }, [fetchCronJobs]);
  
  useEffect(() => {
    // Transformar cron jobs em eventos do calendário
    const calendarEvents = cronJobs.map(job => {
      // Calcular próximas execuções baseadas na expressão cron
      const nextRuns = calculateNextRuns(job.schedule, 10);
      
      // Criar um evento para cada execução futura
      return nextRuns.map(runTime => ({
        id: `${job.id}-${runTime.getTime()}`,
        title: job.name || job.message,
        start: runTime,
        end: new Date(runTime.getTime() + 30 * 60000), // +30min estimado
        resource: job
      }));
    }).flat();
    
    setEvents(calendarEvents);
  }, [cronJobs]);
  
  return (
    <div className="glass-card p-4 h-[700px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={['month', 'week', 'day']}
        className="calendar-theme"
        eventPropGetter={event => ({
          className: `event-${event.resource.enabled ? 'active' : 'disabled'}`
        })}
        onSelectEvent={handleEventSelect}
      />
    </div>
  );
}
```

### 5. Memory Dashboard
![Memory](https://i.imgur.com/bpNThgT.png)

**Funcionalidade:**
- Visualização completa de todas as memórias do OpenClaw
- Pesquisa global em todo o histórico
- Categorização e tags para organização
- Aprimoramento significativo do sistema de memória

**Implementação:**
- Listagem de memórias com filtragem e ordenação
- Editor markdown para visualização
- Indexação de conteúdo para pesquisa eficiente
- Integração com Mem0 e arquivos de memória do OpenClaw

```jsx
// Componente de Pesquisa de Memória
function MemorySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      const { data } = await convex.query(api.memories.search, { query });
      setResults(data || []);
    } catch (error) {
      console.error("Error searching memories:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar memórias..."
          className="flex-1 glass-input px-3 py-2 rounded-md"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-ocean-700 text-white rounded-md hover:bg-ocean-600 transition-colors"
          disabled={loading}
        >
          {loading ? "Pesquisando..." : "Pesquisar"}
        </button>
      </div>
      
      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.id} className="glass-card p-3">
            <h3 className="text-white font-medium text-sm mb-1">
              {result.title}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2">
              {result.snippet}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-accent-blue">
                {result.file_path}
              </span>
              <span className="text-gray-500">
                {new Date(result.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Team Structure
![Team](https://i.imgur.com/vKD7QnT.png)

**Funcionalidade:**
- Visualização da estrutura organizacional de agentes
- Dados detalhados sobre cada agente (status, habilidades)
- Organização por departamentos e hierarquias
- Spawn de agentes diretamente da interface

**Implementação:**
- Já implementado com dados reais do OpenClaw
- Organização por departamentos
- Cards com detalhes e status dos agentes
- Integração com OpenClaw para criação de agentes

### 7. Digital Office
![Office](https://i.imgur.com/3Jg6RKs.png)

**Funcionalidade:**
- Visualização espacial do escritório virtual
- Representação visual dos agentes e suas atividades
- Interação com agentes diretamente no escritório
- Monitoramento de atividades em tempo real

**Implementação:**
- Já implementado com canvas para renderização do escritório
- Sprites de pixel art para os agentes
- Interatividade para selecionar e interagir com agentes
- Animações baseadas no status dos agentes

### 8. Monitoring & Analytics
![Monitoring](https://i.imgur.com/NwzBtKU.png)

**Funcionalidade:**
- Métricas detalhadas de uso do OpenClaw
- Análise de uso de tokens por modelo e agente
- Gráficos de atividade e produtividade
- Alertas para anomalias ou erros

**Implementação:**
- Dashboard com gráficos e métricas chave
- Integração com logs de uso do OpenClaw
- Visualização histórica e em tempo real
- Filtros para análise personalizada

```jsx
// Exemplo de gráfico de tokens por modelo
import { Bar } from 'react-chartjs-2';
import { useDashboardStore } from '../lib/store';

function TokenUsageChart() {
  const { metrics } = useDashboardStore();
  
  if (!metrics?.byModel) return null;
  
  // Preparar dados para o gráfico
  const chartData = {
    labels: Object.keys(metrics.byModel),
    datasets: [
      {
        label: 'Tokens Utilizados',
        data: Object.values(metrics.byModel).map(m => m.tokens),
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ]
      }
    ]
  };
  
  return (
    <div className="glass-card p-4">
      <h3 className="text-white text-sm font-medium mb-4">Uso de Tokens por Modelo</h3>
      <Bar data={chartData} options={{ maintainAspectRatio: false }} />
    </div>
  );
}
```

## Integração com OpenClaw

### Coletores de Dados (Data Collectors)

Para garantir que o Mission Control utilize apenas dados reais do OpenClaw, implementamos vários coletores:

1. **Session Collector**
   - Coleta status de todos os agentes ativos
   - Executa `openclaw sessions list` periodicamente
   - Atualiza o banco de dados Convex em tempo real

2. **Task Collector**
   - Extrai tarefas do Todo.md e Progress-log.md
   - Analisa atribuições e status de cada tarefa
   - Mantém o Task Board atualizado

3. **Cron Collector**
   - Lista todos os cron jobs configurados
   - Calcula próximas execuções para o calendário
   - Monitora status de execuções anteriores

4. **Memory Collector**
   - Indexa arquivos de memória (memory/*.md)
   - Extrai conteúdo para pesquisa e visualização
   - Mantém o Memory Dashboard atualizado

5. **Metric Collector**
   - Analisa logs de uso do OpenClaw
   - Calcula métricas de uso de tokens e execuções
   - Alimenta dashboards de monitoramento

### Exemplo de Implementação de Collector

```typescript
// /lib/collectors/sessionCollector.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { convex } from '../convex';

const execAsync = promisify(exec);

/**
 * Coleta status de sessões do OpenClaw e atualiza o banco Convex
 */
export async function collectSessions() {
  try {
    // Executar openclaw sessions list
    const { stdout } = await execAsync('openclaw sessions list --json');
    const sessions = JSON.parse(stdout);
    
    // Processar cada sessão
    for (const session of sessions) {
      // Extrair ID do agente
      const agentIdMatch = session.key.match(/agent:([^:]+)/);
      if (!agentIdMatch) continue;
      
      const agentId = agentIdMatch[1];
      
      // Determinar status
      const lastActive = new Date(session.updatedAt);
      const now = new Date();
      const minutesSinceActive = (now.getTime() - lastActive.getTime()) / 60000;
      
      let status = 'idle';
      if (minutesSinceActive < 10) {
        status = session.abortedLastRun ? 'error' : 'active';
      } else if (session.abortedLastRun) {
        status = 'error';
      }
      
      // Extrair tarefa atual
      let currentTask = null;
      if (session.lastMessage && typeof session.lastMessage === 'string') {
        const taskMatch = session.lastMessage.match(/Task: (.+?)(\.|$)/);
        if (taskMatch) {
          currentTask = taskMatch[1].trim();
        }
      }
      
      // Atualizar no Convex
      await convex.mutation('agents.upsert', {
        agent_id: agentId,
        session_key: session.key,
        status,
        current_task: currentTask,
        model: session.model || 'default',
        tokens_used: session.totalTokens || 0,
        last_heartbeat: new Date(session.updatedAt).toISOString()
      });
    }
    
    return { success: true, count: sessions.length };
  } catch (error) {
    console.error('Error collecting sessions:', error);
    return { success: false, error: error.message };
  }
}
```

## Configuração do Banco de Dados Convex

O Convex é utilizado como banco de dados para o Mission Control, oferecendo:
- Reatividade em tempo real
- Funções serverless integradas
- Pesquisa de texto completo
- Escalabilidade automática

### Schema do Banco de Dados

```typescript
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de agentes
  agents: defineTable({
    agent_id: v.string(),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    department: v.optional(v.string()),
    status: v.string(),
    current_task: v.optional(v.string()),
    model: v.string(),
    tokens_used: v.number(),
    last_heartbeat: v.string(),
    session_key: v.optional(v.string()),
  })
    .index("by_agent_id", ["agent_id"])
    .index("by_department", ["department"])
    .index("by_status", ["status"]),
  
  // Tabela de tarefas
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // 'backlog', 'in_progress', 'review', 'done'
    priority: v.string(), // 'low', 'medium', 'high'
    assignee: v.optional(v.string()),
    assignee_type: v.string(), // 'human', 'agent'
    created_at: v.number(),
    updated_at: v.number(),
    source: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_updated", ["updated_at"]),
  
  // Tabela para pipeline de conteúdo
  content_items: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    stage: v.string(), // 'idea', 'planning', 'script', 'thumbnail', 'filming', 'editing', 'published'
    script: v.optional(v.string()),
    thumbnail_url: v.optional(v.string()),
    assignee: v.optional(v.string()),
    tags: v.array(v.string()),
    due_date: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_stage", ["stage"])
    .index("by_created", ["created_at"]),
  
  // Tabela para cron jobs
  cron_jobs: defineTable({
    job_id: v.string(),
    name: v.optional(v.string()),
    schedule: v.string(),
    message: v.string(),
    model: v.optional(v.string()),
    enabled: v.boolean(),
    last_run: v.optional(v.number()),
    next_run: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_job_id", ["job_id"])
    .index("by_next_run", ["next_run"]),
  
  // Tabela para memórias
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    file_path: v.string(),
    tags: v.array(v.string()),
    agent_id: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_file_path", ["file_path"])
    .index("by_agent", ["agent_id"])
    .searchIndex("search", {
      searchField: "content",
      filterFields: ["tags", "agent_id"]
    }),
  
  // Tabela para métricas
  metrics: defineTable({
    metric_type: v.string(), // 'daily', 'model', 'agent', 'system'
    metric_name: v.string(),
    value: v.number(),
    metadata: v.optional(v.object({})),
    timestamp: v.number(),
  })
    .index("by_type_and_name", ["metric_type", "metric_name"])
    .index("by_timestamp", ["timestamp"])
});
```

## Integração Frontend-Backend

### API do Convex

```typescript
// convex/agents.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Obter todos os agentes
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

// Obter agentes por departamento
export const listByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_department", (q) => q.eq("department", args.department))
      .collect();
  },
});

// Atualizar ou inserir um agente
export const upsert = mutation({
  args: {
    agent_id: v.string(),
    session_key: v.optional(v.string()),
    status: v.string(),
    current_task: v.optional(v.string()),
    model: v.string(),
    tokens_used: v.number(),
    last_heartbeat: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar se o agente já existe
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_agent_id", (q) => q.eq("agent_id", args.agent_id))
      .first();
    
    if (existing) {
      // Atualizar
      return await ctx.db.patch(existing._id, {
        status: args.status,
        current_task: args.current_task,
        model: args.model,
        tokens_used: args.tokens_used,
        last_heartbeat: args.last_heartbeat,
        session_key: args.session_key,
      });
    } else {
      // Inserir novo
      return await ctx.db.insert("agents", {
        agent_id: args.agent_id,
        name: mapAgentName(args.agent_id),
        emoji: mapAgentEmoji(args.agent_id),
        department: mapAgentDepartment(args.agent_id),
        status: args.status,
        current_task: args.current_task,
        model: args.model,
        tokens_used: args.tokens_used,
        last_heartbeat: args.last_heartbeat,
        session_key: args.session_key,
      });
    }
  },
});
```

### Hooks do React

```typescript
// hooks/useAgents.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useAgents(department = null) {
  // Buscar agentes
  const agents = useQuery(
    department ? api.agents.listByDepartment : api.agents.list,
    department ? { department } : {}
  );
  
  // Spawn de agentes
  const spawnAgent = useMutation(api.agents.spawn);
  
  // Filtros e transformações
  const activeAgents = agents?.filter(a => a.status === 'active') || [];
  const idleAgents = agents?.filter(a => a.status === 'idle') || [];
  const errorAgents = agents?.filter(a => a.status === 'error') || [];
  
  // Agrupar por departamento
  const departmentGroups = agents?.reduce((acc, agent) => {
    const dept = agent.department || 'Uncategorized';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(agent);
    return acc;
  }, {}) || {};
  
  return {
    agents,
    activeAgents,
    idleAgents,
    errorAgents,
    departmentGroups,
    isLoading: agents === undefined,
    spawnAgent
  };
}
```

## Arquitetura do Sistema

```
mission-control/
├── app/                       # Rotas do NextJS
│   ├── page.tsx               # Dashboard principal
│   ├── tasks/                 # Quadro de tarefas
│   ├── content/               # Pipeline de conteúdo
│   ├── calendar/              # Calendário
│   ├── memory/                # Visualização de memórias
│   ├── team/                  # Estrutura da equipe
│   ├── office/                # Escritório digital
│   └── monitoring/            # Monitoramento e métricas
├── components/                # Componentes React reutilizáveis
├── convex/                    # Backend do Convex
│   ├── _generated/            # Código gerado pelo Convex
│   ├── schema.ts              # Schema do banco de dados
│   ├── agents.ts              # Funções de agentes
│   ├── tasks.ts               # Funções de tarefas
│   ├── content.ts             # Funções de conteúdo
│   ├── memories.ts            # Funções de memórias
│   └── metrics.ts             # Funções de métricas
├── lib/                       # Utilidades e hooks
│   ├── collectors/            # Coletores de dados
│   ├── hooks.ts               # Custom hooks
│   └── utils.ts               # Funções auxiliares
├── public/                    # Assets estáticos
│   └── sprites/               # Sprites para o escritório
├── scripts/                   # Scripts de automação
│   └── setup-collectors.ts    # Configuração dos coletores
└── next.config.js             # Configuração do NextJS
```

## Fluxo de Dados

1. **Coleta:** Coletores extraem dados do OpenClaw periodicamente (sessões, tarefas, cron jobs)
2. **Persistência:** Dados são armazenados no banco Convex com indexação apropriada
3. **Reatividade:** Frontend se inscreve em mudanças usando hooks do Convex
4. **Visualização:** Componentes React renderizam os dados em visualizações interativas
5. **Interação:** Usuário e agentes interagem com o sistema, criando novas tarefas e atualizações
6. **Reconciliação:** Coletores garantem que alterações no OpenClaw sejam refletidas no Mission Control

## Benefícios do Mission Control

1. **Visibilidade Aprimorada:** Visualização clara de todo o ecossistema OpenClaw
2. **Proatividade:** Facilita agendamento e acompanhamento de tarefas proativas
3. **Colaboração:** Humano e agentes colaboram em um ambiente compartilhado
4. **Memória Aprimorada:** Sistema de memória visual com pesquisa facilita acesso ao histórico
5. **Eficiência:** Fluxos de trabalho automatizados para tarefas comuns
6. **Organização:** Estrutura clara de equipe e responsabilidades
7. **Monitoramento:** Métricas detalhadas para otimização de uso

## Conclusão

O Mission Control transforma fundamentalmente a experiência com o OpenClaw, elevando-o de um assistente simples para um verdadeiro ambiente de trabalho digital autônomo. Com dados 100% reais, visualizações interativas e fluxos de trabalho automatizados, o sistema possibilita uma colaboração homem-máquina sem precedentes.

Este blueprint consolidou tudo o que implementamos anteriormente (monitoramento real, equipe, escritório) e adicionou os novos componentes solicitados (tasks, content pipeline, calendar, memory), criando um sistema coeso e abrangente.

**Próximos Passos:**
1. Implementação incremental dos componentes
2. Configuração do banco de dados Convex
3. Setup dos coletores de dados
4. Testes de integração
5. Refinamento da UX baseado em feedback

---

**Preparado por:** Shanks (OS Captain)