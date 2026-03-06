'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TestimonialRow {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function TestimonialsListPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTestimonials = () => {
    fetch('/api/admin/testimonials')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTestimonials(data.data);
      })
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTestimonials(); }, []);

  const handleDelete = async (id: string, author: string) => {
    if (!confirm(`Delete testimonial from "${author}"?`)) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Testimonial deleted');
        loadTestimonials();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500" style={{ fontFamily: 'system-ui' }}>Loading testimonials...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Testimonials</h1>
          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'system-ui' }}>{testimonials.length} testimonials</p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm"
          style={{ textTransform: 'none', fontFamily: 'system-ui' }}
        >
          <Plus size={16} /> Add Testimonial
        </Link>
      </div>

      <div className="space-y-3">
        {testimonials.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'system-ui' }}>No testimonials yet.</p>
          </div>
        )}
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500" style={{ fontFamily: 'system-ui' }}>#{t.order}</span>
                  {!t.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-gray-800 line-clamp-2 italic" style={{ fontFamily: 'system-ui' }}>"{t.quote}"</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700" style={{ fontFamily: 'system-ui' }}>{t.author}</span>
                  <span className="text-xs text-gray-400">&mdash;</span>
                  <span className="text-xs text-gray-500" style={{ fontFamily: 'system-ui' }}>{t.role}{t.company ? `, ${t.company}` : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => router.push(`/admin/testimonials/${t.id}`)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.author)}
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
