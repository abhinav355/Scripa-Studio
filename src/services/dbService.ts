import { User, AdConfig, FinancialStats, GlobalSettings, GeneratedProject, ApiKeysConfig, PaymentGatewayConfig, WorkflowConfig, WorkflowLog } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'novasphere_current_user',
  USERS: 'novasphere_users_db',
  AD_CONFIG: 'novasphere_ad_config',
  SETTINGS: 'novasphere_global_settings',
  PROJECTS: 'novasphere_saved_projects',
  FINANCIALS: 'novasphere_financial_stats',
  WORKFLOW_LOGS: 'novasphere_workflow_logs',
  AD_WATCH_HISTORY: 'scripa_ad_watch_history',
};

const DEFAULT_ADMIN: User = {
  id: 'usr_admin_001',
  email: 'admin@novasphere.com',
  name: 'Master Admin (Owner)',
  role: 'admin',
  plan: 'enterprise',
  credits: 9999,
  totalSpent: 0,
  referralCode: 'OWNERVIP',
  referralCount: 42,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
};

const INITIAL_USERS: User[] = [
  DEFAULT_ADMIN,
  {
    id: 'usr_002',
    email: 'alex.creator@gmail.com',
    name: 'Alex Vance',
    role: 'user',
    plan: 'pro',
    credits: 1850,
    totalSpent: 19.00,
    referralCode: 'ALEX2026',
    referralCount: 5,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'usr_003',
    email: 'sarah.saas@startup.io',
    name: 'Sarah Chen',
    role: 'user',
    plan: 'pro',
    credits: 2400,
    totalSpent: 49.00,
    referralCode: 'SARAHSAAS',
    referralCount: 12,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'usr_004',
    email: 'mark.dev@techlabs.com',
    name: 'Mark Taylor',
    role: 'user',
    plan: 'free',
    credits: 100,
    totalSpent: 0,
    referralCode: 'MARKDEV',
    referralCount: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'usr_005',
    email: 'elena.marketing@growth.co',
    name: 'Elena Rostova',
    role: 'user',
    plan: 'enterprise',
    credits: 8500,
    totalSpent: 149.00,
    referralCode: 'ELENAGROWTH',
    referralCount: 28,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
];

const DEFAULT_AD_CONFIG: AdConfig = {
  headerBannerActive: true,
  sidebarBannerActive: true,
  inFeedAdsActive: true,
  rewardAdsActive: true,
  googleAdsenseId: 'ca-pub-9847291048201948',
  customBannerCode: '<div style="padding:12px; background:linear-gradient(135deg, #4f46e5, #7c3aed); color:white; border-radius:12px; text-align:center;"><strong>🚀 Scripa.studio Ad Network:</strong> Watch continuous sponsor ads & earn +1 Bonus AI Token per view! <a href="#" style="color:#fde047; text-decoration:underline; font-weight:bold;">Watch Ads →</a></div>',
  sponsoredTitle: 'Scale Your AI Micro-SaaS on Scripa.studio',
  sponsoredDescription: 'Deploy high-availability Node & AI services globally in seconds with auto-scaling & zero server overhead.',
  sponsoredLink: 'https://scripa.studio',
  sponsoredCta: 'Start Free Trial',
  cpmRate: 4.50,
  cpcRate: 0.85,
  impressions: 120,
  clicks: 14,
  totalAdRevenue: 0.54,
};

const DEFAULT_API_CONFIG: ApiKeysConfig = {
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
};

const DEFAULT_PAYMENT_CONFIG: PaymentGatewayConfig = {
  stripeSecretKey: 'sk_test_51Nx...DEFAULT_DEMO_SECRET',
  stripePublishableKey: 'pk_test_51Nx...DEFAULT_DEMO_PUB',
  lemonSqueezyApiKey: 'ls_api_demo_key_9824',
  lemonSqueezyStoreId: 'store_84712',
  payPalClientId: 'client_id_demo_paypal_7731',
  razorpayKeyId: 'rzp_test_demo_9824',
  razorpayKeySecret: 'secret_demo_rzp_1189',
  razorpayEnabled: true,
  webhookSecret: 'whsec_scripa_studio_8892',
  paymentMode: 'test',
  autoReceiptEmails: true,
};

const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  resendApiKey: 're_demo_key_77192834',
  notificationEmail: 'owner@scripa.studio',
  webhookUrl: 'https://hooks.zapier.com/hooks/catch/12345/scripastudio',
  welcomeEmailSubject: 'Welcome to Scripa.studio! 🎉',
};

const DEFAULT_SETTINGS: GlobalSettings = {
  appTitle: 'Scripa.studio - AI Creator & Monetization Suite',
  announcementText: '🔥 Welcome to Scripa.studio! Upgrade to Pro for 2,500 AI Tokens & 100% Ad-Free Experience!',
  announcementActive: true,
  freeTierDailyCredits: 25,
  proMonthlyPrice: 19,
  enterpriseMonthlyPrice: 49,
  referralCreditReward: 25,
  adminPin: 'scripa_vault_7890',
  apiConfig: DEFAULT_API_CONFIG,
  paymentConfig: DEFAULT_PAYMENT_CONFIG,
  workflowConfig: DEFAULT_WORKFLOW_CONFIG,
};

const DEFAULT_FINANCIALS: FinancialStats = {
  monthlyRecurringRevenue: 0.00,
  adRevenue: 0.54,
  creditSalesRevenue: 0.00,
  totalRevenue: 0.54,
  activeSubscriptions: 0,
  totalUsers: 5,
  activeToday: 1,
  creditsConsumedTotal: 15,
};

export class DBService {
  static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  static getCurrentUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      const users = this.getUsers();
      const defaultUser = users[1] || INITIAL_USERS[1]; // default regular user for preview
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS[1];
    }
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.updateUser(user);
  }

  static updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getAdConfig(): AdConfig {
    const data = localStorage.getItem(STORAGE_KEYS.AD_CONFIG);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.AD_CONFIG, JSON.stringify(DEFAULT_AD_CONFIG));
      return DEFAULT_AD_CONFIG;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_AD_CONFIG;
    }
  }

  static saveAdConfig(config: AdConfig): void {
    localStorage.setItem(STORAGE_KEYS.AD_CONFIG, JSON.stringify(config));
  }

  static getSettings(): GlobalSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: GlobalSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getFinancials(): FinancialStats {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCIALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(DEFAULT_FINANCIALS));
      return DEFAULT_FINANCIALS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_FINANCIALS;
    }
  }

  static updateFinancials(stats: Partial<FinancialStats>): void {
    const current = this.getFinancials();
    const updated = { ...current, ...stats };
    localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(updated));
  }

  static getProjects(): GeneratedProject[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveProject(project: GeneratedProject): void {
    const projects = this.getProjects();
    projects.unshift(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects.slice(0, 50)));
  }

  static saveProjectsList(projects: GeneratedProject[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects.slice(0, 50)));
  }

  static recordAdClick(): void {
    const adConfig = this.getAdConfig();
    adConfig.clicks += 1;
    adConfig.totalAdRevenue += adConfig.cpcRate;
    this.saveAdConfig(adConfig);

    const financials = this.getFinancials();
    financials.adRevenue += adConfig.cpcRate;
    financials.totalRevenue += adConfig.cpcRate;
    this.updateFinancials(financials);
  }

  static recordAdImpression(): void {
    const adConfig = this.getAdConfig();
    adConfig.impressions += 1;
    const revPerImpression = adConfig.cpmRate / 1000;
    adConfig.totalAdRevenue += revPerImpression;
    this.saveAdConfig(adConfig);

    const financials = this.getFinancials();
    financials.adRevenue += revPerImpression;
    financials.totalRevenue += revPerImpression;
    this.updateFinancials(financials);
  }

  static getWorkflowLogs(): WorkflowLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.WORKFLOW_LOGS);
    if (!data) {
      const initialLogs: WorkflowLog[] = [
        {
          id: 'log_001',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          type: 'ai_generation',
          status: 'success',
          details: 'Script generated using Primary Gemini 3.6 Flash Slot',
          metadata: 'Latency: 412ms | Tokens Used: 50',
        },
        {
          id: 'log_002',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          type: 'payment_processed',
          status: 'success',
          details: 'Stripe Pro Subscription Payment Received ($19.00)',
          metadata: 'User: usr_002 | Customer: Alex Vance',
        },
        {
          id: 'log_003',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          type: 'api_failover',
          status: 'warning',
          details: 'Auto-Failover engaged: Primary key slot reached quota limit, switched to Secondary Free Tier Slot',
          metadata: 'Failover Delay: 12ms',
        },
        {
          id: 'log_004',
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          type: 'email_sent',
          status: 'success',
          details: 'Welcome & Invoice Receipt Email Sent via Resend API',
          metadata: 'Recipient: sarah.saas@startup.io',
        },
        {
          id: 'log_005',
          timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
          type: 'webhook_triggered',
          status: 'success',
          details: 'Zapier Webhook Payload Dispatched for New Pro User Sign-Up',
          metadata: 'Payload Size: 1.2 KB',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.WORKFLOW_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addWorkflowLog(log: Omit<WorkflowLog, 'id' | 'timestamp'>): void {
    const logs = this.getWorkflowLogs();
    const newLog: WorkflowLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.WORKFLOW_LOGS, JSON.stringify(logs.slice(0, 100)));
  }

  static recordContinuousAdReward(user: User): { updatedUser: User; creditsAdded: number; adRevenueEarned: number } {
    const adConfig = this.getAdConfig();
    const revPerImpression = (adConfig.cpmRate || 4.50) / 1000;
    
    // Update Ad Config Stats
    adConfig.impressions += 1;
    adConfig.totalAdRevenue += revPerImpression;
    this.saveAdConfig(adConfig);

    // Update Financials
    const financials = this.getFinancials();
    financials.adRevenue += revPerImpression;
    financials.totalRevenue += revPerImpression;
    this.updateFinancials(financials);

    // Secure: No unearned instant tokens
    const creditsAdded = 0;
    const updatedUser = user;

    // Log Workflow Event
    this.addWorkflowLog({
      type: 'reward_ad',
      status: 'success',
      details: `Sponsor Ad Impression Recorded: Revenue credited to owner dashboard`,
      metadata: `Ad Revenue Earned: +$${revPerImpression.toFixed(4)} | Total Impressions: ${adConfig.impressions}`,
    });

    return { updatedUser, creditsAdded, adRevenueEarned: revPerImpression };
  }

  static recalculateFinancialsFromLogs(): FinancialStats {
    const logs = this.getWorkflowLogs();
    const users = this.getUsers();
    const adConfig = this.getAdConfig();

    let calculatedMRR = 0;
    let calculatedCreditSales = 0;
    let activeSubCount = 0;

    users.forEach(u => {
      if (u.plan === 'pro') {
        calculatedMRR += 19;
        activeSubCount++;
      } else if (u.plan === 'enterprise') {
        calculatedMRR += 49;
        activeSubCount++;
      }
      calculatedCreditSales += u.totalSpent || 0;
    });

    const adRev = adConfig.totalAdRevenue || 0.54;

    const newFinancials: FinancialStats = {
      monthlyRecurringRevenue: calculatedMRR,
      adRevenue: parseFloat(adRev.toFixed(2)),
      creditSalesRevenue: parseFloat(calculatedCreditSales.toFixed(2)),
      totalRevenue: parseFloat((calculatedMRR + adRev + calculatedCreditSales).toFixed(2)),
      activeSubscriptions: activeSubCount,
      totalUsers: users.length,
      activeToday: Math.min(users.length, 3),
      creditsConsumedTotal: logs.filter(l => l.type === 'ai_generation').length * 25 || 25,
    };

    localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(newFinancials));
    return newFinancials;
  }

  static exportFullSystemAuditCSV(): void {
    const logs = this.getWorkflowLogs();
    const users = this.getUsers();
    const financials = this.getFinancials();
    const adConfig = this.getAdConfig();
    const settings = this.getSettings();

    let csvContent = 'data:text/csv;charset=utf-8,';

    // Section 1: Executive Summary
    csvContent += '=== SCRIPA.STUDIO EXECUTIVE FINANCIAL & USAGE AUDIT ===\n';
    csvContent += `Generated At,${new Date().toISOString()}\n`;
    csvContent += `App Title,${settings.appTitle}\n`;
    csvContent += `Total System Revenue ($),${financials.totalRevenue}\n`;
    csvContent += `Monthly Recurring Revenue MRR ($),${financials.monthlyRecurringRevenue}\n`;
    csvContent += `Ad Monetization Revenue ($),${financials.adRevenue}\n`;
    csvContent += `Total Users Registered,${financials.totalUsers}\n`;
    csvContent += `Active Subscriptions,${financials.activeSubscriptions}\n`;
    csvContent += `Total Ad Impressions Counted,${adConfig.impressions}\n`;
    csvContent += `Total Ad Clicks,${adConfig.clicks}\n\n`;

    // Section 2: User Account Balances
    csvContent += '=== REGISTERED USERS & CREDIT BALANCES ===\n';
    csvContent += 'User ID,Name,Email,Role,Plan,Credits Balance,Total Spent ($),Created At\n';
    users.forEach(u => {
      csvContent += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.plan}",${u.credits},${u.totalSpent},"${u.createdAt}"\n`;
    });
    csvContent += '\n';

    // Section 3: Detailed Event Logs
    csvContent += '=== TRANSACTION & WORKFLOW AUDIT LOGS ===\n';
    csvContent += 'Log ID,Timestamp,Type,Status,Details,Metadata\n';
    logs.forEach(l => {
      csvContent += `"${l.id}","${l.timestamp}","${l.type}","${l.status}","${l.details.replace(/"/g, '""')}","${(l.metadata || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scripa_studio_audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Ad Rate Limiting: Max 15 ads in 30 minutes
  static getAdWatchHistory(): number[] {
    const data = localStorage.getItem(STORAGE_KEYS.AD_WATCH_HISTORY);
    if (!data) return [];
    try {
      const timestamps: number[] = JSON.parse(data);
      const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
      return timestamps.filter(t => t > thirtyMinsAgo);
    } catch {
      return [];
    }
  }

  static canWatchAd(): { allowed: boolean; watchedInWindow: number; minutesToWait: number } {
    const history = this.getAdWatchHistory();
    if (history.length < 15) {
      return { allowed: true, watchedInWindow: history.length, minutesToWait: 0 };
    }
    // Calculate how many minutes until the oldest ad in window expires from 30min timeframe
    const oldestInWindow = Math.min(...history);
    const msUntilExpiry = (oldestInWindow + 30 * 60 * 1000) - Date.now();
    const minutesToWait = Math.max(1, Math.ceil(msUntilExpiry / 60000));
    return { allowed: false, watchedInWindow: history.length, minutesToWait };
  }

  static recordAdWatch(): void {
    const history = this.getAdWatchHistory();
    history.push(Date.now());
    localStorage.setItem(STORAGE_KEYS.AD_WATCH_HISTORY, JSON.stringify(history));
  }
}
