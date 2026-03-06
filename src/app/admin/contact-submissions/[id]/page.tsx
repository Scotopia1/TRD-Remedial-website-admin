'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Mail, Clock, Building2, Phone, Briefcase, Wrench } from 'lucide-react';
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
  updatedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'unread':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Unread
        </span>
      );
    case 'read':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
          Read
        </span>
      );
    case 'replied':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
          Replied
        </span>
      );
    default:
      return null;
  }
}

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSubmission = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`);
      const data = await res.json();
      if (data.success) {
        setSubmission(data.data);
        setAdminNotes(data.data.adminNotes || '');
      } else {
        toast.error('Submission not found');
        router.push('/admin/contact-submissions');
      }
    } catch {
      toast.error('Failed to load submission');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  const updateStatus = async (newStatus: string) => {
    if (!submission) return;
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmission(data.data);
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: adminNotes || null }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmission(data.data);
        toast.success('Notes saved');
      } else {
        toast.error(data.error || 'Failed to save notes');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Submission deleted');
        router.push('/admin/contact-submissions');
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500" style={{ fontFamily: 'system-ui' }}>
        Loading submission...
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/contact-submissions')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontFamily: 'system-ui' }}
        >
          <ArrowLeft size={16} /> Back to Submissions
        </button>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${submission.email}?subject=Re: Your enquiry to TRD Remedial`}
            onClick={() => {
              // Mark as replied when clicking reply
              updateStatus('replied');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm"
            style={{ textTransform: 'none', fontFamily: 'system-ui' }}
          >
            <Mail size={16} /> Reply
          </a>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            style={{ fontFamily: 'system-ui' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-xl font-bold text-gray-900"
                style={{ fontSize: '1.25rem', lineHeight: '1.75rem', textTransform: 'none', fontFamily: 'system-ui' }}
              >
                {submission.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <a
                  href={`mailto:${submission.email}`}
                  className="text-sm text-blue-600 hover:underline"
                  style={{ fontFamily: 'system-ui' }}
                >
                  {submission.email}
                </a>
                <StatusBadge status={submission.status} />
              </div>
            </div>
            {/* Status dropdown */}
            <select
              value={submission.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              style={{ fontFamily: 'system-ui' }}
            >
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'system-ui' }}>Submitted</p>
                <p className="text-sm text-gray-700" style={{ fontFamily: 'system-ui' }}>{formatDateTime(submission.createdAt)}</p>
              </div>
            </div>
            {submission.phone && (
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'system-ui' }}>Phone</p>
                  <a href={`tel:${submission.phone}`} className="text-sm text-gray-700 hover:underline" style={{ fontFamily: 'system-ui' }}>
                    {submission.phone}
                  </a>
                </div>
              </div>
            )}
            {submission.company && (
              <div className="flex items-start gap-3">
                <Building2 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'system-ui' }}>Company</p>
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'system-ui' }}>{submission.company}</p>
                </div>
              </div>
            )}
            {submission.serviceInterest && (
              <div className="flex items-start gap-3">
                <Wrench size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'system-ui' }}>Service Interest</p>
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'system-ui' }}>{submission.serviceInterest}</p>
                </div>
              </div>
            )}
            {submission.projectType && (
              <div className="flex items-start gap-3">
                <Briefcase size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'system-ui' }}>Project Type</p>
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'system-ui' }}>{submission.projectType}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="p-6 border-b border-gray-100">
          <h2
            className="text-sm font-medium text-gray-500 mb-3"
            style={{ fontFamily: 'system-ui', textTransform: 'none' }}
          >
            Message
          </h2>
          <div
            className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4"
            style={{ fontFamily: 'system-ui' }}
          >
            {submission.message}
          </div>
        </div>

        {/* Admin Notes */}
        <div className="p-6">
          <h2
            className="text-sm font-medium text-gray-500 mb-3"
            style={{ fontFamily: 'system-ui', textTransform: 'none' }}
          >
            Admin Notes
          </h2>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes about this submission..."
            rows={4}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-y"
            style={{ fontFamily: 'system-ui' }}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={saveNotes}
              disabled={saving}
              className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
              style={{ textTransform: 'none', fontFamily: 'system-ui' }}
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
