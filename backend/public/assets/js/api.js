// TradeLayer API client — calls the authenticated Express backend
// All endpoints require the Shopify session cookie (same-origin).

async function tlFetch(path, opts = {}) {
  const r = await fetch(path, { credentials: 'same-origin', ...opts });
  if (!r.ok) {
    const text = await r.text().catch(() => r.statusText);
    throw new Error(`${r.status} ${text}`);
  }
  return r.json();
}

// ── Customer Groups ───────────────────────────────────────────────────────────

async function loadCustomerGroups() {
  return tlFetch('/api/customer-groups');
}

async function createCustomerGroup(data) {
  return tlFetch('/api/customer-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function deleteCustomerGroup(id) {
  return tlFetch(`/api/customer-groups/${id}`, { method: 'DELETE' });
}

// ── Pricing Rules ─────────────────────────────────────────────────────────────

async function loadPricingRules(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return tlFetch(`/api/pricing-rules${qs ? '?' + qs : ''}`);
}

async function loadPricingByProduct(shopifyProductId) {
  return tlFetch(`/api/pricing-rules/by-product?shopifyProductId=${encodeURIComponent(shopifyProductId)}`);
}

async function quickUpdatePricing(updates) {
  return tlFetch('/api/pricing-rules/quick-update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
}

async function deletePricingRule(id) {
  return tlFetch(`/api/pricing-rules/${id}`, { method: 'DELETE' });
}

// ── Products ──────────────────────────────────────────────────────────────────

async function loadProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return tlFetch(`/api/products${qs ? '?' + qs : ''}`);
}

// ── Settings ──────────────────────────────────────────────────────────────────

async function loadSettings() {
  return tlFetch('/api/settings');
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function showTableLoading(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) tbody.innerHTML = '<tr><td colspan="99" style="text-align:center;padding:32px;color:#94a3b8">Loading…</td></tr>';
}

function showTableError(tbodyId, msg) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) tbody.innerHTML = `<tr><td colspan="99" style="text-align:center;padding:32px;color:#ef4444">${msg}</td></tr>`;
}

function showTableEmpty(tbodyId, msg = 'No records found.') {
  const tbody = document.getElementById(tbodyId);
  if (tbody) tbody.innerHTML = `<tr><td colspan="99" style="text-align:center;padding:32px;color:#94a3b8">${msg}</td></tr>`;
}

window.TL = {
  fetch: tlFetch,
  loadCustomerGroups,
  createCustomerGroup,
  deleteCustomerGroup,
  loadPricingRules,
  loadPricingByProduct,
  quickUpdatePricing,
  deletePricingRule,
  loadProducts,
  loadSettings,
  showTableLoading,
  showTableError,
  showTableEmpty,
};
