import type { Metadata } from 'next';
import { Outfit, Sarabun } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai"],
});

export const metadata: Metadata = {
  title: 'ระบบติดตามและควบคุมงบประมาณ',
  description: 'ศูนย์การศึกษาพิเศษประจำจังหวัดลำปาง',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.onerror = function(msg, url, line, col, error) {
            var errDiv = document.createElement('div');
            errDiv.style.position = 'fixed';
            errDiv.style.top = '0';
            errDiv.style.left = '0';
            errDiv.style.width = '100%';
            errDiv.style.background = '#dc2626';
            errDiv.style.color = 'white';
            errDiv.style.padding = '20px';
            errDiv.style.zIndex = '999999';
            errDiv.style.wordBreak = 'break-all';
            errDiv.style.fontSize = '14px';
            errDiv.innerHTML = '<b>🚨 [System Crash]</b><br/>' + msg + '<br/><small>Line: ' + line + ', Col: ' + col + '</small>';
            document.body.appendChild(errDiv);
          };
          window.onunhandledrejection = function(e) {
            var errDiv = document.createElement('div');
            errDiv.style.position = 'fixed';
            errDiv.style.bottom = '0';
            errDiv.style.left = '0';
            errDiv.style.width = '100%';
            errDiv.style.background = '#d97706';
            errDiv.style.color = 'white';
            errDiv.style.padding = '20px';
            errDiv.style.zIndex = '999999';
            errDiv.style.wordBreak = 'break-all';
            errDiv.style.fontSize = '14px';
            errDiv.innerHTML = '<b>⚠️ [Network/Promise Error]</b><br/>' + (e.reason ? e.reason.message || e.reason : 'Unknown reason');
            document.body.appendChild(errDiv);
          };
        `}} />
      </head>
      <body
        className={`min-h-screen ${sarabun.className} antialiased overflow-hidden`}
      >
        <div className="flex h-screen w-full relative z-10 p-4 gap-4">
          
          {/* Floating Sidebar Styling (macOS Window Effect) */}
          <aside className="hidden w-[280px] sidebar-glass rounded-2xl flex-col shadow-xl md:flex z-50">
            <div className="flex items-center gap-3 px-4 py-6 border-b border-slate-900/5 mb-6">
              <div className="w-11 h-11 bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.04)] border border-slate-900/5 p-1.5 flex-shrink-0 flex items-center justify-center">
                <span className="text-2xl">🏫</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-extrabold text-slate-900 leading-[1.2] tracking-[-0.3px]">ระบบคุมงบประมาณ</h2>
                <span className="text-[11px] text-slate-600 font-medium">ปีการศึกษา 2569</span>
              </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
              <a href="/" className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-[0_8px_20px_-5px_rgba(217,119,6,0.3)] font-bold text-sm transition-all">
                <span className="w-5 text-center text-base">📊</span>
                <span>แผงควบคุมหลัก (Dashboard)</span>
              </a>
              
              <div className="text-[10.5px] font-extrabold uppercase tracking-[1.8px] px-3 pt-5 pb-1.5 text-slate-900/35">กลุ่มบริหารงาน</div>
              
              <a href="/group/academic" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-600 font-semibold text-sm hover:bg-white/65 hover:text-slate-900 border border-transparent hover:border-white/50 transition-all">
                <span className="w-5 text-center text-base">🎓</span>
                <span>กลุ่มบริหารงานวิชาการ</span>
              </a>
              <a href="/group/planning" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-600 font-semibold text-sm hover:bg-white/65 hover:text-slate-900 border border-transparent hover:border-white/50 transition-all">
                <span className="w-5 text-center text-base">📋</span>
                <span>กลุ่มงานแผนงานและงบประมาณ</span>
              </a>
              <a href="/group/personnel" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-600 font-semibold text-sm hover:bg-white/65 hover:text-slate-900 border border-transparent hover:border-white/50 transition-all">
                <span className="w-5 text-center text-base">👥</span>
                <span>กลุ่มบริหารงานบุคคล</span>
              </a>
              <a href="/group/general" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-600 font-semibold text-sm hover:bg-white/65 hover:text-slate-900 border border-transparent hover:border-white/50 transition-all">
                <span className="w-5 text-center text-base">📁</span>
                <span>กลุ่มบริหารงานทั่วไป</span>
              </a>
            </nav>
            
            <div className="p-4 border-t border-slate-900/5 mt-2">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900/5 hover:bg-slate-900/10 text-slate-700 font-semibold rounded-xl transition-all">
                <span>🛡️</span> ระบบ admin
              </button>
            </div>
          </aside>

          {/* Main Panel */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="h-16 sidebar-glass rounded-xl flex items-center justify-between px-6 mb-6 z-40 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-slate-500">หน้าหลัก</span>
                  <span className="text-[10px] text-slate-400">▶</span>
                  <span className="text-slate-900">แผงควบคุมหลัก</span>
                </div>
              </div>
              <div>
                <span className="flex items-center gap-2 text-xs font-bold bg-white/60 border border-white/50 px-3.5 py-1.5 rounded-full text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_10px_#059669]"></span>
                  เชื่อมต่อระบบ Sheets สำเร็จ
                </span>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto pb-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
