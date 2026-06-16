// ============================================================================
// Saile Platform v2 — Screen 11: Audit Trail
// ============================================================================

/**
 * Render the Audit Trail module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderAudit(container, options) {
  var PAGE_SIZE = 15;
  var currentPage = 0;
  var filterUser = '';
  var filterRole = '';
  var filterAction = '';
  var filterDateFrom = '';
  var filterDateTo = '';

  function render() {
    var auditLog = getCollection(StorageKeys.AUDIT_LOG);

    // Apply filters
    var filtered = auditLog.filter(function(entry) {
      if (filterUser && entry.user.toLowerCase().indexOf(filterUser.toLowerCase()) === -1) return false;
      if (filterRole && entry.role !== filterRole) return false;
      if (filterAction && entry.action.toLowerCase().indexOf(filterAction.toLowerCase()) === -1) return false;
      if (filterDateFrom && entry.timestamp < filterDateFrom) return false;
      if (filterDateTo && entry.timestamp > filterDateTo + 'T23:59:59') return false;
      return true;
    });

    // Sort by timestamp descending (newest first)
    filtered.sort(function(a, b) { return b.timestamp.localeCompare(a.timestamp); });

    var totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    var pageItems = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    var html = '<div class="space-y-6">';
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Audit Trail</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + filtered.length + ' entries' + (filtered.length !== auditLog.length ? ' (filtered from ' + auditLog.length + ')' : '') + '</p>';
    html += '</div>';
    html += '<button id="btn-export-audit" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm font-medium">Export CSV</button>';
    html += '</div>';

    // Filters
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
    html += '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">';
    html += '<input type="text" id="audit-filter-user" class="px-3 py-2 border border-[#d1d5db] rounded-xl text-sm" placeholder="Filter by user..." value="' + escapeHtml(filterUser) + '">';
    html += '<select id="audit-filter-role" class="px-3 py-2 border border-[#d1d5db] rounded-xl text-sm">';
    html += '<option value="">All Roles</option>';
    html += '<option value="admin"' + (filterRole === 'admin' ? ' selected' : '') + '>Admin</option>';
    html += '<option value="field_officer"' + (filterRole === 'field_officer' ? ' selected' : '') + '>Field Officer</option>';
    html += '<option value="accountant"' + (filterRole === 'accountant' ? ' selected' : '') + '>Accountant</option>';
    html += '<option value="auditor"' + (filterRole === 'auditor' ? ' selected' : '') + '>Auditor</option>';
    html += '<option value="system"' + (filterRole === 'system' ? ' selected' : '') + '>System</option>';
    html += '</select>';
    html += '<input type="text" id="audit-filter-action" class="px-3 py-2 border border-[#d1d5db] rounded-xl text-sm" placeholder="Filter by action..." value="' + escapeHtml(filterAction) + '">';
    html += '<input type="date" id="audit-filter-from" class="px-3 py-2 border border-[#d1d5db] rounded-xl text-sm" value="' + filterDateFrom + '">';
    html += '<input type="date" id="audit-filter-to" class="px-3 py-2 border border-[#d1d5db] rounded-xl text-sm" value="' + filterDateTo + '">';
    html += '</div></div>';

    // Audit table
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    if (pageItems.length === 0) {
      html += '<div class="p-8 text-center text-[#6b7280]"><p class="text-sm">No audit entries found.</p></div>';
    } else {
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f4f4f5] border-b border-[#d1d5db]"><tr>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Timestamp</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">User</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Role</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Action</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280] hidden md:table-cell">Module</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280] hidden lg:table-cell">Details</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < pageItems.length; i++) {
        var entry = pageItems[i];
        html += '<tr class="border-b border-[#d1d5db] hover:bg-[#f4f4f5]">';
        html += '<td class="px-4 py-3 text-[#6b7280] whitespace-nowrap">' + formatDateTime(entry.timestamp) + '</td>';
        html += '<td class="px-4 py-3 font-medium text-[#0f766e]">' + escapeHtml(entry.user) + '</td>';
        html += '<td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f0f9ff] text-[#0369a1]">' + escapeHtml(entry.role) + '</span></td>';
        html += '<td class="px-4 py-3">' + escapeHtml(entry.action) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280] hidden md:table-cell">' + escapeHtml(entry.module || '-') + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280] hidden lg:table-cell text-xs max-w-[200px] truncate">';
        if (entry.changedTo) {
          html += escapeHtml(typeof entry.changedTo === 'object' ? JSON.stringify(entry.changedTo) : String(entry.changedTo));
        } else {
          html += '-';
        }
        html += '</td></tr>';
      }
      html += '</tbody></table></div>';
    }

    // Pagination
    if (totalPages > 1) {
      html += '<div class="flex items-center justify-between px-4 py-3 border-t border-[#d1d5db]">';
      html += '<p class="text-xs text-[#6b7280]">Page ' + (currentPage + 1) + ' of ' + totalPages + '</p>';
      html += '<div class="flex gap-2">';
      html += '<button class="audit-page-btn px-3 py-1 rounded border border-[#d1d5db] text-sm ' + (currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f4f4f5]') + '" data-page="prev"' + (currentPage === 0 ? ' disabled' : '') + '>Previous</button>';
      html += '<button class="audit-page-btn px-3 py-1 rounded border border-[#d1d5db] text-sm ' + (currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f4f4f5]') + '" data-page="next"' + (currentPage >= totalPages - 1 ? ' disabled' : '') + '>Next</button>';
      html += '</div></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
    attachAuditEvents();
  }

  function attachAuditEvents() {
    var userFilter = document.getElementById('audit-filter-user');
    var roleFilter = document.getElementById('audit-filter-role');
    var actionFilter = document.getElementById('audit-filter-action');
    var fromFilter = document.getElementById('audit-filter-from');
    var toFilter = document.getElementById('audit-filter-to');

    if (userFilter) userFilter.addEventListener('input', debounce(function() { filterUser = this.value; currentPage = 0; render(); }, 300));
    if (roleFilter) roleFilter.addEventListener('change', function() { filterRole = this.value; currentPage = 0; render(); });
    if (actionFilter) actionFilter.addEventListener('input', debounce(function() { filterAction = this.value; currentPage = 0; render(); }, 300));
    if (fromFilter) fromFilter.addEventListener('change', function() { filterDateFrom = this.value; currentPage = 0; render(); });
    if (toFilter) toFilter.addEventListener('change', function() { filterDateTo = this.value; currentPage = 0; render(); });

    container.querySelectorAll('.audit-page-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var dir = this.getAttribute('data-page');
        if (dir === 'prev' && currentPage > 0) currentPage--;
        else if (dir === 'next') currentPage++;
        render();
      });
    });

    var exportBtn = document.getElementById('btn-export-audit');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        exportAuditCSV();
      });
    }
  }

  function exportAuditCSV() {
    var auditLog = getCollection(StorageKeys.AUDIT_LOG);
    var csv = 'Timestamp,User,Role,Action,Module,Entity ID,Changed To\n';
    for (var i = 0; i < auditLog.length; i++) {
      var e = auditLog[i];
      csv += '"' + e.timestamp + '","' + (e.user || '') + '","' + (e.role || '') + '","' + (e.action || '') + '","' + (e.module || '') + '","' + (e.entityId || '') + '","' + (e.changedTo ? String(e.changedTo).replace(/"/g, '""') : '') + '"\n';
    }
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'audit_log_' + todayISO() + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Audit log exported', 'success');
  }

  render();
}

window.renderAudit = renderAudit;
