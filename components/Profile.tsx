
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Platform, COUNTRIES_LIST } from '../types';
import { 
    Settings, Shield, Bell, LogOut, UserPlus, ChevronRight, 
    Globe, HelpCircle, FileText, X, Check, Lock, Smartphone, 
    ChevronDown, ChevronUp, AlertTriangle, Link2, Search, Pencil, Camera, Copy 
} from 'lucide-react';
import { useLanguage } from '../services/i18n';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (updates: Partial<User>) => void;
}

type ModalType = 'notifications' | 'security' | 'language' | 'help' | 'legal' | null;

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser }) => {
  const { t, setLang, lang } = useLanguage();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.username);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock State for Settings
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailDigest: false,
    marketingEmails: true,
    twoFactor: false,
    region: user.country || 'Morocco',
    currentPassword: '',
    newPassword: ''
  });

  // Default all linked accounts to FALSE (Disconnected)
  const [linkedAccounts, setLinkedAccounts] = useState<Record<Platform, boolean>>({
    [Platform.Instagram]: false,
    [Platform.Facebook]: false,
    [Platform.TikTok]: false,
    [Platform.Twitter]: false,
    [Platform.YouTube]: false,
  });

  const [saving, setSaving] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync local settings with user prop when it updates
  useEffect(() => {
    if (user.country) {
        setSettings(prev => ({ ...prev, region: user.country || 'Worldwide' }));
    }
  }, [user]);

  // Dropdown State for Region
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const regionRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRegions = useMemo(() => {
    return COUNTRIES_LIST.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLink = (p: Platform) => {
    setLinkedAccounts(prev => ({ ...prev, [p]: !prev[p] }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
        setSaving(false);
        setActiveModal(null);
        setSettings(prev => ({...prev, currentPassword: '', newPassword: ''}));
    }, 1000);
  };

  const handleSaveProfile = () => {
      if (onUpdateUser) {
          onUpdateUser({ username: editName });
      }
      setIsEditing(false);
  };

  const handleAvatarClick = () => {
      if(isEditing && fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && onUpdateUser) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateUser({ avatarUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCopyLink = () => {
      const link = `https://followme.app/ref/${user.username}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const SettingItem = ({ icon: Icon, label, subLabel, onClick }: any) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group bg-white"
    >
        <div className="flex items-center gap-4">
            <div className="text-slate-400 group-hover:text-indigo-500 transition-colors bg-slate-50 p-2 rounded-lg group-hover:bg-indigo-50">
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-start">
                <div className="text-sm font-medium text-slate-900">{label}</div>
                {subLabel && <div className="text-xs text-slate-500">{subLabel}</div>}
            </div>
        </div>
        <div className="text-slate-300 group-hover:text-indigo-400 rtl:rotate-180"><ChevronRight className="w-5 h-5" /></div>
    </button>
  );

  const ToggleRow = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
        <div>
            <p className="text-sm font-medium text-slate-900">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
        </div>
        <button 
            onClick={onChange}
            className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
        >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${checked ? 'ltr:translate-x-6 rtl:translate-x-[-6px]' : 'translate-x-0'}`}></div>
        </button>
    </div>
  );

  // --- MODAL CONTENT RENDERERS ---

  const renderNotificationsContent = () => (
    <div className="space-y-2">
        <ToggleRow 
            label="Push Alerts" 
            description="Get notified when tasks are completed."
            checked={settings.pushNotifications}
            onChange={() => handleToggle('pushNotifications')}
        />
        <ToggleRow 
            label="Email Digest" 
            description="Weekly summary of your growth."
            checked={settings.emailDigest}
            onChange={() => handleToggle('emailDigest')}
        />
         <ToggleRow 
            label="Marketing" 
            description="Tips and special offers."
            checked={settings.marketingEmails}
            onChange={() => handleToggle('marketingEmails')}
        />
    </div>
  );

  const renderSecurityContent = () => (
    <div className="space-y-6">
        <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center"><Lock className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-indigo-600"/> Change Password</h4>
            <div className="space-y-3">
                <input 
                    type="password" 
                    placeholder="Current Password" 
                    value={settings.currentPassword}
                    onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                    type="password" 
                    placeholder="New Password" 
                    value={settings.newPassword}
                    onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
        </div>
        
        <div>
             <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center"><Shield className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-indigo-600"/> 2-Step Verification</h4>
             <ToggleRow 
                label="Enable 2FA" 
                description="Secure your account with SMS code."
                checked={settings.twoFactor}
                onChange={() => handleToggle('twoFactor')}
            />
        </div>

        <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center"><Smartphone className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-indigo-600"/> Active Sessions</h4>
            <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-green-600">
                        <Globe className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900">Current Device</p>
                        <p className="text-[10px] text-slate-500">Online Now</p>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-center text-xs text-slate-400">0 other sessions active</p>
        </div>
    </div>
  );

  const renderLanguageContent = () => (
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Display Language</label>
            <div className="grid grid-cols-1 gap-2">
                {[
                    {code: 'EN', label: 'English (US)'}, 
                    {code: 'FR', label: 'Français'}, 
                    {code: 'AR', label: 'العربية'}
                ].map(l => (
                    <button 
                        key={l.code}
                        onClick={() => setLang(l.code as any)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                            lang === l.code 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                            : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                    >
                        {l.label}
                        {lang === l.code && <Check className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Region</label>
            <div className="relative" ref={regionRef}>
                <button 
                    onClick={() => setIsRegionOpen(!isRegionOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white hover:bg-slate-50 transition-colors"
                >
                    <span className="font-medium text-slate-900">{settings.region}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                
                {isRegionOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-20 max-h-48 flex flex-col overflow-hidden animate-slide-down">
                         <div className="p-2 border-b border-slate-50 bg-slate-50/50 sticky top-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search country..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-1">
                            {filteredRegions.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => {
                                        setSettings({...settings, region: c.name});
                                        setIsRegionOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors ${settings.region === c.name ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{c.flag}</span>
                                        <span>{c.name}</span>
                                    </div>
                                    {settings.region === c.name && <Check className="w-4 h-4 text-indigo-600" />}
                                </button>
                            ))}
                            {filteredRegions.length === 0 && <div className="p-3 text-center text-xs text-slate-400">No results</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const renderHelpContent = () => {
    const faqs = [
        { q: "How do I earn coins?", a: "You earn coins by completing tasks in the 'Earn' tab. Tasks include liking posts, following users, or viewing videos." },
        { q: "Is my account safe?", a: "Yes. We never ask for your social media passwords. We only need your username or public link to verify actions." },
        { q: "Why was my task rejected?", a: "Tasks are rejected if you unlike/unfollow shortly after, or if our system couldn't verify the action. Maintain a high reputation score to avoid this." },
        { q: "How do I contact support?", a: "You can email us at support@followme.app or use the live chat during business hours (9 AM - 6 PM GMT+1)." }
    ];

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {faqs.map((item, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                        <button 
                            onClick={() => setAccordionOpen(accordionOpen === idx.toString() ? null : idx.toString())}
                            className="w-full flex items-center justify-between p-4 bg-white text-start hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-sm font-medium text-slate-900">{item.q}</span>
                            {accordionOpen === idx.toString() ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {accordionOpen === idx.toString() && (
                            <div className="p-4 bg-slate-50 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const renderLegalContent = () => (
    <div className="space-y-4 text-slate-600">
        <div className="bg-slate-50 p-4 rounded-xl text-xs leading-relaxed h-64 overflow-y-auto border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">1. Terms of Service</h4>
            <p className="mb-3">By using FollowMe, you agree to act with integrity. Users found using bots, scripts, or fake accounts will be permanently banned.</p>
            
            <h4 className="font-bold text-slate-900 mb-2">2. Privacy Policy</h4>
            <p className="mb-3">We respect your privacy. We do not sell your data to third parties. Your activity data is used solely to verify tasks and improve campaign targeting.</p>
            
            <h4 className="font-bold text-slate-900 mb-2">3. Refunds</h4>
            <p className="mb-3">Coins purchased are non-refundable except in cases of technical failure. Unused coins never expire.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p>Last updated: Oct 24, 2024</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Header */}
      <div className="text-center pb-6 border-b border-slate-100 relative">
         <div className="absolute top-0 ltr:right-0 rtl:left-0">
             {isEditing ? (
                 <div className="flex gap-2">
                     <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                     <button onClick={handleSaveProfile} className="p-2 text-indigo-600 hover:text-indigo-700"><Check className="w-5 h-5"/></button>
                 </div>
             ) : (
                 <button onClick={() => {
                     setEditName(user.username);
                     setIsEditing(true);
                 }} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                     <Pencil className="w-4 h-4" />
                 </button>
             )}
         </div>

         <div className="relative inline-block group">
            <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-lg object-cover bg-white" />
            <div className="absolute bottom-4 right-0 bg-green-500 border-2 border-white w-5 h-5 rounded-full z-10"></div>
            
            {isEditing && (
                <div onClick={handleAvatarClick} className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center cursor-pointer mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
         </div>
         
         {isEditing ? (
             <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                className="block mx-auto text-2xl font-bold text-slate-900 text-center border-b-2 border-indigo-500 outline-none w-1/2"
                autoFocus
             />
         ) : (
             <h2 className="text-2xl font-bold text-slate-900">@{user.username}</h2>
         )}

         <div className="flex justify-center items-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold">
                {user.credits} Coins
            </span>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                Rep: {user.reputation}
            </span>
         </div>
      </div>

      {/* Refer a friend Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg mb-1">{t('prof.invite')}</h3>
                <p className="text-pink-100 text-sm mb-4">{t('prof.invite_desc')}</p>
                <button 
                    onClick={handleCopyLink}
                    className="bg-white text-rose-600 text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-pink-50 transition-colors flex items-center gap-2"
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? t('prof.link_copied') : t('prof.copy_link')}
                </button>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
                <UserPlus className="w-8 h-8 text-white" />
            </div>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      </div>

      {/* Linked Accounts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">{t('prof.linked')}</div>
        {Object.values(Platform).map((platform) => (
            <div key={platform} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                     {/* Platform Icon Placeholder */}
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                        platform === Platform.Instagram ? 'bg-pink-100 text-pink-600' :
                        platform === Platform.Facebook ? 'bg-blue-100 text-blue-600' :
                        platform === Platform.TikTok ? 'bg-slate-900 text-white' :
                        platform === Platform.YouTube ? 'bg-red-100 text-red-600' :
                        'bg-sky-100 text-sky-500'
                     }`}>
                        {platform[0]}
                     </div>
                     <span className="font-medium text-slate-900">{platform}</span>
                </div>
                <button 
                    onClick={() => toggleLink(platform)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        linkedAccounts[platform] 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {linkedAccounts[platform] ? (
                        <><Check className="w-3 h-3" /> {t('prof.connected')}</>
                    ) : (
                        <><Link2 className="w-3 h-3" /> {t('prof.connect')}</>
                    )}
                </button>
            </div>
        ))}
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">{t('prof.account')}</div>
         <SettingItem 
            icon={Bell} 
            label={t('prof.notif')}
            subLabel={settings.pushNotifications ? "On" : "Off"} 
            onClick={() => setActiveModal('notifications')}
        />
         <SettingItem 
            icon={Shield} 
            label={t('prof.privacy')}
            subLabel="Password, 2FA, Sessions" 
            onClick={() => setActiveModal('security')}
        />
         <SettingItem 
            icon={Globe} 
            label={t('prof.lang')}
            subLabel={`${lang} • ${settings.region}`} 
            onClick={() => setActiveModal('language')}
        />
      </div>

      {/* Support & About */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">{t('prof.support')}</div>
         <SettingItem icon={HelpCircle} label={t('prof.help')} subLabel="FAQ, Contact" onClick={() => setActiveModal('help')} />
         <SettingItem icon={FileText} label={t('prof.legal')} onClick={() => setActiveModal('legal')} />
      </div>
      
      <div className="p-4">
        <button 
            onClick={onLogout}
            className="w-full text-red-500 font-bold text-sm flex items-center justify-center py-3 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
        >
            <LogOut className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t('prof.sign_out')}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">Version 1.0.5</p>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full sm:w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-slide-up">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-slate-900 capitalize">
                        {activeModal === 'legal' ? t('prof.legal') : 
                         activeModal === 'help' ? t('prof.help') : 
                         activeModal === 'security' ? t('prof.privacy') : 
                         activeModal?.replace('-', ' ')}
                    </h3>
                    <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto">
                    {activeModal === 'notifications' && renderNotificationsContent()}
                    {activeModal === 'security' && renderSecurityContent()}
                    {activeModal === 'language' && renderLanguageContent()}
                    {activeModal === 'help' && renderHelpContent()}
                    {activeModal === 'legal' && renderLegalContent()}
                </div>

                {/* Modal Footer */}
                {(activeModal === 'notifications' || activeModal === 'security' || activeModal === 'language') && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                t('prof.save')
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
