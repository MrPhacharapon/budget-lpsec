import AdminDashboard from './AdminDashboard';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  return <AdminDashboard user={session} />;
}
