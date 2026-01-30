/** libs/tools/internal-scripts/src/lib/schemas/package-auditor.schema.ts */

import { z } from 'zod';

export const PackageAnomalyTypeSchema = z.enum([
  'NAME_MISMATCH',
  'VERSION_OUT_OF_SYNC',
  'MISSING_ASSET_EXPORT',
  'DUPLICATE_DEPENDENCY',
  'INVALID_NAMESPACE'
]);

export const PackageFindingSchema = z.object({
  packagePath: z.string(),
  declaredName: z.string(),
  expectedName: z.string(),
  currentVersion: z.string(),
  anomalies: z.array(z.object({
    type: PackageAnomalyTypeSchema,
    details: z.string(),
    remediation: z.string()
  })),
  isSovereign: z.boolean()
}).readonly();

export const PackageIntegritySeedSchema = z.object({
  reportId: z.string().uuid(),
  timestamp: z.string().datetime(),
  statistics: z.object({
    totalPackagesAudited: z.number(),
    sovereignPackagesCount: z.number(),
    integrityPercentage: z.number()
  }),
  findings: z.array(PackageFindingSchema),
  aiContext: z.object({
    criticalAlertsCount: z.number(),
    summary: z.string()
  })
}).readonly();

export type IPackageIntegritySeed = z.infer<typeof PackageIntegritySeedSchema>;
export type IPackageFinding = z.infer<typeof PackageFindingSchema>;