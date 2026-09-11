import React, { useState } from 'react';
import { 
  Crown, 
  Zap, 
  Play, 
  Share2, 
  CheckCircle2, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  Gift
} from 'lucide-react';
import { User, GlobalSettings } from '../types';
import { DBService } from '../services/dbService';

interface MonetizationHubProps {
  currentUser: User;
  settings: GlobalSettings;
  onUpdateUser: (user: User) => void;
  onOpenRewardAd: () => void;
}

export const MonetizationHub: React.FC<MonetizationHubProps> = ({
  currentUser,
  settings,
  onUpdateUser,
  onOpenRewardAd,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'stripe' | 'paypal'>('razorpay');
  const [activeCheckout, setActiveCheckout] = useState<{ title: string; price: number; credits: number; isPlan?: boolean; planType?: 'pro' | 'enterprise' } | null>(null);

  const referralLink = `${window.location.origin}?ref=${currentUser.referralCode}`;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const executePaymentSuccess = (title: string, price: number, credits: number, isPlan?: boolean, planType?: 'pro' | 'enterprise') => {
    let updated: User;
    if (isPlan && planType) {
      updated = {
        ...currentUser,
        plan: planType,
        credits: currentUser.credits + credits,
        totalSpent: currentUser.totalSpent + price,
      };
      const fin = DBService.getFinancials();
      DBService.updateFinancials({
        monthlyRecurringRevenue: fin.monthlyRecurringRevenue + price,
        activeSubscriptions: fin.activeSubscriptions + 1,
        totalRevenue: fin.totalRevenue + price,
      });
    } else {
      updated = {
        ...currentUser,
        credits: currentUser.credits + credits,
        totalSpent: currentUser.totalSpent + price,
      };
      const fin = DBService.getFinancials();
      DBService.updateFinancials({
        creditSalesRevenue: fin.creditSalesRevenue + price,
        totalRevenue: fin.totalRevenue + price,
      });
    }

    onUpdateUser(updated);

    // Record workflow log
    DBService.addWorkflowLog({
      type: 'payment_processed',
      status: 'success',
      details: `Razorpay/Gateway Payment Complete: $${price} for ${title}`,
      metadata: `Gateway: ${selectedGateway.toUpperCase()} | TransactionId: rzp_pay_${Math.random().toString(36).substring(2, 10)}`,
    });

    setActiveCheckout(null);
    setPurchaseSuccess(`Payment Verified via ${selectedGateway.toUpperCase()}! ${title} Unlocked.`);
    setTimeout(() => setPurchaseSuccess(null), 4000);
  };

  return (
    <div id="monetization-hub-root" className="space-y-8">
      {/* Banner Notice */}
      {purchaseSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-between font-bold text-sm shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{purchaseSuccess}</span>
          </div>
          <span className="text-xs bg-emerald-700 px-2 py-1 rounded">Transaction Complete</span>
        </div>
      )}

      {/* Hero Monetization Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-mono uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full font-bold">
            Monetization Engine & Revenue Hub
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-3">
            Earn Credits, Upgrade Plans, & Experience Revenue Ads
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            NovaSphere combines 3 revenue pillars: High-margin Subscription Tiers, Credit Top-ups, and AdSense/Reward Video Ads. Experience how users interact with each channel.
          </p>
        </div>
      </div>

      {/* Grid: Watch Reward Ads & Referral Program */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watch Sponsor Ads for Tokens */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Play className="w-5 h-5 fill-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Watch Sponsor Video Ads (+5 or +10 Tokens)</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Watch a quick 10s sponsor video for <strong>+5 Tokens</strong> or a full video for <strong>+10 Tokens</strong>. Rate limited to max 15 ads per 30 minutes for ad network compliance.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-900 block">Instant Reward</span>
              <span className="text-xs text-amber-700">+5 (10s) or +10 (25s) Tokens</span>
            </div>
            <button
              onClick={onOpenRewardAd}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Watch Bonus Ad
            </button>
          </div>
        </div>

        {/* Viral Referral Program */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Gift className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Viral Referral Link (+25 Tokens)</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Share your referral link on TikTok, X, or YouTube. Earn <strong>+25 Tokens</strong> for every creator who registers!
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Your Unique Referral Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full text-xs font-mono bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-700"
              />
              <button
                onClick={handleCopyRef}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1 transition-colors whitespace-nowrap shadow-xs"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copiedRef ? 'Copied' : 'Copy Link'}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Total Friends Invited: <strong>{currentUser.referralCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-mono uppercase bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full">
            Sustainable Token Economics
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Subscription Pricing & Token Tiers
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Profitable balance between AI computing costs, token allocations, and high ad margins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Creator</span>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-black text-slate-900">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  100 Welcome Bonus Tokens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  25 Daily Free Tokens Refresh
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Ad Banners & Reward Ads
                </li>
              </ul>
            </div>
            <button
              disabled={currentUser.plan === 'free'}
              className="w-full py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-100 text-slate-700 disabled:opacity-60"
            >
              {currentUser.plan === 'free' ? 'Current Plan' : 'Select Free Plan'}
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white rounded-2xl p-6 border-2 border-indigo-500 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white font-bold text-[10px] uppercase font-mono px-3 py-1 rounded-bl-xl">
              Most Popular
            </div>

            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-4 h-4 text-amber-400" /> Pro Creator
              </span>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-4xl font-black text-white">${settings.proMonthlyPrice}</span>
                <span className="text-xs text-indigo-200">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-indigo-100 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  2,500 Tokens / month (50 Full Scripts)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  100% Ad-Free Studio Experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Live Teleprompter Studio Mode
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Priority Gemini 3.6 Processing
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveCheckout({ title: 'Pro Creator Subscription', price: settings.proMonthlyPrice, credits: 2500, isPlan: true, planType: 'pro' })}
              disabled={currentUser.plan === 'pro'}
              className="w-full py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-lg transition-all"
            >
              {currentUser.plan === 'pro' ? 'Active Pro Plan' : `Upgrade to Pro ($${settings.proMonthlyPrice}/mo)`}
            </button>
          </div>

          {/* Enterprise Agency Tier */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agency Founder</span>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-black text-slate-900">${settings.enterpriseMonthlyPrice}</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  10,000 Tokens / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  White-Label Script Exports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Custom Branding & Priority Server
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveCheckout({ title: 'Agency Founder Subscription', price: settings.enterpriseMonthlyPrice, credits: 10000, isPlan: true, planType: 'enterprise' })}
              disabled={currentUser.plan === 'enterprise'}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              {currentUser.plan === 'enterprise' ? 'Active Agency Plan' : `Get Agency ($${settings.enterpriseMonthlyPrice}/mo)`}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Credit Packs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" /> Instant Token Top-Up Packs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">500 Tokens</span>
              <span className="text-xs text-slate-500">$4.99 one-time</span>
            </div>
            <button
              onClick={() => setActiveCheckout({ title: '500 Token Pack', price: 4.99, credits: 500 })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
            >
              Buy $4.99
            </button>
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-900 block">1,500 Tokens (Best Value)</span>
              <span className="text-xs text-indigo-700">$12.99 one-time</span>
            </div>
            <button
              onClick={() => setActiveCheckout({ title: '1,500 Token Pack', price: 12.99, credits: 1500 })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs"
            >
              Buy $12.99
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">5,000 Tokens</span>
              <span className="text-xs text-slate-500">$34.99 one-time</span>
            </div>
            <button
              onClick={() => setActiveCheckout({ title: '5,000 Token Pack', price: 34.99, credits: 5000 })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
            >
              Buy $34.99
            </button>
          </div>
        </div>
      </div>

      {/* Razorpay / Gateway Modal Checkout */}
      {activeCheckout && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  R
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Razorpay / Secure Checkout</h4>
                  <p className="text-[11px] text-slate-500">256-bit SSL Encrypted Payment</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCheckout(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Order Summary</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{activeCheckout.title}</span>
                <span className="font-black text-indigo-600 text-lg">${activeCheckout.price}</span>
              </div>
              <span className="text-xs text-emerald-600 font-bold block">
                + {activeCheckout.credits.toLocaleString()} AI Tokens Unlocked Instantly
              </span>
            </div>

            {/* Select Gateway */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedGateway('razorpay')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    selectedGateway === 'razorpay'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🇮🇳 Razorpay UPI/Cards
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGateway('stripe')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    selectedGateway === 'stripe'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  💳 Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGateway('paypal')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    selectedGateway === 'paypal'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🅿️ PayPal
                </button>
              </div>
            </div>

            <button
              onClick={() => executePaymentSuccess(activeCheckout.title, activeCheckout.price, activeCheckout.credits, activeCheckout.isPlan, activeCheckout.planType)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Pay ${activeCheckout.price} via {selectedGateway.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
