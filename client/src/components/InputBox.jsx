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
    <div className="sticky bottom-0 z-20 border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0E1322]/95 backdrop-blur-md p-4 sm:px-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-2.5">
        {/* Quick Action Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0 mr-1 hidden sm:inline">
            Suggested:
          </span>
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(item.query)}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#131a2c] hover:bg-slate-200 dark:hover:bg-[#1a233b] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all shrink-0 disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form Box */}
        <form onSubmit={handleSubmit} className="relative flex items-end rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-500/60 bg-white dark:bg-[#111728] shadow-sm transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about active deals, revenue collections, delayed work orders..."
            disabled={isLoading}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-4 pr-14 py-3 resize-none focus:outline-none disabled:opacity-60 max-h-32 min-h-[44px] leading-normal"
          />

          {/* Controls inside input */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              title="Send message (Enter)"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-sm shadow-indigo-950/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">Shift + Enter</kbd> for line break</span>
          {input.length > 0 && <span>{input.length} chars</span>}
        </div>
      </div>
    </div>
  );
}

export default InputBox;
