/**
 * js/store.js — localStorage data layer for Nutrify
 * All app state is read/written exclusively through this module.
 */

const KEYS = {
  PROFILE:    'ddt_profile',
  PLAN:       'ddt_plan',
  GOAL:       'ddt_goal',
  THEME:      'ddt_theme',
  STREAK:     'ddt_streak',
  WEIGHT_LOG: 'ddt_weight_log',
};

const store = {
  // ── Core ──────────────────────────────────────────────────

  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Store: corrupted data for key "${key}" — clearing.`, e);
      localStorage.removeItem(key);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Store: failed to write key "${key}" (quota exceeded?).`, e);
    }
  },

  delete(key) {
    localStorage.removeItem(key);
  },

  clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    // Also clear dynamic water log keys
    const waterKeys = Object.keys(localStorage).filter(k => k.startsWith('ddt_water_'));
    waterKeys.forEach(k => localStorage.removeItem(k));
  },

  // ── Profile ───────────────────────────────────────────────

  getProfile() {
    return this.get(KEYS.PROFILE, null);
  },

  setProfile(profile) {
    this.set(KEYS.PROFILE, profile);
  },

  // ── Plan ──────────────────────────────────────────────────

  getPlan() {
    return this.get(KEYS.PLAN, null);
  },

  setPlan(plan) {
    plan.updatedAt = new Date().toISOString();
    this.set(KEYS.PLAN, plan);
  },

  // ── Goal Override ─────────────────────────────────────────

  getGoalOverride() {
    return this.get(KEYS.GOAL, null);
  },

  setGoalOverride(kcal) {
    this.set(KEYS.GOAL, kcal);
  },

  // ── Theme ─────────────────────────────────────────────────

  getTheme() {
    return this.get(KEYS.THEME, 'light');
  },

  setTheme(theme) {
    this.set(KEYS.THEME, theme);
  },

  // ── Streak ────────────────────────────────────────────────

  getStreak() {
    return this.get(KEYS.STREAK, { count: 0, lastCompletedDate: null });
  },

  setStreak(streak) {
    this.set(KEYS.STREAK, streak);
  },

  // ── Water Log (keyed by date 'YYYY-MM-DD') ────────────────

  getWater(date) {
    return this.get(`ddt_water_${date}`, 0);
  },

  setWater(date, count) {
    this.set(`ddt_water_${date}`, Math.max(0, Math.min(8, count)));
  },

  // ── Weight Log ────────────────────────────────────────────

  getWeightLog() {
    return this.get(KEYS.WEIGHT_LOG, []);
  },

  appendWeight(entry) {
    // entry: { date: 'YYYY-MM-DD', weight: number }
    let log = this.getWeightLog();
    // Upsert: replace existing entry for same date
    const idx = log.findIndex(e => e.date === entry.date);
    if (idx !== -1) {
      log[idx] = entry;
    } else {
      log.push(entry);
    }
    // Maintain chronological order
    log.sort((a, b) => a.date.localeCompare(b.date));
    this.set(KEYS.WEIGHT_LOG, log);
  },
};
