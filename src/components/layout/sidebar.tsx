import React, { useState } from "react";
import { useSidebar } from "~/hooks/useSidebar";
import { SideNav } from "./side-nav";
import { AnggaranNav, PembangunanNav, SuperAdminNav } from "../constants/side-nav";

interface SidebarProps {
  className?: string;
  data: any
}

export default function Sidebar({ className, data }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = () => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 500);
  };

  const navItems = () => {
    switch (data.user.role) {
      case 'superadmin':
        return SuperAdminNav;
      case 'admin':
        return SuperAdminNav;
      case 'anggaran':
        return AnggaranNav;
      case 'pembangunan':
        return PembangunanNav;
      default:
        return SuperAdminNav;
    }
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="my-5">
          <img className="h-[200px] items-center m-auto" alt='logo' src="/logo.png" />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <SideNav
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              items={navItems()}
            />
          </nav>
        </div>
        {/* <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div> */}
      </div>
    </div>
  );
}
