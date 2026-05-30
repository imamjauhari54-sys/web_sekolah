import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import {
  useListNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  getListNewsQueryKey,
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

const newsSchema = z.object({
  title: z.string().min(1, "Wajib diisi"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Wajib diisi"),
  category: z.string().min(1, "Wajib diisi"),
  imageUrl: z.string().optional(),
  publishedAt: z.string().optional(),
});
type NewsForm = z.infer<typeof newsSchema>;

const CATEGORIES = ["Akademik", "Olahraga", "Seni & Budaya", "Prestasi", "Pengumuman", "Umum"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminBerita() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: news, isLoading } = useListNews({ limit: 100 });
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const form = useForm<NewsForm>({
    resolver: zodResolver(newsSchema),
    defaultValues: { title: "", excerpt: "", content: "", category: "Umum", imageUrl: "", publishedAt: "" },
  });

  const filtered = news?.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    form.reset({ title: "", excerpt: "", content: "", category: "Umum", imageUrl: "", publishedAt: "" });
    setShowForm(true);
  };

  const openEdit = (article: NonNullable<typeof news>[number]) => {
    setEditId(article.id);
    form.reset({
      title: article.title,
      excerpt: article.excerpt ?? "",
      content: article.content,
      category: article.category,
      imageUrl: article.imageUrl ?? "",
      publishedAt: article.publishedAt ? article.publishedAt.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const onSubmit = (data: NewsForm) => {
    const payload = { ...data, publishedAt: data.publishedAt || undefined, imageUrl: data.imageUrl || undefined, excerpt: data.excerpt || undefined };
    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: getListNewsQueryKey() });
      toast({ title: editId ? "Berita diperbarui" : "Berita ditambahkan" });
      setShowForm(false);
    };
    if (editId) {
      updateNews.mutate({ id: editId, data: payload }, { onSuccess });
    } else {
      createNews.mutate({ data: payload }, { onSuccess });
    }
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteNews.mutate({ id: deleteId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListNewsQueryKey() });
        toast({ title: "Berita dihapus" });
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kelola Berita</h1>
          <p className="text-sm text-muted-foreground">{news?.length ?? 0} artikel tersimpan</p>
        </div>
        <Button data-testid="button-add-news" onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Berita
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          data-testid="input-search-admin-news"
          type="search"
          placeholder="Cari berita..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Tidak ada berita ditemukan.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">Judul</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase hidden lg:table-cell">Tanggal</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered?.map((article) => (
                <tr key={article.id} data-testid={`admin-news-row-${article.id}`} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground line-clamp-1">{article.title}</div>
                    {article.excerpt && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{article.excerpt}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{article.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(article.publishedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        data-testid={`button-edit-news-${article.id}`}
                        onClick={() => openEdit(article)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        data-testid={`button-delete-news-${article.id}`}
                        onClick={() => setDeleteId(article.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold text-foreground">{editId ? "Edit Berita" : "Tambah Berita"}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-news">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>Judul</FormLabel><FormControl><Input data-testid="input-news-title" placeholder="Judul berita" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="excerpt" render={({ field }) => (
                      <FormItem><FormLabel>Ringkasan (opsional)</FormLabel><FormControl><Input data-testid="input-news-excerpt" placeholder="Ringkasan singkat" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="content" render={({ field }) => (
                      <FormItem><FormLabel>Konten</FormLabel><FormControl><Textarea data-testid="input-news-content" placeholder="Isi berita lengkap..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Kategori</FormLabel><FormControl>
                          <select data-testid="select-news-category" {...field} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="publishedAt" render={({ field }) => (
                        <FormItem><FormLabel>Tanggal Publish</FormLabel><FormControl><Input data-testid="input-news-date" type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem><FormLabel>URL Gambar (opsional)</FormLabel><FormControl><Input data-testid="input-news-image" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
                      <Button type="submit" data-testid="button-submit-news" disabled={createNews.isPending || updateNews.isPending} className="flex-1">
                        {createNews.isPending || updateNews.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Berita"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <Trash2 className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">Hapus Berita?</h3>
              <p className="text-sm text-muted-foreground mb-5">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
                <Button variant="destructive" className="flex-1" data-testid="button-confirm-delete-news" onClick={confirmDelete} disabled={deleteNews.isPending}>
                  {deleteNews.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
