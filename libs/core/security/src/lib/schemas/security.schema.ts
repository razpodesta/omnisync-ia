/** libs/core/security/src/lib/schemas/security.schema.ts */

import { z } from 'zod';

/**
 * @section Branded Tokens
 */
export const AuthTokenSchema = z.string().min(20).brand<'AuthToken'>();
export type AuthToken = z.infer<typeof AuthTokenSchema>;

/**
 * @section Encryption Contracts
 */
export const EncryptedPayloadSchema = z
  .object({
    encryptedData: z.string(), // Base64
    initializationVector: z.string(), // Hex
    authTag: z.string(), // Hex (Para GCM)
  })
  .readonly();

export type IEncryptedPayload = z.infer<typeof EncryptedPayloadSchema>;

/**
 * @section Anonymization Context
 */
export const AnonymizationMapSchema = z
  .record(z.string(), z.string())
  .readonly();
