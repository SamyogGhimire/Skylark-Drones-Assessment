import React, { useRef, useEffect } from 'react';
import Message from './Message';
import { BarChart3, AlertTriangle, DollarSign, FileText, ArrowRight, Bot } from 'lucide-react';

function Chat({ messages, isLoading, onSendMessage, onRetryLast }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickCategories = [
    {
      title: 'Pipeline & Deals',
      desc: 'Active deals count, deal values & sector breakdown',
      icon: BarChart3,
      query: 'What is our active deal pipeline for the renewables sector?',
    },
    {
      title: 'Delayed Work Orders',
      desc: 'Delayed projects past target delivery date',
      icon: AlertTriangle,
      query: 'Show me all delayed work orders past delivery date with client details.',
    },
    {
      title: 'Revenue & Billing',
      desc: 'Billed revenue vs total collected amount',
      icon: DollarSign,
      query: 'How much revenue have we collected vs total billed amount?',
    },
    {
      title: 'Executive Summary',
      desc: 'Leadership overview on overall company KPIs & risks',
      icon: FileText,
      query: 'Give me a leadership update on overall company KPIs and key metrics.',
    },
  ];

  const findLastBotIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'bot') return i;
    }
    return -1;
  };

  const lastBotIndex = findLastBotIndex();

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 space-y-5 max-w-4xl mx-auto w-full py-4 sm:py-6 no-scrollbar">
      {messages.length === 0 ? (
        <div className="min-h-[460px] flex flex-col items-center justify-center text-center p-6 sm:p-12 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#0c101b] my-4 shadow-sm relative overflow-hidden animate-fade-in-up">
          {/* Decorative background grid/gradients */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent dark:from-indigo-500/10 pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Badge icon */}
          <div className="relative w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-650/10 border border-indigo-200/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 shadow-sm z-10">
            <Bot className="w-5.5 h-5.5" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight z-10">
            Skylark Business Intelligence Assistant
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mb-10 leading-relaxed z-10">
            Query project execution metrics, active pipelines, outstanding cash receivables, and operational timelines from Monday.com.
          </p>

          {/* Quick Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left w-full max-w-2xl z-10">
            {quickCategories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSendMessage(cat.query)}
                  disabled={isLoading}
                  className="group p-4 rounded-xl bg-slate-50/50 dark:bg-[#101525]/45 hover:bg-slate-100/50 dark:hover:bg-[#141a2f]/60 border border-slate-200/60 dark:border-slate-800/70 hover:border-indigo-300 dark:hover:border-indigo-500/25 transition-all duration-300 flex items-start gap-3.5 text-left disabled:opacity-50 focus-ring"
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-[#0c101b] border border-slate-200/70 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 group-hover:border-indigo-600 dark:group-hover:border-indigo-500/30 transition-all duration-200 shrink-0 shadow-sm">
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                        {cat.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-650 opacity-0 group-hover:opacity-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all transform -translate-x-1 group-hover:translate-x-0 duration-200" />
                    </div>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      "{cat.query}"
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        messages.map((msg, index) => (
          <Message
            key={index}
            message={msg}
            isLastBotMessage={index === lastBotIndex}
            onRetry={onRetryLast}
          />
        ))
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex items-start gap-3 my-5 animate-fade-in-up">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100/80 dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div className="bg-white dark:bg-[#0c101b] border border-slate-200/60 dark:border-slate-800/80 px-4 py-3 rounded-xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 shadow-sm max-w-sm">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-medium">Synthesizing intelligence metrics...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default Chat;
