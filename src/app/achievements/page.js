'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target,
  Award,
  Flame,
  TrendingUp,
  ShieldCheck,
  BarChart2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { PageLoading } from '@/components/loading';

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAchievements();
    }
  }, [session]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      setAchievements(data.achievements || []);
      setUserStats(data.userStats || null);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <PageLoading text="Loading achievements..." />;
  }

  if (!session) {
    return null;
  }

  const currentLevelXp = userStats?.xp % 100 || 0;
  const nextLevelXp = 100 - currentLevelXp;

  // Map icon string/emoji to a lucide component
  const iconMap = {
    '👣': Target,
    '💰': ShieldCheck,
    '🔥': Flame,
    '🎯': Target,
    '📈': TrendingUp,
    '⭐': Star,
    '🏅': Award,
    '🏆': Trophy,
    '🌟': Star,
    '📊': BarChart2,
  };

  const AchIcon = ({ icon, className }) => {
    const Comp = iconMap[icon] || Award;
    return <Comp className={className} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#0F899B]">
              Achievements
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your progress and unlock rewards
            </p>
          </div>


          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">
                    Level {userStats.level}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {userStats.xp} total XP
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Zap className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {userStats.streak} days
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Keep logging transactions!
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Progress to Next Level</CardTitle>
                  <Target className="h-4 w-4 text-blue-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {nextLevelXp} XP to go
                  </div>
                  <Progress value={(currentLevelXp / 100) * 100} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}

    
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                {achievements.length} achievement&apos;s unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No achievements unlocked yet
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Start logging transactions to unlock your first achievement!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement._id}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                          <AchIcon icon={achievement.icon} className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.xpReward} XP
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(achievement.earnedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Available Achievements
              </CardTitle>
              <CardDescription>
                Achievements you can still unlock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: '7-Day Streak',
                    description: 'Log transactions for 7 consecutive days',
                    icon: '🔥',
                    xpReward: 50,
                    unlocked: achievements.some(a => a.title === '7-Day Streak'),
                  },
                  {
                    title: '30-Day Streak',
                    description: 'Log transactions for 30 consecutive days',
                    icon: '🏆',
                    xpReward: 200,
                    unlocked: achievements.some(a => a.title === '30-Day Streak'),
                  },
                  {
                    title: 'Level 5',
                    description: 'Reach level 5',
                    icon: '⭐',
                    xpReward: 100,
                    unlocked: achievements.some(a => a.title === 'Level 5'),
                  },
                  {
                    title: 'Level 10',
                    description: 'Reach level 10',
                    icon: '🌟',
                    xpReward: 300,
                    unlocked: achievements.some(a => a.title === 'Level 10'),
                  },
                  {
                    title: 'Budget Saver',
                    description: 'Stay under budget for a month',
                    icon: '💰',
                    xpReward: 150,
                    unlocked: false,
                  },
                  {
                    title: 'Transaction Master',
                    description: 'Log 100 transactions',
                    icon: '📊',
                    xpReward: 250,
                    unlocked: false,
                  },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-colors ${
                      achievement.unlocked
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 p-2 rounded-md ${
                        achievement.unlocked
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                      }`}>
                        {achievement.unlocked
                          ? <AchIcon icon={achievement.icon} className="h-4 w-4 text-green-600 dark:text-green-400" />
                          : <Lock className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.unlocked 
                            ? 'text-green-900 dark:text-green-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          achievement.unlocked 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge 
                            variant={achievement.unlocked ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            +{achievement.xpReward} XP
                          </Badge>
                          {achievement.unlocked && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
