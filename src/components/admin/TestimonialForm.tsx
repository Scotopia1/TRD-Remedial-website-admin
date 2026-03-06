'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';

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
  const isEdit = !!testimonialId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TestimonialFormData>({
    defaultValues: { isActive: true, order: 0 },
  });

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Testimonial Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
          <textarea
            {...register('quote', { required: 'Quote is required' })}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
            placeholder="What the client said..."
          />
          {errors.quote && <p className="text-xs text-red-500 mt-1">{errors.quote.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              {...register('author', { required: 'Author is required' })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{ fontFamily: 'system-ui' }}
              placeholder="John Smith"
            />
            {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              {...register('role', { required: 'Role is required' })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{ fontFamily: 'system-ui' }}
              placeholder="Property Manager"
            />
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            {...register('company')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui' }}
            placeholder="Acme Corp (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              {...register('order', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
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
