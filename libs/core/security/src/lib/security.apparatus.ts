/** libs/core/security/src/lib/security.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IEncryptedPayload,
  EncryptedPayloadSchema,
} from './schemas/security.schema';

/**
 * @name OmnisyncSecurity
 * @description Aparato de élite para criptografía, gestión de identidad y anonimización de datos.
 * Implementa una arquitectura Dual-Engine (Node.js & Web Crypto API) para garantizar
 * la compatibilidad entre el backend NestJS y el Edge Runtime de Vercel (Middlewares).
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Dual-Runtime-Sovereignty V3.6.2)
 * @vision Ultra-Holística: Zero-Node-Dependency-in-Edge & High-Entropia
 */
export class OmnisyncSecurity {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly DERIVATION_SALT = 'omnisync_neural_salt_v1';

  /**
   * @method encryptSensitiveData
   * @description Cifra datos con AES-256-GCM. Detecta el entorno para usar el motor adecuado.
   * Solo disponible en entornos Node.js para la gestión de secretos ERP.
   */
  public static async encryptSensitiveData(
    plainText: string,
    encryptionKey: string,
  ): Promise<IEncryptedPayload> {
    const apparatusName = 'OmnisyncSecurity';
    const operationName = 'encryptSensitiveData';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        // 1. Verificación de Soberanía de Entorno
        if (!this.isNodeEnvironment()) {
          throw new Error('OS-SEC-501: Operación de cifrado pesado no permitida en el Edge Runtime.');
        }

        try {
          // Importación dinámica para evitar el colapso de Turbopack en el build
          const nodeCrypto = await import('node:crypto');
          
          const initializationVector = nodeCrypto.randomBytes(16);
          const derivedKey = nodeCrypto.scryptSync(
            encryptionKey,
            this.DERIVATION_SALT,
            32,
          );

          const cipher = nodeCrypto.createCipheriv(
            this.ENCRYPTION_ALGORITHM,
            derivedKey,
            initializationVector,
          );

          let encrypted = cipher.update(plainText, 'utf8', 'base64');
          encrypted += cipher.final('base64');

          const authTag = cipher.getAuthTag().toString('hex');

          return EncryptedPayloadSchema.parse({
            encryptedData: encrypted,
            initializationVector: initializationVector.toString('hex'),
            authTag: authTag,
          });
        } catch (error: unknown) {
          await this.reportSecurityBreach('OS-SEC-001', 'encrypt_failed', error);
          throw error;
        }
      },
    );
  }

  /**
   * @method decryptSensitiveData
   * @description Realiza la operación inversa de cifrado. Requiere motor Node.js.
   */
  public static async decryptSensitiveData(
    encryptedInput: string | IEncryptedPayload,
    encryptionKey: string,
  ): Promise<string> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncSecurity',
      'decryptSensitiveData',
      async () => {
        if (!this.isNodeEnvironment()) {
          throw new Error('OS-SEC-501: Descifrado prohibido en capas de interfaz/borde.');
        }

        try {
          const nodeCrypto = await import('node:crypto');
          
          const payload: IEncryptedPayload =
            typeof encryptedInput === 'string'
              ? EncryptedPayloadSchema.parse(JSON.parse(encryptedInput))
              : EncryptedPayloadSchema.parse(encryptedInput);

          const derivedKey = nodeCrypto.scryptSync(
            encryptionKey,
            this.DERIVATION_SALT,
            32,
          );
          const initializationVector = Buffer.from(
            payload.initializationVector,
            'hex',
          );
          const authTag = Buffer.from(payload.authTag, 'hex');

          const decipher = nodeCrypto.createDecipheriv(
            this.ENCRYPTION_ALGORITHM,
            derivedKey,
            initializationVector,
          );

          decipher.setAuthTag(authTag);

          let decrypted = decipher.update(
            payload.encryptedData,
            'base64',
            'utf8',
          );
          decrypted += decipher.final('utf8');

          return decrypted;
        } catch (error: unknown) {
          await this.reportSecurityBreach('OS-SEC-002', 'decrypt_integrity_violation', error);
          throw new Error('OS-SEC-002: Fallo de integridad en descifrado.');
        }
      },
    );
  }

  /**
   * @method anonymizeForAI
   * @description Limpia PII mediante lógica de strings (Edge-Safe).
   */
  public static anonymizeForAI(text: string): string {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\+?[1-9]\d{1,14}/g;

    const cleanText = text
      .replace(emailRegex, '[REDACTED_EMAIL]')
      .replace(phoneRegex, '[REDACTED_PHONE]');

    OmnisyncTelemetry.verbose('OmnisyncSecurity', 'anonymize', 'PII_REDACTED');
    return cleanText;
  }

  /**
   * @method verifyTokenIntegrity
   * @description Valida la estructura del token (Edge-Safe).
   */
  public static verifyTokenIntegrity(token: string): boolean {
    const isTokenValid = typeof token === 'string' && token.length > 32;

    if (!isTokenValid) {
      OmnisyncSentinel.report({
        errorCode: 'OS-SEC-401',
        severity: 'HIGH',
        apparatus: 'OmnisyncSecurity',
        operation: 'verifyToken',
        message: 'security.auth.invalid_token',
        context: { tokenPreview: token?.substring(0, 10) },
      });
    }

    return isTokenValid;
  }

  /**
   * @method generateSovereignId
   * @description Genera un identificador aleatorio compatible con Node y Edge.
   */
  public static generateSovereignId(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
    // Fallback para entornos donde randomUUID no está habilitado
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * @method isNodeEnvironment
   * @private
   * @description Detecta si el runtime actual es Node.js nativo.
   */
  private static isNodeEnvironment(): boolean {
    return (
      typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null
    );
  }

  /**
   * @method reportSecurityBreach
   * @private
   */
  private static async reportSecurityBreach(code: string, op: string, error: unknown): Promise<void> {
    await OmnisyncSentinel.report({
      errorCode: code,
      severity: 'CRITICAL',
      apparatus: 'OmnisyncSecurity',
      operation: op,
      message: 'security.encryption.anomaly',
      context: { errorTrace: String(error) },
      isRecoverable: false,
    });
  }
}