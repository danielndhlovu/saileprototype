// ============================================================================
// Saile Platform v2 — Screen 05: Savings Module
// ============================================================================

/**
 * Render the Savings module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderSavings(container, options) {
  var readOnly = options && options.readOnly;
  var role = options && options.role;
  var savingsAccounts = getCollection(StorageKeys.SAVINGS_ACCOUNTS) || [];
  var savingsProducts = getCollection(StorageKeys.SAVINGS_PRODUCTS) || [];
  var searchQuery = '';
  var filterProduct = '';

  function render() {
    var filtered = savingsAccounts.filter(function(a) {
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        if (a.accountHolder.toLowerCase().indexOf(q) === -1 && a.accountNumber.toLowerCase().indexOf(q) === -1) return false;
      }
      if (filterProduct && a.productId !== filterProduct) return false;
      return true;
    });

    var totalBalances = 0;
    filtered.forEach(function(a) { totalBalances += (a.balance || 0); });

    var html = '<div class="space-y-6">';

    // Header
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Savings Module</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + savingsAccounts.length + ' active savings accounts</p>';
    html += '</div>';
    if (!readOnly && (role === 'admin' || role === 'branch_manager' || role === 'accountant')) {
      html += '<button id="btn-open-account" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">+ Open Account</button>';
    }
    html += '</div>';

    // Summary cards
    html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
    html += '<div class="text-sm text-[#6b7280] mb-1">Total Accounts</div>';
    html += '<div class="text-2xl font-bold text-[#0f766e]">' + filtered.length + '</div>';
    html += '<div class="text-xs text-[#6b7280] mt-1">of ' + savingsAccounts.length + ' total</div>';
    html += '</div>';

    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
    html += '<div class="text-sm text-[#6b7280] mb-1">Total Balances</div>';
    html += '<div class="text-2xl font-bold text-[#0f766e]">' + formatCurrency(totalBalances) + '</div>';
    html += '<div class="text-xs text-[#6b7280] mt-1">MWK across all accounts</div>';
    html += '</div>';

    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
    html += '<div class="text-sm text-[#6b7280] mb-1">Savings Products</div>';
    html += '<div class="text-2xl font-bold text-[#111827]">' + savingsProducts.length + '</div>';
    html += '<div class="text-xs text-[#6b7280] mt-1">available product types</div>';
    html += '</div>';

    var avgBalance = filtered.length > 0 ? Math.round(totalBalances / filtered.length) : 0;
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-5">';
    html += '<div class="text-sm text-[#6b7280] mb-1">Avg Balance</div>';
    html += '<div class="text-2xl font-bold text-[#F59E0B]">' + formatCurrency(avgBalance) + '</div>';
    html += '<div class="text-xs text-[#6b7280] mt-1">per account</div>';
    html += '</div>';
    html += '</div>';

    // Search and filter
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
    html += '<div class="flex flex-col sm:flex-row gap-3">';
    html += '<input type="text" id="savings-search" class="flex-1 px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" placeholder="Search by holder name or account number..." value="' + escapeHtml(searchQuery) + '">';
    html += '<select id="savings-product-filter" class="px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
    html += '<option value="">All Products</option>';
    for (var p = 0; p < savingsProducts.length; p++) {
      var sel = filterProduct === savingsProducts[p].id ? ' selected' : '';
      html += '<option value="' + savingsProducts[p].id + '"' + sel + '>' + escapeHtml(savingsProducts[p].name) + '</option>';
    }
    html += '</select></div></div>';

    // Accounts table
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    if (filtered.length === 0) {
      html += '<div class="p-8 text-center text-[#6b7280]"><p class="text-sm">No savings accounts found.</p></div>';
    } else {
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f4f4f5] border-b border-[#d1d5db]"><tr>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Account #</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Holder</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Branch</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Product</th>';
      html += '<th class="text-right px-4 py-3 font-medium text-[#6b7280]">Balance</th>';
      html += '<th class="text-center px-4 py-3 font-medium text-[#6b7280]">Status</th>';
      html += '<th class="text-center px-4 py-3 font-medium text-[#6b7280]">Last Txn</th>';
      html += '<th class="text-center px-4 py-3 font-medium text-[#6b7280]">Actions</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < filtered.length; i++) {
        var a = filtered[i];
        var branch = getBranchName(a.branchId);
        var product = getProductById(a.productId);
        var lastTxn = a.lastTransactionDate ? formatDate(a.lastTransactionDate) : '—';

        html += '<tr class="border-b border-[#d1d5db] hover:bg-[#f4f4f5]">';
        html += '<td class="px-4 py-3 font-medium text-[#0f766e]">' + escapeHtml(a.accountNumber) + '</td>';
        html += '<td class="px-4 py-3 text-[#0f766e]">' + escapeHtml(a.accountHolder) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280]">' + escapeHtml(branch) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280]">' + escapeHtml(product ? product.name : a.productId) + '</td>';
        html += '<td class="px-4 py-3 text-right font-semibold text-[#0f766e]">' + formatCurrency(a.balance || 0) + '</td>';

        var statusColor = a.status === 'Active' ? 'bg-[#f0fdf4] text-[#0f766e]' :
                          a.status === 'Inactive' ? 'bg-[#fef2f2] text-[#111827]' : 'bg-gray-100 text-gray-600';
        html += '<td class="px-4 py-3 text-center"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + statusColor + '">' + escapeHtml(a.status) + '</span></td>';
        html += '<td class="px-4 py-3 text-[#6b7280] text-center">' + lastTxn + '</td>';

        html += '<td class="px-4 py-3 text-center space-x-1">';
        if (!readOnly && a.status === 'Active') {
          html += '<button class="text-[#0f766e] text-xs font-medium hover:underline btn-savings-deposit" data-id="' + a.id + '">Deposit</button>';
          html += '<button class="text-[#111827] text-xs font-medium hover:underline ml-2 btn-savings-withdraw" data-id="' + a.id + '">Withdraw</button>';
        }
        if (!readOnly) {
          html += '<button class="text-[#6b7280] text-xs font-medium hover:underline ml-2 btn-savings-close" data-id="' + a.id + '">Close</button>';
        }
        html += '</td></tr>';
      }
      html += '</tbody></table></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
    attachSavingsEvents();
  }

  function getBranchName(branchId) {
    var branches = getCollection(StorageKeys.BRANCHES);
    var branch = branches.find(function(b) { return b.id === branchId; });
    return branch ? branch.branchCode : '—';
  }

  function getProductById(productId) {
    var products = getCollection(StorageKeys.SAVINGS_PRODUCTS);
    return products.find(function(p) { return p.id === productId; });
  }

  function attachSavingsEvents() {
    var searchInput = document.getElementById('savings-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchQuery = this.value;
        render();
      });
    }

    var productFilter = document.getElementById('savings-product-filter');
    if (productFilter) {
      productFilter.addEventListener('change', function() {
        filterProduct = this.value;
        render();
      });
    }

    // Open Account button
    var addBtn = document.getElementById('btn-open-account');
    if (addBtn) {
      addBtn.addEventListener('click', function() { renderSavingsForm(container, options); });
    }

    // Deposit
    container.querySelectorAll('.btn-savings-deposit').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        handleSavingsTransaction(id, 'deposit');
      });
    });

    // Withdraw
    container.querySelectorAll('.btn-savings-withdraw').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        handleSavingsTransaction(id, 'withdraw');
      });
    });

    // Close
    container.querySelectorAll('.btn-savings-close').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        closeSavingsAccount(id);
      });
    });
  }

  function handleSavingsTransaction(accountId, type) {
    var accounts = getCollection(StorageKeys.SAVINGS_ACCOUNTS);
    var account = null;
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].id === accountId) { account = accounts[i]; break; }
    }
    if (!account) return;

    var session = getSession();
    var amount = parseFloat(prompt('Enter ' + type + ' amount (MWK):'));
    if (!amount || amount <= 0) return;

    if (type === 'withdraw' && amount > account.balance) {
      showToast('Insufficient balance', 'error');
      return;
    }

    if (type === 'deposit') {
      account.balance += amount;
      showToast('Deposited ' + formatCurrency(amount) + ' successfully', 'success');
    } else {
      account.balance -= amount;
      showToast('Withdrew ' + formatCurrency(amount) + ' successfully', 'success');
    }

    account.lastTransactionDate = todayISO();
    setCollection(StorageKeys.SAVINGS_ACCOUNTS, accounts);

    logAudit(type + '_savings', {
      module: 'savings',
      entityId: accountId,
      changedTo: type + ' of ' + formatCurrency(amount) + ' — Balance: ' + formatCurrency(account.balance)
    });

    // Record transaction in savings transactions
    var transactions = getCollection(StorageKeys.SAVINGS_TRANSACTIONS) || [];
    transactions.push({
      id: generateId(),
      accountId: accountId,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      type: type,
      amount: amount,
      balanceAfter: account.balance,
      date: todayISO(),
      performedBy: session ? session.name : 'System'
    });
    setCollection(StorageKeys.SAVINGS_TRANSACTIONS, transactions);

    // Update cash balance
    var cashBalance = getValue(StorageKeys.CASH_BALANCE) || 0;
    if (type === 'deposit') {
      setValue(StorageKeys.CASH_BALANCE, cashBalance + amount);
    } else {
      setValue(StorageKeys.CASH_BALANCE, cashBalance - amount);
    }

    render();
  }

  function closeSavingsAccount(accountId) {
    if (!confirm('Are you sure you want to close this savings account?')) return;
    var accounts = getCollection(StorageKeys.SAVINGS_ACCOUNTS);
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].id === accountId) {
        accounts[i].status = 'CLOSED';
        accounts[i].closedDate = todayISO();
        break;
      }
    }
    setCollection(StorageKeys.SAVINGS_ACCOUNTS, accounts);
    logAudit('close_savings_account', { module: 'savings', entityId: accountId });
    showToast('Savings account closed', 'warning');
    render();
  }

  /**
   * Render the form to open a new savings account.
   */
  function renderSavingsForm(container, options) {
    var clients = getCollection(StorageKeys.CLIENTS) || [];
    var savingsProducts = getCollection(StorageKeys.SAVINGS_PRODUCTS) || [];
    var branches = getCollection(StorageKeys.BRANCHES) || [];
    var session = getSession();

    var html = '<div class="space-y-6">';
    html += '<div class="flex items-center gap-4">';
    html += '<button id="btn-back-savings" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Open New Savings Account</h1>';
    html += '</div>';

    html += '<form id="savings-form" class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-4">';

    // Client selection
    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Client *</label>';
    html += '<select id="savings-client" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm" required>';
    html += '<option value="">Select client...</option>';
    for (var c = 0; c < clients.length; c++) {
      if (clients[c].status === 'Active') {
        html += '<option value="' + clients[c].id + '">' + escapeHtml(clients[c].fullName) + ' — ' + escapeHtml(clients[c].clientId) + '</option>';
      }
    }
    html += '</select></div>';

    // Product selection
    html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Savings Product *</label>';
    html += '<select id="savings-product" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm" required>';
    html += '<option value="">Select product...</option>';
    for (var sp = 0; sp < savingsProducts.length; sp++) {
      html += '<option value="' + savingsProducts[sp].id + '">' + escapeHtml(savingsProducts[sp].name) + ' (' + (savingsProducts[sp].interestRate || 0) + '%)</option>';
    }
    html += '</select></div>';
    html += '</div>';

    // Branch
    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Branch *</label>';
    html += '<select id="savings-branch" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm" required>';
    html += '<option value="">Select branch...</option>';
    for (var br = 0; br < branches.length; br++) {
      html += '<option value="' + branches[br].id + '">' + escapeHtml(branches[br].branchName) + '</option>';
    }
    html += '</select></div>';

    // Initial deposit
    html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Initial Deposit (MWK) *</label>';
    html += '<input type="number" id="savings-amount" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" min="1000" required placeholder="Minimum MWK 1,000"></div>';
    html += '</div>';

    // Submit
    html += '<div class="flex gap-3">';
    html += '<button type="submit" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">Open Account</button>';
    html += '<button type="button" id="btn-cancel-savings" class="bg-white border border-[#d1d5db] text-[#0f766e] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Cancel</button>';
    html += '</div></form></div>';

    container.innerHTML = html;

    document.getElementById('btn-back-savings').addEventListener('click', function() { renderSavings(container, options); });
    document.getElementById('btn-cancel-savings').addEventListener('click', function() { renderSavings(container, options); });

    document.getElementById('savings-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var clientId = this['savings-client'].value;
      var productId = this['savings-product'].value;
      var branchId = this['savings-branch'].value;
      var amount = parseFloat(this['savings-amount'].value);

      if (!clientId || !productId || !branchId || !amount) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      var clients = getCollection(StorageKeys.CLIENTS);
      var client = clients.find(function(c) { return c.id === clientId; });
      var products = getCollection(StorageKeys.SAVINGS_PRODUCTS);
      var product = products.find(function(p) { return p.id === productId; });

      // Generate account number
      var accounts = getCollection(StorageKeys.SAVINGS_ACCOUNTS);
      var accNum = 'SAV-' + (accounts.length + 1).toString().padStart(6, '0');
      var today = todayISO();

      var newAccount = {
        id: generateId(),
        accountNumber: accNum,
        accountHolder: client ? client.fullName : 'Unknown',
        clientId: clientId,
        productId: productId,
        productCode: product ? product.code : '',
        productName: product ? product.name : '',
        branchId: branchId,
        balance: amount,
        interestRate: product ? product.interestRate : 0,
        openedDate: today,
        lastTransactionDate: today,
        status: 'Active',
        openedBy: session ? session.name : 'System'
      };

      accounts.push(newAccount);
      setCollection(StorageKeys.SAVINGS_ACCOUNTS, accounts);

      // Record opening transaction
      var transactions = getCollection(StorageKeys.SAVINGS_TRANSACTIONS) || [];
      transactions.push({
        id: generateId(),
        accountId: newAccount.id,
        accountNumber: accNum,
        accountHolder: newAccount.accountHolder,
        type: 'opening',
        amount: amount,
        balanceAfter: amount,
        date: today,
        performedBy: session ? session.name : 'System'
      });
      setCollection(StorageKeys.SAVINGS_TRANSACTIONS, transactions);

      // Update cash balance
      var cashBalance = getValue(StorageKeys.CASH_BALANCE) || 0;
      setValue(StorageKeys.CASH_BALANCE, cashBalance + amount);

      logAudit('open_savings_account', { module: 'savings', entityId: newAccount.id, changedTo: accNum + ' for ' + (client ? client.fullName : 'Unknown') });
      showToast('Savings account ' + accNum + ' opened successfully with ' + formatCurrency(amount), 'success');
      renderSavings(container, options);
    });
  }

  render();
}

window.renderSavings = renderSavings;