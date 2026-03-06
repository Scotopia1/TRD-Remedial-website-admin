'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { CharacterCounter } from './CharacterCounter';
import { FormField } from './FormField';
import { FormErrorSummary } from './FormErrorSummary';
import {
  CHAR_LIMITS,
  requiredMaxLength,
  inputClass,
} from '@/lib/form-validation';

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
  const [showErrors, setShowErrors] = useState(false);
  const isEdit = !!faqId;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FAQFormData>({
    defaultValues: { category: 'process', order: 0, isActive: true },
  });

  const watchQuestion = watch('question', '');
  const watchAnswer = watch('answer', '');

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
    setShowErrors(false);
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
        router.refresh();
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

  const onError = () => {
    setShowErrors(true);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 max-w-3xl">
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

      <FormErrorSummary errorCount={errorCount} show={showErrors} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Question" required error={errors.question?.message}
          counter={<CharacterCounter current={watchQuestion?.length || 0} max={CHAR_LIMITS.tagline} />}>
          <input
            {...register('question', requiredMaxLength(CHAR_LIMITS.tagline))}
            maxLength={CHAR_LIMITS.tagline}
            className={inputClass(!!errors.question)}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>

        <FormField label="Answer" required error={errors.answer?.message}
          counter={<CharacterCounter current={watchAnswer?.length || 0} max={CHAR_LIMITS.longText} />}>
          <textarea
            {...register('answer', requiredMaxLength(CHAR_LIMITS.longText))}
            maxLength={CHAR_LIMITS.longText}
            rows={5}
            className={`${inputClass(!!errors.answer)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              {...register('category')}
              className={`${inputClass()} bg-white`}
              style={{ fontFamily: 'system-ui' }}
            >
              <option value="process">Process</option>
              <option value="technical">Technical</option>
              <option value="services">Services</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              {...register('order', { valueAsNumber: true })}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
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
              maxLength={CHAR_LIMITS.keyword}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Add keyword..."
              style={{ fontFamily: 'system-ui' }}
            />
            <button type="button" onClick={addKeyword} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"><Plus size={14} /></button>
          </div>
          <p className="text-gray-400 text-xs mt-1 italic" style={{ fontFamily: 'system-ui' }}>Max {CHAR_LIMITS.keyword} characters per keyword</p>
        </div>
      </div>
    </form>
  );
}
