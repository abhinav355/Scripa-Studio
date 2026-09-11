import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, Sparkles, Volume2, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { DBService } from '../services/dbService';

interface RewardAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (creditsGranted: number) => void;
  initialRewardType?: 5 | 10;
}

export const RewardAdModal: React.FC<RewardAdModalProps> = ({ 
  isOpen, 
  onClose, 
  onRewardClaimed,
  initialRewardType = 5 
}) => {
  const [selectedBonus, setSelectedBonus] = useState<5 | 10>(initialRewardType);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ allowed: boolean; watchedInWindow: number; minutesToWait: number }>({
    allowed: true,
    watchedInWindow: 0,
    minutesToWait: 0,
  });

  useEffect(() => {
    if (isOpen) {
      const check = DBService.canWatchAd();
      setRateLimitInfo(check);
      setSelectedBonus(initialRewardType);
      setIsTabFocused(!document.hidden);
    }
  }, [isOpen, initialRewardType]);

  // Tab visibility & focus change listener to prevent background ad exploitation
  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = !document.hidden && document.hasFocus();
      setIsTabFocused(active);
    };

    const handleBlur = () => setIsTabFocused(false);
    const handleFocus = () => setIsTabFocused(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const adDuration = selectedBonus === 5 ? 10 : 25;

  useEffect(() => {
    let timer: any;
    // ONLY count down if ad is playing AND tab is focused
    if (isPlaying && isTabFocused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsCompleted(true);
      setIsPlaying(false);
      DBService.recordAdClick();
      DBService.recordAdWatch();
    }
    return () => clearInterval(timer);
  }, [isPlaying, isTabFocused, timeLeft]);

  if (!isOpen) return null;

  const startAdVideo = () => {
    const check = DBService.canWatchAd();
    if (!check.allowed) {
      setRateLimitInfo(check);
      return;
    }

    setIsPlaying(true);
    setTimeLeft(adDuration);
    setIsCompleted(false);
    DBService.recordAdImpression();
  };

  const handleClaim = () => {
    onRewardClaimed(selectedBonus);
    onClose();
    // Reset state
    setIsPlaying(false);
    setTimeLeft(10);
    setIsCompleted(false);
  };

  return (
    <div id="reward-ad-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="reward-ad-modal-content" className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-lg font-bold">Watch Sponsor Ad for Bonus Tokens</h3>
        </div>

        {/* Rate limit warning if user exceeded 15 ads in 30 mins */}
        {!rateLimitInfo.allowed && (
          <div className="p-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 rounded-xl my-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ad Watch Limit Reached (15 Ads / 30 Mins)</span>
            </div>
            <p className="text-[11px] text-amber-100">
              To prevent ad spamming, you can watch up to 15 sponsor ads per 30 minutes. You have watched {rateLimitInfo.watchedInWindow} ads in this window.
            </p>
            <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Next ad available in ~{rateLimitInfo.minutesToWait} min(s)</span>
            </div>
          </div>
        )}

        {!isPlaying && !isCompleted && (
          <div className="text-center py-4 space-y-4">
            {/* Dual Options Select */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <button
                type="button"
                onClick={() => setSelectedBonus(5)}
                className={`p-3 rounded-xl border transition-all text-xs font-semibold ${
                  selectedBonus === 5
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-mono uppercase bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded block w-max mb-1 font-bold">
                  10s Quick Video
                </span>
                <span className="text-sm font-bold text-emerald-400 block">+5 Video Tokens</span>
                <span className="text-[10px] text-slate-400">10-second sponsor spot</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBonus(10)}
                className={`p-3 rounded-xl border transition-all text-xs font-semibold ${
                  selectedBonus === 10
                    ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-mono uppercase bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded block w-max mb-1 font-bold">
                  25s Full Video
                </span>
                <span className="text-sm font-bold text-amber-400 block">+10 Video Tokens</span>
                <span className="text-[10px] text-slate-400">25-second deep dive</span>
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Watch a sponsor ad to instantly unlock <strong>+{selectedBonus} Video Tokens</strong> for your script generations!
            </p>

            <button
              onClick={startAdVideo}
              disabled={!rateLimitInfo.allowed}
              className={`w-full py-3 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm ${
                rateLimitInfo.allowed
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {rateLimitInfo.allowed ? `Start ${adDuration}s Sponsor Video (+${selectedBonus})` : `Ad Limit Reached (Wait ~${rateLimitInfo.minutesToWait}m)`}
            </button>
          </div>
        )}

        {isPlaying && (
          <div className="py-4">
            {!isTabFocused && (
              <div className="mb-3 p-3 bg-amber-500/20 border border-amber-500/50 text-amber-200 rounded-xl text-xs flex items-center gap-2 font-bold animate-pulse">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>⚠️ Ad Video Paused: Window lost focus. Please keep this tab active to finish watching and earn tokens!</span>
              </div>
            )}

            <div className={`relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner transition-opacity ${
              !isTabFocused ? 'opacity-50' : 'opacity-100'
            }`}>
              <div className="flex justify-between items-center z-10">
                <span className="text-xs bg-black/60 px-2.5 py-1 rounded-full text-slate-300 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Audio On
                </span>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                  isTabFocused ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {isTabFocused ? `${timeLeft}s remaining` : 'PAUSED (Tab Inactive)'}
                </span>
              </div>

              <div className="text-center my-auto z-10">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest block mb-1">Featured Sponsor Spot</span>
                <h4 className="text-lg font-bold text-white mb-1">Scripa Cloud for Creators</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Build and scale high-engagement viral video scripts with dual failover AI infrastructure.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full transition-all duration-1000"
                  style={{ width: `${((adDuration - timeLeft) / adDuration) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-center text-slate-400 mt-3">
              Please watch until the end to claim your reward (+{selectedBonus} Tokens).
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Ad Completed!</h4>
            <p className="text-sm text-slate-300 mb-6">
              Thank you for supporting Scripa.studio! You have earned <strong>+{selectedBonus} Video Tokens</strong>.
            </p>
            <button
              onClick={handleClaim}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Claim My +{selectedBonus} Tokens
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            AdSense Rate-Limit Safe (Max 15/30m)
          </span>
          <span>CPM Rate: $4.50</span>
        </div>
      </div>
    </div>
  );
};
