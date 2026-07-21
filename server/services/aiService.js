let Groq;
try {
  Groq = require('groq-sdk');
} catch (err) {
  console.warn('[aiService] Failed to load Groq SDK:', err.message);
  Groq = null;
}

const { formatCurrency } = require('./cleaner');

/**
 * Groq AI Service for Monday.com Business Intelligence Agent
 * Powered by Groq LLaMA 3.3 70B (Fast & Free API)
 */

/**
 * Fallback response generator (when GROQ_API_KEY is not set or fails)
 */
function generateFallbackResponse(userMessage, analysis) {
  const { intent, targetSectors, pipelineMetrics, revenueMetrics, sectorMetrics, riskMetrics, sampleDeals, sampleWorkOrders } = analysis;

  if (intent === 'greeting') {
    return `Hello! How can I assist you with Skylark Drones business metrics today?

You can ask me about:
- **Active Pipeline & Deals** (*"What is our deal pipeline for powerline sector?"*)
- **Delayed Projects & Operational Risk** (*"Show me delayed work orders"*)
- **Revenue & Collections** (*"How much revenue have we collected vs billed?"*)
- **Sector Performance** (*"Which sector has the highest revenue?"*)
- **Leadership Overview** (*"Give me a full executive update"*)`;
  }

  if (intent === 'unknown') {
    return `I couldn't identify a specific metric or question in your query: "${userMessage}".

Please try asking a business question such as:
- *"What is our active pipeline value?"*
- *"Show me overdue or delayed work orders."*
- *"Which sector generates the most revenue?"*
- *"Give me a leadership summary."*`;
  }

  const sectorName = targetSectors.length > 0 ? targetSectors[0].toUpperCase() : null;

  if (sectorName) {
    const secDeals = sampleDeals;
    const secWOs = sampleWorkOrders;

    const secPipelineVal = secDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
    const secPOVal = secWOs.reduce((sum, wo) => sum + (wo.amountExclGst || 0), 0);
    const secBilledVal = secWOs.reduce((sum, wo) => sum + (wo.billedValueExclGst || 0), 0);

    return `### ${sectorName} Sector Overview

**Pipeline & Opportunities:**
- **Active Deals:** ${secDeals.length} deals valued at **${formatCurrency(secPipelineVal)}**.
- **Stage Distribution:** ${Object.entries(pipelineMetrics.stageBreakdown).map(([stg, data]) => `${stg} (${data.count})`).join(', ')}.

**Revenue & Fulfillment:**
- **Work Orders:** ${secWOs.length} work orders with total PO value of **${formatCurrency(secPOVal)}**.
- **Billed Amount:** **${formatCurrency(secBilledVal)}** (${secPOVal > 0 ? ((secBilledVal / secPOVal) * 100).toFixed(1) : 0}% of contract value).`;
  }

  if (intent === 'pipeline_analysis') {
    return `### Deal Pipeline Summary

- **Total Pipeline:** **${pipelineMetrics.formattedTotalPipeline}** across **${pipelineMetrics.totalDeals}** deals.
- **Active Pipeline:** **${pipelineMetrics.formattedActivePipeline}** (**${pipelineMetrics.activeDealsCount}** active opportunities).
- **Weighted Forecast:** **${pipelineMetrics.formattedWeightedPipeline}** (adjusted for closure probability).
- **Won Pipeline:** **${pipelineMetrics.formattedWonPipeline}** (${pipelineMetrics.wonDealsCount} deals closed/won).

**Top Pipeline Sectors:**
${sectorMetrics.sectors.slice(0, 3).map(s => `- **${s.name}**: **${s.formattedPipeline}** (${s.dealCount} deals)`).join('\n')}`;
  }

  if (intent === 'revenue_analysis') {
    return `### Revenue & Billing Execution Summary

- **Total PO Value:** **${revenueMetrics.formattedTotalPO}** across **${revenueMetrics.totalWorkOrders}** work orders.
- **Billed Value:** **${revenueMetrics.formattedTotalBilled}** (${revenueMetrics.billingEfficiencyPercent}% billing efficiency).
- **Collected Amount:** **${revenueMetrics.formattedTotalCollected}** (${revenueMetrics.collectionEfficiencyPercent}% collection efficiency).
- **Outstanding Receivables:** **${revenueMetrics.formattedTotalReceivable}**.
- **Unbilled Contract Amount:** **${revenueMetrics.formattedTotalToBeBilled}**.`;
  }

  if (intent === 'delayed_projects') {
    return `### Operational Risk & Delayed Projects

**Overdue Work Orders:** ${riskMetrics.delayedCount} projects past schedule:

${riskMetrics.delayedProjects.slice(0, 5).map((wo) => `- **${wo.dealName}** (${wo.sector}): End Date ${wo.endDate || 'N/A'}, Status: *${wo.executionStatus}*. PO Value: **${wo.formattedAmount}**`).join('\n')}

**Accounts Receivable & Invoicing:**
- **Priority Accounts:** ${riskMetrics.priorityCount} priority accounts with pending AR.
- **Completed Unbilled Work:** ${riskMetrics.unbilledCompletedCount} projects completed pending invoicing.`;
  }

  if (intent === 'sector_analysis') {
    return `### Sector Performance Summary

**Top Revenue Sectors:**
${sectorMetrics.sectors.slice(0, 5).map((s, i) => `${i + 1}. **${s.name}**: Pipeline: **${s.formattedPipeline}** (${s.dealCount} deals) | Billed: **${s.formattedBilledValue}** (${s.workOrderCount} WOs)`).join('\n')}

- **Leading Pipeline Sector:** **${sectorMetrics.topPipelineSector}**
- **Leading Revenue Sector:** **${sectorMetrics.topRevenueSector}**`;
  }

  if (intent === 'leadership_update') {
    return `### Executive Leadership Update

**1. Deal Pipeline Funnel:**
- **Total Pipeline:** **${pipelineMetrics.formattedTotalPipeline}** (${pipelineMetrics.totalDeals} deals).
- **Active Pipeline:** **${pipelineMetrics.formattedActivePipeline}** (${pipelineMetrics.activeDealsCount} active deals).
- **Weighted Value:** **${pipelineMetrics.formattedWeightedPipeline}**.

**2. Revenue & Billing Execution:**
- **Total PO Value:** **${revenueMetrics.formattedTotalPO}** across ${revenueMetrics.totalWorkOrders} work orders.
- **Billed Value:** **${revenueMetrics.formattedTotalBilled}** (${revenueMetrics.billingEfficiencyPercent}% billed).
- **Collected:** **${revenueMetrics.formattedTotalCollected}** (${revenueMetrics.collectionEfficiencyPercent}% collection rate).
- **Receivables:** **${revenueMetrics.formattedTotalReceivable}**.

**3. Key Action Items:**
- Resolve delays on ${riskMetrics.delayedCount} overdue work orders.
- Dispatch invoices for ${riskMetrics.unbilledCompletedCount} completed projects.`;
  }

  return `### Business Performance Overview

- **Active Pipeline:** **${pipelineMetrics.formattedActivePipeline}** across **${pipelineMetrics.activeDealsCount}** opportunities (Total: **${pipelineMetrics.formattedTotalPipeline}**).
- **Weighted Forecast:** **${pipelineMetrics.formattedWeightedPipeline}**.
- **Fulfilled Revenue:** **${revenueMetrics.formattedTotalBilled}** billed out of **${revenueMetrics.formattedTotalPO}** contract value.
- **Collections:** **${revenueMetrics.formattedTotalCollected}** collected, **${revenueMetrics.formattedTotalReceivable}** pending receivable.

**Top Sectors:**
${sectorMetrics.sectors.slice(0, 3).map(s => `- **${s.name}**: Pipeline ${s.formattedPipeline}, Billed ${s.formattedBilledValue}`).join('\n')}`;
}

/**
 * Generate AI Response using Groq API (LLaMA 3.3 70B) or Fallback
 */
async function generateAIResponse(userMessage, analysis) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!Groq || !apiKey || apiKey.includes('your_groq_api_key')) {
    console.log('[aiService] Groq API not available. Using built-in metric intelligence.');
    return generateFallbackResponse(userMessage, analysis);
  }

  try {
    const groq = new Groq({ apiKey });

    const systemPrompt = `You are a concise, professional Business Intelligence Assistant for Skylark Drones.

RULES:
1. Provide direct, objective, data-backed answers without AI fluff.
2. If the user prompt is random gibberish or nonsensical characters, inform the user clearly that you did not understand their query and suggest relevant business metrics they can ask about. Do NOT invent data or give default pipeline figures for gibberish.
3. Format financial figures clearly in INR (₹ Lakhs / ₹ Crores).
4. Use clean markdown formatting with simple headings and bullet points.

METRICS & DATA CONTEXT:
- Intent: ${analysis.intent}
- Target Sectors: ${analysis.targetSectors.join(', ') || 'All'}
- Pipeline: Total ${analysis.pipelineMetrics.formattedTotalPipeline} (${analysis.pipelineMetrics.totalDeals} deals), Active ${analysis.pipelineMetrics.formattedActivePipeline} (${analysis.pipelineMetrics.activeDealsCount} deals), Weighted ${analysis.pipelineMetrics.formattedWeightedPipeline}.
- Revenue: PO Value ${analysis.revenueMetrics.formattedTotalPO}, Billed ${analysis.revenueMetrics.formattedTotalBilled} (${analysis.revenueMetrics.billingEfficiencyPercent}%), Collected ${analysis.revenueMetrics.formattedTotalCollected}, Receivables ${analysis.revenueMetrics.formattedTotalReceivable}.
- Sectors: ${analysis.sectorMetrics.sectors.slice(0, 5).map(s => `${s.name} (Pipeline: ${s.formattedPipeline}, Billed: ${s.formattedBilledValue})`).join('; ')}.
- Operational Risks: ${analysis.riskMetrics.delayedCount} delayed projects, ${analysis.riskMetrics.priorityCount} priority AR accounts, ${analysis.riskMetrics.unbilledCompletedCount} completed unbilled projects.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const reply = completion.choices[0]?.message?.content;
    if (reply) return reply;

    throw new Error('Empty response from Groq API');
  } catch (err) {
    console.warn(`[aiService] Groq API call failed: ${err.message}. Falling back to metric intelligence.`);
    return generateFallbackResponse(userMessage, analysis);
  }
}

module.exports = {
  generateAIResponse,
  generateFallbackResponse,
};
