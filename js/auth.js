// ============================================================================
// Saile Platform v2 — Auth Controller
// ============================================================================

var SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
var sessionTimer = null;
var warningTimer = null;

// --- Session Management ---

/**
 * Create a session for the authenticated user.
 * @param {object} user - The user record
 */
function createSession(user) {
  var session = {
    userId: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
    loginAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  setValue(StorageKeys.SESSION, session);
  logAudit('login', { module: 'auth', entityId: user.id });
  return session;
}

/**
 * Get the current session.
 * @returns {object|null}
 */
function getSession() {
  return getValue(StorageKeys.SESSION);
}

/**
 * Destroy the current session and redirect to login.
 */
function destroySession() {
  logAudit('logout', { module: 'auth' });
  localStorage.removeItem(StorageKeys.SESSION);
  if (sessionTimer) clearTimeout(sessionTimer);
  if (warningTimer) clearTimeout(warningTimer);
  window.location.hash = '#/login';
}

/**
 * Check if a user is authenticated.
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!getSession();
}

// --- Desktop Login ---

/**
 * Render the desktop split-screen login.
 * @param {HTMLElement} container
 */
function renderDesktopLogin(container) {
  var selectedRole = 'admin';

  container.innerHTML = '<div class="min-h-screen flex">' +
    '<!-- Left brand panel -->' +
    '<div class="hidden lg:flex lg:w-1/2 bg-[#0f766e] flex-col justify-center items-center p-12">' +
      '<div class="max-w-md text-center">' +
        '<h1 class="text-4xl font-bold text-white mb-4">Saile</h1>' +
        '<p class="text-xl text-gray-300 mb-6">Empowering Financial Inclusion</p>' +
        '<p class="text-gray-400 text-sm leading-relaxed">A comprehensive microfinance management platform designed for field operations, loan lifecycle management, and financial reporting.</p>' +
        '<div class="mt-8 flex items-center gap-3 justify-center">' +
          '<div class="w-2 h-2 rounded-full bg-[#0f766e]"></div>' +
          '<span class="text-gray-400 text-xs">256-bit encrypted local storage</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<!-- Right form panel -->' +
    '<div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">' +
      '<div class="w-full max-w-md">' +
        '<div class="lg:hidden text-center mb-8">' +
          '<h1 class="text-2xl font-bold text-[#0f766e]">Saile</h1>' +
          '<p class="text-[#6b7280] text-sm">Financial Services Platform</p>' +
        '</div>' +
        '<h2 class="text-2xl font-semibold text-[#0f766e] mb-2">Select Your Role</h2>' +
        '<p class="text-[#6b7280] text-sm mb-8">Click your role to access the system</p>' +
        '<!-- Role pills -->' +
        '<div class="flex flex-wrap gap-3 mb-8" id="role-pills">' +
          '<button data-role="admin" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-[#111827] text-white border-[#111827] hover:shadow-lg">Admin</button>' +
          '<button data-role="md" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg">MD</button>' +
          '<button data-role="finance_manager" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg">Finance</button>' +
          '<button data-role="branch_manager" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg">Branch Manager</button>' +
          '<button data-role="loan_officer" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg">Loan Officer</button>' +
          '<button data-role="accountant" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg">Accountant</button>' +
          '<button data-role="auditor" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg">Auditor</button>' +
          '<button data-role="field_officer" class="role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg">Field Officer</button>' +
        '</div>' +
        '<div id="login-message" class="rounded-xl px-4 py-3 text-sm"></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  // Role pill click handlers
  var pills = container.querySelectorAll('.role-pill');
  console.log('Login: Found ' + pills.length + ' role buttons');
  
  pills.forEach(function(pill) {
    pill.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      var selectedRole = this.getAttribute('data-role');
      console.log('Login: Clicked role:', selectedRole);
      
      var msgEl = document.getElementById('login-message');
      
      // Find a user with this role
      var users = getCollection(StorageKeys.USERS);
      console.log('Login: Found ' + users.length + ' users in storage');
      
      var user = null;
      for (var i = 0; i < users.length; i++) {
        if (users[i].role === selectedRole && users[i].status === 'Active') {
          user = users[i];
          break;
        }
      }
      
      if (!user) {
        console.log('Login: No active user found for role:', selectedRole);
        if (msgEl) {
          msgEl.className = 'text-sm rounded-xl px-4 py-3 bg-[#fef2f2] text-[#111827]';
          msgEl.textContent = 'No active user found for this role.';
        }
        return;
      }
      
      console.log('Login: Authenticating user:', user.fullName, 'with role:', selectedRole);
      
      // Update UI
      pills.forEach(function(p) {
        p.className = 'role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:bg-gray-50 hover:shadow-lg';
      });
      this.className = 'role-pill px-6 py-3 rounded-xl text-sm font-medium border transition-colors bg-[#111827] text-white border-[#111827] hover:shadow-lg';
      
      // Show loading message
      if (msgEl) {
        msgEl.className = 'text-sm rounded-xl px-4 py-3 bg-[#f0fdf4] text-[#0f766e]';
        msgEl.textContent = 'Logging in as ' + escapeHtml(user.fullName) + '...';
      }
      
      // Update last login
      updateItem(StorageKeys.USERS, user.id, { lastLogin: new Date().toISOString() });
      
      // Create session and navigate
      createSession(user);
      
      console.log('Login: Session created, navigating to:', getDefaultRoute(selectedRole));
      
      setTimeout(function() {
        window.location.hash = getDefaultRoute(selectedRole);
      }, 300);
    });
  });
}

/**
 * Handle desktop login form submission.
 * @param {string} email
 * @param {string} password
 * @param {string} role
 */
function handleDesktopLogin(email, password, role) {
  var msgEl = document.getElementById('login-message');
  var users = getCollection(StorageKeys.USERS);
  var passwordHashed = hashPassword(password);

  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].passwordHash === passwordHashed && users[i].role === role) {
      user = users[i];
      break;
    }
  }

  if (!user) {
    // Try matching just email and password (role mismatch)
    var emailMatch = null;
    for (var j = 0; j < users.length; j++) {
      if (users[j].email === email && users[j].passwordHash === passwordHashed) {
        emailMatch = users[j];
        break;
      }
    }
    if (emailMatch) {
      showLoginMessage(msgEl, 'Role mismatch. Your account role is: ' + emailMatch.role, 'error');
    } else {
      showLoginMessage(msgEl, 'Invalid email or password.', 'error');
    }
    return;
  }

  if (user.status === 'Suspended') {
    showLoginMessage(msgEl, 'Account suspended. Contact administrator.', 'error');
    return;
  }

  // Update last login
  updateItem(StorageKeys.USERS, user.id, { lastLogin: new Date().toISOString() });

  // Create session
  createSession(user);
  showLoginMessage(msgEl, 'Login successful! Redirecting...', 'success');

  setTimeout(function() {
    window.location.hash = getDefaultRoute(role);
  }, 500);
}

// --- Mobile PIN Login ---

/**
 * Render the mobile PIN pad login.
 * @param {HTMLElement} container
 */
function renderMobileLogin(container) {
  container.innerHTML = '<div class="min-h-screen bg-gradient-to-b from-[#0f766e] to-[#0a5b56] flex flex-col items-center justify-center p-6">' +
    '<div class="text-center mb-12">' +
      '<h1 class="text-3xl font-bold text-white mb-2">Saile</h1>' +
      '<p class="text-gray-200 text-sm">Financial Services Platform</p>' +
    '</div>' +
    '<div class="w-full max-w-sm">' +
      '<h2 class="text-xl font-semibold text-white mb-2 text-center">Select Your Role</h2>' +
      '<p class="text-gray-200 text-sm text-center mb-8">Tap to access your dashboard</p>' +
      '<div class="space-y-3" id="role-pills">' +
        '<button data-role="admin" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-[#111827] text-white border-[#111827] hover:shadow-lg">Admin</button>' +
        '<button data-role="md" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg">Managing Director</button>' +
        '<button data-role="finance_manager" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg">Finance Manager</button>' +
        '<button data-role="branch_manager" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg">Branch Manager</button>' +
        '<button data-role="loan_officer" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg">Loan Officer</button>' +
        '<button data-role="field_officer" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg">Field Officer</button>' +
        '<button data-role="accountant" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg">Accountant</button>' +
        '<button data-role="auditor" class="role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg">Auditor</button>' +
      '</div>' +
      '<div id="login-message" class="mt-6 rounded-xl px-4 py-3 text-sm text-center hidden"></div>' +
    '</div>' +
  '</div>';

  // Role pill click handlers
  var pills = container.querySelectorAll('.role-pill');
  console.log('Mobile Login: Found ' + pills.length + ' role buttons');
  
  pills.forEach(function(pill) {
    pill.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      var selectedRole = this.getAttribute('data-role');
      console.log('Mobile Login: Clicked role:', selectedRole);
      
      var msgEl = document.getElementById('login-message');
      
      // Find a user with this role
      var users = getCollection(StorageKeys.USERS);
      console.log('Mobile Login: Found ' + users.length + ' users in storage');
      
      var user = null;
      for (var i = 0; i < users.length; i++) {
        if (users[i].role === selectedRole && users[i].status === 'Active') {
          user = users[i];
          break;
        }
      }
      
      if (!user) {
        console.log('Mobile Login: No active user found for role:', selectedRole);
        if (msgEl) {
          msgEl.className = 'mt-6 rounded-xl px-4 py-3 text-sm text-center bg-[#fef2f2] text-[#111827]';
          msgEl.textContent = 'No active user found for this role.';
        }
        return;
      }
      
      console.log('Mobile Login: Authenticating user:', user.fullName, 'with role:', selectedRole);
      
      // Update UI
      pills.forEach(function(p) {
        p.className = 'role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-white text-[#0f766e] border-[#d1d5db] hover:shadow-lg';
      });
      this.className = 'role-pill w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors bg-[#111827] text-white border-[#111827] hover:shadow-lg';
      
      // Show loading message
      if (msgEl) {
        msgEl.className = 'mt-6 rounded-xl px-4 py-3 text-sm text-center bg-[#f0fdf4] text-[#0f766e]';
        msgEl.textContent = 'Logging in...';
      }
      
      // Update last login
      updateItem(StorageKeys.USERS, user.id, { lastLogin: new Date().toISOString() });
      
      // Create session and navigate
      createSession(user);
      
      console.log('Mobile Login: Session created, navigating to:', getDefaultRoute(selectedRole));
      
      setTimeout(function() {
        window.location.hash = getDefaultRoute(selectedRole);
      }, 300);
    });
  });
}

/**
 * Update PIN dot display.
 * @param {number} filled - Number of filled dots
 */
function updatePinDots(filled) {
  var dots = document.querySelectorAll('.pin-dot');
  dots.forEach(function(dot, i) {
    if (i < filled) {
      dot.className = 'w-4 h-4 rounded-full bg-[#0f766e] pin-dot';
    } else {
      dot.className = 'w-4 h-4 rounded-full border-2 border-gray-500 pin-dot';
    }
  });
}

/**
 * Handle PIN entry and authenticate.
 * @param {string} pin
 */
function handlePinEntry(pin) {
  var storedPin = getValue(StorageKeys.PIN);
  var hashedInput = hashPin(pin);

  if (storedPin && hashedInput === storedPin) {
    // Find field officer user
    var users = getCollection(StorageKeys.USERS);
    var fieldOfficer = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].role === 'field_officer') {
        fieldOfficer = users[i];
        break;
      }
    }
    if (fieldOfficer) {
      createSession(fieldOfficer);
      window.location.hash = getDefaultRoute('field_officer');
    }
  } else {
    // Shake animation on error
    var dotsContainer = document.getElementById('pin-dots');
    if (dotsContainer) {
      dotsContainer.classList.add('animate-shake');
      setTimeout(function() {
        dotsContainer.classList.remove('animate-shake');
      }, 500);
    }
    var errorEl = document.getElementById('pin-error');
    if (errorEl) {
      errorEl.textContent = 'Incorrect PIN. Try again.';
      errorEl.classList.remove('hidden');
      setTimeout(function() { errorEl.classList.add('hidden'); }, 2000);
    }
    updatePinDots(0);
  }
}

// --- Session Timeout ---

/**
 * Initialize session timeout monitoring.
 */
function initSessionTimeout() {
  resetSessionTimer();

  // Reset on user interaction
  var events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  events.forEach(function(evt) {
    document.addEventListener(evt, function() {
      if (isAuthenticated()) {
        resetSessionTimer();
      }
    }, { passive: true });
  });
}

/**
 * Reset the session inactivity timer.
 */
function resetSessionTimer() {
  if (sessionTimer) clearTimeout(sessionTimer);
  if (warningTimer) clearTimeout(warningTimer);

  // Show warning 1 minute before timeout
  warningTimer = setTimeout(function() {
    showTimeoutWarning();
  }, SESSION_TIMEOUT_MS - 60000);

  // Actual timeout
  sessionTimer = setTimeout(function() {
    destroySession();
  }, SESSION_TIMEOUT_MS);
}

/**
 * Show the session timeout warning modal.
 */
function showTimeoutWarning() {
  var modal = document.getElementById('timeout-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// --- Helper ---

function showLoginMessage(el, msg, type) {
  if (!el) return;
  el.classList.remove('hidden');
  el.textContent = msg;
  if (type === 'error') {
    el.className = 'text-sm rounded-xl px-3 py-2 bg-[#fef2f2] text-[#111827]';
  } else {
    el.className = 'text-sm rounded-xl px-3 py-2 bg-[#f0fdf4] text-[#0f766e]';
  }
}

// Expose all on window
window.createSession = createSession;
window.getSession = getSession;
window.destroySession = destroySession;
window.isAuthenticated = isAuthenticated;
window.renderDesktopLogin = renderDesktopLogin;
window.renderMobileLogin = renderMobileLogin;
window.handleDesktopLogin = handleDesktopLogin;
window.handlePinEntry = handlePinEntry;
window.initSessionTimeout = initSessionTimeout;
window.resetSessionTimer = resetSessionTimer;
window.showTimeoutWarning = showTimeoutWarning;
