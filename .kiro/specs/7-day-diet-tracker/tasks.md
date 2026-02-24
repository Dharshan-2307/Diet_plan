# Implementation Plan: Nutrify

## Overview

Implement a multi-page vanilla HTML/CSS/JS nutrition tracker with localStorage persistence. Tasks are ordered foundation-first: data layer → shared styles/utilities → page-by-page implementation → layered features → tests.

## Tasks

- [x] 1. Set up project file structure and shared CSS foundation
  - Create `style.css` with all CSS custom properties (`:root` color tokens, spacing scale, typography, radius, nav heights)
  - Add `[data-theme="dark"]` overrides for all color variables
  - Implement all shared component classes: `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--danger`, `.card`, `.form-group`, `.form-error`, `.badge`, `.toast`
  - Implement responsive breakpoint scaffold (`@media (min-width: 768px)`)
  - Add touch-friendly tap target baseline (min 44×44px on interactive elements)
  - Add `.no-print` and `.print-only` utility classes
  - _Requirements: 5.2, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 2. Implement `js/store.js` — localStorage data layer
  - [x] 2.1 Implement core `store.get(key, defaultValue)`, `store.set(key, value)`, `store.delete(key)` with JSON serialization/deserialization and try/catch error handling (warn + clear + return default on corrupt data, silent fail on quota exceeded)
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  - [-] 2.2 Write property test for store round-trip serialization
    - **Property 6: Plan Round-Trip Serialization**
    - **Validates: Requirements 6.4, 2.8, 3.5**
  - [ ]* 2.3 Write property test for corrupted store data
    - **Property 7: Corrupted Store Data Returns Safe Default**
    - **Validates: Requirements 6.5**
  - [ ] 2.4 Implement convenience accessors: `getProfile/setProfile`, `getPlan/setPlan`, `getGoalOverride/setGoalOverride`, `clearAll`
    - _Requirements: 6.1_
  - [ ] 2.5 Implement theme accessors: `getTheme/setTheme` (key `ddt_theme`, default `'light'`)
    - _Requirements: 11.4_
  - [ ]* 2.6 Write property test for dark mode persistence
    - **Property 14: Dark Mode Preference Persists Across Page Loads**
    - **Validates: Requirements 11.4, 11.5**
  - [ ] 2.7 Implement streak accessors: `getStreak/setStreak` (key `ddt_streak`, default `{ count: 0, lastCompletedDate: null }`)
    - _Requirements: 13.5_
  - [ ] 2.8 Implement water log accessors: `getWater(date)/setWater(date, count)` (key `ddt_water_YYYY-MM-DD`, default `0`)
    - _Requirements: 14.3, 14.5_
  - [ ] 2.9 Write property test for water log date independence
    - **Property 16: Water Log Resets on New Day**
    - **Validates: Requirements 14.3, 14.4**
  - [ ] 2.10 Implement weight log accessors: `getWeightLog/appendWeight` (key `ddt_weight_log`, upsert by date, maintain chronological order)
    - _Requirements: 18.2, 18.3, 18.5_
  - [ ]* 2.11 Write property test for weight log chronological order and upsert
    - **Property 17: Weight Log Chronological Order**
    - **Validates: Requirements 18.2, 18.3, 18.5**

- [x] 3. Implement `js/utils.js` — shared utilities
  - [x] 3.1 Implement `utils.toKg(lbs)` and `utils.toCm(feet, inches)` unit converters
    - _Requirements: 1.2_
  - [x] 3.2 Implement `utils.computeGoal(profile)` using Mifflin-St Jeor BMR, activity multipliers, and goal adjustments (−500 / 0 / +300), rounded to nearest integer
    - _Requirements: 1.3, 4.3, 4.4, 4.5_
  - [ ]* 3.3 Write property test for calorie goal formula correctness
    - **Property 1: Calorie Goal Formula Correctness**
    - **Validates: Requirements 1.3, 4.3, 4.4, 4.5**
  - [x] 3.4 Implement `utils.progressRatio(consumed, goal)` returning a 0–∞ ratio
    - _Requirements: 7.1_
  - [x] 3.5 Implement `utils.todayKey()` returning today's date as `'YYYY-MM-DD'`
    - _Requirements: 14.3, 18.2_
  - [x] 3.6 Implement `utils.getTip(dayIndex)` with a hardcoded 14-entry tips array, selection via `tips[dayIndex % tips.length]`
    - _Requirements: 12.2_
  - [x] 3.7 Implement `utils.defaultMeals(profile)` returning a 7-element array of `Meal[]` based on `dietaryPreference`, with calories scaled to the computed Daily_Goal; ensure vegetarian/vegan meals contain no non-compliant ingredients
    - _Requirements: 4.1_
  - [ ]* 3.8 Write property test for default meal suggestions respecting dietary preference
    - **Property 11: Default Meal Suggestions Respect Dietary Preference**
    - **Validates: Requirements 4.1**
  - [x] 3.9 Implement `utils.formatWeightChartSVG(entries, width, height)` returning an inline SVG `<path d="...">` string for the weight log line chart
    - _Requirements: 18.4_
  - [x] 3.10 Implement `utils.planToText(plan, goalOverride)` serializing all 7 days with day name, Daily_Goal, and each meal's name, type, and calorie count as formatted plain text
    - _Requirements: 19.6_
  - [ ]* 3.11 Write property test for plan plain-text export completeness
    - **Property 19: Plan Plain-Text Export Contains All 7 Days and Meals**
    - **Validates: Requirements 19.6**

- [ ] 4. Checkpoint — Ensure all store and utils tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement `index.html` + `js/onboarding.js` — Onboarding flow
  - [x] 5.1 Create `index.html` with the onboarding form: goal (radio cards), activity level (radio cards), sex (radio), age/weight/height inputs with unit toggles (kg/lbs, cm/ft+in), dietary preference (radio); no Nav bar on this page
    - _Requirements: 1.1, 1.2, 5.1_
  - [x] 5.2 Implement redirect logic in `js/onboarding.js`: on load, if Profile exists in Store redirect immediately to `tracker.html`; otherwise show the form
    - _Requirements: 1.5_
  - [x] 5.3 Implement inline field validation on submit: check all required fields, display `.form-error` messages for missing/invalid fields, block submission until valid
    - _Requirements: 1.6_
  - [ ]* 5.4 Write property test for invalid onboarding submission rejection
    - **Property 2: Invalid Onboarding Submission Rejected**
    - **Validates: Requirements 1.6**
  - [x] 5.5 On valid submit: call `utils.computeGoal(profile)`, call `utils.defaultMeals(profile)` to build the initial Plan, save Profile + Daily_Goal + Plan to Store, redirect to `tracker.html`
    - _Requirements: 1.3, 1.4, 4.1_

- [x] 6. Implement shared Nav component and dark mode bootstrap
  - [x] 6.1 Add the Nav HTML partial (with `.nav`, `.nav__link`, `data-page` attributes, and dark mode toggle button) to `tracker.html`, `progress.html`, and `settings.html`; omit from `index.html`
    - _Requirements: 8.1, 8.2, 8.6, 11.1_
  - [x] 6.2 Implement Nav active-state logic in each page's JS: on load, add `.nav--active` to the link matching the current page filename
    - _Requirements: 8.3_
  - [ ]* 6.3 Write property test for nav active state
    - **Property 10: Nav Active State Matches Current Page**
    - **Validates: Requirements 8.3**
  - [x] 6.4 Add responsive Nav CSS: `position: fixed; bottom: 0` with icon+label layout on `< 768px`; `position: sticky; top: 0` horizontal bar on `≥ 768px`; add `padding-bottom` on `<main>` to prevent content overlap on mobile
    - _Requirements: 8.4, 8.5_
  - [x] 6.5 Implement dark mode bootstrap in a shared inline `<script>` block (or top of each page's JS): read `store.getTheme()` and apply `data-theme="dark"` to `<body>` before first paint; wire the toggle button to flip theme and persist via `store.setTheme()`
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

- [-] 7. Implement `tracker.html` + `js/tracker.js` — core daily tracking
  - [x] 7.1 Create `tracker.html` with day tabs (Mon–Sun), a `.day-grid` container, and the page header (streak badge placeholder, tip card placeholder)
    - _Requirements: 5.1, 5.6_
  - [x] 7.2 Implement day tab switching in `js/tracker.js`: default to current day of week; on tab click show only the active day's column; apply `.day-tab--active`; update the motivational tip display
    - _Requirements: 12.1, 12.3_
  - [x] 7.3 Render each day's meal list from the Store: checkbox, name, type badge, calorie count, edit and delete controls; apply `.meal-item--completed` when checked
    - _Requirements: 2.1, 3.1, 3.3_
  - [x] 7.4 Implement meal checkbox toggle: update `meal.completed` in Store, recalculate consumed calories, update progress bar width and color state, update Calories_Remaining display
    - _Requirements: 3.2, 3.5, 3.6, 9.1, 9.2_
  - [ ]* 7.5 Write property test for consumed calories invariant
    - **Property 4: Consumed Calories Invariant**
    - **Validates: Requirements 2.6, 3.2, 3.6**
  - [ ]* 7.6 Write property test for calories remaining invariant
    - **Property 12: Calories Remaining Invariant**
    - **Validates: Requirements 9.1, 9.2, 9.3**
  - [x] 7.7 Implement inline add/edit meal form: name input, meal-type select with custom type option, calorie input; validate calorie on blur (reject non-numeric, ≤0, >9999); save to Store on submit; cancel discards changes
    - _Requirements: 2.2, 2.3, 2.5, 2.7_
  - [ ]* 7.8 Write property test for calorie input validation
    - **Property 5: Calorie Input Validation**
    - **Validates: Requirements 2.7**
  - [x] 7.9 Implement meal delete: remove meal from day in Store, re-render day
    - _Requirements: 2.4_
  - [ ]* 7.10 Write property test for meal list mutation correctness
    - **Property 3: Meal List Mutation Correctness**
    - **Validates: Requirements 2.1, 2.3, 2.4**
  - [x] 7.11 Implement exceeded-goal warning: when consumed > Daily_Goal apply `.progress-bar__fill--exceeded` and show warning message; remove both when consumed ≤ goal
    - _Requirements: 10.1, 10.2, 10.3_
  - [ ]* 7.12 Write property test for exceeded goal warning state
    - **Property 13: Exceeded Goal Warning State**
    - **Validates: Requirements 10.1, 10.2, 10.3**
  - [ ]* 7.13 Write property test for exceeded goal progress bar color
    - **Property 8: Exceeded Goal Triggers Color Change**
    - **Validates: Requirements 7.2**
  - [x] 7.14 Implement day completion indicator: when all meals in a day are checked show a visual completion badge; show a toast notification on the transition to fully complete
    - _Requirements: 3.4, 7.4_
  - [x] 7.15 Display suggested Daily_Goal (from Profile) alongside user-overridden goal; show Calories_Remaining in red when negative
    - _Requirements: 4.2, 4.6, 9.3, 9.4_

- [x] 8. Implement streak counter in `js/tracker.js`
  - [x] 8.1 On each day-completion event (all meals checked), compute whether the completion date is exactly one day after `lastCompletedDate` (increment) or more (reset to 1); write updated streak to Store; update the streak badge in the header
    - _Requirements: 13.1, 13.2, 13.3_
  - [x] 8.2 On meal uncheck, recalculate streak from current Store state and update the display
    - _Requirements: 13.4_
  - [ ]* 8.3 Write property test for streak increment and reset logic
    - **Property 15: Streak Increments on Consecutive Completion, Resets on Gap**
    - **Validates: Requirements 13.2, 13.3**

- [x] 9. Implement water intake tracker in `js/tracker.js`
  - Add 8 `.water-drop` icons to the active day's section; on tap fill all drops up to and including the tapped index and write to `store.setWater(todayKey(), count)`; on day/date change reset display to stored count for that date (0 if new date)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 10. Implement meal notes in `js/tracker.js`
  - Add a collapsible `.meal-note` textarea below each meal item; auto-save note to `meal.note` in Store on every `input` event; populate textarea from stored note on render; default to `''` when no note exists
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 11. Implement motivational tip display in `js/tracker.js`
  - Render `utils.getTip(dayIndex)` in the `.tip-card` element on page load and on each day tab switch; tip is read-only
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 12. Implement "Download Plan PDF" in `js/tracker.js`
  - [x] 12.1 Add "Download Plan PDF" button to `tracker.html`; on click call `utils.planToText(plan, goalOverride)` and attempt `navigator.clipboard.writeText()` (silently skip if unavailable), then call `window.print()`
    - _Requirements: 19.1, 19.2, 19.6, 19.7_
  - [x] 12.2 Add `body.page-tracker @media print` block in `style.css`: hide Nav, day tabs, checkboxes, edit/delete controls, water tracker, streak badge, and all interactive elements; render all 7 days stacked with day name, Daily_Goal, and each meal's name, type, and calorie count
    - _Requirements: 19.3, 19.4, 19.5_

- [ ] 13. Checkpoint — Ensure tracker page tests pass and all tracker features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement `progress.html` + `js/progress.js` — weekly progress
  - [x] 14.1 Create `progress.html` with weekly summary card (total consumed, total planned, days completed count) and per-day progress bars with percentage labels; read all data from Store on page load
    - _Requirements: 5.1, 7.1, 7.3, 7.5_
  - [x] 14.2 Apply `.progress-bar__fill--exceeded` on per-day bars where consumed > Daily_Goal
    - _Requirements: 7.2_
  - [x] 14.3 Implement weekly calorie average: sum consumed calories across days with ≥1 checked meal, divide by that count; display `0` or `—` when no days qualify
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  - [ ]* 14.4 Write property test for weekly summary aggregation correctness
    - **Property 9: Weekly Summary Aggregation Correctness**
    - **Validates: Requirements 7.3, 7.5**
  - [ ]* 14.5 Write property test for weekly calorie average excluding empty days
    - **Property 18: Weekly Calorie Average Excludes Empty Days**
    - **Validates: Requirements 16.1, 16.2, 16.3**
  - [x] 14.6 Implement body weight log UI: number input + "Log Weight" button; validate positive numeric value; call `store.appendWeight({ date: todayKey(), weight })` on submit; show `.form-error` on invalid input
    - _Requirements: 18.1, 18.2, 18.3, 18.6_
  - [x] 14.7 Render weight log as inline SVG line chart using `utils.formatWeightChartSVG(entries, width, height)`; no external charting library
    - _Requirements: 18.4_
  - [x] 14.8 Implement "Print / Export" button: call `utils.planToText` equivalent for weekly summary, attempt `navigator.clipboard.writeText()` (silently skip if unavailable), then call `window.print()`
    - _Requirements: 17.1, 17.2, 17.4, 17.5_
  - [x] 14.9 Add `body.page-progress @media print` block in `style.css`: hide Nav, render text-only weekly summary (consumed, planned, per-day breakdown)
    - _Requirements: 17.3_

- [x] 15. Implement `settings.html` + `js/settings.js` — profile & settings
  - [x] 15.1 Create `settings.html` with editable Profile fields (goal, activity level, age, weight, height, dietary preference), Daily_Goal override input showing the suggested value, dark mode toggle, "Save Changes" button, and "Re-run Onboarding" button
    - _Requirements: 5.1_
  - [x] 15.2 On load, populate all fields from `store.getProfile()` and `store.getGoalOverride()`; show `utils.computeGoal(profile)` as the suggested value
    - _Requirements: 4.2_
  - [x] 15.3 On "Save Changes": validate inputs, write updated Profile + goal override to Store, recompute suggestion via `utils.computeGoal`
    - _Requirements: 6.1_
  - [x] 15.4 On "Re-run Onboarding": call `store.clearAll()` and redirect to `index.html`
    - _Requirements: 1.1_
  - [x] 15.5 If no Profile exists on load, render a prompt with a link to `index.html` instead of the settings form
    - _Requirements: 5.1_

- [-] 16. Add responsive desktop layout for `tracker.html`
  - Add `@media (min-width: 768px)` CSS for `.day-grid` as a 7-column grid (`repeat(7, 1fr)`); show all days simultaneously on desktop; hide day tabs on desktop (all columns visible); ensure top nav is shown and bottom nav is hidden
  - _Requirements: 5.6, 8.4, 8.5_

- [ ] 17. Final checkpoint — Ensure all tests pass and all pages are wired together
  - Verify Nav links work across all pages, dark mode persists across page loads, onboarding redirects correctly, and all Store keys are consistent.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use fast-check loaded via `<script>` tag or Node; unit tests use plain `assert` or uvu
- Each property test maps 1:1 to a correctness property in the design document
- Print stylesheets for tracker (Req 19) and progress (Req 17) are separate `@media print` blocks scoped by body class
