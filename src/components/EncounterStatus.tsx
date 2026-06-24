import { CalendarDays, Check, Clock3, UserRound } from 'lucide-react';
import { encounterStages } from '../constants/dashboardData';

export default function EncounterStatus() {
  return (
    <section className="card-surface main-h-[700px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[#0F172A]">Encounter Status</h2>
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-[#2563EB]">
            <UserRound size={18} />
          </div>
          <div>
            <div className="text-[12px] font-medium text-[#0F172A]">Robert Johnson</div>
            <div className="text-[10px] font-medium text-[#2563EB]">ID: APT-2045</div>
          </div>
        </div>
      </div>

<div className="relative mt-8">
  {/* Connector Line */}
  <div className="absolute left-[8%] right-[8%] top-4 border-t-2 border-dashed border-gray-300">
  </div>

  <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-6">
    {encounterStages.map((stage) => {
      const Icon = stage.icon;
      const isCompleted = stage.complete;

      return (
        <div
          key={stage.label}
          className="flex flex-col items-center text-center"
        >
          {/* Circle */}
          <div
            className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white ${
              isCompleted
                ? 'border-green-400 text-green-600'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            <Icon size={20} />
          </div>

          {/* Label */}
          <div
            className={`mt-3 min-h-[40px] text-[11px] font-semibold ${
              isCompleted
                ? 'text-green-600'
                : 'text-slate-600'
            }`}
          >
            {stage.label}
          </div>

          {/* Badge */}
          <span
            className={`mt-2 rounded-lg px-3 py-1 text-[8px] font-medium ${
              isCompleted
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-slate-600'
            }`}
          >
            {stage.state}
          </span>

          {/* Date */}
          <div className="mt-4 space-y-2 text-[9px] text-slate-500">
            <div className="flex items-center justify-center gap-1">
              <CalendarDays size={12} />
              <span>{stage.date}</span>
            </div>

            <div className="flex items-center justify-center gap-1">
              <Clock3 size={12} />
              <span>{stage.time}</span>
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