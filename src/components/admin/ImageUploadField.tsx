'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, Link, Loader2, ImageIcon, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { MediaLibraryPicker } from './MediaLibraryPicker';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  required?: boolean;
  className?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'uploads',
  required = false,
  className = '',
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        formData.append('alt', file.name.replace(/\.[^.]+$/, ''));

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        if (result.success) {
          onChange(result.data.url);
          toast.success('Image uploaded');
        } else {
          toast.error(result.error || 'Upload failed');
        }
      } catch {
        toast.error('Upload failed');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    }
    if (e.key === 'Escape') {
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'system-ui' }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Preview state */
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: '200px' }}>
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style &&
                ((e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex');
            }}
          />
          {/* Fallback when image fails to load */}
          <div
            className="w-full h-full items-center justify-center flex-col gap-2 text-gray-400 absolute inset-0 bg-gray-50"
            style={{ display: 'none' }}
          >
            <ImageIcon size={32} />
            <p className="text-xs">Cannot preview URL</p>
            <p className="text-[10px] text-gray-300 max-w-[160px] truncate px-2 text-center">{value}</p>
          </div>
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors group flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-100"
              style={{ fontFamily: 'system-ui' }}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white text-red-500 rounded-lg hover:bg-red-50"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
          {/* Always-visible remove button in top-right corner */}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 rounded-full border border-gray-200 transition-colors shadow-sm"
            title="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        /* Drop zone state */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
          style={{ height: '200px' }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500" style={{ fontFamily: 'system-ui' }}>Uploading...</p>
            </div>
          ) : (
            <>
              <div className={`p-3 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload size={20} className={isDragOver ? 'text-blue-500' : 'text-gray-400'} />
              </div>
              <div className="text-center px-4">
                <p className="text-sm text-gray-600" style={{ fontFamily: 'system-ui' }}>
                  {isDragOver ? 'Drop image here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'system-ui' }}>
                  PNG, JPG, WebP, GIF up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL paste row & media library button */}
      {!value && (
        <div className="flex items-center gap-2">
          {showUrlInput ? (
            <>
              <div className="relative flex-1">
                <Link size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={handleUrlKeyDown}
                  placeholder="Paste image URL..."
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
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                style={{ fontFamily: 'system-ui' }}
              >
                <FolderOpen size={12} />
                Browse Media Library
              </button>
              <span className="text-gray-300 text-xs">|</span>
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                style={{ fontFamily: 'system-ui' }}
              >
                <Link size={12} />
                Paste a URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* Current URL display (read-only, below preview) */}
      {value && (
        <p className="text-[10px] text-gray-400 truncate" style={{ fontFamily: 'system-ui' }} title={value}>
          {value}
        </p>
      )}

      {/* Media Library Picker Modal */}
      <MediaLibraryPicker
        open={showMediaPicker}
        onSelect={(media) => onChange(media.url)}
        onClose={() => setShowMediaPicker(false)}
      />
    </div>
  );
}
