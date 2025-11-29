
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, User, CheckCircle } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import { loginService, signupService } from '../services/firebase';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (data: {user: any, isNew: boolean}) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic Validation
    if (activeTab === 'signup' && password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);

    try {
        if (activeTab === 'signup') {
            // Sign Up Logic
            if (!username || !email || !password) {
                throw new Error("All fields are required");
            }
            const result = await signupService(email, password, username);
            onLogin(result);
        } else {
            // Login Logic
            const result = await loginService(email, password);
            onLogin(result);
        }
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
        setIsLoading(false);
    }
  };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) {
                setError(error.message);
                setIsLoading(false);
            }
            // On success, Supabase will redirect to the callback URL
        } catch (e: any) {
            setError(e.message || 'Google login failed');
            setIsLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in transition-all relative z-10">
        
        {/* Header Logo */}
        <div className="pt-8 pb-6 flex flex-col items-center justify-center bg-white">
          <div className="text-4xl font-extrabold tracking-tight flex items-center justify-center">
            <span className="text-blue-700">Follow</span>
            <span className="text-sky-400">Me</span>
          </div>
          <p className="text-slate-400 text-xs font-medium mt-1 tracking-widest uppercase">Social Exchange</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => { setActiveTab('signin'); setError(''); }}
                className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${
                    activeTab === 'signin' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                {t('auth.signin')}
                {activeTab === 'signin' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${
                    activeTab === 'signup' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                {t('auth.signup')}
                {activeTab === 'signup' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
        </div>

        <div className="p-8">
            <h2 className="text-slate-900 font-bold text-xl mb-2">
                {activeTab === 'signup' ? t('auth.create_acc') : t('auth.welcome_back')}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
                {activeTab === 'signup' ? t('auth.enter_signup') : t('auth.enter_details')}
            </p>

            {/* Google Button */}
            <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all mb-6 group"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t('auth.google')}
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-400">{t('auth.or_email')}</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {activeTab === 'signup' && (
                    <div className="animate-slide-up">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.username')}</label>
                        <div className="relative">
                            <User className="absolute ltr:left-3 rtl:right-3 top-3 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full ltr:pl-10 rtl:pr-10 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 transition-all"
                                placeholder="username"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.email')}</label>
                    <div className="relative">
                        <Mail className="absolute ltr:left-3 rtl:right-3 top-3 w-5 h-5 text-slate-400" />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full ltr:pl-10 rtl:pr-10 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 transition-all"
                            placeholder="name@company.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.password')}</label>
                    <div className="relative">
                        <Lock className="absolute ltr:left-3 rtl:right-3 top-3 w-5 h-5 text-slate-400" />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full ltr:pl-10 rtl:pr-10 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 animate-fade-in font-medium flex items-center justify-center gap-2">
                        <span>{error}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>{activeTab === 'signup' ? t('auth.signup') : t('auth.signin')} <ArrowRight className="w-5 h-5 ltr:ml-1 rtl:mr-1 rtl:rotate-180" /></>
                    )}
                </button>
            </form>

            {/* Helper Text for Switch */}
            <div className="mt-6 text-center text-sm">
                <button 
                    onClick={() => {
                        setActiveTab(activeTab === 'signin' ? 'signup' : 'signin');
                        setError('');
                    }}
                    className="text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    {activeTab === 'signin' 
                        ? <>{t('auth.no_acc')} <span className="font-bold text-indigo-600">{t('auth.signup_link')}</span></>
                        : <>{t('auth.have_acc')} <span className="font-bold text-indigo-600">{t('auth.signin_link')}</span></>
                    }
                </button>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-xs text-slate-300">v1.0.5</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
