
import React, { useState } from 'react';
import { RedditLead } from '../types';

interface LeadCardProps {
  lead: RedditLead;
}

export const LeadCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden animate-pulse p-10">
      <div className="flex justify-between items-start mb-6">
        <div className="h-4 w-24 bg-zinc-800 rounded-full"></div>
        <div className="h-6 w-16 bg-zinc-800 rounded-full"></div>
      </div>
      <div className="h-8 bg-zinc-800 rounded-2xl w-3/4 mb-4"></div>
      <div className="h-20 bg-zinc-800 rounded-[1.5rem] w-full"></div>
    </div>
  );
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const [showReply, setShowReply] = useState(false);

  const getRankStyle = (score?: number) => {
    if (score === undefined) return 'text-zinc-500 border-zinc-800 bg-zinc-900/40';
    if (score >= 80) return 'text-emerald-400 border-emerald-900/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]';
    if (score >= 50) return 'text-amber-400 border-amber-900/40 bg-amber-950/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]';
    return 'text-rose-400 border-rose-900/40 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
  };

  return (
    <div className="group bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-rose-500/30 hover:shadow-2xl hover:shadow-rose-900/10 flex flex-col">
      {/* Top Header Section */}
      <div className="p-8 sm:p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-[9px] font-black bg-white text-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
              {lead.type}
            </span>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">R/{lead.subreddit}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">u/{lead.author}</span>
          </div>
          <div className={`text-[10px] font-black px-4 py-1.5 rounded-full border transition-all ${getRankStyle(lead.aiScore)} uppercase tracking-widest`}>
            {lead.aiScore >= 80 ? 'Verified Intent' : 'Discovery Scan'}: {lead.aiScore || 0}%
          </div>
        </div>

        <h3 className="text-xl font-black text-white mb-6 leading-tight group-hover:text-rose-400 transition-colors tracking-tight">
          {lead.title}
        </h3>
        
        <div className="relative p-6 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
          <p className="text-sm text-zinc-400 italic leading-relaxed font-medium">
            "{lead.content.length > 350 ? lead.content.substring(0, 350) + '...' : lead.content}"
          </p>
        </div>
      </div>

      {/* Insight Section */}
      <div className="p-8 sm:p-10 space-y-8 bg-zinc-900/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="bg-rose-900/20 p-2 rounded-xl shrink-0">
               <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Author Persona</h4>
              <p className="text-xs text-zinc-200 font-black uppercase tracking-tight">{lead.profileInsight}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="bg-amber-900/20 p-2 rounded-xl shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
              <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Signal Reasoning</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                {lead.aiReasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={() => setShowReply(!showReply)}
            className="flex-grow group relative h-14 bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-rose-500/50"
          >
            <div className={`absolute inset-0 bg-rose-600 transition-transform duration-300 ${showReply ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-[85%]'}`} />
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showReply ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                {showReply ? 'Close Strategy' : 'Generate Outreach Draft'}
              </span>
            </div>
          </button>
          
          <a 
            href={lead.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="sm:w-20 h-14 bg-zinc-800 text-zinc-400 rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>

        {showReply && (
          <div className="mt-6 p-8 bg-black/60 rounded-[2rem] border border-rose-500/20 shadow-2xl animate-fade-in relative overflow-hidden group/reply">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/reply:opacity-100 transition-opacity">
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(lead.suggestedReply || '');
                  alert('Strategy copied to clipboard');
                }}
                className="bg-white text-black p-2 rounded-xl hover:scale-110 transition-all"
                title="Copy Draft"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </button>
            </div>
            <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-4">Strategic Response Draft</h4>
            <p className="text-sm text-zinc-100 leading-relaxed font-medium whitespace-pre-wrap">
              {lead.suggestedReply}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
