"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddDecisionForm() {
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
      productName: formData.get("productName"),
      productUrl: formData.get("productUrl"),
      price: formData.get("price"),
      coolingOffDays: formData.get("coolingOffDays"),
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error || "Nie udało się dodać zakupu."
        );
        return;
      }

      form.reset();
      setMessage("Zakup został zapisany.");

      router.refresh();
    } catch {
      setMessage("Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Dodaj planowany zakup
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Zapisz go teraz i wróć do decyzji za kilka dni.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Co chcesz kupić?
          </label>

          <input
            name="productName"
            type="text"
            required
            placeholder="np. Garmin Fenix 8"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Cena
          </label>

          <div className="relative">
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="4299"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-14 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              PLN
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Link do produktu
          </label>

          <input
            name="productUrl"
            type="url"
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />

          <p className="mt-2 text-xs text-slate-400">
            Opcjonalnie
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Ile czasu chcesz sobie dać?
          </label>

          <select
            name="coolingOffDays"
            defaultValue="7"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="1">1 dzień</option>
            <option value="3">3 dni</option>
            <option value="7">7 dni</option>
            <option value="14">14 dni</option>
            <option value="30">30 dni</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400"
        >
          {loading ? "Zapisywanie..." : "Odłóż decyzję"}
        </button>

        {message && (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}