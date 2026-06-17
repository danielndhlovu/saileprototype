/**
 * Dashboard Screen
 * Handles role-specific dashboard rendering and logic.
 */

function renderDashboard() {
  const user = getValue(StorageKeys.SESSION);
  if (!user) return;

  const role = user.role;
  const content = document.getElementById('app-content');

  // Clear previous content
  content.innerHTML = '';

  // Role-based dispatcher
  switch (role) {
    case 'md':
      renderMDDashboard(content, user);
      break;
    case 'finance_manager':
      renderFMDashboard(content, user);
      break;
    case 'auditor':
      renderAuditorDashboard(content, user);
      break;
    case 'branch_manager':
      renderBMDashboard(content, user);
      break;
    case 'loan_officer':
    case 'field_officer':
      renderLODashboard(content, user);
      break;
    case 'admin':
      renderAdminDashboard(content, user);
      break;
    default:
      renderDefaultDashboard(content, user);
  }

  // Initialize interactive elements
  initDashboardListeners();
}

/**
 * MD / Executive Dashboard
 * Focus: Strategy, Risk, High-level KPIs, Growth.
 */
function renderMDDashboard(container, user) {
  const stats = calculateDashboardStats();
  const par = calculatePAR();
  const branches = getCollection(StorageKeys.BRANCHES);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-2xl font-bold text-dark">Good morning, Mr. Kafinyangwe</h1>
          <p class="text-secondary text-sm">${escapeHtml(todayISO())} - Executive Intelligence System</p>
        </div>
        <div class="flex gap-3">
          <button class="bg-white border border-border px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
             Portfolio Report
          </button>
          <button class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             AI Insights
          </button>
        </div>
      </div>

      <!-- Portfolio KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-card border border-border">
          <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Portfolio Outstanding</p>
          <h3 class="text-2xl font-bold text-primary">${escapeHtml(formatCurrency(par.totalOutstanding))}</h3>
          <p class="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
            +12% MoM
          </p>
        </div>
        <div class="bg-white p-6 rounded-card border border-border">
          <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Active Clients</p>
          <h3 class="text-2xl font-bold text-dark">${escapeHtml(stats.activeClients.toString())}</h3>
          <p class="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
            +32 MoM
          </p>
        </div>
        <div class="bg-white p-6 rounded-card border border-border">
          <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Active Loans</p>
          <h3 class="text-2xl font-bold text-dark">${escapeHtml(stats.activeLoans.toString())}</h3>
          <p class="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
            +18 MoM
          </p>
        </div>
        <div class="bg-white p-6 rounded-card border border-border">
          <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">PAR 30</p>
          <h3 class="text-2xl font-bold text-warning">${escapeHtml(formatPercentage(par.par1_30_pct))}</h3>
          <p class="text-xs text-secondary mt-2">Target: <5%</p>
        </div>
      </div>

      <!-- Critical Alerts & Compliance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-primary/5 border border-primary/20 rounded-card p-6">
          <h4 class="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
            Critical Alerts
          </h4>
          <div class="space-y-3">
             <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-primary/10 shadow-sm">
                <span class="text-sm font-medium text-dark">2 loans pending your approval</span>
                <span class="text-[10px] bg-warning/20 text-warning px-2 py-1 rounded-full font-bold">URGENT</span>
             </div>
             <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-primary/10 shadow-sm">
                <span class="text-sm font-medium text-dark">Provision Coverage at 103%</span>
                <span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">STABLE</span>
             </div>
          </div>
        </div>

        <div class="bg-white border border-border rounded-card p-6">
          <h4 class="text-sm font-bold text-dark mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Portfolio Risk Thermometer
          </h4>
          <div class="space-y-4">
             <div>
                <div class="flex justify-between text-xs mb-1">
                   <span class="text-secondary font-medium">PAR 1-30 Days</span>
                   <span class="text-dark font-bold">${escapeHtml(formatPercentage(par.par1_30_pct))}</span>
                </div>
                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                   <div class="bg-warning h-full" style="width: ${par.par1_30_pct}%"></div>
                </div>
             </div>
             <div>
                <div class="flex justify-between text-xs mb-1">
                   <span class="text-secondary font-medium">PAR 31-90 Days</span>
                   <span class="text-dark font-bold">${escapeHtml(formatPercentage(par.par31_90_pct))}</span>
                </div>
                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                   <div class="bg-orange-500 h-full" style="width: ${par.par31_90_pct}%"></div>
                </div>
             </div>
             <div>
                <div class="flex justify-between text-xs mb-1">
                   <span class="text-secondary font-medium">PAR 90+ Days</span>
                   <span class="text-dark font-bold">${escapeHtml(formatPercentage(par.par90plus_pct))}</span>
                </div>
                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                   <div class="bg-red-600 h-full" style="width: ${par.par90plus_pct}%"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- What-If Scenario Modeling -->
      <div class="bg-dark text-white rounded-card p-6">
        <h4 class="text-sm font-bold mb-6 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
          What-If Scenario Modeling
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div class="space-y-4">
              <label class="block text-xs font-medium text-gray-400">Increase Interest Rates by (%):</label>
              <input type="range" id="rate-slider" min="0" max="10" step="0.5" value="0" class="w-full accent-primary">
              <div class="flex justify-between text-[10px] text-gray-500"><span>0%</span><span>+10%</span></div>
           </div>
           <div class="space-y-4">
              <label class="block text-xs font-medium text-gray-400">Improve Collection Efficiency by (%):</label>
              <input type="range" id="efficiency-slider" min="0" max="20" step="1" value="0" class="w-full accent-primary">
              <div class="flex justify-between text-[10px] text-gray-500"><span>0%</span><span>+20%</span></div>
           </div>
           <div class="bg-white/5 rounded-xl p-4 border border-white/10">
              <p class="text-xs text-gray-400 mb-1">Projected Annual Revenue Increase</p>
              <h3 id="projected-revenue" class="text-xl font-bold text-emerald-400">${escapeHtml(formatCurrency(0))}</h3>
              <p class="text-[10px] text-gray-500 mt-2">Based on current portfolio of ${escapeHtml(formatCurrency(par.totalOutstanding))}</p>
           </div>
        </div>
      </div>

      <!-- Branch Performance Scorecard -->
      <div class="bg-white border border-border rounded-card overflow-hidden">
        <div class="p-6 border-b border-border flex justify-between items-center">
           <h4 class="text-sm font-bold text-dark">Branch Operational Scorecard</h4>
           <span class="text-xs text-secondary italic">Last updated: Just now</span>
        </div>
        <div class="overflow-x-auto">
           <table class="w-full text-left">
              <thead class="bg-gray-50 text-[10px] uppercase font-bold text-secondary">
                 <tr>
                    <th class="px-6 py-4">Branch Name</th>
                    <th class="px-6 py-4 text-right">Portfolio</th>
                    <th class="px-6 py-4 text-center">PAR 30</th>
                    <th class="px-6 py-4 text-center">Efficiency</th>
                    <th class="px-6 py-4 text-center">Status</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-border">
                 ${branches.map(b => {
                    const branchLoans = getCollection(StorageKeys.LOANS).filter(l => l.branchId === b.id);
                    const branchPortfolio = branchLoans.reduce((sum, l) => sum + (l.loanAmount || 0), 0);
                    return `
                       <tr class="hover:bg-gray-50 transition-colors">
                          <td class="px-6 py-4">
                             <p class="text-sm font-semibold text-dark">${escapeHtml(b.branchName)}</p>
                             <p class="text-[10px] text-secondary">${escapeHtml(b.branchCode)}</p>
                          </td>
                          <td class="px-6 py-4 text-right text-sm font-medium text-dark">${escapeHtml(formatCurrency(branchPortfolio))}</td>
                          <td class="px-6 py-4 text-center">
                             <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">0.0%</span>
                          </td>
                          <td class="px-6 py-4 text-center text-sm">98.2%</td>
                          <td class="px-6 py-4 text-center">
                             <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          </td>
                       </tr>
                    `;
                 }).join('')}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * Finance Manager Dashboard
 * Focus: Cash flow, GL reconciliations, RBM Reporting.
 */
function renderFMDashboard(container, user) {
  const trialBalance = calculateTrialBalance();
  const cashBalance = getValue(StorageKeys.CASH_BALANCE) || 0;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-2xl font-bold text-dark">Financial Management Control</h1>
          <p class="text-secondary text-sm">Treasury & Reporting — Finance Manager</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-card border border-border">
          <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Bank Balance (All Accounts)</p>
          <h3 class="text-2xl font-bold text-dark">${escapeHtml(formatCurrency(12450000))}</h3>
          <p class="text-[10px] text-emerald-600 mt-2 font-bold flex items-center gap-1">
             <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
             MWK 1.2M Today
          </p>
        </div>
        <div class="bg-white p-6 rounded-card border border-border">
          <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Cash On Hand</p>
          <h3 class="text-2xl font-bold text-primary">${escapeHtml(formatCurrency(cashBalance))}</h3>
          <p class="text-[10px] text-secondary mt-2">Branch Vaults</p>
        </div>
        <div class="bg-white p-6 rounded-card border border-border">
          <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Expected Collections</p>
          <h3 class="text-2xl font-bold text-dark">${escapeHtml(formatCurrency(8500500))}</h3>
          <p class="text-[10px] text-secondary mt-2">Projected Cash Flow</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white border border-border rounded-card p-6">
           <h4 class="text-sm font-bold text-dark mb-4">General Ledger Reconciliation</h4>
           <div class="p-4 bg-gray-50 rounded-xl border border-border mb-4">
              <div class="flex justify-between items-center mb-1">
                 <span class="text-xs text-secondary font-medium">Status</span>
                 <span class="${trialBalance.isBalanced ? 'text-emerald-600' : 'text-error'} font-bold text-[10px] uppercase">
                    ${trialBalance.isBalanced ? '✓ Balanced' : '✗ Out of Balance'}
                 </span>
              </div>
              <div class="grid grid-cols-2 gap-4 mt-4">
                 <div>
                    <p class="text-[10px] text-secondary uppercase font-bold">Total Debits</p>
                    <p class="text-lg font-bold text-dark">${escapeHtml(formatCurrency(trialBalance.totalDebits))}</p>
                 </div>
                 <div>
                    <p class="text-[10px] text-secondary uppercase font-bold">Total Credits</p>
                    <p class="text-lg font-bold text-dark">${escapeHtml(formatCurrency(trialBalance.totalCredits))}</p>
                 </div>
              </div>
           </div>
           <button class="w-full py-3 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-primary transition-colors">
              Generate Trial Balance
           </button>
        </div>

        <div class="bg-white border border-border rounded-card p-6">
           <h4 class="text-sm font-bold text-dark mb-4">RBM Compliance Reporting</h4>
           <div class="space-y-3">
              <div class="p-3 border border-border rounded-xl flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">RBM</div>
                    <div>
                       <p class="text-sm font-bold text-dark">RBM-001 Financial Position</p>
                       <p class="text-[10px] text-secondary">Due in 4 days</p>
                    </div>
                 </div>
                 <span class="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">Ready for Sign-off</span>
              </div>
              <div class="p-3 border border-border rounded-xl flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-secondary font-bold">RBM</div>
                    <div>
                       <p class="text-sm font-bold text-dark">RBM-003 Loan Portfolio</p>
                       <p class="text-[10px] text-secondary">Draft in progress</p>
                    </div>
                 </div>
                 <span class="text-[10px] bg-gray-100 text-secondary px-2 py-1 rounded-full font-bold">Awaiting Branch Data</span>
              </div>
              <div class="p-3 border border-border rounded-xl flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold">RBM</div>
                    <div>
                       <p class="text-sm font-bold text-dark">RBM-004 Savings</p>
                       <p class="text-[10px] text-secondary">Overdue</p>
                    </div>
                 </div>
                 <span class="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Zomba/Karonga overdue</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Auditor Dashboard
 * Focus: Compliance, Audit Trail, Anomaly Detection.
 */
function renderAuditorDashboard(container, user) {
  const auditLogs = getCollection(StorageKeys.AUDIT_LOG).slice(-5).reverse();

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-2xl font-bold text-dark">Compliance & Risk Audit</h1>
          <p class="text-secondary text-sm">Read-only Forensic View — Mrs. Yuki Kafinyangwe</p>
        </div>
        <button class="bg-white border border-border px-4 py-2 rounded-xl text-sm font-medium">Download Full Audit Log</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div class="lg:col-span-2 space-y-6">
            <div class="bg-white border border-border rounded-card p-6">
               <h4 class="text-sm font-bold text-dark mb-4">Recent Audit Activity</h4>
               <div class="space-y-4">
                  ${auditLogs.map(log => `
                     <div class="flex items-start gap-4 p-3 border-b border-gray-50 last:border-0">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                           <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-8.213-9.333L4 12m8 8V9m0 0H9m3 0h3"/></svg>
                        </div>
                        <div class="flex-1">
                           <div class="flex justify-between items-start">
                              <p class="text-sm font-semibold text-dark">${escapeHtml(log.action)}</p>
                              <span class="text-[10px] text-secondary font-medium">${escapeHtml(formatDateTime(log.timestamp))}</span>
                           </div>
                           <p class="text-xs text-secondary mt-1">${escapeHtml(log.userName)} in ${escapeHtml(log.module)}</p>
                        </div>
                     </div>
                  `).join('')}
               </div>
            </div>

            <div class="bg-red-50 border border-red-100 rounded-card p-6">
               <h4 class="text-sm font-bold text-red-700 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                  Anomaly Detection Alerts
               </h4>
               <div class="p-4 bg-white border border-red-100 rounded-xl">
                  <p class="text-xs font-bold text-dark">Possible Double Disbursement Detected</p>
                  <p class="text-[10px] text-secondary mt-1">Client: Mtisunge Phiri (Lilongwe Branch). Loan amount matched previous loan within 24h.</p>
                  <button class="mt-3 text-[10px] font-bold text-primary hover:underline">Investigate Transaction</button>
               </div>
            </div>
         </div>

         <div class="space-y-6">
            <div class="bg-white border border-border rounded-card p-6">
               <h4 class="text-sm font-bold text-dark mb-4">Risk Heatmap</h4>
               <div class="grid grid-cols-3 gap-2">
                  <div class="h-12 bg-emerald-500 rounded"></div>
                  <div class="h-12 bg-emerald-500 rounded"></div>
                  <div class="h-12 bg-warning rounded"></div>
                  <div class="h-12 bg-emerald-500 rounded"></div>
                  <div class="h-12 bg-orange-500 rounded"></div>
                  <div class="h-12 bg-red-600 rounded animate-pulse"></div>
                  <div class="h-12 bg-emerald-500 rounded"></div>
                  <div class="h-12 bg-emerald-500 rounded"></div>
                  <div class="h-12 bg-emerald-500 rounded"></div>
               </div>
               <div class="mt-4 flex justify-between text-[10px] text-secondary font-medium">
                  <span>Operational</span>
                  <span>Credit</span>
                  <span>Market</span>
               </div>
            </div>

            <div class="bg-dark text-white rounded-card p-6">
               <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">Compliance Score</p>
               <h3 class="text-4xl font-bold text-primary">94.8%</h3>
               <p class="text-xs text-gray-500 mt-2">System integrity check passed.</p>
            </div>
         </div>
      </div>
    </div>
  `;
}

/**
 * Branch Manager Dashboard
 * Focus: Local performance, staff targets, collections.
 */
function renderBMDashboard(container, user) {
  const branch = getCollection(StorageKeys.BRANCHES).find(b => b.branchCode === user.branchCode) || { branchName: 'MZE - Mzuzu' };
  const clients = getCollection(StorageKeys.CLIENTS).filter(c => c.branchId === branch.id);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-2xl font-bold text-dark">Branch Manager Workspace</h1>
          <p class="text-secondary text-sm">${escapeHtml(branch.branchName)} · ${escapeHtml(user.branchCode || 'GEN')}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div class="bg-white p-6 rounded-card border border-border">
            <p class="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Portfolio</p>
            <h3 class="text-xl font-bold text-primary">${escapeHtml(formatCurrency(0))}</h3>
            <p class="text-[10px] text-secondary mt-1">Branch Total</p>
         </div>
         <div class="bg-white p-6 rounded-card border border-border">
            <p class="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">PAR 30</p>
            <h3 class="text-xl font-bold text-emerald-600">0.0%</h3>
            <p class="text-[10px] text-secondary mt-1">Local Risk</p>
         </div>
         <div class="bg-white border border-border rounded-card p-6 md:col-span-2">
            <h4 class="text-xs font-bold text-dark mb-4">Staff Productivity</h4>
            <div class="space-y-4">
               <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-dark">Mercy Jere</span>
                  <span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">ON TRACK</span>
               </div>
               <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-dark">Francis Moyo</span>
                  <span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">ON TRACK</span>
               </div>
            </div>
         </div>
      </div>

      <div class="bg-white border border-border rounded-card p-6">
         <h4 class="text-sm font-bold text-dark mb-6">Today's Performance Targets</h4>
         <div class="space-y-6">
            <div class="space-y-2">
               <div class="flex justify-between text-xs font-medium">
                  <span class="text-secondary">Collections</span>
                  <span class="text-dark font-bold">MWK 125K / 180K (69%)</span>
               </div>
               <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-orange-500 h-full" style="width: 69%"></div>
               </div>
            </div>
            <div class="space-y-2">
               <div class="flex justify-between text-xs font-medium">
                  <span class="text-secondary">New Disbursements</span>
                  <span class="text-dark font-bold">2 / 5 Loans (40%)</span>
               </div>
               <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-red-500 h-full" style="width: 40%"></div>
               </div>
            </div>
            <div class="space-y-2">
               <div class="flex justify-between text-xs font-medium">
                  <span class="text-secondary">Client Recruitment</span>
                  <span class="text-dark font-bold">4 / 5 New Clients (80%)</span>
               </div>
               <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-primary h-full" style="width: 80%"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  `;
}

/**
 * Loan Officer Dashboard
 * Focus: Operations, Client management, Tasks.
 */
function renderLODashboard(container, user) {
  const clients = getCollection(StorageKeys.CLIENTS).slice(0, 5);
  const collectionsDue = 12;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-2xl font-bold text-dark">Field Operations</h1>
          <p class="text-secondary text-sm">Welcome back, ${escapeHtml(user.fullName)}</p>
        </div>
        <button onclick="location.hash='#/clients/new'" class="bg-[#111827] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary transition-colors shadow-lg">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
           New Client
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div class="bg-primary/5 border border-primary/20 rounded-card p-6">
            <h4 class="text-sm font-bold text-primary mb-4 flex items-center gap-2">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
               Today's Schedule
            </h4>
            <div class="space-y-3">
               <div class="p-4 bg-white rounded-xl border border-primary/10 shadow-sm flex justify-between items-center">
                  <div>
                     <p class="text-sm font-bold text-dark">${escapeHtml(collectionsDue)} Collections Due</p>
                     <p class="text-[10px] text-secondary">Follow up with clients for today's repayments</p>
                  </div>
                  <button class="bg-[#111827] text-white text-[10px] px-3 py-1.5 rounded-lg font-bold">START TASK</button>
               </div>
               <div class="p-4 bg-white rounded-xl border border-primary/10 shadow-sm flex justify-between items-center">
                  <div>
                     <p class="text-sm font-bold text-dark">3 Pending Applications</p>
                     <p class="text-[10px] text-secondary">Incomplete data verification</p>
                  </div>
                  <button class="bg-gray-100 text-secondary text-[10px] px-3 py-1.5 rounded-lg font-bold">VIEW</button>
               </div>
            </div>
         </div>

         <div class="bg-white border border-border rounded-card p-6">
            <h4 class="text-sm font-bold text-dark mb-4">Quick Links</h4>
            <div class="grid grid-cols-2 gap-3">
               <a href="#/clients" class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                  <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  <span class="text-xs font-bold uppercase tracking-widest">Client Registry</span>
               </a>
               <a href="#/loans/new" class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                  <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span class="text-xs font-bold uppercase tracking-widest">New Loan</span>
               </a>
            </div>
         </div>
      </div>

      <div class="bg-white border border-border rounded-card overflow-hidden">
         <div class="p-6 border-b border-border flex justify-between items-center">
            <h4 class="text-sm font-bold text-dark">Recent Clients</h4>
            <a href="#/clients" class="text-xs font-bold text-primary hover:underline">View All</a>
         </div>
         <div class="divide-y divide-border">
            ${clients.map(c => `
               <div class="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                     <p class="text-sm font-semibold text-dark">${escapeHtml(c.clientName)}</p>
                     <p class="text-[10px] text-secondary">${escapeHtml(c.clientCode)} · ${escapeHtml(c.phone)}</p>
                  </div>
                  <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Active</span>
               </div>
            `).join('')}
         </div>
      </div>
    </div>
  `;
}

/**
 * Admin Dashboard
 * Focus: System health, Users, Audit.
 */
function renderAdminDashboard(container, user) {
  const users = getCollection(StorageKeys.USERS);
  const auditLogs = getCollection(StorageKeys.AUDIT_LOG).slice(-10);

  container.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-dark">System Administration</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div class="bg-dark text-white p-6 rounded-card shadow-xl">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Users</p>
            <h3 class="text-3xl font-bold">${escapeHtml(users.length.toString())}</h3>
            <p class="text-xs text-emerald-400 mt-2 flex items-center gap-1">
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
               System Online
            </p>
         </div>
         <div class="bg-white border border-border p-6 rounded-card">
            <p class="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Storage Usage</p>
            <h3 class="text-xl font-bold text-dark">1.2 MB / 5.0 MB</h3>
            <div class="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
               <div class="bg-primary h-full" style="width: 24%"></div>
            </div>
         </div>
         <div class="bg-white border border-border p-6 rounded-card">
            <p class="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Sync Status</p>
            <h3 class="text-xl font-bold text-emerald-600">Healthy</h3>
            <p class="text-[10px] text-secondary mt-1">Last synced: Just now</p>
         </div>
      </div>

      <div class="bg-white border border-border rounded-card p-6">
         <h4 class="text-sm font-bold text-dark mb-4">User Management</h4>
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${users.slice(0, 6).map(u => `
               <div class="p-3 border border-border rounded-xl flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-primary">
                     ${escapeHtml((u.fullName || 'U').charAt(0))}
                  </div>
                  <div>
                     <p class="text-xs font-bold text-dark">${escapeHtml(u.fullName)}</p>
                     <p class="text-[10px] text-secondary uppercase tracking-tighter font-medium">${escapeHtml(u.role)}</p>
                  </div>
               </div>
            `).join('')}
         </div>
         <div class="mt-4 pt-4 border-t border-border flex justify-end">
            <button onclick="location.hash='#/users'" class="text-xs font-bold text-primary hover:underline">Manage All Users →</button>
         </div>
      </div>
    </div>
  `;
}

/**
 * Default Dashboard for unknown roles.
 */
function renderDefaultDashboard(container, user) {
  container.innerHTML = `
    <div class="p-12 text-center">
       <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
       </div>
       <h2 class="text-xl font-bold text-dark">Dashboard Unavailable</h2>
       <p class="text-secondary text-sm mt-2">No custom view found for role: ${escapeHtml(user.role)}</p>
    </div>
  `;
}

/**
 * Helper to calculate basic stats for the dashboard.
 */
function calculateDashboardStats() {
  const clients = getCollection(StorageKeys.CLIENTS);
  const loans = getCollection(StorageKeys.LOANS);

  return {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'Active').length,
    activeLoans: loans.filter(l => l.status === 'Disbursed').length,
    totalPortfolio: loans.reduce((sum, l) => sum + (l.loanAmount || 0), 0)
  };
}

/**
 * Interactive Listeners for Dashboard Features
 */
function initDashboardListeners() {
  // Scenario Modeling Listeners
  const rateSlider = document.getElementById('rate-slider');
  const efficiencySlider = document.getElementById('efficiency-slider');
  const revenueDisplay = document.getElementById('projected-revenue');

  if (rateSlider && efficiencySlider && revenueDisplay) {
    const updateProjection = () => {
      const par = calculatePAR();
      const portfolio = par.totalOutstanding || 0;
      const rateInc = parseFloat(rateSlider.value) / 100;
      const effInc = parseFloat(efficiencySlider.value) / 100;

      // Simple heuristic for prototype: revenue = portfolio * (current_yield + rateInc) * (1 + effInc)
      // We'll just calculate the *delta* for the prototype
      const currentYield = 0.35; // 35% APR average
      const currentRevenue = portfolio * currentYield;
      const projectedRevenue = portfolio * (currentYield + rateInc) * (1 + effInc);
      const delta = projectedRevenue - currentRevenue;

      revenueDisplay.textContent = formatCurrency(Math.max(0, delta));
    };

    rateSlider.addEventListener('input', updateProjection);
    efficiencySlider.addEventListener('input', updateProjection);

    // Initial calc
    updateProjection();
  }
}
