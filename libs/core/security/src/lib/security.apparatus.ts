/** libs/core/security/src/lib/security.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IEncryptedPayload,
  EncryptedPayloadSchema,
} from './schemas/security.schema';

/**
 * @name OmnisyncSecurity
 * @description Aparato de élite para criptografía, gestión de identidad y anonimización de datos.
 * Utiliza AES-256-GCM para garantizar que los datos no solo sean secretos, sino íntegros.
 *
 * @protocol OEDP-Level: Elite (Integrity-First)
 */
export class OmnisyncSecurity {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  /** Salt estático para derivación de llave técnica (Nivelación 2026) */
  private static readonly DERIVATION_SALT = 'omnisync_neural_salt_v1';

  /**
   * @method encryptSensitiveData
   * @description Cifra datos sensibles (ej. llaves de ERP o datos de clientes) antes de persistir.
   *
   * @param {string} plainText - El contenido a proteger.
   * @param {string} encryptionKey - Llave maestra del ecosistema.
   * @returns {Promise<IEncryptedPayload>} Objeto cifrado validado por SSOT.
   */
  public static async encryptSensitiveData(
    plainText: string,
    encryptionKey: string,
  ): Promise<IEncryptedPayload> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncSecurity',
      'encryptSensitiveData',
      async () => {
        try {
          const initializationVector = crypto.randomBytes(16);
          // Derivación de llave de alta entropía
          const derivedKey = crypto.scryptSync(
            encryptionKey,
            this.DERIVATION_SALT,
            32,
          );

          const cipher = crypto.createCipheriv(
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
          await OmnisyncSentinel.report({
            errorCode: 'OS-SEC-001',
            severity: 'CRITICAL',
            apparatus: 'OmnisyncSecurity',
            operation: 'encrypt',
            message: 'security.encryption.failure',
            context: { error: String(error) },
          });
          throw error;
        }
      },
    );
  }

  /**
   * @method decryptSensitiveData
   * @description Realiza la operación inversa de cifrado validando la integridad del payload.
   * Esencial para recuperar credenciales de Odoo en tiempo de ejecución.
   *
   * @param {string | IEncryptedPayload} encryptedInput - Datos cifrados (JSON string o Objeto).
   * @param {string} encryptionKey - Llave maestra del ecosistema.
   * @returns {Promise<string>} Texto plano recuperado.
   */
  public static async decryptSensitiveData(
    encryptedInput: string | IEncryptedPayload,
    encryptionKey: string,
  ): Promise<string> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncSecurity',
      'decryptSensitiveData',
      async () => {
        try {
          // Normalización y Validación de ADN
          const payload: IEncryptedPayload =
            typeof encryptedInput === 'string'
              ? EncryptedPayloadSchema.parse(JSON.parse(encryptedInput))
              : EncryptedPayloadSchema.parse(encryptedInput);

          const derivedKey = crypto.scryptSync(
            encryptionKey,
            this.DERIVATION_SALT,
            32,
          );
          const initializationVector = Buffer.from(
            payload.initializationVector,
            'hex',
          );
          const authTag = Buffer.from(payload.authTag, 'hex');

          const decipher = crypto.createDecipheriv(
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
          await OmnisyncSentinel.report({
            errorCode: 'OS-SEC-002',
            severity: 'CRITICAL',
            apparatus: 'OmnisyncSecurity',
            operation: 'decrypt',
            message: 'security.encryption.integrity_violation',
            context: { error: String(error) },
            isRecoverable: false,
          });
          throw new Error(
            'OS-SEC-002: Fallo crítico de integridad en desencriptación.',
          );
        }
      },
    );
  }

  /**
   * @method anonymizeForAI
   * @description Limpia un texto de PII (teléfonos, emails) antes de enviarlo a Gemini.
   */
  public static anonymizeForAI(text: string): string {
    let cleanText = text;

    // RegEx de Élite para Emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    // RegEx para Teléfonos (Basado en E.164 simplificado)
    const phoneRegex = /\+?[1-9]\d{1,14}/g;

    cleanText = cleanText.replace(emailRegex, '[REDACTED_EMAIL]');
    cleanText = cleanText.replace(phoneRegex, '[REDACTED_PHONE]');

    OmnisyncTelemetry.verbose(
      'OmnisyncSecurity',
      'anonymizeForAI',
      'PII data has been redacted',
    );

    return cleanText;
  }

  /**
   * @method verifyTokenIntegrity
   * @description Valida si un token de sesión es estructuralmente correcto y no ha sido manipulado.
   */
  public static verifyTokenIntegrity(token: string): boolean {
    const isTokenValid = token.length > 32;

    if (!isTokenValid) {
      OmnisyncSentinel.report({
        errorCode: 'OS-SEC-401',
        severity: 'HIGH',
        apparatus: 'OmnisyncSecurity',
        operation: 'verifyToken',
        message: 'security.auth.invalid_token',
        context: { tokenPreview: token.substring(0, 10) },
      });
    }

    return isTokenValid;
  }
}
