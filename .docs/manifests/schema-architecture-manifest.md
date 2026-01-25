# 📐 Raznode Schema Architecture Manifest

## 📂 1. Ubicación Estándar (Mirroring Interno)
- Cada librería (lib) debe contener una carpeta dedicada en: `src/lib/schemas/`.
- **Regla de Espejo**: Si un aparato existe en `src/lib/mi-aparato.apparatus.ts`, su contrato de validación DEBE existir en `src/lib/schemas/mi-aparato.schema.ts`.

## 🛡️ 2. Reglas de Composición
1. **Inmutabilidad**: Todos los tipos derivados de un esquema Zod deben ser marcados como `Readonly` o usar `z.infer` con tipos base estrictos.
2. **Naming Convention**: `[nombre-del-aparato].schema.ts`.
3. **Exportación Única**: Se debe exportar el objeto del esquema (ej. `UserSchema`) y el tipo TypeScript derivado (ej. `IUser`).
4. **Independencia**: Un esquema no debe importar lógica de aparatos. Solo puede importar otros esquemas o tipos primitivos.

## 🔗 3. Flujo de Validación
- El Aparato es el único responsable de invocar su esquema en el punto de entrada (métodos públicos).
- Se prohíbe la validación manual "ad-hoc" fuera de los esquemas Zod definidos.