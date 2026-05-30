import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Tag, Search, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useListNews, useGetSchoolProfile } from "@workspace/api-client-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const categories = ["Semua", "Akademik", "Olahraga", "Seni & Budaya", "Prestasi", "Pengumuman", "Umum"];

export default function Berita() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: news, isLoading } = useListNews({ limit: 50 });
  const { data: profile } = useGetSchoolProfile();
  const schoolName = profile?.name ?? "Sekolah kami";

  const filtered = news?.filter((article) => {
    const matchCategory = activeCategory === "Semua" || article.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Informasi</div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Berita & Pengumuman</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Informasi terkini seputar kegiatan, prestasi, dan pengumuman resmi {schoolName}.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-testid="input-search-berita"
            type="search"
            placeholder="Cari berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              data-testid={`filter-category-${cat}`}
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

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-24">
            <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada berita yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                data-testid={`card-article-${article.id}`}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <Link href={`/berita/${article.id}`} className="block">
                  {article.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {article.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <h2 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                    )}
                    <span
                      data-testid={`button-read-more-${article.id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold group-hover:gap-1.5 transition-all"
                    >
                      Baca Selengkapnya <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
