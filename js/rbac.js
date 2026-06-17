// ============================================================================
// Saile Platform v2 — RBAC Engine (Role-Based Access Control)
// ============================================================================

var ROLE_PERMISSIONS = {
  admin: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','accounting','reports','users','settings','audit','sync','migration'],
    actions: ['create','read','update','delete','approve','disburse'],
    defaultRoute: '#/dashboard'
  },
  md: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','accounting','reports','users','settings','audit','sync','migration'],
    actions: ['create','read','update','delete','approve','disburse','view_financial_reports'],
    defaultRoute: '#/dashboard'
  },
  finance_manager: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','accounting','reports','users','settings','audit','sync','migration'],
    actions: ['create','read','update','delete','approve','disburse','view_financial_reports'],
    defaultRoute: '#/dashboard'
  },
  branch_manager: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','accounting','reports','settings','audit','sync'],
    actions: ['create','read','update','approve','disburse'],
    defaultRoute: '#/dashboard'
  },
  loan_officer: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','sync'],
    actions: ['read','create','update','record_payment','create_collection','create_followup'],
    defaultRoute: '#/loans'
  },
  field_officer: {
    modules: ['collections','followup','repayment','clients','sync','savings'],
    actions: ['read','create_collection','create_followup','record_payment'],
    readOnly: ['clients'],
    defaultRoute: '#/collections'
  },
  accountant: {
    modules: ['accounting','repayment','reports','loans','savings'],
    actions: ['read','create_voucher','record_payment','disburse','view_financial_reports'],
    limitedAccess: { loans: ['disburse'], reports: ['financial'] },
    defaultRoute: '#/accounting'
  },
  auditor: {
    modules: ['reports','audit','clients','loans'],
    actions: ['read'],
    readOnly: ['reports','audit','clients','loans'],
    defaultRoute: '#/audit'
  }
};

/**
 * Check if a role can access a given module.
 * @param {string} role
 * @param {string} moduleName
 * @returns {boolean}
 */
function canAccessModule(role, moduleName) {
  return ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].modules.indexOf(moduleName) !== -1;
}

/**
 * Check if a module is read-only for a given role.
 * @param {string} role
 * @param {string} moduleName
 * @returns {boolean}
 */
function isReadOnly(role, moduleName) {
  var p = ROLE_PERMISSIONS[role];
  if (!p) return true;
  if (p.readOnly && p.readOnly.indexOf(moduleName) !== -1) return true;
  if (role === 'auditor') return true;
  return false;
}

/**
 * Get the list of permitted modules for a role.
 * @param {string} role
 * @returns {Array}
 */
function getPermittedModules(role) {
  return ROLE_PERMISSIONS[role] ? ROLE_PERMISSIONS[role].modules : [];
}

/**
 * Get the default route for a role.
 * @param {string} role
 * @returns {string}
 */
function getDefaultRoute(role) {
  return ROLE_PERMISSIONS[role] ? ROLE_PERMISSIONS[role].defaultRoute : '#/login';
}

/**
 * Check if a role can perform a specific action.
 * @param {string} role
 * @param {string} action
 * @returns {boolean}
 */
function canPerformAction(role, action) {
  return ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].actions.indexOf(action) !== -1;
}

// Navigation items definition
var ALL_NAV_ITEMS = [
  {module:'dashboard', label:'Saile Dashboard', icon:'home', route:'#/dashboard'},
  {module:'clients', label:'Saile Client Registry', icon:'users', route:'#/clients'},
  {module:'groups', label:'Groups', icon:'people', route:'#/groups'},
  {module:'loans', label:'Saile Loan Products (7)', icon:'document', route:'#/loans'},
  {module:'repayment', label:'Repayment', icon:'calendar', route:'#/repayment'},
  {module:'collections', label:'Collections', icon:'money', route:'#/collections'},
  {module:'followup', label:'Follow-up', icon:'phone', route:'#/followup'},
  {module:'savings', label:'Savings Module', icon:'savings', route:'#/savings'},
  {module:'accounting', label:'Accounting', icon:'calculator', route:'#/accounting'},
  {module:'reports', label:'RBM Reports & Analytics', icon:'report', route:'#/reports'},
  {module:'users', label:'Users', icon:'user-plus', route:'#/users'},
  {module:'settings', label:'System Configuration', icon:'gear', route:'#/settings'},
  {module:'audit', label:'Audit Trail', icon:'clipboard', route:'#/audit'},
  {module:'sync', label:'Sync', icon:'refresh', route:'#/sync'},
  {module:'migration', label:'Data Migration', icon:'migration', route:'#/migration'}
];

/**
 * Get navigation items filtered by role permissions.
 * @param {string} role
 * @returns {Array}
 */
function getNavigationItems(role) {
  var permitted = getPermittedModules(role);
  return ALL_NAV_ITEMS.filter(function(item) {
    return permitted.indexOf(item.module) !== -1;
  });
}

/**
 * Guard a route hash against role permissions.
 * @param {string} hash
 * @param {string} role
 * @returns {boolean}
 */
function guardRoute(hash, role) {
  if (hash === '#/login') return true;
  var route = hash.replace('#/', '');
  if (route.indexOf('?') !== -1) route = route.split('?')[0];
  return canAccessModule(role, route);
}

/**
 * Switch the current session role (for demo purposes).
 * @param {string} newRole
 */
function switchRole(newRole) {
  var session = getValue(StorageKeys.SESSION);
  if (session) {
    session.role = newRole;
    setValue(StorageKeys.SESSION, session);
  }
}

// Expose all on window
window.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
window.ALL_NAV_ITEMS = ALL_NAV_ITEMS;
window.canAccessModule = canAccessModule;
window.isReadOnly = isReadOnly;
window.getPermittedModules = getPermittedModules;
window.getDefaultRoute = getDefaultRoute;
window.canPerformAction = canPerformAction;
window.getNavigationItems = getNavigationItems;
window.guardRoute = guardRoute;
window.switchRole = switchRole;
