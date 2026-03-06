'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  serviceInterest: string | null;
  projectType: string | null;
  message: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type StatusFilter = 'all' | 'unread' | 'read' | 'replied';

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
  { label: 'Replied', value: 'replied' },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'unread':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Unread
        </span>
      );
    case 'read':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
          Read
        </span>
      );
    case 'replied':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          Replied
        </span>
      );
    default:
      return null;
  }
}

export default function ContactSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadSubmissions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/contact-submissions?${params}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data.submissions);
        setPagination(data.data.pagination);
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadSubmissions(1);
  }, [loadSubmissions]);

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} submission(s)?`)) return;

    try {
      const res = await fetch('/api/admin/contact-submissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${selectedIds.size} submission(s) deleted`);
        setSelectedIds(new Set());
        loadSubmissions(pagination.page);
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === submissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map((s) => s.id)));
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}
          >
            Contact Submissions
          </h1>
          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'system-ui' }}>
            {pagination.total} total{unreadCount > 0 && ` \u00b7 ${unreadCount} unread`}
          </p>
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            style={{ textTransform: 'none', fontFamily: 'system-ui' }}
          >
            <Trash2 size={16} /> Delete {selectedIds.size} Selected
          </button>
        )}
      </div>

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setSelectedIds(new Set()); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ fontFamily: 'system-ui' }}
            >
              {tab.label}
              {tab.value === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            style={{ fontFamily: 'system-ui' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500" style={{ fontFamily: 'system-ui' }}>
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Mail size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'system-ui' }}>
            {searchQuery || statusFilter !== 'all' ? 'No submissions match your filters.' : 'No contact submissions yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === submissions.length && submissions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>
                  Name
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell" style={{ fontFamily: 'system-ui' }}>
                  Email
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell" style={{ fontFamily: 'system-ui' }}>
                  Service Interest
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>
                  Status
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" style={{ fontFamily: 'system-ui' }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/admin/contact-submissions/${s.id}`)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                    s.status === 'unread' ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-3">
                    <div>
                      <span
                        className={`text-sm ${s.status === 'unread' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                        style={{ fontFamily: 'system-ui' }}
                      >
                        {s.name}
                      </span>
                      {s.company && (
                        <span className="text-xs text-gray-400 ml-2" style={{ fontFamily: 'system-ui' }}>
                          {s.company}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1" style={{ fontFamily: 'system-ui' }}>
                      {s.message}
                    </p>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'system-ui' }}>
                      {s.email}
                    </span>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'system-ui' }}>
                      {s.serviceInterest || '\u2014'}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <div>
                      <span className="text-xs text-gray-500" style={{ fontFamily: 'system-ui' }}>
                        {formatDate(s.createdAt)}
                      </span>
                      <br />
                      <span className="text-xs text-gray-400" style={{ fontFamily: 'system-ui' }}>
                        {formatTime(s.createdAt)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-gray-100">
              <p className="text-xs text-gray-500" style={{ fontFamily: 'system-ui' }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSubmissions(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => loadSubmissions(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
