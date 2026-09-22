import AddDecisionForm from "@/components/AddDecisionForm";
import DecisionActions from "@/components/DecisionActions";
import SavingForm from "@/components/SavingForm";
import LogoutButton from "@/components/LogoutButton";
import GoalForm from "@/components/GoalForm";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  analyzeGoals,
  pickBestGoal,
} from "@/lib/goal-estimator";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ASSUMED_RETURN = 0.07;

function formatMoney(value: number) {
  return value.toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  });
}

function futureValue(
  amount: number,
  years: number,
  annualReturn = ASSUMED_RETURN
) {
  return amount * Math.pow(1 + annualReturn, years);
}

function daysUntil(date: Date) {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return Math.ceil(
    (target.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function goalLabel(goal: string) {
  switch (goal) {
    case "IKE":
      return "IKE";
    case "IKZE":
      return "IKZE";
    case "INVESTMENTS":
      return "Inwestycje";
    case "SAVINGS":
      return "Konto oszczędnościowe";
    case "OTHER":
      return "Inny cel";
    default:
      return goal;
  }
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const decisions = await prisma.purchaseDecision.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      saving: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const goals = await prisma.goal.findMany({
  where: {
    userId: session.user.id,
  },
  include: {
    savings: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});

const goalOptions = goals.map((goal) => {
  const currentAmount = goal.savings.reduce(
    (sum, saving) => sum + Number(saving.amount),
    0
  );

  return {
    id: goal.id,
    name: goal.name,
    type: goal.type,
    targetAmount: Number(goal.targetAmount),
    currentAmount,
  };
});

const goalAnalyses = analyzeGoals(goalOptions, 10);
const bestGoal = pickBestGoal(goalAnalyses);

  const totalSaved = decisions.reduce(
    (sum, decision) =>
      sum + Number(decision.saving?.amount ?? 0),
    0
  );

  const skippedCount = decisions.filter(
    (decision) => decision.status === "SKIPPED"
  ).length;

  const boughtCount = decisions.filter(
    (decision) => decision.status === "BOUGHT"
  ).length;

  const pendingDecisions = decisions.filter(
    (decision) => decision.status === "PENDING"
  );

  const completedDecisions = decisions.filter(
    (decision) => decision.status !== "PENDING"
  );

  const totalAvoidedValue = decisions
    .filter((decision) => decision.status === "SKIPPED")
    .reduce(
      (sum, decision) => sum + Number(decision.price),
      0
    );

  const savedPercentage =
    totalAvoidedValue > 0
      ? Math.round((totalSaved / totalAvoidedValue) * 100)
      : 0;

  const projections = [
    {
      years: 10,
      value: futureValue(totalSaved, 10),
    },
    {
      years: 20,
      value: futureValue(totalSaved, 20),
    },
    {
      years: 30,
      value: futureValue(totalSaved, 30),
    },
  ];

  const goalTotals = decisions.reduce<
    Record<string, number>
  >((acc, decision) => {
    if (!decision.saving) {
      return acc;
    }

    const goal = decision.saving.goal;
    const amount = Number(decision.saving.amount);

    acc[goal] = (acc[goal] ?? 0) + amount;

    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        {/* HEADER */}

        <header className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            LessBuy
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-700">
                {session.user.name}
              </p>

              <p className="text-xs text-slate-400">
                {session.user.email}
              </p>
            </div>

            <LogoutButton />
          </div>
        </header>

        {/* POWITANIE */}

        <section className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Dzień dobry, {session.user.name}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Twoje pieniądze, których nie wydałeś.
          </h1>
        </section>

        {/* GŁÓWNA KARTA */}

        <section className="mb-6 rounded-3xl bg-emerald-600 p-7 text-white shadow-sm sm:p-9">
          <p className="text-sm font-medium text-emerald-100">
            Odłożone zamiast zakupów
          </p>

          <p className="mt-2 text-5xl font-bold tracking-tight">
            {formatMoney(totalSaved)}
          </p>

          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t border-emerald-500 pt-6">
            <div>
              <p className="text-xs text-emerald-100">
                Rezygnacje z zakupów
              </p>

              <p className="mt-1 text-xl font-semibold">
                {skippedCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-emerald-100">
                Wartość niekupionych rzeczy
              </p>

              <p className="mt-1 text-xl font-semibold">
                {formatMoney(totalAvoidedValue)}
              </p>
            </div>

            <div>
              <p className="text-xs text-emerald-100">
                Faktycznie odłożone
              </p>

              <p className="mt-1 text-xl font-semibold">
                {savedPercentage}%
              </p>
            </div>
          </div>
        </section>

        {/* PROGNOZA */}

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Co mogą zrobić te pieniądze?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Symulacja przy założeniu średniej stopy
              zwrotu 7% rocznie.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {projections.map((projection) => (
              <div
                key={projection.years}
                className="rounded-2xl bg-slate-50 p-5"
              >
                <p className="text-sm text-slate-500">
                  Za {projection.years} lat
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatMoney(projection.value)}
                </p>

                {totalSaved > 0 && (
                  <p className="mt-2 text-xs text-emerald-700">
                    +
                    {formatMoney(
                      projection.value - totalSaved
                    )}{" "}
                    potencjalnego wzrostu
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            To wyłącznie symulacja matematyczna. Rzeczywista
            stopa zwrotu może być wyższa lub niższa.
          </p>
        </section>

        {/* STATUSY */}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Do decyzji
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingDecisions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Nie kupiłem
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {skippedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Kupiłem
            </p>

            <p className="mt-2 text-3xl font-bold">
              {boughtCount}
            </p>
          </div>
        </section>

        {/* CELE */}

        {Object.keys(goalTotals).length > 0 && (
          <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold">
              Gdzie odkładasz?
            </h2>

            <div className="mt-5 space-y-5">
              {Object.entries(goalTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([goal, amount]) => {
                  const percentage =
                    totalSaved > 0
                      ? (amount / totalSaved) * 100
                      : 0;

                  return (
                    <div key={goal}>
                      <div className="mb-2 flex justify-between gap-4">
                        <span className="text-sm font-medium">
                          {goalLabel(goal)}
                        </span>

                        <span className="text-sm font-semibold">
                          {formatMoney(amount)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

<section className="mb-10">
  <div className="mb-5">
    <h2 className="text-2xl font-bold">
      Twoje cele
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Pieniądze, których nie wydajesz, mogą pracować
      na konkretny cel.
    </p>
  </div>

  {bestGoal && (
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-white shadow-sm">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
            <span className="text-lg">{bestGoal.icon}</span>
            <span>Największy potencjał teraz</span>
          </div>

          <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
            {bestGoal.name}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
            {bestGoal.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-xs text-white/70">
              Szacowany efekt dla kolejnych 1000 zł
            </p>
            <p className="mt-2 text-xl font-bold">
              {formatMoney(bestGoal.score)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-xs text-white/70">
              Horyzont
            </p>
            <p className="mt-2 text-xl font-bold">
              10 lat
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-xs text-white/70">
              Założona roczna stopa
            </p>
            <p className="mt-2 text-xl font-bold">
              {(bestGoal.annualReturn * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )}

  {goalAnalyses.length > 0 && (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      {goalAnalyses.map((goal) => (
        <article
          key={goal.id}
          className={`rounded-2xl border p-6 shadow-sm ${goal.cardClass}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${goal.badgeClass}`}
              >
                <span>{goal.icon}</span>
                <span>{goal.type}</span>
              </span>

              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {goal.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {goal.description}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">
                Potencjał
              </p>
              <p className="text-xl font-bold text-slate-900">
                {formatMoney(goal.score)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {formatMoney(goal.currentAmount)}
              </span>

              <span className="text-sm text-slate-500">
                z {formatMoney(goal.targetAmount)}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/80">
              <div
                className={goal.barClass}
                style={{
                  width: `${goal.progress}%`,
                  height: "100%",
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <span>
                Postęp: {Math.round(goal.progress)}%
              </span>

              <span>
                Pozostało: {formatMoney(goal.remaining)}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs text-slate-500">
                Wzrost z 1000 zł
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(goal.growthProfitPer1000)}
              </p>
            </div>

            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs text-slate-500">
                Dodatkowa korzyść
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(goal.extraBenefitPer1000)}
              </p>
            </div>

            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs text-slate-500">
                Wynik po 10 latach
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(goal.projectedValuePer1000)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-end gap-2">
            {[18, 28, 38, 52].map((height, index) => (
              <div
                key={index}
                className={`w-3 rounded-full ${goal.barClass}`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  )}

  <GoalForm />
</section>

        {/* DODAWANIE ZAKUPU */}

        <section className="mb-10">
          <AddDecisionForm />
        </section>

        {/* AKTYWNE DECYZJE */}

        <section className="mb-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Do decyzji
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Zakupy, nad którymi jeszcze się zastanawiasz.
              </p>
            </div>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
              {pendingDecisions.length}
            </span>
          </div>

          {pendingDecisions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-medium text-slate-700">
                Brak aktywnych decyzji
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Dodaj rzecz, którą masz ochotę kupić.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDecisions.map((decision) => {
                const price = Number(decision.price);
                const remaining = daysUntil(
                  decision.decisionDate
                );

                return (
                  <article
                    key={decision.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {decision.productName}
                        </h3>

                        {remaining > 0 ? (
                          <p className="mt-1 text-sm text-slate-500">
                            Pozostało{" "}
                            <strong className="text-slate-700">
                              {remaining}{" "}
                              {remaining === 1
                                ? "dzień"
                                : "dni"}
                            </strong>
                          </p>
                        ) : (
                          <p className="mt-1 text-sm font-medium text-amber-600">
                            Czas podjąć decyzję
                          </p>
                        )}

                        {decision.productUrl && (
                          <a
                            href={decision.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-sm font-medium text-slate-500 underline hover:text-slate-900"
                          >
                            Zobacz produkt
                          </a>
                        )}
                      </div>

                      <p className="text-2xl font-bold">
                        {formatMoney(price)}
                      </p>
                    </div>

                    <DecisionActions id={decision.id} />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* HISTORIA */}

        <section className="pb-16">
          <h2 className="text-2xl font-bold">
            Historia decyzji
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Zakupy, w których decyzja została już podjęta.
          </p>

          {completedDecisions.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
              Historia jest jeszcze pusta.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {completedDecisions.map((decision) => {
                const price = Number(decision.price);

                return (
                  <article
                    key={decision.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold">
                            {decision.productName}
                          </h3>

                          {decision.status === "SKIPPED" ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Nie kupiłem
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              Kupione
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          Wartość: {formatMoney(price)}
                        </p>
                      </div>

                      {decision.saving && (
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 sm:text-right">
                          <p className="text-xs font-medium text-emerald-700">
                            Odłożone
                          </p>

                          <p className="mt-1 text-xl font-bold text-emerald-700">
                            {formatMoney(
                              Number(decision.saving.amount)
                            )}
                          </p>

                          <p className="mt-1 text-xs text-emerald-600">
                            {goalLabel(
                              decision.saving.goal
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {decision.status === "SKIPPED" &&
                      !decision.saving && (
                        <SavingForm
                            decisionId={decision.id}
                            productPrice={price}
                            goals={goalOptions}
                        />
                      )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}