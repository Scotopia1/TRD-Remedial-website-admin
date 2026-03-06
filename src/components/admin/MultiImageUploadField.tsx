'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, ChevronUp, ChevronDown, Loader2, ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ImageItem {
  url: string;
  alt: string;
  caption?: string;
}

interface MultiImageUploadFieldProps {
  label: string;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  folder?: string;
  maxImages?: number;
}

export function MultiImageUploadField({
  label,
  images,
  onChange,
  folder = 'uploads',
  maxImages,
}: MultiImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

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
          onChange([...images, { url: result.data.url, alt: result.data.alt || file.name.replace(/\.[^.]+$/, ''), caption: '' }]);
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
    [folder, images, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => uploadFile(file));
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const updateImage = (idx: number, field: keyof ImageItem, val: string) => {
    const updated = [...images];
    updated[idx] = { ...updated[idx], [field]: val };
    onChange(updated);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...images];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    onChange(updated);
  };

  const moveDown = (idx: number) => {
    if (idx === images.length - 1) return;
    const updated = [...images];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    onChange(updated);
  };

  const canAddMore = !maxImages || images.length < maxImages;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'system-ui' }}>
        {label}
        {maxImages && (
          <span className="ml-2 text-xs text-gray-400 font-normal">
            ({images.length}/{maxImages})
          </span>
        )}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-200">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100" style={{ width: '80px', height: '80px' }}>
                {img.url ? (
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={20} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => updateImage(idx, 'alt', e.target.value)}
                  placeholder="Alt text..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{ fontFamily: 'system-ui' }}
                />
                <input
                  type="text"
                  value={img.caption || ''}
                  onChange={(e) => updateImage(idx, 'caption', e.target.value)}
                  placeholder="Caption (optional)..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  style={{ fontFamily: 'system-ui' }}
                />
                <p className="text-[10px] text-gray-400 truncate" title={img.url}>{img.url}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === images.length - 1}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-3 py-5 ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          }`}
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm" style={{ fontFamily: 'system-ui' }}>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              {isDragOver ? (
                <Upload size={16} className="text-blue-400" />
              ) : (
                <Plus size={16} />
              )}
              <span className="text-sm" style={{ fontFamily: 'system-ui' }}>
                {isDragOver ? 'Drop images here' : images.length === 0 ? 'Drag & drop or click to add images' : 'Add more images'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
