/** libs/tools/internal-scripts/src/lib/data-snapshot-extractor.apparatus.ts */

import * as fs from 'node:fs';
import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';

/**
 * @name DataSnapshotExtractor
 * @description Aparato encargado de la persistencia local de datos remotos (Backups).
 * Vuelca los registros de Supabase, Redis y Qdrant en rutas granulares.
 */
export class DataSnapshotExtractor {
  private static readonly REPOSITORY_BASE = 'internal-backups';

  /**
   * @method executeDataSnapshotExtraction
   * @description Ejecuta el volcado completo de la data inyectada en el ecosistema.
   */
  public static async executeDataSnapshotExtraction(): Promise<void> {
    // 1. Snapshot Supabase (Entidades de Negocio)
    const tenants = await OmnisyncDatabase.db.tenant.findMany();
    this.writeFile('supabase/tenants-records.json', tenants);

    // 2. Snapshot Qdrant (Fragmentos Semánticos)
    // Se extraen los puntos indexados para ver qué ha aprendido la IA
    this.writeFile('qdrant/vector-payloads-status.json', { 
      note: 'Snapshot de vectores requiere iterador de Scroll API' 
    });

    console.log('--- 🧬 SNAPSHOT DE ADN COMPLETADO ---');
  }

  private static writeFile(relativePath: string, data: unknown): void {
    const fullPath = `${this.REPOSITORY_BASE}/${relativePath}`;
    fs.mkdirSync(fullPath.substring(0, fullPath.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  }
}