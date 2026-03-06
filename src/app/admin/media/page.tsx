'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  Trash2,
  Copy,
  Search,
  Loader2,
  X,
  CheckCircle2,
  Folder,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  MoreVertical,
  Pencil,
  FolderInput,
  Image,
  Check,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  folder?: string | null;
  createdAt: string;
}

interface FolderInfo {
  name: string;
  count: number;
}

interface UploadProgress {
  filename: string;
  status: 'uploading' | 'done' | 'error';
}

type FolderFilter = 'all' | 'unfiled' | string;

// ─── Component ───────────────────────────────────────────────────────────────

export default function MediaLibraryPage() {
  // Media state
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Folder state
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unfiledCount, setUnfiledCount] = useState(0);
  const [activeFolder, setActiveFolder] = useState<FolderFilter>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Folder CRUD state
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const editFolderInputRef = useRef<HTMLInputElement>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null); // media item id or 'bulk'
  const [showNewFolderInMove, setShowNewFolderInMove] = useState(false);
  const [newFolderInMoveName, setNewFolderInMoveName] = useState('');

  // ─── Data Loading ────────────────────────────────────────────────────────

  const loadMedia = useCallback((folderFilter?: FolderFilter) => {
    const filter = folderFilter ?? activeFolder;
    let url = '/api/admin/media';
    if (filter === 'unfiled') {
      url += '?folder=unfiled';
    } else if (filter !== 'all') {
      url += `?folder=${encodeURIComponent(filter)}`;
    }

    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const items = data.data?.items ?? data.data ?? [];
          setMedia(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => toast.error('Failed to load media'))
      .finally(() => setLoading(false));
  }, [activeFolder]);

  const loadFolders = useCallback(() => {
    fetch('/api/admin/media/folders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setFolders(data.data.folders);
          setTotalCount(data.data.totalCount);
          setUnfiledCount(data.data.unfiledCount);
        }
      })
      .catch(() => console.error('Failed to load folders'));
  }, []);

  useEffect(() => {
    loadMedia();
    loadFolders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchFolder = (folder: FolderFilter) => {
    setActiveFolder(folder);
    setSelectedIds(new Set());
    setSearch('');
    setLoading(true);
    loadMedia(folder);
  };

  // ─── Upload Logic ────────────────────────────────────────────────────────

  const uploadFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }

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

        // Assign to current folder if viewing a specific folder
        if (activeFolder !== 'all' && activeFolder !== 'unfiled') {
          formData.append('mediaFolder', activeFolder);
        }

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
      loadFolders();
    }

    setTimeout(() => setUploadQueue([]), 2000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [activeFolder, loadMedia, loadFolders]);

  // ─── Drag & Drop ─────────────────────────────────────────────────────────

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

  // ─── File Actions ─────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    setMedia((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('File deleted');
        loadMedia();
        loadFolders();
      } else {
        toast.error(data.error || 'Failed to delete file');
        loadMedia();
      }
    } catch {
      toast.error('Error deleting file');
      loadMedia();
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  // ─── Folder CRUD ──────────────────────────────────────────────────────────

  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;

    // Check for duplicate
    if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A folder with this name already exists');
      return;
    }

    // Creating a folder simply means we track the name.
    // Since folders are derived from Media records, we'll create an empty "virtual" folder
    // by adding it to the local list. It becomes real when media is moved into it.
    setFolders((prev) => [...prev, { name, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
    setNewFolderName('');
    setShowNewFolder(false);
    toast.success(`Folder "${name}" created`);
  };

  const renameFolder = async (oldName: string) => {
    const newName = editFolderName.trim();
    if (!newName || newName === oldName) {
      setEditingFolder(null);
      return;
    }

    if (folders.some((f) => f.name.toLowerCase() === newName.toLowerCase() && f.name !== oldName)) {
      toast.error('A folder with this name already exists');
      return;
    }

    try {
      const res = await fetch('/api/admin/media/folders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Folder renamed to "${newName}"`);
        if (activeFolder === oldName) {
          setActiveFolder(newName);
        }
        loadFolders();
        loadMedia();
      } else {
        toast.error(data.error || 'Failed to rename folder');
      }
    } catch {
      toast.error('Error renaming folder');
    }
    setEditingFolder(null);
  };

  const deleteFolder = async (name: string) => {
    if (!confirm(`Delete folder "${name}"? Files will be moved to Unfiled.`)) return;

    try {
      const res = await fetch('/api/admin/media/folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.data.message);
        if (activeFolder === name) {
          setActiveFolder('all');
        }
        loadFolders();
        loadMedia();
      } else {
        toast.error(data.error || 'Failed to delete folder');
      }
    } catch {
      toast.error('Error deleting folder');
    }
  };

  // ─── Move to Folder ───────────────────────────────────────────────────────

  const moveToFolder = async (ids: string[], folder: string | null) => {
    try {
      const res = await fetch('/api/admin/media/bulk-move', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, folder }),
      });
      const data = await res.json();
      if (data.success) {
        const dest = folder ? `"${folder}"` : 'Unfiled';
        toast.success(`Moved ${ids.length} file${ids.length > 1 ? 's' : ''} to ${dest}`);
        setSelectedIds(new Set());
        setShowMoveMenu(null);
        loadMedia();
        loadFolders();
      } else {
        toast.error(data.error || 'Failed to move files');
      }
    } catch {
      toast.error('Error moving files');
    }
  };

  const handleMoveNewFolder = async (ids: string[]) => {
    const name = newFolderInMoveName.trim();
    if (!name) return;
    setShowNewFolderInMove(false);
    setNewFolderInMoveName('');
    await moveToFolder(ids, name);
  };

  // ─── Selection ────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.id)));
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

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
  const hasSelection = selectedIds.size > 0;

  // Close menus on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-folder-menu]') && !target.closest('[data-move-menu]')) {
        setFolderMenuOpen(null);
        setShowMoveMenu(null);
        setShowNewFolderInMove(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Focus new folder input
  useEffect(() => {
    if (showNewFolder) newFolderInputRef.current?.focus();
  }, [showNewFolder]);

  useEffect(() => {
    if (editingFolder) editFolderInputRef.current?.focus();
  }, [editingFolder]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading && media.length === 0) {
    return <div className="text-center py-12 text-gray-500">Loading media...</div>;
  }

  const activeFolderLabel =
    activeFolder === 'all' ? 'All Media' :
    activeFolder === 'unfiled' ? 'Unfiled' :
    activeFolder;

  return (
    <div className="flex gap-0 min-h-[calc(100vh-8rem)]">
      {/* ── Folder Sidebar ─────────────────────────────────────────────── */}
      <div
        className={`shrink-0 border-r border-gray-200 bg-gray-50/50 transition-all duration-200 overflow-hidden ${
          sidebarOpen ? 'w-60' : 'w-0'
        }`}
      >
        <div className="w-60 p-4 space-y-1">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
              style={{ fontFamily: 'system-ui' }}
            >
              Folders
            </h2>
            <button
              onClick={() => {
                setShowNewFolder(true);
                setNewFolderName('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="New folder"
            >
              <FolderPlus size={16} />
            </button>
          </div>

          {/* New Folder Input */}
          {showNewFolder && (
            <div className="flex items-center gap-1.5 mb-2">
              <FolderPlus size={14} className="text-gray-400 shrink-0" />
              <input
                ref={newFolderInputRef}
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createFolder();
                  if (e.key === 'Escape') setShowNewFolder(false);
                }}
                placeholder="Folder name..."
                className="flex-1 min-w-0 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                style={{ fontFamily: 'system-ui' }}
              />
              <button
                onClick={createFolder}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setShowNewFolder(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* All Media */}
          <button
            onClick={() => switchFolder('all')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeFolder === 'all'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ fontFamily: 'system-ui' }}
          >
            <Image size={15} className="shrink-0" />
            <span className="flex-1 text-left truncate">All Media</span>
            <span className={`text-xs tabular-nums ${activeFolder === 'all' ? 'text-gray-300' : 'text-gray-400'}`}>
              {totalCount}
            </span>
          </button>

          {/* Unfiled */}
          <button
            onClick={() => switchFolder('unfiled')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeFolder === 'unfiled'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ fontFamily: 'system-ui' }}
          >
            <FolderOpen size={15} className="shrink-0" />
            <span className="flex-1 text-left truncate">Unfiled</span>
            <span className={`text-xs tabular-nums ${activeFolder === 'unfiled' ? 'text-gray-300' : 'text-gray-400'}`}>
              {unfiledCount}
            </span>
          </button>

          {/* Divider */}
          {folders.length > 0 && <hr className="my-2 border-gray-200" />}

          {/* Folder List */}
          {folders.map((f) => (
            <div key={f.name} className="relative group/folder" data-folder-menu>
              {editingFolder === f.name ? (
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <Folder size={14} className="text-gray-400 shrink-0" />
                  <input
                    ref={editFolderInputRef}
                    type="text"
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') renameFolder(f.name);
                      if (e.key === 'Escape') setEditingFolder(null);
                    }}
                    onBlur={() => renameFolder(f.name)}
                    className="flex-1 min-w-0 text-sm px-2 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                    style={{ fontFamily: 'system-ui' }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => switchFolder(f.name)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeFolder === f.name
                      ? 'bg-[#1a1a1a] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'system-ui' }}
                >
                  <Folder size={15} className="shrink-0" />
                  <span className="flex-1 text-left truncate">{f.name}</span>
                  <span className={`text-xs tabular-nums ${activeFolder === f.name ? 'text-gray-300' : 'text-gray-400'}`}>
                    {f.count}
                  </span>

                  {/* Folder context menu trigger */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderMenuOpen(folderMenuOpen === f.name ? null : f.name);
                    }}
                    className={`p-0.5 rounded opacity-0 group-hover/folder:opacity-100 transition-opacity ${
                      activeFolder === f.name
                        ? 'hover:bg-white/20 text-gray-300'
                        : 'hover:bg-gray-200 text-gray-400'
                    }`}
                  >
                    <MoreVertical size={14} />
                  </span>
                </button>
              )}

              {/* Folder context menu */}
              {folderMenuOpen === f.name && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      setEditingFolder(f.name);
                      setEditFolderName(f.name);
                      setFolderMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    style={{ fontFamily: 'system-ui' }}
                  >
                    <Pencil size={13} />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setFolderMenuOpen(null);
                      deleteFolder(f.name);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    style={{ fontFamily: 'system-ui' }}
                  >
                    <Trash2 size={13} />
                    Delete folder
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div
        className="flex-1 min-w-0 p-6 space-y-5"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header with breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm" style={{ fontFamily: 'system-ui' }}>
                <span
                  className={`${activeFolder === 'all' ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
                  onClick={() => activeFolder !== 'all' && switchFolder('all')}
                >
                  Media Library
                </span>
                {activeFolder !== 'all' && (
                  <>
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-gray-900 font-medium">{activeFolderLabel}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'system-ui' }}>
                {media.length} file{media.length !== 1 ? 's' : ''}
                {activeFolder !== 'all' && activeFolder !== 'unfiled' && ' in this folder'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-8 ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500" style={{ fontFamily: 'system-ui' }}>
                Uploading {uploadQueue.filter((u) => u.status === 'uploading').length} file{uploadQueue.filter((u) => u.status === 'uploading').length > 1 ? 's' : ''}...
              </p>
            </div>
          ) : isDragOver ? (
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="p-3 rounded-full bg-blue-100">
                <Upload size={20} className="text-blue-500" />
              </div>
              <p className="text-sm font-medium text-blue-600" style={{ fontFamily: 'system-ui' }}>
                Drop images to upload
                {activeFolder !== 'all' && activeFolder !== 'unfiled' && ` to "${activeFolder}"`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-gray-100">
                <Upload size={20} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600" style={{ fontFamily: 'system-ui' }}>
                  Drag images here or click to upload
                  {activeFolder !== 'all' && activeFolder !== 'unfiled' && (
                    <span className="text-gray-400"> to "{activeFolder}"</span>
                  )}
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

        {/* Search + Bulk Actions Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
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

          {filtered.length > 0 && (
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ fontFamily: 'system-ui' }}
            >
              {selectedIds.size === filtered.length ? (
                <>
                  <X size={13} />
                  Deselect all
                </>
              ) : (
                <>
                  <Check size={13} />
                  Select all
                </>
              )}
            </button>
          )}

          {/* Bulk actions */}
          {hasSelection && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500" style={{ fontFamily: 'system-ui' }}>
                {selectedIds.size} selected
              </span>

              {/* Bulk Move */}
              <div className="relative" data-move-menu>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveMenu(showMoveMenu === 'bulk' ? null : 'bulk');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                  style={{ fontFamily: 'system-ui' }}
                >
                  <FolderInput size={13} />
                  Move to...
                </button>

                {showMoveMenu === 'bulk' && (
                  <MoveToFolderMenu
                    folders={folders}
                    onSelect={(folder) => moveToFolder(Array.from(selectedIds), folder)}
                    onNewFolder={() => setShowNewFolderInMove(true)}
                    showNewFolder={showNewFolderInMove}
                    newFolderName={newFolderInMoveName}
                    onNewFolderNameChange={setNewFolderInMoveName}
                    onNewFolderSubmit={() => handleMoveNewFolder(Array.from(selectedIds))}
                    onNewFolderCancel={() => {
                      setShowNewFolderInMove(false);
                      setNewFolderInMoveName('');
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg border overflow-hidden group relative ${
                  isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="aspect-square bg-gray-50 relative">
                  {item.mimeType.startsWith('image/') ? (
                    <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      {item.mimeType}
                    </div>
                  )}

                  {/* Selection checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white/80 border-gray-300 text-transparent opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(item.url);
                      }}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </button>

                    {/* Move single item */}
                    <div className="relative" data-move-menu>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMoveMenu(showMoveMenu === item.id ? null : item.id);
                        }}
                        className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                        title="Move to folder"
                      >
                        <FolderInput size={14} />
                      </button>

                      {showMoveMenu === item.id && (
                        <MoveToFolderMenu
                          folders={folders}
                          currentFolder={item.folder}
                          onSelect={(folder) => moveToFolder([item.id], folder)}
                          onNewFolder={() => setShowNewFolderInMove(true)}
                          showNewFolder={showNewFolderInMove}
                          newFolderName={newFolderInMoveName}
                          onNewFolderNameChange={setNewFolderInMoveName}
                          onNewFolderSubmit={() => handleMoveNewFolder([item.id])}
                          onNewFolderCancel={() => {
                            setShowNewFolderInMove(false);
                            setNewFolderInMoveName('');
                          }}
                        />
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 truncate" style={{ fontFamily: 'system-ui' }}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400" style={{ fontFamily: 'system-ui' }}>
                      {formatSize(item.size)}
                    </p>
                    {item.folder && activeFolder === 'all' && (
                      <span
                        className="text-[10px] text-gray-400 flex items-center gap-0.5 cursor-pointer hover:text-gray-600"
                        onClick={() => switchFolder(item.folder!)}
                        style={{ fontFamily: 'system-ui' }}
                      >
                        <Folder size={9} />
                        {item.folder}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400" style={{ fontFamily: 'system-ui' }}>
            {search
              ? 'No results found.'
              : activeFolder === 'unfiled'
              ? 'No unfiled media. All files are organized in folders.'
              : activeFolder !== 'all'
              ? 'This folder is empty. Upload or move files here.'
              : 'No media files yet. Upload your first image.'}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Move To Folder Menu Component ──────────────────────────────────────────

function MoveToFolderMenu({
  folders,
  currentFolder,
  onSelect,
  onNewFolder,
  showNewFolder,
  newFolderName,
  onNewFolderNameChange,
  onNewFolderSubmit,
  onNewFolderCancel,
}: {
  folders: FolderInfo[];
  currentFolder?: string | null;
  onSelect: (folder: string | null) => void;
  onNewFolder: () => void;
  showNewFolder: boolean;
  newFolderName: string;
  onNewFolderNameChange: (name: string) => void;
  onNewFolderSubmit: () => void;
  onNewFolderCancel: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] max-h-[280px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>
        Move to
      </div>

      {/* Unfiled option */}
      <button
        onClick={() => onSelect(null)}
        disabled={currentFolder === null || currentFolder === undefined}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: 'system-ui' }}
      >
        <FolderOpen size={14} className="text-gray-400" />
        Unfiled
      </button>

      {folders.map((f) => (
        <button
          key={f.name}
          onClick={() => onSelect(f.name)}
          disabled={currentFolder === f.name}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: 'system-ui' }}
        >
          <Folder size={14} className="text-gray-400" />
          <span className="truncate">{f.name}</span>
          <span className="text-[10px] text-gray-400 ml-auto">{f.count}</span>
        </button>
      ))}

      <hr className="my-1 border-gray-100" />

      {showNewFolder ? (
        <div className="px-3 py-2 flex items-center gap-1.5">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => onNewFolderNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onNewFolderSubmit();
              if (e.key === 'Escape') onNewFolderCancel();
            }}
            placeholder="New folder..."
            className="flex-1 min-w-0 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            style={{ fontFamily: 'system-ui' }}
            autoFocus
          />
          <button onClick={onNewFolderSubmit} className="p-1 text-green-600 hover:bg-green-50 rounded">
            <Check size={13} />
          </button>
          <button onClick={onNewFolderCancel} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          onClick={onNewFolder}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
          style={{ fontFamily: 'system-ui' }}
        >
          <FolderPlus size={14} />
          New folder...
        </button>
      )}
    </div>
  );
}
