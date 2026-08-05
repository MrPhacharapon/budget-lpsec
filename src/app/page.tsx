import { getGroupSummary } from '@/lib/googleSheets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Wallet, TrendingDown, CheckCircle2 } from 'lucide-react';

// ISR (Incremental Static Regeneration) - ดึงข้อมูลใหม่ทุกๆ 60 วินาที
export const revalidate = 60;

export default async function DashboardPage() {
  // ดึงข้อมูล 4 กลุ่มงานแบบขนาน (Parallel Fetching) เพื่อความเร็วสูงสุด
  const [academic, planning, personnel, general] = await Promise.all([
    getGroupSummary('academic').catch(() => null),
    getGroupSummary('planning').catch(() => null),
    getGroupSummary('personnel').catch(() => null),
    getGroupSummary('general').catch(() => null),
  ]);

  const groups = [
    { title: 'กลุ่มบริหารงานวิชาการ', data: academic },
    { title: 'กลุ่มงานแผนงานและงบประมาณ', data: planning },
    { title: 'กลุ่มบริหารงานบุคคล', data: personnel },
    { title: 'กลุ่มบริหารงานทั่วไป', data: general },
  ].filter(g => g.data !== null);

  const totalAllocated = groups.reduce((sum, g) => sum + (g.data?.totalAllocated || 0), 0);
  const totalSpent = groups.reduce((sum, g) => sum + (g.data?.totalSpent || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const percentSpent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Web Brand Banner */}
      <div className="relative overflow-hidden glass-panel rounded-2xl p-7 flex items-center gap-7">
        <div className="flex flex-col gap-2 z-10 w-full">
          <h1 className="text-[26px] font-black m-0 tracking-tight text-slate-800 keep-all">ทะเบียนคุมงบประมาณ</h1>
          <div className="flex items-center gap-4 flex-wrap mt-1">
            <span className="text-[14px] text-slate-700 font-bold keep-all">ตามแผนปฏิบัติการ ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง</span>
            <span className="text-[12px] font-black bg-sky-600 text-white px-3 py-1 rounded-full shadow-md border border-sky-500 keep-all">ปีการศึกษา 2569</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Budget KPI */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
          <h3 className="text-[13px] font-extrabold text-slate-600 mb-2 keep-all uppercase tracking-wide">รวมงบจัดสรร</h3>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{totalAllocated.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[16px] font-bold text-slate-600">บาท</span></div>
        </div>

        {/* Spent KPI */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
          <h3 className="text-[13px] font-extrabold text-slate-600 mb-2 keep-all uppercase tracking-wide">รวมใช้จ่ายไปแล้ว</h3>
          <div className="text-3xl font-black text-rose-600 tracking-tight">{totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[16px] font-bold text-rose-500">บาท</span></div>
        </div>

        {/* Remaining KPI */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
          <h3 className="text-[13px] font-extrabold text-slate-600 mb-2 keep-all uppercase tracking-wide">รวมคงเหลือ</h3>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">{totalRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[16px] font-bold text-emerald-500">บาท</span></div>
        </div>

      </div>

      {/* Data Tables / Group Summaries */}
      <div className="glass-panel rounded-2xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-white/50 flex flex-col">
          <h2 className="text-base font-extrabold text-slate-900 tracking-[-0.3px]">ตารางสรุปงบประมาณรายกลุ่มงาน</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14.5px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-4 border-b-2 border-indigo-900/10 whitespace-nowrap keep-all">กลุ่มบริหารงาน</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-4 border-b-2 border-indigo-900/10 whitespace-nowrap text-right keep-all">จำนวนเงินจัดสรร (บาท)</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-4 border-b-2 border-indigo-900/10 whitespace-nowrap text-right keep-all">ใช้ไป (บาท)</th>
                  <th className="bg-indigo-900/5 text-slate-800 font-extrabold p-4 border-b-2 border-indigo-900/10 whitespace-nowrap text-right rounded-tr-2xl keep-all">คงเหลือ (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  return (
                    <tr key={group.title} className="hover:bg-slate-50/50 transition-all border-b border-slate-50">
                      <td className="p-4 text-slate-900 font-extrabold keep-all">
                        <div className="flex items-center gap-2">
                          {group.title}
                          {group.data?.hasDiscrepancy && (
                            <span 
                              className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md whitespace-nowrap cursor-help shadow-sm"
                              title="ยอดจัดสรรหรือยอดใช้ไปใน 'หน้าสรุป' ไม่ตรงกับยอดรวมจริงที่บวกจาก 'แผ่นงานย่อย'"
                            >
                              ยอดไม่ตรง
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-800 font-bold text-right keep-all">{(group.data?.totalAllocated || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="p-4 text-rose-600 font-bold text-right keep-all">{(group.data?.totalSpent || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="p-4 text-emerald-600 font-bold text-right keep-all">{(group.data?.totalRemaining || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
