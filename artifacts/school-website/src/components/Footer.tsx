import { Link } from "wouter";
import { GraduationCap, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Globe } from "lucide-react";
import { useGetSchoolProfile } from "@workspace/api-client-react";

export default function Footer() {
  const { data: profile } = useGetSchoolProfile();

  const name = profile?.name ?? "SMA Nusantara";
  const tagline = profile?.tagline ?? "Unggul, Berkarakter, Berprestasi";
  const description = profile?.description ?? "Membentuk generasi Indonesia yang cerdas, berkarakter, dan siap menghadapi tantangan global.";
  const address = profile?.address ?? "Jl. Pendidikan No. 12, Jakarta Selatan";
  const phone = profile?.phone ?? "(021) 1234-5678";
  const email = profile?.email ?? "info@smanusantara.sch.id";
  const accreditation = profile?.accreditation;

  const socials = [
    profile?.instagramUrl ? { icon: Instagram, label: "Instagram", href: profile.instagramUrl } : null,
    profile?.facebookUrl ? { icon: Facebook, label: "Facebook", href: profile.facebookUrl } : null,
    profile?.youtubeUrl ? { icon: Youtube, label: "YouTube", href: profile.youtubeUrl } : null,
    profile?.website ? { icon: Globe, label: "Website", href: profile.website } : null,
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; href: string }[];

  const displaySocials = socials.length > 0
    ? socials
    : [
        { icon: Instagram, label: "Instagram", href: "#" },
        { icon: Facebook, label: "Facebook", href: "#" },
        { icon: Youtube, label: "YouTube", href: "#" },
      ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt={name} className="w-7 h-7 object-contain rounded" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <div className="font-bold text-lg text-secondary-foreground">{name}</div>
                <div className="text-xs text-secondary-foreground/60">{tagline}</div>
              </div>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed max-w-sm">{description}</p>
            <div className="flex gap-3 mt-5">
              {displaySocials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-secondary-foreground/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-secondary-foreground/70" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary-foreground/50 mb-4">Navigasi</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Beranda" },
                { href: "/berita", label: "Berita & Pengumuman" },
                { href: "/akademik", label: "Program Akademik" },
                { href: "/galeri", label: "Galeri" },
                { href: "/acara", label: "Acara & Kegiatan" },
                { href: "/kontak", label: "Kontak Kami" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary-foreground/50 mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex gap-2.5 text-sm text-secondary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>{address}</span>
              </li>
              <li className="flex gap-2.5 text-sm text-secondary-foreground/70">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <a href={`tel:${phone}`} className="hover:text-primary transition-colors">{phone}</a>
              </li>
              <li className="flex gap-2.5 text-sm text-secondary-foreground/70">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-secondary-foreground/40">
            &copy; {new Date().getFullYear()} {name}. Hak cipta dilindungi.
          </p>
          {accreditation && (
            <p className="text-xs text-secondary-foreground/40">
              Terakreditasi {accreditation} oleh BAN-S/M
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
