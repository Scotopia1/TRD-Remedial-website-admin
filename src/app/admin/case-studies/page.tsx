'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface CaseStudyRow {
  id: string;
  title: string;
  location: string;
  challenge: string;
  result: string;
  visual: string | null;
  createdAt: string;
}

export default function CaseStudiesListPage() {
  const router = useRouter();
  const [caseStudies, setCaseStudies] = useState<CaseStudyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCaseStudies = () => {
    fetch('/api/admin/case-studies')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCaseStudies(data.data);
      })
      .catch(() => toast.error('Failed to load case studies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCaseStudies(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Case study deleted');
        loadCaseStudies();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500" style={{ fontFamily: 'system-ui' }}>Loading case studies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Case Studies</h1>
          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'system-ui' }}>{caseStudies.length} case studies</p>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm"
          style={{ textTransform: 'none', fontFamily: 'system-ui' }}
        >
          <Plus size={16} /> Add Case Study
        </Link>
      </div>

      <div className="space-y-3">
        {caseStudies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'system-ui' }}>No case studies yet.</p>
          </div>
        )}
        {caseStudies.map((cs) => (
          <div key={cs.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                {cs.visual && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={cs.visual} alt={cs.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900" style={{ fontFamily: 'system-ui', textTransform: 'none' }}>{cs.title}</h3>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                    <MapPin size={10} />
                    <span style={{ fontFamily: 'system-ui' }}>{cs.location}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2" style={{ fontFamily: 'system-ui' }}>{cs.challenge}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => router.push(`/admin/case-studies/${cs.id}`)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cs.id, cs.title)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
