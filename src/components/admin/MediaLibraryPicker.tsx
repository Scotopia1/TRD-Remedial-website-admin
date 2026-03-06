'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, X, Loader2, ImageIcon, Check } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

interface MediaLibraryPickerProps {
  open: boolean;
  onSelect: (media: { url: string; alt?: string }) => void;
  onClose: () => void;
}

export function MediaLibraryPicker({ open, onSelect, onClose }: MediaLibraryPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadMedia = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/media?mimeType=image/', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const items = data.data?.items ?? data.data ?? [];
          setMedia(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => {
        // silently fail — user will see empty state
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (open) {
      loadMedia();
      setSelectedId(null);
      setSearch('');
    }
  }, [open, loadMedia]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filtered = media.filter(
    (m) =>
      m.filename.toLowerCase().includes(search.toLowerCase()) ||
      m.alt?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = media.find((m) => m.id === selectedId);

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect({ url: selectedItem.url, alt: selectedItem.alt });
      onClose();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2
              className="text-lg font-semibold text-gray-900"
              style={{ fontFamily: 'system-ui', textTransform: 'none' }}
            >
              Media Library
            </h2>
            <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'system-ui' }}>
              {media.length} image{media.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by filename or alt text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              style={{ fontFamily: 'system-ui' }}
              autoFocus
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: '300px' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-gray-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ImageIcon size={32} className="mb-2" />
              <p className="text-sm" style={{ fontFamily: 'system-ui' }}>
                {search ? 'No images match your search.' : 'No images in the media library.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(isSelected ? null : item.id)}
                    onDoubleClick={() => {
                      onSelect({ url: item.url, alt: item.alt });
                      onClose();
                    }}
                    className={`group relative rounded-lg overflow-hidden border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-gray-50 relative">
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.alt || item.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Selection checkmark */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}

                      {/* Hover overlay with dimensions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end opacity-0 group-hover:opacity-100">
                        <div className="w-full px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
                          <p
                            className="text-[10px] text-white truncate"
                            style={{ fontFamily: 'system-ui' }}
                          >
                            {item.filename}
                          </p>
                          <p
                            className="text-[9px] text-white/70"
                            style={{ fontFamily: 'system-ui' }}
                          >
                            {item.width && item.height
                              ? `${item.width} x ${item.height} — `
                              : ''}
                            {formatSize(item.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-xs text-gray-400" style={{ fontFamily: 'system-ui' }}>
            {selectedItem ? (
              <span className="text-gray-600">
                Selected: <span className="font-medium">{selectedItem.filename}</span>
              </span>
            ) : (
              'Click an image to select, double-click to quick select'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ fontFamily: 'system-ui', textTransform: 'none' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedItem}
              className="px-4 py-2 text-sm bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: 'system-ui', textTransform: 'none' }}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
