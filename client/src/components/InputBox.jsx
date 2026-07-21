import React, { useState, useRef } from 'react';
import { Send, BarChart3, AlertTriangle, DollarSign, Zap } from 'lucide-react';

function InputBox({ onSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const quickPrompts = [
    { label: 'Leadership Summary', query: 'Give me a leadership update on overall company KPIs.', icon: Zap },
    { label: 'Delayed Projects', query: 'Show me all delayed work orders past delivery date.', icon: AlertTriangle },
    { label: 'Sector Analysis', query: 'What is our active deal pipeline for the renewables sector?', icon: BarChart3 },
    { label: 'Revenue Cashflow', query: 'How much revenue have we collected vs billed?', icon: DollarSign },
  ];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleQuickPrompt = (promptQuery) => {
    if (!isLoading) {
      onSendMessage(promptQuery);
    }
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-[#080B11]/85 backdrop-blur-md p-4 sm:px-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Quick Action Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-550 shrink-0 mr-1 hidden sm:inline">
            Suggested Context:
          </span>
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(item.query)}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-slate-100/60 dark:bg-[#111726]/60 hover:bg-slate-200/75 dark:hover:bg-[#171f33] text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white border border-slate-200/50 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shrink-0 disabled:opacity-40 disabled:hover:scale-100 focus-ring"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form Box */}
        <form 
          onSubmit={handleSubmit} 
          className="relative flex items-end rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c101b] focus-within:border-indigo-500/70 dark:focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 shadow-sm transition-all duration-300 overflow-hidden"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about active deals, revenue collections, delayed work orders..."
            disabled={isLoading}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm pl-4.5 pr-14 py-3.5 resize-none focus:outline-none disabled:opacity-60 max-h-32 min-h-[48px] leading-normal font-sans"
          />

          {/* Controls inside input */}
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 z-10">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              title="Send message (Enter)"
              className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white disabled:opacity-20 disabled:hover:bg-indigo-600 disabled:hover:scale-100 transition-all duration-255 shadow-sm hover:scale-[1.04] active:scale-[0.96] focus-ring"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-500 px-1">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 text-slate-500 dark:text-slate-450 font-mono text-[9px] shadow-sm">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 text-slate-500 dark:text-slate-450 font-mono text-[9px] shadow-sm">Shift + Enter</kbd> for line break</span>
          {input.length > 0 && <span className="font-mono">{input.length} characters</span>}
        </div>
      </div>
    </div>
  );
}

export default InputBox;
