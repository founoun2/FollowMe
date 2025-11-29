
import React, { useState } from 'react';
import { Home, PlusCircle, User, Wallet, TrendingUp, CheckCircle, AlertCircle, X, Globe, Coins } from 'lucide-react';
import { Notification } from '../types';
import { useLanguage } from '../services/i18n';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userCredits: number;
  notification: Notification | null;
  onCloseNotification: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  userCredits, 
  notification,
  onCloseNotification 
}) => {
  const { lang, setLang, t, dir } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'earn', label: t('nav.earn'), icon: TrendingUp },
    { id: 'create', label: t('nav.create'), icon: PlusCircle },
    { id: 'wallet', label: t('nav.wallet'), icon: Wallet },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  const toggleLang = () => setIsLangOpen(!isLangOpen);
  const selectLang = (l: string) => {
    setLang(l as any);
    setIsLangOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Toast Notification Overlay */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm animate-slide-down">
            <div className={`flex items-center p-4 rounded-xl shadow-2xl border ${
                notification.type === 'success' ? 'bg-white border-green-100' : 
                notification.type === 'error' ? 'bg-white border-red-100' : 'bg-white border-blue-100'
            }`}>
                <div className={`p-2 rounded-full ltr:mr-3 rtl:ml-3 ${
                     notification.type === 'success' ? 'bg-green-100 text-green-600' : 
                     notification.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{notification.type === 'success' ? 'Success' : 'Notice'}</p>
                    <p className="text-xs text-slate-500">{notification.message}</p>
                </div>
                <button onClick={onCloseNotification} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center">
          <span className="font-extrabold text-xl tracking-tight">
            <span className="text-blue-700">Follow</span>
            <span className="text-sky-400">Me</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
            {/* Language Switcher Mobile */}
            <div className="relative">
                <button onClick={toggleLang} className="flex items-center text-slate-600 font-bold text-xs bg-slate-100 px-2 py-1 rounded-lg">
                    <Globe className="w-3 h-3 ltr:mr-1 rtl:ml-1" /> {lang}
                </button>
                {isLangOpen && (
                    <div className={`absolute top-10 ${dir === 'rtl' ? 'left-0' : 'right-0'} bg-white shadow-lg rounded-lg border border-slate-100 py-1 min-w-[80px] z-50`}>
                        {['EN', 'FR', 'AR'].map(l => (
                            <button key={l} onClick={() => selectLang(l)} className="block w-full text-start px-4 py-2 text-sm hover:bg-slate-50">{l}</button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <Coins className="w-4 h-4 text-yellow-600 ltr:mr-1 rtl:ml-1 fill-yellow-600" />
                <span className="font-bold text-yellow-700 text-sm">{userCredits}</span>
            </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white ltr:border-r rtl:border-l border-slate-200 h-screen sticky top-0">
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="font-extrabold text-2xl tracking-tight">
                    <span className="text-blue-700">Follow</span>
                    <span className="text-sky-400">Me</span>
                </span>
            </div>
        </div>
        
        <div className="px-6 mb-6">
           <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-medium opacity-90 mb-1 text-amber-900">{t('nav.balance')}</p>
                <div className="flex items-center text-2xl font-bold text-white">
                    <Coins className="w-6 h-6 ltr:mr-1 rtl:ml-1 opacity-90" />
                    {userCredits}
                </div>
                <button 
                    onClick={() => onTabChange('wallet')}
                    className="mt-3 text-xs bg-white/20 hover:bg-white/30 w-full py-1.5 rounded-lg transition-colors font-medium text-white border border-white/20">
                    {t('nav.add_credits')}
                </button>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon 
                className={`w-5 h-5 ltr:mr-3 rtl:ml-3 transition-colors ${
                  activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} 
              />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Language Switcher Bottom */}
        <div className="p-4 border-t border-slate-100">
            <div className="relative mb-4">
                <button 
                    onClick={toggleLang}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <span className="flex items-center"><Globe className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t('nav.language')}</span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs">{lang}</span>
                </button>
                {isLangOpen && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white shadow-xl rounded-xl border border-slate-100 overflow-hidden">
                        {['EN', 'FR', 'AR'].map(l => (
                            <button 
                                key={l} 
                                onClick={() => selectLang(l)} 
                                className={`block w-full text-start px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-600 ${lang === l ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'}`}
                            >
                                {l === 'EN' ? 'English' : l === 'FR' ? 'Français' : 'العربية'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex justify-between items-center px-3 text-[10px] text-slate-300">
                 <span>© 2024 FollowMe</span>
                 <span>v1.0.5</span>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 scroll-smooth">
            {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe-area px-4 py-2 flex justify-around items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
              activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-current opacity-20 stroke-2' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
