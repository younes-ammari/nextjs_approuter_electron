
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "./Navbar";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { toast } = useToast();

  // Page transition effect
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('animate-fade-in');
      void mainContent.offsetWidth; // Trigger reflow
      mainContent.classList.add('animate-fade-in');
    }
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Navbar />
        <main 
          id="main-content"
          className="flex-1 px-4 md:px-6 pb-8 pt-20 animate-fade-in overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
