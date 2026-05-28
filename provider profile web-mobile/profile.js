/* =====================================================
   ANALYTICA HCS — PROVIDER PROFILE MODULE
   profile.js
===================================================== */

'use strict';

/* =====================================================
   SCREEN ROUTER
===================================================== */

const SCREENS = {
  home:          document.getElementById('screenHome'),
  editProfile:   document.getElementById('screenEditProfile'),
  account:       document.getElementById('screenAccount'),
  notifications: document.getElementById('screenNotifications'),
  support:       document.getElementById('screenSupport'),
  feedback:      document.getElementById('screenFeedback'),
  invite:        document.getElementById('screenInvite'),
  products:      document.getElementById('screenProducts'),
  appinfo:       document.getElementById('screenAppInfo'),
};

const modalBackBtn     = document.getElementById('modalBackBtn');
const modalTitle       = document.getElementById('modalTitle');
const modalSubtitle    = document.getElementById('modalSubtitle');

const SCREEN_META = {
  home:          { title: 'Provider Profile',            subtitle: 'Enterprise healthcare provider management' },
  editProfile:   { title: 'Edit Profile',                subtitle: 'Update your professional information'      },
  account:       { title: 'Account & Security',          subtitle: 'Password, 2FA, login sessions and devices' },
  notifications: { title: 'Notifications & Preferences', subtitle: 'Clinical alerts, messages and system updates' },
  support:       { title: 'Help & Support',              subtitle: 'Support tickets and healthcare assistance'  },
  feedback:      { title: 'Feedback & Suggestions',      subtitle: 'Submit platform improvements and reports'   },
  invite:        { title: 'Invite & Share',              subtitle: 'Invite providers for ANA trial demo access' },
  products:      { title: 'Product Suite',               subtitle: 'Manage ANA subscriptions and marketplace'   },
  appinfo:       { title: 'App Info & Policies',         subtitle: 'Privacy, HIPAA compliance and legal'        },
};

let currentScreen = 'home';

function navigateTo(screenName) {
  // Hide all screens
  Object.values(SCREENS).forEach(s => s && s.classList.add('hidden'));

  const screen = SCREENS[screenName];
  if (!screen) return;
  screen.classList.remove('hidden');

  // Update header
  const meta = SCREEN_META[screenName] || {};
  modalTitle.textContent    = meta.title    || '';
  modalSubtitle.textContent = meta.subtitle || '';

  // Show/hide back button
  if (screenName === 'home') {
    modalBackBtn.classList.add('hidden');
  } else {
    modalBackBtn.classList.remove('hidden');
  }

  currentScreen = screenName;

  // Scroll modal to top
  const modal = document.querySelector('.provider-profile-modal');
  if (modal) modal.scrollTop = 0;
}

// Back button
modalBackBtn.addEventListener('click', () => navigateTo('home'));

// Settings card navigation
document.querySelectorAll('.settings-card').forEach(card => {
  card.addEventListener('click', () => {
    const type = card.dataset.setting;
    if (type === 'logout') {
      showLogoutModal();
    } else {
      navigateTo(type);
    }
  });
});

/* =====================================================
   PROFILE MODAL OPEN / CLOSE
===================================================== */

const profileModalOverlay = document.getElementById('profileModalOverlay');
const closeProfileModal   = document.getElementById('closeProfileModal');

function openProfileModal() {
  profileModalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  navigateTo('home');
}

function closeProfile() {
  profileModalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

closeProfileModal.addEventListener('click', closeProfile);

profileModalOverlay.addEventListener('click', e => {
  if (e.target === profileModalOverlay) closeProfile();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!document.getElementById('logoutModalOverlay').classList.contains('hidden')) {
      closeLogoutModal();
    } else if (!document.getElementById('photoModalOverlay').classList.contains('hidden')) {
      closePhotoModal();
    } else {
      closeProfile();
    }
  }
});

/* =====================================================
   EDIT PROFILE
===================================================== */

const editProfileBtn = document.getElementById('editProfileBtn');

editProfileBtn.addEventListener('click', () => {
  populateEditForm();
  navigateTo('editProfile');
});

function populateEditForm() {
  const nameEl      = document.getElementById('profileName');
  const specialtyEl = document.getElementById('profileSpecialty');
  const emailEl     = document.getElementById('profileEmail');
  const phoneEl     = document.getElementById('profilePhone');
  const clinicEl    = document.getElementById('profileClinic');
  const addrEl      = document.getElementById('profileAddress');

  const fullName = nameEl ? nameEl.textContent.replace('Dr. ', '') : '';
  const parts    = fullName.trim().split(' ');
  const first    = parts.shift() || '';
  const last     = parts.join(' ');

  setVal('firstName',    first);
  setVal('lastName',     last);
  setVal('displayName',  nameEl ? nameEl.textContent : '');
  setVal('specialty',    specialtyEl ? specialtyEl.textContent : '');
  setVal('email',        emailEl ? emailEl.textContent : '');
  setVal('phoneNumber',  phoneEl ? phoneEl.textContent : '');
  setVal('clinicName',   clinicEl ? clinicEl.textContent : '');
  setVal('city',         addrEl ? addrEl.textContent.split(',')[0] || '' : '');
  setVal('state',        addrEl ? addrEl.textContent.split(',')[1]?.trim() || '' : '');
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

// Cancel edit
document.getElementById('cancelEditProfile').addEventListener('click', () => {
  navigateTo('home');
});

// Save profile form
document.getElementById('editProfileForm').addEventListener('submit', e => {
  e.preventDefault();

  if (!validateProfileForm()) {
    showToast('Please fix the highlighted fields', 'error');
    return;
  }

  const saveBtn = document.getElementById('saveProfileBtn');
  const btnText = saveBtn.querySelector('.btn-text');
  const loader  = saveBtn.querySelector('.btn-loader');

  btnText.classList.add('hidden');
  loader.classList.remove('hidden');
  saveBtn.disabled = true;

  setTimeout(() => {
    // Update profile card
    const displayName = document.getElementById('displayName').value.trim();
    const specialty   = document.getElementById('specialty').value.trim();
    const phone       = document.getElementById('phoneNumber').value.trim();

    const nameEl      = document.getElementById('profileName');
    const specEl      = document.getElementById('profileSpecialty');
    const phoneEl     = document.getElementById('profilePhone');

    if (nameEl)  nameEl.textContent  = displayName;
    if (specEl)  specEl.textContent  = specialty;
    if (phoneEl) phoneEl.textContent = phone;

    // Update avatar initials
    updateAvatarInitials(displayName);

    btnText.classList.remove('hidden');
    loader.classList.add('hidden');
    saveBtn.disabled = false;

    navigateTo('home');
    showToast('Profile Updated Successfully', 'success');
  }, 1600);
});

function validateProfileForm() {
  let valid = true;
  const required = ['firstName', 'lastName', 'displayName', 'specialty', 'phoneNumber'];

  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      valid = false;
    } else {
      el.classList.remove('error');
    }
  });

  const phone = document.getElementById('phoneNumber');
  if (phone && phone.value && !/^[0-9+\-\s()]+$/.test(phone.value)) {
    phone.classList.add('error');
    valid = false;
  }

  return valid;
}

// Clear error styling on input
document.querySelectorAll('#editProfileForm input').forEach(input => {
  input.addEventListener('input', () => input.classList.remove('error'));
});

/* =====================================================
   AVATAR INITIALS
===================================================== */

function updateAvatarInitials(fullName) {
  const words    = fullName.replace(/^Dr\.\s*/, '').trim().split(' ');
  const initials = words.length >= 2
    ? words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase()
    : words[0]?.slice(0,2).toUpperCase() || 'JA';

  const avatar = document.getElementById('avatarDisplay');
  if (avatar && !avatar.querySelector('img')) {
    avatar.textContent = initials;
  }

  const photoPreview = document.getElementById('photoPreview');
  if (photoPreview && !photoPreview.querySelector('img')) {
    photoPreview.textContent = initials;
  }
}

/* =====================================================
   PHOTO MODAL
===================================================== */

const photoModalOverlay = document.getElementById('photoModalOverlay');
const changePhotoBtn    = document.getElementById('changePhotoBtn');
const closePhotoModalBtn = document.getElementById('closePhotoModal');
const cancelPhotoBtn    = document.getElementById('cancelPhotoBtn');
const savePhotoBtn      = document.getElementById('savePhotoBtn');
const photoFileInput    = document.getElementById('photoFileInput');
const removePhotoBtn    = document.getElementById('removePhotoBtn');
const photoPreview      = document.getElementById('photoPreview');

let pendingPhotoDataUrl = null;

changePhotoBtn.addEventListener('click', () => {
  photoModalOverlay.classList.remove('hidden');
});

function closePhotoModal() {
  photoModalOverlay.classList.add('hidden');
  pendingPhotoDataUrl = null;
}

closePhotoModalBtn?.addEventListener('click', closePhotoModal);
cancelPhotoBtn?.addEventListener('click', closePhotoModal);
photoModalOverlay.addEventListener('click', e => {
  if (e.target === photoModalOverlay) closePhotoModal();
});

photoFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingPhotoDataUrl = ev.target.result;
    photoPreview.innerHTML = `<img src="${pendingPhotoDataUrl}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener('click', () => {
  pendingPhotoDataUrl = null;
  const nameText = document.getElementById('profileName')?.textContent || 'JA';
  updateAvatarInitials(nameText);
  photoPreview.innerHTML = document.getElementById('avatarDisplay').textContent;
  showToast('Photo removed', 'success');
});

savePhotoBtn.addEventListener('click', () => {
  const avatarDisplay = document.getElementById('avatarDisplay');

  if (pendingPhotoDataUrl) {
    avatarDisplay.innerHTML = `<img src="${pendingPhotoDataUrl}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    showToast('Profile photo updated', 'success');
  }

  closePhotoModal();
});

/* =====================================================
   PASSWORD TOGGLE
===================================================== */

document.querySelectorAll('.toggle-pwd').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input    = document.getElementById(targetId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = isHidden ? '<i class="fa fa-eye-slash"></i>' : '<i class="fa fa-eye"></i>';
  });
});

/* =====================================================
   PASSWORD STRENGTH
===================================================== */

const newPasswordInput = document.getElementById('newPassword');
const pwdStrength      = document.getElementById('pwdStrength');

if (newPasswordInput && pwdStrength) {
  newPasswordInput.addEventListener('input', () => {
    const val    = newPasswordInput.value;
    const score  = getPasswordScore(val);
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--green)', 'var(--primary)'];

    if (!val) {
      pwdStrength.textContent = '';
      return;
    }

    pwdStrength.textContent = `Password strength: ${labels[score]}`;
    pwdStrength.style.color = colors[score];
  });
}

function getPasswordScore(pwd) {
  let score = 0;
  if (pwd.length >= 8)   score++;
  if (pwd.length >= 12)  score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 5);
}

// Change password button
const changePasswordBtn = document.getElementById('changePasswordBtn');
if (changePasswordBtn) {
  changePasswordBtn.addEventListener('click', () => {
    const current = document.getElementById('currentPassword')?.value || '';
    const newPwd  = document.getElementById('newPassword')?.value || '';
    const confirm = document.getElementById('confirmPassword')?.value || '';

    if (!current || !newPwd || !confirm) {
      showToast('Please fill all password fields', 'error');
      return;
    }

    if (newPwd.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    if (!/[A-Z]/.test(newPwd)) {
      showToast('Password must include an uppercase letter', 'error');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPwd)) {
      showToast('Password must include a special character', 'error');
      return;
    }

    if (newPwd !== confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }

    showToast('Password updated successfully', 'success');

    ['currentPassword','newPassword','confirmPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    if (pwdStrength) pwdStrength.textContent = '';
  });
}

/* =====================================================
   REVOKE SESSION BUTTONS
===================================================== */

document.querySelectorAll('.revoke-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.device-row');
    if (row) {
      row.style.opacity = '0';
      row.style.transition = 'opacity .3s ease';
      setTimeout(() => row.remove(), 300);
      showToast('Session revoked successfully', 'success');
    }
  });
});

/* =====================================================
   STAR RATING
===================================================== */

const starRating = document.getElementById('starRating');
let selectedRating = 0;

if (starRating) {
  const stars = starRating.querySelectorAll('i');

  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const val = parseInt(star.dataset.val);
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < val);
      });
    });

    star.addEventListener('mouseout', () => {
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < selectedRating);
      });
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.val);
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < selectedRating);
      });
    });
  });
}

/* =====================================================
   ATTACHMENT UPLOAD
===================================================== */

const attachInput    = document.getElementById('attachInput');
const attachmentList = document.getElementById('attachmentList');
const attachmentDrop = document.getElementById('attachmentDrop');

if (attachInput && attachmentList) {
  attachInput.addEventListener('change', handleFileSelect);

  if (attachmentDrop) {
    attachmentDrop.addEventListener('dragover', e => {
      e.preventDefault();
      attachmentDrop.style.borderColor = 'var(--primary)';
    });

    attachmentDrop.addEventListener('dragleave', () => {
      attachmentDrop.style.borderColor = '';
    });

    attachmentDrop.addEventListener('drop', e => {
      e.preventDefault();
      attachmentDrop.style.borderColor = '';
      const files = Array.from(e.dataTransfer.files);
      addAttachments(files);
    });
  }
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addAttachments(files);
  e.target.value = '';
}

function addAttachments(files) {
  files.forEach(file => {
    const item = document.createElement('div');
    item.className = 'attachment-item';
    item.innerHTML = `
      <i class="fa fa-paperclip"></i>
      <span>${file.name}</span>
      <button type="button" title="Remove"><i class="fa fa-xmark"></i></button>
    `;
    item.querySelector('button').addEventListener('click', () => item.remove());
    attachmentList.appendChild(item);
  });
}

// Submit feedback
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
if (submitFeedbackBtn) {
  submitFeedbackBtn.addEventListener('click', () => {
    const desc = document.getElementById('feedbackDescription')?.value.trim();
    if (!desc) {
      showToast('Please describe your feedback', 'error');
      return;
    }

    const btnText = submitFeedbackBtn.querySelector('.btn-text');
    const loader  = submitFeedbackBtn.querySelector('.btn-loader');
    btnText.classList.add('hidden');
    loader.classList.remove('hidden');
    submitFeedbackBtn.disabled = true;

    setTimeout(() => {
      btnText.classList.remove('hidden');
      loader.classList.add('hidden');
      submitFeedbackBtn.disabled = false;

      document.getElementById('feedbackDescription').value = '';
      if (attachmentList) attachmentList.innerHTML = '';
      selectedRating = 0;
      if (starRating) {
        starRating.querySelectorAll('i').forEach(s => s.classList.remove('active'));
      }

      showToast('Feedback submitted successfully', 'success');
    }, 1400);
  });
}

/* =====================================================
   SUPPORT SCREEN
===================================================== */

const openTicketBtn  = document.getElementById('openTicketBtn');
const ticketChatArea = document.getElementById('ticketChatArea');
const cancelTicketBtn = document.getElementById('cancelTicketBtn');
const submitTicketBtn = document.getElementById('submitTicketBtn');

if (openTicketBtn && ticketChatArea) {
  openTicketBtn.addEventListener('click', () => {
    ticketChatArea.style.display = 'block';
    ticketChatArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (cancelTicketBtn) {
  cancelTicketBtn.addEventListener('click', () => {
    if (ticketChatArea) ticketChatArea.style.display = 'none';
  });
}

if (submitTicketBtn) {
  submitTicketBtn.addEventListener('click', () => {
    const subject = document.getElementById('ticketSubject')?.value.trim();
    const desc    = document.getElementById('ticketDescription')?.value.trim();

    if (!subject || !desc) {
      showToast('Please fill in subject and description', 'error');
      return;
    }

    submitTicketBtn.disabled = true;
    submitTicketBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting…';

    setTimeout(() => {
      submitTicketBtn.disabled = false;
      submitTicketBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Ticket';

      document.getElementById('ticketSubject').value      = '';
      document.getElementById('ticketDescription').value  = '';

      if (ticketChatArea) ticketChatArea.style.display = 'none';

      showToast('Support ticket submitted', 'success');
    }, 1400);
  });
}

/* =====================================================
   INVITE & SHARE
===================================================== */

const sendInviteBtn = document.getElementById('sendInviteBtn');
if (sendInviteBtn) {
  sendInviteBtn.addEventListener('click', () => {
    const name  = document.getElementById('inviteName')?.value.trim();
    const email = document.getElementById('inviteEmail')?.value.trim();

    if (!name || !email) {
      showToast('Please enter name and email', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    sendInviteBtn.disabled = true;
    sendInviteBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
      const listEl   = document.getElementById('inviteStatusList');
      if (listEl) {
        const row = document.createElement('div');
        row.className = 'invite-status-row pending';
        row.innerHTML = `
          <div class="invite-avatar">${initials}</div>
          <div class="invite-info">
            <strong>${name}</strong>
            <span>${email}</span>
          </div>
          <span class="invite-badge pending">Pending</span>
        `;
        row.style.animation = 'screenSlideIn .3s ease';
        listEl.prepend(row);
      }

      sendInviteBtn.disabled = false;
      sendInviteBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Send Invite';
      document.getElementById('inviteName').value  = '';
      document.getElementById('inviteEmail').value = '';

      showToast(`Invite sent to ${email}`, 'success');
    }, 1200);
  });
}

// Copy link
const copyLinkBtn = document.getElementById('copyLinkBtn');
if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', () => {
    const input = document.getElementById('inviteLinkInput');
    if (input) {
      navigator.clipboard?.writeText(input.value).catch(() => {});
      copyLinkBtn.innerHTML = '<i class="fa fa-check"></i> Copied!';
      setTimeout(() => { copyLinkBtn.innerHTML = '<i class="fa fa-copy"></i> Copy'; }, 2000);
      showToast('Link copied to clipboard', 'success');
    }
  });
}

// QR code toggle
const generateQrBtn = document.getElementById('generateQrBtn');
const qrSection     = document.getElementById('qrSection');

if (generateQrBtn && qrSection) {
  generateQrBtn.addEventListener('click', () => {
    const isHidden = qrSection.classList.contains('hidden');
    qrSection.classList.toggle('hidden');
    generateQrBtn.innerHTML = isHidden
      ? '<i class="fa fa-eye-slash"></i> Hide QR'
      : '<i class="fa fa-qrcode"></i> QR Code';
    if (isHidden) showToast('QR code generated', 'success');
  });
}

// WhatsApp share
document.querySelector('.share-action-btn.whatsapp')?.addEventListener('click', () => {
  const link = document.getElementById('inviteLinkInput')?.value || '';
  const msg  = encodeURIComponent(`Join Analytica HCS for a free trial: ${link}`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
});

// Email share
document.querySelector('.share-action-btn.email')?.addEventListener('click', () => {
  const link = document.getElementById('inviteLinkInput')?.value || '';
  window.location.href = `mailto:?subject=Join%20Analytica%20HCS%20Trial&body=${encodeURIComponent(`You've been invited to try Analytica HCS.\n\nAccess link: ${link}`)}`;
});

// SMS share
document.querySelector('.share-action-btn.sms')?.addEventListener('click', () => {
  const link = document.getElementById('inviteLinkInput')?.value || '';
  window.location.href = `sms:?body=${encodeURIComponent(`Try Analytica HCS: ${link}`)}`;
});

/* =====================================================
   PRODUCT CARD ACTIONS
===================================================== */

document.querySelectorAll('.product-card-actions .primary-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const card    = btn.closest('.product-card');
    const product = card?.querySelector('h4')?.textContent || 'Product';
    const label   = btn.textContent.trim();

    if (label.includes('Open')) {
      showToast(`Opening ${product}…`, 'success');
    } else if (label.includes('Trial')) {
      showToast(`Free trial started for ${product}`, 'success');
    }
  });
});

document.querySelectorAll('.upgrade-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card    = btn.closest('.product-card');
    const product = card?.querySelector('h4')?.textContent || 'Product';
    showToast(`Opening upgrade options for ${product}`, 'success');
  });
});

document.querySelectorAll('.billing-action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showToast('Opening billing panel…', 'success');
  });
});

/* =====================================================
   LEGAL LINKS
===================================================== */

document.querySelectorAll('.legal-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const label = link.querySelector('strong')?.textContent || link.textContent.trim();
    showToast(`Opening ${label.trim()}…`, 'success');
  });
});

/* =====================================================
   LOGOUT MODAL
===================================================== */

const logoutModalOverlay = document.getElementById('logoutModalOverlay');
const cancelLogoutBtn    = document.getElementById('cancelLogoutBtn');
const confirmLogoutBtn   = document.getElementById('confirmLogoutBtn');

function showLogoutModal() {
  logoutModalOverlay.classList.remove('hidden');
}

function closeLogoutModal() {
  logoutModalOverlay.classList.add('hidden');
}

cancelLogoutBtn.addEventListener('click', closeLogoutModal);
logoutModalOverlay.addEventListener('click', e => {
  if (e.target === logoutModalOverlay) closeLogoutModal();
});

confirmLogoutBtn.addEventListener('click', () => {
  confirmLogoutBtn.disabled = true;
  confirmLogoutBtn.textContent = 'Logging out…';
  setTimeout(() => {
    closeLogoutModal();
    closeProfile();
    showToast('You have been securely logged out', 'success');
    confirmLogoutBtn.disabled = false;
    confirmLogoutBtn.textContent = 'Logout';
  }, 1200);
});

/* =====================================================
   TOAST NOTIFICATION
===================================================== */

function showToast(message, type = 'success') {
  const toast = document.getElementById('successToast');
  if (!toast) return;

  const icon = toast.querySelector('i');
  const span = toast.querySelector('span');

  span.textContent = message;

  if (type === 'error') {
    icon.className       = 'fa fa-circle-exclamation';
    icon.style.color     = 'var(--red)';
  } else {
    icon.className       = 'fa fa-circle-check';
    icon.style.color     = 'var(--green)';
  }

  toast.classList.remove('hidden');

  // Force reflow for animation reset
  void toast.offsetHeight;

  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 320);
  }, 2600);
}

/* =====================================================
   "LOGOUT ALL DEVICES" BUTTON
===================================================== */

document.querySelector('.danger-outline-btn')?.addEventListener('click', () => {
  showToast('All other sessions have been revoked', 'success');
  document.querySelectorAll('.device-row:not(.active-device)').forEach(row => {
    row.style.opacity = '0';
    row.style.transition = 'opacity .3s ease';
    setTimeout(() => row.remove(), 300);
  });
});

/* =====================================================
   INITIALIZATION
===================================================== */

// Start modal on home screen by default
navigateTo('home');

// Demo: auto-open the modal for standalone preview
// Remove the line below when embedding into the main app
openProfileModal();

/* =====================================================
   THEME TOGGLE (DARK / LIGHT MODE)
===================================================== */

const themeToggleBtn = document.getElementById('themeToggleBtn');
const html = document.documentElement;

// Restore saved theme
(function initTheme() {
  const saved = localStorage.getItem('ahcs-theme') || 'light';
  html.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
})();

function updateThemeIcon(theme) {
  if (!themeToggleBtn) return;
  const icon = themeToggleBtn.querySelector('i');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
}

themeToggleBtn?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme') || 'light';
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ahcs-theme', next);
  updateThemeIcon(next);
  showToast(`Switched to ${next} mode`, 'success');
});

/* =====================================================
   MOBILE: SWIPE-DOWN-TO-CLOSE ON PHOTO / LOGOUT MODALS
===================================================== */

(function addSwipeToClose() {
  const swipeTargets = [
    { overlay: document.getElementById('photoModalOverlay'),  inner: document.querySelector('.photo-modal'),  closeFn: () => closePhotoModal() },
    { overlay: document.getElementById('logoutModalOverlay'), inner: document.querySelector('.logout-modal'), closeFn: () => closeLogoutModal() },
  ];

  swipeTargets.forEach(({ overlay, inner, closeFn }) => {
    if (!overlay || !inner) return;

    let startY = 0;
    let isDragging = false;

    inner.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    inner.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        inner.style.transform = `translateY(${dy}px)`;
        inner.style.transition = 'none';
      }
    }, { passive: true });

    inner.addEventListener('touchend', e => {
      isDragging = false;
      const dy = e.changedTouches[0].clientY - startY;
      inner.style.transition = '';
      inner.style.transform  = '';
      if (dy > 80) closeFn();
    }, { passive: true });
  });
})();

/* =====================================================
   MOBILE: SCROLL LOCK — prevent body scroll when modal open
   (iOS workaround with touch handling)
===================================================== */

(function mobileScrollLock() {
  let scrollY = 0;

  function lockScroll() {
    scrollY = window.scrollY;
    document.body.style.position   = 'fixed';
    document.body.style.top        = `-${scrollY}px`;
    document.body.style.width      = '100%';
    document.body.style.overflowY  = 'scroll';
  }

  function unlockScroll() {
    document.body.style.position  = '';
    document.body.style.top       = '';
    document.body.style.width     = '';
    document.body.style.overflowY = '';
    window.scrollTo(0, scrollY);
  }

  // Re-wire open/close to use lock
  const origOpen  = window.openProfileModal;
  const origClose = window.closeProfile;

  window.openProfileModal = function() {
    lockScroll();
    if (origOpen) origOpen();
  };

  window.closeProfile = function() {
    unlockScroll();
    if (origClose) origClose();
  };
})();

/* =====================================================
   MOBILE: HAPTIC FEEDBACK (optional, supported devices)
===================================================== */

function vibrate(ms = 8) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

document.querySelectorAll('.settings-card').forEach(card => {
  card.addEventListener('touchend', () => vibrate(8));
});

/* =====================================================
   MOBILE: INPUT LABEL SCROLL FIX
   Scroll active input into view above keyboard
===================================================== */

document.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('focus', () => {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });
});
