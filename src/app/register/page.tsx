"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";

import { 
  Box, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck 
} from "lucide-react";
import { RegisterFormValues, registerSchema } from '@/schemas/auth.schema';
import axios from 'axios';

export default function SignUpPage() {
  const [loading,setLoading]=useState<boolean>(false)
  const form=useForm<RegisterFormValues>({resolver:zodResolver(registerSchema),defaultValues:{name:"",email:"",password:"",confirmPassword:""}})
  const onSubmit = async (data: RegisterFormValues) => {
  try {
    setLoading(true);

    const response = await axios.post(
      "/api/auth/register",
      data
    );

    console.log(response.data);
  } catch (err: any) {
    console.log(err.response?.data);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-[#090e1a] text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Left Column: Brand & Hero (Visible on Desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-gradient-to-b from-[#0b132b] to-[#050814] border-r border-slate-900">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Box className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">InvntoryPro</span>
        </div>

        {/* Hero Content */}
        <div className="my-auto max-w-xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.15]">
              Precision engineering <br />
              for <span className="text-slate-400 font-medium">enterprise logistics.</span>
            </h1>
            <p className="text-base text-slate-400 max-w-md leading-relaxed">
              Streamline your supply chain with real-time data visualization, 
              automated replenishment, and secure multi-user collaboration.
            </p>
          </div>

          {/* Product Preview Card */}
          <div className="relative group rounded-3xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:border-slate-700/60">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#060a13] flex items-center justify-center border border-slate-900">
              <img 
                src="/register.png
" 
                alt="InvntoryPro Dashboard Screen" 
                className="w-full h-full object-cover opacity-80 mix-blend-lighten"
              />
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="max-w-md border-l-2 border-indigo-500/30 pl-4 space-y-1">
          <p className="text-sm italic text-slate-400">
            "InvntoryPro has fundamentally changed how we scale our global distribution."
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sarah Jenkins • COO of Global Logistics
          </p>
        </div>
      </div>

      {/* Right Column: Sign Up Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Create your account
            </h2>
            <p className="text-sm text-slate-400">
              Enter your details to join the Enterprise Tier.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Full Name
              </Label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 z-10 h-4 w-4 text-slate-500 pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Name"{...form.register("name")}
                  className="pl-10 bg-[#111827]/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500 h-11 w-full rounded-xl"
                />
                 {form.formState.errors.name && (
          <p>{form.formState.errors.name.message}</p>
        )}
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Email Address
              </Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 z-10 h-4 w-4 text-slate-500 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email" {...form.register("email")}
                  className="pl-10 bg-[#111827]/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500 h-11 w-full rounded-xl"
                />
                 {form.formState.errors.email && (
          <p>{form.formState.errors.email.message}</p>
        )}
              </div>
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Password
                </Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 z-10 h-4 w-4 text-slate-500 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"{...form.register("password")}
                    className="pl-10 bg-[#111827]/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500 h-11 w-full rounded-xl"
                  />
                            {form.formState.errors.password && (
          <p>{form.formState.errors.password.message}</p>
        )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Confirm Password
                </Label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-3.5 z-10 h-4 w-4 text-slate-500 pointer-events-none" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••" {...form.register("confirmPassword")}
                    className="pl-10 bg-[#111827]/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500 h-11 w-full rounded-xl"
                  />
           {form.formState.errors.confirmPassword && (
          <p>
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox id="terms" className="border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 h-4 w-4 mt-0.5 rounded" />
              <Label htmlFor="terms" className="text-sm font-normal text-slate-400 leading-normal cursor-pointer select-none">
                I agree to the{" "}
                <a href="#" className="text-slate-300 hover:text-white transition-colors underline underline-offset-4">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-slate-300 hover:text-white transition-colors underline underline-offset-4">Privacy Policy</a>.
              </Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium h-12 text-base rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200">{
              loading?"Registering":"Register"
            }
            
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800/80"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-800/80"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="bg-[#111827]/30 border-slate-800/80 hover:bg-slate-900 hover:text-white text-slate-300 h-11 rounded-xl transition-colors">
              <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.46 1.625l2.414-2.413C17.36 1.714 14.94 1 12.24 1 6.6 1 2 5.6 2 11.2s4.6 10.2 10.24 10.2c5.9 0 9.8-4.14 9.8-10 0-.675-.06-1.32-.176-1.915H12.24z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="bg-[#111827]/30 border-slate-800/80 hover:bg-slate-900 hover:text-white text-slate-300 h-11 rounded-xl transition-colors">
              <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.061.069-.061 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </Button>
          </div>

          {/* Footer Sign In Link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </a>
          </p>

        </div>
      </div>

    </div>
  );
}