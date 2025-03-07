"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Package, ShoppingCart, BarChart2, User, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
  const { open, setOpen } = useSidebar();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const links = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/inventory", label: "Inventory", icon: Package },
    { to: "/sales", label: "Sales", icon: ShoppingCart },
    { to: "/customers", label: "Customers", icon: User },
    { to: "/reports", label: "Reports", icon: BarChart2 },
  ];

  return (
    <div className="fixed top-0 left-0 z-30 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
              className="md:hidden"
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          )}
          <h1 className="font-semibold text-lg md:text-xl">MobileStock</h1>
        </div>
        <nav className="hidden ml-8 md:flex items-center gap-1 lg:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                href={link.to}
                className={cn(
                  "group inline-flex h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "bg-transparent transparent-foreground"
                )}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto"></div>
      </div>
    </div>
  );
};

export default Navbar;
