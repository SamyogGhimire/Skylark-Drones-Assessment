const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parse } = require('csv-parse/sync');

// Monday.com GraphQL API Service & Fallback Data Loader

const MONDAY_API_URL = 'https://api.monday.com/v2';

//Fetch items from a Monday.com Board via GraphQL
async function fetchBoardFromMonday(boardId, apiKey) {
  if (!boardId || !apiKey || apiKey.includes('your_monday_api_key')) {
    throw new Error('Monday API key or Board ID not configured.');
  }

  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        id
        name
        items_page(limit: 500) {
          items {
            id
            name
            column_values {
              id
              column {
                title
              }
              text
              value
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    MONDAY_API_URL,
    {
      query,
      variables: { boardId: [boardId] },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'API-Version': '2023-10',
      },
      timeout: 10000,
    }
  );

  if (response.data.errors) {
    throw new Error(`Monday API GraphQL error: ${JSON.stringify(response.data.errors)}`);
  }

  const boards = response.data?.data?.boards;
  if (!boards || boards.length === 0) {
    throw new Error(`Board ID ${boardId} not found or inaccessible.`);
  }

  const items = boards[0].items_page?.items || [];
  
  // Transform GraphQL item column_values into object key-values
  return items.map((item) => {
    const row = { id: item.id, 'Deal Name': item.name, name: item.name };
    if (Array.isArray(item.column_values)) {
      item.column_values.forEach((col) => {
        const title = col.column?.title || col.title || '';
        if (title) {
          row[title] = col.text || col.value || '';
        }
      });
    }
    return row;
  });
}

/**
 * Read local CSV fallback data safely
 */
function readLocalCSV(filename, skipHeaderRows = 0) {
  const possiblePaths = [
    path.join(__dirname, '..', 'data', filename),
    path.join('/home/samyog-ghimire/Downloads', filename),
    path.join(process.cwd(), 'data', filename),
    path.join(process.cwd(), 'server', 'data', filename),
  ];

  let filePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    console.warn(`[mondayService] Warning: Could not find CSV file ${filename} in searched paths.`);
    return [];
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      from_line: skipHeaderRows + 1,
      relax_column_count: true,
    });
    return records;
  } catch (err) {
    console.error(`[mondayService] Error parsing CSV file ${filePath}:`, err.message);
    return [];
  }
}

/**
 * Get Deals Board Data (from Monday GraphQL or fallback CSV)
 */
async function getDealsData() {
  const apiKey = process.env.MONDAY_API_KEY;
  const boardId = process.env.DEALS_BOARD_ID;

  try {
    console.log('[mondayService] Attempting to fetch Deals from Monday.com GraphQL API...');
    const mondayData = await fetchBoardFromMonday(boardId, apiKey);
    console.log(`[mondayService] Successfully fetched ${mondayData.length} deals from Monday.com API.`);
    return { data: mondayData, source: 'monday.com' };
  } catch (err) {
    console.warn(`[mondayService] Monday API fetch fallback for Deals: ${err.message}`);
    const csvData = readLocalCSV('deals.csv', 0);
    console.log(`[mondayService] Loaded ${csvData.length} deal records from local dataset.`);
    return { data: csvData, source: 'local_csv', warning: err.message };
  }
}


// Get Work Orders Board Data (from Monday GraphQL or fallback CSV)
 
async function getWorkOrdersData() {
  const apiKey = process.env.MONDAY_API_KEY;
  const boardId = process.env.WORK_ORDERS_BOARD_ID;

  try {
    console.log('[mondayService] Attempting to fetch Work Orders from Monday.com GraphQL API...');
    const mondayData = await fetchBoardFromMonday(boardId, apiKey);
    console.log(`[mondayService] Successfully fetched ${mondayData.length} work orders from Monday.com API.`);
    return { data: mondayData, source: 'monday.com' };
  } catch (err) {
    console.warn(`[mondayService] Monday API fetch fallback for Work Orders: ${err.message}`);
    // Notice Work Orders CSV has an empty header row on line 1 in raw export
    const csvData = readLocalCSV('work_orders.csv', 1);
    console.log(`[mondayService] Loaded ${csvData.length} work order records from local dataset.`);
    return { data: csvData, source: 'local_csv', warning: err.message };
  }
}

module.exports = {
  fetchBoardFromMonday,
  getDealsData,
  getWorkOrdersData,
};
