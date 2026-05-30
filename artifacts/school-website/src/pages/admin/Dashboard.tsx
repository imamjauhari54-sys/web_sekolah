import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Newspaper,
  CalendarDays,
  BookOpen,
  Image,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useGetStats, useListNews, useListContactMessages, useGetSchoolProfile } from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const { data: stats } = useGetStats();
  const { data: news } = useListNews({ limit: 5 });
  const { data: messages } = useListContactMessages();
  const { data: profile } = useGetSchoolProfile();
  const schoolName = profile?.name ?? "Sekolah Kami";

  const quickLinks = [
    { href: "/admin/berita", label: "Kelola Berita", icon: Newspaper, color: "bg-blue-50 text-blue-600", count: stats?.recentNewsCount },
    { href: "/admin/acara", label: "Kelola Acara", icon: CalendarDays, color: "bg-emerald-50 text-emerald-600", count: stats?.upcomingEventsCount },
    { href: "/admin/program", label: "Kelola Program", icon: BookOpen, color: "bg-violet-50 text-violet-600", count: stats?.totalPrograms },
    { href: "/admin/galeri", label: "Kelola Galeri", icon: Image, color: "bg-amber-50 text-amber-600", count: null },
    { href: "/admin/pesan", label: "Pesan Masuk", icon: MessageSquare, color: "bg-rose-50 text-rose-600", count: messages?.length },
  ];

  const statCards = [
    { label: "Total Siswa", value: stats?.totalStudents?.toLocaleString("id-ID") ?? "—", icon: TrendingUp, change: "+12 bulan ini" },
    { label: "Tenaga Pengajar", value: stats?.totalTeachers?.toLocaleString("id-ID") ?? "—", icon: TrendingUp, change: "Aktif" },
    { label: "Program Studi", value: stats?.totalPrograms?.toLocaleString("id-ID") ?? "—", icon: BookOpen, change: "Aktif" },
    { label: "Pesan Masuk", value: messages?.length?.toLocaleString("id-ID") ?? "0", icon: MessageSquare, change: "Total pesan" },
  ];

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Selamat Datang</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola konten website {schoolName} dari sini.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl border border-border p-5 shadow-sm"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{card.label}</div>
            <div className="text-3xl font-bold text-foreground" data-testid={`admin-stat-${card.label}`}>
              {card.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{card.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Link
                href={link.href}
                data-testid={`admin-quick-${link.href.split("/").pop()}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-sm transition-all text-center"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${link.color}`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{link.label}</div>
                  {link.count != null && (
                    <div className="text-xs text-muted-foreground mt-0.5">{link.count} item</div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent news */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Berita Terbaru</h3>
            <Link href="/admin/berita" className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
              Kelola <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {news?.slice(0, 4).map((article) => (
              <div key={article.id} data-testid={`admin-recent-news-${article.id}`} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(article.publishedAt)}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">{article.category}</span>
              </div>
            ))}
            {(!news || news.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada berita.</p>
            )}
          </div>
        </div>

        {/* Recent messages */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Pesan Terbaru</h3>
            <Link href="/admin/pesan" className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {messages?.slice(0, 4).map((msg) => (
              <div key={msg.id} data-testid={`admin-recent-msg-${msg.id}`} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-primary">{msg.name[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{msg.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            ))}
            {(!messages || messages.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
