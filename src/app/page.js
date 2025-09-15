'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  DollarSign, 
  Trophy, 
  BarChart3,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { GiReceiveMoney } from 'react-icons/gi';
import { PageLoading } from '@/components/loading';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <PageLoading />;
  }

  if (status === 'authenticated') {
    return <PageLoading text="Redirecting to dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="w-full border-b border-gray-200/70 dark:border-gray-700 mb-12 md:mb-24 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GiReceiveMoney className="h-6 w-6 md:h-7 md:w-7 text-[#0F899B]" />
            <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white">TrackWise</span>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" className="h-8 px-3 md:h-9 md:px-4 text-sm ">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="h-8 px-3 md:h-9 md:px-4 text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                A easy way
                <br />
                for managing
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">your savings</span>
                  <span className="absolute inset-x-0 bottom-1 h-4 md:h-6 rounded-md bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 opacity-70"></span>
                </span>
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                Enhance your research with cutting-edge financial data and business-specific tools.
              </p>
              <div className="mt-6 md:mt-8">
                <Link href="/register">
                  <Button className="bg-[#0F899B] hover:bg-emerald-600 text-white shadow-sm text-sm md:text-base px-6 py-2 md:px-8 md:py-3">Get started</Button>
                </Link>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="mx-auto lg:mx-0 lg:ml-auto w-full max-w-sm md:max-w-md">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-lg p-4 md:p-6 animate-float-in transition-transform duration-200 transform-gpu hover:scale-[1.1]">
                  <div className="h-32 md:h-40 w-full bg-gradient-to-br from-emerald-200 to-emerald-400/60 dark:from-emerald-900/40 dark:to-emerald-700/20 rounded-lg flex items-end p-3 md:p-4">
                    <div className="grid grid-cols-7 gap-1 md:gap-2 w-full">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="bg-emerald-600/90 dark:bg-emerald-500/80 rounded-md" style={{ height: `${30 + i * 6}px` }} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-6 rounded-xl border border-gray-200 dark:border-gray-800 p-3 md:p-4 flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Transfer was successful!</span>
                    <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">Amount=$154</span>
                  </div>
                </div>

                {/* Collage cards - hidden on mobile, visible on larger screens */}
                <div className="hidden md:block">
                  <div className="absolute -bottom-16 -right-6 w-48 lg:w-56 xl:w-64 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-md p-3 lg:p-4 animate-float-in animation-delay-200 transition-transform duration-200 transform-gpu hover:scale-[1.1]">
                    <div className="text-xs lg:text-sm text-gray-700 dark:text-gray-200 mb-2">SEC Data</div>
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-full border-6 lg:border-8 border-emerald-500" />
                      <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">$1734k+</div>
                    </div>
                  </div>

                  <div className="absolute top-2 -left-6 w-32 lg:w-40 xl:w-48 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-md p-3 lg:p-4 animate-float-in animation-delay-400 transition-transform duration-200 transform-gpu hover:scale-[1.1]">
                    <div className="text-xs text-gray-600 dark:text-gray-300">Weekly Savings</div>
                    <div className="mt-2 lg:mt-3 grid grid-cols-5 gap-1">
                      {[8,14,20,12,18].map((h, i) => (
                        <div key={i} className="bg-indigo-500/80 dark:bg-indigo-400/80 rounded" style={{ height: `${h}px` }} />
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-28 -left-12 w-36 lg:w-44 xl:w-52 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-md p-3 lg:p-4 animate-float-in animation-delay-600 transition-transform duration-200 transform-gpu hover:scale-[1.1]">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Goal Progress</div>
                        <div className="h-1.5 lg:h-2 w-20 lg:w-28 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                          <div className="h-1.5 lg:h-2 bg-emerald-500" style={{ width: '68%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-20 left-0 w-48 lg:w-64 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-md p-4 lg:p-5 animate-float-in animation-delay-800 transition-transform duration-200 transform-gpu hover:scale-[1.1]">
                    <div className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-100">Spending Breakdown</div>
                    <div className="mt-2 lg:mt-3 grid grid-cols-3 gap-2 lg:gap-3">
                      {[60,34,22].map((v, i) => (
                        <div key={i} className="text-center">
                          <div className="mx-auto h-8 w-8 lg:h-10 lg:w-10 rounded-full border-3 lg:border-4" style={{ borderColor: i===0? '#10b981' : i===1? '#6366f1' : '#f59e0b' }} />
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{v}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute bottom-64 right-68 w-48 lg:w-56 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-lg p-3 lg:p-4 animate-float-in transition-transform duration-200 transform-gpu hover:scale-[1.1]" style={{ zIndex: 2 }}>
                    <div className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-100">Recent Activity</div>
                    <div className="mt-2 lg:mt-3 space-y-1 lg:space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-between"><span>Transfer</span><span className="font-semibold text-emerald-600">+$250</span></div>
                      <div className="flex items-center justify-between"><span>Coffee</span><span className="font-semibold text-rose-600">-$6</span></div>
                      <div className="flex items-center justify-between"><span>Groceries</span><span className="font-semibold text-rose-600">-$42</span></div>
                    </div>
                  </div>

                  <div className="absolute -top-10 right-10 w-40 lg:w-48 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-md p-3 lg:p-4 animate-float-in animation-delay-400 transition-transform duration-200 transform-gpu hover:scale-[1.1]" style={{ zIndex: 3 }}>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Savings Rate</div>
                    <div className="mt-2 lg:mt-3 flex items-center gap-2 lg:gap-3">
                      <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full border-6 lg:border-8 border-emerald-500 border-t-transparent animate-spin-slow" />
                      <div className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">32%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
