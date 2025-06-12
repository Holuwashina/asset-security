import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import Profile from './Profile';
import { Menu, Bell, Search, Command, Zap, Activity } from 'lucide-react';

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/20 bg-white/80 backdrop-blur-xl shadow-sm">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white/40 to-purple-50/30 pointer-events-none" />
      
      <div className="relative flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="lg:hidden hover:bg-blue-100/50 rounded-xl transition-all duration-300 hover:scale-105"
            aria-label="menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </Button>

          {/* Modern breadcrumb/title area */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200/30">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Asset Classification System</span>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Search assets, risks, or reports..."
              className="w-full pl-10 pr-4 py-2 bg-white/60 border-slate-200/50 rounded-xl focus:bg-white/80 focus:border-blue-300 transition-all duration-300 backdrop-blur-sm"
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setIsSearchOpen(false)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100/80 rounded border border-slate-200/50">
                <Command className="h-3 w-3 mr-1" />
                K
              </kbd>
            </div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-blue-100/50 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Search className="h-5 w-5 text-slate-700" />
          </Button>

          {/* Quick actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105 text-slate-600 hover:text-slate-800"
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Scan
            </Button>
          </div>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-blue-100/50 rounded-xl transition-all duration-300 hover:scale-105 group"
          >
            <Bell className="h-5 w-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-sm" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-400 rounded-full animate-ping" />
          </Button>
          
          <Profile />
        </div>
      </div>

      {/* Modern progress bar (optional - shows system activity) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 animate-pulse" />
    </header>
  );
};

export default Header;
