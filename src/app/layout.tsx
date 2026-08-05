import type { Metadata } from 'next';
import { Outfit, Sarabun } from "next/font/google";
import "./globals.css";
import SidebarNav from "@/components/SidebarNav";

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
            <div className="flex items-center gap-3 px-5 py-7 border-b border-slate-100 mb-4">
              <div className="w-14 h-14 shrink-0">
                <img src="https://i.postimg.cc/8kKrvnfY/removebg-preview.png" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[15px] font-black text-slate-800 leading-[1.2] tracking-tight keep-all">ระบบคุมงบประมาณ</h2>
                <span className="text-[11px] text-slate-500 font-medium keep-all">ปีการศึกษา 2569</span>
              </div>
            </div>
            
            <SidebarNav />
            
            
          </aside>

          {/* Main Panel */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
