/** libs/tools/internal-scripts/src/lib/library-integrity-auditor.apparatus.ts */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import { z } from 'zod';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @interface ILibraryFinding
 * @description Estructura para erradicar el uso de 'any' en los hallazgos de auditoría.
 */
interface ILibraryFinding {
  libraryPath: string;
  isCompliant: boolean;
  anomalies: string[];
  remediationHint: string;
}

const LibraryIntegritySeedSchema = z.object({
  reportId: z.string().uuid(),
  timestamp: z.string().datetime(),
  totalLibrariesAudited: z.number(),
  complianceScore: z.number().min(0).max(100),
  findings: z.array(z.custom<ILibraryFinding>()),
  aiContext: z.object({
    summary: z.string(),
    criticalViolationsCount: z.number()
  })
}).readonly();

export type ILibraryIntegritySeed = z.infer<typeof LibraryIntegritySeedSchema>;

export class LibraryIntegrityAuditor {
  private static readonly SEED_OUTPUT_PATH = 'reports/infrastructure/library-dna';
  private static readonly REQUIRED_TARGET = 'es2022';
  private static readonly REQUIRED_TYPES = 'node';

  public static async executeSovereignDnaAudit(): Promise<ILibraryIntegritySeed> {
    return await OmnisyncTelemetry.traceExecution('LibraryIntegrityAuditor', 'audit', async () => {
      const configFiles = await glob('libs/**/tsconfig.lib.json', { ignore: '**/node_modules/**' });
      const findings: ILibraryFinding[] = [];

      for (const filePath of configFiles) {
        findings.push(this.evaluateLibraryConfiguration(filePath));
      }

      const compliantCount = findings.filter(f => f.isCompliant).length;
      const score = findings.length > 0 ? (compliantCount / findings.length) * 100 : 100;

      const seed: ILibraryIntegritySeed = {
        reportId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        totalLibrariesAudited: findings.length,
        complianceScore: Math.round(score),
        findings,
        aiContext: {
          summary: `Audit complete. Compliance: ${score.toFixed(2)}%`,
          criticalViolationsCount: findings.length - compliantCount
        }
      };

      this.persistSovereignSeed(seed);
      return LibraryIntegritySeedSchema.parse(seed);
    });
  }

  private static evaluateLibraryConfiguration(filePath: string): ILibraryFinding {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(raw) as { compilerOptions?: { target?: string; types?: string[] } };
      const options = json.compilerOptions || {};

      const anomalies: string[] = [];
      if (options.target !== this.REQUIRED_TARGET) {
        anomalies.push(`INVALID_TARGET: ${options.target}`);
      }
      if (!options.types?.includes(this.REQUIRED_TYPES)) {
        anomalies.push(`MISSING_NODE_TYPES`);
      }

      const isCompliant = anomalies.length === 0;

      return {
        libraryPath: filePath,
        isCompliant,
        anomalies,
        remediationHint: isCompliant ? 'N/A' : 'Update target to es2022 and add node types.'
      };
    } catch (error: unknown) {
      // Registro en Sentinel de fallo de lectura de archivo físico
      OmnisyncSentinel.report({
        errorCode: 'OS-CORE-001',
        severity: 'LOW',
        apparatus: 'LibraryIntegrityAuditor',
        operation: 'evaluate_file',
        message: `Incapacidad de procesar tsconfig: ${filePath}`,
        context: { error: String(error) }
      });

      return {
        libraryPath: filePath,
        isCompliant: false,
        anomalies: ['PARSING_ERROR'],
        remediationHint: 'Check JSON syntax.'
      };
    }
  }

  private static persistSovereignSeed(seed: ILibraryIntegritySeed): void {
    const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-library-audit.json`;
    const fullPath = path.join(process.cwd(), this.SEED_OUTPUT_PATH, fileName);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(seed, null, 2), 'utf-8');
  }
}
