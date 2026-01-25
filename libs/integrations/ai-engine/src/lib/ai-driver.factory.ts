/** libs/integrations/ai-engine/src/lib/ai-driver.factory.ts */
import { IAIDriver } from '@omnisync/core-contracts';
import { GeminiDriver } from '@omnisync/ai-google';
// import { OpenAIDriver } from '@omnisync/ai-openai'; // Futuro LEGO

export class AIDriverFactory {
  public static getDriver(provider: string): IAIDriver {
    switch (provider) {
      case 'GOOGLE_GEMINI':
        return new GeminiDriver();
      // case 'OPENAI': return new OpenAIDriver();
      default:
        throw new Error(`AI Provider ${provider} no soportado aún.`);
    }
  }
}