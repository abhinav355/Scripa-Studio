import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, Video, Twitter, Linkedin, Mail, FileText, ArrowRight } from 'lucide-react';

interface ScriptRepurposerProps {
  initialScript: string;
}

export const ScriptRepurposer: React.FC<ScriptRepurposerProps> = ({ initialScript }) => {
  const [activeFormat, setActiveFormat] = useState<'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'email'>('tiktok');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Extract core text or use default topic
  const cleanSourceText = initialScript.replace(/#+\s/g, '').substring(0, 300);

  const getRepurposedContent = (): string => {
    switch (activeFormat) {
      case 'tiktok':
        return `📱 TIKTOK & SHORTS VERTICAL SCRIPT (0-60s)
----------------------------------------
[HOOK 0-3s]: "Stop scrolling if you waste time trying to figure this out!"
[VISUAL]: Fast zoom-in on face + bright neon text overlay "WATCH THIS ❌"

[SCENE 1 (3-15s)]: "Most people struggle for hours doing this manually, but there is a 1-click shortcut."
[SCENE 2 (15-40s)]: "Step 1: Open your dashboard. Step 2: Input your core topic. Step 3: Let AI generate the full viral script."
[CTA (40-60s)]: "Save this video right now & tap the bio link to test it!"`;

      case 'youtube':
        return `🎥 YOUTUBE LONGFORM VIDEO OUTLINE & TIMESTAMPS
------------------------------------------------
00:00 - Explosive Hook & Problem Statement
01:30 - Why Traditional Methods Fail in 2026
04:15 - Step-by-Step Live Demonstration
08:45 - Key Results & Performance Comparison
12:00 - Actionable Takeaways & Free Resource Link

SEO Description:
In this video, we break down the complete strategy to master ${cleanSourceText.substring(0, 80)}... Don't forget to Like & Subscribe!`;

      case 'twitter':
        return `🧵 VIRAL TWITTER / X THREAD (6 TWEETS)
----------------------------------------
1/6 🧵 Most creators waste 10+ hours a week on scriptwriting.

Here is the exact 3-step AI system to turn 1 prompt into a week of viral videos ⬇️

2/6 Step 1: Hook Engineering. The first 3 seconds decide 90% of your video views. Always use a Curiosity Gap or High-Stakes Controversy.

3/6 Step 2: Pacing & Pattern Interrupts. Change B-roll visuals or text overlays every 2.5 seconds to hold audience attention above 80%.

4/6 Step 3: Clear Call-to-Action. Never end a video passively. Direct viewers to save the video or tap the bio link for the template.

5/6 Pro Tip: Repurpose every short script into a longform video, newsletter, and Twitter thread for 5x reach with 0 extra effort.

6/6 Found this valuable?
1. Follow @ViralScriptAI for daily creator hacks
2. Retweet tweet #1 to share with your audience! 🔄`;

      case 'linkedin':
        return `💼 LINKEDIN CAROUSEL SLIDES (TEXT & VISUALS)
----------------------------------------------
[SLIDE 1 - Cover]: How to Automate Content Creation in 2026 (Without Sacrificing Quality)
[SLIDE 2]: The #1 Bottleneck Facing Digital Creators: Time vs Consistency.
[SLIDE 3]: The 3-Step AI Scriptwriting Framework.
[SLIDE 4]: Step 1: Curiosity-Driven Hooks.
[SLIDE 5]: Step 2: Scene-by-Scene Visual Cues.
[SLIDE 6]: Step 3: Single-Take Teleprompter Execution.
[SLIDE 7 - CTA]: Repost if you found this insightful & follow for more SaaS workflows!`;

      case 'email':
        return `📧 EMAIL NEWSLETTER / ARTICLE BREAKDOWN
--------------------------------------
Subject: 🚀 The 1-click secret to 10x viral content output...

Hey Creator,

If you've been feeling burnt out trying to post every single day across TikTok, YouTube, and LinkedIn — you're not alone.

Here is the exact framework top 1% creators are using:
1. Generate 1 core viral video script using Gemini 3.6 Flash.
2. Repurpose the core script into 5 platform formats automatically.
3. Schedule posts at peak engagement times.

Try the free ViralScript Studio today and save 15+ hours this week!`;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const text = getRepurposedContent();
    navigator.clipboard.writeText(text);
    setCopiedFormat(activeFormat);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">1-Click Multi-Format Script Repurposer</h3>
            <p className="text-[11px] text-slate-400">Instantly format your script for TikTok, YouTube, X/Twitter, LinkedIn & Newsletters.</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
        >
          {copiedFormat === activeFormat ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied {activeFormat.toUpperCase()}!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy Repurposed Text
            </>
          )}
        </button>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFormat('tiktok')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'tiktok' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Video className="w-3.5 h-3.5" /> TikTok / Shorts
        </button>

        <button
          onClick={() => setActiveFormat('youtube')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'youtube' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> YouTube Longform
        </button>

        <button
          onClick={() => setActiveFormat('twitter')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'twitter' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Twitter className="w-3.5 h-3.5" /> X / Twitter Thread
        </button>

        <button
          onClick={() => setActiveFormat('linkedin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'linkedin' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Linkedin className="w-3.5 h-3.5" /> LinkedIn Slides
        </button>

        <button
          onClick={() => setActiveFormat('email')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'email' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Mail className="w-3.5 h-3.5" /> Email Newsletter
        </button>
      </div>

      {/* Formatted Output */}
      <pre className="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-emerald-300 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64">
        {getRepurposedContent()}
      </pre>
    </div>
  );
};
