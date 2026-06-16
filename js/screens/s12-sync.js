// ============================================================================
// Saile Platform v2 — Screen 12: Backup & Sync
// ============================================================================

/**
 * Render the Sync module.
 * @param {HTMLElement} container
 * @param {object} options - { role, readOnly }
 */
function renderSync(container, options) {
  var readOnly = options && options.readOnly;

  function render() {
    var syncQueue = getCollection(StorageKeys.SYNC_QUEUE);
    var pendingCount = syncQueue.filter(function(s) { return s.status === 'Pending'; }).length;
    var conflictCount = syncQueue.filter(function(s) { return s.status === 'Conflict'; }).length;
    var syncedCount = syncQueue.filter(function(s) { return s.status === 'Synced'; }).length;
    var isOnline = navigator.onLine;

    var html = '<div class="space-y-6">';
    html += '<div>';
    html += '<h1 class="text-lg font-semibold text-[#1E3A8A]">Saile Backup & Sync</h1>';
    html += '<p class="text-sm text-[#6B7280]">Data synchronization and offline management</p>';
    html += '</div>';

    // Status indicator
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
    html += '<div class="flex items-center gap-4 mb-4">';
    html += '<div class="w-12 h-12 rounded-full ' + (isOnline ? 'bg-[#1E3A8A]merald-50' : 'bg-[#FEF2F2]') + ' flex items-center justify-center">';
    html += '<div class="w-4 h-4 rounded-full ' + (isOnline ? 'bg-[#1E3A8A]merald-500' : 'bg-[#FEF2F2]0') + '"></div>';
    html += '</div>';
    html += '<div>';
    html += '<h3 class="text-sm font-semibold text-[#1E3A8A]">' + (isOnline ? 'Online' : 'Offline') + '</h3>';
    html += '<p class="text-xs text-[#6B7280]">' + (isOnline ? 'Connected to network. All data syncing normally.' : 'No network connection. Data stored locally.') + '</p>';
    html += '</div></div>';

    // Sync stats
    html += '<div class="grid grid-cols-3 gap-4">';
    html += '<div class="text-center p-3 bg-amber-50 rounded-lg">';
    html += '<p class="text-2xl font-bold text-amber-700">' + pendingCount + '</p>';
    html += '<p class="text-xs text-amber-600">Pending</p></div>';
    html += '<div class="text-center p-3 bg-[#1E3A8A]merald-50 rounded-lg">';
    html += '<p class="text-2xl font-bold text-[#1E3A8A]merald-700">' + syncedCount + '</p>';
    html += '<p class="text-xs text-[#1E3A8A]merald-600">Synced</p></div>';
    html += '<div class="text-center p-3 bg-[#FEF2F2] rounded-lg">';
    html += '<p class="text-2xl font-bold text-[#991B1B]">' + conflictCount + '</p>';
    html += '<p class="text-xs text-[#DC2626]">Conflicts</p></div>';
    html += '</div></div>';

    // Actions
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
    html += '<h3 class="text-sm font-semibold text-[#1E3A8A] mb-4">Sync Actions</h3>';
    html += '<div class="flex flex-wrap gap-3">';
    if (!readOnly) {
      html += '<button id="btn-manual-sync" class="bg-[#1F2937] text-white px-6 py-2.5 rounded-xl hover:bg-[#1F2937] font-medium text-sm">Sync Now</button>';
      html += '<button id="btn-resolve-conflicts" class="bg-white border border-[#d1d5db] text-[#1E3A8A] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm' + (conflictCount === 0 ? ' opacity-50 cursor-not-allowed' : '') + '"' + (conflictCount === 0 ? ' disabled' : '') + '>Resolve Conflicts (' + conflictCount + ')</button>';
      html += '<button id="btn-clear-queue" class="bg-white border border-[#d1d5db] text-[#6B7280] px-6 py-2.5 rounded-xl hover:bg-[#f4f4f5] font-medium text-sm">Clear Synced</button>';
    }
    html += '</div></div>';

    // Offline indicator
    if (!isOnline) {
      html += '<div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">';
      html += '<span class="text-amber-600 text-lg">⚠️</span>';
      html += '<div><p class="text-sm font-medium text-amber-700">Operating in Offline Mode</p>';
      html += '<p class="text-xs text-amber-600">All changes are saved locally and will sync when connectivity returns.</p></div>';
      html += '</div>';
    }

    // Sync queue
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">';
    html += '<div class="p-4 border-b border-[#d1d5db]"><h3 class="text-sm font-semibold text-[#1E3A8A]">Sync Queue (' + syncQueue.length + ' items)</h3></div>';

    if (syncQueue.length === 0) {
      html += '<div class="p-8 text-center text-[#6B7280]"><p class="text-sm">No items in sync queue.</p></div>';
    } else {
      html += '<div class="overflow-x-auto"><table class="w-full text-sm">';
      html += '<thead class="bg-[#f4f4f5]"><tr>';
      html += '<th class="text-left px-4 py-2 font-medium text-[#6B7280]">Action</th>';
      html += '<th class="text-left px-4 py-2 font-medium text-[#6B7280]">Collection</th>';
      html += '<th class="text-left px-4 py-2 font-medium text-[#6B7280]">Status</th>';
      html += '<th class="text-left px-4 py-2 font-medium text-[#6B7280]">Created</th>';
      html += '</tr></thead><tbody>';

      var displayItems = syncQueue.slice(-20).reverse();
      for (var i = 0; i < displayItems.length; i++) {
        var item = displayItems[i];
        var statusBadge = item.status === 'Synced' ? 'bg-[#1E3A8A]merald-50 text-[#1E3A8A]merald-700' :
                          item.status === 'Conflict' ? 'bg-[#FEF2F2] text-[#991B1B]' : 'bg-amber-50 text-amber-700';
        html += '<tr class="border-b border-[#d1d5db]">';
        html += '<td class="px-4 py-2 capitalize">' + escapeHtml(item.action) + '</td>';
        html += '<td class="px-4 py-2 text-[#6B7280]">' + escapeHtml(item.collection || '') + '</td>';
        html += '<td class="px-4 py-2"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + statusBadge + '">' + escapeHtml(item.status) + '</span></td>';
        html += '<td class="px-4 py-2 text-[#6B7280]">' + formatDateTime(item.createdAt) + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
    }
    html += '</div>';

    // Storage info
    html += '<div class="bg-white rounded-2xl border border-[#d1d5db] p-6">';
    html += '<h3 class="text-sm font-semibold text-[#1E3A8A] mb-3">Local Storage Usage</h3>';
    var storageUsed = getStorageSize();
    html += '<div class="flex items-center gap-4">';
    html += '<div class="flex-1 bg-[#f4f4f5] rounded-full h-3">';
    var usagePct = Math.min((storageUsed / (5 * 1024 * 1024)) * 100, 100);
    html += '<div class="bg-[#1E3A8A] h-3 rounded-full" style="width:' + usagePct.toFixed(1) + '%"></div>';
    html += '</div>';
    html += '<span class="text-xs text-[#6B7280]">' + formatBytes(storageUsed) + ' / 5 MB</span>';
    html += '</div></div>';

    html += '</div>';
    container.innerHTML = html;
    attachSyncEvents();
  }

  function attachSyncEvents() {
    var syncBtn = document.getElementById('btn-manual-sync');
    if (syncBtn) {
      syncBtn.addEventListener('click', function() {
        simulateSync();
      });
    }

    var resolveBtn = document.getElementById('btn-resolve-conflicts');
    if (resolveBtn && !resolveBtn.disabled) {
      resolveBtn.addEventListener('click', function() {
        showConflictModal();
      });
    }

    var clearBtn = document.getElementById('btn-clear-queue');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        var queue = getCollection(StorageKeys.SYNC_QUEUE);
        var remaining = queue.filter(function(s) { return s.status !== 'Synced'; });
        setCollection(StorageKeys.SYNC_QUEUE, remaining);
        showToast('Synced items cleared', 'success');
        render();
      });
    }
  }

  function simulateSync() {
    var queue = getCollection(StorageKeys.SYNC_QUEUE);
    for (var i = 0; i < queue.length; i++) {
      if (queue[i].status === 'Pending') {
        queue[i].status = 'Synced';
      }
    }
    setCollection(StorageKeys.SYNC_QUEUE, queue);

    // Also mark collections as synced
    var collections = getCollection(StorageKeys.COLLECTIONS);
    for (var j = 0; j < collections.length; j++) {
      collections[j].synced = true;
    }
    setCollection(StorageKeys.COLLECTIONS, collections);

    logAudit('manual_sync', { module: 'sync', changedTo: 'All pending items synced' });
    showToast('Sync completed successfully', 'success');
    render();
  }

  function showConflictModal() {
    var modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/50';
    modal.innerHTML = '<div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">' +
      '<h3 class="text-lg font-semibold text-[#1E3A8A] mb-2">Resolve Conflicts</h3>' +
      '<p class="text-sm text-[#6B7280] mb-4">Choose how to resolve data conflicts:</p>' +
      '<div class="space-y-3 mb-6">' +
        '<button class="w-full p-3 text-left border border-[#d1d5db] rounded-xl hover:bg-[#f4f4f5] conflict-resolve" data-action="local">' +
          '<p class="text-sm font-medium text-[#1E3A8A]">Keep Local Data</p>' +
          '<p class="text-xs text-[#6B7280]">Overwrite server with local changes</p></button>' +
        '<button class="w-full p-3 text-left border border-[#d1d5db] rounded-xl hover:bg-[#f4f4f5] conflict-resolve" data-action="server">' +
          '<p class="text-sm font-medium text-[#1E3A8A]">Keep Server Data</p>' +
          '<p class="text-xs text-[#6B7280]">Discard local changes and use server version</p></button>' +
      '</div>' +
      '<button class="w-full bg-white border border-[#d1d5db] text-[#1E3A8A] py-2 px-4 rounded-xl text-sm font-medium hover:bg-[#f4f4f5]" id="conflict-cancel">Cancel</button>' +
    '</div>';

    document.body.appendChild(modal);

    modal.querySelector('#conflict-cancel').addEventListener('click', function() {
      document.body.removeChild(modal);
    });

    modal.querySelectorAll('.conflict-resolve').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var queue = getCollection(StorageKeys.SYNC_QUEUE);
        for (var i = 0; i < queue.length; i++) {
          if (queue[i].status === 'Conflict') {
            queue[i].status = 'Synced';
          }
        }
        setCollection(StorageKeys.SYNC_QUEUE, queue);
        document.body.removeChild(modal);
        showToast('Conflicts resolved', 'success');
        render();
      });
    });
  }

  function getStorageSize() {
    var total = 0;
    for (var key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.indexOf('saile_') === 0) {
        total += localStorage.getItem(key).length * 2; // UTF-16
      }
    }
    return total;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  render();
}

window.renderSync = renderSync;
