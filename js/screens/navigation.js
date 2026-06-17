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
  renderBreadcrumb();
  // renderLeftRail(navItems, role, isCollapsed); // Removed as per requirement
  // renderRightPanel(session); // Removed as per requirement
  renderMobileTabs(navItems);
  startClock();
}

/**
 * Render the breadcrumb based on current route.
 */
function renderBreadcrumb() {
  const container = document.getElementById('breadcrumb-container');
  if (!container) return;

  const hash = window.location.hash || '#/dashboard';
  const path = hash.replace('#/', '').split('?')[0];
  const parts = path === '' ? ['dashboard'] : path.split('/');

  let html = '<nav class="flex items-center text-[11px] font-medium text-[#6b7280] bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100" aria-label="Breadcrumb"><ol class="flex items-center space-x-2">';
  html += '<li><a href="#/dashboard" class="hover:text-[#0f766e] flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg></a></li>';

  let cumulative = '#';
  parts.forEach((part, index) => {
    cumulative += '/' + part;
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    html += '<li class="flex items-center space-x-2"><svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>';
    if (index === parts.length - 1) {
      html += '<span class="text-[#111827] font-semibold">' + escapeHtml(label) + '</span>';
    } else {
      html += '<a href="' + cumulative + '" class="hover:text-[#0f766e] transition-colors">' + escapeHtml(label) + '</a>';
    }
    html += '</li>';
  });

  html += '</ol></nav>';
  container.innerHTML = html;
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
    '<!-- Left Side Icons and Navigation -->' +
    '<div class="flex items-center gap-2">' +
      '<!-- Logo -->' +
      '<div class="w-9 h-9 rounded-lg bg-[#f4f4f5] border border-[#d1d5db] flex items-center justify-center cursor-pointer hover:bg-gray-100" onclick="window.location.hash=\'#/dashboard\'" title="Dashboard">' +
        '<svg class="w-5 h-5 text-[#0f766e]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.5 3.64v7.36L12 18.82l-6.5-3.64V7.82L12 4.18z"/></svg>' +
      '</div>' +

      '<!-- Navigation Dropdown -->' +
      '<button id="topbar-modules-btn" class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-3 py-1.5 text-sm text-[#0f766e] hover:bg-[#d1d5db] transition-colors hidden md:flex items-center gap-1.5 font-medium">' +
        '<span>Navigation</span>' +
        '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>' +
      '</button>' +

      '<!-- Advanced Search / AI -->' +
      '<button id="topbar-search-btn" class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#d1d5db] transition-colors hidden md:flex items-center gap-1.5">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>' +
        '<span>Search / AI</span>' +
      '</button>' +


      '<!-- Functional Notification Icon -->' +
      '<button id="topbar-notif-btn" class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-2.5 py-1.5 text-[#6b7280] hover:bg-[#d1d5db] transition-colors relative hidden md:block">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>' +
        '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#d94f4f] rounded-full border-2 border-white"></span>' +
      '</button>' +
    '</div>' +

    '<!-- Center: Breadcrumbs -->' +
    '<div class="flex-1 flex items-center justify-center px-4 overflow-hidden">' +
       '<div id="breadcrumb-container" class="hidden lg:block truncate"></div>' +
    '</div>' +

    '<!-- Right Side: Lang, Time, Date, Profile -->' +
    '<div class="hidden md:flex items-center gap-3">' +
      '<button class="bg-[#f4f4f5] border border-[#d1d5db] rounded-lg px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#d1d5db] transition-colors">En &#9662;</button>' +
      '<span id="nav-clock" class="text-xs text-[#6b7280] font-mono">--:--</span>' +
      '<span class="text-xs text-[#6b7280] mr-2">' + escapeHtml(dateStr) + '</span>' +

      '<!-- User Profile Dropdown -->' +
      '<button id="topbar-profile-btn" class="bg-[#111827] text-white rounded-xl pl-2 pr-4 py-1.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">' +
        '<div class="w-6 h-6 rounded-full bg-[#0f766e] flex items-center justify-center text-[10px]">' + (session ? escapeHtml(session.name.charAt(0).toUpperCase()) : '?') + '</div>' +
        '<span>' + (session ? escapeHtml(session.name.split(' ')[session.name.split(' ').length-1]) : 'User') + '</span>' +
        '<svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>' +
      '</button>' +
    '</div>' +

    '<!-- Mobile Menu Toggle -->' +
    '<button id="nav-collapse-btn" class="p-2 rounded-lg hover:bg-[#f4f4f5] transition-colors lg:hidden" aria-label="Toggle navigation">' +
      '<svg class="w-5 h-5 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>' +
    '</button>' +
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

  // Modules button action (renamed to Navigation)
  var modulesBtn = document.getElementById('topbar-modules-btn');
  if (modulesBtn) {
    modulesBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showModulesDropdown(this, session.role);
    });
  }

  // Notification button action
  var notifBtn = document.getElementById('topbar-notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showNotificationsDropdown(this);
    });
  }

  // Profile button action
  var profileBtn = document.getElementById('topbar-profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showProfileDropdown(this);
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
function showNotificationsDropdown(anchor) {
  const existing = document.getElementById('notif-dropdown');
  if (existing) { existing.remove(); return; }

  const dropdown = document.createElement('div');
  dropdown.id = 'notif-dropdown';
  dropdown.className = 'fixed mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#d1d5db] z-[60] overflow-hidden';

  const rect = anchor.getBoundingClientRect();
  dropdown.style.top = rect.bottom + 'px';
  dropdown.style.left = (rect.right - 320) + 'px';

  const notifications = [
    { title: 'New Loan Application', desc: 'Mary Banda applied for MWK 350K', time: '10m ago', icon: '📝' },
    { title: 'PAR Alert', desc: 'Karonga branch PAR 30 reached 6.8%', time: '1h ago', icon: '⚠️' },
    { title: 'System Backup', desc: 'Cloud backup completed successfully', time: '3h ago', icon: '✅' }
  ];

  let html = '<div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center"><span class="font-bold text-sm">Notifications</span><button class="text-[10px] text-primary hover:underline">Mark all read</button></div>';
  html += '<div class="max-h-80 overflow-y-auto">';
  notifications.forEach(n => {
    html += `<div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
      <div class="flex gap-3">
        <div class="text-lg">${n.icon}</div>
        <div class="flex-1">
          <p class="text-sm font-medium text-dark">${escapeHtml(n.title)}</p>
          <p class="text-xs text-secondary mt-0.5">${escapeHtml(n.desc)}</p>
          <p class="text-[10px] text-gray-400 mt-1">${n.time}</p>
        </div>
      </div>
    </div>`;
  });
  html += '</div>';
  html += '<div class="px-4 py-2 border-t border-gray-100 text-center"><button class="text-xs text-primary font-medium hover:underline">View all alerts</button></div>';

  dropdown.innerHTML = html;
  document.body.appendChild(dropdown);

  const closeDropdown = (e) => {
    if (!dropdown.contains(e.target) && e.target !== anchor) {
      dropdown.remove();
      document.removeEventListener('click', closeDropdown);
    }
  };
  setTimeout(() => document.addEventListener('click', closeDropdown), 0);
}

function showProfileDropdown(anchor) {
  const existing = document.getElementById('profile-dropdown');
  if (existing) { existing.remove(); return; }

  const session = getSession();
  const dropdown = document.createElement('div');
  dropdown.id = 'profile-dropdown';
  dropdown.className = 'fixed mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#d1d5db] z-[60] overflow-hidden py-1';

  const rect = anchor.getBoundingClientRect();
  dropdown.style.top = rect.bottom + 'px';
  dropdown.style.left = (rect.right - 224) + 'px';

  const items = [
    { label: 'My Profile', icon: '👤', action: () => { window.location.hash = '#/settings'; } },
    { label: 'Settings', icon: '⚙️', action: () => { window.location.hash = '#/settings'; } },
    { label: 'Divider' },
    { label: 'Log Out', icon: '🚪', action: () => { destroySession(); }, color: 'text-red-600' }
  ];

  items.forEach(item => {
    if (item.label === 'Divider') {
      const d = document.createElement('div');
      d.className = 'my-1 border-t border-gray-100';
      dropdown.appendChild(d);
      return;
    }
    const btn = document.createElement('button');
    btn.className = `w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${item.color || 'text-dark'}`;
    btn.innerHTML = `<span>${item.icon}</span><span class="font-medium">${item.label}</span>`;
    btn.onclick = () => {
      item.action();
      dropdown.remove();
    };
    dropdown.appendChild(btn);
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
 * Show a dropdown for all permitted modules.
 */
function showModulesDropdown(anchor, role) {
  const existing = document.getElementById('modules-dropdown');
  if (existing) {
    existing.remove();
    return;
  }

  const navItems = getNavigationItems(role);
  const dropdown = document.createElement('div');
  dropdown.id = 'modules-dropdown';
  dropdown.className = 'fixed mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#d1d5db] z-[60] overflow-y-auto py-1 max-h-[80vh]';

  const rect = anchor.getBoundingClientRect();
  dropdown.style.top = rect.bottom + 'px';
  dropdown.style.left = rect.left + 'px';

  navItems.forEach(item => {
    if (item.divider) {
      const divider = document.createElement('div');
      divider.className = 'my-1 border-t border-gray-100';
      dropdown.appendChild(divider);
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'w-full text-left px-4 py-2.5 text-sm text-[#6b7280] hover:bg-[#f4f4f5] transition-colors flex items-center gap-3 group relative';

    let innerHTML = '<span class="text-[#0f766e] group-hover:scale-110 transition-transform">' + (NAV_ICONS[item.icon] || '') + '</span>' +
                    '<span class="font-medium flex-1">' + item.label + '</span>';

    if (item.badge) {
      innerHTML += '<span class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">' + item.badge + '</span>';
    }

    btn.innerHTML = innerHTML;
    btn.onclick = () => {
      navigateTo(item.route);
      dropdown.remove();
    };
    dropdown.appendChild(btn);
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
  overlay.id = 'search-overlay';
  overlay.className = 'fixed inset-0 bg-black/50 z-[10000] flex items-start justify-center pt-20 px-4';
  overlay.innerHTML = `
    <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <div class="p-4 border-b border-[#d1d5db] flex items-center gap-3">
        <div id="search-mode-indicator" class="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Search</div>
        <input type="text" id="global-search-input" class="flex-1 outline-none text-lg text-[#0f766e]" placeholder="Search or ask AI (e.g. 'take me to loans')..." autofocus>
        <kbd class="text-xs text-[#6b7280] bg-[#f4f4f5] px-1.5 py-0.5 rounded border border-[#d1d5db]">ESC</kbd>
      </div>
      <div id="search-results" class="max-h-[60vh] overflow-y-auto p-2">
        <p class="text-center py-8 text-[#6b7280] text-sm">Start typing to search or ask Saile AI...</p>
      </div>
      <div class="p-3 bg-gray-50 border-t border-gray-100 flex gap-4 text-[10px] text-gray-400">
        <span><b>↑↓</b> to navigate</span>
        <span><b>↵</b> to select</span>
        <span>Type <b>/</b> for AI commands</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const input = overlay.querySelector('#global-search-input');
  const results = overlay.querySelector('#search-results');
  const modeInd = overlay.querySelector('#search-mode-indicator');

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
      modeInd.textContent = 'Search';
      modeInd.className = 'bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider';
      results.innerHTML = `
        <div class="p-4">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Shortcuts</p>
          <div class="grid grid-cols-2 gap-2">
            <button class="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 text-xs text-secondary border border-gray-100" onclick="window.location.hash='#/loans'; document.getElementById('search-overlay').remove()"><span class="text-base">📝</span> Loan Management</button>
            <button class="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 text-xs text-secondary border border-gray-100" onclick="window.location.hash='#/clients'; document.getElementById('search-overlay').remove()"><span class="text-base">👥</span> Client Registry</button>
            <button class="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 text-xs text-secondary border border-gray-100" onclick="window.location.hash='#/reports'; document.getElementById('search-overlay').remove()"><span class="text-base">📊</span> Reports</button>
            <button class="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 text-xs text-secondary border border-gray-100" onclick="window.location.hash='#/settings'; document.getElementById('search-overlay').remove()"><span class="text-base">⚙️</span> Settings</button>
          </div>
          <div class="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
             <p class="text-[11px] font-bold text-primary uppercase mb-2">✨ Advanced AI Search</p>
             <p class="text-[11px] text-primary/70 leading-relaxed">Try typing: <i>"take me to loans"</i>, <i>"show Karonga branch"</i>, or <i>"/late"</i> for instant navigation.</p>
          </div>
        </div>`;
      return;
    }

    // Check for AI mode
    if (q.startsWith('/') || q.includes('take me') || q.includes('show') || q.includes('open')) {
      modeInd.textContent = 'Saile AI';
      modeInd.className = 'bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider';
      handleAISearch(q, results);
      return;
    }

    modeInd.textContent = 'Search';
    modeInd.className = 'bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider';

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
 * Handle AI-powered navigation and query processing.
 */
function handleAISearch(q, resultsContainer) {
  const commands = [
    { trigger: 'loan', route: '#/loans', label: 'Go to Loan Management', icon: '📝', keywords: ['loan', 'apply', 'disburse', 'approved'] },
    { trigger: 'client', route: '#/clients', label: 'Go to Client Registry', icon: '👥', keywords: ['client', 'customer', 'borrower', 'people'] },
    { trigger: 'report', route: '#/reports', label: 'Open Financial Reports', icon: '📊', keywords: ['report', 'profit', 'loss', 'balance', 'financial'] },
    { trigger: 'account', route: '#/accounting', label: 'Go to Accounting', icon: '💰', keywords: ['account', 'ledger', 'gl', 'voucher', 'finance'] },
    { trigger: 'audit', route: '#/audit', label: 'View Audit Logs', icon: '📜', keywords: ['audit', 'log', 'trace', 'security'] },
    { trigger: 'setting', route: '#/settings', label: 'System Settings', icon: '⚙️', keywords: ['setting', 'config', 'profile', 'password'] },
    { trigger: 'karonga', route: '#/dashboard', label: 'Drill-down: Karonga Branch', icon: '🏦', action: () => { if(window.openDashboardModal) window.openDashboardModal('branch-detail-karonga'); }, keywords: ['karonga', 'branch', 'north'] },
    { trigger: 'late', route: '#/followup', label: 'Show Overdue Loans', icon: '⏰', keywords: ['late', 'overdue', 'past due', 'par', 'follow'] },
    { trigger: 'savings', route: '#/savings', label: 'Client Savings Accounts', icon: '🐷', keywords: ['savings', 'deposit', 'withdraw'] }
  ];

  const matches = commands.filter(c => c.keywords.some(k => q.includes(k)));

  if (matches.length > 0) {
    let html = '<div class="p-4"><p class="text-xs font-bold text-purple-600 uppercase mb-4 tracking-widest flex items-center gap-2"><span>✨</span> Saile AI Intent Detected</p>';
    matches.forEach((m, idx) => {
      html += `<button class="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-purple-50 mb-3 border border-purple-100 flex items-center gap-4 group transition-all shadow-sm" id="ai-cmd-${idx}">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md text-lg border border-purple-100">${m.icon}</div>
        <div class="flex-1">
          <p class="font-bold text-purple-900">${m.label}</p>
          <p class="text-[10px] text-purple-500 uppercase font-medium tracking-tight">Smart Navigation Shortcut</p>
        </div>
        <span class="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
      </button>`;
    });
    html += '</div>';
    resultsContainer.innerHTML = html;

    matches.forEach((m, idx) => {
      const btn = document.getElementById(`ai-cmd-${idx}`);
      if (btn) btn.onclick = () => {
        window.location.hash = m.route;
        if (m.action) setTimeout(m.action, 300);
        const overlay = document.getElementById('search-overlay');
        if (overlay) overlay.remove();
      };
    });
  } else {
    resultsContainer.innerHTML = `
      <div class="p-8 text-center">
        <div class="text-3xl mb-4">🤖</div>
        <p class="text-sm text-dark font-medium">Thinking...</p>
        <p class="text-xs text-secondary mt-2 italic">"I'm learning your natural language patterns. Try 'take me to loans' or 'show reports'."</p>
      </div>
    `;
  }
}

/**
 * Render the left-rail navigation.
 */
function renderLeftRail(navItems, role, isCollapsed) {
  var leftRail = document.getElementById('left-rail');
  if (!leftRail) return;
  leftRail.classList.add('hidden'); // Force sidebar hidden as per "remove existing side bar" requirement

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

  // Update main content margin - Left sidebar removed per requirement
  var appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.className = 'pt-16 min-h-screen px-5 pb-6 lg:px-8 lg:pb-8 transition-all duration-300';
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
 * Global navigation function to change application state via hash or action.
 * Used by onclick attributes in dashboard and other screens.
 * @param {string} target - The destination hash (e.g. "#/loans") or action (e.g. "scroll:id")
 */
function navigateTo(target) {
  if (!target) return;

  if (target.startsWith('#')) {
    window.location.hash = target;
  } else if (target.startsWith('scroll:')) {
    const id = target.split(':')[1];
    if (window.location.hash !== '#/dashboard') {
       window.location.hash = '#/dashboard';
       // Wait for dashboard to render
       setTimeout(() => {
         const el = document.getElementById(id);
         if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }, 500);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else if (target.startsWith('action:')) {
    const action = target.split(':')[1];
    // Custom action handling
    console.log('Performing action:', action);
    if (action === 'pending-approvals') {
      window.location.hash = '#/loans?status=Pending';
    } else if (action === 'alerts') {
      const btn = document.getElementById('topbar-notif-btn');
      if (btn) btn.click();
    }
    // Add more action handlers as needed for the prototype
  }
}

window.navigateTo = navigateTo;
window.renderNavigation = renderNavigation;
window.NAV_ICONS = NAV_ICONS;
