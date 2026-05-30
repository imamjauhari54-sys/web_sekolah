import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowLeft, Share2, Clock, Newspaper } from "lucide-react";
import { useGetNews, useListNews, useGetSchoolProfile } from "@workspace/api-client-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

function shareArticle(title: string) {
  if (navigator.share) {
    void navigator.share({ title, url: window.location.href });
  } else {
    void navigator.clipboard.writeText(window.location.href);
    alert("Link disalin ke clipboard!");
  }
}

export default function BeritaDetail() {
  const { data: profile } = useGetSchoolProfile();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data: article, isLoading, isError } = useGetNews(id);

  const { data: allNews } = useListNews({ limit: 10 });
  const related = allNews
    ?.filter((a) => a.id !== id && a.category === article?.category)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="h-8 w-32 bg-muted rounded-lg animate-pulse mb-8" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded-xl animate-pulse" />
            <div className="h-10 w-3/4 bg-muted rounded-xl animate-pulse" />
            <div className="h-5 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="aspect-video bg-muted rounded-2xl animate-pulse mt-6" />
            <div className="space-y-3 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="pt-24 pb-20 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Berita Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">Artikel yang kamu cari tidak tersedia atau sudah dihapus.</p>
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Berita
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = article.content.split(/\n+/).filter(Boolean);

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href="/berita"
            data-testid="link-back-to-news"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Semua Berita
          </Link>
        </motion.div>

        {/* Category + Date */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center gap-3 mb-4"
        >
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
            <Tag className="w-3 h-3" /> {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" /> {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" /> {readingTime(article.content)}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4"
          data-testid="article-title"
        >
          {article.title}
        </motion.h1>

        {/* Excerpt */}
        {article.excerpt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary/40 pl-4 italic"
          >
            {article.excerpt}
          </motion.p>
        )}

        {/* Share */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="flex items-center justify-between pb-6 border-b border-border mb-8"
        >
          <span className="text-xs text-muted-foreground">{profile?.name ?? "Sekolah"}</span>
          <button
            data-testid="button-share-article"
            onClick={() => shareArticle(article.title)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Bagikan
          </button>
        </motion.div>

        {/* Hero image */}
        {article.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl overflow-hidden mb-10 shadow-lg"
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full aspect-video object-cover"
              data-testid="article-hero-image"
            />
          </motion.div>
        )}

        {/* Article body */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-slate max-w-none"
          data-testid="article-content"
        >
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-base text-foreground/90 leading-[1.85] mb-5"
            >
              {para}
            </p>
          ))}
        </motion.div>

        {/* Footer divider */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Diterbitkan oleh</p>
              <p className="text-sm font-semibold text-foreground">{profile?.name ?? "Sekolah"}</p>
            </div>
            <button
              onClick={() => shareArticle(article.title)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Bagikan Artikel
            </button>
          </div>
        </div>

        {/* Related articles */}
        {related && related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-14"
          >
            <h2 className="font-serif text-xl font-bold text-foreground mb-6">Berita Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/berita/${rel.id}`}
                  data-testid={`link-related-article-${rel.id}`}
                  className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                >
                  {rel.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-xs font-medium text-primary">{rel.category}</span>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-1 line-clamp-2 leading-snug">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(rel.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to list */}
        <div className="mt-12 text-center">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:border-primary/40 hover:text-primary transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Semua Berita
          </Link>
        </div>

      </div>
    </div>
  );
}
