// TradeLayer API client — calls the authenticated Express backend.
// Uses Shopify App Bridge session token when available (same-origin + token auth).

async function getSessionToken() {
  try {
    if (window.shopify) return await window.shopify.idToken();
  } catch (e) { /* not in iframe or bridge not ready */ }
  return null;
}

async function apiFetch(url, options = {}) {
  const token = await getSessionToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(url, { credentials: 'same-origin', ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${text}`);
  }
  return res.json();
}

// ── Customer Groups ───────────────────────────────────────────────────────────

function loadCustomerGroups() {
  return apiFetch('/api/customer-groups');
}

function loadCustomerGroup(id) {
  return apiFetch(`/api/customer-groups/${id}`);
}

function createCustomerGroup(data) {
  return apiFetch('/api/customer-groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function updateCustomerGroup(id, data) {
  return apiFetch(`/api/customer-groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function deleteCustomerGroup(id) {
  return apiFetch(`/api/customer-groups/${id}`, { method: 'DELETE' });
}

function addGroupMember(groupId, shopifyCustomerId) {
  return apiFetch(`/api/customer-groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ shopifyCustomerId }),
  });
}

function removeGroupMember(groupId, shopifyCustomerId) {
  return apiFetch(`/api/customer-groups/${groupId}/members/${encodeURIComponent(shopifyCustomerId)}`, {
    method: 'DELETE',
  });
}

// ── Customers ─────────────────────────────────────────────────────────────────

function searchCustomers(query) {
  return apiFetch(`/api/customers/search?query=${encodeURIComponent(query)}`);
}

// ── Pricing Rules ─────────────────────────────────────────────────────────────

function loadPricingRules(params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/api/pricing-rules${qs}`);
}

function quickUpdatePricing(data) {
  return apiFetch('/api/pricing-rules/quick-update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function deletePricingRule(id) {
  return apiFetch(`/api/pricing-rules/${id}`, { method: 'DELETE' });
}

// ── Products ──────────────────────────────────────────────────────────────────

function loadProducts(params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/api/products${qs}`);
}

function searchProducts(query) {
  return apiFetch(`/api/products/search?query=${encodeURIComponent(query)}`);
}

// ── Settings ──────────────────────────────────────────────────────────────────

function loadSettings() {
  return apiFetch('/api/settings');
}

// ── Export on window ──────────────────────────────────────────────────────────

window.TL = {
  fetch: apiFetch,
  loadCustomerGroups,
  loadCustomerGroup,
  createCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  addGroupMember,
  removeGroupMember,
  searchCustomers,
  loadPricingRules,
  quickUpdatePricing,
  deletePricingRule,
  loadProducts,
  searchProducts,
  loadSettings,
};
