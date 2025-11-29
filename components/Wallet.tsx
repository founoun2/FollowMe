
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, User } from '../types';
import { ArrowDownLeft, ArrowUpRight, CreditCard, History, Lock, CheckCircle, X, Coins, Shield, Smartphone, Globe, Calculator, PlayCircle, Video } from 'lucide-react';
import { useLanguage } from '../services/i18n';

interface WalletProps {
  credits: number;
  transactions: Transaction[];
  onAddCredits: (amount: number, description?: string) => void;
  userSettings: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

// Declare global PayPal window object
declare global {
    interface Window {
        paypal: any;
    }
}

// Currency Conversion Rates (Base USD)
const CURRENCY_RATES: Record<string, { rate: number, symbol: string, code: string }> = {
    'Morocco': { rate: 10, symbol: 'dh', code: 'MAD' },
    'USA': { rate: 1, symbol: '$', code: 'USD' },
    'France': { rate: 0.92, symbol: '€', code: 'EUR' },
    'Saudi Arabia': { rate: 3.75, symbol: 'SAR', code: 'SAR' },
    'UAE': { rate: 3.67, symbol: 'AED', code: 'AED' },
    'Egypt': { rate: 48, symbol: 'EGP', code: 'EGP' },
    'UK': { rate: 0.79, symbol: '£', code: 'GBP' },
    'Germany': { rate: 0.92, symbol: '€', code: 'EUR' },
    'Spain': { rate: 0.92, symbol: '€', code: 'EUR' },
    // Default fallback
    'Worldwide': { rate: 1, symbol: '$', code: 'USD' }
};

const Wallet: React.FC<WalletProps> = ({ credits, transactions, onAddCredits, userSettings, onUpdateUser }) => {
  const { t } = useLanguage();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{amt: number, price: string, rawPrice: number} | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  // PayPal Ref
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Ad State
  const [showAdModal, setShowAdModal] = useState(false);
  const [adTimer, setAdTimer] = useState(15);
  const [canClaimAd, setCanClaimAd] = useState(false);

  // Ad Limits
  const ADS_DAILY_LIMIT_COINS = 100;
  const COINS_PER_AD = 2;
  const MAX_ADS = ADS_DAILY_LIMIT_COINS / COINS_PER_AD;
  const adsWatched = userSettings.adWatchesToday || 0;
  const adsRemaining = Math.max(0, MAX_ADS - adsWatched);

  // Determine currency based on user settings
  const userCountry = userSettings.country || 'USA';
  const currency = CURRENCY_RATES[userCountry] || CURRENCY_RATES['Worldwide'];

  // Base Packages in USD
  const basePackages = [
    { amt: 100, basePrice: 4.99 },
    { amt: 500, basePrice: 19.99, popular: true },
    { amt: 1200, basePrice: 39.99 }
  ];

  const packages = basePackages.map(pkg => {
      const localPrice = (pkg.basePrice * currency.rate).toFixed(2);
      return {
          ...pkg,
          price: `${currency.symbol === '$' ? '$' : ''}${localPrice} ${currency.symbol !== '$' ? currency.symbol : ''}`,
          rawPrice: pkg.basePrice 
      };
  });

  // Custom Amount Logic
  const customNum = parseInt(customAmount) || 0;
  let customRate = 0.05; // Base rate
  if (customNum >= 500) customRate = 0.04;
  if (customNum >= 1200) customRate = 0.0333;
  
  const customBasePrice = customNum * customRate;
  const localCustomPrice = (customBasePrice * currency.rate).toFixed(2);
  const customPriceString = `${currency.symbol === '$' ? '$' : ''}${localCustomPrice} ${currency.symbol !== '$' ? currency.symbol : ''}`;

  const handleBuyClick = (pkg: {amt: number, price: string, rawPrice: number}) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handleBuyCustom = () => {
      if (customNum < 50) return;
      handleBuyClick({
          amt: customNum,
          price: customPriceString,
          rawPrice: customBasePrice
      });
  };

  // --- REAL PAYPAL INTEGRATION ---
  useEffect(() => {
      // Only try to render button if modal is open, package is selected, and container exists
      if (showPaymentModal && selectedPackage && window.paypal && paypalRef.current) {
          // Clear previous buttons if any
          paypalRef.current.innerHTML = '';
          
          window.paypal.Buttons({
              style: {
                  layout: 'vertical',
                  color:  'blue',
                  shape:  'rect',
                  label:  'paypal'
              },
              createOrder: (data: any, actions: any) => {
                  return actions.order.create({
                      purchase_units: [{
                          description: `${selectedPackage.amt} Coins - FollowMe`,
                          amount: {
                              // We charge in USD because that's what is configured in the script tag in index.html
                              value: selectedPackage.rawPrice.toFixed(2) 
                          }
                      }]
                  });
              },
              onApprove: (data: any, actions: any) => {
                  return actions.order.capture().then((details: any) => {
                      // Successful capture
                      const payerName = details.payer.name.given_name;
                      onAddCredits(selectedPackage.amt, `Purchase via PayPal (${payerName})`);
                      setShowPaymentModal(false);
                      setSelectedPackage(null);
                      setCustomAmount('');
                  });
              },
              onError: (err: any) => {
                  console.error("PayPal Error:", err);
                  alert("Payment could not be processed. Please try again.");
              }
          }).render(paypalRef.current);
          
          setPaypalLoaded(true);
      }
  }, [showPaymentModal, selectedPackage]);


  // AD LOGIC
  useEffect(() => {
      // Fix: Used 'any' for interval type to prevent "Cannot find namespace 'NodeJS'" error in browser environment
      let interval: any;
      if (showAdModal && adTimer > 0) {
          interval = setInterval(() => {
              setAdTimer(prev => prev - 1);
          }, 1000);
      } else if (adTimer === 0) {
          setCanClaimAd(true);
      }
      return () => clearInterval(interval);
  }, [showAdModal, adTimer]);

  const handleWatchAd = () => {
      if (adsRemaining <= 0) return;
      setAdTimer(15);
      setCanClaimAd(false);
      setShowAdModal(true);
  };

  const handleClaimAd = () => {
      onAddCredits(COINS_PER_AD, 'Video Ad Reward');
      onUpdateUser({ adWatchesToday: adsWatched + 1 });
      setShowAdModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative pb-20">
      <h1 className="text-2xl font-bold text-slate-900">{t('wallet.title')}</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#0C4185] to-blue-900 rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-40 h-40 bg-sky-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <p className="text-blue-100 font-medium mb-2 text-sm uppercase tracking-wider opacity-80">{t('wallet.balance')}</p>
                <h2 className="text-5xl font-extrabold tracking-tight flex items-center gap-3">
                    <Coins className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                    {credits} 
                    <span className="text-2xl text-blue-200 font-medium">{t('wallet.credits')}</span>
                </h2>
            </div>
            <div className="flex flex-col items-end">
               <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white mb-2 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    {t('wallet.billing')}: {userCountry} ({currency.code})
               </div>
            </div>
        </div>
      </div>

      {/* WATCH ADS CARD */}
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl p-1 shadow-lg animate-fade-in">
          <div className="bg-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-fuchsia-100 flex items-center justify-center flex-shrink-0">
                      <Video className="w-8 h-8 text-fuchsia-600" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-slate-900">{t('wallet.watch_earn')}</h3>
                      <p className="text-slate-500 text-sm">{t('wallet.watch_desc')}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md border border-yellow-200">{t('wallet.watch_reward')}</span>
                          <span className="text-slate-400">{adsWatched}/{MAX_ADS} used</span>
                      </div>
                  </div>
              </div>

              {adsRemaining > 0 ? (
                <button 
                    onClick={handleWatchAd}
                    className="w-full sm:w-auto px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-200 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <PlayCircle className="w-5 h-5" /> {t('wallet.watch_btn')}
                </button>
              ) : (
                  <div className="px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm border border-slate-200">
                      {t('wallet.ad_limit_hit')}
                  </div>
              )}
          </div>
      </div>

      {/* Packages */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-slate-400" />
            {t('wallet.buy_title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {packages.map((pkg) => (
                <button 
                    key={pkg.amt}
                    onClick={() => handleBuyClick(pkg)}
                    className={`relative p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl text-start group ${
                        pkg.popular 
                        ? 'border-yellow-500 bg-gradient-to-b from-yellow-50 to-white ring-2 ring-yellow-500/20' 
                        : 'border-slate-200 bg-white hover:border-[#0C4185]'
                    }`}
                >
                    {pkg.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                            {t('wallet.best_value')}
                        </span>
                    )}
                    <div className="flex justify-between items-start mb-2">
                         <div className={`p-3 rounded-full ${pkg.popular ? 'bg-yellow-100' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                            <Coins className={`w-6 h-6 ${pkg.popular ? 'text-yellow-600 fill-yellow-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                         </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">
                         {pkg.amt}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mb-4">{t('wallet.credits')}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-lg font-bold text-slate-900">{pkg.price}</span>
                        <div className="bg-[#0C4185] text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                             <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </button>
            ))}
        </div>

        {/* Custom Amount Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-3">
                     <div className="p-2 bg-slate-100 rounded-lg"><Calculator className="w-5 h-5 text-slate-500" /></div>
                     <label className="text-sm font-bold text-slate-900">Custom Amount</label>
                </div>
                <div className="relative">
                    <input 
                        type="number" 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter coins amount..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0C4185] outline-none font-bold text-lg text-slate-900 placeholder:text-slate-300"
                    />
                    <div className="absolute left-3 top-3 bg-yellow-100 p-1 rounded-full">
                        <Coins className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-1">Minimum 50 coins. Volume discounts apply.</p>
             </div>

             <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <div className="flex-1 md:text-right">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Cost</div>
                    <div className="text-3xl font-black text-[#0C4185]">{customPriceString}</div>
                </div>
                <button 
                    onClick={handleBuyCustom}
                    disabled={customNum < 50}
                    className="flex-1 md:flex-none px-8 py-4 bg-[#0C4185] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 whitespace-nowrap"
                >
                    {t('wallet.buy_now')}
                </button>
             </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900">{t('wallet.history')}</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Last 30 days</span>
        </div>
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {transactions.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 text-sm">No transactions yet</div>
            ) : (
                transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                                tx.type === 'earn' ? 'bg-green-100 text-green-600' : 
                                tx.type === 'purchase' ? 'bg-blue-100 text-blue-600' : 
                                tx.type === 'bonus' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {tx.type === 'earn' ? <ArrowUpRight className="w-4 h-4" /> : 
                                tx.type === 'purchase' ? <CreditCard className="w-4 h-4" /> :
                                tx.type === 'bonus' ? <Coins className="w-4 h-4" /> :
                                <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 text-sm">{tx.description}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className={`font-bold text-sm flex items-center gap-1 ${
                            tx.type === 'spend' ? 'text-slate-900' : 'text-green-600'
                        }`}>
                            {tx.type === 'spend' ? '-' : '+'}{tx.amount}
                        </span>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                <div className="bg-[#0C4185] p-6 text-white flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-300" /> {t('wallet.pay_modal')}
                        </h3>
                        <p className="text-blue-200 text-sm flex items-center gap-1 mt-1">
                            <span className="text-white font-bold">{selectedPackage.amt} Coins</span> for {selectedPackage.price}
                        </p>
                    </div>
                    <button onClick={() => setShowPaymentModal(false)} className="text-blue-200 hover:text-white bg-white/10 p-2 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* PAYPAL SMART BUTTONS CONTAINER */}
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                             Secure Checkout via PayPal
                        </div>
                        
                        <div id="paypal-button-container" ref={paypalRef} className="min-h-[150px]">
                            {/* Button will be injected here by the SDK */}
                            {!window.paypal && (
                                <div className="text-center p-4 text-red-500 text-sm bg-red-50 rounded-xl border border-red-100">
                                    PayPal SDK not loaded. Please check your internet connection.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-4 bg-slate-50 py-2 rounded-lg">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span>256-bit SSL Encrypted • Trusted Payment</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* AD MODAL */}
      {showAdModal && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black animate-fade-in">
               <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                   <button className="absolute top-4 right-4 text-white/20" disabled><X className="w-8 h-8" /></button>
                   
                   <div className="text-center mb-8 animate-pulse">
                       <h2 className="text-3xl font-bold text-white mb-2">{t('wallet.ad_watching')}...</h2>
                       <p className="text-slate-400">{t('wallet.ad_wait')} <span className="text-yellow-400 font-mono font-bold text-xl">{adTimer}s</span></p>
                   </div>

                   {/* Fake Video Player UI */}
                   <div className="w-full max-w-lg aspect-video bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center relative overflow-hidden shadow-2xl">
                       <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-blue-900/40"></div>
                       <Video className="w-16 h-16 text-white/20" />
                       
                       {/* Progress Bar */}
                       <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-1000 ease-linear" style={{ width: `${((15 - adTimer) / 15) * 100}%` }}></div>
                   </div>

                   {canClaimAd ? (
                       <button 
                        onClick={handleClaimAd}
                        className="mt-12 px-8 py-4 bg-yellow-500 text-black font-black text-lg rounded-full shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 transition-transform animate-slide-up flex items-center gap-2"
                       >
                           <Coins className="w-6 h-6 fill-black" /> {t('wallet.ad_claim')}
                       </button>
                   ) : (
                       <div className="mt-12 h-14 flex items-center text-slate-500 text-sm font-medium bg-white/10 px-6 rounded-full backdrop-blur-sm">
                           Reward unlocks in {adTimer}s
                       </div>
                   )}
               </div>
           </div>
      )}

    </div>
  );
};

export default Wallet;
