'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, Loader2 } from 'lucide-react';

interface DraggableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (reorderedItems: T[]) => Promise<void>;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T) => string;
}

export function DraggableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
}: DraggableListProps<T>) {
  const [localItems, setLocalItems] = useState<T[]>(items);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dragNodeRef = useRef<HTMLElement | null>(null);
  const preReorderSnapshot = useRef<T[]>([]);

  // Sync external items into local state
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const getKey = (item: T) => keyExtractor ? keyExtractor(item) : item.id;

  const handleDragStart = useCallback((e: React.DragEvent<HTMLElement>, index: number) => {
    dragNodeRef.current = e.currentTarget;
    setDraggedIndex(index);
    preReorderSnapshot.current = [...localItems];

    // Set drag data and effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));

    // Make the dragged element semi-transparent after a tick
    requestAnimationFrame(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = '0.4';
      }
    });
  }, [localItems]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex === null || draggedIndex === index) {
      setOverIndex(index);
      return;
    }

    setOverIndex(index);
  }, [draggedIndex]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    // Only clear if leaving the row entirely (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      setOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLElement>, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      // Reset state
      setDraggedIndex(null);
      setOverIndex(null);
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = '1';
      }
      return;
    }

    // Reorder items
    const newItems = [...localItems];
    const [movedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, movedItem);

    // Update local state immediately for snappy UX
    setLocalItems(newItems);
    setDraggedIndex(null);
    setOverIndex(null);
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1';
    }

    // Persist to server
    setSaving(true);
    try {
      await onReorder(newItems);
    } catch {
      // Revert on failure
      setLocalItems(preReorderSnapshot.current);
    } finally {
      setSaving(false);
    }
  }, [draggedIndex, localItems, onReorder]);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1';
    }
    setDraggedIndex(null);
    setOverIndex(null);
  }, []);

  // Compute drop indicator position
  const getDropIndicator = (index: number): 'above' | 'below' | null => {
    if (draggedIndex === null || overIndex === null) return null;
    if (draggedIndex === overIndex) return null;
    if (index !== overIndex) return null;
    return draggedIndex < overIndex ? 'below' : 'above';
  };

  return (
    <div className="relative">
      {/* Saving indicator */}
      {saving && (
        <div className="absolute top-0 right-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm z-10 text-xs text-gray-500">
          <Loader2 size={12} className="animate-spin" />
          Saving order...
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {localItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No items found.
          </div>
        ) : (
          localItems.map((item, index) => {
            const indicator = getDropIndicator(index);
            const isDragged = draggedIndex === index;

            return (
              <div
                key={getKey(item)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center border-b border-gray-50 last:border-b-0
                  transition-all duration-150
                  ${isDragged ? 'opacity-40 bg-gray-50' : 'bg-white hover:bg-gray-50/50'}
                  ${indicator === 'above' ? 'border-t-2 border-t-blue-500' : ''}
                  ${indicator === 'below' ? 'border-b-2 border-b-blue-500' : ''}
                `}
              >
                {/* Drag handle */}
                <div
                  className="flex-shrink-0 px-3 py-3 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical size={16} />
                </div>

                {/* Item content */}
                <div className="flex-1 min-w-0 px-2 py-3">
                  {renderItem(item, index)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
