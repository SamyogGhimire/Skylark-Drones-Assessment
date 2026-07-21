const { formatCurrency } = require('./cleaner');

/**
 * Business Intelligence Analysis Service
 * Calculates key founder-level metrics across Deals & Work Orders boards.
 */

/**
 * Calculate Pipeline Health metrics from cleaned Deals
 */
function getPipelineHealth(deals) {
  if (!Array.isArray(deals) || deals.length === 0) {
    return { totalDeals: 0, totalPipelineValue: 0, activePipelineValue: 0 };
  }

  let totalValue = 0;
  let activeValue = 0;
  let wonValue = 0;
  let activeCount = 0;
  let wonCount = 0;

  const stageBreakdown = {};
  const sectorBreakdown = {};
  const probabilityBreakdown = { High: 0, Medium: 0, Low: 0, Unspecified: 0 };
  let weightedValue = 0;

  deals.forEach((deal) => {
    const val = deal.dealValue || 0;
    const stage = deal.stage || 'Unspecified';
    const sector = deal.sector || 'General';
    const prob = deal.closureProbability || 'Unspecified';

    totalValue += val;

    // Stage counts & values
    if (!stageBreakdown[stage]) {
      stageBreakdown[stage] = { count: 0, value: 0 };
    }
    stageBreakdown[stage].count += 1;
    stageBreakdown[stage].value += val;

    // Sector counts & values
    if (!sectorBreakdown[sector]) {
      sectorBreakdown[sector] = { count: 0, value: 0 };
    }
    sectorBreakdown[sector].count += 1;
    sectorBreakdown[sector].value += val;

    // Probability weights
    if (probabilityBreakdown[prob] !== undefined) {
      probabilityBreakdown[prob] += val;
    } else {
      probabilityBreakdown.Unspecified += val;
    }

    if (prob.toLowerCase() === 'high') weightedValue += val * 0.8;
    else if (prob.toLowerCase() === 'medium') weightedValue += val * 0.5;
    else if (prob.toLowerCase() === 'low') weightedValue += val * 0.2;
    else weightedValue += val * 0.3;

    // Active vs Won vs Hold vs Lost
    const isWon = stage.toLowerCase().includes('received') || stage.toLowerCase().includes('won');
    const isOnHold = stage.toLowerCase().includes('on hold') || deal.dealStatus.toLowerCase().includes('hold');
    const isLost = deal.dealStatus.toLowerCase().includes('lost');

    if (isWon) {
      wonValue += val;
      wonCount += 1;
    }

    if (!isLost && !isOnHold) {
      activeValue += val;
      activeCount += 1;
    }
  });

  return {
    totalDeals: deals.length,
    activeDealsCount: activeCount,
    wonDealsCount: wonCount,
    totalPipelineValue: totalValue,
    formattedTotalPipeline: formatCurrency(totalValue),
    activePipelineValue: activeValue,
    formattedActivePipeline: formatCurrency(activeValue),
    weightedPipelineValue: Math.round(weightedValue),
    formattedWeightedPipeline: formatCurrency(Math.round(weightedValue)),
    wonPipelineValue: wonValue,
    formattedWonPipeline: formatCurrency(wonValue),
    stageBreakdown,
    sectorBreakdown,
    probabilityBreakdown,
  };
}

/**
 * Calculate Revenue & Billing Analysis metrics from cleaned Work Orders
 */
function getRevenueAnalysis(workOrders) {
  if (!Array.isArray(workOrders) || workOrders.length === 0) {
    return { totalPOValue: 0, totalBilledValue: 0, totalCollectedAmount: 0 };
  }

  let totalPO = 0;
  let totalBilled = 0;
  let totalCollected = 0;
  let totalReceivable = 0;
  let totalToBeBilled = 0;

  const natureBreakdown = {};
  const statusBreakdown = {};

  workOrders.forEach((wo) => {
    const poVal = wo.amountExclGst || 0;
    const billedVal = wo.billedValueExclGst || 0;
    const collectedVal = wo.collectedAmount || 0;
    const recVal = wo.amountReceivable || 0;
    const unbilledVal = wo.amountToBeBilled || 0;
    const nature = wo.natureOfWork || 'One time Project';
    const invStatus = wo.invoiceStatus || 'Not Billed';

    totalPO += poVal;
    totalBilled += billedVal;
    totalCollected += collectedVal;
    totalReceivable += recVal;
    totalToBeBilled += unbilledVal;

    // Nature of work breakdown
    if (!natureBreakdown[nature]) {
      natureBreakdown[nature] = { count: 0, poValue: 0, billedValue: 0 };
    }
    natureBreakdown[nature].count += 1;
    natureBreakdown[nature].poValue += poVal;
    natureBreakdown[nature].billedValue += billedVal;

    // Invoice status breakdown
    if (!statusBreakdown[invStatus]) {
      statusBreakdown[invStatus] = { count: 0, value: 0 };
    }
    statusBreakdown[invStatus].count += 1;
    statusBreakdown[invStatus].value += poVal;
  });

  return {
    totalWorkOrders: workOrders.length,
    totalPOValue: totalPO,
    formattedTotalPO: formatCurrency(totalPO),
    totalBilledValue: totalBilled,
    formattedTotalBilled: formatCurrency(totalBilled),
    totalCollectedAmount: totalCollected,
    formattedTotalCollected: formatCurrency(totalCollected),
    totalReceivable: totalReceivable,
    formattedTotalReceivable: formatCurrency(totalReceivable),
    totalToBeBilled: totalToBeBilled,
    formattedTotalToBeBilled: formatCurrency(totalToBeBilled),
    billingEfficiencyPercent: totalPO > 0 ? ((totalBilled / totalPO) * 100).toFixed(1) : 0,
    collectionEfficiencyPercent: totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0,
    natureBreakdown,
    statusBreakdown,
  };
}

/**
 * Calculate Sector Performance across Deals & Work Orders
 */
function getSectorPerformance(deals, workOrders) {
  const sectors = {};

  const addSector = (name) => {
    const s = name || 'General';
    if (!sectors[s]) {
      sectors[s] = {
        name: s,
        dealCount: 0,
        dealPipelineValue: 0,
        workOrderCount: 0,
        workOrderPOValue: 0,
        workOrderBilledValue: 0,
        workOrderCollectedValue: 0,
      };
    }
    return sectors[s];
  };

  if (Array.isArray(deals)) {
    deals.forEach((d) => {
      const s = addSector(d.sector);
      s.dealCount += 1;
      s.dealPipelineValue += d.dealValue || 0;
    });
  }

  if (Array.isArray(workOrders)) {
    workOrders.forEach((wo) => {
      const s = addSector(wo.sector);
      s.workOrderCount += 1;
      s.workOrderPOValue += wo.amountExclGst || 0;
      s.workOrderBilledValue += wo.billedValueExclGst || 0;
      s.workOrderCollectedValue += wo.collectedAmount || 0;
    });
  }

  // Convert to array and sort by combined total value
  const sectorList = Object.values(sectors).map((s) => ({
    ...s,
    formattedPipeline: formatCurrency(s.dealPipelineValue),
    formattedPOValue: formatCurrency(s.workOrderPOValue),
    formattedBilledValue: formatCurrency(s.workOrderBilledValue),
    combinedValue: s.dealPipelineValue + s.workOrderPOValue,
  }));

  sectorList.sort((a, b) => b.combinedValue - a.combinedValue);

  const topPipelineSector = sectorList.length > 0 ? sectorList[0] : null;
  const topRevenueSector = [...sectorList].sort((a, b) => b.workOrderPOValue - a.workOrderPOValue)[0] || null;

  return {
    sectors: sectorList,
    topPipelineSector: topPipelineSector ? topPipelineSector.name : 'N/A',
    topRevenueSector: topRevenueSector ? topRevenueSector.name : 'N/A',
  };
}

/**
 * Filter Delayed & High Risk Projects
 */
function getDelayedProjects(workOrders) {
  if (!Array.isArray(workOrders)) return [];

  const today = new Date().toISOString().split('T')[0];

  const delayed = [];
  const priorityAR = [];
  const unbilledCompleted = [];

  workOrders.forEach((wo) => {
    const isCompleted = (wo.executionStatus || '').toLowerCase().includes('completed');
    const isExecutedMonth = (wo.executionStatus || '').toLowerCase().includes('executed until');
    const hasEnded = wo.endDate && wo.endDate < today;
    const deliveryOverdue = wo.dataDeliveryDate && wo.dataDeliveryDate < today && !isCompleted;

    if ((hasEnded && !isCompleted && !isExecutedMonth) || deliveryOverdue) {
      delayed.push({
        ...wo,
        delayReason: hasEnded ? 'Past Probable End Date' : 'Overdue Data Delivery',
      });
    }

    if ((wo.arPriority || '').toLowerCase().includes('priority') || wo.amountReceivable > 100000) {
      priorityAR.push(wo);
    }

    if (isCompleted && (wo.invoiceStatus || '').toLowerCase().includes('not billed')) {
      unbilledCompleted.push(wo);
    }
  });

  return {
    delayedProjects: delayed,
    delayedCount: delayed.length,
    priorityAccounts: priorityAR,
    priorityCount: priorityAR.length,
    unbilledCompletedProjects: unbilledCompleted,
    unbilledCompletedCount: unbilledCompleted.length,
  };
}

/**
 * Get Active Deals
 */
function getActiveDeals(deals) {
  if (!Array.isArray(deals)) return [];

  return deals.filter((d) => {
    const status = (d.dealStatus || '').toLowerCase();
    const stage = (d.stage || '').toLowerCase();
    return !status.includes('lost') && !stage.includes('on hold');
  });
}

/**
 * Get Quarterly / Closing Soon Pipeline
 */
function getQuarterlyPipeline(deals, targetSector = null) {
  if (!Array.isArray(deals)) return [];

  let filtered = deals.filter((d) => {
    const status = (d.dealStatus || '').toLowerCase();
    return !status.includes('lost');
  });

  if (targetSector) {
    const secLower = targetSector.toLowerCase();
    filtered = filtered.filter((d) => (d.sector || '').toLowerCase().includes(secLower));
  }

  // Sort by value descending
  filtered.sort((a, b) => (b.dealValue || 0) - (a.dealValue || 0));

  const totalValue = filtered.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

  return {
    deals: filtered,
    count: filtered.length,
    totalValue,
    formattedTotalValue: formatCurrency(totalValue),
  };
}

/**
 * Generate Leadership Summary KPIs
 */
function getLeadershipSummary(deals, workOrders) {
  const pipeline = getPipelineHealth(deals);
  const revenue = getRevenueAnalysis(workOrders);
  const sectorPerf = getSectorPerformance(deals, workOrders);
  const risks = getDelayedProjects(workOrders);

  return {
    pipeline,
    revenue,
    sectorPerf,
    risks,
  };
}

/**
 * Smart Question Classifier & Data Context Generator
 */
function analyzeQuestion(question, deals, workOrders) {
  const q = (question || '').toLowerCase();

  const pipelineMetrics = getPipelineHealth(deals);
  const revenueMetrics = getRevenueAnalysis(workOrders);
  const sectorMetrics = getSectorPerformance(deals, workOrders);
  const riskMetrics = getDelayedProjects(workOrders);

  let detectedIntent = 'unknown';
  let relevantSectors = [];

  const knownSectors = ['mining', 'powerline', 'renewables', 'dsp', 'railways', 'construction', 'tender'];
  knownSectors.forEach((sec) => {
    if (q.includes(sec)) relevantSectors.push(sec);
  });

  const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[\s!.]*$/i.test(q.trim());
  
  if (isGreeting) {
    detectedIntent = 'greeting';
  } else if (q.includes('delayed') || q.includes('delay') || q.includes('overdue') || q.includes('stuck') || q.includes('risk')) {
    detectedIntent = 'delayed_projects';
  } else if (q.includes('sector') || q.includes('highest revenue') || q.includes('top sector') || relevantSectors.length > 0) {
    detectedIntent = 'sector_analysis';
  } else if (q.includes('pipeline') || q.includes('quarter') || q.includes('closing') || q.includes('opportunities') || q.includes('deals')) {
    detectedIntent = 'pipeline_analysis';
  } else if (q.includes('revenue') || q.includes('billed') || q.includes('collection') || q.includes('po value') || q.includes('receivable') || q.includes('money') || q.includes('billing')) {
    detectedIntent = 'revenue_analysis';
  } else if (q.includes('leadership') || q.includes('executive') || q.includes('summary') || q.includes('update') || q.includes('founder') || q.includes('kpi') || q.includes('overview') || q.includes('performance') || q.includes('all')) {
    detectedIntent = 'leadership_update';
  } else if (q.includes('compare') || q.includes('workload') || q.includes('operations')) {
    detectedIntent = 'cross_board_comparison';
  }

  // Filter deals or work orders if specific sector mentioned
  let filteredDeals = deals;
  let filteredWorkOrders = workOrders;

  if (relevantSectors.length > 0) {
    const mainSec = relevantSectors[0];
    filteredDeals = deals.filter((d) => (d.sector || '').toLowerCase().includes(mainSec));
    filteredWorkOrders = workOrders.filter((wo) => (wo.sector || '').toLowerCase().includes(mainSec));
  }

  return {
    intent: detectedIntent,
    targetSectors: relevantSectors,
    pipelineMetrics,
    revenueMetrics,
    sectorMetrics,
    riskMetrics,
    sampleDeals: filteredDeals.slice(0, 10),
    sampleWorkOrders: filteredWorkOrders.slice(0, 10),
  };
}

module.exports = {
  getPipelineHealth,
  getRevenueAnalysis,
  getSectorPerformance,
  getDelayedProjects,
  getActiveDeals,
  getQuarterlyPipeline,
  getLeadershipSummary,
  analyzeQuestion,
};
