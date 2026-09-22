import { GoalType } from "@/generated/prisma/client";

export type DashboardGoal = {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
};

export type GoalAnalysis = DashboardGoal & {
  progress: number;
  remaining: number;
  annualReturn: number;
  icon: string;
  description: string;
  badgeClass: string;
  cardClass: string;
  barClass: string;
  projectedValuePer1000: number;
  growthProfitPer1000: number;
  extraBenefitPer1000: number;
  score: number;
};

const GOAL_META: Record<
  GoalType,
  {
    annualReturn: number;
    extraBenefitPer1000: number;
    icon: string;
    description: string;
    badgeClass: string;
    cardClass: string;
    barClass: string;
  }
> = {
  IKE: {
    annualReturn: 0.07,
    extraBenefitPer1000: 180,
    icon: "🛡️",
    description:
      "Symulacja uwzględnia potencjał inwestycyjny i przewagę podatkową IKE.",
    badgeClass:
      "bg-emerald-100 text-emerald-700 border border-emerald-200",
    cardClass:
      "border-emerald-200 bg-emerald-50",
    barClass: "bg-emerald-500",
  },
  IKZE: {
    annualReturn: 0.07,
    extraBenefitPer1000: 120,
    icon: "📉",
    description:
      "Symulacja uwzględnia potencjał inwestycyjny i uproszczoną korzyść podatkową IKZE.",
    badgeClass:
      "bg-lime-100 text-lime-700 border border-lime-200",
    cardClass:
      "border-lime-200 bg-lime-50",
    barClass: "bg-lime-500",
  },
  INVESTMENTS: {
    annualReturn: 0.08,
    extraBenefitPer1000: 0,
    icon: "📈",
    description:
      "Najwyższy potencjał wzrostu, ale bez dodatkowej osłony podatkowej.",
    badgeClass:
      "bg-sky-100 text-sky-700 border border-sky-200",
    cardClass:
      "border-sky-200 bg-sky-50",
    barClass: "bg-sky-500",
  },
  SAVINGS: {
    annualReturn: 0.04,
    extraBenefitPer1000: 0,
    icon: "💰",
    description:
      "Niższy potencjał wzrostu, za to duża prostota i płynność.",
    badgeClass:
      "bg-amber-100 text-amber-700 border border-amber-200",
    cardClass:
      "border-amber-200 bg-amber-50",
    barClass: "bg-amber-500",
  },
  EMERGENCY: {
    annualReturn: 0.03,
    extraBenefitPer1000: 0,
    icon: "🧯",
    description:
      "Najważniejsze tu jest bezpieczeństwo, a nie maksymalny zysk.",
    badgeClass:
      "bg-orange-100 text-orange-700 border border-orange-200",
    cardClass:
      "border-orange-200 bg-orange-50",
    barClass: "bg-orange-500",
  },
  TRAVEL: {
    annualReturn: 0.03,
    extraBenefitPer1000: 0,
    icon: "✈️",
    description:
      "Cel bardziej konsumpcyjny, zwykle z mniejszym naciskiem na wzrost kapitału.",
    badgeClass:
      "bg-pink-100 text-pink-700 border border-pink-200",
    cardClass:
      "border-pink-200 bg-pink-50",
    barClass: "bg-pink-500",
  },
  CREDIT: {
    annualReturn: 0.09,
    extraBenefitPer1000: 0,
    icon: "🏠",
    description:
      "Symulacja traktuje nadpłatę kredytu jako oszczędność na przyszłych odsetkach.",
    badgeClass:
      "bg-violet-100 text-violet-700 border border-violet-200",
    cardClass:
      "border-violet-200 bg-violet-50",
    barClass: "bg-violet-500",
  },
  CUSTOM: {
    annualReturn: 0.05,
    extraBenefitPer1000: 0,
    icon: "🎯",
    description:
      "Uniwersalny cel z umiarkowanym założeniem wzrostu.",
    badgeClass:
      "bg-slate-100 text-slate-700 border border-slate-200",
    cardClass:
      "border-slate-200 bg-slate-50",
    barClass: "bg-slate-500",
  },
};

export function analyzeGoals(
  goals: DashboardGoal[],
  horizonYears = 10
): GoalAnalysis[] {
  return goals
    .map((goal) => {
      const meta = GOAL_META[goal.type];

      const baseAmount = 1000;
      const projectedValuePer1000 =
        baseAmount * Math.pow(1 + meta.annualReturn, horizonYears);

      const growthProfitPer1000 =
        projectedValuePer1000 - baseAmount;

      const score =
        growthProfitPer1000 + meta.extraBenefitPer1000;

      const progress =
        goal.targetAmount > 0
          ? Math.min(
              (goal.currentAmount / goal.targetAmount) * 100,
              100
            )
          : 0;

      const remaining = Math.max(
        goal.targetAmount - goal.currentAmount,
        0
      );

      return {
        ...goal,
        progress,
        remaining,
        annualReturn: meta.annualReturn,
        icon: meta.icon,
        description: meta.description,
        badgeClass: meta.badgeClass,
        cardClass: meta.cardClass,
        barClass: meta.barClass,
        projectedValuePer1000,
        growthProfitPer1000,
        extraBenefitPer1000: meta.extraBenefitPer1000,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function pickBestGoal(
  analyses: GoalAnalysis[]
): GoalAnalysis | null {
  return analyses[0] ?? null;
}