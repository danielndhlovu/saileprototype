// ============================================================================
// Saile Platform v2 — Screen 08: RBM Reports & Analytics
// ============================================================================

/**
 * Render the Reports module with RBM-compliant report generation.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderReports(container, options) {
  var role = options && options.role;
  var readOnly = options && options.readOnly;
  var loans = getCollection(StorageKeys.LOANS) || [];
  var products = getCollection(StorageKeys.PRODUCTS) || [];
  var branches = getCollection(StorageKeys.BRANCHES) || [];
  var clients = getCollection(StorageKeys.CLIENTS) || [];
  var vouchers = getCollection(StorageKeys.VOUCHERS) || [];
  var savingsAccounts = getCollection(StorageKeys.SAVINGS_ACCOUNTS) || [];

  var html = '<div class="space-y-6">';

  // Header
  html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
  html += '<div>';
  html += '<h1 class="text-lg font-semibold text-[#1E3A8A]">RBM Reports & Analytics</h1>';
  html += '<p class="text-sm text-[#6B7280]">Reserve Bank of Malawi — NDMFI 017/22 Compliance Reports</p>';
  html += '</div>';
  html += '<div class="flex gap-3">';
  html += '<button id="btn-rbm-summary" class="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl hover:bg-[#134e4a] font-medium text-sm">📊 Summary Dashboard</button>';
  html += '<button id="btn-rbm-all" class="bg-[#1F2937] text-white px-4 py-2 rounded-xl hover:bg-[#152C5B] font-medium text-sm">📄 Generate All Reports</button>';
  html += '</div>';
  html += '</div>';

  // Portfolio Summary at top
  html += renderPortfolioSummary(loans, products, branches, clients, vouchers, savingsAccounts);

  // Report Selection Grid
  html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';

  var reports = [
    { code: 'RBM-001', name: 'Statement of Financial Position', freq: 'Quarterly', icon: '🏦', desc: 'Assets, liabilities, and equity by category' },
    { code: 'RBM-002', name: 'Statement of Comprehensive Income', freq: 'Quarterly', icon: '📈', desc: 'Revenue, expenses, and net income' },
    { code: 'RBM-003', name: 'Loan Portfolio Report', freq: 'Quarterly', icon: '💰', desc: 'Portfolio by product, branch, PAR, provisions' },
    { code: 'RBM-004', name: 'Savings & Deposits Report', freq: 'Quarterly', icon: '🏛️', desc: 'Deposit balances by type and branch' },
    { code: 'RBM-005', name: 'Capital Adequacy Report', freq: 'Quarterly', icon: '📊', desc: 'Capital, risk-weighted assets, ratio' },
    { code: 'RBM-006', name: 'Liquidity Report', freq: 'Quarterly', icon: '💧', desc: 'Cash, liquid assets, short-term liabilities' },
    { code: 'RBM-007', name: 'Large Exposures Report', freq: 'Quarterly', icon: '🔍', desc: 'Loans > 10% of capital, concentrations' },
    { code: 'RBM-008', name: 'Governance & Operations Report', freq: 'Quarterly', icon: '🏛️', desc: 'Board changes, staff, branches, policies' }
  ];

  reports.forEach(function(r) {
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5 hover:shadow-md transition-shadow">';
    html += '<div class="flex items-start justify-between">';
    html += '<div class="flex items-center gap-3">';
    html += '<div class="text-3xl">' + r.icon + '</div>';
    html += '<div>';
    html += '<h3 class="text-sm font-semibold text-[#1E3A8A]">' + r.code + ' — ' + r.name + '</h3>';
    html += '<p class="text-xs text-[#6B7280] mt-1">' + r.desc + '</p>';
    html += '<p class="text-xs text-[#9ca3af] mt-1">Frequency: ' + r.freq + '</p>';
    html += '</div>';
    html += '</div>';
    html += '<button class="generate-rbm-report bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#134e4a]" data-code="' + r.code + '">Generate</button>';
    html += '</div>';
    html += '</div>';
  });

  html += '</div>';

  // Preview Area
  html += '<div id="report-preview-area" class="hidden">';
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<div class="flex items-center justify-between mb-4">';
  html += '<h3 id="report-preview-title" class="text-base font-semibold text-[#1E3A8A]"></h3>';
  html += '<div class="space-x-2">';
  html += '<button id="btn-export-excel" class="bg-[#059669] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#059669]">📊 Export Excel</button>';
  html += '<button id="btn-export-pdf" class="bg-[#1F2937] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#152C5B]">📄 Export PDF</button>';
  html += '<button id="btn-close-preview" class="bg-white border border-[#d1d5db] text-[#6B7280] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#f4f4f5]">✕ Close</button>';
  html += '</div></div>';
  html += '<div id="report-preview-content" class="text-sm"></div>';
  html += '</div></div>';

  html += '</div>';

  container.innerHTML = html;

  // Event Listeners
  document.getElementById('btn-rbm-summary').addEventListener('click', function() {
    showReportPreview('Portfolio Summary', renderSummaryReport(loans, products, branches, clients, vouchers, savingsAccounts));
  });

  document.getElementById('btn-rbm-all').addEventListener('click', function() {
    showAppToast('Generating all 8 RBM reports... (Demo mode: simulating)', 'success');
  });

  container.querySelectorAll('.generate-rbm-report').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var code = this.getAttribute('data-code');
      generateRBMSpecificReport(code, loans, products, branches, clients, vouchers, savingsAccounts);
    });
  });

  document.getElementById('btn-close-preview').addEventListener('click', function() {
    document.getElementById('report-preview-area').classList.add('hidden');
  });

  document.getElementById('btn-export-excel').addEventListener('click', function() {
    showAppToast('Exporting to Excel... (Demo mode: simulated)', 'success');
  });

  document.getElementById('btn-export-pdf').addEventListener('click', function() {
    showAppToast('Exporting to PDF... (Demo mode: simulated)', 'success');
  });
}

function renderPortfolioSummary(loans, products, branches, clients, vouchers, savingsAccounts) {
  var activeLoans = loans.filter(function(l) {
    return l.status === 'Active' || l.status === 'Disbursed' || l.status === 'Approved';
  });

  var totalPortfolio = 0;
  activeLoans.forEach(function(l) { totalPortfolio += (l.approvedAmount || 0); });

  var totalDisbursed = 0;
  loans.filter(function(l) { return l.status === 'Active' || l.status === 'Disbursed'; }).forEach(function(l) {
    totalDisbursed += (l.approvedAmount || 0);
  });

  var par1_30_amt = 0, par31_60_amt = 0, par61_90_amt = 0, par90plus_amt = 0;
  activeLoans.forEach(function(l) {
    var due = getOverdueDays(l);
    var principal = l.approvedAmount || 0;
    if (due > 90) par90plus_amt += principal;
    else if (due > 60) par61_90_amt += principal;
    else if (due > 30) par31_60_amt += principal;
    else if (due > 0) par1_30_amt += principal;
  });

  var totalCollections = 0;
  (getCollection(StorageKeys.COLLECTIONS) || []).forEach(function(c) { totalCollections += c.collectedAmount; });

  var totalSavings = 0;
  savingsAccounts.forEach(function(sa) { totalSavings += sa.balance; });

  var provisioning = calculateProvisions(activeLoans);

  var html = '<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">';
  html += statCard('Total Portfolio', formatCurrency(totalPortfolio), activeLoans.length + ' loans', '#1E3A8A');
  html += statCard('Total Disbursed', formatCurrency(totalDisbursed), loans.filter(function(l){return l.status==='Disbursed'||l.status==='Active'}).length + ' active', '#1F2937');
  html += statCard('Collections (MTD)', formatCurrency(totalCollections), loans.length + ' total apps', '#059669');
  html += statCard('Total Savings', formatCurrency(totalSavings), savingsAccounts.length + ' accounts', '#D97706');
  html += '</div>';

  // PAR Summary
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4 mb-6">';
  html += '<h4 class="text-sm font-semibold text-[#1E3A8A] mb-3">PAR Analysis</h4>';
  html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3">';
  var totalPAR = par1_30_amt + par31_60_amt + par61_90_amt + par90plus_amt;
  html += parStatCard('PAR 1-30 Days', par1_30_amt, totalPortfolio, '#D97706', 5);
  html += parStatCard('PAR 31-60 Days', par31_60_amt, totalPortfolio, '#F97316', 3);
  html += parStatCard('PAR 61-90 Days', par61_90_amt, totalPortfolio, '#dc2626', 2);
  html += parStatCard('PAR 90+ Days', par90plus_amt, totalPortfolio, '#7F1D1D', 1);
  html += '</div>';
  html += '</div>';

  // Branch summary
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4 mb-6">';
  html += '<h4 class="text-sm font-semibold text-[#1E3A8A] mb-3">Branch Portfolio Summary</h4>';
  html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
  html += '<thead class="bg-[#f9fafb]"><tr><th class="text-left px-3 py-2">Branch</th><th class="text-right px-3 py-2">Portfolio</th><th class="text-right px-3 py-2">Clients</th><th class="text-right px-3 py-2">Loans</th><th class="text-right px-3 py-2">Share</th></tr></thead><tbody>';
  branches.forEach(function(b, idx) {
    var bActiveLoans = activeLoans.filter(function(l) { return l.branchId === b.id; });
    var bPort = 0;
    bActiveLoans.forEach(function(l) { bPort += (l.approvedAmount || 0); });
    var bClients = clients.filter(function(c) { return c.branchId === b.id && c.status === 'Active'; }).length;
    var share = totalPortfolio > 0 ? (bPort / totalPortfolio * 100).toFixed(1) : 0;
    var isMzuzu = b.branchCode === 'MZE' || b.branchCode === 'MZB';
    html += '<tr class="border-b border-[#d1d5db]' + (isMzuzu ? ' bg-[#F5F6FA]' : '') + '">';
    html += '<td class="px-3 py-2 font-medium text-[#1E3A8A]' + (isMzuzu ? ' text-[#1E3A8A]' : '') + '">' + escapeHtml(b.branchName) + (isMzuzu ? ' <span class="text-xs text-[#1F2937] font-semibold">*Saile Twin Branch</span>' : '') + '</td>';
    html += '<td class="px-3 py-2 text-right font-semibold">' + formatCurrency(bPort) + '</td>';
    html += '<td class="px-3 py-2 text-right">' + bClients + '</td>';
    html += '<td class="px-3 py-2 text-right">' + bActiveLoans.length + '</td>';
    html += '<td class="px-3 py-2 text-right text-[#D97706] font-semibold">' + share + '%</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';

  // Product breakdown
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
  html += '<h4 class="text-sm font-semibold text-[#1E3A8A] mb-3">Loan Product Breakdown</h4>';
  html += '<div class="space-y-2">';
  products.forEach(function(p) {
    var prodLoans = activeLoans.filter(function(l) { return l.productId === p.id; });
    var prodAmt = 0;
    prodLoans.forEach(function(l) { prodAmt += (l.approvedAmount || 0); });
    var share = totalPortfolio > 0 ? (prodAmt / totalPortfolio * 100).toFixed(1) : 0;
    var sigStyle = p.isSignatureProduct ? 'border-2 border-[#D97706] bg-[#FFFBEB]' : '';
    html += '<div class="flex items-center justify-between p-2 rounded-lg ' + sigStyle + '">';
    html += '<div>';
    html += '<span class="text-sm font-medium text-[#1E3A8A]">' + escapeHtml(p.productCode) + ' - ' + escapeHtml(p.productName) + '</span>';
    if (p.isSignatureProduct) html += ' <span class="text-xs bg-[#D97706] text-[#92400E] px-1.5 py-0.5 rounded">⭐ SIGNATURE</span>';
    html += '</div>';
    html += '<div class="text-right">';
    html += '<div class="text-sm font-semibold text-[#1E3A8A]">' + formatCurrency(prodAmt) + '</div>';
    html += '<div class="text-xs text-[#6B7280]">' + prodLoans.length + ' loans (' + share + '%)</div>';
    html += '</div></div>';
  });
  html += '</div></div>';

  return html;
}

function statCard(label, value, sub, color) {
  return '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">' +
    '<div class="text-xs text-[#6B7280] uppercase tracking-wide">' + label + '</div>' +
    '<div class="text-xl font-bold" style="color:' + color + ';margin-top:2px;">' + value + '</div>' +
    '<div class="text-xs text-[#9ca3af] mt-1">' + sub + '</div>' +
  '</div>';
}

function parStatCard(label, amount, total, color, threshold) {
  var pct = total > 0 ? (amount / total * 100).toFixed(1) : 0;
  var overThreshold = parseFloat(pct) > threshold;
  return '<div class="bg-white rounded-xl border p-3 text-center ' + (overThreshold ? 'border-' + color.replace('#', '') : 'border-[#d1d5db]') + '">' +
    '<div class="text-xs text-[#6B7280]">' + label + '</div>' +
    '<div class="text-lg font-bold" style="color:' + color + '">' + formatCurrency(amount) + '</div>' +
    '<div class="text-xs ' + (overThreshold ? 'text-[#DC2626] font-semibold' : 'text-[#6B7280]') + '">' + pct + '% of portfolio' + (overThreshold ? ' ⚠️' : '') + '</div>' +
  '</div>';
}

function renderSummaryReport(loans, products, branches, clients, vouchers, savingsAccounts) {
  var activeLoans = loans.filter(function(l) { return l.status === 'Active' || l.status === 'Disbursed' || l.status === 'Approved'; });
  var totalPortfolio = 0;
  activeLoans.forEach(function(l) { totalPortfolio += (l.approvedAmount || 0); });

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4 mb-4">';
  html += '<div class="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>';
  html += '<div><h2 class="text-lg font-bold text-[#1E3A8A]">Saile Financial Services</h2><p class="text-xs text-[#6B7280]">NDMFI 017/22 — Portfolio Summary Report</p></div>';
  html += '<div class="ml-auto text-xs text-[#6B7280]">' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) + '</div>';
  html += '</div>';

  // KPI Row
  html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
  html += statCard('Total Portfolio', formatCurrency(totalPortfolio), activeLoans.length + ' active loans', '#1E3A8A');
  html += statCard('Active Clients', String(clients.filter(function(c){return c.status==='Active'}).length), String(clients.length) + ' registered', '#1F2937');
  html += statCard('Branches', String(branches.length), '6 locations', '#059669');
  html += statCard('Loan Products', String(products.length), 'All active', '#D97706');
  html += '</div>';

  // Branch breakdown table
  html += '<h3 class="text-sm font-semibold text-[#1E3A8A] mt-6 mb-3">Branch Portfolio Breakdown</h3>';
  html += '<div class="overflow-x-auto"><table class="w-full text-sm border-collapse">';
  html += '<thead class="bg-[#F9FAFB]"><tr><th class="px-3 py-2 text-left border-b">Branch</th><th class="px-3 py-2 text-right border-b">Portfolio</th><th class="px-3 py-2 text-right border-b">Clients</th><th class="px-3 py-2 text-right border-b">Loans</th><th class="px-3 py-2 text-right border-b">Share</th></tr></thead><tbody>';

  var totals = { portfolio: 0, clients: 0, loans: 0 };
  branches.forEach(function(b) {
    var bActiveLoans = activeLoans.filter(function(l) { return l.branchId === b.id; });
    var bPort = 0; bActiveLoans.forEach(function(l) { bPort += (l.approvedAmount || 0); });
    var bClients = clients.filter(function(c) { return c.branchId === b.id && c.status === 'Active'; }).length;
    var share = totalPortfolio > 0 ? (bPort / totalPortfolio * 100).toFixed(1) : 0;
    totals.portfolio += bPort; totals.clients += bClients; totals.loans += bActiveLoans.length;
    html += '<tr><td class="px-3 py-1 border-b text-[#1E3A8A]">' + escapeHtml(b.branchName) + '</td><td class="px-3 py-1 border-b text-right font-semibold">' + formatCurrency(bPort) + '</td><td class="px-3 py-1 border-b text-right">' + bClients + '</td><td class="px-3 py-1 border-b text-right">' + bActiveLoans.length + '</td><td class="px-3 py-1 border-b text-right text-[#D97706] font-semibold">' + share + '%</td></tr>';
  });
  var totalShare = totalPortfolio > 0 ? (totals.portfolio / totalPortfolio * 100).toFixed(1) : 0;
  html += '<tr class="font-bold"><td class="px-3 py-2 border-t border-[#1E3A8A] text-[#1E3A8A]">TOTAL</td><td class="px-3 py-2 border-t border-[#1E3A8A] text-right">' + formatCurrency(totals.portfolio) + '</td><td class="px-3 py-2 border-t border-[#1E3A8A] text-right">' + totals.clients + '</td><td class="px-3 py-2 border-t border-[#1E3A8A] text-right">' + totals.loans + '</td><td class="px-3 py-2 border-t border-[#1E3A8A] text-right text-[#1E3A8A]">' + totalShare + '%</td></tr>';
  html += '</tbody></table></div>';

  html += '</div>';
  return html;
}

function generateRBMSpecificReport(code, loans, products, branches, clients, vouchers, savingsAccounts) {
  showAppToast('Generating ' + code + '...', 'success');

  var activeLoans = loans.filter(function(l) {
    return l.status === 'Active' || l.status === 'Disbursed' || l.status === 'Approved';
  });
  var totalPortfolio = 0;
  activeLoans.forEach(function(l) { totalPortfolio += (l.approvedAmount || 0); });

  var title = '', content = '';
  var now = new Date();
  var quarter = 'Q' + Math.ceil((now.getMonth()+1)/3) + ' ' + now.getFullYear();

  switch(code) {
    case 'RBM-001':
      title = 'Statement of Financial Position — ' + quarter;
      var totalAssets = totalPortfolio + getValue(StorageKeys.CASH_BALANCE) + (savingsAccounts.reduce(function(s,a){return s+a.balance;},0));
      var totalLiabilities = totalPortfolio;
      var equity = getValue(StorageKeys.CASH_BALANCE) || 0;
      content = '<table class="w-full text-sm"><tr class="font-bold"><td class="py-1 border-b">ASSETS</td><td class="py-1 border-b text-right"></td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Loan Portfolio</td><td class="py-1 text-right">' + formatCurrency(totalPortfolio) + '</td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Cash & Cash Equivalents</td><td class="py-1 text-right">' + formatCurrency(getValue(StorageKeys.CASH_BALANCE)) + '</td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Savings Deposits</td><td class="py-1 text-right">' + formatCurrency(savingsAccounts.reduce(function(s,a){return s+a.balance;},0)) + '</td></tr>';
      content += '<tr class="font-bold"><td class="py-2 border-t border-[#1E3A8A]">TOTAL ASSETS</td><td class="py-2 border-t border-[#1E3A8A] text-right">' + formatCurrency(totalAssets) + '</td></tr>';
      content += '<tr class="font-bold mt-4"><td class="py-1 border-b">LIABILITIES & EQUITY</td><td class="py-1 border-b text-right"></td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Customer Deposits (Liability)</td><td class="py-1 text-right">' + formatCurrency(savingsAccounts.reduce(function(s,a){return s+a.balance;},0)) + '</td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Share Capital & Reserves</td><td class="py-1 text-right">' + formatCurrency(equity) + '</td></tr>';
      content += '<tr class="font-bold"><td class="py-2 border-t border-[#1E3A8A]">TOTAL LIABILITIES & EQUITY</td><td class="py-2 border-t border-[#1E3A8A] text-right">' + formatCurrency(totalLiabilities + equity) + '</td></tr>';
      content += '</table>';
      break;

    case 'RBM-002':
      title = 'Statement of Comprehensive Income — ' + quarter;
      var totalInterest = 0;
      vouchers.filter(function(v) { return v.voucherType === 'credit' && v.description.indexOf('Interest') !== -1; }).forEach(function(v) { totalInterest += v.amount; });
      var totalExpenses = vouchers.filter(function(v) { return v.voucherType === 'credit' && v.description.indexOf('Expenses') !== -1; }).reduce(function(s,v){return s+v.amount;},0);
      var feeIncome = vouchers.filter(function(v) { return v.description && v.description.indexOf('fee') !== -1; }).reduce(function(s,v){return s+v.amount;},0);
      content = '<table class="w-full text-sm"><tr class="font-bold"><td class="py-1 border-b">REVENUE</td><td class="py-1 border-b text-right"></td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Interest Income</td><td class="py-1 text-right">' + formatCurrency(totalInterest) + '</td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Fee Income</td><td class="py-1 text-right">' + formatCurrency(feeIncome) + '</td></tr>';
      content += '<tr class="font-bold"><td class="py-2">TOTAL REVENUE</td><td class="py-2 text-right">' + formatCurrency(totalInterest + feeIncome) + '</td></tr>';
      content += '<tr class="font-bold mt-4"><td class="py-1 border-b">EXPENSES</td><td class="py-1 border-b text-right"></td></tr>';
      content += '<tr><td class="py-1 pl-4 text-[#6B7280]">Operating Expenses</td><td class="py-1 text-right">' + formatCurrency(totalExpenses) + '</td></tr>';
      content += '<tr class="font-bold"><td class="py-2 border-t border-[#1E3A8A]">NET INCOME</td><td class="py-2 border-t border-[#1E3A8A] text-right font-bold text-[#059669]">' + formatCurrency(totalInterest + feeIncome - totalExpenses) + '</td></tr>';
      content += '</table>';
      break;

    case 'RBM-003':
      title = 'Loan Portfolio Report — ' + quarter;
      content = '<div class="space-y-4">';
      content += '<h4 class="text-sm font-semibold">Loan Portfolio by Product</h4>';
      content += '<div class="overflow-x-auto"><table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">Product Code</th><th class="px-2 py-1 text-left">Product Name</th><th class="px-2 py-1 text-right">Disbursed Amt</th><th class="px-2 py-1 text-right">No. of Loans</th><th class="px-2 py-1 text-right">PAR 1-30</th><th class="px-2 py-1 text-right">PAR 31-60</th><th class="px-2 py-1 text-right">Interest Method</th></tr>';
      products.forEach(function(p) {
        var pLoans = activeLoans.filter(function(l) { return l.productId === p.id; });
        var pAmt = 0;
        pLoans.forEach(function(l) { pAmt += (l.approvedAmount || 0); });
        var par1 = pLoans.filter(function(l) { return getOverdueDays(l) > 0 && getOverdueDays(l) <= 30; }).reduce(function(s,l){return s+(l.approvedAmount||0);},0);
        var par2 = pLoans.filter(function(l) { return getOverdueDays(l) > 30 && getOverdueDays(l) <= 60; }).reduce(function(s,l){return s+(l.approvedAmount||0);},0);
        content += '<tr class="border-b"><td class="px-2 py-1 font-semibold">' + escapeHtml(p.productCode) + '</td><td class="px-2 py-1">' + escapeHtml(p.productName) + '</td><td class="px-2 py-1 text-right">' + formatCurrency(pAmt) + '</td><td class="px-2 py-1 text-right">' + pLoans.length + '</td><td class="px-2 py-1 text-right text-[#DC2626]">' + formatCurrency(par1) + '</td><td class="px-2 py-1 text-right text-[#DC2626]">' + formatCurrency(par2) + '</td><td class="px-2 py-1 text-right">' + (p.interestMethod === 'flat' ? 'Flat' : 'Reducing Bal.') + '</td></tr>';
      });
      content += '</table></div>';

      // PAR breakdown
      content += '<h4 class="text-sm font-semibold mt-4">Portfolio at Risk Summary</h4>';
      var par1_30_tot = activeLoans.filter(function(l){return getOverdueDays(l)>0 && getOverdueDays(l)<=30;}).reduce(function(s,l){return s+(l.approvedAmount||0);},0);
      var par31_60_tot = activeLoans.filter(function(l){return getOverdueDays(l)>30 && getOverdueDays(l)<=60;}).reduce(function(s,l){return s+(l.approvedAmount||0);},0);
      var par61_90_tot = activeLoans.filter(function(l){return getOverdueDays(l)>60 && getOverdueDays(l)<=90;}).reduce(function(s,l){return s+(l.approvedAmount||0);},0);
      var par90_tot = activeLoans.filter(function(l){return getOverdueDays(l)>90;}).reduce(function(s,l){return s+(l.approvedAmount||0);},0);

      content += '<div class="overflow-x-auto"><table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">PAR Bucket</th><th class="px-2 py-1 text-right">Amount</th><th class="px-2 py-1 text-right">% of Portfolio</th><th class="px-2 py-1 text-right">Provision Rate</th><th class="px-2 py-1 text-right">Provision Amount</th></tr>';
      var parRows = [
        {label:'PAR 1-30', amt: par1_30_tot, prov: 0.05},
        {label:'PAR 31-60', amt: par31_60_tot, prov: 0.20},
        {label:'PAR 61-90', amt: par61_90_tot, prov: 0.50},
        {label:'PAR 90+', amt: par90_tot, prov: 1.00}
      ];
      parRows.forEach(function(r) {
        var pct = totalPortfolio > 0 ? (r.amt / totalPortfolio * 100).toFixed(2) : 0;
        var prov = r.amt * r.prov;
        var amtStyle = r.amt > 0 ? 'text-[#DC2626] font-semibold' : '';
        content += '<tr class="border-b"><td class="px-2 py-1 font-medium">' + r.label + '</td><td class="px-2 py-1 text-right ' + amtStyle + '">' + formatCurrency(r.amt) + '</td><td class="px-2 py-1 text-right">' + pct + '%</td><td class="px-2 py-1 text-right">' + (r.prov*100) + '%</td><td class="px-2 py-1 text-right font-semibold">' + formatCurrency(Math.round(prov)) + '</td></tr>';
      });
      var totalProv = Math.round(par1_30_tot*0.05 + par31_60_tot*0.20 + par61_90_tot*0.50 + par90_tot*1.00);
      content += '<tr class="font-bold"><td class="px-2 py-2 border-t border-[#1E3A8A]">TOTAL PROVISIONS</td><td class="px-2 py-2 border-t border-[#1E3A8A] text-right" colspan="3"></td><td class="px-2 py-2 border-t border-[#1E3A8A] text-right text-[#DC2626]">' + formatCurrency(totalProv) + '</td></tr>';
      content += '</table></div>';
      content += '</div>';
      break;

    case 'RBM-004':
      title = 'Savings & Deposits Report — ' + quarter;
      var totalSavings = savingsAccounts.reduce(function(s,a){return s+a.balance;},0);
      var volCount = savingsAccounts.filter(function(sa){return sa.productCode==='SAV-VOL';}).length;
      var compCount = savingsAccounts.filter(function(sa){return sa.productCode==='SAV-COMP';}).length;
      content = '<div class="space-y-4">';
      content += '<div class="grid grid-cols-2 gap-4">';
      content += statCard('Total Savings Deposits', formatCurrency(totalSavings), savingsAccounts.length + ' accounts', '#1E3A8A');
      content += statCard('Voluntary Accounts', String(volCount), 'Flexible deposits', '#D97706');
      content += '</div>';
      content += '<table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">Product</th><th class="px-2 py-1 text-right">Accounts</th><th class="px-2 py-1 text-right">Total Balance</th><th class="px-2 py-1 text-right">Interest Rate</th></tr>';
      var prodGroups = {};
      savingsAccounts.forEach(function(sa) {
        if (!prodGroups[sa.productCode]) prodGroups[sa.productCode] = {count:0, balance:0, rate:0};
        prodGroups[sa.productCode].count++;
        prodGroups[sa.productCode].balance += sa.balance;
      });
      for (var pc in prodGroups) {
        var sp = products.find(function(p){return p.productCode===pc;});
        var rate = sp ? sp.interestRate : 0;
        content += '<tr class="border-b"><td class="px-2 py-1">' + escapeHtml(pc) + '</td><td class="px-2 py-1 text-right">' + prodGroups[pc].count + '</td><td class="px-2 py-1 text-right font-semibold">' + formatCurrency(prodGroups[pc].balance) + '</td><td class="px-2 py-1 text-right">' + rate + '% p.a.</td></tr>';
      }
      content += '</table></div>';
      break;

    case 'RBM-005':
      title = 'Capital Adequacy Report — ' + quarter;
      content = '<div class="space-y-4">';
      content += '<h4 class="text-sm font-semibold">Capital Adequacy Ratio (CAR)</h4>';
      var tier1Capital = getValue(StorageKeys.CASH_BALANCE) || 0;
      var riskWeightedAssets = totalPortfolio * 0.75; // Simplified 75% risk weight
      var car = tier1Capital > 0 ? (tier1Capital / riskWeightedAssets * 100).toFixed(2) : 0;
      var carColor = parseFloat(car) >= 15 ? '#059669' : parseFloat(car) >= 10 ? '#D97706' : '#1F2937';
      content += '<div class="grid grid-cols-2 gap-4">';
      content += statCard('Tier 1 Capital', formatCurrency(tier1Capital), 'Cash & reserves', '#1E3A8A');
      content += statCard('Risk-Weighted Assets', formatCurrency(riskWeightedAssets), 'Loans × 75%', '#1F2937');
      content += '</div>';
      content += '<div class="bg-[#F9FAFB] rounded-xl p-4 text-center">';
      content += '<div class="text-sm text-[#6B7280] mb-1">Capital Adequacy Ratio</div>';
      content += '<div class="text-[#1E3A8A]xl font-bold" style="color:' + carColor + '">' + car + '%</div>';
      content += '<div class="text-xs mt-2 ' + (parseFloat(car)>=15?'text-green-600':'text-[#DC2626]') + '">' + (parseFloat(car)>=15?'✅ Above RBM minimum of 15%':'⚠️ Below RBM minimum of 15%') + '</div>';
      content += '</div>';
      content += '</div>';
      break;

    case 'RBM-006':
      title = 'Liquidity Report — ' + quarter;
      var cashBalance = getValue(StorageKeys.CASH_BALANCE) || 0;
      var totalCurrentLiability = activeLoans.reduce(function(s,l){return s + Math.round((l.approvedAmount||0)/12);}, 0);
      var liquidityRatio = totalCurrentLiability > 0 ? (cashBalance / totalCurrentLiability * 100).toFixed(2) : 0;
      content = '<div class="space-y-4">';
      content += '<div class="grid grid-cols-2 gap-4">';
      content += statCard('Cash Position', formatCurrency(cashBalance), 'Liquid assets', '#1E3A8A');
      content += statCard('Current Liabilities', formatCurrency(totalCurrentLiability), 'Monthly maturities', '#1F2937');
      content += '</div>';
      content += '<div class="bg-[#F9FAFB] rounded-xl p-4 text-center">';
      content += '<div class="text-sm text-[#6B7280] mb-1">Liquidity Ratio</div>';
      content += '<div class="text-[#1E3A8A]xl font-bold text-[#1E3A8A]">' + liquidityRatio + '%</div>';
      content += '<div class="text-xs mt-2 text-[#6B7280]">RBM Minimum: 20%</div>';
      content += '</div>';
      // Liquidity buffer table
      content += '<h4 class="text-sm font-semibold mt-4">Cash Flow Projection (30 days)</h4>';
      content += '<table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">Item</th><th class="px-2 py-1 text-right">Inflow</th><th class="px-2 py-1 text-right">Outflow</th><th class="px-2 py-1 text-right">Net</th></tr>';
      content += '<tr class="border-b"><td class="px-2 py-1">Loan Collections</td><td class="px-2 py-1 text-right font-semibold text-[#059669">MWK 125,000</td><td class="px-2 py-1 text-right">—</td><td class="px-2 py-1 text-right text-[#059669]">+MWK 125,000</td></tr>';
      content += '<tr class="border-b"><td class="px-2 py-1">New Disbursements</td><td class="px-2 py-1 text-right">—</td><td class="px-2 py-1 text-right font-semibold text-[#1F2937]">MWK 500,000</td><td class="px-2 py-1 text-right text-[#1F2937]">-MWK 500,000</td></tr>';
      content += '<tr class="border-b font-bold"><td class="px-2 py-1">Operating Costs</td><td class="px-2 py-1 text-right">—</td><td class="px-2 py-1 text-right font-semibold text-[#1F2937]">MWK 350,000</td><td class="px-2 py-1 text-right text-[#1F2937]">-MWK 350,000</td></tr>';
      content += '<tr class="font-bold"><td class="px-2 py-2 border-t border-[#1E3A8A]">Net Position</td><td class="px-2 py-2 border-t border-[#1E3A8A] text-right" colspan="2"></td><td class="px-2 py-2 border-t border-[#1E3A8A] text-right font-bold text-[#1F2937]">-MWK 725,000</td></tr>';
      content += '</table>';
      content += '</div>';
      break;

    case 'RBM-007':
      title = 'Large Exposures Report — ' + quarter;
      var threshold = totalPortfolio * 0.10;
      var largeLoans = activeLoans.filter(function(l) { return (l.approvedAmount || 0) >= threshold; });
      content = '<div class="space-y-4">';
      content += '<p class="text-sm text-[#6B7280]">Threshold: MWK ' + formatCurrency(threshold) + ' (10% of Total Portfolio MWK ' + formatCurrency(totalPortfolio) + ')</p>';
      content += '<table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">Client</th><th class="px-2 py-1 text-left">Product</th><th class="px-2 py-1 text-right">Amount</th><th class="px-2 py-1 text-right">% of Capital</th><th class="px-2 py-1 text-center">Sector</th></tr>';
      if (largeLoans.length === 0) {
        content += '<tr><td class="px-2 py-3 text-center text-[#6B7280]" colspan="5">No exposures above 10% threshold</td></tr>';
      }
      largeLoans.forEach(function(l) {
        var pct = totalPortfolio > 0 ? (l.approvedAmount / totalPortfolio * 100).toFixed(2) : 0;
        content += '<tr class="border-b"><td class="px-2 py-1">' + escapeHtml(l.clientName) + '</td><td class="px-2 py-1">' + escapeHtml(l.productCode) + '</td><td class="px-2 py-1 text-right font-semibold">' + formatCurrency(l.approvedAmount) + '</td><td class="px-2 py-1 text-right">' + pct + '%</td><td class="px-2 py-1 text-center">' + escapeHtml(l.rbmReportingCategory || '—') + '</td></tr>';
      });
      content += '</table></div>';
      break;

    case 'RBM-008':
      title = 'Governance & Operations Report — ' + quarter;
      content = '<div class="space-y-4">';
      content += '<h4 class="text-sm font-semibold mb-3">Board & Management</h4>';
      content += '<table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">Role</th><th class="px-2 py-1 text-left">Name</th><th class="px-2 py-1 text-left">Status</th></tr>';
      content += '<tr class="border-b"><td class="px-2 py-1 font-semibold">Managing Director</td><td class="px-2 py-1">Mr. Elias Kafinyangwe</td><td class="px-2 py-1 text-[#059669]">Active</td></tr>';
      content += '<tr class="border-b"><td class="px-2 py-1 font-semibold">Finance Manager</td><td class="px-2 py-1">Mr. Matias Kafinyangwe</td><td class="px-2 py-1 text-[#059669]">Active</td></tr>';
      content += '<tr class="border-b"><td class="px-2 py-1 font-semibold">Internal Audit</td><td class="px-2 py-1">Mrs. Yuki Kafinyangwe</td><td class="px-2 py-1 text-[#059669]">Active</td></tr>';
      content += '</table>';
      content += '<h4 class="text-sm font-semibold mt-4 mb-3">Branch Network</h4>';
      content += '<table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">Branch</th><th class="px-2 py-1 text-left">Manager</th><th class="px-2 py-1 text-right">Staff</th><th class="px-2 py-1 text-center">Status</th></tr>';
      branches.forEach(function(b) {
        var staff = usersCountByBranch(b.id);
        content += '<tr class="border-b"><td class="px-2 py-1 font-semibold">' + escapeHtml(b.branchName) + '</td><td class="px-2 py-1">' + escapeHtml(b.managerName) + '</td><td class="px-2 py-1 text-right">' + staff + '</td><td class="px-2 py-1 text-center text-[#059669]">✓</td></tr>';
      });
      content += '</table>';
      content += '<h4 class="text-sm font-semibold mt-4 mb-3">Active Loan Products</h4>';
      content += '<table class="w-full text-xs"><tr class="bg-[#f9fafb]"><th class="px-2 py-1 text-left">Code</th><th class="px-2 py-1 text-left">Product</th><th class="px-2 py-1 text-right">Min</th><th class="px-2 py-1 text-right">Max</th><th class="px-2 py-1 text-right">Rate</th><th class="px-2 py-1 text-center">Method</th></tr>';
      products.forEach(function(p) {
        content += '<tr class="border-b"><td class="px-2 py-1 font-semibold">' + escapeHtml(p.productCode) + '</td><td class="px-2 py-1">' + escapeHtml(p.productName) + '</td><td class="px-2 py-1 text-right">' + formatCurrency(p.minPrincipal) + '</td><td class="px-2 py-1 text-right">' + formatCurrency(p.maxPrincipal) + '</td><td class="px-2 py-1 text-right">' + p.defaultInterestRate + '%</td><td class="px-2 py-1 text-center">' + (p.interestMethod === 'flat' ? 'Flat' : 'Declining') + '</td></tr>';
      });
      content += '</table>';
      content += '</div>';
      break;
  }

  // Metadata
  var meta = '<div class="flex items-center justify-between mt-4 p-3 bg-[#F9FAFB] rounded-lg text-xs text-[#6B7280]">';
  meta += '<span>Institution: Saile Financial Services Limited | License: NDMFI 017/22</span>';
  meta += '<span>Report: ' + code + ' | Period: ' + quarter + '</span>';
  meta += '<span>Generated: ' + now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString() + '</span>';
  meta += '</div>';

  showReportPreview(title, meta + content);
}

var lastGeneratedReport = null;

function showReportPreview(title, content) {
  lastGeneratedReport = { title: title, content: content };
  var previewArea = document.getElementById('report-preview-area');
  previewArea.classList.remove('hidden');
  document.getElementById('report-preview-title').textContent = title;
  document.getElementById('report-preview-content').innerHTML = content;
  // Scroll to preview
  previewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  logAudit('generate_report', { module: 'reports', changedTo: title });
}

function usersCountByBranch(branchId) {
  var users = getCollection(StorageKeys.USERS) || [];
  return users.filter(function(u) { return u.branchId === branchId && u.role !== 'md' && u.role !== 'finance_manager' && u.role !== 'admin' && u.role !== 'auditor'; }).length;
}

function calculateProvisions(activeLoans) {
  return activeLoans.reduce(function(sum, l) {
    var due = getOverdueDays(l);
    var amt = l.approvedAmount || 0;
    if (due > 90) return sum + amt;
    if (due > 60) return sum + amt * 0.50;
    if (due > 30) return sum + amt * 0.20;
    if (due > 0) return sum + amt * 0.05;
    return sum;
  }, 0);
}


window.renderReports = renderReports;