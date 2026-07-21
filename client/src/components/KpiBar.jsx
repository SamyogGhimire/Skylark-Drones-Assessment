import React from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Wallet, ArrowUpRight } from 'lucide-react';

function KpiBar({ kpiSummary, onMetricClick }) {
  if (!kpiSummary) return null;

  const metrics = [
    {
      id: 'pipeline',
      label: 'Active Pipeline',
      value: kpiSummary.pipeline?.formattedActivePipeline || '₹0',
      subtext: `${kpiSummary.pipeline?.activeDealsCount || 0} open deals`,
      icon: TrendingUp,
      iconBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
      query: 'What is our current active pipeline breakdown by sector?',
    },
    {
      id: 'billed',
      label: 'Billed Revenue',
      value: kpiSummary.revenue?.formattedTotalBilled || '₹0',
      subtext: `Total invoiced`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
      query: 'Show revenue collected vs billed summary.',
    },
    {
      id: 'delayed',
      label: 'Delayed Projects',
      value: kpiSummary.risks?.delayedCount ?? 0,
      subtext: `Work orders at risk`,
      icon: AlertTriangle,
      iconBg: kpiSummary.risks?.delayedCount > 0 
        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' 
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      query: 'List all delayed work orders with client names and delivery dates.',
    },
    {
      id: 'collected',
      label: 'Collected Amount',
      value: kpiSummary.revenue?.formattedTotalCollected || '₹0',
      subtext: `Realized cashflow`,
      icon: Wallet,
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
      query: 'What is our payment collection status and pending balance?',
    },
  ];

  return (
    <div className="bg-slate-100/70 dark:bg-[#0D121F] border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors animate-fade-in">
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onMetricClick && onMetricClick(item.query)}
              className="group text-left p-3 rounded-lg bg-white dark:bg-[#111728]/80 hover:bg-slate-50 dark:hover:bg-[#161f36] border border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all duration-150 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  {item.label}
                </span>
                <div className="flex items-center gap-1">
                  <span className={`p-1 rounded-md border text-[11px] ${item.iconBg}`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <div>
                <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
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
