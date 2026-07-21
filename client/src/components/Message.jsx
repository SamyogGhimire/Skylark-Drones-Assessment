import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Bot, User, Clock, RefreshCw, FileSpreadsheet, Calendar } from 'lucide-react';

function Message({ message, onRetry, isLastBotMessage }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFeedback = (type) => {
    setFeedback((prev) => (prev === type ? null : type));
  };

  // Helper to render inline markdown styles
  const renderFormattedText = (str) => {
    if (!str) return null;
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-500 dark:text-slate-400">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-indigo-650 dark:text-indigo-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700/60">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Smart Cell Formatter for premium Notion/Linear style tables
  const renderTableCell = (text) => {
    if (!text) return '-';
    const trimmed = text.trim();
    
    // Check if it's a currency (starts with ₹)
    if (trimmed.startsWith('₹')) {
      return (
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
          {trimmed}
        </span>
      );
    }
    
    // Check if it's a known stage/status
    const lower = trimmed.toLowerCase();
    
    // Emerald / Green badges
    if (
      lower === 'won' || 
      lower === 'closed/won' || 
      lower === 'completed' || 
      lower === 'high' || 
      lower === 'billing complete' || 
      lower === 'billed' || 
      lower === 'fully collected' ||
      lower === 'priority account'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-455 border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm shrink-0 animate-fade-in">
          {trimmed}
        </span>
      );
    }
    
    // Amber / Orange badges
    if (
      lower === 'medium' || 
      lower === 'in progress' || 
      lower === 'negotiation' || 
      lower === 'proposal' || 
      lower === 'under execution' || 
      lower === 'partially billed' ||
      lower === 'pending billing' ||
      lower === 'scheduled'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-750 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20 shadow-sm shrink-0 animate-fade-in">
          {trimmed}
        </span>
      );
    }
    
    // Rose / Red badges
    if (
      lower === 'lost' || 
      lower === 'closed/lost' || 
      lower === 'delayed' || 
      lower === 'overdue' || 
      lower === 'critical' || 
      lower === 'not started' ||
      lower === 'priority ar'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-450 border border-rose-200/50 dark:border-rose-500/20 shadow-sm shrink-0 animate-fade-in">
          {trimmed}
        </span>
      );
    }

    // Default status/info badges
    if (
      lower === 'low' ||
      lower === 'open' ||
      lower === 'lead' ||
      lower === 'qualified' ||
      lower === 'services' ||
      lower === 'normal' ||
      lower === 'one time project' ||
      lower === 'recurring'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/60 shrink-0">
          {trimmed}
        </span>
      );
    }

    // Date formatting detection (e.g. YYYY-MM-DD or DD-MM-YYYY)
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) || /^\d{2}\/\d{2}\/\d{4}$/.test(trimmed) || /^[A-Z][a-z]{2}\s\d{1,2}(,\s\d{4})?$/.test(trimmed);
    if (isDate) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-slate-500 dark:text-slate-450 text-[10px]">
          <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          {trimmed}
        </span>
      );
    }

    return renderFormattedText(trimmed);
  };

  // Format content supporting headers, lists, and markdown tables
  const formatContent = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let tableRows = [];
    let inTable = false;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check for markdown table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (trimmed.includes('---')) {
          inTable = true;
          return;
        }
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        tableRows.push(cells);
        inTable = true;
        return;
      }

      if (inTable && tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1);
        elements.push(
          <div key={`table-${idx}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#0c101b]/50 shadow-sm max-w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-[#111726]/60 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold">
                  {headerRow.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-3 select-none">
                      {renderFormattedText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-100/40 dark:hover:bg-[#141d31]/30 transition-colors duration-150">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                        {renderTableCell(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2.5">
            {trimmed.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-base font-bold text-slate-900 dark:text-slate-50 mt-5 mb-3">
            {trimmed.replace('# ', '')}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        elements.push(
          <li key={idx} className="ml-4 list-disc text-slate-650 dark:text-slate-300 my-1 leading-relaxed text-[13px] sm:text-[14px]">
            {renderFormattedText(content)}
          </li>
        );
        return;
      }

      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={idx} className="ml-4 flex gap-2 text-slate-650 dark:text-slate-300 my-1 leading-relaxed text-[13px] sm:text-[14px]">
            <span className="font-bold text-indigo-500 dark:text-indigo-400">{numMatch[1]}.</span>
            <span>{renderFormattedText(numMatch[2])}</span>
          </div>
        );
        return;
      }

      if (trimmed === '') {
        elements.push(<div key={idx} className="h-2"></div>);
        return;
      }

      elements.push(
        <p key={idx} className="text-slate-650 dark:text-slate-300 my-1.5 leading-relaxed text-[13px] sm:text-[14px]">
          {renderFormattedText(trimmed)}
        </p>
      );
    });

    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      elements.push(
        <div key="table-trailing" className="my-4 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#0c101b]/50 shadow-sm max-w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-[#111726]/60 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                {headerRow.map((h, hIdx) => (
                  <th key={hIdx} className="px-4 py-3 select-none">
                    {renderFormattedText(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-100/40 dark:hover:bg-[#141d31]/30 transition-colors duration-150">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                      {renderTableCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  const formattedTime = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`group flex items-start gap-3.5 my-5 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm border transition-all duration-300 ${
          isUser
            ? 'bg-indigo-650 border-indigo-500 text-white shadow-indigo-950/10'
            : 'bg-white dark:bg-[#0c101b] text-indigo-600 dark:text-indigo-400 border-slate-200/70 dark:border-slate-800/85 hover:border-slate-350 dark:hover:border-slate-700'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Message Content Container */}
      <div className={`max-w-[88%] sm:max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3.5 text-xs sm:text-sm border transition-all duration-300 ${
            isUser
              ? 'bg-indigo-600 border-indigo-550 text-white shadow-sm shadow-indigo-950/10'
              : 'bg-white dark:bg-[#0c101b] border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 shadow-sm shadow-slate-100/50 dark:shadow-none'
          }`}
        >
          {/* Header metadata for bot messages */}
          {!isUser && (
            <div className="flex items-center justify-between gap-4 mb-3 pb-2.5 border-b border-slate-200/70 dark:border-slate-850 text-[10px] text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500 dark:text-indigo-455" />
                <span>Executive Intelligence Report</span>
              </div>
              {message.sources && (
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 select-none">
                  {message.sources.deals === 'monday.com' ? 'Monday.com API' : 'Cache Dataset'}
                </span>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-1.5">{formatContent(message.text)}</div>

          {/* Bottom Bar: Action icons and timestamp */}
          <div className={`flex items-center gap-3.5 mt-3 pt-2.5 border-t text-[10px] select-none ${
            isUser ? 'border-indigo-500/25 text-indigo-250/80' : 'border-slate-200/60 dark:border-slate-850 text-slate-400 dark:text-slate-500'
          }`}>
            <span className="flex items-center gap-1.5 opacity-80">
              <Clock className="w-3.5 h-3.5" />
              {formattedTime}
            </span>

            {!isUser && (
              <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy response"
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-[#111726]/60 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#182033] hover:text-slate-700 dark:hover:text-slate-250 transition-colors focus-ring"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span className="text-[9px] font-medium">Copy</span>
                    </>
                  )}
                </button>

                {/* Feedback thumbs up */}
                <button
                  type="button"
                  onClick={() => handleFeedback('up')}
                  title="Helpful"
                  className={`p-1 rounded-md bg-slate-50 dark:bg-[#111726]/60 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#182033] transition-colors focus-ring ${
                    feedback === 'up' ? 'text-emerald-600 dark:text-emerald-450 border-emerald-200 dark:border-emerald-950/40 bg-emerald-50 dark:bg-emerald-950/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>

                {/* Feedback thumbs down */}
                <button
                  type="button"
                  onClick={() => handleFeedback('down')}
                  title="Unhelpful"
                  className={`p-1 rounded-md bg-slate-50 dark:bg-[#111726]/60 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#182033] transition-colors focus-ring ${
                    feedback === 'down' ? 'text-rose-600 dark:text-rose-455 border-rose-200 dark:border-rose-950/40 bg-rose-50 dark:bg-rose-950/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>

                {/* Retry last query */}
                {isLastBotMessage && onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    title="Retry this query"
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-[#111726]/60 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#182033] hover:text-slate-700 dark:hover:text-slate-250 transition-colors focus-ring"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <span className="text-[9px] font-medium">Retry</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
