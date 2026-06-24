import { kpis, toneClasses } from '../constants/dashboardData';

export default function KPISection() {

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 ">
      {kpis.map((metric) => {
        const Icon = metric.icon;
        const tone = toneClasses[metric.tone];
        // const trend = trends[metric.title];
        const isTurnaround = metric.title === 'Average Turnaround Time';
        
        return (
          <article key={metric.title} className="card-surface flex min-h-[80px] min-w-[160px]  flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
            {/* Icon and Header Row */}
            <div className="flex items-start gap-3">
              <div className={`grid h-11 w-11 shrink-0 place content-center place-items-center rounded-lg ${tone.soft}`}>
                <Icon className={tone.text} size={28} strokeWidth={2} />
              </div>
              <p className="flex-1 text-[13px] font-medium leading-tight text-[#64748B]">{metric.title}</p>
            </div>

            {/* KPI Value */}
            <div className="flex items-baseline gap-2 place-content-center ">
              <p className={`${isTurnaround ? 'text-[22px]' : 'text-[28px]'} font-medium leading-tight  text-[#0F172A] `}>
                {metric.value}
              </p>
            
            </div>
          </article>
        );
      })}
    </section>
  );
}
