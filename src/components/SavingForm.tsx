"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  decisionId: string;
  productPrice: number;
};

export default function SavingForm({
  decisionId,
  productPrice,
}: Props) {
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
      decisionId,
      amount: formData.get("amount"),
      goal: formData.get("goal"),
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
          result.error || "Nie udało się zapisać."
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
      className="mt-5 rounded-xl bg-gray-50 p-5"
    >
      <h4 className="font-semibold">
        Ile odkładasz zamiast tego zakupu?
      </h4>

      <div className="mt-4">
        <label className="mb-2 block text-sm">
          Kwota
        </label>

        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          max={productPrice}
          defaultValue={productPrice}
          required
          className="w-full rounded-lg border bg-white p-3"
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm">
          Gdzie odkładasz?
        </label>

        <select
          name="goal"
          defaultValue="IKE"
          className="w-full rounded-lg border bg-white p-3"
        >
          <option value="IKE">
            IKE
          </option>

          <option value="IKZE">
            IKZE
          </option>

          <option value="INVESTMENTS">
            Inwestycje
          </option>

          <option value="SAVINGS">
            Konto oszczędnościowe
          </option>

          <option value="OTHER">
            Inny cel
          </option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-black p-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Zapisywanie..."
          : "Zapisz oszczędność"}
      </button>

      {message && (
        <p className="mt-3 text-sm">
          {message}
        </p>
      )}
    </form>
  );
}