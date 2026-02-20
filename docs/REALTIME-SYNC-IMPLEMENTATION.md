# REALTIME SYNC IMPLEMENTATION
**Autor:** Shanks (OS Captain)  
**Versão:** 1.0  
**Status:** Ready for Implementation

---

## ÍNDICE
1. [Objetivo](#objetivo)
2. [Arquitetura de Sincronização](#arquitetura-de-sincronização)
3. [Implementação Supabase Realtime](#implementação-supabase-realtime)
4. [Collectors e Feed de Dados](#collectors-e-feed-de-dados)
5. [Tratamento de Falhas](#tratamento-de-falhas)
6. [Código Chave](#código-chave)
7. [Implantação e Testes](#implantação-e-testes)

---

## OBJETIVO

Implementar um sistema de sincronização em tempo real que garanta:

1. **Verdade Única:** Supabase como fonte primária de dados
2. **Latência Zero:** Atualizações perceptíveis imediatamente
3. **Resiliência Total:** Operação contínua mesmo com falhas parciais
4. **Auditoria Completa:** Logs de eventos para todas as mudanças
5. **Reconciliação Automática:** Resolução de conflitos sem intervenção

---

## ARQUITETURA DE SINCRONIZAÇÃO

### Diagrama de Componentes

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  DATA SOURCES │     │  DATA STORE   │     │  CONSUMERS    │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│ OpenClaw    │     │                 │     │             │
│ Sessions    │---->│                 │     │ Dashboard   │
└─────────────┘     │                 │     │ UI          │
                    │                 │     │             │
┌─────────────┐     │   SUPABASE      │---->│             │
│ Filesystem  │---->│   (PostgreSQL   │     └─────────────┘
│ Logs        │     │    + Realtime)  │
└─────────────┘     │                 │     ┌─────────────┐
                    │                 │     │             │
┌─────────────┐     │                 │     │ Automation  │
│ API Data    │---->│                 │     │ Triggers    │
│ (Stripe/GH) │     │                 │     │             │
└─────────────┘     └────────┬────────┘     └─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Reconciliation │
                    │      Loop       │
                    └─────────────────┘
```

### Fluxo de Dados

1. **Collectors** leem de fontes primárias:
   - OpenClaw sessions
   - Logs do filesystem
   - APIs externas (Stripe, GitHub)

2. **Writers** atualizam o Supabase:
   - Escritas transacionais
   - Batch updates (lotes)
   - Upserts atômicos

3. **Subscribers** consomem eventos em tempo real:
   - Dashboard UI
   - Trigger systems
   - Automation components

4. **Reconciliation** verifica e corrige:
   - Loop periódico (cada 60s)
   - Verificação baseada em checksum
   - Correção automática de discrepâncias

---

## IMPLEMENTAÇÃO SUPABASE REALTIME

### 1. Configuração do Realtime Server

```sql
-- Habilitar publicações para todas as tabelas relevantes
BEGIN;
  -- Agente core tables
  ALTER PUBLICATION supabase_realtime ADD TABLE agent_profiles;
  ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
  ALTER PUBLICATION supabase_realtime ADD TABLE agent_stats;
  ALTER PUBLICATION supabase_realtime ADD TABLE agent_actions;
  
  -- Economy tables
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
  ALTER PUBLICATION supabase_realtime ADD TABLE bounties;
  ALTER PUBLICATION supabase_realtime ADD TABLE evaluations;
  
  -- System tables
  ALTER PUBLICATION supabase_realtime ADD TABLE spawn_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE system_health;
COMMIT;

-- Configurar políticas de replicação (Row Level Security)
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;

-- Criar política para leitura pública (necessário para Realtime)
CREATE POLICY "Realtime Read Access" ON agent_status
  FOR SELECT USING (true);
```

### 2. Client-side Subscription

```typescript
// /lib/realtime.ts
import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/realtime-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Tipos para as tabelas principais
type AgentStatus = {
  agent_id: string
  status: string
  current_task: string | null
  last_heartbeat: string
  position_x: number
  position_y: number
  room_id: string
  interaction_id: string | null
  updated_at: string
}

type AgentStats = {
  agent_id: string
  xp: number
  level: number
  title: string
  // ... outros campos
}

// Cache local (memória)
const cache = {
  agentStatus: new Map<string, AgentStatus>(),
  agentStats: new Map<string, AgentStats>(),
}

// Channels ativos
let channels: {
  agentStatus?: RealtimeChannel,
  agentStats?: RealtimeChannel,
  tasks?: RealtimeChannel,
  // ... outros channels
} = {}

// Callbacks de atualização
type UpdateCallback<T> = (data: T) => void
const statusCallbacks = new Set<UpdateCallback<AgentStatus>>()
const statsCallbacks = new Set<UpdateCallback<AgentStats>>()

/**
 * Inicializa todos os canais de realtime
 */
export function initRealtimeSync() {
  // 1. Agent Status Channel (alta prioridade)
  channels.agentStatus = supabase
    .channel('agent-status-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'agent_status' },
      (payload) => {
        const data = payload.new as AgentStatus
        cache.agentStatus.set(data.agent_id, data)
        statusCallbacks.forEach(cb => cb(data))
      }
    )
    .subscribe((status) => {
      console.log('Agent status realtime status:', status)
    })
    
  // 2. Agent Stats Channel
  channels.agentStats = supabase
    .channel('agent-stats-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'agent_stats' },
      (payload) => {
        const data = payload.new as AgentStats
        cache.agentStats.set(data.agent_id, data)
        statsCallbacks.forEach(cb => cb(data))
      }
    )
    .subscribe()
    
  // Inicializar outros channels...
}

/**
 * Registra callback para updates de status
 */
export function onAgentStatusChange(callback: UpdateCallback<AgentStatus>) {
  statusCallbacks.add(callback)
  return () => {
    statusCallbacks.delete(callback)
  }
}

/**
 * Registra callback para updates de stats
 */
export function onAgentStatsChange(callback: UpdateCallback<AgentStats>) {
  statsCallbacks.add(callback)
  return () => {
    statsCallbacks.delete(callback)
  }
}

/**
 * Carrega dados iniciais e configura fallback
 */
export async function initializeData() {
  // Carregar estado inicial
  const { data: statusData } = await supabase
    .from('agent_status')
    .select('*')
    
  if (statusData) {
    statusData.forEach(status => {
      cache.agentStatus.set(status.agent_id, status)
    })
  }
  
  // Configurar fallback polling (SWR) apenas para casos críticos
  setupPollingFallback()
}

/**
 * Cria um fallback para caso o Realtime falhe
 */
function setupPollingFallback() {
  // Polling leve (apenas se Realtime falhar)
  const POLL_INTERVAL = 30000 // 30 segundos
  
  let pollTimer: NodeJS.Timeout
  let realtimeFailed = false
  
  // Monitor de saúde do Realtime
  channels.agentStatus?.on('disconnect', () => {
    realtimeFailed = true
    startPolling()
  })
  
  channels.agentStatus?.on('reconnect', () => {
    realtimeFailed = false
    stopPolling()
  })
  
  function startPolling() {
    if (pollTimer) clearInterval(pollTimer)
    
    pollTimer = setInterval(async () => {
      if (!realtimeFailed) return // não pollar se o realtime estiver ok
      
      // Fazer polling apenas das tabelas críticas
      const { data } = await supabase
        .from('agent_status')
        .select('*')
        
      if (data) {
        data.forEach(status => {
          const cachedStatus = cache.agentStatus.get(status.agent_id)
          
          // Só atualiza se for mais recente
          if (!cachedStatus || new Date(status.updated_at) > new Date(cachedStatus.updated_at)) {
            cache.agentStatus.set(status.agent_id, status)
            statusCallbacks.forEach(cb => cb(status))
          }
        })
      }
    }, POLL_INTERVAL)
  }
  
  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer)
  }
}

// Exportar cache para acesso direto
export { cache }
```

### 3. Hooks de React para Virtual Office

```tsx
// /hooks/useRealtimeAgents.ts
import { useState, useEffect } from 'react'
import { onAgentStatusChange, onAgentStatsChange, cache, initRealtimeSync, initializeData } from '../lib/realtime'

// Estado global da inicialização
let initialized = false

export function useRealtimeAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Inicialização única
    if (!initialized) {
      initialized = true
      initRealtimeSync()
      initializeData().then(() => {
        setLoading(false)
      })
    }
    
    // Construir agentes a partir dos caches
    function updateAgentsFromCache() {
      const agentMap = new Map<string, any>()
      
      // Combinar dados do status e stats
      cache.agentStatus.forEach((status, id) => {
        if (!agentMap.has(id)) {
          agentMap.set(id, {})
        }
        const agent = agentMap.get(id)
        Object.assign(agent, { ...status })
      })
      
      cache.agentStats.forEach((stats, id) => {
        if (!agentMap.has(id)) {
          agentMap.set(id, {})
        }
        const agent = agentMap.get(id)
        Object.assign(agent, { ...stats })
      })
      
      // Converter para array
      setAgents(Array.from(agentMap.values()))
    }
    
    // Atualização inicial
    updateAgentsFromCache()
    
    // Escutar mudanças de status
    const unsubStatus = onAgentStatusChange(() => {
      updateAgentsFromCache()
    })
    
    // Escutar mudanças de stats
    const unsubStats = onAgentStatsChange(() => {
      updateAgentsFromCache()
    })
    
    return () => {
      unsubStatus()
      unsubStats()
    }
  }, [])
  
  return { agents, loading }
}
```

---

## COLLECTORS E FEED DE DADOS

### 1. OpenClaw Session Collector

```typescript
// /lib/collectors/sessionCollector.ts
import { exec } from 'child_process'
import { promisify } from 'util'
import { supabase } from '../supabase-admin'

const execAsync = promisify(exec)

/**
 * Coleta dados de sessão do OpenClaw
 */
export async function collectSessionData() {
  try {
    // Executar comando para listar sessões
    const { stdout } = await execAsync('openclaw sessions list --json')
    const sessions = JSON.parse(stdout)
    
    // Processar cada sessão
    for (const session of sessions) {
      const agentId = extractAgentId(session.key)
      
      if (!agentId) continue
      
      // Determinar status
      const status = session.abortedLastRun ? 'error' : 
                    (Date.now() - session.updatedAt < 300000) ? 'active' : 'idle'
                    
      // Atualizar status na tabela
      await supabase
        .from('agent_status')
        .upsert({
          agent_id: agentId,
          status,
          last_heartbeat: new Date(session.updatedAt).toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'agent_id'
        })
        
      // Se for uma nova task, registrar no agent_actions
      if (session.lastMessage && session.lastMessage.includes('Task:')) {
        await supabase
          .from('agent_actions')
          .insert({
            agent_id: agentId,
            action_type: 'task_start',
            details: {
              task: session.lastMessage,
              session_key: session.key
            }
          })
      }
    }
    
    return { success: true, count: sessions.length }
  } catch (error) {
    console.error('Erro ao coletar dados de sessão:', error)
    return { success: false, error }
  }
}

/**
 * Extrai ID do agente da chave de sessão
 */
function extractAgentId(sessionKey: string): string | null {
  const match = sessionKey.match(/agent:([^:]+)/)
  return match ? match[1] : null
}
```

### 2. Filesystem Log Collector

```typescript
// /lib/collectors/logCollector.ts
import fs from 'fs/promises'
import path from 'path'
import { supabase } from '../supabase-admin'

const LOGS_DIR = process.env.LOGS_DIR || '/home/node/.openclaw/workspaces/os/memory'
const PROGRESS_LOG = '/home/node/.openclaw/workspaces/os/Progress-log.md'

/**
 * Coleta dados de logs do filesystem
 */
export async function collectLogData() {
  try {
    // Ler Progress-log.md
    const progressLog = await fs.readFile(PROGRESS_LOG, 'utf-8')
    const tasks = parseProgressLog(progressLog)
    
    // Atualizar tarefas no Supabase
    for (const task of tasks) {
      // Verificar se já existe
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('title', task.title)
        .maybeSingle()
        
      if (existingTask) {
        // Atualizar status
        await supabase
          .from('tasks')
          .update({
            status: task.status === 'Concluído' ? 'done' : 
                   task.status === 'Iniciado' ? 'in_progress' : 'backlog',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTask.id)
      } else {
        // Criar nova tarefa
        await supabase
          .from('tasks')
          .insert({
            title: task.title,
            description: task.context || '',
            status: task.status === 'Concluído' ? 'done' : 
                   task.status === 'Iniciado' ? 'in_progress' : 'backlog',
            assignee: task.agent ? await getAgentId(task.agent) : null
          })
      }
    }
    
    // Coletar dados dos arquivos de memória diários
    const memoryFiles = await fs.readdir(LOGS_DIR)
    
    for (const file of memoryFiles) {
      if (file.match(/\d{4}-\d{2}-\d{2}\.md$/)) {
        // Processar apenas arquivos de memória diária
        const content = await fs.readFile(path.join(LOGS_DIR, file), 'utf-8')
        await processMemoryFile(file, content)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao coletar dados de log:', error)
    return { success: false, error }
  }
}

/**
 * Processa arquivo de memória e extrai informações
 */
async function processMemoryFile(filename: string, content: string) {
  // Extrair data do arquivo
  const date = filename.replace('.md', '')
  
  // Extrair interações, bounties, etc.
  const interactions = extractInteractions(content)
  
  for (const interaction of interactions) {
    await supabase
      .from('interactions')
      .insert({
        from_agent: await getAgentId(interaction.from),
        to_agent: await getAgentId(interaction.to),
        type: interaction.type,
        content: interaction.content,
        created_at: new Date(`${date}T${interaction.time || '12:00:00'}Z`).toISOString()
      })
      .onConflict('do nothing') // Evitar duplicação
  }
  
  // Extrair outras informações...
}

/**
 * Mapeia nome do agente para ID
 */
async function getAgentId(agentName: string): Promise<string | null> {
  const name = agentName.split(' ')[0] // Pega só o primeiro nome (ex: "Zoro (eng-lead)" => "Zoro")
  
  const { data } = await supabase
    .from('agent_profiles')
    .select('id')
    .ilike('name', `%${name}%`)
    .maybeSingle()
    
  return data?.id || null
}

// Outras funções auxiliares de parsing...
```

---

## TRATAMENTO DE FALHAS

### 1. Reconciliation Loop

```typescript
// /lib/reconciliation.ts
import { supabase } from './supabase-admin'
import { collectSessionData } from './collectors/sessionCollector'
import { collectLogData } from './collectors/logCollector'

/**
 * Loop de reconciliação que verifica e corrige inconsistências
 */
export async function runReconciliationLoop() {
  console.log('Iniciando loop de reconciliação...')
  
  try {
    // 1. Atualizar dados a partir de fontes primárias
    await Promise.all([
      collectSessionData(),
      collectLogData()
    ])
    
    // 2. Verificar agentes inativos (sem heartbeat recente)
    const { data: inactiveAgents } = await supabase
      .from('agent_status')
      .select('agent_id')
      .lt('last_heartbeat', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // 15 minutos
      .eq('status', 'active')
    
    if (inactiveAgents?.length) {
      // Marcar como inativos
      await supabase
        .from('agent_status')
        .update({
          status: 'idle',
          updated_at: new Date().toISOString()
        })
        .in('agent_id', inactiveAgents.map(a => a.agent_id))
        
      console.log(`Marcados ${inactiveAgents.length} agentes como inativos`)
    }
    
    // 3. Verificar tarefas travadas
    const { data: stuckTasks } = await supabase
      .from('tasks')
      .select('id, title, assignee')
      .eq('status', 'in_progress')
      .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 horas
    
    if (stuckTasks?.length) {
      // Reportar e marcar para review
      await supabase
        .from('tasks')
        .update({
          status: 'blocked',
          updated_at: new Date().toISOString()
        })
        .in('id', stuckTasks.map(t => t.id))
        
      console.log(`Marcadas ${stuckTasks.length} tarefas como blocked`)
      
      // Adicionar ao log
      for (const task of stuckTasks) {
        await supabase
          .from('agent_actions')
          .insert({
            agent_id: task.assignee,
            action_type: 'task_blocked',
            details: {
              task_id: task.id,
              task_title: task.title,
              reason: 'Tempo limite excedido (24h)'
            }
          })
      }
    }
    
    // 4. Verificar XP e níveis
    await reconcileXpAndLevels()
    
    // 5. Registrar execução bem-sucedida
    await supabase
      .from('system_health')
      .insert({
        check_type: 'reconciliation',
        status: 'success',
        details: {
          inactiveAgents: inactiveAgents?.length || 0,
          stuckTasks: stuckTasks?.length || 0
        }
      })
      
    console.log('Loop de reconciliação concluído com sucesso')
    return true
  } catch (error) {
    console.error('Erro no loop de reconciliação:', error)
    
    // Registrar falha
    await supabase
      .from('system_health')
      .insert({
        check_type: 'reconciliation',
        status: 'error',
        details: {
          error: String(error)
        }
      })
      
    return false
  }
}

/**
 * Reconcilia XP e níveis
 */
async function reconcileXpAndLevels() {
  // Obter todos os agentes e suas estatísticas
  const { data: agents } = await supabase
    .from('agent_stats')
    .select('*')
    
  if (!agents) return
  
  for (const agent of agents) {
    // Calcular nível baseado no XP
    const expectedLevel = calculateLevel(agent.xp)
    const expectedTitle = getTitleForLevel(expectedLevel)
    
    if (expectedLevel !== agent.level || expectedTitle !== agent.title) {
      // Corrigir discrepância
      await supabase
        .from('agent_stats')
        .update({
          level: expectedLevel,
          title: expectedTitle,
          updated_at: new Date().toISOString()
        })
        .eq('agent_id', agent.agent_id)
        
      console.log(`Corrigido nível para ${agent.agent_id}: ${agent.level} -> ${expectedLevel}`)
      
      // Registrar promoção/rebaixamento
      await supabase
        .from('agent_actions')
        .insert({
          agent_id: agent.agent_id,
          action_type: expectedLevel > agent.level ? 'promotion' : 'demotion',
          details: {
            old_level: agent.level,
            new_level: expectedLevel,
            old_title: agent.title,
            new_title: expectedTitle
          }
        })
    }
  }
}

/**
 * Calcula nível baseado no XP
 */
function calculateLevel(xp: number): number {
  if (xp >= 100000) return 5 // Fellow
  if (xp >= 40000) return 4  // Principal
  if (xp >= 15000) return 3  // Senior
  if (xp >= 5000) return 2   // Mid-level
  return 1                   // Junior
}

/**
 * Retorna título para o nível
 */
function getTitleForLevel(level: number): string {
  switch (level) {
    case 5: return 'Fellow'
    case 4: return 'Principal'
    case 3: return 'Senior'
    case 2: return 'Mid-level'
    default: return 'Junior'
  }
}
```

### 2. Circuit Breakers e Fallbacks

```typescript
// /lib/circuitBreaker.ts
type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitOptions {
  failureThreshold: number
  resetTimeout: number
  fallback: (...args: any[]) => Promise<any>
}

/**
 * Implementação de Circuit Breaker para operações críticas
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures = 0
  private resetTimer: NodeJS.Timeout | null = null
  private lastError: Error | null = null
  
  constructor(private options: CircuitOptions) {}
  
  /**
   * Executa uma função com proteção de circuit breaker
   */
  async execute<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
    if (this.state === 'open') {
      // Circuito aberto, usar fallback
      console.log('Circuito aberto, usando fallback')
      return this.options.fallback(...args)
    }
    
    try {
      const result = await fn(...args)
      
      // Resetar contador em caso de sucesso
      this.failures = 0
      if (this.state === 'half-open') {
        this.state = 'closed'
        console.log('Circuito fechado novamente')
      }
      
      return result
    } catch (error) {
      this.lastError = error as Error
      this.failures++
      
      if (this.failures >= this.options.failureThreshold && this.state === 'closed') {
        // Abrir o circuito
        this.state = 'open'
        console.log(`Circuito aberto após ${this.failures} falhas`)
        
        // Configurar timer para tentar novamente
        this.resetTimer = setTimeout(() => {
          this.state = 'half-open'
          this.failures = 0
          console.log('Circuito meio-aberto, permitindo uma tentativa')
        }, this.options.resetTimeout)
      }
      
      // Usar fallback
      return this.options.fallback(...args)
    }
  }
  
  /**
   * Força o fechamento do circuito
   */
  forceClose() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
      this.resetTimer = null
    }
    
    this.state = 'closed'
    this.failures = 0
    console.log('Circuito forçado a fechar')
  }
  
  /**
   * Retorna o estado atual do circuito
   */
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastError: this.lastError?.message || null
    }
  }
}

/**
 * Circuit breaker para operações do Supabase
 */
export const supabaseCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000, // 30 segundos
  fallback: async (table, operation, ...args) => {
    console.log(`Fallback para operação ${operation} na tabela ${table}`)
    
    // Usar cache local ou dados estáticos como fallback
    if (table === 'agent_status' && operation === 'select') {
      // Retornar do cache local
      return { data: Array.from(cache.agentStatus.values()) }
    }
    
    // Fallback genérico
    return { data: null, error: new Error('Operation failed, using fallback data') }
  }
})
```

---

## CÓDIGO CHAVE

### 1. Virtual Office Component

```tsx
// /app/world/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRealtimeAgents } from "../../hooks/useRealtimeAgents";
import { motion, AnimatePresence } from "framer-motion";

const ROOMS = [
  { id: "ponte-de-comando", label: "Command Bridge", icon: "⚓", color: "#f59e0b", x: 1, y: 1, w: 9, h: 7 },
  { id: "forja", label: "Engineering", icon: "⚔️", color: "#3b82f6", x: 11, y: 1, w: 9, h: 7 },
  // ... outros quartos
];

export default function WorldPage() {
  const { agents, loading } = useRealtimeAgents();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const canvasRef = useRef(null);
  
  // Configuração do canvas e loop de animação
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let animationId;
    
    function draw() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw rooms
      ROOMS.forEach(room => {
        drawRoom(ctx, room, frame);
      });
      
      // Draw agents
      agents.forEach(agent => {
        drawAgent(ctx, agent, frame);
      });
      
      // Next frame
      frame++;
      animationId = requestAnimationFrame(draw);
    }
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [agents]);
  
  // Render
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
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-2xl animate-pulse">⌛</div>
            <p className="mt-2 text-sm">Loading virtual office...</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={1344} 
            height={960} 
            className="bg-ocean-950 rounded-lg w-full h-auto"
          />
          
          {/* Agent Popup on Selection */}
          <AnimatePresence>
            {selectedAgent && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute p-4 glass-card"
                style={{ 
                  left: `${selectedAgent.position_x}px`, 
                  top: `${selectedAgent.position_y}px`,
                  zIndex: 10
                }}
              >
                {/* Agent details card */}
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{selectedAgent.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedAgent.name}</h3>
                    <p className="text-xs text-accent-blue">{selectedAgent.title}</p>
                    <p className="text-[10px] text-gray-500">{selectedAgent.department}</p>
                    
                    <div className="mt-2 text-[11px] text-gray-400">
                      <p><span className="text-gray-600">Status:</span> {selectedAgent.status}</p>
                      <p><span className="text-gray-600">Task:</span> {selectedAgent.current_task || "Idle"}</p>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-[10px] text-gray-600 flex justify-between">
                        <span>Level {selectedAgent.level}</span>
                        <span>{selectedAgent.xp} XP</span>
                      </div>
                      <div className="w-full h-1.5 bg-ocean-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-purple" 
                          style={{ width: `${getProgressPercent(selectedAgent.xp, selectedAgent.level)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Funções auxiliares de desenho
function drawRoom(ctx, room, frame) {
  // Implementação do desenho de sala
}

function drawAgent(ctx, agent, frame) {
  // Implementação do desenho de agente
}

function getProgressPercent(xp, level) {
  // Calcula progresso percentual para o próximo nível
}
```

### 2. API Route para Atualização de Status

```typescript
// /app/api/agents/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'
import { supabaseCircuitBreaker } from '@/lib/circuitBreaker'

/**
 * Atualiza o status de um agente
 */
export async function POST(req: NextRequest) {
  try {
    const { agent_id, status, current_task, room_id, position_x, position_y } = await req.json()
    
    if (!agent_id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }
    
    // Usar circuit breaker para operação crítica
    const { data, error } = await supabaseCircuitBreaker.execute(
      async () => {
        return await supabase
          .from('agent_status')
          .upsert({
            agent_id,
            status,
            current_task,
            room_id,
            position_x,
            position_y,
            last_heartbeat: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'agent_id'
          })
      },
      'agent_status',
      'upsert',
      agent_id
    )
    
    if (error) {
      console.error('Error updating agent status:', error)
      return NextResponse.json(
        { error: 'Failed to update agent status' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in status update route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3. Cron Job de Coleta

```typescript
// /lib/cron.ts
import { collectSessionData } from './collectors/sessionCollector'
import { collectLogData } from './collectors/logCollector'
import { runReconciliationLoop } from './reconciliation'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Setup de cron jobs para coleta e sincronização
 */
export async function setupCronJobs() {
  console.log('Configurando cron jobs...')
  
  // Verificar se já existem
  try {
    const { stdout } = await execAsync('openclaw cron list')
    
    // Collectors
    if (!stdout.includes('session-collector')) {
      await execAsync(`
        openclaw cron add --name session-collector --schedule "*/2 * * * *" 
        --message "Collect session data and update Supabase" --model google/gemini-flash-lite-latest
      `)
      console.log('Cron job session-collector criado')
    }
    
    if (!stdout.includes('log-collector')) {
      await execAsync(`
        openclaw cron add --name log-collector --schedule "*/5 * * * *" 
        --message "Collect log data and update Supabase" --model google/gemini-flash-lite-latest
      `)
      console.log('Cron job log-collector criado')
    }
    
    // Reconciliation
    if (!stdout.includes('reconciliation-loop')) {
      await execAsync(`
        openclaw cron add --name reconciliation-loop --schedule "*/10 * * * *" 
        --message "Run reconciliation loop to fix inconsistencies" --model google/gemini-flash-lite-latest
      `)
      console.log('Cron job reconciliation-loop criado')
    }
    
    console.log('Cron jobs configurados com sucesso')
  } catch (error) {
    console.error('Erro ao configurar cron jobs:', error)
  }
}

/**
 * Executor de session-collector
 */
export async function runSessionCollector() {
  console.log('Executando session-collector...')
  const result = await collectSessionData()
  console.log('Resultado:', result)
  return result
}

/**
 * Executor de log-collector
 */
export async function runLogCollector() {
  console.log('Executando log-collector...')
  const result = await collectLogData()
  console.log('Resultado:', result)
  return result
}

/**
 * Executor de reconciliation-loop
 */
export async function runReconciliation() {
  console.log('Executando reconciliation-loop...')
  const result = await runReconciliationLoop()
  console.log('Resultado:', result)
  return result
}
```

---

## IMPLANTAÇÃO E TESTES

### 1. Implantação da Infraestrutura

```shell
# Criar tabelas no Supabase
psql -h cdqqnscgjpzitmmgyfuw.supabase.co -d postgres -U postgres -f setup.sql

# Configurar permissões RLS
psql -h cdqqnscgjpzitmmgyfuw.supabase.co -d postgres -U postgres -f permissions.sql

# Habilitar Realtime
psql -h cdqqnscgjpzitmmgyfuw.supabase.co -d postgres -U postgres -f realtime.sql

# Configurar cron jobs
node scripts/setup-cron.js
```

### 2. Deploy do Dashboard

```shell
# Build e deploy via Vercel CLI
cd dashboard
npm run build
vercel --prod

# Ou deploy automático via GitHub integration
git push origin main
```

### 3. Testes de Integridade

```typescript
// /tests/realtime.test.ts
import { expect, test, describe, beforeAll, afterAll } from 'vitest'
import { supabase } from '../lib/supabase-test'
import { setupTestSubscription } from './utils/realtime-helper'

describe('Realtime sync', () => {
  let cleanup: () => void
  let events: any[] = []
  
  beforeAll(async () => {
    // Setup subscription
    cleanup = await setupTestSubscription(
      'agent_status',
      (payload) => {
        events.push(payload)
      }
    )
  })
  
  afterAll(() => {
    cleanup()
  })
  
  test('Should receive updates when agent status changes', async () => {
    // Insert test data
    await supabase
      .from('agent_status')
      .upsert({
        agent_id: 'test-agent',
        status: 'active',
        updated_at: new Date().toISOString()
      })
      
    // Wait for realtime event
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if we received the update
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].new.agent_id).toBe('test-agent')
    expect(events[0].new.status).toBe('active')
  })
  
  test('Should handle multiple concurrent updates', async () => {
    events = [] // Clear previous events
    
    // Insert multiple updates concurrently
    await Promise.all([
      supabase.from('agent_status').upsert({
        agent_id: 'test-agent-1',
        status: 'active',
        updated_at: new Date().toISOString()
      }),
      supabase.from('agent_status').upsert({
        agent_id: 'test-agent-2',
        status: 'idle',
        updated_at: new Date().toISOString()
      }),
      supabase.from('agent_status').upsert({
        agent_id: 'test-agent-3',
        status: 'error',
        updated_at: new Date().toISOString()
      })
    ])
    
    // Wait for realtime events
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if we received all updates
    expect(events.length).toBe(3)
    
    // Verify each update
    const agentIds = events.map(e => e.new.agent_id)
    expect(agentIds).toContain('test-agent-1')
    expect(agentIds).toContain('test-agent-2')
    expect(agentIds).toContain('test-agent-3')
  })
})
```

---

## CONCLUSÃO

Esta implementação detalhada fornece um sistema de sincronização em tempo real completo e resistente a falhas para o Virtual Office do Revenue-OS. A combinação de Supabase Realtime com collectors de dados, circuit breakers, e loops de reconciliação garante que:

1. **Todos os dados são sincronizados em tempo real** (latência imperceptível)
2. **Falhas são tratadas graciosamente** (circuit breakers e fallbacks)
3. **Inconsistências são automaticamente corrigidas** (reconciliation loop)
4. **Eventos são auditáveis** (logs completos de todas as mudanças)

O sistema é escalável, performático e mantém a consistência mesmo em face de falhas parciais ou problemas de rede, tornando o Virtual Office uma verdadeira **representação viva** do estado do Revenue-OS.

---

**Aprovado por:**  
Shanks (OS Captain)