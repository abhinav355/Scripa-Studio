import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Copy, 
  Check, 
  Play, 
  Search, 
  Sparkles,
  Tag,
  Share2,
  Download
} from 'lucide-react';
import { GeneratedProject } from '../types';
import { DBService } from '../services/dbService';

interface ScriptLibraryProps {
  projects: GeneratedProject[];
  onRefresh: () => void;
  onOpenTeleprompter: (script: string) => void;
}

export const ScriptLibrary: React.FC<ScriptLibraryProps> = ({
  projects,
  onRefresh,
  onOpenTeleprompter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(term) ||
      p.promptInput.toLowerCase().includes(term) ||
      p.output.toLowerCase().includes(term)
    );
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this script from your saved library?')) {
      const updated = projects.filter((p) => p.id !== id);
      DBService.saveProjectsList(updated);
      onRefresh();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const extractCleanTeleprompterScript = (outputMarkdown: string): string => {
    // Look for Teleprompter section
    const match = outputMarkdown.match(/🎙️ Clean Teleprompter Script[\s\S]*?\n\n/i);
    if (match) {
      return match[0].replace(/### 🎙️ Clean Teleprompter Script \(Read-Ready\)|"/g, '').trim();
    }
    return outputMarkdown.slice(0, 800);
  };

  return (
    <div id="script-library-root" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Bookmark className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Creator Script Vault & History
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access, edit, teleprompt, or export all your generated video scripts and viral hooks in one place.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved scripts or topics..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Script Grid List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center text-slate-400">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Saved Scripts Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Generate video ideas and scripts in the AI Creator Studio to automatically save them here for teleprompter recording.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const cleanScript = extractCleanTeleprompterScript(project.output);
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
                        {project.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {new Date(project.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {project.viralScore && (
                      <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                        ⚡ {project.viralScore}% Virality
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 font-mono line-clamp-6 leading-relaxed whitespace-pre-wrap">
                    {project.output}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenTeleprompter(cleanScript)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Load in Teleprompter
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(project.id, project.output)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                      title="Copy full script"
                    >
                      {copiedId === project.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                      title="Delete script"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
