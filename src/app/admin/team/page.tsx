'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

interface TeamRow {
  id: string;
  name: string;
  title: string;
  roles: string[];
  image: string;
  updatedAt: string;
}

export default function TeamListPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = () => {
    fetch('/api/admin/team')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMembers(data.data);
      })
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMembers(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Member deleted');
        loadMembers();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const columns: ColumnDef<TeamRow, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
            {row.original.image && (
              <img src={row.original.image} alt={row.original.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-gray-400">{row.original.title}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {(getValue() as string[]).map((role, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{role}</span>
          ))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/admin/team/${row.original.id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"><Edit size={14} /></button>
          <button onClick={() => handleDelete(row.original.id, row.original.name)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (loading) return <div className="text-center py-12 text-gray-500">Loading team...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui' }}>Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">{members.length} members</p>
        </div>
        <Link href="/admin/team/new" className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm" style={{ textTransform: 'none', fontFamily: 'system-ui' }}>
          <Plus size={16} /> Add Member
        </Link>
      </div>
      <DataTable data={members} columns={columns} searchPlaceholder="Search team..." searchKey="name" />
    </div>
  );
}
