/** libs/core/contracts/src/lib/schemas/crm-integration.schema.ts */
import { z } from 'zod';

export const CustomerProfileSchema = z.object({
  externalId: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  tier: z.enum(['BASIC', 'GOLD', 'PLATINUM']).default('BASIC'),
  activeTickets: z.number().default(0),
  metadata: z.record(z.string(), z.unknown()),
}).readonly();

export type ICustomerProfile = z.infer<typeof CustomerProfileSchema>;