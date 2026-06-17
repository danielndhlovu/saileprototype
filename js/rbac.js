/**
 * RBAC Engine (Role-Based Access Control)
 * Defines module access and permissions for various roles.
 */

var ROLE_PERMISSIONS = {
  admin: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','accounting','reports','users','settings','audit','sync','migration'],
    actions: ['create','read','update','delete','approve','disburse'],
    defaultRoute: '#/dashboard'
  },
  md: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','accounting','reports','users','settings','audit','sync','migration'],
    actions: ['read','update','approve','disburse','view_financial_reports'],
    readOnly: ['clients','groups','collections','followup','users'],
    defaultRoute: '#/dashboard'
  },
  finance_manager: {
    modules: ['dashboard','clients','groups','loans','repayment','collections','followup','savings','accounting','reports','users','settings','audit','sync','migration'],
    actions: ['read','update','approve','disburse','view_financial_reports','create_voucher'],
    readOnly: ['clients','groups','users'],
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
    defaultRoute: '#/dashboard'
  },
  auditor: {
    modules: ['dashboard','reports','audit','clients','loans'],
    actions: ['read'],
    readOnly: ['dashboard','reports','audit','clients','loans'],
    defaultRoute: '#/dashboard'
  }
};

/**
 * All possible navigation items.
 */
var ALL_NAV_ITEMS = [
  {module:'dashboard', label:'Dashboard', icon:'home', route:'#/dashboard'},
  {module:'clients', label:'Client Registry', icon:'people', route:'#/clients'},
  {module:'groups', label:'Groups', icon:'users', route:'#/groups'},
  {module:'loans', label:'Loan Products', icon:'document', route:'#/loans'},
  {module:'repayment', label:'Repayments', icon:'calendar', route:'#/repayment'},
  {module:'collections', label:'Collections', icon:'money', route:'#/collections'},
  {module:'followup', label:'Follow-up', icon:'phone', route:'#/followup'},
  {module:'savings', label:'Savings', icon:'savings', route:'#/savings'},
  {module:'accounting', label:'Accounting', icon:'calculator', route:'#/accounting'},
  {module:'reports', label:'Reports', icon:'report', route:'#/reports'},
  {module:'users', label:'User Management', icon:'user-plus', route:'#/users'},
  {module:'settings', label:'Settings', icon:'gear', route:'#/settings'},
  {module:'audit', label:'Audit Trail', icon:'clipboard', route:'#/audit'},
  {module:'sync', label:'Data Sync', icon:'refresh', route:'#/sync'},
  {module:'migration', label:'Migration', icon:'migration', route:'#/migration'}
];

function canAccessModule(role, moduleName) {
  return ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].modules.indexOf(moduleName) !== -1;
}

function canPerformAction(role, action) {
  return ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].actions.indexOf(action) !== -1;
}

function isReadOnly(role, moduleName) {
  var p = ROLE_PERMISSIONS[role];
  if (!p) return true;
  if (role === 'auditor') return true;
  if (p.readOnly && p.readOnly.indexOf(moduleName) !== -1) return true;
  return false;
}

function getPermittedModules(role) {
  return ROLE_PERMISSIONS[role] ? ROLE_PERMISSIONS[role].modules : [];
}

function getDefaultRoute(role) {
  return ROLE_PERMISSIONS[role] ? ROLE_PERMISSIONS[role].defaultRoute : '#/login';
}

function getNavigationItems(role) {
  var permitted = getPermittedModules(role);
  return ALL_NAV_ITEMS.filter(function(item) {
    return permitted.indexOf(item.module) !== -1;
  });
}

function guardRoute(hash, role) {
  if (hash === '#/login') return true;
  var route = hash.replace('#/', '');
  if (route.indexOf('?') !== -1) route = route.split('?')[0];
  if (route === 'dashboard') return true;
  return canAccessModule(role, route);
}

function switchRole(newRole) {
  var session = getValue(StorageKeys.SESSION);
  if (session) {
    session.role = newRole;
    setValue(StorageKeys.SESSION, session);
  }
}

// Expose
window.canAccessModule = canAccessModule;
window.canPerformAction = canPerformAction;
window.isReadOnly = isReadOnly;
window.getPermittedModules = getPermittedModules;
window.getDefaultRoute = getDefaultRoute;
window.getNavigationItems = getNavigationItems;
window.guardRoute = guardRoute;
window.switchRole = switchRole;
