
export enum Platform {
    Instagram = 'Instagram',
    TikTok = 'TikTok',
    Twitter = 'Twitter',
    YouTube = 'YouTube',
    Facebook = 'Facebook'
  }
  
  export enum TaskType {
    Like = 'Like',
    Follow = 'Follow',
    View = 'View'
  }
  
  export enum CampaignStatus {
    Active = 'Active',
    Completed = 'Completed',
    Paused = 'Paused'
  }
  
  export interface User {
    id: string;
    username: string;
    email: string;
    credits: number;
    reputation: number; // 0-100
    avatarUrl: string;
    streak: number;
    lastLoginDate?: string; // ISO String
    adWatchesToday?: number;
    lastAdDate?: string; // ISO String for resetting ads
    country?: string;
    language?: string;
    currencyCode?: string;
    currencySymbol?: string;
  }
  
  export interface Task {
    id: string;
    platform: Platform;
    type: TaskType;
    reward: number;
    description: string;
    targetUrl: string;
    thumbnailUrl: string;
    completed?: boolean;
    country: string; // 'Worldwide' or ISO code like 'US', 'BR'
  }
  
  export interface Campaign {
    id: string;
    platform: Platform;
    type: TaskType;
    targetUrl: string;
    description: string;
    totalRequested: number;
    completedCount: number;
    costPerAction: number;
    status: CampaignStatus;
    tags?: string[];
    targeting?: {
        country: string;
    }
  }
  
  export interface Transaction {
    id: string;
    type: 'earn' | 'spend' | 'purchase' | 'bonus';
    amount: number;
    date: string; // ISO date
    description: string;
  }
  
  export interface AiAdvice {
    suggestedPlatform: string;
    targetAudience: string;
    hashtags: string[];
    viralityScore: number;
    reasoning: string;
  }

  export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }

export const COUNTRIES_LIST = [
    { name: 'Morocco', flag: '🇲🇦', currency: 'MAD' },
    { name: 'United States', flag: '🇺🇸', currency: 'USD' },
    { name: 'France', flag: '🇫🇷', currency: 'EUR' },
    { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
    { name: 'UAE', flag: '🇦🇪', currency: 'AED' },
    { name: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
    { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
    { name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
    { name: 'Spain', flag: '🇪🇸', currency: 'EUR' },
    { name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
    { name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
    { name: 'India', flag: '🇮🇳', currency: 'INR' },
    { name: 'Algeria', flag: '🇩🇿', currency: 'DZD' },
    { name: 'Tunisia', flag: '🇹🇳', currency: 'TND' },
    { name: 'Qatar', flag: '🇶🇦', currency: 'QAR' },
    { name: 'Kuwait', flag: '🇰🇼', currency: 'KWD' },
    { name: 'Jordan', flag: '🇯🇴', currency: 'JOD' },
    { name: 'Lebanon', flag: '🇱🇧', currency: 'LBP' },
    { name: 'Oman', flag: '🇴🇲', currency: 'OMR' },
    { name: 'Bahrain', flag: '🇧🇭', currency: 'BHD' },
    { name: 'Turkey', flag: '🇹🇷', currency: 'TRY' },
    { name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
    { name: 'Russia', flag: '🇷🇺', currency: 'RUB' },
    { name: 'China', flag: '🇨🇳', currency: 'CNY' },
    { name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
    { name: 'South Korea', flag: '🇰🇷', currency: 'KRW' },
    { name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
    { name: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
    { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR' },
    { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
    { name: 'Sweden', flag: '🇸🇪', currency: 'SEK' },
    { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
    { name: 'Belgium', flag: '🇧🇪', currency: 'EUR' },
    { name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
    { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
    { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
    { name: 'Portugal', flag: '🇵🇹', currency: 'EUR' },
    { name: 'Poland', flag: '🇵🇱', currency: 'PLN' },
    { name: 'Ukraine', flag: '🇺🇦', currency: 'UAH' },
    { name: 'Iraq', flag: '🇮🇶', currency: 'IQD' },
    { name: 'Yemen', flag: '🇾🇪', currency: 'YER' },
    { name: 'Libya', flag: '🇱🇾', currency: 'LYD' },
    { name: 'Sudan', flag: '🇸🇩', currency: 'SDG' },
    { name: 'Syria', flag: '🇸🇾', currency: 'SYP' },
    { name: 'Palestine', flag: '🇵🇸', currency: 'ILS' },
    { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR' },
    { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT' },
    { name: 'Philippines', flag: '🇵🇭', currency: 'PHP' },
    { name: 'Vietnam', flag: '🇻🇳', currency: 'VND' },
    { name: 'Thailand', flag: '🇹🇭', currency: 'THB' },
    { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
];
