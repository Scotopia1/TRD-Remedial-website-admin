'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { MultiImageUploadField } from '@/components/admin/MultiImageUploadField';

interface CaseStudyFormData {
  title: string;
  location: string;
  challenge: string;
  result: string;
}

export function CaseStudyForm({ caseStudyId }: { caseStudyId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<{ label: string; value: string }[]>([]);
  const [images, setImages] = useState<{ url: string; alt: string; caption?: string }[]>([]);
  const [visual, setVisual] = useState('');
  const isEdit = !!caseStudyId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CaseStudyFormData>();

  useEffect(() => {
    if (caseStudyId) {
      fetch(`/api/admin/case-studies/${caseStudyId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const cs = data.data;
            reset({
              title: cs.title,
              location: cs.location,
              challenge: cs.challenge,
              result: cs.result,
            });
            setVisual(cs.visual || '');
            setSolution(cs.solution || []);
            setMetrics(cs.metrics || []);
            setImages(cs.images || []);
          }
        })
        .catch(() => toast.error('Failed to load case study'));
    }
  }, [caseStudyId, reset]);

  const onSubmit = async (data: CaseStudyFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        visual,
        solution,
        metrics: metrics.length > 0 ? metrics : null,
        images: images.length > 0 ? images : null,
      };

      const url = isEdit ? `/api/admin/case-studies/${caseStudyId}` : '/api/admin/case-studies';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? 'Case study updated!' : 'Case study created!');
        router.push('/admin/case-studies');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Solution helpers
  const addSolutionItem = () => setSolution([...solution, '']);
  const removeSolutionItem = (idx: number) => setSolution(solution.filter((_, i) => i !== idx));
  const updateSolutionItem = (idx: number, val: string) => {
    const updated = [...solution];
    updated[idx] = val;
    setSolution(updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin/case-studies')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
            {isEdit ? 'Edit Case Study' : 'New Case Study'}
          </h1>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Basic Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{ fontFamily: 'system-ui' }}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              {...register('location', { required: 'Location is required' })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{ fontFamily: 'system-ui' }}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
          </div>
        </div>

        <ImageUploadField
          label="Visual / Hero Image"
          value={visual}
          onChange={setVisual}
          folder="case-studies"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Content</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
          <textarea
            {...register('challenge', { required: 'Challenge is required' })}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
          {errors.challenge && <p className="text-xs text-red-500 mt-1">{errors.challenge.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Solution (bullet points)</label>
          <div className="space-y-2">
            {solution.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateSolutionItem(idx, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{ fontFamily: 'system-ui' }}
                  placeholder="Solution step..."
                />
                <button type="button" onClick={() => removeSolutionItem(idx)} className="p-2 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addSolutionItem} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              <Plus size={12} /> Add solution point
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
          <textarea
            {...register('result', { required: 'Result is required' })}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
          {errors.result && <p className="text-xs text-red-500 mt-1">{errors.result.message}</p>}
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Metrics</h2>
        <div className="space-y-3">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => { const u = [...metrics]; u[idx] = { ...u[idx], label: e.target.value }; setMetrics(u); }}
                    placeholder="e.g. Cost Savings"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Value</label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => { const u = [...metrics]; u[idx] = { ...u[idx], value: e.target.value }; setMetrics(u); }}
                    placeholder="e.g. 40%"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
              </div>
              <button type="button" onClick={() => setMetrics(metrics.filter((_, i) => i !== idx))} className="mt-6 p-2 text-gray-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setMetrics([...metrics, { label: '', value: '' }])} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <Plus size={12} /> Add metric
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <MultiImageUploadField
          label="Gallery Images"
          images={images}
          onChange={setImages}
          folder="case-studies"
        />
      </div>
    </form>
  );
}
