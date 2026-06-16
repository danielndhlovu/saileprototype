// ============================================================================
// Saile Platform v2 — Screen 00: Role-Based Executive Intelligence
// ============================================================================

function renderDashboard(container, options) {
  var role = (options && options.role) || 'md';

  if (role === 'md') {
    renderMDDashboard(container, options);
  } else if (role === 'finance_manager') {
    renderFinanceDashboard(container, options);
  } else if (role === 'auditor') {
    renderAuditDashboard(container, options);
  } else if (role === 'branch_manager') {
    renderBranchManagerDashboard(container, options);
  } else {
    renderGenericDashboard(container, options);
  }
}

/**
 * SECTION 2: THE MD EXECUTIVE DASHBOARD
 */
function renderMDDashboard(container, options) {
  var loans = getCollection(StorageKeys.LOANS) || [];
  var clients = getCollection(StorageKeys.CLIENTS) || [];
  var branches = getCollection(StorageKeys.BRANCHES) || [];
  var products = getCollection(StorageKeys.PRODUCTS) || [];

  var activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Disbursed');
  var totalPortfolio = activeLoans.reduce((sum, l) => sum + (l.requestedAmount || 0), 0);
  var activeClientCount = clients.filter(c => c.status === 'Active').length;

  var par1_30_amt = activeLoans.reduce((sum, l) => {
    var due = getOverdueDays(l);
    return (due > 0 && due <= 30) ? sum + (l.requestedAmount || 0) : sum;
  }, 0);
  var par30Pct = totalPortfolio > 0 ? (par1_30_amt / totalPortfolio * 100).toFixed(1) : 0;

  var html = '<div class="space-y-8 pb-20">';

  html += `
    <div class="sticky top-0 z-30 bg-[#F5F6FA]/95 backdrop-blur-sm pb-4 pt-1">
      <div class="bg-white rounded-2xl border-l-4 border-[#1E3A8A] shadow-sm p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-xl font-bold text-[#1F2937]">Good morning, Mr. Kafinyangwe</h1>
            <p class="text-sm text-[#6B7280]">Q2 2026, Week 24 • ${new Date().toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20" onclick="window.location.hash='#/reports'">Generate Board Report</button>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div class="p-4 bg-[#F5F6FA] rounded-2xl border border-gray-100">
            <div class="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Portfolio Outstanding</div>
            <div class="text-2xl font-black text-[#1E3A8A]">${formatCurrency(totalPortfolio)}</div>
            <div class="text-[10px] text-[#059669] font-bold mt-1">▲ +2.1% MoM</div>
          </div>
          <div class="p-4 bg-[#F5F6FA] rounded-2xl border border-gray-100">
            <div class="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Active Clients</div>
            <div class="text-2xl font-black text-[#1F2937]">${activeClientCount}</div>
            <div class="text-[10px] text-[#059669] font-bold mt-1">▲ +12 MoM</div>
          </div>
          <div class="p-4 bg-[#F5F6FA] rounded-2xl border border-gray-100">
            <div class="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Active Loans</div>
            <div class="text-2xl font-black text-[#1F2937]">${activeLoans.length}</div>
            <div class="text-[10px] text-[#059669] font-bold mt-1">▲ +8 MoM</div>
          </div>
          <div class="p-4 bg-[#F5F6FA] rounded-2xl border border-gray-100">
            <div class="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">PAR 30</div>
            <div class="text-2xl font-black text-[#D97706]">${par30Pct}%</div>
            <div class="text-[10px] text-[#DC2626] font-bold mt-1">▲ +0.3% MoM</div>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex items-center gap-3 p-3 bg-[#FEF2F2] border border-[#fecaca] rounded-xl cursor-pointer hover:bg-[#fee2e2] transition-colors" onclick="window.location.hash='#/reports'">
             <span class="text-[#DC2626] font-bold">🔴</span>
             <span class="text-sm font-semibold text-[#991B1B]">Karonga PAR 30 at 6.8% (above 5% threshold) — Review Required</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Risk Thermometer & Provisions
  html += `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl border border-[#d1d5db] p-6 shadow-sm">
        <h3 class="font-bold text-[#1F2937] mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
          <span class="w-2 h-4 bg-[#1E3A8A] rounded-full"></span> Portfolio Quality
        </h3>
        <div class="flex flex-col md:flex-row items-center gap-8">
           <div class="relative w-40 h-40">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#F3F4F6" stroke-width="12" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#059669" stroke-width="12" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="${251.2 * (1 - 0.95)}" stroke-linecap="round" />
                <circle cx="50" cy="50" r="40" stroke="#D97706" stroke-width="12" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="${251.2 * (1 - 0.042)}" stroke-linecap="round" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-[#1F2937]">${par30Pct}%</span>
                <span class="text-[8px] uppercase font-bold text-[#6B7280]">Total Risk</span>
              </div>
           </div>
           <div class="flex-1 w-full space-y-3">
              ${renderRiskBar('PAR 1-30', 4.2, '#D97706')}
              ${renderRiskBar('PAR 31-60', 2.1, '#D97706')}
              ${renderRiskBar('PAR 61-90', 0.8, '#059669')}
              ${renderRiskBar('PAR 90+', 0.4, '#059669')}
           </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-[#d1d5db] p-6 shadow-sm">
        <h3 class="font-bold text-[#1F2937] mb-6 uppercase text-xs tracking-widest">Provision Adequacy (RBM 100%)</h3>
        <div class="grid grid-cols-2 gap-6">
           <div class="space-y-1">
              <div class="text-[10px] text-[#6B7280] font-bold uppercase">Required</div>
              <div class="text-2xl font-black text-[#1F2937]">MWK 3.1M</div>
           </div>
           <div class="space-y-1">
              <div class="text-[10px] text-[#6B7280] font-bold uppercase">Actual</div>
              <div class="text-2xl font-black text-[#059669]">MWK 3.2M</div>
           </div>
        </div>
        <div class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
           <div>
              <div class="text-xs font-black text-[#1F2937]">Coverage Ratio: 103%</div>
              <p class="text-[10px] text-[#6B7280]">Healthy Provision Buffer</p>
           </div>
           <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="bg-[#059669] h-full" style="width: 100%"></div>
           </div>
        </div>
      </div>
    </div>
  `;

  // Branch Performance
  html += `
    <div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden shadow-sm">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-bold text-[#1F2937] uppercase text-xs tracking-widest">Branch Performance Scorecard — Q2</h3>
        <button class="text-[10px] font-bold text-[#1E3A8A] hover:underline">SET QUARTERLY TARGETS</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50/50 text-[#6B7280] text-left uppercase text-[9px] tracking-widest font-black">
            <tr>
              <th class="px-6 py-4">Branch</th>
              <th class="px-6 py-4 text-right">Portfolio</th>
              <th class="px-6 py-4 text-center">Active Clients</th>
              <th class="px-6 py-4 text-center">PAR30</th>
              <th class="px-6 py-4 text-center">Status</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            ${renderBranchRows(branches, loans, clients)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Support Floating Bar
  html += `
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1F2937] border border-white/10 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-8">
       <button class="flex flex-col items-center gap-1 group" onclick="window.location.hash='#/reports'">
          <span class="text-xl">📊</span>
          <span class="text-[8px] font-black text-white/50 uppercase tracking-tighter group-hover:text-white">Board Report</span>
       </button>
       <button class="flex flex-col items-center gap-1 group" onclick="window.location.hash='#/loans'">
          <span class="text-xl">💰</span>
          <span class="text-[8px] font-black text-white/50 uppercase tracking-tighter group-hover:text-white">Loan Approval</span>
       </button>
       <div class="w-px h-6 bg-white/10"></div>
       <button class="flex flex-col items-center gap-1 group" onclick="window.location.hash='#/settings'">
          <span class="text-xl">⚙️</span>
          <span class="text-[8px] font-black text-white/50 uppercase tracking-tighter group-hover:text-white">System Config</span>
       </button>
    </div>
  `;

  html += '</div>';
  container.innerHTML = html;
}

function renderRiskBar(label, pct, color) {
  return `
    <div class="space-y-1">
      <div class="flex justify-between text-[10px] font-bold"><span class="text-[#6B7280]">${label}</span> <span style="color:${color}">${pct}%</span></div>
      <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div class="h-full rounded-full" style="width: ${pct*10}%; background-color: ${color}"></div>
      </div>
    </div>
  `;
}

function renderBranchRows(branches, loans, clients) {
  return branches.map(b => {
    var bLoans = loans.filter(l => l.branchId === b.id && (l.status === 'Active' || l.status === 'Disbursed'));
    var portfolio = bLoans.reduce((sum, l) => sum + (l.requestedAmount || 0), 0);
    var bClients = clients.filter(c => c.branchId === b.id && c.status === 'Active').length;
    var par30 = b.branchCode === 'KRG' ? 6.8 : (b.branchCode === 'ZBA' ? 5.2 : 3.1);
    var status = par30 > 5 ? '🔴' : (par30 > 4 ? '🟡' : '🟢');

    return `
      <tr class="hover:bg-[#F5F6FA] cursor-pointer group" onclick="showBranchDetailModal('${b.id}')">
        <td class="px-6 py-4 font-black text-[#1E3A8A] text-xs">${b.branchName}</td>
        <td class="px-6 py-4 text-right font-mono font-bold text-[#1F2937]">${formatCurrency(portfolio)}</td>
        <td class="px-6 py-4 text-center font-bold text-[#6B7280]">${bClients}</td>
        <td class="px-6 py-4 text-center font-black ${par30 > 5 ? 'text-[#DC2626]' : 'text-[#059669]' } text-xs">${par30}%</td>
        <td class="px-6 py-4 text-center text-lg">${status}</td>
        <td class="px-6 py-4 text-right">
           <span class="text-[#1E3A8A] text-[9px] font-black group-hover:underline">ANALYSIS →</span>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 3.1 FINANCE MANAGER DASHBOARD (Matias Kafinyangwe)
 */
function renderFinanceDashboard(container, options) {
  var vouchers = getCollection(StorageKeys.VOUCHERS) || [];
  var cashBalance = getValue(StorageKeys.CASH_BALANCE) || 14500000;

  var html = '<div class="space-y-6 pb-20">';
  html += `
    <div class="bg-white rounded-2xl border border-[#d1d5db] p-8">
      <h1 class="text-xl font-bold text-[#1E3A8A] mb-1">Finance Manager Dashboard</h1>
      <p class="text-sm text-[#6B7280]">Reporting for Mr. Matias Kafinyangwe</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div class="p-6 bg-[#1E3A8A] rounded-2xl text-white shadow-xl">
           <div class="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Liquidity</div>
           <div class="text-3xl font-black mt-1">${formatCurrency(cashBalance)}</div>
           <div class="text-[10px] mt-4 font-bold bg-white/20 inline-block px-2 py-1 rounded">▲ +MWK 1.2M vs Yesterday</div>
        </div>
        <div class="p-6 bg-white border border-[#d1d5db] rounded-2xl">
           <div class="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">GL Status</div>
           <div class="text-xl font-black text-[#1F2937] mt-1">Balanced ✓</div>
           <p class="text-[10px] text-[#059669] font-bold mt-2">Reconciled: June 10, 2026</p>
        </div>
        <div class="p-6 bg-white border border-[#d1d5db] rounded-2xl">
           <div class="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">RBM Submission</div>
           <div class="text-xl font-black text-[#D97706] mt-1">6 Days Left</div>
           <p class="text-[10px] text-[#6B7280] font-bold mt-2">Q2 Quarterly Reports</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div class="bg-white rounded-2xl border border-[#d1d5db] p-6">
          <h3 class="text-xs font-black uppercase tracking-widest text-[#1F2937] mb-6">Cash Flow Projection (30 Days)</h3>
          <div class="space-y-6">
             <div>
               <div class="flex justify-between text-xs font-bold mb-2"><span>Expected Collections</span> <span class="text-[#059669]">MWK 8.5M</span></div>
               <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div class="bg-[#059669] h-full" style="width: 85%"></div></div>
             </div>
             <div>
               <div class="flex justify-between text-xs font-bold mb-2"><span>Expected Disbursements</span> <span class="text-[#DC2626]">MWK 6.2M</span></div>
               <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div class="bg-[#DC2626] h-full" style="width: 62%"></div></div>
             </div>
             <div class="p-4 bg-[#E0E7FF] rounded-xl flex justify-between items-center">
                <span class="text-xs font-black text-[#1E3A8A]">NET POSITION</span>
                <span class="text-xl font-black text-[#1E3A8A]">+MWK 2.3M</span>
             </div>
          </div>
       </div>

       <div class="bg-white rounded-2xl border border-[#d1d5db] p-6">
          <h3 class="text-xs font-black uppercase tracking-widest text-[#1F2937] mb-6">Exceptions & Alerts</h3>
          <div class="space-y-3">
             <div class="p-3 bg-[#FEF2F2] rounded-xl border border-[#fecaca] flex items-center gap-3">
                <span class="text-lg">⚠️</span>
                <div class="text-xs">
                   <p class="font-bold text-[#991B1B]">Branch cash limit exceeded: Blantyre</p>
                   <p class="text-[#6B7280]">MWK 850K vs Limit MWK 500K</p>
                </div>
             </div>
             <div class="p-3 bg-[#fffbeb] rounded-xl border border-[#fde68a] flex items-center gap-3">
                <span class="text-lg">🔎</span>
                <div class="text-xs">
                   <p class="font-bold text-[#92400E]">Unusual Expense: Karonga</p>
                   <p class="text-[#6B7280]">MWK 180K "consulting fee" (no PO)</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  `;
  html += '</div>';
  container.innerHTML = html;
}

/**
 * 3.2 INTERNAL AUDIT DASHBOARD (Yuki Kafinyangwe)
 */
function renderAuditDashboard(container, options) {
  var auditLog = getCollection(StorageKeys.AUDIT_LOG) || [];

  var html = '<div class="space-y-6 pb-20">';
  html += `
    <div class="bg-[#1F2937] rounded-3xl p-8 text-white shadow-2xl">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-black uppercase tracking-tighter">Audit Intelligence Terminal</h1>
          <p class="text-gray-400 text-sm">Auditor: Mrs. Yuki Kafinyangwe • READ-ONLY MODE</p>
        </div>
        <div class="bg-[#DC2626] px-3 py-1 rounded-full text-[10px] font-black animate-pulse">LIVE MONITORING</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
           <div class="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Anomalies</div>
           <div class="text-3xl font-black text-[#DC2626]">12</div>
        </div>
        <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
           <div class="text-[9px] uppercase font-bold text-gray-400 tracking-widest">High Risk</div>
           <div class="text-3xl font-black text-[#D97706]">3</div>
        </div>
        <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
           <div class="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Logged Events</div>
           <div class="text-3xl font-black text-[#059669]">14.2K</div>
        </div>
        <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
           <div class="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Integrity</div>
           <div class="text-3xl font-black text-white">99.8%</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-[#d1d5db] p-6">
       <h3 class="text-xs font-black uppercase tracking-widest text-[#1F2937] mb-6">Critical Anomalies detected</h3>
       <div class="space-y-4">
          <div class="flex items-start gap-4 p-4 border-l-4 border-[#DC2626] bg-[#FEF2F2] rounded-r-xl">
             <div class="p-2 bg-white rounded-lg shadow-sm">🔴</div>
             <div class="flex-1">
                <p class="text-sm font-black text-[#1F2937]">Loan #2847: Missing Documentation</p>
                <p class="text-xs text-[#6B7280]">MWK 2.5M disbursed to client with no NRC on file. Branch: Lilongwe</p>
             </div>
             <button class="text-[10px] font-black text-[#1E3A8A] hover:underline">FLAG FOR MD</button>
          </div>
          <div class="flex items-start gap-4 p-4 border-l-4 border-[#DC2626] bg-[#FEF2F2] rounded-r-xl">
             <div class="p-2 bg-white rounded-lg shadow-sm">🔴</div>
             <div class="flex-1">
                <p class="text-sm font-black text-[#1F2937]">User Privilege Escalation</p>
                <p class="text-xs text-[#6B7280]">Admin access granted to Loan Officer (Charles Mwase) in Karonga branch by Manager.</p>
             </div>
             <button class="text-[10px] font-black text-[#1E3A8A] hover:underline">INVESTIGATE</button>
          </div>
       </div>
    </div>
  `;
  html += '</div>';
  container.innerHTML = html;
}

/**
 * 3.3 BRANCH MANAGER DASHBOARD
 */
function renderBranchManagerDashboard(container, options) {
  var branchId = (options && options.branchId) || 'MZE';

  var html = '<div class="space-y-6 pb-20">';
  html += `
    <div class="bg-white rounded-2xl border border-[#d1d5db] p-8 border-t-8 border-t-[#1E3A8A]">
      <div class="flex justify-between items-center">
        <div>
           <h1 class="text-xl font-bold text-[#1F2937]">Branch Manager Control Centre</h1>
           <p class="text-sm text-[#6B7280]">Focus: Operations & Field Team Productivity</p>
        </div>
        <div class="text-right">
           <div class="text-lg font-black text-[#1E3A8A]">Blantyre Branch</div>
           <p class="text-[10px] font-bold text-[#6B7280]">Manager: Mrs. Esnart Tembo</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
         <div class="p-4 bg-gray-50 rounded-2xl">
            <div class="flex justify-between text-[10px] font-bold text-[#6B7280] mb-2 uppercase">Collections <span>69%</span></div>
            <div class="w-full bg-white h-2 rounded-full border border-gray-100 overflow-hidden"><div class="bg-[#D97706] h-full" style="width: 69%"></div></div>
            <p class="text-[10px] mt-2 font-medium">MWK 125K of 180K target</p>
         </div>
         <div class="p-4 bg-gray-50 rounded-2xl">
            <div class="flex justify-between text-[10px] font-bold text-[#6B7280] mb-2 uppercase">Disbursements <span>67%</span></div>
            <div class="w-full bg-white h-2 rounded-full border border-gray-100 overflow-hidden"><div class="bg-[#D97706] h-full" style="width: 67%"></div></div>
            <p class="text-[10px] mt-2 font-medium">2 of 3 daily target</p>
         </div>
         <div class="p-4 bg-gray-50 rounded-2xl">
            <div class="flex justify-between text-[10px] font-bold text-[#6B7280] mb-2 uppercase">New Clients <span>60%</span></div>
            <div class="w-full bg-white h-2 rounded-full border border-gray-100 overflow-hidden"><div class="bg-[#D97706] h-full" style="width: 60%"></div></div>
            <p class="text-[10px] mt-2 font-medium">3 of 5 daily target</p>
         </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-[#d1d5db] p-6">
       <h3 class="text-xs font-black uppercase tracking-widest text-[#1F2937] mb-6">Loans requiring action</h3>
       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border border-[#d1d5db] rounded-2xl hover:border-[#1E3A8A] transition-colors">
             <div class="text-[10px] font-black text-[#1E3A8A] uppercase">Pending Approval (1)</div>
             <p class="text-sm font-bold mt-1">James Phiri — MWK 200,000</p>
             <div class="mt-4 flex gap-2">
                <button class="flex-1 py-1.5 bg-[#1E3A8A] text-white text-[10px] font-bold rounded-lg uppercase">Approve</button>
                <button class="flex-1 py-1.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-bold rounded-lg uppercase">View</button>
             </div>
          </div>
          <div class="p-4 border border-[#d1d5db] rounded-2xl bg-[#FEF2F2]">
             <div class="text-[10px] font-black text-[#DC2626] uppercase">Critical Overdue (3)</div>
             <p class="text-sm font-bold mt-1">Bertha Mwale — 12 Days late</p>
             <div class="mt-4 flex gap-2">
                <button class="flex-1 py-1.5 bg-[#DC2626] text-white text-[10px] font-bold rounded-lg uppercase">Call Field Officer</button>
             </div>
          </div>
       </div>
    </div>
  `;
  html += '</div>';
  container.innerHTML = html;
}

function renderGenericDashboard(container, options) {
  container.innerHTML = '<div class="p-12 text-center text-gray-400">Loading Dashboard...</div>';
}

/**
 * MODALS & DRILL-DOWNS
 */
function showBranchDetailModal(branchId) {
  var branches = getCollection(StorageKeys.BRANCHES);
  var b = branches.find(x => x.id === branchId);
  if (!b) return;

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-[#1F2937]/80 backdrop-blur-md p-4';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
      <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-[#F5F6FA]">
        <div>
           <h2 class="text-2xl font-black text-[#1E3A8A] uppercase tracking-tighter">${b.branchName} — Branch Intelligence</h2>
           <p class="text-sm text-[#6B7280]">Manager: ${b.managerName} • Q2 Variance Analysis</p>
        </div>
        <button class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1F2937] transition-colors" id="close-modal-btn">✕</button>
      </div>

      <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
           ${renderMetricMini('Portfolio', 'MWK 18.5M', '-3%', 'down')}
           ${renderMetricMini('Clients', '210', '▲ 5', 'up')}
           ${renderMetricMini('NPL Rate', '4.2%', '▼ 0.2', 'up')}
           ${renderMetricMini('Efficiency', '78%', '▲ 3%', 'up')}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <h4 class="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4">Branch Product Mix</h4>
              <div class="space-y-2 text-xs">
                 <div class="flex justify-between font-bold"><span>Payday Loans</span> <span>65%</span></div>
                 <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div class="bg-[#1E3A8A] h-full w-[65%]"></div></div>
                 <div class="flex justify-between font-bold mt-4"><span>Business Loans</span> <span>25%</span></div>
                 <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div class="bg-[#1E3A8A] h-full w-[25%]"></div></div>
              </div>
           </div>
           <div>
              <h4 class="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4">Branch Team Performance</h4>
              <div class="space-y-3">
                 <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#1E3A8A] flex items-center justify-center font-bold text-[10px]">BM</div>
                    <div class="flex-1"><p class="text-xs font-bold text-[#1F2937]">Bertha Mwale</p><p class="text-[8px] text-[#6B7280]">42 Clients • PAR 5.2%</p></div>
                    <div class="text-[10px] font-bold text-[#D97706]">🟡 WATCH</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div class="p-6 bg-gray-50 flex justify-end gap-3">
         <button class="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest" id="close-modal-alt">Close</button>
         <button class="px-6 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold uppercase tracking-widest">Branch P&L Report</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  document.getElementById('close-modal-btn').onclick = closeModal;
  document.getElementById('close-modal-alt').onclick = closeModal;
}

function renderMetricMini(label, val, trend, dir) {
  var color = dir === 'up' ? '#059669' : '#DC2626';
  return `
    <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
       <div class="text-[9px] uppercase font-bold text-[#6B7280]">${label}</div>
       <div class="text-lg font-black text-[#1F2937] mt-1">${val}</div>
       <div class="text-[9px] font-bold mt-1" style="color:${color}">${trend}</div>
    </div>
  `;
}

window.renderDashboard = renderDashboard;
