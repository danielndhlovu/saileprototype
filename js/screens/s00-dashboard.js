/**
 * Dashboard Screen
 * Handles role-specific dashboard rendering and logic.
 * Integrated from Saile EIS Enhanced Prototype.
 */

function renderDashboard(container, opts) {
  const user = getValue(StorageKeys.SESSION);
  if (!user) return;

  const role = user.role;

  // Clear previous content
  container.innerHTML = '';

  // Role-based dispatcher
  switch (role) {
    case 'md':
      renderMDDashboard(container, user);
      break;
    case 'finance_manager':
      renderFMDashboard(container, user);
      break;
    case 'auditor':
      renderAuditorDashboard(container, user);
      break;
    case 'branch_manager':
      renderBMDashboard(container, user);
      break;
    case 'admin':
      renderAdminDashboard(container, user);
      break;
    case 'accountant':
      renderAccountantDashboard(container, user);
      break;
    case 'loan_officer':
      renderLODashboard(container, user);
      break;
    default:
      renderDefaultDashboard(container, user);
  }

  // Initialize common UI elements
  initDashboardListeners();
  renderFAB();
}

/**
 * MD / Executive Dashboard
 */
function renderMDDashboard(container, user) {
  const stats = calculateDashboardStats();
  const par = calculatePAR();
  const branches = getCollection(StorageKeys.BRANCHES);
  const loans = getCollection(StorageKeys.LOANS);

  container.innerHTML = `
    <div class="dashboard-view active" id="view-executive">
      <!-- Sticky Section Nav -->
      <div class="sticky-section-nav" style="margin:-24px -24px 24px;padding-left:24px;">
        <div class="sec-nav-item active" onclick="scrollToSection('brief')">Morning Brief</div>
        <div class="sec-nav-item" onclick="scrollToSection('portfolio')">Portfolio Quality</div>
        <div class="sec-nav-item" onclick="scrollToSection('branches')">Branch Scorecard</div>
        <div class="sec-nav-item" onclick="scrollToSection('products')">Product Mix</div>
        <div class="sec-nav-item" onclick="scrollToSection('financial')">Financial</div>
        <div class="sec-nav-item" onclick="scrollToSection('efficiency')">Efficiency</div>
        <div class="sec-nav-item" onclick="scrollToSection('compliance')">Compliance</div>
        <div class="sec-nav-item" onclick="scrollToSection('alerts-config')">Alerts</div>
        <div class="sec-nav-item" onclick="scrollToSection('scenarios')">Scenarios</div>
        <div class="sec-nav-item" onclick="scrollToSection('benchmarks')">Benchmarks</div>
      </div>

      <!-- SECTION 1: Morning Brief -->
      <div class="section-gap" id="brief">
        <div class="section-header">
          <div>
            <div class="section-title">Good morning, Mr. Kafinyangwe 👋</div>
            <div class="section-meta" id="brief-date-sub">${escapeHtml(getFormattedFullDate())} · Q2 2026, Week 25</div>
          </div>
          <div class="section-actions">
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" onclick="setPeriod('today')">Today</button>
              <button class="btn btn-secondary btn-sm" onclick="setPeriod('week')">Week</button>
              <button class="btn btn-primary btn-sm" onclick="setPeriod('month')">This Month</button>
              <button class="btn btn-secondary btn-sm" onclick="setPeriod('quarter')">Quarter</button>
              <button class="btn btn-secondary btn-sm" onclick="setPeriod('year')">YTD</button>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="refreshDashboard(this)">🔄 Refresh</button>
            <button class="btn btn-secondary btn-sm" onclick="showAIInsights()">🤖 AI Insights</button>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="grid-4 mb-16">
          <div class="kpi-card">
            <div class="kpi-label">Portfolio Outstanding</div>
            <div class="kpi-value kpi-lg">${escapeHtml(formatCurrency(par.totalOutstanding))}</div>
            <div class="kpi-trend trend-up">▲ +2.1% MoM</div>
            <div class="kpi-sub">vs last month</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Active Clients</div>
            <div class="kpi-value kpi-lg">${escapeHtml(stats.activeClients.toString())}</div>
            <div class="kpi-trend trend-up">▲ +12 MoM</div>
            <div class="kpi-sub">vs last month</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Active Loans</div>
            <div class="kpi-value kpi-lg">${escapeHtml(stats.activeLoans.toString())}</div>
            <div class="kpi-trend trend-up">▲ +8 MoM</div>
            <div class="kpi-sub">vs last month</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">PAR 30</div>
            <div class="kpi-value kpi-lg" style="color:var(--amber)">${escapeHtml(formatPercentage(par.par1_30_pct))}</div>
            <div class="kpi-trend trend-down">▲ +0.3pp MoM</div>
            <div class="kpi-sub">Target: &lt;5%</div>
          </div>
        </div>

        <!-- Alerts -->
        <div class="card">
          <div class="card-title">⚠️ 4 Alerts Requiring Your Attention <span class="card-subtitle" style="font-size:11px">· Auto-refreshes every 5 min</span></div>
          <div class="alert-bar critical" onclick="openDashboardModal('branch-detail-karonga')">
            <span>🔴</span>
            <div>
              <div class="alert-bar-title">Karonga Branch PAR 30 at 6.8% — above 5% threshold</div>
              <div class="alert-bar-desc">Branch Manager: Geoffrey Ngwira · LOs: Bertha Mwale (5.2%), Charles Mwase (8.4%) — Click to review branch detail</div>
            </div>
            <span style="margin-left:auto;font-size:16px">→</span>
          </div>
          <div class="alert-bar warning" onclick="openDashboardModal('pending-approvals')">
            <span>🟡</span>
            <div>
              <div class="alert-bar-title">4 loans pending MD approval &gt;48 hours (total: MWK 2.4M)</div>
              <div class="alert-bar-desc">Oldest: 52 hours · Lilongwe x2, Mzuzu x1, Blantyre x1 — Click to approve</div>
            </div>
            <span style="margin-left:auto;font-size:16px">→</span>
          </div>
          <div class="alert-bar warning" onclick="scrollToSection('compliance')">
            <span>🟡</span>
            <div>
              <div class="alert-bar-title">Q2 RBM Reports due in 14 days — 3 of 4 pending</div>
              <div class="alert-bar-desc">RBM-003, RBM-004, RBM-008 not yet submitted — Click to view compliance tracker</div>
            </div>
            <span style="margin-left:auto;font-size:16px">→</span>
          </div>
          <div class="alert-bar healthy" onclick="openDashboardModal('full-risk-report')">
            <span>🟢</span>
            <div>
              <div class="alert-bar-title">Provision Coverage 103% — RBM Minimum Met</div>
              <div class="alert-bar-desc">Actual provision meets required capital buffer. Strong capital buffer.</div>
            </div>
            <span style="margin-left:auto;font-size:16px">→</span>
          </div>
        </div>
      </div>

      <!-- SECTION 2: Portfolio Quality -->
      <div class="section-gap" id="portfolio">
        <div class="section-header">
          <div>
            <div class="section-title">📊 Portfolio Quality — Risk Thermometer</div>
            <div class="section-meta">Last updated: Today, 06:00 AM · Next snapshot: 06:00 AM tomorrow</div>
          </div>
          <div class="section-actions">
            <button class="btn btn-secondary btn-sm" onclick="refreshDashboard(this)">🔄 Refresh</button>
            <button class="btn btn-primary btn-sm" onclick="openDashboardModal('full-risk-report')">📄 Full Risk Report</button>
          </div>
        </div>

        <div class="grid-2 mb-16">
          <!-- PAR Composition -->
          <div class="card">
            <div class="card-title">PAR Composition <span class="card-subtitle">Click any bar to drill-down</span></div>
            <div class="par-row" onclick="openDashboardModal('par-drilldown-1-30')" style="cursor:pointer">
              <span class="par-label">PAR 1–30</span>
              <div class="par-bar-track"><div class="par-bar-fill" style="width:${par.par1_30_pct}%;background:var(--amber)"></div></div>
              <span class="par-value" style="color:var(--amber)">${escapeHtml(formatPercentage(par.par1_30_pct))}</span>
              <span class="par-status">🟡</span>
            </div>
            <div class="par-row" onclick="openDashboardModal('par-drilldown-31-60')" style="cursor:pointer">
              <span class="par-label">PAR 31–60</span>
              <div class="par-bar-track"><div class="par-bar-fill" style="width:${par.par31_60_pct}%;background:var(--amber)"></div></div>
              <span class="par-value" style="color:var(--amber)">${escapeHtml(formatPercentage(par.par31_60_pct))}</span>
              <span class="par-status">🟡</span>
            </div>
            <div class="par-row" onclick="openDashboardModal('par-drilldown-61-90')" style="cursor:pointer">
              <span class="par-label">PAR 61–90</span>
              <div class="par-bar-track"><div class="par-bar-fill" style="width:${par.par61_90_pct}%;background:var(--green)"></div></div>
              <span class="par-value" style="color:var(--green)">${escapeHtml(formatPercentage(par.par61_90_pct))}</span>
              <span class="par-status">🟢</span>
            </div>
            <div class="par-row" onclick="openDashboardModal('par-drilldown-90plus')" style="cursor:pointer">
              <span class="par-label">PAR 90+</span>
              <div class="par-bar-track"><div class="par-bar-fill" style="width:${par.par90plus_pct}%;background:var(--red)"></div></div>
              <span class="par-value" style="color:var(--red)">${escapeHtml(formatPercentage(par.par90plus_pct))}</span>
              <span class="par-status">🟢</span>
            </div>
            <div class="par-row">
              <span class="par-label">Write-offs</span>
              <div class="par-bar-track"><div class="par-bar-fill" style="width:2%;background:var(--text-muted)"></div></div>
              <span class="par-value" style="color:var(--text-muted)">0.1%</span>
              <span class="par-status">🟢</span>
            </div>
            <hr class="divider">
            <div class="flex justify-between items-center">
              <span class="muted small">Target PAR 30: &lt;5%</span>
              <span class="pill pill-amber">🟡 Approaching</span>
            </div>
          </div>

          <!-- PAR Trend Chart -->
          <div class="card">
            <div class="card-title">PAR Trend — Last 12 Months <span class="card-subtitle">Target line at 5%</span></div>
            <div class="chart-wrap" style="height:160px">
              <canvas id="par-trend-chart"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Provision Adequacy &amp; Write-off Status</div>
          <div class="grid-4">
            <div>
              <div class="kpi-label">Required Provision</div>
              <div class="kpi-value" style="font-size:22px">MWK 3.1M</div>
              <div class="small muted">RBM-based calculation</div>
            </div>
            <div>
              <div class="kpi-label">Actual Provision Held</div>
              <div class="kpi-value" style="font-size:22px;color:var(--green)">MWK 3.2M</div>
              <div class="small muted">Coverage: 103%</div>
            </div>
            <div>
              <div class="kpi-label">Write-off Risk (PAR 90+)</div>
              <div class="kpi-value" style="font-size:22px;color:var(--amber)">MWK 1.8M</div>
              <div class="small muted">2.4% of portfolio</div>
            </div>
            <div>
              <div class="kpi-label">Recovery Rate YTD</div>
              <div class="kpi-value" style="font-size:22px;color:var(--amber)">34%</div>
              <div class="small muted">Target: 40% · Below target</div>
            </div>
          </div>
          <hr class="divider">
          <div class="flex gap-12 flex-wrap items-center">
            <span class="pill pill-green">✓ Coverage Ratio: 103%</span>
            <span class="pill pill-green">✓ RBM Minimum 100% Met</span>
            <span class="pill pill-amber">⚠ Recovery Rate Below Target</span>
          </div>
        </div>
      </div>

      <!-- SECTION 3: Branch Scorecard -->
      <div class="section-gap" id="branches">
        <div class="section-header">
          <div>
            <div class="section-title">🏦 Branch Performance Scorecard — Q2 2026</div>
            <div class="section-meta">Click column header to sort · Click branch name for detail</div>
          </div>
          <div class="section-actions">
            <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('branch-table', 'saile-branch-scorecard-q2-2026')">📥 Export CSV</button>
            <button class="btn btn-secondary btn-sm" onclick="simulateExportPDF()">📄 Export PDF</button>
            <button class="btn btn-primary btn-sm" onclick="openDashboardModal('set-targets')">🎯 Set Targets</button>
          </div>
        </div>

        <div class="card">
          <div class="tbl-wrap">
            <table id="branch-table">
              <thead>
                <tr>
                  <th onclick="sortTable('branch-table',0)">Branch ↕</th>
                  <th onclick="sortTable('branch-table',1)">Portfolio ↕</th>
                  <th onclick="sortTable('branch-table',2)">Clients ↕</th>
                  <th onclick="sortTable('branch-table',3)">Avg Loan ↕</th>
                  <th onclick="sortTable('branch-table',4)">Disbursed ↕</th>
                  <th onclick="sortTable('branch-table',5)">Collected ↕</th>
                  <th onclick="sortTable('branch-table',6)">PAR 30 ↕</th>
                  <th onclick="sortTable('branch-table',7)">Status</th>
                  <th>Trend</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                 ${branches.map(b => {
                    const branchLoans = loans.filter(l => l.branchId === b.id);
                    const branchPortfolio = branchLoans.reduce((sum, l) => sum + (l.approvedAmount || 0), 0);
                    const branchClients = branchLoans.length + 50;
                    const branchAvg = branchClients > 0 ? (branchPortfolio + 1000000) / branchClients : 0;

                    const isKaronga = b.branchName.includes('Karonga');
                    const isLilongwe = b.branchName.includes('Lilongwe');

                    const portStr = isKaronga ? 'MWK 4.2M' : (isLilongwe ? 'MWK 22.1M' : formatCurrency(branchPortfolio/10).split('.')[0] + 'K');
                    const clientCount = isKaronga ? 85 : (isLilongwe ? 198 : branchClients);
                    const parVal = isKaronga ? '6.8%' : (isLilongwe ? '3.1%' : '4.2%');
                    const statusPill = isKaronga ? '<span class="pill pill-red">🔴 Critical</span>' : '<span class="pill pill-green">🟢 Healthy</span>';
                    const rowClass = isKaronga ? 'class="tbl-row-highlight"' : '';

                    return `
                      <tr ${rowClass}>
                        <td><b>${escapeHtml(b.branchName.split('-')[0].trim())}</b><div class="small muted">Mgr: ${escapeHtml(b.managerName)}</div></td>
                        <td>${escapeHtml(portStr)}</td>
                        <td>${clientCount}</td>
                        <td>${escapeHtml(formatCurrency(branchAvg).split('.')[0])}</td>
                        <td>MWK 1.5M</td>
                        <td>MWK 1.2M</td>
                        <td><span class="${isKaronga ? 'text-red' : 'text-green'} bold">${parVal}</span></td>
                        <td>${statusPill}</td>
                        <td><span class="${isKaronga ? 'text-red' : 'text-green'} bold">${isKaronga ? '▼' : '▲'}</span></td>
                        <td><button class="btn btn-sm btn-secondary" onclick="openDashboardModal('branch-detail-${b.id}')">View</button></td>
                      </tr>
                    `;
                 }).join('')}
              </tbody>
              <tfoot>
                <tr style="background:#F9FAFB;font-weight:700;">
                  <td>TOTAL / AVERAGE</td>
                  <td>MWK 75.2M</td><td>850</td><td>MWK 88,471</td>
                  <td>MWK 26.3M</td><td>MWK 25.2M</td>
                  <td>4.2%</td><td></td><td><span class="text-green bold">▲</span></td><td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- SECTION 4: Product Mix -->
      <div class="section-gap" id="products">
        <div class="section-header">
          <div>
            <div class="section-title">💼 Product Mix &amp; Performance</div>
            <div class="section-meta">Bubble chart: X=Risk (PAR30) · Y=Growth · Size=Portfolio</div>
          </div>
          <div class="section-actions">
            <button class="btn btn-secondary btn-sm" onclick="compareProducts()">📊 Compare Products</button>
            <button class="btn btn-primary btn-sm" onclick="openDashboardModal('model-product')">🔬 Model New Product</button>
          </div>
        </div>

        <div class="grid-2 mb-16">
          <div class="card">
            <div class="card-title">Portfolio Composition</div>
            <div class="chart-wrap" style="height:200px">
              <canvas id="product-donut-chart"></canvas>
            </div>
            <div class="bubble-legend mt-12" id="product-legend"></div>
          </div>
          <div class="card">
            <div class="card-title">Product Performance Matrix <span class="card-subtitle">Lower-right = ideal (low risk, high growth)</span></div>
            <div class="chart-wrap" style="height:200px">
              <canvas id="product-bubble-chart"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th><th>Portfolio</th><th>% Total</th>
                  <th>Avg Loan</th><th>PAR 30</th><th>Growth YoY</th>
                  <th>NIM</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Payday Loan</b></td><td>MWK 30.1M</td><td>40.0%</td><td>MWK 45,000</td><td><span class="text-green">2.1%</span></td><td class="text-green">+18%</td><td>22%</td><td><span class="pill pill-green">🟢</span></td></tr>
                <tr><td><b>SML (6-Month)</b></td><td>MWK 18.8M</td><td>25.0%</td><td>MWK 125,000</td><td><span class="text-green">3.8%</span></td><td class="text-green">+12%</td><td>18%</td><td><span class="pill pill-green">🟢</span></td></tr>
                <tr><td><b>Business Loan</b></td><td>MWK 11.3M</td><td>15.0%</td><td>MWK 350,000</td><td><span class="text-amber">5.2%</span></td><td class="text-green">+8%</td><td>15%</td><td><span class="pill pill-amber">🟡</span></td></tr>
                <tr class="tbl-row-highlight"><td><b>Enterprise</b></td><td>MWK 1.5M</td><td>2.0%</td><td>MWK 750,000</td><td><span class="text-red">6.8%</span></td><td class="text-red">-3%</td><td>10%</td><td><span class="pill pill-red">🔴</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="mt-12">
            <div class="alert-bar critical" style="margin-bottom:8px">⚠️ Enterprise Loan PAR elevated at 6.8% · Review large exposure policy</div>
            <div class="alert-bar" style="background:#EFF6FF;margin-bottom:0">💡 Executive Scheme growing fastest (+22%) · Consider increasing cap</div>
          </div>
        </div>
      </div>

      <!-- SECTION 5: Financial Performance -->
      <div class="section-gap" id="financial">
        <div class="section-header">
          <div>
            <div class="section-title">💰 Financial Performance — YTD 2026</div>
            <div class="section-meta">Period: January 1 – June 17, 2026</div>
          </div>
          <div class="section-actions">
            <button class="btn btn-primary btn-sm" onclick="openDashboardModal('full-pl')">📋 View Full P&amp;L</button>
            <button class="btn btn-secondary btn-sm" onclick="openDashboardModal('balance-sheet')">📊 Balance Sheet</button>
          </div>
        </div>

        <div class="grid-4 mb-16">
          <div class="kpi-card">
            <div class="kpi-label">Total Revenue YTD</div>
            <div class="kpi-value" style="font-size:22px;color:var(--green)">MWK 12.4M</div>
            <div class="kpi-trend trend-up">▲ +18.5% YoY</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Expenses YTD</div>
            <div class="kpi-value" style="font-size:22px;color:var(--amber)">MWK 8.9M</div>
            <div class="kpi-trend trend-down">▲ +12.1% YoY</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Net Income YTD</div>
            <div class="kpi-value" style="font-size:22px;color:var(--blue-dark)">MWK 3.5M</div>
            <div class="kpi-trend trend-up">▲ +37.3% YoY</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Return on Equity</div>
            <div class="kpi-value" style="font-size:22px;color:var(--blue-dark)">18.2%</div>
            <div class="kpi-trend trend-up">▲ +2.1pp YoY</div>
          </div>
        </div>

        <div class="grid-2 mb-16">
          <div class="card">
            <div class="card-title">Revenue vs. Expenses — Monthly</div>
            <div class="chart-wrap" style="height:180px">
              <canvas id="fin-bar-chart"></canvas>
            </div>
          </div>
          <div class="card">
            <div class="card-title">Profitability Trend — 12 Months</div>
            <div class="chart-wrap" style="height:180px">
              <canvas id="profit-trend-chart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 9: Scenario Modeling -->
      <div class="section-gap" id="scenarios">
        <div class="section-header">
          <div>
            <div class="section-title">🔬 What-If Scenario Modeling</div>
            <div class="section-meta">Interactive business decision modeling · Real-time output</div>
          </div>
          <div class="section-actions">
            <button class="btn btn-secondary btn-sm">📁 Saved Scenarios</button>
            <button class="btn btn-primary btn-sm" onclick="saveScenario()">📥 Export to PDF</button>
          </div>
        </div>
        <div class="card">
          <div class="grid-2" style="gap:24px">
            <div>
              <div class="semibold mb-12">Scenario Inputs</div>
              <div class="slider-group">
                <div class="slider-label"><span>New Loan Officers Hired</span><span id="sl-los-val" class="text-blue bold">3</span></div>
                <input type="range" min="0" max="10" value="3" id="sl-los" oninput="updateScenario()">
              </div>
              <div class="slider-group">
                <div class="slider-label"><span>Portfolio Growth Target (%)</span><span id="sl-growth-val" class="text-blue bold">15%</span></div>
                <input type="range" min="0" max="50" value="15" id="sl-growth" oninput="updateScenario()">
              </div>
              <div class="slider-group">
                <div class="slider-label"><span>Interest Rate Change (pp)</span><span id="sl-rate-val" class="text-blue bold">+0pp</span></div>
                <input type="range" min="-5" max="5" value="0" id="sl-rate" oninput="updateScenario()">
              </div>
              <div class="slider-group">
                <div class="slider-label"><span>PAR Stress Scenario (pp increase)</span><span id="sl-par-val" class="text-blue bold">+0pp</span></div>
                <input type="range" min="0" max="10" value="0" id="sl-par" oninput="updateScenario()">
              </div>
              <div class="slider-group">
                <div class="slider-label"><span>New Branch (setup cost MWK M)</span><span id="sl-branch-val" class="text-blue bold">0M</span></div>
                <input type="range" min="0" max="10" value="0" id="sl-branch" oninput="updateScenario()">
              </div>
            </div>
            <div>
              <div class="semibold mb-12">Projected Outputs (12-month)</div>
              <div class="scenario-output-grid">
                <div class="scenario-output-card">
                  <div class="scenario-output-label">Portfolio</div>
                  <div class="scenario-output-val" id="sc-portfolio">MWK 87.3M</div>
                  <div class="scenario-output-delta text-green" id="sc-portfolio-d">▲ +15% (compound)</div>
                </div>
                <div class="scenario-output-card">
                  <div class="scenario-output-label">Active Clients</div>
                  <div class="scenario-output-val" id="sc-clients">1044</div>
                  <div class="scenario-output-delta text-green" id="sc-clients-d">▲ +194 vs today</div>
                </div>
                <div class="scenario-output-card">
                  <div class="scenario-output-label">Net Income</div>
                  <div class="scenario-output-val" id="sc-income">MWK 4.4M</div>
                  <div class="scenario-output-delta text-green" id="sc-income-d">▲ +45.2%</div>
                </div>
                <div class="scenario-output-card">
                  <div class="scenario-output-label">PAR 30</div>
                  <div class="scenario-output-val" id="sc-par">4.2%</div>
                  <div class="scenario-output-delta text-green" id="sc-par-d">→ No change</div>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm mt-12" onclick="saveScenario()">💾 Save This Scenario</button>
            </div>
          </div>
        </div>
      </div>

      <div class="back-to-top" onclick="window.scrollTo(0,0)">⬆️ Back to Top</div>
    </div>
  `;

  setTimeout(() => {
    initMDCharts();
    updateScenario();
    observeSections();
  }, 100);
}

/**
 * Finance Manager Dashboard
 */
function renderFMDashboard(container, user) {
  const cashBalance = getValue(StorageKeys.CASH_BALANCE) || 0;
  container.innerHTML = `
    <div class="dashboard-view active" id="view-finance">
      <div class="section-header">
        <div>
          <div class="section-title">Finance Manager Dashboard</div>
          <div class="section-meta">Matias Kafinyangwe · All Branches · <span class="pill pill-blue">Finance Manager</span></div>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary btn-sm" onclick="generateRBMReport(this)">📋 Generate RBM Report</button>
          <button class="btn btn-secondary btn-sm" onclick="location.hash='#/accounting'">📊 View GL</button>
        </div>
      </div>

      <!-- Cash Position -->
      <div class="card mb-16">
        <div class="card-title">💵 Cash Position — Today</div>
        <div class="grid-4">
          <div class="kpi-card"><div class="kpi-label">Bank Accounts</div><div class="kpi-value" style="font-size:22px;color:var(--blue-dark)">MWK 12.4M</div><div class="kpi-trend trend-up">▲ +MWK 0.8M vs yesterday</div></div>
          <div class="kpi-card"><div class="kpi-label">Cash on Hand (All Branches)</div><div class="kpi-value" style="font-size:22px">${escapeHtml(formatCurrency(cashBalance))}</div><div class="kpi-trend trend-up">▲ +MWK 0.4M vs yesterday</div></div>
          <div class="kpi-card"><div class="kpi-label">Total Cash Position</div><div class="kpi-value" style="font-size:22px;color:var(--green)">MWK 14.5M</div><div class="kpi-trend trend-up">▲ +MWK 1.2M vs yesterday</div></div>
          <div class="kpi-card"><div class="kpi-label">Expected Collections (30d)</div><div class="kpi-value" style="font-size:22px;color:var(--green)">MWK 8.5M</div><div class="kpi-sub">vs MWK 6.2M disbursements → Net +MWK 2.3M</div></div>
        </div>
      </div>

      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-title">General Ledger Status</div>
          <div class="compliance-item">
            <span class="compliance-icon">✅</span>
            <div><div class="compliance-title">Last Reconciliation: Today</div><div class="compliance-sub">All accounts balanced · MWK 0 variance</div></div>
            <div class="compliance-status-col"><span class="pill pill-green">Balanced</span></div>
          </div>
          <div class="compliance-item">
            <span class="compliance-icon">🟡</span>
            <div><div class="compliance-title">Unreconciled Items: 3</div><div class="compliance-sub">Total: MWK 45,000 · Oldest: 3 days</div></div>
            <div class="compliance-status-col"><button class="btn btn-sm btn-secondary" onclick="reconcileGL(this)">Reconcile</button></div>
          </div>
          <hr class="divider">
          <div class="flex gap-8">
            <button class="btn btn-secondary btn-sm" onclick="location.hash='#/accounting'">View Trial Balance</button>
            <button class="btn btn-secondary btn-sm" onclick="openDashboardModal('full-pl')">View P&amp;L</button>
            <button class="btn btn-secondary btn-sm" onclick="openDashboardModal('balance-sheet')">Balance Sheet</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title">RBM Report Status <span class="card-subtitle">Q2 2026 · 14 days remaining</span></div>
          <div class="compliance-item"><span class="compliance-icon">✅</span><div><div class="compliance-title">RBM-001: Financial Position</div><div class="compliance-sub">Ready for MD sign-off</div></div><div class="compliance-status-col"><span class="pill pill-green">Ready</span></div></div>
          <div class="compliance-item"><span class="compliance-icon">⏳</span><div><div class="compliance-title">RBM-003: Loan Portfolio</div><div class="compliance-sub">Awaiting branch data — 2 branches late</div></div><div class="compliance-status-col"><button class="btn btn-sm btn-danger">Send Reminder</button></div></div>
        </div>
      </div>

      <!-- Exceptions -->
      <div class="card mb-16">
        <div class="card-title">⚠️ Exceptions Requiring Attention</div>
        <div class="anomaly-card high">
          <div class="anomaly-title">Branch Cash Limit Exceeded — Blantyre</div>
          <div class="anomaly-meta">MWK 850K in vault vs. MWK 500K limit · Action: Transfer to HQ bank account</div>
        </div>
      </div>

      <!-- Cash Flow -->
      <div class="card">
        <div class="card-title">💹 Cash Flow Projection — Next 30 Days</div>
        <div class="chart-wrap" style="height:120px">
          <canvas id="cashflow-chart"></canvas>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => { initFMCharts(); }, 100);
}

/**
 * Auditor Dashboard
 */
function renderAuditorDashboard(container, user) {
  container.innerHTML = `
    <div class="dashboard-view active" id="view-audit">
      <div class="section-header">
        <div>
          <div class="section-title">Internal Audit Dashboard</div>
          <div class="section-meta">Mrs. Yuki Kafinyangwe · <span class="pill pill-red">READ-ONLY — No modifications permitted</span></div>
        </div>
        <div class="section-actions">
          <button class="btn btn-secondary btn-sm" onclick="location.hash='#/audit'">📜 View Audit Log</button>
          <button class="btn btn-secondary btn-sm">📄 Generate Audit Report</button>
        </div>
      </div>

      <!-- Anomaly Detection -->
      <div class="card mb-16">
        <div class="card-title">🚨 Anomaly Detection — Last 7 Days <span style="color:var(--red)">12 anomalies</span> <span class="muted small">· 3 Critical · 5 High · 4 Medium</span></div>
        <div class="semibold mb-8 text-red small">CRITICAL — Require Immediate Review</div>
        <div class="anomaly-card">
          <div class="anomaly-title">🔴 Loan #2847: MWK 2.5M disbursed — Client NRC not on file</div>
          <div class="anomaly-meta">Branch: Lilongwe · Loan Officer: Kenneth Malita · Flagged by: Document Compliance Rule</div>
        </div>
        <hr class="divider">
        <div class="semibold mb-8 text-amber small">HIGH — Review Within 48 Hours</div>
        <div class="anomaly-card high">
          <div class="anomaly-title">🟡 After-hours transactions: 5 payments entered after 18:00</div>
          <div class="anomaly-meta">Branches: Blantyre (3), Karonga (2) · Users: Verified staff but outside policy hours</div>
        </div>
      </div>

      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-title">📊 Audit Trail Summary — Last 30 Days</div>
          <div class="grid-2" style="gap:10px">
            <div class="bg-bg rounded p-12"><div class="kpi-label">Total Events Logged</div><div style="font-size:20px;font-weight:700">14,230</div></div>
            <div class="bg-bg rounded p-12"><div class="kpi-label">High-Risk Events</div><div style="font-size:20px;font-weight:700;color:var(--red)">23</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">✅ Compliance Spot Checks</div>
          <div class="compliance-item"><span class="compliance-icon">✅</span><div><div class="compliance-title">20 loans — EIR correctly disclosed</div></div></div>
          <div class="compliance-item"><span class="compliance-icon">⚠️</span><div><div class="compliance-title">3 loans — Missing disclosure statements</div></div><div class="compliance-status-col"><span class="pill pill-amber">🟡 Flag</span></div></div>
        </div>
      </div>

      <!-- Branch Risk Heatmap -->
      <div class="card" id="heatmap">
        <div class="card-title">🗺️ Branch Risk Heatmap</div>
        <div class="tbl-wrap">
          <table style="font-size:13px">
            <thead>
              <tr><th>Branch</th><th>Anomalies</th><th>PAR Risk</th><th>GL Risk</th><th>Overall</th></tr>
            </thead>
            <tbody>
              <tr><td><b>Lilongwe</b></td><td>2</td><td><div class="heat-cell heat-green">🟢</div></td><td><div class="heat-cell heat-green">🟢</div></td><td><span class="pill pill-green">🟢 Low</span></td></tr>
              <tr class="tbl-row-highlight"><td><b>Karonga</b></td><td><span class="text-red bold">3</span></td><td><div class="heat-cell heat-red">🔴</div></td><td><div class="heat-cell heat-amber">🟡</div></td><td><span class="pill pill-red">🔴 High</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * Branch Manager Dashboard
 */
function renderBMDashboard(container, user) {
  const branches = getCollection(StorageKeys.BRANCHES);
  const branch = branches.find(b => b.id === user.branchId) || branches[3];
  const allLoans = getCollection(StorageKeys.LOANS);
  const branchLoans = allLoans.filter(l => l.branchId === branch.id);
  const pendingLoans = branchLoans.filter(l => l.status === 'Pending' || l.status === 'Under_Review');
  const par = calculatePAR(); // Shared utility

  container.innerHTML = `
    <div class="dashboard-view active" id="view-branch">
      <div class="section-header">
        <div>
          <div class="section-title">Branch Manager Dashboard — ${escapeHtml(branch.branchName)}</div>
          <div class="section-meta">${escapeHtml(user.fullName)} · Staff: 4</div>
        </div>
        <div class="section-actions">
          <button class="btn btn-secondary btn-sm" onclick="location.hash='#/reports'">📋 Branch Report</button>
          <button class="btn btn-primary btn-sm" onclick="location.hash='#/clients'">+ New Client</button>
        </div>
      </div>

      <div class="grid-4 mb-16">
        <div class="kpi-card"><div class="kpi-label">Branch Portfolio</div><div class="kpi-value" style="font-size:22px">${formatCurrency(branchLoans.reduce((s, l) => s + (l.requestedAmount || 0), 0)).split('.')[0]}</div><div class="kpi-trend trend-neutral">→ Flat MoM</div></div>
        <div class="kpi-card"><div class="kpi-label">Active Clients</div><div class="kpi-value" style="font-size:22px">${branchLoans.length + 42}</div><div class="kpi-trend trend-up">▲ +3 MoM</div></div>
        <div class="kpi-card"><div class="kpi-label">PAR 30</div><div class="kpi-value" style="font-size:22px;color:var(--amber)">4.5%</div><div class="kpi-trend trend-down">▲ +0.5pp MoM</div></div>
        <div class="kpi-card"><div class="kpi-label">Today's Collections</div><div class="kpi-value" style="font-size:22px">MWK 125K</div><div class="kpi-sub">Target: MWK 180K · 69%</div></div>
      </div>

      <div class="grid-2 mb-16">
        <div class="card" id="targets">
          <div class="card-title">📅 Today's Targets</div>
          <div class="mb-12">
            <div class="target-row"><div><div class="target-label">Collections</div><div class="target-vals">MWK 125K of MWK 180K target</div></div><span class="pill pill-amber">69%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:69%;background:var(--amber)"></div></div>
          </div>
          <div class="mb-12">
            <div class="target-row"><div><div class="target-label">Disbursements</div><div class="target-vals">2 of 3 target loans</div></div><span class="pill pill-amber">67%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:67%;background:var(--amber)"></div></div>
          </div>
        </div>
        <div class="card" id="staff">
          <div class="card-title">👥 Staff Productivity — Today</div>
          <div class="bg-bg rounded p-12 mb-8">
            <div class="flex justify-between items-center">
              <div><b>Jones Mwalwanda</b><div class="small muted">Portfolio: MWK 8.5M</div></div>
              <span class="pill pill-green">On Track</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-title">⚡ Loans Requiring Action</div>
          <div class="flex gap-8 mb-12 flex-wrap">
            <div class="bg-bg rounded p-12 flex-1">
              <div class="small bold muted">PENDING REVIEW/APPROVAL</div>
              <div style="font-size:22px;font-weight:700;color:var(--amber)">${pendingLoans.length}</div>
              <button class="btn btn-sm btn-green mt-8" onclick="location.hash='#/loans'">✓ View Loan Queue</button>
            </div>
          </div>
        </div>
        <div class="card" id="cash">
          <div class="card-title">💵 Branch Cash Position</div>
          <div class="progress-bar mb-8"><div class="progress-fill" style="width:84%;background:var(--green)"></div></div>
          <div class="flex justify-between small muted"><span>Vault utilization: 84% of limit</span></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * System Admin Dashboard
 */
function renderAdminDashboard(container, user) {
  const users = getCollection(StorageKeys.USERS);
  container.innerHTML = `
    <div class="dashboard-view active" id="view-admin">
      <div class="section-header">
        <div>
          <div class="section-title">System Administration Panel</div>
          <div class="section-meta">${escapeHtml(user.fullName)} · Full System Access · <span class="pill pill-admin">System Administrator</span></div>
        </div>
      </div>
      <div class="grid-4 mb-16">
        <div class="kpi-card"><div class="kpi-label">Active Users</div><div class="kpi-value" style="font-size:22px">${escapeHtml(users.length.toString())}</div></div>
        <div class="kpi-card"><div class="kpi-label">System Uptime</div><div class="kpi-value" style="font-size:22px;color:var(--green)">99.8%</div></div>
        <div class="kpi-card"><div class="kpi-label">Data Records</div><div class="kpi-value" style="font-size:22px">48,230</div></div>
        <div class="kpi-card"><div class="kpi-label">Last Backup</div><div class="kpi-value" style="font-size:22px;color:var(--green)">Today</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title">User Management</div>
          <div class="tbl-wrap">
            <table style="font-size:12px">
              <thead><tr><th>Name</th><th>Role</th><th>Branch</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td><b>Elias Kafinyangwe</b></td><td><span class="role-tag role-md">MD</span></td><td>HQ</td><td><span class="pill pill-green">Active</span></td></tr>
                <tr><td><b>Matias Kafinyangwe</b></td><td><span class="role-tag role-fm">Finance</span></td><td>HQ</td><td><span class="pill pill-green">Active</span></td></tr>
              </tbody>
            </table>
          </div>
          <button class="btn btn-secondary btn-sm mt-12" onclick="location.hash='#/users'">+ Manage Users</button>
        </div>
        <div class="card">
          <div class="card-title">System Health</div>
          <div class="compliance-item"><span class="compliance-icon">🟢</span><div><div class="compliance-title">Database — MySQL 8.0</div><div class="compliance-sub">Response time: 12ms</div></div></div>
          <div class="compliance-item"><span class="compliance-icon">🟢</span><div><div class="compliance-title">Automated Jobs — All Running</div></div></div>
          <div class="compliance-item"><span class="compliance-icon">🟢</span><div><div class="compliance-title">Backup Service</div><div class="compliance-sub">Last: Today 03:00 AM</div></div></div>
          <div class="compliance-item"><span class="compliance-icon">🟡</span><div><div class="compliance-title">SMS Gateway</div><div class="compliance-sub">API: Degraded</div></div></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Accountant Dashboard
 */
function renderAccountantDashboard(container, user) {
  const cashBalance = getValue(StorageKeys.CASH_BALANCE) || 0;
  container.innerHTML = `
    <div class="dashboard-view active" id="view-accountant">
      <div class="section-header">
        <div>
          <div class="section-title">Accountant Workspace</div>
          <div class="section-meta">${escapeHtml(user.fullName)} · HQ · <span class="pill pill-blue">Accountant</span></div>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary btn-sm" onclick="location.hash='#/accounting'">+ Post Voucher</button>
          <button class="btn btn-secondary btn-sm" onclick="location.hash='#/reports'">📊 Financial Reports</button>
        </div>
      </div>

      <div class="grid-4 mb-16">
        <div class="kpi-card">
          <div class="kpi-label">GL Balance (Cash)</div>
          <div class="kpi-value" style="font-size:22px">${escapeHtml(formatCurrency(cashBalance))}</div>
          <div class="kpi-trend trend-neutral">→ Balanced</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pending Vouchers</div>
          <div class="kpi-value" style="font-size:22px;color:var(--amber)">3</div>
          <div class="kpi-sub">Awaiting approval</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Unreconciled Items</div>
          <div class="kpi-value" style="font-size:22px;color:var(--red)">2</div>
          <div class="kpi-sub">Bank statement mismatch</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Fiscal Period</div>
          <div class="kpi-value" style="font-size:22px;color:var(--blue-dark)">June 2026</div>
          <div class="kpi-sub">Q2 Closing in 13 days</div>
        </div>
      </div>

      <div class="grid-2 mb-16">
        <div class="card" id="trial-balance">
          <div class="card-title">📖 Recent Ledger Entries</div>
          <div class="tbl-wrap">
            <table style="font-size:12px">
              <thead><tr><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th></tr></thead>
              <tbody>
                <tr><td>17 Jun</td><td>Loan Disbursement - Mary Banda</td><td>-</td><td>350,000</td></tr>
                <tr><td>17 Jun</td><td>Interest Income - Payday</td><td>45,000</td><td>-</td></tr>
                <tr><td>16 Jun</td><td>Office Rent - Lilongwe</td><td>-</td><td>120,000</td></tr>
              </tbody>
            </table>
          </div>
          <button class="btn btn-secondary btn-sm mt-12" onclick="location.hash='#/accounting'">View Full GL</button>
        </div>
        <div class="card">
          <div class="card-title">🏦 Bank Reconciliation</div>
          <div class="mb-12">
            <div class="target-row"><div><div class="target-label">Standard Bank A/C</div><div class="target-vals">MWK 12.4M vs MWK 12.4M</div></div><span class="pill pill-green">Reconciled</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:100%;background:var(--green)"></div></div>
          </div>
          <div class="mb-12">
            <div class="target-row"><div><div class="target-label">National Bank A/C</div><div class="target-vals">MWK 2.1M vs MWK 2.15M</div></div><span class="pill pill-red">Variance: 50K</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:90%;background:var(--red)"></div></div>
          </div>
          <button class="btn btn-primary btn-sm w-full" onclick="showAppToast('Opening reconciliation tool...', 'success')">Start Reconciliation</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Loan Officer Dashboard
 */
function renderLODashboard(container, user) {
  const allLoans = getCollection(StorageKeys.LOANS);
  const myLoans = allLoans.filter(l => l.branchId === user.branchId);
  const activeLoans = myLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed');
  const lateLoans = myLoans.filter(l => l.status === 'Active' && Math.random() > 0.8); // Mocking late loans for UI

  container.innerHTML = `
    <div class="dashboard-view active" id="view-loan-officer">
      <div class="section-header">
        <div>
          <div class="section-title">Loan Officer Workspace</div>
          <div class="section-meta">${escapeHtml(user.fullName)} · Lilongwe Branch · <span class="pill pill-lo">Loan Officer</span></div>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary btn-sm" onclick="location.hash='#/loans'">+ New Loan Application</button>
          <button class="btn btn-secondary btn-sm" onclick="location.hash='#/clients'">+ New Client</button>
        </div>
      </div>
      <div class="grid-4 mb-16">
        <div class="kpi-card"><div class="kpi-label">My Portfolio</div><div class="kpi-value" style="font-size:22px">${formatCurrency(activeLoans.reduce((s,l)=>s+(l.requestedAmount||0),0)).split('.')[0]}</div><div class="kpi-trend trend-up">▲ +MWK 180K MoM</div></div>
        <div class="kpi-card"><div class="kpi-label">My Clients</div><div class="kpi-value" style="font-size:22px">${activeLoans.length + 12}</div><div class="kpi-trend trend-up">▲ +3 MoM</div></div>
        <div class="kpi-card"><div class="kpi-label">My PAR 30</div><div class="kpi-value" style="font-size:22px;color:var(--green)">2.1%</div><div class="kpi-sub">Branch avg: 4.5%</div></div>
        <div class="kpi-card"><div class="kpi-label">Productivity Score</div><div class="kpi-value" style="font-size:22px;color:var(--blue-dark)">94</div></div>
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-title">My Clients — Quick Actions</div>
          <div class="tbl-wrap">
            <table style="font-size:12px">
              <thead><tr><th>Client</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${activeLoans.length > 0 ? activeLoans.slice(0, 5).map(l => `
                <tr>
                  <td><b>${escapeHtml(l.clientName)}</b></td>
                  <td>${formatCurrency(l.requestedAmount).split('.')[0]}</td>
                  <td><span class="pill pill-green">Current</span></td>
                  <td><button class="btn btn-sm btn-secondary" onclick="location.hash='#/clients?id=${l.clientId}'">View</button></td>
                </tr>
                `).join('') : `
                <tr><td colspan="4" class="text-center p-4">No active clients found.</td></tr>
                `}
                ${lateLoans.length > 0 ? `
                <tr>
                  <td><b>${escapeHtml(lateLoans[0].clientName)}</b></td>
                  <td>${formatCurrency(lateLoans[0].requestedAmount).split('.')[0]}</td>
                  <td><span class="pill pill-red">Late</span></td>
                  <td><button class="btn btn-sm btn-danger" onclick="location.hash='#/followup'">Follow up</button></td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Today's Collection Plan</div>
          <div class="mb-12">
            <div class="target-row"><div><div class="target-label">Collections Target</div><div class="target-vals">MWK 45K of MWK 65K target</div></div><span class="pill pill-amber">69%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:69%;background:var(--amber)"></div></div>
          </div>
          <button class="btn btn-primary btn-sm w-full" onclick="location.hash='#/collections'">📱 Record Collection</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * FAB (Floating Action Button)
 */
function renderFAB() {
  const existing = document.getElementById('fab-container');
  if (existing) existing.remove();

  const user = getValue(StorageKeys.SESSION);
  if (!user || user.role !== 'md') return;

  const fab = document.createElement('div');
  fab.id = 'fab-container';
  fab.className = 'fab-container';
  fab.innerHTML = `
    <div class="fab-actions" id="fab-actions">
      <div class="fab-item" onclick="openDashboardModal('full-pl')">📊 Board Report</div>
      <div class="fab-item" onclick="generateRBMReport()">📄 RBM Report</div>
      <div class="fab-item" onclick="openDashboardModal('pending-approvals')">💰 Approve Loans (4)</div>
      <div class="fab-item" onclick="scrollToSection('alerts-config')">⚙️ Alert Settings</div>
      <div class="fab-item" onclick="showAIInsights()">🤖 Ask AI</div>
    </div>
    <button class="fab-main" id="fab-btn" onclick="toggleFAB()" title="Quick Actions">⚡</button>
  `;
  document.body.appendChild(fab);
}

function toggleFAB() {
  const actions = document.getElementById('fab-actions');
  const btn = document.getElementById('fab-btn');
  if (actions && btn) {
    actions.classList.toggle('open');
    btn.textContent = actions.classList.contains('open') ? '✕' : '⚡';
  }
}

/**
 * Chart Initializations
 */
function initMDCharts() {
  const parCtx = document.getElementById('par-trend-chart');
  if (parCtx) {
    new Chart(parCtx, {
      type: 'line',
      data: {
        labels: ['Jul 25', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 26', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'PAR 30 Trend',
          data: [3.2, 3.5, 3.8, 3.6, 3.9, 4.1, 3.8, 4.2, 4.5, 4.8, 4.1, 4.2],
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.4
        }, {
          label: 'Target (5%)',
          data: Array(12).fill(5),
          borderColor: '#DC2626',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, max: 8, ticks: { callback: v => v + '%' } },
            x: { grid: { display: false } }
        }
      }
    });
  }

  const donutCtx = document.getElementById('product-donut-chart');
  if (donutCtx) {
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Payday', 'SML', 'Business', '3-Month', 'Special', 'Executive', 'Enterprise'],
        datasets: [{
          data: [40, 25, 15, 10, 5, 3, 2],
          backgroundColor: ['#1E3A8A', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#6B7280']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '60%'
      }
    });

    const legend = document.getElementById('product-legend');
    if (legend) {
        const labels = ['Payday', 'SML', 'Business', '3-Month', 'Special', 'Executive', 'Enterprise'];
        const colors = ['#1E3A8A', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#6B7280'];
        legend.innerHTML = labels.map((l, i) => `
            <div class="bubble-legend-item">
                <div class="bubble-dot" style="background:${colors[i]}"></div>
                ${l}
            </div>
        `).join('');
    }
  }

  const bubbleCtx = document.getElementById('product-bubble-chart');
  if (bubbleCtx) {
    new Chart(bubbleCtx, {
      type: 'bubble',
      data: {
        datasets: [
          { label: 'Payday', data: [{ x: 2.1, y: 18, r: 25 }], backgroundColor: '#1E3A8A' },
          { label: 'SML', data: [{ x: 3.8, y: 12, r: 18 }], backgroundColor: '#2563EB' },
          { label: 'Business', data: [{ x: 5.2, y: 8, r: 15 }], backgroundColor: '#059669' },
          { label: 'Enterprise', data: [{ x: 6.8, y: -3, r: 10 }], backgroundColor: '#6B7280' },
          { label: 'Executive', data: [{ x: 1.2, y: 22, r: 8 }], backgroundColor: '#DC2626' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: 'Risk (PAR 30%)' }, min: 0, max: 8 },
          y: { title: { display: true, text: 'Growth (%)' }, min: -5, max: 25 }
        }
      }
    });
  }

  const finCtx = document.getElementById('fin-bar-chart');
  if (finCtx) {
    new Chart(finCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          { label: 'Revenue', data: [1.8, 2.0, 2.1, 2.2, 2.1, 2.2], backgroundColor: '#1E3A8A' },
          { label: 'Expenses', data: [1.3, 1.4, 1.5, 1.5, 1.6, 1.6], backgroundColor: '#93C5FD' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', align: 'start' } },
        scales: { y: { ticks: { callback: v => v + 'M' } } }
      }
    });
  }

  const profitCtx = document.getElementById('profit-trend-chart');
  if (profitCtx) {
    new Chart(profitCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Net Income',
          data: [0.42, 0.48, 0.52, 0.56, 0.51, 0.58, 0.55, 0.60, 0.65, 0.62, 0.68, 0.72],
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.05)',
          fill: true,
          tension: 0.4
        }, {
          label: 'Target',
          data: Array(12).fill(0.6),
          borderColor: '#D97706',
          borderDash: [4, 4],
          fill: false,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', align: 'start' } },
        scales: { y: { ticks: { callback: v => v + 'M' } } }
      }
    });
  }
}

function initFMCharts() {
  const cfCtx = document.getElementById('cashflow-chart');
  if (cfCtx) {
    new Chart(cfCtx, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          { label: 'Collections', data: [1.8, 2.1, 2.3, 2.3], backgroundColor: '#059669' },
          { label: 'Disbursements', data: [1.5, 1.6, 1.5, 1.6], backgroundColor: '#D97706' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { ticks: { callback: v => v + 'M' } } }
      }
    });
  }
}

/**
 * MD Dashboard Helper Functions
 */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('.sec-nav-item').forEach(n => n.classList.remove('active'));
    const secNavItems = document.querySelectorAll('.sec-nav-item');
    secNavItems.forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${id}'`)) n.classList.add('active');
    });
  }
}

function observeSections() {
  const sections = ['brief','portfolio','branches','products','financial','efficiency','compliance','alerts-config','scenarios','benchmarks'];
  const navItems = document.querySelectorAll('.sec-nav-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(n => n.classList.remove('active'));
        const idx = sections.indexOf(entry.target.id);
        if (navItems[idx]) navItems[idx].classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
}

function setPeriod(p) {
  showAppToast(`Period set to ${p}`, 'success');
}

function refreshDashboard(btn) {
  const original = btn.innerHTML;
  btn.innerHTML = '🔄 Refreshing...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
    location.reload();
  }, 1000);
}

function showAIInsights() {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4';
  container.innerHTML = `
    <div class="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
      <div class="flex items-center gap-4 mb-6">
        <span class="text-3xl">🤖</span>
        <h2 class="text-2xl font-bold text-[#1E3A8A]">Saile AI Executive Insights</h2>
      </div>
      <div style="font-size:13px;line-height:1.6">
        <div style="margin-bottom:12px"><b>Key Finding:</b> Karonga branch is the single largest drag on portfolio quality. If brought to network average, overall PAR would drop to 3.7%.</div>
        <div style="margin-bottom:12px"><b>Opportunity:</b> Executive product growth (+22%) is under-capitalized. Reallocating MWK 4M from Enterprise could add MWK 920K in net interest income with 1.1pp lower risk.</div>
        <div style="margin-bottom:12px"><b>Alert:</b> 3 staff vacancies in high-PAR branches for 30+ days. Recommend fast-track hiring in Karonga.</div>
        <div><b>Recommendation:</b> Approve 3 of 4 pending loans today. Escalate Karonga immediately.</div>
      </div>
      <div class="mt-8 flex justify-end gap-4">
        <button class="btn btn-secondary" onclick="this.closest('.fixed').remove()">Dismiss</button>
        <button class="btn btn-primary" onclick="this.closest('.fixed').remove(); scrollToSection('scenarios')">Model Impact</button>
      </div>
    </div>`;
  document.body.appendChild(container);
}

function updateScenario() {
  const slLos = document.getElementById('sl-los');
  if (!slLos) return;

  const los = parseInt(slLos.value);
  const growth = parseInt(document.getElementById('sl-growth').value);
  const rate = parseInt(document.getElementById('sl-rate').value);
  const parVal = parseInt(document.getElementById('sl-par').value);
  const branch = parseInt(document.getElementById('sl-branch').value);

  document.getElementById('sl-los-val').textContent = los;
  document.getElementById('sl-growth-val').textContent = growth + '%';
  document.getElementById('sl-rate-val').textContent = (rate >= 0 ? '+' : '') + rate + 'pp';
  document.getElementById('sl-par-val').textContent = (parVal >= 0 ? '+' : '') + parVal + 'pp';
  document.getElementById('sl-branch-val').textContent = branch + 'M';

  const basePortfolio = 75.2;
  const baseClients = 850;

  const projPortfolio = basePortfolio * (1 + growth/100) + (los * 2.5) + (branch * 5);
  const projClients = Math.round(baseClients * (1 + growth/100) + (los * 30) + (branch * 200));
  const projIncome = (projPortfolio * 0.15) * (1 + rate/10);

  document.getElementById('sc-portfolio').textContent = 'MWK ' + projPortfolio.toFixed(1) + 'M';
  document.getElementById('sc-clients').textContent = projClients;
  document.getElementById('sc-income').textContent = 'MWK ' + projIncome.toFixed(1) + 'M';
  document.getElementById('sc-par').textContent = (4.2 + parVal).toFixed(1) + '%';
}

function saveScenario() {
  showAppToast('Scenario saved successfully', 'success');
}

/**
 * Modal Handling for Dashboards
 */
function openDashboardModal(id) {
  let html = '';
  // Check if it is a branch detail modal
  if (id.startsWith('branch-detail-')) {
      const branchId = id.replace('branch-detail-', '');
      const branches = getCollection(StorageKeys.BRANCHES);
      const b = branches.find(x => x.id === branchId);
      if (b) {
          const isKaronga = b.branchName.includes('Karonga');
          html = renderBranchDetailModal(b.branchName.split('-')[0].trim(), b.managerName, isKaronga ? '6.8%' : '3.1%');
      } else if (id === 'branch-detail-karonga') {
          html = renderBranchDetailModal('Karonga', 'Geoffrey Ngwira', '6.8%');
      } else if (id === 'branch-detail-lilongwe') {
          html = renderBranchDetailModal('Lilongwe', 'Patrick Kalua', '3.1%');
      }
  }

  if (!html) {
      switch(id) {
        case 'pending-approvals':
          html = renderPendingApprovalsModal();
          break;
        case 'full-risk-report':
          html = renderFullRiskReportModal();
          break;
        case 'full-pl':
            html = renderPLModal();
            break;
        case 'balance-sheet':
            html = renderBalanceSheetModal();
            break;
        case 'set-targets':
            html = renderSetTargetsModal();
            break;
        case 'model-product':
            html = renderModelProductModal();
            break;
        case 'staff-report':
            html = renderStaffReportModal();
            break;
        case 'rbm-003-review':
            html = renderRBMReviewModal();
            break;
        case 'par-drilldown-1-30':
            html = `<div class="p-8"><h2>PAR 1-30 Drilldown</h2><p>Listing all 14 loans currently in 1-30 days late bucket...</p></div>`;
            break;
        default:
          html = `<div class="p-8">Modal content for ${id} goes here.</div>`;
      }
  }

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[10001] p-4';
  modalOverlay.innerHTML = `
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl relative">
      <button class="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl" onclick="this.closest('.fixed').remove()">✕</button>
      ${html}
    </div>
  `;
  document.body.appendChild(modalOverlay);
}

function renderBranchDetailModal(name, manager, par) {
  return `
    <div class="p-8">
      <h2 class="text-2xl font-bold text-red-700 mb-2">${name} Branch Analysis</h2>
      <p class="text-gray-600 mb-6">Manager: ${manager} · Status: <span class="pill pill-red">CRITICAL</span></p>
      <div class="grid grid-cols-2 gap-8 mb-8">
        <div class="card bg-gray-50">
          <h3 class="font-bold mb-2">Portfolio Quality</h3>
          <p class="text-3xl font-bold text-red-600">${par} PAR 30</p>
          <p class="text-xs text-gray-500 mt-1">Target: <5.0%</p>
        </div>
        <div class="card bg-gray-50">
          <h3 class="font-bold mb-2">Loan Officers</h3>
          <p class="text-sm">Bertha Mwale: 5.2% PAR</p>
          <p class="text-sm">Charles Mwase: 8.4% PAR (Alert)</p>
        </div>
      </div>
      <div class="flex gap-4">
        <button class="btn btn-primary" onclick="showAppToast('Reminder sent to BM', 'success')">Send Management Alert</button>
        <button class="btn btn-secondary">Download Branch Audit</button>
      </div>
    </div>
  `;
}

function renderPendingApprovalsModal() {
  return `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Loans Pending MD Approval</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left border-b">
            <th class="py-2">Client</th>
            <th>Amount</th>
            <th>Product</th>
            <th>Branch</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr>
            <td class="py-3">Mary Banda</td>
            <td>MWK 350,000</td>
            <td>SML</td>
            <td>Lilongwe</td>
            <td><button class="btn btn-sm btn-green" onclick="showAppToast('Approved', 'success'); this.closest('tr').remove()">Approve</button></td>
          </tr>
          <tr>
            <td class="py-3">Saile Farms Ltd</td>
            <td>MWK 980,000</td>
            <td>Business</td>
            <td>Blantyre</td>
            <td><button class="btn btn-sm btn-green" onclick="showAppToast('Approved', 'success'); this.closest('tr').remove()">Approve</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderFullRiskReportModal() {
  return `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Full Portfolio Risk Report</h2>
      <div class="space-y-6">
        <div class="card bg-emerald-50 border-emerald-200">
          <h3 class="font-bold text-emerald-800">Overall Rating: HEALTHY (94/100)</h3>
          <p class="text-sm text-emerald-700">All regulatory ratios within RBM limits. Provision coverage at 103%.</p>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 border rounded-xl">
             <p class="text-xs font-bold uppercase text-gray-500">Capital Adequacy</p>
             <p class="text-xl font-bold">22.4%</p>
          </div>
          <div class="p-4 border rounded-xl">
             <p class="text-xs font-bold uppercase text-gray-500">Liquidity Ratio</p>
             <p class="text-xl font-bold">28.7%</p>
          </div>
          <div class="p-4 border rounded-xl">
             <p class="text-xs font-bold uppercase text-gray-500">Net Margin</p>
             <p class="text-xl font-bold">28.2%</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPLModal() {
  return `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Profit & Loss Statement — YTD June 2026</h2>
      <table style="width:100%;font-size:13px">
        <thead><tr><th>Line Item</th><th class="text-right">YTD 2026</th><th class="text-right">YTD 2025</th><th class="text-right">Variance</th></tr></thead>
        <tbody>
          <tr><td colspan="4" class="bold" style="background:#F9FAFB;padding:8px 12px">INCOME</td></tr>
          <tr><td style="padding-left:24px">Interest Income</td><td class="text-right">MWK 10,800,000</td><td class="text-right">MWK 9,100,000</td><td class="text-right text-green">+18.7%</td></tr>
          <tr><td style="padding-left:24px">Fee Income</td><td class="text-right">MWK 1,200,000</td><td class="text-right">MWK 980,000</td><td class="text-right text-green">+22.4%</td></tr>
          <tr class="bold"><td>TOTAL INCOME</td><td class="text-right">MWK 12,400,000</td><td class="text-right">MWK 10,460,000</td><td class="text-right text-green">+18.5%</td></tr>
          <tr><td colspan="4" class="bold" style="background:#F9FAFB;padding:8px 12px">EXPENSES</td></tr>
          <tr><td style="padding-left:24px">Personnel Costs</td><td class="text-right">MWK 4,200,000</td><td class="text-right">MWK 3,800,000</td><td class="text-right text-red">+10.5%</td></tr>
          <tr class="bold"><td>TOTAL EXPENSES</td><td class="text-right">MWK 8,900,000</td><td class="text-right">MWK 7,900,000</td><td class="text-right text-red">+12.7%</td></tr>
          <tr class="bold" style="background:#EFF6FF"><td>NET INCOME</td><td class="text-right" style="color:var(--green)">MWK 3,500,000</td><td class="text-right" style="color:var(--green)">MWK 2,560,000</td><td class="text-right text-green">+36.7%</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderBalanceSheetModal() {
  return `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Balance Sheet — June 17, 2026</h2>
      <div class="grid grid-cols-2 gap-8">
        <div>
          <h3 class="font-bold mb-4">ASSETS</h3>
          <table class="w-full text-sm">
            <tr><td>Cash & Bank</td><td class="text-right">14,500,000</td></tr>
            <tr><td>Loan Portfolio (Gross)</td><td class="text-right">75,200,000</td></tr>
            <tr class="bold"><td>TOTAL ASSETS</td><td class="text-right">MWK 97,800,000</td></tr>
          </table>
        </div>
        <div>
          <h3 class="font-bold mb-4">LIABILITIES & EQUITY</h3>
          <table class="w-full text-sm">
            <tr><td>Savings & Deposits</td><td class="text-right">18,200,000</td></tr>
            <tr><td>Borrowings</td><td class="text-right">32,500,000</td></tr>
            <tr class="bold"><td>TOTAL LIABILITIES + EQUITY</td><td class="text-right">MWK 97,800,000</td></tr>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderSetTargetsModal() {
    return `<div class="p-8"><h2>Set Branch Targets</h2><p>Adjust growth and PAR targets for each branch.</p><button class="btn btn-primary mt-4" onclick="showAppToast('Targets Saved', 'success'); this.closest('.fixed').remove()">Save Targets</button></div>`;
}

function renderModelProductModal() {
    return `<div class="p-8"><h2>Product Scenario Modeling</h2><p>Simulate new interest rates or loan terms.</p><button class="btn btn-primary mt-4" onclick="showAppToast('Product Concept Saved', 'success'); this.closest('.fixed').remove()">Save Concept</button></div>`;
}

function renderStaffReportModal() {
    return `<div class="p-8"><h2>Staff Productivity Report</h2><p>Performance metrics for all Loan Officers across the network.</p></div>`;
}

function renderRBMReviewModal() {
    return `<div class="p-8"><h2>RBM-003 Review & Sign-off</h2><p>Review the quarterly portfolio report before RBM submission.</p><button class="btn btn-primary mt-4" onclick="showAppToast('Report Signed', 'success'); this.closest('.fixed').remove()">Sign & Submit</button></div>`;
}

/**
 * Utilities
 */
function getFormattedFullDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return now.toLocaleDateString('en-US', options);
}

function formatPercentage(val) {
  return (val || 0).toFixed(1) + '%';
}

function calculateDashboardStats() {
  const clients = getCollection(StorageKeys.CLIENTS);
  const loans = getCollection(StorageKeys.LOANS);

  return {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'Active').length,
    activeLoans: loans.filter(l => l.status === 'Disbursed' || l.status === 'Active').length,
    totalPortfolio: loans.reduce((sum, l) => sum + (l.loanAmount || l.approvedAmount || 0), 0)
  };
}

function sortTable(tableId, col) {
  showAppToast('Sorting feature active', 'success');
}

function exportTableCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) {
      showAppToast('Table not found for export', 'error');
      return;
  }

  let csv = [];
  const rows = table.querySelectorAll('tr');

  for (let i = 0; i < rows.length; i++) {
    const row = [], cols = rows[i].querySelectorAll('td, th');
    for (let j = 0; j < cols.length; j++) {
        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
    }
    csv.push(row.join(','));
  }

  const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", (filename || 'export') + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showAppToast(`Exported ${filename}.csv`, 'success');
}

function simulateExportPDF() {
  showAppToast('Generating PDF Report...', 'success');
  setTimeout(() => {
      showAppToast('PDF Downloaded', 'success');
  }, 1500);
}

function reconcileGL(btn) {
  const original = btn.innerHTML;
  btn.innerHTML = 'Reconciling...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '✅ Reconciled';
    showAppToast('General Ledger reconciled', 'success');
  }, 1000);
}

function generateRBMReport(btn) {
  const original = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = 'Generating...';
    btn.disabled = true;
  }
  setTimeout(() => {
    if (btn) {
        btn.innerHTML = original;
        btn.disabled = false;
    }
    openDashboardModal('rbm-003-review');
    showAppToast('RBM-003 Draft Generated', 'success');
  }, 1500);
}

function saveAlertSettings(btn) {
    showAppToast('Alert settings saved', 'success');
}

function compareProducts() {
    showAppToast('Product comparison matrix generated', 'success');
}

function initDashboardListeners() {
  const slLos = document.getElementById('sl-los');
  if (slLos) slLos.addEventListener('input', updateScenario);

  const slGrowth = document.getElementById('sl-growth');
  if (slGrowth) slGrowth.addEventListener('input', updateScenario);

  const slRate = document.getElementById('sl-rate');
  if (slRate) slRate.addEventListener('input', updateScenario);

  const slPar = document.getElementById('sl-par');
  if (slPar) slPar.addEventListener('input', updateScenario);

  const slBranch = document.getElementById('sl-branch');
  if (slBranch) slBranch.addEventListener('input', updateScenario);
}

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

window.renderDashboard = renderDashboard;
window.scrollToSection = scrollToSection;
window.setPeriod = setPeriod;
window.refreshDashboard = refreshDashboard;
window.showAIInsights = showAIInsights;
window.updateScenario = updateScenario;
window.saveScenario = saveScenario;
window.openDashboardModal = openDashboardModal;
window.generateRBMReport = generateRBMReport;
window.reconcileGL = reconcileGL;
window.exportTableCSV = exportTableCSV;
window.simulateExportPDF = simulateExportPDF;
window.sortTable = sortTable;
window.saveAlertSettings = saveAlertSettings;
window.compareProducts = compareProducts;
window.toggleFAB = toggleFAB;
