/** libs/integrations/ai-google-driver/src/lib/schemas/semantic-gecko.schema.ts */
import { z } from 'zod';

export const SemanticGeckoConfigurationSchema = z.object({
  outputDimensionality: z.number().int().default(768),
  taskType: z.enum(['RETRIEVAL_QUERY', 'RETRIEVAL_DOCUMENT', 'SEMANTIC_SIMILARITY', 'CLASSIFICATION']),
}).readonly();

export const SemanticGeckoOutputSchema = z.object({
  vectorCoordinates: z.array(z.number()),
  contentHash: z.string(),
  latencyMs: z.number(),
}).readonly();

export type ISemanticGeckoConfiguration = z.infer<typeof SemanticGeckoConfigurationSchema>;
export type ISemanticGeckoOutput = z.infer<typeof SemanticGeckoOutputSchema>;