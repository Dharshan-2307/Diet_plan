/**
 * js/onboarding.js — Onboarding flow for 7 Day Diet Tracker
 */

// ── State ─────────────────────────────────────────────────
let weightUnit = 'kg';
let heightUnit = 'cm';

// ── Unit toggle helpers (called from HTML) ────────────────
function setWeightUnit(unit) {
  weightUnit = unit;
  document.getElementById('wt-kg').classList.toggle('active', unit === 'kg');
  document.getElementById('wt-lbs').classList.toggle('active', unit === 'lbs');
}

function setHeightUnit(unit) {
  heightUnit = unit;
  document.getElementById('ht-cm').classList.toggle('active', unit === 'cm');
  document.getElementById('ht-ft').classList.toggle('active', unit === 'ft');
  document.getElementById('height-cm-wrap').style.display = unit === 'cm' ? '' : 'none';
  document.getElementById('height-ft-wrap').style.display = unit === 'ft' ? '' : 'none';
}

// ── Validation helpers ────────────────────────────────────
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['err-goal','err-activity','err-sex','err-age','err-weight','err-height','err-diet']
    .forEach(id => setError(id, ''));
}

function validateForm() {
  clearErrors();
  let valid = true;

  const goal = document.querySelector('input[name="goal"]:checked');
  if (!goal) { setError('err-goal', 'Please select a goal.'); valid = false; }

  const activity = document.querySelector('input[name="activityLevel"]:checked');
  if (!activity) { setError('err-activity', 'Please select your activity level.'); valid = false; }

  const sex = document.querySelector('input[name="sex"]:checked');
  if (!sex) { setError('err-sex', 'Please select your sex.'); valid = false; }

  const age = parseFloat(document.getElementById('age').value);
  if (!age || age < 10 || age > 100) { setError('err-age', 'Enter a valid age (10–100).'); valid = false; }

  const weight = parseFloat(document.getElementById('weight').value);
  if (!weight || weight <= 0) { setError('err-weight', 'Enter a valid weight.'); valid = false; }

  if (heightUnit === 'cm') {
    const hcm = parseFloat(document.getElementById('height-cm').value);
    if (!hcm || hcm < 100 || hcm > 250) { setError('err-height', 'Enter a valid height (100–250 cm).'); valid = false; }
  } else {
    const hft = parseFloat(document.getElementById('height-ft').value);
    const hin = parseFloat(document.getElementById('height-in').value || '0');
    if (!hft || hft < 3 || hft > 8) { setError('err-height', 'Enter valid feet (3–8).'); valid = false; }
    else if (hin < 0 || hin > 11) { setError('err-height', 'Inches must be 0–11.'); valid = false; }
  }

  const diet = document.querySelector('input[name="dietaryPreference"]:checked');
  if (!diet) { setError('err-diet', 'Please select a dietary preference.'); valid = false; }

  return valid;
}

// ── Build profile from form ───────────────────────────────
function buildProfile() {
  const rawWeight = parseFloat(document.getElementById('weight').value);
  const weightKg = weightUnit === 'lbs' ? utils.toKg(rawWeight) : rawWeight;

  let heightCm;
  if (heightUnit === 'cm') {
    heightCm = parseFloat(document.getElementById('height-cm').value);
  } else {
    const ft = parseFloat(document.getElementById('height-ft').value);
    const inches = parseFloat(document.getElementById('height-in').value || '0');
    heightCm = utils.toCm(ft, inches);
  }

  return {
    goal:               document.querySelector('input[name="goal"]:checked').value,
    activityLevel:      document.querySelector('input[name="activityLevel"]:checked').value,
    sex:                document.querySelector('input[name="sex"]:checked').value,
    age:                parseInt(document.getElementById('age').value, 10),
    weightKg:           Math.round(weightKg * 10) / 10,
    heightCm:           Math.round(heightCm * 10) / 10,
    dietaryPreference:  document.querySelector('input[name="dietaryPreference"]:checked').value,
    createdAt:          new Date().toISOString(),
  };
}

// ── Submit handler ────────────────────────────────────────
document.getElementById('onboarding-form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const profile = buildProfile();
  const dailyGoal = utils.computeGoal(profile);
  const mealArrays = utils.defaultMeals(profile);

  const plan = {
    days: mealArrays.map((meals, i) => ({ dayIndex: i, meals })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.setProfile(profile);
  store.setGoalOverride(null);
  store.setPlan(plan);

  window.location.href = 'tracker.html';
});

// ── On load: redirect if profile already exists ───────────
(function() {
  if (store.getProfile()) {
    window.location.href = 'tracker.html';
  }
})();
