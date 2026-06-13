// ============================================================================
// Saile Platform v2 — Screen 02: Group Management
// ============================================================================

/**
 * Render the Groups module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderGroups(container, options) {
  var readOnly = options && options.readOnly;
  var groups = getCollection(StorageKeys.GROUPS);
  var clients = getCollection(StorageKeys.CLIENTS);

  function render() {
    var html = '<div class="space-y-6">';
    // Header
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Group Management</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + groups.length + ' groups registered</p>';
    html += '</div>';
    if (!readOnly) {
      html += '<button id="btn-add-group" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-[#047857] font-medium text-sm">+ New Group</button>';
    }
    html += '</div>';

    // Group cards
    html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
    if (groups.length === 0) {
      html += '<div class="col-span-full bg-white rounded-2xl border border-[#d1d5db] p-8 text-center">';
      html += '<p class="text-sm text-[#6b7280]">No groups created yet.</p></div>';
    }
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      var memberCount = (g.memberIds && g.memberIds.length) || 0;
      html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
      html += '<div class="flex items-start justify-between mb-3">';
      html += '<div>';
      html += '<h3 class="text-sm font-semibold text-[#0f766e]">' + escapeHtml(g.groupName) + '</h3>';
      html += '<p class="text-xs text-[#6b7280]">' + escapeHtml(g.id) + '</p>';
      html += '</div>';
      html += '<span class="px-2 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">' + memberCount + ' members</span>';
      html += '</div>';
      html += '<p class="text-xs text-[#6b7280] mb-3">Center: ' + escapeHtml(g.branchCenter || 'N/A') + '</p>';
      html += '<div class="flex items-center gap-2">';
      if (g.liabilityAgreement) {
        html += '<span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Liability Agreement</span>';
      }
      html += '</div>';
      html += '<div class="mt-4 pt-3 border-t border-[#d1d5db] flex gap-2">';
      html += '<button class="text-[#0f766e] text-xs font-medium hover:underline btn-view-group" data-id="' + g.id + '">View</button>';
      if (!readOnly) {
        html += '<button class="text-[#6b7280] text-xs font-medium hover:underline btn-edit-group" data-id="' + g.id + '">Edit</button>';
      }
      html += '</div></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
    attachGroupEvents();
  }

  function attachGroupEvents() {
    var addBtn = document.getElementById('btn-add-group');
    if (addBtn) {
      addBtn.addEventListener('click', function() { renderGroupForm(container, null, options); });
    }
    container.querySelectorAll('.btn-view-group').forEach(function(btn) {
      btn.addEventListener('click', function() {
        renderGroupDetail(container, this.getAttribute('data-id'), options);
      });
    });
    container.querySelectorAll('.btn-edit-group').forEach(function(btn) {
      btn.addEventListener('click', function() {
        renderGroupForm(container, this.getAttribute('data-id'), options);
      });
    });
  }

  render();
}

/**
 * Render group creation/edit form.
 */
function renderGroupForm(container, groupId, options) {
  var groups = getCollection(StorageKeys.GROUPS);
  var clients = getCollection(StorageKeys.CLIENTS);
  var group = null;
  if (groupId) {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].id === groupId) { group = groups[i]; break; }
    }
  }
  var isEdit = !!group;
  var selectedMembers = (group && group.memberIds) || [];

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-groups" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">' + (isEdit ? 'Edit Group' : 'Create New Group') + '</h1>';
  html += '</div>';

  html += '<form id="group-form" class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-6">';
  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Group Name *</label>';
  html += '<input type="text" name="groupName" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(group ? group.groupName : '') + '" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Branch Center</label>';
  html += '<input type="text" name="branchCenter" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" value="' + escapeHtml(group ? group.branchCenter : '') + '"></div>';
  html += '</div>';

  html += '<div><label class="flex items-center gap-2 cursor-pointer">';
  html += '<input type="checkbox" name="liabilityAgreement" class="w-4 h-4 rounded border-[#d1d5db] text-[#0f766e] focus:ring-[#0f766e]"' + (group && group.liabilityAgreement ? ' checked' : '') + '>';
  html += '<span class="text-sm text-[#0f766e]">Joint Liability Agreement signed</span></label></div>';

  // Member association
  html += '<div><h3 class="text-sm font-semibold text-[#0f766e] mb-3">Members</h3>';
  html += '<div class="border border-[#d1d5db] rounded-lg max-h-48 overflow-y-auto p-3 space-y-2">';
  var activeClients = clients.filter(function(c) { return c.status === 'Active'; });
  for (var j = 0; j < activeClients.length; j++) {
    var c = activeClients[j];
    var checked = selectedMembers.indexOf(c.id) !== -1 ? ' checked' : '';
    html += '<label class="flex items-center gap-2 cursor-pointer text-sm">';
    html += '<input type="checkbox" name="members" value="' + c.id + '" class="w-4 h-4 rounded border-[#d1d5db] text-[#0f766e] focus:ring-[#0f766e]"' + checked + '>';
    html += escapeHtml(c.fullName) + ' <span class="text-[#6b7280]">(' + escapeHtml(c.nationalId) + ')</span></label>';
  }
  if (activeClients.length === 0) {
    html += '<p class="text-xs text-[#6b7280]">No active clients available.</p>';
  }
  html += '</div></div>';

  html += '<div class="flex gap-3">';
  html += '<button type="submit" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 font-medium text-sm">' + (isEdit ? 'Update Group' : 'Create Group') + '</button>';
  html += '<button type="button" id="btn-cancel-group" class="bg-white border border-[#d1d5db] text-[#0f766e] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Cancel</button>';
  html += '</div></form></div>';

  container.innerHTML = html;

  document.getElementById('btn-back-groups').addEventListener('click', function() { renderGroups(container, options); });
  document.getElementById('btn-cancel-group').addEventListener('click', function() { renderGroups(container, options); });

  document.getElementById('group-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var memberCheckboxes = form.querySelectorAll('input[name="members"]:checked');
    var memberIds = [];
    memberCheckboxes.forEach(function(cb) { memberIds.push(cb.value); });

    var data = {
      groupName: form.groupName.value.trim(),
      branchCenter: form.branchCenter.value.trim(),
      liabilityAgreement: form.liabilityAgreement.checked,
      memberIds: memberIds
    };

    if (isEdit) {
      updateItem(StorageKeys.GROUPS, group.id, data);
      logAudit('update_group', { module: 'groups', entityId: group.id, changedTo: data.groupName });
      showToast('Group updated successfully', 'success');
    } else {
      data.id = generateGroupId();
      addItem(StorageKeys.GROUPS, data);
      logAudit('create_group', { module: 'groups', changedTo: data.groupName });
      showToast('Group created successfully', 'success');
    }
    renderGroups(container, options);
  });
}

/**
 * Render group detail view.
 */
function renderGroupDetail(container, groupId, options) {
  var groups = getCollection(StorageKeys.GROUPS);
  var clients = getCollection(StorageKeys.CLIENTS);
  var group = null;
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === groupId) { group = groups[i]; break; }
  }
  if (!group) { renderGroups(container, options); return; }

  var members = clients.filter(function(c) { return group.memberIds && group.memberIds.indexOf(c.id) !== -1; });

  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-groups" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile Group Details</h1>';
  html += '</div>';

  html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
  html += '<h2 class="text-xl font-semibold text-[#0f766e] mb-1">' + escapeHtml(group.groupName) + '</h2>';
  html += '<p class="text-sm text-[#6b7280] mb-4">' + escapeHtml(group.id) + ' &bull; Center: ' + escapeHtml(group.branchCenter || 'N/A') + '</p>';

  html += '<div class="mb-4">';
  if (group.liabilityAgreement) {
    html += '<span class="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Joint Liability Agreement</span>';
  }
  html += '</div>';

  html += '<h3 class="text-sm font-semibold text-[#0f766e] mb-3">Members (' + members.length + ')</h3>';
  if (members.length === 0) {
    html += '<p class="text-sm text-[#6b7280]">No members assigned.</p>';
  } else {
    html += '<div class="space-y-2">';
    for (var m = 0; m < members.length; m++) {
      html += '<div class="flex items-center gap-3 p-2 rounded-lg bg-[#f4f4f5]">';
      html += '<div class="w-8 h-8 rounded-full bg-[#0f766e]/10 flex items-center justify-center text-xs font-medium text-[#0f766e]">' + escapeHtml(members[m].fullName.charAt(0)) + '</div>';
      html += '<div><p class="text-sm font-medium text-[#0f766e]">' + escapeHtml(members[m].fullName) + '</p>';
      html += '<p class="text-xs text-[#6b7280]">' + escapeHtml(members[m].phoneNumber) + '</p></div></div>';
    }
    html += '</div>';
  }
  html += '</div></div>';

  container.innerHTML = html;
  document.getElementById('btn-back-groups').addEventListener('click', function() { renderGroups(container, options); });
}

window.renderGroups = renderGroups;
