// ============================================================================
// Saile Platform v2 — Screen 07: Accounting
// ============================================================================

/**
 * Render the Accounting module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderAccounting(container, options) {
  var readOnly = options && options.readOnly;
  var viewMode = 'vouchers'; // vouchers, trial-balance, cash-book, chart-of-accounts

  function render() {
    var html = '<div class="space-y-6">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Accounting</h1>';
    html += '<p class="text-sm text-[#6b7280]">Financial management and reporting</p>';
    html += '</div>';

    // View tabs
    html += '<div class="flex flex-wrap gap-2">';
    var tabs = [['vouchers','Vouchers'],['trial-balance','Trial Balance'],['cash-book','Cash Book'],['chart-of-accounts','Chart of Accounts']];
    for (var t = 0; t < tabs.length; t++) {
      var active = viewMode === tabs[t][0] ? 'bg-[#111827] text-white' : 'bg-white text-[#0f766e] border border-[#d1d5db] hover:bg-[#f4f4f5]';
      html += '<button class="acct-tab px-4 py-2 rounded-xl text-sm font-medium ' + active + '" data-view="' + tabs[t][0] + '">' + tabs[t][1] + '</button>';
    }
    html += '</div>';

    if (viewMode === 'vouchers') {
      html += renderVouchersView(readOnly);
    } else if (viewMode === 'trial-balance') {
      html += renderTrialBalanceView();
    } else if (viewMode === 'cash-book') {
      html += renderCashBookView();
    } else {
      html += renderChartOfAccountsView();
    }

    html += '</div>';
    container.innerHTML = html;
    attachAccountingEvents();
  }

  function renderVouchersView(readOnly) {
    var vouchers = getCollection(StorageKeys.VOUCHERS);
    var html = '';

    if (!readOnly) {
      html += '<div class="flex justify-end">';
      html += '<button id="btn-new-voucher" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">+ New Voucher</button>';
      html += '</div>';
    }

    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    if (vouchers.length === 0) {
      html += '<div class="p-8 text-center text-[#6b7280]"><p class="text-sm">No voucher entries.</p></div>';
    } else {
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f4f4f5] border-b border-[#d1d5db]"><tr>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Date</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Type</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Source</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Target</th>';
      html += '<th class="text-right px-4 py-3 font-medium text-[#6b7280]">Amount</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Description</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < vouchers.length; i++) {
        var v = vouchers[i];
        var typeClass = v.voucherType === 'debit' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700';
        html += '<tr class="border-b border-[#d1d5db] hover:bg-[#f4f4f5]">';
        html += '<td class="px-4 py-3">' + formatDate(v.voucherDate) + '</td>';
        html += '<td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + typeClass + '">' + escapeHtml(v.voucherType) + '</span></td>';
        html += '<td class="px-4 py-3">' + escapeHtml(v.sourceAccount) + '</td>';
        html += '<td class="px-4 py-3">' + escapeHtml(v.targetAccount) + '</td>';
        html += '<td class="px-4 py-3 text-right font-medium">' + formatCurrency(v.amount) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280]">' + escapeHtml(v.description) + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
    }
    html += '</div>';
    return html;
  }

  function renderTrialBalanceView() {
    var tb = calculateTrialBalance();
    var html = '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
    html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">Trial Balance</h3>';

    html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">';
    html += '<div class="p-4 bg-red-50 rounded-lg"><p class="text-xs text-red-600">Total Debits</p><p class="text-xl font-bold text-red-700">' + formatCurrency(tb.totalDebits) + '</p></div>';
    html += '<div class="p-4 bg-emerald-50 rounded-lg"><p class="text-xs text-emerald-600">Total Credits</p><p class="text-xl font-bold text-emerald-700">' + formatCurrency(tb.totalCredits) + '</p></div>';
    html += '<div class="p-4 ' + (tb.isBalanced ? 'bg-emerald-50' : 'bg-amber-50') + ' rounded-lg"><p class="text-xs ' + (tb.isBalanced ? 'text-emerald-600' : 'text-amber-600') + '">Difference</p><p class="text-xl font-bold ' + (tb.isBalanced ? 'text-emerald-700' : 'text-amber-700') + '">' + formatCurrency(tb.difference) + '</p></div>';
    html += '</div>';

    html += '<div class="flex items-center gap-2">';
    if (tb.isBalanced) {
      html += '<span class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">✓ Balanced</span>';
    } else {
      html += '<span class="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">⚠ Unbalanced</span>';
    }
    html += '</div></div>';
    return html;
  }

  function renderCashBookView() {
    var balance = getValue(StorageKeys.CASH_BALANCE) || 0;
    var vouchers = getCollection(StorageKeys.VOUCHERS);
    var collections = getCollection(StorageKeys.COLLECTIONS);

    var html = '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
    html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">Cash Book</h3>';

    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">';
    html += '<div class="p-4 bg-sky-50 rounded-lg"><p class="text-xs text-sky-600">Current Cash Balance</p><p class="text-2xl font-bold text-sky-700">' + formatCurrency(balance) + '</p></div>';
    html += '<div class="p-4 bg-[#f4f4f5] rounded-lg"><p class="text-xs text-[#6b7280]">Total Transactions</p><p class="text-2xl font-bold text-[#0f766e]">' + (vouchers.length + collections.length) + '</p></div>';
    html += '</div>';

    // Recent transactions
    html += '<h4 class="text-sm font-medium text-[#0f766e] mb-3">Recent Entries</h4>';
    html += '<div class="space-y-2">';
    var recentVouchers = vouchers.slice(-5).reverse();
    for (var i = 0; i < recentVouchers.length; i++) {
      var v = recentVouchers[i];
      var isDebit = v.voucherType === 'debit';
      html += '<div class="flex items-center justify-between p-3 rounded-lg bg-[#f4f4f5]">';
      html += '<div><p class="text-sm font-medium text-[#0f766e]">' + escapeHtml(v.description) + '</p>';
      html += '<p class="text-xs text-[#6b7280]">' + formatDate(v.voucherDate) + '</p></div>';
      html += '<span class="text-sm font-medium ' + (isDebit ? 'text-red-600' : 'text-emerald-600') + '">' + (isDebit ? '-' : '+') + formatCurrency(v.amount) + '</span>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderChartOfAccountsView() {
    var accounts = [
      { code: '1000', name: 'Assets', children: [
        { code: '1100', name: 'Cash on Hand' },
        { code: '1200', name: 'Loan Portfolio' },
        { code: '1300', name: 'Fixed Assets' }
      ]},
      { code: '2000', name: 'Liabilities', children: [
        { code: '2100', name: 'Savings Deposits' },
        { code: '2200', name: 'Borrowings' }
      ]},
      { code: '3000', name: 'Equity', children: [
        { code: '3100', name: 'Share Capital' },
        { code: '3200', name: 'Retained Earnings' }
      ]},
      { code: '4000', name: 'Income', children: [
        { code: '4100', name: 'Interest Income' },
        { code: '4200', name: 'Fee Income' },
        { code: '4300', name: 'Penalty Income' }
      ]},
      { code: '5000', name: 'Expenses', children: [
        { code: '5100', name: 'Staff Costs' },
        { code: '5200', name: 'Operating Expenses' },
        { code: '5300', name: 'Provision for Bad Debts' }
      ]}
    ];

    var html = '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
    html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-4">Chart of Accounts</h3>';
    html += '<div class="space-y-3">';

    for (var i = 0; i < accounts.length; i++) {
      var acct = accounts[i];
      html += '<div class="border border-[#d1d5db] rounded-lg overflow-hidden">';
      html += '<div class="px-4 py-3 bg-[#f4f4f5] font-medium text-sm text-[#0f766e]">' + acct.code + ' — ' + acct.name + '</div>';
      for (var j = 0; j < acct.children.length; j++) {
        html += '<div class="px-4 py-2 pl-8 text-sm text-[#6b7280] border-t border-[#d1d5db]">' + acct.children[j].code + ' — ' + acct.children[j].name + '</div>';
      }
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function attachAccountingEvents() {
    container.querySelectorAll('.acct-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        viewMode = this.getAttribute('data-view');
        render();
      });
    });

    var newVoucherBtn = document.getElementById('btn-new-voucher');
    if (newVoucherBtn) {
      newVoucherBtn.addEventListener('click', function() { renderVoucherForm(container, options); });
    }
  }

  render();
}

/**
 * Render voucher entry form.
 */
function renderVoucherForm(container, options) {
  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-accounting" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">New Voucher Entry</h1>';
  html += '</div>';

  html += '<form id="voucher-form" class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-4">';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Voucher Date *</label>';
  html += '<input type="date" name="voucherDate" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + todayISO() + '" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Type *</label>';
  html += '<select name="voucherType" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm" required>';
  html += '<option value="debit">Debit</option><option value="credit">Credit</option>';
  html += '</select></div>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Source Account *</label>';
  html += '<input type="text" name="sourceAccount" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" placeholder="e.g., 1100" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Target Account *</label>';
  html += '<input type="text" name="targetAccount" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" placeholder="e.g., 4100" required></div>';
  html += '</div>';

  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Amount (MWK) *</label>';
  html += '<input type="number" name="amount" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" required></div>';

  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Description *</label>';
  html += '<input type="text" name="description" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" required></div>';

  html += '<div class="flex gap-3">';
  html += '<button type="submit" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">Create Voucher</button>';
  html += '<button type="button" id="btn-cancel-voucher" class="bg-white border border-[#d1d5db] text-[#0f766e] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Cancel</button>';
  html += '</div></form></div>';

  container.innerHTML = html;

  document.getElementById('btn-back-accounting').addEventListener('click', function() { renderAccounting(container, options); });
  document.getElementById('btn-cancel-voucher').addEventListener('click', function() { renderAccounting(container, options); });

  document.getElementById('voucher-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var session = getSession();

    var data = {
      voucherDate: form.voucherDate.value,
      voucherType: form.voucherType.value,
      sourceAccount: form.sourceAccount.value.trim(),
      targetAccount: form.targetAccount.value.trim(),
      amount: Number(form.amount.value),
      description: form.description.value.trim(),
      createdBy: session ? session.name : 'Unknown'
    };

    addItem(StorageKeys.VOUCHERS, data);
    logAudit('create_voucher', { module: 'accounting', changedTo: data.description + ' - ' + formatCurrency(data.amount) });
    showToast('Voucher created successfully', 'success');
    renderAccounting(container, options);
  });
}

window.renderAccounting = renderAccounting;
