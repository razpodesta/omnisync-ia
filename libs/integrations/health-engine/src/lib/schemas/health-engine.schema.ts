/** libs/integrations/health-engine/src/lib/schemas/health-engine.schema.ts */

import { z } from 'zod';

export const NodeHealthStatusSchema = z.enum(['HEALTHY', 'DEGRADED', 'UNREACHABLE']);

export const InfrastructureHeartbeatSchema = z.object({
  nodeName: z.string(),
  status: NodeHealthStatusSchema,
  latencyMs: z.number().nonnegative(),
  lastCheck: z.string().datetime(),
  errorMessage: z.string().optional(),
}).readonly();

export const GlobalHealthReportSchema = z.object({
  reportId: z.string().uuid(),
  timestamp: z.string().datetime(),
  overallStatus: NodeHealthStatusSchema,
  components: z.record(z.string(), InfrastructureHeartbeatSchema),
  environment: z.string(),
}).readonly();

export type IInfrastructureHeartbeat = z.infer<typeof InfrastructureHeartbeatSchema>;
export type IGlobalHealthReport = z.infer<typeof GlobalHealthReportSchema>;