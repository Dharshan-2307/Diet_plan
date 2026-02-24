# 7 Day Diet Tracker

A personal diet tracker for anyone looking to eat better. Tracks a personalised 7-day meal plan with calorie goals, meal check-offs, and weekly progress — all in the browser with no backend, no framework, and no build step.

## Pages

| Page | File | Purpose |
|---|---|---|
| Onboarding | `index.html` | Enter profile details; calculates daily calorie goal using the Mifflin-St Jeor equation |
| Daily Tracker | `tracker.html` | Check off meals, log water intake, view calories remaining, add meal notes |
| Weekly Progress | `progress.html` | Weekly calorie summary, average, body weight log, export/print |
| Settings | `settings.html` | Edit profile, override calorie goal, toggle dark mode |

## Features

### Current
- 7-day meal plan with per-day calorie goals
- Check off meals (Breakfast, Lunch, Snack, Dinner)
- Calorie progress bar with percentage
- localStorage persistence across page refreshes
- Mobile-friendly layout

### Planned
- Calories remaining display (goal − consumed)
- Exceeded goal warning (red bar + message)
- Dark mode toggle
- Daily motivational tip / quote
- Streak counter (consecutive days completed)
- Water intake tracker (8-glass daily counter)
- Meal notes / food journal (per-meal text note)
- Weekly calorie average
- Export weekly summary (print or copy to clipboard)
- Body weight log with simple chart

## File Structure

```
/
├── index.html        # Onboarding & calorie goal setup
├── tracker.html      # Daily meal tracking
├── progress.html     # Weekly progress & weight log
├── settings.html     # Profile & preferences
├── style.css         # Shared styles
└── app.js            # Shared utilities (localStorage helpers, nav)
```

## How to Use

Open `index.html` in any modern browser. No server or install needed.

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- localStorage for all persistence
- Google Fonts (Inter)
- CSS custom properties for theming (including dark mode)
