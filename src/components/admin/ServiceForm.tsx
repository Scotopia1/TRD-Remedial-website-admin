'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface ServiceFormData {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  benefits: string[];
  icon: string;
  visual: string;
  heroImage: string;
  featureImage: string;
  processImage: string;
  stats: { value: string; label: string }[];
  process: { step: number; title: string; description: string; image?: string }[];
  order: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  commonApplications: string;
  whyChooseTRD: string;
  serviceArea: string;
  relatedServiceSlugs: string;
  detailPage: string;
}

interface ServiceFormProps {
  serviceId?: string;
}

function ArrayField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const addItem = () => onChange([...items, '']);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, val: string) => {
    const updated = [...items];
    updated[idx] = val;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui', fontSize: '0.875rem' }}
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-2 text-gray-400 hover:text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <Plus size={12} /> Add {label.toLowerCase().replace(/s$/, '')}
      </button>
    </div>
  );
}

export function ServiceForm({ serviceId }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [stats, setStats] = useState<{ value: string; label: string }[]>([]);
  const [processSteps, setProcessSteps] = useState<{ step: number; title: string; description: string; image?: string }[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [testimonials, setTestimonials] = useState<{ quote: string; role: string; company: string }[]>([]);

  // Controlled image state
  const [icon, setIcon] = useState('');
  const [visual, setVisual] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [featureImage, setFeatureImage] = useState('');
  const [processImage, setProcessImage] = useState('');

  const isEdit = !!serviceId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormData>();

  useEffect(() => {
    if (serviceId) {
      fetch(`/api/admin/services/${serviceId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const s = data.data;
            reset({
              slug: s.slug,
              title: s.title,
              tagline: s.tagline,
              description: s.description,
              order: s.order || 0,
              isActive: s.isActive ?? true,
              metaTitle: s.metaTitle || '',
              metaDescription: s.metaDescription || '',
              commonApplications: s.commonApplications || '',
              whyChooseTRD: s.whyChooseTRD || '',
              serviceArea: s.serviceArea || '',
              relatedServiceSlugs: Array.isArray(s.relatedServiceSlugs) ? s.relatedServiceSlugs.join(', ') : (s.relatedServiceSlugs || ''),
              detailPage: s.detailPage || '',
            });
            setIcon(s.icon || '');
            setVisual(s.visual || '');
            setHeroImage(s.heroImage || '');
            setFeatureImage(s.featureImage || '');
            setProcessImage(s.processImage || '');
            setFeatures(s.features || []);
            setBenefits(s.benefits || []);
            setStats(s.stats || []);
            setProcessSteps(s.process || []);
            setFaqs(s.faqs || []);
            setTestimonials(s.testimonials || []);
          }
        })
        .catch(() => toast.error('Failed to load service'));
    }
  }, [serviceId, reset]);

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        features,
        benefits,
        icon,
        visual,
        heroImage,
        featureImage,
        processImage,
        stats: stats.length > 0 ? stats : null,
        process: processSteps.length > 0 ? processSteps : null,
        faqs: faqs.length > 0 ? faqs : null,
        testimonials: testimonials.length > 0 ? testimonials : null,
        relatedServiceSlugs: data.relatedServiceSlugs
          ? data.relatedServiceSlugs.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const url = isEdit ? `/api/admin/services/${serviceId}` : '/api/admin/services';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(isEdit ? 'Service updated!' : 'Service created!');
        router.push('/admin/services');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Stats helpers
  const addStat = () => setStats([...stats, { value: '', label: '' }]);
  const removeStat = (idx: number) => setStats(stats.filter((_, i) => i !== idx));
  const updateStat = (idx: number, field: 'value' | 'label', val: string) => {
    const updated = [...stats];
    updated[idx] = { ...updated[idx], [field]: val };
    setStats(updated);
  };

  // Process steps helpers
  const addStep = () => setProcessSteps([...processSteps, { step: processSteps.length + 1, title: '', description: '', image: '' }]);
  const removeStep = (idx: number) => {
    const updated = processSteps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
    setProcessSteps(updated);
  };
  const updateStep = (idx: number, field: 'title' | 'description' | 'image', val: string) => {
    const updated = [...processSteps];
    updated[idx] = { ...updated[idx], [field]: val };
    setProcessSteps(updated);
  };

  // FAQ helpers
  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, field: 'question' | 'answer', val: string) => {
    const updated = [...faqs];
    updated[idx] = { ...updated[idx], [field]: val };
    setFaqs(updated);
  };

  // Testimonial helpers
  const addTestimonial = () => setTestimonials([...testimonials, { quote: '', role: '', company: '' }]);
  const removeTestimonial = (idx: number) => setTestimonials(testimonials.filter((_, i) => i !== idx));
  const updateTestimonial = (idx: number, field: 'quote' | 'role' | 'company', val: string) => {
    const updated = [...testimonials];
    updated[idx] = { ...updated[idx], [field]: val };
    setTestimonials(updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/services')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
            {isEdit ? 'Edit Service' : 'New Service'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
          style={{ textTransform: 'none', fontFamily: 'system-ui' }}
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              {...register('slug', { required: 'Slug is required' })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{ fontFamily: 'system-ui' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
          <input
            {...register('tagline', { required: 'Tagline is required' })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
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

      {/* Features & Benefits */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Features & Benefits</h2>

        <div className="grid grid-cols-2 gap-6">
          <ArrayField label="Features" items={features} onChange={setFeatures} />
          <ArrayField label="Benefits" items={benefits} onChange={setBenefits} />
        </div>
      </div>

      {/* Images & Visuals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Images & Visuals</h2>

        <div className="grid grid-cols-2 gap-6">
          <ImageUploadField
            label="Icon Image"
            value={icon}
            onChange={setIcon}
            folder="services"
          />
          <ImageUploadField
            label="Visual / Card Image"
            value={visual}
            onChange={setVisual}
            folder="services"
          />
          <ImageUploadField
            label="Hero Image"
            value={heroImage}
            onChange={setHeroImage}
            folder="services"
          />
          <ImageUploadField
            label="Feature Image"
            value={featureImage}
            onChange={setFeatureImage}
            folder="services"
          />
        </div>

        <ImageUploadField
          label="Process Image"
          value={processImage}
          onChange={setProcessImage}
          folder="services"
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
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                    placeholder="e.g. 500+"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                    placeholder="e.g. Projects Completed"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
              </div>
              <button type="button" onClick={() => removeStat(idx)} className="mt-6 p-2 text-gray-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addStat} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <Plus size={12} /> Add stat
          </button>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Process Steps</h2>
        <div className="space-y-4">
          {processSteps.map((step, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Step {step.step}</span>
                <button type="button" onClick={() => removeStep(idx)} className="p-1 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-[1fr_180px] gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                      style={{ fontFamily: 'system-ui' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
                      style={{ fontFamily: 'system-ui' }}
                    />
                  </div>
                </div>
                <ImageUploadField
                  label="Step Image"
                  value={step.image || ''}
                  onChange={(url) => updateStep(idx, 'image', url)}
                  folder="services/process"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addStep} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <Plus size={12} /> Add step
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>FAQs</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">FAQ {idx + 1}</span>
                <button type="button" onClick={() => removeFaq(idx)} className="p-1 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{ fontFamily: 'system-ui' }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Answer</label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
                  style={{ fontFamily: 'system-ui' }}
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addFaq} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <Plus size={12} /> Add FAQ
          </button>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Testimonials</h2>
        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Testimonial {idx + 1}</span>
                <button type="button" onClick={() => removeTestimonial(idx)} className="p-1 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quote</label>
                <textarea
                  value={t.quote}
                  onChange={(e) => updateTestimonial(idx, 'quote', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
                  style={{ fontFamily: 'system-ui' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role</label>
                  <input
                    type="text"
                    value={t.role}
                    onChange={(e) => updateTestimonial(idx, 'role', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Company</label>
                  <input
                    type="text"
                    value={t.company}
                    onChange={(e) => updateTestimonial(idx, 'company', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addTestimonial} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <Plus size={12} /> Add testimonial
          </button>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>SEO & Content</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
          <input
            {...register('metaTitle')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea
            {...register('metaDescription')}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Common Applications</label>
          <textarea
            {...register('commonApplications')}
            rows={6}
            placeholder="Describe typical applications for this service..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Why Choose TRD</label>
          <textarea
            {...register('whyChooseTRD')}
            rows={6}
            placeholder="Explain why clients should choose TRD for this service..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
          <textarea
            {...register('serviceArea')}
            rows={4}
            placeholder="Describe the geographic service area..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
      </div>

      {/* Related Services & Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>Related Services & Links</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Related Service Slugs (comma-separated)</label>
          <input
            {...register('relatedServiceSlugs')}
            placeholder="structural-alterations, crack-injection"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Detail Page URL</label>
          <input
            {...register('detailPage')}
            placeholder="/services/structural-strengthening"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
      </div>
    </form>
  );
}
