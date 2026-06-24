import { CalendarDays, ChevronDown } from 'lucide-react';
import { toneClasses, workflowStages, workflowStats } from '../constants/dashboardData';

export default function WorkflowOverview() {
  return (
    <section className="card-surface flex flex-col gap-3  main-h-[700px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[#0F172A]">Workflow Overview</h2>
        <button className="flex h-8 items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 text-[12px] font-medium text-[#334155]">
          <CalendarDays size={14} /> Apr 28 - May 04 <ChevronDown size={13} />
        </button>
      </div>

      <div className="relative mb-4">
  {/* Line */}
  <div className="absolute top-[18px] left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-green-500 via-orange-500 via-blue-500 via-purple-500 to-blue-600" />

  <div className="relative grid grid-cols-3 gap-2 sm:grid-cols-6">
    {workflowStages.map((stage) => {
      const Icon = stage.icon;
      const tone = toneClasses[stage.tone];

      return (
        <div
          key={stage.label}
          className="flex flex-col items-center text-center"
        >
          <div
            className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white ${tone.border}`}
          >
            <Icon
              className={tone.text}
              size={18}
              strokeWidth={2}
            />
          </div>

          <div
            className={`mt-2 min-h-[28px] text-[9px] font-semibold leading-tight ${tone.text}`}
          >
            {stage.label}
          </div>

          <div className="mt-2 text-[14px] font-semibold text-slate-900">
            {stage.count}
          </div>

          <div className="text-[8px] text-slate-500">
            Patients
          </div>
        </div>
      );
    })}
  </div>
</div>

<div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:divide-x sm:divide-gray-200">
    {workflowStats.map((stat) => {
      const Icon = stat.icon;
      const tone = toneClasses[stat.tone];

      return (
        <div
          key={stat.label}
          className="flex items-center gap-2 px-2"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.soft}`}
          >
            <Icon
              className={tone.text}
              size={14}
            />
          </div>

          <div>
            <div className="text-[8px] text-slate-500">
              {stat.label}
            </div>

            <div
              className={`text-[13px] font-semibold ${
                stat.label.includes('%')
                  ? tone.text
                  : 'text-slate-900'
              }`}
            >
              {stat.value}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
    </section>
  );
}