'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ValueRow {
  id: string;
  title: string;
  description: string;
  image?: string;
  isText: boolean;
  order: number;
}

export default function ValuesListPage() {
  const router = useRouter();
  const [values, setValues] = useState<ValueRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadValues = () => {
    fetch('/api/admin/values')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setValues(data.data);
      })
      .catch(() => toast.error('Failed to load values'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadValues(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this value?')) return;
    try {
      const res = await fetch(`/api/admin/values/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Deleted'); loadValues(); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Company Values</h1>
          <p className="text-sm text-gray-500 mt-1">{values.length} values (alternating text/image)</p>
        </div>
        <button
          onClick={() => router.push('/admin/values/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] text-sm transition-colors"
          style={{ textTransform: 'none', fontFamily: 'system-ui' }}
        >
          <Plus size={16} /> Add New Value
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {values.sort((a, b) => a.order - b.order).map((val) => (
          <div key={val.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            {val.isText ? (
              <>
                <h3 className="font-bold text-sm text-gray-900" style={{ fontFamily: 'system-ui', textTransform: 'none', fontSize: '0.875rem', lineHeight: '1.25rem' }}>{val.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-3">{val.description}</p>
              </>
            ) : (
              <div className="w-full h-20 bg-gray-100 rounded overflow-hidden">
                {val.image && <img src={val.image} alt="" className="w-full h-full object-cover" />}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">Order: {val.order}</span>
              <div className="flex gap-1">
                <button onClick={() => router.push(`/admin/values/${val.id}`)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Edit size={12} /></button>
                <button onClick={() => handleDelete(val.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
