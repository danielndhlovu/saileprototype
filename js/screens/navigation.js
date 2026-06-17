// ============================================================================
// Saile Platform v2 — Navigation Shell
// ============================================================================

var navClockInterval = null;

// SVG icon map for navigation items
var NAV_ICONS = {
  home: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
  users: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  people: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3-2.803a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
  document: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  calendar: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
  money: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  phone: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
  calculator: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
  chart: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  'user-plus': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>',
  gear: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  clipboard: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
  refresh: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>',
  savings: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
  report: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17h6m0 0V9m0 8a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"/></svg>',
  sync: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>',
  migration: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'
};

/**
 * Render the full navigation shell (top bar, left rail, right panel, mobile tabs).
 * @param {string} role - Current user role
 */
function renderNavigation(role) {
  var session = getSession();
  var navItems = getNavigationItems(role);
  var isCollapsed = getValue(StorageKeys.NAV_COLLAPSED) || false;
  var settings = getValue(StorageKeys.SETTINGS);
  var branchName = (settings && settings.branchName) || 'Lilongwe';

  renderTopBar(session, branchName);
  renderLeftRail(navItems, role, isCollapsed);
  renderRightPanel(session);
  renderMobileTabs(navItems);
  startClock();
}

/**
 * Render the top utility bar.
 */
function renderTopBar(session, branchName) {
  var topBar = document.getElementById('top-bar');
  if (!topBar) return;

  var today = new Date();
  var dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  topBar.innerHTML = '' +
    '<!-- Left: Logo + action buttons -->' +
    '<div class="flex items-center gap-2">' +
      '<div class="w-9 h-9 rounded-lg bg-[#f4f4f5] border border-[#d1d5db] flex items-center justify-center">' +
        '<svg class="w-5 h-5 text-[#0f766e]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.5 3.64v7.36L12 18.82l-6.5-3.64V7.82L12 4.18z"/></svg>' +
      '</div>' +
      '<button id="topbar-search-btn" class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#d1d5db] transition-colors hidden md:flex items-center gap-1.5">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>' +
        '<span>Search</span>' +
      '</button>' +
      '<button class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-[#6b7280] hover:bg-[#d1d5db] transition-colors hidden md:block">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>' +
      '</button>' +
      '<button class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-[#6b7280] hover:bg-[#d1d5db] transition-colors relative hidden md:block">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>' +
        '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#d94f4f] rounded-full border-2 border-white"></span>' +
      '</button>' +
      '<button class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-[#6b7280] hover:bg-[#d1d5db] transition-colors hidden md:block">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>' +
      '</button>' +
    '</div>' +
    '<!-- Mobile menu toggle -->' +
    '<button id="nav-collapse-btn" class="p-2 rounded-lg hover:bg-[#f4f4f5] transition-colors lg:hidden" aria-label="Toggle navigation">' +
      '<svg class="w-5 h-5 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>' +
    '</button>' +
    '<div class="flex-1"></div>' +
    '<!-- Right: Language, date, clock, create -->' +
    '<div class="hidden md:flex items-center gap-3">' +
      '<button class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#d1d5db] transition-colors">En &#9662;</button>' +
      '<span id="nav-clock" class="text-xs text-[#6b7280] font-mono">--:--</span>' +
      '<span class="text-xs text-[#6b7280]">' + escapeHtml(dateStr) + '</span>' +
      '<button id="topbar-create-btn" class="bg-[#111827] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1">' +
        'Create <span class="ml-1">&rarr;</span>' +
      '</button>' +
    '</div>' +
    '<!-- Mobile: profile + logout -->' +
    '<div class="flex md:hidden items-center gap-2">' +
      '<div class="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center text-white text-xs font-medium">' +
        (session ? escapeHtml(session.name.charAt(0).toUpperCase()) : '?') +
      '</div>' +
      '<button id="logout-btn-mobile" class="p-2 rounded-lg hover:bg-[#f4f4f5] transition-colors" title="Logout">' +
        '<svg class="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>' +
      '</button>' +
    '</div>';

  // Logout button (mobile)
  var logoutBtnMobile = document.getElementById('logout-btn-mobile');
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', function() { destroySession(); });
  }

  // Create button action
  var createBtn = document.getElementById('topbar-create-btn');
  if (createBtn) {
    createBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showCreateDropdown(this);
    });
  }

  // Search button
  var searchBtn = document.getElementById('topbar-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      showSearchOverlay();
    });
  }
}

/**
 * Show a dropdown for quick create actions.
 */
function showCreateDropdown(anchor) {
  const existing = document.getElementById('create-dropdown');
  if (existing) {
    existing.remove();
    return;
  }

  const dropdown = document.createElement('div');
  dropdown.id = 'create-dropdown';
  dropdown.className = 'fixed mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#d1d5db] z-[60] overflow-hidden py-1';

  const rect = anchor.getBoundingClientRect();
  dropdown.style.top = rect.bottom + 'px';
  dropdown.style.left = (rect.right - 192) + 'px';

  const actions = [
    { label: 'New Client', route: '#/clients' },
    { label: 'New Loan', route: '#/loans' },
    { label: 'Record Collection', route: '#/collections' },
    { label: 'Open Savings', route: '#/savings' }
  ];

  actions.forEach(action => {
    const item = document.createElement('button');
    item.className = 'w-full text-left px-4 py-2 text-sm text-[#0f766e] hover:bg-[#f4f4f5] transition-colors';
    item.textContent = action.label;
    item.onclick = () => {
      window.location.hash = action.route;
      dropdown.remove();
    };
    dropdown.appendChild(item);
  });

  document.body.appendChild(dropdown);

  const closeDropdown = (e) => {
    if (!dropdown.contains(e.target) && e.target !== anchor) {
      dropdown.remove();
      document.removeEventListener('click', closeDropdown);
    }
  };
  setTimeout(() => document.addEventListener('click', closeDropdown), 0);
}

/**
 * Show a global search overlay.
 */
function showSearchOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-[10000] flex items-start justify-center pt-20 px-4';
  overlay.innerHTML = `
    <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
      <div class="p-4 border-b border-[#d1d5db] flex items-center gap-3">
        <svg class="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" id="global-search-input" class="flex-1 outline-none text-lg text-[#0f766e]" placeholder="Search clients, loans, accounts..." autofocus>
        <kbd class="text-xs text-[#6b7280] bg-[#f4f4f5] px-1.5 py-0.5 rounded border border-[#d1d5db]">ESC</kbd>
      </div>
      <div id="search-results" class="max-h-[60vh] overflow-y-auto p-2">
        <p class="text-center py-8 text-[#6b7280] text-sm">Start typing to search across Saile platform...</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const input = overlay.querySelector('#global-search-input');
  const results = overlay.querySelector('#search-results');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', handleEsc);
  };

  const handleEsc = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', handleEsc);
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  input.addEventListener('input', debounce(() => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '<p class="text-center py-8 text-[#6b7280] text-sm">Start typing to search...</p>';
      return;
    }

    const clients = getCollection(StorageKeys.CLIENTS).filter(c => c.fullName.toLowerCase().includes(q) || c.nationalId.toLowerCase().includes(q));
    const loans = getCollection(StorageKeys.LOANS).filter(l => l.clientName.toLowerCase().includes(q) || (l.productCode && l.productCode.toLowerCase().includes(q)));

    let html = '';
    if (clients.length) {
      html += '<h4 class="text-xs font-bold text-[#6b7280] uppercase px-3 py-2">Clients</h4>';
      clients.forEach(c => {
        html += `<button class="w-full text-left p-3 rounded-xl hover:bg-[#f4f4f5] group transition-colors" onclick="window.location.hash='#/clients'; document.querySelector('.fixed.inset-0').remove()">
          <p class="font-medium text-[#0f766e]">${escapeHtml(c.fullName)}</p>
          <p class="text-xs text-[#6b7280]">${escapeHtml(c.nationalId)}</p>
        </button>`;
      });
    }
    if (loans.length) {
      html += '<h4 class="text-xs font-bold text-[#6b7280] uppercase px-3 py-2 mt-2">Loans</h4>';
      loans.forEach(l => {
        html += `<button class="w-full text-left p-3 rounded-xl hover:bg-[#f4f4f5] group transition-colors" onclick="window.location.hash='#/loans'; document.querySelector('.fixed.inset-0').remove()">
          <p class="font-medium text-[#0f766e]">${escapeHtml(l.clientName)}</p>
          <p class="text-xs text-[#6b7280]">${escapeHtml(l.productName)} — ${formatCurrency(l.requestedAmount)}</p>
        </button>`;
      });
    }

    if (!html) {
      html = '<p class="text-center py-8 text-[#6b7280] text-sm">No results found for "' + escapeHtml(q) + '"</p>';
    }
    results.innerHTML = html;
  }, 300));
}

/**
 * Render the left-rail navigation.
 */
function renderLeftRail(navItems, role, isCollapsed) {
  var leftRail = document.getElementById('left-rail');
  if (!leftRail) return;

  var session = getSession();
  var currentHash = window.location.hash || '';
  var width = isCollapsed ? 'w-16' : 'w-56';
  leftRail.className = 'hidden lg:block fixed top-14 left-0 bottom-0 ' + width + ' bg-white border-r border-[#d1d5db] z-40 overflow-y-auto sidebar-transition';

  var html = '<div class="flex flex-col h-full">';

  // Brand
  html += '<div class="px-5 py-4 border-b border-[#d1d5db]">';
  if (!isCollapsed) {
    html += '<span class="text-xl font-bold text-[#0f766e]">Saile</span>';
  } else {
    html += '<span class="text-xl font-bold text-[#0f766e]">S</span>';
  }
  html += '</div>';

  // Nav items
  html += '<div class="flex-1 px-3 py-3 space-y-1">';

  for (var i = 0; i < navItems.length; i++) {
    var item = navItems[i];
    var isActive = currentHash === item.route;
    var activeClass = isActive ? 'bg-[#111827] text-white' : 'text-[#6b7280] hover:bg-[#f4f4f5]';
    var iconHtml = NAV_ICONS[item.icon] || '';

    html += '<a href="' + item.route + '" data-nav-route="' + item.route + '" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ' + activeClass + '">';
    html += '<span class="flex-shrink-0">' + iconHtml + '</span>';
    if (!isCollapsed) {
      html += '<span>' + escapeHtml(item.label) + '</span>';
    }
    html += '</a>';
  }

  html += '</div>';

  // User profile at bottom
  html += '<div class="px-3 py-3 border-t border-[#d1d5db]">';
  if (!isCollapsed && session) {
    html += '<div class="flex items-center gap-3 px-2 py-2">';
    html += '<div class="w-9 h-9 rounded-full bg-[#111827] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">' +
      escapeHtml(session.name.charAt(0).toUpperCase()) + '</div>';
    html += '<div class="flex-1 min-w-0">';
    html += '<p class="text-sm font-medium text-[#0f766e] truncate">' + escapeHtml(session.name) + '</p>';
    html += '<p class="text-xs text-[#6b7280] truncate">' + escapeHtml(session.email || '') + '</p>';
    html += '</div>';
    html += '<button id="logout-btn" class="p-1.5 rounded-lg hover:bg-[#f4f4f5] transition-colors flex-shrink-0" title="Logout">' +
      '<svg class="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>' +
    '</button>';
    html += '</div>';

    // Role switcher
    html += '<div class="mt-2">';
    html += '<select id="role-switcher" class="w-full text-xs border border-[#d1d5db] rounded-xl px-3 py-1.5 bg-[#f4f4f5] text-[#0f766e]">';
    var roles = ['admin', 'md', 'finance_manager', 'branch_manager', 'loan_officer', 'field_officer', 'accountant', 'auditor'];
    for (var r = 0; r < roles.length; r++) {
      var sel = roles[r] === role ? ' selected' : '';
      html += '<option value="' + roles[r] + '"' + sel + '>' + roles[r].replace(/_/g, ' ') + '</option>';
    }
    html += '</select>';
    html += '</div>';
  } else if (isCollapsed && session) {
    html += '<div class="flex justify-center">';
    html += '<div class="w-9 h-9 rounded-full bg-[#111827] flex items-center justify-center text-white text-sm font-medium">' +
      escapeHtml(session.name.charAt(0).toUpperCase()) + '</div>';
    html += '</div>';
  }
  html += '</div>';

  html += '</div>';

  leftRail.innerHTML = html;

  // Logout button event
  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() { destroySession(); });
  }

  // Role switcher event
  var switcher = document.getElementById('role-switcher');
  if (switcher) {
    switcher.addEventListener('change', function() {
      var newRole = this.value;
      switchRole(newRole);
      logAudit('role_switch', { module: 'auth', changedTo: newRole });
      window.location.hash = getDefaultRoute(newRole);
      location.reload();
    });
  }

  // Update main content margin
  var appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.className = isCollapsed
      ? 'pt-20 lg:ml-16 xl:mr-72 min-h-screen px-5 pb-6 lg:px-6 lg:pb-8'
      : 'pt-20 lg:ml-56 xl:mr-72 min-h-screen px-5 pb-6 lg:px-6 lg:pb-8';
  }
}

/**
 * Render the right panel with notifications and info cards.
 */
function renderRightPanel(session) {
  var rightPanel = document.getElementById('right-panel');
  if (!rightPanel) return;

  var auditLog = getCollection(StorageKeys.AUDIT_LOG);
  var recentLogs = auditLog.slice(0, 5);

  var html = '';

  // Notifications card (collapsible)
  html += '<div id="notif-card" class="bg-white rounded-2xl border border-[#d1d5db] p-4 mb-4">';
  html += '<div class="flex items-center justify-between mb-3">';
  html += '<h3 class="text-sm font-semibold text-[#0f766e]">Notifications</h3>';
  html += '<button id="btn-hide-notif" class="p-1 rounded-lg hover:bg-[#f4f4f5] transition-colors text-[#6b7280]" title="Hide notifications">';
  html += '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  html += '</button>';
  html += '</div>';
  html += '<div id="notif-content" class="space-y-2">';

  if (recentLogs.length === 0) {
    html += '<p class="text-xs text-[#6b7280]">No recent notifications.</p>';
  } else {
    for (var i = 0; i < recentLogs.length; i++) {
      var log = recentLogs[i];
      var actionLabel = (log.action || 'unknown').replace(/_/g, ' ');
      html += '<div class="bg-[#f4f4f5] rounded-xl p-3">';
      html += '<div class="flex items-start gap-2">';
      html += '<div class="w-6 h-6 rounded-full bg-[#111827]/10 flex items-center justify-center flex-shrink-0 mt-0.5">';
      html += '<svg class="w-3 h-3 text-[#0f766e]" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>';
      html += '</div>';
      html += '<div class="flex-1 min-w-0">';
      html += '<p class="text-xs font-medium text-[#0f766e] capitalize truncate">' + escapeHtml(actionLabel) + '</p>';
      html += '<p class="text-xs text-[#6b7280]">' + escapeHtml(log.user || '') + '</p>';
      html += '</div></div></div>';
    }
  }

  html += '</div>';
  html += '<button class="w-full mt-3 bg-[#111827] text-white rounded-xl px-4 py-2 text-xs font-medium hover:bg-gray-800 transition-colors">See all notifications &rarr;</button>';
  html += '</div>';

  // Quick Info card (collapsible)
  html += '<div id="info-card" class="bg-white rounded-2xl border border-[#d1d5db] p-4 mb-4">';
  html += '<div class="flex items-center justify-between mb-3">';
  html += '<h3 class="text-sm font-semibold text-[#0f766e]">Quick Info</h3>';
  html += '<button id="btn-hide-info" class="p-1 rounded-lg hover:bg-[#f4f4f5] transition-colors text-[#6b7280]" title="Hide quick info">';
  html += '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  html += '</button>';
  html += '</div>';
  html += '<div id="info-content" class="space-y-2">';
  html += '<div class="bg-[#f4f4f5] rounded-xl p-3">';
  html += '<p class="text-xs font-medium text-[#0f766e]">Logged in as</p>';
  html += '<p class="text-xs text-[#6b7280]">' + (session ? escapeHtml(session.name) + ' (' + escapeHtml(session.role.replace(/_/g, ' ')) + ')' : 'Unknown') + '</p>';
  html += '</div>';
  html += '<div class="bg-[#f4f4f5] rounded-xl p-3">';
  html += '<p class="text-xs font-medium text-[#0f766e]">Sync Status</p>';
  html += '<p class="text-xs text-[#0f766e]">&bull; Online</p>';
  html += '</div>';
  html += '</div>';
  html += '<button class="w-full mt-3 bg-[#f4f4f5] border border-[#d1d5db] text-[#0f766e] rounded-xl px-4 py-2 text-xs font-medium hover:bg-[#d1d5db] transition-colors">Notes</button>';
  html += '</div>';

  // Show buttons (visible when cards are hidden)
  html += '<div id="panel-show-btns" class="hidden space-y-2">';
  html += '<button id="btn-show-notif" class="w-full bg-white border border-[#d1d5db] rounded-xl px-4 py-2.5 text-xs font-medium text-[#0f766e] hover:bg-[#f4f4f5] transition-colors flex items-center gap-2">';
  html += '<svg class="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>';
  html += 'Show Notifications</button>';
  html += '<button id="btn-show-info" class="w-full bg-white border border-[#d1d5db] rounded-xl px-4 py-2.5 text-xs font-medium text-[#0f766e] hover:bg-[#f4f4f5] transition-colors flex items-center gap-2">';
  html += '<svg class="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  html += 'Show Quick Info</button>';
  html += '</div>';

  rightPanel.innerHTML = html;

  // Attach hide/show events
  var hideNotifBtn = document.getElementById('btn-hide-notif');
  var hideInfoBtn = document.getElementById('btn-hide-info');
  var showNotifBtn = document.getElementById('btn-show-notif');
  var showInfoBtn = document.getElementById('btn-show-info');
  var notifCard = document.getElementById('notif-card');
  var infoCard = document.getElementById('info-card');
  var showBtns = document.getElementById('panel-show-btns');

  if (hideNotifBtn) {
    hideNotifBtn.addEventListener('click', function() {
      notifCard.classList.add('hidden');
      showBtns.classList.remove('hidden');
      showNotifBtn.classList.remove('hidden');
    });
  }
  if (hideInfoBtn) {
    hideInfoBtn.addEventListener('click', function() {
      infoCard.classList.add('hidden');
      showBtns.classList.remove('hidden');
      showInfoBtn.classList.remove('hidden');
    });
  }
  if (showNotifBtn) {
    showNotifBtn.addEventListener('click', function() {
      notifCard.classList.remove('hidden');
      showNotifBtn.classList.add('hidden');
      if (infoCard && !infoCard.classList.contains('hidden')) {
        showBtns.classList.add('hidden');
      }
    });
  }
  if (showInfoBtn) {
    showInfoBtn.addEventListener('click', function() {
      infoCard.classList.remove('hidden');
      showInfoBtn.classList.add('hidden');
      if (notifCard && !notifCard.classList.contains('hidden')) {
        showBtns.classList.add('hidden');
      }
    });
  }
}

/**
 * Render mobile bottom tabs.
 */
function renderMobileTabs(navItems) {
  var mobileTabs = document.getElementById('mobile-tabs');
  if (!mobileTabs) return;

  var currentHash = window.location.hash || '';
  var mobileItems = navItems.slice(0, 4);

  var html = '';
  for (var i = 0; i < mobileItems.length; i++) {
    var item = mobileItems[i];
    var isActive = currentHash === item.route;
    var activeClass = isActive ? 'text-[#0f766e]' : 'text-[#6b7280]';
    var iconHtml = NAV_ICONS[item.icon] || '';

    html += '<a href="' + item.route + '" class="flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] ' + activeClass + '">';
    html += iconHtml;
    html += '<span class="text-[10px] font-medium">' + escapeHtml(item.label) + '</span>';
    html += '</a>';
  }

  mobileTabs.innerHTML = html;
}

/**
 * Toggle navigation collapse state.
 */
function toggleNavCollapse() {
  var current = getValue(StorageKeys.NAV_COLLAPSED) || false;
  var newState = !current;
  setValue(StorageKeys.NAV_COLLAPSED, newState);

  var session = getSession();
  if (session) {
    var navItems = getNavigationItems(session.role);
    renderLeftRail(navItems, session.role, newState);
  }
}

/**
 * Start the clock in the top bar.
 */
function startClock() {
  if (navClockInterval) clearInterval(navClockInterval);

  function updateClock() {
    var el = document.getElementById('nav-clock');
    if (el) {
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      el.textContent = h + ':' + m;
    }
  }

  updateClock();
  navClockInterval = setInterval(updateClock, 1000);
}

// Expose on window
/**
 * Global navigation function to change application state via hash.
 * Used by onclick attributes in dashboard and other screens.
 * @param {string} hash - The destination hash (e.g. "#/loans")
 */
function navigateTo(hash) {
  window.location.hash = hash;
}

window.navigateTo = navigateTo;
window.renderNavigation = renderNavigation;
window.NAV_ICONS = NAV_ICONS;
