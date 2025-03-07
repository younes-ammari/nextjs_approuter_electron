"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "../Navbar";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const { toast } = useToast();

  // Page transition effect
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('animate-fade-in');
      void mainContent.offsetWidth; // Trigger reflow
      mainContent.classList.add('animate-fade-in');
    }
  }, [pathname]);

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
