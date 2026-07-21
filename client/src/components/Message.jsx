import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Bot, User, Clock, RefreshCw, FileSpreadsheet } from 'lucide-react';

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
          <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
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
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-[12px] border border-slate-200 dark:border-slate-700/60">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
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
          <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {headerRow.map((h, hIdx) => (
                    <th key={hIdx} className="px-3.5 py-2.5">
                      {renderFormattedText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap">
                        {renderFormattedText(cell)}
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
          <h3 key={idx} className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-3 mb-1.5 flex items-center gap-1.5">
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">
            {trimmed.replace('# ', '')}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        elements.push(
          <li key={idx} className="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1 leading-relaxed text-xs sm:text-sm">
            {renderFormattedText(content)}
          </li>
        );
        return;
      }

      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={idx} className="ml-4 flex gap-2 text-slate-700 dark:text-slate-300 my-1 leading-relaxed text-xs sm:text-sm">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">{numMatch[1]}.</span>
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
        <p key={idx} className="text-slate-700 dark:text-slate-300 my-1 leading-relaxed text-xs sm:text-sm">
          {renderFormattedText(trimmed)}
        </p>
      );
    });

    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      elements.push(
        <div key="table-trailing" className="my-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {headerRow.map((h, hIdx) => (
                  <th key={hIdx} className="px-3.5 py-2.5">
                    {renderFormattedText(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap">
                      {renderFormattedText(cell)}
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
    <div className={`group flex items-start gap-3 my-4 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center font-medium text-xs shrink-0 shadow-sm transition-all ${
          isUser
            ? 'bg-indigo-600 text-white shadow-indigo-950/20'
            : 'bg-slate-100 dark:bg-[#161d30] text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content Container */}
      <div className={`max-w-[88%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-xl px-4 py-3 text-xs sm:text-sm border transition-all ${
            isUser
              ? 'bg-indigo-600 border-indigo-500/80 text-white shadow-sm'
              : 'bg-white dark:bg-[#111728] border-slate-200 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 shadow-sm'
          }`}
        >
          {/* Header metadata for bot messages */}
          {!isUser && (
            <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Executive Intelligence Report</span>
              </div>
              {message.sources && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {message.sources.deals === 'monday.com' ? 'Monday.com GraphQL API' : 'Cache Dataset'}
                </span>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-1">{formatContent(message.text)}</div>

          {/* Bottom Bar: Action icons and timestamp */}
          <div className={`flex items-center gap-3 mt-2.5 pt-1.5 border-t text-[11px] ${
            isUser ? 'border-indigo-500/30 text-indigo-100' : 'border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400'
          }`}>
            <span className="flex items-center gap-1 opacity-70 text-[10px]">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </span>

            {!isUser && (
              <div className="ml-auto flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy response"
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>

                {/* Feedback thumbs up */}
                <button
                  type="button"
                  onClick={() => handleFeedback('up')}
                  title="Helpful"
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    feedback === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>

                {/* Feedback thumbs down */}
                <button
                  type="button"
                  onClick={() => handleFeedback('down')}
                  title="Unhelpful"
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    feedback === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="text-[10px]">Retry</span>
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
