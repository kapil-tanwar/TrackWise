'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { GiReceiveMoney } from 'react-icons/gi';

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setEmail('demo@trackwise.com');
    setPassword('demo1234');
    try {
      const result = await signIn('credentials', {
        email: 'demo@trackwise.com',
        password: 'demo1234',
        redirect: true,
        callbackUrl: '/dashboard',
      });
      if (result?.error) {
        toast.error('Demo login failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during demo login');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-950 dark:from-inherit dark:to-inherit">
      {/* Navbar */}
      <header className="w-full border-b  dark:border-gray-700 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GiReceiveMoney className="h-6 w-6 md:h-7 md:w-7 text-gray-900 dark:text-white" />
            <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white">TrackWise</span>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <ThemeToggle />
            <Link href="/register">
              <Button className="h-8 px-3 md:h-9 md:px-4 text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <GiReceiveMoney className="h-8 w-8 text-gray-900 dark:text-white" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or</span>
            </div>
          </div>

          {/* Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Try Demo Account'}
          </button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#0F899B] hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
