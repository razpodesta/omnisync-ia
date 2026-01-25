/** libs/tools/internal-scripts/src/lib/schema-guardian.apparatus.ts */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

/**
 * @name SchemaGuardian
 * @description Asegura la integridad del ecosistema verificando la paridad entre Aparatos y Schemas.
 */
export class SchemaGuardian {
  /**
   * @method auditIntegrity
   * @description Escanea el workspace en busca de .apparatus.ts huérfanos de .schema.ts.
   */
  public static async auditIntegrity(): Promise<{ total: number; missing: string[] }> {
    const apparatusFiles = await glob('libs/**/*.apparatus.ts');
    const missing: string[] = [];

    for (const file of apparatusFiles) {
      const dir = path.dirname(file);
      const name = path.basename(file, '.apparatus.ts');
      const schemaPath = path.join(dir, 'schemas', `${name}.schema.ts`);

      if (!fs.existsSync(schemaPath)) {
        missing.push(`${name}.apparatus.ts is missing its schema at ${schemaPath}`);
      }
    }

    return { total: apparatusFiles.length, missing };
  }
}