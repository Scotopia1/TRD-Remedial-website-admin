'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, Copy, Search, Loader2, X, CheckCircle2 } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  folder?: string;
  createdAt: string;
}

interface UploadProgress {
  filename: string;
  status: 'uploading' | 'done' | 'error';
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const loadMedia = () => {
    fetch('/api/admin/media')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const items = data.data?.items ?? data.data ?? [];
          setMedia(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => toast.error('Failed to load media'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMedia(); }, []);

  const uploadFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    // Initialize queue
    const initialQueue: UploadProgress[] = imageFiles.map((f) => ({
      filename: f.name,
      status: 'uploading',
    }));
    setUploadQueue(initialQueue);

    let successCount = 0;
    const updatedQueue = [...initialQueue];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'uploads');
        formData.append('alt', file.name.replace(/\.[^.]+$/, ''));

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();

        if (result.success) {
          updatedQueue[i] = { ...updatedQueue[i], status: 'done' };
          successCount++;
        } else {
          updatedQueue[i] = { ...updatedQueue[i], status: 'error' };
          toast.error(`Failed: ${file.name}`);
        }
      } catch {
        updatedQueue[i] = { ...updatedQueue[i], status: 'error' };
        toast.error(`Error uploading: ${file.name}`);
      }
      setUploadQueue([...updatedQueue]);
    }

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded`);
      loadMedia();
    }

    // Clear queue after a brief delay
    setTimeout(() => setUploadQueue([]), 2000);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) uploadFiles(files);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('File deleted');
        loadMedia();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch {
      toast.error('Error');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const filtered = media.filter((m) =>
    m.filename.toLowerCase().includes(search.toLowerCase()) ||
    m.alt?.toLowerCase().includes(search.toLowerCase())
  );

  const isUploading = uploadQueue.some((u) => u.status === 'uploading');

  if (loading) return <div className="text-center py-12 text-gray-500">Loading media...</div>;

  return (
    <div
      className="space-y-6"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">{media.length} files</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
            style={{ textTransform: 'none', fontFamily: 'system-ui' }}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500" style={{ fontFamily: 'system-ui' }}>
              Uploading {uploadQueue.filter((u) => u.status === 'uploading').length} file{uploadQueue.filter((u) => u.status === 'uploading').length > 1 ? 's' : ''}...
            </p>
          </div>
        ) : isDragOver ? (
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="p-4 rounded-full bg-blue-100">
              <Upload size={24} className="text-blue-500" />
            </div>
            <p className="text-base font-medium text-blue-600" style={{ fontFamily: 'system-ui' }}>
              Drop images to upload
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-gray-100">
              <Upload size={24} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'system-ui' }}>
                Drag images here or click to upload
              </p>
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'system-ui' }}>
                Supports PNG, JPG, WebP, GIF — multiple files allowed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload progress pills */}
      {uploadQueue.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadQueue.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
                item.status === 'uploading'
                  ? 'bg-gray-50 border-gray-200 text-gray-600'
                  : item.status === 'done'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
              style={{ fontFamily: 'system-ui' }}
            >
              {item.status === 'uploading' && <Loader2 size={10} className="animate-spin" />}
              {item.status === 'done' && <CheckCircle2 size={10} />}
              {item.status === 'error' && <X size={10} />}
              {item.filename}
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          style={{ fontFamily: 'system-ui' }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
            <div className="aspect-square bg-gray-50 relative">
              {item.mimeType.startsWith('image/') ? (
                <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  {item.mimeType}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                  <Copy size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-700 truncate">{item.filename}</p>
              <p className="text-[10px] text-gray-400">{formatSize(item.size)}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {search ? 'No results found.' : 'No media files yet. Upload your first image.'}
        </div>
      )}
    </div>
  );
}
