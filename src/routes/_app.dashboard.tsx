import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Mail, Users, TrendingUp, Loader2 } from "lucide-react";
import api from "@/services/api";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Machine Marketplace" }] }),
  component: DashboardPage,
});

async function safeCount(path: string): Promise<number> {
  try {
    const { data } = await api.get(path);
    if (Array.isArray(data)) return data.length;
    if (typeof data?.count === "number") return data.count;
    if (typeof data?.total === "number") return data.total;
    if (Array.isArray(data?.data)) return data.data.length;
    if (Array.isArray(data?.items)) return data.items.length;
    return 0;
  } catch {
    return 0;
  }
}

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [machines, inquiries, users] = await Promise.all([
        safeCount("/machines"),
        safeCount("/inquiries"),
        safeCount("/users"),
      ]);
      return { machines, inquiries, users };
    },
  });

  const cards = [
    { label: "Total Machines", value: data?.machines ?? 0, icon: Wrench, accent: "bg-primary/10 text-primary" },
    { label: "Total Inquiries", value: data?.inquiries ?? 0, icon: Mail, accent: "bg-emerald-500/10 text-emerald-600" },
    { label: "Total Users", value: data?.users ?? 0, icon: Users, accent: "bg-amber-500/10 text-amber-600" },
    { label: "Engagement", value: `${Math.min(99, ((data?.inquiries ?? 0) * 3) % 100)}%`, icon: TrendingUp, accent: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your machine marketplace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-3xl font-display font-semibold mt-2">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : c.value}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg">Welcome back 👋</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            This admin connects to your Node.js + Express + MongoDB API at{" "}
            <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs">
              {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"}
            </code>
            . Make sure your server is running and CORS allows this origin.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-semibold">Quick actions</h3>
          <ul className="mt-3 text-sm space-y-2 text-muted-foreground">
            <li>• Add a new machine</li>
            <li>• Review recent inquiries</li>
            <li>• Update inventory pricing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}