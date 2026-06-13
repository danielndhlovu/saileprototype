// ============================================================================
// Saile Platform v2 — Storage Layer (localStorage Abstraction)
// ============================================================================

const STORAGE_PREFIX = 'saile_';

const StorageKeys = {
  CLIENTS: 'saile_clients',
  GROUPS: 'saile_groups',
  PRODUCTS: 'saile_products',
  LOANS: 'saile_loans',
  VOUCHERS: 'saile_vouchers',
  COLLECTIONS: 'saile_collections',
  FOLLOWUPS: 'saile_followups',
  AUDIT_LOG: 'saile_audit_log',
  SETTINGS: 'saile_settings',
  PIN: 'saile_pin',
  CASH_BALANCE: 'saile_cash_balance',
  SYNC_QUEUE: 'saile_sync_queue',
  SESSION: 'saile_session',
  USERS: 'saile_users',
  BRANCHES: 'saile_branches',
  PENALTY_RULES: 'saile_penalty_rules',
  NAV_COLLAPSED: 'saile_nav_collapsed',
  LANGUAGE: 'saile_language'
};

/**
 * Generate a UUID v4 identifier.
 * Uses crypto.randomUUID() if available, otherwise falls back to manual generation.
 * @returns {string} UUID v4 string
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Test if localStorage is available and functional.
 * Performs a write/read/delete cycle to verify.
 * @returns {boolean} true if localStorage is available
 */
function isStorageAvailable() {
  try {
    var testKey = STORAGE_PREFIX + '__storage_test__';
    localStorage.setItem(testKey, 'test');
    var result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === 'test';
  } catch (e) {
    return false;
  }
}

/**
 * Retrieve a collection (array) from localStorage.
 * Returns an empty array if the key doesn't exist or parsing fails.
 * @param {string} key - The storage key
 * @returns {Array} Parsed array or empty array
 */
function getCollection(key) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Store a collection (array) in localStorage.
 * @param {string} key - The storage key
 * @param {Array} data - The array to serialize and store
 */
function setCollection(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write failed for key:', key, e);
  }
}

/**
 * Append an item to a collection with auto-generated id and createdAt timestamp.
 * @param {string} key - The storage key
 * @param {object} item - The item to add (id and createdAt will be auto-set)
 * @returns {object} The item with id and createdAt populated
 */
function addItem(key, item) {
  var collection = getCollection(key);
  item.id = item.id || generateId();
  item.createdAt = item.createdAt || new Date().toISOString();
  collection.push(item);
  setCollection(key, collection);
  return item;
}

/**
 * Update an existing item in a collection by id.
 * Merges the updates object into the existing item and sets updatedAt.
 * @param {string} key - The storage key
 * @param {string} id - The id of the item to update
 * @param {object} updates - Object with fields to merge
 * @returns {object|null} The updated item, or null if not found
 */
function updateItem(key, id, updates) {
  var collection = getCollection(key);
  var index = -1;
  for (var i = 0; i < collection.length; i++) {
    if (collection[i].id === id) {
      index = i;
      break;
    }
  }
  if (index === -1) return null;

  var item = collection[index];
  var keys = Object.keys(updates);
  for (var j = 0; j < keys.length; j++) {
    item[keys[j]] = updates[keys[j]];
  }
  item.updatedAt = new Date().toISOString();
  collection[index] = item;
  setCollection(key, collection);
  return item;
}

/**
 * Delete an item from a collection by id.
 * @param {string} key - The storage key
 * @param {string} id - The id of the item to remove
 * @returns {boolean} true if the item was found and removed
 */
function deleteItem(key, id) {
  var collection = getCollection(key);
  var filtered = [];
  var found = false;
  for (var i = 0; i < collection.length; i++) {
    if (collection[i].id === id) {
      found = true;
    } else {
      filtered.push(collection[i]);
    }
  }
  if (found) {
    setCollection(key, filtered);
  }
  return found;
}

/**
 * Get a raw parsed value from localStorage (for non-array data like session, cash balance).
 * @param {string} key - The storage key
 * @returns {*} Parsed value or null
 */
function getValue(key) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Store a raw value in localStorage.
 * @param {string} key - The storage key
 * @param {*} value - The value to serialize and store
 */
function setValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed for key:', key, e);
  }
}

// Expose all on window
window.STORAGE_PREFIX = STORAGE_PREFIX;
window.StorageKeys = StorageKeys;
window.generateId = generateId;
window.isStorageAvailable = isStorageAvailable;
window.getCollection = getCollection;
window.setCollection = setCollection;
window.addItem = addItem;
window.updateItem = updateItem;
window.deleteItem = deleteItem;
window.getValue = getValue;
window.setValue = setValue;
