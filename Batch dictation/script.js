/* ─── State ─────────────────────────────────────────────────── */
const state = {
  scribeMode: null,          // 'self' | 'with'
  mediaRecorder: null,
  audioChunks: [],
  stream: null,
  timerInterval: null,
  recordingStartTime: 0,
  elapsedBeforePause: 0,
  isRecording: false,
  recordings: [],
  recordingCounter: 0,
  confirmCallback: null,
  selectedVisitType: '',
  selectedTemplate: '',
  selectedPatientName: '',
  externalUploadMode: false,
};

/* ─── DOM Refs ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

// Scribe select overlay
const scribeSelectOverlay  = $('scribeSelectOverlay');
const closeScribeSelect    = $('closeScribeSelect');
const selfScribeBtn        = $('selfScribeBtn');
const withScribeBtn        = $('withScribeBtn');

// Main modal
const openModalBtn         = $('openModalBtn');
const closeModalBtn        = $('closeModal');
const cancelBtn            = $('cancelBtn');
const modalOverlay         = $('modalOverlay');
const dashBg               = document.querySelector('.dashboard-bg');
const modePill             = $('modePill');

// Encounter fields
const dictationDate        = $('dictationDate');

// Recording setup
const recordSetup          = $('recordSetup');
// header subtitle in the modal is `modeSubLabel` in index.html
const setupSubtitle        = $('modeSubLabel');
const recordSetupClose     = $('recordSetupClose');
const recordSetupCancel    = $('recordSetupCancel');
const recordSetupStart     = $('recordSetupStart');
const visitType            = $('visitType');
const templateType         = $('templateType');
const patientNameGroup     = $('patientNameGroup');
const patientNameInput     = $('patientName');

// Timer
const timerDisplay         = $('recordingTimer');
const timerStatus          = $('timerStatus');
const timerRing            = $('timerRing');
const ringProgress         = $('ringProgress');

//external upload
const externalUploadBtn    = $('externalUploadBtn');

// Control buttons
const recordButton         = $('recordButton');
const recordLabel          = $('recordLabel');
const recordIcon           = $('recordIcon');
const stopButton           = $('stopButton');
const restartButton        = $('restartRecording');

// Recordings list
const recordingsList       = $('recordingsList');
const recordingCount       = $('recordingCount');
const emptyState           = $('emptyState');

// Confirm
const confirmOverlay       = $('confirmOverlay');
const confirmTitle         = $('confirmTitle');
const confirmMessage       = $('confirmMessage');
const confirmIcon          = $('confirmIcon');
const confirmOkBtn         = $('confirmOk');
const confirmCancelBtn     = $('confirmCancel');

/* ─── Init ──────────────────────────────────────────────────── */
(function init() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  dictationDate.value = `${y}-${m}-${d}`;
})();

/* ─── Open "New Dictation" → show scribe-select first ───────── */
openModalBtn.addEventListener('click', () => {
  scribeSelectOverlay.classList.add('active');
  dashBg.classList.add('blurred');
});

closeScribeSelect.addEventListener('click', () => {
  scribeSelectOverlay.classList.remove('active');
  dashBg.classList.remove('blurred');
});

selfScribeBtn.addEventListener('click', () => {
  setScribeMode('self');
});

withScribeBtn.addEventListener('click', () => {
  setScribeMode('with');
});

function setScribeMode(mode) {
  state.scribeMode = mode;
  scribeSelectOverlay.classList.remove('active');
  modalOverlay.classList.add('active');

  if (mode === 'self') {
    // Recording setup: require patient name
    patientNameGroup.style.display = 'flex';
    setupSubtitle.textContent = 'Choose a visit type, template, and patient name to continue.';

    // Mode pill
    modePill.textContent = 'Self Scribe';
    modePill.className = 'mode-pill';
    // Disable external upload action/button in self-scribe
    if (externalUploadBtn) {
      externalUploadBtn.disabled = true;
      externalUploadBtn.classList.add('disabled');
      externalUploadBtn.setAttribute('aria-disabled', 'true');
      externalUploadBtn.title = 'External upload is available only in With Scribe mode.';
    }
  } else {
    // Recording setup: no patient name required
    patientNameGroup.style.display = 'none';
    setupSubtitle.textContent = 'Choose a visit type and template to continue.';

    // Mode pill
    modePill.textContent = 'With Scribe';
    modePill.className = 'mode-pill with-scribe';
    // Enable external upload action/button in with-scribe
    if (externalUploadBtn) {
      externalUploadBtn.disabled = false;
      externalUploadBtn.classList.remove('disabled');
      externalUploadBtn.removeAttribute('aria-disabled');
      externalUploadBtn.title = '';
    }
  }
}

/* ─── Mode pill click → switch mode ────────────────────────── */
modePill.addEventListener('click', () => {
  const next = state.scribeMode === 'self' ? 'with' : 'self';
  showConfirm(
    '🔄', 'Switch Mode?',
    `Switch to ${next === 'self' ? 'Self Scribe' : 'With Scribe'} mode? Current recordings will be kept.`,
    () => {
      setScribeMode(next);
    }
  );
});

/* ─── Modal Close ───────────────────────────────────────────── */
closeModalBtn.addEventListener('click', () => closeModal());
cancelBtn.addEventListener('click', () => closeModal());

function closeModal() {
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
  }
  stopTimerInternal();
  modalOverlay.classList.remove('active');
  scribeSelectOverlay.classList.remove('active');
  dashBg.classList.remove('blurred');
}

/* ─── Timer ─────────────────────────────────────────────────── */
const RING_CIRCUMFERENCE = 326.7;
const MAX_DISPLAY_SECS   = 300;

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function getElapsed() {
  return Math.floor((Date.now() - state.recordingStartTime + state.elapsedBeforePause) / 1000);
}

function updateTimerDisplay() {
  const sec = getElapsed();
  timerDisplay.textContent = formatTime(sec);
  const progress = Math.min(sec / MAX_DISPLAY_SECS, 1);
  const offset   = RING_CIRCUMFERENCE * (1 - progress);
  ringProgress.style.strokeDashoffset = offset;
}

function startTimerInternal() {
  state.recordingStartTime = Date.now();
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(updateTimerDisplay, 250);
  updateTimerDisplay();
}

function pauseTimerInternal() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.elapsedBeforePause += Date.now() - state.recordingStartTime;
  updateTimerDisplay();
}

function stopTimerInternal() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.elapsedBeforePause = 0;
  state.recordingStartTime = 0;
  timerDisplay.textContent = '00:00';
  ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
  timerRing.classList.remove('recording', 'paused');
  timerStatus.textContent = 'Ready';
}

/* ─── Recording Controls ────────────────────────────────────── */

recordButton.addEventListener('click', handleRecordClick);
stopButton.addEventListener('click', stopRecording);
restartButton.addEventListener('click', handleRestart);
externalUploadBtn.addEventListener('click', handleExternalUpload);
recordSetupClose.addEventListener('click', hideRecordingSetup);
recordSetupCancel.addEventListener('click', hideRecordingSetup);
recordSetupStart.addEventListener('click', beginRecordingFromSetup);
visitType.addEventListener('change', () => { state.selectedVisitType = visitType.value; });
templateType.addEventListener('change', () => { state.selectedTemplate = templateType.value; });
patientNameInput.addEventListener('input', () => { state.selectedPatientName = patientNameInput.value.trim(); });



async function handleExternalUpload() {

  // Only for With Scribe mode
  if (state.scribeMode === 'self') {

    showToast(
      'External upload is available only in With Scribe mode.',
      'warning'
    );

    return;
  }

  // Open file picker directly
  const input = document.createElement('input');

  input.type = 'file';

  input.accept = `
    .mp3,
    .wav,
    .m4a,
    .webm,
    audio/*
  `;

  input.multiple = true;

  input.onchange = () => {

    const files = Array.from(input.files || []);

    if (!files.length) return;

    files.forEach(file => {

      addRecordingCard(
        file,
        0,
        'file',
        {
          fileName: file.name
        }
      );

    });

    showToast(
      `${files.length} audio file(s) selected`,
      'success'
    );
  };

  input.click();
}

function beginUploadFromSetup() {
  const vt = visitType.value;
  const tpl = templateType.value;

  if (!vt || !tpl) {
    showToast('Please select both visit type and template.', 'warning');
    return;
  }

  // Trigger file picker for audio files
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mp3,audio/mpeg,audio/mp3,audio/wav,video/webm,audio/m4a,audio/*';
  input.multiple = true;
  input.onchange = () => {
    const files = Array.from(input.files || []);
    if (files.length === 0) {
      restoreSetupToRecordMode();
      hideRecordingSetup();
      return;
    }
    files.forEach(file => addRecordingCard(file, 0, 'file', { visitType: vt, template: tpl, fileName: file.name }));
    restoreSetupToRecordMode();
    hideRecordingSetup();
  };
  input.click();
}

function restoreSetupToRecordMode() {
  if (!state.externalUploadMode) return;
  state.externalUploadMode = false;
  // restore start button text and handler
  if (recordSetup.dataset.prevText) {
    recordSetupStart.textContent = recordSetup.dataset.prevText;
    delete recordSetup.dataset.prevText;
  }
  recordSetupStart.removeEventListener('click', beginUploadFromSetup);
  recordSetupStart.addEventListener('click', beginRecordingFromSetup);
}

async function handleRecordClick() {
  const mr = state.mediaRecorder;
  if (!mr || mr.state === 'inactive') {
    openRecordingSetup();
    return;
  }
  if (mr.state === 'recording') { pauseRecording(); return; }
  if (mr.state === 'paused') { resumeRecording(); }
}



function openRecordingSetup() {
  recordSetup.classList.add('active');
  state.selectedVisitType = visitType.value || state.selectedVisitType;
  state.selectedTemplate = templateType.value || state.selectedTemplate;
}

function hideRecordingSetup() {
  recordSetup.classList.remove('active');
  if (state.externalUploadMode) restoreSetupToRecordMode();
}

async function beginRecordingFromSetup() {
  state.selectedVisitType = visitType.value;
  state.selectedTemplate = templateType.value;
  state.selectedPatientName = patientNameInput.value.trim();

  if (!state.selectedVisitType || !state.selectedTemplate) {
    showToast('Select both the visit type and template before recording.', 'warning');
    return;
  }

  // Self scribe requires patient name
  if (state.scribeMode === 'self' && !state.selectedPatientName) {
    showToast('Patient name is required in Self Scribe mode.', 'warning');
    patientNameInput.focus();
    patientNameInput.style.borderColor = 'var(--red)';
    patientNameInput.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
    setTimeout(() => {
      patientNameInput.style.borderColor = '';
      patientNameInput.style.boxShadow = '';
    }, 2000);
    return;
  }

  hideRecordingSetup();
  await startRecording();
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast('Microphone is not supported in this browser.', 'error');
    return;
  }
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = [];

    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', '']
      .find(m => !m || MediaRecorder.isTypeSupported(m));
    state.mediaRecorder = new MediaRecorder(state.stream, mimeType ? { mimeType } : {});

    state.mediaRecorder.addEventListener('dataavailable', e => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    });

    state.mediaRecorder.addEventListener('stop', finalizeRecording);

    state.mediaRecorder.start(100);
    state.isRecording = true;
    state.elapsedBeforePause = 0;

    setRecordBtnState('recording');
    startTimerInternal();
    timerRing.classList.add('recording');
    timerStatus.textContent = 'Recording';
    showToast('Recording started', 'info');
  } catch (err) {
    console.error(err);
    if (err.name === 'NotAllowedError') {
      showToast('Microphone permission denied. Please allow access.', 'error');
    } else {
      showToast('Could not access microphone.', 'error');
    }
  }
}

function pauseRecording() {
  if (!state.mediaRecorder || state.mediaRecorder.state !== 'recording') return;
  state.mediaRecorder.pause();
  state.isRecording = false;
  setRecordBtnState('paused');
  pauseTimerInternal();
  timerRing.classList.remove('recording');
  timerRing.classList.add('paused');
  timerStatus.textContent = 'Paused';
  showToast('Recording paused', 'warning');
}

function resumeRecording() {
  if (!state.mediaRecorder || state.mediaRecorder.state !== 'paused') return;
  state.mediaRecorder.resume();
  state.isRecording = true;
  setRecordBtnState('recording');
  startTimerInternal();
  timerRing.classList.remove('paused');
  timerRing.classList.add('recording');
  timerStatus.textContent = 'Recording';
  showToast('Recording resumed', 'info');
}

function stopRecording() {
  const mr = state.mediaRecorder;
  if (!mr || mr.state === 'inactive') return;
  mr.stop();
  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
  }
  state.isRecording = false;
  setRecordBtnState('idle');
  const finalSecs = getElapsed();
  stopTimerInternal();
  timerStatus.textContent = 'Ready';
  state._lastDuration = finalSecs;
}

function finalizeRecording() {
  const blob = new Blob(state.audioChunks, {
    type: state.mediaRecorder?.mimeType || 'audio/webm'
  });
  const duration = state._lastDuration || 0;
  state._lastDuration = 0;
  addRecordingCard(blob, duration, 'mic', {
    visitType: state.selectedVisitType,
    template: state.selectedTemplate,
    patientName: state.selectedPatientName,
  });
  state.audioChunks = [];
}

function handleRestart() {
  const mr = state.mediaRecorder;
  if (!mr || mr.state === 'inactive') {
    resetRecorderState();
    return;
  }
  showConfirm(
    '⚠️', 'Discard Recording?',
    'This will delete the current recording in progress.',
    () => {
      mr.stop();
      if (state.stream) { state.stream.getTracks().forEach(t => t.stop()); state.stream = null; }
      state.mediaRecorder.removeEventListener('stop', finalizeRecording);
      state.audioChunks = [];
      state.isRecording = false;
      setRecordBtnState('idle');
      stopTimerInternal();
      showToast('Recording discarded', 'warning');
      setTimeout(() => {
        if (state.mediaRecorder) state.mediaRecorder.addEventListener('stop', finalizeRecording);
      }, 100);
    }
  );
}

function resetRecorderState() {
  state.audioChunks = [];
  state.elapsedBeforePause = 0;
  state.recordingStartTime = 0;
  state.isRecording = false;
  stopTimerInternal();
  setRecordBtnState('idle');
}

/* ─── Record Button State ───────────────────────────────────── */
function setRecordBtnState(mode) {
  recordButton.classList.remove('recording', 'paused');
  const icons = {
    idle:      `<circle cx="12" cy="12" r="8"/>`,
    recording: `<rect x="6" y="6" width="12" height="12" rx="2"/>`,
    paused:    `<polygon points="5,3 19,12 5,21"/>`,
  };
  const labels = { idle: 'Start', recording: 'Pause', paused: 'Resume' };

  if (mode === 'recording') recordButton.classList.add('recording');
  if (mode === 'paused')    recordButton.classList.add('paused');

  recordIcon.innerHTML = icons[mode] || icons.idle;
  recordLabel.textContent = labels[mode] || 'Record';
}

/* ─── External Audio Upload ─────────────────────────────────── */
/* ─── Add Recording Card ────────────────────────────────────── */
function addRecordingCard(blob, durationSecs, source, metadata = {}) {
  state.recordingCounter++;
  const id  = `S${state.recordingCounter}`;
  const url = URL.createObjectURL(blob);
  const rec = {
    id, blob, url,
    duration: durationSecs,
    status: 'uploading',
    source,
    visitType: metadata.visitType || '',
    template: metadata.template || '',
    patientName: metadata.patientName || '',
    fileName: metadata.fileName || '',
    uploadAttempt: 0,
  };
  state.recordings.push(rec);

  updateCount();
  emptyState.style.display = 'none';

  const card = buildCard(rec);
  recordingsList.appendChild(card);

  setCardStatus(id, 'uploading', 'Uploading…');
  const progWrap = $(`prog-${id}`);
  if (progWrap) progWrap.style.display = 'block';

  const label = source === 'file' ? `File "${rec.fileName || id}" uploading…` : `${id} captured. Uploading now…`;
  showToast(label, 'info');
  simulateUpload(id, rec);
}



function buildCard(rec) {
  const card = document.createElement('div');
  card.className = 'rec-card';
  card.dataset.recId = rec.id;

  const sourceLabel = rec.source === 'file' ? 'File' : 'Mic';
  const sourceClass = rec.source === 'file' ? 'file' : 'mic';
  const nameLine = rec.patientName
    ? ` • ${rec.patientName}`
    : (rec.fileName ? ` • ${rec.fileName}` : '');

  card.innerHTML = `
    <span class="rec-id">${rec.id}</span>

    <span class="rec-source-badge ${sourceClass}">
      ${sourceLabel}
    </span>

    <div class="rec-audio-wrap">
      <audio controls src="${rec.url}"></audio>

      <div class="rec-meta">
        ${formatTime(rec.duration)}
        ${rec.visitType ? ` • ${rec.visitType}` : ''}
        ${rec.template ? ` • ${rec.template}` : ''}
        ${nameLine}
      </div>

      <div class="upload-progress" id="prog-${rec.id}">
        <div class="upload-progress-bar" id="progbar-${rec.id}"></div>
      </div>
    </div>

    <div class="rec-status status-pending" id="status-${rec.id}">
      <span class="status-dot"></span>
      <span class="status-label">Pending</span>
    </div>

    <div class="rec-actions">

      <!-- Re-upload button -->
      <button
        class="rec-action-btn retry-btn-rec"
        id="retry-${rec.id}"
        title="Re-upload"
        hidden
      >
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round">

          <path d="M21 12a9 9 0 1 1-3-6.7"/>
          <polyline points="21 3 21 9 15 9"/>
        </svg>

        <span>Re-upload</span>
      </button>

    </div>
  `;

  // Retry upload button
  const retryBtn = card.querySelector(`#retry-${rec.id}`);

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      retryUpload(rec.id);
    });
  }

  return card;
}
function simulateUpload(recId, rec) {
  const UPLOAD_MS = 2500 + Math.random() * 1000;
  const FAIL_RATE = 0.05;
  

  rec.uploadAttempt += 1;

  setTimeout(() => {
    const progWrap = $(`prog-${recId}`);
    if (progWrap) progWrap.style.display = 'none';

    if (Math.random() < FAIL_RATE) {
      rec.status = 'failed';
      setCardStatus(recId, 'failed', 'Failed');
      const card = document.querySelector(`[data-rec-id="${recId}"]`);
      if (card) card.classList.add('failed');
      const retryBtn = $(`retry-${recId}`);
      if (retryBtn) retryBtn.hidden = false;
      showToast(`${recId}: upload failed. Re-upload is available.`, 'error');
    } else {
      rec.status = 'uploaded';
      setCardStatus(recId, 'uploaded', 'Uploaded ✓');
      const card = document.querySelector(`[data-rec-id="${recId}"]`);
      if (card) card.classList.add('uploaded');
      const retryBtn = $(`retry-${recId}`);
      if (retryBtn) retryBtn.hidden = true;
      showToast(`${recId} uploaded successfully!`, 'success');
    }
  }, UPLOAD_MS);
}



function setCardStatus(recId, status, label) {

  const statusEl = document.getElementById(`status-${recId}`);
  const retryBtn = document.getElementById(`retry-${recId}`);
  const card = document.querySelector(`[data-rec-id="${recId}"]`);

  if (!statusEl) return;

  statusEl.className = `rec-status status-${status}`;

  statusEl.innerHTML = `
    <span class="status-dot"></span>
    <span class="status-label">${label}</span>
  `;

  // Hide retry by default
  if (retryBtn) {
    retryBtn.hidden = true;
  }

  // Failed upload
  if (status === 'failed') {

    if (card) {
      card.classList.add('failed');
    }

    if (retryBtn) {
      retryBtn.hidden = false;
    }
  }

  // Upload success
  if (status === 'uploaded') {

    if (card) {
      card.classList.remove('failed');
      card.classList.add('uploaded');
    }

    if (retryBtn) {
      retryBtn.hidden = true;
    }
  }
}
function updateCount() {
  const n = state.recordings.length;
  recordingCount.textContent = `${n} recording${n !== 1 ? 's' : ''}`;
}

/* ─── Confirm Dialog ────────────────────────────────────────── */
function showConfirm(icon, title, message, onConfirm) {
  confirmIcon.textContent    = icon;
  confirmTitle.textContent   = title;
  confirmMessage.textContent = message;
  state.confirmCallback      = onConfirm;
  confirmOverlay.classList.add('active');
}

confirmOkBtn.addEventListener('click', () => {
  confirmOverlay.classList.remove('active');
  if (typeof state.confirmCallback === 'function') {
    state.confirmCallback();
    state.confirmCallback = null;
  }
});

confirmCancelBtn.addEventListener('click', () => {
  confirmOverlay.classList.remove('active');
  state.confirmCallback = null;
});

/* ─── Toast ─────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const container = $('toastContainer');
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3700);
}

/* ─── Overlay click closes ──────────────────────────────────── */
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

scribeSelectOverlay.addEventListener('click', (e) => {
  if (e.target === scribeSelectOverlay) {
    scribeSelectOverlay.classList.remove('active');
    dashBg.classList.remove('blurred');
  }
});

/* ─── Escape key ────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (confirmOverlay.classList.contains('active')) {
      confirmOverlay.classList.remove('active');
      state.confirmCallback = null;
    } else if (modalOverlay.classList.contains('active')) {
      closeModal();
    } else if (scribeSelectOverlay.classList.contains('active')) {
      scribeSelectOverlay.classList.remove('active');
      dashBg.classList.remove('blurred');
    }
  }
});
