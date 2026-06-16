// ============================================================================
// Saile Platform v2 — Screen 01: Client Management
// ============================================================================

/**
 * Render the Clients module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderClients(container, options) {
  var role = options && options.role;
  var readOnly = options && options.readOnly;
  var clients = getCollection(StorageKeys.CLIENTS);
  var searchQuery = '';
  var statusFilter = '';

  function render() {
    var filtered = filterClients(clients, searchQuery, statusFilter);

    var html = '<div class="space-y-6">';
    // Header
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Client Management</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + clients.length + ' total clients</p>';
    html += '</div>';
    if (!readOnly) {
      html += '<button id="btn-add-client" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 font-medium text-sm">+ New Client</button>';
    }
    html += '</div>';

    // Search and filter
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-4">';
    html += '<div class="flex flex-col sm:flex-row gap-3">';
    html += '<input type="text" id="client-search" class="flex-1 px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" placeholder="Search by name, ID, or phone..." value="' + escapeHtml(searchQuery) + '">';
    html += '<select id="client-status-filter" class="px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
    html += '<option value="">All Statuses</option>';
    html += '<option value="Active"' + (statusFilter === 'Active' ? ' selected' : '') + '>Active</option>';
    html += '<option value="Inactive"' + (statusFilter === 'Inactive' ? ' selected' : '') + '>Inactive</option>';
    html += '<option value="Blacklisted"' + (statusFilter === 'Blacklisted' ? ' selected' : '') + '>Blacklisted</option>';
    html += '</select>';
    html += '</div></div>';

    // Client list
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    if (filtered.length === 0) {
      html += '<div class="p-8 text-center text-[#6b7280]"><p class="text-sm">No clients found.</p></div>';
    } else {
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f4f4f5] border-b border-[#d1d5db]"><tr>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Name</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280] hidden sm:table-cell">National ID</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280] hidden md:table-cell">Phone</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Status</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Actions</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < filtered.length; i++) {
        var c = filtered[i];
        var statusClass = c.status === 'Active' ? 'bg-[#f0fdf4] text-[#0f766e]' :
                          c.status === 'Blacklisted' ? 'bg-[#fef2f2] text-[#111827]' : 'bg-[#fffbeb] text-[#92400e]';
        var blacklistAlert = c.status === 'Blacklisted' ? ' ⚠️' : '';

        html += '<tr class="border-b border-[#d1d5db] hover:bg-[#f4f4f5]">';
        html += '<td class="px-4 py-3 font-medium text-[#0f766e]">' + escapeHtml(c.fullName) + blacklistAlert + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280] hidden sm:table-cell">' + escapeHtml(c.nationalId) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280] hidden md:table-cell">' + escapeHtml(c.phoneNumber) + '</td>';
        html += '<td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium ' + statusClass + '">' + escapeHtml(c.status) + '</span></td>';
        html += '<td class="px-4 py-3">';
        html += '<button class="text-[#0f766e] text-xs font-medium hover:underline btn-view-client" data-id="' + c.id + '">View</button>';
        if (!readOnly) {
          html += ' <button class="text-[#6b7280] text-xs font-medium hover:underline ml-2 btn-edit-client" data-id="' + c.id + '">Edit</button>';
        }
        html += '</td></tr>';
      }
      html += '</tbody></table></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
    attachClientEvents();
  }

  function attachClientEvents() {
    var searchInput = document.getElementById('client-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function() {
        searchQuery = this.value.trim();
        render();
      }, 300));
    }

    var filterSelect = document.getElementById('client-status-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        statusFilter = this.value;
        render();
      });
    }

    var addBtn = document.getElementById('btn-add-client');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        renderClientForm(container, null, options);
      });
    }

    // View buttons
    var viewBtns = container.querySelectorAll('.btn-view-client');
    viewBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        renderClientDetail(container, id, options);
      });
    });

    // Edit buttons
    var editBtns = container.querySelectorAll('.btn-edit-client');
    editBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        renderClientForm(container, id, options);
      });
    });
  }

  render();
}

/**
 * Filter clients by search query and status.
 */
function filterClients(clients, query, status) {
  return clients.filter(function(c) {
    var matchesQuery = !query || 
      c.fullName.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      (c.nationalId && c.nationalId.toLowerCase().indexOf(query.toLowerCase()) !== -1) ||
      (c.phoneNumber && c.phoneNumber.indexOf(query) !== -1);
    var matchesStatus = !status || c.status === status;
    return matchesQuery && matchesStatus;
  });
}

/**
 * Render client KYC form (create/edit).
 */
function renderClientForm(container, clientId, options) {
  var client = null;
  if (clientId) {
    var clients = getCollection(StorageKeys.CLIENTS);
    for (var i = 0; i < clients.length; i++) {
      if (clients[i].id === clientId) { client = clients[i]; break; }
    }
  }

  var isEdit = !!client;
  var title = isEdit ? 'Edit Client' : 'New Client Registration';

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-clients" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">' + title + '</h1>';
  html += '</div>';

  html += '<form id="client-form" class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-6">';

  // Personal Information
  html += '<div><h3 class="text-sm font-semibold text-[#0f766e] mb-4 uppercase tracking-wide">Personal Information</h3>';
  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Full Name *</label>';
  html += '<input type="text" name="fullName" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(client ? client.fullName : '') + '" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">National ID *</label>';
  html += '<input type="text" name="nationalId" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(client ? client.nationalId : '') + '" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Phone Number *</label>';
  html += '<input type="tel" name="phoneNumber" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(client ? client.phoneNumber : '') + '" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Date of Birth</label>';
  html += '<input type="date" name="dateOfBirth" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(client ? client.dateOfBirth : '') + '"></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Residential Zone</label>';
  html += '<input type="text" name="residentialZone" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(client ? client.residentialZone : '') + '"></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Status</label>';
  html += '<select name="status" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
  var statuses = ['Active', 'Inactive', 'Blacklisted'];
  for (var s = 0; s < statuses.length; s++) {
    var sel = (client && client.status === statuses[s]) ? ' selected' : (!client && statuses[s] === 'Active' ? ' selected' : '');
    html += '<option value="' + statuses[s] + '"' + sel + '>' + statuses[s] + '</option>';
  }
  html += '</select></div>';
  html += '</div></div>';

  // Guarantor
  html += '<div><h3 class="text-sm font-semibold text-[#0f766e] mb-4 uppercase tracking-wide">Guarantor Information</h3>';
  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  var g = (client && client.guarantor) || {};
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Guarantor Name</label>';
  html += '<input type="text" name="guarantorName" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(g.name || '') + '"></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Relationship</label>';
  html += '<input type="text" name="guarantorRelationship" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(g.relationship || '') + '"></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Guarantor Phone</label>';
  html += '<input type="tel" name="guarantorPhone" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(g.phoneNumber || '') + '"></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Guarantor National ID</label>';
  html += '<input type="text" name="guarantorNationalId" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(g.nationalId || '') + '"></div>';
  html += '</div></div>';

  // Documents
  html += '<div><h3 class="text-sm font-semibold text-[#0f766e] mb-4 uppercase tracking-wide">Documents</h3>';
  html += '<div class="border-2 border-dashed border-[#d1d5db] rounded-lg p-6 text-center">';
  html += '<p class="text-sm text-[#6b7280]">Document upload simulated in prototype</p>';
  html += '<p class="text-xs text-[#6b7280] mt-1">National ID, Passport, Proof of Residence</p>';
  html += '</div></div>';

  // Notes
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Notes</label>';
  html += '<textarea name="notes" rows="3" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm">' + escapeHtml(client ? client.notes || '' : '') + '</textarea></div>';

  // Submit
  html += '<div class="flex gap-3">';
  html += '<button type="submit" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 font-medium text-sm">' + (isEdit ? 'Update Client' : 'Register Client') + '</button>';
  html += '<button type="button" id="btn-cancel-client" class="bg-white border border-[#d1d5db] text-[#0f766e] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Cancel</button>';
  html += '</div>';

  html += '</form></div>';

  container.innerHTML = html;

  // Events
  document.getElementById('btn-back-clients').addEventListener('click', function() { renderClients(container, options); });
  document.getElementById('btn-cancel-client').addEventListener('click', function() { renderClients(container, options); });

  document.getElementById('client-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var data = {
      fullName: form.fullName.value.trim(),
      nationalId: form.nationalId.value.trim(),
      phoneNumber: form.phoneNumber.value.trim(),
      dateOfBirth: form.dateOfBirth.value,
      residentialZone: form.residentialZone.value.trim(),
      status: form.status.value,
      guarantor: {
        name: form.guarantorName.value.trim(),
        relationship: form.guarantorRelationship.value.trim(),
        phoneNumber: form.guarantorPhone.value.trim(),
        nationalId: form.guarantorNationalId.value.trim()
      },
      notes: form.notes.value.trim(),
      documents: (client && client.documents) || []
    };

    if (isEdit) {
      updateItem(StorageKeys.CLIENTS, client.id, data);
      logAudit('update_client', { module: 'clients', entityId: client.id, changedTo: data.fullName });
      showToast('Client updated successfully', 'success');
    } else {
      data.groupId = null;
      addItem(StorageKeys.CLIENTS, data);
      logAudit('create_client', { module: 'clients', changedTo: data.fullName });
      showToast('Client registered successfully', 'success');
    }
    renderClients(container, options);
  });
}

/**
 * Render client detail view.
 */
function renderClientDetail(container, clientId, options) {
  var clients = getCollection(StorageKeys.CLIENTS);
  var client = null;
  for (var i = 0; i < clients.length; i++) {
    if (clients[i].id === clientId) { client = clients[i]; break; }
  }
  if (!client) { renderClients(container, options); return; }

  var statusClass = client.status === 'Active' ? 'bg-[#f0fdf4] text-[#0f766e]' :
                    client.status === 'Blacklisted' ? 'bg-[#fef2f2] text-[#111827]' : 'bg-[#fffbeb] text-[#92400e]';

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-clients" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Client Details</h1>';
  html += '</div>';

  // Blacklisted alert
  if (client.status === 'Blacklisted') {
    html += '<div class="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 flex items-center gap-3">';
    html += '<span class="text-[#dc2626] text-lg">⚠️</span>';
    html += '<div><p class="text-sm font-medium text-[#111827]">Blacklisted Client</p><p class="text-xs text-[#dc2626]">This client has been blacklisted and cannot receive new loans.</p></div>';
    html += '</div>';
  }

  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<div class="flex items-start justify-between mb-4">';
  html += '<div><h2 class="text-xl font-semibold text-[#0f766e]">' + escapeHtml(client.fullName) + '</h2>';
  html += '<p class="text-sm text-[#6b7280]">ID: ' + escapeHtml(client.nationalId) + '</p></div>';
  html += '<span class="px-3 py-1 rounded-full text-xs font-medium ' + statusClass + '">' + escapeHtml(client.status) + '</span>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">';
  html += '<div><span class="text-[#6b7280]">Phone:</span> <span class="text-[#0f766e] font-medium">' + escapeHtml(client.phoneNumber) + '</span></div>';
  html += '<div><span class="text-[#6b7280]">Date of Birth:</span> <span class="text-[#0f766e] font-medium">' + formatDate(client.dateOfBirth) + '</span></div>';
  html += '<div><span class="text-[#6b7280]">Zone:</span> <span class="text-[#0f766e] font-medium">' + escapeHtml(client.residentialZone) + '</span></div>';
  html += '<div><span class="text-[#6b7280]">Registered:</span> <span class="text-[#0f766e] font-medium">' + formatDate(client.createdAt) + '</span></div>';
  html += '</div>';

  // Guarantor
  if (client.guarantor && client.guarantor.name) {
    html += '<div class="mt-6 pt-4 border-t border-[#d1d5db]">';
    html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-3">Guarantor</h3>';
    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">';
    html += '<div><span class="text-[#6b7280]">Name:</span> ' + escapeHtml(client.guarantor.name) + '</div>';
    html += '<div><span class="text-[#6b7280]">Relationship:</span> ' + escapeHtml(client.guarantor.relationship) + '</div>';
    html += '<div><span class="text-[#6b7280]">Phone:</span> ' + escapeHtml(client.guarantor.phoneNumber) + '</div>';
    html += '</div></div>';
  }

  if (client.notes) {
    html += '<div class="mt-4 pt-4 border-t border-[#d1d5db]">';
    html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-2">Notes</h3>';
    html += '<p class="text-sm text-[#6b7280]">' + escapeHtml(client.notes) + '</p>';
    html += '</div>';
  }

  html += '</div></div>';
  container.innerHTML = html;

  document.getElementById('btn-back-clients').addEventListener('click', function() { renderClients(container, options); });
}

window.renderClients = renderClients;
