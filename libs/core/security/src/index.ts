/** libs/core/security/src/index.ts */

// Aparatos de Lógica Deep
export * from './lib/security.apparatus';

// Contratos y Esquemas de Validación (SSOT)
export * from './lib/schemas/security.schema';
export * from './lib/schemas/geofencing.schema'; // <-- EXPORTACIÓN CRÍTICA

/**
 * @note La carpeta 'i18n' no se exporta aquí ya que es consumida
 * dinámicamente por el InternationalizationAggregator.
 */
