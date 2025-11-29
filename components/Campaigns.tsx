
import React, { useState, useMemo } from 'react';
import { Campaign, Platform, TaskType, CampaignStatus, COUNTRIES_LIST } from '../types';
import { Plus, Target, BarChart2, Check, AlertCircle, Settings, Globe, Smartphone, MapPin, Search, ChevronDown, X, MoreVertical, PauseCircle, PlayCircle, Trash2, Edit2, Coins, TrendingUp } from 'lucide-react';
import { useLanguage } from '../services/i18n';

interface CampaignsProps {
  campaigns: Campaign[];
  onCreateCampaign: (campaign: Partial<Campaign>) => void;
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  onToggleStatus: (id: string) => void;
  userCredits: number;
}

const Campaigns: React.FC<CampaignsProps> = ({ 
  campaigns, 
  onCreateCampaign, 
  onUpdateCampaign,
  onDeleteCampaign,
  onToggleStatus,
  userCredits 
}) => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Paused'>('All');
  
  // Create Form State
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.Instagram);
  const [type, setType] = useState<TaskType>(TaskType.Like);
  const [budget, setBudget] = useState(50); // Default Budget
  const [reward, setReward] = useState(2); // Coins per action
  const [description, setDescription] = useState('');
  const [targeting, setTargeting] = useState({ country: 'Worldwide' });

  // Management State
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: '', targetUrl: '' });

  // Modal State for Country Picker
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fullCountryList = useMemo(() => [
    { name: 'Worldwide', flag: '🌍', currency: 'USD' },
    ...COUNTRIES_LIST
  ], []);

  const filteredCountryOptions = useMemo(() => {
    return fullCountryList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, fullCountryList]);

  const selectedCountryData = fullCountryList.find(c => c.name === targeting.country);

  // Cost Logic Update
  const geoMultiplier = targeting.country !== 'Worldwide' ? 1.3 : 1;
  const costPerAction = Math.ceil(reward * geoMultiplier);
  const estimatedQuantity = Math.floor(budget / costPerAction);
  const canAfford = userCredits >= budget;

  // Filter Campaigns
  const displayedCampaigns = campaigns.filter(c => {
      if (filterStatus === 'All') return true;
      return c.status === filterStatus;
  });

  const handleSubmit = () => {
    if (!canAfford || estimatedQuantity < 1) return;
    
    onCreateCampaign({
      targetUrl: url,
      platform,
      type,
      totalRequested: estimatedQuantity,
      completedCount: 0,
      costPerAction, // Includes reward and multipliers
      status: CampaignStatus.Active,
      description: description || "Promoted Content",
      tags: [],
      targeting
    });
    
    // Reset Form
    setView('list');
    setUrl('');
    setDescription('');
    setTargeting({ country: 'Worldwide' });
    setBudget(50);
    setReward(2);
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setEditForm({ description: campaign.description, targetUrl: campaign.targetUrl });
    setMenuOpenId(null);
  };

  const handleSaveEdit = () => {
    if (editingId) {
        onUpdateCampaign(editingId, editForm);
        setEditingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('camp.title')}</h1>
            <p className="text-slate-500">{t('camp.subtitle')}</p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => setView('create')}
            className="bg-[#0C4185] hover:opacity-90 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> {t('camp.new')}
          </button>
        )}
      </div>

      {view === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">{t('camp.details')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('camp.link_label')}</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={`https://${platform.toLowerCase()}.com/...`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('camp.desc_label')}</label>
                   <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('camp.desc_place')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('camp.platform')}</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as Platform)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('camp.goal')}</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as TaskType)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Budget Selection */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="block text-sm font-bold text-slate-900 mb-2">{t('camp.budget_label')}</label>
                    <p className="text-xs text-slate-500 mb-3">{t('camp.budget_desc')}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                        {[50, 100, 500, 1000].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setBudget(amt)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                    budget === amt 
                                    ? 'bg-[#0C4185] text-white shadow-md' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">Custom:</span>
                        <input 
                            type="number" 
                            min="10" 
                            value={budget} 
                            onChange={(e) => setBudget(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full pl-20 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                        />
                         <Coins className="absolute right-3 top-2.5 w-5 h-5 text-yellow-500" />
                    </div>
                </div>

                {/* Reward Slider */}
                <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                        <span>{t('camp.reward_label')}</span>
                        <span className="text-yellow-600 font-bold flex items-center gap-1">
                            <Coins className="w-4 h-4 fill-yellow-500 text-yellow-600" /> {reward}
                        </span>
                    </label>
                    <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        step="1"
                        value={reward} 
                        onChange={(e) => setReward(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                     <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>1</span>
                        <span>5</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t('camp.reward_desc')}</p>
                </div>
              </div>
            </div>

            {/* Advanced Targeting */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-visible relative">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-bold text-slate-800">{t('camp.targeting')}</h2>
                </div>
                
                <div className="space-y-3">
                    {/* Geo Targeting */}
                    <div className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><MapPin className="w-4 h-4" /></div>
                                <div>
                                    <div className="font-medium text-slate-900">{t('camp.geo')}</div>
                                    <div className="text-xs text-slate-500">{t('camp.geo_desc')}</div>
                                </div>
                            </div>
                             <span className="text-xs font-bold text-slate-400">{targeting.country !== 'Worldwide' ? '+30% cost' : 'Standard'}</span>
                        </div>
                        
                        {/* Searchable Modal Trigger */}
                        <button 
                            onClick={() => setIsCountryOpen(true)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-lg">{selectedCountryData?.flag}</span>
                                <span className="text-sm font-medium text-slate-700 truncate">{selectedCountryData?.name}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Preview Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('camp.preview')}</h3>
                <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        {targeting.country !== 'Worldwide' && (
                             <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">
                                {targeting.country}
                             </div>
                        )}
                     </div>
                     <div>
                        <div className="text-sm font-bold text-slate-900">{type === TaskType.Like ? 'Like Post' : `Follow User`}</div>
                        <div className="text-xs text-slate-500">{platform} • +{costPerAction} Coins</div>
                     </div>
                     <button className="ltr:ml-auto rtl:mr-auto bg-[#0C4185] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                        Do Task
                     </button>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="font-bold text-lg mb-4">{t('camp.summary')}</h3>
                <div className="space-y-3 mb-6 text-sm text-slate-300">
                    <div className="flex justify-between">
                        <span>{t('camp.total_cost')}</span>
                        <span className="text-yellow-400 font-bold">{budget} coins</span>
                    </div>
                     <div className="flex justify-between">
                        <span>{t('camp.reward_label')}</span>
                        <span className="text-white font-medium">{costPerAction} coins</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-700">
                        <span className="font-medium text-white">{t('camp.est_reach')}</span>
                        <span className="font-bold text-xl text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-5 h-5" /> {estimatedQuantity} {t('camp.actions')}
                        </span>
                    </div>
                </div>

                {!canAfford && (
                     <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start text-red-200 text-xs">
                        <AlertCircle className="w-4 h-4 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                        {t('camp.insufficient')}
                     </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setView('list')}
                        className="px-4 py-3 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                        {t('camp.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canAfford || !url || estimatedQuantity < 1}
                        className="px-4 py-3 rounded-xl font-bold bg-[#0C4185] hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20"
                    >
                        {t('camp.launch')}
                    </button>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
            
          {/* Campaign Filter Tabs */}
          {campaigns.length > 0 && (
            <div className="flex space-x-1 rtl:space-x-reverse bg-slate-100 p-1 rounded-xl w-fit mb-4">
                {['All', 'Active', 'Paused'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            filterStatus === status 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {status === 'All' ? t('dash.view_all') : 
                         status === 'Active' ? t('camp.resume') : t('camp.pause')}
                    </button>
                ))}
            </div>
          )}

          {displayedCampaigns.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t('camp.no_active')}</h3>
                <p className="text-slate-500 mb-6">{t('camp.create_first')}</p>
                <button
                    onClick={() => setView('create')}
                    className="bg-[#0C4185] hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-colors"
                >
                    {t('camp.new')}
                </button>
            </div>
          ) : (
            displayedCampaigns.map((campaign) => (
              <div key={campaign.id} className={`bg-white p-5 rounded-2xl border transition-all relative ${campaign.status === 'Paused' ? 'border-slate-100 opacity-60' : 'border-slate-100 shadow-sm'}`}>
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            campaign.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                            {campaign.status === 'Active' ? <BarChart2 className="w-6 h-6" /> : <PauseCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{campaign.platform} {campaign.type}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="truncate max-w-[150px]">{campaign.targetUrl}</span>
                                {campaign.targeting?.country && campaign.targeting.country !== 'Worldwide' && (
                                    <span className="bg-blue-50 text-blue-600 px-1.5 rounded text-[10px] font-bold flex items-center">
                                        <Globe className="w-3 h-3 ltr:mr-1 rtl:ml-1" /> {campaign.targeting.country}
                                    </span>
                                )}
                            </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end flex-1 pl-4">
                        <div className="flex flex-col items-end flex-1">
                            <div className="flex items-center justify-between w-full sm:w-48 mb-1">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('camp.progress')}</span>
                                <span className="font-bold text-slate-900 text-sm">{campaign.completedCount} / {campaign.totalRequested}</span>
                            </div>
                            <div className="w-full sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${campaign.status === 'Paused' ? 'bg-slate-400' : 'bg-[#0C4185]'}`}
                                    style={{ width: `${(campaign.completedCount / campaign.totalRequested) * 100}%` }}
                                />
                            </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            campaign.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {campaign.status}
                        </span>

                        {/* Menu Trigger */}
                        <div className="relative">
                            <button 
                                onClick={() => setMenuOpenId(menuOpenId === campaign.id ? null : campaign.id)}
                                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <MoreVertical className="w-5 h-5 text-slate-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpenId === campaign.id && (
                                <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-slide-up">
                                    <button 
                                        onClick={() => {
                                            onToggleStatus(campaign.id);
                                            setMenuOpenId(null);
                                        }}
                                        className="w-full text-start px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                    >
                                        {campaign.status === 'Active' ? (
                                            <><PauseCircle className="w-4 h-4 text-amber-500" /> {t('camp.pause')}</>
                                        ) : (
                                            <><PlayCircle className="w-4 h-4 text-green-500" /> {t('camp.resume')}</>
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => openEditModal(campaign)}
                                        className="w-full text-start px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                    >
                                        <Edit2 className="w-4 h-4 text-blue-500" /> {t('camp.edit')}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setDeletingId(campaign.id);
                                            setMenuOpenId(null);
                                        }}
                                        className="w-full text-start px-4 py-3 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium border-t border-slate-50"
                                    >
                                        <Trash2 className="w-4 h-4" /> {t('camp.delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                     </div>
                 </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Country Selection Modal Overlay */}
      {isCountryOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                        autoFocus
                    />
                     <button 
                        onClick={() => {
                            setIsCountryOpen(false);
                            setSearchQuery('');
                        }} 
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-2">
                     {filteredCountryOptions.map(c => (
                        <button
                            key={c.name}
                            onClick={() => {
                                setTargeting({...targeting, country: c.name});
                                setIsCountryOpen(false);
                                setSearchQuery('');
                            }}
                             className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors mb-1 ${
                                targeting.country === c.name 
                                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' 
                                : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{c.flag}</span>
                                <span className="font-medium">{c.name}</span>
                            </div>
                            {targeting.country === c.name && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{t('camp.edit')}</h3>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('camp.desc_label')}</label>
                        <textarea 
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('camp.link_label')}</label>
                        <input 
                            type="text"
                            value={editForm.targetUrl}
                            onChange={(e) => setEditForm({...editForm, targetUrl: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleSaveEdit}
                        className="w-full py-3 bg-[#0C4185] hover:opacity-90 text-white font-bold rounded-xl shadow-lg mt-2"
                    >
                        {t('camp.save_changes')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-slide-up text-center">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('camp.delete')}</h3>
                <p className="text-slate-500 text-sm mb-6">{t('camp.delete_confirm')}</p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeletingId(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                    >
                        {t('camp.cancel')}
                    </button>
                    <button 
                        onClick={() => {
                            onDeleteCampaign(deletingId);
                            setDeletingId(null);
                        }}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200"
                    >
                        {t('camp.confirm_delete')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
