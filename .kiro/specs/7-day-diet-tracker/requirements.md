# Requirements Document

## Introduction

This spec covers a full redesign and enhancement of the existing Nutrify app — a vanilla HTML/CSS/JS web app. The goal is to transform it from a hardcoded, mobile-only meal plan into a fully customizable, responsive diet tracker that works equally well on mobile and desktop. The app remains frontend-only (no backend, no build tools) with localStorage for persistence.

The app is structured as multiple dedicated HTML pages, each with a focused purpose, connected by standard anchor-link navigation. Shared logic lives in `js/store.js` and `js/utils.js`; each page has its own JS file. One shared `style.css` covers all pages.

Key additions include: a user onboarding flow that collects profile data and generates personalized calorie recommendations, a single fully editable 7-day diet plan (custom meal types and calorie entries), and a responsive layout that adapts from mobile to desktop.

## Glossary

- **App**: Nutrify — a multi-page web application
- **User**: The person using the App in a browser
- **Profile**: The User's personal data collected during onboarding (goal, activity level, age, weight, height, dietary preference)
- **Plan**: The single 7-day diet plan containing days and meals
- **Day**: One of the seven days in the Plan (Monday through Sunday)
- **Meal**: A named food entry within a Day, with a calorie count and a completion checkbox
- **Meal_Type**: A user-defined category for a Meal (e.g. Breakfast, Lunch, Snack, Dinner, Pre-workout)
- **Daily_Goal**: The recommended or user-set daily calorie target
- **Progress_Bar**: The visual indicator showing calories consumed vs the Daily_Goal for a given Day
- **Onboarding_Flow**: The initial questionnaire shown to first-time Users to collect Profile data, rendered on `index.html`
- **Store**: The localStorage-backed data layer that persists all App state, implemented in `js/store.js`
- **Recommendation_Engine**: The client-side logic that calculates a suggested Daily_Goal based on Profile data
- **Nav**: The persistent navigation bar (or bottom nav on mobile) linking between the main pages of the App
- **Calories_Remaining**: The difference between the Daily_Goal and the total consumed calories for a given Day (Daily_Goal − consumed); may be negative when the goal is exceeded
- **Dark_Mode**: A visual theme variant that uses dark background colors and light text, toggled by the User and persisted in the Store
- **Streak**: The count of consecutive Days on which all Meals were completed, along with the date of the last completed Day
- **Water_Log**: A per-date record of the number of water portions (0–8) consumed by the User on a given day, stored in the Store keyed by date
- **Weight_Log**: An ordered array of `{ date, weight }` entries recording the User's body weight over time, stored in the Store

---

## Requirements

### Requirement 1: Onboarding Flow

**User Story:** As a new user, I want to answer a few questions about myself when I first open the app, so that I get a personalized daily calorie recommendation before I start tracking.

#### Acceptance Criteria

1. WHEN the App is opened at `index.html` for the first time and no Profile exists in the Store, THE App SHALL display the Onboarding_Flow.
2. THE Onboarding_Flow SHALL collect the following fields from the User: goal (lose weight / maintain / gain muscle), activity level (sedentary / lightly active / moderately active / very active), age (years), weight (kg or lbs), height (cm or ft/in), and dietary preference (no restrictions / vegetarian / vegan).
3. WHEN the User completes the Onboarding_Flow, THE Recommendation_Engine SHALL calculate a suggested Daily_Goal using the Mifflin-St Jeor formula combined with the selected activity multiplier.
4. WHEN the Onboarding_Flow is completed, THE App SHALL save the Profile and the calculated Daily_Goal to the Store and SHALL redirect the User to `tracker.html`.
5. WHEN `index.html` is opened and a Profile already exists in the Store, THE App SHALL immediately redirect the User to `tracker.html` without displaying the Onboarding_Flow.
6. IF the User submits the Onboarding_Flow with any required field empty, THEN THE Onboarding_Flow SHALL display an inline validation message identifying the missing field and SHALL NOT proceed.

---

### Requirement 2: Editable Meals

**User Story:** As a user, I want to fully customize the meals in each day of my plan on the tracker page, so that the tracker reflects what I actually eat.

#### Acceptance Criteria

1. THE Tracker_Page (`tracker.html`) SHALL allow the User to add a new Meal to any Day within the Plan.
2. WHEN adding or editing a Meal on the Tracker_Page, THE Tracker_Page SHALL allow the User to set the Meal name, Meal_Type, and calorie count via an inline edit form.
3. THE Tracker_Page SHALL allow the User to edit the name, Meal_Type, and calorie count of any existing Meal inline without navigating away from `tracker.html`.
4. THE Tracker_Page SHALL allow the User to delete any Meal from a Day.
5. THE Tracker_Page SHALL allow the User to define custom Meal_Types in addition to the defaults (Breakfast, Lunch, Snack, Dinner).
6. WHEN a Meal's calorie count is edited, THE Progress_Bar for that Day SHALL update immediately to reflect the new total.
7. IF the User enters a non-numeric or negative value for a calorie count, THEN THE Tracker_Page SHALL display a validation message and SHALL NOT save the value.
8. THE Store SHALL persist all Meal edits across browser sessions.

---

### Requirement 3: Meal Completion Tracking

**User Story:** As a user, I want to check off meals as I eat them on the tracker page, so that I can track my actual calorie intake against my goal.

#### Acceptance Criteria

1. THE Tracker_Page (`tracker.html`) SHALL display a checkbox next to each Meal.
2. WHEN a Meal checkbox is toggled on the Tracker_Page, THE Progress_Bar for that Day SHALL update to reflect the current total of checked Meal calories.
3. THE Tracker_Page SHALL display the total consumed calories and the Daily_Goal for each Day.
4. WHEN all Meals in a Day are checked, THE Tracker_Page SHALL display a visual completion indicator for that Day.
5. THE Store SHALL persist the checked state of all Meal checkboxes across browser sessions.
6. WHEN the User unchecks a previously checked Meal, THE Progress_Bar SHALL decrease accordingly.

---

### Requirement 4: Personalized Suggestions

**User Story:** As a user, I want the app to suggest meals or calorie targets based on my profile during onboarding, so that I have a starting point when the app is first set up.

#### Acceptance Criteria

1. WHEN the Onboarding_Flow on `index.html` is completed, THE Recommendation_Engine SHALL suggest a set of default Meals per Day based on the User's dietary preference and goal from the Profile.
2. THE Tracker_Page SHALL display the suggested Daily_Goal (calculated from the Profile) alongside any user-overridden Daily_Goal so the User can compare them.
3. WHERE the User's goal is "lose weight", THE Recommendation_Engine SHALL suggest a Daily_Goal that is 500 kcal below the calculated maintenance calories.
4. WHERE the User's goal is "gain muscle", THE Recommendation_Engine SHALL suggest a Daily_Goal that is 300 kcal above the calculated maintenance calories.
5. WHERE the User's goal is "maintain", THE Recommendation_Engine SHALL suggest a Daily_Goal equal to the calculated maintenance calories.
6. THE Tracker_Page SHALL allow the User to accept or dismiss any suggestion without affecting saved Plan data.

---

### Requirement 5: Multi-Page File Structure and Responsive Layout

**User Story:** As a user and developer, I want the app to be organized across dedicated pages with a clear file structure, and to look and work well on both mobile and desktop.

#### Acceptance Criteria

1. THE App SHALL be structured as the following HTML pages, each with a dedicated purpose:
   - `index.html` — Onboarding flow (first-time setup)
   - `tracker.html` — Daily diet tracking (meal checklist, per-day progress bar, day tabs)
   - `progress.html` — Weekly progress summary (total calories, days completed, per-day breakdown)
   - `settings.html` — Profile settings (re-run onboarding, override Daily_Goal)
2. THE App SHALL use a single shared `style.css` for all styling across all pages.
3. THE App SHALL include shared JS modules `js/store.js` (data layer) and `js/utils.js` (shared utilities), and page-specific JS files `js/onboarding.js`, `js/tracker.js`, `js/progress.js`, and `js/settings.js`.
4. THE App SHALL use only vanilla HTML, CSS, and JavaScript with no build tools, package managers, or external CDN dependencies.
5. THE App SHALL use a single-column layout on viewports narrower than 768px.
6. THE App SHALL use a multi-column grid layout on viewports 768px and wider, displaying multiple Days simultaneously on `tracker.html`.
7. THE App SHALL use touch-friendly tap targets (minimum 44×44px) for all interactive elements.
8. WHEN the viewport width changes, THE App SHALL reflow the layout without requiring a page reload.

---

### Requirement 6: Data Persistence and Backend Readiness

**User Story:** As a developer, I want the app's data layer to be cleanly separated from the UI, so that I can swap localStorage for a real backend API later without rewriting the whole app.

#### Acceptance Criteria

1. THE Store SHALL be implemented in `js/store.js` and SHALL expose a consistent interface (get, set, delete operations) that the rest of the App uses exclusively for reading and writing data — no direct localStorage calls outside the Store module.
2. THE App SHALL serialize all Plan, Profile, and completion state data as JSON when writing to the Store.
3. THE Store SHALL deserialize JSON data and return typed objects when reading from the Store.
4. FOR ALL Plan objects, serializing then deserializing SHALL produce an equivalent Plan object (round-trip property).
5. IF the Store encounters corrupted or unparseable data in localStorage, THEN THE Store SHALL clear the corrupted entry, log a console warning, and return a safe default value.

---

### Requirement 7: Progress Visualization

**User Story:** As a user, I want a clear visual summary of my daily and weekly progress on a dedicated progress page, so that I can see how well I'm sticking to my plan.

#### Acceptance Criteria

1. THE Progress_Page (`progress.html`) SHALL display a Progress_Bar for each Day showing the ratio of consumed calories to the Daily_Goal.
2. WHEN consumed calories exceed the Daily_Goal, THE Progress_Bar SHALL change to a visually distinct color to indicate the goal has been exceeded.
3. THE Progress_Page SHALL display a weekly summary showing total calories consumed, total calories planned, and the number of Days fully completed.
4. WHEN a Day is fully completed (all Meals checked), THE Tracker_Page SHALL display a toast notification confirming the Day's completion.
5. THE Progress_Page SHALL display the percentage of completion for each Day alongside the Progress_Bar.

---

### Requirement 8: Navigation

**User Story:** As a user, I want a persistent navigation bar that lets me move between the main pages of the app, so that I always know where I am and can switch views easily.

#### Acceptance Criteria

1. THE Nav SHALL be present on `tracker.html`, `progress.html`, and `settings.html`.
2. THE Nav SHALL provide links to `tracker.html`, `progress.html`, and `settings.html` using standard anchor elements (`<a href="...">`).
3. WHEN a page is active, THE Nav SHALL apply a visually distinct style to the link corresponding to the current page.
4. THE Nav SHALL be displayed as a bottom navigation bar on viewports narrower than 768px.
5. THE Nav SHALL be displayed as a top or side navigation bar on viewports 768px and wider.
6. THE Nav SHALL NOT be displayed on `index.html` during the Onboarding_Flow.

---

### Requirement 9: Calories Remaining Display

**User Story:** As a user, I want to see how many calories I have left for the day, so that I can make informed decisions about what to eat next.

#### Acceptance Criteria

1. THE Tracker_Page SHALL display the Calories_Remaining value (Daily_Goal − consumed) prominently for the active Day.
2. WHEN a Meal checkbox is toggled, THE Tracker_Page SHALL update the Calories_Remaining display immediately without a page reload.
3. WHEN Calories_Remaining is negative (consumed exceeds Daily_Goal), THE Tracker_Page SHALL render the Calories_Remaining value in a visually distinct red color.
4. WHEN Calories_Remaining is zero or positive, THE Tracker_Page SHALL render the Calories_Remaining value in the default text color.

---

### Requirement 10: Exceeded Goal Warning

**User Story:** As a user, I want a clear warning when I've gone over my calorie goal, so that I'm aware I've exceeded my target for the day.

#### Acceptance Criteria

1. WHEN consumed calories exceed the Daily_Goal for a Day, THE Tracker_Page SHALL change the Progress_Bar for that Day to a red color state.
2. WHEN consumed calories exceed the Daily_Goal for a Day, THE Tracker_Page SHALL display a warning message indicating the goal has been exceeded.
3. WHEN consumed calories return to or below the Daily_Goal (e.g. a Meal is unchecked), THE Tracker_Page SHALL remove the warning message and restore the Progress_Bar to its normal color state.

---

### Requirement 11: Dark Mode Toggle

**User Story:** As a user, I want to switch between light and dark themes, so that I can use the app comfortably in low-light environments.

#### Acceptance Criteria

1. THE Nav SHALL include a toggle button (sun/moon icon) that switches between light and dark themes.
2. WHEN the dark mode toggle is activated, THE App SHALL apply `data-theme="dark"` to the `<body>` element and update all page colors using CSS variable overrides defined in `style.css`.
3. WHEN the dark mode toggle is deactivated, THE App SHALL remove `data-theme="dark"` from the `<body>` element and restore the default light theme.
4. THE Store SHALL persist the User's Dark_Mode preference under the key `ddt_theme`.
5. WHEN any page loads, THE App SHALL read the Dark_Mode preference from the Store and apply the correct theme before rendering visible content.

---

### Requirement 12: Daily Motivational Tip

**User Story:** As a user, I want to see a short motivational tip each day on the tracker page, so that I stay encouraged throughout the week.

#### Acceptance Criteria

1. THE Tracker_Page SHALL display a motivational tip at the top of the page for the currently active Day.
2. THE tip SHALL be selected from a hardcoded array of 14 tips in `js/utils.js` using the formula `tips[dayIndex % tips.length]`.
3. WHEN the active Day changes, THE Tracker_Page SHALL update the displayed tip to match the new Day's index.
4. THE tip display SHALL be read-only and SHALL NOT be editable by the User.

---

### Requirement 13: Streak Counter

**User Story:** As a user, I want to see how many consecutive days I've completed all my meals, so that I'm motivated to maintain my streak.

#### Acceptance Criteria

1. THE Tracker_Page SHALL display the current Streak count in the page header.
2. WHEN all Meals in a Day are checked and the Day's date is exactly one calendar day after the `lastCompletedDate` stored in the Streak, THE Store SHALL increment the Streak count by one and update `lastCompletedDate` to today's date.
3. WHEN all Meals in a Day are checked and the Day's date is more than one calendar day after the `lastCompletedDate`, THE Store SHALL reset the Streak count to 1 and set `lastCompletedDate` to today's date.
4. WHEN a previously completed Day has a Meal unchecked, THE Tracker_Page SHALL recalculate the Streak and update the display accordingly.
5. THE Store SHALL persist the Streak under the key `ddt_streak` as `{ count: number, lastCompletedDate: string | null }`.

---

### Requirement 14: Water Intake Tracker

**User Story:** As a user, I want to log how many glasses of water I drink each day, so that I can stay on top of my hydration.

#### Acceptance Criteria

1. THE Tracker_Page SHALL display 8 water drop icons for the active Day.
2. WHEN the User taps a water drop icon, THE Tracker_Page SHALL fill all drops up to and including the tapped drop and update the Water_Log count for today's date.
3. THE Water_Log count for a given date SHALL be stored in the Store under the key `ddt_water_YYYY-MM-DD` as a number between 0 and 8 inclusive.
4. WHEN the active Day's date changes to a new calendar date, THE Tracker_Page SHALL display 0 filled drops (the Water_Log for the new date starts at 0).
5. THE Store SHALL persist the Water_Log count across browser sessions for each date independently.

---

### Requirement 15: Meal Notes / Food Journal

**User Story:** As a user, I want to add a personal note to each meal, so that I can record what I actually ate or any relevant details.

#### Acceptance Criteria

1. THE Tracker_Page SHALL display a collapsible textarea below each Meal for entering a free-text note.
2. WHEN the User types in a Meal note textarea, THE Store SHALL auto-save the note content on each `input` event without requiring an explicit save action.
3. THE note SHALL be stored as a `note` string property on the Meal object in the Store.
4. WHEN a Meal is loaded from the Store, THE Tracker_Page SHALL populate the note textarea with the stored note value.
5. IF a Meal has no note, THEN the `note` property SHALL default to an empty string `''`.

---

### Requirement 16: Weekly Calorie Average

**User Story:** As a user, I want to see my average daily calorie intake for the week on the progress page, so that I can understand my overall eating pattern.

#### Acceptance Criteria

1. THE Progress_Page SHALL display the average daily calories consumed across all Days that have at least one checked Meal.
2. THE average SHALL be calculated as: `sum of consumed calories per qualifying Day / count of Days with at least one checked Meal`.
3. WHEN no Days have any checked Meals, THE Progress_Page SHALL display `0` or a `—` placeholder for the average rather than dividing by zero.
4. THE weekly calorie average display SHALL update to reflect the current Store state each time `progress.html` is loaded.

---

### Requirement 17: Export Weekly Summary

**User Story:** As a user, I want to export or print my weekly summary, so that I can share it with a nutritionist or keep a personal record.

#### Acceptance Criteria

1. THE Progress_Page SHALL include a "Print / Export" button.
2. WHEN the "Print / Export" button is activated, THE App SHALL call `window.print()` to trigger the browser's print dialog.
3. THE App SHALL include a `@media print` stylesheet block that hides the Nav and renders a clean, text-only summary layout suitable for printing.
4. WHEN the "Print / Export" button is activated, THE App SHALL also offer to copy a plain-text summary to the clipboard using `navigator.clipboard.writeText()`.
5. IF `navigator.clipboard` is unavailable, THEN THE App SHALL silently skip the clipboard step and proceed with the print dialog only.

---

### Requirement 18: Body Weight Log

**User Story:** As a user, I want to log my body weight on the progress page and see a chart of my weight over time, so that I can track changes alongside my diet.

#### Acceptance Criteria

1. THE Progress_Page SHALL display a number input for the User to enter today's body weight in the unit matching the Profile (kg or lbs).
2. WHEN the User submits a weight entry, THE Store SHALL append a `{ date: string, weight: number }` entry to the Weight_Log array stored under `ddt_weight_log`, using today's date in `YYYY-MM-DD` format.
3. IF a Weight_Log entry already exists for today's date, THEN THE Store SHALL replace the existing entry rather than creating a duplicate.
4. THE Progress_Page SHALL render the Weight_Log as a minimal SVG line chart using only inline SVG elements and no external charting library.
5. THE Weight_Log entries SHALL be stored in chronological order (ascending by date).
6. IF the User enters a non-numeric or non-positive weight value, THEN THE Progress_Page SHALL display a validation message and SHALL NOT save the entry.

---

### Requirement 19: Download Diet Plan as PDF

**User Story:** As a user, I want to download my full 7-day diet plan as a PDF, so that I can keep an offline copy or share it with others.

#### Acceptance Criteria

1. THE Tracker_Page SHALL include a "Download Plan PDF" button.
2. WHEN the "Download Plan PDF" button is activated, THE App SHALL trigger `window.print()` with a print stylesheet that renders all 7 days of the Plan in a clean, readable layout.
3. THE print layout SHALL display, for each Day: the day name, the Daily_Goal in kcal, and a list of all Meals with their name, Meal_Type, and calorie count.
4. THE print layout SHALL hide the Nav, day tabs, checkboxes, edit/delete controls, water tracker, streak badge, and all interactive elements — showing only the plan content.
5. THE App SHALL include a `@media print` CSS block in `style.css` specifically for the diet plan print view, separate from the progress summary print view (Requirement 17).
6. WHEN the "Download Plan PDF" button is activated, THE App SHALL also offer to copy the full plan as formatted plain text to the clipboard using `navigator.clipboard.writeText()`.
7. IF `navigator.clipboard` is unavailable, THEN THE App SHALL silently skip the clipboard step and proceed with the print dialog only.
