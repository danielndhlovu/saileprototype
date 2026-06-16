// ============================================================================
// Saile Platform v2 — Screen 05: Collections (Field Officer)
// ============================================================================

/**
 * Render the Collections module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderCollections(container, options) {
  var readOnly = options && options.readOnly;
  var collections = getCollection(StorageKeys.COLLECTIONS);
  var loans = getCollection(StorageKeys.LOANS).filter(function(l) { return l.status === 'Disbursed'; });
  var filterTab = 'all';

  function render() {
    // Calculate progress
    var totalDue = 0, totalCollected = 0;
    for (var i = 0; i < collections.length; i++) {
      totalDue += collections[i].dueAmount;
      totalCollected += collections[i].collectedAmount;
    }
    var progressPct = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    var filtered = collections;
    if (filterTab === 'synced') filtered = collections.filter(function(c) { return c.synced; });
    else if (filterTab === 'pending') filtered = collections.filter(function(c) { return !c.synced; });

    var html = '<div class="space-y-6">';
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#1E3A8A]">Saile Collections</h1>';
    html += '<p class="text-sm text-[#6B7280]">' + collections.length + ' records today</p>';
    html += '</div>';
    if (!readOnly) {
      html += '<button id="btn-new-collection" class="bg-[#1F2937] text-white px-6 py-2.5 rounded-xl hover:bg-[#152C5B] font-medium text-sm">+ Record Payment</button>';
    }
    html += '</div>';

    // Progress dial
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6 flex items-center gap-6">';
    html += '<div class="flex-shrink-0">';
    html += renderProgressDial(progressPct);
    html += '</div>';
    html += '<div>';
    html += '<h3 class="text-sm font-semibold text-[#1E3A8A] mb-1">Collection Progress</h3>';
    html += '<p class="text-2xl font-bold text-[#1E3A8A]">' + progressPct + '%</p>';
    html += '<p class="text-xs text-[#6B7280]">' + formatCurrency(totalCollected) + ' of ' + formatCurrency(totalDue) + ' collected</p>';
    html += '</div></div>';

    // Filter tabs
    html += '<div class="flex gap-2">';
    var tabs = [['all','All'],['pending','Pending Sync'],['synced','Synced'];
    for (var t = 0; t < tabs.length; t++) {
      var active = filterTab === tabs[t][0] ? 'bg-[#1F2937] text-white' : 'bg-white text-[#1E3A8A] border border-[#d1d5db] hover:bg-[#f4f4f5]';
      html += '<button class="collection-tab px-4 py-2 rounded-xl text-sm font-medium ' + active + '" data-tab="' + tabs[t][0] + '">' + tabs[t][1] + '</button>';
    }
    html += '</div>';

    // Collection cards
    html += '<div class="space-y-3">';
    if (filtered.length === 0) {
      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-8 text-center">';
      html += '<p class="text-sm text-[#6B7280]">No collections found.</p></div>';
    }
    for (var j = 0; j < filtered.length; j++) {
      var col = filtered[j];
      var syncBadge = col.synced ? 'bg-[#f0fdf4] text-[#1E3A8A]' : 'bg-[#fffbeb] text-[#92400e]';
      var syncText = col.synced ? 'Synced' : 'Pending';

      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
      html += '<div class="flex items-center justify-between">';
      html += '<div>';
      html += '<h4 class="text-sm font-medium text-[#1E3A8A]">' + escapeHtml(col.clientName) + '</h4>';
      html += '<p class="text-xs text-[#6B7280]">Ref: ' + escapeHtml(col.transactionRef) + '</p>';
      html += '</div>';
      html += '<div class="text-right">';
      html += '<p class="text-sm font-semibold text-[#1E3A8A]">' + formatCurrency(col.collectedAmount) + '</p>';
      html += '<span class="px-2 py-0.5 rounded-full text-xs font-medium ' + syncBadge + '">' + syncText + '</span>';
      html += '</div></div>';
      html += '<div class="mt-2 flex items-center gap-4 text-xs text-[#6B7280]">';
      html += '<span>' + escapeHtml(col.paymentMode) + '</span>';
      html += '<span>' + formatDateTime(col.collectedAt) + '</span>';
      if (col.penaltyApplied > 0) {
        html += '<span class="text-[#dc2626]">Penalty: ' + formatCurrency(col.penaltyApplied) + '</span>';
      }
      html += '</div></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
    attachCollectionEvents();
  }

  function attachCollectionEvents() {
    container.querySelectorAll('.collection-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        filterTab = this.getAttribute('data-tab');
        render();
      });
    });

    var newBtn = document.getElementById('btn-new-collection');
    if (newBtn) {
      newBtn.addEventListener('click', function() { renderCollectionForm(container, options); });
    }
  }

  render();
}

/**
 * Render SVG progress dial.
 */
function renderProgressDial(pct) {
  var radius = 40;
  var circumference = 2 * Math.PI * radius;
  var offset = circumference - (pct / 100) * circumference;

  return '<svg class="progress-ring" width="100" height="100">' +
    '<circle cx="50" cy="50" r="' + radius + '" stroke="#d1d5db" stroke-width="8" fill="none"/>' +
    '<circle class="progress-ring__circle" cx="50" cy="50" r="' + radius + '" stroke="#1E3A8A" stroke-width="8" fill="none" ' +
    'stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" stroke-linecap="round"/>' +
    '</svg>';
}

/**
 * Render collection payment form.
 */
function renderCollectionForm(container, options) {
  var loans = getCollection(StorageKeys.LOANS).filter(function(l) { return l.status === 'Disbursed'; });
  var clients = getCollection(StorageKeys.CLIENTS);

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-collections" class="bg-white border border-[#d1d5db] text-[#1E3A8A] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#1E3A8A]">Record Collection</h1>';
  html += '</div>';

  html += '<form id="collection-form" class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-4">';

  html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Loan *</label>';
  html += '<select name="loanId" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm" required>';
  html += '<option value="">Select loan...</option>';
  for (var i = 0; i < loans.length; i++) {
    html += '<option value="' + loans[i].id + '" data-client="' + escapeHtml(loans[i].clientName) + '" data-clientid="' + loans[i].clientId + '">' + escapeHtml(loans[i].clientName) + ' — ' + formatCurrency(loans[i].requestedAmount) + '</option>';
  }
  html += '</select></div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Due Amount (MWK)</label>';
  html += '<input type="number" name="dueAmount" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-sm" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Collected Amount (MWK) *</label>';
  html += '<input type="number" name="collectedAmount" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-sm" required></div>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Payment Mode</label>';
  html += '<select name="paymentMode" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
  html += '<option value="cash">Cash</option><option value="mobile_money">Mobile Money</option>';
  html += '</select></div>';
  html += '<div><label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Penalty Applied (MWK)</label>';
  html += '<input type="number" name="penalty" value="0" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-sm"></div>';
  html += '</div>';

  html += '<div class="flex gap-3">';
  html += '<button type="submit" class="bg-[#1F2937] text-white px-6 py-2.5 rounded-xl hover:bg-[#1F2937] font-medium text-sm">Record & Generate Receipt</button>';
  html += '<button type="button" id="btn-cancel-collection" class="bg-white border border-[#d1d5db] text-[#1E3A8A] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Cancel</button>';
  html += '</div></form></div>';

  container.innerHTML = html;

  document.getElementById('btn-back-collections').addEventListener('click', function() { renderCollections(container, options); });
  document.getElementById('btn-cancel-collection').addEventListener('click', function() { renderCollections(container, options); });

  document.getElementById('collection-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var loanSelect = form.loanId;
    var selectedOption = loanSelect.options[loanSelect.selectedIndex];
    var session = getSession();

    var data = {
      clientId: selectedOption.getAttribute('data-clientid') || '',
      clientName: selectedOption.getAttribute('data-client') || '',
      loanId: form.loanId.value,
      dueAmount: Number(form.dueAmount.value),
      collectedAmount: Number(form.collectedAmount.value),
      paymentMode: form.paymentMode.value,
      penaltyApplied: Number(form.penalty.value) || 0,
      transactionRef: generateTransactionRef(),
      collectedBy: session ? session.name : 'Unknown',
      collectedAt: new Date().toISOString(),
      synced: false
    };

    addItem(StorageKeys.COLLECTIONS, data);

    // Update cash balance
    var balance = getValue(StorageKeys.CASH_BALANCE) || 0;
    setValue(StorageKeys.CASH_BALANCE, balance + data.collectedAmount);

    logAudit('create_collection', { module: 'collections', entityId: data.transactionRef, changedTo: formatCurrency(data.collectedAmount) });
    showToast('Collection recorded! Ref: ' + data.transactionRef, 'success');

    // Show receipt modal
    showReceiptModal(data);
  });
}

/**
 * Show receipt modal after collection.
 */
function showReceiptModal(collection) {
  var modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/50';
  modal.innerHTML = '<div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">' +
    '<div class="text-center mb-4">' +
      '<div class="w-12 h-12 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-3">' +
        '<svg class="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' +
      '</div>' +
      '<h3 class="text-lg font-semibold text-[#1E3A8A]">Payment Receipt</h3>' +
    '</div>' +
    '<div class="space-y-2 text-sm border-t border-b border-[#d1d5db] py-3 my-3">' +
      '<div class="flex justify-between"><span class="text-[#6B7280]">Reference</span><span class="font-medium">' + escapeHtml(collection.transactionRef) + '</span></div>' +
      '<div class="flex justify-between"><span class="text-[#6B7280]">Client</span><span class="font-medium">' + escapeHtml(collection.clientName) + '</span></div>' +
      '<div class="flex justify-between"><span class="text-[#6B7280]">Amount</span><span class="font-medium">' + formatCurrency(collection.collectedAmount) + '</span></div>' +
      '<div class="flex justify-between"><span class="text-[#6B7280]">Mode</span><span class="font-medium">' + escapeHtml(collection.paymentMode) + '</span></div>' +
      '<div class="flex justify-between"><span class="text-[#6B7280]">Date</span><span class="font-medium">' + formatDateTime(collection.collectedAt) + '</span></div>' +
    '</div>' +
    '<div class="flex gap-2">' +
      '<button class="flex-1 bg-[#1F2937] text-white py-2 px-4 rounded-xl text-sm font-medium" id="receipt-close">Done</button>' +
      '<button class="flex-1 bg-white border border-[#d1d5db] text-[#1E3A8A] py-2 px-4 rounded-xl text-sm font-medium" id="receipt-share">Share</button>' +
    '</div>' +
  '</div>';

  document.body.appendChild(modal);

  modal.querySelector('#receipt-close').addEventListener('click', function() {
    document.body.removeChild(modal);
    var cont = document.getElementById('app-content');
    renderCollections(cont, { role: getSession().role, readOnly: false });
  });
  modal.querySelector('#receipt-share').addEventListener('click', function() {
    showToast('Share functionality simulated', 'info');
  });
}

window.renderCollections = renderCollections;
