(() => {
'use strict';

/* ---- DATA ---- */
const TICKETS = [
  { id: 'TK-12489', subject: 'Unable To Access Patient Documents', category: 'Documents & Files', assignee: 'Sarah Johnson', role: 'Support Specialist', date: 'May 22, 2026', time: '10:30 AM', status: 'in-progress', priority: 'high' },
  { id: 'TK-12488', subject: 'Scribe Note Not Saving', category: 'Scribing', assignee: 'Mike Anderson', role: 'Scribe Team', date: 'May 22, 2026', time: '09:15 AM', status: 'open', priority: 'medium' },
  { id: 'TK-12475', subject: 'EHR Sync Error', category: 'EHR Integration', assignee: 'Priya Sharma', role: 'EHR Specialist', date: 'May 22, 2026', time: '08:45 AM', status: 'awaiting', priority: 'high' },
  { id: 'TK-12463', subject: 'Billing Code Suggestion Not Accurate', category: 'Coding', assignee: 'David Lee', role: 'Coding Team', date: 'May 21, 2026', time: '03:20 PM', status: 'in-progress', priority: 'low' },
  // FIX: Changed duplicate TK-12489 to TK-12450
  { id: 'TK-12450', subject: 'Feature Request: Templates', category: 'Feature Request', assignee: 'Emily Davis', role: 'Product Team', date: 'May 20, 2026', time: '11:05 AM', status: 'open', priority: 'low' },
];

let ticketCounter = 12490;



/* =====================================================
   CALENDAR FILTER STATE
===================================================== */

let currentDateFilter = {
  type: 'all',
  start: null,
  end: null
};


/* =====================================================
   STAT CARDS – COUNTER ANIMATION + FILTER
   ===================================================== */
function animateCounter(el, target) {
  let start = 0;
  const duration = 800;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); }
    else { el.textContent = start; }
  }, 16);
}

document.querySelectorAll('.stat-count').forEach(el => {
  animateCounter(el, parseInt(el.dataset.target));
});

document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('click', () => {
    const filter = card.dataset.filter;
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-filter'));
    card.classList.add('active-filter');
    setFilter(filter, null);
    document.querySelectorAll('.filter-pill').forEach(p => {
      p.classList.toggle('active', p.textContent.toLowerCase().includes(filter.replace('-', ' ')) || (filter === 'all'));
    });
  });
});

/* =====================================================
   TICKET TABLE
   ===================================================== */
function renderTickets(data) {
  const tbody = document.getElementById('ticketsTableBody');
  const cardContainer = document.getElementById('ticketCardList');

  if (!data.length) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No tickets found</td></tr>`;
    }
    if (cardContainer) {
      cardContainer.innerHTML = `<div class="ticket-card empty-card">No tickets found</div>`;
    }
    return;
  }

  if (tbody) {
    tbody.innerHTML = data.map(t => `
      <tr data-ticket-id="${t.id}" class="ticket-row-clickable">
        <td class="ticket-id">${t.id}</td>
        <td>
          <div class="ticket-subject">${t.subject}</div>
          <div class="ticket-category">${t.category}</div>
        </td>
        <td>
          <div class="assignee-name">${t.assignee}</div>
          <div class="assignee-role">${t.role}</div>
        </td>
        <td>
          <div class="ticket-date">${t.date}</div>
          <div class="ticket-time">${t.time}</div>
        </td>
        <td><span class="status-pill ${t.status}">${statusLabel(t.status)}</span></td>
        <td><span class="priority-dot ${t.priority}">${capitalize(t.priority)}</span></td>
        <td class="row-arrow"><i class="fa fa-chevron-right"></i></td>
      </tr>
    `).join('');
  }

  if (cardContainer) {
    cardContainer.innerHTML = data.map(t => `
      <div class="ticket-card ticket-row-clickable" data-ticket-id="${t.id}">
        <div class="ticket-card-top">
          <div class="ticket-card-id">${t.id}</div>
          <span class="status-pill ${t.status}">${statusLabel(t.status)}</span>
        </div>
        <div class="ticket-card-subject">${t.subject}</div>
        <div class="ticket-card-category">${t.category}</div>
        <div class="ticket-card-meta">
          <div>
            <span class="meta-label">Assigned</span>
            <p>${t.assignee}</p>
            <span class="meta-role">${t.role}</span>
          </div>
          <div>
            <span class="meta-label">Created</span>
            <p>${t.date} · ${t.time}</p>
          </div>
          <div>
            <span class="meta-label">Priority</span>
            <span class="priority-dot ${t.priority}">${capitalize(t.priority)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function statusLabel(s) {
  const map = { 'open': 'Open', 'in-progress': 'In Progress', 'awaiting': 'Awaiting Response', 'resolved': 'Resolved' };
  return map[s] || s;
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

let activeFilter = 'all';

function setFilter(filter, el) {
  activeFilter = filter;
  if (el) {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
  }
  filterTickets();
}

function filterTickets() {
  const query = document.getElementById('ticketSearch').value.toLowerCase();
  let filtered = TICKETS;
  if (activeFilter !== 'all') {
    filtered = filtered.filter(t => t.status === activeFilter);
  }
  if (query) {
    filtered = filtered.filter(t =>
      t.id.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.assignee.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }

  /* =====================================================
   DATE FILTER
===================================================== */

if(currentDateFilter.start &&
   currentDateFilter.end){

  filtered = filtered.filter(ticket => {

    const ticketDate =
      new Date(ticket.date);

    return (
      ticketDate >= currentDateFilter.start &&
      ticketDate <= currentDateFilter.end
    );

  });

}
  renderTickets(filtered);
}

/* =====================================================
   RESET FILTER
===================================================== */

function resetCalendarFilter(){

  currentDateFilter = {
    type:'all',
    start:null,
    end:null
  };

  document.getElementById(
    'calendarSingleDate'
  ).value = '';

  document.getElementById(
    'calendarStartDate'
  ).value = '';

  document.getElementById(
    'calendarEndDate'
  ).value = '';

  filterTickets();

  closeCalendarModal();

  showToast(
    '<i class="fa fa-rotate-left"></i> Filter reset',
    'success'
  );

}

function viewTicket(id) {
  const ticket = TICKETS.find(t => t.id === id);
  if (!ticket) {
    showToast(`<i class="fa fa-circle-exclamation"></i> Ticket ${id} not found`, 'error');
    return;
  }
  openTicketDetailForTicket(ticket);
}

/* =====================================================
   TICKET DETAIL OVERLAY
   Lazy-load ticket-detail.js on first click, then call
   window.openTicketDetail(ticket).
===================================================== */
let _ticketDetailBooting = null;

function openTicketDetailForTicket(ticket) {
  if (typeof window.openTicketDetail === 'function') {
    window.openTicketDetail(ticket);
    return;
  }
  if (_ticketDetailBooting) {
    _ticketDetailBooting.then(() => window.openTicketDetail && window.openTicketDetail(ticket));
    return;
  }
  _ticketDetailBooting = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'ticket-detail/ticket-detail.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  _ticketDetailBooting
    .then(() => window.openTicketDetail && window.openTicketDetail(ticket))
    .catch(() => showToast('<i class="fa fa-circle-exclamation"></i> Could not load ticket details', 'error'));
}

// Initial render
renderTickets(TICKETS);

/* =====================================================
   CHARTS (Chart.js)
   ===================================================== */
let statusChartInstance = null;
let priorityChartInstance = null;

function initCharts() {
  const statusData = {
    labels: ['Open', 'In Progress', 'Awaiting Response', 'Resolved'],
    datasets: [{
      data: [7, 3, 2, 24],
      backgroundColor: ['#3B7FF5', '#0A7AFF', '#F5A623', '#2DBD8F'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  if (typeof Chart === 'undefined') {
    renderChartFallback('statusChart', statusData, 'statusLegend', true);
    renderChartFallback('priorityChart', priorityData, 'priorityLegend', false);
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const legendColor = isDark ? '#8A9CC0' : '#6B7A99';

  Chart.defaults.color = legendColor;
  Chart.defaults.font.family = 'Plus Jakarta Sans';

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [12, 15, 9],
      backgroundColor: ['#EF4444', '#F5A623', '#2DBD8F'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const chartOpts = {
    type: 'doughnut',
    options: {
      cutout: '72%',
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.raw}`
      }}},
      animation: { animateRotate: true, duration: 900 },
      responsive: true,
      maintainAspectRatio: false,
    }
  };

  // Status Chart
  if (statusChartInstance) statusChartInstance.destroy();
  const statusCanvas = document.getElementById('statusChart');
  const priorityCanvas = document.getElementById('priorityChart');
  if (!statusCanvas || !priorityCanvas) return;

  const sCtx = statusCanvas.getContext('2d');
  statusChartInstance = new Chart(sCtx, { ...chartOpts, data: statusData });

  // Legend
  document.getElementById('statusLegend').innerHTML = statusData.labels.map((l, i) => `
    <li class="legend-item">
      <span class="legend-dot" style="background:${statusData.datasets[0].backgroundColor[i]}"></span>
      <span class="legend-label">${l}</span>
      <span class="legend-count">${statusData.datasets[0].data[i]}</span>
    </li>
  `).join('');

  // Priority Chart
  if (priorityChartInstance) priorityChartInstance.destroy();
  const pCtx = priorityCanvas.getContext('2d');
  priorityChartInstance = new Chart(pCtx, { ...chartOpts, data: priorityData });

  document.getElementById('priorityLegend').innerHTML = priorityData.labels.map((l, i) => `
    <li class="legend-item">
      <span class="legend-dot" style="background:${priorityData.datasets[0].backgroundColor[i]}"></span>
      <span class="legend-label">${l}</span>
      <span class="legend-count">${priorityData.datasets[0].data[i]}</span>
    </li>
  `).join('');
}

function renderChartFallback(canvasId, chartData, legendId, showTotal) {
  const canvas = document.getElementById(canvasId);
  const legend = document.getElementById(legendId);
  if (!canvas || !legend) return;

  const wrapper = canvas.closest('.chart-wrapper');
  const values = chartData.datasets[0].data;
  const colors = chartData.datasets[0].backgroundColor;
  const total = values.reduce((sum, value) => sum + value, 0);
  const gradient = values.reduce((parts, value, index) => {
    const start = parts.offset;
    const end = start + (value / total) * 100;
    parts.stops.push(`${colors[index]} ${start}% ${end}%`);
    parts.offset = end;
    return parts;
  }, { offset: 0, stops: [] }).stops.join(', ');

  wrapper.innerHTML = `
    <div class="chart-fallback-ring" style="background: conic-gradient(${gradient});">
      <span>${showTotal ? total : values[0]}</span>
    </div>
  `;

  legend.innerHTML = chartData.labels.map((label, index) => `
    <li class="legend-item">
      <span class="legend-dot" style="background:${colors[index]}"></span>
      <span class="legend-label">${label}</span>
      <span class="legend-count">${values[index]}</span>
    </li>
  `).join('');
}

initCharts();
window.initCharts = initCharts;


/* =====================================================
   MODAL
   ===================================================== */
function openModal() {
  document.getElementById('ticketModal').classList.add('open');
}
function closeModal() {
  document.getElementById('ticketModal').classList.remove('open');
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('ticketModal')) closeModal();
}

/* =====================================================
   OPEN CALENDAR MODAL
===================================================== */

function openCalendar(){

  document
    .getElementById('calendarModal')
    .classList.add('show');

}

/* =====================================================
   CLOSE CALENDAR MODAL
===================================================== */

function closeCalendarModal(){

  document
    .getElementById('calendarModal')
    .classList.remove('show');

}

/* =====================================================
   HANDLE FILTER TYPE
===================================================== */

function handleCalendarTypeChange(){

  const type =
    document.getElementById(
      'calendarFilterType'
    ).value;

  const custom =
    document.getElementById(
      'customRangeGroup'
    );

  const single =
    document.getElementById(
      'singleDateGroup'
    );

  if(type === 'custom'){

    custom.classList.remove('hidden');
    single.classList.add('hidden');

  }else{

    custom.classList.add('hidden');
    single.classList.remove('hidden');

  }

}

/* =====================================================
   APPLY CALENDAR FILTER
===================================================== */

function applyCalendarFilter(){

  const type =
    document.getElementById(
      'calendarFilterType'
    ).value;

  let start = null;
  let end = null;

  /* DAY / WEEK / MONTH */

  if(type !== 'custom'){

    const selected =
      new Date(
        document.getElementById(
          'calendarSingleDate'
        ).value
      );

    if(isNaN(selected)) return;

    if(type === 'day'){

      start = new Date(selected);
      end = new Date(selected);

    }

    if(type === 'week'){

      start = new Date(selected);

      start.setDate(
        selected.getDate() - selected.getDay()
      );

      end = new Date(start);

      end.setDate(start.getDate() + 6);

    }

    if(type === 'month'){

      start =
        new Date(
          selected.getFullYear(),
          selected.getMonth(),
          1
        );

      end =
        new Date(
          selected.getFullYear(),
          selected.getMonth() + 1,
          0
        );

    }

  }else{

    start =
      new Date(
        document.getElementById(
          'calendarStartDate'
        ).value
      );

    end =
      new Date(
        document.getElementById(
          'calendarEndDate'
        ).value
      );

  }

  currentDateFilter = {
    type,
    start,
    end
  };

  filterTickets();

  closeCalendarModal();

  showToast(
    '<i class="fa fa-calendar"></i> Tickets filtered successfully',
    'success'
  );

}



function submitTicket(e) {
  e.preventDefault();
  const subject = document.getElementById('mSubject').value;
  const dept = document.getElementById('mDept').value;
  const priority = document.getElementById('mPriority').value;
  const assignee = document.getElementById('mAssigned').value;

  const newTicket = {
    id: `TK-${ticketCounter++}`,
    subject,
    category: dept,
    assignee,
    role: dept,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: getCurrentTime(),
    status: 'open',
    priority: priority.toLowerCase(),
  };

  TICKETS.unshift(newTicket);
  filterTickets();
  closeModal();
  e.target.reset();
  showToast('<i class="fa fa-circle-check"></i> Ticket created successfully!', 'success');

  // Update counter
  const openCard = document.querySelector('[data-filter="open"] .stat-count');
  const currentVal = parseInt(openCard.textContent);
  animateCounter(openCard, currentVal + 1);

  // Update badge
  const badge = document.querySelector('[data-page="support-tickets"] .nav-badge');
  if (badge) badge.textContent = parseInt(badge.textContent) + 1;
}

/* =====================================================
   TOAST
   ===================================================== */
function showToast(html, type = 'success') {
  const toast = document.getElementById('toast');
  toast.innerHTML = html;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

/* =====================================================
   CHAT SYSTEM
   ===================================================== */
let currentChatTab = 'user';
let currentChatId = 'coding';

/* =====================================================
   CHAT TAB DATA
   ===================================================== */
const CHAT_TABS_DATA = {

  user: [
    { id: 'john', name: 'John Carter', avatar: 'JC', avatarClass: 'orange', time: '10:20 AM', preview: 'Need patient summary', unread: 2 },
    { id: 'emma', name: 'Emma Watson', avatar: 'EW', avatarClass: 'purple', time: 'Yesterday', preview: 'Updated prescription', unread: 0 },
    { id: 'liam', name: 'Liam Smith', avatar: 'LS', avatarClass: 'blue', time: 'Apr 30', preview: 'Billing code suggestion', unread: 0 },
    { id: 'oliver', name: 'Oliver Wood', avatar: 'OW', avatarClass: 'green', time: 'Apr 15', preview: 'Review pending for case 4521', unread: 0 },
  ]
};

/* =====================================================
   CHAT MESSAGES
   ===================================================== */
const CHAT_MESSAGES = {
  john: [
    { type: 'incoming', text: 'Can you send patient summary?', time: '10:20 AM' },
  ],
  emma: [
    { type: 'incoming', text: 'Prescription updated successfully.', time: 'Yesterday' },
  ],
  liam: [
    { type: 'incoming', text: 'Billing code suggestion received.', time: 'Apr 30' },
  ],
  oliver: [
    { type: 'incoming', text: 'Review pending for case 4521.', time: 'Apr 15' },
  ],
};

/* =====================================================
   SWITCH CHAT TAB
   ===================================================== */
function switchChatTab(tab, el) {
  currentChatTab = tab;
  document.querySelectorAll('.chat-tab').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
  renderConversationList();
}

/* =====================================================
   RENDER CONVERSATION LIST
   ===================================================== */
function renderConversationList() {
  const container = document.getElementById('conversationList');
  if (!container) return;

  container.innerHTML = '';
  const chats = CHAT_TABS_DATA[currentChatTab];

  chats.forEach((chat, index) => {
    const activeClass = index === 0 ? 'active' : '';
    container.innerHTML += `
      <div class="conv-item ${activeClass}" onclick="openChat('${chat.id}', this)">
        <div class="conv-avatar ${chat.avatarClass}">${chat.avatar}</div>
        <div class="conv-body">
          <div class="conv-header-row">
            <span class="conv-name">${chat.name}</span>
            <span class="conv-time">${chat.time}</span>
          </div>
          <span class="conv-preview">${chat.preview}</span>
        </div>
        ${chat.unread > 0 ? `<span class="conv-unread">${chat.unread}</span>` : ''}
      </div>
    `;
  });
}

/* =====================================================
   OPEN CHAT
   ===================================================== */
function openChat(chatId, el) {
  currentChatId = chatId;

  document.querySelectorAll('.conv-item').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');

  const chat = Object.values(CHAT_TABS_DATA).flat().find(c => c.id === chatId);
  if (chat) {
    document.getElementById('threadName').innerText = chat.name;
    const avatar = document.getElementById('threadAvatar');
    avatar.innerText = chat.avatar;
    avatar.className = `thread-avatar ${chat.avatarClass}`;
  }

  renderMessages(chatId);

  const thread = document.getElementById('chatThread');
  thread.classList.remove('hidden');
  thread.classList.add('active');
}

function openMobileChat() {
  const contentRight = document.getElementById('contentRight');
  if (contentRight) {
    contentRight.classList.add('active-mobile');
  }
}

function closeMobileChat() {
  const contentRight = document.getElementById('contentRight');
  if (contentRight) {
    contentRight.classList.remove('active-mobile');
  }
}

function closeChatThread() {
  const thread = document.getElementById('chatThread');
  thread.classList.remove('active');
  thread.classList.add('hidden');
}

/* =====================================================
   RENDER MESSAGES
   ===================================================== */
function renderMessages(chatId) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  container.innerHTML = '';
  const messages = CHAT_MESSAGES[chatId] || [];

  messages.forEach(msg => {
    if (msg.time) {
      const timeLabel = document.createElement('div');
      timeLabel.className = 'chat-date-label';
      timeLabel.innerText = msg.time;
      container.appendChild(timeLabel);
    }

    const row = document.createElement('div');
    row.className = `message-row ${msg.type.includes('outgoing') ? 'outgoing' : 'incoming'}`;

    if (!msg.type.includes('outgoing')) {
      row.innerHTML += `<div class="message-avatar"><i class="fa fa-user"></i></div>`;
    }

    let bubble = '';
    if (msg.type === 'incoming-image') {
      bubble = `
        <div class="message-bubble image-bubble">
          <img src="${msg.image}" alt="" style="max-width:100%;border-radius:10px;display:block;">
          <div class="image-caption">${msg.text}</div>
        </div>
      `;
    } else {
      bubble = `<div class="message-bubble">${msg.text}</div>`;
    }

    row.innerHTML += bubble;
    container.appendChild(row);
  });

  scrollChatToBottom();
}

/* =====================================================
   SEND MESSAGE
   ===================================================== */
function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const newMessage = { type: 'outgoing', text, time: getCurrentTime() };
  CHAT_MESSAGES[currentChatId].push(newMessage);
  renderMessages(currentChatId);
  input.value = '';
  autoReply();
}

/* =====================================================
   AUTO REPLY
   ===================================================== */
function autoReply() {
  setTimeout(() => {
    const replies = [
      'Understood.',
      'Checking now.',
      'Will update shortly.',
      'Please wait while reviewing.',
      'Issue forwarded successfully.'
    ];
    CHAT_MESSAGES[currentChatId].push({
      type: 'incoming',
      text: replies[Math.floor(Math.random() * replies.length)],
      time: getCurrentTime()
    });
    renderMessages(currentChatId);
  }, 1200);
}

/* =====================================================
   FILE UPLOAD – FIX: Added missing triggerFileUpload and handleFileUpload functions
   ===================================================== */
function triggerFileUpload() {
  const fileInput = document.getElementById('fileUploadInput');
  if (fileInput) fileInput.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const newMessage = {
    type: 'outgoing',
    text: `<i class="fa fa-paperclip"></i> ${file.name}`,
    time: getCurrentTime()
  };
  CHAT_MESSAGES[currentChatId].push(newMessage);
  renderMessages(currentChatId);
  event.target.value = '';
  autoReply();
}

/* =====================================================
   HELPERS
   ===================================================== */
function scrollChatToBottom() {
  const container = document.getElementById('chatMessages');
  if (container) container.scrollTop = container.scrollHeight;
}

function getCurrentTime() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/* =====================================================
   ENTER KEY
   ===================================================== */
function initSupportTicketsPage() {
  renderConversationList();

  const input = document.getElementById('chatInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /* Event delegation: click any ticket row / card to open detail overlay */
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.ticket-row-clickable');
    if (!target) return;
    /* Skip if user clicked an inner interactive control */
    if (e.target.closest('button, input, select, textarea, a')) return;
    const ticketId = target.getAttribute('data-ticket-id');
    if (!ticketId) return;
    const ticket = TICKETS.find(t => t.id === ticketId);
    if (ticket) openTicketDetailForTicket(ticket);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupportTicketsPage);
} else {
  initSupportTicketsPage();
}

/* =====================================================
   INITIAL LOAD ANIMATIONS
   ===================================================== */
window.addEventListener('load', () => {
  document.querySelectorAll('.panel').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.06}s`;
  });
});

Object.assign(window, {
  applyCalendarFilter,
  closeCalendarModal,
  closeChatThread,
  closeModal,
  closeModalOutside,
  closeMobileChat,
  filterTickets,
  handleCalendarTypeChange,
  handleFileUpload,
  openCalendar,
  openChat,
  openMobileChat,
  openModal,
  openTicketDetailForTicket,
  renderConversationList,
  resetCalendarFilter,
  sendMessage,
  setFilter,
  submitTicket,
  switchChatTab,
  triggerFileUpload,
  viewTicket
});
})();
