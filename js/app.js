// ============================================================================
// Saile Platform v2 — Main Application (Router, Init, Seed, Offline Manager)
// Loaded LAST after all other scripts.
// ============================================================================

// --- Route Map ---
var ROUTES = {
  '#/login': { module: null, renderFn: 'renderLogin' },
  '#/dashboard': { module: 'dashboard', renderFn: 'renderDashboard' },
  '#/clients': { module: 'clients', renderFn: 'renderClients' },
  '#/groups': { module: 'groups', renderFn: 'renderGroups' },
  '#/loans': { module: 'loans', renderFn: 'renderLoans' },
  '#/repayment': { module: 'repayment', renderFn: 'renderRepayment' },
  '#/collections': { module: 'collections', renderFn: 'renderCollections' },
  '#/followup': { module: 'followup', renderFn: 'renderFollowup' },
  '#/savings': { module: 'savings', renderFn: 'renderSavings' },
  '#/accounting': { module: 'accounting', renderFn: 'renderAccounting' },
  '#/reports': { module: 'reports', renderFn: 'renderReports' },
  '#/users': { module: 'users', renderFn: 'renderUsers' },
  '#/settings': { module: 'settings', renderFn: 'renderSettings' },
  '#/audit': { module: 'audit', renderFn: 'renderAudit' },
  '#/sync': { module: 'sync', renderFn: 'renderSync' },
  '#/migration': { module: 'migration', renderFn: 'renderMigration' }
};

// --- Router ---

function handleRoute() {
  var hash = window.location.hash || '';
  var session = getSession();

  if (!session && hash !== '#/login') {
    window.location.hash = '#/login';
    return;
  }

  if (session && hash === '#/login') {
    window.location.hash = getDefaultRoute(session.role);
    return;
  }

  var route = ROUTES[hash];
  if (!route) {
    if (session) {
      window.location.hash = getDefaultRoute(session.role);
    } else {
      window.location.hash = '#/login';
    }
    return;
  }

  if (route.module && session) {
    if (!guardRoute(hash, session.role)) {
      showAccessDeniedModal();
      return;
    }
  }

  var appShell = document.getElementById('app-shell');
  var authContainer = document.getElementById('auth-container');

  if (!session) {
    if (appShell) appShell.classList.add('hidden');
    if (authContainer) {
      authContainer.classList.remove('hidden');
      authContainer.innerHTML = '';
      renderLogin(authContainer);
    }
    return;
  }

  if (authContainer) authContainer.classList.add('hidden');
  if (appShell) appShell.classList.remove('hidden');

  if (typeof renderNavigation === 'function') {
    renderNavigation(session.role);
  }

  if (typeof initSessionTimeout === 'function') {
    initSessionTimeout();
  }

  var container = document.getElementById('app-content');
  if (!container) return;
  container.innerHTML = '';

  var renderFnName = route.renderFn;
  var renderFn = window[renderFnName];

  if (typeof renderFn === 'function') {
    var opts = {
      role: session.role,
      readOnly: isReadOnly(session.role, route.module)
    };
    renderFn(container, opts);
  } else {
    renderEmptyState(container, 'Module "' + (route.module || 'unknown') + '" is loading...');
  }

  updateActiveNavLink(hash);
}

function renderLogin(container) {
  if (window.innerWidth >= 1024) {
    renderDesktopLogin(container);
  } else {
    renderMobileLogin(container);
  }
}

// --- Application Initialization ---

function initApp() {
  if (!isStorageAvailable()) {
    showStorageErrorModal();
    return;
  }

  if (localStorage.getItem(StorageKeys.USERS) === null) {
    seedData();
  }

  initOfflineManager();
  initRouter();
}

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function showStorageErrorModal() {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:50000;';
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:12px;padding:32px;max-width:400px;width:90%;text-align:center;">' +
      '<div style="font-size:48px;margin-bottom:16px;">⚠️</div>' +
      '<h2 style="font-size:18px;font-weight:600;color:#0f766e;margin-bottom:8px;">Storage Unavailable</h2>' +
      '<p style="font-size:14px;color:#6b7280;line-height:1.5;">This application requires localStorage to function. Please enable cookies and site data in your browser settings.</p>' +
    '</div>';
  document.body.appendChild(overlay);
}

// --- Offline Manager ---

function initOfflineManager() {
  updateOfflineState(navigator.onLine);
  window.addEventListener('online', function() { updateOfflineState(true); });
  window.addEventListener('offline', function() { updateOfflineState(false); });
}

function updateOfflineState(isOnline) {
  var banner = document.getElementById('offline-banner');
  if (banner) {
    if (isOnline) {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  }
  var syncDot = document.getElementById('sync-indicator');
  if (syncDot) {
    syncDot.style.backgroundColor = isOnline ? '#0f766e' : '#111827';
    syncDot.title = isOnline ? 'Online' : 'Offline';
  }
}

// --- Access Denied Modal ---

function showAccessDeniedModal() {
  var session = getSession();
  var defaultRoute = session ? getDefaultRoute(session.role) : '#/login';

  var overlay = document.createElement('div');
  overlay.id = 'access-denied-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:50000;';

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:12px;padding:32px;max-width:400px;width:90%;text-align:center;">' +
      '<div style="width:48px;height:48px;margin:0 auto 16px;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center;">' +
        '<svg width="24" height="24" fill="none" stroke="#111827" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>' +
      '</div>' +
      '<h2 style="font-size:18px;font-weight:600;color:#0f766e;margin-bottom:8px;">Access Denied</h2>' +
      '<p style="font-size:14px;color:#6b7280;margin-bottom:24px;">You don\'t have permission to access this module.</p>' +
      '<button id="access-denied-back-btn" style="background:#0f766e;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;">Go Back</button>' +
    '</div>';

  document.body.appendChild(overlay);

  document.getElementById('access-denied-back-btn').addEventListener('click', function() {
    document.body.removeChild(overlay);
    window.location.hash = defaultRoute;
  });

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      window.location.hash = defaultRoute;
    }
  });
}

// --- Empty State ---

function renderEmptyState(container, message) {
  container.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:48px 24px;text-align:center;">' +
      '<svg width="64" height="64" fill="none" stroke="#9ca3af" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:16px;">' +
        '<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>' +
      '</svg>' +
      '<p style="font-size:16px;color:#6b7280;max-width:320px;">' + escapeHtml(message) + '</p>' +
    '</div>';
}

// --- Toast Notification ---

function showAppToast(message, type) {
  type = type || 'success';

  var colors = {
    success: '#0f766e',
    error: '#111827',
    warning: '#F59E0B'
  };
  var textColors = {
    success: '#ffffff',
    error: '#ffffff',
    warning: '#0f766e'
  };

  var bgColor = colors[type] || colors.success;
  var txtColor = textColors[type] || '#ffffff';
  var isMobile = window.innerWidth < 768;

  var containerId = 'app-toast-container';
  var toastContainer = document.getElementById(containerId);
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = containerId;
    if (isMobile) {
      toastContainer.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:60000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
    } else {
      toastContainer.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:60000;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none;';
    }
    document.body.appendChild(toastContainer);
  }

  var toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.style.cssText = 'padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;' +
    'box-shadow:0 4px 12px rgba(0,0,0,0.15);pointer-events:auto;max-width:360px;' +
    'opacity:0;transform:translateY(16px);transition:opacity 0.3s ease,transform 0.3s ease;' +
    'background-color:' + bgColor + ';color:' + txtColor + ';';
  toast.textContent = message;

  toastContainer.appendChild(toast);

  requestAnimationFrame(function() {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(16px)';
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      if (toastContainer && toastContainer.children.length === 0 && toastContainer.parentNode) {
        toastContainer.parentNode.removeChild(toastContainer);
      }
    }, 300);
  }, 3000);
}

// --- Update Active Nav Link ---

function updateActiveNavLink(hash) {
  var navLinks = document.querySelectorAll('[data-nav-route]');
  for (var i = 0; i < navLinks.length; i++) {
    var link = navLinks[i];
    var route = link.getAttribute('data-nav-route');
    if (route === hash) {
      link.classList.add('nav-active');
      link.classList.remove('nav-inactive');
    } else {
      link.classList.remove('nav-active');
      link.classList.add('nav-inactive');
    }
  }
}

// --- Hash Password ---

if (typeof window.hashPassword === 'undefined') {
  function hashPassword(password) {
    var hash = 0;
    var salt = 'saile_pwd_salt_2026';
    var input = salt + password;
    for (var i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString(16);
  }
  window.hashPassword = hashPassword;
}

// ==============================
// SEED DATA — Saile Financial Services
// ==============================

function seedData() {
  var now = new Date().toISOString();
  var today = todayISO();

  // ========================================
  // 1. USERS (17 staff with realistic Malawian names)
  // ========================================
  var users = [
    // Management Team
    {
      id: generateId(),
      fullName: 'Mr. Elias Kafinyangwe',
      email: 'elias@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1234'),
      role: 'md',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Mr. Matias Kafinyangwe',
      email: 'matias@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1235'),
      role: 'finance_manager',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Mr. Isaac Nkhambule',
      email: 'isaac@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1236'),
      role: 'admin',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Mrs. Yuki Kafinyangwe',
      email: 'yuki@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1237'),
      role: 'auditor',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    // Mzuzu Employee/Pensioner Branch
    {
      id: generateId(),
      fullName: 'Mr. Francis Mughandira',
      email: 'francis@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1240'),
      role: 'branch_manager',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Ms. Mercy Jere',
      email: 'mjere@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1241'),
      role: 'loan_officer',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Mr. Francis Moyo',
      email: 'fmoyo@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1242'),
      role: 'loan_officer',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    // Mzuzu Business Branch
    {
      id: generateId(),
      fullName: 'Mr. Jericho Nyirenda',
      email: 'jericho@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1243'),
      role: 'branch_manager',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Mr. Steven Gondwe',
      email: 'sgondwe@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1244'),
      role: 'loan_officer',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    // Lilongwe Branch
    {
      id: generateId(),
      fullName: 'Mr. Kenneth Malita',
      email: 'kenneth@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1238'),
      role: 'branch_manager',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Ms. Liness Nkhata',
      email: 'lnkhata@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1239'),
      role: 'loan_officer',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    // Blantyre Branch
    {
      id: generateId(),
      fullName: 'Mr. Ambwene Mwang\'onda',
      email: 'ambwene@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1245'),
      role: 'branch_manager',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Mr. Jones Mwalwanda',
      email: 'jmwalwanda@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1246'),
      role: 'loan_officer',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    // Karonga Branch
    {
      id: generateId(),
      fullName: 'Mr. Moses Maloya',
      email: 'moses@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1247'),
      role: 'branch_manager',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Ms. Bertha Mwale',
      email: 'bmwale@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1248'),
      role: 'loan_officer',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    // Zomba Branch
    {
      id: generateId(),
      fullName: 'Mr. Davie Ndhlovu',
      email: 'davie@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1249'),
      role: 'branch_manager',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      fullName: 'Mr. Charles Mwase',
      email: 'cmwase@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: hashPin('1250'),
      role: 'loan_officer',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    },
    // Additional accountant user
    {
      id: generateId(),
      fullName: 'Mr. Kamanga Banda',
      email: 'kbanda@saile.mw',
      passwordHash: hashPassword('password123'),
      pin: null,
      role: 'accountant',
      status: 'Active',
      branchId: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    }
  ];

  // ========================================
  // 2. BRANCHES (6 - including two Mzuzu branches)
  // ========================================
  var branches = [
    {
      id: generateId(),
      branchCode: 'MZE',
      branchName: 'Mzuzu - Employees & Pensioners Loans Branch',
      location: 'Mzuzu',
      branchType: 'Employee/Pensioner Loans',
      managerName: 'Mr. Francis Mughandira',
      phone: 'mze@saile.mw',
      managerId: users[4].id,
      status: 'Active',
      openingDate: '2020-01-15',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      branchCode: 'MZB',
      branchName: 'Mzuzu - Business Loans Branch',
      location: 'Mzuzu',
      branchType: 'Business Loans',
      managerName: 'Mr. Jericho Nyirenda',
      phone: 'mzb@saile.mw',
      managerId: users[7].id,
      status: 'Active',
      openingDate: '2021-03-20',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      branchCode: 'LLW',
      branchName: 'Lilongwe Branch',
      location: 'Lilongwe',
      branchType: 'Mixed Portfolio',
      managerName: 'Mr. Kenneth Malita',
      phone: 'llw@saile.mw',
      managerId: users[9].id,
      status: 'Active',
      openingDate: '2019-06-10',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      branchCode: 'BLN',
      branchName: 'Blantyre Branch',
      location: 'Blantyre',
      branchType: 'Mixed Portfolio',
      managerName: 'Mr. Ambwene Mwang\'onda',
      phone: 'bln@saile.mw',
      managerId: users[11].id,
      status: 'Active',
      openingDate: '2019-08-05',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      branchCode: 'KRG',
      branchName: 'Karonga Branch',
      location: 'Karonga',
      branchType: 'Mixed Portfolio',
      managerName: 'Mr. Moses Maloya',
      phone: 'krg@saile.mw',
      managerId: users[13].id,
      status: 'Active',
      openingDate: '2020-11-12',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      branchCode: 'ZBA',
      branchName: 'Zomba Branch',
      location: 'Zomba',
      branchType: 'Mixed Portfolio',
      managerName: 'Mr. Davie Ndhlovu',
      phone: 'zba@saile.mw',
      managerId: users[15].id,
      status: 'Active',
      openingDate: '2021-01-08',
      createdAt: now,
      updatedAt: now
    }
  ];

  // Assign users to branches
  users[4].branchId = branches[0].id;  // Blessings - MZE
  users[5].branchId = branches[0].id;  // Mercy - MZE
  users[6].branchId = branches[0].id;  // Francis - MZE
  users[7].branchId = branches[1].id;  // Agness - MZB
  users[8].branchId = branches[1].id;  // Steven - MZB
  users[9].branchId = branches[2].id;  // Patrick - LLW
  users[10].branchId = branches[2].id; // Liness - LLW
  users[11].branchId = branches[3].id; // Esnart - BLN
  users[12].branchId = branches[3].id; // Jones - BLN
  users[13].branchId = branches[4].id; // Geoffrey - KRG
  users[14].branchId = branches[4].id; // Bertha - KRG
  users[15].branchId = branches[5].id; // Mary - ZBA
  users[16].branchId = branches[5].id; // Charles - ZBA

  setCollection(StorageKeys.USERS, users);
  setCollection(StorageKeys.BRANCHES, branches);

  // ========================================
  // 3. GROUPS
  // ========================================
  var groups = [
    {
      id: 'GRP-A1B2C',
      groupName: 'Tiyende Pamodzi',
      branchCenter: 'Lilongwe',
      branchId: branches[2].id,
      liabilityAgreement: true,
      memberIds: [],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'GRP-D3E4F',
      groupName: 'Zinthu Zabwino',
      branchCenter: 'Blantyre',
      branchId: branches[3].id,
      liabilityAgreement: true,
      memberIds: [],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'GRP-E5G6H',
      groupName: 'Amakwapata Ufulu',
      branchCenter: 'Mzuzu',
      branchId: branches[0].id,
      liabilityAgreement: true,
      memberIds: [],
      createdAt: now,
      updatedAt: now
    }
  ];

  // ========================================
  // 4. CLIENTS (20 realistic Malawian clients)
  // ========================================
  var clients = [
    {
      id: generateId(), fullName: 'Grace Banda',
      nationalId: 'MW1234567', phoneNumber: '+265991234567',
      dateOfBirth: '1990-03-15', residentialZone: 'Area 25, Lilongwe',
      status: 'Active', guarantor: { name: 'Peter Banda', relationship: 'Spouse', phoneNumber: '+265991234568', nationalId: 'MW1234568' },
      notes: 'Reliable client with good repayment history. Runs a small grocery shop.',
      documents: [], groupId: groups[0].id, branchId: branches[2].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'James Phiri',
      nationalId: 'MW1345678', phoneNumber: '+265992345678',
      dateOfBirth: '1985-07-22', residentialZone: 'Area 47, Lilongwe',
      status: 'Active', guarantor: { name: 'Mary Phiri', relationship: 'Spouse', phoneNumber: '+265992345679', nationalId: 'MW1345679' },
      notes: 'Business owner, second loan cycle. Owns a hardware store.',
      documents: [], groupId: groups[0].id, branchId: branches[2].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Mary Chirwa',
      nationalId: 'MW1456789', phoneNumber: '+265993456789',
      dateOfBirth: '1992-11-08', residentialZone: 'Ndirande, Blantyre',
      status: 'Active', guarantor: { name: 'John Chirwa', relationship: 'Brother', phoneNumber: '+265993456790', nationalId: 'MW1456790' },
      notes: 'Market vendor at Limbe Market. First loan cycle.',
      documents: [], groupId: groups[0].id, branchId: branches[3].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Peter Mwale',
      nationalId: 'MW1567890', phoneNumber: '+265994567890',
      dateOfBirth: '1988-01-30', residentialZone: 'Chilomoni, Blantyre',
      status: 'Active', guarantor: { name: 'Agnes Mwale', relationship: 'Spouse', phoneNumber: '+265994567891', nationalId: 'MW1567891' },
      notes: 'Farmer with seasonal income. Maize and tobacco.',
      documents: [], groupId: groups[0].id, branchId: branches[3].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Agnes Kamanga',
      nationalId: 'MW1678901', phoneNumber: '+265995678901',
      dateOfBirth: '1993-05-12', residentialZone: 'Limbe, Blantyre',
      status: 'Active', guarantor: { name: 'David Kamanga', relationship: 'Father', phoneNumber: '+265995678902', nationalId: 'MW1678902' },
      notes: 'Tailor with steady income. Runs tailoring business in Limbe.',
      documents: [], groupId: groups[0].id, branchId: branches[3].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'John Nkhoma',
      nationalId: 'MW1789012', phoneNumber: '+265996789012',
      dateOfBirth: '1987-09-25', residentialZone: 'Bangwe, Blantyre',
      status: 'Active', guarantor: { name: 'Sarah Nkhoma', relationship: 'Spouse', phoneNumber: '+265996789013', nationalId: 'MW1789013' },
      notes: 'Transport business. Owns two minibuses.',
      documents: [], groupId: groups[0].id, branchId: branches[3].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Faithful Manda',
      nationalId: 'MW1890123', phoneNumber: '+265997890123',
      dateOfBirth: '1991-08-14', residentialZone: 'Area 9, Lilongwe',
      status: 'Active', guarantor: { name: 'Henry Manda', relationship: 'Husband', phoneNumber: '+265997890124', nationalId: 'MW1890124' },
      notes: 'Restaurant owner. Stable income.',
      documents: [], groupId: groups[0].id, branchId: branches[2].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Wonderful Singini',
      nationalId: 'MW1901234', phoneNumber: '+265998901234',
      dateOfBirth: '1989-02-28', residentialZone: 'Mzimba Road Area, Lilongwe',
      status: 'Active', guarantor: { name: 'Bright Singini', relationship: 'Brother', phoneNumber: '+265998901235', nationalId: 'MW1901235' },
      notes: 'Mobile money agent. Growing business.',
      documents: [], groupId: groups[0].id, branchId: branches[2].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Mphatso Kalua',
      nationalId: 'MW2012345', phoneNumber: '+265999012345',
      dateOfBirth: '1994-12-05', residentialZone: 'Kanengo, Lilongwe',
      status: 'Active', guarantor: { name: 'Joyce Kalua', relationship: 'Sister', phoneNumber: '+265999012346', nationalId: 'MW2012346' },
      notes: 'Small-scale trader. Sells secondhand clothes.',
      documents: [], groupId: groups[0].id, branchId: branches[2].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Chimwemwe Mwale',
      nationalId: 'MW2123456', phoneNumber: '+265881234567',
      dateOfBirth: '1990-06-18', residentialZone: 'Mangochi Road, Mzuzu',
      status: 'Active', guarantor: { name: 'Joseph Mwale', relationship: 'Father', phoneNumber: '+265881234568', nationalId: 'MW2123457' },
      notes: 'Teacher at Mzuzu Secondary School.',
      documents: [], groupId: groups[2].id, branchId: branches[0].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Golden Moyo',
      nationalId: 'MW2234567', phoneNumber: '+265882345678',
      dateOfBirth: '1986-04-22', residentialZone: 'Luwinga, Mzuzu',
      status: 'Active', guarantor: { name: 'Grace Moyo', relationship: 'Spouse', phoneNumber: '+265882345679', nationalId: 'MW2234568' },
      notes: 'Businessman. Runs electronics shop.',
      documents: [], groupId: groups[2].id, branchId: branches[0].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Peaceful Kachali',
      nationalId: 'MW2345678', phoneNumber: '+265883456789',
      dateOfBirth: '1991-11-30', residentialZone: 'Chibanja, Mzuzu',
      status: 'Active', guarantor: { name: 'Immaculate Kachali', relationship: 'Mother', phoneNumber: '+265883456790', nationalId: 'MW2345679' },
      notes: 'University student. Needs school fees loan.',
      documents: [], groupId: groups[2].id, branchId: branches[0].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Moses Kalimbuka',
      nationalId: 'MW2456789', phoneNumber: '+265884567890',
      dateOfBirth: '1988-09-15', residentialZone: 'Mzuzu City Center',
      status: 'Active', guarantor: { name: 'Esther Kalimbuka', relationship: 'Spouse', phoneNumber: '+265884567891', nationalId: 'MW2456790' },
      notes: 'Business owner. Trading general merchandise.',
      documents: [], groupId: groups[2].id, branchId: branches[1].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Patuma Salima',
      nationalId: 'MW2567890', phoneNumber: '+265885678901',
      dateOfBirth: '1995-05-10', residentialZone: 'Mzuzu Industrial Area',
      status: 'Active', guarantor: { name: 'Yusuf Salima', relationship: 'Husband', phoneNumber: '+265885678902', nationalId: 'MW2567891' },
      notes: 'Salon and beauty business owner.',
      documents: [], groupId: groups[2].id, branchId: branches[1].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Norman Kapito',
      nationalId: 'MW2678901', phoneNumber: '+265886789012',
      dateOfBirth: '1984-03-20', residentialZone: 'Mzuzu Luwinga',
      status: 'Active', guarantor: { name: 'Esther Kapito', relationship: 'Spouse', phoneNumber: '+265886789013', nationalId: 'MW2678902' },
      notes: 'Transport business owner. Taxi fleet.',
      documents: [], groupId: groups[2].id, branchId: branches[1].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Hastings Nkhata',
      nationalId: 'MW2789012', phoneNumber: '+265991111111',
      dateOfBirth: '1990-07-25', residentialZone: 'Chilobwe, Blantyre',
      status: 'Active', guarantor: { name: 'Martha Nkhata', relationship: 'Sister', phoneNumber: '+265991111112', nationalId: 'MW2789013' },
      notes: 'Pharmacy owner. Trained pharmacist.',
      documents: [], groupId: groups[1].id, branchId: branches[3].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Chimwemwe Jere',
      nationalId: 'MW2890123', phoneNumber: '+265992222222',
      dateOfBirth: '1993-04-12', residentialZone: 'Mangochi, Mangochi District',
      status: 'Active', guarantor: { name: 'Simon Jere', relationship: 'Father', phoneNumber: '+265992222223', nationalId: 'MW2890124' },
      notes: 'Fisherman. Fish trading business.',
      documents: [], groupId: groups[1].id, branchId: branches[4].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Fletcher Gondwe',
      nationalId: 'MW2901234', phoneNumber: '+265993333333',
      dateOfBirth: '1987-08-09', residentialZone: 'Namiyonga, Zomba',
      status: 'Active', guarantor: { name: 'Patricia Gondwe', relationship: 'Spouse', phoneNumber: '+265993333334', nationalId: 'MW2901235' },
      notes: 'Farmer. Tea and tobacco grower.',
      documents: [], groupId: groups[1].id, branchId: branches[5].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Tiyamike Kachali',
      nationalId: 'MW3012345', phoneNumber: '+265994444444',
      dateOfBirth: '1996-01-25', residentialZone: 'Nkhoma, Zomba',
      status: 'Active', guarantor: { name: 'Kenneth Kachali', relationship: 'Uncle', phoneNumber: '+265994444445', nationalId: 'MW3012346' },
      notes: 'Small business owner. Food vending.',
      documents: [], groupId: groups[1].id, branchId: branches[5].id,
      createdAt: now, updatedAt: now
    },
    {
      id: generateId(), fullName: 'Samuel Nkhoma',
      nationalId: 'MW3123456', phoneNumber: '+265995555555',
      dateOfBirth: '1982-11-15', residentialZone: 'Old Town, Lilongwe',
      status: 'Active', guarantor: { name: 'Grace Nkhoma', relationship: 'Spouse', phoneNumber: '+265995555556', nationalId: 'MW3123457' },
      notes: 'Experienced businessman. Import/export.',
      documents: [], groupId: null, branchId: branches[2].id,
      createdAt: now, updatedAt: now
    }
  ];
  setCollection(StorageKeys.CLIENTS, clients);

  // Update group memberIds
  groups[0].memberIds = [clients[0].id, clients[1].id, clients[2].id, clients[3].id, clients[4].id, clients[5].id, clients[6].id, clients[7].id, clients[8].id];
  groups[1].memberIds = [clients[15].id, clients[16].id, clients[17].id, clients[18].id, clients[19].id];
  groups[2].memberIds = [clients[9].id, clients[10].id, clients[11].id, clients[12].id, clients[13].id, clients[14].id];
  setCollection(StorageKeys.GROUPS, groups);

  // ========================================
  // 5. LOAN PRODUCTS (7 Saile Products)
  // ========================================
  var products = [
    {
      id: generateId(), productCode: 'PDL', productName: 'Payday Loan', productType: 'SHORT_TERM',
      minPrincipal: 50000, maxPrincipal: 500000, defaultInterestRate: 7.5, interestMethod: 'flat',
      effectiveInterestRateAnnual: 135.0, durationMonths: 1, repaymentFrequency: 'monthly',
      processingFee: 3000, latePenaltyRate: 3, gracePeriodDays: 0, isSignatureProduct: true,
      compulsorySavingsPercentage: 20, processingTimeMinutes: 30,
      documentChecklist: JSON.stringify(['National ID', 'Payslip (Mandatory)', 'Employer Confirmation', 'NRC Copy']),
      targetClientDescription: 'Salaried employees with payslips (signature product) - 30 minute processing promise',
      rbmReportingCategory: 'SHORT_TERM', status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: '3ML', productName: '3-Month Loan', productType: 'SHORT_TERM',
      minPrincipal: 100000, maxPrincipal: 1000000, defaultInterestRate: 4.5, interestMethod: 'declining',
      effectiveInterestRateAnnual: 65.3, durationMonths: 3, repaymentFrequency: 'monthly',
      processingFee: 5000, latePenaltyRate: 2.5, gracePeriodDays: 3, isSignatureProduct: false,
      compulsorySavingsPercentage: 20, processingTimeMinutes: 120,
      documentChecklist: JSON.stringify(['National ID', 'NRC Copy', 'Employer Confirmation']),
      targetClientDescription: 'Salaried employees - short-term credit',
      rbmReportingCategory: 'SHORT_TERM', status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'SML', productName: '6-Month Loan (SML)', productType: 'MEDIUM_TERM',
      minPrincipal: 150000, maxPrincipal: 3000000, defaultInterestRate: 4.0, interestMethod: 'declining',
      effectiveInterestRateAnnual: 58.3, durationMonths: 6, repaymentFrequency: 'monthly',
      processingFee: 10000, latePenaltyRate: 2.5, gracePeriodDays: 5, isSignatureProduct: false,
      compulsorySavingsPercentage: 20, processingTimeMinutes: 240,
      documentChecklist: JSON.stringify(['National ID', 'NRC Copy', 'Employer/Business Proof', 'Bank Statements (3 months)']),
      targetClientDescription: 'SML (6-Month Loan) - salaried employees & small business owners',
      rbmReportingCategory: 'MEDIUM_TERM', status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'SSC', productName: 'Special Scheme', productType: 'MEDIUM_TERM',
      minPrincipal: 500000, maxPrincipal: 8000000, defaultInterestRate: 3.5, interestMethod: 'declining',
      effectiveInterestRateAnnual: 48.2, durationMonths: 10, repaymentFrequency: 'monthly',
      processingFee: 15000, latePenaltyRate: 2, gracePeriodDays: 5, isSignatureProduct: false,
      compulsorySavingsPercentage: 20, processingTimeMinutes: 360,
      documentChecklist: JSON.stringify(['National ID', 'NRC Copy', 'Employment Letter', 'Payslips (3 months)', 'Tax Clearance']),
      targetClientDescription: 'High-salary employees (senior staff, lecturers, managers)',
      rbmReportingCategory: 'MEDIUM_TERM', status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'ESC', productName: 'Executive Scheme', productType: 'LONG_TERM',
      minPrincipal: 1000000, maxPrincipal: 15000000, defaultInterestRate: 3.2, interestMethod: 'declining',
      effectiveInterestRateAnnual: 44.1, durationMonths: 12, repaymentFrequency: 'monthly',
      processingFee: 25000, latePenaltyRate: 2, gracePeriodDays: 7, isSignatureProduct: false,
      compulsorySavingsPercentage: 20, processingTimeMinutes: 720,
      documentChecklist: JSON.stringify(['National ID', 'NRC Copy', 'Employment Contract', 'Payslips (6 months)', 'Tax Clearance', 'Bank Statements (6 months)']),
      targetClientDescription: 'Managers, lecturers, senior civil servants - premium product',
      rbmReportingCategory: 'LONG_TERM', status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'BSL', productName: 'Business Loan', productType: 'SMALL_ENTERPRISE',
      minPrincipal: 300000, maxPrincipal: 10000000, defaultInterestRate: 3.8, interestMethod: 'declining',
      effectiveInterestRateAnnual: 54.4, durationMonths: 12, repaymentFrequency: 'monthly',
      processingFee: 20000, latePenaltyRate: 3, gracePeriodDays: 7, isSignatureProduct: false,
      compulsorySavingsPercentage: 20, processingTimeMinutes: 480,
      documentChecklist: JSON.stringify(['National ID', 'NRC Copy', 'Business Registration', 'Financial Statements', 'Bank Statements (12 months)', 'Tax Clearance']),
      targetClientDescription: 'Business people, traders, SMEs - working capital & expansion',
      rbmReportingCategory: 'SMALL_ENTERPRISE', status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'ENT', productName: 'Enterprise Loan', productType: 'MICRO_ENTERPRISE',
      minPrincipal: 2000000, maxPrincipal: 25000000, defaultInterestRate: 3.0, interestMethod: 'declining',
      effectiveInterestRateAnnual: 42.6, durationMonths: 18, repaymentFrequency: 'monthly',
      processingFee: 50000, latePenaltyRate: 2.5, gracePeriodDays: 10, isSignatureProduct: false,
      compulsorySavingsPercentage: 20, processingTimeMinutes: 1440,
      documentChecklist: JSON.stringify(['National ID', 'NRC Copy', 'Business Registration', 'Audited Financials (3 years)', 'Bank Statements (24 months)', 'Tax Clearance', 'Project Proposal']),
      targetClientDescription: 'Established businesses with track record - largest amounts',
      rbmReportingCategory: 'MICRO_ENTERPRISE', status: 'Active', createdAt: now, updatedAt: now
    }
  ];
  setCollection(StorageKeys.PRODUCTS, products);

  // ========================================
  // 6. LOAN APPLICATIONS (20 in various stages)
  // ========================================
  var loans = [];

  // Payday Loan - ACTIVE - Grace Banda
  var pdl1Schedule = generateAmortization(150000, 7.5, 'monthly', 'flat', '2026-05-15', 1);
  loans.push({
    id: generateId(), applicationDate: '2026-05-10', clientId: clients[0].id,
    groupId: groups[0].id, clientName: 'Grace Banda',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 150000, approvedAmount: 150000, proposedInterestRate: 7.5,
    effectiveInterestRate: 135.0, totalCostOfCredit: 194250, interestMethod: 'flat',
    status: 'Active', rejectionReason: null, collateral: [],
    disbursementDate: '2026-05-15', payoutMethod: 'mobile_money',
    amortizationSchedule: pdl1Schedule, compulsorySavingsAmount: 30000,
    effectiveInterestRateCalculated: 135.0, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Mercy Jere',date:'2026-05-10'},{action:'approved',by:'Blessings Chirwa',date:'2026-05-10'},{action:'disbursed',by:'Mercy Jere',date:'2026-05-15'}]),
    createdAt: now, updatedAt: now
  });

  // Payday Loan - SUBMITTED - James Phiri
  loans.push({
    id: generateId(), applicationDate: '2026-06-08', clientId: clients[1].id,
    groupId: groups[0].id, clientName: 'James Phiri',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 200000, approvedAmount: null, proposedInterestRate: 7.5,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'flat',
    status: 'Pending', rejectionReason: null, collateral: [{ description: 'Shop inventory', marketValue: 300000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Liness Nkhata',date:'2026-06-08'}]),
    createdAt: now, updatedAt: now
  });

  // Payday Loan - ACTIVE - Agnes Kamanga
  var pdl3Schedule = generateAmortization(80000, 7.5, 'monthly', 'flat', '2026-04-20', 1);
  loans.push({
    id: generateId(), applicationDate: '2026-04-15', clientId: clients[4].id,
    groupId: groups[0].id, clientName: 'Agnes Kamanga',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 80000, approvedAmount: 80000, proposedInterestRate: 7.5,
    effectiveInterestRate: 135.0, totalCostOfCredit: 85400, interestMethod: 'flat',
    status: 'Active', rejectionReason: null, collateral: [],
    disbursementDate: '2026-04-20', payoutMethod: 'cash',
    amortizationSchedule: pdl3Schedule, compulsorySavingsAmount: 16000,
    effectiveInterestRateCalculated: 135.0, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-04-15'},{action:'approved',by:'Esнart Tembo',date:'2026-04-15'},{action:'disbursed',by:'Jones Mwalwanda',date:'2026-04-20'}]),
    createdAt: now, updatedAt: now
  });

  // 3-Month Loan - ACTIVE - Mary Chirwa
  var m3Schedule = generateAmortization(300000, 4.5, 'monthly', 'declining', '2026-03-10', 3);
  loans.push({
    id: generateId(), applicationDate: '2026-03-01', clientId: clients[2].id,
    groupId: groups[0].id, clientName: 'Mary Chirwa',
    productId: products[1].id, productCode: '3ML', productName: '3-Month Loan',
    requestedAmount: 300000, approvedAmount: 300000, proposedInterestRate: 4.5,
    effectiveInterestRate: 65.3, totalCostOfCredit: 348650, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Market stall goods', marketValue: 400000 }],
    disbursementDate: '2026-03-10', payoutMethod: 'mobile_money',
    amortizationSchedule: m3Schedule, compulsorySavingsAmount: 60000,
    effectiveInterestRateCalculated: 65.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-03-01'},{action:'approved',by:'Esнart Tembo',date:'2026-03-02'},{action:'disbursed',by:'Jones Mwalwanda',date:'2026-03-10'}]),
    createdAt: now, updatedAt: now
  });

  // 3-Month Loan - UNDER_REVIEW - Wonderful Singini
  loans.push({
    id: generateId(), applicationDate: '2026-06-05', clientId: clients[7].id,
    groupId: groups[0].id, clientName: 'Wonderful Singini',
    productId: products[1].id, productCode: '3ML', productName: '3-Month Loan',
    requestedAmount: 500000, approvedAmount: null, proposedInterestRate: 4.5,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'declining',
    status: 'Under_Review', rejectionReason: null, collateral: [{ description: 'Business equipment', marketValue: 700000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Liness Nkhata',date:'2026-06-05'},{action:'under_review',by:'Patrick Kalua',date:'2026-06-06'}]),
    createdAt: now, updatedAt: now
  });

  // SML - ACTIVE - Moses Kalimbuka
  var smlSchedule = generateAmortization(1500000, 4.0, 'monthly', 'declining', '2026-01-15', 6);
  loans.push({
    id: generateId(), applicationDate: '2026-01-05', clientId: clients[12].id,
    groupId: groups[2].id, clientName: 'Moses Kalimbuka',
    productId: products[2].id, productCode: 'SML', productName: '6-Month Loan (SML)',
    requestedAmount: 1500000, approvedAmount: 1500000, proposedInterestRate: 4.0,
    effectiveInterestRate: 58.3, totalCostOfCredit: 1867500, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'General merchandise inventory', marketValue: 2500000 }],
    disbursementDate: '2026-01-15', payoutMethod: 'bank_transfer',
    amortizationSchedule: smlSchedule, compulsorySavingsAmount: 300000,
    effectiveInterestRateCalculated: 58.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Steven Gondwe',date:'2026-01-05'},{action:'approved',by:'Agness Mhango',date:'2026-01-06'},{action:'disbursed',by:'Steven Gondwe',date:'2026-01-15'}]),
    createdAt: now, updatedAt: now
  });

  // SML - ACTIVE - Norman Kapito
  var sml2Schedule = generateAmortization(2500000, 4.0, 'monthly', 'declining', '2026-02-01', 6);
  loans.push({
    id: generateId(), applicationDate: '2026-01-20', clientId: clients[14].id,
    groupId: groups[2].id, clientName: 'Norman Kapito',
    productId: products[2].id, productCode: 'SML', productName: '6-Month Loan (SML)',
    requestedAmount: 2500000, approvedAmount: 2500000, proposedInterestRate: 4.0,
    effectiveInterestRate: 58.3, totalCostOfCredit: 3112500, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Taxi fleet (5 vehicles)', marketValue: 5000000 }],
    disbursementDate: '2026-02-01', payoutMethod: 'bank_transfer',
    amortizationSchedule: sml2Schedule, compulsorySavingsAmount: 500000,
    effectiveInterestRateCalculated: 58.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Steven Gondwe',date:'2026-01-20'},{action:'approved',by:'Agness Mhango',date:'2026-01-21'},{action:'disbursed',by:'Steven Gondwe',date:'2026-02-01'}]),
    createdAt: now, updatedAt: now
  });

  // Special Scheme - ACTIVE - Golden Moyo
  var sscSchedule = generateAmortization(5000000, 3.5, 'monthly', 'declining', '2025-12-01', 10);
  loans.push({
    id: generateId(), applicationDate: '2025-11-15', clientId: clients[10].id,
    groupId: groups[2].id, clientName: 'Golden Moyo',
    productId: products[3].id, productCode: 'SSC', productName: 'Special Scheme',
    requestedAmount: 5000000, approvedAmount: 5000000, proposedInterestRate: 3.5,
    effectiveInterestRate: 48.2, totalCostOfCredit: 6850000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Electronics shop property', marketValue: 8000000 }],
    disbursementDate: '2025-12-01', payoutMethod: 'bank_transfer',
    amortizationSchedule: sscSchedule, compulsorySavingsAmount: 1000000,
    effectiveInterestRateCalculated: 48.2, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Mercy Jere',date:'2025-11-15'},{action:'approved',by:'Blessings Chirwa',date:'2025-11-16'},{action:'disbursed',by:'Mercy Jere',date:'2025-12-01'}]),
    createdAt: now, updatedAt: now
  });

  // Executive Scheme - ACTIVE - Samuel Nkhoma
  var escSchedule = generateAmortization(10000000, 3.2, 'monthly', 'declining', '2025-10-01', 12);
  loans.push({
    id: generateId(), applicationDate: '2025-09-15', clientId: clients[19].id,
    groupId: null, clientName: 'Samuel Nkhoma',
    productId: products[4].id, productCode: 'ESC', productName: 'Executive Scheme',
    requestedAmount: 10000000, approvedAmount: 10000000, proposedInterestRate: 3.2,
    effectiveInterestRate: 44.1, totalCostOfCredit: 13050000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Import/export business assets', marketValue: 15000000 }],
    disbursementDate: '2025-10-01', payoutMethod: 'bank_transfer',
    amortizationSchedule: escSchedule, compulsorySavingsAmount: 2000000,
    effectiveInterestRateCalculated: 44.1, disclosureStatementGenerated: true,
    rbmReportingCategory: 'LONG_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Liness Nkhata',date:'2025-09-15'},{action:'approved',by:'Patrick Kalua',date:'2025-09-18'},{action:'disbursed',by:'Liness Nkhata',date:'2025-10-01'}]),
    createdAt: now, updatedAt: now
  });

  // Business Loan - ACTIVE - Hastings Nkhata
  var bslSchedule = generateAmortization(3000000, 3.8, 'monthly', 'declining', '2026-02-01', 12);
  loans.push({
    id: generateId(), applicationDate: '2026-01-15', clientId: clients[15].id,
    groupId: groups[1].id, clientName: 'Hastings Nkhata',
    productId: products[5].id, productCode: 'BSL', productName: 'Business Loan',
    requestedAmount: 3000000, approvedAmount: 3000000, proposedInterestRate: 3.8,
    effectiveInterestRate: 54.4, totalCostOfCredit: 4150000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Pharmacy inventory and equipment', marketValue: 5000000 }],
    disbursementDate: '2026-02-01', payoutMethod: 'mobile_money',
    amortizationSchedule: bslSchedule, compulsorySavingsAmount: 600000,
    effectiveInterestRateCalculated: 54.4, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SMALL_ENTERPRISE',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-01-15'},{action:'approved',by:'Esнart Tembo',date:'2026-01-18'},{action:'disbursed',by:'Jones Mwalwanda',date:'2026-02-01'}]),
    createdAt: now, updatedAt: now
  });

  // Enterprise Loan - DRAFT - Chimwemwe Mwale
  loans.push({
    id: generateId(), applicationDate: '2026-06-09', clientId: clients[9].id,
    groupId: groups[2].id, clientName: 'Chimwemwe Mwale',
    productId: products[6].id, productCode: 'ENT', productName: 'Enterprise Loan',
    requestedAmount: 5000000, approvedAmount: null, proposedInterestRate: 3.0,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'declining',
    status: 'Draft', rejectionReason: null, collateral: [{ description: 'Fishing boat and equipment', marketValue: 8000000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'MICRO_ENTERPRISE',
    auditTrail: JSON.stringify([{action:'created',by:'Bertha Mwale',date:'2026-06-09'}]),
    createdAt: now, updatedAt: now
  });

  // SML - APPROVED - Patuma Salima
  var sml3Schedule = generateAmortization(1200000, 4.0, 'monthly', 'declining', '2026-06-15', 6);
  loans.push({
    id: generateId(), applicationDate: '2026-05-28', clientId: clients[13].id,
    groupId: groups[2].id, clientName: 'Patuma Salima',
    productId: products[2].id, productCode: 'SML', productName: '6-Month Loan (SML)',
    requestedAmount: 1200000, approvedAmount: 1200000, proposedInterestRate: 4.0,
    effectiveInterestRate: 58.3, totalCostOfCredit: 1480500, interestMethod: 'declining',
    status: 'Approved', rejectionReason: null, collateral: [{ description: 'Salon equipment', marketValue: 1800000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: sml3Schedule,
    compulsorySavingsAmount: 240000, effectiveInterestRateCalculated: 58.3,
    disclosureStatementGenerated: true, rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Steven Gondwe',date:'2026-05-28'},{action:'approved',by:'Agness Mhango',date:'2026-06-01'}]),
    createdAt: now, updatedAt: now
  });

  // Payday Loan - ACTIVE - Faithful Manda
  var pdl2Schedule = generateAmortization(250000, 7.5, 'monthly', 'flat', '2026-04-01', 1);
  loans.push({
    id: generateId(), applicationDate: '2026-03-28', clientId: clients[6].id,
    groupId: groups[0].id, clientName: 'Faithful Manda',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 250000, approvedAmount: 250000, proposedInterestRate: 7.5,
    effectiveInterestRate: 135.0, totalCostOfCredit: 276250, interestMethod: 'flat',
    status: 'Active', rejectionReason: null, collateral: [],
    disbursementDate: '2026-04-01', payoutMethod: 'mobile_money',
    amortizationSchedule: pdl2Schedule, compulsorySavingsAmount: 50000,
    effectiveInterestRateCalculated: 135.0, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Liness Nkhata',date:'2026-03-28'},{action:'approved',by:'Blessings Chirwa',date:'2026-03-28'},{action:'disbursed',by:'Liness Nkhata',date:'2026-04-01'}]),
    createdAt: now, updatedAt: now
  });

  // Special Scheme - DRAFT - Chimwemwe Jere
  loans.push({
    id: generateId(), applicationDate: '2026-06-07', clientId: clients[16].id,
    groupId: groups[1].id, clientName: 'Chimwemwe Jere',
    productId: products[3].id, productCode: 'SSC', productName: 'Special Scheme',
    requestedAmount: 3000000, approvedAmount: null, proposedInterestRate: 3.5,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'declining',
    status: 'Draft', rejectionReason: null, collateral: [{ description: 'Fishing nets and boat', marketValue: 4500000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Bertha Mwale',date:'2026-06-07'}]),
    createdAt: now, updatedAt: now
  });

  // Business Loan - SUBMITTED - Peter Mwale
  loans.push({
    id: generateId(), applicationDate: '2026-06-01', clientId: clients[3].id,
    groupId: groups[0].id, clientName: 'Peter Mwale',
    productId: products[5].id, productCode: 'BSL', productName: 'Business Loan',
    requestedAmount: 2000000, approvedAmount: null, proposedInterestRate: 3.8,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'declining',
    status: 'Pending', rejectionReason: null, collateral: [{ description: 'Maize produce', marketValue: 3000000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'SMALL_ENTERPRISE',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-06-01'}]),
    createdAt: now, updatedAt: now
  });

  // SML - ACTIVE - Mphatso Kalua
  var sml4Schedule = generateAmortization(600000, 4.0, 'monthly', 'declining', '2026-03-20', 6);
  loans.push({
    id: generateId(), applicationDate: '2026-03-10', clientId: clients[8].id,
    groupId: groups[0].id, clientName: 'Mphatso Kalua',
    productId: products[2].id, productCode: 'SML', productName: '6-Month Loan (SML)',
    requestedAmount: 600000, approvedAmount: 600000, proposedInterestRate: 4.0,
    effectiveInterestRate: 58.3, totalCostOfCredit: 730500, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Secondhand clothes stock', marketValue: 900000 }],
    disbursementDate: '2026-03-20', payoutMethod: 'cash',
    amortizationSchedule: sml4Schedule, compulsorySavingsAmount: 120000,
    effectiveInterestRateCalculated: 58.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Mercy Jere',date:'2026-03-10'},{action:'approved',by:'Blessings Chirwa',date:'2026-03-11'},{action:'disbursed',by:'Mercy Jere',date:'2026-03-20'}]),
    createdAt: now, updatedAt: now
  });

  // Enterprise Loan - ACTIVE - Fletcher Gondwe
  var entSchedule = generateAmortization(8000000, 3.0, 'monthly', 'declining', '2025-09-01', 18);
  loans.push({
    id: generateId(), applicationDate: '2025-08-15', clientId: clients[17].id,
    groupId: groups[1].id, clientName: 'Fletcher Gondwe',
    productId: products[6].id, productCode: 'ENT', productName: 'Enterprise Loan',
    requestedAmount: 8000000, approvedAmount: 8000000, proposedInterestRate: 3.0,
    effectiveInterestRate: 42.6, totalCostOfCredit: 10880000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Tea plantation (50 acres)', marketValue: 12000000 }],
    disbursementDate: '2025-09-01', payoutMethod: 'bank_transfer',
    amortizationSchedule: entSchedule, compulsorySavingsAmount: 1600000,
    effectiveInterestRateCalculated: 42.6, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MICRO_ENTERPRISE',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2025-08-15'},{action:'approved',by:'Esнart Tembo',date:'2025-08-20'},{action:'disbursed',by:'Jones Mwalwanda',date:'2025-09-01'}]),
    createdAt: now, updatedAt: now
  });

  // 3-Month Loan - ACTIVE - Peaceful Kachali
  var m32Schedule = generateAmortization(200000, 4.5, 'monthly', 'declining', '2026-04-01', 3);
  loans.push({
    id: generateId(), applicationDate: '2026-03-25', clientId: clients[11].id,
    groupId: groups[2].id, clientName: 'Peaceful Kachali',
    productId: products[1].id, productCode: '3ML', productName: '3-Month Loan',
    requestedAmount: 200000, approvedAmount: 200000, proposedInterestRate: 4.5,
    effectiveInterestRate: 65.3, totalCostOfCredit: 221300, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [],
    disbursementDate: '2026-04-01', payoutMethod: 'mobile_money',
    amortizationSchedule: m32Schedule, compulsorySavingsAmount: 40000,
    effectiveInterestRateCalculated: 65.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Mercy Jere',date:'2026-03-25'},{action:'approved',by:'Blessings Chirwa',date:'2026-03-25'},{action:'disbursed',by:'Mercy Jere',date:'2026-04-01'}]),
    createdAt: now, updatedAt: now
  });

  // Payday Loan - REJECTED - Tiyamike Kachali
  loans.push({
    id: generateId(), applicationDate: '2026-05-20', clientId: clients[19].id,
    groupId: groups[1].id, clientName: 'Tiyamike Kachali',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 100000, approvedAmount: null, proposedInterestRate: 7.5,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'flat',
    status: 'Rejected', rejectionReason: 'Insufficient income proof. Business too new.',
    collateral: [], disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Charles Mwase',date:'2026-05-20'},{action:'rejected',by:'Mary Chavula',date:'2026-06-01',reason:'Insufficient income proof'}]),
    createdAt: now, updatedAt: now
  });

  // Payday Loan - ACTIVE - Golden Moyo (second loan)
  var pdl4Schedule = generateAmortization(200000, 7.5, 'monthly', 'flat', '2026-05-01', 1);
  loans.push({
    id: generateId(), applicationDate: '2026-04-25', clientId: clients[10].id,
    groupId: groups[2].id, clientName: 'Golden Moyo',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 200000, approvedAmount: 200000, proposedInterestRate: 7.5,
    effectiveInterestRate: 135.0, totalCostOfCredit: 241000, interestMethod: 'flat',
    status: 'Active', rejectionReason: null, collateral: [],
    disbursementDate: '2026-05-01', payoutMethod: 'cash',
    amortizationSchedule: pdl4Schedule, compulsorySavingsAmount: 40000,
    effectiveInterestRateCalculated: 135.0, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Mercy Jere',date:'2026-04-25'},{action:'approved',by:'Blessings Chirwa',date:'2026-04-25'},{action:'disbursed',by:'Mercy Jere',date:'2026-05-01'}]),
    createdAt: now, updatedAt: now
  });

  // SML - DRAFT - John Nkhoma
  loans.push({
    id: generateId(), applicationDate: '2026-06-03', clientId: clients[5].id,
    groupId: groups[0].id, clientName: 'John Nkhoma',
    productId: products[2].id, productCode: 'SML', productName: '6-Month Loan (SML)',
    requestedAmount: 2000000, approvedAmount: null, proposedInterestRate: 4.0,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'declining',
    status: 'Draft', rejectionReason: null, collateral: [{ description: 'Transport vehicles', marketValue: 4000000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-06-03'}]),
    createdAt: now, updatedAt: now
  });

  // 3-Month Loan - ACTIVE - Patuma Salima
  var m33Schedule = generateAmortization(180000, 4.5, 'monthly', 'declining', '2026-05-01', 3);
  loans.push({
    id: generateId(), applicationDate: '2026-04-20', clientId: clients[13].id,
    groupId: groups[2].id, clientName: 'Patuma Salima',
    productId: products[1].id, productCode: '3ML', productName: '3-Month Loan',
    requestedAmount: 180000, approvedAmount: 180000, proposedInterestRate: 4.5,
    effectiveInterestRate: 65.3, totalCostOfCredit: 210100, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [],
    disbursementDate: '2026-05-01', payoutMethod: 'mobile_money',
    amortizationSchedule: m33Schedule, compulsorySavingsAmount: 36000,
    effectiveInterestRateCalculated: 65.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Steven Gondwe',date:'2026-04-20'},{action:'approved',by:'Agness Mhango',date:'2026-04-20'},{action:'disbursed',by:'Steven Gondwe',date:'2026-05-01'}]),
    createdAt: now, updatedAt: now
  });

  // Business Loan - ACTIVE - John Nkhoma
  var bsl2Schedule = generateAmortization(1500000, 3.8, 'monthly', 'declining', '2026-04-10', 12);
  loans.push({
    id: generateId(), applicationDate: '2026-03-20', clientId: clients[5].id,
    groupId: groups[0].id, clientName: 'John Nkhoma',
    productId: products[5].id, productCode: 'BSL', productName: 'Business Loan',
    requestedAmount: 1500000, approvedAmount: 1500000, proposedInterestRate: 3.8,
    effectiveInterestRate: 54.4, totalCostOfCredit: 2090000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Transport business (minibuses)', marketValue: 3000000 }],
    disbursementDate: '2026-04-10', payoutMethod: 'bank_transfer',
    amortizationSchedule: bsl2Schedule, compulsorySavingsAmount: 300000,
    effectiveInterestRateCalculated: 54.4, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SMALL_ENTERPRISE',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-03-20'},{action:'approved',by:'Esнart Tembo',date:'2026-03-25'},{action:'disbursed',by:'Jones Mwalwanda',date:'2026-04-10'}]),
    createdAt: now, updatedAt: now
  });

  // Executive Scheme - APPROVED - Agnes Kamanga
  var esc2Schedule = generateAmortization(8000000, 3.2, 'monthly', 'declining', '2026-07-01', 12);
  loans.push({
    id: generateId(), applicationDate: '2026-05-15', clientId: clients[4].id,
    groupId: groups[0].id, clientName: 'Agnes Kamanga',
    productId: products[4].id, productCode: 'ESC', productName: 'Executive Scheme',
    requestedAmount: 8000000, approvedAmount: 8000000, proposedInterestRate: 3.2,
    effectiveInterestRate: 44.1, totalCostOfCredit: 10880000, interestMethod: 'declining',
    status: 'Approved', rejectionReason: null, collateral: [{ description: 'Real estate investment', marketValue: 12000000 }],
    disbursementDate: null, payoutMethod: null, amortizationSchedule: esc2Schedule,
    compulsorySavingsAmount: 1600000, effectiveInterestRateCalculated: 44.1,
    disclosureStatementGenerated: true, rbmReportingCategory: 'LONG_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-05-15'},{action:'approved',by:'Esнart Tembo',date:'2026-05-20'}]),
    createdAt: now, updatedAt: now
  });

  // Special Scheme - ACTIVE - Tiyamike Kachali
  var ssc2Schedule = generateAmortization(4000000, 3.5, 'monthly', 'declining', '2026-01-10', 10);
  loans.push({
    id: generateId(), applicationDate: '2025-12-20', clientId: clients[19].id,
    groupId: null, clientName: 'Tiyamike Kachali',
    productId: products[3].id, productCode: 'SSC', productName: 'Special Scheme',
    requestedAmount: 4000000, approvedAmount: 4000000, proposedInterestRate: 3.5,
    effectiveInterestRate: 48.2, totalCostOfCredit: 5700000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Commercial building', marketValue: 6000000 }],
    disbursementDate: '2026-01-10', payoutMethod: 'bank_transfer',
    amortizationSchedule: ssc2Schedule, compulsorySavingsAmount: 800000,
    effectiveInterestRateCalculated: 48.2, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Bertha Mwale',date:'2025-12-20'},{action:'approved',by:'Geoffrey Ngwira',date:'2025-12-22'},{action:'disbursed',by:'Bertha Mwale',date:'2026-01-10'}]),
    createdAt: now, updatedAt: now
  });

  // SML - ACTIVE - Samuel Nkhoma
  var sml5Schedule = generateAmortization(900000, 4.0, 'monthly', 'declining', '2026-05-10', 6);
  loans.push({
    id: generateId(), applicationDate: '2026-04-30', clientId: clients[19].id,
    groupId: null, clientName: 'Samuel Nkhoma',
    productId: products[2].id, productCode: 'SML', productName: '6-Month Loan (SML)',
    requestedAmount: 900000, approvedAmount: 900000, proposedInterestRate: 4.0,
    effectiveInterestRate: 58.3, totalCostOfCredit: 1086000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'General merchandise stock', marketValue: 1500000 }],
    disbursementDate: '2026-05-10', payoutMethod: 'mobile_money',
    amortizationSchedule: sml5Schedule, compulsorySavingsAmount: 180000,
    effectiveInterestRateCalculated: 58.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MEDIUM_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Mercy Jere',date:'2026-04-30'},{action:'approved',by:'Blessings Chirwa',date:'2026-05-01'},{action:'disbursed',by:'Mercy Jere',date:'2026-05-10'}]),
    createdAt: now, updatedAt: now
  });

  // Payday Loan - ACTIVE - Norman Kapito
  var pdl5Schedule = generateAmortization(100000, 7.5, 'monthly', 'flat', '2026-06-01', 1);
  loans.push({
    id: generateId(), applicationDate: '2026-05-25', clientId: clients[14].id,
    groupId: groups[2].id, clientName: 'Norman Kapito',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 100000, approvedAmount: 100000, proposedInterestRate: 7.5,
    effectiveInterestRate: 135.0, totalCostOfCredit: 112000, interestMethod: 'flat',
    status: 'Active', rejectionReason: null, collateral: [],
    disbursementDate: '2026-06-01', payoutMethod: 'cash',
    amortizationSchedule: pdl5Schedule, compulsorySavingsAmount: 20000,
    effectiveInterestRateCalculated: 135.0, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Steven Gondwe',date:'2026-05-25'},{action:'approved',by:'Agness Mhango',date:'2026-05-25'},{action:'disbursed',by:'Steven Gondwe',date:'2026-06-01'}]),
    createdAt: now, updatedAt: now
  });

  // 3-Month Loan - ACTIVE - Peter Mwale
  var m34Schedule = generateAmortization(400000, 4.5, 'monthly', 'declining', '2026-03-01', 3);
  loans.push({
    id: generateId(), applicationDate: '2026-02-15', clientId: clients[3].id,
    groupId: groups[0].id, clientName: 'Peter Mwale',
    productId: products[1].id, productCode: '3ML', productName: '3-Month Loan',
    requestedAmount: 400000, approvedAmount: 400000, proposedInterestRate: 4.5,
    effectiveInterestRate: 65.3, totalCostOfCredit: 462400, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Rice stock', marketValue: 600000 }],
    disbursementDate: '2026-03-01', payoutMethod: 'mobile_money',
    amortizationSchedule: m34Schedule, compulsorySavingsAmount: 80000,
    effectiveInterestRateCalculated: 65.3, disclosureStatementGenerated: true,
    rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-02-15'},{action:'approved',by:'Esнart Tembo',date:'2026-02-16'},{action:'disbursed',by:'Jones Mwalwanda',date:'2026-03-01'}]),
    createdAt: now, updatedAt: now
  });

  // Payday Loan - REJECTED - Peter Mwale
  loans.push({
    id: generateId(), applicationDate: '2026-06-05', clientId: clients[3].id,
    groupId: null, clientName: 'Peter Mwale',
    productId: products[0].id, productCode: 'PDL', productName: 'Payday Loan',
    requestedAmount: 500000, approvedAmount: null, proposedInterestRate: 7.5,
    effectiveInterestRate: null, totalCostOfCredit: null, interestMethod: 'flat',
    status: 'Rejected', rejectionReason: 'Existing active loan balance too high.',
    collateral: [], disbursementDate: null, payoutMethod: null, amortizationSchedule: [],
    compulsorySavingsAmount: null, effectiveInterestRateCalculated: null,
    disclosureStatementGenerated: false, rbmReportingCategory: 'SHORT_TERM',
    auditTrail: JSON.stringify([{action:'created',by:'Jones Mwalwanda',date:'2026-06-05'},{action:'rejected',by:'Blessings Chirwa',date:'2026-06-06',reason:'Existing active loan balance too high'}]),
    createdAt: now, updatedAt: now
  });

  // Enterprise Loan - ACTIVE - Chimwemwe Jere
  var ent2Schedule = generateAmortization(6000000, 3.0, 'monthly', 'declining', '2026-01-01', 18);
  loans.push({
    id: generateId(), applicationDate: '2025-12-10', clientId: clients[16].id,
    groupId: groups[1].id, clientName: 'Chimwemwe Jere',
    productId: products[6].id, productCode: 'ENT', productName: 'Enterprise Loan',
    requestedAmount: 6000000, approvedAmount: 6000000, proposedInterestRate: 3.0,
    effectiveInterestRate: 42.6, totalCostOfCredit: 8128000, interestMethod: 'declining',
    status: 'Active', rejectionReason: null, collateral: [{ description: 'Fishing fleet (10 boats)', marketValue: 10000000 }],
    disbursementDate: '2026-01-01', payoutMethod: 'bank_transfer',
    amortizationSchedule: ent2Schedule, compulsorySavingsAmount: 1200000,
    effectiveInterestRateCalculated: 42.6, disclosureStatementGenerated: true,
    rbmReportingCategory: 'MICRO_ENTERPRISE',
    auditTrail: JSON.stringify([{action:'created',by:'Steven Gondwe',date:'2025-12-10'},{action:'approved',by:'Esнart Tembo',date:'2025-12-15'},{action:'disbursed',by:'Steven Gondwe',date:'2026-01-01'}]),
    createdAt: now, updatedAt: now
  });

  setCollection(StorageKeys.LOANS, loans);

  // ========================================
  // 7. SAVINGS PRODUCTS
  // ========================================
  var savingsProducts = [
    {
      id: generateId(), productCode: 'SAV-COMP', productName: 'Compulsory Savings', productType: 'COMPULSORY',
      interestRate: 2.0, interestCalculationMethod: 'DAILY_BALANCE', minimumBalance: 5000,
      minimumOpeningAmount: 0, withdrawalRestrictions: JSON.stringify(['Withdrawable only on loan closure']),
      maturityMonths: null, status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'SAV-REC', productName: 'Recurring Deposit', productType: 'RECURRING',
      interestRate: 4.0, interestCalculationMethod: 'DAILY_BALANCE', minimumBalance: 5000,
      minimumOpeningAmount: 1000, withdrawalRestrictions: JSON.stringify(['Monthly withdrawal', 'Minimum balance MWK 5,000']),
      maturityMonths: null, status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'SAV-FIX', productName: 'Fixed Deposit', productType: 'FIXED',
      interestRate: 6.0, interestCalculationMethod: 'DAILY_BALANCE', minimumBalance: 50000,
      minimumOpeningAmount: 50000, withdrawalRestrictions: JSON.stringify(['No withdrawal until maturity']),
      maturityMonths: 12, status: 'Active', createdAt: now, updatedAt: now
    },
    {
      id: generateId(), productCode: 'SAV-VOL', productName: 'Voluntary Savings', productType: 'VOLUNTARY',
      interestRate: 2.0, interestCalculationMethod: 'DAILY_BALANCE', minimumBalance: 500,
      minimumOpeningAmount: 500, withdrawalRestrictions: JSON.stringify(['Anytime, no restrictions']),
      maturityMonths: null, status: 'Active', createdAt: now, updatedAt: now
    }
  ];
  setCollection(StorageKeys.SAVINGS_PRODUCTS, savingsProducts);

  // ========================================
  // 8. SAVINGS ACCOUNTS
  // ========================================
  var savingsAccounts = [];
  var savingsBalances = [30000, 45000, 20000, 60000, 80000, 15000, 25000, 100000, 35000, 40000, 55000, 70000, 28000, 90000, 120000, 38000, 52000, 65000, 15000, 200000];
  for (var si = 0; si < clients.length; si++) {
    var accNum = 'SAV-' + String(si + 1).padStart(6, '0');
    savingsAccounts.push({
      id: generateId(),
      accountNumber: accNum,
      accountHolder: clients[si].fullName,
      clientId: clients[si].id,
      clientName: clients[si].fullName,
      productId: savingsProducts[1].id, // Recurring
      productCode: 'SAV-REC',
      branchId: clients[si].branchId,
      balance: savingsBalances[si],
      status: 'Active',
      openedDate: '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-01',
      lastInterestPosted: now,
      createdAt: now,
      updatedAt: now
    });
  }
  setCollection(StorageKeys.SAVINGS_ACCOUNTS, savingsAccounts);

  // ========================================
  // 9. DISBURSEMENT VOUCHERS
  // ========================================
  var vouchers = [
    { id: generateId(), voucherDate: '2026-05-15', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 150000, description: 'Loan disbursement - Grace Banda (Payday)', createdBy: 'Blessings Chirwa', branchId: branches[0].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-03-10', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 300000, description: 'Loan disbursement - Mary Chirwa (3ML)', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-01-15', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 1500000, description: 'Loan disbursement - Moses Kalimbuka (SML)', createdBy: 'Steven Gondwe', branchId: branches[0].id, createdAt: now },
    { id: generateId(), voucherDate: '2025-12-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 5000000, description: 'Loan disbursement - Golden Moyo (Special)', createdBy: 'Mercy Jere', branchId: branches[0].id, createdAt: now },
    { id: generateId(), voucherDate: '2025-10-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 10000000, description: 'Loan disbursement - Samuel Nkhoma (Executive)', createdBy: 'Liness Nkhata', branchId: branches[2].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-02-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 3000000, description: 'Loan disbursement - Hastings Nkhata (Business)', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-04-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 80000, description: 'Loan disbursement - Agnes Kamanga (PDL)', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-06-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 250000, description: 'Loan disbursement - Faithful Manda (Payday)', createdBy: 'Liness Nkhata', branchId: branches[2].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-03-20', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 600000, description: 'Loan disbursement - Mphatso Kalua (SML)', createdBy: 'Mercy Jere', branchId: branches[0].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-04-10', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 1500000, description: 'Loan disbursement - John Nkhoma (Business)', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-05-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 200000, description: 'Loan disbursement - Golden Moyo (Payday)', createdBy: 'Mercy Jere', branchId: branches[0].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-01-10', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 4000000, description: 'Loan disbursement - Tiyamike Kachali (Special)', createdBy: 'Bertha Mwale', branchId: branches[5].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-05-10', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 900000, description: 'Loan disbursement - Samuel Nkhoma (SML)', createdBy: 'Mercy Jere', branchId: branches[2].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-06-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 100000, description: 'Loan disbursement - Norman Kapito (Payday)', createdBy: 'Steven Gondwe', branchId: branches[1].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-03-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 400000, description: 'Loan disbursement - Peter Mwale (3ML)', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: now },
    { id: generateId(), voucherDate: '2025-09-01', voucherType: 'debit', sourceAccount: '1001-Cash', targetAccount: '4001-Loan Disbursement', amount: 8000000, description: 'Loan disbursement - Fletcher Gondwe (Enterprise)', createdBy: 'Jones Mwalwanda', branchId: branches[4].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-05-15', voucherType: 'credit', sourceAccount: '3001-Loan Repayment', targetAccount: '1001-Cash', amount: 161250, description: 'Collection - Grace Banda (PDL)', createdBy: 'Mercy Jere', branchId: branches[0].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-03-10', voucherType: 'credit', sourceAccount: '3001-Loan Repayment', targetAccount: '1001-Cash', amount: 106850, description: 'Collection - Mary Chirwa (3ML)', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-02-10', voucherType: 'credit', sourceAccount: '3002-Interest Income', targetAccount: '1001-Cash', amount: 25000, description: 'Interest income - Moses Kalimbuka (SML)', createdBy: 'Steven Gondwe', branchId: branches[0].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-06-01', voucherType: 'credit', sourceAccount: '1001-Cash', targetAccount: '5001-Operating Expenses', amount: 350000, description: 'Office rent', createdBy: 'John Kamanga', branchId: branches[2].id, createdAt: now },
    { id: generateId(), voucherDate: '2026-06-01', voucherType: 'credit', sourceAccount: '1001-Cash', targetAccount: '5002-Staff Salaries', amount: 420000, description: 'Monthly salaries', createdBy: 'John Kamanga', branchId: branches[2].id, createdAt: now },
    { id: generateId(), voucherDate: today, voucherType: 'credit', sourceAccount: '3001-Loan Repayment', targetAccount: '1001-Cash', amount: 250000, description: 'Collection - Samuel Nkhoma', createdBy: 'Liness Nkhata', branchId: branches[2].id, createdAt: now }
  ];
  setCollection(StorageKeys.VOUCHERS, vouchers);

  // ========================================
  // 10. CASH BALANCE
  // ========================================
  setValue(StorageKeys.CASH_BALANCE, 3500000);

  // ========================================
  // 11. COLLECTION RECORDS
  // ========================================
  var collections = [];
  var activeLoanClients = loans.filter(function(l) { return l.status === 'Active'; });
  for (var ci = 0; ci < 25; ci++) {
    var al = activeLoanClients[ci % activeLoanClients.length];
    var amt = Math.floor(al.approvedAmount * 0.05) + (ci * 5000);
    collections.push({
      id: generateId(), clientId: al.clientId, clientName: al.clientName, loanId: al.id,
      dueAmount: amt, collectedAmount: amt,
      paymentMode: ci % 3 === 0 ? 'cash' : (ci % 3 === 1 ? 'mobile_money' : 'bank_transfer'),
      penaltyApplied: ci > 20 ? 2000 : 0, transactionRef: generateTransactionRef(),
      collectedBy: users[4 + (ci % 3)].fullName,
      collectedAt: new Date(Date.now() - (ci * 86400000)).toISOString(),
      synced: ci < 18, branchId: al.branchId || branches[0].id,
      createdAt: now, updatedAt: now
    });
  }
  setCollection(StorageKeys.COLLECTIONS, collections);

  // ========================================
  // 12. FOLLOW-UP RECORDS
  // ========================================
  var followups = [
    { id: generateId(), clientId: loans[2].clientId, clientName: 'Peter Mwale', loanId: loans[2].id, daysPastDue: 45, accumulatedPenalty: 15000, contactOutcome: 'promised_to_pay', scheduledDate: today, actionSelected: 'phone_call', notes: 'Client promised to pay by end of week.', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: now },
    { id: generateId(), clientId: loans[2].clientId, clientName: 'Peter Mwale', loanId: loans[2].id, daysPastDue: 38, accumulatedPenalty: 12000, contactOutcome: 'no_answer', scheduledDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], actionSelected: 'phone_call', notes: 'No answer on both numbers.', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: generateId(), clientId: loans[2].clientId, clientName: 'Peter Mwale', loanId: loans[2].id, daysPastDue: 30, accumulatedPenalty: 9000, contactOutcome: 'promised_to_pay', scheduledDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], actionSelected: 'office_visit', notes: 'Client visited office, promised partial payment.', createdBy: 'Jones Mwalwanda', branchId: branches[3].id, createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: generateId(), clientId: loans[2].clientId, clientName: 'Peter Mwale', loanId: loans[2].id, daysPastDue: 62, accumulatedPenalty: 18000, contactOutcome: 'promised_to_pay', scheduledDate: today, actionSelected: 'home_visit', notes: 'Client promised partial payment within 3 days.', createdBy: 'Agness Mhango', branchId: branches[3].id, createdAt: now },
    { id: generateId(), clientId: loans[1].clientId, clientName: 'James Phiri', loanId: loans[1].id, daysPastDue: 15, accumulatedPenalty: 5000, contactOutcome: 'promised_to_pay', scheduledDate: today, actionSelected: 'phone_call', notes: 'Will pay next Tuesday.', createdBy: 'Liness Nkhata', branchId: branches[2].id, createdAt: now }
  ];
  setCollection(StorageKeys.FOLLOWUPS, followups);

  // ========================================
  // 13. SMS TEMPLATES
  // ========================================
  var smsTemplates = [
    { id: 'TMPL_DISBURSE', name: 'Loan Disbursed', triggerEvent: 'loan_disbursed', template: 'Saile Financial Services: Your [PRODUCT] of MWK [AMOUNT] has been disbursed. First payment of MWK [PAYMENT] due on [DATE]. Account: [ACCOUNT]', status: 'Active', createdAt: now, updatedAt: now },
    { id: 'TMPL_DUE_REMIND', name: 'Payment Due Reminder (3 days)', triggerEvent: 'payment_due_3days', template: 'Reminder: Your loan payment of MWK [AMOUNT] is due on [DATE]. Please pay at any Saile branch or via Airtel Money/TNM Mpamba.', status: 'Active', createdAt: now, updatedAt: now },
    { id: 'TMPL_PAYMENT_RCVD', name: 'Payment Received', triggerEvent: 'payment_received', template: 'Thank you! Payment of MWK [AMOUNT] received. Outstanding balance: MWK [BALANCE]. Next due: [DATE].', status: 'Active', createdAt: now, updatedAt: now },
    { id: 'TMPL_OVERDUE', name: 'Payment Overdue', triggerEvent: 'payment_overdue', template: 'URGENT: Your loan payment of MWK [AMOUNT] was due yesterday. Please pay immediately to avoid penalties.', status: 'Active', createdAt: now, updatedAt: now },
    { id: 'TMPL_PAR_ALERT', name: 'PAR Alert to Branch Manager', triggerEvent: 'par_threshold', template: 'ALERT: Branch [BRANCH] PAR 30 is now [PERCENT]%. Loans: [COUNT]. Please review immediately.', status: 'Active', createdAt: now, updatedAt: now },
    { id: 'TMPL_MONTHLY_SUMMARY', name: 'Monthly Portfolio Summary (MD)', triggerEvent: 'monthly_summary', template: 'Saile Monthly Summary: Portfolio MWK [PORTFOLIO], Clients [CLIENTS], Disbursements MWK [DISBURSED], Collections MWK [COLLECTED], PAR 30: [PAR30]%', status: 'Active', createdAt: now, updatedAt: now }
  ];
  setCollection(StorageKeys.SMS_TEMPLATES, smsTemplates);

  // ========================================
  // 14. SMS LOGS
  // ========================================
  var smsLogs = [
    { id: generateId(), recipientPhone: '+265991234567', recipientName: 'Grace Banda', templateCode: 'TMPL_DISBURSE', messageContent: 'Saile Financial Services: Your Payday Loan of MWK 150,000 has been disbursed. First payment of MWK 161,250 due on 2026-06-15. Account: ACC-001', triggerEvent: 'loan_disbursed', status: 'Delivered', sentAt: '2026-05-15T10:30:00.000Z', deliveredAt: '2026-05-15T10:30:15.000Z', error: null, branchId: branches[0].id, createdAt: now },
    { id: generateId(), recipientPhone: '+265993456789', recipientName: 'Mary Chirwa', templateCode: 'TMPL_DUE_REMIND', messageContent: 'Reminder: Your loan payment of MWK 106,850 is due on 2026-06-10. Please pay at any Saile branch or via Airtel Money/TNM Mpamba.', triggerEvent: 'payment_due_3days', status: 'Delivered', sentAt: '2026-06-07T09:00:00.000Z', deliveredAt: '2026-06-07T09:00:12.000Z', error: null, branchId: branches[3].id, createdAt: now }
  ];
  setCollection(StorageKeys.SMS_LOGS, smsLogs);

  // ========================================
  // 15. PAR SNAPSHOTS
  // ========================================
  var totalPortfolio = 0, totalProvision = 0;
  loans.forEach(function(l) {
    if (l.status === 'Active' && l.approvedAmount) { totalPortfolio += l.approvedAmount; }
  });

  var parSnapshots = [
    { id: generateId(), snapshotDate: '2026-06-09', branchId: branches[0].id, branchName: 'Mzuzu Employees', branchCode: 'MZE', totalLoans: 8, totalPortfolio: 8500000, par1_30_count: 0, par1_30_amount: 0, par31_60_count: 0, par31_60_amount: 0, par61_90_count: 0, par61_90_amount: 0, par90plus_count: 0, par90plus_amount: 0, totalProvision: 0, grossPortfolio: 8500000, netPortfolio: 8500000, createdAt: now },
    { id: generateId(), snapshotDate: '2026-06-09', branchId: branches[1].id, branchName: 'Mzuzu Business', branchCode: 'MZB', totalLoans: 4, totalPortfolio: 5700000, par1_30_count: 0, par1_30_amount: 0, par31_60_count: 0, par31_60_amount: 0, par61_90_count: 0, par61_90_amount: 0, par90plus_count: 0, par90plus_amount: 0, totalProvision: 0, grossPortfolio: 5700000, netPortfolio: 5700000, createdAt: now },
    { id: generateId(), snapshotDate: '2026-06-09', branchId: branches[2].id, branchName: 'Lilongwe Branch', branchCode: 'LLW', totalLoans: 8, totalPortfolio: 22300000, par1_30_count: 1, par1_30_amount: 200000, par31_60_count: 0, par31_60_amount: 0, par61_90_count: 0, par61_90_amount: 0, par90plus_count: 0, par90plus_amount: 0, totalProvision: 10000, grossPortfolio: 22500000, netPortfolio: 22300000, createdAt: now },
    { id: generateId(), snapshotDate: '2026-06-09', branchId: branches[3].id, branchName: 'Blantyre Branch', branchCode: 'BLN', totalLoans: 8, totalPortfolio: 16706350, par1_30_count: 2, par1_30_amount: 450000, par31_60_count: 1, par31_60_amount: 120000, par61_90_count: 0, par61_90_amount: 0, par90plus_count: 0, par90plus_amount: 0, totalProvision: 55000, grossPortfolio: 17206350, netPortfolio: 16706350, createdAt: now },
    { id: generateId(), snapshotDate: '2026-06-09', branchId: branches[4].id, branchName: 'Karonga Branch', branchCode: 'KRG', totalLoans: 3, totalPortfolio: 14000000, par1_30_count: 0, par1_30_amount: 0, par31_60_count: 0, par31_60_amount: 0, par61_90_count: 0, par61_90_amount: 0, par90plus_count: 0, par90plus_amount: 0, totalProvision: 0, grossPortfolio: 14000000, netPortfolio: 14000000, createdAt: now },
    { id: generateId(), snapshotDate: '2026-06-09', branchId: branches[5].id, branchName: 'Zomba Branch', branchCode: 'ZBA', totalLoans: 4, totalPortfolio: 8300000, par1_30_count: 0, par1_30_amount: 0, par31_60_count: 1, par31_60_amount: 100000, par61_90_count: 0, par61_90_amount: 0, par90plus_count: 0, par90plus_amount: 0, totalProvision: 20000, grossPortfolio: 8400000, netPortfolio: 8300000, createdAt: now }
  ];
  setCollection(StorageKeys.PAR_SNAPSHOTS, parSnapshots);

  // ========================================
  // 16. SETTINGS
  // ========================================
  setValue(StorageKeys.SETTINGS, {
    language: 'en',
    currency: 'MWK',
    currencySymbol: 'MWK',
    sessionTimeoutMinutes: 15,
    demoMode: true,
    institutionName: 'Saile Financial Services Limited',
    institutionLicense: 'NDMFI 017/22',
    rbmReportingEnabled: true,
    smsGatewayEnabled: false
  });

  // ========================================
  // 17. AUDIT LOG
  // ========================================
  var auditLog = [];
  var userActions = [
    { user: users[0].fullName, role: 'md', action: 'login', module: 'system' },
    { user: users[1].fullName, role: 'finance_manager', action: 'login', module: 'system' },
    { user: users[2].fullName, role: 'admin', action: 'login', module: 'system' },
    { user: users[4].fullName, role: 'branch_manager', action: 'login', module: 'branches' },
    { user: users[7].fullName, role: 'loan_officer', action: 'login', module: 'loans' }
  ];
  for (var ai = 0; ai < 15; ai++) {
    auditLog.push({
      id: generateId(),
      timestamp: new Date(Date.now() - (ai * 3600000)).toISOString(),
      user: userActions[ai % userActions.length].user,
      role: userActions[ai % userActions.length].role,
      action: ai < 5 ? 'login' : (ai < 10 ? 'create_loan' : 'generate_report'),
      module: ai < 5 ? 'system' : (ai < 10 ? 'loans' : 'reports'),
      entityId: null,
      changedFrom: null,
      changedTo: ai < 5 ? { event: 'login', branchId: branches[ai % 6].id } : { event: 'data_modified' },
      ipAddress: '192.168.1.' + (ai + 1),
      createdAt: now
    });
  }
  setCollection(StorageKeys.AUDIT_LOG, auditLog);

  // ========================================
  // 18. SYNC QUEUE
  // ========================================
  setCollection(StorageKeys.SYNC_QUEUE, []);
}

// ==============================
// EXPOSURE
// ==============================
window.ROUTES = ROUTES;
window.handleRoute = handleRoute;
window.renderLogin = renderLogin;
window.initApp = initApp;
window.initRouter = initRouter;
window.initOfflineManager = initOfflineManager;
window.updateOfflineState = updateOfflineState;
window.showAccessDeniedModal = showAccessDeniedModal;
window.renderEmptyState = renderEmptyState;
window.showAppToast = showAppToast;
window.showToast = window.showToast || showAppToast;
window.updateActiveNavLink = updateActiveNavLink;
window.seedData = seedData;

// --- Bootstrap ---
document.addEventListener('DOMContentLoaded', function() {
  initApp();

  var extendBtn = document.getElementById('timeout-extend');
  var logoutBtn = document.getElementById('timeout-logout');
  if (extendBtn) {
    extendBtn.addEventListener('click', function() {
      document.getElementById('timeout-modal').classList.add('hidden');
      resetSessionTimer();
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      document.getElementById('timeout-modal').classList.add('hidden');
      destroySession();
    });
  }
});