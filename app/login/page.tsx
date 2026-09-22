import AuthForm from "@/components/AuthForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center text-4xl font-bold"
        >
          LessBuy
        </Link>

        <p className="mb-8 text-center text-gray-500">
          Wydawaj mniej. Odkładaj więcej.
        </p>

        <AuthForm initialMode="login" />
      </div>
    </main>
  );
}