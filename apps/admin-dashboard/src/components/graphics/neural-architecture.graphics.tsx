/** apps/admin-dashboard/src/components/graphics/neural-architecture.graphics.tsx */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * @interface INeuralArchitectureProperties
 * @description Contrato de entrada para la visualización topológica reactiva.
 */
interface INeuralArchitectureProperties {
  readonly activeIndex: number;
}

/**
 * @name NeuralArchitectureDiagram
 * @description Aparato visual de alta fidelidad que representa la topología neural 
 * del ecosistema Omnisync. Orquesta una red de nodos reactivos y flujos de datos 
 * cinéticos bajo la estética Obsidian & Milk.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Visual-Sovereignty V3.5.2)
 * @vision Ultra-Holística: Kinetic-Infrastructure-Representation & Lint-Sanated
 */
export const NeuralArchitectureDiagram: React.FC<INeuralArchitectureProperties> = ({ activeIndex }) => {
  
  /**
   * @section Definición de Nodos de Poder (LEGO Structure)
   * Representan las capas lógicas del framework.
   */
  const infrastructureNodes = [
    { x: 400, y: 300, label: 'ENGINE', layer: 0 },   // Centro: MMAE
    { x: 400, y: 120, label: 'SENTINEL', layer: 0 }, // Superior: Resiliencia
    { x: 180, y: 220, label: 'CORE', layer: 0 },     // Izquierda: Contratos/Auth
    { x: 620, y: 220, label: 'BRIDGE', layer: 1 },   // Derecha: Comms Gateway
    { x: 220, y: 450, label: 'ADAPTER', layer: 1 },  // Inferior Izq: ERP Bridge
    { x: 580, y: 450, label: 'PERSIST', layer: 2 }   // Inferior Der: SQL/Vector
  ];

  return (
    <svg 
      viewBox="0 0 800 600" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-w-5xl opacity-40 dark:opacity-20 select-none pointer-events-none"
    >
      {/* 1. Conexiones Sinápticas (Background Grid) */}
      <g className="stroke-foreground/10 dark:stroke-foreground/5">
        <path d="M 400 300 L 180 220" strokeWidth="0.5" />
        <path d="M 400 300 L 620 220" strokeWidth="0.5" />
        <path d="M 400 300 L 400 120" strokeWidth="0.5" />
        <path d="M 400 300 L 220 450" strokeWidth="0.5" />
        <path d="M 400 300 L 580 450" strokeWidth="0.5" />
        <circle cx="400" cy="300" r="180" strokeWidth="0.5" strokeDasharray="4 12" />
      </g>

      {/* 2. Flujo de Datos Pulsante (Data Flow Animation) */}
      <motion.path
        d="M 180 220 L 400 300 L 580 450"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-foreground/20 dark:text-foreground/40"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3. Nodos de Infraestructura Reactivos */}
      {infrastructureNodes.map((node, _index) => {
        /**
         * @section Resolución de Resaltado (Highlight Logic)
         * RESOLUCIÓN LINT: Marcamos el index como ignorado (_index) para cumplir 
         * con el estándar de calidad de TypeScript-ESLint.
         */
        const isHighlighted = activeIndex === node.layer;
        
        return (
          <g key={node.label}>
            {/* Aura de Resonancia Magnética */}
            {isHighlighted && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="15"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0.15 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                className="fill-foreground"
              />
            )}

            {/* Punto de Presencia Físico */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={isHighlighted ? 4.5 : 2.5}
              animate={{ 
                r: isHighlighted ? 5 : 2.5,
                opacity: isHighlighted ? 1 : 0.25 
              }}
              className="fill-foreground transition-all duration-700"
            />

            {/* Etiqueta de Capa Técnica */}
            <motion.text
              x={node.x}
              y={node.y - 15}
              textAnchor="middle"
              animate={{ 
                opacity: isHighlighted ? 1 : 0.15,
                y: isHighlighted ? node.y - 22 : node.y - 15,
                scale: isHighlighted ? 1.1 : 1
              }}
              className="text-[10px] font-black tracking-[0.3em] fill-foreground uppercase italic"
            >
              {node.label}
            </motion.text>
          </g>
        );
      })}

      {/* 4. Partículas Neurales (Simulación de Inferencia de Capas Cruzadas) */}
      <motion.circle r="2" className="fill-foreground">
        <animateMotion 
          dur="3.5s" 
          repeatCount="indefinite" 
          path="M 180 220 L 400 300 L 620 220 L 400 120 Z" 
        />
      </motion.circle>

      <motion.circle r="1.5" className="fill-foreground/40">
        <animateMotion 
          dur="6s" 
          repeatCount="indefinite" 
          path="M 220 450 L 400 300 L 580 450" 
        />
      </motion.circle>

      {/* 5. Marca de Agua Forense Inyectada */}
      <text x="750" y="580" textAnchor="end" className="text-[7px] font-mono fill-foreground/10 uppercase tracking-[0.5em] font-bold">
        Topological_Integrity_Confirmed // OEDP_V3.5
      </text>
    </svg>
  );
};