# Substituindo TODOS os dados mock por dados reais
**Status:** URGENTE - PRONTO PARA IMPLEMENTAÇÃO

## O problema:
O Dashboard atual usa dados mockados/simulados em vários componentes, o que resulta em:
- Visualização desconectada da realidade operacional
- Decisões baseadas em métricas falsas
- Impossibilidade de diagnosticar problemas reais

## Solução:
Substituir 100% dos dados mockados por dados reais provenientes de fontes verificáveis e auditar cada componente para garantir aderência à realidade.

---

## 1. Mapeamento de Dados Mock Atuais

| Componente | Arquivo | Tipo de Mock |
|------------|---------|--------------|
| Agent Status | `/lib/store.ts` | Array estático de agents |
| Tasks | `/lib/store.ts` | Array estático de tasks |
| Metrics | `/lib/store.ts` | Objeto com dados inventados |
| Interactions | `/lib/store.ts` | Array estático de interações |
| Memory Graph | `/lib/store.ts` | Estrutura de grafo artificial |

Quase tudo flui através do store Zustand que atualmente é **populado com dados estáticos** (ver: `createStore` em `lib/store.ts`).

## 2. Fontes de dados reais e coletores

| Dado | Fonte Real | Método de Coleta |
|------|------------|------------------|
| Agent Status | OpenClaw Sessions | Session Collector (periodicidade: 2min) |
| Tasks | `Todo.md` + `Progress-log.md` | Log Collector (periodicidade: 5min) |
| Metrics | Token Logs + Vercel Analytics | Metric Collector (periodicidade: 10min) |
| Interactions | Session Logs + `memory/*.md` | Log Parser (periodicidade: 5min) |
| Memory Graph | Mem0 | Mem0 API Client (periodicidade: 15min) |

## 3. Tabelas Supabase necessárias

```sql
-- Tabela de configuração com schemas e mapeamentos
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para status dos agentes (atualizado em real-time)
CREATE TABLE IF NOT EXISTS agent_status (
  agent_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL,
  current_task TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para tarefas (kanban board)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('backlog', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  assignee TEXT REFERENCES agent_status(agent_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para métricas (time series)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para interações entre agentes
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_agent TEXT NOT NULL REFERENCES agent_status(agent_id),
  to_agent TEXT NOT NULL REFERENCES agent_status(agent_id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para o grafo de memória (Mem0)
CREATE TABLE IF NOT EXISTS memory_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  relevance INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS memory_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source UUID NOT NULL REFERENCES memory_nodes(id),
  target UUID NOT NULL REFERENCES memory_nodes(id),
  relationship TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Implementação dos Collectors

### 4.1 - Agent Status Collector

```typescript
// /lib/collectors/agentStatusCollector.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { supabase } from '../supabase-admin';

const execAsync = promisify(exec);

export async function collectAgentStatus() {
  try {
    // Obter lista de sessões do OpenClaw
    const { stdout } = await execAsync('openclaw sessions list --json');
    const sessions = JSON.parse(stdout);
    
    // Array para batch upsert
    const agentsToUpdate = [];
    
    // Processar cada sessão
    for (const session of sessions) {
      // Extrair agent_id do session.key (formato: agent:eng-lead:main)
      const agentIdMatch = session.key.match(/agent:([^:]+)/);
      if (!agentIdMatch) continue;
      
      const agentId = agentIdMatch[1];
      
      // Determinar status
      let status = 'idle';
      if (Date.now() - session.updatedAt < 5 * 60 * 1000) { // 5 minutos
        status = session.abortedLastRun ? 'error' : 'active';
      } else if (session.abortedLastRun) {
        status = 'error';
      }
      
      // Extrair nome/emoji do displayName ou definir padrão
      let name = agentId;
      let emoji = '🤖';
      let department = 'Unknown';
      
      if (session.displayName) {
        // Tentar extrair nome/emoji do displayName
        const nameMatch = session.displayName.match(/([^:]+)$/);
        if (nameMatch) name = nameMatch[1].trim();
        
        // Mapear departamento baseado em agentId
        switch (agentId) {
          case 'eng-lead': 
            department = 'Engineering Lead'; 
            emoji = '⚔️';
            break;
          case 'ops-lead': 
            department = 'Operations'; 
            emoji = '🌊';
            break;
          case 'doc-lead': 
            department = 'Documentation'; 
            emoji = '📚';
            break;
          case 'researcher': 
            department = 'Research'; 
            emoji = '🔬';
            break;
          case 'architect': 
            department = 'Architecture'; 
            emoji = '🏗️';
            break;
          case 'devops': 
            department = 'DevOps'; 
            emoji = '⚙️';
            break;
          case 'billing': 
            department = 'Finance'; 
            emoji = '💎';
            break;
          case 'comms-lead': 
            department = 'Communications'; 
            emoji = '📡';
            break;
          case 'os': 
            department = 'OS Captain'; 
            emoji = '⚓';
            break;
          default: 
            department = 'Crew'; 
            break;
        }
      }
      
      // Extrair current_task do lastMessage (se houver)
      let currentTask = null;
      if (session.lastMessage && typeof session.lastMessage === 'string') {
        // Extrair tarefa da mensagem
        const taskMatch = session.lastMessage.match(/Task: (.+)/);
        if (taskMatch) currentTask = taskMatch[1];
      }
      
      // Adicionar ao batch
      agentsToUpdate.push({
        agent_id: agentId,
        name,
        emoji,
        department,
        status,
        current_task: currentTask,
        last_heartbeat: new Date(session.updatedAt).toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Fazer upsert em batch
    if (agentsToUpdate.length > 0) {
      const { data, error } = await supabase
        .from('agent_status')
        .upsert(agentsToUpdate, {
          onConflict: 'agent_id'
        });
      
      if (error) {
        throw new Error(`Error upserting agent status: ${error.message}`);
      }
      
      console.log(`Updated ${agentsToUpdate.length} agent statuses`);
      return { success: true, count: agentsToUpdate.length };
    }
    
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Error collecting agent status:', error);
    return { success: false, error: error.message };
  }
}
```

### 4.2 - Task Collector

```typescript
// /lib/collectors/taskCollector.ts
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../supabase-admin';

// Caminho para os arquivos relevantes
const TODO_PATH = '/home/node/.openclaw/workspaces/os/Todo.md';
const PROGRESS_LOG_PATH = '/home/node/.openclaw/workspaces/os/Progress-log.md';

// Mapeamento de agentes
const AGENT_MAP = {
  'Zoro': 'eng-lead',
  'Nami': 'ops-lead',
  'Robin': 'doc-lead',
  'Chopper': 'researcher',
  'Franky': 'architect',
  'Jinbe': 'devops',
  'Usopp': 'billing',
  'Sanji': 'comms-lead',
  'Shanks': 'os'
};

export async function collectTasks() {
  try {
    // Ler Todo.md e Progress-log.md
    const todoContent = await fs.readFile(TODO_PATH, 'utf-8');
    const progressContent = await fs.readFile(PROGRESS_LOG_PATH, 'utf-8');
    
    // Extrair tarefas
    const tasksFromTodo = parseTodoMd(todoContent);
    const tasksFromProgress = parseProgressLog(progressContent);
    
    // Combinar e deduplicate tarefas
    const allTasks = mergeTasks(tasksFromTodo, tasksFromProgress);
    
    // Array para batch upsert
    const tasksToUpsert = [];
    
    // Converter para formato da tabela
    for (const task of allTasks) {
      const taskObj = {
        title: task.title,
        description: task.context || '',
        status: mapStatus(task.status),
        priority: mapPriority(task.title),
        assignee: task.agent ? mapAgent(task.agent) : null,
        created_at: task.timestamp ? new Date(task.timestamp).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tasksToUpsert.push(taskObj);
    }
    
    // Fazer upsert em batch
    if (tasksToUpsert.length > 0) {
      // Primeiro obter lista de títulos para verificar duplicatas
      const { data: existingTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, title');
      
      if (fetchError) {
        throw new Error(`Error fetching existing tasks: ${fetchError.message}`);
      }
      
      // Mapear títulos existentes para IDs
      const titleToId = {};
      if (existingTasks) {
        existingTasks.forEach(task => {
          titleToId[task.title] = task.id;
        });
      }
      
      // Separar em novos e atualizações
      const newTasks = [];
      const updateTasks = [];
      
      tasksToUpsert.forEach(task => {
        if (titleToId[task.title]) {
          // Já existe, adicionar id para update
          updateTasks.push({
            ...task,
            id: titleToId[task.title]
          });
        } else {
          // Novo
          newTasks.push(task);
        }
      });
      
      // Inserir novos
      if (newTasks.length > 0) {
        const { data: newData, error: insertError } = await supabase
          .from('tasks')
          .insert(newTasks);
        
        if (insertError) {
          throw new Error(`Error inserting tasks: ${insertError.message}`);
        }
      }
      
      // Atualizar existentes
      if (updateTasks.length > 0) {
        const { data: updateData, error: updateError } = await supabase
          .from('tasks')
          .upsert(updateTasks);
        
        if (updateError) {
          throw new Error(`Error updating tasks: ${updateError.message}`);
        }
      }
      
      console.log(`Updated tasks: ${updateTasks.length} new, ${newTasks.length} updated`);
      return { success: true, newCount: newTasks.length, updateCount: updateTasks.length };
    }
    
    return { success: true, newCount: 0, updateCount: 0 };
  } catch (error) {
    console.error('Error collecting tasks:', error);
    return { success: false, error: error.message };
  }
}

// Funções auxiliares
function parseTodoMd(content) {
  // Implementação da extração de tarefas do Todo.md
}

function parseProgressLog(content) {
  // Implementação da extração de tarefas do Progress-log.md
}

function mergeTasks(todoTasks, progressTasks) {
  // Combina e elimina duplicatas
}

function mapStatus(status) {
  if (status === 'Concluído') return 'done';
  if (status === 'Iniciado') return 'in_progress';
  if (status === 'Bloqueado') return 'blocked';
  if (status === 'Review') return 'review';
  return 'backlog';
}

function mapPriority(title) {
  if (title.includes('URGENTE') || title.includes('CRITICAL')) return 'critical';
  if (title.includes('HIGH')) return 'high';
  if (title.includes('LOW')) return 'low';
  return 'medium';
}

function mapAgent(agentName) {
  // Extrai apenas o nome do agente (ex: "Zoro (eng-lead)" -> "Zoro")
  const name = agentName.split(' ')[0];
  return AGENT_MAP[name] || null;
}
```

## 5. Mudanças na store do Zustand

```typescript
// /lib/store.ts
import { create } from 'zustand';
import { supabase } from './supabase';

// Tipo da store
interface DashboardStore {
  // Dados
  agents: any[];
  tasks: any[];
  monitoring: any | null;
  interactions: any[];
  memoryGraph: { nodes: any[], edges: any[] } | null;
  standupMessages: any[];
  
  // Estado de carregamento
  loading: {
    agents: boolean;
    tasks: boolean;
    monitoring: boolean;
    interactions: boolean;
    memoryGraph: boolean;
    standupMessages: boolean;
  };
  
  // Erros
  errors: {
    agents: string | null;
    tasks: string | null;
    monitoring: string | null;
    interactions: string | null;
    memoryGraph: string | null;
    standupMessages: string | null;
  };
  
  // Ações
  fetchAgents: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchMonitoring: () => Promise<void>;
  fetchInteractions: () => Promise<void>;
  fetchMemoryGraph: () => Promise<void>;
  fetchStandupMessages: () => Promise<void>;
  moveTask: (taskId: string, newStatus: string) => Promise<void>;
  
  // Ações de subscrição realtime
  subscribeToAgents: () => () => void;
  subscribeToTasks: () => () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Estado inicial
  agents: [],
  tasks: [],
  monitoring: null,
  interactions: [],
  memoryGraph: null,
  standupMessages: [],
  
  loading: {
    agents: false,
    tasks: false,
    monitoring: false,
    interactions: false,
    memoryGraph: false,
    standupMessages: false,
  },
  
  errors: {
    agents: null,
    tasks: null,
    monitoring: null,
    interactions: null,
    memoryGraph: null,
    standupMessages: null,
  },
  
  // Ações para buscar dados reais
  fetchAgents: async () => {
    set(state => ({ loading: { ...state.loading, agents: true } }));
    try {
      const { data, error } = await supabase
        .from('agent_status')
        .select('*')
        .order('department');
      
      if (error) throw new Error(error.message);
      
      set(state => ({ 
        agents: data || [], 
        loading: { ...state.loading, agents: false },
        errors: { ...state.errors, agents: null }
      }));
    } catch (error) {
      console.error('Error fetching agents:', error);
      set(state => ({ 
        loading: { ...state.loading, agents: false },
        errors: { ...state.errors, agents: error.message }
      }));
    }
  },
  
  fetchTasks: async () => {
    set(state => ({ loading: { ...state.loading, tasks: true } }));
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      set(state => ({ 
        tasks: data || [], 
        loading: { ...state.loading, tasks: false },
        errors: { ...state.errors, tasks: null }
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set(state => ({ 
        loading: { ...state.loading, tasks: false },
        errors: { ...state.errors, tasks: error.message }
      }));
    }
  },
  
  fetchMonitoring: async () => {
    set(state => ({ loading: { ...state.loading, monitoring: true } }));
    try {
      // Obter métricas diárias
      const { data: dailyData, error: dailyError } = await supabase
        .from('metrics')
        .select('*')
        .eq('metric_type', 'daily')
        .order('date', { ascending: false })
        .limit(30);
      
      if (dailyError) throw new Error(dailyError.message);
      
      // Obter totais
      const { data: totalsData, error: totalsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('metric_type', 'totals')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (totalsError) throw new Error(totalsError.message);
      
      // Obter dados do provedor
      const { data: providerData, error: providerError } = await supabase
        .from('metrics')
        .select('*')
        .eq('metric_type', 'provider')
        .order('value', { ascending: false });
      
      if (providerError) throw new Error(providerError.message);
      
      // Construir objeto de monitoramento
      const monitoring = {
        daily: dailyData || [],
        totals: totalsData?.[0]?.metadata || { totalTokens: 0, totalCost: 0, input: 0, output: 0 },
        byProvider: providerData || [],
        // ... adicionar outros dados de monitoramento
      };
      
      set(state => ({ 
        monitoring, 
        loading: { ...state.loading, monitoring: false },
        errors: { ...state.errors, monitoring: null }
      }));
    } catch (error) {
      console.error('Error fetching monitoring:', error);
      set(state => ({ 
        loading: { ...state.loading, monitoring: false },
        errors: { ...state.errors, monitoring: error.message }
      }));
    }
  },
  
  // ... implementações similares para outras ações
  
  // Ação para mover tarefa (Kanban)
  moveTask: async (taskId, newStatus) => {
    try {
      // Atualizar no Supabase
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      
      if (error) throw new Error(error.message);
      
      // Atualizar localmente
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
            : task
        )
      }));
    } catch (error) {
      console.error('Error moving task:', error);
      // Recarregar para sincronizar
      get().fetchTasks();
    }
  },
  
  // Subscrições realtime
  subscribeToAgents: () => {
    const subscription = supabase
      .channel('agent-status-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agent_status' },
        (payload) => {
          set(state => {
            // Atualizar o agente específico
            const updatedAgents = [...state.agents];
            const index = updatedAgents.findIndex(a => a.agent_id === payload.new.agent_id);
            
            if (index >= 0) {
              // Substituir
              updatedAgents[index] = payload.new;
            } else {
              // Adicionar novo
              updatedAgents.push(payload.new);
            }
            
            return { agents: updatedAgents };
          });
        }
      )
      .subscribe();
    
    // Retornar função de limpeza
    return () => {
      subscription.unsubscribe();
    };
  },
  
  subscribeToTasks: () => {
    const subscription = supabase
      .channel('task-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          set(state => {
            let updatedTasks = [...state.tasks];
            
            if (payload.eventType === 'INSERT') {
              // Adicionar nova tarefa
              updatedTasks.push(payload.new);
            } else if (payload.eventType === 'UPDATE') {
              // Atualizar tarefa existente
              updatedTasks = updatedTasks.map(task => 
                task.id === payload.new.id ? payload.new : task
              );
            } else if (payload.eventType === 'DELETE') {
              // Remover tarefa
              updatedTasks = updatedTasks.filter(task => task.id !== payload.old.id);
            }
            
            return { tasks: updatedTasks };
          });
        }
      )
      .subscribe();
    
    // Retornar função de limpeza
    return () => {
      subscription.unsubscribe();
    };
  },
}));
```

## 6. Atualização dos componentes principais

Cada componente precisará ser atualizado para usar os dados reais em vez dos dados mockados:

### 6.1 - World Component (Virtual Office)

```tsx
// /app/world/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboardStore } from "../../lib/store";
import { motion, AnimatePresence } from "framer-motion";

// Constantes que permanecem estáticas (salas, cores, etc.)
const ROOMS = [
  // ... definição das salas (esta parte pode permanecer estática)
];

export default function WorldPage() {
  const { agents, loading, fetchAgents, subscribeToAgents } = useDashboardStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  
  // Efeito para carregar dados e subscrever a atualizações
  useEffect(() => {
    // Carregar dados iniciais
    fetchAgents();
    
    // Subscrever a atualizações
    const unsubscribe = subscribeToAgents();
    
    // Limpar na desmontagem
    return () => {
      unsubscribe();
    };
  }, [fetchAgents, subscribeToAgents]);
  
  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading.agents) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationId: number;
    
    // Mapear agentes para salas com base no departamento
    const agentPositions = mapAgentsToRooms(agents, ROOMS);
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar salas
      ROOMS.forEach(room => {
        drawRoom(ctx, room, frameRef.current);
      });
      
      // Desenhar agentes
      agentPositions.forEach(pos => {
        drawAgent(ctx, pos, frameRef.current, pos.agent.agent_id === selectedAgentId);
      });
      
      frameRef.current++;
      animationId = requestAnimationFrame(draw);
    }
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [agents, loading.agents, selectedAgentId]);
  
  // Renderização
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🏢</span> Virtual Office
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          LIVE_ENVIRONMENT // REAL_TIME_SYNC // AGENT_POSITIONS
        </p>
      </div>
      
      {loading.agents ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-2xl animate-pulse">⌛</div>
            <p className="mt-2 text-sm">Loading real-time agent data...</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Canvas para desenho do Virtual Office */}
          <canvas 
            ref={canvasRef} 
            width={1344} 
            height={960} 
            className="bg-ocean-950 rounded-lg w-full h-auto"
            onClick={handleCanvasClick}
          />
          
          {/* Agent detail popup */}
          <AnimatePresence>
            {selectedAgentId && (
              <AgentDetailCard 
                agent={agents.find(a => a.agent_id === selectedAgentId)} 
                onClose={() => setSelectedAgentId(null)}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
  
  // Funções auxiliares
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    // Implementação do click handler para selecionar agentes
  }
  
  function mapAgentsToRooms(agents, rooms) {
    // Mapear agentes para salas baseado no departamento
  }
  
  function drawRoom(ctx, room, frame) {
    // Desenho de sala no canvas
  }
  
  function drawAgent(ctx, position, frame, isSelected) {
    // Desenho de agente no canvas
  }
}

function AgentDetailCard({ agent, onClose }) {
  // Card de detalhes do agente selecionado
  if (!agent) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute glass-card p-4 z-10"
      style={{ /* posicionamento */ }}
    >
      {/* Conteúdo do card */}
    </motion.div>
  );
}
```

## 7. Implementação dos cron jobs de coleta

### 7.1 - Setup script

```typescript
// /scripts/setup-collectors.ts
import { setupCronJobs } from '../lib/cron';

async function main() {
  console.log('Configurando coletores de dados reais...');
  
  try {
    // Configurar cron jobs para coleta
    await setupCronJobs();
    
    console.log('Coletores configurados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao configurar coletores:', error);
    process.exit(1);
  }
}

main();
```

### 7.2 - Cron setup

```typescript
// /lib/cron.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { collectAgentStatus } from './collectors/agentStatusCollector';
import { collectTasks } from './collectors/taskCollector';
import { collectMetrics } from './collectors/metricCollector';
import { collectInteractions } from './collectors/interactionCollector';
import { collectMemory } from './collectors/memoryCollector';
import { reconcileData } from './reconciliation';

const execAsync = promisify(exec);

/**
 * Configura os cron jobs para coleta de dados
 */
export async function setupCronJobs() {
  const cronJobs = [
    {
      name: 'agent-status-collector',
      schedule: '*/2 * * * *', // A cada 2 minutos
      message: 'Coletar status dos agentes para o Dashboard',
      model: 'google/gemini-flash-lite-latest'
    },
    {
      name: 'tasks-collector',
      schedule: '*/5 * * * *', // A cada 5 minutos
      message: 'Coletar tarefas do filesystem para o Dashboard',
      model: 'google/gemini-flash-lite-latest'
    },
    {
      name: 'metrics-collector',
      schedule: '*/10 * * * *', // A cada 10 minutos
      message: 'Coletar métricas para o Dashboard',
      model: 'google/gemini-flash-lite-latest'
    },
    {
      name: 'interaction-collector',
      schedule: '*/5 * * * *', // A cada 5 minutos
      message: 'Coletar interações entre agentes para o Dashboard',
      model: 'google/gemini-flash-lite-latest'
    },
    {
      name: 'memory-collector',
      schedule: '*/15 * * * *', // A cada 15 minutos
      message: 'Coletar grafo de memória para o Dashboard',
      model: 'google/gemini-flash-lite-latest'
    },
    {
      name: 'reconciliation-loop',
      schedule: '*/30 * * * *', // A cada 30 minutos
      message: 'Reconciliar dados para o Dashboard',
      model: 'google/gemini-flash-lite-latest'
    }
  ];
  
  // Verificar jobs existentes
  const { stdout } = await execAsync('openclaw cron list --json');
  const existingJobs = JSON.parse(stdout);
  const existingNames = existingJobs.map(job => job.name);
  
  // Criar jobs ausentes
  for (const job of cronJobs) {
    if (!existingNames.includes(job.name)) {
      const command = `openclaw cron add --name ${job.name} --schedule "${job.schedule}" --message "${job.message}" --model ${job.model}`;
      await execAsync(command);
      console.log(`Cron job ${job.name} criado com sucesso`);
    } else {
      console.log(`Cron job ${job.name} já existe`);
    }
  }
}

/**
 * Handler para o cron job de agent-status-collector
 */
export async function handleAgentStatusCollection() {
  console.log('Coletando status dos agentes...');
  const result = await collectAgentStatus();
  console.log('Resultado:', result);
  return result;
}

/**
 * Handler para o cron job de tasks-collector
 */
export async function handleTaskCollection() {
  console.log('Coletando tarefas...');
  const result = await collectTasks();
  console.log('Resultado:', result);
  return result;
}

// ... handlers para outros coletores

/**
 * Handler para reconciliação
 */
export async function handleReconciliation() {
  console.log('Reconciliando dados...');
  const result = await reconcileData();
  console.log('Resultado:', result);
  return result;
}
```

## 8. Inicialização Vercel

```typescript
// /app/api/collectors/initialize/route.ts
import { NextResponse } from 'next/server';
import { setupCronJobs } from '@/lib/cron';
import { supabase } from '@/lib/supabase-admin';

/**
 * Endpoint para inicializar coletores
 * Chamado pelo Vercel ao deploy
 */
export async function GET() {
  try {
    // Verificar se as tabelas existem
    const { data, error } = await supabase
      .from('agent_status')
      .select('agent_id')
      .limit(1);
    
    if (error) {
      // Tabela não existe ou erro de conexão
      return NextResponse.json({
        success: false,
        error: `Failed to check table: ${error.message}`,
        action: 'Run migrations first'
      }, { status: 500 });
    }
    
    // Configurar cron jobs
    await setupCronJobs();
    
    return NextResponse.json({
      success: true,
      message: 'Collectors initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing collectors:', error);
    return NextResponse.json({
      success: false,
      error: `Initialization failed: ${error.message}`
    }, { status: 500 });
  }
}
```

## 9. Plano de Implementação

1. **Dia 1: Preparação**
   - Criar tabelas no Supabase
   - Configurar RLS e permissões
   - Habilitar Realtime
   - Testar conexão

2. **Dia 2: Collectors**
   - Implementar os coletores
   - Configurar cron jobs
   - Fazer coleta inicial

3. **Dia 3: Store e Hooks**
   - Atualizar Zustand store
   - Implementar hooks de Realtime
   - Testar subscrições

4. **Dia 4: Componentes**
   - Atualizar componentes principais
   - Remover dados mockados
   - Testar renderização com dados reais

5. **Dia 5: Testes e Deploy**
   - Testar end-to-end
   - Deploy para produção
   - Monitorar dados reais

## 10. Verificação Final

Antes do deploy, execute:

```bash
# Verificar se todas as páginas usam dados reais
grep -r "MOCK" --include="*.tsx" --include="*.ts" .

# Validar integridade dos dados
npm run check-data-integrity

# Teste de carga
npm run load-test
```

---

Este plano de implementação substitui 100% dos dados mockados por dados reais, com coleta automatizada e sincronização em tempo real para todos os componentes do Dashboard.

Implementando esta especificação, o Virtual Office e todas as visualizações serão baseadas em dados reais, refletindo o verdadeiro estado da operação do Revenue-OS.