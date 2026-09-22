import AddDecisionForm from "@/components/AddDecisionForm";
import DecisionActions from "@/components/DecisionActions";
import SavingForm from "@/components/SavingForm";
import LogoutButton from "@/components/LogoutButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
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

  const totalSaved = decisions.reduce(
    (sum, decision) => sum + Number(decision.saving?.amount ?? 0),
    0
  );

  const skippedCount = decisions.filter(
    (decision) => decision.status === "SKIPPED"
  ).length;

  const boughtCount = decisions.filter(
    (decision) => decision.status === "BOUGHT"
  ).length;

  const pendingCount = decisions.filter(
    (decision) => decision.status === "PENDING"
  ).length;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-10 flex items-start justify-between gap-5">
        <div>
          <h1 className="text-4xl font-bold">LessBuy</h1>

          <p className="mt-2 text-gray-600">
            Zanim kupisz, daj sobie czas.
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {session.user.email}
          </p>
        </div>

        <LogoutButton />
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-black p-6 text-white">
          <p className="text-sm text-gray-300">
            Odłożone zamiast zakupów
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalSaved.toLocaleString("pl-PL", {
              style: "currency",
              currency: "PLN",
            })}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <p className="text-sm text-gray-500">
            Zakupy, z których zrezygnowałeś
          </p>

          <p className="mt-2 text-3xl font-bold">
            {skippedCount}
          </p>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Do decyzji</p>
          <strong className="text-xl">{pendingCount}</strong>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Nie kupione</p>
          <strong className="text-xl">{skippedCount}</strong>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Kupione</p>
          <strong className="text-xl">{boughtCount}</strong>
        </div>
      </section>

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
          <div className="space-y-5">
            {decisions.map((decision) => {
              const price = Number(decision.price);

              return (
                <article
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
                      {price.toLocaleString("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      })}
                    </strong>
                  </div>

                  <div className="mt-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                      {decision.status === "PENDING"
                        ? "Czekam z decyzją"
                        : decision.status === "BOUGHT"
                          ? "Kupione"
                          : "Nie kupuję"}
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

                  {decision.status === "PENDING" && (
                    <DecisionActions id={decision.id} />
                  )}

                  {decision.status === "SKIPPED" &&
                    !decision.saving && (
                      <SavingForm
                        decisionId={decision.id}
                        productPrice={price}
                      />
                    )}

                  {decision.saving && (
                    <div className="mt-5 rounded-xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Odłożono zamiast zakupu
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {Number(
                          decision.saving.amount
                        ).toLocaleString("pl-PL", {
                          style: "currency",
                          currency: "PLN",
                        })}
                      </p>

                      <p className="mt-1 text-sm">
                        Cel: {decision.saving.goal}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}