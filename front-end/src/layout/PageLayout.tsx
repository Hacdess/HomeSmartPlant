import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";

export default function PageLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className={`min-h-screen text-foreground font-sans ${
      isDashboard  // nếu dashboard thì bg đơn sắc, không thì gradient
        ? 'bg-background' 
        : 'bg-gradient-to-br from-background via-background to-primary/20'
    }`}>
      <Header />
      <main className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 py-4 flex-grow">
        <Outlet/>
      </main>
      <Footer/>
    </div>
  );
};