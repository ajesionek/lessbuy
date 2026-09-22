"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
};

export default function DecisionActions({
  id,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function updateDecision(
    status: "BOUGHT" | "SKIPPED"
  ) {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/decisions/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        alert("Nie udało się zmienić decyzji.");
        return;
      }

      router.refresh();
    } catch {
      alert("Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <p className="mb-3 text-sm font-medium text-slate-600">
        Podjąłeś już decyzję?
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => updateDecision("BOUGHT")}
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Kupiłem
        </button>

        <button
          type="button"
          onClick={() => updateDecision("SKIPPED")}
          disabled={loading}
          className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          Nie kupuję
        </button>
      </div>
    </div>
  );
}