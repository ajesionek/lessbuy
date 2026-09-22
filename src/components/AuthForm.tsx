"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Props = {
  initialMode?: "login" | "register";
};

export default function AuthForm({
  initialMode = "login",
}: Props) {
  const [mode, setMode] =
    useState<"login" | "register">(initialMode);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (error) {
          setMessage(
            error.message || "Nie udało się utworzyć konta."
          );
          return;
        }

        window.location.href = "/onboarding";
        return;
      }

      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setMessage(
          error.message || "Niepoprawny e-mail lub hasło."
        );
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setMessage("Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
          className={`w-1/2 rounded-lg px-3 py-2.5 text-sm font-medium ${
            mode === "login"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Logowanie
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("register");
            setMessage("");
          }}
          className={`w-1/2 rounded-lg px-3 py-2.5 text-sm font-medium ${
            mode === "register"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Rejestracja
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {mode === "register" && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nazwa
            </label>

            <input
              name="name"
              required
              placeholder="np. Arek"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            E-mail
          </label>

          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Hasło
          </label>

          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />

          {mode === "register" && (
            <p className="mt-2 text-xs text-slate-400">
              Minimum 8 znaków
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-400"
        >
          {loading
            ? "Proszę czekać..."
            : mode === "login"
              ? "Zaloguj"
              : "Utwórz konto"}
        </button>

        {message && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}