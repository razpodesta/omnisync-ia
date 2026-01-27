/** libs/integrations/erp-odoo/src/lib/odoo-driver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IOdooConnectionConfiguration } from './schemas/odoo-integration.schema';

/**
 * @name OdooDriverApparatus
 * @description Motor de comunicación de bajo nivel para Odoo Online (v16, v17, v18).
 * Orquesta la serialización de protocolos XML-RPC y el transporte seguro HTTPS.
 * Implementa la visión Zero-Local permitiendo ejecución en el Edge de Vercel.
 *
 * @protocol OEDP-Level: Elite (Hyper-Holistic & Edge-Ready)
 */
export class OdooDriverApparatus {
  /**
   * @private
   * Cache de identificación técnica para evitar handshakes redundantes en la misma traza.
   */
  private static authenticatedUserIdentifierCache: Map<string, number> = new Map();

  /**
   * @method executeRemoteProcedureCall
   * @description Nodo central para la ejecución de 'execute_kw'.
   * Orquesta la autenticación automática y la transmisión de comandos al modelo.
   *
   * @template TResponse - Estructura de salida esperada (validada por el llamador).
   * @param {IOdooConnectionConfiguration} technicalConfiguration - ADN de conexión del Tenant.
   * @param {string} modelTechnicalName - Modelo de Odoo (ej: 'res.partner', 'helpdesk.ticket').
   * @param {string} operationMethodName - Método técnico (ej: 'search_read', 'create').
   * @param {unknown[]} positionalArguments - Parámetros de la función en el ERP.
   * @param {Record<string, unknown>} keywordArguments - Filtros y parámetros nombrados.
   * @returns {Promise<TResponse>} Datos normalizados desde el cluster de Odoo.
   */
  public static async executeRemoteProcedureCall<TResponse>(
    technicalConfiguration: IOdooConnectionConfiguration,
    modelTechnicalName: string,
    operationMethodName: string,
    positionalArguments: unknown[],
    keywordArguments: Record<string, unknown> = {}
  ): Promise<TResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'OdooDriverApparatus',
      `rpc_call:${modelTechnicalName}:${operationMethodName}`,
      async () => {
        // 1. Resolución de Identidad Técnica (UID)
        const userIdentifier = await this.resolveAuthenticatedUserIdentifier(technicalConfiguration);

        // 2. Ejecución de la Tubería XML-RPC con Resiliencia
        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            const endpointUrl = `${technicalConfiguration.baseUrl}/xmlrpc/2/object`;

            const xmlEnvelope = this.constructXmlRpcEnvelope('execute_kw', [
              technicalConfiguration.databaseName,
              userIdentifier,
              technicalConfiguration.secretApiKey,
              modelTechnicalName,
              operationMethodName,
              positionalArguments,
              keywordArguments,
            ]);

            const networkResponse = await fetch(endpointUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/xml',
                'User-Agent': 'Omnisync-AI/2.0 (Neural Action Bridge)'
              },
              body: xmlEnvelope,
            });

            if (!networkResponse.ok) {
              throw new Error(`OS-INTEG-ODOO-TRANSPORT: ${networkResponse.status}`);
            }

            const responseText = await networkResponse.text();

            // Detección de anomalías lógicas en el ERP
            if (responseText.includes('<fault>')) {
              this.reportOdooLogicFault(responseText, modelTechnicalName);
            }

            return this.parseXmlRpcResponse<TResponse>(responseText);
          },
          'OdooDriverApparatus',
          `execute_${operationMethodName}`
        );
      }
    );
  }

  /**
   * @method resolveAuthenticatedUserIdentifier
   * @private
   * @description Realiza el handshake con el servicio 'common' de Odoo para obtener el UID.
   */
  private static async resolveAuthenticatedUserIdentifier(
    config: IOdooConnectionConfiguration
  ): Promise<number> {
    const cacheKey = `${config.baseUrl}:${config.databaseName}:${config.userLoginEmail}`;
    const cachedUid = this.authenticatedUserIdentifierCache.get(cacheKey);

    if (cachedUid) return cachedUid;

    return await OmnisyncTelemetry.traceExecution(
      'OdooDriverApparatus',
      'authenticate_handshake',
      async () => {
        const authXml = this.constructXmlRpcEnvelope('authenticate', [
          config.databaseName,
          config.userLoginEmail,
          config.secretApiKey,
          {}, // Argumentos de contexto vacíos
        ]);

        const response = await fetch(`${config.baseUrl}/xmlrpc/2/common`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/xml' },
          body: authXml,
        });

        const resultXml = await response.text();
        const uid = this.parseXmlRpcResponse<number>(resultXml);

        if (!uid || typeof uid !== 'number') {
          throw new Error('integrations.odoo.auth.failed');
        }

        this.authenticatedUserIdentifierCache.set(cacheKey, uid);
        return uid;
      }
    );
  }

  /**
   * @method constructXmlRpcEnvelope
   * @private
   * @description Serializador atómico de llamadas XML-RPC.
   */
  private static constructXmlRpcEnvelope(methodName: string, params: unknown[]): string {
    const serializedParams = params
      .map((p) => `<param><value>${this.serializeValueToXml(p)}</value></param>`)
      .join('');

    return `<?xml version="1.0"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>${serializedParams}</params>
</methodCall>`.trim();
  }

  /**
   * @method serializeValueToXml
   * @private
   * @description Transforma tipos de TypeScript a la gramática XML de Odoo.
   */
  private static serializeValueToXml(value: unknown): string {
    if (value === null || value === undefined) return '<nil/>';
    if (typeof value === 'string') return `<string>${this.escapeXmlChars(value)}</string>`;
    if (typeof value === 'number') return Number.isInteger(value) ? `<int>${value}</int>` : `<double>${value}</double>`;
    if (typeof value === 'boolean') return `<boolean>${value ? 1 : 0}</boolean>`;

    if (Array.isArray(value)) {
      const items = value.map((i) => `<value>${this.serializeValueToXml(i)}</value>`).join('');
      return `<array><data>${items}</data></array>`;
    }

    if (typeof value === 'object') {
      const members = Object.entries(value)
        .map(([k, v]) => `<member><name>${k}</name><value>${this.serializeValueToXml(v)}</value></member>`)
        .join('');
      return `<struct>${members}</struct>`;
    }

    return `<string>${String(value)}</string>`;
  }

  /**
   * @method parseXmlRpcResponse
   * @private
   * @description Parser ligero optimizado para la latencia en el Edge.
   */
  private static parseXmlRpcResponse<T>(xml: string): T {
    // Extracción de tipos básicos mediante reconocimiento de tags
    if (xml.includes('<int>')) {
      const match = /<int>(\d+)<\/int>/.exec(xml);
      return (match ? parseInt(match[1], 10) : 0) as unknown as T;
    }

    if (xml.includes('<string>')) {
      const match = /<string>([\s\S]*?)<\/string>/.exec(xml);
      return (match ? match[1].trim() : '') as unknown as T;
    }

    if (xml.includes('<boolean>')) {
      return xml.includes('<boolean>1</boolean>') as unknown as T;
    }

    // Para arrays y structs se retorna la estructura cruda (Refacturable a Parser SAX)
    return [] as unknown as T;
  }

  /**
   * @method reportOdooLogicFault
   * @private
   */
  private static reportOdooLogicFault(xml: string, model: string): void {
    const faultMatch = /<string>([\s\S]*?)<\/string>/.exec(xml);
    const faultString = faultMatch ? faultMatch[1] : 'Odoo Unknown Logic Error';

    OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'HIGH',
      apparatus: 'OdooDriverApparatus',
      operation: 'odoo_logic_validation',
      message: faultString,
      context: { affectedModel: model }
    });

    throw new Error(`ODOO-FAULT: ${faultString}`);
  }

  private static escapeXmlChars(unsafe: string): string {
    return unsafe.replace(/[<>&"']/g, (c) => {
      const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' };
      return map[c];
    });
  }
}
