/* =====================================================
   SIDEBAR COLLAPSE
===================================================== */

const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapseBtn');
const mainWrapper = document.getElementById('mainWrapper');

if (collapseBtn && sidebar && mainWrapper) {
  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainWrapper.classList.toggle('collapsed');
  });
}

/* =====================================================
   MOBILE SIDEBAR
===================================================== */

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', openMobileSidebar);
}

function openMobileSidebar() {
  if (sidebar) {
    sidebar.classList.add('mobile-open');
  }

  if (sidebarOverlay) {
    sidebarOverlay.classList.add('show');
  }
}

function closeMobileSidebar() {
  if (sidebar) {
    sidebar.classList.remove('mobile-open');
  }

  if (sidebarOverlay) {
    sidebarOverlay.classList.remove('show');
  }
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeMobileSidebar);
}

document.querySelectorAll('.nav-item')
.forEach(item => {

    item.addEventListener('click', e => {

        e.preventDefault();

        document
            .querySelectorAll('.nav-item')
            .forEach(nav => {

                nav.classList.remove(
                    'active',
                    'active-secondary'
                );

            });

        item.classList.add('active');

        const page =
            item.dataset.page;

        if (
            page === 'dashboard' ||
            page === 'support-tickets'
        ) {
            loadPage(page);
        }

        if (window.innerWidth <= 1024) {
            closeMobileSidebar();
        }

    });

});

/* =====================================================
   USER DROPDOWN
===================================================== */

const userProfileBtn =
  document.getElementById('userProfileBtn');

const userDropdown =
  document.getElementById('userDropdown');

if (userProfileBtn && userDropdown) {

  userProfileBtn.addEventListener('click', (e) => {

    e.stopPropagation();

    userDropdown.classList.toggle('open');

  });

  document.addEventListener('click', () => {

    userDropdown.classList.remove('open');

  });

}

/* =====================================================
   THEME TOGGLE
===================================================== */

const themeToggle =
  document.getElementById('themeToggle');

const themeIcon =
  document.getElementById('themeIcon');

if (themeToggle && themeIcon) {

  themeToggle.addEventListener('click', () => {

    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark';

    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'light' : 'dark'
    );

    themeIcon.className =
      isDark ? 'fa fa-moon' : 'fa fa-sun';

    /* Re-render charts if available */

    if (typeof initCharts === 'function') {

      setTimeout(() => {
        initCharts();
      }, 100);

    }

  });

}

/* =====================================================
   WINDOW RESIZE
===================================================== */

window.addEventListener('resize', () => {

  if (window.innerWidth > 1024) {

    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }

    if (sidebarOverlay) {
      sidebarOverlay.classList.remove('show');
    }

  }

});

/* =====================================================
   PAGE LOADER
===================================================== */

async function loadPage(page) {

    const pageContent =
        document.getElementById('pageContent');

    try {

        let htmlPath = '';
        let cssPath = '';
        let jsPath = '';

        switch(page) {

            case 'dashboard':
                htmlPath = 'dashboard/dashboard.html';
                cssPath  = 'dashboard/dashboard.css';
                jsPath   = 'dashboard/dashboard.js';
                break;

            case 'support-tickets':
                htmlPath = 'support-tickets/support-tickets.html';
                cssPath  = 'support-tickets/support-tickets.css';
                jsPath   = 'support-tickets/support-tickets.js';
                break;

            default:
                pageContent.innerHTML =
                    '<div style="padding:20px">Page not found</div>';
                return;
        }

        const response =
            await fetch(htmlPath);

        if (!response.ok) {
            throw new Error(`Unable to load ${htmlPath}`);
        }

        const html =
            await response.text();

        pageContent.innerHTML = html;

        loadPageAssets(cssPath, jsPath);

    }
    catch(error) {

        console.error(error);

        pageContent.innerHTML =
            '<div style="padding:20px">Failed to load page.</div>';
    }
}

/* =====================================================
   LOAD CSS + JS
===================================================== */

function loadPageAssets(cssPath, jsPath) {

    const oldCss =
        document.getElementById('dynamic-page-css');

    if (oldCss) {
        oldCss.remove();
    }

    const css =
        document.createElement('link');

    css.id = 'dynamic-page-css';
    css.rel = 'stylesheet';
    css.href = cssPath;

    document.head.appendChild(css);

    const oldScript =
        document.getElementById('dynamic-page-js');

    if (oldScript) {
        oldScript.remove();
    }

    const script =
        document.createElement('script');

    script.id = 'dynamic-page-js';
    script.src = jsPath;
    script.defer = true;

    document.body.appendChild(script);
}

/* =====================================================
   DEFAULT PAGE
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    loadPage('dashboard');

});

/* =====================================================
   NOTIFICATION CENTER
===================================================== */

const notificationStorageKey = 'anaNotifications';
const notificationTasksKey = 'anaNotificationTasks';
let notificationState = [];
let activeNotificationId = null;
let pendingDeleteNotificationId = null;
let notificationFilters = {
  query: '',
  date: 'all',
  sort: 'newest',
  customStart: '',
  customEnd: '',
  tab: 'inbox'
};

const NOTIFICATION_STAFF_OPTIONS = ['Sarah Wilson', 'Robert Johnson', 'Michael Davis', 'Linda Brown'];

function makeNotificationDate(daysAgo, hours, minutes) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function minutesAgoDate(mins) {
  return new Date(Date.now() - mins * 60000).toISOString();
}

function futureNotificationDate(daysAhead, hours, minutes) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function getDefaultNotifications() {
  return [
    {
      id: 'notification_chat_maria',
      title: 'Maria Garcia',
      message: 'Sent a new message: "Can we move my follow-up to Thursday morning instead?"',
      createdAt: minutesAgoDate(5),
      isRead: false,
      category: 'message',
      type: 'chat',
      priority: 'normal',
      patient: 'Maria Garcia',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_task_encounter_note',
      title: 'New Task Assigned',
      message: 'Review Encounter Note for Robert Johnson. This task was assigned to you and requires review before end of day.',
      createdAt: minutesAgoDate(15),
      isRead: false,
      category: 'task',
      type: 'task',
      priority: 'high',
      patient: 'Robert Johnson',
      taskStatus: 'Assigned',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_chat_david',
      title: 'David Martinez',
      message: 'Sent a new message: "Attaching my updated insurance card for the file, let me know if you need anything else."',
      createdAt: minutesAgoDate(2),
      isRead: false,
      category: 'message',
      type: 'chat',
      priority: 'normal',
      patient: 'David Martinez',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_chat_emily_read',
      title: 'Emily Taylor',
      message: 'Sent a new message: "Thank you for the quick follow up, see you next visit!"',
      createdAt: makeNotificationDate(0, 7, 10),
      isRead: true,
      category: 'message',
      type: 'chat',
      priority: 'normal',
      patient: 'Emily Taylor',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_task_billing_review',
      title: 'New Task Assigned',
      message: 'Reconcile Billing Codes for Sarah Wilson. Flagged during the automated claims sweep and needs provider sign-off.',
      createdAt: minutesAgoDate(40),
      isRead: false,
      category: 'task',
      type: 'task',
      priority: 'normal',
      patient: 'Sarah Wilson',
      taskStatus: 'Assigned',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_task_read_example',
      title: 'New Task Assigned',
      message: 'Sign Completed Note for David Martinez. This task has already been reviewed.',
      createdAt: makeNotificationDate(1, 9, 0),
      isRead: true,
      category: 'task',
      type: 'task',
      priority: 'normal',
      patient: 'David Martinez',
      taskStatus: 'Assigned',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_message_with_reminder',
      title: 'James Lee',
      message: 'Sent a new message: "Can you send over my lab results when you get a chance?"',
      createdAt: makeNotificationDate(0, 13, 15),
      isRead: false,
      category: 'message',
      type: 'chat',
      priority: 'normal',
      patient: 'James Lee',
      reminderAt: futureNotificationDate(2, 10, 30),
      reminderRepeat: 'weekly',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_message_task_created',
      title: 'Linda Brown',
      message: 'Sent a new message: "Following up on the referral you mentioned last visit."',
      createdAt: makeNotificationDate(2, 16, 40),
      isRead: true,
      category: 'message',
      type: 'chat',
      priority: 'normal',
      patient: 'Linda Brown',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: true,
      assignedStaffName: 'Michael Davis'
    },
    {
      id: 'notification_archived_sample',
      title: 'Michael Davis',
      message: 'Sent a new message: "No longer need the reschedule, my original time works great."',
      createdAt: makeNotificationDate(5, 12, 0),
      isRead: true,
      category: 'message',
      type: 'chat',
      priority: 'normal',
      patient: 'Michael Davis',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: true,
      taskCreated: false
    },
    {
      id: 'notification_apt_review',
      title: 'Appointment Reminder',
      message: 'Your appointment with Robert Johnson is scheduled for today at 10:30 AM. Please review the intake summary and confirm the encounter status before the patient arrives.',
      createdAt: makeNotificationDate(0, 9, 30),
      isRead: false,
      category: 'system',
      type: 'appointment',
      priority: 'normal',
      patient: 'Robert Johnson',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_scribe_note',
      title: 'Scribe Note Ready',
      message: 'The scribe note for Maria Garcia has been completed and is ready for provider review. Please verify medication changes and sign the completed note.',
      createdAt: makeNotificationDate(0, 8, 45),
      isRead: false,
      category: 'system',
      type: 'documentation',
      priority: 'high',
      patient: 'Maria Garcia',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_ehr_sync',
      title: 'EHR Sync Completed',
      message: 'Encounter APT-2045 was synced successfully to the EHR. Coding validation and final sign-off are now available in the workflow queue.',
      createdAt: makeNotificationDate(1, 15, 20),
      isRead: true,
      category: 'system',
      type: 'ehr',
      priority: 'normal',
      patient: null,
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_claim_hold',
      title: 'Claim Review Needed',
      message: 'A claim for James Lee requires review because the suggested billing code differs from the submitted encounter documentation.',
      createdAt: makeNotificationDate(3, 11, 5),
      isRead: false,
      category: 'system',
      type: 'claim',
      priority: 'high',
      patient: 'James Lee',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    },
    {
      id: 'notification_feedback',
      title: 'QA Feedback Available',
      message: 'QA feedback is available for the Robert Johnson encounter. Two minor documentation edits were suggested before final sign-off.',
      createdAt: makeNotificationDate(9, 14, 10),
      isRead: true,
      category: 'system',
      type: 'qa',
      priority: 'normal',
      patient: 'Robert Johnson',
      reminderAt: null,
      reminderRepeat: 'none',
      archived: false,
      taskCreated: false
    }
  ];
}

function loadNotificationsFromStorage() {
  try {
    const stored = localStorage.getItem(notificationStorageKey);
    notificationState = stored ? JSON.parse(stored) : getDefaultNotifications();
  } catch (error) {
    notificationState = getDefaultNotifications();
  }
  saveNotifications();
}

function saveNotifications() {
  localStorage.setItem(notificationStorageKey, JSON.stringify(notificationState));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatNotificationTime(value) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Just now';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
  if (diffMs < day && date.getDate() === now.getDate()) return `${Math.floor(diffMs / hour)} hr ago`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(value) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getUnreadNotificationCount() {
  return notificationState.filter(item => !item.isRead && !item.archived).length;
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;
  const count = getUnreadNotificationCount();
  badge.textContent = count > 99 ? '99+' : count;
  badge.classList.toggle('is-hidden', count === 0);
}

function injectNotificationShell() {
  if (document.getElementById('notificationPopup')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <section class="notification-popup" id="notificationPopup" aria-label="Recent notifications">
      <div class="notification-popup-header">
        <div>
          <h2 class="notification-popup-title">Notifications</h2>
          <span class="notification-popup-subtitle" id="notificationPopupSubtitle"></span>
        </div>
        <button class="notification-icon-btn" type="button" data-notification-action="close-popup" aria-label="Close notifications">
          <i class="fa fa-xmark"></i>
        </button>
      </div>
      <div class="notification-list" id="notificationPopupList"></div>
      <div class="notification-popup-footer">
        <button class="notification-text-btn secondary" type="button" data-notification-action="mark-all-read">
          <i class="fa fa-envelope-open"></i> Mark all read
        </button>
        <button class="notification-text-btn" type="button" data-notification-action="open-center">
          View All Messages
        </button>
      </div>
    </section>

    <div class="notification-overlay" id="notificationOverlay"></div>

    <section class="notification-center" id="notificationCenter" aria-label="Notification center">
      <div class="notification-center-header">
        <div>
          <h2 class="notification-center-title">Notification Center</h2>
          <span class="notification-center-subtitle" id="notificationCenterSubtitle"></span>
        </div>
        <button class="notification-icon-btn" type="button" data-notification-action="close-center" aria-label="Close notification center">
          <i class="fa fa-xmark"></i>
        </button>
      </div>
      <div class="notification-tabs" id="notificationTabs" role="tablist">
        <button class="notification-tab is-active" type="button" data-notification-tab="inbox" role="tab" aria-selected="true">
          <i class="fa fa-inbox"></i> Inbox
        </button>
        <button class="notification-tab" type="button" data-notification-tab="archive" role="tab" aria-selected="false">
          <i class="fa fa-box-archive"></i> Archive
        </button>
      </div>
      <div class="notification-center-toolbar">
        <div class="notification-search">
          <i class="fa fa-search"></i>
          <input id="notificationSearch" type="search" placeholder="Search notifications">
        </div>
        <select class="notification-filter" id="notificationDateFilter" aria-label="Filter notifications by date">
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7">Last 7 Days</option>
          <option value="last30">Last 30 Days</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Date Range</option>
        </select>
        <select class="notification-filter" id="notificationSort" aria-label="Sort notifications">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="unread">Unread First</option>
        </select>
      </div>
      <div class="notification-custom-range" id="notificationCustomRange">
        <input class="notification-filter" id="notificationStartDate" type="date" aria-label="Start date">
        <input class="notification-filter" id="notificationEndDate" type="date" aria-label="End date">
      </div>
      <div class="notification-center-list" id="notificationCenterList"></div>
    </section>

    <section class="notification-modal" id="notificationModal" aria-modal="true" role="dialog"></section>
  `);
}

function renderNotificationPopup() {
  const list = document.getElementById('notificationPopupList');
  const subtitle = document.getElementById('notificationPopupSubtitle');
  if (!list) return;

  const recent = notificationState
    .slice()
    .filter(item => !item.isRead && !item.archived)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (subtitle) {
    subtitle.textContent = `${getUnreadNotificationCount()} unread`;
  }

  if (!recent.length) {
    list.innerHTML = getNotificationEmptyState();
    return;
  }

  list.innerHTML = recent.map(item => getNotificationItemMarkup(item, 'popup')).join('');
}

function getNotificationEmptyState() {
  return `
    <div class="notification-empty">
      <i class="fa fa-bell-slash"></i>
      <strong>You're all caught up! No unread notifications.</strong>
    </div>
  `;
}

function getNotificationItemMarkup(item, context) {
  const reminderChip = item.reminderAt ? `<span class="notification-chip"><i class="fa fa-clock"></i>Reminder ${escapeHtml(formatFullDate(item.reminderAt))}</span>` : null;
  const priorityChip = item.priority === 'high' ? `<span class="notification-chip high">High Priority</span>` : null;
  const taskChip = item.category === 'task' ? `<span class="notification-chip"><i class="fa fa-list-check"></i>${escapeHtml(item.taskStatus || 'Assigned')}</span>` : null;
  const metaChips = [taskChip, priorityChip, reminderChip].filter(Boolean).join('');

  return `
    <article class="notification-item ${item.isRead ? '' : 'unread'}" data-notification-id="${escapeHtml(item.id)}" data-notification-action="view-details" role="button" tabindex="0">
      <span class="notification-dot" aria-hidden="true"></span>
      <div>
        <div class="notification-row">
          <span class="notification-title-text">${escapeHtml(item.title)}</span>
          <span class="notification-time">${formatNotificationTime(item.createdAt)}</span>
        </div>
        <p class="notification-preview">${escapeHtml(item.message)}</p>
        ${metaChips ? `<div class="notification-meta-row">${metaChips}</div>` : ''}
        ${context === 'popup' ? getNotificationActionsMarkup(item) : ''}
      </div>
    </article>
  `;
}

function getNotificationActionsMarkup(item) {
  if (item.archived) {
    return `
      <div class="notification-actions" data-notification-id="${escapeHtml(item.id)}">
        <button class="notification-action-btn" type="button" data-notification-action="restore">
          <i class="fa fa-rotate-left"></i> Restore to Inbox
        </button>
      </div>
    `;
  }

  const showTask = item.category !== 'task';
  const taskButton = !showTask ? '' : item.taskCreated
    ? `<button class="notification-action-btn" type="button" disabled><i class="fa fa-circle-check"></i> Task Created</button>`
    : `<button class="notification-action-btn" type="button" data-notification-action="add-task"><i class="fa fa-list-check"></i> Create Task</button>`;

  return `
    <div class="notification-actions" data-notification-id="${escapeHtml(item.id)}">
      <button class="notification-action-btn" type="button" data-notification-action="set-reminder">
        <i class="fa fa-clock"></i> Reminder
      </button>
      ${taskButton}
      <button class="notification-action-btn" type="button" data-notification-action="archive">
        <i class="fa fa-box-archive"></i> Archive
      </button>
    </div>
  `;
}

function renderNotificationCenter() {
  const list = document.getElementById('notificationCenterList');
  const subtitle = document.getElementById('notificationCenterSubtitle');
  const customRange = document.getElementById('notificationCustomRange');
  if (!list) return;

  const inboxCount = notificationState.filter(item => !item.archived).length;
  const archiveCount = notificationState.filter(item => item.archived).length;

  if (subtitle) {
    subtitle.textContent = notificationFilters.tab === 'archive'
      ? `${archiveCount} archived`
      : `${inboxCount} total, ${getUnreadNotificationCount()} unread`;
  }

  document.querySelectorAll('.notification-tab').forEach(tab => {
    const isActive = tab.dataset.notificationTab === notificationFilters.tab;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  if (customRange) {
    customRange.classList.toggle('show', notificationFilters.date === 'custom');
  }

  const results = getFilteredNotifications();
  if (!results.length) {
    list.innerHTML = getNotificationEmptyState();
    return;
  }

  list.innerHTML = results.map(item => {
    const priorityChip = item.priority === 'high' ? `<span class="notification-chip high">High Priority</span>` : null;
    const taskChip = item.category === 'task' ? `<span class="notification-chip"><i class="fa fa-list-check"></i>${escapeHtml(item.taskStatus || 'Assigned')}</span>` : null;
    const createdTaskChip = item.taskCreated ? `<span class="notification-chip"><i class="fa fa-circle-check"></i>Task created${item.assignedStaffName ? ` · ${escapeHtml(item.assignedStaffName)}` : ''}</span>` : null;
    const metaChips = [taskChip, priorityChip, createdTaskChip].filter(Boolean).join('');

    return `
    <article class="notification-center-card ${item.isRead ? '' : 'unread'}" data-notification-id="${escapeHtml(item.id)}" data-notification-action="view-details" role="button" tabindex="0">
      <span class="notification-dot" aria-hidden="true"></span>
      <div>
        <div class="notification-row">
          <span class="notification-title-text">${escapeHtml(item.title)}</span>
          <span class="notification-time">${formatFullDate(item.createdAt)}</span>
        </div>
        <p class="notification-message">${escapeHtml(item.message)}</p>
        ${metaChips ? `<div class="notification-meta-row">${metaChips}</div>` : ''}
        ${getNotificationActionsMarkup(item)}
      </div>
    </article>
  `;
  }).join('');
}

function getFilteredNotifications() {
  let results = notificationState.slice().filter(item =>
    notificationFilters.tab === 'archive' ? item.archived : !item.archived
  );
  const query = notificationFilters.query.trim().toLowerCase();

  if (query) {
    results = results.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query)
    );
  }

  const range = getDateFilterRange();
  if (range) {
    results = results.filter(item => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= range.start && createdAt <= range.end;
    });
  }

  results.sort((a, b) => {
    if (notificationFilters.sort === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (notificationFilters.sort === 'unread') {
      return Number(a.isRead) - Number(b.isRead) || new Date(b.createdAt) - new Date(a.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return results;
}

function getDateFilterRange() {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (notificationFilters.date === 'today') return { start, end };

  if (notificationFilters.date === 'yesterday') {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
    return { start, end };
  }

  if (notificationFilters.date === 'last7') {
    start.setDate(start.getDate() - 6);
    return { start, end };
  }

  if (notificationFilters.date === 'last30') {
    start.setDate(start.getDate() - 29);
    return { start, end };
  }

  if (notificationFilters.date === 'month') {
    start.setDate(1);
    return { start, end };
  }

  if (notificationFilters.date === 'custom' && notificationFilters.customStart && notificationFilters.customEnd) {
    const customStart = new Date(notificationFilters.customStart);
    const customEnd = new Date(notificationFilters.customEnd);
    customStart.setHours(0, 0, 0, 0);
    customEnd.setHours(23, 59, 59, 999);
    return { start: customStart, end: customEnd };
  }

  return null;
}

function refreshNotifications() {
  updateNotificationBadge();
  renderNotificationPopup();
  renderNotificationCenter();
}

function openNotificationPopup() {
  const popup = document.getElementById('notificationPopup');
  const bell = document.getElementById('notificationBell');
  if (!popup) return;
  popup.classList.toggle('open');
  const isOpen = popup.classList.contains('open');
  if (bell) {
    bell.classList.toggle('open', isOpen);
    bell.setAttribute('aria-expanded', String(isOpen));
  }
  renderNotificationPopup();
}

function closeNotificationPopup() {
  const popup = document.getElementById('notificationPopup');
  const bell = document.getElementById('notificationBell');
  if (popup) popup.classList.remove('open');
  if (bell) {
    bell.classList.remove('open');
    bell.setAttribute('aria-expanded', 'false');
  }
}

function openNotificationCenter() {
  closeNotificationPopup();
  document.getElementById('notificationOverlay').classList.add('open');
  document.getElementById('notificationCenter').classList.add('open');
  renderNotificationCenter();
}

function closeNotificationCenter() {
  document.getElementById('notificationOverlay').classList.remove('open');
  document.getElementById('notificationCenter').classList.remove('open');
  closeNotificationModal();
}

function getNotificationById(id) {
  return notificationState.find(item => item.id === id);
}

function markNotificationRead(id, isRead = true) {
  const notification = getNotificationById(id);
  if (!notification) return;
  notification.isRead = isRead;
  saveNotifications();
  refreshNotifications();
}

function openNotificationDetails(id) {
  const notification = getNotificationById(id);
  if (!notification) return;
  activeNotificationId = id;
  markNotificationRead(id, true);

  const reminderBlock = notification.reminderAt
    ? `
      <div class="notification-reminder-card">
        <div class="notification-reminder-card-head">
          <i class="fa fa-clock"></i>
          <strong>Reminder Scheduled</strong>
        </div>
        <div class="notification-reminder-card-time">${formatFullDate(notification.reminderAt)}</div>
        <div class="notification-reminder-card-actions">
          <button class="notification-text-btn secondary" type="button" data-notification-action="set-reminder">Edit</button>
          <button class="notification-text-btn secondary" type="button" data-notification-action="remove-reminder">Remove Reminder</button>
        </div>
      </div>
    `
    : '';

  const detailRows = [
    ['Created', formatFullDate(notification.createdAt)],
    ['Priority', notification.priority === 'high' ? 'High' : 'Normal'],
    notification.category === 'task' ? ['Task Status', notification.taskStatus || 'Assigned'] : null,
    notification.taskCreated ? ['Task Created', `Yes${notification.assignedStaffName ? ` · Assigned to ${escapeHtml(notification.assignedStaffName)}` : ''}`] : null,
    notification.patient ? ['Related Patient', escapeHtml(notification.patient)] : null
  ].filter(Boolean);

  const detailGridHtml = `
    <div class="notification-detail-grid">
      ${detailRows.map(([label, value]) => `
        <div class="notification-detail-row">
          <span class="notification-detail-label">${label}</span>
          <span class="notification-detail-value">${value}</span>
        </div>
      `).join('')}
    </div>
  `;

  const showTaskAction = notification.category !== 'task' && !notification.archived;
  const taskFooterBtn = !showTaskAction ? '' : notification.taskCreated
    ? `<button class="notification-text-btn secondary" type="button" disabled><i class="fa fa-circle-check"></i> Task Created</button>`
    : `<button class="notification-text-btn secondary" type="button" data-notification-action="add-task">Create Task</button>`;

  const archiveFooterBtn = notification.archived
    ? `<button class="notification-text-btn" type="button" data-notification-action="restore">Restore to Inbox</button>`
    : `<button class="notification-text-btn secondary" type="button" data-notification-action="archive">Archive</button>`;

  const reminderFooterBtn = notification.archived || notification.reminderAt
    ? ''
    : `<button class="notification-text-btn secondary" type="button" data-notification-action="set-reminder">Reminder</button>`;

  openNotificationModal(`
    <div class="notification-modal-header">
      <div>
        <h2 class="notification-modal-title">${escapeHtml(notification.title)}</h2>
        <span class="notification-popup-subtitle">${formatFullDate(notification.createdAt)}</span>
      </div>
      <button class="notification-icon-btn" type="button" data-notification-action="close-modal" aria-label="Close details">
        <i class="fa fa-xmark"></i>
      </button>
    </div>
    <div class="notification-modal-body">
      <p class="notification-detail-message">${escapeHtml(notification.message)}</p>
      ${detailGridHtml}
      ${reminderBlock}
    </div>
    <div class="notification-modal-footer">
      ${reminderFooterBtn}
      ${taskFooterBtn}
      ${archiveFooterBtn}
    </div>
  `);
}

function openReminderDialog(id) {
  const notification = getNotificationById(id);
  if (!notification) return;
  activeNotificationId = id;

  const now = new Date();
  const minDate = now.toISOString().slice(0, 10);
  const existing = notification.reminderAt ? new Date(notification.reminderAt) : null;
  const dateValue = existing ? existing.toISOString().slice(0, 10) : minDate;
  const timeValue = existing ? existing.toTimeString().slice(0, 5) : '';
  const repeatValue = notification.reminderRepeat || 'none';

  openNotificationModal(`
    <form id="notificationReminderForm">
      <div class="notification-modal-header">
        <h2 class="notification-modal-title">Reminder</h2>
        <button class="notification-icon-btn" type="button" data-notification-action="close-modal" aria-label="Close reminder">
          <i class="fa fa-xmark"></i>
        </button>
      </div>
      <div class="notification-modal-body">
        <div class="notification-form-grid">
          <p class="notification-detail-message">${escapeHtml(notification.title)}</p>
          <div class="notification-field">
            <label for="notificationReminderDate"><i class="fa fa-calendar"></i> Reminder Date</label>
            <input id="notificationReminderDate" type="date" min="${minDate}" value="${dateValue}" required>
          </div>
          <div class="notification-field">
            <label for="notificationReminderTime"><i class="fa fa-clock"></i> Reminder Time</label>
            <input id="notificationReminderTime" type="time" value="${timeValue}" required>
          </div>
          <div class="notification-field">
            <label for="notificationReminderRepeat">Repeat</label>
            <select id="notificationReminderRepeat">
              <option value="none" ${repeatValue === 'none' ? 'selected' : ''}>None</option>
              <option value="daily" ${repeatValue === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${repeatValue === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${repeatValue === 'monthly' ? 'selected' : ''}>Monthly</option>
            </select>
          </div>
          <p class="notification-helper-text"><i class="fa fa-circle-info"></i> You'll receive a reminder at the selected date and time.</p>
        </div>
      </div>
      <div class="notification-modal-footer">
        <button class="notification-text-btn secondary" type="button" data-notification-action="close-modal">Cancel</button>
        <button class="notification-text-btn" type="submit">Save Reminder</button>
      </div>
    </form>
  `);
}

function saveReminder(event) {
  event.preventDefault();
  const notification = getNotificationById(activeNotificationId);
  const dateInput = document.getElementById('notificationReminderDate');
  const timeInput = document.getElementById('notificationReminderTime');
  const repeatInput = document.getElementById('notificationReminderRepeat');
  if (!notification || !dateInput?.value || !timeInput?.value) return;

  const reminderDate = new Date(`${dateInput.value}T${timeInput.value}`);
  if (reminderDate <= new Date()) {
    showAppToast('<i class="fa fa-circle-exclamation"></i> Reminder date and time cannot be in the past.', 'error');
    return;
  }

  notification.reminderAt = reminderDate.toISOString();
  notification.reminderRepeat = repeatInput?.value || 'none';
  notification.reminderTriggeredAt = null;
  saveNotifications();
  refreshNotifications();
  closeNotificationModal();
  requestBrowserNotificationPermission();
  showAppToast('<i class="fa fa-clock"></i> Reminder scheduled.', 'success');
}

function removeReminder() {
  const notification = getNotificationById(activeNotificationId);
  if (!notification) return;
  notification.reminderAt = null;
  notification.reminderRepeat = 'none';
  notification.reminderTriggeredAt = null;
  saveNotifications();
  refreshNotifications();
  closeNotificationModal();
  showAppToast('<i class="fa fa-clock"></i> Reminder removed.', 'success');
}

function openTaskDialog(id) {
  const notification = getNotificationById(id);
  if (!notification || notification.taskCreated) return;
  activeNotificationId = id;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = tomorrow.toISOString().slice(0, 10);

  openNotificationModal(`
    <form id="notificationTaskForm">
      <div class="notification-modal-header">
        <h2 class="notification-modal-title">Create Task</h2>
        <button class="notification-icon-btn" type="button" data-notification-action="close-modal" aria-label="Close task dialog">
          <i class="fa fa-xmark"></i>
        </button>
      </div>
      <div class="notification-modal-body">
        <div class="notification-form-grid">
          <div class="notification-field">
            <label for="notificationTaskTitle">Task title</label>
            <input id="notificationTaskTitle" value="${escapeHtml(notification.title)}" required>
          </div>
          <div class="notification-field">
            <label for="notificationTaskDescription">Description</label>
            <textarea id="notificationTaskDescription" required>${escapeHtml(notification.message)}</textarea>
          </div>
          <div class="notification-inline-fields">
            <div class="notification-field">
              <label for="notificationTaskDue">Due date</label>
              <input id="notificationTaskDue" type="date" value="${dueDate}" required>
            </div>
            <div class="notification-field">
              <label for="notificationTaskPriority">Priority</label>
              <select id="notificationTaskPriority">
                <option ${notification.priority === 'high' ? 'selected' : ''}>High</option>
                <option ${notification.priority !== 'high' ? 'selected' : ''}>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div class="notification-field">
            <label for="notificationTaskAssignedTo">Assigned To</label>
            <select id="notificationTaskAssignedTo">
              <option value="">Select staff…</option>
              ${NOTIFICATION_STAFF_OPTIONS.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="notification-modal-footer">
        <button class="notification-text-btn secondary" type="button" data-notification-action="close-modal">Cancel</button>
        <button class="notification-text-btn" type="submit">Save Task</button>
      </div>
    </form>
  `);
}

function saveTaskFromNotification(event) {
  event.preventDefault();
  const notification = getNotificationById(activeNotificationId);
  if (!notification) return;

  const title = document.getElementById('notificationTaskTitle').value.trim();
  const dueDate = document.getElementById('notificationTaskDue').value;
  const priority = document.getElementById('notificationTaskPriority').value;
  const assignedTo = document.getElementById('notificationTaskAssignedTo')?.value || '';
  if (!title || !dueDate) return;

  const task = {
    task: title,
    patient: notification.patient || 'Notification',
    due: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dueClass: '',
    priority,
    assignedTo: assignedTo || 'Unassigned',
    status: 'Pending',
    statusClass: 'status-badge-gray'
  };

  const storedTasks = JSON.parse(localStorage.getItem(notificationTasksKey) || '[]');
  storedTasks.unshift(task);
  localStorage.setItem(notificationTasksKey, JSON.stringify(storedTasks));

  notification.taskCreated = true;
  notification.assignedStaffName = assignedTo || null;
  saveNotifications();
  refreshNotifications();
  if (typeof renderTasks === 'function') renderTasks();
  closeNotificationModal();
  showAppToast(
    assignedTo
      ? `<i class="fa fa-circle-check"></i> Task Created — Assigned to ${escapeHtml(assignedTo)}`
      : '<i class="fa fa-circle-check"></i> Task Created',
    'success'
  );
}

function archiveNotification(id) {
  const notification = getNotificationById(id);
  if (!notification) return;
  notification.archived = true;
  saveNotifications();
  refreshNotifications();
  closeNotificationModal();
  showAppToast('<i class="fa fa-box-archive"></i> Notification archived.', 'success');
}

function restoreNotification(id) {
  const notification = getNotificationById(id);
  if (!notification) return;
  notification.archived = false;
  saveNotifications();
  refreshNotifications();
  closeNotificationModal();
  showAppToast('<i class="fa fa-rotate-left"></i> Notification restored to Inbox.', 'success');
}

function openNotificationModal(markup) {
  const modal = document.getElementById('notificationModal');
  const overlay = document.getElementById('notificationOverlay');
  if (!modal || !overlay) return;
  modal.innerHTML = markup;
  overlay.classList.add('open');
  modal.classList.add('open');
}

function closeNotificationModal() {
  const modal = document.getElementById('notificationModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.innerHTML = '';
  activeNotificationId = null;
  pendingDeleteNotificationId = null;
  if (!document.getElementById('notificationCenter')?.classList.contains('open')) {
    document.getElementById('notificationOverlay')?.classList.remove('open');
  }
}

function markAllNotificationsRead() {
  notificationState.forEach(item => {
    item.isRead = true;
  });
  saveNotifications();
  refreshNotifications();
  showAppToast('<i class="fa fa-envelope-open"></i> All notifications marked read.', 'success');
}

function checkDueReminders() {
  const now = new Date();
  let changed = false;

  notificationState.forEach(item => {
    if (!item.reminderAt || item.reminderTriggeredAt) return;
    if (new Date(item.reminderAt) <= now) {
      item.isRead = false;
      item.createdAt = now.toISOString();
      item.reminderTriggeredAt = now.toISOString();
      item.reminderAt = null;
      changed = true;
      showAppToast(`<i class="fa fa-bell"></i> Reminder: ${escapeHtml(item.title)}`, 'success');
      showBrowserNotification(item);
    }
  });

  if (changed) {
    saveNotifications();
    refreshNotifications();
  }
}

function requestBrowserNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showBrowserNotification(item) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(item.title, {
    body: item.message,
    tag: item.id
  });
}

function showAppToast(html, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = html;
  toast.className = `toast show ${type}`;
  window.clearTimeout(window.anaToastTimer);
  window.anaToastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function handleNotificationAction(event) {
  const tabTarget = event.target.closest('[data-notification-tab]');
  if (tabTarget) {
    notificationFilters.tab = tabTarget.dataset.notificationTab;
    renderNotificationCenter();
    return;
  }

  const actionTarget = event.target.closest('[data-notification-action]');
  if (!actionTarget) return;

  const action = actionTarget.dataset.notificationAction;
  const id = actionTarget.closest('[data-notification-id]')?.dataset.notificationId || activeNotificationId;

  if (action !== 'view-details') {
    event.stopPropagation();
  }

  if (action === 'close-popup') closeNotificationPopup();
  if (action === 'open-center') openNotificationCenter();
  if (action === 'close-center') closeNotificationCenter();
  if (action === 'close-modal') closeNotificationModal();
  if (action === 'mark-all-read') markAllNotificationsRead();
  if (action === 'view-details' && id) openNotificationDetails(id);
  if (action === 'toggle-read' && id) markNotificationRead(id, !getNotificationById(id).isRead);
  if (action === 'set-reminder' && id) openReminderDialog(id);
  if (action === 'remove-reminder' && id) removeReminder(id);
  if (action === 'add-task' && id) openTaskDialog(id);
  if (action === 'archive' && id) archiveNotification(id);
  if (action === 'restore' && id) restoreNotification(id);
}

function bindNotificationEvents() {
  const bell = document.getElementById('notificationBell');
  if (bell) {
    bell.addEventListener('click', event => {
      event.stopPropagation();
      openNotificationPopup();
    });
  }

  document.addEventListener('click', event => {
    handleNotificationAction(event);
    const popup = document.getElementById('notificationPopup');
    if (
      popup?.classList.contains('open') &&
      !event.target.closest('#notificationPopup') &&
      !event.target.closest('#notificationBell')
    ) {
      closeNotificationPopup();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeNotificationPopup();
      closeNotificationModal();
      if (document.getElementById('notificationCenter')?.classList.contains('open')) closeNotificationCenter();
    }

    if (
      (event.key === 'Enter' || event.key === ' ') &&
      event.target.matches('.notification-item[data-notification-action="view-details"]')
    ) {
      event.preventDefault();
      openNotificationDetails(event.target.dataset.notificationId);
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'notificationSearch') {
      notificationFilters.query = event.target.value;
      renderNotificationCenter();
    }
    if (event.target.id === 'notificationStartDate') {
      notificationFilters.customStart = event.target.value;
      renderNotificationCenter();
    }
    if (event.target.id === 'notificationEndDate') {
      notificationFilters.customEnd = event.target.value;
      renderNotificationCenter();
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'notificationDateFilter') {
      notificationFilters.date = event.target.value;
      renderNotificationCenter();
    }
    if (event.target.id === 'notificationSort') {
      notificationFilters.sort = event.target.value;
      renderNotificationCenter();
    }
  });

  document.addEventListener('submit', event => {
    if (event.target.id === 'notificationReminderForm') saveReminder(event);
    if (event.target.id === 'notificationTaskForm') saveTaskFromNotification(event);
  });

  document.getElementById('notificationOverlay')?.addEventListener('click', () => {
    closeNotificationModal();
    if (document.getElementById('notificationCenter')?.classList.contains('open')) return;
    closeNotificationCenter();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectNotificationShell();
  loadNotificationsFromStorage();
  bindNotificationEvents();
  refreshNotifications();
  checkDueReminders();
  window.setInterval(checkDueReminders, 30000);
});