/**
 * js/tracker.js — Daily tracking page for Nutrify
 */

// ── State ─────────────────────────────────────────────────
let activeDayIndex = 0;
let plan = null;
let profile = null;
let editingMealId = null; // null = adding new meal

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Redirect to onboarding if no profile
  profile = store.getProfile();
  if (!profile) { window.location.href = 'index.html'; return; }

  // Load or init plan
  plan = store.getPlan();
  if (!plan) {
    const mealArrays = utils.defaultMeals(profile);
    plan = {
      days: mealArrays.map((meals, i) => ({ dayIndex: i, meals })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.setPlan(plan);
  }

  // Default to today's day of week (0=Mon … 6=Sun); JS getDay() 0=Sun
  const jsDay = new Date().getDay();
  activeDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // Nav active state
  document.querySelectorAll('.nav__link[data-page="tracker"]').forEach(el => el.classList.add('nav--active'));

  // Dark mode toggles
  setupThemeToggles();

  // Day tabs
  setupDayTabs();

  // Render
  renderAll();
});

// ── Theme ─────────────────────────────────────────────────
function setupThemeToggles() {
  ['theme-toggle-top', 'theme-toggle-bottom'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      store.setTheme(next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
      // sync both toggles
      ['theme-toggle-top', 'theme-toggle-bottom'].forEach(oid => {
        const o = document.getElementById(oid);
        if (o) o.textContent = next === 'dark' ? '☀️' : '🌙';
      });
    });
    // Set initial icon
    const theme = store.getTheme();
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
}

// ── Day Tabs ──────────────────────────────────────────────
function setupDayTabs() {
  document.querySelectorAll('.day-tab').forEach(btn => {
    btn.addEventListener('click', function () {
      activeDayIndex = parseInt(this.dataset.day, 10);
      renderAll();
    });
  });
}

function updateDayTabs() {
  document.querySelectorAll('.day-tab').forEach(btn => {
    const idx = parseInt(btn.dataset.day, 10);
    btn.classList.toggle('day-tab--active', idx === activeDayIndex);
    btn.setAttribute('aria-selected', idx === activeDayIndex ? 'true' : 'false');
  });
}

// ── Render All ────────────────────────────────────────────
function renderAll() {
  updateDayTabs();
  updateStreak();
  updateTip();
  renderDayGrid();
}

// ── Streak ────────────────────────────────────────────────
function updateStreak() {
  const streak = store.getStreak();
  const el = document.getElementById('streak-count');
  if (el) el.textContent = streak.count;
}

function computeAndSaveStreak(completedDate) {
  const streak = store.getStreak();
  if (!streak.lastCompletedDate) {
    store.setStreak({ count: 1, lastCompletedDate: completedDate });
    return;
  }
  const last = new Date(streak.lastCompletedDate);
  const curr = new Date(completedDate);
  const diffDays = Math.round((curr - last) / 86400000);
  if (diffDays === 1) {
    store.setStreak({ count: streak.count + 1, lastCompletedDate: completedDate });
  } else if (diffDays > 1) {
    store.setStreak({ count: 1, lastCompletedDate: completedDate });
  }
  // diffDays === 0 means same day, no change
}

// ── Tip ───────────────────────────────────────────────────
function updateTip() {
  const el = document.getElementById('tip-text');
  if (el) el.textContent = utils.getTip(activeDayIndex);
}

// ── Day Grid ──────────────────────────────────────────────
function renderDayGrid() {
  const grid = document.getElementById('day-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  plan.days.forEach((day, i) => {
    const col = document.createElement('div');
    col.className = 'day-column';
    col.dataset.dayIndex = i;
    if (i !== activeDayIndex) col.classList.add('day-column--hidden'); // hidden on mobile; shown on desktop via CSS

    col.innerHTML = renderDayColumn(day, i, dayNames[i]);
    grid.appendChild(col);
  });

  // Wire up events after render
  wireColumnEvents();
}

function renderDayColumn(day, dayIdx, dayName) {
  const goal = store.getGoalOverride() || utils.computeGoal(profile);
  const consumed = day.meals.filter(m => m.completed).reduce((s, m) => s + m.calories, 0);
  const remaining = goal - consumed;
  const ratio = Math.min(utils.progressRatio(consumed, goal), 1);
  const exceeded = consumed > goal;
  const allDone = day.meals.length > 0 && day.meals.every(m => m.completed);
  const water = store.getWater(utils.todayKey());

  const progressClass = exceeded
    ? 'progress-bar__fill--exceeded'
    : allDone ? 'progress-bar__fill--complete' : '';

  const mealsHTML = day.meals.map(meal => renderMealItem(meal, dayIdx)).join('');

  const waterDrops = Array.from({ length: 8 }, (_, wi) =>
    `<span class="water-drop ${wi < water ? 'water-drop--filled' : ''}" data-drop="${wi}" data-day="${dayIdx}" title="Glass ${wi + 1}">💧</span>`
  ).join('');

  return `
    <div class="day-header">
      <h2 class="day-name">${dayName}</h2>
      ${allDone ? '<span class="badge badge--complete print-only">✓ Complete</span>' : ''}
    </div>

    <div class="goal-info">
      <span>Goal: <strong>${goal} kcal</strong></span>
      <span class="calories-remaining ${remaining < 0 ? 'calories-remaining--over' : ''}">
        ${remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over`}
      </span>
    </div>

    <div class="progress-bar no-print">
      <div class="progress-bar__fill ${progressClass}" style="width:${(ratio * 100).toFixed(1)}%"></div>
    </div>
    <div class="progress-label no-print">${consumed} / ${goal} kcal</div>

    ${exceeded ? '<div class="warning-msg no-print">⚠️ Over budget!</div>' : ''}
    ${allDone ? '<div class="complete-badge no-print">✅ Day complete!</div>' : ''}

    <div class="water-tracker no-print" data-day="${dayIdx}">${waterDrops}</div>

    <ul class="meal-list" id="meal-list-${dayIdx}">
      ${mealsHTML}
    </ul>

    <button class="btn btn--ghost add-meal-btn no-print" data-day="${dayIdx}">+ Add Meal</button>

    <div class="meal-form-wrap no-print" id="meal-form-${dayIdx}" style="display:none;">
      ${renderMealForm(dayIdx)}
    </div>

    <button class="btn btn--ghost download-pdf-btn no-print" data-day="${dayIdx}" style="margin-top:var(--space-md);width:100%;">⬇️ Download Plan PDF</button>
  `;
}

function renderMealItem(meal, dayIdx) {
  return `
    <li class="meal-item ${meal.completed ? 'meal-item--completed' : ''}" data-meal-id="${meal.id}" data-day="${dayIdx}">
      <label class="meal-check-label">
        <input type="checkbox" class="meal-checkbox" data-meal-id="${meal.id}" data-day="${dayIdx}" ${meal.completed ? 'checked' : ''} />
      </label>
      <div class="meal-info">
        <span class="meal-name">${meal.name}</span>
        <span class="badge">${meal.type}</span>
      </div>
      <span class="meal-calories">${meal.calories} kcal</span>
      <div class="meal-actions no-print">
        <button class="btn btn--ghost edit-meal-btn" data-meal-id="${meal.id}" data-day="${dayIdx}" aria-label="Edit meal">✏️</button>
        <button class="btn btn--ghost delete-meal-btn" data-meal-id="${meal.id}" data-day="${dayIdx}" aria-label="Delete meal">✕</button>
      </div>
      <div class="meal-note-wrap">
        <details>
          <summary class="no-print">Note</summary>
          <textarea class="meal-note no-print" data-meal-id="${meal.id}" data-day="${dayIdx}" placeholder="Add a note…">${meal.note || ''}</textarea>
          <div class="print-only meal-note-print">${meal.note ? `Note: ${meal.note}` : ''}</div>
        </details>
      </div>
    </li>
  `;
}

function renderMealForm(dayIdx, meal) {
  const name = meal ? meal.name : '';
  const type = meal ? meal.type : 'Breakfast';
  const cal  = meal ? meal.calories : '';
  const types = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Other'];
  const opts = types.map(t => `<option value="${t}" ${type === t ? 'selected' : ''}>${t}</option>`).join('');
  return `
    <div class="form-group">
      <label>Meal name</label>
      <input type="text" class="meal-form-name" placeholder="e.g. Idli with sambar" value="${name}" />
      <span class="form-error meal-form-err-name"></span>
    </div>
    <div class="form-group">
      <label>Type</label>
      <select class="meal-form-type">${opts}<option value="custom">Custom…</option></select>
    </div>
    <div class="form-group">
      <label>Calories <button type="button" class="btn btn--ghost btn--sm estimator-toggle-btn" title="Search food to estimate calories">🔍 Estimate</button></label>
      <input type="number" class="meal-form-cal" min="1" max="9999" placeholder="e.g. 350" value="${cal}" />
      <span class="form-error meal-form-err-cal"></span>
    </div>
    <div class="estimator-panel" style="display:none;">
      <input type="text" class="estimator-search" placeholder="Search food (e.g. chicken curry, banana…)" autocomplete="off" />
      <ul class="estimator-results"></ul>
    </div>
    <div class="form-row">
      <button class="btn btn--primary meal-form-save" data-day="${dayIdx}">Save</button>
      <button class="btn btn--ghost meal-form-cancel" data-day="${dayIdx}">Cancel</button>
    </div>
  `;
}

// ── Wire Events ───────────────────────────────────────────
function wireColumnEvents() {
  // Checkboxes
  document.querySelectorAll('.meal-checkbox').forEach(cb => {
    cb.addEventListener('change', onMealToggle);
  });

  // Edit buttons
  document.querySelectorAll('.edit-meal-btn').forEach(btn => {
    btn.addEventListener('click', onEditMeal);
  });

  // Delete buttons
  document.querySelectorAll('.delete-meal-btn').forEach(btn => {
    btn.addEventListener('click', onDeleteMeal);
  });

  // Add meal buttons
  document.querySelectorAll('.add-meal-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const dayIdx = parseInt(this.dataset.day, 10);
      editingMealId = null;
      showMealForm(dayIdx);
    });
  });

  // Meal form save/cancel (delegated)
  document.querySelectorAll('.meal-form-save').forEach(btn => {
    btn.addEventListener('click', onMealFormSave);
  });
  document.querySelectorAll('.meal-form-cancel').forEach(btn => {
    btn.addEventListener('click', function () {
      hideMealForm(parseInt(this.dataset.day, 10));
    });
  });

  // Water drops
  document.querySelectorAll('.water-drop').forEach(drop => {
    drop.addEventListener('click', onWaterDrop);
  });

  // Meal notes (auto-save on input)
  document.querySelectorAll('.meal-note').forEach(ta => {
    ta.addEventListener('input', onMealNoteInput);
  });

  // Download PDF buttons
  document.querySelectorAll('.download-pdf-btn').forEach(btn => {
    btn.addEventListener('click', onDownloadPDF);
  });

  // Calorie estimator
  document.querySelectorAll('.estimator-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const panel = this.closest('.form-group').nextElementSibling;
      if (!panel || !panel.classList.contains('estimator-panel')) return;
      const isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : '';
      if (!isOpen) panel.querySelector('.estimator-search').focus();
    });
  });

  document.querySelectorAll('.estimator-search').forEach(input => {
    input.addEventListener('input', function () {
      const results = this.nextElementSibling;
      const query = this.value.trim();
      if (!query) { results.innerHTML = ''; return; }
      const matches = searchFood(query);
      if (!matches.length) {
        results.innerHTML = '<li class="estimator-no-result">No matches found</li>';
        return;
      }
      results.innerHTML = matches.map(f =>
        `<li class="estimator-result-item" data-calories="${f.calories}" data-name="${f.name.replace(/"/g, '&quot;')}">${f.name} <span class="estimator-kcal">${f.calories} kcal</span></li>`
      ).join('');
    });
  });

  document.querySelectorAll('.estimator-results').forEach(ul => {
    ul.addEventListener('click', function (e) {
      const item = e.target.closest('.estimator-result-item');
      if (!item) return;
      const wrap = this.closest('.meal-form-wrap');
      if (!wrap) return;
      const calInput  = wrap.querySelector('.meal-form-cal');
      const nameInput = wrap.querySelector('.meal-form-name');
      if (calInput) calInput.value = item.dataset.calories;
      if (nameInput && !nameInput.value.trim()) nameInput.value = item.dataset.name;
      // Close panel
      const panel = this.closest('.estimator-panel');
      if (panel) panel.style.display = 'none';
    });
  });
}

// ── Meal Toggle ───────────────────────────────────────────
function onMealToggle(e) {
  const mealId = e.target.dataset.mealId;
  const dayIdx = parseInt(e.target.dataset.day, 10);
  const day = plan.days[dayIdx];
  const meal = day.meals.find(m => m.id === mealId);
  if (!meal) return;

  meal.completed = e.target.checked;
  store.setPlan(plan);

  // Check day completion
  const allDone = day.meals.length > 0 && day.meals.every(m => m.completed);
  if (allDone) {
    computeAndSaveStreak(utils.todayKey());
    showToast('🎉 Day complete! Great work!');
  }

  renderAll();
}

// ── Edit Meal ─────────────────────────────────────────────
function onEditMeal(e) {
  const mealId = e.currentTarget.dataset.mealId;
  const dayIdx = parseInt(e.currentTarget.dataset.day, 10);
  editingMealId = mealId;
  showMealForm(dayIdx, mealId);
}

// ── Delete Meal ───────────────────────────────────────────
function onDeleteMeal(e) {
  const mealId = e.currentTarget.dataset.mealId;
  const dayIdx = parseInt(e.currentTarget.dataset.day, 10);
  plan.days[dayIdx].meals = plan.days[dayIdx].meals.filter(m => m.id !== mealId);
  store.setPlan(plan);
  renderAll();
}

// ── Meal Form ─────────────────────────────────────────────
function showMealForm(dayIdx, mealId) {
  const wrap = document.getElementById(`meal-form-${dayIdx}`);
  if (!wrap) return;
  const meal = mealId ? plan.days[dayIdx].meals.find(m => m.id === mealId) : null;
  wrap.innerHTML = renderMealForm(dayIdx, meal);
  wrap.style.display = '';

  // Re-wire save/cancel inside the form
  wrap.querySelector('.meal-form-save').addEventListener('click', onMealFormSave);
  wrap.querySelector('.meal-form-cancel').addEventListener('click', function () {
    hideMealForm(dayIdx);
  });
}

function hideMealForm(dayIdx) {
  const wrap = document.getElementById(`meal-form-${dayIdx}`);
  if (wrap) { wrap.style.display = 'none'; wrap.innerHTML = ''; }
  editingMealId = null;
}

function onMealFormSave(e) {
  const dayIdx = parseInt(e.currentTarget.dataset.day, 10);
  const wrap = document.getElementById(`meal-form-${dayIdx}`);
  if (!wrap) return;

  const nameEl = wrap.querySelector('.meal-form-name');
  const typeEl = wrap.querySelector('.meal-form-type');
  const calEl  = wrap.querySelector('.meal-form-cal');
  const errName = wrap.querySelector('.meal-form-err-name');
  const errCal  = wrap.querySelector('.meal-form-err-cal');

  errName.textContent = '';
  errCal.textContent  = '';

  const name = nameEl.value.trim();
  const type = typeEl.value;
  const cal  = parseFloat(calEl.value);

  let valid = true;
  if (!name) { errName.textContent = 'Meal name is required.'; valid = false; }
  if (!cal || cal <= 0 || cal > 9999 || isNaN(cal)) {
    errCal.textContent = 'Enter calories between 1 and 9999.'; valid = false;
  }
  if (!valid) return;

  if (editingMealId) {
    const meal = plan.days[dayIdx].meals.find(m => m.id === editingMealId);
    if (meal) { meal.name = name; meal.type = type; meal.calories = Math.round(cal); }
  } else {
    plan.days[dayIdx].meals.push({
      id: Date.now().toString(),
      name, type,
      calories: Math.round(cal),
      completed: false,
      note: '',
    });
  }

  store.setPlan(plan);
  hideMealForm(dayIdx);
  renderAll();
}

// ── Water Drops ───────────────────────────────────────────
function onWaterDrop(e) {
  const dropIdx = parseInt(e.currentTarget.dataset.drop, 10);
  const count = dropIdx + 1;
  store.setWater(utils.todayKey(), count);
  // Re-render water drops only
  document.querySelectorAll(`.water-drop[data-day="${activeDayIndex}"]`).forEach((el, wi) => {
    el.classList.toggle('water-drop--filled', wi < count);
  });
}

// ── Meal Notes ────────────────────────────────────────────
function onMealNoteInput(e) {
  const mealId = e.target.dataset.mealId;
  const dayIdx = parseInt(e.target.dataset.day, 10);
  const meal = plan.days[dayIdx].meals.find(m => m.id === mealId);
  if (meal) {
    meal.note = e.target.value;
    store.setPlan(plan);
  }
}

// ── Download PDF ──────────────────────────────────────────
function onDownloadPDF() {
  const goalOverride = store.getGoalOverride();
  const text = utils.planToText(plan, goalOverride);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  window.print();
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

