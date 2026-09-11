import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Video, 
  Target, 
  Wrench, 
  Copy, 
  Check, 
  Zap, 
  TrendingUp,
  Bookmark,
  Play,
  Tv,
  MessageSquareText,
  Sliders,
  Download
} from 'lucide-react';
import { generateAIContent, AIGenerateParams } from '../services/aiService';
import { User, GeneratedProject } from '../types';
import { DBService } from '../services/dbService';
import { RetentionChart } from './RetentionChart';
import { ScriptRepurposer } from './ScriptRepurposer';

interface MicroSaaSStudioProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onOpenRewardAd: () => void;
  onNavigateToMonetization: () => void;
  onOpenTeleprompterWithScript: (script: string) => void;
}

export const MicroSaaSStudio: React.FC<MicroSaaSStudioProps> = ({
  currentUser,
  onUpdateUser,
  onOpenRewardAd,
  onNavigateToMonetization,
  onOpenTeleprompterWithScript,
}) => {
  const [activeTool, setActiveTool] = useState<AIGenerateParams['type']>('video_ideas_script');
  const [promptInput, setPromptInput] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('TikTok & Shorts');
  const [niche, setNiche] = useState('Tech & AI Tools');
  const [tone, setTone] = useState('High-Energy & Engaging');
  const [duration, setDuration] = useState('30-60 Seconds');

  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<{ output: string; viralScore?: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedProjects, setSavedProjects] = useState<GeneratedProject[]>(() => DBService.getProjects());

  const getToolTokenCost = (type: AIGenerateParams['type']): number => {
    switch (type) {
      case 'video_ideas_script': return 50;
      case 'microsaas_launch': return 50;
      case 'viral_hook': return 25;
      case 'ad_copy': return 25;
      case 'custom_prompt': return 25;
      default: return 25;
    }
  };

  const currentTokenCost = getToolTokenCost(activeTool);

  const handleGenerate = async () => {
    if (!promptInput.trim()) return;

    if (currentUser.credits < currentTokenCost) {
      alert(`You need ${currentTokenCost} Tokens to run this generation! You currently have ${currentUser.credits} Tokens. Watch a quick sponsor ad (+10 Tokens) or upgrade your plan to get more.`);
      return;
    }

    setIsLoading(true);
    setCurrentResult(null);

    try {
      const res = await generateAIContent({
        type: activeTool,
        promptInput,
        targetPlatform,
        niche,
        tone,
        duration,
      });

      setCurrentResult(res);

      // Deduct token cost
      const updatedUser = {
        ...currentUser,
        credits: Math.max(0, currentUser.credits - currentTokenCost),
      };
      onUpdateUser(updatedUser);

      // Save project to library
      const newProj: GeneratedProject = {
        id: `proj_${Date.now()}`,
        type: activeTool,
        title: promptInput.slice(0, 45) + (promptInput.length > 45 ? '...' : ''),
        promptInput,
        output: res.output,
        createdAt: new Date().toISOString(),
        viralScore: res.viralScore,
      };
      DBService.saveProject(newProj);
      setSavedProjects(DBService.getProjects());

    } catch (err: any) {
      console.error(err);
      alert("Failed to generate content: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (currentResult?.output) {
      navigator.clipboard.writeText(currentResult.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const extractCleanTeleprompterScript = (outputMarkdown: string): string => {
    const match = outputMarkdown.match(/🎙️ Clean Teleprompter Script[\s\S]*?\n\n/i);
    if (match) {
      return match[0].replace(/### 🎙️ Clean Teleprompter Script \(Read-Ready\)|"/g, '').trim();
    }
    return outputMarkdown.slice(0, 800);
  };

  const toolConfigs = [
    {
      id: 'video_ideas_script' as const,
      name: 'Viral Video Studio',
      icon: Video,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Gemini 3.6 Flash',
      description: 'Generate 5 high-CTR title ideas, 3 viral hooks, full script with B-roll cues, & teleprompter mode.',
      placeholder: 'e.g., How I built an AI micro-SaaS tool in 24 hours that generates $3,000/month',
    },
    {
      id: 'viral_hook' as const,
      name: 'Hook Virality Suite',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
      badge: 'High Hold-Rate',
      description: 'Craft 5 explosive opening lines designed to maximize 3-second viewer retention on short video apps.',
      placeholder: 'e.g., 5 productivity hacks for remote software engineers and designers',
    },
    {
      id: 'microsaas_launch' as const,
      name: 'Micro-SaaS Blueprint',
      icon: Target,
      color: 'from-emerald-600 to-teal-600',
      badge: '48hr MVP Plan',
      description: 'Validate raw app concepts, landing page copy, pricing model, & zero-ad launch strategy.',
      placeholder: 'e.g., An AI thumbnail generator for podcast hosts that integrates with Spotify',
    },
    {
      id: 'ad_copy' as const,
      name: 'High-CTR Ad Copywriter',
      icon: Tv,
      color: 'from-blue-600 to-indigo-600',
      badge: 'A/B Test Ready',
      description: 'Create high-converting Meta, Google, & TikTok ad copy variants with visual creative concepts.',
      placeholder: 'e.g., Promoted post for our $19/mo AI creator studio toolkit',
    },
    {
      id: 'custom_prompt' as const,
      name: 'Custom AI Assistant',
      icon: Wrench,
      color: 'from-purple-600 to-pink-600',
      badge: 'Custom Prompt',
      description: 'Build any specialized AI prompt generator tailored to your custom creator workflow.',
      placeholder: 'e.g., Write a 5-step email onboarding sequence for new SaaS trial users',
    },
  ];

  const activeConfig = toolConfigs.find(t => t.id === activeTool)!;

  return (
    <div id="microsaas-studio-root" className="space-y-6">
      {/* Studio Header & Tool Selector Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                Gemini 3.6 Flash Engine
              </span>
              <span className="text-xs text-slate-400">| Server-Side AI API</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              AI Creator & Video Script Studio
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Generate viral video ideas, timecoded scripts, B-roll cues, thumbnail prompts, and teleprompter-ready text in seconds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.credits < 5 && (
              <button
                onClick={onOpenRewardAd}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all animate-pulse"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Watch Ad (+5 Credits)
              </button>
            )}
            <button
              onClick={onNavigateToMonetization}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Upgrade Pro Plan
            </button>
          </div>
        </div>

        {/* Tools Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {toolConfigs.map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setCurrentResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.color} text-white shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {tool.badge && (
                    <span className="text-[9px] font-mono bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {tool.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form & Output Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${activeConfig.color} text-white`}>
              <activeConfig.icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeConfig.name}</h3>
              <p className="text-xs text-slate-500">{activeConfig.description}</p>
            </div>
          </div>

          {/* Clean Creator Options Header */}

          {/* Platform & Creator Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform
              </label>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="TikTok & Shorts">TikTok & YouTube Shorts</option>
                <option value="Instagram Reels">Instagram Reels</option>
                <option value="YouTube Longform">YouTube Longform (5-10m)</option>
                <option value="X / Twitter Thread">X / Twitter Thread</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Niche & Topic
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="Tech & AI Tools">Tech, AI & SaaS</option>
                <option value="Finance & Money">Finance & Investing</option>
                <option value="Creator Business">Creator Business & Marketing</option>
                <option value="Storytelling & Vlogs">Storytelling & Life Hacks</option>
                <option value="Fitness & Wellness">Fitness & Health</option>
                <option value="Faceless Channel">Faceless Automation Channel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Voice Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="High-Energy & Engaging">High-Energy & Fast Paced</option>
                <option value="Dramatic Storytelling">Dramatic Storytelling</option>
                <option value="Professional & Educational">Professional & Authority</option>
                <option value="Humorous & Relatable">Humorous & Relatable</option>
                <option value="Controversial & Shocking">Controversial & Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="15-30 Seconds">15 - 30 Seconds (Ultra-Short)</option>
                <option value="30-60 Seconds">30 - 60 Seconds (Standard Short)</option>
                <option value="2-3 Minutes">2 - 3 Minutes (Deep Dive Short)</option>
                <option value="5-10 Minutes">5 - 10 Minutes (YouTube Video)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Describe your Video Concept or Subject Matter
            </label>
            <textarea
              rows={4}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={activeConfig.placeholder}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !promptInput.trim()}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                isLoading || !promptInput.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${activeConfig.color} hover:opacity-95 active:scale-[0.99]`
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Viral Script & Teleprompter Text...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white" />
                  Generate Video Kit (Costs {currentTokenCost} Tokens)
                </>
              )}
            </button>
            
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span>Remaining Credits: <strong>{currentUser.credits}</strong></span>
              <button 
                onClick={onOpenRewardAd}
                className="text-indigo-600 font-semibold hover:underline"
              >
                + Watch Ad for +5
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Screen (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-bold text-slate-900">Generated Creator Blueprint</h3>
              </div>

              {currentResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const cleanScript = extractCleanTeleprompterScript(currentResult.output);
                      onOpenTeleprompterWithScript(cleanScript);
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-transform hover:scale-105 flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Launch Teleprompter
                  </button>

                  {currentResult.viralScore && (
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      Virality: {currentResult.viralScore}%
                    </span>
                  )}
                  <button
                    onClick={handleCopy}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {currentResult ? (
              <div className="space-y-4">
                <div className="prose prose-xs max-w-none text-slate-800 bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 font-sans leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 overflow-y-auto max-h-[450px] scrollbar-none">
                  {currentResult.output}
                </div>

                {/* Audience Retention & Virality Analytics Chart */}
                <RetentionChart viralScore={currentResult.viralScore || 92} />

                {/* 1-Click Multi-Format Script Repurposer */}
                <ScriptRepurposer initialScript={currentResult.output} />
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Video className="w-6 h-6 text-indigo-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No Content Generated Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Describe your video topic on the left and click <strong>Generate Video Kit</strong> to craft original video titles, viral hooks, B-roll cues, thumbnail prompts, and read-ready teleprompter scripts!
                </p>
              </div>
            )}
          </div>

          {/* Saved History Quick Strip */}
          {savedProjects.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <Bookmark className="w-3.5 h-3.5 text-indigo-600" /> Saved Creator Scripts ({savedProjects.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {savedProjects.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentResult({ output: p.output, viralScore: p.viralScore })}
                    className="text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 p-2 rounded-lg min-w-[160px] transition-colors"
                  >
                    <p className="text-[11px] font-bold text-slate-800 truncate">{p.title}</p>
                    <span className="text-[9px] text-slate-400 font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

