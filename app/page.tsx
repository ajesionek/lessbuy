import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="min-h-screen bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold">
          LessBuy
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Przejdź do aplikacji
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-3 text-sm font-medium"
              >
                Zaloguj
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Załóż konto
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-24 text-center">
        <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-500">
          Najlepszy zakup to czasem ten, którego nie zrobiłeś
        </p>

        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight sm:text-7xl">
          Zanim wydasz pieniądze,
          daj sobie czas.
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-500">
          Zapisz rzecz, którą chcesz kupić.
          Wróć do decyzji za kilka dni.
          Jeśli zrezygnujesz, odłóż część pieniędzy na swój cel.
        </p>

        <div className="mt-10">
          <Link
            href={session ? "/dashboard" : "/register"}
            className="inline-block rounded-xl bg-black px-8 py-4 font-medium text-white"
          >
            {session
              ? "Przejdź do aplikacji"
              : "Zacznij za darmo"}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 pb-24 md:grid-cols-3">
        <div className="rounded-2xl border p-7">
          <div className="mb-5 text-3xl font-bold">
            1
          </div>

          <h2 className="text-xl font-semibold">
            Zapisz zakup
          </h2>

          <p className="mt-3 text-gray-500">
            Dodaj rzecz, którą właśnie chcesz kupić i jej cenę.
          </p>
        </div>

        <div className="rounded-2xl border p-7">
          <div className="mb-5 text-3xl font-bold">
            2
          </div>

          <h2 className="text-xl font-semibold">
            Poczekaj
          </h2>

          <p className="mt-3 text-gray-500">
            Daj sobie 1, 7, 14 albo 30 dni przed podjęciem decyzji.
          </p>
        </div>

        <div className="rounded-2xl border p-7">
          <div className="mb-5 text-3xl font-bold">
            3
          </div>

          <h2 className="text-xl font-semibold">
            Odłóż zamiast wydać
          </h2>

          <p className="mt-3 text-gray-500">
            Zrezygnowałeś? Zapisz kwotę, którą odkładasz np. na IKE, IKZE albo inwestycje.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="rounded-3xl bg-gray-100 p-10 text-center sm:p-16">
          <p className="text-sm text-gray-500">
            Przykład
          </p>

          <p className="mt-5 text-xl">
            Garmin Fenix
          </p>

          <p className="mt-2 text-4xl font-bold">
            4 299 zł
          </p>

          <div className="my-7 text-2xl">
            ↓
          </div>

          <p className="text-gray-500">
            Nie kupuję
          </p>

          <p className="mt-2 text-3xl font-bold">
            2 000 zł → IKE
          </p>
        </div>
      </section>
    </main>
  );
}