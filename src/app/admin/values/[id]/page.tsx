'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { CharacterCounter } from '@/components/admin/CharacterCounter';
import { FormField } from '@/components/admin/FormField';
import { FormErrorSummary } from '@/components/admin/FormErrorSummary';
import {
  CHAR_LIMITS,
  requiredMaxLength,
  inputClass,
} from '@/lib/form-validation';

interface ValueFormData {
  title: string;
  description: string;
  isText: boolean;
  order: number;
}

export default function EditValuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ValueFormData>();

  const watchTitle = watch('title', '');
  const watchDescription = watch('description', '');

  useEffect(() => {
    fetch(`/api/admin/values/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const v = data.data;
          reset({
            title: v.title,
            description: v.description,
            isText: v.isText,
            order: v.order,
          });
          setImage(v.image || '');
        }
      });
  }, [id, reset]);

  const onSubmit = async (data: ValueFormData) => {
    setShowErrors(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/values/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Value updated!');
        router.refresh();
        router.push('/admin/values');
      } else {
        toast.error(result.error || 'Failed');
      }
    } catch {
      toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  const onError = () => {
    setShowErrors(true);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin/values')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Edit Value</h1>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] text-sm disabled:opacity-50" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <FormErrorSummary errorCount={errorCount} show={showErrors} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Title" required error={errors.title?.message}
          counter={<CharacterCounter current={watchTitle?.length || 0} max={CHAR_LIMITS.title} />}>
          <input
            {...register('title', requiredMaxLength(CHAR_LIMITS.title))}
            maxLength={CHAR_LIMITS.title}
            className={inputClass(!!errors.title)}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>
        <FormField label="Description" required error={errors.description?.message}
          counter={<CharacterCounter current={watchDescription?.length || 0} max={CHAR_LIMITS.longText} />}>
          <textarea
            {...register('description', requiredMaxLength(CHAR_LIMITS.longText))}
            maxLength={CHAR_LIMITS.longText}
            rows={3}
            className={`${inputClass(!!errors.description)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>

        <ImageUploadField
          label="Image"
          value={image}
          onChange={setImage}
          folder="values"
        />

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
              <input type="checkbox" {...register('isText')} className="w-4 h-4" />
              <span className="text-sm text-gray-700">Text Card</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
