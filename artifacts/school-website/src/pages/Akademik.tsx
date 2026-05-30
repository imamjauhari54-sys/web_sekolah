import { motion } from "framer-motion";
import { BookOpen, Clock, Award, Smile } from "lucide-react";
import { useListPrograms, useGetSchoolProfile } from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const levelColors: Record<string, string> = {
  "Mata Pelajaran Inti": "bg-blue-50 text-blue-700 border-blue-100",
  "Pengembangan": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Ekstrakurikuler": "bg-amber-50 text-amber-700 border-amber-100",
};

export default function Akademik() {
  const { data: programs, isLoading } = useListPrograms();
  const { data: profile } = useGetSchoolProfile();

  const accreditation = profile?.accreditation ? `Akreditasi ${profile.accreditation}` : "Akreditasi A";
  const accrDesc = profile?.accreditation
    ? `Terakreditasi ${profile.accreditation} oleh BAN-S/M — standar tertinggi nasional`
    : "Terakreditasi A oleh BAN-S/M — standar tertinggi nasional";

  const grouped = programs?.reduce<Record<string, typeof programs>>((acc, prog) => {
    const level = prog.level ?? "Lainnya";
    if (!acc[level]) acc[level] = [];
    acc[level].push(prog);
    return acc;
  }, {});

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Kurikulum</div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Program Akademik</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
            Program pembelajaran yang dirancang untuk menumbuhkan kecerdasan, karakter, dan kreativitas anak
            melalui pendekatan yang menyenangkan dan bermakna.
          </p>
        </motion.div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: Award, title: accreditation, desc: accrDesc },
            { icon: BookOpen, title: "Kurikulum Merdeka", desc: "Mengadopsi Kurikulum Merdeka dengan pendekatan pembelajaran yang berpusat pada murid" },
            { icon: Smile, title: "Belajar Sambil Bermain", desc: "Metode pembelajaran aktif dan menyenangkan yang sesuai dengan tahap perkembangan anak SD" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex gap-4 p-5 rounded-2xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-card-foreground text-sm mb-1">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Programs by Level */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : programs?.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">Belum ada program yang tersedia.</div>
        ) : grouped ? (
          Object.entries(grouped).map(([level, progs]) => (
            <div key={level} className="mb-12">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border">
                {level}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {progs.map((prog, i) => (
                  <motion.div
                    key={prog.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    data-testid={`card-program-${prog.id}`}
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${levelColors[level] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {prog.level}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
                      {prog.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{prog.description}</p>
                    {prog.duration && (
                      <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{prog.duration}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
