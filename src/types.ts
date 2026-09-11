export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  credits: number;
  totalSpent: number;
  referralCode: string;
  referralCount: number;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface AdConfig {
  headerBannerActive: boolean;
  sidebarBannerActive: boolean;
  inFeedAdsActive: boolean;
  rewardAdsActive: boolean;
  googleAdsenseId: string;
  customBannerCode: string;
  sponsoredTitle: string;
  sponsoredDescription: string;
  sponsoredLink: string;
  sponsoredCta: string;
  cpmRate: number; // $ per 1000 impressions
  cpcRate: number; // $ per click
  impressions: number;
  clicks: number;
  totalAdRevenue: number;
}

export interface FinancialStats {
  monthlyRecurringRevenue: number;
  adRevenue: number;
  creditSalesRevenue: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalUsers: number;
  activeToday: number;
  creditsConsumedTotal: number;
}

export interface GeneratedProject {
  id: string;
  type: 'viral_hook' | 'microsaas_launch' | 'ad_copy' | 'sales_outreach' | 'custom_prompt';
  title: string;
  promptInput: string;
  output: string;
  createdAt: string;
  viralScore?: number;
}

export interface PricingPlan {
  id: UserPlan;
  name: string;
  priceMonthly: number;
  creditsPerMonth: number;
  features: string[];
  popular?: boolean;
}

export interface GeminiClusterConfig {
  slot1: string;
  slot2: string;
  slot3: string;
  slot4: string;
}

export interface OpenAiClusterConfig {
  slot1: string;
  slot2: string;
  slot3: string;
  slot4: string;
}

export interface ApiKeysConfig {
  // Dual 4-Factor AI Clusters
  activeProviderMode: 'gemini_4factor' | 'openai_4factor' | 'auto_load_balancer';
  geminiCluster: GeminiClusterConfig;
  openaiCluster: OpenAiClusterConfig;
  
  // Legacy backward-compatibility mappings
  primaryAiKey: string;
  secondaryAiKey: string;
  tertiaryAiKey: string;
  quaternaryAiKey: string;
  activeSlot: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'failsafe';
  autoFailoverEnabled: boolean;
  maxRetriesPerSlot: number;
}

export interface PaymentGatewayConfig {
  stripeSecretKey: string;
  stripePublishableKey: string;
  lemonSqueezyApiKey: string;
  lemonSqueezyStoreId: string;
  payPalClientId: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayEnabled: boolean;
  webhookSecret: string;
  paymentMode: 'live' | 'test';
  autoReceiptEmails: boolean;
}

export interface WorkflowConfig {
  resendApiKey: string;
  notificationEmail: string;
  webhookUrl: string;
  welcomeEmailSubject: string;
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  type: 'ai_generation' | 'payment_processed' | 'email_sent' | 'api_failover' | 'webhook_triggered' | 'reward_ad';
  status: 'success' | 'warning' | 'error';
  details: string;
  metadata?: string;
}

export interface GlobalSettings {
  appTitle: string;
  announcementText: string;
  announcementActive: boolean;
  freeTierDailyCredits: number;
  proMonthlyPrice: number;
  enterpriseMonthlyPrice: number;
  referralCreditReward: number;
  adminPin: string;
  apiConfig?: ApiKeysConfig;
  paymentConfig?: PaymentGatewayConfig;
  workflowConfig?: WorkflowConfig;
}
