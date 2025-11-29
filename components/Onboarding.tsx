
import React, { useState, useMemo } from 'react';
import { Globe, Check, ArrowRight, Search, ChevronDown, ChevronRight, X, MapPin } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import { COUNTRIES_LIST } from '../types';

interface OnboardingProps {
  onComplete: (data: { country: string; language: string }) => void;
}

const LANGUAGES = [
    { code: 'EN', label: 'English (US)' },
    { code: 'FR', label: 'Français' },
    { code: 'AR', label: 'العربية' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { setLang, t, lang, dir } = useLanguage();
  const [selectedCountryName, setSelectedCountryName] = useState('Morocco');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selection Mode State
  const [isSelectingCountry, setIsSelectingCountry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Derived State
  const selectedCountry = COUNTRIES_LIST.find(c => c.name === selectedCountryName) || COUNTRIES_LIST[0];
  
  const filteredCountries = useMemo(() => {
      if (!searchQuery) return COUNTRIES_LIST;
      return COUNTRIES_LIST.filter(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery]);

  const handleNext = () => {
    if (step === 1) {
        setStep(2);
    } else {
        setIsSubmitting(true);
        setTimeout(() => {
            onComplete({
                country: selectedCountryName,
                language: lang
            });
        }, 1000);
    }
  };

  const handleLangSelect = (code: string) => {
      setLang(code as any);
  };

  const handleCountrySelect = (name: string) => {
      setSelectedCountryName(name);
      setIsSelectingCountry(false);
      setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col h-[600px] max-h-[90vh] relative">
            
            {/* Header Image/Gradient - Only visible when not selecting country to save space */}
            <div className={`flex-shrink-0 bg-gradient-to-br from-indigo-600 to-violet-600 flex flex-col items-center justify-center relative transition-all duration-300 ${isSelectingCountry ? 'h-0 opacity-0' : 'h-32 opacity-100'}`}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mb-2">
                    <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="text-xl font-extrabold tracking-tight text-white">
                    <span className="text-white">Follow</span>
                    <span className="text-sky-200">Me</span>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1 overflow-hidden relative">
                
                {/* Main Content Area */}
                {!isSelectingCountry ? (
                    <>
                         {/* Progress Bar */}
                        <div className="flex gap-2 mb-8 flex-shrink-0">
                            <div className={`h-1.5 rounded-full flex-1 transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                            <div className={`h-1.5 rounded-full flex-1 transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                        </div>

                        {step === 1 ? (
                            <div className="animate-fade-in flex flex-col h-full">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('onb.where')}</h2>
                                <p className="text-slate-500 mb-8">{t('onb.where_desc')}</p>
                                
                                {/* Country Trigger Button */}
                                <button 
                                    onClick={() => setIsSelectingCountry(true)}
                                    className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group text-start"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl shadow-sm rounded-full bg-slate-50">{selectedCountry.flag}</span>
                                        <div>
                                            <div className="font-bold text-lg text-slate-900 group-hover:text-indigo-900">{selectedCountry.name}</div>
                                            <div className="text-sm text-slate-500 group-hover:text-indigo-600 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> Based in {selectedCountry.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 group-hover:border-indigo-200">
                                         <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 ltr:ml-1 rtl:mr-1 rtl:rotate-180" />
                                    </div>
                                </button>
                                
                                <div className="mt-auto pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <span>Currency set to:</span>
                                    <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{selectedCountry.currency}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in flex flex-col h-full">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('onb.lang')}</h2>
                                <p className="text-slate-500 mb-6">{t('onb.lang_desc')}</p>
                                
                                <div className="space-y-3">
                                    {LANGUAGES.map(l => (
                                        <button 
                                            key={l.code}
                                            onClick={() => handleLangSelect(l.code)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                                lang === l.code 
                                                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                                                : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="font-bold text-slate-900">{l.label}</span>
                                            {lang === l.code && (
                                                <div className="bg-indigo-600 text-white p-1 rounded-full">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>{step === 1 ? t('onb.next') : t('onb.start')} <ArrowRight className="w-5 h-5 ltr:ml-1 rtl:mr-1 rtl:rotate-180" /></>
                            )}
                        </button>
                    </>
                ) : (
                    /* Country Selection Overlay (Popup) */
                    <div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up">
                        {/* Popup Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white shadow-sm z-10">
                            <button 
                                onClick={() => setIsSelectingCountry(false)}
                                className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                            <div className="flex-1 relative">
                                <Search className="absolute ltr:left-3 rtl:right-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search country..." 
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full ltr:pl-9 rtl:pr-9 pr-4 py-2 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Popup List */}
                        <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2">Available Regions</div>
                            {filteredCountries.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                                        <Search className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 text-sm">No countries found matching "{searchQuery}"</p>
                                </div>
                            ) : (
                                filteredCountries.map(c => (
                                    <button 
                                        key={c.name}
                                        onClick={() => handleCountrySelect(c.name)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl mb-1 transition-colors group ${
                                            selectedCountryName === c.name ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{c.flag}</span>
                                            <div className="text-start">
                                                <div className={`font-medium ${selectedCountryName === c.name ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>{c.name}</div>
                                                <div className="text-xs text-slate-400">{c.currency}</div>
                                            </div>
                                        </div>
                                        {selectedCountryName === c.name && (
                                            <div className="bg-indigo-600 text-white p-1 rounded-full">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Onboarding;
