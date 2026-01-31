/** libs/tools/internal-scripts/src/lib/run-config-audit.ts */

import { ConfigurationSpecification } from './configuration-specification.apparatus';

/**
 * @name runConfigurationAudit
 * @description Punto de entrada para la inspección de ADN de configuración.
 * Verifica la consistencia de las variables de entorno sin exponer secretos.
 */
async function runConfigurationAudit(): Promise<void> {
  console.log('\n--- ⚙️  OMNISYNC: INFRASTRUCTURE CONFIGURATION AUDIT ---');
  
  try {
    const spec = await ConfigurationSpecification.extractGranularConfiguration();
    
    console.log('\nRESUMEN DE CONFIGURACIÓN:');
    console.log(`- Persistencia SQL:  [${spec.relationalPersistence.status}] -> ${spec.relationalPersistence.engine}`);
    console.log(`- Memoria Volátil:   [${spec.volatileMemory.status}] -> ${spec.volatileMemory.provider}`);
    console.log(`- Memoria Vectorial: [${spec.vectorKnowledge.status}] -> Colecciones: ${spec.vectorKnowledge.collectionCount}`);

    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ CONFIG_AUDIT_FAILURE:', String(error));
    process.exit(1);
  }
}

runConfigurationAudit();