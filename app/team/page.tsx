"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "../../lib/store";
import Link from "next/link";

// Definição dos departamentos
const DEPARTMENTS = [
  {
    id: "command",
    name: "Command",
    color: "from-red-500/20 to-red-600/10",
    borderColor: "border-red-500/30",
    description: "Estratégia e coordenação central"
  },
  {
    id: "engineering",
    name: "Engineering",
    color: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/30",
    description: "Desenvolvimento e implementação técnica"
  },
  {
    id: "operations",
    name: "Operations",
    color: "from-amber-500/20 to-amber-600/10",
    borderColor: "border-amber-500/30",
    description: "Planejamento e gestão de projetos"
  },
  {
    id: "content",
    name: "Content",
    color: "from-purple-500/20 to-purple-600/10",
    borderColor: "border-purple-500/30",
    description: "Documentação e comunicação"
  },
  {
    id: "intelligence",
    name: "Intelligence",
    color: "from-emerald-500/20 to-emerald-600/10",
    borderColor: "border-emerald-500/30", 
    description: "Pesquisa e análise"
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/30",
    description: "Arquitetura e DevOps"
  }
];

// Mapeamento de agentes para departamentos
const AGENT_DEPARTMENTS: Record<string, string> = {
  "os": "command",
  "eng-lead": "engineering",
  "ops-lead": "operations",
  "doc-lead": "content",
  "researcher": "intelligence",
  "architect": "infrastructure",
  "devops": "infrastructure",
  "billing": "operations",
  "comms-lead": "content"
};

// Mapeamento de posições hierárquicas
const AGENT_HIERARCHY: Record<string, number> = {
  "os": 1, // CEO
  "eng-lead": 2, // C-Level
  "ops-lead": 2,
  "doc-lead": 2,
  "architect": 2,
  "researcher": 3, // Team Lead
  "devops": 3,
  "billing": 3,
  "comms-lead": 3
};

// Mapeamento de papéis primários
const AGENT_ROLES: Record<string, string> = {
  "os": "Chief of Staff",
  "eng-lead": "Engineering Lead",
  "ops-lead": "Operations Lead",
  "doc-lead": "Documentation Lead",
  "researcher": "Research Lead",
  "architect": "Architecture Lead",
  "devops": "DevOps Engineer",
  "billing": "Finance Manager",
  "comms-lead": "Communications Lead"
};

// Mapeamento de especialidades
const AGENT_SKILLS: Record<string, string[]> = {
  "os": ["Estratégia", "Decisões", "Delegação"],
  "eng-lead": ["Código", "APIs", "Testes"],
  "ops-lead": ["Sprint Planning", "Jira", "Processos"],
  "doc-lead": ["Documentação", "Manuais", "Tutoriais"],
  "researcher": ["Pesquisa", "Análise", "Benchmarks"],
  "architect": ["Arquitetura", "Diagramas", "Especificações"],
  "devops": ["CI/CD", "Deploy", "Infraestrutura"],
  "billing": ["Finanças", "Pagamentos", "Contabilidade"],
  "comms-lead": ["Comunicação", "Apresentações", "E-mails"]
};

export default function TeamStructurePage() {
  const { agents } = useDashboardStore();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [hoverAgent, setHoverAgent] = useState<string | null>(null);
  
  // Organizar agentes por departamento
  const departmentAgents = DEPARTMENTS.reduce((acc: Record<string, typeof agents>, dept) => {
    acc[dept.id] = agents.filter(
      (agent) => AGENT_DEPARTMENTS[agent.id] === dept.id
    ).sort((a, b) => 
      (AGENT_HIERARCHY[a.id] || 99) - (AGENT_HIERARCHY[b.id] || 99)
    );
    return acc;
  }, {} as Record<string, typeof agents>);
  
  // Filtragem de agentes com base no departamento selecionado
  const filteredAgents = selectedDepartment 
    ? departmentAgents[selectedDepartment] 
    : agents.sort((a, b) => 
        (AGENT_HIERARCHY[a.id] || 99) - (AGENT_HIERARCHY[b.id] || 99)
      );

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">👥</span> Estrutura da Equipe
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          TEAM_STRUCTURE // AGENT_ROLES // REAL_TIME_STATUS
        </p>
      </div>
      
      {/* Departamentos */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDepartment(null)}
          className={`px-3 py-1.5 rounded-md text-sm ${
            selectedDepartment === null
              ? "bg-ocean-700 text-white"
              : "bg-ocean-800/50 text-gray-400 hover:bg-ocean-800 hover:text-gray-300"
          } transition-colors`}
        >
          Todos
        </button>
        
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDepartment(dept.id)}
            className={`px-3 py-1.5 rounded-md text-sm ${
              selectedDepartment === dept.id
                ? "bg-ocean-700 text-white"
                : "bg-ocean-800/50 text-gray-400 hover:bg-ocean-800 hover:text-gray-300"
            } transition-colors`}
          >
            {dept.name}
          </button>
        ))}
      </div>
      
      {/* Estrutura Organizacional */}
      {agents.length === 0 ? (
        <div className="flex items-center justify-center h-96 glass-card">
          <div className="text-center text-gray-500 animate-pulse">
            <div className="text-3xl mb-2">⌛</div>
            <p>Carregando dados da equipe...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => {
            const dept = DEPARTMENTS.find(
              (d) => d.id === AGENT_DEPARTMENTS[agent.id]
            );
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`glass-card p-4 border ${dept?.borderColor || "border-glass-border"} relative overflow-hidden group`}
                onMouseEnter={() => setHoverAgent(agent.id)}
                onMouseLeave={() => setHoverAgent(null)}
              >
                {/* Fundo gradiente */}
                <div className={`absolute inset-0 bg-gradient-to-br ${dept?.color || "from-gray-500/10 to-gray-600/5"} -z-10`} />
                
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                    agent.status === "active" ? "bg-accent-green/20" : 
                    agent.status === "error" ? "bg-accent-red/20" : "bg-ocean-800/80"
                  }`}>
                    {agent.emoji || "🤖"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">
                        {agent.name || agent.id}
                      </h3>
                      <span className={`w-2 h-2 rounded-full ${
                        agent.status === "active" ? "bg-accent-green animate-pulse" : 
                        agent.status === "error" ? "bg-accent-red" : "bg-gray-500"
                      }`} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {AGENT_ROLES[agent.id] || "Agente"}
                    </p>
                  </div>
                  
                  <Link href={`/spawn?agent=${agent.id}`}>
                    <button className="text-xs bg-ocean-700/70 hover:bg-ocean-600 text-gray-300 py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Spawn
                    </button>
                  </Link>
                </div>
                
                {/* Status atual */}
                {agent.current_task && (
                  <div className="mb-3 p-2 rounded bg-ocean-800/50 text-xs">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Tarefa Atual</p>
                    <p className="text-accent-blue">{agent.current_task}</p>
                  </div>
                )}
                
                {/* Especialidades */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1.5">Especialidades</p>
                  <div className="flex flex-wrap gap-1">
                    {(AGENT_SKILLS[agent.id] || []).map((skill) => (
                      <span 
                        key={skill} 
                        className="text-[10px] px-1.5 py-0.5 rounded bg-ocean-800/70 text-gray-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Estatísticas */}
                <div className="mt-3 pt-3 border-t border-glass-border grid grid-cols-2 gap-2 text-center">
                  <div className="text-[10px]">
                    <p className="text-gray-500">TOKENS</p>
                    <p className="text-accent-purple">
                      {agent.tokens_today?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="text-[10px]">
                    <p className="text-gray-500">ÚLTIMA ATIVIDADE</p>
                    <p className="text-gray-400">
                      {agent.last_heartbeat 
                        ? new Date(agent.last_heartbeat).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        : "N/A"}
                    </p>
                  </div>
                </div>
                
                {/* Conexões (mostradas no hover) */}
                {hoverAgent === agent.id && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -right-3 -bottom-3 w-24 h-24 rounded-full border border-glass-border opacity-20"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Visão Geral dos Departamentos */}
      <div className="glass-card p-6">
        <h2 className="text-white text-lg font-medium mb-4">Visão Geral dos Departamentos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept) => {
            const deptAgents = departmentAgents[dept.id] || [];
            const activeAgents = deptAgents.filter(a => a.status === "active").length;
            
            return (
              <div 
                key={dept.id}
                className="p-4 rounded-lg bg-ocean-900/50 border border-glass-border"
              >
                <h3 className="text-white font-medium mb-1">{dept.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{dept.description}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="text-xs text-gray-400">
                    {deptAgents.length} agentes ({activeAgents} ativos)
                  </div>
                  <div className="flex-1 h-1.5 bg-ocean-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        dept.id === "command" ? "bg-red-500/70" :
                        dept.id === "engineering" ? "bg-blue-500/70" :
                        dept.id === "operations" ? "bg-amber-500/70" :
                        dept.id === "content" ? "bg-purple-500/70" :
                        dept.id === "intelligence" ? "bg-emerald-500/70" :
                        "bg-orange-500/70"
                      }`}
                      style={{ 
                        width: `${deptAgents.length ? (activeAgents / deptAgents.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                {/* Agentes no departamento */}
                <div className="mt-2 flex -space-x-2">
                  {deptAgents.slice(0, 5).map((agent) => (
                    <div 
                      key={agent.id}
                      className="w-8 h-8 rounded-full bg-ocean-800 border border-glass-border flex items-center justify-center text-sm"
                      title={agent.name || agent.id}
                    >
                      {agent.emoji || "🤖"}
                    </div>
                  ))}
                  
                  {deptAgents.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-ocean-800 border border-glass-border flex items-center justify-center text-xs text-gray-400">
                      +{deptAgents.length - 5}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Link para escritório virtual */}
      <Link href="/office">
        <button className="glass-card py-3 px-4 w-full flex items-center justify-between hover:bg-ocean-800/60 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <h3 className="text-white font-medium">Ver Escritório Digital</h3>
              <p className="text-xs text-gray-500">Visualize os agentes trabalhando em tempo real</p>
            </div>
          </div>
          <span className="text-xl text-gray-500">→</span>
        </button>
      </Link>
    </div>
  );
}