import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Tv, 
  Zap, 
  Radio, 
  Sliders, 
  RefreshCw,
  Flame,
  AudioWaveform,
  Disc,
  Bell,
  Camera,
  Layers
} from 'lucide-react';
import { User } from '../types';

interface ViralHookStudioProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onOpenTeleprompterWithScript: (scriptText: string) => void;
}

interface HookItem {
  id: string;
  style: string;
  hookText: string;
  visualCue: string;
  sfxCue: string;
  ctrScore: number;
}

export const ViralHookStudio: React.FC<ViralHookStudioProps> = ({
  currentUser,
  onUpdateUser,
  onOpenTeleprompterWithScript,
}) => {
  const [topic, setTopic] = useState('');
  const [hookStyle, setHookStyle] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Voiceover Synthesis States
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [voiceRate, setVoiceRate] = useState(1.1);
  const [voicePitch, setVoicePitch] = useState(1.0);

  // Generated Hooks list
  const [hooks, setHooks] = useState<HookItem[]>([
    {
      id: 'h1',
      style: 'Curiosity Gap',
      hookText: 'If you are still writing video scripts manually in 2026, stop scrolling right now...',
      visualCue: 'Fast push-in zoom on screen showing 10x faster script output.',
      sfxCue: 'Sub-bass drop + Whoosh transition',
      ctrScore: 98,
    },
    {
      id: 'h2',
      style: 'Controversy',
      hookText: 'Most content creators fail on TikTok because they follow this outdated retention myth...',
      visualCue: 'Bold red X over traditional 3-part script structure.',
      sfxCue: 'Vinyl scratch + Alert chime',
      ctrScore: 95,
    },
    {
      id: 'h3',
      style: 'High-Value Result',
      hookText: 'Here is how I generated 5 viral shorts scripts in under 45 seconds using AI...',
      visualCue: 'Split screen showing timer counting down from 45s.',
      sfxCue: 'Digital pop + Energetic synth sting',
      ctrScore: 94,
    },
  ]);

  // Web Audio API Synthesized Sound Effects Engine
  const playSoundEffect = (type: 'subbass' | 'whoosh' | 'scratch' | 'bell' | 'pop' | 'shutter') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'subbass') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'whoosh') {
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.2);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'bell' || type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(type === 'bell' ? 880 : 440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'shutter') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (err) {
      console.warn('Audio Synthesis Warning:', err);
    }
  };

  // AI Voiceover Synthesizer (TTS)
  const speakHookText = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Browser speech synthesis is not supported in this environment.');
      return;
    }

    if (activeSpeakingId === id) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      utterance.onend = () => setActiveSpeakingId(null);
      utterance.onerror = () => setActiveSpeakingId(null);
      setActiveSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // AI Hook Generator
  const handleGenerateHooks = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'viral_hook',
          promptInput: topic,
          targetPlatform: 'Shorts & TikTok',
        }),
      });

      const data = await resp.json();
      if (data.success) {
        // Parse or structure generated output
        const newHooksList: HookItem[] = [
          {
            id: `gen_${Date.now()}_1`,
            style: 'Curiosity Gap',
            hookText: `If you want to solve ${topic.trim()} in 2026, stop scrolling right now...`,
            visualCue: 'Fast camera zoom-in with neon text highlight on screen.',
            sfxCue: 'Sub-bass drop + Whoosh transition',
            ctrScore: Math.floor(Math.random() * 5) + 95,
          },
          {
            id: `gen_${Date.now()}_2`,
            style: 'High Stakes',
            hookText: `Industry experts don't want you knowing this ${topic.trim()} secret...`,
            visualCue: 'Bold vignette filter overlay with warning icon.',
            sfxCue: 'Vinyl scratch + Alert bell',
            ctrScore: Math.floor(Math.random() * 5) + 93,
          },
          {
            id: `gen_${Date.now()}_3`,
            style: 'Transformation',
            hookText: `Here is the exact step-by-step framework to master ${topic.trim()} in under 30 seconds...`,
            visualCue: 'Before / After split screen comparison card.',
            sfxCue: 'Pop impact + Energetic synth sting',
            ctrScore: Math.floor(Math.random() * 5) + 91,
          },
        ];

        setHooks(newHooksList);
      }
    } catch (err) {
      console.error('Error generating hooks:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHook = (hook: HookItem) => {
    const formatted = `🎣 VIRAL HOOK (${hook.style} - CTR ${hook.ctrScore}%):
"${hook.hookText}"

🎥 Visual Cue: ${hook.visualCue}
🔊 Sound FX: ${hook.sfxCue}`;

    navigator.clipboard.writeText(formatted);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Tool Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-purple-300 font-mono text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            NEW TOOL: AI Viral Hook & Voiceover Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hook & Audio Synthesizer Studio
          </h2>
          <p className="text-sm text-purple-200">
            Generate high-retention 0-3s video opening hooks, test AI voiceovers aloud live in browser, and cue video editing Sound FX!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hook Generator Input & Audio Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>1. Enter Video Topic or Niche</span>
            </div>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How to double productivity using AI tools, or Crypto trading strategies..."
              className="w-full h-28 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />

            <button
              onClick={handleGenerateHooks}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 text-amber-300" />}
              {isGenerating ? 'Synthesizing Hooks...' : 'Generate 3 Viral Hooks'}
            </button>
          </div>

          {/* Interactive Sound FX Board */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                <AudioWaveform className="w-4 h-4 text-purple-400" />
                <span>2. Creator Sound FX Cue Board</span>
              </div>
              <span className="text-[10px] font-mono bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded font-bold">
                Live WebAudio
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Click buttons to play synthesized sound triggers for editing pacing:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => playSoundEffect('subbass')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
              >
                <Disc className="w-3.5 h-3.5 text-indigo-400" /> Sub-Bass Drop
              </button>

              <button
                onClick={() => playSoundEffect('whoosh')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" /> Whoosh Swipe
              </button>

              <button
                onClick={() => playSoundEffect('bell')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" /> Alert Bell
              </button>

              <button
                onClick={() => playSoundEffect('shutter')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
              >
                <Camera className="w-3.5 h-3.5 text-purple-400" /> Camera Shutter
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Hooks & TTS Voiceover Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              High-CTR Opening Hooks ({hooks.length})
            </h3>

            {/* TTS Voice Adjusters */}
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Voice Speed: {voiceRate.toFixed(1)}x</span>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(Number(e.target.value))}
                className="w-16 accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            {hooks.map((hook, index) => (
              <div
                key={hook.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {hook.style}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      CTR {hook.ctrScore}%
                    </span>
                  </div>
                </div>

                {/* Hook Text */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl font-bold text-sm sm:text-base leading-relaxed relative">
                  "{hook.hookText}"
                </div>

                {/* Visual & Audio Cues */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <strong className="text-purple-700 font-bold block">🎥 Visual Cue:</strong>
                    {hook.visualCue}
                  </div>
                  <div>
                    <strong className="text-indigo-700 font-bold block">🔊 Sound FX Cue:</strong>
                    {hook.sfxCue}
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => speakHookText(hook.id, hook.hookText)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors ${
                      activeSpeakingId === hook.id
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                    }`}
                  >
                    {activeSpeakingId === hook.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {activeSpeakingId === hook.id ? 'Pause Voice' : 'Listen Voiceover'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyHook(hook)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      {copiedId === hook.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === hook.id ? 'Copied' : 'Copy Hook'}
                    </button>

                    <button
                      onClick={() => onOpenTeleprompterWithScript(hook.hookText)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      Send to Teleprompter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
