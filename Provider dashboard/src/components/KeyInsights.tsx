import { FileText, Clock, PieChart, Gauge } from 'lucide-react';

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E9ECF1] shadow-sm p-3 active:bg-slate-50/60 transition-colors h-full">
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  iconBg,
  iconColor,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="text-[11px] font-medium text-[#1E293B] truncate">{label}</div>
    </div>
  );
}

// ---------- Line chart card ----------

type ChartCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  changePct: number;
  data: number[];
  lineColor: string;
  fillColorTop: string;
};

function LineChartCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  changePct,
  data,
  lineColor,
  fillColorTop,
}: ChartCardProps) {
  const w = 220;
  const h = 72;
  const padTop = 6;
  const padBottom = 14;
  const max = Math.max(...data);
  const axisMax = Math.ceil(max / 25) * 25 || 25;
  const niceTicks = [
    0,
    Math.round(axisMax / 3 / 5) * 5,
    Math.round((axisMax * 2) / 3 / 5) * 5,
    axisMax,
  ];

  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => padTop + (1 - v / axisMax) * (h - padTop - padBottom);

  const linePoints = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPoints = `0,${h - padBottom} ${linePoints} ${w},${h - padBottom}`;
  const gradId = `grad-${label.replace(/\s+/g, '-')}`;

  return (
    <CardShell>
      <CardHeader icon={icon} iconBg={iconBg} iconColor={iconColor} label={label} />

      {/* Value + change */}
      <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
        <div className="text-[17px] font-semibold text-[#0F172A] leading-none">{value}</div>
        <div className="flex items-center gap-0.5 text-[9px] font-medium text-[#16A34A]">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {changePct}%
        </div>
      </div>

      {/* Chart */}
      <div className="flex gap-1.5">
        <div
          className="flex flex-col justify-between text-[8px] text-[#A3AEC0] leading-none flex-shrink-0"
          style={{ height: h, paddingTop: padTop, paddingBottom: padBottom }}
        >
          {[...niceTicks].reverse().map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full block" preserveAspectRatio="none" height={h}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColorTop} stopOpacity="0.3" />
                <stop offset="100%" stopColor={fillColorTop} stopOpacity="0" />
              </linearGradient>
            </defs>

            {niceTicks.map((t, i) => (
              <line
                key={i}
                x1={0}
                x2={w}
                y1={y(t)}
                y2={y(t)}
                stroke="#EEF1F6"
                strokeWidth="1"
                strokeDasharray={t === 0 ? '0' : '3 3'}
              />
            ))}

            <polygon points={areaPoints} fill={`url(#${gradId})`} />

            <polyline
              points={linePoints}
              fill="none"
              stroke={lineColor}
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {data.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="2.25" fill={lineColor} />
            ))}
          </svg>
        </div>
      </div>
    </CardShell>
  );
}

// ---------- Donut chart card ----------

const donut = {
  segments: [
    { color: '#3b82f6', pct: 46, label: 'In Progress', count: 7 },
    { color: '#f59e0b', pct: 13, label: 'Pending Review', count: 8 },
    { color: '#6366f1', pct: 11, label: 'Completed', count: 46 },
    { color: '#22c55e', pct: 3, label: 'On Hold', count: 2 },
  ],
};

function DonutCard() {
  const cx = 26, cy = 26, r = 19, strokeW = 5.5;
  let cum = 0;
  return (
    <CardShell>
      <CardHeader icon={<PieChart size={13} />} iconBg="#EAF1FF" iconColor="#3B82F6" label="Status" />

      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 relative">
          <svg width={52} height={52} viewBox="0 0 52 52">
            {donut.segments.map((seg, i) => {
              const start = (cum / 100) * 2 * Math.PI - Math.PI / 2;
              cum += seg.pct;
              const end = (cum / 100) * 2 * Math.PI - Math.PI / 2;
              const x1 = cx + r * Math.cos(start);
              const y1 = cy + r * Math.sin(start);
              const x2 = cx + r * Math.cos(end);
              const y2 = cy + r * Math.sin(end);
              const large = seg.pct > 50 ? 1 : 0;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeW}
                  strokeLinecap="butt"
                />
              );
            })}
            <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1f2937">
              63
            </text>
          </svg>
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          {donut.segments.map((s, i) => (
            <div key={i} className=" font-medium flex items-center gap-1.5 text-[9px]">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[#334155] flex-1 truncate">{s.label}</span>
              <span className="font-medium flex-shrink-0 text-[11px] text-[#334155]">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

    </CardShell>
  );
}

// ---------- Radial chart card ----------

function RadialCard() {
  const pct = 0.92;
  const r = 17;
  const circ = 2 * Math.PI * r;
  return (
    <CardShell>
      <CardHeader icon={<Gauge size={13} />} iconBg="#EAFBF0" iconColor="#22C55E" label="SLA Compliance" />

      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 flex-shrink-0">
          <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
            <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5.5" />
            <circle
              cx="22" cy="22" r={r}
              fill="none"
              stroke="#22c55e"
              strokeWidth="5.5"
              strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-semibold text-gray-800">92%</span>
          </div>
        </div>
        <div>
          <div className="text-[12px] font-medium text-[#1E293B]">On Track</div>
          <div className="text-[9px] text-[#334155] mt-0.5">Meeting SLA</div>
        </div>
      </div>
    </CardShell>
  );
}

// ---------- Panel ----------

export default function KeyInsights() {
  const docsData = [38, 20, 35, 42, 60, 32, 44];
  const hrsData = [35, 18, 23, 19, 30, 28, 51, 30, 50];

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-3.5 w-full max-w-[305px] mx-auto sm:mx-0">
      {/* Header — wraps gracefully on very narrow screens instead of clipping the button */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h2 className="text-[13px] font-medium text-[#0F172A]">Key Insights</h2>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] font-medium text-[#94A3B8] border border-[#DDE4EE] rounded-md px-2.5 py-1.5 min-h-[28px] hover:bg-slate-50 active:bg-slate-100 transition-colors"
        >
          Last 7 Days
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-2">
        <LineChartCard
          icon={<FileText size={13} />}
          iconBg="#EAF1FF"
          iconColor="#3B82F6"
          label="Documents Created"
          value="48"
          changePct={18}
          data={docsData}
          lineColor="#3B82F6"
          fillColorTop="#3B82F6"
        />
        <LineChartCard
          icon={<Clock size={13} />}
          iconBg="#F1ECFE"
          iconColor="#8B5CF6"
          label="Hours Saved"
          value="16h 24m"
          changePct={22}
          data={hrsData}
          lineColor="#8B5CF6"
          fillColorTop="#8B5CF6"
        />
        <DonutCard />
        <RadialCard />
      </div>
    </div>
  );
}