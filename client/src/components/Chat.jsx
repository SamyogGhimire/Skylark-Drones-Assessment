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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-5xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center p-6 sm:p-10 border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#0D121F]/80 my-4 shadow-sm">
          {/* Badge icon */}
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
            <Bot className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1.5 tracking-tight">
            Skylark Business Intelligence Assistant
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-lg mb-8 leading-relaxed">
            Query real-time project metrics, active pipeline values, and delayed work orders across Monday.com CRM boards.
          </p>

          {/* Quick Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-2xl">
            {quickCategories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSendMessage(cat.query)}
                  disabled={isLoading}
                  className="group p-4 rounded-xl bg-slate-50 dark:bg-[#111728] hover:bg-slate-100 dark:hover:bg-[#161e34] border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-200 flex items-start gap-3 text-left disabled:opacity-50"
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/30 transition-colors shrink-0 shadow-sm">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                        {cat.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
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
        <div className="flex items-center gap-3 my-4 animate-fade-in">
          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-[#161d30] border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 animate-pulse-slow" />
          </div>
          <div className="bg-white dark:bg-[#111728] border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Querying Monday.com GraphQL API & synthesizing BI metrics...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default Chat;
