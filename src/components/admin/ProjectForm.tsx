'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { MultiImageUploadField } from './MultiImageUploadField';

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
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

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Basic Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input {...register('slug', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input {...register('location', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="text" {...register('date', { required: true })} placeholder="e.g., 2026 or June 23, 2025" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select {...register('serviceId', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" style={{ fontFamily: 'system-ui' }}>
              <option value="">Select service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <input {...register('serviceType', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma-separated)</label>
            <input {...register('categories')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} placeholder="Commercial, Structural" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
          <input {...register('tagline', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Project Content</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
          <textarea {...register('challenge', { required: true })} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
          <textarea {...register('solution', { required: true })} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
          <textarea {...register('results', { required: true })} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
            <input {...register('timeline')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <input {...register('budget')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
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
          <ImageUploadField
            label="Hero Image"
            value={heroImage}
            onChange={setHeroImage}
            folder="projects"
          />
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
                    placeholder="e.g. 3 months"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => { const u = [...stats]; u[idx] = { ...u[idx], label: e.target.value }; setStats(u); }}
                    placeholder="e.g. Project Duration"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
              style={{ fontFamily: 'system-ui' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={testimonial.author}
                onChange={(e) => setTestimonial({ ...testimonial, author: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={testimonial.role}
                onChange={(e) => setTestimonial({ ...testimonial, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={testimonial.company}
                onChange={(e) => setTestimonial({ ...testimonial, company: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
          <p className="text-xs text-gray-400 mt-1">Enter one project slug per line. These will be linked as related projects.</p>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>SEO</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
          <input {...register('metaTitle')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea {...register('metaDescription')} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
        </div>
      </div>
    </form>
  );
}
