const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3000' : 'http://54.174.104.242:3000';

const companyListEl = document.getElementById('companyList');
const applicationListEl = document.getElementById('applicationList');
const trackForm = document.getElementById('trackForm');

const applyModal = document.getElementById('applyModal');
const applyBox = document.getElementById('applyBox');
const applyCompanyName = document.getElementById('applyCompanyName');
const applyCompanyId = document.getElementById('applyCompanyId');
const applyMessage = document.getElementById('applyMessage');

const trackModal = document.getElementById('trackModal');
const openTrackBtn = document.getElementById('openTrackBtn');
const closeTrackBtn = document.getElementById('closeTrackBtn');

// --- Load and render companies ---
async function loadCompanies() {
  try {
    const res = await fetch(`${API_BASE}/api/companies`);
    const json = await res.json();

    if (!json.success || json.data.length === 0) {
      companyListEl.innerHTML = '<p>No placement drives available right now.</p>';
      return;
    }

    companyListEl.innerHTML = json.data
      .map(
        (c) => `
        <div class="card">
          <h3>${c.name}</h3>
          <span class="badge">${c.role}</span>
          <span class="badge">${c.package}</span>
          <span class="badge">${c.location}</span>
          <p>${c.description || ''}</p>
          <p><strong>Drive date:</strong> ${c.driveDate || 'TBA'}</p>
          <button class="apply-btn" data-id="${c.id}" data-name="${c.name.replace(/"/g, '&quot;')}">Apply</button>
        </div>
      `
      )
      .join('');
  } catch (err) {
    companyListEl.innerHTML = '<p>Failed to load companies. Please try again later.</p>';
  }
}

// --- Apply flow ---
// Buttons are rendered dynamically (see loadCompanies), so we use event
// delegation on the container instead of inline onclick attributes.
// This is required because helmet's Content Security Policy blocks
// inline JS handlers (a real security protection, not something to
// bypass) — delegation is the correct, CSP-safe pattern for handling
// clicks on elements that don't exist yet at page-load time.
companyListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.apply-btn');
  if (!btn) return;
  showApplyBox(btn.dataset.id, btn.dataset.name);
});

function showApplyBox(id, name) {
  applyCompanyId.value = id;
  applyCompanyName.textContent = `Apply to ${name}`;
  applyMessage.textContent = '';
  applyModal.style.display = 'flex';
  setTimeout(() => {
    applyModal.classList.add('active');
  }, 10);
}

function hideApplyBox() {
  applyModal.classList.remove('active');
  setTimeout(() => {
    applyModal.style.display = 'none';
    document.getElementById('applyName').value = '';
    document.getElementById('applyEmail').value = '';
    applyMessage.textContent = '';
  }, 300);
}

document.getElementById('cancelApplyBtn').addEventListener('click', hideApplyBox);
applyModal.addEventListener('click', (e) => {
  if (e.target === applyModal) {
    hideApplyBox();
  }
});

document.getElementById('submitApplyBtn').addEventListener('click', async () => {
  const companyId = applyCompanyId.value;
  const studentName = document.getElementById('applyName').value.trim();
  const studentEmail = document.getElementById('applyEmail').value.trim();

  if (!studentName || !studentEmail) {
    applyMessage.style.color = '#b91c1c';
    applyMessage.textContent = 'Please fill in your name and email.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, studentName, studentEmail }),
    });
    const json = await res.json();

    if (!json.success) {
      applyMessage.style.color = '#b91c1c';
      applyMessage.textContent = json.error || 'Something went wrong.';
      return;
    }

    applyMessage.style.color = '#15803d';
    applyMessage.textContent = 'Application submitted successfully!';
    setTimeout(() => {
      hideApplyBox();
    }, 1500);
  } catch (err) {
    applyMessage.style.color = '#b91c1c';
    applyMessage.textContent = 'Failed to submit application.';
  }
});

// --- Track applications ---
function showTrackModal() {
  trackModal.style.display = 'flex';
  setTimeout(() => {
    trackModal.classList.add('active');
  }, 10);
}

function hideTrackModal() {
  trackModal.classList.remove('active');
  setTimeout(() => {
    trackModal.style.display = 'none';
    document.getElementById('trackEmail').value = '';
    applicationListEl.innerHTML = '';
  }, 300);
}

openTrackBtn.addEventListener('click', showTrackModal);
closeTrackBtn.addEventListener('click', hideTrackModal);

trackModal.addEventListener('click', (e) => {
  if (e.target === trackModal) {
    hideTrackModal();
  }
});

trackForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('trackEmail').value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/applications?email=${encodeURIComponent(email)}`);
    const json = await res.json();

    if (!json.success || json.data.length === 0) {
      applicationListEl.innerHTML = '<p style="text-align: center; margin-top: 15px;">No applications found for this email.</p>';
      return;
    }

    applicationListEl.innerHTML = json.data
      .map(
        (a) => `
        <div class="card" style="margin-top: 12px; margin-bottom: 12px; padding: 12px;">
          <h4 style="margin: 0 0 6px 0; color: #1e3a5f;">${a.companyName}</h4>
          <p style="margin: 4px 0; font-size: 0.9rem;">Status: <strong class="status-${a.status.replace(/\s/g, '')}">${a.status}</strong></p>
          <p style="margin: 4px 0; font-size: 0.8rem; color: #64748b;">Applied: ${new Date(a.appliedAt).toLocaleString()}</p>
        </div>
      `
      )
      .join('');
  } catch (err) {
    applicationListEl.innerHTML = '<p style="text-align: center; color: #b91c1c; margin-top: 15px;">Failed to load applications.</p>';
  }
});

loadCompanies();
