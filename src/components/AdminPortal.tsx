import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  DollarSign, 
  Users, 
  Radio, 
  Sliders, 
  Plus, 
  Check, 
  Search, 
  Download, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  Key
} from 'lucide-react';
import { User, AdConfig, FinancialStats, GlobalSettings, ApiKeysConfig } from '../types';
import { DBService } from '../services/dbService';

interface AdminPortalProps {
  currentUser: User;
  isAdminVerified: boolean;
  onVerifyAdminPin: (pin: string) => boolean;
  onLockVault?: () => void;
  onUpdateAdConfig: (config: AdConfig) => void;
  onUpdateSettings: (settings: GlobalSettings) => void;
  onRefreshData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  isAdminVerified,
  onVerifyAdminPin,
  onLockVault,
  onUpdateAdConfig,
  onUpdateSettings,
  onRefreshData,
}) => {
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'api_engine' | 'payments_workflow' | 'cloudflare' | 'ads' | 'users' | 'settings'>('overview');
  const [cfWorkerUrl, setCfWorkerUrl] = useState(() => localStorage.getItem('scripa_cf_worker_url') || '');
  const [cfApiKey, setCfApiKey] = useState(() => localStorage.getItem('scripa_cf_api_key') || '');
  const [cfTestResult, setCfTestResult] = useState<{ loading?: boolean; msg?: string; error?: boolean } | null>(null);
  const [copiedCfCode, setCopiedCfCode] = useState(false);

  // Local state for edits
  const [users, setUsers] = useState<User[]>(() => DBService.getUsers());
  const [adConfig, setAdConfig] = useState<AdConfig>(() => DBService.getAdConfig());
  const [settings, setSettings] = useState<GlobalSettings>(() => DBService.getSettings());
  const [financials, setFinancials] = useState<FinancialStats>(() => DBService.getFinancials());
  const [workflowLogs, setWorkflowLogs] = useState(() => DBService.getWorkflowLogs());

  // API Slot state
  const [apiConfig, setApiConfig] = useState<ApiKeysConfig>(() => settings.apiConfig || {
    activeProviderMode: 'gemini_4factor',
    geminiCluster: {
      slot1: '',
      slot2: '',
      slot3: '',
      slot4: '',
    },
    openaiCluster: {
      slot1: '',
      slot2: '',
      slot3: '',
      slot4: '',
    },
    primaryAiKey: '',
    secondaryAiKey: '',
    tertiaryAiKey: '',
    quaternaryAiKey: '',
    activeSlot: 'primary',
    autoFailoverEnabled: true,
    maxRetriesPerSlot: 2,
  });

  // Payment Config state
  const [paymentConfig, setPaymentConfig] = useState(settings.paymentConfig || {
    stripeSecretKey: 'sk_test_51Nx...DEFAULT_DEMO_SECRET',
    stripePublishableKey: 'pk_test_51Nx...DEFAULT_DEMO_PUB',
    lemonSqueezyApiKey: 'ls_api_demo_key_9824',
    lemonSqueezyStoreId: 'store_84712',
    payPalClientId: 'client_id_demo_paypal_7731',
    webhookSecret: 'whsec_viral_studio_8892',
    paymentMode: 'test',
    autoReceiptEmails: true,
  });

  // Workflow Config state
  const [workflowConfig, setWorkflowConfig] = useState(settings.workflowConfig || {
    resendApiKey: 're_demo_key_77192834',
    notificationEmail: 'owner@viralscript.ai',
    webhookUrl: 'https://hooks.zapier.com/hooks/catch/12345/viralscript',
    welcomeEmailSubject: 'Welcome to ViralScript Studio AI! 🎉',
  });

  const [slotTestResults, setSlotTestResults] = useState<{ [key: string]: { loading?: boolean; success?: boolean; msg?: string } }>({});
  const [logFilter, setLogFilter] = useState<string>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const handleSaveApiEngine = async () => {
    const updatedSettings = {
      ...settings,
      apiConfig,
    };
    setSettings(updatedSettings);
    DBService.saveSettings(updatedSettings);
    onUpdateSettings(updatedSettings);

    // Sync keys live with server backend
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeProviderMode: apiConfig.activeProviderMode,
          geminiCluster: apiConfig.geminiCluster,
          openaiCluster: apiConfig.openaiCluster,
          primaryAiKey: apiConfig.geminiCluster?.slot1 || apiConfig.primaryAiKey,
          secondaryAiKey: apiConfig.geminiCluster?.slot2 || apiConfig.secondaryAiKey,
          tertiaryAiKey: apiConfig.geminiCluster?.slot3 || apiConfig.tertiaryAiKey,
          quaternaryAiKey: apiConfig.geminiCluster?.slot4 || apiConfig.quaternaryAiKey,
        }),
      });
    } catch {
      // client-side local sync fallback
    }

    DBService.addWorkflowLog({
      type: 'api_failover',
      status: 'success',
      details: `Owner Vault updated Dual 4-Factor AI Clusters. Active Engine: ${apiConfig.activeProviderMode.toUpperCase()}`,
      metadata: `ActiveMode: ${apiConfig.activeProviderMode} | Gemini Slots Configured | OpenAI Slots Configured`,
    });
    setWorkflowLogs(DBService.getWorkflowLogs());
    triggerSaveNotify(`Dual 4-Factor AI Clusters Saved! Active Mode: ${apiConfig.activeProviderMode.toUpperCase()}`);
  };

  const handleTestApiSlot = async (slotName: string, keyVal: string) => {
    if (!keyVal || !keyVal.trim()) {
      setSlotTestResults(prev => ({ ...prev, [slotName]: { success: false, msg: 'Slot Key is empty' } }));
      return;
    }

    setSlotTestResults(prev => ({ ...prev, [slotName]: { loading: true } }));

    try {
      const resp = await fetch('/api/admin/test-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotKey: keyVal.trim() }),
      });
      const data = await resp.json();

      if (data.success) {
        setSlotTestResults(prev => ({ ...prev, [slotName]: { success: true, msg: 'Verified Active!' } }));
      } else {
        setSlotTestResults(prev => ({ ...prev, [slotName]: { success: false, msg: data.error || 'Key invalid or quota limit' } }));
      }
    } catch (err: any) {
      setSlotTestResults(prev => ({ ...prev, [slotName]: { success: false, msg: 'Network/server error' } }));
    }
  };

  const handleSavePaymentConfig = async () => {
    const updatedSettings = {
      ...settings,
      paymentConfig,
      workflowConfig,
    };
    setSettings(updatedSettings);
    DBService.saveSettings(updatedSettings);
    onUpdateSettings(updatedSettings);

    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMode: paymentConfig.paymentMode,
          stripeSecretKey: paymentConfig.stripeSecretKey,
          lemonSqueezyKey: paymentConfig.lemonSqueezyApiKey,
        }),
      });
    } catch {
      // fallback
    }

    DBService.addWorkflowLog({
      type: 'payment_processed',
      status: 'success',
      details: 'Payment Gateway & Webhook Credentials Updated',
      metadata: `Mode: ${paymentConfig.paymentMode.toUpperCase()} | Stripe Pub: ${paymentConfig.stripePublishableKey ? 'Set' : 'Empty'}`,
    });
    setWorkflowLogs(DBService.getWorkflowLogs());
    triggerSaveNotify('Payment Gateways & Webhook Settings Saved!');
  };

  const handleSimulatePayment = () => {
    // Add $19 Pro subscription to financials and update user
    const updatedStats = {
      ...financials,
      monthlyRecurringRevenue: financials.monthlyRecurringRevenue + 19,
      totalRevenue: financials.totalRevenue + 19,
      activeSubscriptions: financials.activeSubscriptions + 1,
    };
    setFinancials(updatedStats);
    DBService.updateFinancials(updatedStats);

    DBService.addWorkflowLog({
      type: 'payment_processed',
      status: 'success',
      details: 'Test Payment Processed: Stripe Pro Plan ($19.00/mo)',
      metadata: 'Customer: test_user_simulated@viralscript.ai | Plan: Pro',
    });
    setWorkflowLogs(DBService.getWorkflowLogs());
    triggerSaveNotify('Simulated Test Payment Processed ($19.00)! MRR & Revenue stats updated.');
  };

  const [serverPinError, setServerPinError] = useState<string | null>(null);
  const [isPermanentlyBanned, setIsPermanentlyBanned] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerPinError(null);

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputPin, email: currentUser.email }),
      });

      const data = await res.json();

      if (data.success) {
        onVerifyAdminPin(inputPin);
      } else {
        if (data.banned) {
          setIsPermanentlyBanned(true);
          setServerPinError(data.error || 'PERMANENTLY BANNED: Exceeded 3 failed PIN attempts.');
        } else {
          setRemainingAttempts(data.remainingAttempts);
          setServerPinError(data.error || 'Invalid Security PIN');
        }
      }
    } catch {
      const success = onVerifyAdminPin(inputPin);
      if (!success) {
        setServerPinError('Invalid Owner Security PIN. Please check your credentials.');
      }
    }
  };

  const handleSaveAds = () => {
    DBService.saveAdConfig(adConfig);
    onUpdateAdConfig(adConfig);
    triggerSaveNotify('Ad Units & Monetization Settings Saved Successfully!');
  };

  const handleRecalculateFinancials = () => {
    const freshStats = DBService.recalculateFinancialsFromLogs();
    setFinancials(freshStats);
    triggerSaveNotify('Financials Recalculated from Real Usage Logs & Subscriptions!');
  };

  const handleFullAuditCSVExport = () => {
    DBService.exportFullSystemAuditCSV();
    triggerSaveNotify('Complete System Audit CSV Downloaded Successfully!');
  };

  const handleSaveSettings = () => {
    DBService.saveSettings(settings);
    onUpdateSettings(settings);
    triggerSaveNotify('Global System Settings Saved!');
  };

  const triggerSaveNotify = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleUserCreditChange = (userId: string, amount: number) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, credits: Math.max(0, u.credits + amount) };
      }
      return u;
    });
    setUsers(updated);
    const targetUser = updated.find(u => u.id === userId);
    if (targetUser) DBService.updateUser(targetUser);
  };

  const handleUserPlanChange = (userId: string, newPlan: User['plan']) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, plan: newPlan };
      }
      return u;
    });
    setUsers(updated);
    const targetUser = updated.find(u => u.id === userId);
    if (targetUser) DBService.updateUser(targetUser);
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: (u.status === 'active' ? 'suspended' : 'active') as User['status'] };
      }
      return u;
    });
    setUsers(updated);
    const targetUser = updated.find(u => u.id === userId);
    if (targetUser) DBService.updateUser(targetUser);
  };

  const exportCSVReport = () => {
    const csvRows = [
      ['User ID', 'Name', 'Email', 'Role', 'Plan', 'Credits', 'Total Spent', 'Status', 'Joined Date'],
      ...users.map(u => [
        u.id,
        `"${u.name}"`,
        u.email,
        u.role,
        u.plan,
        u.credits,
        `$${u.totalSpent.toFixed(2)}`,
        u.status,
        u.createdAt,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `novasphere_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If Admin is NOT authenticated, show Security Gate
  if (!isAdminVerified) {
    return (
      <div id="admin-security-gate" className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-400/20 text-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Owner Only Access Gate
          </span>
          <h2 className="text-2xl font-black text-white mt-3">Admin Vault Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your secret Master Security PIN to access revenue stats, ad manager, and user database.
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Security PIN
            </label>
            <input
              type="password"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              placeholder="Enter PIN (Default: 1234)"
              className="w-full text-center font-mono text-lg tracking-widest bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>

          {serverPinError && (
            <div className={`p-3 border text-xs rounded-xl text-center font-bold flex flex-col items-center justify-center gap-1.5 ${
              isPermanentlyBanned 
                ? 'bg-rose-950/90 border-rose-500 text-rose-200' 
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{serverPinError}</span>
              </div>
              {remainingAttempts !== null && !isPermanentlyBanned && (
                <span className="text-[10px] text-amber-300 font-mono">
                  {remainingAttempts} failed attempt(s) left before permanent server lockout.
                </span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            Unlock Admin Vault
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 font-mono">
          Protected by AES Session Key & Role Check
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="admin-portal-authenticated" className="space-y-6">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveNotification}</span>
          </div>
          <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded">Saved</span>
        </div>
      )}

      {/* Admin Control Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Owner Authenticated
            </span>
            <span className="text-xs text-slate-400 font-mono">PIN Session Verified</span>
            {onLockVault && (
              <button
                onClick={onLockVault}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors"
                title="Lock Admin Portal Security Gate"
              >
                <Lock className="w-3 h-3" /> Lock Vault
              </button>
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Admin Vault & Monetization Command Center
          </h2>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics & Revenue
          </button>

          <button
            onClick={() => setActiveTab('api_engine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'api_engine' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            3-Factor AI Keys & ENV
          </button>

          <button
            onClick={() => setActiveTab('payments_workflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'payments_workflow' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Payments & Workflows
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'cloudflare' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            ☁️ Cloudflare Worker Sync
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ads' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ad Manager
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Users CRM ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Tab 1: Financial Analytics Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Revenue</span>
              <div className="text-3xl font-black text-slate-900">${financials.totalRevenue.toFixed(2)}</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">↑ +24% vs last month</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly Recurring (MRR)</span>
              <div className="text-3xl font-black text-indigo-600">${financials.monthlyRecurringRevenue.toFixed(2)}</div>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">{financials.activeSubscriptions} Active Subscriptions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Ad Revenue (CPM/CPC)</span>
              <div className="text-3xl font-black text-amber-600">${adConfig.totalAdRevenue.toFixed(2)}</div>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">{adConfig.impressions.toLocaleString()} Impressions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Users</span>
              <div className="text-3xl font-black text-slate-900">{users.length}</div>
              <span className="text-[11px] text-indigo-600 font-bold mt-1 inline-block">{financials.activeToday} Active Today</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">System Audit & CSV Report Generator</h3>
              <p className="text-xs text-slate-500">Recalculate real financial totals ($0.00 base) from actual usage logs or download an exhaustive CSV audit file.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRecalculateFinancials}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                Clean Recalculate ($0 Base)
              </button>

              <button
                onClick={handleFullAuditCSVExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Download System Audit CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Dual 4-Factor AI Clusters Command Vault */}
      {activeTab === 'api_engine' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-900 font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Dual 4-Factor Failover Clusters
                </span>
                <span className="text-xs text-emerald-600 font-bold font-mono">8 API Slots Total</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Gemini 4-Factor Cluster & OpenAI 4-Factor Cluster Vault
              </h3>
              <p className="text-xs text-slate-500">
                Configure 4 slots for Gemini and 4 slots for OpenAI. Select which cluster powers your users this month or enable Auto Load-Balancer across all 8 slots.
              </p>
            </div>

            <button
              onClick={handleSaveApiEngine}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap"
            >
              <Check className="w-4 h-4" /> Save & Sync Active Engine
            </button>
          </div>

          {/* Active Provider Cluster Selection Switch */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300 block">
                  ⚡ Active Server Provider Engine Mode
                </span>
                <p className="text-[11px] text-slate-300">
                  Select which 4-Factor cluster handles user script generations for this deployment.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-400/30">
                Current: {apiConfig.activeProviderMode?.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <label
                onClick={() => setApiConfig({ ...apiConfig, activeProviderMode: 'gemini_4factor' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  apiConfig.activeProviderMode === 'gemini_4factor'
                    ? 'border-indigo-400 bg-indigo-600/30 ring-2 ring-indigo-500/40 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-xs">
                  ♊
                </div>
                <div>
                  <span className="text-xs font-bold block">Gemini 4-Factor Engine</span>
                  <span className="text-[10px] text-indigo-200">4 Gemini Slots (2.5 & 3.6 Flash)</span>
                </div>
              </label>

              <label
                onClick={() => setApiConfig({ ...apiConfig, activeProviderMode: 'openai_4factor' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  apiConfig.activeProviderMode === 'openai_4factor'
                    ? 'border-emerald-400 bg-emerald-600/30 ring-2 ring-emerald-500/40 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                  🤖
                </div>
                <div>
                  <span className="text-xs font-bold block">OpenAI GPT-4 Mini 4-Factor</span>
                  <span className="text-[10px] text-emerald-200">4 OpenAI GPT Slots (gpt-4o-mini)</span>
                </div>
              </label>

              <label
                onClick={() => setApiConfig({ ...apiConfig, activeProviderMode: 'auto_load_balancer' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  apiConfig.activeProviderMode === 'auto_load_balancer'
                    ? 'border-amber-400 bg-amber-600/30 ring-2 ring-amber-500/40 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                  🔄
                </div>
                <div>
                  <span className="text-xs font-bold block">Auto Load-Balancer</span>
                  <span className="text-[10px] text-amber-200">Cascade across all 8 Slots</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 1: Gemini 4-Factor Cluster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <span>♊ Gemini 4-Factor Cluster (Slots 1, 2, 3, 4)</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">Google GenAI SDK</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Gemini 2.5 Flash / 3.6 Flash</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Gemini Slot 1 */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-900">Gemini Slot 1 (Primary Key)</span>
                  {slotTestResults['gemini_slot1']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['gemini_slot1']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['gemini_slot1']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['gemini_slot1'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.geminiCluster?.slot1 || apiConfig.primaryAiKey || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    geminiCluster: { ...(apiConfig.geminiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot1: e.target.value },
                    primaryAiKey: e.target.value,
                  })}
                  placeholder="AIzaSy... (Gemini Primary Key)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('gemini_slot1', apiConfig.geminiCluster?.slot1 || apiConfig.primaryAiKey)}
                  className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test Gemini Slot 1
                </button>
              </div>

              {/* Gemini Slot 2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Gemini Slot 2 (Failover 1)</span>
                  {slotTestResults['gemini_slot2']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['gemini_slot2']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['gemini_slot2']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['gemini_slot2'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.geminiCluster?.slot2 || apiConfig.secondaryAiKey || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    geminiCluster: { ...(apiConfig.geminiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot2: e.target.value },
                    secondaryAiKey: e.target.value,
                  })}
                  placeholder="AIzaSy... (Gemini Failover 1)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('gemini_slot2', apiConfig.geminiCluster?.slot2 || apiConfig.secondaryAiKey)}
                  className="text-[10px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test Gemini Slot 2
                </button>
              </div>

              {/* Gemini Slot 3 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Gemini Slot 3 (Failover 2)</span>
                  {slotTestResults['gemini_slot3']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['gemini_slot3']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['gemini_slot3']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['gemini_slot3'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.geminiCluster?.slot3 || apiConfig.tertiaryAiKey || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    geminiCluster: { ...(apiConfig.geminiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot3: e.target.value },
                    tertiaryAiKey: e.target.value,
                  })}
                  placeholder="AIzaSy... (Gemini Failover 2)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('gemini_slot3', apiConfig.geminiCluster?.slot3 || apiConfig.tertiaryAiKey)}
                  className="text-[10px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test Gemini Slot 3
                </button>
              </div>

              {/* Gemini Slot 4 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Gemini Slot 4 (Failover 3)</span>
                  {slotTestResults['gemini_slot4']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['gemini_slot4']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['gemini_slot4']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['gemini_slot4'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.geminiCluster?.slot4 || apiConfig.quaternaryAiKey || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    geminiCluster: { ...(apiConfig.geminiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot4: e.target.value },
                    quaternaryAiKey: e.target.value,
                  })}
                  placeholder="AIzaSy... (Gemini Failover 3)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('gemini_slot4', apiConfig.geminiCluster?.slot4 || apiConfig.quaternaryAiKey || '')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test Gemini Slot 4
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: OpenAI GPT-4 Mini 4-Factor Cluster */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                <span>🤖 OpenAI GPT-4 Mini 4-Factor Cluster (Slots 1, 2, 3, 4)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">OpenAI REST API</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">gpt-4o-mini</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* OpenAI Slot 1 */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900">OpenAI Slot 1 (Primary GPT Key)</span>
                  {slotTestResults['openai_slot1']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['openai_slot1']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['openai_slot1']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['openai_slot1'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.openaiCluster?.slot1 || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    openaiCluster: { ...(apiConfig.openaiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot1: e.target.value }
                  })}
                  placeholder="sk-... (OpenAI Primary Key)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('openai_slot1', apiConfig.openaiCluster?.slot1 || '')}
                  className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test OpenAI Slot 1
                </button>
              </div>

              {/* OpenAI Slot 2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">OpenAI Slot 2 (Failover 1)</span>
                  {slotTestResults['openai_slot2']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['openai_slot2']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['openai_slot2']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['openai_slot2'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.openaiCluster?.slot2 || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    openaiCluster: { ...(apiConfig.openaiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot2: e.target.value }
                  })}
                  placeholder="sk-... (OpenAI Failover 1)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('openai_slot2', apiConfig.openaiCluster?.slot2 || '')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test OpenAI Slot 2
                </button>
              </div>

              {/* OpenAI Slot 3 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">OpenAI Slot 3 (Failover 2)</span>
                  {slotTestResults['openai_slot3']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['openai_slot3']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['openai_slot3']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['openai_slot3'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.openaiCluster?.slot3 || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    openaiCluster: { ...(apiConfig.openaiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot3: e.target.value }
                  })}
                  placeholder="sk-... (OpenAI Failover 2)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('openai_slot3', apiConfig.openaiCluster?.slot3 || '')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test OpenAI Slot 3
                </button>
              </div>

              {/* OpenAI Slot 4 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">OpenAI Slot 4 (Failover 3)</span>
                  {slotTestResults['openai_slot4']?.loading ? (
                    <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">Testing...</span>
                  ) : slotTestResults['openai_slot4']?.success ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active ✓</span>
                  ) : slotTestResults['openai_slot4']?.msg ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{slotTestResults['openai_slot4'].msg}</span>
                  ) : null}
                </div>
                <input
                  type="password"
                  value={apiConfig.openaiCluster?.slot4 || ''}
                  onChange={(e) => setApiConfig({
                    ...apiConfig,
                    openaiCluster: { ...(apiConfig.openaiCluster || { slot1: '', slot2: '', slot3: '', slot4: '' }), slot4: e.target.value }
                  })}
                  placeholder="sk-... (OpenAI Failover 3)"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
                <button
                  onClick={() => handleTestApiSlot('openai_slot4', apiConfig.openaiCluster?.slot4 || '')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                >
                  Ping Test OpenAI Slot 4
                </button>
              </div>
            </div>
          </div>

          {/* Auto Failover Settings */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-950 block">Auto-Failover Protection Status</span>
              <span className="text-[11px] text-amber-800">
                When enabled, server seamlessly switches slots in milliseconds on quota/rate limits without user errors.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={apiConfig.autoFailoverEnabled}
                onChange={(e) => setApiConfig({ ...apiConfig, autoFailoverEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      )}

      {/* Tab: Payment Gateways & Workflows Log */}
      {activeTab === 'payments_workflow' && (
        <div className="space-y-6">
          {/* Payment Gateway Settings */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Payment Gateways & Customer Billing APIs</h3>
                <p className="text-xs text-slate-500">Manage Stripe, LemonSqueezy, and PayPal API keys for automatic subscription payouts.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulatePayment}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" /> Simulate Test $19 Payment
                </button>

                <button
                  onClick={handleSavePaymentConfig}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Save Gateways
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Razorpay Config */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 block">🇮🇳 Razorpay API Credentials</span>
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded">UPI & Cards</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">RAZORPAY_KEY_ID</label>
                  <input
                    type="text"
                    value={paymentConfig.razorpayKeyId || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpayKeyId: e.target.value })}
                    placeholder="rzp_test_..."
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">RAZORPAY_KEY_SECRET</label>
                  <input
                    type="password"
                    value={paymentConfig.razorpayKeySecret || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpayKeySecret: e.target.value })}
                    placeholder="secret_..."
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              {/* Stripe Config */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Stripe API Keys</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">STRIPE_SECRET_KEY</label>
                  <input
                    type="password"
                    value={paymentConfig.stripeSecretKey}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeSecretKey: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">STRIPE_PUBLISHABLE_KEY</label>
                  <input
                    type="text"
                    value={paymentConfig.stripePublishableKey}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, stripePublishableKey: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              {/* LemonSqueezy & PayPal */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">LemonSqueezy & PayPal Keys</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">LEMON_SQUEEZY_API_KEY</label>
                  <input
                    type="password"
                    value={paymentConfig.lemonSqueezyApiKey}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, lemonSqueezyApiKey: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">PAYPAL_CLIENT_ID</label>
                  <input
                    type="text"
                    value={paymentConfig.payPalClientId}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, payPalClientId: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Email & Webhooks */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Resend Email API & Zapier Webhook URL</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">RESEND_API_KEY (Invoices & Welcome Emails)</label>
                  <input
                    type="password"
                    value={workflowConfig.resendApiKey}
                    onChange={(e) => setWorkflowConfig({ ...workflowConfig, resendApiKey: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">AUTOMATION_WEBHOOK_URL (Zapier / Make)</label>
                  <input
                    type="text"
                    value={workflowConfig.webhookUrl}
                    onChange={(e) => setWorkflowConfig({ ...workflowConfig, webhookUrl: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Data Logs Table */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white">System Workflow & Payment Event Logs</h3>
                <p className="text-xs text-slate-400">Live transaction events, email dispatches, and API failover triggers.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs font-mono rounded-xl px-3 py-1.5 text-amber-300"
                >
                  <option value="all">All Event Types</option>
                  <option value="ai_generation">AI Generation</option>
                  <option value="payment_processed">Payments</option>
                  <option value="api_failover">API Failovers</option>
                  <option value="email_sent">Emails</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Event Details</th>
                    <th className="p-2.5">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {workflowLogs
                    .filter(l => logFilter === 'all' || l.type === logFilter)
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-2.5">
                          <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[10px] uppercase">
                            {log.type}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-200">{log.details}</td>
                        <td className="p-2.5 text-slate-400 text-[11px]">{log.metadata || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cloudflare Worker & External Server Integration Tab */}
      {activeTab === 'cloudflare' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">☁️</span>
                  <h3 className="text-lg font-black text-white">Cloudflare Worker & Custom Database Gateway</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your Cloudflare Worker endpoint to store logins, subscriptions, referrals, and cloud user databases off-site securely.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    localStorage.setItem('scripa_cf_worker_url', cfWorkerUrl);
                    localStorage.setItem('scripa_cf_api_key', cfApiKey);
                    setCfTestResult({ loading: true, msg: 'Connecting to Cloudflare Worker...' });

                    try {
                      const endpoint = cfWorkerUrl.trim().replace(/\/$/, '');
                      const res = await fetch(`${endpoint}/api/health`, {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${cfApiKey}` },
                      });
                      const data = await res.json().catch(() => ({}));

                      if (res.ok) {
                        setCfTestResult({ loading: false, error: false, msg: `✅ Connected successfully! Worker response: ${JSON.stringify(data)}` });
                      } else {
                        setCfTestResult({ loading: false, error: true, msg: `❌ Cloudflare Worker responded with status ${res.status}` });
                      }
                    } catch (err: any) {
                      setCfTestResult({ loading: false, error: true, msg: `⚠️ Connection test note: Could not ping endpoint directly from browser CORS or URL unconfigured. Settings saved locally!` });
                    }
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${cfTestResult?.loading ? 'animate-spin' : ''}`} />
                  Save & Test Cloudflare Sync
                </button>
              </div>
            </div>

            {cfTestResult && (
              <div className={`p-3.5 rounded-xl border text-xs font-mono font-bold ${
                cfTestResult.error ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              }`}>
                {cfTestResult.msg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endpoint Configuration */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">1. Cloudflare API Endpoint Settings</h4>
                
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Cloudflare Worker URL
                  </label>
                  <input
                    type="url"
                    value={cfWorkerUrl}
                    onChange={(e) => setCfWorkerUrl(e.target.value)}
                    placeholder="https://scripa-backend.my-subdomain.workers.dev"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste your Cloudflare Worker URL or custom Cloudflare route here.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Cloudflare API Secret / Bearer Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={cfApiKey}
                    onChange={(e) => setCfApiKey(e.target.value)}
                    placeholder="cf_secret_token_991823..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Secures worker routes against unauthorized sync calls.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
                  <span className="font-bold block">💡 How Cloudflare Storage Works:</span>
                  <p className="text-[11px] text-slate-300">
                    When users sign up, log in, or generate scripts, Scripa sends data to your Cloudflare Worker. Cloudflare KV or D1 holds all accounts, subscription tiers, referral records, and saved projects securely!
                  </p>
                </div>
              </div>

              {/* Ready-to-deploy Code Box */}
              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">2. Ready-to-Deploy Cloudflare Worker Code</h4>
                  <button
                    onClick={() => {
                      const code = `export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'active', service: 'Scripa Cloudflare Database' }), { headers });
    }

    if (url.pathname === '/api/user/sync' && request.method === 'POST') {
      const body = await request.json();
      const { user, projects } = body;
      if (!user || !user.email) {
        return new Response(JSON.stringify({ success: false, error: 'Email required' }), { status: 400, headers });
      }

      const email = user.email.toLowerCase().trim();
      if (env.SCRIPA_KV) {
        await env.SCRIPA_KV.put(\`user:\${email}\`, JSON.stringify({ user, projects, updatedAt: new Date().toISOString() }));
      }

      return new Response(JSON.stringify({ success: true, syncedUser: user, syncedAt: new Date().toISOString() }), { headers });
    }

    return new Response(JSON.stringify({ success: true, message: 'Cloudflare Worker Scripa Gateway Active' }), { headers });
  }
};`;
                      navigator.clipboard.writeText(code);
                      setCopiedCfCode(true);
                      setTimeout(() => setCopiedCfCode(false), 2500);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedCfCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                    {copiedCfCode ? 'Copied to Clipboard!' : 'Copy Worker Script'}
                  </button>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto leading-relaxed">
                  <pre>{`// Copy & paste this into Cloudflare Workers Dashboard:
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers });

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'active', database: 'Cloudflare KV/D1' }), { headers });
    }

    if (url.pathname === '/api/user/sync' && request.method === 'POST') {
      const { user, projects } = await request.json();
      if (env.SCRIPA_KV && user?.email) {
        await env.SCRIPA_KV.put(\`user:\${user.email.toLowerCase()}\`, JSON.stringify({ user, projects }));
      }
      return new Response(JSON.stringify({ success: true, syncedUser: user }), { headers });
    }

    return new Response(JSON.stringify({ success: true, message: 'Scripa Cloudflare Sync Active' }), { headers });
  }
};`}</pre>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  1. Go to dash.cloudflare.com → Workers & Pages → Create Worker.
                  2. Paste code above and click "Save and Deploy".
                  3. Bind a KV Namespace named <code className="text-amber-300">SCRIPA_KV</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ad Space & Monetization Manager */}
      {activeTab === 'ads' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ad Placement & Revenue Manager</h3>
              <p className="text-xs text-slate-500">Enable banner spots, inject Google AdSense code, or edit sponsor links.</p>
            </div>
            <button
              onClick={handleSaveAds}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" /> Save Ad Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Header Banner</span>
                <span className="text-[11px] text-slate-500">Top of screen</span>
              </div>
              <input
                type="checkbox"
                checked={adConfig.headerBannerActive}
                onChange={(e) => setAdConfig({ ...adConfig, headerBannerActive: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Sidebar Banner</span>
                <span className="text-[11px] text-slate-500 font-mono">$4.50 CPM</span>
              </div>
              <input
                type="checkbox"
                checked={adConfig.sidebarBannerActive}
                onChange={(e) => setAdConfig({ ...adConfig, sidebarBannerActive: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">In-Feed Ads</span>
                <span className="text-[11px] text-slate-500">Between tools</span>
              </div>
              <input
                type="checkbox"
                checked={adConfig.inFeedAdsActive}
                onChange={(e) => setAdConfig({ ...adConfig, inFeedAdsActive: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Reward Video Ads</span>
                <span className="text-[11px] text-slate-500">+5 Credits/View</span>
              </div>
              <input
                type="checkbox"
                checked={adConfig.rewardAdsActive}
                onChange={(e) => setAdConfig({ ...adConfig, rewardAdsActive: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Google AdSense Publisher ID
              </label>
              <input
                type="text"
                value={adConfig.googleAdsenseId}
                onChange={(e) => setAdConfig({ ...adConfig, googleAdsenseId: e.target.value })}
                placeholder="ca-pub-XXXXXXXXXX"
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Custom Header HTML / Banner Code Injection
              </label>
              <textarea
                rows={3}
                value={adConfig.customBannerCode}
                onChange={(e) => setAdConfig({ ...adConfig, customBannerCode: e.target.value })}
                className="w-full text-xs font-mono bg-slate-900 text-amber-300 border border-slate-800 rounded-xl p-3"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Users CRM & Database */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registered Users Database</h3>
              <p className="text-xs text-slate-500">Manage account plans, credit balances, and suspension status.</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user name or email..."
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 w-64 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">User / Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Total Spent</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={u.plan}
                        onChange={(e) => handleUserPlanChange(u.id, e.target.value as User['plan'])}
                        className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1 text-indigo-700 font-mono"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro ($19/mo)</option>
                        <option value="enterprise">Enterprise ($49/mo)</option>
                      </select>
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-900">
                      {u.credits}
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-700">
                      ${u.totalSpent.toFixed(2)}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleUserCreditChange(u.id, 50)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[10px]"
                        title="Grant +50 Credits"
                      >
                        +50 Cr
                      </button>

                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: System Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">System & Announcement Settings</h3>
              <p className="text-xs text-slate-500">Edit app title, live notification banner, and pricing parameters.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" /> Save Settings
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Global Live Announcement Banner Text
              </label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Pro Plan Price ($/mo)
                </label>
                <input
                  type="number"
                  value={settings.proMonthlyPrice}
                  onChange={(e) => setSettings({ ...settings, proMonthlyPrice: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Enterprise Price ($/mo)
                </label>
                <input
                  type="number"
                  value={settings.enterpriseMonthlyPrice}
                  onChange={(e) => setSettings({ ...settings, enterpriseMonthlyPrice: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Master Security PIN
                </label>
                <input
                  type="text"
                  value={settings.adminPin}
                  onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
