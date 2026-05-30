import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, CalendarDays } from "lucide-react";
import {
  useListEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  getListEventsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(1, "Wajib diisi"),
  description: z.string().optional(),
  date: z.string().min(1, "Wajib diisi"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Wajib diisi"),
  category: z.string().optional(),
});
type AcaraForm = z.infer<typeof schema>;

const CATEGORIES = ["Akademik", "Olahraga", "Seni & Budaya", "Kegiatan", "Umum"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminAcara() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: events, isLoading } = useListEvents({});
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const form = useForm<AcaraForm>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", date: "", endDate: "", location: "", category: "Umum" },
  });

  const openCreate = () => {
    setEditId(null);
    form.reset({ title: "", description: "", date: "", endDate: "", location: "", category: "Umum" });
    setShowForm(true);
  };

  const openEdit = (ev: NonNullable<typeof events>[number]) => {
    setEditId(ev.id);
    form.reset({
      title: ev.title,
      description: ev.description ?? "",
      date: ev.date ? ev.date.slice(0, 16) : "",
      endDate: ev.endDate ? ev.endDate.slice(0, 16) : "",
      location: ev.location,
      category: ev.category ?? "Umum",
    });
    setShowForm(true);
  };

  const onSubmit = (data: AcaraForm) => {
    const payload = { ...data, endDate: data.endDate || undefined, description: data.description || undefined, category: data.category || undefined };
    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: getListEventsQueryKey() });
      toast({ title: editId ? "Acara diperbarui" : "Acara ditambahkan" });
      setShowForm(false);
    };
    if (editId) {
      updateEvent.mutate({ id: editId, data: payload }, { onSuccess });
    } else {
      createEvent.mutate({ data: payload }, { onSuccess });
    }
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate({ id: deleteId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListEventsQueryKey() });
        toast({ title: "Acara dihapus" });
        setDeleteId(null);
      },
    });
  };

  const now = new Date();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kelola Acara</h1>
          <p className="text-sm text-muted-foreground">{events?.length ?? 0} acara tersimpan</p>
        </div>
        <Button data-testid="button-add-event" onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Acara
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : events?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada acara.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">Acara</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase hidden md:table-cell">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase hidden lg:table-cell">Lokasi</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events?.map((ev) => {
                const isPast = new Date(ev.date) < now;
                return (
                  <tr key={ev.id} data-testid={`admin-event-row-${ev.id}`} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{ev.title}</div>
                      {ev.category && <span className="text-xs text-muted-foreground">{ev.category}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(ev.date)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell truncate max-w-[180px]">{ev.location}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isPast ? "bg-muted text-muted-foreground" : "bg-emerald-50 text-emerald-700"}`}>
                        {isPast ? "Selesai" : "Mendatang"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button data-testid={`button-edit-event-${ev.id}`} onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button data-testid={`button-delete-event-${ev.id}`} onClick={() => setDeleteId(ev.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold text-foreground">{editId ? "Edit Acara" : "Tambah Acara"}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-event">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>Judul Acara</FormLabel><FormControl><Input data-testid="input-event-title" placeholder="Nama acara" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Deskripsi (opsional)</FormLabel><FormControl><Textarea data-testid="input-event-desc" placeholder="Deskripsi singkat acara" rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem><FormLabel>Tanggal Mulai</FormLabel><FormControl><Input data-testid="input-event-date" type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="endDate" render={({ field }) => (
                        <FormItem><FormLabel>Tanggal Selesai (opt.)</FormLabel><FormControl><Input data-testid="input-event-enddate" type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Lokasi</FormLabel><FormControl><Input data-testid="input-event-location" placeholder="Lokasi pelaksanaan" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Kategori</FormLabel><FormControl>
                          <select data-testid="select-event-category" {...field} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
                      <Button type="submit" data-testid="button-submit-event" disabled={createEvent.isPending || updateEvent.isPending} className="flex-1">
                        {createEvent.isPending || updateEvent.isPending ? "Menyimpan..." : editId ? "Simpan" : "Tambah"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <Trash2 className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-bold mb-2">Hapus Acara?</h3>
              <p className="text-sm text-muted-foreground mb-5">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
                <Button variant="destructive" className="flex-1" data-testid="button-confirm-delete-event" onClick={confirmDelete} disabled={deleteEvent.isPending}>
                  {deleteEvent.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
