'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Plus,
  Trophy,
  Zap,
  Sparkles,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import Link from 'next/link';
import { PageLoading } from '@/components/loading';
import AIChatbot from '@/components/AIChatbot';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    try {
      setLoadingInsights(true);
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  if (status === 'loading' || loading) {
    return <PageLoading text="Loading dashboard..." />;
  }

  if (!session) {
    return null;
  }

  const { summary, monthlyTrend, categoryBreakdown, user } = dashboardData || {};

  const budgetUsedPercentage = user?.budgetLimit > 0 
    ? Math.min((summary?.totalExpenses / user.budgetLimit) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#0F899B]">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here&apos;s your financial overview
              </p>
            </div>
            <Link href="/transactions/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                ₹{summary?.totalIncome?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {summary?.isCurrentMonth === false ? 'Last 6 months' : 'This month'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                ₹{summary?.totalExpenses?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {summary?.isCurrentMonth === false ? 'Last 6 months' : 'This month'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings</CardTitle>
                <span className="h-4 w-4 text-blue-400 inline-flex items-center justify-center text-sm font-bold">₹</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                ₹{summary?.savings?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {summary?.isCurrentMonth === false ? 'Last 6 months' : 'This month'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                <Target className="h-4 w-4 text-orange-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-300">
                  {budgetUsedPercentage.toFixed(1)}%
                </div>
                <Progress value={budgetUsedPercentage} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Level</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {user?.level || 1}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.xp || 0} XP
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Zap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {user?.streak || 0} days
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Keep it up!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-400">
                  {dashboardData?.achievements?.length || 0}
                </div>
                <Link href="/achievements" className="text-xs text-blue-600 hover:underline">
                  View all
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Section */}
          <div className="mb-8">
            <Card className="border-t-4 border-t-purple-500 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Sparkles className="h-5 w-5" />
                    AI Monthly Insights
                  </CardTitle>
                  {aiInsights && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchAiInsights}
                      disabled={loadingInsights}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 gap-1.5 text-xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingInsights ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="relative">
                      <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Analyzing your financial performance...</p>
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-4 text-sm">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {aiInsights.summary}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {aiInsights.strengths?.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                          <h4 className="flex items-center gap-1 font-semibold text-green-700 dark:text-green-400 mb-2">
                            <CheckCircle2 className="h-4 w-4" /> Strengths
                          </h4>
                          <ul className="list-disc list-inside text-green-600 dark:text-green-500 space-y-1">
                            {aiInsights.strengths.map((item, idx) => <li key={idx} className="text-xs">{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {aiInsights.concerns?.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="flex items-center gap-1 font-semibold text-red-700 dark:text-red-400 mb-2">
                            <AlertCircle className="h-4 w-4" /> Concerns
                          </h4>
                          <ul className="list-disc list-inside text-red-600 dark:text-red-500 space-y-1">
                            {aiInsights.concerns.map((item, idx) => <li key={idx} className="text-xs">{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {aiInsights.recommendations?.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            <Lightbulb className="h-4 w-4" /> Recommendations
                          </h4>
                          <ul className="list-disc list-inside text-blue-600 dark:text-blue-500 space-y-1">
                            {aiInsights.recommendations.map((item, idx) => <li key={idx} className="text-xs">{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Sparkles className="h-7 w-7 text-purple-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">Get AI-powered financial insights</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Analyze your spending patterns, strengths, and recommendations</p>
                    </div>
                    <Button
                      onClick={fetchAiInsights}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2 shadow-md shadow-purple-500/20"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Insights
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>
                  Your spending pattern over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>
                  {summary?.isCurrentMonth === false
                    ? 'Breakdown of your spending over the last 6 months'
                    : 'Breakdown of your spending by category'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(categoryBreakdown || []).length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                    No expense data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown || []}
                        cx="50%"
                        cy="45%"
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(categoryBreakdown || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const total = (categoryBreakdown || []).reduce((s, d) => s + d.value, 0);
                          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                          return [`₹${value.toLocaleString()} (${pct}%)`, name];
                        }}
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f9fafb',
                          fontSize: '13px',
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={10}
                        formatter={(value, entry) => {
                          const total = (categoryBreakdown || []).reduce((s, d) => s + d.value, 0);
                          const pct = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                          return `${value} ${pct}%`;
                        }}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AIChatbot />
    </div>
  );
}

