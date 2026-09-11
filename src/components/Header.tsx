import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Play, 
  Lock, 
  Unlock, 
  User as UserIcon, 
  Zap,
  Video,
  Bookmark,
  Tv,
  Settings,
  Bell,
  Flame
} from 'lucide-react';
import { User, GlobalSettings } from '../types';

interface HeaderProps {
  currentUser: User;
  settings: GlobalSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRewardAd: () => void;
  isAdminVerified: boolean;
  onOpenAdminGate: () => void;
  onSwitchUserRole: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  settings,
  activeTab,
  setActiveTab,
  onOpenRewardAd,
  isAdminVerified,
  onOpenAdminGate,
  onSwitchUserRole,
  onOpenAuthModal,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Optional Announcement Bar */}
      {settings.announcementActive && settings.announcementText && (
        <div id="announcement-bar" className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span>{settings.announcementText}</span>
          <button 
            onClick={() => setActiveTab('monetization')}
            className="underline font-semibold text-amber-300 hover:text-white ml-1 text-[11px]"
          >
            Claim Deals →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Video className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 font-sans">
                Scripa<span className="text-indigo-600">.studio</span>
              </h1>
              <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full font-bold">
                Creator SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI Video Script Engine & Teleprompter
            </p>
          </div>
        </div>

        {/* Public Creator Navigation Tabs (Desktop/Tablet) */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Video Studio
          </button>

          <button
            onClick={() => setActiveTab('hook_studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'hook_studio'
                ? 'bg-white text-purple-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-600" />
            Hook & Sound Studio
          </button>

          <button
            onClick={() => setActiveTab('teleprompter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'teleprompter'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-emerald-600" />
            Teleprompter
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            Saved Vault
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'monetization'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-purple-600" />
            Pro Upgrade
          </button>
        </nav>

        {/* Right Section: Credits, Reward Ad Button, & Owner Portal */}
        <div className="flex items-center gap-2.5">
          {/* Credits Counter Pill */}
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl">
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span className="text-xs font-bold text-slate-800">{currentUser.credits}</span>
            <span className="text-[10px] text-indigo-600 font-semibold uppercase">Credits</span>
          </div>

          {/* Watch Ad for Reward Button */}
          <button
            onClick={onOpenRewardAd}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-transform hover:scale-105 shadow-xs"
            title="Watch short ad video for +5 Free AI Credits"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            +5 Bonus
          </button>

          {/* User Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                      {currentUser.plan} Plan
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-semibold">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onOpenAuthModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-800 font-semibold hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 mb-1"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Sign Up / Sign In (Cloud Sync)
                </button>

                <button
                  onClick={() => {
                    onSwitchUserRole();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-700 font-semibold hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Switch Demo Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

