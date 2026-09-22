import AuthForm from "@/components/AuthForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">LessBuy</h1>

          <p className="mt-2 text-gray-500">
            Wydawaj mniej. Odkładaj więcej.
          </p>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}