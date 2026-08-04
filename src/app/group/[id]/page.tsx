import { getGroupSummary, sheetIds } from '@/lib/googleSheets';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GroupPage({ params }: { params: { id: keyof typeof sheetIds } }) {
  const { id } = params;
  
  if (!sheetIds[id]) {
    return <div className="p-10 text-center text-xl text-red-500 glass-panel rounded-2xl">ไม่พบกลุ่มงานที่ระบุ</div>;
  }

  const groupData = await getGroupSummary(id);

  const groupTitles = {
    academic: 'กลุ่มบริหารงานวิชาการ',
    planning: 'กลุ่มงานแผนงานและงบประมาณ',
    personnel: 'กลุ่มบริหารงานบุคคล',
    general: 'กลุ่มบริหารงานทั่วไป',
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden glass-panel rounded-2xl p-7 flex items-center gap-7">
        <div className="w-[76px] h-[76px] bg-white rounded-[18px] flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.04)] p-1.5 shrink-0 border-2 border-white/90">
          <span className="text-4xl">📁</span>
        </div>
        <div className="flex flex-col gap-2 z-10">
          <h1 className="text-[26px] font-black m-0 tracking-[-0.8px] bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">{groupTitles[id]}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[13px] text-slate-600 font-medium">รายชื่อโครงการทั้งหมดภายในกลุ่มงาน</span>
            <span className="text-[11px] font-bold bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(79,70,229,0.15)]">{groupData.projects.length} โครงการ</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รวมงบจัดสรร</span>
          <span className="text-3xl font-black text-slate-900">฿{(groupData.totalAllocated || 0).toLocaleString('th-TH')}</span>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รวมใช้จ่ายไปแล้ว</span>
          <span className="text-3xl font-black text-red-600">฿{(groupData.totalSpent || 0).toLocaleString('th-TH')}</span>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รวมคงเหลือ</span>
          <span className="text-3xl font-black text-emerald-600">฿{(groupData.totalRemaining || 0).toLocaleString('th-TH')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {groupData.projects.map((project: any) => {
          const percent = project.allocated > 0 ? (project.spent / project.allocated) * 100 : 0;
          return (
            <Link key={project.tabName} href={`/group/${id}/project/${encodeURIComponent(project.tabName)}`}>
              <div className="glass-panel rounded-2xl p-5 hover:scale-[1.01] transition-transform cursor-pointer h-full flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:opacity-20 transition-opacity">📄</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pr-8 line-clamp-2">{project.name}</h3>
                  <div className="space-y-2 text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">งบจัดสรร:</span>
                      <span className="font-bold text-slate-700">฿{(project.allocated || 0).toLocaleString('th-TH')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">ใช้ไป:</span>
                      <span className="font-bold text-red-600">฿{(project.spent || 0).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-900/5">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1">คงเหลือ</span>
                      <span className="text-xl font-black text-emerald-600">฿{(project.remaining || 0).toLocaleString('th-TH')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">{percent.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
