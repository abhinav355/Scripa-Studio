import React, { useState } from 'react';
import { ExternalLink, Sparkles, ShieldCheck, DollarSign, Eye } from 'lucide-react';
import { User, AdConfig } from '../types';
import { DBService } from '../services/dbService';

interface ContinuousAdTickerProps {
  currentUser: User;
  adConfig: AdConfig;
  onUpdateUser: (user: User) => void;
}

export const ContinuousAdTicker: React.FC<ContinuousAdTickerProps> = ({
  adConfig,
}) => {
  const [adViews, setAdViews] = useState(0);

  const handleSponsorClick = () => {
    DBService.recordAdClick();
    setAdViews((v) => v + 1);
  };

  if (!adConfig.headerBannerActive && !adConfig.inFeedAdsActive) return null;

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3 my-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title & Network Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Scripa Sponsor Ad Network
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Verified Sponsor Partner
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified ad partner impressions generating high CPM ($4.50) & CPC revenue for Scripa platform.
            </p>
          </div>
        </div>

        {/* Sponsor CTA Link */}
        <a
          href={adConfig.sponsoredLink || 'https://ai.studio'}
          target="_blank"
          rel="noreferrer"
          onClick={handleSponsorClick}
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
        >
          <span>{adConfig.sponsoredCta || 'Visit Sponsor Deal'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Ad Showcase Card & Stats */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded font-bold">
            Featured Partner
          </span>
          <div>
            <span className="font-bold text-slate-200">{adConfig.sponsoredTitle || 'Ultra-Fast Creator Hosting'}</span>
            <span className="text-slate-400 text-[11px] block sm:inline sm:ml-2">
              {adConfig.sponsoredDescription || 'Deploy viral script engines with 99.99% uptime & 1-click cloud scale.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 self-end md:self-auto border-t md:border-t-0 border-slate-800 pt-2 md:pt-0 w-full md:w-auto justify-between md:justify-end">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-amber-400" /> {adConfig.impressions + adViews} Views
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <DollarSign className="w-3.5 h-3.5" /> ${adConfig.totalAdRevenue.toFixed(2)} Platform Ad Rev
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> AdSense Verified
          </span>
        </div>
      </div>
    </div>
  );
};
