// ============================================================================
// Saile Platform v2 — Screen 04: Repayment Management
// ============================================================================

/**
 * Render the Repayment module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderRepayment(container, options) {
  var readOnly = options && options.readOnly;
  var loans = getCollection(StorageKeys.LOANS).filter(function(l) { return l.status === 'Disbursed'; });
  var selectedLoanId = '';

  function render() {
    var html = '<div class="space-y-6">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Repayment Management</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + loans.length + ' active loans</p>';
    html += '</div>';

    // Loan selector
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
    html += '<label class="block text-sm font-medium text-[#0f766e] mb-1.5">Select Loan</label>';
    html += '<select id="repayment-loan-select" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
    html += '<option value="">Choose a loan to view schedule...</option>';
    for (var i = 0; i < loans.length; i++) {
      var l = loans[i];
      var sel = selectedLoanId === l.id ? ' selected' : '';
      html += '<option value="' + l.id + '"' + sel + '>' + escapeHtml(l.clientName) + ' — ' + formatCurrency(l.requestedAmount) + ' (' + escapeHtml(l.productName) + ')</option>';
    }
    html += '</select></div>';

    // Schedule display
    if (selectedLoanId) {
      var loan = null;
      for (var j = 0; j < loans.length; j++) {
        if (loans[j].id === selectedLoanId) { loan = loans[j]; break; }
      }
      if (loan && loan.amortizationSchedule) {
        var schedule = loan.amortizationSchedule;
        var totalPaid = 0, totalDue = 0, totalOutstanding = 0;
        for (var k = 0; k < schedule.length; k++) {
          if (schedule[k].status === 'Paid') totalPaid += schedule[k].total;
          else totalOutstanding += schedule[k].total;
          totalDue += schedule[k].total;
        }

        // Balance summary
        html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
        html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
        html += '<p class="text-sm text-[#6b7280]">Total Loan</p>';
        html += '<p class="text-xl font-semibold text-[#0f766e]">' + formatCurrency(totalDue) + '</p></div>';
        html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
        html += '<p class="text-sm text-[#6b7280]">Paid</p>';
        html += '<p class="text-xl font-semibold text-[#0f766e]">' + formatCurrency(totalPaid) + '</p></div>';
        html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
        html += '<p class="text-sm text-[#6b7280]">Outstanding</p>';
        html += '<p class="text-xl font-semibold text-[#111827]">' + formatCurrency(totalOutstanding) + '</p></div>';
        html += '</div>';

        // Schedule table
        html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
        html += '<div class="p-4 border-b border-[#d1d5db] flex items-center justify-between">';
        html += '<h3 class="text-sm font-semibold text-[#0f766e]">Repayment Schedule</h3>';
        html += '</div>';
        html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
        html += '<thead class="bg-[#f4f4f5]"><tr>';
        html += '<th class="text-left px-4 py-2 text-[#6b7280] font-medium">#</th>';
        html += '<th class="text-left px-4 py-2 text-[#6b7280] font-medium">Due Date</th>';
        html += '<th class="text-right px-4 py-2 text-[#6b7280] font-medium">Principal</th>';
        html += '<th class="text-right px-4 py-2 text-[#6b7280] font-medium">Interest</th>';
        html += '<th class="text-right px-4 py-2 text-[#6b7280] font-medium">Total</th>';
        html += '<th class="text-left px-4 py-2 text-[#6b7280] font-medium">Status</th>';
        if (!readOnly) {
          html += '<th class="text-left px-4 py-2 text-[#6b7280] font-medium">Action</th>';
        }
        html += '</tr></thead><tbody>';

        for (var s = 0; s < schedule.length; s++) {
          var inst = schedule[s];
          var rowBg = inst.status === 'Paid' ? 'bg-[#f0fdf4]/50' :
                      inst.status === 'Overdue' ? 'bg-[#fef2f2]/50' : '';
          var statusBadge = inst.status === 'Paid' ? 'bg-[#f0fdf4] text-[#0f766e]' :
                            inst.status === 'Overdue' ? 'bg-[#fef2f2] text-[#111827]' : 'bg-[#fffbeb] text-[#92400e]';

          html += '<tr class="border-b border-[#d1d5db] ' + rowBg + '">';
          html += '<td class="px-4 py-2">' + inst.installmentNo + '</td>';
          html += '<td class="px-4 py-2">' + formatDate(inst.dueDate) + '</td>';
          html += '<td class="px-4 py-2 text-right">' + formatCurrency(inst.principal) + '</td>';
          html += '<td class="px-4 py-2 text-right">' + formatCurrency(inst.interest) + '</td>';
          html += '<td class="px-4 py-2 text-right font-medium">' + formatCurrency(inst.total) + '</td>';
          html += '<td class="px-4 py-2"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + statusBadge + '">' + inst.status + '</span></td>';
          if (!readOnly) {
            html += '<td class="px-4 py-2">';
            if (inst.status !== 'Paid') {
              html += '<button class="text-[#0f766e] text-xs font-medium hover:underline btn-record-payment" data-loan="' + loan.id + '" data-inst="' + inst.installmentNo + '">Record</button>';
            }
            html += '</td>';
          }
          html += '</tr>';
        }
        html += '</tbody></table></div></div>';
      }
    }

    html += '</div>';
    container.innerHTML = html;
    attachRepaymentEvents();
  }

  function attachRepaymentEvents() {
    var loanSelect = document.getElementById('repayment-loan-select');
    if (loanSelect) {
      loanSelect.addEventListener('change', function() {
        selectedLoanId = this.value;
        render();
      });
    }

    container.querySelectorAll('.btn-record-payment').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var loanId = this.getAttribute('data-loan');
        var instNo = parseInt(this.getAttribute('data-inst'));
        recordRepayment(loanId, instNo);
        loans = getCollection(StorageKeys.LOANS).filter(function(l) { return l.status === 'Disbursed'; });
        render();
      });
    });
  }

  function recordRepayment(loanId, installmentNo) {
    var allLoans = getCollection(StorageKeys.LOANS);
    for (var i = 0; i < allLoans.length; i++) {
      if (allLoans[i].id === loanId && allLoans[i].amortizationSchedule) {
        for (var j = 0; j < allLoans[i].amortizationSchedule.length; j++) {
          if (allLoans[i].amortizationSchedule[j].installmentNo === installmentNo) {
            allLoans[i].amortizationSchedule[j].status = 'paid';
            break;
          }
        }
        break;
      }
    }
    setCollection(StorageKeys.LOANS, allLoans);

    // Update cash balance
    var loan = allLoans.find(function(l) { return l.id === loanId; });
    if (loan) {
      var inst = loan.amortizationSchedule.find(function(s) { return s.installmentNo === installmentNo; });
      if (inst) {
        var balance = getValue(StorageKeys.CASH_BALANCE) || 0;
        setValue(StorageKeys.CASH_BALANCE, balance + inst.total);
      }
    }

    logAudit('record_payment', { module: 'repayment', entityId: loanId, changedTo: 'Installment #' + installmentNo + ' paid' });
    showToast('Payment recorded successfully', 'success');
  }

  render();
}

window.renderRepayment = renderRepayment;
