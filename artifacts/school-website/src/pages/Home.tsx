import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Users, BookOpen, Trophy, Calendar, ChevronRight } from "lucide-react";
import { useGetStats, useListNews, useListEvents, useListPrograms, useGetSchoolProfile } from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function Home() {
  const { data: stats } = useGetStats();
  const { data: news, isLoading: newsLoading } = useListNews({ limit: 3 });
  const { data: events, isLoading: eventsLoading } = useListEvents({ upcoming: true });
  const { data: programs, isLoading: programsLoading } = useListPrograms();
  const { data: profile } = useGetSchoolProfile();
  const schoolName = profile?.name ?? "Sekolah Kami";
  const schoolDesc = profile?.description ?? "Hadir untuk membentuk karakter, mengasah kecerdasan, dan mempersiapkan siswa menghadapi masa depan dengan percaya diri.";

  const statCards = [
    { icon: Users, label: "Siswa Aktif", value: stats?.totalStudents?.toLocaleString("id-ID") ?? "—" },
    { icon: BookOpen, label: "Tenaga Pengajar", value: stats?.totalTeachers?.toLocaleString("id-ID") ?? "—" },
    { icon: Trophy, label: "Program Studi", value: stats?.totalPrograms?.toLocaleString("id-ID") ?? "—" },
    { icon: Calendar, label: "Tahun Berdiri", value: stats ? `${new Date().getFullYear() - (stats.yearsEstablished ?? 0)}` : "—" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(162,72%,38%,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(162,72%,38%,0.08)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Pendaftaran Tahun Ajaran 2025/2026 Dibuka
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-foreground leading-tight mb-6"
          >
            Tempat Generasi
            <span className="text-primary block">Terbaik Tumbuh</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {schoolDesc}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/kontak"
              data-testid="button-hero-daftar"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Daftar Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/akademik"
              data-testid="button-hero-akademik"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-secondary-foreground/20 text-secondary-foreground/80 font-semibold hover:bg-secondary-foreground/5 transition-colors"
            >
              Lihat Program
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-secondary-foreground/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-secondary-foreground/30" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-primary-foreground/70" />
                </div>
                <div className="text-3xl font-bold text-primary-foreground" data-testid={`stat-value-${stat.label}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/70 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Program Unggulan</div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">Akademik Berkualitas</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Kurikulum terstruktur yang mempersiapkan siswa untuk universitas terkemuka di Indonesia dan luar negeri.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
                ))
              : programs?.slice(0, 3).map((prog, i) => (
                  <motion.div
                    key={prog.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    data-testid={`card-program-${prog.id}`}
                    className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{prog.level}</div>
                    <h3 className="font-semibold text-lg text-card-foreground mb-2">{prog.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prog.description}</p>
                    {prog.duration && (
                      <div className="mt-3 text-xs text-muted-foreground">{prog.duration}</div>
                    )}
                  </motion.div>
                ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/akademik"
              data-testid="link-all-programs"
              className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:gap-2.5 transition-all"
            >
              Lihat Semua Program <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* News */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">Terkini</div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Berita & Pengumuman</h2>
                </div>
                <Link href="/berita" className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Lihat Semua <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {newsLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                    ))
                  : news?.length === 0
                  ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">Belum ada berita.</div>
                  )
                  : news?.map((article, i) => (
                      <motion.article
                        key={article.id}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        data-testid={`card-news-${article.id}`}
                        className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{article.category}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
                          </div>
                          <h3 className="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.excerpt}</p>
                          )}
                        </div>
                      </motion.article>
                    ))}
              </div>
            </div>

            {/* Events */}
            <div>
              <div className="mb-8">
                <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">Jadwal</div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Acara Mendatang</h2>
              </div>
              <div className="space-y-3">
                {eventsLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                    ))
                  : events?.length === 0
                  ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">Tidak ada acara mendatang.</div>
                  )
                  : events?.slice(0, 4).map((event, i) => (
                      <motion.div
                        key={event.id}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        data-testid={`card-event-${event.id}`}
                        className="flex gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-primary leading-none">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-xs text-primary/70">
                            {new Date(event.date).toLocaleDateString("id-ID", { month: "short" })}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-card-foreground line-clamp-1">{event.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{event.location}</div>
                        </div>
                      </motion.div>
                    ))}
              </div>
              <Link
                href="/acara"
                data-testid="link-all-events"
                className="block text-center mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Lihat Semua Acara
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-secondary-foreground mb-4">
              Bergabung dengan Keluarga {schoolName}
            </h2>
            <p className="text-secondary-foreground/70 mb-8 leading-relaxed">
              Jadilah bagian dari ribuan alumni yang berhasil meraih mimpi mereka. Pendaftaran tahun ajaran baru telah dibuka.
            </p>
            <Link
              href="/kontak"
              data-testid="button-cta-daftar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
            >
              Hubungi Kami Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
