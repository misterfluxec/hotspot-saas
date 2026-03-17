import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { Sidebar } from '@/components/client/sidebar';
import { Header } from '@/components/client/header';

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener token de las cookies
  const token = (await headers()).get('cookie')?.match(/auth-token=([^;]+)/)?.[1];

  if (!token) {
    redirect('/login');
  }

  // Verificar token
  const payload = await verifyJWT(token);
  
  if (!payload || payload.role === 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar tenantId={payload.tenantId!} />
      <div className="lg:pl-64">
        <Header user={payload} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
