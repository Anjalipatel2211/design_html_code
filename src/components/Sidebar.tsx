// import { ChevronLeft } from 'lucide-react';
import { navGroups } from '../constants/dashboardData';

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[212px] shrink-0 border-r border-[#E5E7EB] bg-white lg:flex lg:flex-col">
      {/* Logo Section */}
      {/* <div className="flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 shrink-0 rounded-full bg-white shadow-sm ring-1 ring-slate-100">
            <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-[#2563EB]" />
            <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-[#F97316]" />
            <span className="absolute left-2.5 top-2 text-2xl font-black italic text-white">A</span>
          </div>
          <div className="min-w-0">
            <div className="font-serif text-2xl leading-6 tracking-tight text-[#244061]">nalytica</div>
            <div className="mt-0.5 h-px w-20 bg-[#F97316]" />
            <div className="text-right text-[7px] font-bold tracking-widest text-[#F97316]">HCS</div>
          </div>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500">
          <ChevronLeft size={16} />
        </button>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-6">
        {navGroups.map((group, groupIndex) => (
          <div key={group.heading ?? 'primary'} className={groupIndex > 0 ? 'border-t border-slate-100 pt-4' : ''}>
            {group.heading && (
              <div className="mb-2 px-3 text-[11px] font-medium capitalize text-[#94A3B8]">
                {group.heading}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = 'active' in item && item.active;
                return (
                  <button
                    key={item.label}
                    className={`flex h-[38px] w-full items-center gap-3 rounded-lg px-4 py-2.5 transition ${
                      active
                        ? 'bg-blue-50 text-[#2563EB]'
                        : 'text-[#475569] hover:bg-slate-50 hover:text-[#2563EB]'
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    <span className="flex-1 min-w-0 text-left text-[14px] font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="flex h-[18px] min-w-[28px] items-center justify-center rounded-full bg-blue-100 px-2 text-[10px] font-medium text-[#2563EB]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
