'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export function FAQForm({ faqId }: { faqId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const isEdit = !!faqId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FAQFormData>({
    defaultValues: { category: 'process', order: 0, isActive: true },
  });

  useEffect(() => {
    if (faqId) {
      fetch(`/api/admin/faqs/${faqId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const f = data.data;
            reset({
              question: f.question,
              answer: f.answer,
              category: f.category,
              order: f.order,
              isActive: f.isActive,
            });
            setKeywords(f.keywords || []);
          }
        });
    }
  }, [faqId, reset]);

  const addKeyword = () => {
    if (kwInput.trim() && !keywords.includes(kwInput.trim())) {
      setKeywords([...keywords, kwInput.trim()]);
      setKwInput('');
    }
  };

  const onSubmit = async (data: FAQFormData) => {
    setLoading(true);
    try {
      const payload = { ...data, keywords };
      const url = isEdit ? `/api/admin/faqs/${faqId}` : '/api/admin/faqs';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? 'FAQ updated!' : 'FAQ created!');
        router.push('/admin/faqs');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin/faqs')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
            {isEdit ? 'Edit FAQ' : 'New FAQ'}
          </h1>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] text-sm disabled:opacity-50" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <input {...register('question', { required: 'Question is required' })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          {errors.question && <p className="text-xs text-red-500 mt-1">{errors.question.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
          <textarea {...register('answer', { required: 'Answer is required' })} rows={5} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('category')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" style={{ fontFamily: 'system-ui' }}>
              <option value="process">Process</option>
              <option value="technical">Technical</option>
              <option value="services">Services</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input type="number" {...register('order', { valueAsNumber: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {keywords.map((kw, idx) => (
              <span key={idx} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                {kw}
                <button type="button" onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Add keyword..."
              style={{ fontFamily: 'system-ui' }}
            />
            <button type="button" onClick={addKeyword} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"><Plus size={14} /></button>
          </div>
        </div>
      </div>
    </form>
  );
}
