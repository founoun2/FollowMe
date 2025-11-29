
import React, { useState, useMemo } from 'react';
import { Task, Platform, TaskType, COUNTRIES_LIST } from '../types';
import { Heart, UserPlus, Eye, ExternalLink, X, AlertCircle, Globe, MapPin, Search, ChevronDown, Check, Coins, CheckCircle2, Flag, MessageSquare, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../services/i18n';

interface EarnProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onSkipTask: (taskId: string) => void;
  streak: number;
}

const Earn: React.FC<EarnProps> = ({ tasks, onCompleteTask, onSkipTask, streak }) => {
  const { t } = useLanguage();
  const [platformFilter, setPlatformFilter] = useState<Platform | 'All'>('All');
  const [countryFilter, setCountryFilter] = useState<string>('Worldwide');
  
  // State for logic
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState<Set<string>>(new Set());

  // Modal State
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reporting State
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('spam');

  const fullCountryList = useMemo(() => [
      { name: 'Worldwide', flag: '🌍', currency: 'USD' },
      ...COUNTRIES_LIST
  ], []);

  const filteredCountryOptions = useMemo(() => {
      return fullCountryList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, fullCountryList]);

  const filteredTasks = tasks.filter(task => {
    const matchesPlatform = platformFilter === 'All' || task.platform === platformFilter;
    const matchesCountry = countryFilter === 'Worldwide' 
        ? true 
        : (task.country === countryFilter || task.country === 'Worldwide');
    
    return matchesPlatform && matchesCountry;
  });

  // Step 1: Open the link and mark as pending
  const handleStartTask = (task: Task) => {
    window.open(task.targetUrl, '_blank');
    setPendingVerification(prev => new Set(prev).add(task.id));
  };

  // Step 2: Verify the task (simulated check)
  const handleVerifyTask = (taskId: string) => {
    setProcessing(taskId);
    setTimeout(() => {
      onCompleteTask(taskId);
      setProcessing(null);
      setPendingVerification(prev => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
      });
    }, 1500); // Simulate network delay for verification
  };

  const handleSubmitReport = () => {
    if (reportingId) {
        onSkipTask(reportingId); // Hide task
        // In real app: send report to backend
        setReportingId(null);
        setReportReason('spam');
    }
  };

  const PlatformIcon = ({ platform }: { platform: Platform }) => {
    const colors = {
      [Platform.Instagram]: 'text-pink-600 bg-pink-50 border-pink-100',
      [Platform.TikTok]: 'text-black bg-gray-100 border-gray-200',
      [Platform.Twitter]: 'text-blue-400 bg-blue-50 border-blue-100',
      [Platform.YouTube]: 'text-red-600 bg-red-50 border-red-100',
      [Platform.Facebook]: 'text-blue-700 bg-blue-50 border-blue-100',
    };
    const style = colors[platform];
    return (
      <div className={`px-2.5 py-0.5 text-xs rounded-full border font-medium ${style}`}>
        {platform}
      </div>
    );
  };

  const TypeIcon = ({ type }: { type: TaskType }) => {
    switch (type) {
      case TaskType.Like: return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case TaskType.Follow: return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case TaskType.View: return <Eye className="w-4 h-4 text-emerald-500" />;
    }
  };

  const selectedCountryData = fullCountryList.find(c => c.name === countryFilter);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('earn.title')}</h1>
            <p className="text-slate-500">{t('earn.subtitle')}</p>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-visible z-10 relative">
        
        {/* Country Selector Trigger */}
        <div className="relative min-w-[200px]">
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

        <div className="h-8 w-px bg-slate-200 hidden sm:block self-center mx-2"></div>

        {/* Platform Tabs */}
        <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-1 no-scrollbar flex-1">
            {['All', ...Object.values(Platform)].map((p) => (
            <button
                key={p}
                onClick={() => setPlatformFilter(p as Platform | 'All')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                platformFilter === p 
                    ? 'bg-[#0C4185] text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
                {p}
            </button>
            ))}
        </div>
      </div>

      {/* Country Selection Modal Overlay */}
      {isCountryOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
                {/* Modal Header with Search */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search country..." 
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
                
                {/* Scrollable List */}
                <div className="overflow-y-auto p-2">
                    {filteredCountryOptions.map(c => (
                        <button
                            key={c.name}
                            onClick={() => {
                                setCountryFilter(c.name);
                                setIsCountryOpen(false);
                                setSearchQuery('');
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors mb-1 ${
                                countryFilter === c.name 
                                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' 
                                : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{c.flag}</span>
                                <span className="font-medium">{c.name}</span>
                            </div>
                            {countryFilter === c.name && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                    ))}
                    {filteredCountryOptions.length === 0 && (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                             <Globe className="w-8 h-8 mb-2 opacity-50" />
                             <p>No countries found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Task List */}
      <div className="grid gap-4 z-0 relative">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
                <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">{t('earn.all_caught_up')}</h3>
            <p className="text-slate-500 max-w-xs">{t('earn.no_tasks')}</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isPending = pendingVerification.has(task.id);
            const isProcessing = processing === task.id;

            return (
                <div 
                key={task.id} 
                className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden"
                >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-20 h-40 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={task.thumbnailUrl} alt="Task" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 sm:hidden">
                        <PlatformIcon platform={task.platform} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-white text-center">
                        {task.country}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-1">
                    <div className="hidden sm:block">
                        <PlatformIcon platform={task.platform} />
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">
                        <Coins className="w-3 h-3 fill-yellow-600 text-yellow-600" />
                        <span className="font-bold">+{task.reward} Coins</span>
                    </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                    <TypeIcon type={task.type} />
                    {task.type === TaskType.Like && (task.platform + " Like")}
                    {task.type === TaskType.Follow && (task.platform + " Follow")}
                    {task.type === TaskType.View && (task.platform + " View")}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="line-clamp-1">{task.description}</span>
                        {task.country !== 'Worldwide' && (
                            <span className="flex items-center text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                <MapPin className="w-3 h-3 ltr:mr-1 rtl:ml-1" /> {task.country}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center w-full sm:w-auto gap-2">
                     <button
                        onClick={() => setReportingId(task.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title={t('earn.report')}
                    >
                        <Flag className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onSkipTask(task.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                        title={t('earn.skip')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    {isPending ? (
                         <button
                            onClick={() => handleVerifyTask(task.id)}
                            disabled={isProcessing}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse transition-all ${
                            isProcessing
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 active:scale-95'
                            }`}
                        >
                             {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>{t('earn.verifying')}</span>
                                </>
                             ) : (
                                 <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('earn.verify')}</span>
                                 </>
                             )}
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStartTask(task)}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse transition-all bg-[#0C4185] hover:opacity-90 text-white shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            <span>{t('earn.do_task')}</span>
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
                </div>
            )
          })
        )}
      </div>

      {/* Reporting Modal */}
      {reportingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-slide-up">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-red-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                        <Flag className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{t('earn.report_title')}</h3>
                </div>

                <div className="space-y-3 mb-6">
                    {['spam', 'broken', 'offensive'].map(reason => (
                        <button
                            key={reason}
                            onClick={() => setReportReason(reason)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                reportReason === reason 
                                ? 'border-red-500 bg-red-50 text-red-700 font-bold' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                {reason === 'spam' && <AlertTriangle className="w-5 h-5" />}
                                {reason === 'broken' && <AlertCircle className="w-5 h-5" />}
                                {reason === 'offensive' && <MessageSquare className="w-5 h-5" />}
                                {t(`earn.report_${reason}`)}
                            </span>
                            {reportReason === reason && <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm" />}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setReportingId(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        {t('earn.cancel')}
                    </button>
                    <button 
                        onClick={handleSubmitReport}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                    >
                        {t('earn.submit_report')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Earn;
