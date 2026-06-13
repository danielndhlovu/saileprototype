// ============================================================================
// Saile Platform v2 — Screen 00: Dashboard (Mr. Kafinyangwe's Morning View)
// ============================================================================

/**
 * Render the Main Dashboard.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderDashboard(container, options) {
  var role = options && options.role;
  var isAdmin = (role === 'admin' || role === 'md' || role === 'finance_manager');
  var loans = getCollection(StorageKeys.LOANS) || [];
  var clients = getCollection(StorageKeys.CLIENTS) || [];
  var branches = getCollection(StorageKeys.BRANCHES) || [];
  var products = getCollection(StorageKeys.PRODUCTS) || [];
  var sessions = getCollection(StorageKeys.SESSIONS) || [];

  // Calculate portfolio metrics
  var activeLoans = loans.filter(function(l) {
    return l.status === 'Active' || l.status === 'Disbursed' || l.status === 'Approved';
  });
  var totalPortfolio = 0;
  activeLoans.forEach(function(l) { totalPortfolio += (l.approvedAmount || l.requestedAmount || 0); });

  var todayStr = todayISO();
  var activeClientCount = clients.filter(function(c) { return c.status === 'Active'; }).length;
  var totalClientCount = clients.length;

  // PAR calculations
  var par1_30 = 0, par31_60 = 0, par61_90 = 0, par90plus = 0;
  var par1_30_amt = 0, par31_60_amt = 0, par61_90_amt = 0, par90plus_amt = 0;

  loans.forEach(function(l) {
    if (l.status === 'Active') {
      var due = getOverdueDays(l);
      var principal = l.approvedAmount || 0;
      if (due > 90) { par90plus++; par90plus_amt += principal; }
      else if (due > 60) { par61_90++; par61_90_amt += principal; }
      else if (due > 30) { par31_60++; par31_60_amt += principal; }
      else if (due > 0) { par1_30++; par1_30_amt += principal; }
    }
  });

  var par30Pct = totalPortfolio > 0 ? ((par1_30_amt) / totalPortfolio * 100).toFixed(1) : 0;

  // Branch portfolio breakdown
  var branchData = branches.map(function(b) {
    var bLoans = loans.filter(function(l) { return l.branchId === b.id && (l.status === 'Active' || l.status === 'Disbursed'); });
    var bPortfolio = 0;
    bLoans.forEach(function(l) { bPortfolio += (l.approvedAmount || l.requestedAmount || 0); });
    var bClients = clients.filter(function(c) { return c.branchId === b.id && c.status === 'Active'; }).length;
    return { name: b.branchCode, fullName: b.branchName, portfolio: bPortfolio, clients: bClients, loans: bLoans.length };
  });

  // Loan product distribution
  var productDist = products.map(function(p) {
    var count = activeLoans.filter(function(l) { return l.productId === p.id; }).length;
    var amt = 0;
    activeLoans.filter(function(l) { return l.productId === p.id; }).forEach(function(l) { amt += (l.approvedAmount || 0); });
    return { name: p.productCode + ' - ' + p.productName, count: count, amount: amt };
  });

  // Today's activity
  var todaysLoans = loans.filter(function(l) { return l.applicationDate === todayStr; });
  var recentCollections = (getCollection(StorageKeys.COLLECTIONS) || []).filter(function(c) {
    return c.collectedAt && c.collectedAt.startsWith(todayStr);
  });
  var todaysDisbursements = loans.filter(function(l) { return l.disbursementDate === todayStr; });

  var html = '<div class="space-y-6">';

  // Alert Banner
  var alerts = [];
  if (parseFloat(par30Pct) > 5) alerts.push('⚠️ Portfolio PAR 30 at ' + par30Pct + '% (above 5% threshold)');
  var pendingLoans = loans.filter(function(l) { return l.status === 'Pending' || l.status === 'Under_Review'; });
  if (pendingLoans.length > 0) alerts.push('📋 ' + pendingLoans.length + ' loan(s) pending approval');

  if (alerts.length > 0) {
    html += '<div class="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">';
    alerts.forEach(function(a) {
      html += '<p class="text-sm text-red-700 flex items-center gap-2">' + a + '</p>';
    });
    html += '</div>';
  }

  // Header
  html += '<div class="bg-gradient-to-r from-[#0f766e] via-[#134e4a] to-[#111827] rounded-2xl p-6 text-white">';
  html += '<div class="flex items-center justify-between">';
  html += '<div>';
  html += '<div class="flex items-center gap-3">';
  html += '<div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl font-bold">S</div>';
  html += '<div>';
  html += '<h1 class="text-xl font-bold">Saile Financial Services</h1>';
  html += '<p class="text-sm opacity-80">MD Dashboard — ' + (role === 'md' ? 'Managing Director' : role) + '</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '<div class="text-right">';
  html += '<p class="text-sm opacity-80">' + todayISO() + '</p>';
  html += '<p class="text-xs opacity-60">Licensed NDMFI 017/22</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // KPI Cards
  html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';

  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
  html += '<div class="text-sm text-[#6b7280] mb-1">Total Portfolio Outstanding</div>';
  html += '<div class="text-2xl font-bold text-[#0f766e">' + formatCurrency(totalPortfolio) + '</div>';
  html += '<div class="text-xs text-[#6b7280] mt-1">Across ' + activeLoans.length + ' active loans</div>';
  html += '</div>';

  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
  html += '<div class="text-sm text-[#6b7280] mb-1">Active Clients</div>';
  html += '<div class="text-2xl font-bold text-[#0f766e">' + activeClientCount + '</div>';
  html += '<div class="text-xs text-[#6b7280] mt-1">' + totalClientCount + ' total registered</div>';
  html += '</div>';

  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
  html += '<div class="text-sm text-[#6b7280] mb-1">Active Loans</div>';
  html += '<div class="text-2xl font-bold text-[#111827]">' + activeLoans.length + '</div>';
  html += '<div class="text-xs text-[#6b7280] mt-1">' + loans.length + ' total applications</div>';
  html += '</div>';

  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
  html += '<div class="text-sm text-[#6b7280] mb-1">PAR 30+ Days</div>';
  var parColor = parseFloat(par30Pct) > 5 ? '#111827' : parseFloat(par30Pct) > 3 ? '#F59E0B' : '#10b981';
  html += '<div class="text-2xl font-bold" style="color:' + parColor + '">' + par30Pct + '%</div>';
  html += '<div class="text-xs text-[#6b7280] mt-1">' + par1_30 + ' loans overdue</div>';
  html += '</div>';

  html += '</div>';

  // Branch Breakdown Chart
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">Portfolio by Branch — All 6 Locations</h3>';

  // Table view
  html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
  html += '<thead class="bg-[#f9fafb]"><tr>';
  html += '<th class="text-left px-4 py-2 font-medium text-[#6b7280">Branch</th>';
  html += '<th class="text-left px-4 py-2 font-medium text-[#6b7280">Type</th>';
  html += '<th class="text-right px-4 py-2 font-medium text-[#6b7280">Portfolio</th>';
  html += '<th class="text-right px-4 py-2 font-medium text-[#6b7280">Active Clients</th>';
  html += '<th class="text-right px-4 py-2 font-medium text-[#6b7280">Active Loans</th>';
  html += '<th class="text-center px-4 py-2 font-medium text-[#6b7280">Share</th>';
  html += '</tr></thead><tbody>';

  branches.forEach(function(b, idx) {
    var bd = branchData[idx];
    var share = totalPortfolio > 0 ? (bd.portfolio / totalPortfolio * 100).toFixed(1) : 0;
    html += '<tr class="border-b border-[#d1d5db]">';
    html += '<td class="px-4 py-2 font-medium text-[#0f766e]">' + escapeHtml(bd.fullName) + '</td>';
    html += '<td class="px-4 py-2 text-[#6b7280]">' + escapeHtml(b.branchType || 'Mixed') + '</td>';
    html += '<td class="px-4 py-2 text-right font-semibold">' + formatCurrency(bd.portfolio) + '</td>';
    html += '<td class="px-4 py-2 text-right">' + bd.clients + '</td>';
    html += '<td class="px-4 py-2 text-right">' + bd.loans + '</td>';
    html += '<td class="px-4 py-2 text-center text-[#F59E0B] font-semibold">' + share + '%</td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';

  // Bar chart (text-based)
  html += '<div class="mt-6 space-y-2">';
  var maxPort = Math.max.apply(null, branchData.map(function(b) { return b.portfolio; }));
  branchData.forEach(function(bd, idx) {
    var pct = maxPort > 0 ? (bd.portfolio / maxPort * 100) : 0;
    var barColor = bd.name === 'MZE' ? '#0f766e' : bd.name === 'MZB' ? '#111827' : '#0d9488';
    html += '<div class="flex items-center gap-3">';
    html += '<span class="w-20 text-xs font-medium text-[#6b7280]">' + bd.name + '</span>';
    html += '<div class="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">';
    html += '<div style="width:' + pct + '%;background:' + barColor + ';height:100%;border-radius:999px;transition:width 0.5s"></div>';
    html += '</div>';
    html += '<span class="text-xs font-semibold text-[#0f766e] w-24 text-right">' + formatCurrency(bd.portfolio) + '</span>';
    html += '</div>';
  });
  html += '</div>';
  html += '</div>';

  // Loan Product Distribution
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">Loan Products Distribution</h3>';
  html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3">';
  productDist.forEach(function(pd) {
    var pct = totalPortfolio > 0 ? (pd.amount / totalPortfolio * 100).toFixed(1) : 0;
    html += '<div class="bg-[#f9fafb] rounded-xl p-3 text-center">';
    html += '<div class="text-sm font-bold text-[#0f766e]">' + escapeHtml(pd.name.split(' - ')[0]) + '</div>';
    html += '<div class="text-xs text-[#6b7280] mt-1">' + pd.count + ' loans</div>';
    html += '<div class="text-xs text-[#6b7280]">' + formatCurrency(pd.amount) + '</div>';
    html += '</div>';
  });
  html += '</div></div>';

  // Today's Activity Feed
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">Today\'s Activity</h3>';
  html += '<div class="space-y-3">';

  if (todaysLoans.length === 0 && recentCollections.length === 0 && todaysDisbursements.length === 0) {
    html += '<p class="text-sm text-[#6b7280] text-center py-4">No activity recorded today.</p>';
  }

  todaysLoans.forEach(function(l) {
    html += '<div class="flex items-center gap-3 p-2 rounded-lg bg-[#F5F6FA]">';
    html += '<div class="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#0f766e] text-xs font-bold">📋</div>';
    html += '<div class="flex-1"><span class="text-sm text-[#0f766e]">New application: <strong>' + escapeHtml(l.clientName) + '</strong> — ' + escapeHtml(l.productCode || l.productName) + '</span></div>';
    html += '<span class="text-xs text-[#6b7280]">' + formatCurrency(l.requestedAmount) + '</span>';
    html += '</div>';
  });

  todaysDisbursements.forEach(function(l) {
    html += '<div class="flex items-center gap-3 p-2 rounded-lg bg-[#ECFDF5]">';
    html += '<div class="w-8 h-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#059669] text-xs font-bold">💰</div>';
    html += '<div class="flex-1"><span class="text-sm text-[#0f766e]">Disbursed to: <strong>' + escapeHtml(l.clientName) + '</strong> — ' + escapeHtml(l.productCode || l.productName) + '</span></div>';
    html += '<span class="text-xs text-[#059669]">' + formatCurrency(l.approvedAmount || 0) + '</span>';
    html += '</div>';
  });

  recentCollections.forEach(function(c) {
    html += '<div class="flex items-center gap-3 p-2 rounded-lg bg-[#FEF3C7]">';
    html += '<div class="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] text-xs font-bold">💵</div>';
    html += '<div class="flex-1"><span class="text-sm text-[#0f766e]">Collection from: <strong>' + escapeHtml(c.clientName) + '</strong></span></div>';
    html += '<span class="text-xs font-semibold text-[#D97706]">' + formatCurrency(c.collectedAmount) + '</span>';
    html += '</div>';
  });

  html += '</div></div>';

  // Quick Actions
  html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
  html += '<button onclick="navigateTo(\'#/loans\')" class="bg-white border-2 border-[#0f766e] rounded-xl p-4 text-center hover:bg-[#0f766e] hover:text-white transition-colors">';
  html += '<div class="text-2xl mb-2">📝</div>';
  html += '<div class="text-sm font-semibold">New Loan Application</div>';
  html += '</button>';

  html += '<button onclick="navigateTo(\'#/collections\')" class="bg-white border-2 border-[#0f766e] rounded-xl p-4 text-center hover:bg-[#0f766e] hover:text-white transition-colors">';
  html += '<div class="text-2xl mb-2">💰</div>';
  html += '<div class="text-sm font-semibold">Record Payment</div>';
  html += '</button>';

  html += '<button onclick="navigateTo(\'#/reports\')" class="bg-white border-2 border-[#0f766e] rounded-xl p-4 text-center hover:bg-[#0f766e] hover:text-white transition-colors">';
  html += '<div class="text-2xl mb-2">📊</div>';
  html += '<div class="text-sm font-semibold">RBM Reports</div>';
  html += '</button>';
  html += '</div>';

  html += '</div>';

  container.innerHTML = html;
}

window.renderDashboard = renderDashboard;