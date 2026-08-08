import { getProjectDetails, sheetIds } from '@/lib/googleSheets';
import Link from 'next/link';
import TransactionForm from '@/components/TransactionForm';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string, projectId: string }> }) {
  const { id, projectId } = await params;
  const groupId = id as keyof typeof sheetIds;
  const decodedTabName = decodeURIComponent(projectId);
  
  if (!sheetIds[groupId]) {
    return <div className="p-10 text-center text-xl text-red-500 glass-panel rounded-2xl">ไม่พบกลุ่มงานที่ระบุ</div>;
  }

  let projectData;
  try {
    projectData = await getProjectDetails(groupId, decodedTabName);
  } catch (error) {
    return <div className="p-10 text-center text-xl text-red-500 glass-panel rounded-2xl">ไม่พบข้อมูลโครงการหรือเกิดข้อผิดพลาด</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href={`/group/${id}`} className="px-4 py-2.5 bg-white/90 hover:bg-white border border-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-xl text-indigo-700 font-bold transition-all flex items-center gap-2 keep-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> 
          ย้อนกลับ
        </Link>
        <div className="flex-1 glass-panel rounded-2xl py-3 px-6 flex justify-between items-center">
          <h1 className="text-xl font-black text-slate-900 tracking-tight keep-all">{projectData.projectName}</h1>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 w-full md:border-r border-slate-200/50 text-center px-4 relative overflow-hidden group">
          <span className="block text-[13px] font-extrabold text-slate-600 uppercase tracking-wide mb-2 keep-all">รายรับสะสมตามแผน</span>
          <span className="text-3xl font-black text-slate-900">{(projectData.allocated || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-[16px] font-bold text-slate-600">บาท</span></span>
        </div>
        <div className="flex-1 w-full md:border-r border-slate-200/50 text-center px-4 relative overflow-hidden group">
          <span className="block text-[13px] font-extrabold text-slate-600 uppercase tracking-wide mb-2 keep-all">รายจ่ายสะสมจริง</span>
          <span className="text-3xl font-black text-rose-600">{(projectData.spent || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-[16px] font-bold text-rose-500">บาท</span></span>
        </div>
        <div className="flex-1 w-full text-center px-4 relative overflow-hidden group">
          <span className="block text-[13px] font-extrabold text-slate-600 uppercase tracking-wide mb-2 keep-all">จำนวนเงินคงเหลือ</span>
          <span className="text-3xl font-black text-emerald-600">{(projectData.remaining || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-[16px] font-bold text-emerald-500">บาท</span></span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl shadow-indigo-900/5">
        <div className="px-6 py-5 border-b border-white/50 flex justify-between items-center bg-white/30">
          <h2 className="text-lg font-extrabold text-slate-900">ตารางทะเบียนคุมงบประมาณ</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-3 border-b-2 border-indigo-900/10 text-center w-[60px] keep-all">ที่</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-3 border-b-2 border-indigo-900/10 w-[120px] keep-all">วัน/เดือน/ปี</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-3 border-b-2 border-indigo-900/10 min-w-[200px] keep-all">รายการ</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-3 border-b-2 border-indigo-900/10 text-right w-[140px] keep-all">รับ (บาท)</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-3 border-b-2 border-indigo-900/10 text-right w-[140px] keep-all">จ่าย (บาท)</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-3 border-b-2 border-indigo-900/10 text-right w-[150px] keep-all">คงเหลือ (บาท)</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-3 border-b-2 border-indigo-900/10 keep-all">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {projectData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-500 font-medium">ยังไม่มีรายการเบิกจ่าย</td>
                  </tr>
                ) : (
                  projectData.transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-white/80 transition-all border-b border-slate-200/60">
                      <td className="p-3 text-slate-600 text-center font-medium keep-all">{tx.no}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap font-medium keep-all">{tx.date}</td>
                      <td className="p-3 text-slate-900 font-bold keep-all">{tx.description}</td>
                      <td className="p-3 text-emerald-600 font-extrabold text-right keep-all">{tx.received > 0 ? tx.received.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}</td>
                      <td className="p-3 text-rose-600 font-extrabold text-right keep-all">{tx.paid > 0 ? tx.paid.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}</td>
                      <td className="p-3 text-slate-900 font-extrabold text-right keep-all">{(tx.remaining || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="p-3 text-slate-500 text-[13px] font-medium keep-all">{tx.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
