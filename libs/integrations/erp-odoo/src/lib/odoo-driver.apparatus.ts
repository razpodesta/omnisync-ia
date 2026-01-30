/** libs/integrations/erp-odoo/src/lib/odoo-driver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IOdooConnectionConfiguration } from './schemas/odoo-integration.schema';

/**
 * @name OdooDriverApparatus
 * @description Nodo maestro de ignición para la comunicación con Odoo Enterprise.
 * Orquesta el despacho de procedimientos remotos (RPC) delegando la serialización,
 * el parsing y la gestión de sesiones a aparatos especializados.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Atomized-RPC-Ignition V3.2)
 * @vision Ultra-Holística: Zero-Local & High-Availability
 */
export class OdooDriverApparatus {
  /**
   * @method executeRemoteProcedureCall
   * @description Punto de entrada soberano para la ejecución de comandos 'execute_kw'.
   * Implementa blindaje de resiliencia mediante el Sentinel y trazabilidad total.
   *
   * @template TResponse - Estructura de salida esperada del ERP.
   * @param {IOdooConnectionConfiguration} connectionConfiguration - ADN de conexión.
   * @param {string} modelTechnicalName - Objeto destino (ej: 'helpdesk.ticket').
   * @param {string} methodTechnicalName - Acción (ej: 'create').
   * @param {unknown[]} positionalArguments - Argumentos de la función.
   * @param {Record<string, unknown>} keywordArguments - Filtros y opciones.
   */
  public static async executeRemoteProcedureCall<TResponse>(
    connectionConfiguration: IOdooConnectionConfiguration,
    modelTechnicalName: string,
    methodTechnicalName: string,
    positionalArguments: unknown[],
    keywordArguments: Record<string, unknown> = {},
  ): Promise<TResponse> {
    const apparatusName = 'OdooDriverApparatus';
    const operationName = `rpc:${modelTechnicalName}:${methodTechnicalName}`;

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      // 1. Resolución de Identidad mediante el Especialista de Sesión
      const authenticatedUserIdentifier = await OdooSessionManager.resolveAuthenticatedUid(
        connectionConfiguration
      );

      // 2. Transmisión con Blindaje Sentinel
      return await OmnisyncSentinel.executeWithResilience(async () => {
        const objectEndpointUrl = `${connectionConfiguration.baseUrl}/xmlrpc/2/object`;

        // 3. Ensamblaje de Protocolo vía Especialista de Serialización
        const xmlEnvelope = OdooXmlRpcAssembler.constructEnvelope('execute_kw', [
          connectionConfiguration.databaseName,
          authenticatedUserIdentifier,
          connectionConfiguration.secretApiKey,
          modelTechnicalName,
          methodTechnicalName,
          positionalArguments,
          keywordArguments,
        ]);

        const networkResponse = await fetch(objectEndpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml',
            'User-Agent': 'Omnisync-AI/3.2 (Action-Bridge-Elite)',
            'Accept': 'text/xml',
          },
          body: xmlEnvelope,
        });

        if (!networkResponse.ok) {
          throw new Error(`OS-INTEG-ODOO-NETWORK: ${networkResponse.status}`);
        }

        const responseRawText = await networkResponse.text();

        // 4. Auditoría de Fallos Lógicos de Odoo
        if (responseRawText.includes('<fault>')) {
          this.reportOdooAnomaly(responseRawText, modelTechnicalName, operationName);
        }

        // 5. Extracción de ADN mediante el Especialista de Parsing
        return OdooXmlRpcParser.parseSovereignResponse<TResponse>(responseRawText);
      }, apparatusName, operationName);
    });
  }

  private static reportOdooAnomaly(xml: string, model: string, op: string): void {
    const errorDetail = OdooXmlRpcParser.parseSovereignResponse<string>(xml);
    OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'HIGH',
      apparatus: 'OdooDriverApparatus',
      operation: op,
      message: `Odoo Logic Error in ${model}: ${errorDetail}`,
      isRecoverable: true,
    });
    throw new Error(`[ODOO_LOGIC_ERROR]: ${errorDetail}`);
  }
}

/**
 * @name OdooSessionManager
 * @description Aparato interno encargado del Pool de Sesiones y handshakes.
 */
class OdooSessionManager {
  private static readonly registry = new Map<string, { uid: number; at: number }>();
  private static readonly TTL = 3600000; // 1 Hora

  public static async resolveAuthenticatedUid(config: IOdooConnectionConfiguration): Promise<number> {
    const key = `${config.baseUrl}:${config.databaseName}:${config.userLoginEmail}`;
    const cached = this.registry.get(key);

    if (cached && Date.now() - cached.at < this.TTL) return cached.uid;

    return await OmnisyncTelemetry.traceExecution('OdooSessionManager', 'handshake', async () => {
      const authXml = OdooXmlRpcAssembler.constructEnvelope('authenticate', [
        config.databaseName,
        config.userLoginEmail,
        config.secretApiKey,
        {},
      ]);

      const response = await fetch(`${config.baseUrl}/xmlrpc/2/common`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: authXml,
      });

      const uid = OdooXmlRpcParser.parseSovereignResponse<number>(await response.text());

      if (typeof uid !== 'number' || uid <= 0) {
        throw new Error('OS-INTEG-ODOO-AUTH: Acceso denegado al cluster.');
      }

      this.registry.set(key, { uid, at: Date.now() });
      return uid;
    });
  }
}

/**
 * @name OdooXmlRpcAssembler
 * @description Aparato interno de serialización de ADN TypeScript a gramática XML-RPC.
 */
class OdooXmlRpcAssembler {
  public static constructEnvelope(method: string, params: unknown[]): string {
    const serialized = params
      .map(p => `<param><value>${this.serializeValue(p)}</value></param>`)
      .join('');
    return `<?xml version="1.0"?><methodCall><methodName>${method}</methodName><params>${serialized}</params></methodCall>`;
  }

  private static serializeValue(val: unknown): string {
    if (val === null || val === undefined) return '<nil/>';
    if (typeof val === 'string') return `<string>${this.sanitize(val)}</string>`;
    if (typeof val === 'number') return Number.isInteger(val) ? `<int>${val}</int>` : `<double>${val}</double>`;
    if (typeof val === 'boolean') return `<boolean>${val ? 1 : 0}</boolean>`;
    if (Array.isArray(val)) return `<array><data>${val.map(i => `<value>${this.serializeValue(i)}</value>`).join('')}</data></array>`;
    if (typeof val === 'object') {
      const members = Object.entries(val as object)
        .map(([k, v]) => `<member><name>${k}</name><value>${this.serializeValue(v)}</value></member>`)
        .join('');
      return `<struct>${members}</struct>`;
    }
    return `<string>${String(val)}</string>`;
  }

  private static sanitize(text: string): string {
    return text.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c] || c));
  }
}

/**
 * @name OdooXmlRpcParser
 * @description Aparato interno de extracción de datos (Unboxing) desde XML-RPC.
 */
class OdooXmlRpcParser {
  public static parseSovereignResponse<T>(xml: string): T {
    if (xml.includes('<int>')) return parseInt(/<int>(\d+)<\/int>/.exec(xml)?.[1] || '0', 10) as unknown as T;
    if (xml.includes('<string>')) return (/<string>([\s\S]*?)<\/string>/.exec(xml)?.[1]?.trim() || '') as unknown as T;
    if (xml.includes('<boolean>')) return (xml.includes('1') || xml.includes('true')) as unknown as T;
    return [] as unknown as T;
  }
}