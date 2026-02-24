/**
 * js/utils.js — Shared utilities for Nutrify
 */

const utils = {

  // ── Unit Converters ───────────────────────────────────────

  /** Convert pounds to kilograms */
  toKg(lbs) {
    return lbs * 0.453592;
  },

  /** Convert feet + inches to centimetres */
  toCm(feet, inches) {
    return (feet * 12 + inches) * 2.54;
  },

  // ── Calorie Goal (Mifflin-St Jeor) ───────────────────────

  /**
   * Compute daily calorie goal from profile.
   * Formula: BMR × activityMultiplier ± goalAdjustment, rounded to nearest int.
   */
  computeGoal(profile) {
    const { sex, weightKg, heightCm, age, activityLevel, goal } = profile;

    // BMR
    const bmr = sex === 'male'
      ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
      : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;

    // Activity multiplier
    const multipliers = {
      sedentary:          1.2,
      lightly_active:     1.375,
      moderately_active:  1.55,
      very_active:        1.725,
    };
    const maintenance = bmr * (multipliers[activityLevel] || 1.2);

    // Goal adjustment
    const adjustments = {
      lose_weight:  -500,
      maintain:        0,
      gain_muscle:  +300,
    };
    const adjustment = adjustments[goal] ?? 0;

    return Math.round(maintenance + adjustment);
  },

  // ── Progress Ratio ────────────────────────────────────────

  /**
   * Returns consumed/goal ratio (0–∞). Caller clamps for display.
   * Returns 0 if goal is 0 or negative to avoid division by zero.
   */
  progressRatio(consumed, goal) {
    if (!goal || goal <= 0) return 0;
    return consumed / goal;
  },

  // ── Date Key ─────────────────────────────────────────────

  /** Returns today's date as 'YYYY-MM-DD' */
  todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  // ── Motivational Tips ─────────────────────────────────────

  /**
   * Returns a motivational tip for the given day index.
   * 14-entry array; selection: tips[dayIndex % 14]
   */
  getTip(dayIndex) {
    const tips = [
      'Start your day with a glass of water before breakfast.',
      'Chew slowly — it takes 20 minutes for your brain to register fullness.',
      'Prep your meals the night before to avoid impulsive choices.',
      'A handful of nuts is a great high-protein snack between meals.',
      'Swap white rice for brown rice or millets for extra fibre.',
      'Dal and sabzi together make a complete protein — great combo!',
      'Avoid eating in front of screens; mindful eating helps portion control.',
      'Curd (dahi) is a probiotic powerhouse — include it daily.',
      'Staying hydrated reduces false hunger signals throughout the day.',
      'Idli and sambar is one of the most balanced South Indian breakfasts.',
      'Eat your largest meal at lunch when digestion is strongest.',
      'A short 10-minute walk after dinner aids digestion significantly.',
      'Sprouts are cheap, easy to make, and packed with micronutrients.',
      'Consistency beats perfection — one off-day won\'t break your progress.',
    ];
    return tips[((dayIndex % tips.length) + tips.length) % tips.length];
  },

  // ── Default Meal Suggestions ──────────────────────────────

  /**
   * Returns a 7-element array of Meal[] based on dietaryPreference.
   * Each day has 4 meals: Breakfast, Lunch, Snack, Dinner.
   * Calories are scaled proportionally to the computed daily goal.
   */
  defaultMeals(profile) {
    const goal = this.computeGoal(profile);
    const pref = profile.dietaryPreference || 'none';

    // Base calorie splits (% of daily goal): B=25%, L=35%, S=10%, D=30%
    const splits = { Breakfast: 0.25, Lunch: 0.35, Snack: 0.10, Dinner: 0.30 };

    // Meal templates per dietary preference
    const templates = {
      none: [
        { Breakfast: 'Poha with peanuts',        Lunch: 'Chicken curry with rice',    Snack: 'Boiled egg',          Dinner: 'Roti with dal makhani' },
        { Breakfast: 'Idli with sambar',          Lunch: 'Egg fried rice',             Snack: 'Banana',              Dinner: 'Grilled chicken with salad' },
        { Breakfast: 'Paratha with curd',         Lunch: 'Fish curry with rice',       Snack: 'Mixed nuts',          Dinner: 'Dal tadka with roti' },
        { Breakfast: 'Upma with chutney',         Lunch: 'Mutton keema with roti',     Snack: 'Apple',               Dinner: 'Paneer bhurji with roti' },
        { Breakfast: 'Oats with milk',            Lunch: 'Chicken biryani',            Snack: 'Sprouts chaat',       Dinner: 'Vegetable soup with bread' },
        { Breakfast: 'Dosa with sambar',          Lunch: 'Prawn masala with rice',     Snack: 'Roasted chana',       Dinner: 'Egg curry with roti' },
        { Breakfast: 'Bread omelette',            Lunch: 'Rajma chawal',               Snack: 'Curd with fruit',     Dinner: 'Grilled fish with salad' },
      ],
      vegetarian: [
        { Breakfast: 'Poha with peanuts',         Lunch: 'Paneer curry with rice',     Snack: 'Banana',              Dinner: 'Dal tadka with roti' },
        { Breakfast: 'Idli with sambar',          Lunch: 'Rajma chawal',               Snack: 'Mixed nuts',          Dinner: 'Palak paneer with roti' },
        { Breakfast: 'Paratha with curd',         Lunch: 'Chole with bhature',         Snack: 'Apple',               Dinner: 'Vegetable khichdi' },
        { Breakfast: 'Upma with chutney',         Lunch: 'Vegetable biryani',          Snack: 'Sprouts chaat',       Dinner: 'Paneer bhurji with roti' },
        { Breakfast: 'Oats with milk',            Lunch: 'Dal makhani with rice',      Snack: 'Roasted chana',       Dinner: 'Aloo gobi with roti' },
        { Breakfast: 'Dosa with sambar',          Lunch: 'Kadhi chawal',               Snack: 'Curd with fruit',     Dinner: 'Methi thepla with curd' },
        { Breakfast: 'Bread with peanut butter',  Lunch: 'Matar paneer with roti',     Snack: 'Fruit salad',         Dinner: 'Vegetable soup with bread' },
      ],
      vegan: [
        { Breakfast: 'Poha with peanuts',         Lunch: 'Chana masala with rice',     Snack: 'Banana',              Dinner: 'Dal tadka with roti' },
        { Breakfast: 'Idli with sambar',          Lunch: 'Rajma chawal',               Snack: 'Mixed nuts',          Dinner: 'Aloo palak with roti' },
        { Breakfast: 'Upma with chutney',         Lunch: 'Vegetable biryani',          Snack: 'Apple',               Dinner: 'Vegetable khichdi' },
        { Breakfast: 'Oats with plant milk',      Lunch: 'Chole with rice',            Snack: 'Sprouts chaat',       Dinner: 'Tofu stir fry with roti' },
        { Breakfast: 'Fruit smoothie',            Lunch: 'Dal makhani (vegan) + rice', Snack: 'Roasted chana',       Dinner: 'Aloo gobi with roti' },
        { Breakfast: 'Dosa with sambar',          Lunch: 'Kadhi (vegan) with rice',    Snack: 'Fruit salad',         Dinner: 'Methi thepla with hummus' },
        { Breakfast: 'Bread with peanut butter',  Lunch: 'Matar mushroom with roti',   Snack: 'Coconut water',       Dinner: 'Vegetable soup with bread' },
      ],
    };

    const dayTemplates = templates[pref] || templates.none;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return dayTemplates.map((dayMeals, dayIndex) => {
      const types = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
      return types.map(type => ({
        id: `default-${dayIndex}-${type.toLowerCase()}`,
        name: dayMeals[type],
        type,
        calories: Math.round(goal * splits[type]),
        completed: false,
        note: '',
      }));
    });
  },

  // ── Weight Chart SVG ──────────────────────────────────────

  /**
   * Returns an inline SVG string for the weight log line chart.
   * entries: Array<{ date: string, weight: number }> sorted chronologically.
   * Returns an empty SVG placeholder if fewer than 2 entries.
   */
  formatWeightChartSVG(entries, width = 300, height = 150) {
    if (!entries || entries.length < 2) {
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#9E9E9E" font-size="14">Not enough data</text>
      </svg>`;
    }

    const pad = { top: 16, right: 16, bottom: 32, left: 40 };
    const chartW = width  - pad.left - pad.right;
    const chartH = height - pad.top  - pad.bottom;

    const weights = entries.map(e => e.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1; // avoid div/0 when all weights equal

    const toX = i => pad.left + (i / (entries.length - 1)) * chartW;
    const toY = w => pad.top  + chartH - ((w - minW) / range) * chartH;

    // Build polyline points
    const points = entries.map((e, i) => `${toX(i).toFixed(1)},${toY(e.weight).toFixed(1)}`).join(' ');

    // X-axis labels (first, middle, last)
    const labelIndices = [0, Math.floor((entries.length - 1) / 2), entries.length - 1];
    const xLabels = labelIndices.map(i => {
      const x = toX(i).toFixed(1);
      const label = entries[i].date.slice(5); // MM-DD
      return `<text x="${x}" y="${height - 4}" text-anchor="middle" font-size="10" fill="var(--color-text-muted)">${label}</text>`;
    }).join('');

    // Y-axis labels (min, max)
    const yLabels = [
      `<text x="${pad.left - 4}" y="${(toY(minW) + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--color-text-muted)">${minW}</text>`,
      `<text x="${pad.left - 4}" y="${(toY(maxW) + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--color-text-muted)">${maxW}</text>`,
    ].join('');

    // Dot markers
    const dots = entries.map((e, i) =>
      `<circle cx="${toX(i).toFixed(1)}" cy="${toY(e.weight).toFixed(1)}" r="3" fill="var(--color-primary)"/>`
    ).join('');

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <polyline points="${points}" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  ${dots}
  ${xLabels}
  ${yLabels}
</svg>`;
  },

  // ── Plan Plain-Text Export ────────────────────────────────

  /**
   * Serialises the full 7-day Plan to formatted plain text for clipboard/print.
   * goalOverride (optional number) overrides the per-day goal label.
   */
  planToText(plan, goalOverride) {
    if (!plan || !plan.days) return '';

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const lines = ['Nutrify — 7-Day Diet Plan', '═'.repeat(40), ''];

    plan.days.forEach((day, i) => {
      const dayGoal = goalOverride || day.dailyGoal || '—';
      lines.push(`${dayNames[i] || `Day ${i + 1}`}  (Goal: ${dayGoal} kcal)`);
      lines.push('─'.repeat(36));

      if (!day.meals || day.meals.length === 0) {
        lines.push('  (no meals)');
      } else {
        day.meals.forEach(meal => {
          lines.push(`  • [${meal.type}] ${meal.name} — ${meal.calories} kcal`);
        });
      }
      lines.push('');
    });

    return lines.join('\n');
  },
};
