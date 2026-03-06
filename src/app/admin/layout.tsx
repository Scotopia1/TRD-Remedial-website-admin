'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="admin-layout min-h-screen bg-[#1a1a1a] flex items-center justify-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  return (
    <div className="admin-layout flex min-h-screen bg-[#fafafa]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <AdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
