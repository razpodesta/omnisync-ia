/** apps/admin-dashboard/src/app/page.tsx */
import { redirect } from 'next/navigation';

/**
 * @name RootPage
 * @description Redirige la entrada raíz al locale por defecto ('es')
 * permitiendo que el middleware tome el control semántico.
 */
export default function RootPage() {
  redirect('/es');
}
