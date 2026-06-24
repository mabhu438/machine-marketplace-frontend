import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export const Route = createFileRoute("/_app/machines")({
  head: () => ({ meta: [{ title: "Machines — Machine Marketplace" }] }),
  component: MachinesPage,
});

interface Machine {
  _id?: string;
  id?: string;
  machineName: string;
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
  location: string;
  description: string;
}

const emptyForm: Machine = {
  machineName: "",
  brand: "",
  model: "",
  year: "",
  price: "",
  location: "",
  description: "",
};

function extractList(data: any): Machine[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.machines)) return data.machines;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function MachinesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<Machine>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["machines"],
    queryFn: async () => {
      const { data } = await api.get("/machines");
      return extractList(data);
    },
  });

  const machines = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return machines;
    return machines.filter((m) =>
      [m.machineName, m.brand, m.model, m.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [machines, search]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Machine) => {
      const body = {
        ...payload,
        year: payload.year === "" ? undefined : Number(payload.year),
        price: payload.price === "" ? undefined : Number(payload.price),
      };
      if (editingId) {
        const { data } = await api.put(`/machines/${editingId}`, body);
        return data;
      }
      const { data } = await api.post("/machines", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["machines"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(editingId ? "Machine updated" : "Machine added");
      setOpenForm(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Save failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/machines/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["machines"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Machine deleted");
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Delete failed");
    },
  });

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpenForm(true);
  };

  const openEdit = (m: Machine) => {
    setForm({ ...m });
    setEditingId((m._id ?? m.id) as string);
    setOpenForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.machineName.trim()) return toast.error("Machine name is required");
    if (!form.brand.trim()) return toast.error("Brand is required");
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Machines</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your machinery inventory.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Machine
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, model, location..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Machine</th>
                <th className="text-left px-4 py-3 font-medium">Brand</th>
                <th className="text-left px-4 py-3 font-medium">Model</th>
                <th className="text-left px-4 py-3 font-medium">Year</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
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
                  Failed to load machines. Check that your API is running.
                </td></tr>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No machines found.
                </td></tr>
              )}
              {filtered.map((m) => {
                const id = (m._id ?? m.id) as string;
                return (
                  <tr key={id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{m.machineName}</td>
                    <td className="px-4 py-3">{m.brand}</td>
                    <td className="px-4 py-3">{m.model}</td>
                    <td className="px-4 py-3">{m.year}</td>
                    <td className="px-4 py-3">{typeof m.price === "number" ? `$${m.price.toLocaleString()}` : m.price}</td>
                    <td className="px-4 py-3">{m.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
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

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Machine" : "Add Machine"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update machine details." : "Add a new machine to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              ["machineName", "Machine name", "text", "sm:col-span-2"],
              ["brand", "Brand", "text", ""],
              ["model", "Model", "text", ""],
              ["year", "Year", "number", ""],
              ["price", "Price (USD)", "number", ""],
              ["location", "Location", "text", "sm:col-span-2"],
            ] as const).map(([key, label, type, span]) => (
              <div key={key} className={span}>
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>
            <DialogFooter className="sm:col-span-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Save changes" : "Add machine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this machine?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The machine will be permanently removed.
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