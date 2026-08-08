'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchGroupSummaryAction, fetchProjectDetailsAction } from './actions';
import { LogOut, LayoutDashboard, ChevronRight, ArrowLeft } from 'lucide-react';
import TransactionTable from './TransactionTable';

const GROUPS = [
  { id: 'academic', label: 'กลุ่มบริหารงานวิชาการ' },
  { id: 'planning', label: 'กลุ่มงานแผนงานและงบประมาณ' },
  { id: 'personnel', label: 'กลุ่มบริหารงานบุคคล' },
  { id: 'general', label: 'กลุ่มบริหารงานทั่วไป' },
];

export default function AdminDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const loadGroup = async (groupId: string) => {
    setLoading(true);
    setSelectedGroup(groupId);
    setSelectedProject(null);
    setProjectData(null);
    try {
      const data = await fetchGroupSummaryAction(groupId);
      setGroupData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (tabName: string) => {
    setLoading(true);
    setSelectedProject(tabName);
    try {
      const data = await fetchProjectDetailsAction(selectedGroup!, tabName);
      setProjectData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToGroup = () => {
    setSelectedProject(null);
    setProjectData(null);
    if (selectedGroup) loadGroup(selectedGroup); // refresh group data
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-lg leading-tight">Admin</h1>
            <p className="text-xs text-slate-500 font-medium">จัดการงบประมาณ</p>
          </div>
        </div>
        <div className="p-4 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">กลุ่มงาน</p>
          <div className="space-y-1">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => loadGroup(g.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                  selectedGroup === g.id
                    ? 'bg-sky-50 text-sky-700 shadow-sm shadow-sky-100 border border-sky-100'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {g.label}
                {selectedGroup === g.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
              {user.displayName.charAt(0)}
            </div>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="text-sm font-bold text-slate-700">{user.displayName}</p>
              <p className="text-xs text-slate-500">{user.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 py-2.5 rounded-lg text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading && !projectData && !groupData ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : selectedProject && projectData ? (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={handleBackToGroup} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 w-fit transition-transform hover:-translate-x-1">
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับไปกลุ่มงาน
            </button>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-800 mb-2">{projectData.projectName}</h2>
              <div className="flex gap-6 text-sm font-medium">
                <span className="text-slate-500">งบจัดสรร: <span className="text-sky-600 font-bold">{projectData.allocated.toLocaleString()} บาท</span></span>
                <span className="text-slate-500">ใช้ไป: <span className="text-red-500 font-bold">{projectData.spent.toLocaleString()} บาท</span></span>
                <span className="text-slate-500">คงเหลือ: <span className="text-emerald-500 font-bold">{projectData.remaining.toLocaleString()} บาท</span></span>
              </div>
            </div>

            <TransactionTable 
              groupId={selectedGroup!} 
              tabName={selectedProject} 
              initialData={projectData.transactions} 
              onDataChange={() => loadProject(selectedProject)} 
            />
          </div>
        ) : selectedGroup && groupData ? (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              {GROUPS.find(g => g.id === selectedGroup)?.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupData.projects.map((p: any) => (
                <button
                  key={p.tabName}
                  onClick={() => loadProject(p.tabName)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-sky-200 transition-all text-left flex flex-col gap-3 group"
                >
                  <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2">{p.name}</h3>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">คงเหลือ</p>
                      <p className={`font-black ${p.remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {p.remaining.toLocaleString()} ฿
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-sky-50 text-slate-400 group-hover:text-sky-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {groupData.projects.length === 0 && (
               <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                 <p className="text-slate-400 font-medium">ไม่พบโครงการในกลุ่มงานนี้</p>
               </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 font-medium text-lg flex-col gap-4">
            <LayoutDashboard className="w-16 h-16 opacity-20" />
            <p>เลือกกลุ่มงานจากเมนูด้านซ้ายเพื่อเริ่มต้น</p>
          </div>
        )}
      </main>
    </div>
  );
}
