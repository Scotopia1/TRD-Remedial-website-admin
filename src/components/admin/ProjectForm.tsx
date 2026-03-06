'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { MultiImageUploadField } from './MultiImageUploadField';
import { CharacterCounter } from './CharacterCounter';
import { FormField } from './FormField';
import { FormErrorSummary } from './FormErrorSummary';
import {
  CHAR_LIMITS,
  HELP_TEXT,
  MESSAGES,
  requiredMaxLength,
  optionalMaxLength,
  slugRules,
  inputClass,
  generateSlug,
} from '@/lib/form-validation';

interface ProjectFormData {
  slug: string;
  name: string;
  location: string;
  date: string;
  serviceType: string;
  serviceId: string;
  categories: string;
  tagline: string;
  challenge: string;
  solution: string;
  results: string;
  timeline: string;
  budget: string;
  order: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}

interface ServiceOption {
  id: string;
  title: string;
  slug: string;
}

export function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  // Controlled image state
  const [featuredImage, setFeaturedImage] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // JSON field state
  const [galleryImages, setGalleryImages] = useState<{ url: string; alt: string; caption?: string }[]>([]);
  const [stats, setStats] = useState<{ value: string; label: string }[]>([]);
  const [relatedProjectSlugs, setRelatedProjectSlugs] = useState('');
  const [testimonial, setTestimonial] = useState({ quote: '', author: '', role: '', company: '' });
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [beforeImageAlt, setBeforeImageAlt] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [afterImageAlt, setAfterImageAlt] = useState('');

  const isEdit = !!projectId;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProjectFormData>();

  const watchName = watch('name', '');
  const watchSlug = watch('slug', '');
  const watchTagline = watch('tagline', '');
  const watchChallenge = watch('challenge', '');
  const watchSolution = watch('solution', '');
  const watchResults = watch('results', '');
  const watchMetaTitle = watch('metaTitle', '');
  const watchMetaDescription = watch('metaDescription', '');

  // Auto-generate slug from name (only when creating new)
  useEffect(() => {
    if (!isEdit && watchName) {
      setValue('slug', generateSlug(watchName));
    }
  }, [watchName, isEdit, setValue]);

  useEffect(() => {
    // Load services for dropdown
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      });

    if (projectId) {
      fetch(`/api/admin/projects/${projectId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const p = data.data;
            reset({
              slug: p.slug,
              name: p.name,
              location: p.location,
              date: p.date || '',
              serviceType: p.serviceType,
              serviceId: p.serviceId,
              categories: (p.categories || []).join(', '),
              tagline: p.tagline,
              challenge: p.challenge,
              solution: p.solution,
              results: p.results,
              timeline: p.timeline || '',
              budget: p.budget || '',
              order: p.order || 0,
              isActive: p.isActive ?? true,
              metaTitle: p.metaTitle || '',
              metaDescription: p.metaDescription || '',
            });
            setFeaturedImage(p.featuredImage || '');
            setThumbnailImage(p.thumbnailImage || '');
            setHeroImage(p.heroImage || '');
            setGalleryImages(p.galleryImages || []);
            setStats(p.stats || []);
            if (p.testimonial) setTestimonial(p.testimonial);
            if (p.beforeImage) {
              setBeforeImageUrl(p.beforeImage.url || '');
              setBeforeImageAlt(p.beforeImage.alt || '');
            }
            if (p.afterImage) {
              setAfterImageUrl(p.afterImage.url || '');
              setAfterImageAlt(p.afterImage.alt || '');
            }
            if (p.relatedProjects && Array.isArray(p.relatedProjects)) {
              setRelatedProjectSlugs(p.relatedProjects.map((rp: { slug: string }) => rp.slug).join('\n'));
            }
          }
        });
    }
  }, [projectId, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setShowErrors(false);
    setLoading(true);
    try {
      const payload = {
        ...data,
        featuredImage,
        thumbnailImage,
        heroImage,
        categories: data.categories.split(',').map((c) => c.trim()).filter(Boolean),
        galleryImages: galleryImages.length > 0 ? galleryImages : null,
        stats: stats.length > 0 ? stats : null,
        testimonial: testimonial.quote ? testimonial : null,
        beforeImage: beforeImageUrl ? { url: beforeImageUrl, alt: beforeImageAlt } : null,
        afterImage: afterImageUrl ? { url: afterImageUrl, alt: afterImageAlt } : null,
        relatedProjectSlugs: relatedProjectSlugs.split('\n').map((s) => s.trim()).filter(Boolean),
      };

      const url = isEdit ? `/api/admin/projects/${projectId}` : '/api/admin/projects';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? 'Project updated!' : 'Project created!');
        router.refresh();
        router.push('/admin/projects');
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
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin/projects')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
            {isEdit ? 'Edit Project' : 'New Project'}
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
          <FormField label="Project Name" required error={errors.name?.message}
            counter={<CharacterCounter current={watchName?.length || 0} max={CHAR_LIMITS.name} />}>
            <input
              {...register('name', requiredMaxLength(CHAR_LIMITS.name))}
              maxLength={CHAR_LIMITS.name}
              className={inputClass(!!errors.name)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message} helpText={HELP_TEXT.slug}
            counter={<CharacterCounter current={watchSlug?.length || 0} max={CHAR_LIMITS.slug} />}>
            <input
              {...register('slug', slugRules())}
              maxLength={CHAR_LIMITS.slug}
              className={inputClass(!!errors.slug)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Location" required error={errors.location?.message}>
            <input
              {...register('location', { required: MESSAGES.required })}
              className={inputClass(!!errors.location)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Date" required error={errors.date?.message}>
            <input
              type="text"
              {...register('date', { required: MESSAGES.required })}
              placeholder="e.g., 2026 or June 23, 2025"
              className={inputClass(!!errors.date)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Service" required error={errors.serviceId?.message}>
            <select
              {...register('serviceId', { required: MESSAGES.required })}
              className={`${inputClass(!!errors.serviceId)} bg-white`}
              style={{ fontFamily: 'system-ui' }}
            >
              <option value="">Select service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Service Type" required error={errors.serviceType?.message}>
            <input
              {...register('serviceType', { required: MESSAGES.required })}
              className={inputClass(!!errors.serviceType)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma-separated)</label>
            <input
              {...register('categories')}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
              placeholder="Commercial, Structural"
            />
          </div>
        </div>

        <FormField label="Tagline" required error={errors.tagline?.message} helpText={HELP_TEXT.shortDescription}
          counter={<CharacterCounter current={watchTagline?.length || 0} max={CHAR_LIMITS.tagline} />}>
          <input
            {...register('tagline', requiredMaxLength(CHAR_LIMITS.tagline))}
            maxLength={CHAR_LIMITS.tagline}
            className={inputClass(!!errors.tagline)}
            style={{ fontFamily: 'system-ui' }}
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

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Project Content</h2>

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
        <FormField label="Solution" required error={errors.solution?.message}
          counter={<CharacterCounter current={watchSolution?.length || 0} max={CHAR_LIMITS.longText} />}>
          <textarea
            {...register('solution', requiredMaxLength(CHAR_LIMITS.longText))}
            maxLength={CHAR_LIMITS.longText}
            rows={4}
            className={`${inputClass(!!errors.solution)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>
        <FormField label="Results" required error={errors.results?.message}
          counter={<CharacterCounter current={watchResults?.length || 0} max={CHAR_LIMITS.longText} />}>
          <textarea
            {...register('results', requiredMaxLength(CHAR_LIMITS.longText))}
            maxLength={CHAR_LIMITS.longText}
            rows={4}
            className={`${inputClass(!!errors.results)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
            <input
              {...register('timeline')}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <input
              {...register('budget')}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Images</h2>

        <div className="grid grid-cols-3 gap-6">
          <ImageUploadField
            label="Featured Image"
            value={featuredImage}
            onChange={setFeaturedImage}
            folder="projects"
          />
          <ImageUploadField
            label="Thumbnail Image"
            value={thumbnailImage}
            onChange={setThumbnailImage}
            folder="projects"
          />
          <div>
            <ImageUploadField
              label="Hero Image"
              value={heroImage}
              onChange={setHeroImage}
              folder="projects"
            />
            <p className="text-gray-400 text-xs mt-1 italic" style={{ fontFamily: 'system-ui' }}>{HELP_TEXT.heroImage}</p>
          </div>
        </div>
      </div>

      {/* Gallery Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Gallery Images</h2>
        <MultiImageUploadField
          label="Project Gallery"
          images={galleryImages}
          onChange={setGalleryImages}
          folder="projects/gallery"
        />
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Stats</h2>
        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => { const u = [...stats]; u[idx] = { ...u[idx], value: e.target.value }; setStats(u); }}
                    maxLength={CHAR_LIMITS.title}
                    placeholder="e.g. 3 months"
                    className={inputClass()}
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => { const u = [...stats]; u[idx] = { ...u[idx], label: e.target.value }; setStats(u); }}
                    maxLength={CHAR_LIMITS.title}
                    placeholder="e.g. Project Duration"
                    className={inputClass()}
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
              </div>
              <button type="button" onClick={() => setStats(stats.filter((_, i) => i !== idx))} className="mt-6 p-2 text-gray-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setStats([...stats, { value: '', label: '' }])} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <Plus size={12} /> Add stat
          </button>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Testimonial</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
            <textarea
              value={testimonial.quote}
              onChange={(e) => setTestimonial({ ...testimonial, quote: e.target.value })}
              maxLength={CHAR_LIMITS.quote}
              rows={3}
              className={`${inputClass()} resize-y`}
              style={{ fontFamily: 'system-ui' }}
            />
            <div className="mt-1">
              <CharacterCounter current={testimonial.quote.length} max={CHAR_LIMITS.quote} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={testimonial.author}
                onChange={(e) => setTestimonial({ ...testimonial, author: e.target.value })}
                maxLength={CHAR_LIMITS.name}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={testimonial.role}
                onChange={(e) => setTestimonial({ ...testimonial, role: e.target.value })}
                maxLength={CHAR_LIMITS.title}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={testimonial.company}
                onChange={(e) => setTestimonial({ ...testimonial, company: e.target.value })}
                maxLength={CHAR_LIMITS.title}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Before / After Images</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <ImageUploadField
              label="Before Image"
              value={beforeImageUrl}
              onChange={setBeforeImageUrl}
              folder="projects/before-after"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alt Text</label>
              <input
                type="text"
                value={beforeImageAlt}
                onChange={(e) => setBeforeImageAlt(e.target.value)}
                maxLength={CHAR_LIMITS.tagline}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <ImageUploadField
              label="After Image"
              value={afterImageUrl}
              onChange={setAfterImageUrl}
              folder="projects/before-after"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alt Text</label>
              <input
                type="text"
                value={afterImageAlt}
                onChange={(e) => setAfterImageAlt(e.target.value)}
                maxLength={CHAR_LIMITS.tagline}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Related Projects</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Related Project Slugs (one per line)</label>
          <textarea
            value={relatedProjectSlugs}
            onChange={(e) => setRelatedProjectSlugs(e.target.value)}
            rows={4}
            placeholder={"concrete-restoration-downtown\nstructural-repair-westside"}
            className={`${inputClass()} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
          <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'system-ui' }}>Enter one project slug per line. These will be linked as related projects.</p>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>SEO</h2>

        <FormField label="Meta Title" error={errors.metaTitle?.message} helpText={HELP_TEXT.metaTitle}
          counter={<CharacterCounter current={watchMetaTitle?.length || 0} max={CHAR_LIMITS.metaTitle} />}>
          <input
            {...register('metaTitle', optionalMaxLength(CHAR_LIMITS.metaTitle))}
            maxLength={CHAR_LIMITS.metaTitle}
            className={inputClass(!!errors.metaTitle)}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>
        <FormField label="Meta Description" error={errors.metaDescription?.message} helpText={HELP_TEXT.metaDescription}
          counter={<CharacterCounter current={watchMetaDescription?.length || 0} max={CHAR_LIMITS.metaDescription} />}>
          <textarea
            {...register('metaDescription', optionalMaxLength(CHAR_LIMITS.metaDescription))}
            maxLength={CHAR_LIMITS.metaDescription}
            rows={2}
            className={`${inputClass(!!errors.metaDescription)} resize-y`}
            style={{ fontFamily: 'system-ui' }}
          />
        </FormField>
      </div>
    </form>
  );
}
