# Feature Research Report — Nutrify

## Overview

This report documents features researched from five popular diet and nutrition tracking apps — **MyFitnessPal**, **Cronometer**, **Lifesum**, **Lose It!**, and **Nutrilio** — and evaluates their fit for the redesigned Nutrify. The target user is anyone tracking personal health goals with a focus on Indian/South Asian meals and a personalised weekly meal plan. The app is a no-backend, no-framework, vanilla HTML/CSS/JS project, so implementation complexity is assessed accordingly.

---

## Features Researched from Popular Apps

| Feature | Found In |
|---|---|
| Water intake tracker | MyFitnessPal, Lifesum, Lose It!, Nutrilio |
| Streak counter | MyFitnessPal, Lifesum, Noom |
| Macro tracking (protein/carbs/fat) | MyFitnessPal, Cronometer, Lose It! |
| Meal notes / food journal | MyFitnessPal, Cronometer, Nutrilio |
| Daily motivational tip / quote | Lifesum, Noom |
| Body weight log | MyFitnessPal, Cronometer, Lifesum, Lose It! |
| Calories remaining display | MyFitnessPal, Lifesum, Lose It! |
| Exceeded goal warning | MyFitnessPal, Cronometer, Lose It! |
| Weekly calorie average | MyFitnessPal, Cronometer, Lose It! |
| Dark mode toggle | MyFitnessPal, Cronometer, Lifesum |
| Export / print weekly summary | MyFitnessPal, Cronometer |
| Intermittent fasting timer | MyFitnessPal (premium), Lifesum, Zero (standalone) |
| Habit tracker | Noom, Nutrilio |
| Quick-log / favourites | MyFitnessPal, Lose It!, Nutrilio |

---

## Feature Fit Analysis for Personal Use

### 1. Water Intake Tracker (daily glasses counter)

- **Source apps:** MyFitnessPal, Lifesum, Lose It!, Nutrilio
- **What it does:** Lets the user tap to log each glass of water consumed, showing progress toward a daily target (typically 8 glasses).
- **Fit:** ✅ Great fit
- **Reasoning:** Staying hydrated is already called out in the app's general advice section. A simple tap-to-increment counter is a natural, low-friction addition that reinforces a healthy habit the user already cares about.
- **Implementation complexity:** Low — a counter stored in localStorage, reset daily.

---

### 2. Streak Counter (consecutive days completed)

- **Source apps:** MyFitnessPal, Lifesum, Noom
- **What it does:** Tracks how many consecutive days the user has completed their full meal plan and displays a running streak count.
- **Fit:** ✅ Great fit
- **Reasoning:** Streaks are a proven motivational mechanic for habit formation. For anyone trying to stay consistent across a busy week, seeing a streak grow is a lightweight but effective nudge.
- **Implementation complexity:** Low — compare today's date against a stored last-completed date in localStorage.

---

### 3. Macro Tracking (protein / carbs / fat per meal)

- **Source apps:** MyFitnessPal, Cronometer, Lose It!
- **What it does:** Displays grams of protein, carbohydrates, and fat alongside calorie counts for each meal and as a daily total.
- **Fit:** ⚠️ Partial fit
- **Reasoning:** Macro data would be genuinely useful for a fitness-focused student, but it requires manually entering macro values for every meal in the hardcoded plan — a significant data-entry burden. Worth adding only if the user is willing to populate the data; otherwise it adds complexity without payoff.
- **Implementation complexity:** Medium — data model change needed; UI additions are straightforward.

---

### 4. Meal Notes / Food Journal (text note per meal)

- **Source apps:** MyFitnessPal, Cronometer, Nutrilio
- **What it does:** Allows the user to attach a short free-text note to any meal or to the day as a whole (e.g. "felt full", "skipped snack", "ate out instead").
- **Fit:** ✅ Great fit
- **Reasoning:** The current app already has a notes concept for specific meal days. Extending this to a user-editable note per meal supports the inline-editing goal of the redesign and adds a personal journaling layer with zero backend needed.
- **Implementation complexity:** Low — a textarea per meal, saved to localStorage.

---

### 5. Daily Motivational Tip / Quote

- **Source apps:** Lifesum, Noom
- **What it does:** Shows a short tip or motivational quote at the top of the daily view, either static or rotating from a curated list.
- **Fit:** ✅ Great fit
- **Reasoning:** A small, friendly nudge at the top of the tracker page costs nothing to implement and adds personality to an otherwise functional UI. A hardcoded array of 7–14 tips (one per day or rotated randomly) is perfectly sufficient.
- **Implementation complexity:** Low — a static array of strings, pick by day index or random.

---

### 6. Body Weight Log (track weight over time with a simple chart)

- **Source apps:** MyFitnessPal, Cronometer, Lifesum, Lose It!
- **What it does:** Lets the user log their body weight each day and displays a line chart of weight over time.
- **Fit:** ✅ Great fit
- **Reasoning:** Anyone tracking diet for health/fitness goals will naturally want to see if their eating habits are moving the needle on weight. A simple log with a canvas-based or SVG line chart fits the no-framework constraint and lives naturally on the progress page.
- **Implementation complexity:** Medium — data storage is easy; a minimal SVG/canvas chart is moderate effort but doable without libraries.

---

### 7. Calories Remaining Display (goal − consumed, shown prominently)

- **Source apps:** MyFitnessPal, Lifesum, Lose It!
- **What it does:** Shows a live "X kcal remaining" figure that counts down as meals are checked off, turning red when the budget is exceeded.
- **Fit:** ✅ Great fit
- **Reasoning:** The current app shows calories consumed but not remaining. Flipping the framing to "remaining" is more actionable — the user immediately knows how much room they have left in the day without doing mental arithmetic.
- **Implementation complexity:** Low — a single subtraction added to the existing progress calculation.

---

### 8. Exceeded Goal Warning (color change + message when over daily limit)

- **Source apps:** MyFitnessPal, Cronometer, Lose It!
- **What it does:** Changes the progress bar or calorie display to red/orange and shows a warning message when the user logs more calories than their daily goal.
- **Fit:** ✅ Great fit
- **Reasoning:** The current app caps the progress bar at 100% and gives no feedback when the goal is exceeded. A visual warning is a simple, high-value safety net that prevents the user from unknowingly going over budget.
- **Implementation complexity:** Low — a CSS class swap and a conditional message, already partially scaffolded in the existing code.

---

### 9. Weekly Calorie Average (avg kcal/day over the week)

- **Source apps:** MyFitnessPal, Cronometer, Lose It!
- **What it does:** Calculates and displays the average daily calorie intake across all days in the current week.
- **Fit:** ✅ Great fit
- **Reasoning:** The progress page is the natural home for this. A single average figure gives the user a quick weekly health check without needing to interpret a full chart, and it's trivially computed from data already in localStorage.
- **Implementation complexity:** Low — sum checked calories across all 7 days, divide by days with data.

---

### 10. Dark Mode Toggle

- **Source apps:** MyFitnessPal, Cronometer, Lifesum
- **What it does:** Switches the app between a light and dark colour scheme, with the preference saved across sessions.
- **Fit:** ✅ Great fit
- **Reasoning:** Users often use their phones late at night for meal planning or logging. Dark mode reduces eye strain and is a widely expected feature in any modern app. The existing CSS custom properties architecture makes this trivial to implement.
- **Implementation complexity:** Low — toggle a `data-theme` attribute on `<body>`, override CSS variables, save to localStorage.

---

### 11. Export Weekly Summary (copy to clipboard or print)

- **Source apps:** MyFitnessPal, Cronometer
- **What it does:** Generates a plain-text or printable summary of the week's meals and calorie totals, either copied to clipboard or sent to the browser's print dialog.
- **Fit:** ✅ Great fit
- **Reasoning:** A user might want to share their weekly plan with a nutritionist, a gym trainer, or just keep a personal record. `window.print()` with a print stylesheet, or `navigator.clipboard.writeText()`, requires no backend and is a one-function implementation.
- **Implementation complexity:** Low — `window.print()` with a `@media print` stylesheet, or a text serialiser + clipboard API.

---

### 12. Intermittent Fasting Timer

- **Source apps:** MyFitnessPal (premium), Lifesum, Zero
- **What it does:** Tracks a fasting window (e.g. 16:8) with a live countdown timer showing time remaining in the fast or eating window.
- **Fit:** ❌ Not relevant
- **Reasoning:** The current meal plan has structured breakfast, lunch, snack, and dinner entries — it is not designed around fasting windows. Adding a fasting timer would conflict with the existing plan structure and adds complexity with no clear benefit for this user's stated goals.
- **Implementation complexity:** Medium — timer logic is straightforward, but integrating it meaningfully with the meal plan is non-trivial.

---

### 13. Habit Tracker (custom daily habits)

- **Source apps:** Noom, Nutrilio
- **What it does:** Lets the user define custom daily habits (e.g. "8 glasses of water", "no sugar", "30 min walk") and check them off each day.
- **Fit:** ⚠️ Partial fit
- **Reasoning:** A general habit tracker is a separate product concern and would bloat the app's scope. However, the water intake tracker (feature #1) covers the most relevant habit for this user. A stripped-down version with 2–3 fixed habits (water, no sugar, exercise) could work as a lightweight addition to the tracker page.
- **Implementation complexity:** Medium — flexible habit definition requires a settings UI; fixed habits are Low complexity.

---

### 14. University Lunch Quick-Log Button (one-tap to log ~615 kcal campus lunch)

- **Source apps:** MyFitnessPal (favourites), Lose It! (quick add), Nutrilio
- **What it does:** A single button on weekday tracker views that instantly logs the standard university campus lunch (~615 kcal) without the user needing to check individual items.
- **Fit:** ✅ Great fit
- **Reasoning:** The user has a recurring, fixed-calorie university lunch on weekdays. A quick-log button eliminates friction for the most predictable meal of the week and is a personalisation that no generic app offers. It directly addresses a real pattern in this user's life.
- **Implementation complexity:** Low — detect weekday, render a special button that checks the lunch meal and sets its calorie value.

---

## Recommended Features to Add

These are the ✅ Great fit features, ordered by implementation priority (easiest and highest impact first).

| # | Feature | Implementation Notes |
|---|---|---|
| 1 | Calories remaining display | Subtract consumed from goal in the existing `update()` function; show prominently above the progress bar. |
| 2 | Exceeded goal warning | Add a CSS class (e.g. `.over-budget`) to the progress card when consumed > goal; change bar to red, show a warning message. |
| 3 | Dark mode toggle | Add a sun/moon icon button in the nav; toggle `data-theme="dark"` on `<body>`; define dark CSS variables; persist in localStorage. |
| 4 | University lunch quick-log button | On Mon–Fri views, render a "🏫 Log Campus Lunch" button that auto-checks the lunch meal. |
| 5 | Daily motivational tip / quote | Hardcode an array of 14 tips; display `tips[dayIndex % tips.length]` at the top of the tracker page. |
| 6 | Streak counter | On day completion, compare date to `lastCompleted` in localStorage; increment or reset streak; display in the header. |
| 7 | Water intake tracker | Render 8 tap-to-fill water drop icons on the tracker page; store count in localStorage keyed by date. |
| 8 | Meal notes / food journal | Add a collapsible `<textarea>` below each meal section; auto-save on `input` event to localStorage. |
| 9 | Weekly calorie average | On `progress.html`, sum all checked calories across 7 days and divide by the number of days that have any data. |
| 10 | Export weekly summary | Add a "Print / Copy" button on `progress.html`; use `window.print()` with a print stylesheet, or serialise to text and call `navigator.clipboard.writeText()`. |
| 11 | Body weight log | Add a number input on `progress.html` to log today's weight; store an array of `{date, weight}` in localStorage; render a minimal SVG line chart. |

---

## Features to Skip

| Feature | Reason |
|---|---|
| **Intermittent fasting timer** | Conflicts with the structured 4-meal-per-day plan. The app is not designed around fasting windows, and adding a timer would create UX confusion without serving the user's actual goals. |
| **Full macro tracking** | Requires populating protein/carbs/fat data for every meal in the plan — a significant manual effort. The app's value is in simplicity; macro tracking is better suited to a database-backed app like Cronometer. Can be revisited if the user decides to invest in the data entry. |
| **General habit tracker** | Too broad in scope for a focused nutrition tracker. The water intake tracker (a specific, relevant habit) covers the most useful slice of this feature. A full custom habit system would expand the app's surface area without clear benefit for this user. |
