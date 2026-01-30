/** libs/tools/internal-scripts/src/lib/package-auditor.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { glob } from 'glob';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { 
  PackageIntegritySeedSchema, 
  IPackageIntegritySeed, 
  IPackageFinding 
} from './schemas/package-auditor.schema';

/**
 * @interface INxAssetConfiguration
 * @description Representa la estructura técnica de un asset en project.json.
 */
interface INxAssetConfiguration {
  readonly glob: string;
  readonly input: string;
  readonly output: string;
}

type NxAssetEntry = string | INxAssetConfiguration;

/**
 * @name OmnisyncSovereignPackageAuditor
 * @description Aparato de gobernanza encargado de la simetría de manifiestos.
 * Realiza una auditoría biyectiva entre la estructura de archivos, el registro de Nx
 * y las declaraciones de npm para asegurar un ADN de proyecto libre de inconsistencias.
 * 
 * @protocol OEDP-Level: Elite (Full-Symmetry Audit V3.0)
 */
export class OmnisyncSovereignPackageAuditor {
  private static readonly MASTER_VERSION = '1.0.0';
  private static readonly NAMESPACE_PREFIX = '@omnisync/';
  private static readonly REPORT_PATH = 'reports/infrastructure/packages';

  /**
   * @method executeSovereignAudit
   * @description Orquesta el escaneo total del monorepo y genera la semilla de integridad.
   */
  public static async executeSovereignAudit(): Promise<IPackageIntegritySeed> {
    const apparatusName = 'OmnisyncSovereignPackageAuditor';

    return await OmnisyncTelemetry.traceExecution(apparatusName, 'executeSovereignAudit', async () => {
      const packageFiles = await glob('{libs,apps}/**/package.json', {
        ignore: ['**/node_modules/**', '**/dist/**', '**/tmp/**']
      });

      const findings: IPackageFinding[] = [];

      for (const pPath of packageFiles) {
        findings.push(await this.auditPackageSymmetry(pPath));
      }

      const sovereignCount = findings.filter(f => f.isSovereign).length;
      const integrityPercentage = findings.length > 0 
        ? Math.round((sovereignCount / findings.length) * 100) 
        : 100;

      const auditSeed: IPackageIntegritySeed = {
        reportId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        statistics: {
          totalPackagesAudited: findings.length,
          sovereignPackagesCount: sovereignCount,
          integrityPercentage
        },
        findings,
        aiContext: {
          criticalAlertsCount: findings.length - sovereignCount,
          summary: `Auditoría finalizada. El monorepo opera al ${integrityPercentage}% de simetría nominal.`
        }
      };

      this.persistAuditSeed(auditSeed);
      return OmnisyncContracts.validate(PackageIntegritySeedSchema, auditSeed, apparatusName);
    });
  }

  /**
   * @method auditPackageSymmetry
   * @private
   * @description Analiza la paridad entre un package.json individual y su project.json hermano.
   */
  private static async auditPackageSymmetry(packagePath: string): Promise<IPackageFinding> {
    const absolutePath = path.resolve(process.cwd(), packagePath);
    const directory = path.dirname(absolutePath);
    const projectJsonPath = path.join(directory, 'project.json');
    
    const packageRaw = JSON.parse(fileSystem.readFileSync(absolutePath, 'utf-8')) as { name: string; version: string };
    const anomalies: IPackageFinding['anomalies'] = [];
    let expectedPackageName = packageRaw.name;

    // 1. Validación de Simetría con project.json
    if (fileSystem.existsSync(projectJsonPath)) {
      const projectRaw = JSON.parse(fileSystem.readFileSync(projectJsonPath, 'utf-8'));
      expectedPackageName = `${this.NAMESPACE_PREFIX}${projectRaw.name}`;

      if (packageRaw.name !== expectedPackageName) {
        anomalies.push({
          type: 'NAME_MISMATCH',
          details: `Package name [${packageRaw.name}] no coincide con prefijo soberano + Project name [${projectRaw.name}]`,
          remediation: `Actualizar package.json name a: ${expectedPackageName}`
        });
      }

      // 2. Validación de Exportación de Assets (Build Readiness)
      // Erradicación de 'any' mediante uso de NxAssetEntry
      const buildTarget = projectRaw.targets?.build;
      if (buildTarget) {
        const assets = (buildTarget.options?.assets as NxAssetEntry[]) || [];
        const hasPackageExport = assets.some((asset: NxAssetEntry) => {
          if (typeof asset === 'string') return asset.includes('package.json');
          return asset.glob === 'package.json';
        });

        if (!hasPackageExport) {
          anomalies.push({
            type: 'MISSING_ASSET_EXPORT',
            details: 'El target de build no exporta el package.json hacia la carpeta dist.',
            remediation: 'Añadir "package.json" a la sección "assets" del build target en project.json'
          });
        }
      }
    }

    // 3. Validación de Versión Global
    if (packageRaw.version !== this.MASTER_VERSION) {
      anomalies.push({
        type: 'VERSION_OUT_OF_SYNC',
        details: `Versión [${packageRaw.version}] fuera de sincronía con Master [${this.MASTER_VERSION}]`,
        remediation: `Nivelar versión a ${this.MASTER_VERSION}`
      });
    }

    return {
      packagePath,
      declaredName: packageRaw.name,
      expectedName: expectedPackageName,
      currentVersion: packageRaw.version,
      anomalies,
      isSovereign: anomalies.length === 0
    };
  }

  /**
   * @method persistAuditSeed
   * @private
   */
  private static persistAuditSeed(seed: IPackageIntegritySeed): void {
    const fullPath = path.resolve(process.cwd(), this.REPORT_PATH);
    if (!fileSystem.existsSync(fullPath)) fileSystem.mkdirSync(fullPath, { recursive: true });
    
    const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-package-audit.json`;
    fileSystem.writeFileSync(path.join(fullPath, fileName), JSON.stringify(seed, null, 2), 'utf-8');
  }
}