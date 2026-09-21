import AddDecisionForm from "@/components/AddDecisionForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const decisions = await prisma.purchaseDecision.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold">
          LessBuy
        </h1>

        <p className="mt-2 text-gray-600">
          Nie kupuj impulsywnie. Daj sobie czas.
        </p>
      </header>

      <AddDecisionForm />

      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-bold">
          Moje decyzje
        </h2>

        {decisions.length === 0 ? (
          <p className="text-gray-500">
            Nie masz jeszcze żadnych zapisanych decyzji.
          </p>
        ) : (
          <div className="space-y-4">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                className="rounded-xl border p-5"
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {decision.productName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Decyzja do:{" "}
                      {decision.decisionDate.toLocaleDateString(
                        "pl-PL"
                      )}
                    </p>
                  </div>

                  <strong className="text-lg">
                    {Number(decision.price).toLocaleString(
                      "pl-PL",
                      {
                        style: "currency",
                        currency: "PLN",
                      }
                    )}
                  </strong>
                </div>

                <div className="mt-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {decision.status === "PENDING"
                      ? "Czekam z decyzją"
                      : decision.status}
                  </span>
                </div>

                {decision.productUrl && (
                  <div className="mt-4">
                    <a
                      href={decision.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      Zobacz produkt
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}