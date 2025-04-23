'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CoinsIcon, HomeIcon, ShieldCheckIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Logo from './Logo';

const buttonVariants = cva(
  "flex items-center gap-4 p-4 text-sm font-medium transition-colors hover:bg-accent",
  {
    variants: {
      variant: {
        sidebarItem: "bg-transparent text-muted-foreground hover:text-primary",
        sidebarActiveItem: "bg-accent text-primary",
      },
    },
    defaultVariants: {
      variant: "sidebarItem",
    },
  }
);

type Route = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

const routes: Route[] = [
  { href: "/main/home",      label: "Home",     icon: HomeIcon },
  { href: "/main/dashboard", label: "Dashboard",icon: ShieldCheckIcon },
  { href: "/main/profile/me",label: "Profile",  icon: CoinsIcon },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeHref, setActiveHref] = useState(pathname);

  // Keep our local state in sync if user navigates via other means (e.g. browser back)
  useEffect(() => {
    setActiveHref(pathname);
  }, [pathname]);

  const handleClick = (href: string) => {
    setActiveHref(href);
    router.push(href);
  };

  return (
    <div className="hidden md:block w-[280px] h-screen bg-purple-50 border-r">
      <div className="flex items-center justify-center p-4 border-b">
        <Logo />
      </div>
      <nav className="flex flex-col">
        {routes.map(route => (
          <button
            key={route.href}
            onClick={() => handleClick(route.href)}
            className={buttonVariants({
              variant: activeHref === route.href 
                ? "sidebarActiveItem" 
                : "sidebarItem"
            })}
          >
            <route.icon size={20} />
            {route.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
