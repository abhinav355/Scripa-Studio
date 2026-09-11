import React from 'react';
import { Sparkles, Flame, Tv, Bookmark, Crown, User } from 'lucide-react';
import { User as UserType } from '../types';

interface MobileNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserType;
  onOpenAuthModal: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
}) => {
  return (
    <div 
      id="mobile-nav-bar"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl"
    >
      <button
        type="button"
        onClick={() => setActiveTab('studio')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeTab === 'studio' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Studio</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('hook_studio')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeTab === 'hook_studio' ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Hooks</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('teleprompter')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeTab === 'teleprompter' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Tv className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Prompter</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('library')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeTab === 'library' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Vault</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('monetization')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeTab === 'monetization' ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Crown className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Upgrade</span>
      </button>

      <button
        type="button"
        onClick={onOpenAuthModal}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-all relative"
      >
        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
          {currentUser.name.charAt(0)}
        </div>
        <span className="text-[10px] mt-0.5">Account</span>
      </button>
    </div>
  );
};
