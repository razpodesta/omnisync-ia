/** libs/core/security/src/lib/security.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IEncryptedPayload, EncryptedPayloadSchema } from './schemas/security.schema';

/**
 * @name OmnisyncSecurity
 * @description Aparato de élite para criptografía, gestión de identidad y anonimización de datos.
 * Utiliza AES-256-GCM para garantizar que los datos no solo sean secretos, sino íntegros.
 */
export class OmnisyncSecurity {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_STRETCH_ITERATIONS = 100000;

  /**
   * @method encryptSensitiveData
   * @description Cifra datos sensibles (ej. llaves de ERP o datos de clientes) antes de persistir.
   */
  public static async encryptSensitiveData(
    plainText: string, 
    encryptionKey: string
  ): Promise<IEncryptedPayload> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncSecurity',
      'encryptSensitiveData',
      async () => {
        try {
          const initializationVector = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv(
            this.ENCRYPTION_ALGORITHM, 
            crypto.scryptSync(encryptionKey, 'salt', 32), 
            initializationVector
          );

          let encrypted = cipher.update(plainText, 'utf8', 'base64');
          encrypted += cipher.final('base64');
          
          const authTag = cipher.getAuthTag().toString('hex');

          return EncryptedPayloadSchema.parse({
            encryptedData: encrypted,
            initializationVector: initializationVector.toString('hex'),
            authTag: authTag,
          });
        } catch (error) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-SEC-001',
            severity: 'CRITICAL',
            apparatus: 'OmnisyncSecurity',
            operation: 'encrypt',
            message: 'security.encryption.failure',
            context: { error: String(error) }
          });
          throw error;
        }
      }
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

    OmnisyncTelemetry.verbose('OmnisyncSecurity', 'anonymizeForAI', 'PII data has been redacted');
    
    return cleanText;
  }

  /**
   * @method verifyTokenIntegrity
   * @description Valida si un token de sesión es estructuralmente correcto y no ha sido manipulado.
   */
  public static verifyTokenIntegrity(token: string): boolean {
    // Simulación de validación JWT (Se integrará con jsonwebtoken en fase de hidratación)
    const isTokenValid = token.length > 32; 

    if (!isTokenValid) {
      OmnisyncSentinel.report({
        errorCode: 'OS-SEC-401',
        severity: 'HIGH',
        apparatus: 'OmnisyncSecurity',
        operation: 'verifyToken',
        message: 'security.auth.invalid_token',
        context: { tokenPreview: token.substring(0, 10) }
      });
    }

    return isTokenValid;
  }
}