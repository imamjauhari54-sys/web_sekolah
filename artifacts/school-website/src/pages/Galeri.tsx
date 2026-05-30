import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image } from "lucide-react";
import { useListGallery, useGetSchoolProfile } from "@workspace/api-client-react";

const allCategories = ["Semua", "Akademik", "Olahraga", "Seni & Budaya", "Fasilitas", "Kegiatan", "Prestasi"];

export default function Galeri() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);

  const { data: gallery, isLoading } = useListGallery({
    category: activeCategory === "Semua" ? undefined : activeCategory,
  });
  const { data: profile } = useGetSchoolProfile();
  const schoolName = profile?.name ?? "Sekolah kami";

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Dokumentasi</div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Galeri Foto</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Momen-momen berharga dari kehidupan akademik dan kegiatan siswa {schoolName}.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {allCategories.map((cat) => (
            <button
              key={cat}
              data-testid={`filter-gallery-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : gallery?.length === 0 ? (
          <div className="text-center py-24">
            <Image className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada foto dalam kategori ini.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {gallery?.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                data-testid={`gallery-item-${item.id}`}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl"
                onClick={() => setLightbox({ src: item.imageUrl, title: item.title })}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                  <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-medium leading-tight">{item.title}</p>
                    <p className="text-white/70 text-xs">{item.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              data-testid="button-lightbox-close"
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              onClick={() => setLightbox(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightbox.src}
              alt={lightbox.title}
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm text-center">
              {lightbox.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
