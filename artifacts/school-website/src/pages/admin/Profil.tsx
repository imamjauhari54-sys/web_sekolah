import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, School, MapPin, Phone, Mail, Globe, Share2,
  GraduationCap, Instagram, Facebook, Youtube, Eye,
} from "lucide-react";
import {
  useGetSchoolProfile,
  useUpdateSchoolProfile,
  getGetSchoolProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Wajib diisi"),
  tagline: z.string().min(1, "Wajib diisi"),
  description: z.string().min(1, "Wajib diisi"),
  address: z.string().min(1, "Wajib diisi"),
  phone: z.string().min(1, "Wajib diisi"),
  email: z.string().email("Email tidak valid"),
  website: z.string().optional(),
  npsn: z.string().optional(),
  accreditation: z.string().optional(),
  foundedYear: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
});

type ProfilForm = z.infer<typeof schema>;

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function LivePreview({ values }: { values: ProfilForm }) {
  const name = values.name || "Nama Sekolah";
  const tagline = values.tagline || "Motto sekolah";
  const description = values.description || "Deskripsi singkat sekolah akan tampil di sini.";
  const address = values.address || "Alamat sekolah";
  const phone = values.phone || "-";
  const email = values.email || "-";

  const hasSocial = values.instagramUrl || values.facebookUrl || values.youtubeUrl;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Preview label */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/40">
        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
        <span className="ml-auto text-[10px] text-muted-foreground/60 bg-muted rounded-full px-2 py-0.5">
          Tampilan nyata di website
        </span>
      </div>

      {/* Navbar preview */}
      <div className="border-b border-border bg-white/95 px-5 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-foreground leading-tight truncate">{name}</div>
          <div className="text-[10px] text-muted-foreground leading-tight truncate">{tagline}</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {["Beranda", "Berita", "Akademik"].map((l) => (
            <span key={l} className="text-[10px] text-foreground/50 hidden sm:block">{l}</span>
          ))}
          <span className="text-[10px] bg-primary text-primary-foreground rounded px-2 py-0.5 font-medium">
            Daftar
          </span>
        </div>
      </div>

      {/* Footer preview */}
      <div className="bg-slate-900 px-5 py-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-xs text-white leading-tight truncate">{name}</div>
                <div className="text-[9px] text-white/50 leading-tight truncate">{tagline}</div>
              </div>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{description}</p>
            {hasSocial && (
              <div className="flex gap-1.5 mt-2">
                {values.instagramUrl && (
                  <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <Instagram className="w-2.5 h-2.5 text-white/60" />
                  </div>
                )}
                {values.facebookUrl && (
                  <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <Facebook className="w-2.5 h-2.5 text-white/60" />
                  </div>
                )}
                {values.youtubeUrl && (
                  <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <Youtube className="w-2.5 h-2.5 text-white/60" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact column */}
          <div>
            <div className="text-[9px] font-semibold text-white/30 uppercase tracking-wider mb-2">Kontak</div>
            <div className="space-y-1.5">
              <div className="flex gap-1.5 items-start">
                <MapPin className="w-2.5 h-2.5 text-primary mt-0.5 shrink-0" />
                <span className="text-[10px] text-white/50 leading-tight line-clamp-2">{address}</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <Phone className="w-2.5 h-2.5 text-primary shrink-0" />
                <span className="text-[10px] text-white/50 truncate">{phone}</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <Mail className="w-2.5 h-2.5 text-primary shrink-0" />
                <span className="text-[10px] text-white/50 truncate">{email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <span className="text-[9px] text-white/25">
            © {new Date().getFullYear()} {name}. Hak cipta dilindungi.
          </span>
          {values.accreditation && (
            <span className="text-[9px] text-white/25">
              Terakreditasi {values.accreditation}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminProfil() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading } = useGetSchoolProfile();
  const updateProfile = useUpdateSchoolProfile();

  const form = useForm<ProfilForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", tagline: "", description: "", address: "",
      phone: "", email: "", website: "", npsn: "",
      accreditation: "", foundedYear: "",
      instagramUrl: "", facebookUrl: "", youtubeUrl: "",
    },
  });

  const watched = useWatch({ control: form.control });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        tagline: profile.tagline,
        description: profile.description,
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        website: profile.website ?? "",
        npsn: profile.npsn ?? "",
        accreditation: profile.accreditation ?? "",
        foundedYear: profile.foundedYear ?? "",
        instagramUrl: profile.instagramUrl ?? "",
        facebookUrl: profile.facebookUrl ?? "",
        youtubeUrl: profile.youtubeUrl ?? "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfilForm) => {
    const payload = {
      ...data,
      foundedYear: data.foundedYear !== "" ? Number(data.foundedYear) : undefined,
      website: data.website || undefined,
      npsn: data.npsn || undefined,
      accreditation: data.accreditation || undefined,
      instagramUrl: data.instagramUrl || undefined,
      facebookUrl: data.facebookUrl || undefined,
      youtubeUrl: data.youtubeUrl || undefined,
    };

    updateProfile.mutate({ data: payload }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSchoolProfileQueryKey() });
        toast({ title: "Profil sekolah berhasil disimpan!" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Profil Sekolah</h1>
        <p className="text-sm text-muted-foreground">
          Informasi ini ditampilkan di header, footer, dan seluruh halaman website.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 items-start">
        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            data-testid="form-school-profile"
          >
            <Section title="Identitas Sekolah" icon={School}>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Sekolah</FormLabel>
                  <FormControl>
                    <Input data-testid="input-school-name" placeholder="SMA Nusantara" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tagline" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline / Motto</FormLabel>
                  <FormControl>
                    <Input data-testid="input-school-tagline" placeholder="Unggul, Berkarakter, Berprestasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Singkat</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="input-school-description"
                      placeholder="Deskripsi singkat tentang sekolah..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="foundedYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Berdiri</FormLabel>
                    <FormControl>
                      <Input data-testid="input-school-founded" type="number" placeholder="1985" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="accreditation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Akreditasi</FormLabel>
                    <FormControl>
                      <select
                        data-testid="select-school-accreditation"
                        {...field}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">Pilih akreditasi</option>
                        <option value="A">A (Unggul)</option>
                        <option value="B">B (Baik Sekali)</option>
                        <option value="C">C (Baik)</option>
                        <option value="Tidak Terakreditasi">Tidak Terakreditasi</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="npsn" render={({ field }) => (
                <FormItem>
                  <FormLabel>NPSN</FormLabel>
                  <FormControl>
                    <Input data-testid="input-school-npsn" placeholder="20100001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            <Section title="Kontak & Alamat" icon={MapPin}>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="input-school-address"
                      placeholder="Jl. Pendidikan No. 12..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel><Phone className="w-3 h-3 inline mr-1" />Telepon</FormLabel>
                    <FormControl>
                      <Input data-testid="input-school-phone" placeholder="(021) 1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel><Mail className="w-3 h-3 inline mr-1" />Email</FormLabel>
                    <FormControl>
                      <Input data-testid="input-school-email" type="email" placeholder="info@sekolah.sch.id" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem>
                  <FormLabel><Globe className="w-3 h-3 inline mr-1" />Website (opsional)</FormLabel>
                  <FormControl>
                    <Input data-testid="input-school-website" placeholder="https://sekolah.sch.id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            <Section title="Media Sosial" icon={Share2}>
              <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input data-testid="input-school-instagram" placeholder="https://instagram.com/namasekolah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input data-testid="input-school-facebook" placeholder="https://facebook.com/namasekolah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube</FormLabel>
                  <FormControl>
                    <Input data-testid="input-school-youtube" placeholder="https://youtube.com/@namasekolah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Section>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                data-testid="button-save-profile"
                disabled={updateProfile.isPending}
                className="gap-2 px-6"
              >
                <Save className="w-4 h-4" />
                {updateProfile.isPending ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </div>
          </form>
        </Form>

        {/* Sticky live preview */}
        <div className="xl:sticky xl:top-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={JSON.stringify(watched)}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <LivePreview values={watched as ProfilForm} />
            </motion.div>
          </AnimatePresence>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Preview diperbarui otomatis saat Anda mengetik
          </p>
        </div>
      </div>
    </div>
  );
}
