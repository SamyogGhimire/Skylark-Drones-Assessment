const express = require('express');
const router = express.Router();

const { getDealsData, getWorkOrdersData } = require('../services/mondayService');
const { cleanDealsData, cleanWorkOrdersData } = require('../services/cleaner');
const { analyzeQuestion, getLeadershipSummary } = require('../services/analysisService');
const { generateAIResponse } = require('../services/aiService');

/**
 * POST /api/chat
 * Primary conversation endpoint for executive AI queries
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Please provide a valid query message.' });
    }

    console.log(`[Chat Route] Processing user question: "${message}"`);

    // 1. Fetch raw board data concurrently (from Monday.com API or CSV fallbacks)
    const [dealsResult, workOrdersResult] = await Promise.all([
      getDealsData(),
      getWorkOrdersData(),
    ]);

    // 2. Clean & normalize data
    const cleanedDeals = cleanDealsData(dealsResult.data);
    const cleanedWorkOrders = cleanWorkOrdersData(workOrdersResult.data);

    // 3. Perform Business Intelligence analysis
    const analysis = analyzeQuestion(message, cleanedDeals, cleanedWorkOrders);

    // 4. Generate executive AI response (OpenAI or smart fallback)
    const answer = await generateAIResponse(message, analysis);

    return res.json({
      success: true,
      answer,
      intent: analysis.intent,
      sources: {
        deals: dealsResult.source,
        workOrders: workOrdersResult.source,
      },
      metrics: {
        pipeline: analysis.pipelineMetrics,
        revenue: analysis.revenueMetrics,
        risks: analysis.riskMetrics,
      },
    });
  } catch (err) {
    console.error('[Chat Route Error]:', err);
    return res.status(500).json({
      error: 'An internal server error occurred while processing your query.',
      details: err.message,
    });
  }
});

/**
 * GET /api/summary
 * Direct endpoint for leadership KPI dashboard cards
 */
router.get('/summary', async (req, res) => {
  try {
    const [dealsResult, workOrdersResult] = await Promise.all([
      getDealsData(),
      getWorkOrdersData(),
    ]);

    const cleanedDeals = cleanDealsData(dealsResult.data);
    const cleanedWorkOrders = cleanWorkOrdersData(workOrdersResult.data);

    const summary = getLeadershipSummary(cleanedDeals, cleanedWorkOrders);

    return res.json({
      success: true,
      summary,
      sources: {
        deals: dealsResult.source,
        workOrders: workOrdersResult.source,
      },
    });
  } catch (err) {
    console.error('[Summary Route Error]:', err);
    return res.status(500).json({ error: 'Failed to generate leadership summary.', details: err.message });
  }
});

module.exports = router;
