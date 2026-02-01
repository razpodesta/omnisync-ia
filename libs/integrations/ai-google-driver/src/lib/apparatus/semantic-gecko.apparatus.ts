/** libs/integrations/ai-google-driver/src/lib/apparatus/semantic-gecko.apparatus.ts */
import { GoogleSovereignClientApparatus } from '../core/google-client.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { SemanticGeckoOutputSchema, ISemanticGeckoOutput, ISemanticGeckoConfiguration } from '../schemas/semantic-gecko.schema';
import * as crypto from 'node:crypto';

export class SemanticGeckoApparatus {
  private static readonly MODEL = 'text-embedding-004';

  public static async generateEmbedding(
    text: string,
    config: Partial<ISemanticGeckoConfiguration> = {}
  ): Promise<ISemanticGeckoOutput> {
    const apparatusName = 'SemanticGeckoApparatus';
    return await OmnisyncTelemetry.traceExecution(apparatusName, 'embed', async () => {
      const start = performance.now();
      const google = GoogleSovereignClientApparatus.getAuthenticatedInstance();
      const model = google.getGenerativeModel({ model: this.MODEL });

      const result = await model.embedContent(text);
      
      const payload: ISemanticGeckoOutput = {
        vectorCoordinates: result.embedding.values,
        contentHash: crypto.createHash('sha256').update(text).digest('hex'),
        latencyMs: performance.now() - start
      };

      return OmnisyncContracts.validate(SemanticGeckoOutputSchema, payload, apparatusName);
    });
  }
}