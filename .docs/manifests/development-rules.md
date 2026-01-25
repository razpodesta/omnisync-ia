# 📜 Raznode Development Rules (MetaShark Tech)

1. **Path First**: La primera línea de cada archivo DEBE ser la ruta relativa comentada.
2. **Zero Any**: Prohibido el uso de `any`. Tipado estricto con `unknown` o interfaces.
3. **No Abbreviations**: Nombres completos (ej: `request` en lugar de `req`).
4. **Atomic Apparatus**: Cada lógica debe ser un aparato con responsabilidad única.
5. **Mirror Testing**: Ruta espejo en `/tests` para cada archivo creado.
6. **Logging**: Uso obligatorio de `RaznodeLogger` para medir performance.
7. **i18n & Theming**: Soporte nativo desde el diseño del aparato.
