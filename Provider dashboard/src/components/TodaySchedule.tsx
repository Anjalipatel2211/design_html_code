import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Code2,
  Filter,
  Mic,
  // RotateCcw,
  Square,
  Play,
  Trash2,
  Pause,
  Check,
} from 'lucide-react';
import {appointments,toneClasses,statusColors,appointmentStatuses,} from '../constants/dashboardData';
export default function TodaySchedule() {

const [selectedStatus, setSelectedStatus] = useState('All Status ');

const [scheduleData, setScheduleData] = useState(appointments);

const [recordingId, setRecordingId] = useState<number | null>(null);

const [seconds, setSeconds] = useState(0);

const [snippets, setSnippets] = useState<Record<number, string[]>>({});
const [isRecording, setIsRecording] = useState(false);

const startRecording = (id: number) => {
  setRecordingId(id);
  setIsRecording(true);

  setScheduleData((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            status: 'Recording In Progress',
          }
        : item
    )
  );
};

const pauseRecording = () => {
  setIsRecording(false);
};

const stopRecording = () => {
  if (!recordingId) return;

  const count =
  (snippets[recordingId]?.length || 0) + 1;

const newSnippet = `Recording ${count}`;

  setSnippets((prev) => ({
    ...prev,
    [recordingId]: [...(prev[recordingId] || []), newSnippet],
  }));

  setIsRecording(false);
  setSeconds(0);
};

const resetRecording = () => {
  setSeconds(0);
  setIsRecording(false);
};

const deleteSnippet = (
  appointmentId: number,
  snippet: string
) => {
  setSnippets((prev) => ({
    ...prev,
    [appointmentId]: (prev[appointmentId] || []).filter(
      (s) => s !== snippet
    ),
  }));
};

const finishRecording = (appointmentId: number) => {
  setScheduleData((prev) =>
    prev.map((item) =>
      item.id === appointmentId
        ? {
            ...item,
            status: 'Recording Ready for Scribe',
            lastUpdated: new Date().toLocaleTimeString(),
          }
        : item
    )
  );

  setRecordingId(null);
  setSeconds(0);
  setIsRecording(false);
};

useEffect(() => {
  let interval: number;

  if (recordingId && isRecording) {
    interval = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }

  return () => clearInterval(interval);
}, [recordingId, isRecording]);


const formatTime = (value: number) => {
  const hrs = String(Math.floor(value / 3600)).padStart(2, '0');
  const mins = String(Math.floor((value % 3600) / 60)).padStart(2, '0');
  const secs = String(value % 60).padStart(2, '0');

  return `${hrs}:${mins}:${secs}`;
};

const filteredAppointments =
  selectedStatus === 'All Status '
    ? scheduleData
    : scheduleData.filter(
        (item) => item.status === selectedStatus
      );
  return (
    <section className="card-surface flex  max-h-[calc(100vh-190px)] min-h-[635px] flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">

      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-3">
        <h2 className="text-[14px] font-medium text-[#0F172A]">Today's Schedule</h2>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 text-[12px] font-medium text-[#2563EB]">
            View Calendar <CalendarDays size={14} />
          </button>
          <div className="relative">
  <select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    className="
      h-9
      min-w-[140px]
      appearance-none
      rounded-xl
      border border-[#E5E7EB]
      bg-white
      pl-3
      pr-10
      text-[13px]
      font-medium
      text-[#64748B]
      shadow-sm
      outline-none
      cursor-pointer
    "
  >
    {appointmentStatuses.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>

  <Filter
    size={18}
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#334155]"
  />
</div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden divide-y divide-[#E5E7EB]">
        {filteredAppointments.map((item, index) => {
          const tone =
  toneClasses[
    statusColors[item.status] || 'slate'
  ];
          return (
            <div
              key={item.id}
              className={`
                grid grid-cols-[80px_1fr] gap-4 px-3 py-2 min-h-[52px]
                transition-all duration-150
                ${recordingId === item.id ? 'border border-blue-100 bg-blue-50/40' : ''}
              `}
            >
              {/* Timeline */}
              <div className="flex items-start justify-center relative">
                <span
                  className={`text-[13px] font-medium ${
                    recordingId === item.id ? 'text-[#2563EB]' : 'text-[#0F172A]'
                  }`}
                >
                  {item.appointmentTime}

                  <p className="text-[10px] text-[#94A3B8]">
                         {item.appointmentDate}
                        </p>
                </span>
                

                {/* Dot */}
                <span
    className={`h-3 w-3 rounded-full ring-0 ring-white z-10 absolute top-[22px] left-[76px] transition-all duration-150 ${
      recordingId === item.id
        ? 'bg-[#2563EB]'
        : tone.solid
    }`}
                />

                {/* Connector line — starts below dot, runs to bottom of row */}
                {index < filteredAppointments.length - 1 && (
  <span className="absolute left-[82px] top-[34px] h-[calc(100%+12px)] w-px bg-[#CBD5E1]" />
)}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-3">

                  {/* Patient Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => startRecording(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"
                        >
                          <Mic size={16} />
                        </button>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-medium text-[#0F172A]">
                          {item.patientName}
                        </h3>
                        
                        {/* FIX #16: font-normal instead of font-medium; tracking-wide for readability */}
                        <p className="text-[11px] font-normal tracking-wide text-[#94A3B8]">
                          {item.visitType} / {item.age}Y / {item.gender}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge + Next Time */}
                  <div className="flex flex-col items-end gap-1">
                    {/* FIX #14: whitespace-nowrap + overflow-hidden + text-ellipsis; removed text-center */}
                    <span
                      className={`
                        inline-block max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis
                        leading-none rounded-md px-2.5 py-[5px]
                        text-[10px] font-medium
                        ${tone.badge}
                      `}
                    >
                      {item.status}
                    </span>
                    <div className="text-[11px] font-medium text-[#94A3B8]">
                      Updated: {item.lastUpdated}
                    </div>
                  </div>
                </div>

                {/* Suggested Code Button */}
                {item.suggestedCodes && (
                  <div className="mt-2 flex justify-end">
                    <button className="inline-flex items-center gap-1 rounded-md border border-green-300 px-2.5 py-1 text-[10px] font-medium text-green-600">
                      <Code2 size={12} /> View Suggested Codes
                    </button>
                  </div>
                )}

                {/* Recording Controls */}
                {recordingId === item.id && (
  <div className="mt-3 rounded-lg border border-blue-100 bg-white p-3">
    
    <div className="mb-3 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-medium text-blue-600">
        Recording · {formatTime(seconds)}
      </span>
    </div>

    <div className="flex flex-wrap gap-2">

      <button
        onClick={resetRecording}
        className="rounded-md border px-3 py-1 text-xs"
      >
        Reset
      </button>

      <button
        onClick={() =>
          isRecording
            ? pauseRecording()
            : startRecording(item.id)
        }
        className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white"
      >
        {isRecording ? (
          <>
            <Pause size={12} /> Pause
          </>
        ) : (
          <>
            <Mic size={12} /> Start
          </>
        )}
      </button>

      <button
        onClick={stopRecording}
        className="rounded-md bg-red-600 px-3 py-1 text-xs text-white"
      >
        <Square size={12} />
        Stop
      </button>
    </div>
  </div>
                )}

                {/* Snippets */}
                {snippets[item.id]?.length > 0 && (
  <div className="mt-3 space-y-2">

    {snippets[item.id].map((snippet) => (
      <div
        key={snippet}
        className="flex items-center justify-between rounded border px-2 py-2"
      >
        <div className="flex items-center gap-2">
          <Play size={14} />
          <span className="text-xs">
            {snippet}
          </span>
        </div>

        <button
          onClick={() =>
            deleteSnippet(item.id, snippet)
          }
        >
          <Trash2
            size={14}
            className="text-red-500"
          />
        </button>
      </div>
    ))}

    <button
      onClick={() =>
        finishRecording(item.id)
      }
      className="w-full rounded-md bg-green-600 py-2 text-xs font-medium text-white"
    >
      <Check size={14} className="inline mr-1" />
      Done
    </button>

  </div>
)}
              </div>
            </div>
           
          );
         
        })}
        
      </div>
    </section>
  );

  
}
