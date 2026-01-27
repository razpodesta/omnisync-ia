/** apps/admin-dashboard/src/app/[locale]/unauthorized/page.tsx */

import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * @name AdministrativeUnauthorizedPage
 * @description Aparato de interfaz de usuario para la gestión de excepciones de
 * seguridad geográfica (OS-SEC-403). Implementa una estética minimalista de alta
 * gama para informar al usuario sobre las políticas de soberanía territorial.
 *
 * @note Se ha eliminado la declaración de parámetros no utilizados para cumplir
 * con las reglas de integridad del linter y optimizar la firma del componente.
 *
 * @returns {Promise<React.ReactNode>} El nodo de la interfaz renderizado.
 */
export default async function AdministrativeUnauthorizedPage(): Promise<React.ReactNode> {
  const translations = useTranslations('security.geofencing');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">

      {/* Contenedor de Alerta Obsidian & Milk */}
      <section className="max-w-2xl w-full border border-border p-16 space-y-12 bg-white dark:bg-black shadow-[0_0_80px_-15px_rgba(0,0,0,0.05)]">

        {/* Identificador de Error de Élite */}
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
              Security Breach Prevention
            </span>
            <h1 className="text-4xl font-light tracking-tighter italic">
              Acceso <span className="font-bold not-italic">No Autorizado.</span>
            </h1>
          </div>
          <div className="text-[10px] font-mono border border-border px-3 py-1 opacity-40">
            {translations('error_code')}
          </div>
        </header>

        {/* Cuerpo del Mensaje Localizado */}
        <article className="space-y-6">
          <p className="text-sm leading-relaxed font-light opacity-70 uppercase tracking-widest text-[11px]">
            {translations('restricted_region', { country: 'RESTRICTED' })}
          </p>
          <div className="h-[1px] w-full bg-border opacity-50" />
          <p className="text-[12px] leading-relaxed opacity-50 italic">
            El consumo de recursos de inteligencia artificial y orquestación neural
            está limitado a regiones geográficas autorizadas para garantizar el
            cumplimiento de las normativas de soberanía de datos y protección de tokens.
          </p>
        </article>

        {/* Acción de Retorno Institucional */}
        <footer className="pt-8">
          <a
            href="/"
            className="inline-block text-[10px] font-black uppercase tracking-[0.3em] border-b border-black dark:border-white pb-1 hover:opacity-40 transition-opacity"
          >
            Volver al Inicio Seguro
          </a>
        </footer>

      </section>

      {/* Decoración de Grado Arquitectónico */}
      <div className="mt-12 text-[8px] uppercase tracking-[0.8em] opacity-20 font-bold text-black dark:text-white">
        Omnisync Security Protocol Implementation
      </div>
    </div>
  );
}
