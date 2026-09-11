import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { AdConfig } from '../types';
import { DBService } from '../services/dbService';

interface BannerAdSpaceProps {
  type: 'header' | 'sidebar' | 'in_feed';
  adConfig: AdConfig;
}

export const BannerAdSpace: React.FC<BannerAdSpaceProps> = ({ type, adConfig }) => {
  const hasImpressionBeenRecorded = useRef(false);

  useEffect(() => {
    if (!hasImpressionBeenRecorded.current) {
      hasImpressionBeenRecorded.current = true;
      DBService.recordAdImpression();
    }
  }, []);

  const handleAdClick = (e: React.MouseEvent) => {
    DBService.recordAdClick();
  };

  if (type === 'header' && !adConfig.headerBannerActive) return null;
  if (type === 'sidebar' && !adConfig.sidebarBannerActive) return null;
  if (type === 'in_feed' && !adConfig.inFeedAdsActive) return null;

  if (type === 'header') {
    return (
      <div id="ad-space-header" className="w-full my-4">
        {adConfig.customBannerCode ? (
          <div 
            onClick={handleAdClick}
            className="cursor-pointer transition-transform hover:scale-[1.005]"
            dangerouslySetInnerHTML={{ __html: adConfig.customBannerCode }}
          />
        ) : (
          <div 
            onClick={handleAdClick}
            className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-sm border border-indigo-700/50 cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <div className="bg-amber-400/20 text-amber-300 p-2 rounded-lg border border-amber-400/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider font-mono text-[10px] border border-indigo-400/20">Sponsored Ad</span>
                  <span className="text-xs text-indigo-300 font-medium">{adConfig.sponsoredTitle}</span>
                </div>
                <p className="text-xs text-indigo-200 mt-0.5 max-w-xl">
                  {adConfig.sponsoredDescription}
                </p>
              </div>
            </div>
            <a 
              href={adConfig.sponsoredLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              {adConfig.sponsoredCta}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div id="ad-space-sidebar" className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Ad Partner Spot
          </span>
          <span className="text-[10px] text-slate-500">AdSense Verified</span>
        </div>

        <div onClick={handleAdClick} className="cursor-pointer group">
          <div className="w-full h-32 bg-gradient-to-br from-purple-900/60 to-slate-900 rounded-lg border border-purple-500/30 p-3 flex flex-col justify-between group-hover:border-purple-400 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-amber-300">🔥 Cloud Hosting Deal</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">-$200 Off</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Deploy your AI Micro-SaaS on cloud infrastructure with 99.99% uptime.
            </p>
            <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium">
              <span>Claim Free Credits</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="ad-space-infeed" className="my-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded uppercase font-semibold">Ad</span>
        <p className="text-xs text-slate-700 font-medium">
          Need custom domain SSL for your AI app? Register domain & get 1-year free DNS management.
        </p>
      </div>
      <button 
        onClick={handleAdClick}
        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        Learn More
      </button>
    </div>
  );
};
