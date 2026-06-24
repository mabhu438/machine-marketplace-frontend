import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { register } from "@/services/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Machine Marketplace" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Name must be at least 2 characters");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Registration failed");
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
            Set up your admin workspace in seconds.
          </h1>
          <p className="mt-4 text-sidebar-foreground/70 max-w-md">
            List machines, capture buyer inquiries, and grow your business with a tool built for industrial sellers.
          </p>
        </div>
        <p className="text-sm text-sidebar-foreground/50">© {new Date().getFullYear()} Machine Marketplace</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-display font-semibold">Create account</h2>
          <p className="text-sm text-muted-foreground mt-1">Get started with your admin panel.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-2" />Create account</>}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}