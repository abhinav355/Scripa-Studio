import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BannerAdSpace } from './components/BannerAdSpace';
import { ContinuousAdTicker } from './components/ContinuousAdTicker';
import { MicroSaaSStudio } from './components/MicroSaaSStudio';
import { ViralHookStudio } from './components/ViralHookStudio';
import { Teleprompter } from './components/Teleprompter';
import { ScriptLibrary } from './components/ScriptLibrary';
import { MonetizationHub } from './components/MonetizationHub';
import { PublishBlueprint } from './components/PublishBlueprint';
import { AdminPortal } from './components/AdminPortal';
import { RewardAdModal } from './components/RewardAdModal';
import { AuthModal } from './components/AuthModal';
import { MobileNavBar } from './components/MobileNavBar';
import { User, AdConfig, GlobalSettings, GeneratedProject } from './types';
import { DBService } from './services/dbService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => DBService.getCurrentUser());
  const [adConfig, setAdConfig] = useState<AdConfig>(() => DBService.getAdConfig());
  const [settings, setSettings] = useState<GlobalSettings>(() => DBService.getSettings());
  const [projects, setProjects] = useState<GeneratedProject[]>(() => DBService.getProjects());
  
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [isRewardAdOpen, setIsRewardAdOpen] = useState(false);
  const [rewardAdType, setRewardAdType] = useState<5 | 10>(5);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [activeTeleprompterScript, setActiveTeleprompterScript] = useState<string>('');

  useEffect(() => {
    // If current logged-in user role is admin, automatically grant initial admin verification status
    if (currentUser.role === 'admin') {
      setIsAdminVerified(true);
    }
  }, [currentUser]);

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    DBService.setCurrentUser(updatedUser);
    // Silent sync with server
    fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: updatedUser, projects: DBService.getProjects() }),
    }).catch(() => {});
  };

  // Keyboard shortcut & URL hash listener for Owner Gateway
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#owner' || window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setActiveTab('admin');
        window.location.hash = 'owner';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    if (window.location.hash === '#owner' || window.location.hash === '#admin') {
      setActiveTab('admin');
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenRewardAd = (reward: 5 | 10 = 5) => {
    setRewardAdType(reward);
    setIsRewardAdOpen(true);
  };

  const handleRewardClaimed = (creditsGranted: number) => {
    const updated = {
      ...currentUser,
      credits: currentUser.credits + creditsGranted,
    };
    handleUpdateUser(updated);
  };

  const handleVerifyAdminPin = (pin: string): boolean => {
    if (pin === settings.adminPin) {
      setIsAdminVerified(true);
      return true;
    }
    return false;
  };

  const handleSwitchUserRole = () => {
    const users = DBService.getUsers();
    if (currentUser.role === 'admin') {
      const user = users.find(u => u.role === 'user') || users[1];
      setCurrentUser(user);
      DBService.setCurrentUser(user);
      setIsAdminVerified(false);
    } else {
      const admin = users.find(u => u.role === 'admin') || users[0];
      setCurrentUser(admin);
      DBService.setCurrentUser(admin);
      setIsAdminVerified(true);
    }
  };

  const handleOpenTeleprompterWithScript = (scriptText: string) => {
    setActiveTeleprompterScript(scriptText);
    setActiveTab('teleprompter');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white pb-20 sm:pb-6">
      {/* Global Top Header Bar */}
      <Header
        currentUser={currentUser}
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRewardAd={() => handleOpenRewardAd(5)}
        isAdminVerified={isAdminVerified}
        onOpenAdminGate={() => setActiveTab('admin')}
        onSwitchUserRole={handleSwitchUserRole}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout Container */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 space-y-6">
        {/* Top Header Banner Ad Space (Active if configured in Admin Vault & not on admin tab) */}
        {activeTab !== 'admin' && activeTab !== 'teleprompter' && (
          <>
            <BannerAdSpace type="header" adConfig={adConfig} />
            <ContinuousAdTicker
              currentUser={currentUser}
              adConfig={adConfig}
              onUpdateUser={handleUpdateUser}
            />
          </>
        )}

        {/* Tab Views */}
        {activeTab === 'studio' && (
          <MicroSaaSStudio
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onOpenRewardAd={() => handleOpenRewardAd(5)}
            onNavigateToMonetization={() => setActiveTab('monetization')}
            onOpenTeleprompterWithScript={handleOpenTeleprompterWithScript}
          />
        )}

        {activeTab === 'hook_studio' && (
          <ViralHookStudio
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onOpenTeleprompterWithScript={handleOpenTeleprompterWithScript}
          />
        )}

        {activeTab === 'teleprompter' && (
          <Teleprompter 
            initialScript={activeTeleprompterScript} 
            onClose={() => setActiveTab('studio')} 
          />
        )}

        {activeTab === 'library' && (
          <ScriptLibrary
            projects={projects}
            onRefresh={() => setProjects(DBService.getProjects())}
            onOpenTeleprompter={handleOpenTeleprompterWithScript}
          />
        )}

        {activeTab === 'monetization' && (
          <MonetizationHub
            currentUser={currentUser}
            settings={settings}
            onUpdateUser={handleUpdateUser}
            onOpenRewardAd={() => handleOpenRewardAd(10)}
          />
        )}

        {activeTab === 'blueprint' && (
          <PublishBlueprint />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            isAdminVerified={isAdminVerified}
            onVerifyAdminPin={handleVerifyAdminPin}
            onLockVault={() => setIsAdminVerified(false)}
            onUpdateAdConfig={(newConfig) => setAdConfig(newConfig)}
            onUpdateSettings={(newSettings) => setSettings(newSettings)}
            onRefreshData={() => {
              setAdConfig(DBService.getAdConfig());
              setSettings(DBService.getSettings());
            }}
          />
        )}
      </main>

      {/* Mobile Sticky Navigation Bar */}
      <MobileNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Scripa.studio</span>
            <span>— AI Video Script Engine & Teleprompter for Content Creators</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('studio')} className="hover:text-indigo-600 transition-colors">
              Video Studio
            </button>
            <button onClick={() => setActiveTab('teleprompter')} className="hover:text-indigo-600 transition-colors">
              Teleprompter
            </button>
            <button onClick={() => setActiveTab('monetization')} className="hover:text-indigo-600 transition-colors">
              Pricing & Plans
            </button>
          </div>
        </div>
      </footer>

      {/* Reward Video Ad Modal */}
      <RewardAdModal
        isOpen={isRewardAdOpen}
        onClose={() => setIsRewardAdOpen(false)}
        onRewardClaimed={handleRewardClaimed}
        initialRewardType={rewardAdType}
      />

      {/* User Auth & Data Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(usr) => {
          setCurrentUser(usr);
          setProjects(DBService.getProjects());
        }}
      />
    </div>
  );
}

