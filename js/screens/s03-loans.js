// ============================================================================
// Saile Platform v2 — Screen 03: Loan Management (Saile Edition)
// ============================================================================

/**
 * Render the Loans module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderLoans(container, options) {
  var readOnly = options && options.readOnly;
  var role = options && options.role;
  var loans = getCollection(StorageKeys.LOANS);
  var products = getCollection(StorageKeys.PRODUCTS);
  var statusFilter = '';

  function render() {
    var filtered = statusFilter ? loans.filter(function(l) { return l.status === statusFilter; }) : loans;

    var html = '<div class="space-y-6">';
    // Header
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Loan Management</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + loans.length + ' total applications across ' + products.length + ' products</p>';
    html += '</div>';
    if (!readOnly && canPerformAction(role, 'create')) {
      html += '<button id="btn-new-loan" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">+ New Application</button>';
    }
    html += '</div>';

    // Status tabs
    html += '<div class="flex flex-wrap gap-2">';
    var statuses = ['', 'Draft', 'Pending', 'Under_Review', 'Approved', 'Disbursed', 'Active', 'Rejected', 'Closed', 'Written_Off'];
    var labels = ['All', 'Draft', 'Pending', 'Under Review', 'Approved', 'Disbursed', 'Active', 'Rejected', 'Closed', 'Written Off'];
    for (var t = 0; t < statuses.length; t++) {
      var active = statusFilter === statuses[t] ? 'bg-[#0f766e] text-white' : 'bg-white text-[#0f766e] border border-[#d1d5db] hover:bg-[#f4f4f5]';
      html += '<button class="loan-status-tab px-4 py-2 rounded-xl text-sm font-medium ' + active + '" data-status="' + statuses[t] + '">' + labels[t] + '</button>';
    }
    html += '</div>';

    // Loan queue table
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    if (filtered.length === 0) {
      html += '<div class="p-8 text-center text-[#6b7280]"><p class="text-sm">No loan applications found.</p></div>';
    } else {
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f9fafb] border-b border-[#d1d5db]"><tr>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">ID</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Client</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280] hidden sm:table-cell">Product</th>';
      html += '<th class="text-right px-4 py-3 font-medium text-[#6b7280]">Amount</th>';
      html += '<th class="text-center px-4 py-3 font-medium text-[#6b7280]">Status</th>';
      html += '<th class="text-center px-4 py-3 font-medium text-[#6b7280]">EIR</th>';
      html += '<th class="text-center px-4 py-3 font-medium text-[#6b7280]">Branch</th>';
      html += '<th class="text-center px-4 py-3 font-medium text-[#6b7280]">Actions</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < filtered.length; i++) {
        var l = filtered[i];
        var loanNum = i + 1;
        var sClass = 'bg-gray-50 text-[#374151]';
        if (l.status === 'Active') sClass = 'bg-[#0f766e] text-white';
        else if (l.status === 'Approved') sClass = 'bg-[#0f766e] text-white';
        else if (l.status === 'Disbursed') sClass = 'bg-[#0d9488] text-white';
        else if (l.status === 'Rejected') sClass = 'bg-[#111827] text-white';
        else if (l.status === 'Pending') sClass = 'bg-[#F59E0B] text-white';
        else if (l.status === 'Under_Review') sClass = 'bg-[#8b5cf6] text-white';
        else if (l.status === 'Draft') sClass = 'bg-gray-100 text-[#374151]';

        var branch = l.branchId ? getBranchById(l.branchId) : null;
        var branchName = branch ? branch.branchCode : '—';
        var eir = l.effectiveInterestRate || (l.effectiveInterestRateCalculated ? l.effectiveInterestRateCalculated + '%' : '—');

        html += '<tr class="border-b border-[#d1d5db] hover:bg-[#f9fafb]">';
        html += '<td class="px-4 py-3 text-[#6b7280] font-mono text-xs">' + escapeHtml(getLoanProductCode(l.productCode || l.productId, products)) + '-' + padZero(loanNum, 4) + '</td>';
        html += '<td class="px-4 py-3 font-medium text-[#0f766e]">' + escapeHtml(l.clientName) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280] hidden sm:table-cell">' + escapeHtml(l.productName) + '</td>';
        html += '<td class="px-4 py-3 text-right font-semibold text-[#0f766e]">' + formatCurrency(l.requestedAmount) + '</td>';
        html += '<td class="px-4 py-3 text-center"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ' + sClass + '">' + escapeHtml(l.status.replace('_', ' ')) + '</span></td>';
        html += '<td class="px-4 py-3 text-center text-sm text-[#6b7280]">' + eir + '</td>';
        html += '<td class="px-4 py-3 text-center text-sm text-[#6b7280]">' + escapeHtml(branchName) + '</td>';
        html += '<td class="px-4 py-3 text-center space-x-1">';
        html += '<button class="text-[#0f766e] text-xs font-medium hover:underline btn-view-loan" data-id="' + l.id + '">View</button>';
        if (!readOnly) {
          if (l.status === 'Pending') {
            html += '<button class="text-[#0f766e] text-xs font-medium hover:underline btn-review-loan" data-id="' + l.id + '">Review</button>';
          }
          if (l.status === 'Under_Review') {
            html += '<button class="text-[#0f766e] text-xs font-medium hover:underline btn-approve-loan" data-id="' + l.id + '">Approve</button>';
            html += '<button class="text-[#111827] text-xs font-medium hover:underline btn-reject-loan" data-id="' + l.id + '">Reject</button>';
          }
          if (role === 'admin' || role === 'md' || role === 'finance_manager') {
            if (l.status === 'Approved') {
              html += '<button class="text-[#0d9488] text-xs font-medium hover:underline btn-disburse-loan" data-id="' + l.id + '">Disburse</button>';
            }
            if (l.status === 'Active' || l.status === 'Disbursed') {
              html += '<button class="text-[#F59E0B] text-xs font-medium hover:underline btn-close-loan" data-id="' + l.id + '">Close</button>';
            }
          }
        }
        html += '</td></tr>';
      }
      html += '</tbody></table></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
    attachLoanEvents();
  }

  function getBranchById(id) {
    var branches = getCollection(StorageKeys.BRANCHES);
    for (var i = 0; i < branches.length; i++) {
      if (branches[i].id === id) return branches[i];
    }
    return null;
  }

  function getLoanProductCode(productId, prods) {
    for (var i = 0; i < prods.length; i++) {
      if (prods[i].id === productId) return prods[i].productCode || 'LN';
    }
    return 'LN';
  }

  function padZero(num, size) {
    var s = '0000' + num;
    return s.substr(s.length - size);
  }

  function attachLoanEvents() {
    container.querySelectorAll('.loan-status-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        statusFilter = this.getAttribute('data-status');
        render();
      });
    });

    var newBtn = document.getElementById('btn-new-loan');
    if (newBtn) {
      newBtn.addEventListener('click', function() { renderLoanForm(container, options); });
    }

    container.querySelectorAll('.btn-view-loan').forEach(function(btn) {
      btn.addEventListener('click', function() { renderLoanDetail(container, this.getAttribute('data-id'), options); });
    });

    container.querySelectorAll('.btn-review-loan').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        updateItem(StorageKeys.LOANS, id, { status: 'Under_Review' });
        logAudit('review_loan', { module: 'loans', entityId: id, changedTo: 'Under_Review' });
        loans = getCollection(StorageKeys.LOANS);
        render();
        showToast('Loan moved to Under Review', 'success');
      });
    });

    container.querySelectorAll('.btn-approve-loan').forEach(function(btn) {
      btn.addEventListener('click', function() { approveLoan(this.getAttribute('data-id')); });
    });

    container.querySelectorAll('.btn-reject-loan').forEach(function(btn) {
      btn.addEventListener('click', function() { rejectLoan(this.getAttribute('data-id')); });
    });

    container.querySelectorAll('.btn-disburse-loan').forEach(function(btn) {
      btn.addEventListener('click', function() { disburseLoan(this.getAttribute('data-id')); });
    });

    container.querySelectorAll('.btn-close-loan').forEach(function(btn) {
      btn.addEventListener('click', function() { closeLoan(this.getAttribute('data-id')); });
    });
  }

  render();
}

/**
 * Approve a loan and generate amortization schedule.
 */
function approveLoan(loanId) {
  var loans = getCollection(StorageKeys.LOANS);
  var products = getCollection(StorageKeys.PRODUCTS);
  var loan = null;
  for (var i = 0; i < loans.length; i++) {
    if (loans[i].id === loanId) { loan = loans[i]; break; }
  }
  if (!loan) return;

  var product = null;
  for (var p = 0; p < products.length; p++) {
    if (products[p].id === loan.productId) { product = products[p]; break; }
  }

  // Calculate effective interest rate and total cost of credit
  var rate = loan.proposedInterestRate || (product ? product.defaultInterestRate : 25);
  var method = (product && product.interestMethod) ? product.interestMethod : 'declining';
  var freq = (product && product.repaymentFrequency) ? product.repaymentFrequency : 'monthly';
  var duration = (product && product.durationMonths) ? product.durationMonths : 12;
  var processingFee = (product && product.processingFee) ? product.processingFee : 0;
  var savingsPct = (product && product.compulsorySavingsPercentage) ? product.compulsorySavingsPercentage : 20;
  var savingsAmt = Math.round(loan.requestedAmount * savingsPct / 100);

  var schedule = generateAmortization(loan.requestedAmount, rate, freq, method, todayISO(), duration);

  // Calculate total cost of credit
  var totalInterest = 0;
  for (var s = 0; s < schedule.length; s++) {
    totalInterest += schedule[s].interest;
  }
  var totalCostOfCredit = loan.requestedAmount + totalInterest + processingFee;

  // Calculate effective interest rate (simplified annualized)
  var eir = calculateEIR(loan.requestedAmount - savingsAmt, totalCostOfCredit, duration);

  var updates = {
    status: 'Approved',
    amortizationSchedule: schedule,
    proposedInterestRate: rate,
    processingFee: processingFee,
    totalCostOfCredit: totalCostOfCredit,
    effectiveInterestRate: rate,
    effectiveInterestRateCalculated: parseFloat(eir.toFixed(2)),
    compulsorySavingsAmount: savingsAmt,
    disclosureStatementGenerated: true,
    rbmReportingCategory: product ? product.rbmReportingCategory : 'SHORT_TERM',
    interestMethod: method,
    auditTrail: JSON.stringify([{action:'created',by:loan.clientName,date:loan.applicationDate},{action:'reviewed',date:todayISO()},{action:'approved',date:todayISO()}])
  };
  updateItem(StorageKeys.LOANS, loanId, updates);
  logAudit('approve_loan', { module: 'loans', entityId: loanId, changedTo: 'Approved' });
  showToast('Loan approved successfully! EIR: ' + eir.toFixed(1) + '% p.a.', 'success');
  loans = getCollection(StorageKeys.LOANS);
}

/**
 * Calculate Effective Interest Rate (annualized).
 * Simplified XIRR approximation.
 */
function calculateEIR(netDisbursement, totalRepayment, months) {
  // Using simple interest rate conversion
  // EIR = (1 + i)^n - 1 where i is periodic rate
  var totalInterest = totalRepayment - netDisbursement;
  var periodicRate = totalInterest / (netDisbursement * months);
  var annualEIR = (Math.pow(1 + periodicRate, 12) - 1) * 100;
  return Math.min(annualEIR, 999.99);
}

/**
 * Reject a loan.
 */
function rejectLoan(loanId) {
  updateItem(StorageKeys.LOANS, loanId, {
    status: 'Rejected',
    rejectionReason: prompt('Enter rejection reason:') || 'Does not meet criteria'
  });
  logAudit('reject_loan', { module: 'loans', entityId: loanId, changedTo: 'Rejected' });
  showToast('Loan rejected', 'warning');
  loans = getCollection(StorageKeys.LOANS);
}

/**
 * Disburse a loan - creates savings account and disbursement voucher.
 */
function disburseLoan(loanId) {
  var loans = getCollection(StorageKeys.LOANS);
  var loan = null;
  for (var i = 0; i < loans.length; i++) {
    if (loans[i].id === loanId) { loan = loans[i]; break; }
  }
  if (!loan) return;

  var now = new Date().toISOString();
  var disbDate = todayISO();

  updateItem(StorageKeys.LOANS, loanId, {
    status: 'Disbursed',
    disbursementDate: disbDate,
    payoutMethod: 'mobile_money',
    updatedAt: now
  });

  // Deduct from cash balance and add compulsory savings
  var balance = getValue(StorageKeys.CASH_BALANCE) || 0;
  setValue(StorageKeys.CASH_BALANCE, balance - loan.requestedAmount + (loan.compulsorySavingsAmount || 0));

  // Create disbursement voucher
  var vouchers = getCollection(StorageKeys.VOUCHERS) || [];
  var session = getSession();
  vouchers.push({
    id: generateId(),
    voucherDate: disbDate,
    voucherType: 'debit',
    sourceAccount: '1001-Cash',
    targetAccount: '4001-Loan Disbursement',
    amount: loan.requestedAmount,
    description: 'Loan disbursement - ' + loan.clientName + ' (' + loan.productCode + ')',
    createdBy: session ? session.fullName : 'System',
    branchId: loan.branchId,
    createdAt: now
  });
  setCollection(StorageKeys.VOUCHERS, vouchers);

  // Create compulsory savings account
  var savingsProducts = getCollection(StorageKeys.SAVINGS_PRODUCTS) || [];
  var compProduct = null;
  for (var sp = 0; sp < savingsProducts.length; sp++) {
    if (savingsProducts[sp].productCode === 'SAV-COMP') { compProduct = savingsProducts[sp]; break; }
  }

  var savingsAccounts = getCollection(StorageKeys.SAVINGS_ACCOUNTS) || [];
  savingsAccounts.push({
    id: generateId(),
    clientId: loan.clientId,
    clientName: loan.clientName,
    productId: compProduct ? compProduct.id : null,
    productCode: 'SAV-COMP',
    balance: loan.compulsorySavingsAmount || 0,
    linkedLoanId: loanId,
    status: 'Active',
    openedDate: disbDate,
    lastInterestPosted: now,
    createdAt: now,
    updatedAt: now
  });
  setCollection(StorageKeys.SAVINGS_ACCOUNTS, savingsAccounts);

  // Send SMS notification
  addSMSLog('TMPL_DISBURSE', loan.clientId, loan.clientName, loan.productCode, loan.requestedAmount, disbDate, loan.branchId);

  logAudit('disburse_loan', { module: 'loans', entityId: loanId, changedTo: 'Disbursed' });
  showToast('Loan disbursed! Savings account created with MWK ' + formatCurrency(loan.compulsorySavingsAmount || 0), 'success');
  loans = getCollection(StorageKeys.LOANS);
}

/**
 * Close a loan.
 */
function closeLoan(loanId) {
  var loans = getCollection(StorageKeys.LOANS);
  var loan = null;
  for (var i = 0; i < loans.length; i++) {
    if (loans[i].id === loanId) { loan = loans[i]; break; }
  }
  if (!loan) return;

  // Release compulsory savings
  var savingsAccts = getCollection(StorageKeys.SAVINGS_ACCOUNTS) || [];
  for (var s = 0; s < savingsAccts.length; s++) {
    if (savingsAccts[s].linkedLoanId === loanId) {
      savingsAccts[s].status = 'CLOSED';
      savingsAccts[s].closedDate = todayISO();
      updateItem(StorageKeys.SAVINGS_ACCOUNTS, savingsAccts[s].id, savingsAccts[s]);
    }
  }

  updateItem(StorageKeys.LOANS, loanId, {
    status: 'Closed',
    closedDate: todayISO()
  });
  logAudit('close_loan', { module: 'loans', entityId: loanId, changedTo: 'Closed' });
  showToast('Loan closed. Compulsory savings released.', 'success');
  loans = getCollection(StorageKeys.LOANS);
}

/**
 * Add SMS log entry for demo.
 */
function addSMSLog(templateCode, clientId, clientName, productCode, amount, date, branchId) {
  var templates = getCollection(StorageKeys.SMS_TEMPLATES) || [];
  var template = null;
  for (var t = 0; t < templates.length; t++) {
    if (templates[t].id === templateCode) { template = templates[t]; break; }
  }

  var clients = getCollection(StorageKeys.CLIENTS) || [];
  var phone = '';
  for (var c = 0; c < clients.length; c++) {
    if (clients[c].id === clientId) { phone = clients[c].phoneNumber; break; }
  }

  if (!template) return;

  var message = template.template
    .replace('[PRODUCT]', productCode)
    .replace('[AMOUNT]', formatCurrency(amount))
    .replace('[PAYMENT]', formatCurrency(Math.round(amount * 1.05)))
    .replace('[DATE]', date)
    .replace('[ACCOUNT]', 'ACC-SF-' + padZero(Math.floor(Math.random() * 9999), 4));

  var smsLogs = getCollection(StorageKeys.SMS_LOGS) || [];
  smsLogs.push({
    id: generateId(),
    recipientPhone: phone,
    recipientName: clientName,
    templateCode: templateCode,
    messageContent: 'Would send: ' + message + ' (Demo mode - SMS gateway not connected)',
    triggerEvent: template.triggerEvent,
    status: 'Pending',
    branchId: branchId,
    createdAt: new Date().toISOString()
  });
  setCollection(StorageKeys.SMS_LOGS, smsLogs);
}

/**
 * Render loan application form with Saile products.
 */
function renderLoanForm(container, options) {
  var clients = getCollection(StorageKeys.CLIENTS).filter(function(c) { return c.status === 'Active'; });
  var products = getCollection(StorageKeys.PRODUCTS);

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-loans" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back to Loans</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">New Loan Application — Saile Financial Services</h1>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">';

  // Left column - Product Selection
  html += '<div class="lg:col-span-2 space-y-6">';
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">1. Client Information</h3>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#374151] mb-1.5">Client *</label>';
  html += '<select id="loan-client-id" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]">';
  html += '<option value="">Select client...</option>';
  for (var i = 0; i < clients.length; i++) {
    html += '<option value="' + clients[i].id + '">' + escapeHtml(clients[i].fullName) + ' — ' + escapeHtml(clients[i].nationalId) + '</option>';
  }
  html += '</select></div>';

  html += '<div><label class="block text-sm font-medium text-[#374151] mb-1.5">Product *</label>';
  html += '<select id="loan-product-id" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]">';
  html += '<option value="">Select product...</option>';
  for (var p = 0; p < products.length; p++) {
    var marker = products[p].isSignatureProduct ? ' ⭐' : '';
    html += '<option value="' + products[p].id + '" data-code="' + (products[p].productCode || '') + '" data-rate="' + products[p].defaultInterestRate + '" data-method="' + products[p].interestMethod + '" data-duration="' + (products[p].durationMonths || 1) + '" data-max="' + products[p].maxPrincipal + '" data-min="' + products[p].minPrincipal + '">' + escapeHtml(products[p].productCode) + ' - ' + escapeHtml(products[p].productName) + marker + '</option>';
  }
  html += '</select></div>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#374151] mb-1.5">Requested Amount (MWK) *</label>';
  html += '<input type="number" id="loan-amount" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]" placeholder="Enter amount" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#374151] mb-1.5">Payout Method</label>';
  html += '<select id="loan-payout" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
  html += '<option value="mobile_money">Mobile Money (Airtel/TNM)</option><option value="bank_transfer">Bank Transfer</option><option value="cash">Cash</option>';
  html += '</select></div></div>';

  html += '<div><label class="block text-sm font-medium text-[#374151] mb-1.5">Collateral Description</label>';
  html += '<input type="text" id="loan-collateral" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]" placeholder="e.g., Motorcycle, Shop inventory (optional)"></div>';
  html += '</div></div>';

  // Right column - Calculator
  html += '<div>';
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6 sticky top-4">';
  html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">💰 Loan Calculator</h3>';
  html += '<div id="loan-calculator" class="space-y-3 text-sm">';
  html += '<p class="text-[#6b7280]">Select a product and enter an amount to see calculations.</p>';
  html += '</div>';
  html += '<div class="mt-4" id="loan-calc-submit" style="display:none">';
  html += '<button type="button" id="btn-submit-loan" class="w-full bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">Submit Application</button>';
  html += '</div></div></div>';
  html += '</div>';

  html += '</div></div>';

  container.innerHTML = html;

  document.getElementById('btn-back-loans').addEventListener('click', function() { renderLoans(container, options); });

  // Calculator events
  document.getElementById('loan-product-id').addEventListener('change', updateCalculator);
  document.getElementById('loan-amount').addEventListener('input', updateCalculator);

  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btn-submit-loan') {
      submitNewLoan(container, options);
    }
  });
}

/**
 * Update the loan calculator display.
 */
function updateCalculator() {
  var productId = document.getElementById('loan-product-id').value;
  var amount = Number(document.getElementById('loan-amount').value) || 0;
  var products = getCollection(StorageKeys.PRODUCTS);
  var product = null;

  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) { product = products[i]; break; }
  }

  var calcEl = document.getElementById('loan-calculator');
  var submitEl = document.getElementById('loan-calc-submit');

  if (!product || amount <= 0) {
    calcEl.innerHTML = '<p class="text-[#6b7280]">Select a product and enter an amount to see calculations.</p>';
    submitEl.style.display = 'none';
    return;
  }

  // Validate amount range
  if (amount < product.minPrincipal) {
    calcEl.innerHTML = '<p class="text-[#111827]">Minimum amount: ' + formatCurrency(product.minPrincipal) + '</p>';
    submitEl.style.display = 'none';
    return;
  }
  if (amount > product.maxPrincipal) {
    calcEl.innerHTML = '<p class="text-[#111827]">Maximum amount: ' + formatCurrency(product.maxPrincipal) + '</p>';
    submitEl.style.display = 'none';
    return;
  }

  var rate = product.defaultInterestRate;
  var method = product.interestMethod;
  var duration = product.durationMonths || 1;
  var processingFee = product.processingFee || 0;
  var savingsPct = product.compulsorySavingsPercentage || 20;
  var savingsAmt = Math.round(amount * savingsPct / 100);
  var netDisbursement = amount - savingsAmt;

  var schedule = generateAmortization(amount, rate, 'monthly', method, todayISO(), duration);

  var totalInterest = 0;
  for (var s = 0; s < schedule.length; s++) { totalInterest += schedule[s].interest; }

  var totalPayment = amount + totalInterest + processingFee;
  var firstPayment = schedule.length > 0 ? (schedule[0].principal + schedule[0].interest) : 0;
  var monthlyPayment = schedule.length > 0 ? Math.round(totalPayment / schedule.length) : 0;
  var eir = calculateEIR(netDisbursement, totalPayment, duration);

  var html = '';
  html += '<div class="space-y-2">';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Principal:</span><span class="font-semibold text-[#0f766e]">' + formatCurrency(amount) + '</span></div>';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Interest (' + rate + '/mo):</span><span class="font-semibold text-[#0f766e]">' + formatCurrency(Math.round(totalInterest)) + '</span></div>';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Compulsory Savings (' + savingsPct + '%):</span><span class="font-semibold text-[#0f766e]">' + formatCurrency(savingsAmt) + '</span></div>';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Processing Fee:</span><span class="font-semibold text-[#0f766e]">' + formatCurrency(processingFee) + '</span></div>';
  html += '<hr class="my-2">';
  html += '<div class="flex justify-between"><span class="font-bold text-[#0f766e]">Total Cost of Credit:</span><span class="font-bold text-[#111827] text-base">' + formatCurrency(Math.round(totalPayment)) + '</span></div>';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Effective Interest Rate (EIR):</span><span class="font-semibold text-[#0f766e]">' + eir.toFixed(1) + '% p.a.</span></div>';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Duration:</span><span class="font-semibold text-[#0f766e]">' + duration + ' month(s)</span></div>';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Monthly Payment:</span><span class="font-semibold text-[#0f766e]">' + formatCurrency(monthlyPayment) + '</span></div>';
  html += '<div class="flex justify-between"><span class="text-[#6b7280]">Net Disbursement:</span><span class="font-semibold text-[#0f766e]">' + formatCurrency(netDisbursement) + '</span></div>';
  html += '</div>';

  if (product.isSignatureProduct) {
    html += '<div class="mt-3 p-2 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg text-xs text-[#92400E]">⭐ Signature Product — ' + (product.processingTimeMinutes || 30) + '-minute processing promise</div>';
  }

  calcEl.innerHTML = html;
  submitEl.style.display = 'block';
}

/**
 * Submit a new loan application.
 */
function submitNewLoan(container, options) {
  var clientId = document.getElementById('loan-client-id').value;
  var productId = document.getElementById('loan-product-id').value;
  var amount = Number(document.getElementById('loan-amount').value);
  var payoutMethod = document.getElementById('loan-payout').value;
  var collateralDesc = document.getElementById('loan-collateral').value;

  if (!clientId || !productId || !amount) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  var clients = getCollection(StorageKeys.CLIENTS);
  var client = null;
  for (var i = 0; i < clients.length; i++) {
    if (clients[i].id === clientId) { client = clients[i]; break; }
  }

  var products = getCollection(StorageKeys.PRODUCTS);
  var product = null;
  for (var p = 0; p < products.length; p++) {
    if (products[p].id === productId) { product = products[p]; break; }
  }

  if (!client || !product) {
    showToast('Invalid client or product selected', 'error');
    return;
  }

  var session = getSession();
  var now = new Date().toISOString();

  var loanData = {
    applicationDate: todayISO(),
    clientId: clientId,
    clientName: client.fullName,
    productId: productId,
    productCode: product.productCode || '',
    productName: product.productName,
    requestedAmount: amount,
    proposedInterestRate: product.defaultInterestRate,
    status: 'Pending',
    rejectionReason: null,
    collateral: collateralDesc ? [{ description: collateralDesc, marketValue: 0 }] : [],
    disbursementDate: null,
    payoutMethod: null,
    amortizationSchedule: [],
    groupId: client.groupId || null,
    effectiveInterestRate: null,
    effectiveInterestRateCalculated: null,
    totalCostOfCredit: null,
    interestMethod: product.interestMethod,
    compulsorySavingsAmount: null,
    disclosureStatementGenerated: false,
    rbmReportingCategory: product.rbmReportingCategory || 'SHORT_TERM',
    branchId: client.branchId,
    auditTrail: JSON.stringify([{action:'created',by:session?session.fullName:'System',date:todayISO()}]),
    createdAt: now,
    updatedAt: now
  };

  addItem(StorageKeys.LOANS, loanData);
  logAudit('create_loan', { module: 'loans', entityId: loanData.id, changedTo: loanData.clientName + ' - ' + formatCurrency(amount) });
  showToast('Loan application submitted successfully!', 'success');
  renderLoans(container, options);
}

/**
 * Render loan detail view with full RBM-compliant information.
 */
function renderLoanDetail(container, loanId, options) {
  var loans = getCollection(StorageKeys.LOANS);
  var loan = null;
  for (var i = 0; i < loans.length; i++) {
    if (loans[i].id === loanId) { loan = loans[i]; break; }
  }
  if (!loan) { renderLoans(container, options); return; }

  var products = getCollection(StorageKeys.PRODUCTS);
  var product = null;
  for (var p = 0; p < products.length; p++) {
    if (products[p].id === loan.productId) { product = products[p]; break; }
  }

  var sClass = 'bg-gray-50 text-[#374151]';
  if (loan.status === 'Active') sClass = 'bg-[#0f766e] text-white';
  else if (loan.status === 'Approved') sClass = 'bg-[#0f766e] text-white';
  else if (loan.status === 'Disbursed') sClass = 'bg-[#0d9488] text-white';
  else if (loan.status === 'Rejected') sClass = 'bg-[#111827] text-white';
  else if (loan.status === 'Pending') sClass = 'bg-[#F59E0B] text-white';
  else if (loan.status === 'Under_Review') sClass = 'bg-[#8b5cf6] text-white';

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-loans" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">Loan Application Detail</h1>';
  html += '</div>';

  // Product badge
  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<div class="flex items-start justify-between mb-4">';
  html += '<div>';
  html += '<h2 class="text-xl font-semibold text-[#0f766e]">' + escapeHtml(loan.clientName) + '</h2>';
  html += '<p class="text-sm text-[#6b7280]">' + escapeHtml(loan.productCode || loan.productName) + '</p>';
  html += '</div>';
  html += '<span class="px-3 py-1 rounded-full text-xs font-semibold ' + sClass + '">' + escapeHtml(loan.status.replace('_', ' ')) + '</span>';
  html += '</div>';

  // Key metrics
  html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">';
  html += '<div><span class="text-[#6b7280] block">Principal</span><span class="font-semibold text-[#0f766e]">' + formatCurrency(loan.requestedAmount) + '</span></div>';
  html += '<div><span class="text-[#6b7280] block">Interest Rate</span><span class="font-semibold text-[#0f766e]">' + formatPercentage(loan.proposedInterestRate || (product ? product.defaultInterestRate : 0)) + '</span></div>';
  html += '<div><span class="text-[#6b7280] block">EIR (Annualized)</span><span class="font-semibold text-[#0f766e]">' + (loan.effectiveInterestRateCalculated ? loan.effectiveInterestRateCalculated + '%' : '—') + '</span></div>';
  html += '<div><span class="text-[#6b7280] block">Applied Date</span><span class="font-semibold text-[#0f766e]">' + formatDate(loan.applicationDate) + '</span></div>';
  if (loan.disbursementDate) {
    html += '<div><span class="text-[#6b7280] block">Disbursed</span><span class="font-semibold text-[#0f766e]">' + formatDate(loan.disbursementDate) + '</span></div>';
  }
  if (loan.totalCostOfCredit) {
    html += '<div><span class="text-[#6b7280] block">Total Cost of Credit</span><span class="font-semibold text-[#111827]">' + formatCurrency(loan.totalCostOfCredit) + '</span></div>';
  }
  if (loan.compulsorySavingsAmount) {
    html += '<div><span class="text-[#6b7280] block">Compulsory Savings</span><span class="font-semibold text-[#F59E0B]">' + formatCurrency(loan.compulsorySavingsAmount) + '</span></div>';
  }
  html += '</div>';

  // Collateral
  if (loan.collateral && loan.collateral.length > 0) {
    html += '<div class="mt-4 pt-4 border-t border-[#d1d5db]">';
    html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-2">Collateral</h3>';
    for (var c = 0; c < loan.collateral.length; c++) {
      html += '<p class="text-sm text-[#6b7280]">' + escapeHtml(loan.collateral[c].description) + ' — ' + formatCurrency(loan.collateral[c].marketValue) + '</p>';
    }
    html += '</div>';
  }

  // Documents required (from product)
  if (product && product.documentChecklist) {
    var docs = JSON.parse(product.documentChecklist);
    html += '<div class="mt-4 pt-4 border-t border-[#d1d5db]">';
    html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-2">Required Documents</h3>';
    for (var d = 0; d < docs.length; d++) {
      html += '<p class="text-sm text-[#6b7280]">📄 ' + escapeHtml(docs[d]) + '</p>';
    }
    html += '</div>';
  }

  // Audit trail
  if (loan.auditTrail) {
    try {
      var trail = JSON.parse(loan.auditTrail);
      html += '<div class="mt-4 pt-4 border-t border-[#d1d5db]">';
      html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-2">Audit Trail</h3>';
      for (var a = 0; a < trail.length; a++) {
        var action = trail[a].action;
        if (action === 'created') html += '<p class="text-sm text-[#6b7280]">📝 Created: ' + escapeHtml(trail[a].date || 'N/A') + '</p>';
        else if (action === 'approved') html += '<p class="text-sm text-[#0f766e]">✅ Approved</p>';
        else if (action === 'rejected') html += '<p class="text-sm text-[#111827]">❌ Rejected: ' + escapeHtml(trail[a].reason || '') + '</p>';
        else if (action === 'disbursed') html += '<p class="text-sm text-[#0d9488]">💰 Disbursed</p>';
        else if (action === 'reviewed') html += '<p class="text-sm text-[#8b5cf6]">🔍 Under Review</p>';
      }
      html += '</div>';
    } catch (e) {}
  }

  html += '</div>';

  // Amortization schedule
  if (loan.amortizationSchedule && loan.amortizationSchedule.length > 0) {
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    html += '<div class="p-4 border-b border-[#d1d5db]"><h3 class="text-sm font-semibold text-[#0f766e]">Repayment Schedule</h3></div>';
    html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
    html += '<thead class="bg-[#f9fafb]"><tr>';
    html += '<th class="text-left px-4 py-2 text-[#6b7280] font-medium">#</th>';
    html += '<th class="text-left px-4 py-2 text-[#6b7280] font-medium">Due Date</th>';
    html += '<th class="text-right px-4 py-2 text-[#6b7280] font-medium">Principal</th>';
    html += '<th class="text-right px-4 py-2 text-[#6b7280] font-medium">Interest</th>';
    html += '<th class="text-right px-4 py-2 text-[#6b7280] font-medium">Balance</th>';
    html += '<th class="text-center px-4 py-2 text-[#6b7280] font-medium">Status</th>';
    html += '</tr></thead><tbody>';

    for (var s = 0; s < loan.amortizationSchedule.length; s++) {
      var inst = loan.amortizationSchedule[s];
      var instClass = inst.status === 'Paid' ? 'bg-[#0f766e] text-white' :
                      inst.status === 'Overdue' ? 'bg-[#111827] text-white' : 'bg-gray-50 text-[#374151]';
      var remBal = 0;
      for (var rb = s; rb < loan.amortizationSchedule.length; rb++) {
        remBal += loan.amortizationSchedule[rb].principal;
      }
      html += '<tr class="border-b border-[#d1d5db]">';
      html += '<td class="px-4 py-2">' + inst.installmentNo + '</td>';
      html += '<td class="px-4 py-2">' + formatDate(inst.dueDate) + '</td>';
      html += '<td class="px-4 py-2 text-right">' + formatCurrency(inst.principal) + '</td>';
      html += '<td class="px-4 py-2 text-right">' + formatCurrency(inst.interest) + '</td>';
      html += '<td class="px-4 py-2 text-right font-medium">' + formatCurrency(remBal) + '</td>';
      html += '<td class="px-4 py-2 text-center"><span class="px-2 py-0.5 rounded-full text-xs font-semibold ' + instClass + '">' + inst.status + '</span></td>';
      html += '</tr>';
    }
    html += '</tbody></table></div></div>';

    // Payment button if Active
    if (loan.status === 'Active' || loan.status === 'Disbursed') {
      html += '<div class="mt-4 flex gap-3">';
      html += '<button id="btn-record-payment" class="bg-[#0f766e] text-white px-6 py-2.5 rounded-xl hover:bg-[#134e4a] font-medium text-sm">Record Payment</button>';
      html += '<button id="btn-gen-disclosure" class="bg-[#111827] border border-[#111827] text-[#111827] px-6 py-2.5 rounded-xl hover:bg-[#111827] hover:text-white font-medium text-sm">Download TCC Disclosure</button>';
      html += '</div>';
    }
  }

  html += '</div>';
  container.innerHTML = html;

  document.getElementById('btn-back-loans').addEventListener('click', function() { renderLoans(container, options); });

  if (document.getElementById('btn-record-payment')) {
    document.getElementById('btn-record-payment').addEventListener('click', function() {
      renderRepayment(container, loanId);
    });
  }

  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btn-gen-disclosure') {
      generateDisclosureStatement(loan);
    }
  });
}

/**
 * Generate client disclosure statement for a loan.
 */
function generateDisclosureStatement(loan) {
  var products = getCollection(StorageKeys.PRODUCTS);
  var product = null;
  for (var p = 0; p < products.length; p++) {
    if (products[p].id === loan.productId) { product = products[p]; break; }
  }

  var html = '<div style="padding:32px;font-family:system-ui;max-width:700px;margin:auto;">';
  html += '<div style="text-align:center;margin-bottom:24px;border-bottom:2px solid #0f766e;padding-bottom:16px;">';
  html += '<h1 style="color:#0f766e;font-size:20px;margin:0;">SAILE FINANCIAL SERVICES LIMITED</h1>';
  html += '<p style="color:#111827;font-size:12px;margin:4px 0 0;">Licensed by RBM — NDMFI 017/22</p>';
  html += '</div>';
  html += '<h2 style="color:#0f766e;font-size:16px;text-align:center;margin-bottom:20px;">CLIENT DISCLOSURE STATEMENT</h2>';
  html += '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:16px;">';
  html += '<tr><td style="padding:8px 0;color:#6b7280;width:50%;">Client Name:</td><td style="padding:8px 0;font-weight:600;color:#0f766e;">' + escapeHtml(loan.clientName) + '</td></tr>';
  html += '<tr><td style="padding:8px 0;color:#6b7280;">Product:</td><td style="padding:8px 0;font-weight:600;">' + escapeHtml(loan.productCode) + ' - ' + escapeHtml(loan.productName) + '</td></tr>';
  html += '<tr><td style="padding:8px 0;color:#6b7280;">Disbursement Date:</td><td style="padding:8px 0;font-weight:600;">' + formatDate(loan.disbursementDate) + '</td></tr>';
  html += '<tr style="background:#F5F6FA;"><td style="padding:10px 0;border-top:1px solid #d1d5db;color:#0f766e;font-weight:600;">Principal Amount:</td><td style="padding:10px 0;border-top:1px solid #d1d5db;font-weight:700;color:#0f766e;">MWK ' + formatCurrency(loan.requestedAmount) + '</td></tr>';

  var totalInterest = 0;
  if (loan.amortizationSchedule) {
    for (var i = 0; i < loan.amortizationSchedule.length; i++) {
      totalInterest += loan.amortizationSchedule[i].interest;
    }
  }
  html += '<tr><td style="padding:8px 0;color:#6b7280;">Total Interest:</td><td style="padding:8px 0;font-weight:600;">MWK ' + formatCurrency(Math.round(totalInterest)) + '</td></tr>';
  html += '<tr><td style="padding:8px 0;color:#6b7280;">Processing Fee:</td><td style="padding:8px 0;font-weight:600;">MWK ' + formatCurrency(loan.processingFee || 0) + '</td></tr>';
  html += '<tr><td style="padding:8px 0;color:#6b7280;">Compulsory Savings:</td><td style="padding:8px 0;font-weight:600;color:#0f766e;">MWK ' + formatCurrency(loan.compulsorySavingsAmount || 0) + ' (20%)</td></tr>';
  html += '<tr style="background:#fef2f2;"><td style="padding:10px 0;border-top:2px solid #d1d5db;color:#0f766e;font-weight:700;">TOTAL COST OF CREDIT:</td><td style="padding:10px 0;border-top:2px solid #d1d5db;font-weight:700;color:#111827;">MWK ' + formatCurrency(loan.totalCostOfCredit || 0) + '</td></tr>';
  html += '<tr><td style="padding:8px 0;color:#6b7280;">Monthly Repayment:</td><td style="padding:8px 0;font-weight:600;">MWK ' + formatCurrency(Math.round((loan.totalCostOfCredit || 0) / (loan.amortizationSchedule ? loan.amortizationSchedule.length : 1))) + '</td></tr>';
  html += '<tr style="background:#F5F6FA;"><td style="padding:10px 0;color:#6b7280;font-weight:600;">Effective Interest Rate (EIR):</td><td style="padding:10px 0;font-weight:700;color:#0f766e;">' + (loan.effectiveInterestRateCalculated || '—') + '% p.a.</td></tr>';
  html += '</table>';

  html += '<div style="background:#FEF3C7;border:1px solid #F59E0B;padding:12px;border-radius:8px;font-size:12px;color:#92400E;margin-bottom:16px;">';
  html += '<strong>⚠️ Important Notice:</strong> The Effective Interest Rate (EIR) of ' + (loan.effectiveInterestRateCalculated || '—') + '% per annum reflects the true annual cost of this loan, including all fees and the compulsory savings deduction.';
  html += '</div>';

  if (loan.amortizationSchedule && loan.amortizationSchedule.length > 0) {
    html += '<h3 style="color:#0f766e;font-size:14px;margin-bottom:8px;">Repayment Schedule</h3>';
    html += '<table style="width:100%;font-size:11px;border-collapse:collapse;">';
    html += '<tr style="background:#F9FAFB;"><th style="padding:6px;text-align:left;border-bottom:1px solid #d1d5db;">#</th><th style="padding:6px;text-align:left;border-bottom:1px solid #d1d5db;">Due Date</th><th style="padding:6px;text-align:right;border-bottom:1px solid #d1d5db;">Principal</th><th style="padding:6px;text-align:right;border-bottom:1px solid #d1d5db;">Interest</th><th style="padding:6px;text-align:right;border-bottom:1px solid #d1d5db;">Balance</th></tr>';
    for (var s = 0; s < loan.amortizationSchedule.length; s++) {
      var inst = loan.amortizationSchedule[s];
      var remBal = 0;
      for (var rb = s; rb < loan.amortizationSchedule.length; rb++) { remBal += loan.amortizationSchedule[rb].principal; }
      html += '<tr><td style="padding:5px;">' + inst.installmentNo + '</td><td style="padding:5px;">' + formatDate(inst.dueDate) + '</td><td style="padding:5px;text-align:right;">' + formatCurrency(inst.principal) + '</td><td style="padding:5px;text-align:right;">' + formatCurrency(inst.interest) + '</td><td style="padding:5px;text-align:right;font-weight:600;">' + formatCurrency(remBal) + '</td></tr>';
    }
    html += '</table>';
  }

  html += '<div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #d1d5db;">';
  html += '<p style="font-size:11px;color:#9ca3af;">Generated by Saile Financial Services System — ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) + '</p>';
  html += '<p style="font-size:10px;color:#9ca3af;margin-top:4px;">This document serves as official disclosure per RBM Fourth Schedule</p>';
  html += '</div></div>';

  var win = window.open('', '_blank');
  if (win) {
    win.document.write('<!DOCTYPE html><html><head><title>TCC Disclosure - ' + loan.clientName + '</title></head>');
    win.document.write('<body><style>body{font-family:system-ui;padding:40px;color:#0f766e;}table{border-collapse:collapse;width:100%;}td,th{padding:6px;text-align:left;border-bottom:1px solid #d1d5db;}</style>');
    win.document.write(html + '</body></html>');
    win.document.close();
  }

  logAudit('generate_disclosure', { module: 'loans', entityId: loanId });
}

window.renderLoans = renderLoans;