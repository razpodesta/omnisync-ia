/** libs/core/contracts/src/lib/contracts.apparatus.ts */

import { z, ZodSchema } from 'zod';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

export class OmnisyncContracts {
  public static validate<T>(schema: ZodSchema<T>, data: unknown, contextName: string): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        OmnisyncSentinel.report({
          errorCode: 'OS-CORE-400',
          severity: 'HIGH',
          apparatus: 'OmnisyncContracts',
          operation: `validate:${contextName}`,
          message: 'Contract validation failed',
          context: { issues: error.issues, receivedData: data }, // CORRECCIÓN: issues en lugar de errors
          isRecoverable: false
        });
      }
      throw error;
    }
  }
}