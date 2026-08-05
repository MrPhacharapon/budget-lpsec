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
        <div className="absolute top-[-50%] right-[-20%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.06)_0%,rgba(217,119,6,0)_70%)] pointer-events-none"></div>
        <div className="w-[76px] h-[76px] bg-white rounded-[18px] flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.04)] p-1.5 shrink-0 border-2 border-white/90">
          <span className="text-4xl">🏫</span>
        </div>
        <div className="flex flex-col gap-2 z-10">
          <h1 className="text-[26px] font-black m-0 tracking-[-0.8px] bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">ทะเบียนคุมงบประมาณ</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[13px] text-slate-600 font-medium">ตามแผนปฏิบัติการ ศูนย์การศึกษาพิเศษประจำจังหวัดลำปาง</span>
            <span className="text-[11px] font-bold bg-gradient-to-br from-amber-600 to-amber-700 text-white px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(217,119,6,0.15)]">ปีการศึกษา 2569</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Budget KPI */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-600 transition-all group-hover:w-1.5"></div>
          <div className="w-14 h-14 rounded-[18px] bg-sky-600/10 text-sky-600 flex items-center justify-center text-2xl shadow-[inset_0_2px_8px_rgba(255,255,255,0.5)] border border-white/30 shrink-0">
            <Wallet className="h-6 w-6" />
          </div>
          <div className="flex-1 z-10">
            <h3 className="text-xs font-extrabold text-slate-600 mb-1.5 uppercase tracking-[0.8px]">จำนวนเงินจัดสรร</h3>
            <div className="text-2xl font-extrabold text-slate-900 tracking-[-0.6px]">{totalAllocated.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
          </div>
        </div>

        {/* Spent KPI */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-600 transition-all group-hover:w-1.5"></div>
          <div className="w-14 h-14 rounded-[18px] bg-amber-600/10 text-amber-600 flex items-center justify-center text-2xl shadow-[inset_0_2px_8px_rgba(255,255,255,0.5)] border border-white/30 shrink-0">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div className="flex-1 z-10">
            <h3 className="text-xs font-extrabold text-slate-600 mb-1.5 uppercase tracking-[0.8px]">จำนวนเงินที่ใช้ไป</h3>
            <div className="text-2xl font-extrabold text-slate-900 tracking-[-0.6px] mb-1">{totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
            <p className="text-[11px] text-slate-600 font-medium">เบิกจ่ายไปแล้ว {percentSpent.toFixed(1)}% ของงบประมาณ</p>
          </div>
        </div>

        {/* Remaining KPI */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 transition-all group-hover:w-1.5"></div>
          <div className="w-14 h-14 rounded-[18px] bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-2xl shadow-[inset_0_2px_8px_rgba(255,255,255,0.5)] border border-white/30 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1 z-10">
            <h3 className="text-xs font-extrabold text-slate-600 mb-1.5 uppercase tracking-[0.8px]">จำนวนเงินคงเหลือ</h3>
            <div className="text-2xl font-extrabold text-slate-900 tracking-[-0.6px]">{totalRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
          </div>
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
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-4 border-b-2 border-slate-900/10 whitespace-nowrap">กลุ่มบริหารงาน</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-4 border-b-2 border-slate-900/10 whitespace-nowrap text-right">จำนวนเงินจัดสรร (บาท)</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-4 border-b-2 border-slate-900/10 whitespace-nowrap text-right">จำนวนเงินที่ใช้ไป (บาท)</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-4 border-b-2 border-slate-900/10 whitespace-nowrap text-right">คงเหลือ (บาท)</th>
                  <th className="bg-slate-900/5 text-slate-900 font-extrabold p-4 border-b-2 border-slate-900/10 whitespace-nowrap text-center">อัตราเบิกจ่าย</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const percent = group.data?.totalAllocated ? ((group.data.totalSpent / group.data.totalAllocated) * 100) : 0;
                  return (
                    <tr key={group.title} className="hover:bg-white/45 transition-all border-b border-slate-900/5">
                      <td className="p-4 text-slate-900 font-semibold">
                        <div className="flex items-center gap-2">
                          {group.title}
                          {group.data?.hasDiscrepancy && (
                            <span 
                              className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap cursor-help"
                              title="ยอดจัดสรรหรือยอดใช้ไปใน 'หน้าสรุป' ไม่ตรงกับยอดรวมจริงที่บวกจาก 'แผ่นงานย่อย'"
                            >
                              ⚠️ ยอดหน้าสรุปไม่ตรง
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-900 text-right">{(group.data?.totalAllocated || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-red-600 font-bold text-right">{(group.data?.totalSpent || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-emerald-600 font-bold text-right">{(group.data?.totalRemaining || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-slate-900 text-center font-bold text-sky-600">{percent.toFixed(2)}%</td>
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
