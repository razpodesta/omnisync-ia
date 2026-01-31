/** libs/tools/internal-scripts/src/lib/run-data-snapshot.ts */

import { DataSnapshotExtractor } from './data-snapshot-extractor.apparatus';

/**
 * @name runDataSnapshot
 * @description Orquesta la captura inmutable del estado actual del sistema.
 * Genera archivos físicos en la bóveda de backups para análisis forense.
 */
async function runDataSnapshot(): Promise<void> {
  console.log('\n--- 📥 OMNISYNC: SYSTEM DNA SNAPSHOT EXTRACTION ---');
  
  try {
    const seed = await DataSnapshotExtractor.executeSovereignSnapshotExtraction();
    
    console.log(`\nSNAPSHOT GENERADO: ${seed.snapshotIdentifier}`);
    console.log(`- Registros SQL:  ${seed.layers.relational.recordsCount}`);
    console.log(`- Checksum:      ${seed.checksum.substring(0, 16)}...`);
    console.log(`- Ubicación:     internal-backups/snapshots/`);

    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ SNAPSHOT_EXTRACTION_FAILURE:', String(error));
    process.exit(1);
  }
}

runDataSnapshot();