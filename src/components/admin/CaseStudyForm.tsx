'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { MultiImageUploadField } from '@/components/admin/MultiImageUploadField';
import { CharacterCounter } from '@/components/admin/CharacterCounter';
import { FormField } from '@/components/admin/FormField';
import { FormErrorSummary } from '@/components/admin/FormErrorSummary';
import {
  CHAR_LIMITS,
  HELP_TEXT,
  requiredMaxLength,
  inputClass,
} from '@/lib/form-validation';

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
  const [showErrors, setShowErrors] = useState(false);
  const isEdit = !!caseStudyId;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CaseStudyFormData>();

  const watchTitle = watch('title', '');
  const watchLocation = watch('location', '');
  const watchChallenge = watch('challenge', '');
  const watchResult = watch('result', '');

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
    setShowErrors(false);
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
        router.refresh();
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

  const onError = () => {
    setShowErrors(true);
  };

  // Solution helpers
  const addSolutionItem = () => setSolution([...solution, '']);
  const removeSolutionItem = (idx: number) => setSolution(solution.filter((_, i) => i !== idx));
  const updateSolutionItem = (idx: number, val: string) => {
    const updated = [...solution];
    updated[idx] = val;
    setSolution(updated);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 max-w-4xl">
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

      <FormErrorSummary errorCount={errorCount} show={showErrors} />

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Basic Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Title" required error={errors.title?.message}
            counter={<CharacterCounter current={watchTitle?.length || 0} max={CHAR_LIMITS.title} />}>
            <input
              {...register('title', requiredMaxLength(CHAR_LIMITS.title))}
              maxLength={CHAR_LIMITS.title}
              className={inputClass(!!errors.title)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Location" required error={errors.location?.message}
            counter={<CharacterCounter current={watchLocation?.length || 0} max={CHAR_LIMITS.title} />}>
            <input
              {...register('location', requiredMaxLength(CHAR_LIMITS.title))}
              maxLength={CHAR_LIMITS.title}
              className={inputClass(!!errors.location)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
        </div>

        <div>
          <ImageUploadField
            label="Visual / Hero Image"
            value={visual}
            onChange={setVisual}
            folder="case-studies"
          />
          <p className="text-gray-400 text-xs mt-1 italic" style={{ fontFamily: 'system-ui' }}>{HELP_TEXT.heroImage}</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Content</h2>

        <FormField label="Challenge" required error={errors.challenge?.message}
          counter={<CharacterCounter current={watchChallenge?.length || 0} max={CHAR_LIMITS.longText} />}>
          <textarea
            {...register('challenge', requiredMaxLength(CHAR_LIMITS.longText))}
            maxLength={CHAR_LIMITS.longText}
            rows={4}
            className={`${inputClass(!!errors.challenge)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'system-ui' }}>
            Solution (bullet points)<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {solution.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateSolutionItem(idx, e.target.value)}
                  maxLength={CHAR_LIMITS.tagline}
                  className={inputClass()}
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

        <FormField label="Result" required error={errors.result?.message}
          counter={<CharacterCounter current={watchResult?.length || 0} max={CHAR_LIMITS.longText} />}>
          <textarea
            {...register('result', requiredMaxLength(CHAR_LIMITS.longText))}
            maxLength={CHAR_LIMITS.longText}
            rows={4}
            className={`${inputClass(!!errors.result)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>
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
                    maxLength={CHAR_LIMITS.title}
                    placeholder="e.g. Cost Savings"
                    className={inputClass()}
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Value</label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => { const u = [...metrics]; u[idx] = { ...u[idx], value: e.target.value }; setMetrics(u); }}
                    maxLength={CHAR_LIMITS.title}
                    placeholder="e.g. 40%"
                    className={inputClass()}
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
