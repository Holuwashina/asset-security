import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Mail, LogOut, Settings, Shield, ChevronDown } from "lucide-react";

const Profile = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-auto px-3 rounded-xl hover:bg-blue-100/50 transition-all duration-300 hover:scale-105 group"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8 ring-2 ring-blue-200/50 group-hover:ring-blue-300/70 transition-all duration-300">
                <AvatarImage src="/images/profile/user-1.jpg" alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                John Doe
              </div>
              <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                Security Admin
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-700 transition-all duration-300 group-data-[state=open]:rotate-180" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-2 bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-xl rounded-xl"
        align="end"
        forceMount
      >
        {/* Profile Header */}
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
          <Avatar className="h-12 w-12 ring-2 ring-blue-200/50">
            <AvatarImage src="/images/profile/user-1.jpg" alt="Profile" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-slate-900">John Doe</div>
            <div className="text-sm text-slate-600">john.doe@company.com</div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <div className="flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                Online
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-200/50" />

        {/* Menu Items */}
        <DropdownMenuItem className="rounded-lg hover:bg-blue-50 transition-colors cursor-pointer p-3">
          <User className="mr-3 h-4 w-4 text-slate-600" />
          <div>
            <div className="font-medium">My Profile</div>
            <div className="text-xs text-slate-500">View and edit profile</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="rounded-lg hover:bg-blue-50 transition-colors cursor-pointer p-3">
          <Mail className="mr-3 h-4 w-4 text-slate-600" />
          <div>
            <div className="font-medium">Account Settings</div>
            <div className="text-xs text-slate-500">Manage your account</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="rounded-lg hover:bg-blue-50 transition-colors cursor-pointer p-3">
          <Settings className="mr-3 h-4 w-4 text-slate-600" />
          <div>
            <div className="font-medium">Preferences</div>
            <div className="text-xs text-slate-500">Customize your experience</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-200/50 my-2" />

        <DropdownMenuItem asChild>
          <Link
            href="/authentication/login"
            className="w-full rounded-lg hover:bg-red-50 transition-colors cursor-pointer p-3 text-red-600 hover:text-red-700"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <div>
              <div className="font-medium">Sign Out</div>
              <div className="text-xs text-red-500">End your session</div>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Profile;
