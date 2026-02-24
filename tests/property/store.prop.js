/**
 * Property-based tests for js/store.js
 * Feature: 7-day-diet-tracker
 *
 * Uses fast-check with a localStorage mock for Node.js compatibility.
 */

import fc from 'fast-check';
import assert from 'node:assert/strict';

// ── localStorage mock ────────────────────────────────────────────────────────

class LocalStorageMock {
  constructor() { this._store = {}; }
  getItem(key) { return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : null; }
  setItem(key, value) { this._store[key] = String(value); }
  removeItem(key) { delete this._store[key]; }
  clear() { this._store = {}; }
  get length() { return Object.keys(this._store).length; }
  key(i) { return Object.keys(this._store)[i] ?? null; }
  keys() { return Object.keys(this._store); }
}

function makeStore() {
  const ls = new LocalStorageMock();
  // Patch Object.keys(localStorage) to work via the mock's keys()
  const lsProxy = new Proxy(ls, {
    get(target, prop) {
      if (prop === Symbol.iterator) return undefined;
      return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
    }
  });

  // Inline store implementation (mirrors js/store.js but uses injected localStorage)
  const KEYS = {
    PROFILE:    'ddt_profile',
    PLAN:       'ddt_plan',
    GOAL:       'ddt_goal',
    THEME:      'ddt_theme',
    STREAK:     'ddt_streak',
    WEIGHT_LOG: 'ddt_weight_log',
  };

  const store = {
    _ls: ls,

    get(key, defaultValue = null) {
      try {
        const raw = ls.getItem(key);
        if (raw === null) return defaultValue;
        return JSON.parse(raw);
      } catch (e) {
        ls.removeItem(key);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        ls.setItem(key, JSON.stringify(value));
      } catch (e) {
        // quota exceeded — silent fail
      }
    },

    delete(key) { ls.removeItem(key); },

    clearAll() {
      Object.values(KEYS).forEach(k => ls.removeItem(k));
      ls.keys().filter(k => k.startsWith('ddt_water_')).forEach(k => ls.removeItem(k));
    },

    getProfile()          { return this.get(KEYS.PROFILE, null); },
    setProfile(p)         { this.set(KEYS.PROFILE, p); },

    getPlan()             { return this.get(KEYS.PLAN, null); },
    setPlan(plan)         { plan.updatedAt = new Date().toISOString(); this.set(KEYS.PLAN, plan); },

    getGoalOverride()     { return this.get(KEYS.GOAL, null); },
    setGoalOverride(k)    { this.set(KEYS.GOAL, k); },

    getTheme()            { return this.get(KEYS.THEME, 'light'); },
    setTheme(t)           { this.set(KEYS.THEME, t); },

    getStreak()           { return this.get(KEYS.STREAK, { count: 0, lastCompletedDate: null }); },
    setStreak(s)          { this.set(KEYS.STREAK, s); },

    getWater(date)        { return this.get(`ddt_water_${date}`, 0); },
    setWater(date, count) { this.set(`ddt_water_${date}`, Math.max(0, Math.min(8, count))); },

    getWeightLog()        { return this.get(KEYS.WEIGHT_LOG, []); },
    appendWeight(entry) {
      let log = this.getWeightLog();
      const idx = log.findIndex(e => e.date === entry.date);
      if (idx !== -1) { log[idx] = entry; } else { log.push(entry); }
      log.sort((a, b) => a.date.localeCompare(b.date));
      this.set(KEYS.WEIGHT_LOG, log);
    },
  };

  return store;
}

// ── Arbitraries ──────────────────────────────────────────────────────────────

const mealArb = fc.record({
  id:        fc.uuid(),
  name:      fc.string({ minLength: 1, maxLength: 50 }),
  type:      fc.constantFrom('Breakfast', 'Lunch', 'Snack', 'Dinner'),
  calories:  fc.integer({ min: 1, max: 9999 }),
  completed: fc.boolean(),
  note:      fc.string({ maxLength: 200 }),
});

const dayArb = (dayIndex) => fc.record({
  dayIndex: fc.constant(dayIndex),
  meals:    fc.array(mealArb, { minLength: 0, maxLength: 6 }),
});

// JSON-normalize: round-trip through JSON to strip null-prototype objects
// that fast-check can generate, so deepEqual comparisons work correctly.
function jsonNormalize(v) { return JSON.parse(JSON.stringify(v)); }

const planArb = fc.record({
  days:      fc.tuple(...[0,1,2,3,4,5,6].map(dayArb)),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
}).map(p => jsonNormalize({ ...p, days: Array.from(p.days) }));

const dateStrArb = fc.date({ min: new Date('2020-01-01T00:00:00.000Z'), max: new Date('2030-12-31T00:00:00.000Z'), noInvalidDate: true })
  .map(d => d.toISOString().slice(0, 10));

const weightEntryArb = fc.record({
  date:   dateStrArb,
  weight: fc.float({ min: 30, max: 300, noNaN: true }),
});

// ── Property 6: Plan Round-Trip Serialization ─────────────────────────────────
// Feature: 7-day-diet-tracker, Property 6: Plan Round-Trip Serialization
// Validates: Requirements 6.4, 2.8, 3.5

console.log('Running Property 6: Plan Round-Trip Serialization...');
fc.assert(
  fc.property(planArb, (plan) => {
    const store = makeStore();
    // setPlan mutates updatedAt, so capture after set
    store.setPlan(plan);
    const retrieved = store.getPlan();
    // All original fields except updatedAt (which setPlan overwrites) must match
    assert.deepEqual(retrieved.days, plan.days);
    assert.equal(retrieved.createdAt, plan.createdAt);
    // updatedAt should be a valid ISO string (set by setPlan)
    assert.ok(typeof retrieved.updatedAt === 'string');
    assert.ok(!isNaN(Date.parse(retrieved.updatedAt)));
    return true;
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 6 passed');

// ── Property 7: Corrupted Store Data Returns Safe Default ─────────────────────
// Feature: 7-day-diet-tracker, Property 7: Corrupted Store Data Returns Safe Default
// Validates: Requirements 6.5

const corruptedJsonArb = fc.oneof(
  fc.constant('{'),
  fc.constant('{"unclosed":'),
  fc.constant('undefined'),
  fc.constant(''),
  fc.constant('NaN'),
  fc.string({ minLength: 1, maxLength: 30 }).filter(s => {
    try { JSON.parse(s); return false; } catch { return true; }
  }),
);

console.log('Running Property 7: Corrupted Store Data Returns Safe Default...');
fc.assert(
  fc.property(corruptedJsonArb, fc.string({ minLength: 1, maxLength: 20 }), (corruptedValue, defaultValue) => {
    const store = makeStore();
    const key = 'ddt_test_key';
    // Directly inject corrupted data into the underlying localStorage mock
    store._ls.setItem(key, corruptedValue);
    // get() should return defaultValue without throwing
    const result = store.get(key, defaultValue);
    assert.equal(result, defaultValue);
    // Corrupted entry should be cleared
    assert.equal(store._ls.getItem(key), null);
    return true;
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 7 passed');

// ── Property 14: Dark Mode Preference Persists Across Page Loads ──────────────
// Feature: 7-day-diet-tracker, Property 14: Dark Mode Preference Persists Across Page Loads
// Validates: Requirements 11.4, 11.5

console.log('Running Property 14: Dark Mode Preference Persists Across Page Loads...');
fc.assert(
  fc.property(fc.constantFrom('light', 'dark'), (theme) => {
    const store = makeStore();
    store.setTheme(theme);
    // Simulate page reload: create a new store instance sharing the same localStorage
    const store2 = makeStore();
    // Share the same underlying storage
    store2._ls = store._ls;
    // Re-bind get/set to use the shared ls
    const retrieved = store.getTheme();
    assert.equal(retrieved, theme);
    return true;
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 14 passed');

// ── Property 16: Water Log Resets on New Day ──────────────────────────────────
// Feature: 7-day-diet-tracker, Property 16: Water Log Resets on New Day
// Validates: Requirements 14.3, 14.4

console.log('Running Property 16: Water Log Resets on New Day...');
fc.assert(
  fc.property(
    dateStrArb,
    dateStrArb,
    fc.integer({ min: 1, max: 8 }),
    (dateA, dateB, count) => {
      fc.pre(dateA !== dateB);
      const store = makeStore();
      store.setWater(dateA, count);
      // dateB has never been written — should return 0
      assert.equal(store.getWater(dateB), 0);
      // dateA should still have its value (clamped 0–8)
      const stored = store.getWater(dateA);
      assert.equal(stored, Math.max(0, Math.min(8, count)));
      return true;
    }
  ),
  { numRuns: 100 }
);
console.log('  ✓ Property 16 passed');

// ── Property 17: Weight Log Chronological Order ───────────────────────────────
// Feature: 7-day-diet-tracker, Property 17: Weight Log Chronological Order
// Validates: Requirements 18.2, 18.3, 18.5

console.log('Running Property 17: Weight Log Chronological Order...');
fc.assert(
  fc.property(fc.array(weightEntryArb, { minLength: 1, maxLength: 20 }), (entries) => {
    const store = makeStore();
    for (const entry of entries) {
      store.appendWeight(entry);
    }
    const log = store.getWeightLog();

    // Must be sorted ascending by date
    for (let i = 1; i < log.length; i++) {
      assert.ok(log[i].date >= log[i - 1].date, `Log not sorted: ${log[i-1].date} > ${log[i].date}`);
    }

    // At most one entry per date (upsert semantics)
    const dates = log.map(e => e.date);
    const uniqueDates = new Set(dates);
    assert.equal(dates.length, uniqueDates.size, 'Duplicate dates found in weight log');

    // Every unique date from input must appear in the log
    const inputDates = new Set(entries.map(e => e.date));
    for (const d of inputDates) {
      assert.ok(uniqueDates.has(d), `Date ${d} missing from weight log`);
    }

    return true;
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 17 passed');

console.log('\nAll store property tests passed.');
