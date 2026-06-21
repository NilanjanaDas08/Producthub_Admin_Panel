"use client"
import * as React from "react"
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function AuthScreen() {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] p-4 font-sans antialiased text-slate-200">
      {/* Main Container mirroring screen.jpg */}
      <Card className="w-full max-w-[1000px] overflow-hidden border-slate-800 bg-[#0b0f19] shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          
          {/* Left Side: Branding & Marketing */}
          <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#1e1b4b] via-[#111827] to-[#0f172a] p-8 md:p-12 lg:p-16">
            {/* Subtle glow effect overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_50%)]" />
            
            <div className="relative z-10 space-y-12">
              {/* Logo */}
              <div className="flex items-center gap-2 text-indigo-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="font-semibold tracking-wide text-white">InventoryPro</span>
              </div>

              {/* Tagline */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Master your supply <br />
                  chain flow.
                </h1>
                <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                  The enterprise-grade platform for modern inventory management, 
                  real-time analytics, and seamless logistics orchestration.
                </p>
              </div>
            </div>

            {/* Footer Badge */}
            <div className="relative z-10 mt-12 flex items-center gap-3">
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium tracking-wider text-slate-300 uppercase">
                Pro Mix
              </span>
              <p className="text-xs text-slate-400">
                Trusted by 2,000+ logistics users worldwide
              </p>
            </div>
          </div>

          {/* Right Side: Authentication Form */}
          <div className="bg-[#0c101b] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-[360px] space-y-6">
              
              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome Back</h2>
                <p className="text-xs text-slate-400">
                  Please enter your details to access your dashboard
                </p>
              </div>

              {/* Form */}
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-400">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      className="border-slate-800 bg-[#111726] pl-9 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-slate-400">
                      Password
                    </Label>
                    <a href="#" className="text-xs font-medium text-indigo-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="border-slate-800 bg-[#111726] pl-9 pr-9 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox id="remember" className="border-slate-700 data-[state=checked]:bg-indigo-500" />
                  <label
                    htmlFor="remember"
                    className="text-xs font-medium leading-none text-slate-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full bg-[#a3a3ff] font-medium text-slate-900 hover:bg-[#b3b3ff]">
                  Sign in
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <Separator className="bg-slate-800" />
                <span className="absolute left-1/2 -translate-x-1/2 bg-[#0c101b] px-3 text-[10px] uppercase tracking-wider text-slate-500">
                  or sign in with
                </span>
              </div>

              {/* OAuth Providers */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-slate-800 bg-[#111726] text-xs text-slate-300 hover:bg-slate-800 hover:text-white">
                  <span className="font-semibold mr-1">SSO</span> Identity
                </Button>
                <Button variant="outline" className="border-slate-800 bg-[#111726] text-xs text-slate-300 hover:bg-slate-800 hover:text-white">
                  <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>

              {/* Alternative CTA */}
              <div className="text-center text-xs">
                <span className="text-slate-500">New to platform? </span>
                <Link href="/register" className="font-medium text-indigo-400 hover:underline">
                  Register
                </Link>
              </div>

            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}