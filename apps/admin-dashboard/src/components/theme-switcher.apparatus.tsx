/** apps/admin-dashboard/src/components/theme-switcher.apparatus.tsx */

'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

/**
 * @name ThemeSwitcher
 * @description Aparato de control cromático. Sincroniza la preferencia del usuario
 * con las variables del motor Tailwind CSS v4 definidas en global.css.
 */
export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return <div className="w-4 h-4" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="hover:scale-110 transition-transform active:rotate-12"
      aria-label="Toggle Visual Identity"
    >
      {theme === 'dark' ? <Sun size={14} strokeWidth={3} /> : <Moon size={14} strokeWidth={3} />}
    </button>
  );
};
