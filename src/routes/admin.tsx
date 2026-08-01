import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, Package, FolderKanban, ShoppingCart, Images, Settings, FileText, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — SP Sports Wear" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminShell,
});

const NAV = [
  { to: "/admin/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/designs" as const, label: "Designs", icon: Package },
  { to: "/admin/categories" as const, label: "Categories", icon: FolderKanban },
  { to: "/admin/quote-requests" as const, label: "Quote Requests", icon: FileText },
  { to: "/admin/orders" as const, label: "Orders", icon: ShoppingCart },
  { to: "/admin/gallery" as const, label: "Gallery", icon: Images },
  { to: "/admin/settings" as const, label: "Settings", icon: Settings },
];

function AdminShell() {
  // Supabase Authentication is required for admin access.
  const DEMO_MODE = false;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [isDemoAuthenticated, setIsDemoAuthenticated] = useState(true);
  const [session, setSession] = useState<Session | null | undefined>(
    DEMO_MODE ? ({ user: { email: "demo@spsportswear.com" } } as unknown as Session) : undefined,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const isLoginRoute = pathname === "/admin" || pathname === "/admin/";
  const isAuthenticated = DEMO_MODE ? isDemoAuthenticated : !!session;

  useEffect(() => {
    if (DEMO_MODE) {
      if (isLoginRoute && isAuthenticated) {
        navigate({ to: "/admin/dashboard", replace: true });
      }

      if (!isAuthenticated && !isLoginRoute) {
        navigate({ to: "/admin", replace: true });
      }
      return;
    }

    if (session === undefined) return;

    if (!session && !isLoginRoute) {
      navigate({ to: "/admin", replace: true });
    }

    if (session && isLoginRoute) {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [DEMO_MODE, isAuthenticated, isLoginRoute, navigate, session]);

  // Demo mode: send /admin straight to the dashboard, skip all auth gating.
  if (DEMO_MODE) {
    if (isLoginRoute && isAuthenticated) {
      return null;
    }

    if (!isAuthenticated && !isLoginRoute) {
      return null;
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
      );
    }
  } else {
    // Loading gate
    if (session === undefined) {
      return (
        <div className="min-h-screen grid place-items-center bg-background">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </div>
      );
    }

    // Not logged in: only render login route (index). Any child page redirects to /admin.
    if (!session && !isLoginRoute) {
      return null;
    }

    // Logged in and on /admin: redirect to dashboard.
    if (session && isLoginRoute) {
      return null;
    }

    // Login page: bare shell
    if (!session) {
      return (
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
      );
    }
  }


  // Authenticated admin shell
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between border-b border-border bg-card p-4">
        <div>
          <div className="font-display text-lg font-bold text-primary">SP Admin</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Control Panel
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-muted"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:relative lg:w-auto lg:max-w-none lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="hidden lg:block p-5 border-b border-border">
            <div className="font-display text-lg font-bold text-primary">SP Admin</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Control Panel
            </div>
          </div>
          <nav className="p-3 flex flex-col gap-1 overflow-y-auto h-full lg:h-auto">
            {NAV.map((n, i) => {
              const active = pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <button
                  key={i}
                  onClick={() => {
                    navigate({ to: n.to });
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-left transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/75 hover:bg-muted hover:text-primary"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </button>
              );
            })}
            <button
              onClick={async () => {
                if (DEMO_MODE) {
                  setIsDemoAuthenticated(false);
                  navigate({ to: "/admin", replace: true });
                  return;
                }

                await supabase.auth.signOut();
                setSession(null);
                navigate({ to: "/admin", replace: true });
              }}
              className="mt-4 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-muted hover:text-primary text-left"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="min-w-0 p-4 md:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
