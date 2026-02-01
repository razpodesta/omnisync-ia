/** libs/integrations/ai-google-driver/src/lib/google-ai-factory.ts */
import { GeminiDeepThinkApparatus } from './apparatus/gemini-deep-think.apparatus';
import { GeminiFlashLiveApparatus } from './apparatus/gemini-flash-live.apparatus';
import { GeminiProVisionApparatus } from './apparatus/gemini-pro-vision.apparatus';
import { SemanticGeckoApparatus } from './apparatus/semantic-gecko.apparatus';

export class GoogleAiSovereignFactory {
  public static readonly DeepThink = GeminiDeepThinkApparatus;
  public static readonly FlashLive = GeminiFlashLiveApparatus;
  public static readonly ProVision = GeminiProVisionApparatus;
  public static readonly Memory = SemanticGeckoApparatus;
}