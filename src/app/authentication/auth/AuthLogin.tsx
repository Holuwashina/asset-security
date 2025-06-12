import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => (
  <>
    {title ? (
      <div className="font-bold text-2xl mb-2 text-center">{title}</div>
    ) : null}
    {subtext}
    <form className="space-y-6 w-full mt-4">
      <div>
        <Label htmlFor="username" className="mb-1 block">Username</Label>
        <Input id="username" name="username" type="text" placeholder="Enter your username" required />
      </div>
      <div>
        <Label htmlFor="password" className="mb-1 block">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Enter your password" required />
      </div>
      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
          <span>Remember this Device</span>
        </label>
        <Link href="/" className="text-primary text-xs font-medium hover:underline">
          Forgot Password ?
        </Link>
      </div>
      <Button type="submit" className="w-full mt-2">Sign In</Button>
    </form>
    {subtitle}
  </>
);

export default AuthLogin;
