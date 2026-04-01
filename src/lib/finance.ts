import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { DASHBOARD_MONTHS } from "./constants";
import type { Expense, Goal, Profile } from "./types";
import { clamp, getCategoryColor, getScoreAppearance } from "./utils";

export type ExpenseFilters = {
  category?: string;
  from?: string;
  to?: string;
};

export type CategoryBreakdownItem = {
  category: string;
  amount: number;
  share: number;
  color: string;
};

export type MonthlyTrendPoint = {
  month: string;
  label: string;
  amount: number;
};

export type GoalSummaryItem = Goal & {
  progress: number;
  expectedProgress: number;
  remaining: number;
  daysLeft: number;
  isOnTrack: boolean;
  statusLabel: string;
};

export type Insight = {
  title: string;
  body: string;
  tone: "positive" | "watch" | "neutral";
};

export type WellnessFactor = {
  label: string;
  score: number;
  description: string;
};

export type WellnessSummary = {
  score: number;
  label: string;
  badgeClass: string;
  accentClass: string;
  progressClass: string;
  textClass: string;
  factors: WellnessFactor[];
  suggestions: string[];
};

export type FinanceAnalytics = {
  currency: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyBudget: number;
  monthlySpending: number;
  monthlySavings: number;
  savingsRatio: number;
  budgetUsage: number;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrend: MonthlyTrendPoint[];
  recentTransactions: Expense[];
  goalCount: number;
  goalsSaved: number;
  goalsTarget: number;
  goalProgress: number;
  onTrackGoals: number;
  activeGoals: GoalSummaryItem[];
  insights: Insight[];
  wellness: WellnessSummary;
  weeklyComparison: {
    current: number;
    previous: number;
    delta: number;
  };
};

const amountOf = (value: number | string | null | undefined) => Number(value ?? 0);

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

function sortExpenses(expenses: Expense[]) {
  return [...expenses].sort((left, right) => {
    const rightTime = new Date(right.date).getTime();
    const leftTime = new Date(left.date).getTime();

    if (rightTime === leftTime) {
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    }

    return rightTime - leftTime;
  });
}

function getWeeklyTotals(expenses: Expense[]) {
  const today = new Date();

  return Array.from({ length: 8 }, (_, index) => {
    const weekStart = startOfWeek(subWeeks(today, 7 - index), {
      weekStartsOn: 1,
    });
    const weekEnd = endOfWeek(weekStart, {
      weekStartsOn: 1,
    });

    return sum(
      expenses
        .filter((expense) =>
          isWithinInterval(parseISO(expense.date), {
            start: weekStart,
            end: weekEnd,
          }),
        )
        .map((expense) => amountOf(expense.amount)),
    );
  });
}

function getSpendingConsistencyScore(expenses: Expense[]) {
  if (!expenses.length) {
    return 50;
  }

  const weeklyTotals = getWeeklyTotals(expenses);
  const mean = sum(weeklyTotals) / weeklyTotals.length;

  if (mean === 0) {
    return 100;
  }

  const variance =
    sum(weeklyTotals.map((value) => (value - mean) ** 2)) / weeklyTotals.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;

  return Math.round(clamp(100 - coefficientOfVariation * 110, 20, 100));
}

function getSavingsRatioScore(
  monthlyIncome: number,
  monthlyBudget: number,
  monthlySpending: number,
) {
  if (monthlyIncome <= 0) {
    return monthlySpending > 0 ? 45 : 55;
  }

  const savingsRatio = clamp((monthlyIncome - monthlySpending) / monthlyIncome, 0, 1);
  const baseScore = clamp((savingsRatio / 0.3) * 100, 0, 100);

  if (monthlyBudget > 0 && monthlySpending <= monthlyBudget) {
    return Math.round(clamp(baseScore + 8, 0, 100));
  }

  return Math.round(baseScore);
}

function getGoalSummary(goals: Goal[]) {
  const today = new Date();

  return goals.map<GoalSummaryItem>((goal) => {
    const targetAmount = amountOf(goal.target_amount);
    const currentAmount = amountOf(goal.current_amount);
    const progress = targetAmount > 0 ? clamp(currentAmount / targetAmount, 0, 1) : 0;
    const createdAt = parseISO(goal.created_at);
    const deadline = parseISO(goal.deadline);
    const totalWindow = Math.max(1, differenceInCalendarDays(deadline, createdAt));
    const elapsedWindow = clamp(
      differenceInCalendarDays(today, createdAt),
      0,
      totalWindow,
    );
    const expectedProgress = clamp(elapsedWindow / totalWindow, 0, 1);
    const daysLeft = differenceInCalendarDays(deadline, today);
    const isOnTrack = progress >= 1 || progress + 0.08 >= expectedProgress;

    let statusLabel = "Building";

    if (progress >= 1) {
      statusLabel = "Completed";
    } else if (daysLeft < 0) {
      statusLabel = "Past deadline";
    } else if (isOnTrack) {
      statusLabel = "On track";
    } else if (daysLeft <= 21) {
      statusLabel = "Needs attention";
    }

    return {
      ...goal,
      progress,
      expectedProgress,
      remaining: Math.max(targetAmount - currentAmount, 0),
      daysLeft,
      isOnTrack,
      statusLabel,
    };
  });
}

function getGoalProgressScore(goalSummary: GoalSummaryItem[]) {
  if (!goalSummary.length) {
    return 55;
  }

  const average =
    sum(
      goalSummary.map((goal) => {
        const completionScore = goal.progress * 70;
        const paceScore = goal.isOnTrack
          ? 30
          : clamp((goal.progress / Math.max(goal.expectedProgress, 0.1)) * 30, 8, 30);

        return completionScore + paceScore;
      }),
    ) / goalSummary.length;

  return Math.round(clamp(average, 0, 100));
}

function getWellnessSuggestions(
  spendingConsistency: number,
  savingsScore: number,
  goalScore: number,
  goalSummary: GoalSummaryItem[],
) {
  const suggestions: string[] = [];

  if (spendingConsistency < 65) {
    suggestions.push("Set a simple weekly cap for the category that swings the most.");
  }

  if (savingsScore < 60) {
    suggestions.push("Leave your savings amount aside earlier in the month before optional spending.");
  }

  const laggingGoal = goalSummary.find((goal) => !goal.isOnTrack && goal.progress < 1);
  if (goalScore < 65 && laggingGoal) {
    suggestions.push(`Increase contributions to ${laggingGoal.name} to get it back on pace.`);
  }

  if (!suggestions.length) {
    suggestions.push("Keep the current rhythm going and continue logging expenses every few days.");
  }

  return suggestions;
}

function getInsights(
  monthlyIncome: number,
  monthlySpending: number,
  savingsRatio: number,
  spendingConsistency: number,
  goalSummary: GoalSummaryItem[],
  expenses: Expense[],
) {
  const insights: Insight[] = [];
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const previousWeekStart = subWeeks(currentWeekStart, 1);
  const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });

  const currentWeekExpenses = expenses.filter((expense) =>
    isWithinInterval(parseISO(expense.date), {
      start: currentWeekStart,
      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    }),
  );
  const previousWeekExpenses = expenses.filter((expense) =>
    isWithinInterval(parseISO(expense.date), {
      start: previousWeekStart,
      end: previousWeekEnd,
    }),
  );

  const categorySet = new Set(
    [...currentWeekExpenses, ...previousWeekExpenses].map((expense) => expense.category),
  );

  let strongestCategoryDelta:
    | { category: string; delta: number; current: number; previous: number }
    | undefined;

  categorySet.forEach((category) => {
    const current = sum(
      currentWeekExpenses
        .filter((expense) => expense.category === category)
        .map((expense) => amountOf(expense.amount)),
    );
    const previous = sum(
      previousWeekExpenses
        .filter((expense) => expense.category === category)
        .map((expense) => amountOf(expense.amount)),
    );

    if (previous <= 0) {
      return;
    }

    const delta = (current - previous) / previous;

    if (!strongestCategoryDelta || Math.abs(delta) > Math.abs(strongestCategoryDelta.delta)) {
      strongestCategoryDelta = { category, delta, current, previous };
    }
  });

  if (strongestCategoryDelta && Math.abs(strongestCategoryDelta.delta) >= 0.12) {
    const increase = strongestCategoryDelta.delta > 0;
    insights.push({
      title: increase
        ? `${strongestCategoryDelta.category} is trending up`
        : `${strongestCategoryDelta.category} spend eased off`,
      body: increase
        ? `You spent ${Math.round(
            strongestCategoryDelta.delta * 100,
          )}% more on ${strongestCategoryDelta.category.toLowerCase()} this week than last week.`
        : `You spent ${Math.round(
            Math.abs(strongestCategoryDelta.delta) * 100,
          )}% less on ${strongestCategoryDelta.category.toLowerCase()} this week than last week.`,
      tone: increase ? "watch" : "positive",
    });
  }

  if (monthlyIncome > 0) {
    insights.push({
      title:
        savingsRatio >= 0.2 ? "Savings are holding up well" : "Savings room is getting tight",
      body:
        savingsRatio >= 0.2
          ? `You still have ${Math.round(
              savingsRatio * 100,
            )}% of this month’s income available for saving.`
          : `Only ${Math.round(
              savingsRatio * 100,
            )}% of this month’s income is still available for saving.`,
      tone: savingsRatio >= 0.2 ? "positive" : "watch",
    });
  } else if (monthlySpending > 0) {
    insights.push({
      title: "Income is not set yet",
      body: "Add your monthly income in profile to unlock sharper savings insights.",
      tone: "neutral",
    });
  }

  const completedGoals = goalSummary.filter((goal) => goal.progress >= 1).length;
  const laggingGoals = goalSummary.filter((goal) => !goal.isOnTrack && goal.progress < 1);

  if (goalSummary.length) {
    insights.push({
      title:
        laggingGoals.length === 0
          ? "Goals are moving in the right direction"
          : "One of your goals needs a push",
      body:
        laggingGoals.length === 0
          ? completedGoals > 0
            ? `You already completed ${completedGoals} savings goal${completedGoals > 1 ? "s" : ""}.`
            : "Your current savings goals are on pace based on their deadlines."
          : `${laggingGoals[0]?.name} is behind pace for its deadline. A small contribution this week would help.`,
      tone: laggingGoals.length === 0 ? "positive" : "watch",
    });
  }

  insights.push({
    title:
      spendingConsistency >= 75
        ? "Spending is staying steady"
        : "Spending is a little uneven",
    body:
      spendingConsistency >= 75
        ? "Your weekly spending pattern has been steady, which makes planning easier."
        : "Your week-to-week spending changed a lot recently. A simple weekly cap can smooth that out.",
    tone: spendingConsistency >= 75 ? "positive" : "neutral",
  });

  return insights.slice(0, 4);
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters) {
  return sortExpenses(expenses).filter((expense) => {
    const expenseDate = expense.date;

    if (filters.category && filters.category !== "All" && expense.category !== filters.category) {
      return false;
    }

    if (filters.from && expenseDate < filters.from) {
      return false;
    }

    if (filters.to && expenseDate > filters.to) {
      return false;
    }

    return true;
  });
}

export function buildFinanceAnalytics(
  profile: Profile | null,
  expenses: Expense[],
  goals: Goal[],
): FinanceAnalytics {
  const today = new Date();
  const currency = profile?.currency ?? "USD";
  const totalBalance = amountOf(profile?.current_balance);
  const monthlyIncome = amountOf(profile?.monthly_income);
  const monthlyBudget = amountOf(profile?.monthly_budget);
  const sortedExpenses = sortExpenses(expenses);
  const currentMonthExpenses = sortedExpenses.filter((expense) =>
    isSameMonth(parseISO(expense.date), today),
  );
  const monthlySpending = sum(currentMonthExpenses.map((expense) => amountOf(expense.amount)));
  const monthlySavings =
    monthlyIncome > 0 ? Math.max(monthlyIncome - monthlySpending, 0) : 0;
  const savingsRatio =
    monthlyIncome > 0 ? clamp(monthlySavings / monthlyIncome, 0, 1) : 0;
  const budgetUsage =
    monthlyBudget > 0 ? clamp(monthlySpending / monthlyBudget, 0, 2) : 0;

  const categoryTotals = currentMonthExpenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.category] =
      (accumulator[expense.category] ?? 0) + amountOf(expense.amount);

    return accumulator;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      share: monthlySpending > 0 ? amount / monthlySpending : 0,
      color: getCategoryColor(category),
    }))
    .sort((left, right) => right.amount - left.amount);

  const monthlyTrend = Array.from({ length: DASHBOARD_MONTHS }, (_, index) => {
    const monthStart = startOfMonth(new Date(today.getFullYear(), today.getMonth() - (DASHBOARD_MONTHS - 1 - index), 1));
    const monthEnd = endOfMonth(monthStart);

    return {
      month: format(monthStart, "yyyy-MM"),
      label: format(monthStart, "MMM"),
      amount: sum(
        sortedExpenses
          .filter((expense) =>
            isWithinInterval(parseISO(expense.date), {
              start: monthStart,
              end: monthEnd,
            }),
          )
          .map((expense) => amountOf(expense.amount)),
      ),
    };
  });

  const goalSummary = getGoalSummary(goals).sort(
    (left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime(),
  );
  const goalsSaved = sum(goalSummary.map((goal) => amountOf(goal.current_amount)));
  const goalsTarget = sum(goalSummary.map((goal) => amountOf(goal.target_amount)));
  const goalProgress = goalsTarget > 0 ? clamp(goalsSaved / goalsTarget, 0, 1) : 0;
  const onTrackGoals = goalSummary.filter((goal) => goal.isOnTrack || goal.progress >= 1).length;

  const spendingConsistency = getSpendingConsistencyScore(sortedExpenses);
  const savingsScore = getSavingsRatioScore(monthlyIncome, monthlyBudget, monthlySpending);
  const goalScore = getGoalProgressScore(goalSummary);
  const score = Math.round(
    clamp(spendingConsistency * 0.34 + savingsScore * 0.36 + goalScore * 0.3, 0, 100),
  );
  const appearance = getScoreAppearance(score);

  const currentWeekTotal = sum(
    sortedExpenses
      .filter((expense) =>
        isWithinInterval(parseISO(expense.date), {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        }),
      )
      .map((expense) => amountOf(expense.amount)),
  );
  const previousWeekTotal = sum(
    sortedExpenses
      .filter((expense) =>
        isWithinInterval(parseISO(expense.date), {
          start: startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }),
          end: endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }),
        }),
      )
      .map((expense) => amountOf(expense.amount)),
  );

  return {
    currency,
    totalBalance,
    monthlyIncome,
    monthlyBudget,
    monthlySpending,
    monthlySavings,
    savingsRatio,
    budgetUsage,
    categoryBreakdown,
    monthlyTrend,
    recentTransactions: sortedExpenses.slice(0, 8),
    goalCount: goalSummary.length,
    goalsSaved,
    goalsTarget,
    goalProgress,
    onTrackGoals,
    activeGoals: goalSummary,
    insights: getInsights(
      monthlyIncome,
      monthlySpending,
      savingsRatio,
      spendingConsistency,
      goalSummary,
      sortedExpenses,
    ),
    wellness: {
      score,
      ...appearance,
      factors: [
        {
          label: "Spending consistency",
          score: spendingConsistency,
          description: "How stable your week-to-week spending is.",
        },
        {
          label: "Savings ratio",
          score: savingsScore,
          description: "How much room your current month leaves for saving.",
        },
        {
          label: "Goal progress",
          score: goalScore,
          description: "How close your savings goals are to their pace and target.",
        },
      ],
      suggestions: getWellnessSuggestions(
        spendingConsistency,
        savingsScore,
        goalScore,
        goalSummary,
      ),
    },
    weeklyComparison: {
      current: currentWeekTotal,
      previous: previousWeekTotal,
      delta:
        previousWeekTotal > 0
          ? (currentWeekTotal - previousWeekTotal) / previousWeekTotal
          : currentWeekTotal > 0
            ? 1
            : 0,
    },
  };
}
