"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type GoalOption = {
  id: string;
  name: string;
  type: string;
  currentAmount: number;
  targetAmount: number;
};

type SavingFormProps = {
  decisionId: string;
  productPrice: number;
  goals: GoalOption[];
};

function formatMoney(value: number) {
  return value.toLocaleString("pl-PL", {
    maximumFractionDigits: 0,
  });
}

export default function SavingForm({
  decisionId,
  productPrice,
  goals,
}: SavingFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const goalId = String(formData.get("goalId") || "");

    const data = {
      decisionId,
      amount: formData.get("amount"),
      goalId: goalId || null,
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error ||
            "Nie udało się zapisać oszczędności."
        );
        return;
      }

      router.refresh();
    } catch {
      setMessage("Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <p className="text-sm font-medium text-emerald-700">
        Dobra decyzja
      </p>

      <h4 className="mt-1 text-lg font-semibold text-slate-900">
        Ile odkładasz zamiast tego zakupu?
      </h4>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Kwota
        </label>

        <div className="relative">
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            max={productPrice}
            defaultValue={productPrice}
            required
            className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 pr-14 text-lg font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            PLN
          </span>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Na jaki cel odkładasz?
        </label>

        <select
          name="goalId"
          defaultValue=""
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">
            Bez konkretnego celu
          </option>

          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name} ·{" "}
              {formatMoney(goal.currentAmount)} /{" "}
              {formatMoney(goal.targetAmount)} zł
            </option>
          ))}
        </select>

        {goals.length === 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Nie masz jeszcze żadnego celu. Możesz
            zapisać oszczędność bez celu albo utworzyć
            cel wyżej.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
      >
        {loading
          ? "Zapisywanie..."
          : "Zapisz oszczędność"}
      </button>

      {message && (
        <p className="mt-3 text-center text-sm text-slate-600">
          {message}
        </p>
      )}
    </form>
  );
}