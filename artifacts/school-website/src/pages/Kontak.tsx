import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subjek minimal 3 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

type ContactForm = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: MapPin,
    title: "Alamat",
    lines: ["Jl. Pendidikan No. 12", "Jakarta Selatan, DKI Jakarta 12345"],
  },
  {
    icon: Phone,
    title: "Telepon",
    lines: ["(021) 1234-5678", "(021) 8765-4321"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["info@smanusantara.sch.id", "pendaftaran@smanusantara.sch.id"],
  },
  {
    icon: Clock,
    title: "Jam Operasional",
    lines: ["Senin - Jumat: 07.00 - 16.00", "Sabtu: 07.00 - 12.00"],
  },
];

export default function Kontak() {
  const [submitted, setSubmitted] = useState(false);
  const submitContact = useSubmitContact();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactForm) => {
    submitContact.mutate(
      { data: { ...data, phone: data.phone ?? undefined } },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset();
        },
      }
    );
  };

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Hubungi Kami</div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Kontak & Informasi</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Kami siap membantu Anda. Kirim pesan atau hubungi kami langsung.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-5 rounded-2xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-card-foreground mb-1">{item.title}</div>
                  {item.lines.map((line) => (
                    <p key={line} className="text-sm text-muted-foreground">{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-border h-48 bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Peta Lokasi</p>
                <p className="text-xs">Jl. Pendidikan No. 12, Jakarta Selatan</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-card border border-border">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                </motion.div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Pesan Terkirim!</h2>
                <p className="text-muted-foreground mb-6">
                  Terima kasih telah menghubungi kami. Tim kami akan merespons dalam 1-2 hari kerja.
                </p>
                <Button
                  data-testid="button-kirim-lagi"
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Kirim Pesan Lain
                </Button>
              </div>
            ) : (
              <div className="p-7 rounded-2xl bg-card border border-border">
                <h2 className="font-serif text-xl font-bold text-card-foreground mb-6">Kirim Pesan</h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    data-testid="form-kontak"
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-name"
                                placeholder="Nama Anda"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-email"
                                type="email"
                                placeholder="email@contoh.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Telepon (opsional)</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-phone"
                                placeholder="08xx-xxxx-xxxx"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subjek</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-subject"
                                placeholder="Perihal pesan Anda"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pesan</FormLabel>
                          <FormControl>
                            <Textarea
                              data-testid="input-message"
                              placeholder="Tulis pesan Anda di sini..."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      data-testid="button-submit-kontak"
                      disabled={submitContact.isPending}
                      className="w-full"
                    >
                      {submitContact.isPending ? "Mengirim..." : "Kirim Pesan"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
