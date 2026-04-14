"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@rimba.com");
  const [password, setPassword] = useState("admin12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/public" className="flex items-center gap-2 text-slate-600">
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </Button>

        <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60">
          <CardHeader className="space-y-1 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
              Login Admin
            </p>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Dashboard RIMBA
            </CardTitle>
            <CardDescription className="text-slate-600">
              Gunakan email dan password admin untuk mengelola website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@rimba.com"
                  className="rounded-xl border-slate-300 py-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan password"
                  className="rounded-xl border-slate-300 py-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-6 font-semibold"
              >
                {loading ? "Sedang login..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Akun testing:</p>
              <div className="mt-2 space-y-1">
                <p>Email: <span className="font-mono text-slate-900">admin@rimba.com</span></p>
                <p>Password: <span className="font-mono text-slate-900">admin12345</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}