import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function PageLayout() {
return (
  <div className="min-h-screen bg-background text-foreground font-sans">
    <Header />
    <main className="bg-background mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <Outlet/>
    </main>
    <Footer/>
  </div>
  );
};