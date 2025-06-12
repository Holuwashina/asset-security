import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  description?: string;
  icon?: any;
  href?: any;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
}

const NavItem = ({ item, level, pathDirect, onClick }: ItemType) => {
  const Icon = item.icon;
  const isActive = pathDirect === item.href;
  
  return (
    <div className="w-full" key={item.id}>
      <Link
        href={item.href}
        target={item.external ? "_blank" : ""}
        onClick={onClick}
        className={cn(
          "group flex items-start w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out mb-2 relative overflow-hidden",
          "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:shadow-lg hover:shadow-blue-500/10 hover:border hover:border-blue-500/30",
          isActive
            ? "text-white bg-gradient-to-r from-blue-600/30 to-purple-600/30 shadow-lg shadow-blue-500/20 border border-blue-500/40 backdrop-blur-sm"
            : "hover:scale-[1.02] border border-transparent",
          item.disabled ? "opacity-50 cursor-not-allowed" : ""
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full" />
        )}
        
        <div className="mr-3 flex-shrink-0 transition-all duration-300 group-hover:scale-110 mt-0.5">
          {Icon && (
            <Icon
              size="1.2rem"
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isActive
                  ? "text-blue-300 drop-shadow-sm"
                  : "text-slate-400 group-hover:text-blue-300 group-hover:drop-shadow-sm"
              )}
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium transition-colors duration-300 leading-tight",
            isActive ? "text-white" : "text-slate-300 group-hover:text-white"
          )}>
            {item.title}
          </div>
          {item.description && (
            <div className={cn(
              "text-xs mt-1 transition-colors duration-300 leading-relaxed",
              isActive
                ? "text-blue-100/80"
                : "text-slate-500 group-hover:text-slate-300"
            )}>
              {item.description}
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="ml-2 flex-shrink-0 self-start mt-1">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse shadow-sm" />
          </div>
        )}
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </Link>
    </div>
  );
};

export default NavItem;
