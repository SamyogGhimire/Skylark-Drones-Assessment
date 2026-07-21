import React from 'react';
import { RefreshCw, Trash2, LayoutDashboard, Sun, Moon, Database } from 'lucide-react';

function Header({ onClearChat, showKpi, onToggleKpi, onRefreshKpi, isKpiLoading, darkMode, onToggleDarkMode }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-[#080B11]/75 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-indigo-950/20 transform group-hover:scale-[1.02] transition-transform duration-200">
            SD
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none tracking-tight">
              Skylark Drones
            </h1>
            <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
              BI Intelligence
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            Monday.com CRM & Work Order Operations Agent
          </p>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-2 text-xs">
        {/* Connection status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-[#111726] border border-slate-200/60 dark:border-slate-800/80 text-[10px] font-medium text-slate-600 dark:text-slate-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono">Monday.com & Groq SDK Connected</span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Toggle Theme (Dark / Light) */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-[#111726] hover:bg-slate-200/80 dark:hover:bg-[#171f33] border border-slate-200/60 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 focus-ring"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform hover:rotate-45" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
        </button>

        {/* Toggle KPI Bar */}
        <button
          type="button"
          onClick={onToggleKpi}
          title={showKpi ? "Hide KPI Dashboard" : "Show KPI Dashboard"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 focus-ring ${
            showKpi
              ? 'bg-slate-200/90 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold shadow-sm'
              : 'bg-slate-100/80 dark:bg-[#111726] border-slate-200/60 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-[#171f33]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">KPI Dashboard</span>
        </button>

        {/* Refresh KPI Data */}
        <button
          type="button"
          onClick={onRefreshKpi}
          disabled={isKpiLoading}
          title="Refresh Data Metrics"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-[#111726] hover:bg-slate-200/80 dark:hover:bg-[#171f33] border border-slate-200/60 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 disabled:opacity-40 focus-ring"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isKpiLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
        </button>

        {/* Clear Chat button */}
        <button
          type="button"
          onClick={onClearChat}
          title="Clear Conversation"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-[#111726] hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200/60 dark:border-slate-800/80 hover:border-red-200 dark:hover:border-red-900/30 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 focus-ring"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

export default Header;
