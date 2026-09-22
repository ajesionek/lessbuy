"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
  console.error("Better Auth signup error:", error);

  setMessage(
    `${error.status ?? ""} ${error.code ?? ""} ${error.message ?? "Nie udało się utworzyć konta."}`
  );

  return;
}
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setMessage(error.message || "Niepoprawny e-mail lub hasło.");
          return;
        }
      }

      window.location.href = "/";
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
            mode === "login" ? "bg-white font-semibold shadow" : ""
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
            mode === "register" ? "bg-white font-semibold shadow" : ""
          }`}
        >
          Rejestracja
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border p-6"
      >
        {mode === "register" && (
          <div>
            <label className="mb-2 block text-sm">Nazwa</label>

            <input
              name="name"
              required
              placeholder="np. Arek"
              className="w-full rounded-lg border p-3"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm">E-mail</label>

          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Hasło</label>

          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-50"
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