import type { Metadata } from 'next';
import { cookies }       from 'next/headers';
import { redirect }      from 'next/navigation';
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title:  'Admin — Moderate Glutton',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token || !await verifyToken(token)) {
    redirect('/admin');
  }

  return <AdminDashboard />;
}
