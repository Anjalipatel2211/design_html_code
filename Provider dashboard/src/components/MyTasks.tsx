import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, MoreVertical, Plus, SlidersHorizontal } from 'lucide-react';
import { tasks, toneClasses } from '../constants/dashboardData';

const tabs = ['All (6)', 'Due Today (2)', 'Overdue (1)', 'Completed'];

const priorityClass: Record<string, string> = {
  High: 'bg-red-50 text-[#EF4444]',
  Medium: 'bg-orange-50 text-[#F97316]',
  Low: 'bg-green-50 text-[#22C55E]',
};

const statusClass: Record<string, string> = {
  'In Review': 'bg-blue-50 text-[#2563EB]',
  'In Progress': 'bg-blue-50 text-[#2563EB]',
  Pending: 'bg-purple-50 text-[#8B5CF6]',
};

const dueColorClass: Record<string, string> = {
  overdue: 'text-[#EF4444] font-medium',
  today: 'text-[#F59E0B] font-medium',
  future: 'text-[#94A3B8]',
};

export default function MyTasks() {
  const [activeTab, setActiveTab] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const toggleRow = (index: number) => {
    setChecked((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));
  };

  const getDueClass = (dueText: string) => {
    if (dueText.includes('Today')) return dueColorClass.today;
    if (dueText.includes('Overdue')) return dueColorClass.overdue;
    return dueColorClass.future;
  };

  return (
    <section className="card-surface h-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-5">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-[#2563EB]">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h2 className="text-[16px] font-medium text-[#0F172A]">My Tasks</h2>
            <p className="mt-0.5 text-[12px] font-medium text-[#94A3B8]">Track and manage your tasks</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8]">
          View all <ChevronRight size={16} />
        </button>
      </div>

      {/* Tabs & Add Button */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="grid auto-cols-fr grid-cols-4 overflow-hidden rounded-lg border border-[#DDE4EE] bg-white">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`px-2 py-2.5 text-[12px] font-medium transition ${
                activeTab === index ? 'bg-blue-50 text-[#2563EB] shadow-[inset_0_-2px_0_#2563EB]' : 'text-[#64748B] hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="flex h-8 min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-3 text-[12px] font-medium text-white shadow-sm hover:bg-[#1D4ED8]">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#DDE4EE] bg-white">
        {/* Header Row */}
        <div className="grid h-11 grid-cols-[40px_0.35fr_0.2fr_0.2fr_0.15fr_0.15fr_40px] items-center border-b border-[#E5E7EB] bg-slate-50 px-4 text-[12px] font-medium text-[#64748B]">
          <input type="checkbox" className="h-4 w-4 rounded border-[#CBD5E1] accent-[#2563EB]" />
          <div>Task</div>
          <div>Patient</div>
          <div className="flex items-center gap-1">Due <ChevronDown size={14} /></div>
          <div>Priority</div>
          <div>Status</div>
          <SlidersHorizontal size={14} className="justify-self-center" />
        </div>

        {/* Data Rows */}
        {tasks.map((task, index) => {
          const Icon = task.icon;
          const tone = toneClasses[task.tone];
          const dueClass = getDueClass(task.due);
          const isHovered = hoveredRow === index;
          
          return (
            <div
              key={task.task}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
              className="grid min-h-[44px] grid-cols-[40px_0.35fr_0.2fr_0.2fr_0.15fr_0.15fr_40px] items-center border-t border-[#E5E7EB] px-4 text-[13px] font-medium text-[#334155] hover:bg-[#F8FAFC]"
            >
              <input
                checked={checked.includes(index)}
                onChange={() => toggleRow(index)}
                type="checkbox"
                className="h-4 w-4 rounded border-[#CBD5E1] accent-[#2563EB]"
              />
              <div className="flex min-w-0 items-center gap-2">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${tone.soft}`}>
                  <Icon size={14} className={tone.text} />
                </span>
                <span className="min-w-0 truncate text-[#0F172A] font-medium" title={task.task}>
                  {task.task}
                </span>
              </div>
              <div className="truncate text-[12px] text-[#475569]">{task.patient}</div>
              <div className={`text-[12px] ${dueClass}`}>{task.due}</div>
              <div>
                <span className={`inline-block rounded-md px-2 py-1 text-[11px] font-medium ${priorityClass[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              <div>
                <span className={`inline-block rounded-md px-2 py-1 text-[11px] font-medium ${statusClass[task.status]}`}>
                  {task.status}
                </span>
              </div>
              <button className={`justify-self-center transition ${isHovered ? 'text-[#334155]' : 'text-[#94A3B8]'}`}>
                <MoreVertical size={16} />
              </button>
            </div>
          );
        })}

        {/* Footer */}
        <div className="flex h-14 items-center justify-between border-t border-[#E5E7EB] px-4 bg-slate-50">
          <div className="text-[12px] font-medium text-[#64748B]">Showing 1 to 5 of 6 tasks</div>
          <div className="flex items-center gap-2">
            <button className="grid h-7 w-7 place-items-center rounded-md border border-[#DDE4EE] text-[#94A3B8] hover:bg-white">
              <ChevronLeft size={14} />
            </button>
            <button className="grid h-7 w-7 place-items-center rounded-md bg-[#2563EB] text-[11px] font-medium text-white">
              1
            </button>
            <button className="grid h-7 w-7 place-items-center rounded-md border border-[#DDE4EE] text-[11px] font-medium text-[#475569] hover:bg-white">
              2
            </button>
            <button className="grid h-7 w-7 place-items-center rounded-md border border-[#DDE4EE] text-[#2563EB] hover:bg-white">
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#64748B]">
            Rows per page
            <button className="flex h-8 items-center gap-2 rounded-lg border border-[#DDE4EE] px-2.5 font-medium text-[#475569] hover:bg-white">
              10 <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
