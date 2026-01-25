# 🧩 Apparatus Integrity Manifest (i18n & Validation)

## 🛡️ 1. Esquemas de Validación (Zod)
- Cada Aparato **DEBE** tener su propio esquema de validación situado en el mismo nivel de directorio.
- El archivo se nombrará `[apparatus-name].schema.ts`.
- Los esquemas deben ser exportados y tipados mediante `z.infer<typeof Schema>`.
- **Propósito**: Garantizar que el Aparato solo procese datos íntegros sin depender de validaciones externas.

## 🌐 2. Diccionarios Localizados (i18n)
- Cada Aparato **DEBE** contener una carpeta `i18n/` con archivos `.json` por idioma (ej: `en.json`, `es.json`).
- Las llaves deben seguir el prefijo del contexto (ej: `tenant.resolver.errors.not_found`).
- **Propósito**: Permitir que el Aparato sea "idioma-consciente" desde su propia estructura.

## 🛠️ 3. Script de Agregación Global
- Se implementará un script automatizado que recorra el monorepo, extraiga los fragmentos de `i18n` y construya el Diccionario Global en tiempo de compilación.
