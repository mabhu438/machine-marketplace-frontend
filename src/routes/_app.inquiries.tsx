import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Trash2, Eye, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/services/api";

export const Route = createFileRoute("/_app/inquiries")({
  head: () => ({ meta: [{ title: "Inquiries — Machine Marketplace" }] }),
  component: InquiriesPage,
});

interface Inquiry {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  machine?: any;
  machineName?: string;
  createdAt?: string;
}

function extractList(data: any): Inquiry[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.inquiries)) return data.inquiries;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function machineLabel(i: Inquiry): string {
  if (i.machineName) return i.machineName;
  if (typeof i.machine === "string") return i.machine;
  if (i.machine?.machineName) return i.machine.machineName;
  if (i.machine?.name) return i.machine.name;
  return "—";
}

function InquiriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const { data } = await api.get("/inquiries");
      return extractList(data);
    },
  });

  const inquiries = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter((i) =>
      [i.name, i.email, i.phone, machineLabel(i), i.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [inquiries, search]);

  const viewQuery = useQuery({
    queryKey: ["inquiry", viewId],
    enabled: !!viewId,
    queryFn: async () => {
      const { data } = await api.get(`/inquiries/${viewId}`);
      return (data?.data ?? data) as Inquiry;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inquiries/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Inquiry deleted");
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Delete failed");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">Inquiries</h1>
        <p className="text-muted-foreground text-sm mt-1">All buyer inquiries from your marketplace.</p>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inquiries..."
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Machine</th>
                <th className="text-left px-4 py-3 font-medium">Message</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline" /> Loading…
                </td></tr>
              )}
              {isError && !isLoading && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-destructive">
                  Failed to load inquiries. Check that your API is running.
                </td></tr>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No inquiries found.
                </td></tr>
              )}
              {filtered.map((i) => {
                const id = (i._id ?? i.id) as string;
                return (
                  <tr key={id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{i.name}</td>
                    <td className="px-4 py-3"><a href={`mailto:${i.email}`} className="text-primary hover:underline">{i.email}</a></td>
                    <td className="px-4 py-3">{i.phone ?? "—"}</td>
                    <td className="px-4 py-3">{machineLabel(i)}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{i.message}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewId(id)} aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry details</DialogTitle>
            <DialogDescription>Full details of this buyer inquiry.</DialogDescription>
          </DialogHeader>
          {viewQuery.isLoading && (
            <div className="py-8 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline" />
            </div>
          )}
          {viewQuery.data && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{viewQuery.data.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                  <p className="font-medium break-all">{viewQuery.data.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                  <p className="font-medium">{viewQuery.data.phone ?? "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Machine</p>
                <p className="font-medium">{machineLabel(viewQuery.data)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Message</p>
                <p className="font-medium whitespace-pre-wrap bg-secondary/40 rounded-lg p-3 mt-1">{viewQuery.data.message}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="font-medium">
                  {viewQuery.data.createdAt
                    ? new Date(viewQuery.data.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}