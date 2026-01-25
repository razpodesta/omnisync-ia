/** .docs/manifests/omnisync-ai-agnostic.manifest.md */

# 🧠 Omnisync AI Agnostic Strategy (AIA)

## 1. Abstracción del Modelo
Queda estrictamente prohibido importar SDKs de proveedores (`@google/generative-ai`, `openai`) fuera de sus respectivos `drivers`. La aplicación principal solo interactúa con el `AI-Engine`.

## 2. Inmutabilidad de Prompts
Los prompts no son strings sueltos; son **Aparatos de Plantillas (Prompt Templates)** validados por Zod, permitiendo versionamiento y pruebas A/B.

## 3. Normalización de Respuesta
Independientemente del LLM usado, la salida debe ser parseada por el `AI-Engine` para cumplir siempre con el contrato `IAIResponse` definido en `core-contracts`.

## 4. Gestión de Fallback
Si el Driver principal (Gemini) falla tras los reintentos del `Sentinel`, el sistema debe estar preparado para conmutar a un Driver secundario de forma transparente.