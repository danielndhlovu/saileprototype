// ============================================================================
// Saile Platform v2 — Screen 10: System Configuration
// ============================================================================

/**
 * Render the System Configuration module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderSettings(container, options) {
  var readOnly = options && options.readOnly;
  var viewMode = 'general'; // general, products, branches, penalties, documents, migration

  function render() {
    var html = '<div class="space-y-6">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#1E3A8A]">System Configuration</h1>';
    html += '<p class="text-sm text-[#6B7280]">Saile Financial Services — Platform settings and preferences</p>';
    html += '</div>';

    // Tabs
    html += '<div class="flex flex-wrap gap-2">';
    var tabs = [['general','General'],['products','Loan Products'],['branches','Branches'],['penalties','Penalty Rules'],['documents','Documents'],['migration','Data Migration'];
    for (var t = 0; t < tabs.length; t++) {
      var active = viewMode === tabs[t][0] ? 'bg-[#1E3A8A] text-white' : 'bg-white text-[#1E3A8A] border border-[#d1d5db] hover:bg-[#f4f4f5]';
      html += '<button class="settings-tab px-4 py-2 rounded-xl text-sm font-medium ' + active + '" data-view="' + tabs[t][0] + '">' + tabs[t][1] + '</button>';
    }
    html += '</div>';

    if (viewMode === 'general') html += renderGeneralSettings(readOnly);
    else if (viewMode === 'products') html += renderProductSettings(readOnly);
    else if (viewMode === 'branches') html += renderBranchSettings(readOnly);
    else if (viewMode === 'penalties') html += renderPenaltySettings(readOnly);
    else if (viewMode === 'documents') html += renderDocumentSettings(readOnly);
    else if (viewMode === 'migration') renderMigration(container, options);

    html += '</div>';
    container.innerHTML = html;
    attachSettingsEvents();
  }

  function renderGeneralSettings(readOnly) {
    var settings = getValue(StorageKeys.SETTINGS) || { language: 'en', currency: 'MWK', sessionTimeoutMinutes: 15, demoMode: true, institutionName: 'Saile Financial Services Limited', institutionLicense: 'NDMFI 017/22' };
    var session = getSession();

    var html = '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-6">';
    html += '<h3 class="text-sm font-semibold text-[#1E3A8A]">Institution Information</h3>';

    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Institution Name</label>';
    html += '<input type="text" id="setting-institution" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]" value="' + escapeHtml(settings.institutionName || '') + '"' + (readOnly ? ' disabled' : '') + '></div>';

    html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">RBM License Number</label>';
    html += '<input type="text" id="setting-license" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]" value="' + escapeHtml(settings.institutionLicense || '') + '"' + (readOnly ? ' disabled' : '') + '></div>';

    html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Language</label>';
    html += '<select id="setting-language" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"' + (readOnly ? ' disabled' : '') + '>';
    html += '<option value="en"' + (settings.language === 'en' ? ' selected' : '') + '>English</option>';
    html += '<option value="ny"' + (settings.language === 'ny' ? ' selected' : '') + '>Chichewa</option>';
    html += '</select></div>';

    html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Currency</label>';
    html += '<input type="text" id="setting-currency" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]" value="' + escapeHtml(settings.currency) + '"' + (readOnly ? ' disabled' : '') + '></div>';

    html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Session Timeout (minutes)</label>';
    html += '<input type="number" id="setting-timeout" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]" value="' + settings.sessionTimeoutMinutes + '"' + (readOnly ? ' disabled' : '') + '></div>';

    html += '<div><label class="flex items-center gap-2">';
    html += '<input type="checkbox" id="setting-rbm" class="w-4 h-4 rounded border-[#d1d5db] text-[#1E3A8A] focus:ring-[#1E3A8A]"' + (settings.rbmReportingEnabled !== false ? ' checked' : '') + (readOnly ? ' disabled' : '') + '>';
    html += '<span class="text-sm text-[#1E3A8A]">Enable RBM Reporting Module</span></label></div>';

    html += '<div><label class="flex items-center gap-2">';
    html += '<input type="checkbox" id="setting-sms" class="w-4 h-4 rounded border-[#d1d5db] text-[#1E3A8A] focus:ring-[#1E3A8A]"' + (settings.smsGatewayEnabled ? ' checked' : '') + (readOnly ? ' disabled' : '') + '>';
    html += '<span class="text-sm text-[#1E3A8A]">Enable SMS Gateway (Phase 3)</span></label></div>';
    html += '</div>';

    // Role Switcher
    html += '<div class="pt-4 border-t border-[#d1d5db]">';
    html += '<h4 class="text-sm font-medium text-[#1E3A8A] mb-3">Demo Role Switcher</h4>';
    html += '<div class="flex flex-wrap gap-2">';
    var roles = [
      { key: 'md', label: 'MD - Mr. Kafinyangwe' },
      { key: 'finance_manager', label: 'Finance - Mr. Kafinyangwe' },
      { key: 'admin', label: 'Admin - Mr. Nkhambule' },
      { key: 'auditor', label: 'Audit - Mrs. Kafinyangwe' },
      { key: 'branch_manager', label: 'Branch Manager' },
      { key: 'loan_officer', label: 'Loan Officer' },
      { key: 'accountant', label: 'Accountant' }
    ];
    for (var r = 0; r < roles.length; r++) {
      var isActive = session && session.role === roles[r].key;
      var btnClass = isActive ? 'bg-[#1F2937] text-white' : 'bg-white border border-[#d1d5db] text-[#1E3A8A] hover:bg-[#f4f4f5]';
      html += '<button class="role-switch-btn px-3 py-2 rounded-xl text-xs font-medium ' + btnClass + '" data-role="' + roles[r].key + '">' + roles[r].label + '</button>';
    }
    html += '</div></div>';

    if (!readOnly) {
      html += '<button id="btn-save-settings" class="bg-[#1F2937] text-white px-6 py-2.5 rounded-xl hover:bg-[#152C5B] font-medium text-sm mt-4">Save Settings</button>';
    }
    html += '</div>';
    return html;
  }

  function renderProductSettings(readOnly) {
    var products = getCollection(StorageKeys.PRODUCTS);
    var html = '';

    if (!readOnly) {
      html += '<div class="flex justify-end"><button id="btn-add-product" class="bg-[#1F2937] text-white px-4 py-2 rounded-xl hover:bg-[#152C5B] font-medium text-sm">+ New Product</button></div>';
    }

    html += '<div class="space-y-3">';
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
      html += '<div class="flex items-start justify-between">';
      html += '<div>';
      html += '<div class="flex items-center gap-2">';
      html += '<h4 class="text-sm font-semibold text-[#1E3A8A]">' + escapeHtml(p.productCode) + ' — ' + escapeHtml(p.productName) + '</h4>';
      if (p.isSignatureProduct) html += '<span class="text-xs bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded font-semibold">⭐ SIGNATURE</span>';
      html += '</div>';
      html += '<p class="text-xs text-[#6B7280] mt-1">' + escapeHtml(p.targetClientDescription || '') + '</p>';
      html += '</div>';
      var badgeColor = p.interestMethod === 'flat' ? 'bg-red-100 text-[#991B1B]' : 'bg-blue-100 text-blue-700';
      html += '<span class="px-2 py-1 rounded-full text-xs font-medium ' + badgeColor + '">' + (p.interestMethod === 'flat' ? 'Flat' : 'Reducing Bal.') + '</span>';
      html += '</div>';
      html += '<div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-[#6B7280]">';
      html += '<div>Range: ' + formatCurrency(p.minPrincipal) + '—' + formatCurrency(p.maxPrincipal) + '</div>';
      html += '<div>Rate: ' + formatPercentage(p.defaultInterestRate) + '/mo</div>';
      html += '<div>EIR: ' + (p.effectiveInterestRateAnnual || '—') + '% p.a.</div>';
      html += '<div>Fee: ' + formatCurrency(p.processingFee) + '</div>';
      html += '<div>Duration: ' + (p.durationMonths || '—') + ' months</div>';
      html += '<div>Processing: ' + (p.processingTimeMinutes || '—') + ' min</div>';
      html += '<div>Savings: ' + (p.compulsorySavingsPercentage || 0) + '%</div>';
      html += '<div>Category: ' + escapeHtml(p.rbmReportingCategory || '—') + '</div>';
      html += '</div></div>';
    }
    if (products.length === 0) {
      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-8 text-center"><p class="text-sm text-[#6B7280]">No products configured.</p></div>';
    }
    html += '</div>';
    return html;
  }

  function renderBranchSettings(readOnly) {
    var branches = getCollection(StorageKeys.BRANCHES);
    var html = '';

    if (!readOnly) {
      html += '<div class="flex justify-end"><button id="btn-add-branch" class="bg-[#1F2937] text-white px-4 py-2 rounded-xl hover:bg-[#152C5B] font-medium text-sm">+ New Branch</button></div>';
    }

    html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
    for (var i = 0; i < branches.length; i++) {
      var b = branches[i];
      var isMzuzu = b.branchCode === 'MZE' || b.branchCode === 'MZB';
      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4 ' + (isMzuzu ? 'border-[#1E3A8A] border-2' : '') + '">';
      html += '<div class="flex items-start justify-between">';
      html += '<div>';
      html += '<h4 class="text-sm font-semibold text-[#1E3A8A]">' + escapeHtml(b.branchName) + '</h4>';
      html += '<p class="text-xs text-[#6B7280] mt-1">' + escapeHtml(b.location) + ' | Code: ' + escapeHtml(b.branchCode || '') + '</p>';
      if (b.branchType) html += '<p class="text-xs text-[#6B7280]">' + escapeHtml(b.branchType) + '</p>';
      html += '</div>';
      if (b.managerName) {
        html += '<div class="text-right text-xs text-[#6B7280]">';
        html += '<div class="font-medium text-[#1E3A8A]">' + escapeHtml(b.managerName) + '</div>';
        html += 'Branch Manager</div>';
      }
      html += '</div>';
      html += '<div class="mt-3 flex items-center justify-between text-xs">';
      var bStatus = b.status === 'Active' ? 'bg-[#059669] text-white' : 'bg-red-100 text-[#991B1B]';
      html += '<span class="px-2 py-0.5 rounded-full font-medium ' + bStatus + '">' + escapeHtml(b.status) + '</span>';
      if (b.phone) html += '<span class="text-[#6B7280]">' + escapeHtml(b.phone) + '</span>';
      html += '</div>';
      if (b.openingDate) html += '<div class="text-xs text-[#9ca3af] mt-1">Opened: ' + escapeHtml(b.openingDate) + '</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderPenaltySettings(readOnly) {
    var products = getCollection(StorageKeys.PRODUCTS);
    var html = '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
    html += '<h3 class="text-sm font-semibold text-[#1E3A8A] mb-4">Penalty Rules (per Product)</h3>';
    html += '<table class="w-full text-sm"><thead class="bg-[#f9fafb]"><tr>';
    html += '<th class="text-left px-3 py-2 font-medium text-[#6B7280]">Product</th>';
    html += '<th class="text-right px-3 py-2 font-medium text-[#6B7280]">Rate</th>';
    html += '<th class="text-right px-3 py-2 font-medium text-[#6B7280]">Grace</th>';
    html += '</tr></thead><tbody>';
    products.forEach(function(p) {
      html += '<tr class="border-b border-[#d1d5db]"><td class="px-3 py-2 font-medium">' + escapeHtml(p.productCode) + ' — ' + escapeHtml(p.productName) + '</td>';
      html += '<td class="px-3 py-2 text-right text-[#1F2937] font-semibold">' + formatPercentage(p.latePenaltyRate) + '/day</td>';
      html += '<td class="px-3 py-2 text-right">' + (p.gracePeriodDays || 0) + ' days</td></tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function renderDocumentSettings(readOnly) {
    var products = getCollection(StorageKeys.PRODUCTS);
    var html = '<div class="space-y-4">';
    products.forEach(function(p) {
      var docs = p.documentChecklist ? JSON.parse(p.documentChecklist) : [];
      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
      html += '<h4 class="text-sm font-semibold text-[#1E3A8A]">' + escapeHtml(p.productCode) + ' — ' + escapeHtml(p.productName) + '</h4>';
      html += '<ul class="mt-2 space-y-1">';
      docs.forEach(function(d) {
        html += '<li class="text-sm text-[#6B7280] flex items-center gap-2">📄 ' + escapeHtml(d) + '</li>';
      });
      html += '</ul></div>';
    });
    html += '</div>';
    return html;
  }

  function attachSettingsEvents() {
    container.querySelectorAll('.settings-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        viewMode = this.getAttribute('data-view');
        render();
      });
    });

    var saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var s = getValue(StorageKeys.SETTINGS) || {};
        s.language = document.getElementById('setting-language').value;
        s.currency = document.getElementById('setting-currency').value;
        s.sessionTimeoutMinutes = Number(document.getElementById('setting-timeout').value);
        s.institutionName = document.getElementById('setting-institution').value;
        s.institutionLicense = document.getElementById('setting-license').value;
        s.rbmReportingEnabled = document.getElementById('setting-rbm').checked;
        s.smsGatewayEnabled = document.getElementById('setting-sms').checked;
        s.demoMode = true;
        setValue(StorageKeys.SETTINGS, s);
        logAudit('update_settings', { module: 'settings', changedTo: JSON.stringify(s) });
        showToast('Settings saved', 'success');
      });
    }

    container.querySelectorAll('.role-switch-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var newRole = this.getAttribute('data-role');
        switchRole(newRole);
        logAudit('role_switch', { module: 'settings', changedTo: newRole });
        window.location.hash = getDefaultRoute(newRole);
        location.reload();
      });
    });

    var addProductBtn = document.getElementById('btn-add-product');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', function() { renderProductForm(container, options); });
    }

    var addBranchBtn = document.getElementById('btn-add-branch');
    if (addBranchBtn) {
      addBranchBtn.addEventListener('click', function() { renderBranchForm(container, options); });
    }
  }

  render();
}

// Migration module rendering
function renderMigration(container, options) {
  var readOnly = options && options.readOnly;
  var html = '<div class="space-y-6">';

  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<div class="flex items-center gap-4 mb-6">';
  html += '<div class="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center text-2xl">📂</div>';
  html += '<div><h2 class="text-lg font-semibold text-[#1E3A8A]">Data Migration Module</h2>';
  html += '<p class="text-sm text-[#6B7280]">Import existing Saile data from Excel/CSV files</p></div>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">';
  html += migrationStepCard('1', 'Extract & Upload', 'Upload Excel/CSV files with client, loan, and repayment data', 'cloud-upload');
  html += migrationStepCard('2', 'Validate & Cleanse', 'Auto-detect duplicates, fix formatting, validate required fields', 'check-circle');
  html += migrationStepCard('3', 'Import & Verify', 'Batch import with rollback capability and reconciliation', 'database');
  html += '</div>';

  html += '<div class="border-2 border-dashed border-[#d1d5db] rounded-2xl p-8 text-center">';
  html += '<div class="text-[#1E3A8A]xl mb-3">📊</div>';
  html += '<p class="text-sm text-[#6B7280] mb-2">Demo: 50-record sample Excel file</p>';
  html += '<p class="text-xs text-[#9ca3af] mb-4">Includes common data quality issues for cleansing demonstration</p>';
  if (!readOnly) {
    html += '<button id="btn-run-migration" class="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl hover:bg-[#134e4a] font-medium text-sm">Run Migration Demo</button>';
  }
  html += '</div>';

  // Migration status
  html += '<div id="migration-status" class="hidden space-y-3">';
  html += '<h4 class="text-sm font-semibold text-[#1E3A8A]">Migration Progress</h4>';
  html += '<div class="bg-[#f9fafb] rounded-xl p-4">';
  html += '<div class="flex justify-between text-sm mb-2"><span class="text-[#6B7280]">Status:</span><span id="migration-state" class="font-medium">Running...</span></div>';
  html += '<div class="w-full bg-gray-200 rounded-full h-2"><div id="migration-bar" class="bg-[#1E3A8A] h-2 rounded-full transition-all duration-500" style="width:0%"></div></div>';
  html += '<p id="migration-detail" class="text-xs text-[#6B7280] mt-2"></p>';
  html += '</div>';
  html += '<div id="migration-results" class="hidden bg-white rounded-xl border border-[#d1d5db] p-4 text-sm"></div>';
  html += '</div></div>';

  html += '</div>';
  container.innerHTML = html;

  if (!readOnly) {
    document.getElementById('btn-run-migration').addEventListener('click', function() { runMigrationDemo(container); });
  }
}

function migrationStepCard(step, title, desc, icon) {
  return '<div class="bg-[#F5F6FA] rounded-xl p-4 text-center">' +
    '<div class="text-3xl mb-2">' + getMigrationIcon(icon) + '</div>' +
    '<div class="text-sm font-semibold text-[#1E3A8A] mb-1">Step ' + step + ': ' + title + '</div>' +
    '<div class="text-xs text-[#6B7280]">' + desc + '</div>' +
  '</div>';
}

function getMigrationIcon(icon) {
  var icons = { 'cloud-upload': '☁️📤', 'check-circle': '✅', 'database': '🗄️' };
  return icons[icon] || '📋';
}

function runMigrationDemo(container) {
  var statusDiv = document.getElementById('migration-status');
  statusDiv.classList.remove('hidden');

  var steps = [
    { state: 'Uploading sample file...', pct: 10, detail: 'Reading 50 records from Saile_Clients_Demo.xlsx' },
    { state: 'Validating data...', pct: 30, detail: 'Checking 50 records for duplicates and invalid formats' },
    { state: '3 duplicates detected', pct: 40, detail: 'Fuzzy matching on name + NRC + phone — flagging repeats' },
    { state: '2 invalid phone numbers fixed', pct: 55, detail: 'Standardizing to +265 format (MW prefix)' },
    { state: 'Cleansing data...', pct: 65, detail: 'Title case names, date normalization, NRC validation' },
    { state: 'Previewing cleansed data...', pct: 75, detail: 'Showing first 10 rows for review' },
    { state: 'Importing batch 1/3...', pct: 80, detail: 'Importing records 1-17 of 50' },
    { state: 'Importing batch 2/3...', pct: 87, detail: 'Importing records 18-34 of 50' },
    { state: 'Importing batch 3/3...', pct: 94, detail: 'Importing records 35-50 of 50' },
    { state: 'Verifying import...', pct: 98, detail: 'Reconciliation: 47 records imported, 3 duplicates flagged' },
    { state: 'Complete!', pct: 100, detail: '✅ Migration successful — 47 clients imported, 3 excluded' }
  ];

  var stepIdx = 0;
  var interval = setInterval(function() {
    if (stepIdx >= steps.length) {
      clearInterval(interval);
      var resultsDiv = document.getElementById('migration-results');
      resultsDiv.classList.remove('hidden');
      resultsDiv.innerHTML =
        '<div class="space-y-2"><p class="font-semibold text-[#1E3A8A]">Migration Summary</p>' +
        '<div class="grid grid-cols-2 gap-2 text-sm"><div>Records Processed: <strong>50</strong></div><div>Imported: <strong class="text-[#059669]">47</strong></div><div>Duplicates: <strong class="text-[#D97706]">3</strong></div><div>Errors: <strong class="text-[#1F2937]">0</strong></div></div>' +
        '<p class="text-xs text-[#6B7280] mt-2">Source: Saile_Clients_Demo.xlsx | Duration: < 5 seconds</p></div>';
      logAudit('data_migration', { module: 'migration', changedTo: '47 records imported from Excel demo' });
      showToast('Migration complete: 47 clients imported!', 'success');
      renderMigration(container, { role: options.role, readOnly: false });
      return;
    }
    var s = steps[stepIdx];
    document.getElementById('migration-state').textContent = s.state;
    document.getElementById('migration-bar').style.width = s.pct + '%';
    document.getElementById('migration-detail').textContent = s.detail;
    stepIdx++;
  }, 600);
}

window.renderSettings = renderSettings;