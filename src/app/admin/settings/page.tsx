'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Loader2, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { CharacterCounter } from '@/components/admin/CharacterCounter';
import { FormField } from '@/components/admin/FormField';
import { FormErrorSummary } from '@/components/admin/FormErrorSummary';
import {
  CHAR_LIMITS,
  HELP_TEXT,
  requiredMaxLength,
  optionalMaxLength,
  emailRules,
  phoneRules,
  urlRules,
  inputClass,
} from '@/lib/form-validation';

interface SettingsData {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;
  siteTitle: string;
  siteDescription: string;
  companyName: string;
  companyFullName: string;
  tagline: string;
  subTagline: string;
  valueProposition: string;
  emergencyPhone1: string;
  emergencyPhone2: string;
  parentCompanyName: string;
  parentCompanyYear: string;
  socialLinkedIn: string;
  socialFacebook: string;
  socialInstagram: string;
  copyrightText: string;
  bannerText: string;
  footerCta: string;
  footerDescription: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [showErrors, setShowErrors] = useState(false);

  // Controlled image state for SEO images
  const [ogImage, setOgImage] = useState('');
  const [twitterImage, setTwitterImage] = useState('');

  // Navigation links state
  const [navLinks, setNavLinks] = useState<{ label: string; href: string }[]>([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SettingsData>();

  const watchCompanyName = watch('companyName', '');
  const watchCompanyFullName = watch('companyFullName', '');
  const watchTagline = watch('tagline', '');
  const watchSubTagline = watch('subTagline', '');
  const watchValueProp = watch('valueProposition', '');
  const watchBannerText = watch('bannerText', '');
  const watchCopyright = watch('copyrightText', '');
  const watchContactEmail = watch('contactEmail', '');
  const watchContactPhone = watch('contactPhone', '');
  const watchEmPhone1 = watch('emergencyPhone1', '');
  const watchEmPhone2 = watch('emergencyPhone2', '');
  const watchAddress = watch('contactAddress', '');
  const watchHours = watch('businessHours', '');
  const watchFooterCta = watch('footerCta', '');
  const watchFooterDesc = watch('footerDescription', '');
  const watchSiteTitle = watch('siteTitle', '');
  const watchSiteDesc = watch('siteDescription', '');
  const watchLinkedIn = watch('socialLinkedIn', '');
  const watchFacebook = watch('socialFacebook', '');
  const watchInstagram = watch('socialInstagram', '');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          reset(data.data);
          setOgImage(data.data.ogImage || '');
          setTwitterImage(data.data.twitterImage || '');
          setNavLinks(data.data.navigationLinks || [
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: 'Projects', href: '/projects' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ]);
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SettingsData) => {
    setShowErrors(false);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ogImage, twitterImage, navigationLinks: navLinks }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Settings saved!');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const onError = () => {
    setShowErrors(true);
  };

  const tabs = [
    { key: 'company', label: 'Company Info' },
    { key: 'contact', label: 'Contact' },
    { key: 'footer', label: 'Footer' },
    { key: 'seo', label: 'SEO Defaults' },
    { key: 'social', label: 'Social Media' },
    { key: 'navigation', label: 'Navigation' },
  ];

  const moveNavLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...navLinks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;
    [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    setNavLinks(newLinks);
  };

  const updateNavLink = (index: number, field: 'label' | 'href', value: string) => {
    const newLinks = [...navLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setNavLinks(newLinks);
  };

  const removeNavLink = (index: number) => {
    setNavLinks(navLinks.filter((_, i) => i !== index));
  };

  const addNavLink = () => {
    setNavLinks([...navLinks, { label: '', href: '/' }]);
  };

  const errorCount = Object.keys(errors).length;

  if (loading) return <div className="text-center py-12 text-gray-500">Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Site Settings</h1>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] text-sm disabled:opacity-50" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <FormErrorSummary errorCount={errorCount} show={showErrors} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeTab === tab.key ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={{ fontFamily: 'system-ui', textTransform: 'none' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Company Name" required error={errors.companyName?.message}
              counter={<CharacterCounter current={watchCompanyName?.length || 0} max={CHAR_LIMITS.title} />}>
              <input
                {...register('companyName', requiredMaxLength(CHAR_LIMITS.title))}
                maxLength={CHAR_LIMITS.title}
                className={inputClass(!!errors.companyName)}
                style={{ fontFamily: 'system-ui' }}
              />
            </FormField>
            <FormField label="Full Name"
              counter={<CharacterCounter current={watchCompanyFullName?.length || 0} max={CHAR_LIMITS.tagline} />}>
              <input
                {...register('companyFullName', optionalMaxLength(CHAR_LIMITS.tagline))}
                maxLength={CHAR_LIMITS.tagline}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </FormField>
          </div>
          <FormField label="Tagline"
            counter={<CharacterCounter current={watchTagline?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <input
              {...register('tagline', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Sub Tagline"
            counter={<CharacterCounter current={watchSubTagline?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <input
              {...register('subTagline', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Value Proposition"
            counter={<CharacterCounter current={watchValueProp?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <input
              {...register('valueProposition', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Parent Company"
              counter={<CharacterCounter current={watch('parentCompanyName', '')?.length || 0} max={CHAR_LIMITS.title} />}>
              <input
                {...register('parentCompanyName', optionalMaxLength(CHAR_LIMITS.title))}
                maxLength={CHAR_LIMITS.title}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </FormField>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
              <input
                {...register('parentCompanyYear')}
                className={inputClass()}
                style={{ fontFamily: 'system-ui' }}
              />
            </div>
          </div>
          <FormField label="Banner Text"
            counter={<CharacterCounter current={watchBannerText?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <input
              {...register('bannerText', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Copyright Text"
            counter={<CharacterCounter current={watchCopyright?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <input
              {...register('copyrightText', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <FormField label="Email" required error={errors.contactEmail?.message}
            counter={<CharacterCounter current={watchContactEmail?.length || 0} max={CHAR_LIMITS.email} />}>
            <input
              {...register('contactEmail', emailRules(true))}
              maxLength={CHAR_LIMITS.email}
              className={inputClass(!!errors.contactEmail)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Phone" required error={errors.contactPhone?.message}
            counter={<CharacterCounter current={watchContactPhone?.length || 0} max={CHAR_LIMITS.phone} />}>
            <input
              {...register('contactPhone', phoneRules(true))}
              maxLength={CHAR_LIMITS.phone}
              className={inputClass(!!errors.contactPhone)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Emergency Phone 1" error={errors.emergencyPhone1?.message}
              counter={<CharacterCounter current={watchEmPhone1?.length || 0} max={CHAR_LIMITS.phone} />}>
              <input
                {...register('emergencyPhone1', phoneRules())}
                maxLength={CHAR_LIMITS.phone}
                className={inputClass(!!errors.emergencyPhone1)}
                style={{ fontFamily: 'system-ui' }}
              />
            </FormField>
            <FormField label="Emergency Phone 2" error={errors.emergencyPhone2?.message}
              counter={<CharacterCounter current={watchEmPhone2?.length || 0} max={CHAR_LIMITS.phone} />}>
              <input
                {...register('emergencyPhone2', phoneRules())}
                maxLength={CHAR_LIMITS.phone}
                className={inputClass(!!errors.emergencyPhone2)}
                style={{ fontFamily: 'system-ui' }}
              />
            </FormField>
          </div>
          <FormField label="Address"
            counter={<CharacterCounter current={watchAddress?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <textarea
              {...register('contactAddress', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              rows={2}
              className={`${inputClass()} resize-y`}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Business Hours"
            counter={<CharacterCounter current={watchHours?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <input
              {...register('businessHours', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
        </div>
      )}

      {/* Footer Tab */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <FormField label="Footer CTA Heading"
            counter={<CharacterCounter current={watchFooterCta?.length || 0} max={CHAR_LIMITS.tagline} />}>
            <input
              {...register('footerCta', optionalMaxLength(CHAR_LIMITS.tagline))}
              maxLength={CHAR_LIMITS.tagline}
              className={inputClass()}
              style={{ fontFamily: 'system-ui' }}
              placeholder="e.g. Ready to start your project?"
            />
            <p className="text-xs text-gray-400 mt-1 italic" style={{ fontFamily: 'system-ui' }}>The call-to-action heading displayed in the site footer.</p>
          </FormField>
          <FormField label="Footer Description"
            counter={<CharacterCounter current={watchFooterDesc?.length || 0} max={CHAR_LIMITS.longText} />}>
            <textarea
              {...register('footerDescription', optionalMaxLength(CHAR_LIMITS.longText))}
              maxLength={CHAR_LIMITS.longText}
              rows={4}
              className={`${inputClass()} resize-y`}
              style={{ fontFamily: 'system-ui' }}
              placeholder="A short description or tagline shown in the footer..."
            />
            <p className="text-xs text-gray-400 mt-1 italic" style={{ fontFamily: 'system-ui' }}>Supporting text displayed below the footer CTA heading.</p>
          </FormField>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <FormField label="Site Title" error={errors.siteTitle?.message} helpText={HELP_TEXT.metaTitle}
            counter={<CharacterCounter current={watchSiteTitle?.length || 0} max={CHAR_LIMITS.metaTitle} />}>
            <input
              {...register('siteTitle', optionalMaxLength(CHAR_LIMITS.metaTitle))}
              maxLength={CHAR_LIMITS.metaTitle}
              className={inputClass(!!errors.siteTitle)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Site Description" error={errors.siteDescription?.message} helpText={HELP_TEXT.metaDescription}
            counter={<CharacterCounter current={watchSiteDesc?.length || 0} max={CHAR_LIMITS.metaDescription} />}>
            <textarea
              {...register('siteDescription', optionalMaxLength(CHAR_LIMITS.metaDescription))}
              maxLength={CHAR_LIMITS.metaDescription}
              rows={3}
              className={`${inputClass(!!errors.siteDescription)} resize-y`}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4" style={{ fontFamily: 'system-ui' }}>Social Share Images</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <ImageUploadField
                  label="OG Image"
                  value={ogImage}
                  onChange={setOgImage}
                  folder="seo"
                />
                <p className="text-gray-400 text-xs mt-1 italic" style={{ fontFamily: 'system-ui' }}>{HELP_TEXT.ogImage}</p>
              </div>
              <ImageUploadField
                label="Twitter Image"
                value={twitterImage}
                onChange={setTwitterImage}
                folder="seo"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3" style={{ fontFamily: 'system-ui' }}>
              Recommended: 1200x630px for OG image, 1200x600px for Twitter card
            </p>
          </div>
        </div>
      )}

      {/* Social Tab */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <FormField label="LinkedIn URL" error={errors.socialLinkedIn?.message}
            counter={<CharacterCounter current={watchLinkedIn?.length || 0} max={CHAR_LIMITS.url} />}>
            <input
              {...register('socialLinkedIn', urlRules())}
              maxLength={CHAR_LIMITS.url}
              className={inputClass(!!errors.socialLinkedIn)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Facebook URL" error={errors.socialFacebook?.message}
            counter={<CharacterCounter current={watchFacebook?.length || 0} max={CHAR_LIMITS.url} />}>
            <input
              {...register('socialFacebook', urlRules())}
              maxLength={CHAR_LIMITS.url}
              className={inputClass(!!errors.socialFacebook)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
          <FormField label="Instagram URL" error={errors.socialInstagram?.message}
            counter={<CharacterCounter current={watchInstagram?.length || 0} max={CHAR_LIMITS.url} />}>
            <input
              {...register('socialInstagram', urlRules())}
              maxLength={CHAR_LIMITS.url}
              className={inputClass(!!errors.socialInstagram)}
              style={{ fontFamily: 'system-ui' }}
            />
          </FormField>
        </div>
      )}

      {/* Navigation Tab */}
      {activeTab === 'navigation' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'system-ui' }}>Navigation Links</h3>
            <p className="text-xs text-gray-400" style={{ fontFamily: 'system-ui' }}>Controls site navigation menu order and labels</p>
          </div>

          <div className="space-y-2">
            {navLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveNavLink(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveNavLink(index, 'down')}
                    disabled={index === navLinks.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateNavLink(index, 'label', e.target.value)}
                  maxLength={CHAR_LIMITS.keyword}
                  placeholder="Label"
                  className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{ fontFamily: 'system-ui' }}
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateNavLink(index, 'href', e.target.value)}
                  maxLength={CHAR_LIMITS.url}
                  placeholder="/path"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{ fontFamily: 'system-ui' }}
                />
                <button
                  type="button"
                  onClick={() => removeNavLink(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addNavLink}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors w-full justify-center"
            style={{ fontFamily: 'system-ui' }}
          >
            <Plus size={14} />
            Add Link
          </button>
        </div>
      )}
    </form>
  );
}
