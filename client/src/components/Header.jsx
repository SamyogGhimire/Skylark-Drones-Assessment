import React from 'react';
import { RefreshCw, Trash2, LayoutDashboard, Sun, Moon } from 'lucide-react';

function Header({ onClearChat, showKpi, onToggleKpi, onRefreshKpi, isKpiLoading, darkMode, onToggleDarkMode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0E1322]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-indigo-950/20">
          SD
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none tracking-tight">
              Skylark Drones
            </h1>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              BI Intelligence
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            Monday.com CRM & Work Order Operations Agent
          </p>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
        {/* Connection status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Monday.com & Groq</span>
        </div>

        {/* Toggle Theme (Dark / Light) */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>

        {/* Toggle KPI Bar */}
        <button
          type="button"
          onClick={onToggleKpi}
          title={showKpi ? "Hide KPI Dashboard" : "Show KPI Dashboard"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
            showKpi
              ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              : 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">KPI Metrics</span>
        </button>

        {/* Refresh KPI Data */}
        <button
          type="button"
          onClick={onRefreshKpi}
          disabled={isKpiLoading}
          title="Refresh Data Metrics"
          className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isKpiLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
        </button>

        {/* Clear Chat button */}
        <button
          type="button"
          onClick={onClearChat}
          title="Clear Conversation"
          className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-900/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

export default Header;
