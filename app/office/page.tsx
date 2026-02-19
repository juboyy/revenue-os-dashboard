"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useDashboardStore } from "../../lib/store";

// Definição das áreas do escritório
const OFFICE_AREAS = [
  {
    id: "command-center",
    name: "Command Center",
    x: 10,
    y: 10,
    width: 25,
    height: 20,
    color: "rgba(244, 114, 182, 0.15)",
    border: "rgba(244, 114, 182, 0.3)"
  },
  {
    id: "dev-zone",
    name: "Development Zone",
    x: 40,
    y: 10,
    width: 30,
    height: 25,
    color: "rgba(96, 165, 250, 0.15)",
    border: "rgba(96, 165, 250, 0.3)"
  },
  {
    id: "operations-hub",
    name: "Operations Hub",
    x: 75,
    y: 15,
    width: 20,
    height: 20,
    color: "rgba(251, 191, 36, 0.15)",
    border: "rgba(251, 191, 36, 0.3)"
  },
  {
    id: "docs-library",
    name: "Documentation Library",
    x: 15,
    y: 40,
    width: 25,
    height: 20,
    color: "rgba(167, 139, 250, 0.15)",
    border: "rgba(167, 139, 250, 0.3)"
  },
  {
    id: "research-lab",
    name: "Research Lab",
    x: 50,
    y: 45,
    width: 20,
    height: 25,
    color: "rgba(52, 211, 153, 0.15)",
    border: "rgba(52, 211, 153, 0.3)"
  },
  {
    id: "server-room",
    name: "Server Room",
    x: 75,
    y: 45,
    width: 20,
    height: 15,
    color: "rgba(249, 115, 22, 0.15)",
    border: "rgba(249, 115, 22, 0.3)"
  },
  {
    id: "coffee-lounge",
    name: "Coffee Lounge",
    x: 45,
    y: 75,
    width: 15,
    height: 15,
    color: "rgba(121, 85, 72, 0.15)",
    border: "rgba(121, 85, 72, 0.3)"
  }
];

// Mapeamento de agentes para áreas
const AGENT_AREAS = {
  "os": "command-center",
  "eng-lead": "dev-zone",
  "ops-lead": "operations-hub",
  "doc-lead": "docs-library",
  "researcher": "research-lab",
  "architect": "dev-zone",
  "devops": "server-room",
  "billing": "operations-hub",
  "comms-lead": "coffee-lounge"
};

// Sprite frames para diferentes estados
const AGENT_SPRITES = {
  "idle": {
    frames: 4,
    frameTime: 800,
    offsetY: 0
  },
  "active": {
    frames: 6,
    frameTime: 200,
    offsetY: 1
  },
  "error": {
    frames: 2,
    frameTime: 400,
    offsetY: 2
  }
};

// Componente principal
export default function DigitalOfficePage() {
  const { agents } = useDashboardStore();
  const canvasRef = useRef(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);
  const [scale, setScale] = useState(1);
  const animFrameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const spritesRef = useRef({});
  
  // Pré-carregar sprites
  useEffect(() => {
    const loadSprites = async () => {
      const sprites: Record<string, HTMLImageElement> = {};
      
      // Lista de sprites a serem carregados
      const spriteUrls = [
        "/sprites/programmer.png",
        "/sprites/manager.png",
        "/sprites/writer.png",
        "/sprites/researcher.png",
        "/sprites/architect.png",
        "/sprites/devops.png",
        "/sprites/finance.png",
        "/sprites/comms.png",
        "/sprites/captain.png",
      ];
      
      // Carregar cada sprite
      for (const url of spriteUrls) {
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const file = url.split("/").pop();
        const key = (file ? file.split(".")[0] : "sprite");
        sprites[key] = img;
      }
      
      spritesRef.current = sprites;
    };
    
    loadSprites();
  }, []);
  
  // Mapeamento de agentes para sprites
  const getAgentSprite = (agentId: string) => {
    const mapping: Record<string, string> = {
      "os": "captain",
      "eng-lead": "programmer",
      "ops-lead": "manager",
      "doc-lead": "writer",
      "researcher": "researcher",
      "architect": "architect",
      "devops": "devops",
      "billing": "finance",
      "comms-lead": "comms"
    };
    
    return mapping[agentId] || "programmer";
  };
  
  // Posicionar agentes dentro de suas áreas
  const getAgentPosition = (agentId: keyof typeof AGENT_AREAS) => {
    const areaId = AGENT_AREAS[agentId];
    const area = OFFICE_AREAS.find(a => a.id === areaId);
    
    if (!area) return { x: 50, y: 50 };
    
    // Posição dentro da área (com alguma variação)
    const offsetX = Math.random() * 0.6 + 0.2; // 20-80% da largura
    const offsetY = Math.random() * 0.6 + 0.2; // 20-80% da altura
    
    return {
      x: area.x + area.width * offsetX,
      y: area.y + area.height * offsetY
    };
  };
  
  // Animação e renderização do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const agentPositions = {};
    
    // Inicializar posições
    agents.forEach(agent => {
      const id = agent.agent_id as keyof typeof AGENT_AREAS;
      if (!agentPositions[id]) {
        agentPositions[id] = getAgentPosition(id);
      }
    });
    
    // Frame de animação atual para cada agente
    const agentFrames = {};
    agents.forEach(agent => {
      const id = agent.agent_id as keyof typeof AGENT_AREAS;
      agentFrames[id] = {
        frame: 0,
        lastUpdate: 0
      };
    });
    
    // Função de loop de animação
    const animate = (timestamp) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const delta = timestamp - lastTimeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar áreas
      OFFICE_AREAS.forEach(area => {
        const isHovered = area.id === hoveredArea;
        
        ctx.fillStyle = isHovered 
          ? area.color.replace("0.15", "0.25")
          : area.color;
        ctx.strokeStyle = isHovered
          ? area.border.replace("0.3", "0.5")
          : area.border;
        ctx.lineWidth = isHovered ? 2 : 1;
        
        const x = area.x * canvas.width / 100;
        const y = area.y * canvas.height / 100;
        const width = area.width * canvas.width / 100;
        const height = area.height * canvas.height / 100;
        
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // Nome da área
        ctx.font = "12px 'SF Mono', monospace";
        ctx.fillStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
        ctx.fillText(area.name, x + 8, y + 16);
      });
      
      // Desenhar agentes
      agents.forEach(agent => {
        const id = agent.agent_id as keyof typeof AGENT_AREAS;
        const pos = agentPositions[id];
        if (!pos) return;
        
        const x = pos.x * canvas.width / 100;
        const y = pos.y * canvas.height / 100;
        const status = agent.status || "idle";
        const spriteInfo = AGENT_SPRITES[status];
        const isSelected = selectedAgent === agent.agent_id;
        
        // Atualizar frame de animação
        const frameData = agentFrames[id];
        if (timestamp - frameData.lastUpdate > spriteInfo.frameTime) {
          frameData.frame = (frameData.frame + 1) % spriteInfo.frames;
          frameData.lastUpdate = timestamp;
        }
        
        // Desenhar sprite
        const sprite = spritesRef.current[getAgentSprite(id)];
        if (sprite) {
          const frameWidth = sprite.width / spriteInfo.frames;
          const frameHeight = sprite.height / 3; // 3 estados (idle, active, error)
          
          ctx.drawImage(
            sprite,
            frameData.frame * frameWidth,
            spriteInfo.offsetY * frameHeight,
            frameWidth,
            frameHeight,
            x - 16, 
            y - 16,
            32,
            32
          );
        } else {
          // Fallback se o sprite não estiver carregado
          ctx.fillStyle = isSelected ? "#ffffff" : "#cccccc";
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Indicador de status
        ctx.fillStyle = 
          status === "active" ? "#10b981" : 
          status === "error" ? "#ef4444" : 
          "#6b7280";
        ctx.beginPath();
        ctx.arc(x + 10, y - 10, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Nome do agente se estiver selecionado ou hover
        if (isSelected) {
          ctx.font = "bold 12px 'SF Mono', monospace";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(agent.name || agent.agent_id, x, y + 30);
          
          // Tarefa atual
          if (agent.current_task) {
            ctx.font = "10px 'SF Mono', monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillText(
              agent.current_task.length > 25
                ? agent.current_task.substring(0, 25) + "..."
                : agent.current_task,
              x,
              y + 44
            );
          }
        }
      });
      
      lastTimeRef.current = timestamp;
      animFrameRef.current = requestAnimationFrame(animate);
    };
    
    animFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [agents, loading.agents, hoveredArea, selectedAgent]);
  
  // Handler para cliques no canvas
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    // Verificar se clicou em um agente
    let clickedAgent = null;
    
    agents.forEach(agent => {
      const id = agent.agent_id as keyof typeof AGENT_AREAS;
      const pos = getAgentPosition(id);
      if (!pos) return;
      
      const agentX = pos.x * canvas.width / 100;
      const agentY = pos.y * canvas.height / 100;
      const dx = x - agentX;
      const dy = y - agentY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 16) {
        clickedAgent = agent.agent_id;
      }
    });
    
    setSelectedAgent(clickedAgent);
    
    // Verificar se clicou em uma área
    if (!clickedAgent) {
      for (const area of OFFICE_AREAS) {
        const areaX = area.x * canvas.width / 100;
        const areaY = area.y * canvas.height / 100;
        const areaWidth = area.width * canvas.width / 100;
        const areaHeight = area.height * canvas.height / 100;
        
        if (
          x >= areaX && 
          x <= areaX + areaWidth && 
          y >= areaY && 
          y <= areaY + areaHeight
        ) {
          setHoveredArea(area.id);
          break;
        }
      }
    }
  };
  
  // Função para verificar se o cursor está sobre uma área
  const handleCanvasMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    // Verificar se está sobre uma área
    let overArea = null;
    
    for (const area of OFFICE_AREAS) {
      const areaX = area.x * canvas.width / 100;
      const areaY = area.y * canvas.height / 100;
      const areaWidth = area.width * canvas.width / 100;
      const areaHeight = area.height * canvas.height / 100;
      
      if (
        x >= areaX && 
        x <= areaX + areaWidth && 
        y >= areaY && 
        y <= areaY + areaHeight
      ) {
        overArea = area.id;
        break;
      }
    }
    
    setHoveredArea(overArea);
  };
  
  // Agentar selecionado
  const selectedAgentData = selectedAgent
    ? agents.find(a => a.agent_id === selectedAgent)
    : null;
  
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🏢</span> Escritório Digital
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          LIVE_WORKSPACE // AGENT_ACTIVITY // REAL_TIME_VIEW
        </p>
      </div>
      
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.min(scale + 0.1, 1.5))}
            className="p-2 rounded bg-ocean-800 text-white hover:bg-ocean-700 transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setScale(Math.max(scale - 0.1, 0.5))}
            className="p-2 rounded bg-ocean-800 text-white hover:bg-ocean-700 transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={() => setScale(1)}
            className="px-3 py-2 rounded bg-ocean-800 text-gray-300 text-sm hover:bg-ocean-700 transition-colors"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-green"></div>
            <span className="text-xs text-gray-400">
              {agents.filter(a => a.status === "active").length} ativos
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-xs text-gray-400">
              {agents.filter(a => a.status === "idle").length} inativos
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-red"></div>
            <span className="text-xs text-gray-400">
              {agents.filter(a => a.status === "error").length} erros
            </span>
          </div>
        </div>
        
        <Link href="/team">
          <button className="px-3 py-2 rounded bg-ocean-800 text-gray-300 text-sm hover:bg-ocean-700 transition-colors">
            Ver Estrutura da Equipe →
          </button>
        </Link>
      </div>
      
      {/* Canvas do Escritório */}
      <div className="relative">
        {agents.length === 0 ? (
          <div className="flex items-center justify-center h-96 glass-card">
            <div className="text-center text-gray-500 animate-pulse">
              <div className="text-3xl mb-2">⌛</div>
              <p>Carregando o escritório digital...</p>
            </div>
          </div>
        ) : (
          <div
            className="glass-card overflow-hidden"
            style={{
              height: "calc(100vh - 240px)",
              minHeight: "500px"
            }}
          >
            <canvas
              ref={canvasRef}
              width={1000}
              height={700}
              className="w-full h-full cursor-pointer"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMove}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                transition: "transform 0.3s ease"
              }}
            />
          </div>
        )}
        
        {/* Detalhes do Agente Selecionado */}
        <AnimatePresence>
          {selectedAgentData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass-card p-4 absolute bottom-4 left-4 w-80"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  {selectedAgentData.emoji || "🤖"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">
                      {selectedAgentData.name || selectedAgentData.agent_id}
                    </h3>
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {AGENT_AREAS[selectedAgentData.agent_id] 
                      ? OFFICE_AREAS.find(a => a.id === AGENT_AREAS[selectedAgentData.agent_id])?.name
                      : "Unknown Area"}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedAgentData.status === "active" 
                      ? "bg-accent-green animate-pulse" 
                      : selectedAgentData.status === "error"
                      ? "bg-accent-red"
                      : "bg-gray-500"
                  }`}
                />
                <span className="text-xs font-mono text-gray-400">
                  {selectedAgentData.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
              
              {/* Tarefa atual */}
              {selectedAgentData.current_task && (
                <div className="mt-3 p-2 rounded bg-ocean-800/50 text-xs">
                  <p className="text-[10px] text-gray-500 mb-1">TAREFA ATUAL</p>
                  <p className="text-accent-blue">
                    {selectedAgentData.current_task}
                  </p>
                </div>
              )}
              
              {/* Métricas */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-ocean-800/50 p-2 rounded">
                  <p className="text-[10px] text-gray-500 mb-1">MODELO</p>
                  <p className="text-gray-300 font-mono">
                    {selectedAgentData.model?.split("/").pop() || "default"}
                  </p>
                </div>
                <div className="bg-ocean-800/50 p-2 rounded">
                  <p className="text-[10px] text-gray-500 mb-1">TOKENS</p>
                  <p className="text-accent-purple font-mono">
                    {selectedAgentData.tokens_used?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="mt-3 flex items-center gap-2">
                <Link href={`/spawn?agent=${selectedAgentData.agent_id}`} className="flex-1">
                  <button className="w-full py-1.5 text-xs bg-accent-blue/20 text-accent-blue rounded hover:bg-accent-blue/30 transition-colors">
                    Spawn Agente
                  </button>
                </Link>
                <button
                  className="flex-1 py-1.5 text-xs bg-ocean-800 text-gray-300 rounded hover:bg-ocean-700 transition-colors"
                  onClick={() => setSelectedAgent(null)}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Legenda de Áreas */}
      <div className="glass-card p-4">
        <h3 className="text-white text-sm font-medium mb-3">Áreas do Escritório</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {OFFICE_AREAS.map(area => (
            <div
              key={area.id}
              className="flex items-center gap-2 p-1.5"
              onMouseEnter={() => setHoveredArea(area.id)}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <div
                className="w-3 h-3"
                style={{ backgroundColor: area.color.replace("0.15", "0.5") }}
              ></div>
              <span className="text-gray-300">{area.name}</span>
              <span className="text-gray-500 ml-auto">
                {agents.filter(a => AGENT_AREAS[a.agent_id as keyof typeof AGENT_AREAS] === area.id).length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}