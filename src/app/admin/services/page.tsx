'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { DraggableList } from '@/components/admin/DraggableList';
import { Plus, Edit, Trash2, ArrowUpDown, Table } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'table' | 'reorder'>('table');

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

  const handleReorder = useCallback(async (reorderedItems: ServiceRow[]) => {
    const items = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    const res = await fetch('/api/admin/services/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();

    if (!data.success) {
      toast.error(data.error || 'Failed to save order');
      throw new Error('Reorder failed');
    }

    // Update local state with new order values
    setServices(reorderedItems.map((item, index) => ({ ...item, order: index })));
    toast.success('Order saved');
  }, []);

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

  const renderServiceItem = (service: ServiceRow) => (
    <div className="flex items-center justify-between w-full gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Title and slug */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900 truncate">{service.title}</p>
          <p className="text-xs text-gray-400 truncate">/{service.slug}</p>
        </div>

        {/* Tagline */}
        <span className="text-gray-500 text-xs hidden md:inline truncate max-w-[200px]">
          {service.tagline}
        </span>

        {/* Projects count */}
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">
          {service.projects?.length || 0} projects
        </span>

        {/* Status */}
        <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${service.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {service.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/services/${service.id}`); }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          title="Edit"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(service.id, service.title); }}
          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

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
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table view"
            >
              <Table size={14} />
              Table
            </button>
            <button
              onClick={() => setViewMode('reorder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'reorder'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Reorder view"
            >
              <ArrowUpDown size={14} />
              Reorder
            </button>
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
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={services}
          columns={columns}
          searchPlaceholder="Search services..."
          searchKey="title"
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Drag rows using the handle on the left to reorder. Changes are saved automatically.
          </p>
          <DraggableList
            items={services}
            onReorder={handleReorder}
            renderItem={renderServiceItem}
          />
        </div>
      )}
    </div>
  );
}
