/* =============================================================
   TICKET DETAIL — Modal logic
   Lazy-loads data.js + ticket-detail.html + ticket-detail.css
   the first time a ticket row is opened, and exposes
   window.openTicketDetail(ticket).
   ============================================================= */
(function (root) {
  'use strict';

  if (root.TicketDetail && root.TicketDetail.open) return;

  const TD_PATH = (() => {
    const own = (document.currentScript && document.currentScript.src) || '';
    return own.replace(/ticket-detail\.js.*$/, '');
  })();

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* =========================
     Lazy loaders
  ========================= */
  function loadCSS(href) {
    return new Promise((resolve) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  async function ensureDependencies() {
    await Promise.all([
      loadScript(TD_PATH + 'data.js').catch(() => {}),
      loadCSS(TD_PATH + 'ticket-detail.css')
    ]);
  }
  async function fetchMarkup() {
    const res = await fetch(TD_PATH + 'ticket-detail.html');
    return await res.text();
  }

  /* =========================
     Info grid builder
  ========================= */
  function renderInfoGrid(detail) {
    const grid = document.getElementById('tdInfoGrid');
    if (!grid) return;
    const items = [
      { icon: 'fa-building',     label: 'Organization', value: detail.organization },
      { icon: 'fa-user-doctor',  label: 'Provider',     value: detail.provider },
      { icon: 'fa-hashtag',      label: 'Ticket No',    value: detail.ticketNo },
      { icon: 'fa-user',         label: 'Assign To',    value: detail.assignTo },
      { icon: 'fa-clock',        label: 'Status',       valueHtml: `<span class="td-status-badge ${detail.status.className}">${escapeHtml(detail.status.label)}</span>` },
      { icon: 'fa-folder',       label: 'Category',     value: detail.categoryLabel },
      { icon: 'fa-circle-exclamation', label: 'Priority', valueHtml: `<span class="${detail.priority.className}">${escapeHtml(detail.priority.label)}</span>` }
    ];
    grid.innerHTML = items.map((it) => `
      <div class="td-info-item">
        <span class="td-info-icon"><i class="fa ${it.icon}"></i></span>
        <div class="td-info-text">
          <span class="td-info-label">${escapeHtml(it.label)}</span>
          ${it.valueHtml
            ? `<span class="td-info-value">${it.valueHtml}</span>`
            : `<span class="td-info-value">${escapeHtml(it.value)}</span>`}
        </div>
      </div>
    `).join('');
  }

  /* =========================
     Attachments
  ========================= */
  function renderAttachments(list) {
    const wrap = document.getElementById('tdAttachList');
    if (!wrap) return;
    if (!list || !list.length) {
      wrap.innerHTML = '<div class="td-section-body" style="color:var(--text-muted)">No attachments</div>';
      return;
    }
    wrap.innerHTML = list.map((att) => `
      <div class="td-attach-item">
        <div class="td-attach-thumb">${escapeHtml(att.type || 'FILE')}</div>
        <div class="td-attach-info">
          <div class="td-attach-name">${escapeHtml(att.name)}</div>
          <span class="td-attach-size">${escapeHtml(att.size)}</span>
        </div>
        <button class="td-attach-view" type="button" aria-label="View attachment" data-act="view-att" data-name="${escapeHtml(att.name)}">
          <i class="fa fa-eye"></i>
        </button>
      </div>
    `).join('');
  }

  /* =========================
     Timeline
  ========================= */
  function renderTimeline(events) {
    const wrap = document.getElementById('tdTimeline');
    if (!wrap) return;
    if (!events || !events.length) {
      wrap.innerHTML = '<div class="td-section-body" style="color:var(--text-muted)">No timeline events yet</div>';
      return;
    }
    wrap.innerHTML = events.map((ev) => `
      <div class="td-tl-item">
        <span class="td-tl-icon ${escapeHtml(ev.iconClass || 'blue')}"><i class="fa ${escapeHtml(ev.icon || 'fa-circle-dot')}"></i></span>
        <div class="td-tl-body">
          <span class="td-tl-title">${escapeHtml(ev.title)}</span>
          <span class="td-tl-meta">${escapeHtml(ev.date)}<br>${escapeHtml(ev.time)}</span>
        </div>
      </div>
    `).join('');
  }

  /* =========================
     Populate
  ========================= */
  function populate(detail) {
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('tdTitle', `Ticket ${detail.ticketNo}`);
    const badge = document.getElementById('tdStatusBadge');
    if (badge) {
      badge.className = `td-status-badge ${detail.status.className}`;
      badge.textContent = detail.status.label;
    }
    setText('tdCreatedMeta', `Created on ${detail.createdDate} · ${detail.createdTime}`);
    setText('tdTitleBody', detail.title || detail.subject || '—');
    setText('tdDescriptionBody', detail.description || '—');
    setText('tdResolveNote', detail.resolveNote || '-');
    setText('tdNote', detail.note || '-');
    renderInfoGrid(detail);
    renderAttachments(detail.attachments);
    renderTimeline(detail.timeline);
  }

  /* =========================
     Toast (uses the dashboard toast if present)
  ========================= */
  function showToast(html, type = 'success') {
    if (typeof root.showToast === 'function') {
      root.showToast(html, type);
      return;
    }
    let toast = document.querySelector('.td-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'td-toast';
      Object.assign(toast.style, {
        position: 'fixed',
        right: '22px',
        bottom: '22px',
        zIndex: '900',
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border, #E8ECF3)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(30,50,100,.14)',
        padding: '10px 14px',
        fontSize: '13px',
        fontWeight: '600',
        opacity: '0',
        transition: '.2s ease',
        color: 'var(--text-primary, #1A2340)'
      });
      document.body.appendChild(toast);
    }
    toast.innerHTML = html;
    toast.style.opacity = '1';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2400);
  }

  /* =========================
     Close
  ========================= */
  function closeTicketDetail() {
    const overlay = document.querySelector('.ticket-detail-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', escHandler);
    setTimeout(() => overlay.remove(), 250);
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeTicketDetail();
  }

  /* =========================
     Public API
  ========================= */
  async function openTicketDetail(ticket) {
    if (!ticket) return;
    if (document.querySelector('.ticket-detail-overlay.is-open')) return;

    await ensureDependencies();
    const data = (root.TICKET_DETAIL_DATA && root.TICKET_DETAIL_DATA.getTicketDetail)
      ? root.TICKET_DETAIL_DATA.getTicketDetail(ticket)
      : null;
    if (!data) return;

    const markup = await fetchMarkup();

    const overlay = document.createElement('div');
    overlay.className = 'ticket-detail-overlay';
    overlay.innerHTML = markup;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-open'));

    populate(data);

    /* Wire topbar buttons */
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { closeTicketDetail(); return; }
      if (e.target.closest('#tdBackBtn') || e.target.closest('#tdCloseBtn')) {
        closeTicketDetail();
        return;
      }
      const viewBtn = e.target.closest('[data-act="view-att"]');
      if (viewBtn) {
        showToast(`<i class="fa fa-eye"></i> Opening ${viewBtn.dataset.name}…`);
      }
    });

    document.addEventListener('keydown', escHandler);
  }

  root.TicketDetail = { open: openTicketDetail, close: closeTicketDetail };
  root.openTicketDetail = openTicketDetail;
  root.closeTicketDetail = closeTicketDetail;
})(typeof window !== 'undefined' ? window : this);
