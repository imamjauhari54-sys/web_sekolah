import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="font-serif text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            data-testid="link-back-home"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            data-testid="button-go-back"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Halaman Sebelumnya
          </button>
        </div>
      </motion.div>
    </div>
  );
}
