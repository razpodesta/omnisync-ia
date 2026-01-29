/** libs/tools/internal-scripts/src/index.ts */

/**
 * @module InternalScripts
 * @description Punto de entrada soberano para las herramientas de mantenimiento,
 * auditoría de ADN y automatización del ecosistema Omnisync-AI.
 *
 * Este nodo centraliza los aparatos encargados de velar por la integridad técnica,
 * la consistencia de esquemas y la salud de la infraestructura Cloud.
 *
 * @protocol OEDP-Level: Elite (Sovereign Infrastructure Tools)
 */

/**
 * @section Auditoría de Configuración y Estándares
 * Aparatos encargados de validar que el monorepo cumpla con las leyes de Nx y OEDP.
 */
export { WorkspaceConfigurationAuditor } from './lib/workspace-config-auditor.apparatus';
export { LibraryIntegrityAuditor } from './lib/library-integrity-auditor.apparatus';
export { SchemaGuardian } from './lib/schema-guardian.apparatus';

/**
 * @section Diagnóstico de Infraestructura y Conectividad
 * Herramientas para la ejecución de sondas de integridad sobre los pilares Cloud.
 */
export { ConnectivityIntegrity } from './lib/connectivity-integrity.apparatus';
export { ConfigurationSpecification } from './lib/configuration-specification.apparatus';

/**
 * @section Gestión de ADN y Persistencia
 * Aparatos para la captura de snapshots de datos y agregación de diccionarios lingüísticos.
 */
export { DataSnapshotExtractor } from './lib/data-snapshot-extractor.apparatus';

/**
 * @note Resolución de Error TS5097
 * Se elimina la extensión '.ts' de la ruta de importación para cumplir con
 * el estándar de resolución de módulos del monorepo.
 */
export { InternationalizationAggregator } from './lib/i18n-aggregator.apparatus';
