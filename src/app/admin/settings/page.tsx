'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Loader2, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

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

  // Controlled image state for SEO images
  const [ogImage, setOgImage] = useState('');
  const [twitterImage, setTwitterImage] = useState('');

  // Navigation links state
  const [navLinks, setNavLinks] = useState<{ label: string; href: string }[]>([]);

  const { register, handleSubmit, reset } = useForm<SettingsData>();

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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Site Settings</h1>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] text-sm disabled:opacity-50" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input {...register('companyName')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('companyFullName')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input {...register('tagline')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Tagline</label>
            <input {...register('subTagline')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value Proposition</label>
            <input {...register('valueProposition')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Company</label>
              <input {...register('parentCompanyName')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
              <input {...register('parentCompanyYear')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
            <input {...register('bannerText')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
            <input {...register('copyrightText')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('contactEmail')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('contactPhone')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone 1</label>
              <input {...register('emergencyPhone1')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone 2</label>
              <input {...register('emergencyPhone2')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea {...register('contactAddress')} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
            <input {...register('businessHours')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
        </div>
      )}

      {/* Footer Tab */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer CTA Heading</label>
            <input
              {...register('footerCta')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{ fontFamily: 'system-ui' }}
              placeholder="e.g. Ready to start your project?"
            />
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'system-ui' }}>The call-to-action heading displayed in the site footer.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Description</label>
            <textarea
              {...register('footerDescription')}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
              style={{ fontFamily: 'system-ui' }}
              placeholder="A short description or tagline shown in the footer..."
            />
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'system-ui' }}>Supporting text displayed below the footer CTA heading.</p>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
            <input {...register('siteTitle')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
            <textarea {...register('siteDescription')} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y" style={{ fontFamily: 'system-ui' }} />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4" style={{ fontFamily: 'system-ui' }}>Social Share Images</h3>
            <div className="grid grid-cols-2 gap-6">
              <ImageUploadField
                label="OG Image"
                value={ogImage}
                onChange={setOgImage}
                folder="seo"
              />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input {...register('socialLinkedIn')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input {...register('socialFacebook')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
            <input {...register('socialInstagram')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" style={{ fontFamily: 'system-ui' }} />
          </div>
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
                  placeholder="Label"
                  className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{ fontFamily: 'system-ui' }}
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateNavLink(index, 'href', e.target.value)}
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
