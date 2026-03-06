'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { CharacterCounter } from './CharacterCounter';
import { FormField } from './FormField';
import { FormErrorSummary } from './FormErrorSummary';
import {
  CHAR_LIMITS,
  MESSAGES,
  requiredMaxLength,
  optionalMaxLength,
  urlRules,
  inputClass,
} from '@/lib/form-validation';

interface TeamFormData {
  name: string;
  title: string;
  bio: string;
  linkedIn: string;
  order: number;
  blurDataURL: string;
}

function TagInput({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [input, setInput] = useState('');

  const addItem = () => {
    if (input.trim() && !items.includes(input.trim())) {
      onChange([...items, input.trim()]);
      setInput('');
    }
  };

  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, idx) => (
          <span key={idx} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
            {item}
            <button type="button" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          maxLength={CHAR_LIMITS.keyword}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder={`Add ${label.toLowerCase().replace(/s$/, '')}...`}
          style={{ fontFamily: 'system-ui' }}
        />
        <button type="button" onClick={addItem} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function TeamForm({ memberId }: { memberId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [image, setImage] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const isEdit = !!memberId;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TeamFormData>();

  const watchName = watch('name', '');
  const watchTitle = watch('title', '');
  const watchBio = watch('bio', '');
  const watchLinkedIn = watch('linkedIn', '');

  useEffect(() => {
    if (memberId) {
      fetch(`/api/admin/team/${memberId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const m = data.data;
            reset({
              name: m.name,
              title: m.title,
              bio: m.bio,
              linkedIn: m.linkedIn || '',
              order: m.order ?? 0,
              blurDataURL: m.blurDataURL || '',
            });
            setImage(m.image || '');
            setRoles(m.roles || []);
            setExpertise(m.expertise || []);
          }
        });
    }
  }, [memberId, reset]);

  const onSubmit = async (data: TeamFormData) => {
    setShowErrors(false);
    setLoading(true);
    try {
      const payload = { ...data, image, roles, expertise, order: data.order, blurDataURL: data.blurDataURL || undefined };
      const url = isEdit ? `/api/admin/team/${memberId}` : '/api/admin/team';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? 'Member updated!' : 'Member created!');
        router.refresh();
        router.push('/admin/team');
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
          <button type="button" onClick={() => router.push('/admin/team')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
            {isEdit ? 'Edit Team Member' : 'New Team Member'}
          </h1>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <FormErrorSummary errorCount={errorCount} show={showErrors} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name" required error={errors.name?.message}
            counter={<CharacterCounter current={watchName?.length || 0} max={CHAR_LIMITS.name} />}>
            <input
              {...register('name', requiredMaxLength(CHAR_LIMITS.name))}
              maxLength={CHAR_LIMITS.name}
              className={inputClass(!!errors.name)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Title" required error={errors.title?.message}
            counter={<CharacterCounter current={watchTitle?.length || 0} max={CHAR_LIMITS.title} />}>
            <input
              {...register('title', requiredMaxLength(CHAR_LIMITS.title))}
              maxLength={CHAR_LIMITS.title}
              className={inputClass(!!errors.title)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
          <input
            type="number"
            {...register('order', { valueAsNumber: true })}
            className={inputClass()}
            style={{ fontFamily: 'system-ui' }}
          />
        </div>

        <TagInput label="Roles" items={roles} onChange={setRoles} />
        <TagInput label="Expertise" items={expertise} onChange={setExpertise} />

        <FormField label="Bio" required error={errors.bio?.message}
          counter={<CharacterCounter current={watchBio?.length || 0} max={CHAR_LIMITS.longText} />}>
          <textarea
            {...register('bio', requiredMaxLength(CHAR_LIMITS.longText))}
            maxLength={CHAR_LIMITS.longText}
            rows={4}
            className={`${inputClass(!!errors.bio)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>

        <FormField label="LinkedIn URL" error={errors.linkedIn?.message}
          counter={<CharacterCounter current={watchLinkedIn?.length || 0} max={CHAR_LIMITS.url} />}>
          <input
            {...register('linkedIn', urlRules())}
            maxLength={CHAR_LIMITS.url}
            className={inputClass(!!errors.linkedIn)}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>
      </div>

      {/* Profile Photo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Profile Photo</h2>
        <div className="max-w-xs">
          <ImageUploadField
            label="Profile Photo"
            value={image}
            onChange={setImage}
            folder="team"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blur Data URL (base64)</label>
          <textarea
            {...register('blurDataURL')}
            rows={2}
            placeholder="data:image/webp;base64,..."
            className={`${inputClass()} resize-y font-mono`}
            style={{ fontFamily: 'system-ui' }}
          />
          <p className="text-xs text-gray-400 mt-1 italic" style={{ fontFamily: 'system-ui' }}>Small base64-encoded preview image used as loading placeholder</p>
        </div>
      </div>
    </form>
  );
}
