import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X, Image } from "lucide-react";
import {
  useListGallery,
  useCreateGalleryItem,
  useDeleteGalleryItem,
  getListGalleryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(1, "Wajib diisi"),
  imageUrl: z.string().url("URL tidak valid"),
  category: z.string().min(1, "Wajib diisi"),
  takenAt: z.string().optional(),
});
type GaleriForm = z.infer<typeof schema>;

const CATEGORIES = ["Akademik", "Olahraga", "Seni & Budaya", "Fasilitas", "Kegiatan", "Prestasi", "Umum"];

export default function AdminGaleri() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("Semua");

  const { data: gallery, isLoading } = useListGallery({
    category: activeFilter === "Semua" ? undefined : activeFilter,
  });
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const form = useForm<GaleriForm>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", imageUrl: "", category: "Umum", takenAt: "" },
  });

  const onSubmit = (data: GaleriForm) => {
    createItem.mutate(
      { data: { ...data, takenAt: data.takenAt || undefined } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListGalleryQueryKey() });
          toast({ title: "Foto ditambahkan" });
          setShowForm(false);
          form.reset();
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteItem.mutate({ id: deleteId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListGalleryQueryKey() });
        toast({ title: "Foto dihapus" });
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kelola Galeri</h1>
          <p className="text-sm text-muted-foreground">{gallery?.length ?? 0} foto tersimpan</p>
        </div>
        <Button data-testid="button-add-gallery" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Foto
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["Semua", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            data-testid={`filter-admin-gallery-${cat}`}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeFilter === cat ? "bg-primary text-primary-foreground" : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : gallery?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada foto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery?.map((item) => (
            <div key={item.id} data-testid={`admin-gallery-item-${item.id}`} className="group relative rounded-xl overflow-hidden border border-border bg-white">
              <div className="aspect-square">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white text-xs font-medium text-center px-2 mb-2">{item.title}</p>
                <button
                  data-testid={`button-delete-gallery-${item.id}`}
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 rounded-full bg-destructive/90 text-white hover:bg-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2.5 border-t border-border">
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold">Tambah Foto Galeri</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-gallery">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>Judul Foto</FormLabel><FormControl><Input data-testid="input-gallery-title" placeholder="Judul foto" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem><FormLabel>URL Gambar</FormLabel><FormControl><Input data-testid="input-gallery-url" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    {form.watch("imageUrl") && (
                      <div className="rounded-lg overflow-hidden border border-border aspect-video">
                        <img src={form.watch("imageUrl")} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Kategori</FormLabel><FormControl>
                          <select data-testid="select-gallery-category" {...field} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="takenAt" render={({ field }) => (
                        <FormItem><FormLabel>Tanggal (opt.)</FormLabel><FormControl><Input data-testid="input-gallery-date" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
                      <Button type="submit" data-testid="button-submit-gallery" disabled={createItem.isPending} className="flex-1">
                        {createItem.isPending ? "Menyimpan..." : "Tambah Foto"}
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
              <h3 className="font-bold mb-2">Hapus Foto?</h3>
              <p className="text-sm text-muted-foreground mb-5">Foto akan dihapus permanen dari galeri.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
                <Button variant="destructive" className="flex-1" data-testid="button-confirm-delete-gallery" onClick={confirmDelete} disabled={deleteItem.isPending}>
                  {deleteItem.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
