import { getGroupSummary, sheetIds } from '@/lib/googleSheets';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const groupId = id as keyof typeof sheetIds;
  
  if (!sheetIds[groupId]) {
    return <div className="p-10 text-center text-xl text-red-500 glass-panel rounded-2xl">ไม่พบกลุ่มงานที่ระบุ</div>;
  }

  const groupData = await getGroupSummary(groupId);

  const groupTitles = {
    academic: 'กลุ่มบริหารงานวิชาการ',
    planning: 'กลุ่มงานแผนงานและงบประมาณ',
    personnel: 'กลุ่มบริหารงานบุคคล',
    general: 'กลุ่มบริหารงานทั่วไป',
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden glass-panel rounded-2xl p-7 flex items-center gap-7">
        <div className="flex flex-col gap-2 z-10 w-full">
          <h1 className="text-[26px] font-black m-0 tracking-tight text-slate-900 keep-all">{groupTitles[groupId]}</h1>
          <div className="flex items-center gap-6 flex-wrap mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-slate-700 font-bold keep-all">จำนวนงานทั้งหมด</span>
              <span className="text-[12px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full shadow-sm border border-indigo-500 keep-all">{groupData.jobCount || 0} งาน</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-slate-700 font-bold keep-all">จำนวนโครงการทั้งหมด</span>
              <span className="text-[12px] font-black bg-sky-600 text-white px-3 py-1 rounded-full shadow-sm border border-sky-500 keep-all">{groupData.projectCount || 0} โครงการ</span>
            </div>
          </div>
        </div>
      </div>

      {groupData.hasDiscrepancy && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-r-2xl shadow-sm mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-rose-800 font-bold text-lg keep-all">พบข้อมูลไม่สอดคล้องกัน (Discrepancy Detected)</h3>
          </div>
          <p className="text-rose-700 text-[14px] keep-all">
            ระบบพบว่ายอดเงินที่คุณกรอกไว้ใน <strong className="font-extrabold">&quot;หน้าสรุป (รวม...)&quot;</strong> ไม่ตรงกับยอดเงินจริงที่ <strong className="font-extrabold">บวกจากทุกแผ่นงานย่อยรวมกัน</strong> 
            (ยอดที่แสดงในระบบ Web App ตอนนี้ คือยอดจริงที่บวกจากแผ่นงานย่อยทั้งหมด ซึ่งมีความถูกต้องแม่นยำกว่าหน้าสรุป)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {groupData.isAllocatedMismatch && (
              <div className="bg-white/60 p-4 rounded-xl border border-rose-100">
                <div className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 keep-all">ส่วนต่าง &quot;งบจัดสรร&quot;</div>
                <div className="text-[13px] text-slate-700 space-y-1">
                  <div className="flex justify-between border-b border-rose-100 pb-1">
                    <span className="keep-all">ยอดที่คุณกรอกในหน้าสรุป:</span>
                    <span className="font-semibold">{(groupData.summaryAllocated || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                  </div>
                  <div className="flex justify-between border-b border-rose-100 pb-1">
                    <span className="keep-all">ยอดที่บวกจากแผ่นงานย่อย:</span>
                    <span className="font-semibold text-emerald-600">{(groupData.totalAllocated || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-rose-700 keep-all">ส่วนต่างที่หายไป (หรือเกินมา):</span>
                    <span className="font-black text-rose-600">{Math.abs((groupData.summaryAllocated || 0) - (groupData.totalAllocated || 0)).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                  </div>
                </div>
              </div>
            )}
            
            {groupData.isSpentMismatch && (
              <div className="bg-white/60 p-4 rounded-xl border border-rose-100">
                <div className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 keep-all">ส่วนต่าง &quot;ยอดใช้ไป&quot;</div>
                <div className="text-[13px] text-slate-700 space-y-1">
                  <div className="flex justify-between border-b border-rose-100 pb-1">
                    <span className="keep-all">ยอดที่คุณกรอกในหน้าสรุป:</span>
                    <span className="font-semibold">{(groupData.summarySpent || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                  </div>
                  <div className="flex justify-between border-b border-rose-100 pb-1">
                    <span className="keep-all">ยอดที่บวกจากแผ่นงานย่อย:</span>
                    <span className="font-semibold text-emerald-600">{(groupData.totalSpent || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-rose-700 keep-all">ส่วนต่างที่หายไป (หรือเกินมา):</span>
                    <span className="font-black text-rose-600">{Math.abs((groupData.summarySpent || 0) - (groupData.totalSpent || 0)).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
          <h3 className="text-[13px] font-extrabold text-slate-600 mb-2 keep-all uppercase tracking-wide">รวมงบจัดสรร</h3>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{(groupData.totalAllocated || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[16px] font-bold text-slate-600">บาท</span></div>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-600"></div>
          <h3 className="text-[13px] font-extrabold text-slate-600 mb-2 keep-all uppercase tracking-wide">รวมใช้จ่ายไปแล้ว</h3>
          <div className="text-3xl font-black text-rose-600 tracking-tight">{(groupData.totalSpent || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[16px] font-bold text-rose-500">บาท</span></div>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
          <h3 className="text-[13px] font-extrabold text-slate-600 mb-2 keep-all uppercase tracking-wide">รวมคงเหลือ</h3>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">{(groupData.totalRemaining || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[16px] font-bold text-emerald-500">บาท</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groupData.projects.map((project: any) => {
          const percent = project.allocated > 0 ? (project.spent / project.allocated) * 100 : 0;
          
          // Format project name to prevent tearing parentheses
          const formatProjectName = (name: string) => {
            const match = name.match(/^(.*?)\s*(\(.*?\))$/);
            if (match) {
              return <>{match[1]} <span className="inline-block">{match[2]}</span></>;
            }
            return name;
          };

          return (
            <div key={project.tabName} className="glass-panel rounded-2xl p-6 flex flex-col h-full group relative overflow-hidden">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 leading-snug keep-all">{formatProjectName(project.name)}</h3>
              
              <div className="space-y-3 mb-6 flex-1 text-[15px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold keep-all">จัดสรร:</span>
                  <span className="font-extrabold text-slate-900 keep-all">{(project.allocated || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold keep-all">ใช้ไป:</span>
                  <span className="font-extrabold text-rose-600 keep-all">{(project.spent || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold keep-all">คงเหลือ:</span>
                  <span className="font-extrabold text-emerald-600 keep-all">{(project.remaining || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-3 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                </div>
                <span className="text-[16px] font-black text-slate-900">{percent.toFixed(0)}%</span>
              </div>

              <Link href={`/group/${groupId}/project/${encodeURIComponent(project.tabName)}`} className="w-full mt-auto">
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg border border-indigo-500 keep-all">
                  รายละเอียด
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
