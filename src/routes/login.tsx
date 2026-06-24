import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "@/services/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Machine Marketplace" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-10 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">M</div>
          <span className="font-display font-semibold">Machine Marketplace</span>
        </div>
        <div>
          <h1 className="text-4xl font-display font-semibold leading-tight">
            The control center for your machinery business.
          </h1>
          <p className="mt-4 text-sidebar-foreground/70 max-w-md">
            Manage your inventory, track buyer inquiries, and keep your team in sync — all from one professional admin.
          </p>
        </div>
        <p className="text-sm text-sidebar-foreground/50">© {new Date().getFullYear()} Machine Marketplace</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-display font-semibold">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Enter your credentials to continue.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-4 w-4 mr-2" />Sign in</>}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}