/** .docs/manifests/omnisync-contracts-ssot.manifest.md */

# 💎 Omnisync Single Source of Truth (SSOT) Contracts

## 1. Filosofía de Contratos
Los contratos en Omnisync-AI son **Inviolables y Autocontenidos**. Representan la verdad absoluta del dato tanto en tiempo de compilación (TypeScript) como en tiempo de ejecución (Zod).

## 2. Técnicas de Élite Aplicadas
1. **Branded Types**: Uso de `.brand<"Category">()` para evitar la obsesión por primitivos. Un `Email` es un `Email`, no solo un `string`.
2. **Transformaciones Nativa**: Los esquemas deben limpiar y normalizar datos (ej. `.trim().toLowerCase()`) durante el parseo.
3. **Composición de "Lego"**: Esquemas pequeños que se ensamblan para formar entidades complejas.
4. **Inmutabilidad Forzada**: Todos los tipos derivados de Zod deben ser tratados como `Readonly`.

## 3. Estructura de Salida
Cada contrato debe exportar:
- El esquema Zod: `EntitySchema`.
- El tipo inferido: `IEntity`.
- El tipo nominal (si aplica): `EntityId`.