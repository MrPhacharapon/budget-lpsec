'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableRow } from './SortableRow';
import { Plus, Loader2 } from 'lucide-react';

interface TransactionTableProps {
  groupId: string;
  tabName: string;
  initialData: any[];
  onDataChange: () => void;
}

export default function TransactionTable({ groupId, tabName, initialData, onDataChange }: TransactionTableProps) {
  const [items, setItems] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [formData, setFormData] = useState({ date: '', description: '', received: '', paid: '', note: '' });

  // Update items if initialData changes
  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems); // Optimistic UI update

      try {
        setLoading(true);
        const sourceRowIndex = items[oldIndex].id;
        const destinationRowIndex = items[newIndex].id;
        
        await fetch('/api/admin/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reorder',
            groupId,
            tabName,
            sourceIndex: sourceRowIndex,
            destinationIndex: destinationRowIndex
          }),
        });
        
        onDataChange(); // Refresh data from server to get new indices
      } catch (err) {
        console.error('Reorder failed', err);
        setItems(items); // Revert
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await fetch('/api/admin/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', groupId, tabName, rowIndex: id }),
      });
      onDataChange();
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSave = {
        date: formData.date,
        description: formData.description,
        received: formData.received,
        paid: formData.paid,
        note: formData.note
      };

      if (editingTx) {
        await fetch('/api/admin/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', groupId, tabName, rowIndex: editingTx.id, data: dataToSave }),
        });
      } else {
        await fetch('/api/admin/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', groupId, tabName, data: dataToSave }),
        });
      }
      setModalOpen(false);
      onDataChange();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingTx(null);
    setFormData({ date: '', description: '', received: '', paid: '', note: '' });
    setModalOpen(true);
  };

  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setFormData({
      date: tx.date || '',
      description: tx.description || '',
      received: tx.received > 0 ? tx.received.toString() : '',
      paid: tx.paid > 0 ? tx.paid.toString() : '',
      note: tx.note || ''
    });
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      )}
      
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800">รายการใช้จ่าย (สามารถลากวางเพื่อสลับตำแหน่งได้)</h3>
        <button
          onClick={openNewModal}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> เพิ่มรายการ
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="p-3 w-10"></th>
              <th className="p-3">วัน/เดือน/ปี</th>
              <th className="p-3">รายการ</th>
              <th className="p-3 text-right">รายรับ</th>
              <th className="p-3 text-right">รายจ่าย</th>
              <th className="p-3">หมายเหตุ</th>
              <th className="p-3 w-20 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {items.map((tx) => (
                  <SortableRow
                    key={tx.id}
                    transaction={tx}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                  ไม่มีรายการใช้จ่าย
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800">{editingTx ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">วันที่</label>
                  <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium" placeholder="วว/ดด/ปปปป" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">รายการ</label>
                  <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium" placeholder="รายละเอียด..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">รายรับ (ถ้ามี)</label>
                  <input type="number" value={formData.received} onChange={e => setFormData({...formData, received: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">รายจ่าย (ถ้ามี)</label>
                  <input type="number" value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium" placeholder="0.00" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">หมายเหตุ</label>
                  <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium" placeholder="หมายเหตุเพิ่มเติม..." />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
