import React from 'react';

type NavGroup = {
  navlabel?: boolean;
  subheader?: string;
};

interface ItemType {
  item: NavGroup;
}

const NavGroup = ({ item }: ItemType) => {
  return (
    <div className="mt-8 mb-6 px-4">
      <div className="relative">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-px bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent flex-1" />
          <div className="relative">
            <h6 className="text-xs font-bold uppercase tracking-wider text-slate-300 leading-6 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-600/30 backdrop-blur-sm">
              {item.subheader}
            </h6>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full" />
          </div>
          <div className="h-px bg-gradient-to-l from-purple-500/30 via-blue-500/30 to-transparent flex-1" />
        </div>
      </div>
    </div>
  );
};

export default NavGroup;
