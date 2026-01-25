# 🧱 Lego Apparatus Creation Manifest

Para crear una nueva funcionalidad (ej. `GoogleGeminiConnector`):
1. **Contrato**: Defina el esquema Zod en `src/lib/schemas/gemini.schema.ts`.
2. **Aparato**: Implemente la clase estática en `src/lib/gemini.apparatus.ts` usando `traceExecution` del logger.
3. **Localización**: Cree `src/lib/i18n/en.json` con llaves `ai.gemini.errors.quota_exceeded`.
4. **Export**: Solo exporte el Aparato y el Esquema en `index.ts`.