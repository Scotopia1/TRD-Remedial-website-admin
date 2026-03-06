'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, Sparkles, Video, X, Link } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { CharacterCounter } from '@/components/admin/CharacterCounter';
import { CHAR_LIMITS } from '@/lib/form-validation';

interface ContentItem {
  id: string;
  key: string;
  value: string;
  type: string;
  page: string;
  section: string;
  label: string;
  description?: string;
  order: number;
}

export default function EditPageContentPage({ params }: { params: Promise<{ pageKey: string }> }) {
  const { pageKey } = use(params);
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const fetchContent = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/content?page=${pageKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setItems(data.data);
          const vals: Record<string, string> = {};
          data.data.forEach((item: ContentItem) => { vals[item.key] = item.value; });
          setEditedValues(vals);
        }
      })
      .catch(() => toast.error('Failed to load content'))
      .finally(() => setLoading(false));
  }, [pageKey]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleChange = useCallback((key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const changedItems = items.filter((item) => editedValues[item.key] !== item.value);
      if (changedItems.length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: changedItems.map((item) => ({
            key: item.key,
            value: editedValues[item.key],
          })),
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`${changedItems.length} variable(s) updated!`);
        fetchContent();
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const res = await fetch('/api/admin/content/initialize', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        const { created, total } = result.data;
        if (created === 0) {
          toast.info(`All ${total} content entries already exist`);
        } else {
          toast.success(`Created ${created} of ${total} missing content entries`);
          fetchContent();
        }
      } else {
        toast.error(result.error || 'Initialization failed');
      }
    } catch {
      toast.error('Network error during initialization');
    } finally {
      setInitializing(false);
    }
  };

  // Group items by section
  const sections = items.reduce<Record<string, ContentItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-gray-500" style={{ fontFamily: 'system-ui' }}>
        <Loader2 size={20} className="animate-spin" />
        Loading content...
      </div>
    );
  }

  const pageLabel = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/content')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}
            >
              {pageLabel} Content
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} content variables</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInitialize}
            disabled={initializing || saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-sm disabled:opacity-50"
            style={{ textTransform: 'none', fontFamily: 'system-ui' }}
            title="Create default entries for any missing content keys"
          >
            {initializing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {initializing ? 'Initializing...' : 'Initialize Missing Content'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || initializing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
            style={{ textTransform: 'none', fontFamily: 'system-ui' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
          <p className="text-gray-500" style={{ fontFamily: 'system-ui' }}>
            No content variables found for this page.
          </p>
          <p className="text-xs text-gray-400" style={{ fontFamily: 'system-ui' }}>
            Click &quot;Initialize Missing Content&quot; to create default entries.
          </p>
          <button
            onClick={handleInitialize}
            disabled={initializing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
            style={{ textTransform: 'none', fontFamily: 'system-ui' }}
          >
            {initializing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {initializing ? 'Initializing...' : 'Initialize Missing Content'}
          </button>
        </div>
      ) : (
        Object.entries(sections)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([section, sectionItems]) => (
            <div key={section} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3"
                style={{ fontFamily: 'system-ui' }}
              >
                {section.replace(/_/g, ' ')}
              </h2>

              {sectionItems
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <ContentField
                    key={item.key}
                    item={item}
                    value={editedValues[item.key] ?? ''}
                    onChange={handleChange}
                  />
                ))}
            </div>
          ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Video field -- URL input with inline video preview                   */
/* ------------------------------------------------------------------ */

interface VideoFieldProps {
  value: string;
  onChange: (url: string) => void;
}

function VideoField({ value, onChange }: VideoFieldProps) {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); }
    if (e.key === 'Escape') { setShowUrlInput(false); setUrlInput(''); }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
          {/* Video preview -- works for absolute URLs; relative paths show a fallback */}
          <div className="relative" style={{ height: '180px', background: '#111' }}>
            <video
              src={value}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLVideoElement).style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback when video URL can't be previewed */}
            <div
              className="absolute inset-0 items-center justify-center flex-col gap-2 text-gray-400"
              style={{ display: 'none' }}
            >
              <Video size={32} />
              <p className="text-xs" style={{ fontFamily: 'system-ui' }}>Video path set (no browser preview)</p>
              <p className="text-[10px] text-gray-300 max-w-[200px] truncate px-2 text-center">{value}</p>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 rounded-full border border-gray-200 transition-colors shadow-sm"
              title="Clear video path"
            >
              <X size={12} />
            </button>
          </div>
          <div className="px-3 py-2 flex items-center justify-between gap-2">
            <p className="text-[10px] text-gray-400 truncate flex-1" style={{ fontFamily: 'system-ui' }} title={value}>
              {value}
            </p>
            <button
              type="button"
              onClick={() => { setUrlInput(value); setShowUrlInput(true); }}
              className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
              style={{ fontFamily: 'system-ui' }}
            >
              Edit path
            </button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
          style={{ height: '140px' }}
          onClick={() => setShowUrlInput(true)}
        >
          <div className="p-3 rounded-full bg-gray-100">
            <Video size={20} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500" style={{ fontFamily: 'system-ui' }}>
            Click to set video path or URL
          </p>
        </div>
      )}

      {/* URL / path input row */}
      {showUrlInput ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              placeholder="Enter video path or URL..."
              maxLength={CHAR_LIMITS.url}
              autoFocus
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{ fontFamily: 'system-ui' }}
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-2.5 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
            style={{ fontFamily: 'system-ui' }}
          >
            Set
          </button>
          <button
            type="button"
            onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
            className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            style={{ fontFamily: 'system-ui' }}
          >
            Cancel
          </button>
        </div>
      ) : !value ? (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          style={{ fontFamily: 'system-ui' }}
        >
          <Link size={12} />
          paste a path or URL
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Determine max length for a content field based on its type/key      */
/* ------------------------------------------------------------------ */

function getMaxLengthForContentField(item: ContentItem): number {
  if (item.type === 'json') return 10000;
  if (item.type === 'image' || item.type === 'video') return CHAR_LIMITS.url;
  // Use key hints to pick appropriate limit
  const k = item.key.toLowerCase();
  if (k.includes('title') || k.includes('heading') || k.includes('name')) return CHAR_LIMITS.title;
  if (k.includes('meta_title') || k.includes('metatitle')) return CHAR_LIMITS.metaTitle;
  if (k.includes('meta_description') || k.includes('metadescription')) return CHAR_LIMITS.metaDescription;
  if (k.includes('tagline') || k.includes('subtitle') || k.includes('short')) return CHAR_LIMITS.tagline;
  if (item.type === 'textarea') return CHAR_LIMITS.longText;
  return CHAR_LIMITS.longText;
}

/* ------------------------------------------------------------------ */
/* Field renderer -- picks the right input based on item.type           */
/* ------------------------------------------------------------------ */

interface ContentFieldProps {
  item: ContentItem;
  value: string;
  onChange: (key: string, value: string) => void;
}

function ContentField({ item, value, onChange }: ContentFieldProps) {
  const isJsonValid = (v: string) => {
    try { JSON.parse(v); return true; } catch { return false; }
  };

  const maxLen = getMaxLengthForContentField(item);
  const showCounter = item.type !== 'image' && item.type !== 'video';

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <label className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'system-ui' }}>
          {item.label}
        </span>
        <span
          className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 font-mono"
          title="Content key"
        >
          {item.key}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            item.type === 'json'
              ? 'bg-amber-50 text-amber-600'
              : item.type === 'image'
              ? 'bg-blue-50 text-blue-600'
              : item.type === 'video'
              ? 'bg-purple-50 text-purple-600'
              : item.type === 'textarea'
              ? 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {item.type}
        </span>
      </label>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-gray-400 italic" style={{ fontFamily: 'system-ui' }}>
          {item.description}
        </p>
      )}

      {/* Input based on type */}
      {item.type === 'image' ? (
        <ImageUploadField
          label=""
          value={value}
          onChange={(url) => onChange(item.key, url)}
          folder="content"
        />
      ) : item.type === 'video' ? (
        <VideoField value={value} onChange={(url) => onChange(item.key, url)} />
      ) : item.type === 'json' ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(item.key, e.target.value)}
            rows={8}
            spellCheck={false}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 resize-y ${
              value && !isJsonValid(value)
                ? 'border-red-300 focus:ring-red-200 bg-red-50'
                : 'border-gray-200 focus:ring-gray-300 bg-gray-50'
            }`}
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '0.8rem', lineHeight: '1.5' }}
          />
          {value && !isJsonValid(value) && (
            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'system-ui' }}>
              Invalid JSON -- fix before saving
            </p>
          )}
          {showCounter && (
            <div className="mt-1">
              <CharacterCounter current={value.length} max={maxLen} />
            </div>
          )}
        </div>
      ) : item.type === 'textarea' ? (
        <div>
          <textarea
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= maxLen) onChange(item.key, e.target.value);
            }}
            maxLength={maxLen}
            rows={5}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
          {showCounter && (
            <div className="mt-1">
              <CharacterCounter current={value.length} max={maxLen} />
            </div>
          )}
        </div>
      ) : (
        /* Default: text */
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= maxLen) onChange(item.key, e.target.value);
            }}
            maxLength={maxLen}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ fontFamily: 'system-ui' }}
          />
          {showCounter && (
            <div className="mt-1">
              <CharacterCounter current={value.length} max={maxLen} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
