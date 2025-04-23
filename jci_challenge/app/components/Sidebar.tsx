"use client";

import { CoinsIcon, HomeIcon, Layers2Icon, ShieldCheckIcon } from 'lucide-react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define button variants with TypeScript types
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
  {
    href: "/main/home",
    label: "Home",
    icon: HomeIcon
  },
  {
    href: "/main/dashboard",
    label: "Dashboard",
    icon: ShieldCheckIcon
  },
  {
    href: "/main/profile/me",
    label: "Profile",
    icon: CoinsIcon
  },
];

function DesktopSidebar() {
  const pathName = usePathname();
  
  // Improved active route detection with TypeScript type guard
  const activeRoute = routes.find((route): route is Route => 
    pathName === route.href || pathName.startsWith(`${route.href}/`)
  ) || routes[0];

  return (
    <div className='hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-hidden 
    w-full bg-purple-700/5 dark:bg-secondary/30 dark:text-foreground 
    border-r-2 border-separate'>
      <div className="flex items-center justify-center gap-2 border-b-[1px] border-separate p-4 ">
        <Logo/>
      </div>
      <div className="flex flex-col">
        {routes.map((route) => (
          <Link 
            key={route.href} 
            href={route.href}
            className={buttonVariants({
              variant: activeRoute.href === route.href 
                ? "sidebarActiveItem" 
                : "sidebarItem"
            })}
          >
            <route.icon size={20} />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DesktopSidebar;