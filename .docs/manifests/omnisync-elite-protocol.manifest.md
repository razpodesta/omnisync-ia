/** .docs/manifests/omnisync-elite-protocol.manifest.md */

# 📜 Omnisync Elite Development Protocol (OEDP)

## 1. Misión de Calidad
Garantizar que cada componente del ecosistema Omnisync-AI sea una pieza de ingeniería autónoma, escalable y de alta performance, eliminando la deuda técnica desde su concepción.

## 2. Reglas Inviolables de Codificación
1. **Ruta Relativa**: Todo archivo debe iniciar con su ruta relativa comentada en la línea 1.
2. **Naming Semántico**: Prohibido el uso de abreviaciones (`request` NO `req`, `database` NO `db`).
3. **Erradicación de Any**: Uso estricto de TypeScript. El tipo `any` es considerado un fallo de compilación humano.
4. **Documentación TSDoc**: Cada clase y método debe explicar su responsabilidad, parámetros y retornos.
5. **Validación Atómica**: Todo aparato que reciba datos debe tener un esquema Zod (`[name].schema.ts`) en su mismo directorio.

## 3. Protocolo de Refactorización (Ciclo 360°)
1. **Identificación**: Mapear el aparato y sus dependencias.
2. **Solicitud de Fuente**: Nunca suponer el código; pedir siempre la versión actual.
3. **Nivelación Granular**: Refactorizar pieza por pieza para evitar errores en cascada.
4. **Limpieza Post-Nivelación**: Identificar y solicitar la eliminación de archivos obsoletos o redundantes.

## 4. Estándar de Salida
Código listo para producción ("Copy-Paste Ready"), testeable y optimizado para ser procesado por sistemas de IA.