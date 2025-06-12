"use client";
import Link from "next/link";
import PageContainer from "@/components/common/PageContainer";
import Logo from "@/components/layout/Logo";
import AuthRegister from "../auth/AuthRegister";
import { Card } from "@/components/ui/card";

const Register2 = () => (
  <PageContainer title="Register" description="this is Register page">
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-indigo-100 to-blue-100">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-100 via-indigo-100 to-blue-100 animate-pulse -z-10" />
      <div className="flex items-center justify-center w-full h-screen">
        <Card className="p-8 w-full max-w-lg z-10 flex flex-col items-center">
          <Logo />
          <AuthRegister
            subtext={
              <div className="text-center text-muted-foreground text-sm mb-2 font-medium">
                Your Social Campaigns
              </div>
            }
            subtitle={
              <div className="flex justify-center items-center space-x-2 mt-3 text-sm">
                <span className="text-muted-foreground">Already have an Account?</span>
                <Link href="/authentication/login" className="text-primary font-medium hover:underline">Sign In</Link>
              </div>
            }
          />
        </Card>
      </div>
    </div>
  </PageContainer>
);

export default Register2;
