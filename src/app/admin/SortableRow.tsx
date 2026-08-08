import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

interface SortableRowProps {
  transaction: any;
  onEdit: (tx: any) => void;
  onDelete: (id: number) => void;
}

export function SortableRow({ transaction, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: transaction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors group ${
        isDragging ? 'bg-white shadow-lg opacity-90' : 'bg-white'
      }`}
    >
      <td className="p-3 w-10">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 rounded transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="p-3 text-sm text-slate-600 font-medium whitespace-nowrap">{transaction.date}</td>
      <td className="p-3 text-sm text-slate-800 font-bold">{transaction.description}</td>
      <td className="p-3 text-sm text-emerald-600 font-bold text-right">{transaction.received > 0 ? transaction.received.toLocaleString() : '-'}</td>
      <td className="p-3 text-sm text-red-500 font-bold text-right">{transaction.paid > 0 ? transaction.paid.toLocaleString() : '-'}</td>
      <td className="p-3 text-sm text-slate-500">{transaction.note}</td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="แก้ไข"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
                onDelete(transaction.id);
              }
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="ลบ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
