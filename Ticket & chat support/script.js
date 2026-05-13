

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
   SIDEBAR COLLAPSE
   ===================================================== */
const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapseBtn');
const mainWrapper = document.getElementById('mainWrapper');

collapseBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  mainWrapper.classList.toggle('collapsed');
});

/* =====================================================
   MOBILE SIDEBAR
   ===================================================== */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', openMobileSidebar);
}

function openMobileSidebar() {
  sidebar.classList.add('mobile-open');
  sidebarOverlay.classList.add('show');
}

function closeMobileSidebar() {
  sidebar.classList.remove('mobile-open');
  sidebarOverlay.classList.remove('show');
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeMobileSidebar);
}

/* =====================================================
   ACTIVE NAVIGATION
   FIX: Removed markdown code fences (```) that wrapped
   the handler body, making it a JS syntax error.
   ===================================================== */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => {
      i.classList.remove('active', 'active-secondary');
    });
    item.classList.add('active');
    if (window.innerWidth <= 1024) {
      closeMobileSidebar();
    }
  });
});

/* =====================================================
   THEME TOGGLE
   ===================================================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeIcon.className = isDark ? 'fa fa-moon' : 'fa fa-sun';
    setTimeout(initCharts, 100);
  });
}

/* =====================================================
   CALENDAR FILTER STATE
===================================================== */

let currentDateFilter = {
  type: 'all',
  start: null,
  end: null
};

/* =====================================================
   USER DROPDOWN
   ===================================================== */
document.getElementById('userProfileBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('userDropdown').classList.toggle('open');
});
document.addEventListener('click', () => {
  document.getElementById('userDropdown').classList.remove('open');
});

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
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No tickets found</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(t => `
    <tr onclick="viewTicket('${t.id}')">
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
  showToast(`<i class="fa fa-eye"></i> Opening ticket ${id}...`, 'success');
}

// Initial render
renderTickets(TICKETS);

/* =====================================================
   CHARTS (Chart.js)
   ===================================================== */
let statusChartInstance = null;
let priorityChartInstance = null;

function initCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const legendColor = isDark ? '#8A9CC0' : '#6B7A99';

  Chart.defaults.color = legendColor;
  Chart.defaults.font.family = 'Plus Jakarta Sans';

  const statusData = {
    labels: ['Open', 'In Progress', 'Awaiting Response', 'Resolved'],
    datasets: [{
      data: [7, 3, 2, 24],
      backgroundColor: ['#3B7FF5', '#0A7AFF', '#F5A623', '#2DBD8F'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

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
  const sCtx = document.getElementById('statusChart').getContext('2d');
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
  const pCtx = document.getElementById('priorityChart').getContext('2d');
  priorityChartInstance = new Chart(pCtx, { ...chartOpts, data: priorityData });

  document.getElementById('priorityLegend').innerHTML = priorityData.labels.map((l, i) => `
    <li class="legend-item">
      <span class="legend-dot" style="background:${priorityData.datasets[0].backgroundColor[i]}"></span>
      <span class="legend-label">${l}</span>
      <span class="legend-count">${priorityData.datasets[0].data[i]}</span>
    </li>
  `).join('');
}

initCharts();

/* =====================================================
   SYSTEM STATUS TAB
   ===================================================== */
function switchStatusTab(tab, el) {
  document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const list = document.getElementById('statusList');
  if (tab === 'services') {
    list.innerHTML = `
      <li class="status-row"><span class="status-name">Auth Service</span><span class="status-pill operational">Operational</span><button class="status-eye"><i class="fa fa-eye"></i></button></li>
      <li class="status-row"><span class="status-name">Data Pipeline</span><span class="status-pill operational">Operational</span><button class="status-eye"><i class="fa fa-eye"></i></button></li>
      <li class="status-row"><span class="status-name">Reporting API</span><span class="status-pill maintenance">Maintenance</span><button class="status-eye"><i class="fa fa-eye"></i></button></li>
      <li class="status-row"><span class="status-name">Notifications</span><span class="status-pill down">Down</span><button class="status-eye"><i class="fa fa-eye"></i></button></li>
    `;
  } else {
    list.innerHTML = `
      <li class="status-row"><span class="status-name">Ana Scribe</span><span class="status-pill operational">Subscribed</span><button class="status-eye"><i class="fa fa-eye"></i></button></li>
      <li class="status-row"><span class="status-name">Ana Doc-to-Code</span><span class="status-pill upgrade-pill">Upgrade Plan</span><button class="status-eye upgrade-btn" onclick="openUpgradeModal('Ana Doc-to-Code')"><i class="fa fa-arrow-up-right-dots"></i></button></li>
      <li class="status-row"><span class="status-name">Ana Intelli RCM</span><span class="status-pill upgrade-pill">Upgrade Plan</span><button class="status-eye upgrade-btn" onclick="openUpgradeModal('Ana Intelli RCM')"><i class="fa fa-arrow-up-right-dots"></i></button></li>
      <li class="status-row"><span class="status-name">Ana 360</span><span class="status-pill upgrade-pill">Upgrade Plan</span><button class="status-eye upgrade-btn" onclick="openUpgradeModal('Ana 360')"><i class="fa fa-arrow-up-right-dots"></i></button></li>
    `;
  }
}

/* =====================================================
   UPGRADE MODAL
   ===================================================== */
function openUpgradeModal(moduleName) {
  document.getElementById('upgradeModuleName').textContent = moduleName;
  document.getElementById('upgradeModal').classList.add('open');
}
function closeUpgradeModal() {
  document.getElementById('upgradeModal').classList.remove('open');
}
function closeUpgradeModalOutside(e) {
  if (e.target === document.getElementById('upgradeModal')) closeUpgradeModal();
}
function handleUpgradeClick() {
  closeUpgradeModal();
  showToast('<i class="fa fa-rocket"></i> Redirecting to upgrade page...', 'success');
}

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
let currentChatTab = 'department';
let currentChatId = 'coding';

/* =====================================================
   CHAT TAB DATA
   ===================================================== */
const CHAT_TABS_DATA = {
  department: [
    { id: 'coding', name: 'Coding Team', avatar: 'CT', avatarClass: '', time: '9:41 AM', preview: 'Any discrepancies found in coding?', unread: 3 },
    { id: 'scribe', name: 'Scribe Team', avatar: 'ST', avatarClass: 'purple', time: 'Yesterday', preview: 'Please review latest notes', unread: 0 },
    { id: 'billing', name: 'Billing Team', avatar: 'BT', avatarClass: 'green', time: 'Apr 30', preview: 'Invoice updated successfully', unread: 0 },
    { id: 'clinical', name: 'Clinical Review Team', avatar: 'CR', avatarClass: 'red', time: 'Apr 15', preview: 'Review pending for case 4521', unread: 0 },
  ],
  user: [
    { id: 'john', name: 'John Carter', avatar: 'JC', avatarClass: 'orange', time: '10:20 AM', preview: 'Need patient summary', unread: 2 },
    { id: 'emma', name: 'Emma Watson', avatar: 'EW', avatarClass: 'purple', time: 'Yesterday', preview: 'Updated prescription', unread: 0 },
  ],
  ticket: [
    { id: 'ticket4582', name: 'Ticket #4582', avatar: 'TK', avatarClass: 'green', time: '11:40 AM', preview: 'EHR sync issue', unread: 1 },
    { id: 'ticket5120', name: 'Ticket #5120', avatar: 'TK', avatarClass: 'red', time: 'Yesterday', preview: 'Coding validation pending', unread: 0 },
  ]
};

/* =====================================================
   CHAT MESSAGES
   ===================================================== */
const CHAT_MESSAGES = {
  coding: [
    { type: 'incoming', text: 'Any discrepancies found in coding?', time: 'Yesterday' },
    { type: 'incoming', text: 'Please share the case IDs.', time: 'Yesterday' },
    { type: 'incoming', text: 'IDs: P-4582, P-4601, P-4620', time: 'Yesterday' },
    { type: 'incoming-image', image: 'https://placehold.co/260x280/EAE4F2/8B8398?text=Validation+Report', text: 'Received. Will review tomorrow', time: 'Yesterday' },
    { type: 'outgoing', text: 'Uploaded updated validation report.', time: '9:45 AM' },
    { type: 'incoming', text: 'Any discrepancies found?', time: '9:46 AM' },
  ],
  scribe: [
    { type: 'incoming', text: 'SOAP notes updated successfully.', time: '10:10 AM' },
    { type: 'outgoing', text: 'Please verify patient medications.', time: '10:12 AM' },
    { type: 'incoming', text: 'Verified and approved.', time: '10:15 AM' },
  ],
  billing: [
    { type: 'incoming', text: 'Invoice updated for Q2 claims.', time: '11:30 AM' },
    { type: 'outgoing', text: 'Received updated billing summary.', time: '11:32 AM' },
  ],
  clinical: [
    { type: 'incoming', text: 'Clinical review pending for Case #4521', time: 'Apr 15' },
    { type: 'outgoing', text: 'Assigned to review specialist.', time: 'Apr 15' },
  ],
  john: [
    { type: 'incoming', text: 'Can you send patient summary?', time: '10:20 AM' },
  ],
  emma: [
    { type: 'incoming', text: 'Prescription updated successfully.', time: 'Yesterday' },
  ],
  ticket4582: [
    { type: 'incoming', text: 'EHR integration failed.', time: '11:40 AM' },
  ],
  ticket5120: [
    { type: 'incoming', text: 'Coding validation under review.', time: 'Yesterday' },
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
document.addEventListener('DOMContentLoaded', () => {
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
});

/* =====================================================
   INITIAL LOAD ANIMATIONS
   ===================================================== */
window.addEventListener('load', () => {
  document.querySelectorAll('.panel').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.06}s`;
  });
});