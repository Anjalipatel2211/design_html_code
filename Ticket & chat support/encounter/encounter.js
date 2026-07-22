/* =============================================================
   ENCOUNTER — Modal logic (pixel-perfect to reference UI)
   Loads encounter.html + encounter.css + data.js on first call,
   builds the modal, wires all interactions, and exposes
   window.openEncounterModal(appointment) / window.closeEncounterModal().
   ============================================================= */

(function (root) {
  'use strict';

  if (root.Encounter && root.Encounter.open) return;

  const ENC_PATH = (() => {
    const own = (document.currentScript && document.currentScript.src) || '';
    return own.replace(/encounter\.js.*$/, '');
  })();

  /* =========================
     State
  ========================= */
  const state = {
    patient: null,
    isDirty: false,
    autoSaveTimer: null,
    audioCurrent: 138,   // 02:18
    audioDuration: 360,  // 06:00
    audioProgress: 38,
    isPlaying: false,
    playInterval: null,
    aiExpanded: false
  };

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
    if (root.ENCOUNTER_DATA) return;
    await Promise.all([
      loadScript(ENC_PATH + 'data.js').catch(() => {}),
      loadCSS(ENC_PATH + 'encounter.css')
    ]);
  }
  async function fetchEncounterMarkup() {
    const res = await fetch(ENC_PATH + 'encounter.html');
    return await res.text();
  }

  /* =========================
     Waveform generator
  ========================= */
  function buildWaveform() {
    const rootEl = document.getElementById('encWaveform');
    const progress = document.getElementById('encWaveformProgress');
    if (!rootEl) return;
    const bars = 70;
    const playedCount = Math.floor((state.audioProgress / 100) * bars);
    let html = '';
    for (let i = 0; i < bars; i++) {
      const h = 6 + Math.abs(Math.sin(i * 0.55) * 14) + Math.abs(Math.cos(i * 0.31) * 8) + (i % 3) * 2;
      const cls = i < playedCount ? 'is-played' : '';
      html += `<span class="enc-wave-bar ${cls}" style="height:${h}px"></span>`;
    }
    rootEl.innerHTML = html;
    if (progress) progress.style.width = state.audioProgress + '%';
  }

  function updateAudioUI() {
    const timeEl = document.getElementById('encAudioTime');
    if (timeEl) {
      const m = Math.floor(state.audioCurrent / 60);
      const s = String(state.audioCurrent % 60).padStart(2, '0');
      const dm = Math.floor(state.audioDuration / 60);
      const ds = String(state.audioDuration % 60).padStart(2, '0');
      timeEl.textContent = `${m}:${s} / ${dm}:${ds}`;
    }
    const prog = document.getElementById('encWaveformProgress');
    if (prog) prog.style.width = state.audioProgress + '%';
    const bars = document.querySelectorAll('#encWaveform .enc-wave-bar');
    const played = Math.floor((state.audioProgress / 100) * bars.length);
    bars.forEach((b, i) => b.classList.toggle('is-played', i < played));
  }

  /* =========================
     Patient info
  ========================= */
  function populateHeader() {
    const p = state.patient || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('encPatientName', p.name || '—');
    set('encPatientAgeGender', `${p.age || 45}Y • ${p.gender || 'M'}`);
    set('encPatientDob', p.dob || '05/12/1956');
    set('encPatientMrn', p.mrn || '12345678');
    set('encPatientInsurance', p.insurance || 'Medicare');
    set('encEncounterDate', p.encounterDate || '06/16/2025');
    set('encEncounterTime', p.encounterTime || '09:00 AM');
    set('encVisitType', p.visitType || 'Follow-Up Visit');
    set('encProvider', p.provider || 'Dr. Smith Johnson');
    set('encLocation', p.location || 'Main Office');
  }

  /* =========================
     Patient documents
  ========================= */
  function renderDocuments() {
    const list = document.getElementById('encDocsList');
    if (!list || !root.ENCOUNTER_DATA) return;
    const docs = root.ENCOUNTER_DATA.documents;
    list.innerHTML = docs.map(d => `
      <div class="enc-doc" data-id="${escapeHtml(d.id)}">
        <div class="enc-doc-icon">PDF</div>
        <div class="enc-doc-info">
          <div class="enc-doc-name">${escapeHtml(d.name)}</div>
          <div class="enc-doc-type">${escapeHtml(d.type)} · ${d.date}</div>
        </div>
        <span class="enc-doc-badge">${d.format}</span>
      </div>
    `).join('');
  }

  /* =========================
     Templates + Editor
  ========================= */
  function renderTemplate(key) {
    if (!root.ENCOUNTER_DATA) return;
    const editor = document.getElementById('encEditor');
    if (!editor) return;

    /* Inline default content (matches reference exactly) */
    const DEFAULT_HTML = `
      <h2>Assessment / Differential Diagnosis</h2>
      <ol>
        <li>Primary noninfective gastroenteritis/colitis unspecified, K52.831</li>
        <li>IBS exacerbation</li>
        <li>Dietary intolerance</li>
        <li>Medication or probiotic-related GI effects</li>
        <li>Less likely early inflammatory bowel flare, given family history of IBD</li>
      </ol>
      <h2>Plan</h2>
      <ul>
        <li><strong>Dietary modifications:</strong><br>Avoid dairy for 2–3 weeks, monitor symptoms, consider a low FODMAP diet trial.</li>
        <li><strong>Hydration:</strong><br>Increase oral fluids, especially electrolyte-rich solutions.</li>
        <li><strong>Symptomatic relief:</strong><br>Antiemetic as needed for nausea; consider loperamide for diarrhea if not contraindicated.</li>
        <li><strong>Follow-up:</strong><br>Return in 1–2 weeks if symptoms persist or worsen; sooner if fever, blood in stool, or severe abdominal pain develops.</li>
        <li><strong>Referral:</strong><br>GI consult if symptoms do not improve with conservative measures within 3–4 weeks.</li>
      </ul>
    `;

    const tpl = root.ENCOUNTER_DATA.templates && root.ENCOUNTER_DATA.templates[key];
    if (tpl) {
      editor.innerHTML = Object.entries(tpl).map(([h, b]) => `<h2>${escapeHtml(h)}</h2>${b}`).join('');
    } else {
      editor.innerHTML = DEFAULT_HTML;
    }
    markDirty();
    updateAutosave();
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function updateAutosave() {
    const f = document.getElementById('encSaveStatus');
    if (f) {
      f.innerHTML = '<i class="fa fa-circle-check"></i> All changes saved';
      f.classList.remove('is-saving');
    }
  }

  function markDirty() {
    state.isDirty = true;
    if (state.autoSaveTimer) clearTimeout(state.autoSaveTimer);
    const f = document.getElementById('encSaveStatus');
    if (f) {
      f.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Saving…';
      f.classList.add('is-saving');
    }
    state.autoSaveTimer = setTimeout(() => {
      updateAutosave();
      state.isDirty = false;
    }, 1500);
  }

  /* =========================
     Rich text toolbar
  ========================= */
  function wireRichTextToolbar() {
    const toolbar = document.querySelector('.enc-rich-toolbar');
    const editor  = document.getElementById('encEditor');
    if (!toolbar || !editor) return;

    toolbar.addEventListener('mousedown', (e) => {
      /* Keep selection when clicking toolbar buttons */
      if (e.target.closest('button, select, label, input')) {
        e.preventDefault();
      }
    });

    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('button, label');
      if (!btn) return;
      const cmd = btn.dataset.cmd;
      if (!cmd || cmd === 'formatBlock' || cmd === 'fontName' || cmd === 'fontSize' || cmd === 'lineHeight' || cmd === 'foreColor') return;
      e.preventDefault();
      try { document.execCommand(cmd, false, null); } catch (err) {}
      markActiveToolbar();
      editor.focus();
      markDirty();
    });

    toolbar.querySelectorAll('select[data-cmd]').forEach(sel => {
      sel.addEventListener('change', () => {
        const cmd = sel.dataset.cmd;
        let val = sel.value;
        if (cmd === 'fontSize') {
          /* Map pt → execCommand size 1..7 */
          const map = { '8pt': '1', '10pt': '2', '12pt': '3', '14pt': '4', '16pt': '5', '18pt': '6', '24pt': '7' };
          val = map[val] || '3';
        } else if (cmd === 'lineHeight') {
          /* execCommand doesn't support line-height; use styleWithCSS */
          try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
          if (val !== 'Line') {
            const sel2 = window.getSelection();
            if (sel2.rangeCount) {
              const node = sel2.getSelection ? sel2.getSelection().anchorNode : null;
              /* safe noop fallback */
            }
          }
          return;
        }
        try { document.execCommand(cmd, false, val); } catch (err) {}
        editor.focus();
        markDirty();
      });
    });

    toolbar.querySelectorAll('input[data-cmd="foreColor"]').forEach(inp => {
      inp.addEventListener('input', () => {
        try { document.execCommand('foreColor', false, inp.value); } catch (e) {}
        const sw = document.getElementById('encColorSwatch');
        if (sw) sw.style.background = inp.value;
        editor.focus();
        markDirty();
      });
    });

    editor.addEventListener('input', () => markDirty());
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;'); }
    });
  }

  function markActiveToolbar() {
    const toolbar = document.querySelector('.enc-rich-toolbar');
    if (!toolbar) return;
    ['bold', 'italic', 'underline'].forEach(c => {
      const btn = toolbar.querySelector(`button[data-cmd="${c}"]`);
      if (btn) btn.classList.toggle('is-active', document.queryCommandState(c));
    });
  }

  /* =========================
     Audio player
  ========================= */
  function wireAudio() {
    const playBtn  = document.getElementById('encPlayBtn');
    const pauseBtn = document.getElementById('encPauseBtn');
    const prevBtn  = document.getElementById('encPrevBtn');
    const nextBtn  = document.getElementById('encNextBtn');
    const vol      = document.getElementById('encVolume');
    const speed    = document.getElementById('encSpeed');
    const waveWrap = document.querySelector('.enc-waveform-wrap');
    const bookmark = document.querySelector('.enc-audio-toolbar [aria-label="Bookmark"]');
    const download = document.querySelector('.enc-audio-toolbar [aria-label="Download"]');

    function start() {
      state.isPlaying = true;
      const i = playBtn.querySelector('i'); if (i) i.className = 'fa fa-pause';
      state.playInterval = setInterval(() => {
        if (state.audioCurrent >= state.audioDuration) {
          state.audioCurrent = state.audioDuration;
          state.audioProgress = 100;
          stop();
        } else {
          state.audioCurrent += 1;
          state.audioProgress = Math.round((state.audioCurrent / state.audioDuration) * 100);
        }
        updateAudioUI();
      }, 1000);
    }
    function stop() {
      state.isPlaying = false;
      const i = playBtn.querySelector('i'); if (i) i.className = 'fa fa-play';
      if (state.playInterval) { clearInterval(state.playInterval); state.playInterval = null; }
    }

    playBtn?.addEventListener('click', () => { if (state.isPlaying) stop(); else start(); });
    pauseBtn?.addEventListener('click', stop);
    prevBtn?.addEventListener('click', () => {
      state.audioCurrent = Math.max(0, state.audioCurrent - 15);
      state.audioProgress = Math.round((state.audioCurrent / state.audioDuration) * 100);
      updateAudioUI();
    });
    nextBtn?.addEventListener('click', () => {
      state.audioCurrent = Math.min(state.audioDuration, state.audioCurrent + 15);
      state.audioProgress = Math.round((state.audioCurrent / state.audioDuration) * 100);
      updateAudioUI();
    });

    /* Click waveform to seek */
    if (waveWrap) {
      waveWrap.addEventListener('click', (e) => {
        const rect = waveWrap.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        state.audioProgress = Math.round(pct);
        state.audioCurrent = Math.round((pct / 100) * state.audioDuration);
        updateAudioUI();
      });
    }

    vol?.addEventListener('input', () => {
      const fill = document.getElementById('encVolFill');
      if (fill) fill.style.width = vol.value + '%';
    });
    speed?.addEventListener('change', () => showToast('Speed: ' + speed.value));

    bookmark?.addEventListener('click', () => showToast('Bookmark added'));
    download?.addEventListener('click', () => showToast('Downloading audio…'));
  }

  /* =========================
     Action buttons → popup
  ========================= */
  function showActionPopup(action) {
    if (!root.ENCOUNTER_DATA) return;
    const data = root.ENCOUNTER_DATA;
    let title = '', items = [];
    if (action === 'macros') {
      title = 'Macros';
      items = data.getMacros().map(m => ({ name: m.name, body: m.body }));
    } else if (action === 'smart-notes') {
      title = 'Smart Notes';
      items = data.getSmartNotes().map(s => ({ name: s.title, body: s.preview }));
    } else if (action === 'scribe') {
      title = 'Request Scribe';
      items = [
        { name: 'Anna Black',  body: 'Scribe · 4 yrs' },
        { name: 'Carlos Diaz', body: 'Scribe · 2 yrs' },
        { name: 'Elena Marsh', body: 'Scribe · 6 yrs' },
        { name: 'Jordan Tai',  body: 'Scribe · 1 yr'  }
      ];
    } else if (action === 'billing') {
      title = 'Send to Billing';
      items = [
        { name: 'Linked encounter', body: 'This encounter will be queued for billing review and sent to the EHR.' }
      ];
    }
    if (!title) return;

    const overlay = document.createElement('div');
    overlay.className = 'enc-popup-overlay';
    overlay.innerHTML = `
      <div class="enc-popup-box" role="dialog" aria-modal="true">
        <div class="enc-popup-head">
          <h3>${escapeHtml(title)}</h3>
          <button class="enc-btn-icon" type="button" data-act="close" aria-label="Close">
            <i class="fa fa-xmark"></i>
          </button>
        </div>
        <div class="enc-popup-body">
          ${items.map(it => `
            <button class="enc-popup-item" type="button" data-act="select">
              <div class="enc-popup-item-name">${escapeHtml(it.name)}</div>
              <div class="enc-popup-item-body">${escapeHtml(it.body || '')}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-act="close"]')) { overlay.remove(); return; }
      const sel = e.target.closest('[data-act="select"]');
      if (sel) {
        const text = sel.querySelector('.enc-popup-item-body')?.textContent || '';
        if (action !== 'scribe' && action !== 'billing') insertIntoEditor(text);
        showToast(`${title} applied`);
        overlay.remove();
      }
    });
  }

  function insertIntoEditor(text) {
    if (!text) return;
    const editor = document.getElementById('encEditor');
    if (!editor) return;
    const p = document.createElement('p');
    p.textContent = text;
    editor.appendChild(p);
    markDirty();
  }

  function wireActionButtons() {
    document.querySelector('.enc-action-grid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.enc-action-card');
      if (!btn) return;
      showActionPopup(btn.dataset.action);
    });
    document.getElementById('encAiToggle')?.addEventListener('click', toggleAi);
  }

  /* =========================
     AI panel toggle (expand)
  ========================= */
  function toggleAi() {
    const panel = document.getElementById('encAiToggle');
    if (!panel) return;
    if (state.aiExpanded) {
      /* Collapse: remove sibling detail */
      const detail = panel.parentElement.querySelector('.enc-ai-detail');
      if (detail) detail.remove();
      panel.querySelector('.enc-ai-chev')?.classList.remove('fa-chevron-down');
      panel.querySelector('.enc-ai-chev')?.classList.add('fa-chevron-right');
      state.aiExpanded = false;
    } else {
      const detail = document.createElement('div');
      detail.className = 'enc-ai-detail';
      detail.innerHTML = `
        <div class="enc-ai-row">
          <strong>Missing Elements:</strong> 4
        </div>
        <div class="enc-ai-row">
          <strong>Document Completeness:</strong>
          <div class="enc-ai-progress"><div class="enc-ai-progress-fill" style="width:78%"></div></div>
          <span>78%</span>
        </div>
        <div class="enc-ai-row">
          <strong>Medical Necessity:</strong>
          <div class="enc-ai-progress"><div class="enc-ai-progress-fill" style="width:92%"></div></div>
          <span>92%</span>
        </div>
        <div class="enc-icd-item">
          <div class="enc-icd-head">
            <span class="enc-icd-code">R10.31</span>
            <span class="enc-icd-desc">Right lower quadrant pain</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div class="enc-icd-bar"><div class="enc-icd-bar-fill" style="width:92%"></div></div>
            <span class="enc-icd-pct">92%</span>
          </div>
          <div class="enc-icd-actions">
            <button class="enc-icd-btn accept" data-icd="R10.31"><i class="fa fa-check"></i> Accept</button>
            <button class="enc-icd-btn reject" data-icd="R10.31"><i class="fa fa-xmark"></i> Reject</button>
          </div>
        </div>
        <div class="enc-icd-item">
          <div class="enc-icd-head">
            <span class="enc-icd-code">K52.831</span>
            <span class="enc-icd-desc">Noninfective gastroenteritis</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div class="enc-icd-bar"><div class="enc-icd-bar-fill" style="width:78%"></div></div>
            <span class="enc-icd-pct">78%</span>
          </div>
          <div class="enc-icd-actions">
            <button class="enc-icd-btn accept" data-icd="K52.831"><i class="fa fa-check"></i> Accept</button>
            <button class="enc-icd-btn reject" data-icd="K52.831"><i class="fa fa-xmark"></i> Reject</button>
          </div>
        </div>
      `;
      panel.insertAdjacentElement('afterend', detail);
      panel.querySelector('.enc-ai-chev')?.classList.remove('fa-chevron-right');
      panel.querySelector('.enc-ai-chev')?.classList.add('fa-chevron-down');
      state.aiExpanded = true;
    }
  }

  /* =========================
     Footer + template bar
  ========================= */
  function wireFooter() {
    document.getElementById('encCloseBtn')?.addEventListener('click', attemptClose);
    document.getElementById('encLockChartBtn')?.addEventListener('click', () => showToast('Chart locked'));
    document.getElementById('encSaveDraftBtn')?.addEventListener('click', () => {
      showToast('Draft saved');
      state.isDirty = false;
      updateAutosave();
    });

    document.getElementById('encTemplateSelect')?.addEventListener('change', (e) => {
      renderTemplate(e.target.value);
    });
    document.getElementById('encDictateBtn')?.addEventListener('click', () => showToast('Dictation started'));
    document.getElementById('encFullBtn')?.addEventListener('click', () => {
      const editor = document.getElementById('encEditor');
      if (editor) editor.requestFullscreen?.();
    });
    document.getElementById('encResetBtn')?.addEventListener('click', () => {
      renderTemplate('nwp-gi');
      showToast('Note reset to template');
    });
  }

  function attemptClose() {
    if (state.isDirty) showConfirm(); else closeEncounter();
  }

  function showConfirm() {
    const overlay = document.createElement('div');
    overlay.className = 'enc-confirm-overlay';
    overlay.innerHTML = `
      <div class="enc-confirm-box" role="dialog" aria-modal="true">
        <div class="enc-confirm-icon"><i class="fa fa-triangle-exclamation"></i></div>
        <h3 class="enc-confirm-title">You have unsaved changes.</h3>
        <p class="enc-confirm-text">If you leave now, your edits will be lost. Are you sure you want to discard changes?</p>
        <div class="enc-confirm-actions">
          <button class="enc-confirm-cancel" type="button" data-act="cancel">Cancel</button>
          <button class="enc-confirm-discard" type="button" data-act="discard">Discard</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act) {
        if (e.target === overlay) overlay.remove();
        return;
      }
      if (act.dataset.act === 'cancel') overlay.remove();
      else if (act.dataset.act === 'discard') { overlay.remove(); state.isDirty = false; closeEncounter(); }
    });
  }

  /* =========================
     Toast
  ========================= */
  function ensureToast() {
    let el = document.querySelector('.enc-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'enc-toast';
      const modal = document.querySelector('.encounter-modal');
      if (modal) modal.appendChild(el);
    }
    return el;
  }
  function showToast(msg) {
    const el = ensureToast();
    if (!el) return;
    el.innerHTML = `<i class="fa fa-circle-check"></i> ${msg}`;
    el.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('is-visible'), 2000);
  }

  /* =========================
     Public API
  ========================= */
  async function openEncounterModal(appointment) {
    if (!appointment) return;
    if (document.querySelector('.encounter-overlay.is-open')) return;

    await ensureDependencies();
    const markup = await fetchEncounterMarkup();

    const overlay = document.createElement('div');
    overlay.className = 'encounter-overlay';
    overlay.innerHTML = markup;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-open'));

    /* Patient */
    state.patient = root.ENCOUNTER_DATA
      ? root.ENCOUNTER_DATA.buildPatient(appointment)
      : null;
    state.isDirty = false;
    state.audioCurrent = 138;
    state.audioDuration = 360;
    state.audioProgress = 38;
    state.aiExpanded = false;

    populateHeader();
    renderDocuments();
    buildWaveform();
    wireAudio();
    wireRichTextToolbar();
    wireActionButtons();
    wireFooter();

    document.addEventListener('keydown', escHandler);
  }

  function escHandler(e) {
    if (e.key === 'Escape') attemptClose();
  }

  function closeEncounter() {
    const overlay = document.querySelector('.encounter-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    if (state.playInterval) { clearInterval(state.playInterval); state.playInterval = null; }
    if (state.autoSaveTimer) { clearTimeout(state.autoSaveTimer); state.autoSaveTimer = null; }
    document.removeEventListener('keydown', escHandler);
    setTimeout(() => overlay.remove(), 250);
  }

  root.Encounter = { open: openEncounterModal, close: closeEncounter };
  root.openEncounterModal = openEncounterModal;
  root.closeEncounterModal = closeEncounter;

})(typeof window !== 'undefined' ? window : this);
