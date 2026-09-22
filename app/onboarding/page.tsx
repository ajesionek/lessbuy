import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-medium text-gray-500">
          Witaj, {session.user.name}
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Jedna prosta zasada.
        </h1>

        <p className="mt-5 text-lg leading-8 text-gray-600">
          Gdy masz ochotę coś kupić, nie musisz od razu
          rezygnować. Najpierw zapisz zakup i daj sobie
          kilka dni.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl bg-gray-50 p-5">
            <strong>1. Dodajesz produkt</strong>
            <p className="mt-1 text-sm text-gray-500">
              np. zegarek za 4 299 zł
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <strong>2. Czekasz</strong>
            <p className="mt-1 text-sm text-gray-500">
              np. 7 dni
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <strong>3. Podejmujesz decyzję</strong>
            <p className="mt-1 text-sm text-gray-500">
              kupuję albo rezygnuję i odkładam pieniądze
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="mt-8 block rounded-xl bg-black p-4 text-center font-medium text-white"
        >
          Dodaj pierwszy zakup
        </Link>
      </div>
    </main>
  );
}