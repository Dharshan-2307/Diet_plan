/**
 * js/progress.js — Weekly progress page for Nutrify
 */

document.addEventListener('DOMContentLoaded', function () {
  const profile = store.getProfile();
  if (!profile) { window.location.href = 'index.html'; return; }

  // Nav active state
  document.querySelectorAll('.nav__link[data-page="progress"]').forEach(el => el.classList.add('nav--active'));

  // Theme toggles
  setupTheme();

  const plan = store.getPlan();
  const goal = store.getGoalOverride() || utils.computeGoal(profile);

  renderSummary(plan, goal);
  renderDailyBreakdown(plan, goal);
  renderWeightChart();

  document.getElementById('log-weight-btn').addEventListener('click', onLogWeight);
  document.getElementById('export-btn').addEventListener('click', onExport);
});

// ── Theme ─────────────────────────────────────────────────
function setupTheme() {
  ['theme-toggle-top', 'theme-toggle-bottom'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const theme = store.getTheme();
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', function () {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      store.setTheme(next);
      ['theme-toggle-top', 'theme-toggle-bottom'].forEach(oid => {
        const o = document.getElementById(oid);
        if (o) o.textContent = next === 'dark' ? '☀️' : '🌙';
      });
    });
  });
}

// ── Weekly Summary ────────────────────────────────────────
function renderSummary(plan, goal) {
  const grid = document.getElementById('summary-grid');
  if (!plan || !plan.days) {
    grid.innerHTML = '<p style="color:var(--color-text-muted)">No plan data yet.</p>';
    return;
  }

  let totalConsumed = 0;
  let totalPlanned = 0;
  let daysCompleted = 0;
  let daysWithData = 0;

  plan.days.forEach(day => {
    const dayConsumed = day.meals.filter(m => m.completed).reduce((s, m) => s + m.calories, 0);
    const dayPlanned = day.meals.reduce((s, m) => s + m.calories, 0);
    totalConsumed += dayConsumed;
    totalPlanned += dayPlanned;
    if (day.meals.length > 0 && day.meals.every(m => m.completed)) daysCompleted++;
    if (dayConsumed > 0) daysWithData++;
  });

  const weeklyGoal = goal * 7;
  const avgConsumed = daysWithData > 0 ? Math.round(totalConsumed / daysWithData) : 0;

  grid.innerHTML = `
    <div class="summary-stat">
      <span class="summary-stat__value">${totalConsumed.toLocaleString()}</span>
      <span class="summary-stat__label">kcal consumed</span>
    </div>
    <div class="summary-stat">
      <span class="summary-stat__value">${weeklyGoal.toLocaleString()}</span>
      <span class="summary-stat__label">kcal weekly goal</span>
    </div>
    <div class="summary-stat">
      <span class="summary-stat__value">${daysCompleted} / 7</span>
      <span class="summary-stat__label">days completed</span>
    </div>
    <div class="summary-stat">
      <span class="summary-stat__value">${avgConsumed > 0 ? avgConsumed.toLocaleString() : '—'}</span>
      <span class="summary-stat__label">avg kcal / active day</span>
    </div>
  `;
}

// ── Daily Breakdown ───────────────────────────────────────
function renderDailyBreakdown(plan, goal) {
  const container = document.getElementById('daily-breakdown');
  if (!plan || !plan.days) { container.innerHTML = ''; return; }

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  container.innerHTML = plan.days.map((day, i) => {
    const consumed = day.meals.filter(m => m.completed).reduce((s, m) => s + m.calories, 0);
    const ratio = Math.min(utils.progressRatio(consumed, goal), 1);
    const exceeded = consumed > goal;
    const pct = (ratio * 100).toFixed(1);
    const fillClass = exceeded ? 'progress-bar__fill--exceeded' : '';

    return `
      <div class="breakdown-row print-day-row">
        <div class="breakdown-label">
          <span>${dayNames[i]}</span>
          <span class="breakdown-kcal ${exceeded ? 'calories-remaining--over' : ''}">${consumed} / ${goal} kcal</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill ${fillClass}" style="width:${pct}%"></div>
        </div>
        <span class="breakdown-pct">${pct}%</span>
      </div>
    `;
  }).join('');
}

// ── Weight Chart ──────────────────────────────────────────
function renderWeightChart() {
  const entries = store.getWeightLog();
  const container = document.getElementById('weight-chart');
  const w = container.offsetWidth || 320;
  container.innerHTML = utils.formatWeightChartSVG(entries, w, 160);
}

// ── Log Weight ────────────────────────────────────────────
function onLogWeight() {
  const input = document.getElementById('weight-input');
  const err   = document.getElementById('weight-err');
  err.textContent = '';
  const val = parseFloat(input.value);
  if (!val || val < 20 || val > 300 || isNaN(val)) {
    err.textContent = 'Enter a valid weight between 20 and 300 kg.';
    return;
  }
  store.appendWeight({ date: utils.todayKey(), weight: val });
  input.value = '';
  renderWeightChart();
  showToast('Weight logged!');
}

// ── Export ────────────────────────────────────────────────
function onExport() {
  const plan = store.getPlan();
  const profile = store.getProfile();
  const goal = store.getGoalOverride() || (profile ? utils.computeGoal(profile) : null);
  const text = utils.planToText(plan, goal);
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
