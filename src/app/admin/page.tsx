'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wrench, FolderOpen, Users, HelpCircle, FileText, Image, Plus, ArrowRight } from 'lucide-react';

interface Stats {
  services: number;
  projects: number;
  team: number;
  faqs: number;
  content: number;
  media: number;
}

const statCards = [
  { key: 'services' as const, label: 'Services', icon: Wrench, href: '/admin/services', color: 'bg-blue-50 text-blue-600' },
  { key: 'projects' as const, label: 'Projects', icon: FolderOpen, href: '/admin/projects', color: 'bg-green-50 text-green-600' },
  { key: 'team' as const, label: 'Team Members', icon: Users, href: '/admin/team', color: 'bg-purple-50 text-purple-600' },
  { key: 'faqs' as const, label: 'FAQs', icon: HelpCircle, href: '/admin/faqs', color: 'bg-orange-50 text-orange-600' },
  { key: 'content' as const, label: 'Content Variables', icon: FileText, href: '/admin/content', color: 'bg-indigo-50 text-indigo-600' },
  { key: 'media' as const, label: 'Media Files', icon: Image, href: '/admin/media', color: 'bg-pink-50 text-pink-600' },
];

const quickActions = [
  { label: 'New Service', href: '/admin/services/new', icon: Plus },
  { label: 'New Project', href: '/admin/projects/new', icon: Plus },
  { label: 'New Team Member', href: '/admin/team/new', icon: Plus },
  { label: 'New FAQ', href: '/admin/faqs/new', icon: Plus },
  { label: 'Edit Homepage', href: '/admin/content/homepage', icon: ArrowRight },
  { label: 'Site Settings', href: '/admin/settings', icon: ArrowRight },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to the TRD Remedial content management system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1" style={{ fontSize: '1.875rem', lineHeight: '2.25rem', textTransform: 'none', fontFamily: 'system-ui' }}>
                    {loading ? '-' : stats?.[card.key] ?? 0}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{ fontSize: '1.125rem', lineHeight: '1.75rem', textTransform: 'none', fontFamily: 'system-ui' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white rounded-lg border border-gray-200 p-3 text-center hover:border-gray-300 hover:shadow-sm transition-all text-sm text-gray-700 hover:text-gray-900"
              >
                <Icon size={16} className="mx-auto mb-1.5 text-gray-400" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
