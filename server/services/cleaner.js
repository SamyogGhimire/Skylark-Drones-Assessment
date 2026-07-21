/**
 * Data Cleaning & Normalization Service
 * Handles missing values, inconsistent dates, text normalization, and currency formatting.
 */

function cleanNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleanedStr = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleanedStr);
  return isNaN(parsed) ? 0 : parsed;
}

function cleanString(val, defaultVal = 'Unspecified') {
  if (val === null || val === undefined) return defaultVal;
  const str = String(val).trim();
  return str === '' ? defaultVal : str;
}

function cleanDate(val) {
  if (!val || val === '' || val === 'Unspecified') return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val).trim();
  return d.toISOString().split('T')[0];
}

function formatCurrency(amount) {
  const num = cleanNumber(amount);
  if (num === 0) return '₹0';
  
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakhs`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

function cleanDealsData(rawDeals) {
  if (!Array.isArray(rawDeals)) return [];

  return rawDeals.map((item, idx) => {
    // Handle both GraphQL items structure & CSV row object structure
    const getVal = (fieldNames) => {
      for (const name of fieldNames) {
        if (item[name] !== undefined && item[name] !== null) return item[name];
      }
      return null;
    };

    const dealName = cleanString(getVal(['Deal Name', 'dealName', 'name', 'title']), `Deal #${idx + 1}`);
    const owner = cleanString(getVal(['Owner code', 'owner', 'Owner']), 'Unassigned');
    const client = cleanString(getVal(['Client Code', 'client', 'Customer']), 'Unknown Client');
    const dealStatus = cleanString(getVal(['Deal Status', 'status', 'DealStatus']), 'Open');
    const closeDate = cleanDate(getVal(['Close Date (A)', 'closeDate', 'Close Date']));
    const closureProbability = cleanString(getVal(['Closure Probability', 'probability', 'Probability']), 'Medium');
    const dealValue = cleanNumber(getVal(['Masked Deal value', 'dealValue', 'Deal Value', 'value']));
    const tentativeCloseDate = cleanDate(getVal(['Tentative Close Date', 'tentativeCloseDate']));
    const stage = cleanString(getVal(['Deal Stage', 'stage', 'Stage']), 'Unspecified Stage');
    const product = cleanString(getVal(['Product deal', 'product', 'Product']), 'Services');
    const sector = cleanString(getVal(['Sector/service', 'sector', 'Sector']), 'General');
    const createdDate = cleanDate(getVal(['Created Date', 'createdDate']));

    return {
      id: item.id || `deal-${idx + 1}`,
      dealName,
      owner,
      client,
      dealStatus,
      closeDate,
      closureProbability,
      dealValue,
      formattedDealValue: formatCurrency(dealValue),
      tentativeCloseDate,
      stage,
      product,
      sector,
      createdDate,
    };
  });
}

function cleanWorkOrdersData(rawWorkOrders) {
  if (!Array.isArray(rawWorkOrders)) return [];

  return rawWorkOrders.map((item, idx) => {
    const getVal = (fieldNames) => {
      for (const name of fieldNames) {
        if (item[name] !== undefined && item[name] !== null) return item[name];
      }
      return null;
    };

    const dealName = cleanString(getVal(['Deal name masked', 'dealName', 'name', 'Project Name']), `WO #${idx + 1}`);
    const client = cleanString(getVal(['Customer Name Code', 'client', 'Customer']), 'Unknown Client');
    const serialNo = cleanString(getVal(['Serial #', 'serialNo']), `SDPL-${idx + 1}`);
    const natureOfWork = cleanString(getVal(['Nature of Work', 'natureOfWork']), 'One time Project');
    const executionStatus = cleanString(getVal(['Execution Status', 'executionStatus', 'Status']), 'Not Started');
    const dataDeliveryDate = cleanDate(getVal(['Data Delivery Date', 'dataDeliveryDate']));
    const poDate = cleanDate(getVal(['Date of PO/LOI', 'poDate']));
    const docType = cleanString(getVal(['Document Type', 'docType']), 'Purchase Order');
    const startDate = cleanDate(getVal(['Probable Start Date', 'startDate', 'Start Date']));
    const endDate = cleanDate(getVal(['Probable End Date', 'endDate', 'End Date']));
    const owner = cleanString(getVal(['BD/KAM Personnel code', 'owner', 'Owner']), 'Unassigned');
    const sector = cleanString(getVal(['Sector', 'sector']), 'General');
    const typeOfWork = cleanString(getVal(['Type of Work', 'typeOfWork']), 'Standard');
    const platform = cleanString(getVal(['Is any Skylark software platform part of the client deliverables in this deal?', 'platform']), 'NONE');
    const lastInvoiceDate = cleanDate(getVal(['Last invoice date', 'lastInvoiceDate']));
    
    const amountExclGst = cleanNumber(getVal(['Amount in Rupees (Excl of GST) (Masked)', 'amountExclGst', 'Revenue']));
    const amountInclGst = cleanNumber(getVal(['Amount in Rupees (Incl of GST) (Masked)', 'amountInclGst']));
    const billedValueExclGst = cleanNumber(getVal(['Billed Value in Rupees (Excl of GST.) (Masked)', 'billedValueExclGst']));
    const billedValueInclGst = cleanNumber(getVal(['Billed Value in Rupees (Incl of GST.) (Masked)', 'billedValueInclGst']));
    const collectedAmount = cleanNumber(getVal(['Collected Amount in Rupees (Incl of GST.) (Masked)', 'collectedAmount']));
    const amountToBeBilled = cleanNumber(getVal(['Amount to be billed in Rs. (Exl. of GST) (Masked)', 'amountToBeBilled']));
    const amountReceivable = cleanNumber(getVal(['Amount Receivable (Masked)', 'amountReceivable']));
    
    const arPriority = cleanString(getVal(['AR Priority account', 'arPriority']), 'Normal');
    const invoiceStatus = cleanString(getVal(['Invoice Status', 'invoiceStatus']), 'Not Billed');
    const woStatus = cleanString(getVal(['WO Status (billed)', 'woStatus']), 'Open');
    const billingStatus = cleanString(getVal(['Billing Status', 'billingStatus']), 'Open');

    return {
      id: item.id || `wo-${idx + 1}`,
      dealName,
      client,
      serialNo,
      natureOfWork,
      executionStatus,
      dataDeliveryDate,
      poDate,
      docType,
      startDate,
      endDate,
      owner,
      sector,
      typeOfWork,
      platform,
      lastInvoiceDate,
      amountExclGst,
      formattedAmount: formatCurrency(amountExclGst),
      amountInclGst,
      billedValueExclGst,
      formattedBilledValue: formatCurrency(billedValueExclGst),
      billedValueInclGst,
      collectedAmount,
      formattedCollectedAmount: formatCurrency(collectedAmount),
      amountToBeBilled,
      amountReceivable,
      formattedAmountReceivable: formatCurrency(amountReceivable),
      arPriority,
      invoiceStatus,
      woStatus,
      billingStatus,
    };
  });
}

module.exports = {
  cleanNumber,
  cleanString,
  cleanDate,
  formatCurrency,
  cleanDealsData,
  cleanWorkOrdersData,
};
