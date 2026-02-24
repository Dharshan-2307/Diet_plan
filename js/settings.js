/**
 * js/settings.js — Profile & settings page for Nutrify
 */

document.addEventListener('DOMContentLoaded', function () {
  // Nav active state
  document.querySelectorAll('.nav__link[data-page="settings"]').forEach(el => el.classList.add('nav--active'));

  setupTheme();

  const profile = store.getProfile();
  const root = document.getElementById('settings-root');

  if (!profile) {
    root.innerHTML = `
      <div class="card" style="text-align:center;padding:var(--space-xl);">
        <p style="font-size:var(--font-size-lg);margin-bottom:var(--space-md);">No profile found.</p>
        <a href="index.html" class="btn btn--primary">Set up your profile</a>
      </div>
    `;
    return;
  }

  renderSettingsForm(profile);
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

// ── Render Form ───────────────────────────────────────────
function renderSettingsForm(profile) {
  const goalOverride = store.getGoalOverride();
  const suggested = utils.computeGoal(profile);

  const root = document.getElementById('settings-root');
  root.innerHTML = `
    <div class="card" style="margin-bottom:var(--space-md);">
      <h2 style="margin:0 0 var(--space-md);">Profile</h2>

      <div class="form-group">
        <label>Goal</label>
        <div class="radio-group" id="goal-group">
          ${radioCard('goal', 'lose_weight',  '🔥 Lose Weight',   profile.goal)}
          ${radioCard('goal', 'maintain',     '⚖️ Maintain',      profile.goal)}
          ${radioCard('goal', 'gain_muscle',  '💪 Gain Muscle',   profile.goal)}
        </div>
      </div>

      <div class="form-group">
        <label>Activity Level</label>
        <select id="activity-level">
          ${activityOpts(profile.activityLevel)}
        </select>
      </div>

      <div class="form-group">
        <label>Sex</label>
        <div class="radio-group">
          ${radioCard('sex', 'male',   '♂ Male',   profile.sex)}
          ${radioCard('sex', 'female', '♀ Female', profile.sex)}
        </div>
      </div>

      <div class="form-group">
        <label>Age</label>
        <input type="number" id="age" min="10" max="100" value="${profile.age}" />
        <span class="form-error" id="err-age"></span>
      </div>

      <div class="form-group">
        <label>Weight (kg)</label>
        <input type="number" id="weight" min="20" max="300" step="0.1" value="${profile.weightKg}" />
        <span class="form-error" id="err-weight"></span>
      </div>

      <div class="form-group">
        <label>Height (cm)</label>
        <input type="number" id="height" min="100" max="250" step="0.1" value="${profile.heightCm}" />
        <span class="form-error" id="err-height"></span>
      </div>

      <div class="form-group">
        <label>Dietary Preference</label>
        <div class="radio-group">
          ${radioCard('diet', 'none',        '🍗 No restriction', profile.dietaryPreference)}
          ${radioCard('diet', 'vegetarian',  '🥦 Vegetarian',     profile.dietaryPreference)}
          ${radioCard('diet', 'vegan',       '🌱 Vegan',          profile.dietaryPreference)}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--space-md);">
      <h2 style="margin:0 0 var(--space-md);">Calorie Goal</h2>
      <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--space-sm);">
        Suggested: <strong id="suggested-goal">${suggested} kcal</strong>
      </p>
      <div class="form-group">
        <label>Override daily goal (kcal) — leave blank to use suggested</label>
        <input type="number" id="goal-override" min="500" max="9999" placeholder="${suggested}" value="${goalOverride || ''}" />
        <span class="form-error" id="err-goal"></span>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--space-md);">
      <h2 style="margin:0 0 var(--space-md);">Appearance</h2>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span>Dark Mode</span>
        <button class="btn btn--ghost" id="dark-mode-toggle">
          ${store.getTheme() === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </div>

    <button class="btn btn--primary" id="save-btn" style="width:100%;margin-bottom:var(--space-sm);">Save Changes</button>
    <button class="btn btn--danger" id="reset-btn" style="width:100%;">Re-run Onboarding (Reset All Data)</button>
  `;

  document.getElementById('save-btn').addEventListener('click', onSave);
  document.getElementById('reset-btn').addEventListener('click', onReset);
  document.getElementById('dark-mode-toggle').addEventListener('click', function () {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    store.setTheme(next);
    this.textContent = next === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    ['theme-toggle-top', 'theme-toggle-bottom'].forEach(id => {
      const o = document.getElementById(id);
      if (o) o.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  });
}

function radioCard(name, value, label, current) {
  return `<label class="radio-card ${current === value ? 'radio-card--active' : ''}">
    <input type="radio" name="${name}" value="${value}" ${current === value ? 'checked' : ''} style="display:none;" />
    ${label}
  </label>`;
}

function activityOpts(current) {
  const opts = [
    ['sedentary',         'Sedentary (little or no exercise)'],
    ['lightly_active',    'Lightly Active (1–3 days/week)'],
    ['moderately_active', 'Moderately Active (3–5 days/week)'],
    ['very_active',       'Very Active (6–7 days/week)'],
  ];
  return opts.map(([v, l]) => `<option value="${v}" ${current === v ? 'selected' : ''}>${l}</option>`).join('');
}

// ── Save ──────────────────────────────────────────────────
function onSave() {
  let valid = true;

  const goal     = document.querySelector('input[name="goal"]:checked')?.value;
  const sex      = document.querySelector('input[name="sex"]:checked')?.value;
  const diet     = document.querySelector('input[name="diet"]:checked')?.value;
  const activity = document.getElementById('activity-level').value;
  const age      = parseFloat(document.getElementById('age').value);
  const weight   = parseFloat(document.getElementById('weight').value);
  const height   = parseFloat(document.getElementById('height').value);
  const override = document.getElementById('goal-override').value.trim();

  document.getElementById('err-age').textContent    = '';
  document.getElementById('err-weight').textContent = '';
  document.getElementById('err-height').textContent = '';
  document.getElementById('err-goal').textContent   = '';

  if (!age || age < 10 || age > 100)       { document.getElementById('err-age').textContent    = 'Enter age between 10 and 100.'; valid = false; }
  if (!weight || weight < 20 || weight > 300) { document.getElementById('err-weight').textContent = 'Enter weight between 20 and 300 kg.'; valid = false; }
  if (!height || height < 100 || height > 250) { document.getElementById('err-height').textContent = 'Enter height between 100 and 250 cm.'; valid = false; }

  let goalOverrideVal = null;
  if (override) {
    goalOverrideVal = parseFloat(override);
    if (isNaN(goalOverrideVal) || goalOverrideVal < 500 || goalOverrideVal > 9999) {
      document.getElementById('err-goal').textContent = 'Override must be between 500 and 9999 kcal.';
      valid = false;
    }
  }

  if (!valid) return;

  const profile = { goal, sex, dietaryPreference: diet, activityLevel: activity, age, weightKg: weight, heightCm: height };
  store.setProfile(profile);
  if (goalOverrideVal) store.setGoalOverride(goalOverrideVal);
  else store.delete('ddt_goal');

  // Update suggested display
  document.getElementById('suggested-goal').textContent = utils.computeGoal(profile) + ' kcal';

  showToast('Settings saved!');
}

// ── Reset ─────────────────────────────────────────────────
function onReset() {
  if (!confirm('This will delete all your data and restart onboarding. Are you sure?')) return;
  store.clearAll();
  window.location.href = 'index.html';
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
