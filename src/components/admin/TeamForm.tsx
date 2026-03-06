'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

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
  const isEdit = !!memberId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeamFormData>();

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input {...register('title', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
          <input
            type="number"
            {...register('order', { valueAsNumber: true })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>

        <TagInput label="Roles" items={roles} onChange={setRoles} />
        <TagInput label="Expertise" items={expertise} onChange={setExpertise} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea {...register('bio', { required: true })} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input {...register('linkedIn')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
        </div>
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y font-mono"
            style={{ fontFamily: 'system-ui' }}
          />
          <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'system-ui' }}>Small base64-encoded preview image used as loading placeholder</p>
        </div>
      </div>
    </form>
  );
}
