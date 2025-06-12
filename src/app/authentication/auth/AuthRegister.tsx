import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface registerType {
    title?: string;
    subtitle?: JSX.Element | JSX.Element[];
    subtext?: JSX.Element | JSX.Element[];
  }

const AuthRegister = ({ title, subtitle, subtext }: registerType) => (
    <>
        {title ? (
            <div className="font-bold text-2xl mb-2 text-center">{title}</div>
        ) : null}

        {subtext}

        <form className="space-y-6 w-full mt-4">
            <div>
                <Label htmlFor="name" className="mb-1 block">Name</Label>
                <Input id="name" name="name" type="text" placeholder="Enter your name" required />
            </div>
            <div>
                <Label htmlFor="email" className="mb-1 block">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email" required />
            </div>
            <div>
                <Label htmlFor="password" className="mb-1 block">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter your password" required />
            </div>
            <Button type="submit" className="w-full mt-2">Sign Up</Button>
        </form>
        {subtitle}
    </>
);

export default AuthRegister;
