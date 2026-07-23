import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import spLogo from "@/assets/sp-logo.png";

export const Route = createFileRoute("/admin/")({
  component: AdminLogin,
});

function AdminLogin() {
  // Supabase Authentication is required for admin access.
  const DEMO_MODE = false;
  const navigate = (Route as any).useNavigate ? (Route as any).useNavigate() : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    // On success, the parent AdminShell auth listener redirects to /admin/dashboard.
  }


  return (
    <div className="min-h-screen grid place-items-center bg-navy px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <img src={spLogo} alt="SP Sports Wear" className="h-16 w-16 object-contain" />
          <h1 className="mt-4 font-display text-2xl font-bold text-primary">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Secure access for SP Sports Wear administrators.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full h-11 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-secondary"
              placeholder="admin@spsportswear.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full h-11 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-secondary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent-gradient px-4 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Restricted area. Authorised administrators only.
        </p>
      </div>
    </div>
  );
}
