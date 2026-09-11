import React, { useState } from 'react';
import { Calendar as CalendarIcon, Sparkles, ArrowRight, Download, RefreshCw, Clock, Video, CheckCircle, Copy, Play } from 'lucide-react';
import { User } from '../types';

interface CalendarDay {
  dayName: string;
  dateStr: string;
  topic: string;
  hook: string;
  format: 'TikTok / Shorts' | 'YouTube Video' | 'Instagram Reel' | 'Carousel / Thread';
  bestTime: string;
  targetNiche: string;
}

interface ContentCalendarProps {
  currentUser: User;
  onSelectTopicForScript: (topic: string, platform: string) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  currentUser,
  onSelectTopicForScript,
}) => {
  const [niche, setNiche] = useState('Tech & AI Automation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([
    {
      dayName: 'Monday',
      dateStr: 'Day 1',
      topic: '3 Hidden AI Tools That Save 10 Hours a Week',
      hook: 'Stop scrolling if you waste time on repetitive work...',
      format: 'TikTok / Shorts',
      bestTime: '9:00 AM EST',
      targetNiche: 'Productivity',
    },
    {
      dayName: 'Tuesday',
      dateStr: 'Day 2',
      topic: 'Why Everyone is Deleting Their Old SaaS Subscriptions',
      hook: 'I canceled 4 software subscriptions and replaced them with this 1 tool...',
      format: 'Instagram Reel',
      bestTime: '12:30 PM EST',
      targetNiche: 'Software',
    },
    {
      dayName: 'Wednesday',
      dateStr: 'Day 3',
      topic: 'How to Build a Micro-SaaS with Zero Coding',
      hook: 'No computer science degree required. Here is the 3-step stack...',
      format: 'YouTube Video',
      bestTime: '3:00 PM EST',
      targetNiche: 'Business',
    },
    {
      dayName: 'Thursday',
      dateStr: 'Day 4',
      topic: '5 Mistakes Every New Creator Makes in 2026',
      hook: 'If your views are stuck under 200, you are probably doing THIS...',
      format: 'TikTok / Shorts',
      bestTime: '6:15 PM EST',
      targetNiche: 'Creator Economy',
    },
    {
      dayName: 'Friday',
      dateStr: 'Day 5',
      topic: 'Behind the Scenes: $10k/mo Monetization Blueprint',
      hook: 'Here is the exact breakdown of my digital product revenue streams...',
      format: 'Carousel / Thread',
      bestTime: '11:00 AM EST',
      targetNiche: 'Monetization',
    },
    {
      dayName: 'Saturday',
      dateStr: 'Day 6',
      topic: 'Testing a $0 Marketing Experiment for 24 Hours',
      hook: 'Can you go viral with 0 followers? Let us find out live...',
      format: 'TikTok / Shorts',
      bestTime: '2:00 PM EST',
      targetNiche: 'Growth Hacks',
    },
    {
      dayName: 'Sunday',
      dateStr: 'Day 7',
      topic: 'Weekly Q&A: Answering Your Top AI Automation Questions',
      hook: 'You asked, I answered. Here is the ultimate creator toolkit FAQ...',
      format: 'YouTube Video',
      bestTime: '7:00 PM EST',
      targetNiche: 'Q&A Community',
    },
  ]);

  const handleGenerateCalendar = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated: CalendarDay[] = [
        {
          dayName: 'Monday',
          dateStr: 'Day 1',
          topic: `Top 5 ${niche} Tools Revolutionizing 2026`,
          hook: `If you are in ${niche}, you cannot afford to ignore this hack...`,
          format: 'TikTok / Shorts',
          bestTime: '8:30 AM EST',
          targetNiche: niche,
        },
        {
          dayName: 'Tuesday',
          dateStr: 'Day 2',
          topic: `How I Automated My Entire ${niche} Workflow`,
          hook: `I used to spend 6 hours on this every Tuesday. Not anymore...`,
          format: 'Instagram Reel',
          bestTime: '12:00 PM EST',
          targetNiche: niche,
        },
        {
          dayName: 'Wednesday',
          dateStr: 'Day 3',
          topic: `The Brutal Truth About ${niche} Nobody Tells You`,
          hook: `Unpopular opinion: Most guru advice about ${niche} is completely wrong...`,
          format: 'YouTube Video',
          bestTime: '4:30 PM EST',
          targetNiche: niche,
        },
        {
          dayName: 'Thursday',
          dateStr: 'Day 4',
          topic: `Step-by-Step ${niche} Masterclass for Beginners`,
          hook: `Save this video right now! Here is the complete beginner blueprint...`,
          format: 'TikTok / Shorts',
          bestTime: '7:15 PM EST',
          targetNiche: niche,
        },
        {
          dayName: 'Friday',
          dateStr: 'Day 5',
          topic: `3 High-Converting ${niche} Templates You Can Copy`,
          hook: `Steal my exact ${niche} framework that generated 50k views...`,
          format: 'Carousel / Thread',
          bestTime: '10:00 AM EST',
          targetNiche: niche,
        },
        {
          dayName: 'Saturday',
          dateStr: 'Day 6',
          topic: `Reacting to the Worst ${niche} Advice on TikTok`,
          hook: `I tried the worst rated ${niche} tutorial so you don't have to...`,
          format: 'TikTok / Shorts',
          bestTime: '3:00 PM EST',
          targetNiche: niche,
        },
        {
          dayName: 'Sunday',
          dateStr: 'Day 7',
          topic: `Weekly Review: My ${niche} Growth Results & Revenue`,
          hook: `Transparency check: Here is what worked and what failed this week...`,
          format: 'YouTube Video',
          bestTime: '8:00 PM EST',
          targetNiche: niche,
        },
      ];
      setCalendarDays(generated);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopyDay = (day: CalendarDay, index: number) => {
    const text = `📅 ${day.dayName} (${day.format}):
Topic: ${day.topic}
Hook: "${day.hook}"
Best Time: ${day.bestTime}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportCalendarMarkdown = () => {
    const content = `# 📅 7-Day AI Content Calendar (${niche})
${calendarDays.map(d => `## ${d.dayName} - ${d.format}
- **Topic:** ${d.topic}
- **Viral Hook:** "${d.hook}"
- **Optimal Post Time:** ${d.bestTime}
- **Niche Tag:** #${d.targetNiche.replace(/\s+/g, '')}
`).join('\n---\n\n')}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viralscript_7day_calendar_${niche.replace(/\s+/g, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                Content Engine
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                7-Day Viral Content Planner & Calendar
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Generate an entire week of synchronized viral video topics, hooks, and optimal posting times.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCalendarMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Calendar (.md)
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto flex-1">
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Target Creator Niche
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Personal Finance, Fitness, AI SaaS, Gaming..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleGenerateCalendar}
          disabled={isGenerating}
          className="w-full sm:w-auto mt-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Building 7-Day Strategy...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate 7-Day Calendar
            </>
          )}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {calendarDays.map((day, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{day.dateStr}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {day.bestTime}
                </span>
              </div>

              {/* Format Badge */}
              <div className="mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <Video className="w-3 h-3 text-amber-600" />
                  {day.format}
                </span>
              </div>

              {/* Topic & Hook */}
              <h4 className="text-xs font-bold text-slate-900 mb-2 leading-snug">
                {day.topic}
              </h4>
              <p className="text-[11px] text-slate-600 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 mb-4">
                "{day.hook}"
              </p>
            </div>

            {/* Card Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyDay(day, idx)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Copy day plan"
              >
                {copiedIndex === idx ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => onSelectTopicForScript(day.topic, day.format)}
                className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1 group-hover:bg-indigo-600 group-hover:text-white"
              >
                <Play className="w-3 h-3 fill-current" />
                Generate Script
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
