/* ─── State ─────────────────────────────────────────────────── */
const state = {
  mediaRecorder: null,
  audioChunks: [],
  stream: null,
  timerInterval: null,
  recordingStartTime: 0,
  elapsedBeforePause: 0,
  isRecording: false,
  recordings: [],        // { id, blob, url, duration, status }
  recordingCounter: 0,
  confirmCallback: null,
  selectedVisitType: '',
  selectedTemplate: '',
};

/* ─── DOM Refs ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const openModalBtn     = $('openModalBtn');
const closeModalBtn    = $('closeModal');
const cancelBtn        = $('cancelBtn');
const modalOverlay     = $('modalOverlay');
const dashBg           = document.querySelector('.dashboard-bg');
const timerDisplay     = $('recordingTimer');
const timerStatus      = $('timerStatus');
const timerRing        = $('timerRing');
const ringProgress     = $('ringProgress');
const recordButton     = $('recordButton');
const recordLabel      = $('recordLabel');
const recordIcon       = $('recordIcon');
const stopButton       = $('stopButton');
const restartButton    = $('restartRecording');
const recordingsList   = $('recordingsList');
const recordingCount   = $('recordingCount');
const emptyState       = $('emptyState');
const dictationDate    = $('dictationDate');
const recordSetup      = $('recordSetup');
const recordSetupClose = $('recordSetupClose');
const recordSetupCancel = $('recordSetupCancel');
const recordSetupStart = $('recordSetupStart');
const visitType        = $('visitType');
const templateType     = $('templateType');
const confirmOverlay   = $('confirmOverlay');
const confirmTitle     = $('confirmTitle');
const confirmMessage   = $('confirmMessage');
const confirmIcon      = $('confirmIcon');
const confirmOkBtn     = $('confirmOk');
const confirmCancelBtn = $('confirmCancel');

/* ─── Init ──────────────────────────────────────────────────── */
(function init() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  dictationDate.value = `${y}-${m}-${d}`;
})();

/* ─── Modal Open / Close ────────────────────────────────────── */
openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', () => closeModal());
cancelBtn.addEventListener('click', () => closeModal());

function openModal() {
  modalOverlay.classList.add('active');
  dashBg.classList.add('blurred');
}

function closeModal() {
  // Stop any active recording
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
  }
  stopTimerInternal();
  modalOverlay.classList.remove('active');
  dashBg.classList.remove('blurred');
}

/* ─── Timer ─────────────────────────────────────────────────── */
const RING_CIRCUMFERENCE = 326.7;
const MAX_DISPLAY_SECS   = 300; // 5 min for visual ring fill

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
  // Update ring
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
recordSetupClose.addEventListener('click', hideRecordingSetup);
recordSetupCancel.addEventListener('click', hideRecordingSetup);
recordSetupStart.addEventListener('click', beginRecordingFromSetup);
visitType.addEventListener('change', () => { state.selectedVisitType = visitType.value; });
templateType.addEventListener('change', () => { state.selectedTemplate = templateType.value; });

async function handleRecordClick() {
  const mr = state.mediaRecorder;

  // No recorder or inactive → start fresh
  if (!mr || mr.state === 'inactive') {
    openRecordingSetup();
    return;
  }

  if (mr.state === 'recording') {
    pauseRecording();
    return;
  }

  if (mr.state === 'paused') {
    resumeRecording();
  }
}

function openRecordingSetup() {
  recordSetup.classList.add('active');
  state.selectedVisitType = visitType.value || state.selectedVisitType;
  state.selectedTemplate = templateType.value || state.selectedTemplate;
}

function hideRecordingSetup() {
  recordSetup.classList.remove('active');
}

async function beginRecordingFromSetup() {
  state.selectedVisitType = visitType.value;
  state.selectedTemplate = templateType.value;

  if (!state.selectedVisitType || !state.selectedTemplate) {
    showToast('Select both the visit type and template before recording.', 'warning');
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

    // Pick a supported mime type
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', '']
      .find(m => !m || MediaRecorder.isTypeSupported(m));
    state.mediaRecorder = new MediaRecorder(state.stream, mimeType ? { mimeType } : {});

    state.mediaRecorder.addEventListener('dataavailable', e => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    });

    state.mediaRecorder.addEventListener('stop', finalizeRecording);

    state.mediaRecorder.start(100); // collect chunks every 100ms
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
  // Store duration before resetting
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
      // Prevent finalizeRecording from adding a card
      state.mediaRecorder.removeEventListener('stop', finalizeRecording);
      state.audioChunks = [];
      state.isRecording = false;
      setRecordBtnState('idle');
      stopTimerInternal();
      showToast('Recording discarded', 'warning');
      // Re-attach after brief delay
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
  // SVG icons
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

/* ─── Add Recording Card ────────────────────────────────────── */
function addRecordingCard(blob, durationSecs, source, metadata = {}) {
  state.recordingCounter++;
  const id  = `S${state.recordingCounter}`;
  const url = URL.createObjectURL(blob);
  const rec = {
    id,
    blob,
    url,
    duration: durationSecs,
    status: 'uploading',
    source,
    visitType: metadata.visitType || '',
    template: metadata.template || '',
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

  showToast(`${id} captured. Uploading now…`, 'info');
  simulateUpload(id, rec);
}

function buildCard(rec) {
  const card = document.createElement('div');
  card.className = 'rec-card';
  card.dataset.recId = rec.id;

  card.innerHTML = `
    <span class="rec-id">${rec.id}</span>
    <div class="rec-audio-wrap">
      <audio controls src="${rec.url}"></audio>
      <div class="rec-meta">${formatTime(rec.duration)}${rec.visitType ? ` • ${rec.visitType}` : ''}${rec.template ? ` • ${rec.template}` : ''}</div>
      <div class="upload-progress" id="prog-${rec.id}">
        <div class="upload-progress-bar" id="progbar-${rec.id}"></div>
      </div>
    </div>
    <div class="rec-status status-pending" id="status-${rec.id}">
      <span class="status-dot"></span>
      <span class="status-label">Pending</span>
    </div>
    <div class="rec-actions">
      <button class="rec-action-btn retry-btn-rec" id="retry-${rec.id}" title="Re-upload" hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
      </button>
    </div>
  `;

  card.querySelector(`#retry-${rec.id}`).addEventListener('click', () => retryUpload(rec.id));

  return card;
}

/* ─── Auto-upload and Retry ─────────────────────────────────── */
function retryUpload(recId) {
  const rec = state.recordings.find(r => r.id === recId);
  if (!rec || rec.status === 'uploading' || rec.status === 'uploaded') return;

  setCardStatus(recId, 'uploading', 'Uploading…');
  const card = document.querySelector(`[data-rec-id="${recId}"]`);
  if (card) card.classList.remove('failed');
  const retryBtn = $(`retry-${recId}`);
  if (retryBtn) retryBtn.hidden = true;
  const progWrap = $(`prog-${recId}`);
  if (progWrap) progWrap.style.display = 'block';

  simulateUpload(recId, rec);
}

function simulateUpload(recId, rec) {
  // In production: POST to your API endpoint with FormData
  // const fd = new FormData();
  // fd.append('audio', rec.blob, `${rec.id}.webm`);
  // fd.append('date', dictationDate.value);
  // fd.append('location', $('clinicLocation').value);
  // await fetch('/api/dictations', { method: 'POST', body: fd });

  const UPLOAD_MS = 2500 + Math.random() * 1000;
  const FAIL_RATE = 0.05; // 5% simulated failure rate

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

function setCardStatus(recId, statusClass, label) {
  const statusEl = $(`status-${recId}`);
  if (!statusEl) return;
  statusEl.className = `rec-status status-${statusClass}`;
  statusEl.innerHTML = `<span class="status-dot"></span><span class="status-label">${label}</span>`;
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

/* ─── Close modal on overlay click ─────────────────────────── */
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

recordSetup.addEventListener('click', (e) => {
  if (e.target === recordSetup) hideRecordingSetup();
});

/* ─── Keyboard: Escape closes modals ────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (confirmOverlay.classList.contains('active')) {
      confirmOverlay.classList.remove('active');
      state.confirmCallback = null;
    } else {
      closeModal();
    }
  }
});
