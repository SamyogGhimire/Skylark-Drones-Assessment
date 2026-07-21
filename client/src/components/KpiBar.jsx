import React from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Wallet, ArrowUpRight } from 'lucide-react';

function KpiBar({ kpiSummary, onMetricClick }) {
  if (!kpiSummary) return null;

  const metrics = [
    {
      id: 'pipeline',
      label: 'Active Pipeline',
      value: kpiSummary.pipeline?.formattedActivePipeline || '₹0',
      subtext: `${kpiSummary.pipeline?.activeDealsCount || 0} active deals`,
      icon: TrendingUp,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
      query: 'What is our current active pipeline breakdown by sector?',
    },
    {
      id: 'billed',
      label: 'Billed Revenue',
      value: kpiSummary.revenue?.formattedTotalBilled || '₹0',
      subtext: `Total invoiced to date`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
      query: 'Show revenue collected vs billed summary.',
    },
    {
      id: 'delayed',
      label: 'Delayed Projects',
      value: kpiSummary.risks?.delayedCount ?? 0,
      subtext: kpiSummary.risks?.delayedCount > 0 ? `${kpiSummary.risks.delayedCount} work orders overdue` : 'No operational risks',
      icon: AlertTriangle,
      iconBg: kpiSummary.risks?.delayedCount > 0 
        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40 animate-pulse-slow' 
        : 'bg-slate-50 dark:bg-[#111726] text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800/80',
      query: 'List all delayed work orders with client names and delivery dates.',
    },
    {
      id: 'collected',
      label: 'Collected Amount',
      value: kpiSummary.revenue?.formattedTotalCollected || '₹0',
      subtext: `Realized cashflow`,
      icon: Wallet,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40',
      query: 'What is our payment collection status and pending balance?',
    },
  ];

  return (
    <div className="bg-slate-100/50 dark:bg-[#080B11] border-b border-slate-200/60 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors animate-fade-in-up">
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onMetricClick && onMetricClick(item.query)}
              className="group text-left p-3.5 rounded-xl bg-white dark:bg-[#0c101b] hover:bg-slate-50/80 dark:hover:bg-[#111726] border border-slate-200/70 dark:border-slate-850 hover:border-indigo-200 dark:hover:border-indigo-500/20 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.015)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between focus-ring"
            >
              {/* Subtle hover gradient glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3.5 z-10">
                <span className="text-slate-400 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-350 transition-colors">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-center transition-colors duration-300 ${item.iconBg}`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 dark:text-slate-650 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all duration-300 transform translate-y-1 -translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0" />
                </div>
              </div>

              <div className="z-10">
                <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                  {item.value}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-450 transition-colors leading-relaxed">
                  {item.subtext}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default KpiBar;
