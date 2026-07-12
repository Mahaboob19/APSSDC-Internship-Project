const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3000' : '';

const adminCompanyListEl = document.getElementById('adminCompanyList');
const formTitle = document.getElementById('formTitle');

const companyIdEl = document.getElementById('companyId');
const nameEl = document.getElementById('name');
const roleEl = document.getElementById('role');
const packageEl = document.getElementById('package');
const locationEl = document.getElementById('location');
const driveDateEl = document.getElementById('driveDate');
const descriptionEl = document.getElementById('description');

async function loadCompanies() {
  try {
    const res = await fetch(`${API_BASE}/api/companies`);
    const json = await res.json();

    if (!json.success || json.data.length === 0) {
      adminCompanyListEl.innerHTML = '<p>No companies added yet.</p>';
      return;
    }

    adminCompanyListEl.innerHTML = json.data
      .map(
        (c) => `
        <div class="card">
          <h3>${c.name}</h3>
          <span class="badge">${c.role}</span>
          <span class="badge">${c.package}</span>
          <span class="badge">${c.location}</span>
          <p>${c.description || ''}</p>
          <button class="edit-btn" data-company='${JSON.stringify(c).replace(/'/g, "&#39;")}'>Edit</button>
          <button class="danger delete-btn" data-id="${c.id}">Delete</button>
        </div>
      `
      )
      .join('');
  } catch (err) {
    adminCompanyListEl.innerHTML = '<p>Failed to load companies.</p>';
  }
}

// Event delegation for dynamically rendered Edit/Delete buttons —
// required because helmet's CSP blocks inline onclick handlers.
adminCompanyListEl.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit-btn');
  if (editBtn) {
    editCompany(JSON.parse(editBtn.dataset.company));
    return;
  }

  const deleteBtn = e.target.closest('.delete-btn');
  if (deleteBtn) {
    deleteCompany(deleteBtn.dataset.id);
  }
});

function editCompany(c) {
  companyIdEl.value = c.id;
  nameEl.value = c.name;
  roleEl.value = c.role;
  packageEl.value = c.package;
  locationEl.value = c.location;
  driveDateEl.value = c.driveDate || '';
  descriptionEl.value = c.description || '';
  formTitle.textContent = `Edit Company — ${c.name}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  companyIdEl.value = '';
  nameEl.value = '';
  roleEl.value = '';
  packageEl.value = '';
  locationEl.value = '';
  driveDateEl.value = '';
  descriptionEl.value = '';
  formTitle.textContent = 'Add Company';
}

document.getElementById('resetBtn').addEventListener('click', resetForm);

document.getElementById('saveBtn').addEventListener('click', async () => {
  const payload = {
    name: nameEl.value.trim(),
    role: roleEl.value.trim(),
    package: packageEl.value.trim(),
    location: locationEl.value.trim(),
    driveDate: driveDateEl.value,
    description: descriptionEl.value.trim(),
  };

  if (!payload.name || !payload.role) {
    alert('Company name and role are required.');
    return;
  }

  const id = companyIdEl.value;
  const isEdit = Boolean(id);

  try {
    const res = await fetch(isEdit ? `${API_BASE}/api/companies/${id}` : `${API_BASE}/api/companies`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!json.success) {
      alert(json.error || 'Something went wrong.');
      return;
    }

    resetForm();
    loadCompanies();
  } catch (err) {
    alert('Failed to save company.');
  }
});

async function deleteCompany(id) {
  if (!confirm('Delete this company?')) return;

  try {
    const res = await fetch(`${API_BASE}/api/companies/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (!json.success) {
      alert(json.error || 'Failed to delete.');
      return;
    }

    loadCompanies();
  } catch (err) {
    alert('Failed to delete company.');
  }
}

loadCompanies();
