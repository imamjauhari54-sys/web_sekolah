import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetSchoolProfile } from "@workspace/api-client-react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/berita", label: "Berita" },
  { href: "/akademik", label: "Akademik" },
  { href: "/galeri", label: "Galeri" },
  { href: "/acara", label: "Acara" },
  { href: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: profile } = useGetSchoolProfile();

  const name = profile?.name ?? "SMA Nusantara";
  const tagline = profile?.tagline ?? "Unggul, Berkarakter, Berprestasi";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              {profile?.logoUrl ? (
                <img src={profile.logoUrl} alt={name} className="w-6 h-6 object-contain rounded" />
              ) : (
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <div className="font-bold text-base leading-tight text-foreground">{name}</div>
              <div className="text-xs text-muted-foreground leading-tight hidden sm:block">{tagline}</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`nav-link-${link.href.replace("/", "") || "home"}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/kontak"
              data-testid="button-daftar"
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Daftar Sekarang
            </Link>
            <button
              data-testid="button-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`mobile-nav-${link.href.replace("/", "") || "home"}`}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/kontak"
                className="block mt-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center"
              >
                Daftar Sekarang
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
