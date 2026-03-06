'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

interface ServiceRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  isActive: boolean;
  order: number;
  projects: { id: string }[];
  updatedAt: string;
}

export default function ServicesListPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = () => {
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadServices(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Service deleted');
        loadServices();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const columns: ColumnDef<ServiceRow, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-gray-400">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'tagline',
      header: 'Tagline',
      cell: ({ getValue }) => (
        <span className="text-gray-500 text-xs">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'projects',
      header: 'Projects',
      cell: ({ row }) => (
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.projects?.length || 0}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => (
        <span className={`text-xs px-2 py-0.5 rounded ${getValue() ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/services/${row.original.id}`)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDelete(row.original.id, row.original.title)}
            className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>
            Services
          </h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} services</p>
        </div>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm"
          style={{ textTransform: 'none', fontFamily: 'system-ui' }}
        >
          <Plus size={16} />
          Add Service
        </Link>
      </div>

      <DataTable
        data={services}
        columns={columns}
        searchPlaceholder="Search services..."
        searchKey="title"
      />
    </div>
  );
}
