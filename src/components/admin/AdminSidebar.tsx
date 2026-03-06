'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FolderOpen,
  Users,
  FileText,
  HelpCircle,
  Image,
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { label: 'Team', href: '/admin/team', icon: Users },
  { label: 'Values', href: '/admin/values', icon: Heart },
  { label: 'Page Content', href: '/admin/content', icon: FileText },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { label: 'Case Studies', href: '/admin/case-studies', icon: BookOpen },
  { label: 'Media', href: '/admin/media', icon: Image },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-[#1a1a1a] text-white min-h-screen flex flex-col transition-all duration-200 relative`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0">
            <span className="text-[#1a1a1a] font-bold text-xs">TRD</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-wide">Admin Panel</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1a1a] border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {!collapsed && (
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
            target="_blank"
          >
            View Public Site
          </Link>
        )}
      </div>
    </aside>
  );
}
