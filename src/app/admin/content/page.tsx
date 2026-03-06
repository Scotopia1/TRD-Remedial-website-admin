'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

const pages = [
  { key: 'homepage', label: 'Homepage', description: 'Hero, intro, services spotlight, case studies, team, testimonials, emergency CTA, FAQ, backed by strength' },
  { key: 'about', label: 'About Page', description: 'Hero, description, team, values, CTA' },
  { key: 'contact', label: 'Contact Page', description: 'Hero, address, hours, CTA' },
  { key: 'services', label: 'Services Page', description: 'Hero, description, CTA' },
  { key: 'projects', label: 'Projects Page', description: 'CTA section' },
  { key: 'global', label: 'Global Content', description: 'Footer, header, SEO defaults, company stats' },
  { key: 'seo', label: 'SEO Metadata', description: 'Default title, description, OG tags' },
];

export default function ContentOverviewPage() {
  const [initializing, setInitializing] = useState(false);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const res = await fetch('/api/admin/content/initialize', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        const { created, total } = result.data;
        if (created === 0) {
          toast.info(`All ${total} default content entries already exist`);
        } else {
          toast.success(`Created ${created} of ${total} missing default content entries`);
        }
      } else {
        toast.error(result.error || 'Initialization failed');
      }
    } catch {
      toast.error('Network error during initialization');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}
          >
            Page Content
          </h1>
          <p className="text-sm text-gray-500 mt-1">Edit all text content across the website. Changes are grouped by page.</p>
        </div>

        <button
          onClick={handleInitialize}
          disabled={initializing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-sm disabled:opacity-50 flex-shrink-0"
          style={{ textTransform: 'none', fontFamily: 'system-ui' }}
          title="Create default entries for all known content keys that don't yet exist in the database"
        >
          {initializing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {initializing ? 'Initializing...' : 'Initialize Missing Content'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Link
            key={page.key}
            href={`/admin/content/${page.key}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-indigo-500" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-gray-900 text-sm"
                    style={{ fontFamily: 'system-ui', textTransform: 'none', fontSize: '0.875rem', lineHeight: '1.25rem' }}
                  >
                    {page.label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{page.description}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
