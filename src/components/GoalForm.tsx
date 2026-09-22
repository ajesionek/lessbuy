"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoalForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      type: formData.get("type"),
      targetAmount: formData.get("targetAmount"),
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error || "Nie udało się utworzyć celu."
        );
        return;
      }

      form.reset();
      setMessage("Cel został utworzony.");

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
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Nowy cel
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Na co chcesz odkładać pieniądze?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nazwa celu
          </label>

          <input
            name="name"
            required
            placeholder="np. IKE 2026"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Rodzaj
          </label>

          <select
            name="type"
            defaultValue="IKE"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="IKE">IKE</option>
            <option value="IKZE">IKZE</option>
            <option value="INVESTMENTS">
              Inwestycje
            </option>
            <option value="SAVINGS">
              Oszczędności
            </option>
            <option value="EMERGENCY">
              Poduszka finansowa
            </option>
            <option value="TRAVEL">
              Podróże
            </option>
            <option value="CREDIT">
              Nadpłata kredytu
            </option>
            <option value="CUSTOM">
              Inny cel
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Kwota docelowa
          </label>

          <div className="relative">
            <input
              name="targetAmount"
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="30000"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-14 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              PLN
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
        >
          {loading ? "Tworzenie..." : "Utwórz cel"}
        </button>

        {message && (
          <p className="text-center text-sm text-slate-600">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}