// ============================================================================
// Saile Platform v2 — Audit Trail Logger
// ============================================================================

/**
 * Log an audit trail entry for any data-modifying action.
 * @param {string} action - The action performed (e.g., 'login', 'create_client', 'approve_loan')
 * @param {object} details - Additional details about the action
 * @returns {object} The created audit entry
 */
function logAudit(action, details) {
  var session = getValue(StorageKeys.SESSION);
  var entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    user: session ? session.name : 'System',
    role: session ? session.role : 'system',
    action: action,
    module: (details && details.module) || null,
    entityId: (details && details.entityId) || null,
    changedFrom: (details && details.changedFrom) || null,
    changedTo: (details && details.changedTo) || null
  };
  var log = getCollection(StorageKeys.AUDIT_LOG);
  log.push(entry);
  setCollection(StorageKeys.AUDIT_LOG, log);
  return entry;
}

window.logAudit = logAudit;
