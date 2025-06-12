"use client";
import { useEffect, useState } from "react";
import Logo from "../Logo";
import SidebarItems from "./SidebarItems";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const sidebarWidth = "270px";

  if (isLargeScreen) {
    return (
      <div
        className={cn(
          "flex-shrink-0 transition-all duration-300",
          isSidebarOpen ? "w-[300px]" : "w-0"
        )}
      >
        {/* Modern Sidebar for desktop */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-r border-slate-700/30 transition-all duration-300 z-40 shadow-2xl",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ width: "300px" }}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />
          
          <div className="h-full flex flex-col relative">
            {/* Logo Section */}
            <div className="px-6 py-6 border-b border-slate-700/30 bg-slate-800/30 backdrop-blur-sm">
              <Logo />
            </div>
            
            {/* Sidebar Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <SidebarItems />
            </div>

            {/* Modern Footer */}
            <div className="p-6 border-t border-slate-700/30 bg-slate-800/30 backdrop-blur-sm">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50" />
                    <span className="text-sm font-medium text-slate-200">System Status</span>
                  </div>
                  <p className="text-xs text-slate-400">All services operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && onSidebarClose({} as React.MouseEvent<HTMLElement>)}>
      <SheetContent side="left" className="w-[300px] p-0 bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 text-white border-slate-700/30 backdrop-blur-xl">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        
        <div className="h-full flex flex-col relative">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-slate-700/30 bg-slate-800/30 backdrop-blur-sm">
            <Logo />
          </div>
          
          {/* Sidebar For Mobile */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <SidebarItems />
          </div>

          {/* Mobile Footer */}
          <div className="p-6 border-t border-slate-700/30 bg-slate-800/30 backdrop-blur-sm">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50" />
                  <span className="text-sm font-medium text-slate-200">System Status</span>
                </div>
                <p className="text-xs text-slate-400">All services operational</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
