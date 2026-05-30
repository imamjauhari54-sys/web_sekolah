import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useListEvents } from "@workspace/api-client-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function Acara() {
  const [tab, setTab] = useState<"upcoming" | "all">("upcoming");

  const { data: upcomingEvents, isLoading: upcomingLoading } = useListEvents({ upcoming: true });
  const { data: allEvents, isLoading: allLoading } = useListEvents({});

  const isLoading = tab === "upcoming" ? upcomingLoading : allLoading;
  const events = tab === "upcoming" ? upcomingEvents : allEvents;

  const now = new Date();
  const pastEvents = allEvents?.filter((e) => new Date(e.date) < now) ?? [];
  const futureEvents = allEvents?.filter((e) => new Date(e.date) >= now) ?? [];

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Kalender</div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Acara & Kegiatan</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Pantau jadwal kegiatan, lomba, seminar, dan acara resmi sekolah.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-center">
            <div className="text-2xl font-bold text-primary">{futureEvents.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Acara Mendatang</div>
          </div>
          <div className="p-4 rounded-xl bg-muted border border-border text-center">
            <div className="text-2xl font-bold text-foreground">{pastEvents.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Acara Selesai</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            data-testid="tab-upcoming"
            onClick={() => setTab("upcoming")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "upcoming" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Mendatang
          </button>
          <button
            data-testid="tab-all"
            onClick={() => setTab("all")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Semua Acara
          </button>
        </div>

        {/* Event List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-24">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada acara yang ditemukan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events?.map((event, i) => {
              const isPast = new Date(event.date) < now;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={`/acara/${event.id}`}
                    data-testid={`card-event-${event.id}`}
                    className={`group flex gap-4 p-5 rounded-2xl border transition-all block ${
                      isPast
                        ? "bg-muted/30 border-border opacity-70 hover:opacity-90"
                        : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                    }`}
                  >
                    {/* Date Block */}
                    <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      isPast ? "bg-muted" : "bg-primary/10"
                    }`}>
                      <span className={`text-2xl font-bold leading-none ${isPast ? "text-muted-foreground" : "text-primary"}`}>
                        {new Date(event.date).getDate()}
                      </span>
                      <span className={`text-xs mt-0.5 ${isPast ? "text-muted-foreground" : "text-primary/70"}`}>
                        {new Date(event.date).toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                      <span className={`text-xs ${isPast ? "text-muted-foreground" : "text-primary/60"}`}>
                        {new Date(event.date).getFullYear()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="flex gap-2 items-center shrink-0">
                          {event.category && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isPast ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                            }`}>{event.category}</span>
                          )}
                          {isPast && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Selesai</span>
                          )}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(event.date)}{event.endDate ? ` - ${formatTime(event.endDate)}` : ""}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-2.5 group-hover:gap-1.5 transition-all">
                        Lihat Detail <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
