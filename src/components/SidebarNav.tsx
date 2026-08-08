'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, PieChart, Users, Layers, Settings } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'ภาพรวม (Overview)', icon: LayoutDashboard },
    { type: 'divider', label: 'กลุ่มบริหารงาน' },
    { href: '/group/academic', label: 'กลุ่มบริหารงานวิชาการ', icon: BookOpen },
    { href: '/group/planning', label: 'กลุ่มงานแผนงานและงบประมาณ', icon: PieChart },
    { href: '/group/personnel', label: 'กลุ่มบริหารงานบุคคล', icon: Users },
    { href: '/group/general', label: 'กลุ่มบริหารงานทั่วไป', icon: Layers },
    { type: 'divider', label: 'ระบบจัดการ' },
    { href: '/admin', label: 'สำหรับผู้ดูแลระบบ', icon: Settings },
  ];

  return (
    <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
      {navItems.map((item, idx) => {
        if (item.type === 'divider') {
          return (
            <div key={`div-${idx}`} className="text-[13px] font-extrabold uppercase tracking-wide px-3 pt-5 pb-2 text-slate-500">
              {item.label}
            </div>
          );
        }

        const href = item.href || '';
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href!}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 keep-all group ${
              item.href === '/' ? 'text-[16px]' : 'text-[14px]'
            } ${
              isActive
                ? 'bg-white/95 text-sky-700 shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white'
                : 'text-slate-600 hover:bg-white/60 hover:text-sky-700 border border-transparent'
            }`}
          >
            {Icon && (
              <div className={`p-2 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-sky-100/50 text-sky-600 shadow-sm' 
                  : 'bg-white/50 text-slate-500 shadow-sm group-hover:bg-white group-hover:text-sky-600'
              }`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </div>
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
