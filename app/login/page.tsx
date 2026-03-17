"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const seededUsers = [
  { name: "Nick Fury", role: "ADMIN", country: "-", email: "nick@slooze.com" },
  { name: "Captain Marvel", role: "MANAGER", country: "INDIA", email: "marvel@slooze.com" },
  { name: "Captain America", role: "MANAGER", country: "AMERICA", email: "america@slooze.com" },
  { name: "Thanos", role: "MEMBER", country: "INDIA", email: "thanos@slooze.com" },
  { name: "Thor", role: "MEMBER", country: "INDIA", email: "thor@slooze.com" },
  { name: "Travis", role: "MEMBER", country: "AMERICA", email: "travis@slooze.com" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard/restaurants");
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white/90 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Slooze</p>
        <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-700">Sign in to continue ordering.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-brand-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </form>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Seed Credentials</p>
            <p className="mt-1 text-xs text-slate-600">Password for all accounts: <span className="font-semibold">password123</span></p>
            <ul className="mt-3 space-y-2 text-xs text-slate-700">
              {seededUsers.map((user) => (
                <li key={user.email} className="rounded-md border border-slate-200 bg-white p-2">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p>{user.email}</p>
                  <p>
                    {user.role} | {user.country}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
