import Link from "next/link";
import { Shield, Zap } from "lucide-react";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-3 group">
      <div className="relative">
        {/* Main logo container */}
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
          <Shield className="h-6 w-6 text-white" />
        </div>
        {/* Accent dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
          <Zap className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
      
      <div className="flex flex-col">
        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
          AssetShield
        </h1>
        <p className="text-xs text-slate-400 font-medium -mt-1">
          AI Classification
        </p>
      </div>
    </Link>
  );
};

export default Logo;
