// ============================================================================
// Saile Platform v2 — Shared Utility Helpers
// ============================================================================

/**
 * Format an ISO date string to DD/MM/YYYY.
 * @param {string} isoString - ISO date or datetime string
 * @returns {string} Formatted date "DD/MM/YYYY" or empty string if invalid
 */
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return day + '/' + month + '/' + year;
  } catch (e) {
    return '';
  }
}

/**
 * Format an ISO date string to DD/MM/YYYY HH:MM.
 * @param {string} isoString - ISO datetime string
 * @returns {string} Formatted datetime "DD/MM/YYYY HH:MM" or empty string if invalid
 */
function formatDateTime(isoString) {
  if (!isoString) return '';
  try {
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    var hours = String(d.getHours()).padStart(2, '0');
    var minutes = String(d.getMinutes()).padStart(2, '0');
    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
  } catch (e) {
    return '';
  }
}

/**
 * Format a number as MWK currency with thousands separators.
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency "MWK 1,234,567.00"
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'MWK 0.00';
  var num = Number(amount);
  var fixed = num.toFixed(2);
  var parts = fixed.split('.');
  var intPart = parts[0];
  var decPart = parts[1];
  var isNegative = false;
  if (intPart.charAt(0) === '-') {
    isNegative = true;
    intPart = intPart.substring(1);
  }
  var formatted = '';
  var count = 0;
  for (var i = intPart.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      formatted = ',' + formatted;
    }
    formatted = intPart.charAt(i) + formatted;
    count++;
  }
  return 'MWK ' + (isNegative ? '-' : '') + formatted + '.' + decPart;
}

/**
 * Format a number as a percentage string.
 * @param {number} value - The percentage value
 * @returns {string} Formatted percentage "15.5%"
 */
function formatPercentage(value) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  var num = Number(value);
  // Remove trailing zeros but keep up to 1 decimal
  var formatted = num % 1 === 0 ? num.toString() : num.toFixed(1);
  return formatted + '%';
}

/**
 * Generate a group ID in format GRP-XXXXX.
 * @returns {string} Group ID like "GRP-A3F7B"
 */
function generateGroupId() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = 'GRP-';
  for (var i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a transaction reference in format TXN-XXXXXXXX.
 * @returns {string} Transaction reference like "TXN-A3F7B2C9"
 */
function generateTransactionRef() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = 'TXN-';
  for (var i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Hash a 4-digit PIN using a salt for prototype storage.
 * Uses a simple hash algorithm (not cryptographically secure, suitable for prototype).
 * @param {string} pin - The PIN to hash
 * @returns {string} Hex hash string
 */
function hashPin(pin) {
  var hash = 0;
  var salt = 'saile_pin_salt_2024';
  var input = salt + pin;
  for (var i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Hash a password using a salt for prototype storage.
 * Simple hash suitable for prototype (not cryptographically secure).
 * @param {string} password - The password to hash
 * @returns {string} Hex hash string
 */
function hashPassword(password) {
  var hash = 0;
  var salt = 'saile_password_salt_2024';
  var input = salt + password;
  for (var i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Calculate the due date for a given installment based on start date and frequency.
 * @param {string} startDate - ISO date string for loan start
 * @param {string} frequency - "weekly", "biweekly", or "monthly"
 * @param {number} installmentNo - The installment number (1-based)
 * @returns {string} ISO date string "YYYY-MM-DD"
 */
function calculateDueDate(startDate, frequency, installmentNo) {
  var date = new Date(startDate);
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7 * installmentNo);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14 * installmentNo);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + installmentNo);
      break;
    default:
      date.setMonth(date.getMonth() + installmentNo);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Calculate the absolute number of days between two dates.
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Absolute day difference
 */
function daysBetween(date1, date2) {
  var d1 = new Date(date1);
  var d2 = new Date(date2);
  var diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get today's date as an ISO date string.
 * @returns {string} "YYYY-MM-DD"
 */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Standard debounce function.
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this;
    var args = arguments;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Show a toast notification message.
 * Creates a fixed-position toast in the top-right corner that auto-dismisses after 3 seconds.
 * @param {string} message - The message to display
 * @param {string} type - "success", "error", "warning", or "info"
 */
function showToast(message, type) {
  type = type || 'info';

  // Color mapping based on design system
  var colors = {
    success: { bg: '#0f766e', text: '#ffffff' },
    error: { bg: '#111827', text: '#ffffff' },
    warning: { bg: '#f59e0b', text: '#0f766e' },
    info: { bg: '#111827', text: '#ffffff' }
  };

  var color = colors[type] || colors.info;

  // Create toast container if it doesn't exist
  var container = document.getElementById('saile-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'saile-toast-container';
    container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }

  // Create toast element
  var toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.style.cssText = 'padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;' +
    'box-shadow:0 4px 12px rgba(0,0,0,0.15);pointer-events:auto;max-width:360px;' +
    'opacity:0;transform:translateX(100%);transition:opacity 0.3s ease,transform 0.3s ease;' +
    'background-color:' + color.bg + ';color:' + color.text + ';';
  toast.textContent = message;
  toast.classList.add('toast-in');

  container.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(function () {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // Auto-dismiss after 3 seconds
  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.classList.remove('toast-in');
    toast.classList.add('toast-out');
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      // Remove container if empty
      if (container && container.children.length === 0) {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    }, 300);
  }, 3000);
}

/**
 * Generate an amortization schedule for a loan.
 * Implements both flat and declining balance methods per design Algorithm 1.
 * @param {number} principal - Loan principal amount (MWK)
 * @param {number} monthlyRate - Monthly interest rate (percentage, e.g. 4.5 for 4.5% per month)
 * @param {string} frequency - "weekly", "biweekly", or "monthly"
 * @param {string} method - "flat" or "declining"
 * @param {string} startDate - ISO date string for loan start
 * @param {number} durationMonths - Number of months for the loan
 * @returns {Array} Array of installment objects
 */
function generateAmortization(principal, monthlyRate, frequency, method, startDate, durationMonths) {
  durationMonths = durationMonths || 1;
  var periodsPerMonth = { weekly: 4, biweekly: 2, monthly: 1 };
  var periods = Math.round(durationMonths * (periodsPerMonth[frequency] || 1));
  var periodicRate = monthlyRate / 100 / (periodsPerMonth[frequency] || 1);
  var schedule = [];

  if (method === 'flat') {
    var totalInterest = principal * (monthlyRate / 100) * durationMonths;
    var installmentPrincipal = Math.round(principal / periods);
    var installmentInterest = Math.round(totalInterest / periods);

    for (var i = 1; i <= periods; i++) {
      var principalPortion = (i === periods)
        ? principal - installmentPrincipal * (periods - 1)
        : installmentPrincipal;

      schedule.push({
        installmentNo: i,
        dueDate: calculateDueDate(startDate, frequency, i),
        principal: principalPortion,
        interest: installmentInterest,
        total: principalPortion + installmentInterest,
        status: 'Pending'
      });
    }
  } else if (method === 'declining') {
    var remainingPrincipal = principal;
    var installmentPrincipal = Math.round(principal / periods);

    for (var j = 1; j <= periods; j++) {
      var installmentInterest = Math.round(remainingPrincipal * periodicRate);
      var principalPortion = (j === periods)
        ? remainingPrincipal
        : installmentPrincipal;

      schedule.push({
        installmentNo: j,
        dueDate: calculateDueDate(startDate, frequency, j),
        principal: principalPortion,
        interest: installmentInterest,
        total: principalPortion + installmentInterest,
        status: 'Pending'
      });

      remainingPrincipal -= installmentPrincipal;
      if (remainingPrincipal < 0) remainingPrincipal = 0;
    }
  }

  return schedule;
}

/**
 * Calculate Portfolio at Risk (PAR) metrics.
 * Implements design Algorithm 2.
 * Categorizes outstanding loan balances by days past due buckets.
 * @returns {object} { totalOutstanding, par1_30_pct, par31_90_pct, par90plus_pct }
 */
function calculatePAR() {
  var loans = getCollection(StorageKeys.LOANS).filter(function (l) {
    return l.status === 'Disbursed';
  });
  var today = new Date();
  var totalOutstanding = 0;
  var par1_30 = 0;
  var par31_90 = 0;
  var par90plus = 0;

  for (var li = 0; li < loans.length; li++) {
    var loan = loans[li];
    var schedule = loan.amortizationSchedule || [];

    // Calculate total outstanding (unpaid principal)
    var loanOutstanding = 0;
    for (var si = 0; si < schedule.length; si++) {
      if (schedule[si].status !== 'Paid') {
        loanOutstanding += schedule[si].principal;
      }
    }
    totalOutstanding += loanOutstanding;

    // Find maximum days past due for this loan
    var maxDPD = 0;
    for (var di = 0; di < schedule.length; di++) {
      if (schedule[di].status !== 'Paid') {
        var dueDate = new Date(schedule[di].dueDate);
        if (dueDate < today) {
          var dpd = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
          if (dpd > maxDPD) maxDPD = dpd;
        }
      }
    }

    // Categorize into PAR buckets
    if (maxDPD >= 1 && maxDPD <= 30) {
      par1_30 += loanOutstanding;
    } else if (maxDPD >= 31 && maxDPD <= 90) {
      par31_90 += loanOutstanding;
    } else if (maxDPD > 90) {
      par90plus += loanOutstanding;
    }
  }

  return {
    totalOutstanding: totalOutstanding,
    par1_30_pct: totalOutstanding > 0 ? (par1_30 / totalOutstanding) * 100 : 0,
    par31_90_pct: totalOutstanding > 0 ? (par31_90 / totalOutstanding) * 100 : 0,
    par90plus_pct: totalOutstanding > 0 ? (par90plus / totalOutstanding) * 100 : 0
  };
}

/**
 * Calculate collection efficiency as a percentage.
 * Implements design Algorithm 4.
 * Ratio of collected amounts to total amounts due up to today.
 * @returns {number} Collection efficiency percentage (0-100)
 */
function calculateCollectionEfficiency() {
  var loans = getCollection(StorageKeys.LOANS).filter(function (l) {
    return l.status === 'Disbursed';
  });
  var today = new Date().toISOString().split('T')[0];
  var totalDue = 0;
  var totalCollected = 0;

  for (var li = 0; li < loans.length; li++) {
    var schedule = loans[li].amortizationSchedule || [];
    for (var si = 0; si < schedule.length; si++) {
      var inst = schedule[si];
      if (inst.dueDate <= today) {
        totalDue += inst.total;
        if (inst.status === 'Paid') {
          totalCollected += inst.total;
        }
      }
    }
  }

  return totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;
}

/**
 * Calculate the number of days a loan is overdue.
 * @param {object} loan - Loan object with amortization schedule
 * @returns {number} Max days overdue across pending installments
 */
function getOverdueDays(loan) {
  if (!loan || !loan.amortizationSchedule) return 0;
  var today = new Date();
  var maxDays = 0;
  for (var i = 0; i < loan.amortizationSchedule.length; i++) {
    var inst = loan.amortizationSchedule[i];
    if (inst.status !== 'Paid') {
      var dueDate = new Date(inst.dueDate);
      if (dueDate < today) {
        var diff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        if (diff > maxDays) maxDays = diff;
      }
    }
  }
  return maxDays;
}

/**
 * Calculate trial balance from voucher entries.
 * Implements design Algorithm 3.
 * @returns {object} { totalDebits, totalCredits, difference, isBalanced }
 */
function calculateTrialBalance() {
  var vouchers = getCollection(StorageKeys.VOUCHERS);
  var totalDebits = 0;
  var totalCredits = 0;

  for (var i = 0; i < vouchers.length; i++) {
    if (vouchers[i].voucherType === 'debit') {
      totalDebits += vouchers[i].amount;
    } else {
      totalCredits += vouchers[i].amount;
    }
  }

  return {
    totalDebits: totalDebits,
    totalCredits: totalCredits,
    difference: Math.abs(totalDebits - totalCredits),
    isBalanced: totalDebits === totalCredits
  };
}

// Expose all on window
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.formatPercentage = formatPercentage;
window.generateGroupId = generateGroupId;
window.generateTransactionRef = generateTransactionRef;
window.hashPin = hashPin;
window.hashPassword = hashPassword;
window.calculateDueDate = calculateDueDate;
window.daysBetween = daysBetween;
window.todayISO = todayISO;
window.debounce = debounce;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.generateAmortization = generateAmortization;
window.calculatePAR = calculatePAR;
window.calculateCollectionEfficiency = calculateCollectionEfficiency;
window.getOverdueDays = getOverdueDays;
window.calculateTrialBalance = calculateTrialBalance;
