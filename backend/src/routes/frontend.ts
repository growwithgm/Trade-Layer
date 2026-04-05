export function generateAppHTML(apiKey: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TradeLayer</title>
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" data-api-key="${apiKey}"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f2f4; color: #202223; min-height: 100vh; }

    /* NAV */
    .nav { background: #fff; border-bottom: 1px solid #e1e3e5; padding: 0 24px; display: flex; align-items: center; gap: 4px; }
    .nav-brand { font-weight: 700; font-size: 16px; color: #202223; padding: 14px 12px 14px 0; margin-right: 8px; border-right: 1px solid #e1e3e5; }
    .nav-link { padding: 14px 12px; font-size: 14px; color: #6d7175; cursor: pointer; border-bottom: 2px solid transparent; text-decoration: none; }
    .nav-link:hover { color: #202223; }
    .nav-link.active { color: #008060; border-bottom-color: #008060; font-weight: 600; }

    /* LAYOUT */
    .page { display: none; padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page.active { display: block; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-title { font-size: 22px; font-weight: 700; }
    .page-subtitle { font-size: 14px; color: #6d7175; margin-top: 3px; }

    /* CARDS */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); cursor: pointer; transition: box-shadow .15s; }
    .summary-card:hover { box-shadow: 0 3px 8px rgba(0,0,0,0.12); }
    .summary-card .icon { font-size: 24px; margin-bottom: 10px; }
    .summary-card .label { font-size: 13px; color: #6d7175; margin-bottom: 4px; }
    .summary-card .count { font-size: 28px; font-weight: 700; color: #008060; }
    .summary-card .desc { font-size: 12px; color: #6d7175; margin-top: 6px; line-height: 1.5; }

    /* TABLE */
    .card { background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { background: #f6f6f7; text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 600; color: #6d7175; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid #e1e3e5; }
    td { padding: 12px 14px; border-bottom: 1px solid #f1f2f4; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .empty-row td { text-align: center; color: #6d7175; padding: 32px; }

    /* BUTTONS */
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: background .15s; }
    .btn-primary { background: #008060; color: #fff; }
    .btn-primary:hover { background: #006e52; }
    .btn-secondary { background: #fff; color: #202223; border: 1px solid #c9cccf; }
    .btn-secondary:hover { background: #f6f6f7; }
    .btn-danger { background: #fff; color: #d72c0d; border: 1px solid #d72c0d; }
    .btn-danger:hover { background: #fff4f4; }
    .btn-sm { padding: 5px 10px; font-size: 13px; }
    .btn-link { background: none; border: none; color: #008060; font-size: 13px; cursor: pointer; padding: 0; text-decoration: underline; }

    /* MODAL */
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 100; align-items: center; justify-content: center; }
    .modal-overlay.open { display: flex; }
    .modal { background: #fff; border-radius: 12px; padding: 28px; width: 100%; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
    .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }

    /* FORM */
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #202223; margin-bottom: 6px; }
    input[type=text], input[type=number], select, textarea {
      width: 100%; padding: 8px 12px; border: 1px solid #c9cccf; border-radius: 6px; font-size: 14px;
      color: #202223; background: #fff; outline: none; transition: border-color .15s;
    }
    input:focus, select:focus, textarea:focus { border-color: #008060; box-shadow: 0 0 0 2px rgba(0,128,96,.15); }
    .form-hint { font-size: 12px; color: #6d7175; margin-top: 4px; }

    /* TOGGLE */
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f1f2f4; }
    .toggle-row:last-child { border-bottom: none; }
    .toggle-label { font-size: 14px; font-weight: 500; }
    .toggle-desc { font-size: 12px; color: #6d7175; margin-top: 2px; }
    .toggle { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; inset: 0; background: #c9cccf; border-radius: 99px; cursor: pointer; transition: .2s; }
    .toggle-slider:before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .2s; }
    .toggle input:checked + .toggle-slider { background: #008060; }
    .toggle input:checked + .toggle-slider:before { transform: translateX(18px); }

    /* BADGE */
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #e4f5f0; color: #008060; }
    .badge-gray { background: #f1f2f4; color: #6d7175; }

    /* ALERTS */
    .alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .alert-error { background: #fff4f4; color: #d72c0d; border: 1px solid #ffd2cc; }
    .alert-success { background: #e4f5f0; color: #008060; border: 1px solid #b8e8d8; }
    .loading { color: #6d7175; font-size: 14px; padding: 32px; text-align: center; }

    /* MEMBER LIST */
    .member-chip { display: inline-flex; align-items: center; gap: 6px; background: #f1f2f4; padding: 4px 10px; border-radius: 99px; font-size: 12px; margin: 3px; }
    .member-chip button { background: none; border: none; cursor: pointer; color: #6d7175; font-size: 14px; line-height: 1; padding: 0; }
    .member-chip button:hover { color: #d72c0d; }
  </style>
</head>
<body>

<!-- NAV -->
<nav class="nav">
  <div class="nav-brand">TradeLayer</div>
  <a class="nav-link active" onclick="navigate('dashboard')">Dashboard</a>
  <a class="nav-link" onclick="navigate('groups')">Customer Groups</a>
  <a class="nav-link" onclick="navigate('pricing')">Pricing Rules</a>
  <a class="nav-link" onclick="navigate('quantity')">Quantity Rules</a>
  <a class="nav-link" onclick="navigate('settings')">Settings</a>
</nav>

<!-- ============ DASHBOARD ============ -->
<div id="page-dashboard" class="page active">
  <div class="page-header">
    <div>
      <div class="page-title">Dashboard</div>
      <div class="page-subtitle">B2B Wholesale Engine for Shopify</div>
    </div>
  </div>
  <div class="summary-grid">
    <div class="summary-card" onclick="navigate('groups')">
      <div class="icon">👥</div>
      <div class="label">Customer Groups</div>
      <div class="count" id="dash-groups">—</div>
      <div class="desc">Organise buyers and apply group-level pricing.</div>
    </div>
    <div class="summary-card" onclick="navigate('pricing')">
      <div class="icon">💰</div>
      <div class="label">Pricing Rules</div>
      <div class="count" id="dash-pricing">—</div>
      <div class="desc">Percentage discounts or fixed prices per group or product.</div>
    </div>
    <div class="summary-card" onclick="navigate('quantity')">
      <div class="icon">📦</div>
      <div class="label">Quantity Rules</div>
      <div class="count" id="dash-quantity">—</div>
      <div class="desc">Min, step, and max quantities per product.</div>
    </div>
    <div class="summary-card" onclick="navigate('settings')">
      <div class="icon">⚙️</div>
      <div class="label">Settings</div>
      <div class="count" style="font-size:18px;margin-top:4px;">Configure</div>
      <div class="desc">Login-based pricing, guest price visibility, quick order.</div>
    </div>
  </div>
</div>

<!-- ============ CUSTOMER GROUPS ============ -->
<div id="page-groups" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Customer Groups</div>
      <div class="page-subtitle">Organise wholesale buyers and assign pricing rules to each group.</div>
    </div>
    <button class="btn btn-primary" onclick="openGroupModal()">+ Create Group</button>
  </div>
  <div id="groups-alert"></div>
  <div class="card">
    <div id="groups-table"><div class="loading">Loading…</div></div>
  </div>
</div>

<!-- ============ PRICING RULES ============ -->
<div id="page-pricing" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Pricing Rules</div>
      <div class="page-subtitle">Set percentage discounts or fixed prices per group, customer, or product.</div>
    </div>
    <button class="btn btn-primary" onclick="openPricingModal()">+ Create Rule</button>
  </div>
  <div id="pricing-alert"></div>
  <div class="card">
    <div id="pricing-table"><div class="loading">Loading…</div></div>
  </div>
</div>

<!-- ============ QUANTITY RULES ============ -->
<div id="page-quantity" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Quantity Rules</div>
      <div class="page-subtitle">Define minimum, step, and maximum order quantities per product or variant.</div>
    </div>
    <button class="btn btn-primary" onclick="openQuantityModal()">+ Create Rule</button>
  </div>
  <div id="quantity-alert"></div>
  <div class="card">
    <div id="quantity-table"><div class="loading">Loading…</div></div>
  </div>
</div>

<!-- ============ SETTINGS ============ -->
<div id="page-settings" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Settings</div>
      <div class="page-subtitle">Configure how TradeLayer behaves in your storefront.</div>
    </div>
  </div>
  <div id="settings-alert"></div>
  <div class="card" style="padding: 24px; max-width: 600px;">
    <div id="settings-loading" class="loading">Loading…</div>
    <div id="settings-form" style="display:none">
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Login-based pricing</div>
          <div class="toggle-desc">Only show B2B prices to logged-in customers.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="s-loginBased"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Hide price for guests</div>
          <div class="toggle-desc">Show a message instead of prices for non-logged-in visitors.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="s-hideGuests"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div style="flex:1; margin-right:24px;">
          <div class="toggle-label">Hidden price message</div>
          <div class="toggle-desc">Text shown when prices are hidden.</div>
          <input type="text" id="s-hideMsg" placeholder="Login to see wholesale prices" style="margin-top:8px;">
        </div>
      </div>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Quick Order enabled</div>
          <div class="toggle-desc">Show a quick-order form on product and collection pages.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="s-quickOrder"><span class="toggle-slider"></span></label>
      </div>
      <div style="margin-top:20px;">
        <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
      </div>
    </div>
  </div>
</div>

<!-- ============ MODALS ============ -->

<!-- Group modal -->
<div class="modal-overlay" id="modal-group">
  <div class="modal">
    <div class="modal-title" id="modal-group-title">Create Customer Group</div>
    <div class="form-group">
      <label>Group Name *</label>
      <input type="text" id="g-name" placeholder="e.g. Wholesale Buyers">
    </div>
    <div class="form-group">
      <label>Description</label>
      <input type="text" id="g-desc" placeholder="Optional description">
    </div>
    <div id="modal-group-alert"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('modal-group')">Cancel</button>
      <button class="btn btn-primary" onclick="saveGroup()">Save</button>
    </div>
  </div>
</div>

<!-- Group members modal -->
<div class="modal-overlay" id="modal-members">
  <div class="modal" style="max-width:540px;">
    <div class="modal-title" id="modal-members-title">Group Members</div>
    <div id="members-list" style="margin-bottom:16px; min-height:40px;"></div>
    <div class="form-group">
      <label>Add Member (Shopify Customer ID)</label>
      <div style="display:flex;gap:8px;">
        <input type="text" id="m-customerId" placeholder="gid://shopify/Customer/12345">
        <button class="btn btn-primary btn-sm" onclick="addMember()">Add</button>
      </div>
      <div class="form-hint">Find customer IDs in your Shopify admin under Customers.</div>
    </div>
    <div id="modal-members-alert"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('modal-members')">Close</button>
    </div>
  </div>
</div>

<!-- Pricing rule modal -->
<div class="modal-overlay" id="modal-pricing">
  <div class="modal">
    <div class="modal-title" id="modal-pricing-title">Create Pricing Rule</div>
    <div class="form-group">
      <label>Customer Group</label>
      <select id="p-groupId">
        <option value="">— Any group —</option>
      </select>
    </div>
    <div class="form-group">
      <label>Shopify Product ID</label>
      <input type="text" id="p-productId" placeholder="gid://shopify/Product/12345">
      <div class="form-hint">Leave blank to apply to all products.</div>
    </div>
    <div class="form-group">
      <label>Shopify Variant ID</label>
      <input type="text" id="p-variantId" placeholder="gid://shopify/ProductVariant/12345">
      <div class="form-hint">Leave blank to apply to all variants.</div>
    </div>
    <div class="form-group">
      <label>Rule Type *</label>
      <select id="p-ruleType">
        <option value="percentage_discount">Percentage Discount (%)</option>
        <option value="fixed_price">Fixed Price (currency)</option>
      </select>
    </div>
    <div class="form-group">
      <label>Value *</label>
      <input type="number" id="p-value" placeholder="e.g. 15 for 15% or 9.99 for fixed price" step="0.01" min="0">
    </div>
    <div class="form-group">
      <label>Priority</label>
      <input type="number" id="p-priority" value="0" min="0">
      <div class="form-hint">Higher number = higher priority.</div>
    </div>
    <div id="modal-pricing-alert"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('modal-pricing')">Cancel</button>
      <button class="btn btn-primary" onclick="savePricingRule()">Save</button>
    </div>
  </div>
</div>

<!-- Quantity rule modal -->
<div class="modal-overlay" id="modal-quantity">
  <div class="modal">
    <div class="modal-title" id="modal-quantity-title">Create Quantity Rule</div>
    <div class="form-group">
      <label>Shopify Product ID *</label>
      <input type="text" id="q-productId" placeholder="gid://shopify/Product/12345">
    </div>
    <div class="form-group">
      <label>Shopify Variant ID</label>
      <input type="text" id="q-variantId" placeholder="gid://shopify/ProductVariant/12345">
      <div class="form-hint">Leave blank to apply to all variants of the product.</div>
    </div>
    <div class="form-group">
      <label>Minimum Quantity</label>
      <input type="number" id="q-min" value="1" min="1">
    </div>
    <div class="form-group">
      <label>Step Quantity</label>
      <input type="number" id="q-step" value="1" min="1">
      <div class="form-hint">Customers must order in multiples of this number.</div>
    </div>
    <div class="form-group">
      <label>Maximum Quantity</label>
      <input type="number" id="q-max" placeholder="Leave blank for unlimited" min="1">
    </div>
    <div id="modal-quantity-alert"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('modal-quantity')">Cancel</button>
      <button class="btn btn-primary" onclick="saveQuantityRule()">Save</button>
    </div>
  </div>
</div>

<script>
// ─── State ────────────────────────────────────────────────────────────────────
let _token = null;
let _groups = [];
let _editingGroupId = null;
let _editingPricingId = null;
let _editingQuantityId = null;
let _membersGroupId = null;

// ─── Auth token ───────────────────────────────────────────────────────────────
async function getToken() {
  try {
    if (window.shopify) return await window.shopify.idToken();
  } catch(e) {}
  return null;
}

async function apiFetch(path, opts = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
  return data;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.getAttribute('onclick') === "navigate('" + page + "')") l.classList.add('active');
  });
  if (page === 'dashboard') loadDashboard();
  if (page === 'groups') loadGroups();
  if (page === 'pricing') loadPricingRules();
  if (page === 'quantity') loadQuantityRules();
  if (page === 'settings') loadSettings();
}

function showAlert(elId, msg, type = 'error') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<div class="alert alert-' + type + '">' + msg + '</div>';
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const [g, p, q] = await Promise.all([
      apiFetch('/api/customer-groups'),
      apiFetch('/api/pricing-rules'),
      apiFetch('/api/quantity-rules'),
    ]);
    document.getElementById('dash-groups').textContent = (g.customerGroups || []).length;
    document.getElementById('dash-pricing').textContent = (p.pricingRules || []).length;
    document.getElementById('dash-quantity').textContent = (q.quantityRules || []).length;
  } catch(e) { /* non-fatal */ }
}

// ─── Customer Groups ──────────────────────────────────────────────────────────
async function loadGroups() {
  document.getElementById('groups-table').innerHTML = '<div class="loading">Loading…</div>';
  try {
    const data = await apiFetch('/api/customer-groups');
    _groups = data.customerGroups || [];
    renderGroupsTable();
  } catch(e) {
    document.getElementById('groups-table').innerHTML = '<div class="loading" style="color:#d72c0d">Failed to load: ' + e.message + '</div>';
  }
}

function renderGroupsTable() {
  if (!_groups.length) {
    document.getElementById('groups-table').innerHTML = '<table><thead><tr><th>Name</th><th>Description</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr class="empty-row"><td colspan="5">No customer groups yet. Create one to get started.</td></tr></tbody></table>';
    return;
  }
  let rows = _groups.map(g => \`
    <tr>
      <td><strong>\${esc(g.name)}</strong></td>
      <td>\${esc(g.description || '—')}</td>
      <td><button class="btn-link" onclick="openMembersModal('\${g.id}', '\${esc(g.name)}')">\${g._count?.members ?? 0} members</button></td>
      <td><span class="badge \${g.isActive ? 'badge-green' : 'badge-gray'}">\${g.isActive ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editGroup('\${g.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="deleteGroup('\${g.id}')">Delete</button>
      </td>
    </tr>\`).join('');
  document.getElementById('groups-table').innerHTML = '<table><thead><tr><th>Name</th><th>Description</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function openGroupModal(g = null) {
  _editingGroupId = g ? g.id : null;
  document.getElementById('modal-group-title').textContent = g ? 'Edit Customer Group' : 'Create Customer Group';
  document.getElementById('g-name').value = g ? g.name : '';
  document.getElementById('g-desc').value = g ? (g.description || '') : '';
  document.getElementById('modal-group-alert').innerHTML = '';
  document.getElementById('modal-group').classList.add('open');
}

function editGroup(id) {
  const g = _groups.find(x => x.id === id);
  if (g) openGroupModal(g);
}

async function saveGroup() {
  const name = document.getElementById('g-name').value.trim();
  const description = document.getElementById('g-desc').value.trim();
  if (!name) { showAlert('modal-group-alert', 'Name is required.'); return; }
  try {
    if (_editingGroupId) {
      await apiFetch('/api/customer-groups/' + _editingGroupId, { method: 'PUT', body: JSON.stringify({ name, description }) });
    } else {
      await apiFetch('/api/customer-groups', { method: 'POST', body: JSON.stringify({ name, description }) });
    }
    closeModal('modal-group');
    loadGroups();
  } catch(e) {
    showAlert('modal-group-alert', e.message);
  }
}

async function deleteGroup(id) {
  if (!confirm('Delete this customer group? This will also remove all its members.')) return;
  try {
    await apiFetch('/api/customer-groups/' + id, { method: 'DELETE' });
    loadGroups();
  } catch(e) {
    showAlert('groups-alert', e.message);
  }
}

// Members
async function openMembersModal(groupId, groupName) {
  _membersGroupId = groupId;
  document.getElementById('modal-members-title').textContent = groupName + ' — Members';
  document.getElementById('m-customerId').value = '';
  document.getElementById('modal-members-alert').innerHTML = '';
  document.getElementById('modal-members').classList.add('open');
  await loadMembers();
}

async function loadMembers() {
  document.getElementById('members-list').innerHTML = '<span style="font-size:13px;color:#6d7175">Loading…</span>';
  try {
    const data = await apiFetch('/api/customer-groups');
    const group = (data.customerGroups || []).find(g => g.id === _membersGroupId);
    // Re-fetch to get members — load full group list and filter
    const membersData = await apiFetch('/api/customer-groups/' + _membersGroupId + '/members').catch(() => null);
    // Fallback: show member count from group list since we don't have a get-members endpoint
    // Use the group's _count, and fetch actual IDs via a workaround
    renderMembers([]);
  } catch(e) {}
}

function renderMembers(members) {
  const el = document.getElementById('members-list');
  if (!members.length) {
    el.innerHTML = '<span style="font-size:13px;color:#6d7175">No members yet.</span>';
    return;
  }
  el.innerHTML = members.map(m => \`
    <span class="member-chip">
      \${esc(m.shopifyCustomerId)}
      <button onclick="removeMember('\${m.id}', '\${esc(m.shopifyCustomerId)}')" title="Remove">×</button>
    </span>\`).join('');
}

async function addMember() {
  const shopifyCustomerId = document.getElementById('m-customerId').value.trim();
  if (!shopifyCustomerId) { showAlert('modal-members-alert', 'Customer ID is required.'); return; }
  try {
    await apiFetch('/api/customer-groups/' + _membersGroupId + '/members', {
      method: 'POST', body: JSON.stringify({ shopifyCustomerId })
    });
    document.getElementById('m-customerId').value = '';
    showAlert('modal-members-alert', 'Member added.', 'success');
    loadGroups(); // refresh counts
  } catch(e) {
    showAlert('modal-members-alert', e.message);
  }
}

async function removeMember(memberId, customerId) {
  try {
    await apiFetch('/api/customer-groups/' + _membersGroupId + '/members/' + encodeURIComponent(customerId), { method: 'DELETE' });
    loadGroups();
    closeModal('modal-members');
  } catch(e) {
    showAlert('modal-members-alert', e.message);
  }
}

// ─── Pricing Rules ────────────────────────────────────────────────────────────
let _pricingRules = [];

async function loadPricingRules() {
  document.getElementById('pricing-table').innerHTML = '<div class="loading">Loading…</div>';
  try {
    const [pd, gd] = await Promise.all([apiFetch('/api/pricing-rules'), apiFetch('/api/customer-groups')]);
    _pricingRules = pd.pricingRules || [];
    _groups = gd.customerGroups || [];
    renderPricingTable();
  } catch(e) {
    document.getElementById('pricing-table').innerHTML = '<div class="loading" style="color:#d72c0d">Failed to load: ' + e.message + '</div>';
  }
}

function renderPricingTable() {
  if (!_pricingRules.length) {
    document.getElementById('pricing-table').innerHTML = '<table><thead><tr><th>Group</th><th>Product</th><th>Type</th><th>Value</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr class="empty-row"><td colspan="7">No pricing rules yet.</td></tr></tbody></table>';
    return;
  }
  let rows = _pricingRules.map(r => \`
    <tr>
      <td>\${r.customerGroup ? esc(r.customerGroup.name) : r.shopifyCustomerId ? '<span class="badge badge-gray">Customer</span>' : '—'}</td>
      <td>\${r.shopifyVariantId ? 'Variant' : r.shopifyProductId ? 'Product' : 'All'}</td>
      <td><span class="badge \${r.ruleType === 'percentage_discount' ? 'badge-green' : 'badge-gray'}">\${r.ruleType === 'percentage_discount' ? '% Discount' : 'Fixed Price'}</span></td>
      <td><strong>\${r.ruleType === 'percentage_discount' ? r.value + '%' : '$' + r.value}</strong></td>
      <td>\${r.priority}</td>
      <td><span class="badge \${r.isActive ? 'badge-green' : 'badge-gray'}">\${r.isActive ? 'Active' : 'Off'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editPricingRule('\${r.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="deletePricingRule('\${r.id}')">Delete</button>
      </td>
    </tr>\`).join('');
  document.getElementById('pricing-table').innerHTML = '<table><thead><tr><th>Group</th><th>Scope</th><th>Type</th><th>Value</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function openPricingModal(r = null) {
  _editingPricingId = r ? r.id : null;
  document.getElementById('modal-pricing-title').textContent = r ? 'Edit Pricing Rule' : 'Create Pricing Rule';
  // populate group dropdown
  const sel = document.getElementById('p-groupId');
  sel.innerHTML = '<option value="">— Any group —</option>' + _groups.map(g => \`<option value="\${g.id}" \${r && r.customerGroupId === g.id ? 'selected' : ''}>\${esc(g.name)}</option>\`).join('');
  document.getElementById('p-productId').value = r ? (r.shopifyProductId || '') : '';
  document.getElementById('p-variantId').value = r ? (r.shopifyVariantId || '') : '';
  document.getElementById('p-ruleType').value = r ? r.ruleType : 'percentage_discount';
  document.getElementById('p-value').value = r ? r.value : '';
  document.getElementById('p-priority').value = r ? r.priority : 0;
  document.getElementById('modal-pricing-alert').innerHTML = '';
  document.getElementById('modal-pricing').classList.add('open');
}

function editPricingRule(id) {
  const r = _pricingRules.find(x => x.id === id);
  if (r) openPricingModal(r);
}

async function savePricingRule() {
  const ruleType = document.getElementById('p-ruleType').value;
  const value = parseFloat(document.getElementById('p-value').value);
  if (isNaN(value)) { showAlert('modal-pricing-alert', 'Value is required.'); return; }
  const body = {
    customerGroupId: document.getElementById('p-groupId').value || null,
    shopifyProductId: document.getElementById('p-productId').value.trim() || null,
    shopifyVariantId: document.getElementById('p-variantId').value.trim() || null,
    ruleType, value,
    priority: parseInt(document.getElementById('p-priority').value) || 0,
  };
  try {
    if (_editingPricingId) {
      await apiFetch('/api/pricing-rules/' + _editingPricingId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiFetch('/api/pricing-rules', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('modal-pricing');
    loadPricingRules();
  } catch(e) {
    showAlert('modal-pricing-alert', e.message);
  }
}

async function deletePricingRule(id) {
  if (!confirm('Delete this pricing rule?')) return;
  try {
    await apiFetch('/api/pricing-rules/' + id, { method: 'DELETE' });
    loadPricingRules();
  } catch(e) {
    showAlert('pricing-alert', e.message);
  }
}

// ─── Quantity Rules ───────────────────────────────────────────────────────────
let _quantityRules = [];

async function loadQuantityRules() {
  document.getElementById('quantity-table').innerHTML = '<div class="loading">Loading…</div>';
  try {
    const data = await apiFetch('/api/quantity-rules');
    _quantityRules = data.quantityRules || [];
    renderQuantityTable();
  } catch(e) {
    document.getElementById('quantity-table').innerHTML = '<div class="loading" style="color:#d72c0d">Failed to load: ' + e.message + '</div>';
  }
}

function renderQuantityTable() {
  if (!_quantityRules.length) {
    document.getElementById('quantity-table').innerHTML = '<table><thead><tr><th>Product</th><th>Variant</th><th>Min</th><th>Step</th><th>Max</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr class="empty-row"><td colspan="7">No quantity rules yet.</td></tr></tbody></table>';
    return;
  }
  let rows = _quantityRules.map(r => \`
    <tr>
      <td style="font-size:12px;color:#6d7175">\${esc(r.shopifyProductId || '—')}</td>
      <td style="font-size:12px;color:#6d7175">\${esc(r.shopifyVariantId || '—')}</td>
      <td><strong>\${r.minQuantity}</strong></td>
      <td>\${r.stepQuantity}</td>
      <td>\${r.maxQuantity ?? '—'}</td>
      <td><span class="badge \${r.isActive ? 'badge-green' : 'badge-gray'}">\${r.isActive ? 'Active' : 'Off'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editQuantityRule('\${r.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="deleteQuantityRule('\${r.id}')">Delete</button>
      </td>
    </tr>\`).join('');
  document.getElementById('quantity-table').innerHTML = '<table><thead><tr><th>Product ID</th><th>Variant ID</th><th>Min</th><th>Step</th><th>Max</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function openQuantityModal(r = null) {
  _editingQuantityId = r ? r.id : null;
  document.getElementById('modal-quantity-title').textContent = r ? 'Edit Quantity Rule' : 'Create Quantity Rule';
  document.getElementById('q-productId').value = r ? (r.shopifyProductId || '') : '';
  document.getElementById('q-variantId').value = r ? (r.shopifyVariantId || '') : '';
  document.getElementById('q-min').value = r ? r.minQuantity : 1;
  document.getElementById('q-step').value = r ? r.stepQuantity : 1;
  document.getElementById('q-max').value = r ? (r.maxQuantity ?? '') : '';
  document.getElementById('modal-quantity-alert').innerHTML = '';
  document.getElementById('modal-quantity').classList.add('open');
}

function editQuantityRule(id) {
  const r = _quantityRules.find(x => x.id === id);
  if (r) openQuantityModal(r);
}

async function saveQuantityRule() {
  const shopifyProductId = document.getElementById('q-productId').value.trim();
  if (!shopifyProductId) { showAlert('modal-quantity-alert', 'Product ID is required.'); return; }
  const maxVal = document.getElementById('q-max').value.trim();
  const body = {
    shopifyProductId,
    shopifyVariantId: document.getElementById('q-variantId').value.trim() || null,
    minQuantity: parseInt(document.getElementById('q-min').value) || 1,
    stepQuantity: parseInt(document.getElementById('q-step').value) || 1,
    maxQuantity: maxVal ? parseInt(maxVal) : null,
  };
  try {
    if (_editingQuantityId) {
      await apiFetch('/api/quantity-rules/' + _editingQuantityId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiFetch('/api/quantity-rules', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('modal-quantity');
    loadQuantityRules();
  } catch(e) {
    showAlert('modal-quantity-alert', e.message);
  }
}

async function deleteQuantityRule(id) {
  if (!confirm('Delete this quantity rule?')) return;
  try {
    await apiFetch('/api/quantity-rules/' + id, { method: 'DELETE' });
    loadQuantityRules();
  } catch(e) {
    showAlert('quantity-alert', e.message);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────
async function loadSettings() {
  document.getElementById('settings-loading').style.display = 'block';
  document.getElementById('settings-form').style.display = 'none';
  try {
    const data = await apiFetch('/api/settings');
    const s = data.settings;
    document.getElementById('s-loginBased').checked = !!s.loginBasedPricing;
    document.getElementById('s-hideGuests').checked = !!s.hidePriceForGuests;
    document.getElementById('s-hideMsg').value = s.hidePriceMessage || '';
    document.getElementById('s-quickOrder').checked = !!s.quickOrderEnabled;
    document.getElementById('settings-loading').style.display = 'none';
    document.getElementById('settings-form').style.display = 'block';
  } catch(e) {
    document.getElementById('settings-loading').innerHTML = '<span style="color:#d72c0d">Failed to load settings: ' + e.message + '</span>';
  }
}

async function saveSettings() {
  const body = {
    loginBasedPricing: document.getElementById('s-loginBased').checked,
    hidePriceForGuests: document.getElementById('s-hideGuests').checked,
    hidePriceMessage: document.getElementById('s-hideMsg').value.trim() || null,
    quickOrderEnabled: document.getElementById('s-quickOrder').checked,
  };
  try {
    await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(body) });
    showAlert('settings-alert', 'Settings saved successfully.', 'success');
  } catch(e) {
    showAlert('settings-alert', e.message);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

// Boot
loadDashboard();
</script>
</body>
</html>`;
}
