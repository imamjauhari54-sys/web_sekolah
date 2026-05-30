import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CalendarDays, MapPin, Clock, ArrowLeft, Share2,
  CalendarRange, Tag, CheckCircle2, Timer, CalendarX
} from "lucide-react";
import { useGetEvent, useListEvents } from "@workspace/api-client-react";

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function shareEvent(title: string) {
  if (navigator.share) {
    void navigator.share({ title, url: window.location.href });
  } else {
    void navigator.clipboard.writeText(window.location.href);
    alert("Link disalin!");
  }
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function useCountdown(targetIso: string): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return timeLeft;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 min-w-[72px]">
      <span className="text-3xl font-bold tabular-nums text-primary leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-primary/70 font-medium mt-1">{label}</span>
    </div>
  );
}

export default function AcaraDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data: event, isLoading, isError } = useGetEvent(id);
  const { data: allEvents } = useListEvents({});

  const timeLeft = useCountdown(event?.date ?? new Date(0).toISOString());
  const isPast = event ? new Date(event.date) < new Date() : false;

  const related = allEvents
    ?.filter((e) => e.id !== id && e.category === event?.category)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="h-5 w-28 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-5 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-32 bg-muted rounded-2xl animate-pulse mt-6" />
          <div className="h-24 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="pt-24 pb-20 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CalendarX className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acara Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">Acara yang kamu cari tidak tersedia.</p>
          <Link
            href="/acara"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Acara
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href="/acara"
            data-testid="link-back-to-events"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Semua Acara
          </Link>
        </motion.div>

        {/* Status badge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-wrap items-center gap-2 mb-4">
          {event.category && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
              <Tag className="w-3 h-3" /> {event.category}
            </span>
          )}
          {isPast ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground">
              <CheckCircle2 className="w-3 h-3" /> Sudah Selesai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Timer className="w-3 h-3" /> Akan Datang
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-6"
          data-testid="event-title"
        >
          {event.title}
        </motion.h1>

        {/* Countdown — only show for upcoming events */}
        {!isPast && timeLeft && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/15"
            data-testid="event-countdown"
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" /> Hitung Mundur
            </p>
            <div className="flex gap-3 flex-wrap">
              <CountdownBox value={timeLeft.days} label="Hari" />
              <CountdownBox value={timeLeft.hours} label="Jam" />
              <CountdownBox value={timeLeft.minutes} label="Menit" />
              <CountdownBox value={timeLeft.seconds} label="Detik" />
            </div>
          </motion.div>
        )}

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
            <CalendarDays className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Tanggal</p>
              <p className="text-sm font-medium text-foreground leading-snug">{formatDateLong(event.date)}</p>
              {event.endDate && new Date(event.endDate).toDateString() !== new Date(event.date).toDateString() && (
                <p className="text-xs text-muted-foreground mt-0.5">s/d {formatDateLong(event.endDate)}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
            <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Waktu</p>
              <p className="text-sm font-medium text-foreground">
                {formatTime(event.date)}
                {event.endDate ? ` – ${formatTime(event.endDate)}` : " WIB"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Lokasi</p>
              <p className="text-sm font-medium text-foreground">{event.location}</p>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        {event.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mb-8"
            data-testid="event-description"
          >
            <h2 className="font-serif text-xl font-bold text-foreground mb-4">Tentang Acara</h2>
            <div className="prose max-w-none">
              {event.description.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i} className="text-base text-foreground/90 leading-[1.85] mb-4">{para}</p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share + back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center justify-between pt-6 border-t border-border"
        >
          <Link
            href="/acara"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <button
            data-testid="button-share-event"
            onClick={() => shareEvent(event.title)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Bagikan
          </button>
        </motion.div>

        {/* Related events */}
        {related && related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-14"
          >
            <h2 className="font-serif text-xl font-bold text-foreground mb-5 flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" /> Acara Terkait
            </h2>
            <div className="space-y-3">
              {related.map((rel) => {
                const relIsPast = new Date(rel.date) < new Date();
                return (
                  <Link
                    key={rel.id}
                    href={`/acara/${rel.id}`}
                    data-testid={`link-related-event-${rel.id}`}
                    className={`group flex gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${
                      relIsPast
                        ? "bg-muted/30 border-border opacity-70 hover:opacity-90"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${relIsPast ? "bg-muted" : "bg-primary/10"}`}>
                      <span className={`text-lg font-bold leading-none ${relIsPast ? "text-muted-foreground" : "text-primary"}`}>
                        {new Date(rel.date).getDate()}
                      </span>
                      <span className={`text-xs ${relIsPast ? "text-muted-foreground" : "text-primary/70"}`}>
                        {new Date(rel.date).toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{rel.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {rel.location}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
