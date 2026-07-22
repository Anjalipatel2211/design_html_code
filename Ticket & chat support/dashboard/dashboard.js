/* ============================================================
   Provider Dashboard — Vanilla JS
   Sections in this file (in order):
     • Helpers & icon registry
     • Static data (KPIs, schedule, workflow, tasks, etc.)
     • KPI Cards (renders into .stat-cards)
     • Quick Actions
     • Today's Schedule (recording timer, snippets, filter)
     • Workflow Overview + Encounter Queue
     • Key Insights (line / donut / radial)
     • My Tasks (tabs, table, pagination, add modal)
     • Staff Transfer (assign modal)
     • Init
   ============================================================ */

(() => {
'use strict';

/* =========================
   Helpers
========================= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const fa = (name, classes = '') => `<i class="fa ${name} ${classes}"></i>`;

const TONE = {
  blue:   'blue-st',
  green:  'green-st',
  orange: 'orange-st',
  red:    'red-st',
  purple: 'purple-st'
};

const statusPillClass = (status) => {
  const map = {
    'Pending': 'awaiting',
    'Recording In Progress': 'recording',
    'Recording Ready for Scribe': 'recording-ready',
    'Provider Review Pending': 'provider-review',
    'Provider Review Completed': 'provider-review-done',
    'Ready for EHR': 'ready-ehr'
  };
  return map[status] || 'awaiting';
};

const statusLabel = (status) => status;

/* =========================
   Static data
========================= */
const KPIS = [
  { title: 'Total Schedule',           value: '24',     icon: 'fa-calendar-days',  tone: 'green'  },
  { title: 'Pending Dictation',        value: '8',      icon: 'fa-microphone',     tone: 'orange' },
  { title: 'Review Pending',           value: '5',      icon: 'fa-file-pen',       tone: 'red'    },
  { title: 'Pending Tasks',            value: '12',     icon: 'fa-clipboard-check',tone: 'purple' },
  { title: 'Avg Turnaround Time',      value: '2h 18m', icon: 'fa-clock',          tone: 'blue',   turnaround: true }
];

const QUICK_ACTIONS = [
  { label:'Walk-in Patient', icon:'fa-user-plus',      tone:'blue'   },
  { label:'Batch Dictation', icon:'fa-microphone',     tone:'purple' },
  { label:'Upload Document', icon:'fa-cloud-arrow-up', tone:'green'  },
  { label:'Global Template', icon:'fa-globe',          tone:'orange' },
  { label:'My Template',     icon:'fa-file-pen',       tone:'red'    },
  { label:'Smart Notes',     icon:'fa-clipboard-list', tone:'purple' },
  { label:'Macro',           icon:'fa-file-lines',     tone:'green'  },
  { label:'Ana Playbook',    icon:'fa-book-open',      tone:'blue'   },
  { label:'Transfer',        icon:'fa-arrows-rotate',  tone:'orange' }
];

// const QUICK_ACTIONS = [
//   { label: 'Walk-in Patient',  icon: 'fa-user-plus',       tone: 'blue'   },
//   { label: 'Batch Dictation',  icon: 'fa-microphone',      tone: 'orange' },
//   { label: 'Upload Document',  icon: 'fa-cloud-arrow-up',  tone: 'blue'   },
//   { label: 'Global Template',  icon: 'fa-globe',           tone: 'green'  },
//   { label: 'My Template',      icon: 'fa-file-pen',        tone: 'red'    },
//   { label: 'Smart Notes',      icon: 'fa-clipboard-list',  tone: 'blue'   },
//   { label: 'Macro',            icon: 'fa-file-lines',      tone: 'purple' },
//   { label: 'Ana Playbook',     icon: 'fa-book-open',       tone: 'blue'   },
//   { label: 'Transfer',         icon: 'fa-arrows-rotate',   tone: 'orange' }
// ];

const APPOINTMENT_STATUSES = [
  'All Status',
  'Pending',
  'Recording In Progress',
  'Recording Ready for Scribe',
  'Provider Review Pending',
  'Provider Review Completed',
  'Ready for EHR'
];

const APPOINTMENTS = [
  { id:1, appointmentTime:'9:00 AM',  appointmentDate:'2026-04-28', patientName:'Robert Johnson',  visitType:'Office Visit',  age:52, gender:'M', status:'Provider Review Completed', lastUpdated:'09:45 AM', suggestedCodes:true,  snippets:[] },
  { id:2, appointmentTime:'9:45 AM',  appointmentDate:'2026-04-28', patientName:'Maria Garcia',    visitType:'Follow Up',     age:45, gender:'F', status:'Provider Review Completed', lastUpdated:'10:30 AM', suggestedCodes:true,  snippets:[] },
  { id:3, appointmentTime:'10:30 AM', appointmentDate:'2026-04-28', patientName:'James Lee',       visitType:'New Patient',   age:60, gender:'M', status:'Pending',                    lastUpdated:'10:32 AM', suggestedCodes:false, snippets:[] },
  { id:4, appointmentTime:'11:15 AM', appointmentDate:'2026-04-28', patientName:'Linda Brown',     visitType:'Consultation',  age:38, gender:'F', status:'Pending',                    lastUpdated:'11:20 AM', suggestedCodes:false, snippets:[] },
  { id:5, appointmentTime:'12:00 PM', appointmentDate:'2026-04-28', patientName:'Michael Davis',   visitType:'Follow Up',     age:47, gender:'M', status:'Recording Ready for Scribe', lastUpdated:'12:15 PM', suggestedCodes:false, snippets:[] },
  { id:6, appointmentTime:'12:45 PM', appointmentDate:'2026-04-28', patientName:'Sarah Wilson',    visitType:'Telehealth',    age:34, gender:'F', status:'Provider Review Pending',    lastUpdated:'01:05 PM', suggestedCodes:false, snippets:[] },
  { id:7, appointmentTime:'1:30 PM',  appointmentDate:'2026-04-28', patientName:'David Martinez',  visitType:'Office Visit',  age:50, gender:'M', status:'Ready for EHR',              lastUpdated:'02:10 PM', suggestedCodes:false, snippets:[] },
  { id:8, appointmentTime:'2:15 PM',  appointmentDate:'2026-04-28', patientName:'Emily Taylor',    visitType:'Follow Up',     age:29, gender:'F', status:'Ready for EHR',              lastUpdated:'03:00 PM', suggestedCodes:false, snippets:[] }
];

const WORKFLOW_STAGES = [
  { label: 'Encounter',                  count: 120, icon: 'fa-users',            tone: 'green'  },
  { label: 'Recording Pending',          count: 85,  icon: 'fa-file-pen',         tone: 'orange' },
  { label: 'Review Pending',             count: 52,  icon: 'fa-magnifying-glass', tone: 'blue'   },
  { label: 'Ready for EHR Integration',            count: 31,  icon: 'fa-cloud-arrow-up',   tone: 'purple' },
  { label: 'Ready for EHR Sign-Off',               count: 12,  icon: 'fa-clipboard-check',  tone: 'purple' },
  { label: 'Ready for Coding',                   count: 240, icon: 'fa-code',             tone: 'blue'   }
];

const WORKFLOW_STATS = [
  { label: 'Total Patients', value: '540',   icon: 'fa-users',           tone: 'blue'   },
  { label: 'Completed %',    value: '44.4%', icon: 'fa-chart-line',      tone: 'green'  },
  { label: 'In Progress %',  value: '47.4%', icon: 'fa-clock',           tone: 'orange' },
  { label: 'Pending %',      value: '8.2%',  icon: 'fa-hourglass-half',  tone: 'purple' }
];

const ENCOUNTER_STEPS = [
  { label:'Encounter',                  state:'Completed', date:'Apr 30, 2026', time:'09:15 AM', complete:true,  icon:'fa-clipboard-list' },
  { label:'Recording Pending',          state:'Completed', date:'May 01, 2026', time:'10:30 AM', complete:true,  icon:'fa-file-pen' },
  { label:'Review Pending',             state:'Completed', date:'May 01, 2026', time:'03:45 PM', complete:true,  icon:'fa-file-lines' },
  { label:'Ready for EHR Integration',            state:'Pending',   date:'-',            time:'-',        complete:false, icon:'fa-cloud-arrow-up' },
  { label:'Ready for EHR Sign-Off',               state:'Pending',   date:'-',            time:'-',        complete:false, icon:'fa-clipboard-check' },
  { label:'Ready for Coding',                     state:'Pending',   date:'-',            time:'-',        complete:false, icon:'fa-shield' }
];

const TASK_TABS = ['All (6)', 'Due Today (2)', 'Overdue (1)', 'Completed'];
const SEED_TASKS = [
  { id:'TSK-001245', task:'Review & Sign', createdDate:'28-Apr-2026', due:'Today, 11:30 AM',    completedDate:'—', priority:'High',   createdBy:'Dr. Emily Carter', assignedTo:'Robert Johnson', status:'In Review',   icon:'fa-file-lines',   tone:'blue' },
  { id:'TSK-001246', task:'Complete Documentation',           createdDate:'28-Apr-2026', due:'Today, 12:00 PM',    completedDate:'—', priority:'Medium', createdBy:'Sarah Wilson',     assignedTo:'Maria Garcia',   status:'In Progress', icon:'fa-file-lines',   tone:'green' },
  { id:'TSK-001247', task:'Review QA Feedback',               createdDate:'27-Apr-2026', due:'Tomorrow, 9:00 AM',  completedDate:'—', priority:'Medium', createdBy:'Michael Davis',    assignedTo:'James Lee',      status:'Pending',     icon:'fa-comment-dots', tone:'purple' },
  { id:'TSK-001248', task:'Sign Completed Note',              createdDate:'27-Apr-2026', due:'Tomorrow, 11:00 AM', completedDate:'29-Apr-2026', priority:'Low', createdBy:'Linda Brown',    assignedTo:'David Martinez', status:'Completed',   icon:'fa-circle-check', tone:'green' }
];

const STAFF_OPTIONS = [
  { id:'s1', initials:'AB', name:'Anna Black',   role:'Scribe · 4 yrs' },
  { id:'s2', initials:'CD', name:'Carlos Diaz',  role:'Scribe · 2 yrs' },
  { id:'s3', initials:'EM', name:'Elena Marsh',  role:'Scribe · 6 yrs' },
  { id:'s4', initials:'JT', name:'Jordan Tai',   role:'Scribe · 1 yr'  },
  { id:'s5', initials:'RP', name:'Ravi Patel',   role:'Scribe · 3 yrs' }
];

const INSIGHTS = {
  documents: { data: [38, 20, 35, 42, 60, 32, 44], value:'48',  change:18, color:'#3B82F6' },
  hours:     { data: [35, 18, 23, 19, 30, 28, 51, 30, 50], value:'16h 24m', change:22, color:'#8B5CF6' },
  donut: {
    total: 63,
    segments: [
      { color:'#3B82F6', pct:46, label:'In Progress',    count:7 },
      { color:'#F59E0B', pct:13, label:'Pending Review', count:8 },
      { color:'#6366F1', pct:11, label:'Completed',      count:46 },
      { color:'#22C55E', pct:3,  label:'On Hold',        count:2 }
    ]
  },
  radial: { pct: 0.92, label:'On Track', meta:'Meeting SLA', color:'#22C55E' }
};

/* =========================
   KPI / Stat Cards
========================= */
const renderKPIs = () => {
  const root = $('#kpiRow');
  if (!root) return;

  root.innerHTML = KPIS.map((k, i) => {
    const classes = ['stat-card', k.turnaround ? 'is-turnaround' : '', TONE[k.tone] || 'blue-st'].filter(Boolean).join(' ');
    return `
      <div class="${classes}" data-kpi="${k.title}">
        <div class="stat-icon ${TONE[k.tone] || 'blue-st'}">${fa(k.icon)}</div>
        <div class="stat-info">
          <p class="stat-label">${k.title}</p>
          <h2 class="stat-count">${k.value}</h2>
        </div>
      </div>
    `;
  }).join('');
};

/* =========================
   Quick Actions
========================= */


const renderQuickActions = () => {
  const root = $('#quickActions');
  if (!root) return;
  root.innerHTML = QUICK_ACTIONS.map(a => `
    <button class="qa-btn" type="button" title="${a.label}">
      <span class="qa-icon ${TONE[a.tone] || 'blue-st'}">${fa(a.icon)}</span>
      <span class="qa-label">${a.label}</span>
    </button>
  `).join('');
};

/* =========================
   Today's Schedule
========================= */
const scheduleState = {
  list: APPOINTMENTS.map(a => ({ ...a })),
  filter: 'All Status',
  recordingId: null,
  isRecording: false,
  seconds: 0,
  snippets: {},
  timerId: null
};

const renderScheduleFilter = () => {
  const sel = $('#scheduleFilter');
  if (!sel) return;
  sel.innerHTML = APPOINTMENT_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
  sel.value = scheduleState.filter;
  sel.addEventListener('change', () => {
    scheduleState.filter = sel.value;
    renderScheduleList();
  });
};

const filterSchedule = () =>
  scheduleState.filter === 'All Status'
    ? scheduleState.list
    : scheduleState.list.filter(a => a.status === scheduleState.filter);

const formatTimer = (sec) => {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const startTimer = () => {
  if (scheduleState.timerId) clearInterval(scheduleState.timerId);
  scheduleState.timerId = setInterval(() => {
    if (scheduleState.isRecording) scheduleState.seconds += 1;
    const label = $('.recording-pulse .label');
    if (label) label.textContent = `Recording · ${formatTimer(scheduleState.seconds)}`;
  }, 1000);
};

const stopTimer = () => {
  if (scheduleState.timerId) { clearInterval(scheduleState.timerId); scheduleState.timerId = null; }
};

const startRecording = (id) => {
  scheduleState.recordingId = id;
  scheduleState.isRecording = true;
  scheduleState.seconds = 0;
  scheduleState.list = scheduleState.list.map(a => a.id === id ? { ...a, status: 'Recording In Progress' } : a);
  startTimer();
  renderScheduleList();
};

const pauseRecording = () => { scheduleState.isRecording = false; };
const resumeRecording = () => { scheduleState.isRecording = true; };

const stopRecording = () => {
  const id = scheduleState.recordingId;
  if (!id) return;
  const list = scheduleState.snippets[id] || [];
  const newSnippet = `Recording ${list.length + 1}`;
  scheduleState.snippets = {
    ...scheduleState.snippets,
    [id]: [...list, newSnippet]
  };
  scheduleState.isRecording = false;
  scheduleState.seconds = 0;
  renderScheduleList();
};

const resetRecording = () => { scheduleState.seconds = 0; };

const finishRecording = (id) => {
  scheduleState.list = scheduleState.list.map(a =>
    a.id === id ? { ...a, status: 'Recording Ready for Scribe', lastUpdated: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) } : a
  );
  scheduleState.recordingId = null;
  scheduleState.isRecording = false;
  scheduleState.seconds = 0;
  stopTimer();
  renderScheduleList();
};

const deleteSnippet = (appointmentId, snippet) => {
  scheduleState.snippets = {
    ...scheduleState.snippets,
    [appointmentId]: (scheduleState.snippets[appointmentId] || []).filter(s => s !== snippet)
  };
  renderScheduleList();
};

const renderScheduleList = () => {
  const root = $('#scheduleList');
  if (!root) return;
  const items = filterSchedule();
  root.innerHTML = items.map((item) => {
    const isRecordingRow = scheduleState.recordingId === item.id;
    const inList = scheduleState.snippets[item.id] || [];
    return `
      <div class="appt-row ${isRecordingRow ? 'is-recording' : ''}" data-patient="${item.patientName}" data-patient-id="${item.id}">
        <div class="appt-time">
          <span class="appt-time-text ${isRecordingRow ? 'is-recording' : ''}">${item.appointmentTime}</span>
          <span class="appt-time-date">${item.appointmentDate}</span>
        </div>

        <div class="appt-body">
          <div class="appt-top">
            <div class="appt-patient">
              ${item.status === 'Pending'
                ? `<button class="appt-mic-btn" data-act="mic" data-id="${item.id}" aria-label="Start recording">${fa('fa-microphone')}</button>`
                : ''}
              <div class="appt-patient-meta">
                <p class="appt-patient-name">${item.patientName}</p>
                <p class="appt-patient-sub">${item.visitType} / ${item.age}Y / ${item.gender}</p>
              </div>
            </div>
            <div class="appt-status">
              <span class="status-pill ${statusPillClass(item.status)}">${statusLabel(item.status)}</span>
              <span class="appt-updated">Updated: ${item.lastUpdated}</span>
            </div>
          </div>

          ${item.suggestedCodes ? `
            <div class="appt-codes">
              <button class="appt-codes-btn" data-act="codes">${fa('fa-code')} View Suggested Codes</button>
            </div>` : ''}

          ${isRecordingRow ? renderRecordingPanel(scheduleState.isRecording) : ''}
          ${inList.length > 0 && !isRecordingRow ? renderSnippets(item.id, inList) : ''}
          ${isRecordingRow && inList.length > 0 ? renderSnippets(item.id, inList) : ''}
        </div>
      </div>`;
  }).join('') || `<div style="padding:20px;color:var(--text-muted);text-align:center;">No appointments match this filter.</div>`;

  bindScheduleHandlers();
};

const renderRecordingPanel = (isRecording) => `
  <div class="recording-panel">
    <div class="recording-pulse">
      <span class="dot"></span>
      <span class="label">Recording · ${formatTimer(scheduleState.seconds)}</span>
    </div>
    <div class="recording-actions">
      <button class="rec-action ghost" data-act="reset">Reset</button>
      <button class="rec-action primary" data-act="${isRecording ? 'pause' : 'resume'}">
        ${isRecording ? `${fa('fa-pause')} Pause` : `${fa('fa-microphone')} Start`}
      </button>
      <button class="rec-action danger" data-act="stop">${fa('fa-square')} Stop</button>
    </div>
  </div>`;

const renderSnippets = (id, items) => `
  <div class="snippets">
    ${items.map(sn => `
      <div class="snippet">
        <div class="snippet-left">${fa('fa-play')}<span>${sn}</span></div>
        <button class="snippet-trash" data-act="del-snippet" data-id="${id}" data-snippet="${sn}" aria-label="Delete snippet">${fa('fa-trash-can')}</button>
      </div>`).join('')}
    <button class="snippets-done" data-act="done" data-id="${id}">${fa('fa-check')} Done</button>
  </div>`;

const bindScheduleHandlers = () => {
  $$('#scheduleList [data-act]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const act = btn.dataset.act;
      const id  = +(btn.dataset.id || scheduleState.recordingId);
      switch (act) {
        case 'mic':       startRecording(id); break;
        case 'pause':     pauseRecording();  renderScheduleList(); break;
        case 'resume':    resumeRecording(); renderScheduleList(); break;
        case 'stop':      stopRecording();   break;
        case 'reset':     resetRecording();  renderScheduleList(); break;
        case 'done':      finishRecording(id); break;
        case 'del-snippet': deleteSnippet(id, btn.dataset.snippet); break;
        case 'codes':     /* placeholder for viewer modal */ break;
      }
    });
  });

  /* Click anywhere else on the row → open encounter modal */
  $$('#scheduleList .appt-row').forEach(row => {
    row.addEventListener('click', (e) => {
      /* Skip if a control inside the row was clicked */
      if (e.target.closest('button, .recording-panel, .recording-actions, .snippets, .appt-codes, .appt-mic-btn, .appt-codes-btn, .rec-action, .snippets-done, .snippet-trash')) return;
      const id = +row.dataset.patientId;
      const appt = scheduleState.list.find(a => a.id === id);
      if (!appt) return;
      openEncounterForAppointment(appt);
    });
  });
};

/* =========================
   Encounter modal — lazy-load + open
========================= */
let encounterScriptLoaded = false;
function loadEncounterModule() {
  if (encounterScriptLoaded && window.openEncounterModal) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="encounter/encounter.js"]')) {
      encounterScriptLoaded = true;
      return resolve();
    }
    const s = document.createElement('script');
    s.src = 'encounter/encounter.js';
    s.onload = () => { encounterScriptLoaded = true; resolve(); };
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });
}

async function openEncounterForAppointment(appointment) {
  try {
    await loadEncounterModule();
    if (typeof window.openEncounterModal === 'function') {
      window.openEncounterModal(appointment);
    }
  } catch (err) {
    console.error('Failed to load encounter module', err);
  }
}

/* =========================
   Workflow Overview
========================= */
const renderWorkflow = () => {
  const stages = $('#workflowTrack');
  const stats  = $('#workflowStats');
  if (stages) stages.innerHTML = `
    <div class="workflow-stages">
      ${WORKFLOW_STAGES.map(s => `
        <div class="workflow-stage tone-${s.tone}">
          <span class="workflow-stage-icon">${fa(s.icon)}</span>
          <div class="workflow-stage-label">${s.label}</div>
          <div class="workflow-stage-count">${s.count}</div>
          <div class="workflow-stage-meta">Patients</div>
        </div>`).join('')}
    </div>`;
  if (stats) stats.innerHTML = `
    <div class="workflow-stat-row">
      ${WORKFLOW_STATS.map(s => `
        <div class="workflow-stat">
          <span class="workflow-stat-icon ${TONE[s.tone] || 'blue-st'}">${fa(s.icon)}</span>
          <div>
            <div class="workflow-stat-meta">${s.label}</div>
            <div class="workflow-stat-value">${s.value}</div>
          </div>
        </div>`).join('')}
    </div>`;
};

/* =========================
   Encounter Queue
========================= */
const renderEncounter = () => {
  const root = $('#encounterSteps');
  if (!root) return;
  root.innerHTML = `
    <div class="encounter-step-grid">
      ${ENCOUNTER_STEPS.map(step => `
        <div class="encounter-step ${step.complete ? 'is-complete' : ''}">
          <div class="encounter-step-circle">${fa(step.icon, 'fa-solid')}</div>
          <div class="encounter-step-label">${step.label}</div>
          <span class="encounter-step-state">${step.state}</span>
          <div class="encounter-step-meta">
            ${step.date !== '-' ? `<span class="encounter-step-meta-row">${fa('fa-calendar')}<span>${step.date}</span></span>` : ''}
            ${step.time !== '-' ? `<span class="encounter-step-meta-row">${fa('fa-clock')}<span>${step.time}</span></span>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
};

/* =========================
   Key Insights
========================= */
const hexAlpha = (hex, a) => {
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
};

const renderLineChart = ({ data, color, value, change, label }) => {
  const w = 220, h = 72, padTop = 6, padBottom = 14;
  const max = Math.max(...data);
  const axisMax = (Math.ceil(max / 25) * 25) || 25;
  const niceTicks = [0, Math.round(axisMax / 3 / 5) * 5, Math.round((axisMax * 2) / 3 / 5) * 5, axisMax];
  const x = i => (i / (data.length - 1)) * w;
  const y = v => padTop + (1 - v / axisMax) * (h - padTop - padBottom);
  const linePoints = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPoints = `0,${h - padBottom} ${linePoints} ${w},${h - padBottom}`;
  const gradId = `grad-${label.replace(/\s+/g, '-')}`;
  return `
    <div class="insight-card">
      <div class="insight-head">
        <span class="insight-icon" style="background:${hexAlpha(color, 0.10)};color:${color}">${fa(label === 'Documents Created' ? 'fa-file-lines' : 'fa-clock')}</span>
        <span class="insight-label">${label}</span>
      </div>
      <div class="insight-value-row">
        <span class="insight-value">${value}</span>
        <span class="insight-trend">${fa('fa-arrow-up')} ${change}%</span>
      </div>
      <div class="insight-chart-row">
        <div class="insight-yaxis">
          ${[...niceTicks].reverse().map(t => `<span>${t}</span>`).join('')}
        </div>
        <div class="insight-chart">
          <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" width="100%" height="${h}">
            <defs>
              <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
              </linearGradient>
            </defs>
            ${niceTicks.map((t) => `
              <line x1="0" x2="${w}" y1="${y(t)}" y2="${y(t)}" stroke="#EEF1F6" stroke-width="1" stroke-dasharray="${t === 0 ? '0' : '3 3'}"/>`).join('')}
            <polygon points="${areaPoints}" fill="url(#${gradId})"/>
            <polyline points="${linePoints}" fill="none" stroke="${color}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
            ${data.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2.25" fill="${color}"/>`).join('')}
          </svg>
        </div>
      </div>
    </div>`;
};

const renderDonut = () => {
  const segs = INSIGHTS.donut.segments;
  let cum = 0;
  const paths = segs.map(seg => {
    const start = (cum / 100) * 2 * Math.PI - Math.PI / 2;
    cum += seg.pct;
    const end = (cum / 100) * 2 * Math.PI - Math.PI / 2;
    const r = 19, cx = 26, cy = 26;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = seg.pct > 50 ? 1 : 0;
    return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${seg.color}" stroke-width="5.5" stroke-linecap="butt"/>`;
  }).join('');
  return `
    <div class="insight-card">
      <div class="insight-head">
        <span class="insight-icon" style="background:#EAF1FF;color:#3B82F6">${fa('fa-chart-pie')}</span>
        <span class="insight-label">Status</span>
      </div>
      <div class="donut-row">
        <svg class="donut-chart" width="52" height="52" viewBox="0 0 52 52">${paths}<text x="26" y="29.5" text-anchor="middle" font-size="9" font-weight="700" fill="#1f2937">${INSIGHTS.donut.total}</text></svg>
        <div class="donut-legend">
          ${segs.map(s => `<div class="donut-row-item"><span class="donut-color" style="background:${s.color}"></span><span class="donut-label">${s.label}</span><span class="donut-count">${s.count}</span></div>`).join('')}
        </div>
      </div>
    </div>`;
};

const renderRadial = () => {
  const pct = INSIGHTS.radial.pct;
  const r = 17;
  const circ = 2 * Math.PI * r;
  return `
    <div class="insight-card">
      <div class="insight-head">
        <span class="insight-icon" style="background:#EAFBF0;color:#22C55E">${fa('fa-gauge-high')}</span>
        <span class="insight-label">SLA Compliance</span>
      </div>
      <div class="radial-row">
        <div class="radial-chart">
          <svg viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="5.5"/>
            <circle cx="22" cy="22" r="${r}" fill="none" stroke="${INSIGHTS.radial.color}" stroke-width="5.5"
              stroke-dasharray="${circ * pct} ${circ * (1 - pct)}" stroke-linecap="round"/>
          </svg>
          <span class="radial-center">92%</span>
        </div>
        <div>
          <div class="radial-label-title">${INSIGHTS.radial.label}</div>
          <div class="radial-label-meta">${INSIGHTS.radial.meta}</div>
        </div>
      </div>
    </div>`;
};

const renderInsights = () => {
  const root = $('#insightsStack');
  if (!root) return;
  root.innerHTML = [
    renderLineChart({ ...INSIGHTS.documents, label: 'Documents Created' }),
    renderLineChart({ ...INSIGHTS.hours,     label: 'Hours Saved' }),
    renderDonut(),
    renderRadial()
  ].join('');
};

/* =========================
   My Tasks
========================= */
const tasksState = {
  list: SEED_TASKS.map(t => ({ ...t })),
  activeTab: 0,
  checked: new Set()
};

const renderTaskTabs = () => {
  const root = $('#taskTabs');
  if (!root) return;
  root.innerHTML = TASK_TABS.map((t, i) =>
    `<button class="tab ${i === tasksState.activeTab ? 'is-active' : ''}" data-tab="${i}">${t}</button>`
  ).join('');
  $$('.tab', root).forEach(btn => {
    btn.addEventListener('click', () => {
      tasksState.activeTab = +btn.dataset.tab;
      renderTaskTabs();
      renderTasksTable();
    });
  });
};

const filterTasks = () => {
  switch (tasksState.activeTab) {
    case 1: return tasksState.list.filter(t => t.due.includes('Today'));
    case 2: return tasksState.list.filter(t => t.due.includes('Overdue'));
    case 3: return tasksState.list.filter(t => tasksState.checked.has(t.task));
    default: return tasksState.list;
  }
};

const PRIORITY_CLASS = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' };
const STATUS_CLASS   = { 'In Review': 'status-in-review', 'In Progress': 'status-in-progress', 'Pending': 'status-pending', 'Completed': 'status-completed' };

const renderTasksTable = () => {
  const root = $('#tasksTable');
  if (!root) return;
  const rows = filterTasks();
  root.innerHTML = `
    <div class="tasks-thead">
      <input type="checkbox" id="selectAll" />
      <div>Task ID</div>
      <div>Task</div>
      <div>Created Date</div>
      <div class="h-due">Due Date ${fa('fa-chevron-down')}</div>
      <div>Completed Date</div>
      <div class="h-priority">Priority</div>
      <div>Created By</div>
      <div>Assigned To</div>
      <div class="h-status">Status</div>
      <span class="h-options">${fa('fa-sliders')}</span>
    </div>
    ${rows.length === 0 ? '<div style="padding:20px;color:var(--text-muted);text-align:center;">No tasks in this view.</div>' : rows.map(task => `
      <div class="tasks-row" data-task="${task.task}">
        <input type="checkbox" class="row-check" ${tasksState.checked.has(task.task) ? 'checked' : ''} />
        <div class="col-id">${task.id}</div>
        <div class="task-name">
          <span class="task-name-icon ${TONE[task.tone] || 'blue-st'}">${fa(task.icon)}</span>
          <span class="task-name-text" title="${task.task}">${task.task}</span>
        </div>
        <div class="col-created">${task.createdDate}</div>
        <div class="col-due ${task.due.includes('Today') ? 'due-today' : 'due-future'}">${task.due}</div>
        <div class="col-completed">${task.completedDate}</div>
        <div class="col-priority"><span class="priority-pill ${PRIORITY_CLASS[task.priority]}">${task.priority}</span></div>
        <div class="col-createdby">${task.createdBy}</div>
        <div class="col-assignedto">${task.assignedTo}</div>
        <div class="col-status"><span class="status-pill-mini ${STATUS_CLASS[task.status]}">${task.status}</span></div>
        <button class="col-options" aria-label="More">${fa('fa-ellipsis-vertical')}</button>
      </div>`).join('')}
    <div class="tasks-foot">
      <div>Showing 1 to ${rows.length} of ${rows.length} tasks</div>
      <div class="pager">
        <button class="page-btn" aria-label="Previous">${fa('fa-chevron-left')}</button>
        <button class="page-btn is-active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn" aria-label="Next">${fa('fa-chevron-right')}</button>
      </div>
    </div>`;

  $$('.row-check', root).forEach(cb => {
    cb.addEventListener('change', () => {
      const task = cb.closest('.tasks-row').dataset.task;
      if (cb.checked) tasksState.checked.add(task);
      else            tasksState.checked.delete(task);
      renderTasksTable();
    });
  });
  const selectAll = $('#selectAll', root);
  if (selectAll) selectAll.addEventListener('change', () => {
    rows.forEach(t => selectAll.checked ? tasksState.checked.add(t.task) : tasksState.checked.delete(t.task));
    renderTasksTable();
  });
};

const nextTaskId = () => {
  const nums = tasksState.list
    .map(t => parseInt(String(t.id).replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1244) + 1;
  return `TSK-${String(next).padStart(6, '0')}`;
};

const todayLabel = () => {
  const d = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_ATTACHMENT_EXT = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
let taskAttachments = [];

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderTaskFileList = () => {
  const list = $('#taskFileList');
  if (!list) return;
  list.innerHTML = taskAttachments.map((file, i) => `
    <li class="file-list-item" data-index="${i}">
      <span class="file-list-icon">${fa('fa-file')}</span>
      <span class="file-list-name" title="${file.name}">${file.name}</span>
      <span class="file-list-size">${formatFileSize(file.size)}</span>
      <button type="button" class="file-list-remove" aria-label="Remove ${file.name}">${fa('fa-xmark')}</button>
    </li>`).join('');
  $$('.file-list-remove', list).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.closest('.file-list-item').dataset.index;
      taskAttachments.splice(idx, 1);
      renderTaskFileList();
    });
  });
};

const addTaskFiles = (fileList) => {
  const errors = [];
  Array.from(fileList).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_ATTACHMENT_EXT.includes(ext)) {
      errors.push(`${file.name}: unsupported file type.`);
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      errors.push(`${file.name}: exceeds 20MB limit.`);
      return;
    }
    taskAttachments.push(file);
  });
  renderTaskFileList();
  if (errors.length && typeof showAppToast === 'function') {
    showAppToast(`<i class="fa fa-circle-exclamation"></i> ${errors[0]}`, 'error');
  }
};

const setupTaskAttachments = () => {
  const dropzone = $('#taskDropzone');
  const fileInput = $('#taskFileInput');
  const chooseBtn = $('#taskChooseFileBtn');
  if (!dropzone || !fileInput) return;

  chooseBtn?.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('click', (e) => { if (e.target === dropzone) fileInput.click(); });
  dropzone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });

  fileInput.addEventListener('change', () => {
    addTaskFiles(fileInput.files);
    fileInput.value = '';
  });

  ['dragover', 'dragenter'].forEach(evt => dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('is-dragover');
  }));
  ['dragleave', 'dragend'].forEach(evt => dropzone.addEventListener(evt, () => dropzone.classList.remove('is-dragover')));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');
    if (e.dataTransfer?.files?.length) addTaskFiles(e.dataTransfer.files);
  });
};

const setupAddTaskModal = () => {
  const modal  = $('#addTaskModal');
  const open   = $('#addTaskBtn');
  const close  = $('#addTaskClose');
  const cancel = $('#addTaskCancel');
  const form   = $('#addTaskForm');
  const error  = $('#addTaskError');

  if (!modal || !open) return;

  const show = () => { modal.hidden = false; form?.reset(); clearErrors(); taskAttachments = []; renderTaskFileList(); };
  const hide = () => { modal.hidden = true; };

  const clearErrors = () => {
    error.hidden = true; error.textContent = '';
    $$('.field', form).forEach(f => f.classList.remove('is-error'));
  };
  const flagError = (field, msg) => {
    field.closest('.field')?.classList.add('is-error');
    error.textContent = msg;
    error.hidden = false;
  };

  open.addEventListener('click', show);
  close?.addEventListener('click', hide);
  cancel?.addEventListener('click', hide);
  modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) hide(); });
  setupTaskAttachments();

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const data = Object.fromEntries(new FormData(form).entries());
    let ok = true;
    if (!data.title || data.title.length < 3) { flagError(form.elements.title, 'Title needs at least 3 characters.'); ok = false; }
    if (!data.patient) { flagError(form.elements.patient, 'Patient is required.'); ok = false; }
    if (!data.due)    { flagError(form.elements.due, 'Due date is required.'); ok = false; }
    if (!data.priority) { flagError(form.elements.priority, 'Pick a priority.'); ok = false; }
    if (!data.status)   { flagError(form.elements.status,   'Pick a status.'); ok = false; }
    if (!ok) return;

    tasksState.list = [{
      id: nextTaskId(),
      task: data.title,
      createdDate: todayLabel(),
      due: data.due,
      completedDate: data.status === 'Completed' ? todayLabel() : '—',
      priority: data.priority,
      createdBy: 'You',
      assignedTo: data.assignedStaff || data.patient,
      status: data.status,
      icon: 'fa-circle-check',
      tone: 'green',
      attachments: taskAttachments.map(f => f.name)
    }, ...tasksState.list];
    renderTasksTable();
    hide();
    if (typeof showAppToast === 'function') showAppToast(`<i class="fa fa-circle-check"></i> Task "${data.title}" added.`, 'success');
  });
};

/* =========================
   Staff Transfer
========================= */
const staffState = { selected: null };

const renderStaffList = () => {
  const list = $('#staffList');
  if (!list) return;
  list.innerHTML = STAFF_OPTIONS.map(s => `
    <li class="staff-list-item" data-id="${s.id}">
      <span class="avatar-circle">${s.initials}</span>
      <div>
        <div class="staff-list-item-name">${s.name}</div>
        <div class="staff-list-item-role">${s.role}</div>
      </div>
    </li>`).join('');
  $$('.staff-list-item', list).forEach(item => {
    item.addEventListener('click', () => {
      staffState.selected = STAFF_OPTIONS.find(s => s.id === item.dataset.id);
      const label = $('#staffSelectLabel');
      const btn = $('#staffSelectBtn');
      if (label) label.textContent = staffState.selected.name;
      if (btn)   btn.style.color = 'var(--text-primary)';
      $('#staffModal').hidden = true;
      if (typeof showAppToast === 'function') showAppToast(`<i class="fa fa-user-check"></i> Assigned to ${staffState.selected.name}.`, 'success');
    });
  });
};

const setupStaffModal = () => {
  const modal  = $('#staffModal');
  const open   = $('#staffSelectBtn');
  const close  = $('#staffClose');
  if (!modal) return;
  open?.addEventListener('click', () => { modal.hidden = false; });
  close?.addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) modal.hidden = true; });
};

/* =========================
   Init — runs when page is loaded via fetch into #pageContent,
   which means DOMContentLoaded has already fired.
   Use direct call; safe because inject is synchronous
   and this script is appended AFTER innerHTML.
========================= */
const init = () => {
  renderKPIs();
  renderQuickActions();
  renderScheduleFilter();
  renderScheduleList();
  renderWorkflow();
  renderEncounter();
  renderInsights();
  renderTaskTabs();
  renderTasksTable();
  setupAddTaskModal();
  renderStaffList();
  setupStaffModal();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();