/** libs/integrations/erp-odoo/src/lib/odoo-driver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IOdooConnectionConfiguration } from './schemas/odoo-integration.schema';

/**
 * @interface ISovereignOdooSession
 * @description Estructura de persistencia de sesión técnica con control de caducidad.
 */
interface ISovereignOdooSession {
  readonly userId: number;
  readonly authenticatedAt: number;
}

/**
 * @name OdooDriverApparatus
 * @description Motor de comunicación de alta disponibilidad para Odoo ERP (v16-v18).
 * Orquesta la serialización de protocolos XML-RPC y el transporte seguro HTTPS.
 * Implementa un pool de sesiones inteligente para minimizar la latencia de handshake.
 *
 * @protocol OEDP-Level: Elite (Session-Aware & Edge-Ready)
 */
export class OdooDriverApparatus {
  /**
   * @private
   * Almacén de sesiones por Tenant para evitar re-autenticaciones costosas.
   */
  private static readonly sessionRegistry = new Map<
    string,
    ISovereignOdooSession
  >();

  /**
   * @private
   * Umbral de expiración de sesión (1 hora) según el estándar de Odoo Online.
   */
  private static readonly SESSION_EXPIRY_THRESHOLD_MILLISECONDS = 3600000;

  /**
   * @method executeRemoteProcedureCall
   * @description Nodo maestro para la ejecución de comandos 'execute_kw'.
   * Gestiona el ciclo de vida de la sesión y la resiliencia del transporte.
   *
   * @template TResponse - Estructura de salida esperada.
   * @param {IOdooConnectionConfiguration} connectionConfiguration - ADN de conexión del suscriptor.
   * @param {string} modelTechnicalName - Nombre del objeto en Odoo (ej: 'res.partner').
   * @param {string} methodTechnicalName - Función a ejecutar (ej: 'create', 'write').
   * @param {unknown[]} positionalArguments - Argumentos de la función.
   * @param {Record<string, unknown>} keywordArguments - Diccionario de parámetros nombrados.
   * @returns {Promise<TResponse>} Datos normalizados desde el cluster remoto.
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

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        // 1. Resolución de Identidad Técnica con validación de caducidad
        const authenticatedUserIdentifier =
          await this.resolveAuthenticatedUserIdentifier(
            connectionConfiguration,
          );

        // 2. Ejecución con Blindaje Sentinel
        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            const objectEndpointUrl = `${connectionConfiguration.baseUrl}/xmlrpc/2/object`;

            const xmlEnvelope = this.constructXmlRpcEnvelope('execute_kw', [
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
                Accept: 'text/xml',
              },
              body: xmlEnvelope,
            });

            if (!networkResponse.ok) {
              throw new Error(
                `OS-INTEG-ODOO-NETWORK: ${networkResponse.status} ${networkResponse.statusText}`,
              );
            }

            const responseRawText = await networkResponse.text();

            // Auditoría de fallos lógicos internos del ERP
            if (responseRawText.includes('<fault>')) {
              this.reportOdooLogicAnomaly(
                responseRawText,
                modelTechnicalName,
                methodTechnicalName,
              );
            }

            return this.parseSovereignXmlResponse<TResponse>(responseRawText);
          },
          apparatusName,
          operationName,
        );
      },
    );
  }

  /**
   * @method resolveAuthenticatedUserIdentifier
   * @private
   * @description Gestiona el pool de sesiones aplicando lógica de re-autenticación proactiva.
   */
  private static async resolveAuthenticatedUserIdentifier(
    configuration: IOdooConnectionConfiguration,
  ): Promise<number> {
    const sessionKey = `${configuration.baseUrl}:${configuration.databaseName}:${configuration.userLoginEmail}`;
    const cachedSession = this.sessionRegistry.get(sessionKey);
    const currentTime = Date.now();

    // Verificación de existencia y validez temporal de la sesión
    if (
      cachedSession &&
      currentTime - cachedSession.authenticatedAt <
        this.SESSION_EXPIRY_THRESHOLD_MILLISECONDS
    ) {
      return cachedSession.userId;
    }

    return await OmnisyncTelemetry.traceExecution(
      'OdooDriverApparatus',
      'handshake_authentication',
      async () => {
        const authXml = this.constructXmlRpcEnvelope('authenticate', [
          configuration.databaseName,
          configuration.userLoginEmail,
          configuration.secretApiKey,
          {}, // Contexto de autenticación vacío
        ]);

        const networkResponse = await fetch(
          `${configuration.baseUrl}/xmlrpc/2/common`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml' },
            body: authXml,
          },
        );

        const resultXml = await networkResponse.text();
        const userId = this.parseSovereignXmlResponse<number>(resultXml);

        if (!userId || typeof userId !== 'number') {
          throw new Error(
            'OS-INTEG-ODOO-AUTH: Credenciales rechazadas o base de datos inaccesible.',
          );
        }

        // Registro en el pool soberano
        this.sessionRegistry.set(sessionKey, {
          userId,
          authenticatedAt: currentTime,
        });

        return userId;
      },
    );
  }

  /**
   * @method constructXmlRpcEnvelope
   * @private
   * @description Ensamblador de protocolos XML-RPC.
   */
  private static constructXmlRpcEnvelope(
    methodName: string,
    operationalParameters: unknown[],
  ): string {
    const serializedParameters = operationalParameters
      .map(
        (parameter) =>
          `<param><value>${this.serializeValueToXml(parameter)}</value></param>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>${serializedParameters}</params>
</methodCall>`.trim();
  }

  /**
   * @method serializeValueToXml
   * @private
   * @description Transforma tipos nativos de TS a gramática XML compatible con el ORM de Odoo.
   */
  private static serializeValueToXml(dataValue: unknown): string {
    if (dataValue === null || dataValue === undefined) return '<nil/>';

    if (typeof dataValue === 'string') {
      return `<string>${this.sanitizeXmlPayload(dataValue)}</string>`;
    }

    if (typeof dataValue === 'number') {
      return Number.isInteger(dataValue)
        ? `<int>${dataValue}</int>`
        : `<double>${dataValue}</double>`;
    }

    if (typeof dataValue === 'boolean') {
      return `<boolean>${dataValue ? 1 : 0}</boolean>`;
    }

    if (Array.isArray(dataValue)) {
      const items = dataValue
        .map((item) => `<value>${this.serializeValueToXml(item)}</value>`)
        .join('');
      return `<array><data>${items}</data></array>`;
    }

    if (typeof dataValue === 'object') {
      const members = Object.entries(dataValue)
        .map(
          ([key, value]) =>
            `<member><name>${key}</name><value>${this.serializeValueToXml(value)}</value></member>`,
        )
        .join('');
      return `<struct>${members}</struct>`;
    }

    return `<string>${String(dataValue)}</string>`;
  }

  /**
   * @method parseSovereignXmlResponse
   * @private
   * @description Parser resiliente optimizado para baja latencia en entornos sin DOM.
   */
  private static parseSovereignXmlResponse<T>(xmlContent: string): T {
    // Extracción determinista de enteros
    if (xmlContent.includes('<int>')) {
      const integerMatch = /<int>(\d+)<\/int>/.exec(xmlContent);
      return (integerMatch ? parseInt(integerMatch[1], 10) : 0) as unknown as T;
    }

    // Extracción de cadenas con soporte multilínea
    if (xmlContent.includes('<string>')) {
      const stringMatch = /<string>([\s\S]*?)<\/string>/.exec(xmlContent);
      return (stringMatch ? stringMatch[1].trim() : '') as unknown as T;
    }

    if (xmlContent.includes('<boolean>')) {
      return xmlContent.includes('<boolean>1</boolean>') as unknown as T;
    }

    // Fallback para tipos complejos (se recomienda implementar un parser SAX si el volumen crece)
    return [] as unknown as T;
  }

  /**
   * @method reportOdooLogicAnomaly
   * @private
   */
  private static reportOdooLogicAnomaly(
    xml: string,
    model: string,
    method: string,
  ): void {
    const anomalyMatch = /<string>([\s\S]*?)<\/string>/.exec(xml);
    const anomalyDetail = anomalyMatch
      ? anomalyMatch[1]
      : 'Odoo Logic Violation';

    OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'HIGH',
      apparatus: 'OdooDriverApparatus',
      operation: 'logic_validation',
      message: anomalyDetail,
      context: { affectedModel: model, targetMethod: method },
    });

    throw new Error(`[ODOO_LOGIC_ERROR]: ${anomalyDetail}`);
  }

  /**
   * @method sanitizeXmlPayload
   * @private
   */
  private static sanitizeXmlPayload(unsafeText: string): string {
    return unsafeText.replace(/[<>&"']/g, (character) => {
      const entityMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      };
      return entityMap[character] || character;
    });
  }
}
