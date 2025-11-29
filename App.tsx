
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Earn from './components/Earn';
import Campaigns from './components/Campaigns';
import Wallet from './components/Wallet';
import Profile from './components/Profile';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import { Campaign, Task, Transaction, User, Platform, TaskType, CampaignStatus, Notification } from './types';
import { I18nProvider, useLanguage } from './services/i18n';
import { checkSessionService, loadUserData, logoutService, saveUserData } from './services/firebase';
import { Coins, Sparkles, X, Calendar, Gift } from 'lucide-react';

// GLOBAL MOCK TASKS (In real app, these come from DB)
const GLOBAL_TASKS: Task[] = [
  {
    id: 't1',
    platform: Platform.Instagram,
    type: TaskType.Like,
    reward: 1,
    description: 'Amazing sunset view!',
    targetUrl: 'https://instagram.com',
    thumbnailUrl: 'https://picsum.photos/300/300?random=1',
    country: 'USA'
  },
  {
    id: 't2',
    platform: Platform.Twitter,
    type: TaskType.Follow,
    reward: 3,
    description: 'TechNewsDaily',
    targetUrl: 'https://twitter.com',
    thumbnailUrl: 'https://picsum.photos/300/300?random=2',
    country: 'Worldwide'
  },
  {
    id: 't3',
    platform: Platform.TikTok,
    type: TaskType.View,
    reward: 1,
    description: 'Funny cat reaction',
    targetUrl: 'https://tiktok.com',
    thumbnailUrl: 'https://picsum.photos/300/300?random=3',
    country: 'Brazil'
  },
  {
    id: 't4',
    platform: Platform.YouTube,
    type: TaskType.Like,
    reward: 2,
    description: 'New Vlog 2024',
    targetUrl: 'https://youtube.com',
    thumbnailUrl: 'https://picsum.photos/300/300?random=4',
    country: 'India'
  },
];

const AppContent: React.FC = () => {
  const { lang, setLang, dir, t } = useLanguage();
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [dailyBonusAmount, setDailyBonusAmount] = useState(0);
  const [loadingSession, setLoadingSession] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(GLOBAL_TASKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  // --- PERSISTENCE & SESSION CHECK ---
  useEffect(() => {
    const initSession = async () => {
        const userId = await checkSessionService();
        if (userId) {
            const data = await loadUserData(userId);
            if (data) {
                // Check and Reset Daily Limits (Bonus + Ads)
                const today = new Date().toISOString().split('T')[0];
                const lastAdDate = data.user.lastAdDate ? data.user.lastAdDate.split('T')[0] : '';
                let updatedUser = { ...data.user };

                if (lastAdDate !== today) {
                    updatedUser = { ...updatedUser, adWatchesToday: 0, lastAdDate: new Date().toISOString() };
                }

                setUser(updatedUser);
                setCampaigns(data.campaigns);
                setTransactions(data.transactions);
                setIsLoggedIn(true);
                setHasOnboarded(data.user.country !== 'Worldwide'); 
                
                // Check Daily Bonus on Init
                checkDailyBonus(updatedUser);
            }
        }
        setLoadingSession(false);
    };
    initSession();
  }, []);

  // Auto-Save Data on Changes
  useEffect(() => {
    if (isLoggedIn && user) {
        saveUserData(user.id, { user, campaigns, transactions });
    }
  }, [user, campaigns, transactions, isLoggedIn]);

  // Sync language with User object
  useEffect(() => {
    if (user?.language && ['EN', 'FR', 'AR'].includes(user.language)) {
        setLang(user.language as any);
    }
  }, [user]);

  const checkDailyBonus = (userData: User) => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const lastLogin = userData.lastLoginDate ? userData.lastLoginDate.split('T')[0] : '';
      
      if (lastLogin !== today) {
          // It's a new day!
          const newStreak = (userData.streak || 0) + 1;
          const bonus = Math.min(10 + (newStreak * 2), 50); // Cap bonus at 50

          setDailyBonusAmount(bonus);
          setShowDailyBonus(true);
      }
  };

  const handleClaimDailyBonus = () => {
      if (!user) return;
      const today = new Date().toISOString();
      const newStreak = (user.streak || 0) + 1;

      setUser(prev => prev ? ({ 
          ...prev, 
          credits: prev.credits + dailyBonusAmount,
          streak: newStreak,
          lastLoginDate: today
      }) : null);

      setTransactions(prev => [{
          id: Date.now().toString(),
          type: 'bonus',
          amount: dailyBonusAmount,
          date: today,
          description: `Daily Streak Bonus (Day ${newStreak})`
      }, ...prev]);

      setShowDailyBonus(false);
      showNotify(`+${dailyBonusAmount} Daily Coins Claimed!`);
  };

  // Helper for notifications
  const showNotify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ id: Date.now().toString(), message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handlers
  const handleLogin = async (data: {user: User, isNew: boolean}) => {
    setUser(data.user);
    if (data.isNew) {
        // New User Setup
        setCampaigns([]);
        setTransactions([{
            id: 'tx_bonus', type: 'bonus', amount: 50, date: new Date().toISOString(), description: 'Welcome Bonus'
        }]);
        setHasOnboarded(false);
        setShowWelcome(true);
    } else {
        // Existing User Data Load
        const loaded = await loadUserData(data.user.id);
        if (loaded) {
            setCampaigns(loaded.campaigns);
            setTransactions(loaded.transactions);
            setHasOnboarded(true);
            checkDailyBonus(loaded.user);
        }
    }
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await logoutService();
    setIsLoggedIn(false);
    setUser(null);
    setCampaigns([]);
    setTransactions([]);
    setTasks(GLOBAL_TASKS); // Reset tasks
    setNotification(null);
    setActiveTab('dashboard'); 
  };

  const handleOnboardingComplete = (data: { country: string; language: string }) => {
    if (user) {
        setUser(prev => prev ? ({ ...prev, country: data.country, language: data.language }) : null);
        setLang(data.language as any);
        setHasOnboarded(true);
    }
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? ({ ...prev, ...updates }) : null);
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    setUser(prev => prev ? ({ 
        ...prev, 
        credits: prev.credits + task.reward,
        reputation: (prev.reputation || 0) + 1 
    }) : null);
    
    setTasks(prev => prev.filter(t => t.id !== taskId));

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'earn',
      amount: task.reward,
      date: new Date().toISOString(),
      description: `Task: ${task.platform} ${task.type}`
    };
    setTransactions(prev => [newTx, ...prev]);
    showNotify(`+${task.reward} Coins Earned!`);
  };

  const handleSkipTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // Check if it was a report action (triggered from inside Earn via same callback or we can differentiate if needed)
    // For now we assume regular skip unless notified otherwise
    if (notification?.message === t('earn.reported_msg')) {
        // Already notified by the component
    } else {
        showNotify(t('earn.skip'), 'info');
    }
  }

  const handleCreateCampaign = (campaignData: Partial<Campaign>) => {
    if (!user) return;
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
    } as Campaign;

    const cost = newCampaign.totalRequested * newCampaign.costPerAction;
    
    setUser(prev => prev ? ({ ...prev, credits: prev.credits - cost }) : null);
    setCampaigns(prev => [newCampaign, ...prev]);

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'spend',
      amount: cost,
      date: new Date().toISOString(),
      description: `Campaign: ${newCampaign.platform} ${newCampaign.type}`
    };
    setTransactions(prev => [newTx, ...prev]);
    showNotify('Campaign launched successfully!');
  };

  const handleToggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
        if (c.id === id) {
            const newStatus = c.status === CampaignStatus.Active ? CampaignStatus.Paused : CampaignStatus.Active;
            return { ...c, status: newStatus };
        }
        return c;
    }));
    showNotify(t('camp.updated'), 'info');
  };

  const handleDeleteCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign || !user) return;

    const remaining = campaign.totalRequested - campaign.completedCount;
    if (remaining > 0) {
        const refundAmount = remaining * campaign.costPerAction;
        setUser(prev => prev ? ({ ...prev, credits: prev.credits + refundAmount }) : null);
        setTransactions(prev => [{
            id: Date.now().toString(),
            type: 'bonus',
            amount: refundAmount,
            date: new Date().toISOString(),
            description: `Refund: ${campaign.platform} Campaign`
        }, ...prev]);
    }

    setCampaigns(prev => prev.filter(c => c.id !== id));
    showNotify(t('camp.refunded'), 'success');
  };

  const handleUpdateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showNotify(t('camp.updated'));
  };

  const handleAddCredits = (amount: number, description: string = 'Coin Purchase') => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, credits: prev.credits + amount }) : null);
     const newTx: Transaction = {
      id: Date.now().toString(),
      type: description.includes('Video') ? 'earn' : 'purchase',
      amount: amount,
      date: new Date().toISOString(),
      description: description
    };
    setTransactions(prev => [newTx, ...prev]);
    showNotify(`+${amount} Coins added!`);
  };

  if (loadingSession) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const renderContent = () => {
    if (!user) return null;
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                user={user}
                userCampaigns={campaigns} 
                recentTransactions={transactions} 
                onNavigate={setActiveTab} 
               />;
      case 'earn':
        return <Earn tasks={tasks} onCompleteTask={handleCompleteTask} onSkipTask={handleSkipTask} streak={user.streak} />;
      case 'create':
        return <Campaigns 
                    campaigns={campaigns} 
                    onCreateCampaign={handleCreateCampaign} 
                    onDeleteCampaign={handleDeleteCampaign}
                    onUpdateCampaign={handleUpdateCampaign}
                    onToggleStatus={handleToggleCampaignStatus}
                    userCredits={user.credits} 
                />;
      case 'wallet':
        return <Wallet 
                    credits={user.credits} 
                    transactions={transactions} 
                    onAddCredits={handleAddCredits} 
                    userSettings={user} 
                    onUpdateUser={handleUpdateUser}
                />;
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
      default:
        return <Dashboard 
                user={user}
                userCampaigns={campaigns} 
                recentTransactions={transactions}
                onNavigate={setActiveTab} 
               />;
    }
  };

  return (
    <div dir={dir} className={lang === 'AR' ? 'font-arabic' : ''}>
        {!isLoggedIn || !user ? (
            <Login onLogin={handleLogin} />
        ) : !hasOnboarded ? (
            <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
            <Layout 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                userCredits={user.credits}
                notification={notification}
                onCloseNotification={() => setNotification(null)}
            >
            {renderContent()}
            
            {/* WELCOME MODAL FOR NEW USERS */}
            {showWelcome && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden animate-slide-up shadow-2xl">
                        {/* Confetti / Decoration Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-100 to-white -z-10"></div>
                        <div className="mx-auto bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-200 border-4 border-white">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{t('wel.title')}</h2>
                        <p className="text-slate-500 mb-6 leading-relaxed">{t('wel.desc')}</p>
                        
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Your Gift</p>
                            <div className="text-3xl font-black text-indigo-600 flex items-center justify-center gap-2">
                                <Coins className="w-8 h-8 fill-indigo-600" /> 50
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowWelcome(false)}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                            {t('wel.cta')}
                        </button>
                    </div>
                </div>
            )}

            {/* DAILY BONUS MODAL */}
            {showDailyBonus && !showWelcome && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden animate-slide-up shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100 to-white -z-10"></div>
                        <div className="mx-auto bg-orange-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-200 border-4 border-white">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                        
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{t('daily.title')}</h2>
                        <p className="text-slate-500 mb-6 leading-relaxed">{t('daily.desc')}</p>
                        
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">{t('daily.streak')}</p>
                                <p className="text-xs font-bold text-orange-600">{user.streak ? user.streak + 1 : 1} Days</p>
                            </div>
                            <div className="text-3xl font-black text-orange-600 flex items-center justify-center gap-2">
                                <Coins className="w-8 h-8 fill-orange-600" /> +{dailyBonusAmount}
                            </div>
                        </div>

                        <button 
                            onClick={handleClaimDailyBonus}
                            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-200 transition-all active:scale-95"
                        >
                            {t('daily.claim')}
                        </button>
                    </div>
                </div>
            )}

            </Layout>
        )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
        <AppContent />
    </I18nProvider>
  );
};

export default App;
