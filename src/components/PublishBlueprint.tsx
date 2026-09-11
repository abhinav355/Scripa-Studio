import React, { useState } from 'react';
import { 
  Globe, 
  DollarSign, 
  ShieldCheck, 
  Rocket, 
  Copy, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Code, 
  Server,
  Layers,
  TrendingUp,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const PublishBlueprint: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopySnippet = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: '1. Host & Publish App',
      icon: Server,
      badge: 'Cloud Deployment',
      summary: 'Deploy your app to Google Cloud Run, Vercel, or custom domain in 1 click.',
    },
    {
      id: 2,
      title: '2. Connect Ads & AdSense',
      icon: DollarSign,
      badge: 'Passive Ad Revenue',
      summary: 'Inject Google AdSense tag & custom banner scripts into Admin Vault.',
    },
    {
      id: 3,
      title: '3. Connect Stripe Payments',
      icon: Layers,
      badge: 'Recurring Subscriptions',
      summary: 'Hook up Stripe or LemonSqueezy for $19/mo & $49/mo subscriptions.',
    },
    {
      id: 4,
      title: '4. User Database & Auth',
      icon: ShieldCheck,
      badge: 'Firebase & Security',
      summary: 'Store user signups, credits, and admin permissions securely.',
    },
    {
      id: 5,
      title: '5. Viral Marketing Loop',
      icon: TrendingUp,
      badge: 'Zero-Ad-Spend Growth',
      summary: 'Use TikTok Shorts & ProductHunt to scale to $10k+/month.',
    },
  ];

  return (
    <div id="publish-blueprint-root" className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-8 border border-indigo-700/50 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <span className="text-xs font-mono uppercase bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full">
            Master Monetization & Launch Playbook
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-3">
            How to Publish & Turn NovaSphere into a $10,000+/Month AI Micro-SaaS
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Follow this comprehensive, step-by-step operational blueprint to host your application, connect ad networks, accept subscription payments, secure user data, and acquire viral traffic.
          </p>
        </div>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}>
                  Step {step.id}
                </span>
              </div>
              <h3 className="text-xs font-bold leading-snug">{step.title}</h3>
            </button>
          );
        })}
      </div>

      {/* Main Step Content Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        {/* Step 1: Cloud Run / Vercel Hosting */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-indigo-600 font-bold uppercase">Step 1 of 5</span>
                <h3 className="text-xl font-bold text-slate-900">Publishing Your Web App to Cloud Run & Custom Domain</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-indigo-600" /> Option A: AI Studio Direct Cloud Run (Recommended)
                </h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>In the top right AI Studio header menu, click <strong>Deploy / Share App</strong>.</li>
                  <li>Click <strong>Deploy to Google Cloud Run</strong>.</li>
                  <li>Select your Google Cloud Project or allow AI Studio to auto-create a serverless Cloud Run instance.</li>
                  <li>Your live URL will automatically be generated (e.g. <code>https://novasphere-app.run.app</code>).</li>
                </ol>

                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-4">
                  <Globe className="w-4 h-4 text-emerald-600" /> Connecting a Custom Domain (e.g. novasphere.ai)
                </h4>
                <p>
                  Go to your domain registrar (Namecheap, GoDaddy, Cloudflare) and add a CNAME record pointing to your Cloud Run or Vercel URL. Free SSL will be automatically provisioned within 5 minutes.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Production Build Commands
                  </span>
                  <button
                    onClick={() => handleCopySnippet("npm run build\nnpm start", "build_cmd")}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-1 rounded flex items-center gap-1"
                  >
                    {copiedSnippet === "build_cmd" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="text-indigo-300">
{`# 1. Build TypeScript backend server & Vite frontend
npm run build

# 2. Start single production Express server on port 3000
npm start`}
                </pre>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Note: Port 3000 is automatically routed by container ingress.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Connect Ads & AdSense */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-amber-600 font-bold uppercase">Step 2 of 5</span>
                <h3 className="text-xl font-bold text-slate-900">Setting Up Google AdSense & Passive Banner Ads</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>
                NovaSphere includes 3 pre-built ad placement zones: <strong>Header Banner</strong>, <strong>Sidebar Ad Spot</strong>, and <strong>In-Feed Ads</strong>. You can inject Google AdSense code or affiliate links directly into the <strong>Admin Vault</strong> without changing any code.
              </p>

              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-indigo-950 text-xs">How to connect your Google AdSense Account:</h4>
                <ol className="list-decimal list-inside space-y-1 text-indigo-900">
                  <li>Sign up for a free publisher account at <strong>adsense.google.com</strong>.</li>
                  <li>Copy your Publisher ID (e.g. <code>ca-pub-9847291048201948</code>).</li>
                  <li>Open the <strong>Admin Vault</strong> tab in NovaSphere, click <strong>Ad Space Manager</strong>, and paste your Publisher ID.</li>
                  <li>Save changes — Google will automatically start placing context-matched ads and paying you monthly CPC/CPM revenues!</li>
                </ol>
              </div>

              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] text-slate-400">Sample Google AdSense Code Snippet</span>
                  <button
                    onClick={() => handleCopySnippet('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9847291048201948" crossorigin="anonymous"></script>', "adsense_tag")}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-1 rounded flex items-center gap-1"
                  >
                    {copiedSnippet === "adsense_tag" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Tag
                  </button>
                </div>
                <pre className="text-amber-300 overflow-x-auto">
{`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9847291048201948"
     crossorigin="anonymous"></script>`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Connect Stripe Payments */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-purple-600 font-bold uppercase">Step 3 of 5</span>
                <h3 className="text-xl font-bold text-slate-900">Configuring Stripe & LemonSqueezy Payments</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Stripe Payment Links Setup (5 Minutes):</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Log in to <strong>dashboard.stripe.com</strong>.</li>
                  <li>Go to <strong>Product Catalog</strong> and create two recurring products:
                    <ul className="list-disc list-inside ml-4 text-slate-600 mt-1">
                      <li><strong>Pro Plan:</strong> $19.00 / month</li>
                      <li><strong>Enterprise Plan:</strong> $49.00 / month</li>
                    </ul>
                  </li>
                  <li>Click <strong>Create Payment Link</strong> for each plan.</li>
                  <li>Paste the Payment Link URLs into the Admin Vault under <strong>Pricing Tiers Settings</strong>.</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl space-y-3">
                <h4 className="font-bold text-purple-950 text-sm">Revenue Calculation Example:</h4>
                <div className="space-y-2 font-mono text-xs text-purple-900">
                  <div className="flex justify-between border-b border-purple-200/60 pb-1">
                    <span>100 Pro Users ($19/mo)</span>
                    <span className="font-bold">$1,900 / mo</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-200/60 pb-1">
                    <span>30 Enterprise Users ($49/mo)</span>
                    <span className="font-bold">$1,470 / mo</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-200/60 pb-1">
                    <span>Monthly AdSense Revenue (100k views)</span>
                    <span className="font-bold">$1,250 / mo</span>
                  </div>
                  <div className="flex justify-between text-indigo-900 pt-1 font-bold">
                    <span>Total Monthly Passive Income</span>
                    <span className="text-emerald-700 font-black">$4,620 / mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: User Database & Auth */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-emerald-600 font-bold uppercase">Step 4 of 5</span>
                <h3 className="text-xl font-bold text-slate-900">User Database Security & Persistent Auth</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <p>
                NovaSphere is designed with local storage sync and full Firebase Cloud Firestore compatibility.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">User Collections Structure</h4>
                  <ul className="space-y-1.5 font-mono text-[11px] text-slate-700">
                    <li><code>/users/{'{userId}'}</code>: Name, Email, Role, Credits</li>
                    <li><code>/ad_configs/global</code>: Active Ad Units, CPM Rates</li>
                    <li><code>/analytics/daily</code>: Daily Revenues, DAU counters</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">Admin Vault Access Security</h4>
                  <p className="text-slate-600">
                    Protected by master PIN passkey (<code>1234</code> default), custom header verification token, and secret role check.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Viral Marketing Loop */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-indigo-600 font-bold uppercase">Step 5 of 5</span>
                <h3 className="text-xl font-bold text-slate-900">Zero-Ad-Spend Viral Growth Strategy ($10k+/mo Playbook)</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                  Channel 1: TikTok & Shorts
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Post 2 Video Scripts Daily</h4>
                <p className="text-slate-600">
                  Use the <strong>Viral Video Hook Generator</strong> inside NovaSphere to create 30s clips demonstrating how your app generates micro-SaaS blueprints in 5 seconds. Put your link in bio.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                  Channel 2: ProductHunt
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Launch Event Playbook</h4>
                <p className="text-slate-600">
                  Post on ProductHunt on Tuesday at 12:01 AM PST. Offer 50 free credits for early hunters. This usually drives 3,000 to 10,000 unique targeted users on day 1!
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Channel 3: Referral Loops
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Exponential Invite Loop</h4>
                <p className="text-slate-600">
                  Every user gets 10 bonus credits when their friend registers. Your active users will automatically post their referral links across Reddit and Twitter for you!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
          <button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl disabled:opacity-50 hover:bg-slate-200 transition-colors"
          >
            ← Previous Step
          </button>

          <span className="text-xs text-slate-400 font-mono">Step {activeStep} of 5</span>

          <button
            onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
            disabled={activeStep === 5}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors flex items-center gap-1"
          >
            Next Step →
          </button>
        </div>
      </div>
    </div>
  );
};
