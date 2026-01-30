/** libs/integrations/agent-factory/src/lib/agent-factory.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts, INeuralIntent } from '@omnisync/core-contracts';
import { 
  NeuralAgentDefinitionSchema, 
  INeuralAgentDefinition, 
  SwarmResolutionSchema, 
  ISwarmResolution 
} from './schemas/agent-factory.schema';

/**
 * @name OmnisyncAgentFactory
 * @description Nodo maestro de "Swarm Intelligence" (Inteligencia de Enjambre). 
 * Orquesta el triaje cognitivo de intenciones neurales para despachar sub-agentes 
 * especializados (Soporte, Ventas, Admin). Implementa un motor de resolución 
 * basado en densidad semántica y pesos de palabras clave.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Swarm-Orchestration V3.2)
 * @vision Ultra-Holística: Specialized-Inference & Dynamic-Persona
 */
export class OmnisyncAgentFactory {
  /**
   * @private
   * @description Registro maestro de identidades IA autorizadas.
   * NIVELACIÓN: Este registro es el ADN semántico del framework para el año 2026.
   */
  private static readonly SOVEREIGN_AGENT_REGISTRY: readonly INeuralAgentDefinition[] = [
    {
      agentId: 'a1b2c3d4-0001-4000-a000-000000000001',
      agentName: 'Soporte Técnico Élite',
      specialty: 'TECHNICAL_SUPPORT',
      triggerKeywords: ['falla', 'error', 'no funciona', 'instalar', 'manual', 'roto', 'ayuda'],
      isEnabled: true,
      modelConfiguration: { modelName: 'gemini-1.5-pro', temperature: 0.2, maxTokens: 2048 },
      systemPersona: 'Usted es el Agente Técnico Senior de Omnisync. Su lenguaje es preciso, arquitectónico y orientado a la solución de problemas. Solo usa información validada por el contexto RAG.'
    },
    {
      agentId: 'a1b2c3d4-0002-4000-a000-000000000002',
      agentName: 'Consultor Comercial',
      specialty: 'SALES_EXPERT',
      triggerKeywords: ['precio', 'comprar', 'planes', 'demo', 'cotización', 'costo', 'vender'],
      isEnabled: true,
      modelConfiguration: { modelName: 'gemini-1.5-flash', temperature: 0.7, maxTokens: 1024 },
      systemPersona: 'Usted es el Consultor Comercial de Omnisync. Su objetivo es convertir el interés en una reunión técnica. Es persuasivo, amable y conoce todos los beneficios de la infraestructura neural.'
    }
  ];

  /**
   * @method resolveOptimalAgent
   * @description Analiza una intención neural y resuelve el despacho del agente más capacitado.
   * Aplica una auditoría de integridad sobre el registro interno antes de la decisión.
   * 
   * @param {INeuralIntent} incomingIntent - Intención normalizada bajo contrato SSOT.
   * @returns {ISwarmResolution} Resultado de la orquestación validado.
   */
  public static resolveOptimalAgent(incomingIntent: INeuralIntent): ISwarmResolution {
    const apparatusName = 'OmnisyncAgentFactory';
    const operationName = 'resolveOptimalAgent';

    return OmnisyncTelemetry.traceExecutionSync(apparatusName, operationName, () => {
      /**
       * @section Fase 1: Validación de Integridad del Registro (SSOT)
       * RESOLUCIÓN LINT: Utilizamos el esquema para validar que el registro estático 
       * cumple con el ADN del framework, erradicando el aviso de variable no usada.
       */
      OmnisyncContracts.validateCollection(
        NeuralAgentDefinitionSchema, 
        [...this.SOVEREIGN_AGENT_REGISTRY], 
        `${apparatusName}:RegistryAudit`
      );

      const content = incomingIntent.payload.content.toLowerCase();
      
      /**
       * @section Fase 2: Algoritmo de Triaje Cognitivo
       * Evaluamos la densidad de keywords para cada agente habilitado.
       */
      let bestAgentCandidate = this.SOVEREIGN_AGENT_REGISTRY[0];
      let maximumKeywordMatchesFound = -1;

      for (const agent of this.SOVEREIGN_AGENT_REGISTRY) {
        if (!agent.isEnabled) continue;
        
        const currentMatches = agent.triggerKeywords.filter(keyword => 
          content.includes(keyword.toLowerCase())
        ).length;

        if (currentMatches > maximumKeywordMatchesFound) {
          maximumKeywordMatchesFound = currentMatches;
          bestAgentCandidate = agent;
        }
      }

      /**
       * @section Fase 3: Consolidación de Decisión
       * Calculamos un score de confianza basado en la presencia de disparadores.
       */
      const swarmResolution: ISwarmResolution = {
        resolvedAgentId: bestAgentCandidate.agentId,
        confidenceScore: maximumKeywordMatchesFound > 0 ? 0.98 : 0.50,
        resolutionReason: maximumKeywordMatchesFound > 0 
          ? `KEYWORD_DENSITY_MATCH: ${maximumKeywordMatchesFound} terms.` 
          : 'GENERIC_FALLBACK_DEFAULT'
      };

      return OmnisyncContracts.validate(
        SwarmResolutionSchema, 
        swarmResolution, 
        apparatusName
      );
    });
  }

  /**
   * @method getAgentPersona
   * @description Recupera la directiva de sistema (Personalidad) para un agente.
   * Implementa resiliencia ante identificadores corruptos.
   */
  public static getAgentPersona(agentIdentifier: string): string {
    const apparatusName = 'OmnisyncAgentFactory';
    
    const resolvedAgent = this.SOVEREIGN_AGENT_REGISTRY.find(
      agent => agent.agentId === agentIdentifier
    );

    if (!resolvedAgent) {
      /**
       * @section Gestión de Anomalía
       * El Sentinel reporta la brecha de identidad pero el sistema degrada 
       * elegantemente al agente por defecto para no romper el flujo.
       */
      OmnisyncSentinel.report({
        errorCode: 'OS-INTEG-404',
        severity: 'MEDIUM',
        apparatus: apparatusName,
        operation: 'getAgentPersona',
        message: 'Identificador de agente huérfano detectado en el Swarm.',
        context: { requestedAgentId: agentIdentifier }
      });

      return this.SOVEREIGN_AGENT_REGISTRY[0].systemPersona;
    }

    return resolvedAgent.systemPersona;
  }
}