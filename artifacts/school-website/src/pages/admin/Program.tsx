import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, BookOpen } from "lucide-react";
import {
  useListPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  getListProgramsQueryKey,
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
  name: z.string().min(1, "Wajib diisi"),
  level: z.string().min(1, "Wajib diisi"),
  description: z.string().min(1, "Wajib diisi"),
  duration: z.string().optional(),
  imageUrl: z.string().optional(),
});
type ProgramForm = z.infer<typeof schema>;

const LEVELS = ["Mata Pelajaran Inti", "Pengembangan", "Ekstrakurikuler"];

const levelColors: Record<string, string> = {
  "Mata Pelajaran Inti": "bg-blue-50 text-blue-700",
  "Pengembangan": "bg-emerald-50 text-emerald-700",
  "Ekstrakurikuler": "bg-amber-50 text-amber-700",
};

export default function AdminProgram() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: programs, isLoading } = useListPrograms();
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();

  const form = useForm<ProgramForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", level: "Mata Pelajaran Inti", description: "", duration: "", imageUrl: "" },
  });

  const openCreate = () => {
    setEditId(null);
    form.reset({ name: "", level: "Mata Pelajaran Inti", description: "", duration: "", imageUrl: "" });
    setShowForm(true);
  };

  const openEdit = (prog: NonNullable<typeof programs>[number]) => {
    setEditId(prog.id);
    form.reset({
      name: prog.name,
      level: prog.level,
      description: prog.description,
      duration: prog.duration ?? "",
      imageUrl: prog.imageUrl ?? "",
    });
    setShowForm(true);
  };

  const onSubmit = (data: ProgramForm) => {
    const payload = { ...data, duration: data.duration || undefined, imageUrl: data.imageUrl || undefined };
    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: getListProgramsQueryKey() });
      toast({ title: editId ? "Program diperbarui" : "Program ditambahkan" });
      setShowForm(false);
    };
    if (editId) {
      updateProgram.mutate({ id: editId, data: payload }, { onSuccess });
    } else {
      createProgram.mutate({ data: payload }, { onSuccess });
    }
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteProgram.mutate({ id: deleteId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListProgramsQueryKey() });
        toast({ title: "Program dihapus" });
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kelola Program</h1>
          <p className="text-sm text-muted-foreground">{programs?.length ?? 0} program tersimpan</p>
        </div>
        <Button data-testid="button-add-program" onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Program
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)
          : programs?.length === 0
          ? (
            <div className="col-span-3 p-12 text-center text-muted-foreground bg-white rounded-2xl border border-border">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada program.</p>
            </div>
          )
          : programs?.map((prog) => (
            <div key={prog.id} data-testid={`admin-program-card-${prog.id}`} className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColors[prog.level] ?? "bg-muted text-muted-foreground"}`}>{prog.level}</span>
                <div className="flex gap-1">
                  <button data-testid={`button-edit-program-${prog.id}`} onClick={() => openEdit(prog)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button data-testid={`button-delete-program-${prog.id}`} onClick={() => setDeleteId(prog.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{prog.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{prog.description}</p>
              {prog.duration && <p className="text-xs text-muted-foreground mt-2">{prog.duration}</p>}
            </div>
          ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold">{editId ? "Edit Program" : "Tambah Program"}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-program">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Nama Program</FormLabel><FormControl><Input data-testid="input-program-name" placeholder="Nama program studi" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="level" render={({ field }) => (
                        <FormItem><FormLabel>Jenjang</FormLabel><FormControl>
                          <select data-testid="select-program-level" {...field} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="duration" render={({ field }) => (
                        <FormItem><FormLabel>Durasi (opsional)</FormLabel><FormControl><Input data-testid="input-program-duration" placeholder="3 Tahun" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea data-testid="input-program-desc" placeholder="Deskripsi program..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem><FormLabel>URL Gambar (opsional)</FormLabel><FormControl><Input data-testid="input-program-image" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
                      <Button type="submit" data-testid="button-submit-program" disabled={createProgram.isPending || updateProgram.isPending} className="flex-1">
                        {createProgram.isPending || updateProgram.isPending ? "Menyimpan..." : editId ? "Simpan" : "Tambah"}
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
              <h3 className="font-bold mb-2">Hapus Program?</h3>
              <p className="text-sm text-muted-foreground mb-5">Program akan dihapus permanen.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
                <Button variant="destructive" className="flex-1" data-testid="button-confirm-delete-program" onClick={confirmDelete} disabled={deleteProgram.isPending}>
                  {deleteProgram.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
