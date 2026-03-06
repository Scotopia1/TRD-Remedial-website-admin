'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FAQRow {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  order: number;
  isActive: boolean;
}

const categories = ['process', 'technical', 'services'] as const;

export default function FAQsListPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadFaqs = () => {
    fetch('/api/admin/faqs')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFaqs(data.data);
      })
      .catch(() => toast.error('Failed to load FAQs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFaqs(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('FAQ deleted'); loadFaqs(); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Error'); }
  };

  const filteredFaqs = activeTab === 'all' ? faqs : faqs.filter(f => f.category === activeTab);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading FAQs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>FAQs</h1>
          <p className="text-sm text-gray-500 mt-1">{faqs.length} frequently asked questions</p>
        </div>
        <Link href="/admin/faqs/new" className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          <Plus size={16} /> Add FAQ
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeTab === 'all' ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          style={{ fontFamily: 'system-ui', textTransform: 'none' }}
        >
          All ({faqs.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors capitalize ${activeTab === cat ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={{ fontFamily: 'system-ui', textTransform: 'capitalize' }}
          >
            {cat} ({faqs.filter(f => f.category === cat).length})
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                    faq.category === 'process' ? 'bg-blue-50 text-blue-600' :
                    faq.category === 'technical' ? 'bg-purple-50 text-purple-600' :
                    'bg-green-50 text-green-600'
                  }`}>{faq.category}</span>
                  {!faq.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">Inactive</span>}
                </div>
                <h3 className="font-medium text-sm text-gray-900" style={{ fontFamily: 'system-ui', textTransform: 'none', fontSize: '0.875rem', lineHeight: '1.25rem' }}>{faq.question}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => router.push(`/admin/faqs/${faq.id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Edit size={14} /></button>
                <button onClick={() => handleDelete(faq.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
