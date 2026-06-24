import { ChevronDown, ChevronRight, ClipboardList, RefreshCw, UserRound, UsersRound } from 'lucide-react';

export default function StaffTransfer() {
  return (
    <section className="card-surface overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-4">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#2563EB]">
            <UsersRound size={20} />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-[#0F172A]">Transfer Encounters</h2>
            <p className="mt-0.5 text-[11px] font-medium text-[#94A3B8]">Reassign encounters to staff</p>
          </div>
        </div>
        {/* <button className="flex items-center gap-1 text-[12px] font-medium text-[#2563EB]">
          View all <ChevronRight size={14} />
        </button> */}
      </div>

      {/* Unassigned Encounters Card */}
      <div className="mb-4 flex items-center justify-between rounded-lg border-l-4 border-l-red-400 border border-red-200 bg-red-50 px-3 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-red-600">
            <ClipboardList size={18} />
          </span>
          <span className="text-[12px] font-medium text-[#334155]">Unassigned</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-medium text-red-600">3</span>
        </div>
      </div>

      {/* Assign Section */}
      <div className="border-t border-[#E5E7EB] py-4">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-[#0F172A]">
          <UserRound size={16} className="text-[#2563EB]" /> Assign to Scribe
        </div>
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-between rounded-lg border border-[#DDE4EE] bg-white px-3 text-[12px] font-medium text-[#94A3B8]">
            <span className="flex items-center gap-2"><UserRound size={14} /> Select staff</span>
            <ChevronDown size={14} />
          </button>
          <button className="flex h-8 min-w-[72px] items-center justify-center rounded-lg bg-[#4F46E5] text-[12px] font-medium text-white hover:bg-[#4338CA]">
            Assign
          </button>
        </div>
      </div>

      {/* Auto Assign Section */}
      <div className="border-t border-[#E5E7EB] py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2">
            <RefreshCw size={18} className="mt-0.5 shrink-0 text-[#2563EB]" />
            <div>
              <div className="text-[13px] font-medium text-[#0F172A]">Auto Assign</div>
              <p className="mt-0.5 max-w-[200px] text-[11px] font-medium text-[#94A3B8]">
                Automatically assign to next available scribe
              </p>
            </div>
          </div>
          <button className="flex h-8 min-w-fit items-center gap-1.5 rounded-lg border border-[#4F46E5] px-3 text-[12px] font-medium text-[#4F46E5] hover:bg-indigo-50">
            <RefreshCw size={13} /> Auto Assign
          </button>
        </div>
      </div>

      {/* Staff Workload Card */}
      <button className="group w-full rounded-lg border border-[#E5E7EB] bg-blue-50 px-3 py-3 text-left transition hover:border-blue-300 hover:bg-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UsersRound size={20} className="text-[#4F46E5]" />
            <div>
              <div className="text-[13px] font-medium text-[#4F46E5]">Manage Staff Workload</div>
              <div className="mt-0.5 text-[11px] font-medium text-[#7C3AED]">View capacity & availability</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#4F46E5] group-hover:translate-x-1 transition" />
        </div>
      </button>
    </section>
  );
}
