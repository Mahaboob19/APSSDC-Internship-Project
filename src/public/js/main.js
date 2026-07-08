const companyListEl = document.getElementById('companyList');
const applicationListEl = document.getElementById('applicationList');
const trackForm = document.getElementById('trackForm');

const applyBox = document.getElementById('applyBox');
const applyCompanyName = document.getElementById('applyCompanyName');
const applyCompanyId = document.getElementById('applyCompanyId');
const applyMessage = document.getElementById('applyMessage');

// --- Load and render companies ---
async function loadCompanies() {
  try {
    const res = await fetch('/api/companies');
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
  applyBox.style.display = 'block';
  applyBox.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('cancelApplyBtn').addEventListener('click', () => {
  applyBox.style.display = 'none';
});

document.getElementById('submitApplyBtn').addEventListener('click', async () => {
  const companyId = applyCompanyId.value;
  const studentName = document.getElementById('applyName').value.trim();
  const studentEmail = document.getElementById('applyEmail').value.trim();

  if (!studentName || !studentEmail) {
    applyMessage.textContent = 'Please fill in your name and email.';
    return;
  }

  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, studentName, studentEmail }),
    });
    const json = await res.json();

    if (!json.success) {
      applyMessage.textContent = json.error || 'Something went wrong.';
      return;
    }

    applyMessage.textContent = 'Application submitted successfully!';
  } catch (err) {
    applyMessage.textContent = 'Failed to submit application.';
  }
});

// --- Track applications ---
trackForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('trackEmail').value.trim();

  try {
    const res = await fetch(`/api/applications?email=${encodeURIComponent(email)}`);
    const json = await res.json();

    if (!json.success || json.data.length === 0) {
      applicationListEl.innerHTML = '<p>No applications found for this email.</p>';
      return;
    }

    applicationListEl.innerHTML = json.data
      .map(
        (a) => `
        <div class="card">
          <h3>${a.companyName}</h3>
          <p>Status: <strong class="status-${a.status.replace(/\s/g, '')}">${a.status}</strong></p>
          <p>Applied at: ${new Date(a.appliedAt).toLocaleString()}</p>
        </div>
      `
      )
      .join('');
  } catch (err) {
    applicationListEl.innerHTML = '<p>Failed to load applications.</p>';
  }
});

loadCompanies();
