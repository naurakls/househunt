import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppNavbar from "./AppNavbar";
import Footer from "./Footer";
import PageLoader from "../common/PageLoader";

// Halaman dashboard & pesan tidak memakai footer agar ruang kerjanya lebih lega
const NO_FOOTER = /^\/(renter|owner|admin|messages)/;

export default function MainLayout() {
  const { pathname } = useLocation();

  // Kembali ke atas setiap pindah halaman
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <AppNavbar />
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {!NO_FOOTER.test(pathname) && <Footer />}
    </>
  );
}
