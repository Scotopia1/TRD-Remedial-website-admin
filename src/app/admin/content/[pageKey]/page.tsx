'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

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
/* Field renderer — picks the right input based on item.type           */
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
        <p className="text-xs text-gray-400" style={{ fontFamily: 'system-ui' }}>
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
            <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'system-ui' }}>
              Invalid JSON — fix before saving
            </p>
          )}
        </div>
      ) : item.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(item.key, e.target.value)}
          rows={5}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
          style={{ fontFamily: 'system-ui' }}
        />
      ) : (
        /* Default: text */
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(item.key, e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          style={{ fontFamily: 'system-ui' }}
        />
      )}
    </div>
  );
}
