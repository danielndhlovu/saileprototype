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
    '<div class="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] flex-col justify-center items-center p-12">' +
      '<div class="max-w-md text-center">' +
        '<h1 class="text-[#1E3A8A]xl font-bold text-white mb-4">Saile</h1>' +
        '<p class="text-xl text-gray-300 mb-6">Empowering Financial Inclusion</p>' +
        '<p class="text-gray-400 text-sm leading-relaxed">A comprehensive microfinance management platform designed for field operations, loan lifecycle management, and financial reporting.</p>' +
        '<div class="mt-8 flex items-center gap-3 justify-center">' +
          '<div class="w-2 h-2 rounded-full bg-[#1E3A8A]"></div>' +
          '<span class="text-gray-400 text-xs">256-bit encrypted local storage</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<!-- Right form panel -->' +
    '<div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">' +
      '<div class="w-full max-w-md">' +
        '<div class="lg:hidden text-center mb-8">' +
          '<h1 class="text-2xl font-bold text-[#1E3A8A]">Saile</h1>' +
          '<p class="text-[#6B7280] text-sm">Financial Services Platform</p>' +
        '</div>' +
        '<h2 class="text-2xl font-semibold text-[#1E3A8A] mb-2">Sign In</h2>' +
        '<p class="text-[#6B7280] text-sm mb-6">Select your role and enter credentials</p>' +
        '<!-- Role pills -->' +
        '<div class="flex flex-wrap gap-2 mb-6" id="role-pills">' +
          '<button data-role="admin" class="role-pill px-4 py-2 rounded-xl text-sm font-medium border transition-colors bg-[#1F2937] text-white border-[#1F2937]">Admin</button>' +
          '<button data-role="branch_manager" class="role-pill px-4 py-2 rounded-xl text-sm font-medium border transition-colors bg-white text-[#1E3A8A] border-[#d1d5db] hover:bg-gray-50">Branch Manager</button>' +
          '<button data-role="accountant" class="role-pill px-4 py-2 rounded-xl text-sm font-medium border transition-colors bg-white text-[#1E3A8A] border-[#d1d5db] hover:bg-gray-50">Accountant</button>' +
          '<button data-role="auditor" class="role-pill px-4 py-2 rounded-xl text-sm font-medium border transition-colors bg-white text-[#1E3A8A] border-[#d1d5db] hover:bg-gray-50">Auditor</button>' +
        '</div>' +
        '<!-- Form -->' +
        '<form id="login-form" class="space-y-4">' +
          '<div>' +
            '<label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Email</label>' +
            '<input type="email" id="login-email" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-sm" placeholder="admin@saile.mw" required>' +
          '</div>' +
          '<div>' +
            '<label class="block text-sm font-medium text-[#1E3A8A] mb-1.5">Password</label>' +
            '<input type="password" id="login-password" class="w-full px-3 py-2.5 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-sm" placeholder="Enter password" required>' +
          '</div>' +
          '<div id="login-message" class="hidden text-sm rounded-xl px-3 py-2"></div>' +
          '<button type="submit" class="w-full bg-[#1F2937] text-white px-6 py-2.5 rounded-xl hover:bg-[#1F2937] font-medium text-sm transition-colors">Sign In</button>' +
        '</form>' +
        '<p class="text-xs text-[#6B7280] mt-4 text-center">Demo: admin@saile.mw / password123</p>' +
      '</div>' +
    '</div>' +
  '</div>';

  // Role pill click handlers
  var pills = container.querySelectorAll('.role-pill');
  pills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      selectedRole = this.getAttribute('data-role');
      pills.forEach(function(p) {
        p.className = 'role-pill px-4 py-2 rounded-xl text-sm font-medium border transition-colors bg-white text-[#1E3A8A] border-[#d1d5db] hover:bg-gray-50';
      });
      this.className = 'role-pill px-4 py-2 rounded-xl text-sm font-medium border transition-colors bg-[#1F2937] text-white border-[#1F2937]';
    });
  });

  // Form submit
  var form = document.getElementById('login-form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;
    handleDesktopLogin(email, password, selectedRole);
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
  var enteredPin = '';

  container.innerHTML = '<div class="min-h-screen bg-[#1F2937] flex flex-col items-center justify-center p-6">' +
    '<div class="text-center mb-8">' +
      '<h1 class="text-3xl font-bold text-white mb-2">Saile</h1>' +
      '<p class="text-gray-400 text-sm">Enter your PIN to continue</p>' +
    '</div>' +
    '<!-- PIN dots -->' +
    '<div id="pin-dots" class="flex gap-3 mb-8">' +
      '<div class="w-4 h-4 rounded-full border-2 border-gray-500 pin-dot"></div>' +
      '<div class="w-4 h-4 rounded-full border-2 border-gray-500 pin-dot"></div>' +
      '<div class="w-4 h-4 rounded-full border-2 border-gray-500 pin-dot"></div>' +
      '<div class="w-4 h-4 rounded-full border-2 border-gray-500 pin-dot"></div>' +
    '</div>' +
    '<div id="pin-error" class="hidden text-red-400 text-sm mb-4"></div>' +
    '<!-- PIN pad -->' +
    '<div id="pin-pad" class="grid grid-cols-3 gap-3 max-w-[240px]">' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="1">1</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="2">2</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="3">3</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="4">4</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="5">5</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="6">6</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="7">7</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="8">8</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="9">9</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-800 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="back">&larr;</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" data-key="0">0</button>' +
      '<button class="pin-key w-[72px] h-[72px] rounded-full bg-[#1E3A8A] text-white text-xl font-medium hover:bg-teal-800 transition-colors flex items-center justify-center" data-key="submit">&check;</button>' +
    '</div>' +
    '<!-- Biometric card -->' +
    '<div class="mt-8 bg-gray-800 rounded-xl p-4 w-full max-w-[240px] text-center">' +
      '<div class="text-gray-400 text-xs mb-2">Biometric Login</div>' +
      '<div class="text-2xl">&#128274;</div>' +
      '<div class="text-gray-500 text-xs mt-1">Not available in prototype</div>' +
    '</div>' +
  '</div>';

  // PIN pad event handlers
  var pad = document.getElementById('pin-pad');
  pad.addEventListener('click', function(e) {
    var btn = e.target.closest('.pin-key');
    if (!btn) return;
    var key = btn.getAttribute('data-key');

    if (key === 'back') {
      enteredPin = enteredPin.slice(0, -1);
    } else if (key === 'submit') {
      if (enteredPin.length === 4) {
        handlePinEntry(enteredPin);
        enteredPin = '';
      }
    } else {
      if (enteredPin.length < 4) {
        enteredPin += key;
      }
    }
    updatePinDots(enteredPin.length);
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
      dot.className = 'w-4 h-4 rounded-full bg-[#1E3A8A] pin-dot';
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
    el.className = 'text-sm rounded-xl px-3 py-2 bg-[#FEF2F2] text-[#991B1B]';
  } else {
    el.className = 'text-sm rounded-xl px-3 py-2 bg-[#1E3A8A]merald-50 text-[#1E3A8A]merald-700';
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
