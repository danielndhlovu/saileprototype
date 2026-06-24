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
  accountant: {
    modules: ['dashboard','clients','loans','repayment','collections','savings','accounting','reports','sync'],
    actions: ['read','update','create_voucher','record_payment'],
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
 * Role-specific navigation mapping based on screenshots.
 * Items can have:
 * - label: Text to display
 * - icon: Icon key from NAV_ICONS
 * - route: URL hash or action string (scroll:id, action:id)
 * - badge: Number to display in red circle
 */
var ROLE_NAV_CONFIG = {
  md: [
    { label: 'Executive Dashboard', icon: 'home', route: '#/dashboard' },
    { label: 'Analytics', icon: 'chart', route: 'scroll:portfolio' },
    { label: 'Branch Scorecard', icon: 'home', route: 'scroll:branches' },
    { label: 'Product Mix', icon: 'document', route: 'scroll:products' },
    { label: 'Financial Performance', icon: 'money', route: 'scroll:financial' },
    { label: 'Operational Efficiency', icon: 'refresh', route: 'scroll:efficiency' },
    { label: 'Compliance', icon: 'clipboard', route: 'scroll:compliance' },
    { label: 'Scenario Modeling', icon: 'calculator', route: 'scroll:scenarios' },
    { divider: true },
    { label: 'Alerts', icon: 'calendar', route: 'scroll:brief', badge: 4 },
    { label: 'Approve Loans', icon: 'money', route: 'action:pending-approvals', badge: 4 },
    { label: 'Board Report', icon: 'report', route: 'action:full-pl' },
    { label: 'Help', icon: 'gear', route: '#/settings' }
  ],
  auditor: [
    { label: 'Anomaly Detection', icon: 'clipboard', route: 'scroll:view-audit' },
    { label: 'Audit Dashboard', icon: 'home', route: '#/dashboard' },
    { label: 'Audit Trail', icon: 'report', route: '#/audit' },
    { label: 'Spot Checks', icon: 'clipboard', route: 'scroll:compliance' },
    { label: 'Risk Heatmap', icon: 'chart', route: 'scroll:heatmap' },
    { divider: true },
    { label: 'Alerts', icon: 'calendar', route: 'action:alerts' },
    { label: 'Generate Report', icon: 'document', route: 'action:generate-audit-report' },
    { label: 'Help', icon: 'gear', route: '#/settings' }
  ],
  branch_manager: [
    { label: 'Branch Dashboard', icon: 'home', route: '#/dashboard' },
    { label: 'My Team', icon: 'people', route: 'scroll:staff' },
    { label: 'Cash Management', icon: 'money', route: 'scroll:cash' },
    { label: 'Today\'s Targets', icon: 'refresh', route: 'scroll:targets' },
    { label: 'Loan Applications', icon: 'document', route: '#/loans' },
    { divider: true },
    { label: 'Alerts', icon: 'calendar', route: 'action:alerts', badge: 2 },
    { label: 'Help', icon: 'gear', route: '#/settings' }
  ],
  loan_officer: [
    { label: 'My Dashboard', icon: 'home', route: '#/dashboard' },
    { label: 'My Clients', icon: 'people', route: '#/clients' },
    { label: 'Loan Applications', icon: 'document', route: '#/loans' },
    { label: 'Collections', icon: 'money', route: '#/collections' },
    { divider: true },
    { label: 'Alerts', icon: 'calendar', route: 'action:alerts', badge: 1 },
    { label: 'Help', icon: 'gear', route: '#/settings' }
  ],
  accountant: [
    { label: 'Finance Dashboard', icon: 'home', route: '#/dashboard' },
    { label: 'General Ledger', icon: 'calculator', route: '#/accounting' },
    { label: 'Savings & Deposits', icon: 'savings', route: '#/savings' },
    { label: 'Financial Reports', icon: 'report', route: '#/reports' },
    { label: 'Trial Balance', icon: 'clipboard', route: 'scroll:trial-balance' },
    { divider: true },
    { label: 'Post Voucher', icon: 'plus', route: 'action:post-voucher' },
    { label: 'Alerts', icon: 'calendar', route: 'action:alerts', badge: 3 },
    { label: 'Help', icon: 'gear', route: '#/settings' }
  ],
  admin: [
    { label: 'System Overview', icon: 'home', route: '#/dashboard' },
    { label: 'User Management', icon: 'users', route: '#/users' },
    { label: 'System Config', icon: 'gear', route: '#/settings' },
    { label: 'Security', icon: 'report', route: 'scroll:security' },
    { label: 'Sync Status', icon: 'refresh', route: '#/sync' },
    { label: 'Backups', icon: 'document', route: 'scroll:backups' },
    { divider: true },
    { label: 'Audit Log', icon: 'report', route: '#/audit' },
    { label: 'Help', icon: 'gear', route: '#/settings' }
  ]
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
  if (ROLE_NAV_CONFIG[role]) {
    return ROLE_NAV_CONFIG[role];
  }
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
