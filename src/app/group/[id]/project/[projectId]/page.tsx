import { getProjectDetails, sheetIds } from '@/lib/googleSheets';
import Link from 'next/link';
import TransactionForm from '@/components/TransactionForm';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: { id: keyof typeof sheetIds, projectId: string } }) {
  const { id, projectId } = params;
  const decodedTabName = decodeURIComponent(projectId);
  
  if (!sheetIds[id]) {
    return <div className="p-10 text-center text-xl text-red-500 glass-panel rounded-2xl">ไม่พบกลุ่มงานที่ระบุ</div>;
  }

  let projectData;
  try {
    projectData = await getProjectDetails(id, decodedTabName);
  } catch (error) {
    return <div className="p-10 text-center text-xl text-red-500 glass-panel rounded-2xl">ไม่พบข้อมูลโครงการหรือเกิดข้อผิดพลาด</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href={`/group/${id}`} className="px-4 py-2 bg-white/60 hover:bg-white border border-white/50 shadow-sm rounded-xl text-slate-700 font-bold transition-all flex items-center gap-2">
          <span>⬅️</span> ย้อนกลับ
        </Link>
        <div className="flex-1 glass-panel rounded-2xl py-3 px-6 flex justify-between items-center">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{projectData.projectName}</h1>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md border border-indigo-200">Sheet: {projectData.tabName}</span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
        <div className="flex-1 border-r border-slate-200/50 text-center px-4">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รายรับสะสมตามแผน</span>
          <span className="text-2xl font-black text-slate-900">฿{(projectData.allocated || 0).toLocaleString('th-TH')}</span>
        </div>
        <div className="flex-1 border-r border-slate-200/50 text-center px-4">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รายจ่ายสะสมจริง</span>
          <span className="text-2xl font-black text-red-600">฿{(projectData.spent || 0).toLocaleString('th-TH')}</span>
        </div>
        <div className="flex-1 text-center px-4">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">จำนวนเงินคงเหลือ</span>
          <span className="text-2xl font-black text-emerald-600">฿{(projectData.remaining || 0).toLocaleString('th-TH')}</span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl shadow-indigo-900/5">
        <div className="px-6 py-5 border-b border-white/50 flex justify-between items-center bg-white/30">
          <h2 className="text-lg font-extrabold text-slate-900">ตารางทะเบียนคุมงบประมาณ</h2>
          <TransactionForm groupId={id} tabName={decodedTabName} />
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-3 border-b-2 border-slate-900/10 text-center w-[60px]">ที่</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-3 border-b-2 border-slate-900/10 w-[120px]">วัน/เดือน/ปี</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-3 border-b-2 border-slate-900/10 min-w-[200px]">รายการ</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-3 border-b-2 border-slate-900/10 text-right w-[120px]">รับ (บาท)</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-3 border-b-2 border-slate-900/10 text-right w-[120px]">จ่าย (บาท)</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-3 border-b-2 border-slate-900/10 text-right w-[130px]">คงเหลือ (บาท)</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-3 border-b-2 border-slate-900/10">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {projectData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-500 font-medium">ยังไม่มีรายการเบิกจ่าย</td>
                  </tr>
                ) : (
                  projectData.transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-white/60 transition-all border-b border-slate-900/5">
                      <td className="p-3 text-slate-600 text-center">{tx.no}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{tx.date}</td>
                      <td className="p-3 text-slate-900 font-medium">{tx.description}</td>
                      <td className="p-3 text-emerald-600 font-bold text-right">{tx.received > 0 ? tx.received.toLocaleString('th-TH') : '-'}</td>
                      <td className="p-3 text-red-600 font-bold text-right">{tx.paid > 0 ? tx.paid.toLocaleString('th-TH') : '-'}</td>
                      <td className="p-3 text-slate-900 font-bold text-right">{tx.remaining > 0 ? tx.remaining.toLocaleString('th-TH') : '-'}</td>
                      <td className="p-3 text-slate-500 text-[13px]">{tx.note}</td>
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
