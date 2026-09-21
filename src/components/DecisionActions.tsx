"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
};

export default function DecisionActions({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateDecision(status: "BOUGHT" | "SKIPPED") {
    setLoading(true);

    try {
      const response = await fetch(`/api/decisions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        alert("Nie udało się zmienić decyzji.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex gap-3">
      <button
        onClick={() => updateDecision("BOUGHT")}
        disabled={loading}
        className="rounded-lg border px-4 py-2"
      >
        Kupiłem
      </button>

      <button
        onClick={() => updateDecision("SKIPPED")}
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        Nie kupuję
      </button>
    </div>
  );
}