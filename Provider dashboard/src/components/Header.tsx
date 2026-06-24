import { Bell, CalendarDays, ChevronDown, MapPin, Moon, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-[52px] items-center gap-4 border-b border-[#E5E7EB] bg-white px-4 2xl:px-5">
      {/* Welcome Section */}
      <div>
        <h1 className="text-[15px] font-medium leading-5 text-[#0F172A]">Welcome, Dr. Anderson</h1>
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#94A3B8]">
          <CalendarDays size={13} className="text-[#2563EB]" />
          <span className="hidden sm:inline">Tuesday, April 28, 2026</span>
          <span className="sm:hidden">Apr 28</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-auto hidden w-full max-w-[400px] lg:block">
        <label className="relative block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
          <input
            className="h-8 w-full rounded-lg border border-[#DDE4EE] bg-[#F8FAFC] pl-9 pr-3 text-[12px] font-medium text-slate-700 outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
            placeholder="Search patient"
            type="search"
          />
        </label>
      </div>

      {/* Right Controls */}
      <div className="ml-auto flex items-center gap-1.5">
        <button className="hidden h-8 items-center gap-2 rounded-lg border border-[#DDE4EE] bg-white px-2.5 text-[12px] font-medium text-[#64748B] shadow-sm md:flex">
          <MapPin size={14} className="text-[#2563EB]" />
          North Clinic
          <ChevronDown size={13} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DDE4EE] bg-white text-[#334155] shadow-sm">
          <Moon size={16} />
        </button>
        
        {/* Notification Bell with Badge */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#DDE4EE] bg-white text-[#334155] shadow-sm">
          <Bell size={16} />
          <span className="absolute grid h-3.5 w-3.5 place-items-center rounded-full bg-[#EF4444] text-[9px] font-medium text-white" style={{ right: '-3px', top: '-3px' }}>
            3
          </span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 hover:bg-slate-50">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200 text-[11px] font-medium text-[#2563EB] ring-2 ring-white">
            JA
          </div>
          <div className="hidden text-left xl:block">
            <div className="text-[12px] font-medium leading-3 text-[#0F172A]">James Anderson</div>
            <div className="text-[10px] font-medium leading-2 text-[#94A3B8]">MD</div>
          </div>
          <ChevronDown className="hidden text-[#475569] xl:block" size={14} />
        </button>
      </div>
    </header>
  );
}
