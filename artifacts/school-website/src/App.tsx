import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Berita from "@/pages/Berita";
import Akademik from "@/pages/Akademik";
import Galeri from "@/pages/Galeri";
import Acara from "@/pages/Acara";
import Kontak from "@/pages/Kontak";
import BeritaDetail from "@/pages/BeritaDetail";
import AcaraDetail from "@/pages/AcaraDetail";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminBerita from "@/pages/admin/Berita";
import AdminAcara from "@/pages/admin/Acara";
import AdminProgram from "@/pages/admin/Program";
import AdminGaleri from "@/pages/admin/Galeri";
import AdminPesan from "@/pages/admin/Pesan";
import AdminProfil from "@/pages/admin/Profil";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />
      <Route path="/berita" component={() => <PublicLayout><Berita /></PublicLayout>} />
      <Route path="/berita/:id" component={() => <PublicLayout><BeritaDetail /></PublicLayout>} />
      <Route path="/akademik" component={() => <PublicLayout><Akademik /></PublicLayout>} />
      <Route path="/galeri" component={() => <PublicLayout><Galeri /></PublicLayout>} />
      <Route path="/acara" component={() => <PublicLayout><Acara /></PublicLayout>} />
      <Route path="/acara/:id" component={() => <PublicLayout><AcaraDetail /></PublicLayout>} />
      <Route path="/kontak" component={() => <PublicLayout><Kontak /></PublicLayout>} />

      <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/berita" component={() => <AdminLayout><AdminBerita /></AdminLayout>} />
      <Route path="/admin/acara" component={() => <AdminLayout><AdminAcara /></AdminLayout>} />
      <Route path="/admin/program" component={() => <AdminLayout><AdminProgram /></AdminLayout>} />
      <Route path="/admin/galeri" component={() => <AdminLayout><AdminGaleri /></AdminLayout>} />
      <Route path="/admin/pesan" component={() => <AdminLayout><AdminPesan /></AdminLayout>} />
      <Route path="/admin/profil" component={() => <AdminLayout><AdminProfil /></AdminLayout>} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
