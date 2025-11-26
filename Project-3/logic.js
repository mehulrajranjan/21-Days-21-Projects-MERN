// logic.js — insert new project cards into the "Ongoing Projects" section (#project)
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveProjectBtn');
    if (!saveBtn) {
      console.error('saveProjectBtn not found.');
      return;
    }
    if (saveBtn.tagName === 'BUTTON' && (!saveBtn.getAttribute('type') || saveBtn.getAttribute('type') === 'submit')) {
      saveBtn.setAttribute('type', 'button');
    }
    saveBtn.addEventListener('click', handleSave);

    function handleSave(e) {
      e.preventDefault();

      const nameEl = document.getElementById('projectName');
      const teamEl = document.getElementById('projectTeam');
      const progressEl = document.getElementById('projectProgress');
      const dueEl = document.getElementById('projectDue');
      const descEl = document.getElementById('projectDescription');

      if (!nameEl || !teamEl || !progressEl || !dueEl) {
        alert('Form not ready. Please refresh.');
        return;
      }

      const name = String(nameEl.value || '').trim();
      const team = String(teamEl.value || '').trim();
      let progressRaw = String(progressEl.value || '').trim().replace('%','');
      let progress = Number(progressRaw);
      if (Number.isNaN(progress)) progress = null;
      const due = String(dueEl.value || '').trim();
      const desc = String(descEl.value || '').trim();

      if (!name || !team || progress === null || !due) {
        alert('Please fill all required fields!');
        return;
      }

      progress = Math.max(0, Math.min(100, Math.round(progress)));

      const projectHTML = `
        <div class="col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h6 class="fw-bold">${escapeHtml(name)}</h6>
              <p class="text-muted mb-2">Team: <strong>${escapeHtml(team)}</strong></p>
              <div class="progress mb-2" style="height: 10px">
                <div class="progress-bar ${progress >= 80 ? 'bg-success' : (progress >= 50 ? 'bg-warning' : 'bg-primary')}" role="progressbar" style="width: ${progress}%;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <small class="text-muted">${progress}% complete</small>
              <p class="mt-2 small text-muted">${escapeHtml(desc)}</p>
            </div>
            <div class="card-footer bg-white border-0 d-flex justify-content-between">
              <span><i class="fa-regular fa-calendar"></i> Due: ${escapeHtml(due)}</span>
              <a href="#" class="btn btn-sm btn-outline-primary">View</a>
            </div>
          </div>
        </div>
      `;

      // Prefer the existing "Ongoing Projects" section with id="project"
      let container = document.querySelector('#project .row.g-4');

      // fallback: older/plural id
      if (!container) container = document.querySelector('#projects .row.g-4');

      // if still missing, create the #project section (append to main-content or body)
      if (!container) {
        const main = document.querySelector('.main-content') || document.body;
        const sec = document.createElement('section');
        sec.id = 'project';
        sec.className = 'mb-5';
        sec.innerHTML = `
          <div class="card p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5>Ongoing Projects</h5>
              <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addProjectModal">
                <i class="fa-solid fa-plus me-1"></i> Add New
              </button>
            </div>
            <div class="row g-4"></div>
          </div>
        `;
        main.appendChild(sec);
        container = sec.querySelector('.row.g-4');
      }

      container.insertAdjacentHTML('beforeend', projectHTML);

      // hide modal safely
      const modalEl = document.getElementById('addProjectModal');
      if (modalEl) {
        try {
          const modalInst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modalInst.hide();
        } catch (err) {
          console.warn('Could not hide modal:', err);
        }
      }

      // reset form
      const form = document.getElementById('addProjectForm');
      if (form) {
        form.reset();
        form.classList.remove('was-validated');
      }

      console.info('Project saved to Ongoing Projects:', { name, team, progress, due });
    }

    function escapeHtml(str = '') {
      return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#039;');
    }
  });
})();
