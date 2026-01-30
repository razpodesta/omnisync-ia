/** libs/core/auditor/src/lib/token-pricing.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { IModelPricingRate } from './schemas/token-pricing.schema';

/**
 * @name TokenPricingApparatus
 * @description Especialista en la valoración económica del consumo neural.
 */
export class TokenPricingApparatus {
  private static readonly PRICING_MATRIX: Record<string, IModelPricingRate> = {
    'gemini-1.5-flash': { inputCostPerMillion: 0.075, outputCostPerMillion: 0.30 },
    'gemini-1.5-pro': { inputCostPerMillion: 3.50, outputCostPerMillion: 10.50 },
    'text-embedding-004': { inputCostPerMillion: 0.02, outputCostPerMillion: 0.02 },
  };

  public static calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    return OmnisyncTelemetry.traceExecutionSync('TokenPricingApparatus', 'calculate', () => {
      const rates = this.PRICING_MATRIX[model] || this.PRICING_MATRIX['gemini-1.5-flash'];
      const inputCost = (inputTokens / 1_000_000) * rates.inputCostPerMillion;
      const outputCost = (outputTokens / 1_000_000) * rates.outputCostPerMillion;
      return Number((inputCost + outputCost).toFixed(8));
    });
  }
}