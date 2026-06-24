// ============================================================================
// Saile Platform v2 — Screen 09: User Management
// ============================================================================

/**
 * Render the Users module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderUsers(container, options) {
  var readOnly = options && options.readOnly;
  var users = getCollection(StorageKeys.USERS);

  function render() {
    var html = '<div class="space-y-6">';
    html += '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#0f766e]">Saile User Management</h1>';
    html += '<p class="text-sm text-[#6b7280]">' + users.length + ' registered users</p>';
    html += '</div>';
    if (!readOnly) {
      html += '<button id="btn-add-user" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 font-medium text-sm">+ New User</button>';
    }
    html += '</div>';

    // User table
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    if (users.length === 0) {
      html += '<div class="p-8 text-center text-[#6b7280]"><p class="text-sm">No users found.</p></div>';
    } else {
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f4f4f5] border-b border-[#d1d5db]"><tr>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Name</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280] hidden sm:table-cell">Email</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Role</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Status</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280] hidden md:table-cell">Last Login</th>';
      html += '<th class="text-left px-4 py-3 font-medium text-[#6b7280]">Actions</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        var statusClass = u.status === 'Active' ? 'bg-[#f0fdf4] text-[#0f766e]' : 'bg-[#fef2f2] text-[#111827]';
        var roleLabel = u.role.replace('_', ' ');

        html += '<tr class="border-b border-[#d1d5db] hover:bg-[#f4f4f5]">';
        html += '<td class="px-4 py-3 font-medium text-[#0f766e]">' + escapeHtml(u.fullName) + '</td>';
        html += '<td class="px-4 py-3 text-[#6b7280] hidden sm:table-cell">' + escapeHtml(u.email) + '</td>';
        html += '<td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f0f9ff] text-[#0369a1] capitalize">' + escapeHtml(roleLabel) + '</span></td>';
        html += '<td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium ' + statusClass + '">' + escapeHtml(u.status) + '</span></td>';
        html += '<td class="px-4 py-3 text-[#6b7280] hidden md:table-cell">' + (u.lastLogin ? formatDateTime(u.lastLogin) : 'Never') + '</td>';
        html += '<td class="px-4 py-3 space-x-1">';
        if (!readOnly) {
          if (u.status === 'Active') {
            html += '<button class="text-[#dc2626] text-xs font-medium hover:underline btn-suspend-user" data-id="' + u.id + '">Suspend</button>';
          } else {
            html += '<button class="text-[#059669] text-xs font-medium hover:underline btn-activate-user" data-id="' + u.id + '">Activate</button>';
          }
          html += '<button class="text-[#6b7280] text-xs font-medium hover:underline ml-2 btn-reset-pw" data-id="' + u.id + '">Reset PW</button>';
        }
        html += '</td></tr>';
      }
      html += '</tbody></table></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
    attachUserEvents();
  }

  function attachUserEvents() {
    var addBtn = document.getElementById('btn-add-user');
    if (addBtn) {
      addBtn.addEventListener('click', function() { renderUserForm(container, options); });
    }

    container.querySelectorAll('.btn-suspend-user').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        updateItem(StorageKeys.USERS, id, { status: 'Suspended' });
        logAudit('suspend_user', { module: 'users', entityId: id });
        showToast('User suspended', 'warning');
        users = getCollection(StorageKeys.USERS);
        render();
      });
    });

    container.querySelectorAll('.btn-activate-user').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        updateItem(StorageKeys.USERS, id, { status: 'Active' });
        logAudit('activate_user', { module: 'users', entityId: id });
        showToast('User activated', 'success');
        users = getCollection(StorageKeys.USERS);
        render();
      });
    });

    container.querySelectorAll('.btn-reset-pw').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        updateItem(StorageKeys.USERS, id, { passwordHash: hashPassword('password123') });
        logAudit('reset_password', { module: 'users', entityId: id });
        showToast('Password reset to default', 'info');
      });
    });
  }

  render();
}

/**
 * Render user creation form.
 */
function renderUserForm(container, options) {
  var html = '<div class="space-y-6">';
  html += '<div class="flex items-center gap-4">';
  html += '<button id="btn-back-users" class="bg-white border border-[#d1d5db] text-[#0f766e] px-4 py-2 rounded-xl hover:bg-[#f4f4f5] text-sm">&larr; Back</button>';
  html += '<h1 class="text-lg font-semibold text-[#0f766e]">Create New User</h1>';
  html += '</div>';

  html += '<form id="user-form" class="bg-white rounded-2xl border border-[#d1d5db] p-6 space-y-4">';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Full Name *</label>';
  html += '<input type="text" name="fullName" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Email *</label>';
  html += '<input type="email" name="email" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" required></div>';
  html += '</div>';

  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Password *</label>';
  html += '<input type="password" name="password" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" required></div>';
  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">Role *</label>';
  html += '<select name="role" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl text-sm" required>';
  html += '<option value="admin">Admin</option>';
  html += '<option value="accountant">Accountant</option>';
  html += '<option value="auditor">Auditor</option>';
  html += '</select></div>';
  html += '</div>';

  html += '<div><label class="block text-sm font-medium text-[#0f766e] mb-1.5">PIN (for field officers, 4 digits)</label>';
  html += '<input type="text" name="pin" maxlength="4" pattern="[0-9]{4}" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] text-sm" placeholder="Optional"></div>';

  html += '<div class="flex gap-3">';
  html += '<button type="submit" class="bg-[#111827] text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 font-medium text-sm">Create User</button>';
  html += '<button type="button" id="btn-cancel-user" class="bg-white border border-[#d1d5db] text-[#0f766e] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Cancel</button>';
  html += '</div></form></div>';

  container.innerHTML = html;

  document.getElementById('btn-back-users').addEventListener('click', function() { renderUsers(container, options); });
  document.getElementById('btn-cancel-user').addEventListener('click', function() { renderUsers(container, options); });

  document.getElementById('user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;

    var data = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      passwordHash: hashPassword(form.password.value),
      pin: form.pin.value ? hashPin(form.pin.value) : null,
      role: form.role.value,
      status: 'Active',
      branchId: null,
      lastLogin: null
    };

    // Check duplicate email
    var existing = getCollection(StorageKeys.USERS);
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].email === data.email) {
        showToast('Email already exists', 'error');
        return;
      }
    }

    addItem(StorageKeys.USERS, data);
    logAudit('create_user', { module: 'users', changedTo: data.fullName + ' (' + data.role + ')' });
    showToast('User created successfully', 'success');
    renderUsers(container, options);
  });
}

window.renderUsers = renderUsers;
