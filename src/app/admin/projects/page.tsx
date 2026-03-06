'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { DraggableList } from '@/components/admin/DraggableList';
import { Plus, Edit, Trash2, ArrowUpDown, Table } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  location: string;
  serviceType: string;
  date: string;
  isActive: boolean;
  order: number;
  updatedAt: string;
}

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'reorder'>('table');

  const loadProjects = () => {
    fetch('/api/admin/projects')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProjects(data.data);
      })
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Project deleted');
        loadProjects();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleReorder = useCallback(async (reorderedItems: ProjectRow[]) => {
    const items = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    const res = await fetch('/api/admin/projects/reorder', {
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
    setProjects(reorderedItems.map((item, index) => ({ ...item, order: index })));
    toast.success('Order saved');
  }, []);

  const columns: ColumnDef<ProjectRow, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-xs">{row.original.name}</p>
          <p className="text-xs text-gray-400">{row.original.location}</p>
        </div>
      ),
    },
    {
      accessorKey: 'serviceType',
      header: 'Service',
      cell: ({ getValue }) => (
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => {
        return <span className="text-xs text-gray-500">{getValue() as string}</span>;
      },
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
          <button onClick={() => router.push(`/admin/projects/${row.original.id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
            <Edit size={14} />
          </button>
          <button onClick={() => handleDelete(row.original.id, row.original.name)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  const renderProjectItem = (project: ProjectRow) => (
    <div className="flex items-center justify-between w-full gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Name and location */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900 truncate">{project.name}</p>
          <p className="text-xs text-gray-400 truncate">{project.location}</p>
        </div>

        {/* Service type badge */}
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">
          {project.serviceType}
        </span>

        {/* Date */}
        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 hidden sm:inline">
          {project.date}
        </span>

        {/* Status */}
        <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${project.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {project.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/projects/${project.id}`); }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          title="Edit"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }}
          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-12 text-gray-500">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} projects</p>
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

          <Link href="/admin/projects/new" className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
            <Plus size={16} /> Add Project
          </Link>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable data={projects} columns={columns} searchPlaceholder="Search projects..." searchKey="name" />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Drag rows using the handle on the left to reorder. Changes are saved automatically.
          </p>
          <DraggableList
            items={projects}
            onReorder={handleReorder}
            renderItem={renderProjectItem}
          />
        </div>
      )}
    </div>
  );
}
