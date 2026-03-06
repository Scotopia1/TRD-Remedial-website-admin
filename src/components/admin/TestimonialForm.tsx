'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import { CharacterCounter } from './CharacterCounter';
import { FormField } from './FormField';
import { FormErrorSummary } from './FormErrorSummary';
import {
  CHAR_LIMITS,
  requiredMaxLength,
  optionalMaxLength,
  inputClass,
} from '@/lib/form-validation';

interface TestimonialFormData {
  quote: string;
  author: string;
  role: string;
  company: string;
  isActive: boolean;
  order: number;
}

export function TestimonialForm({ testimonialId }: { testimonialId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const isEdit = !!testimonialId;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TestimonialFormData>({
    defaultValues: { isActive: true, order: 0 },
  });

  const watchQuote = watch('quote', '');
  const watchAuthor = watch('author', '');
  const watchRole = watch('role', '');
  const watchCompany = watch('company', '');

  useEffect(() => {
    if (testimonialId) {
      fetch(`/api/admin/testimonials/${testimonialId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const t = data.data;
            reset({
              quote: t.quote,
              author: t.author,
              role: t.role,
              company: t.company || '',
              isActive: t.isActive ?? true,
              order: t.order || 0,
            });
          }
        })
        .catch(() => toast.error('Failed to load testimonial'));
    }
  }, [testimonialId, reset]);

  const onSubmit = async (data: TestimonialFormData) => {
    setShowErrors(false);
    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/testimonials/${testimonialId}` : '/api/admin/testimonials';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? 'Testimonial updated!' : 'Testimonial created!');
        router.refresh();
        router.push('/admin/testimonials');
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
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin/testimonials')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
            {isEdit ? 'Edit Testimonial' : 'New Testimonial'}
          </h1>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <FormErrorSummary errorCount={errorCount} show={showErrors} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Testimonial Details</h2>

        <FormField label="Quote" required error={errors.quote?.message}
          counter={<CharacterCounter current={watchQuote?.length || 0} max={CHAR_LIMITS.quote} />}>
          <textarea
            {...register('quote', requiredMaxLength(CHAR_LIMITS.quote))}
            maxLength={CHAR_LIMITS.quote}
            rows={4}
            className={`${inputClass(!!errors.quote)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
            placeholder="What the client said..."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Author" required error={errors.author?.message}
            counter={<CharacterCounter current={watchAuthor?.length || 0} max={CHAR_LIMITS.name} />}>
            <input
              {...register('author', requiredMaxLength(CHAR_LIMITS.name))}
              maxLength={CHAR_LIMITS.name}
              className={inputClass(!!errors.author)}
              style={{ fontFamily: 'system-ui' }}
              placeholder="John Smith"
            />
          </FormField>
          <FormField label="Role" required error={errors.role?.message}
            counter={<CharacterCounter current={watchRole?.length || 0} max={CHAR_LIMITS.title} />}>
            <input
              {...register('role', requiredMaxLength(CHAR_LIMITS.title))}
              maxLength={CHAR_LIMITS.title}
              className={inputClass(!!errors.role)}
              style={{ fontFamily: 'system-ui' }}
              placeholder="Property Manager"
            />
          </FormField>
        </div>

        <FormField label="Company" error={errors.company?.message}
          counter={<CharacterCounter current={watchCompany?.length || 0} max={CHAR_LIMITS.title} />}>
          <input
            {...register('company', optionalMaxLength(CHAR_LIMITS.title))}
            maxLength={CHAR_LIMITS.title}
            className={inputClass(!!errors.company)}
            style={{ fontFamily: 'system-ui' }}
            placeholder="Acme Corp (optional)"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
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
      </div>
    </form>
  );
}
