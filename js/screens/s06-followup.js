// ============================================================================
// Saile Platform v2 — Screen 06: Follow-up & Tracking
// ============================================================================

/**
 * Render the Follow-up module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderFollowup(container, options) {
  var readOnly = options && options.readOnly;
  var followups = getCollection(StorageKeys.FOLLOWUPS);
  var viewMode = 'list'; // list or history

  function render() {
    // Sort by DPD descending
    var sorted = followups.slice().sort(function(a, b) { return (b.daysPastDue || 0) - (a.daysPastDue || 0); });

    var html = '<div class="space-y-6">';
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e">Saile Follow-up & Tracking</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + followups.length + ' overdue accounts</p>';
    html += '</div>';
    if (!readOnly) {
      html += '<button id="btn-new-followup" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">+ New Follow-up</button>';
    }
    html += '</div>';

    // View toggle
    html += '<div class="flex gap-2">';
    html += '<button class="followup-view-tab px-4 py-2 rounded-xl text-sm font-medium ' + (viewMode === 'list' ? 'bg-[#111827] text-white' : 'bg-white text-[#0f766e] border border-[#d1d5db]') + '" data-view="list">Overdue List</button>';
    html += '<button class="followup-view-tab px-4 py-2 rounded-xl text-sm font-medium ' + (viewMode === 'history' ? 'bg-[#111827] text-white' : 'bg-white text-[#0f766e] border border-[#d1d5db]') + '" data-view="history">History</button>';
    html += '</div>';

    if (viewMode === 'list') {
      // Overdue list sorted by DPD
      html += '<div class="space-y-3">';
      if (sorted.length === 0) {
        html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-8 text-center">';
        html += '<p class="text-sm text-[#6b7280]">No overdue accounts.</p></div>';
      }
      for (var i = 0; i < sorted.length; i++) {
        var f = sorted[i];
        var dpdClass = f.daysPastDue > 90 ? 'bg-red-50 text-red-700' :
                       f.daysPastDue > 30 ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700';
        var outcomeClass = f.contactOutcome === 'promised_to_pay' ? 'text-emerald-600' :
                           f.contactOutcome === 'client_relocated' ? 'text-red-600' : 'text-amber-600';

        html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
        html += '<div class="flex items-start justify-between">';
        html += '<div class="flex-1">';
        html += '<h4 class="text-sm font-medium text-[#0f766e]">' + escapeHtml(f.clientName) + '</h4>';
        html += '<p class="text-xs text-[#6b7280] mt-0.5">Scheduled: ' + formatDate(f.scheduledDate) + '</p>';
        if (f.contactOutcome) {
          html += '<p class="text-xs mt-1 ' + outcomeClass + '">' + escapeHtml(f.contactOutcome.replace(/_/g, ' ')) + '</p>';
        }
        html += '</div>';
        html += '<div class="text-right">';
        html += '<span class="px-2 py-1 rounded-full text-xs font-medium ' + dpdClass + '">' + f.daysPastDue + ' DPD</span>';
        html += '<p class="text-xs text-red-600 mt-1">' + formatCurrency(f.accumulatedPenalty || 0) + '</p>';
        html += '</div></div>';

        // Action buttons
        html += '<div class="mt-3 pt-3 border-t border-[#d1d5db] flex gap-2">';
        html += '<button class="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 btn-call-client" data-phone="' + escapeHtml(f.clientName) + '">📞 Call</button>';
        html += '<button class="flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-medium hover:bg-sky-100 btn-sms-client">💬 SMS</button>';
        if (!readOnly) {
          html += '<button class="flex items-center gap-1 px-3 py-1.5 bg-[#f4f4f5] text-[#0f766e] rounded-lg text-xs font-medium hover:bg-gray-200 btn-update-followup" data-id="' + f.id + '">✏️ Update</button>';
        }
        html += '</div></div>';
      }
      html += '</div>';
    } else {
      // History view
      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f4f4f5] border-b border-[#d1d5db]"><tr>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Client</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">DPD</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Action</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Outcome</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Date</th>';
      html += '</tr></thead><tbody>';
      for (var h = 0; h < sorted.length; h++) {
        var fh = sorted[h];
        html += '<tr class="border-b border-[#d1d5db]">';
        html += '<td class="px-4 py-3 font-medium text-[#0f766e]">' + escapeHtml(fh.clientName) + '</td>';
        html += '<td class="px-4 py-3">' + fh.daysPastDue + '</td>';
        html += '<td class="px-4 py-3">' + escapeHtml((fh.actionSelected || '').replace(/_/g, ' ')) + '</td>';
        html += '<td class="px-4 py-3">' + escapeHtml((fh.contactOutcome || '').replace(/_/g, ' ')) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280]">' + formatDate(fh.createdAt) + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
    attachFollowupEvents();
  }

  function attachFollowupEvents() {
    container.querySelectorAll('.followup-view-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        viewMode = this.getAttribute('data-view');
        render();
      });
    });

    var newBtn = document.getElementById('btn-new-followup');
    if (newBtn) {
      newBtn.addEventListener('click', function() { renderFollowupForm(container, null, options); });
    }

    container.querySelectorAll('.btn-call-client').forEach(function(btn) {
      btn.addEventListener('click', function() { showToast('Call initiated (simulated)', 'info'); });
    });
    container.querySelectorAll('.btn-sms-client').forEach(function(btn) {
      btn.addEventListener('click', function() { showToast('SMS sent (simulated)', 'info'); });
    });
    container.querySelectorAll('.btn-update-followup').forEach(function(btn) {
      btn.addEventListener('click', function() {
        renderFollowupForm(container, this.getAttribute('data-id'), options);
      });
    });
  }

  render();
}

/**
 * Render follow-up form.
 */
function renderFollowupForm(container, followupId, options) {
  var loans = getCollection(StorageKeys.LOANS).filter(function(l) { return l.status === 'Disbursed'; });
  var existing = null;
  if (followupId) {
    var all = getCollection(StorageKeys.FOLLOWUPS);
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === followupId) { existing = all[i]; break; }
    }
  }

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-followup" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">' + (existing ? 'Update Follow-up' : 'New Follow-up') + '</h1>';
  html += '</div>';

  html += '<form id="followup-form" class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-4">';

  if (!existing) {
    html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Loan *</label>';
    html += '<select name="loanId" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm" required>';
    html += '<option value="">Select loan...</option>';
    for (var j = 0; j < loans.length; j++) {
      html += '<option value="' + loans[j].id + '" data-client="' + escapeHtml(loans[j].clientName) + '" data-clientid="' + loans[j].clientId + '">' + escapeHtml(loans[j].clientName) + '</option>';
    }
    html += '</select></div>';
  } else {
    html += '<div class="text-sm"><span class="text-[#6b7280]">Client:</span> <span class="font-medium">' + escapeHtml(existing.clientName) + '</span></div>';
  }

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Days Past Due</label>';
  html += '<input type="number" name="daysPastDue" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + (existing ? existing.daysPastDue : '') + '" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Scheduled Date</label>';
  html += '<input type="date" name="scheduledDate" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + (existing ? existing.scheduledDate : todayISO()) + '"></div>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Action</label>';
  html += '<select name="actionSelected" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
  var actions = ['phone_call','office_visit','home_visit'];
  for (var a = 0; a < actions.length; a++) {
    var sel = (existing && existing.actionSelected === actions[a]) ? ' selected' : '';
    html += '<option value="' + actions[a] + '"' + sel + '>' + actions[a].replace(/_/g, ' ') + '</option>';
  }
  html += '</select></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Contact Outcome</label>';
  html += '<select name="contactOutcome" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
  var outcomes = ['promised_to_pay','client_relocated','no_answer'];
  for (var o = 0; o < outcomes.length; o++) {
    var osel = (existing && existing.contactOutcome === outcomes[o]) ? ' selected' : '';
    html += '<option value="' + outcomes[o] + '"' + osel + '>' + outcomes[o].replace(/_/g, ' ') + '</option>';
  }
  html += '</select></div>';
  html += '</div>';

  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Notes</label>';
  html += '<textarea name="notes" rows="3" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm">' + escapeHtml(existing ? existing.notes || '' : '') + '</textarea></div>';

  html += '<div class="flex gap-3">';
  html += '<button type="submit" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">' + (existing ? 'Update' : 'Create Follow-up') + '</button>';
  html += '<button type="button" id="btn-cancel-followup" class="bg-white border border-[#d1d5db] text-[#0f766e] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Cancel</button>';
  html += '</div></form></div>';

  container.innerHTML = html;

  document.getElementById('btn-back-followup').addEventListener('click', function() { renderFollowup(container, options); });
  document.getElementById('btn-cancel-followup').addEventListener('click', function() { renderFollowup(container, options); });

  document.getElementById('followup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var session = getSession();

    if (existing) {
      updateItem(StorageKeys.FOLLOWUPS, existing.id, {
        daysPastDue: Number(form.daysPastDue.value),
        scheduledDate: form.scheduledDate.value,
        actionSelected: form.actionSelected.value,
        contactOutcome: form.contactOutcome.value,
        notes: form.notes.value.trim()
      });
      logAudit('update_followup', { module: 'followup', entityId: existing.id });
      showToast('Follow-up updated', 'success');
    } else {
      var loanSelect = form.loanId;
      var selectedOption = loanSelect.options[loanSelect.selectedIndex];
      var data = {
        clientId: selectedOption.getAttribute('data-clientid') || '',
        clientName: selectedOption.getAttribute('data-client') || '',
        loanId: form.loanId.value,
        daysPastDue: Number(form.daysPastDue.value),
        accumulatedPenalty: 0,
        contactOutcome: form.contactOutcome.value,
        scheduledDate: form.scheduledDate.value,
        actionSelected: form.actionSelected.value,
        notes: form.notes.value.trim(),
        createdBy: session ? session.name : 'Unknown'
      };
      addItem(StorageKeys.FOLLOWUPS, data);
      logAudit('create_followup', { module: 'followup', changedTo: data.clientName });
      showToast('Follow-up created', 'success');
    }
    renderFollowup(container, options);
  });
}

window.renderFollowup = renderFollowup;
