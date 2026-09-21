"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddDecisionForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        setMessage(result.error || "Wystąpił błąd.");
        return;
      }

      form.reset();

      setMessage("Dodano do listy.");

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
      className="space-y-5 rounded-xl border p-6"
    >
      <div>
        <label className="mb-2 block font-medium">
          Co chcesz kupić?
        </label>

        <input
          name="productName"
          type="text"
          required
          placeholder="np. Garmin Fenix 8"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Cena
        </label>

        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          required
          placeholder="4299"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Link do produktu
        </label>

        <input
          name="productUrl"
          type="url"
          placeholder="https://..."
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Ile dni chcesz się zastanowić?
        </label>

        <select
          name="coolingOffDays"
          defaultValue="7"
          className="w-full rounded-lg border p-3"
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
        className="w-full rounded-lg bg-black p-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Zapisywanie..." : "Odłóż decyzję"}
      </button>

      {message && (
        <p className="text-center text-sm">
          {message}
        </p>
      )}
    </form>
  );
}