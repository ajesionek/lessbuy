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
      <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
          className={`w-1/2 rounded-lg p-2 ${
            mode === "login"
              ? "bg-white font-semibold shadow"
              : ""
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
          className={`w-1/2 rounded-lg p-2 ${
            mode === "register"
              ? "bg-white font-semibold shadow"
              : ""
          }`}
        >
          Rejestracja
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border p-6"
      >
        {mode === "register" && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nazwa
            </label>

            <input
              name="name"
              required
              placeholder="np. Arek"
              className="w-full rounded-xl border p-3"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium">
            E-mail
          </label>

          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Hasło
          </label>

          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border p-3"
          />

          {mode === "register" && (
            <p className="mt-1 text-xs text-gray-400">
              Minimum 8 znaków
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black p-3 font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "Proszę czekać..."
            : mode === "login"
              ? "Zaloguj"
              : "Utwórz konto"}
        </button>

        {message && (
          <p className="text-center text-sm text-red-600">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}