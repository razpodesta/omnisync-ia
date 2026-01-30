/** libs/core/auditor/src/lib/schemas/token-pricing.schema.ts */

import { z } from 'zod';

export const ModelPricingRateSchema = z.object({
  inputCostPerMillion: z.number().nonnegative(),
  outputCostPerMillion: z.number().nonnegative(),
}).readonly();

export type IModelPricingRate = z.infer<typeof ModelPricingRateSchema>;