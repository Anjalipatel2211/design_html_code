import { quickActions, toneClasses } from '../constants/dashboardData';

export default function QuickActions() {
  return (
    <section>
      <div className="grid grid-cols-9 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const tone = toneClasses[action.tone];
          return (
            <button
              key={action.label}
              className="group flex min-h-[52px] flex-col items-center gap-1 rounded-lg border border-[#EEF2F7] bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
              title={action.label}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${tone.soft}`}>
                <Icon className={tone.text} size={20} strokeWidth={2} />
              </span>
              <span className="text-[10px] font-medium leading-tight text-[#0F172A] line-clamp-2">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
