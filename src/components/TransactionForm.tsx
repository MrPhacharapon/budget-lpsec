'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionForm({ groupId, tabName }: { groupId: string, tabName: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    no: '',
    date: '',
    description: '',
    received: '',
    paid: '',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // แปลงวันที่ ปี ค.ศ. เป็น ปี พ.ศ. ให้เหมือนระบบเดิม
    let dateStr = formData.date;
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10) + 543;
        dateStr = `${parts[2]}/${parts[1]}/${year}`;
      }
    }

    try {
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          tabName,
          data: {
            ...formData,
            date: dateStr,
          }
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        setFormData({ no: '', date: '', description: '', received: '', paid: '', note: '' });
        router.refresh();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
      >
        <span>➕</span> บันทึกรายการใหม่
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">บันทึกรายการใช้เงินใหม่</h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-xs font-bold text-slate-600">ที่ (ลำดับ)</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.no} onChange={e => setFormData({...formData, no: e.target.value})} placeholder="เช่น 1" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-600">วัน/เดือน/ปี *</label>
              <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">รายละเอียดรายการใช้เงิน *</label>
            <textarea required rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="กรอกรายละเอียด..."></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-600">รายรับ (บาท)</label>
              <input type="number" step="0.01" className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700 font-bold" 
                value={formData.received} onChange={e => setFormData({...formData, received: e.target.value})} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-red-600">รายจ่าย (บาท)</label>
              <input type="number" step="0.01" className="w-full bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-red-700 font-bold" 
                value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">หมายเหตุ</label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="เพิ่มเติม..." />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">ยกเลิก</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
