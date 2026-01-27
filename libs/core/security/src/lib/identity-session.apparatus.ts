/** libs/core/security/src/lib/identity-session.apparatus.ts */

import { IIdentitySession, IdentitySessionSchema } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name IdentitySessionApparatus
 * @description Orquestador de persistencia de identidad. Sincroniza el estado
 * del usuario entre Cookies (para SSR y seguridad) y LocalStorage (para acceso rápido a preferencias UX).
 */
export class IdentitySessionApparatus {
  private static readonly STORAGE_KEY = 'os_identity_v1';
  private static readonly COOKIE_NAME = 'omnisync_session';

  /**
   * @method initializeNewSession
   * @description Registra la huella de identidad en el navegador.
   */
  public static initializeNewSession(session: IIdentitySession): void {
    OmnisyncTelemetry.traceExecutionSync('IdentitySession', 'initialize', () => {
      if (typeof window === 'undefined') return;

      // 1. Persistencia Local (Preferencias)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

      // 2. Persistencia en Cookie (Autorización SSR)
      // Expira en 7 días, segura y con política SameSite estricta.
      const cookieOptions = 'path=/; max-age=604800; SameSite=Strict; Secure';
      document.cookie = `${this.COOKIE_NAME}=${encodeURIComponent(session.sessionToken)}; ${cookieOptions}`;
    });
  }

  /**
   * @method getActiveSession
   * @description Recupera la sesión validando su integridad contra el esquema SSOT.
   */
  public static getActiveSession(): IIdentitySession | null {
    if (typeof window === 'undefined') return null;

    const rawData = localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return null;

    try {
      return IdentitySessionSchema.parse(JSON.parse(rawData));
    } catch {
      this.terminateSession();
      return null;
    }
  }

  /**
   * @method terminateSession
   * @description Erradica toda presencia de identidad del dispositivo.
   */
  public static terminateSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
    document.cookie = `${this.COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
}
