export function generateAppHTML(apiKey: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TradeLayer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" data-api-key="${apiKey}"></script>
  <style>
    :root {
      --bg:#f8fafc; --surface:#fff; --surface-2:#f8fafc; --line:#e2e8f0; --line-soft:#eef2f7;
      --text:#0f172a; --muted:#64748b; --subtle:#94a3b8;
      --brand:#5c59f2; --brand-soft:#eef2ff;
      --green:#10b981; --green-soft:#ecfdf5;
      --amber:#f59e0b; --amber-soft:#fffbeb;
      --red:#ef4444; --red-soft:#fef2f2;
      --shadow:0 1px 3px rgba(15,23,42,.08),0 1px 2px -1px rgba(15,23,42,.06);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:13px}
    a{text-decoration:none;color:inherit}

    /* ── NAV ─────────────────────────────────────────────── */
    .nav{background:var(--surface);border-bottom:1px solid var(--line);padding:0 28px;display:flex;align-items:center;gap:2px;height:52px}
    .nav-brand{font-weight:800;font-size:15px;letter-spacing:-.02em;padding-right:20px;margin-right:8px;border-right:1px solid var(--line-soft)}
    .nav-link{padding:6px 12px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;border-radius:8px;border:none;background:none}
    .nav-link:hover{color:var(--text);background:#f1f5f9}
    .nav-link.active{color:var(--brand);background:var(--brand-soft)}

    /* ── LAYOUT ──────────────────────────────────────────── */
    .page{display:none;padding:28px;max-width:1280px;margin:0 auto}
    .page.active{display:block}
    .page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap}
    .page-title{font-size:26px;font-weight:800;letter-spacing:-.02em}
    .page-subtitle{font-size:13px;color:var(--muted);margin-top:4px;line-height:1.5}

    /* ── CARDS ───────────────────────────────────────────── */
    .summary-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;margin-bottom:24px}
    .summary-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:var(--shadow);cursor:pointer;transition:box-shadow .15s,transform .15s}
    .summary-card:hover{box-shadow:0 4px 12px rgba(15,23,42,.1);transform:translateY(-1px)}
    .summary-card .icon{font-size:22px;margin-bottom:12px}
    .summary-card .label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
    .summary-card .count{font-size:30px;font-weight:800;letter-spacing:-.03em;color:var(--brand);margin-top:6px}
    .summary-card .desc{font-size:12px;color:var(--muted);margin-top:8px;line-height:1.5}

    /* ── TABLE CARD ──────────────────────────────────────── */
    .card{background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);overflow:hidden}
    .table-wrap{overflow-x:auto}
    table{width:100%;border-collapse:collapse;min-width:600px}
    th{padding:12px 16px;background:var(--surface-2);color:var(--muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;text-align:left;border-bottom:1px solid var(--line-soft)}
    td{padding:14px 16px;border-bottom:1px solid var(--line-soft);color:#334155;vertical-align:middle}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:#fcfdff}
    .empty-row td{text-align:center;color:var(--muted);padding:40px}

    /* ── BUTTONS ─────────────────────────────────────────── */
    .btn{height:36px;padding:0 14px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:#334155;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:7px;cursor:pointer;transition:background .1s,filter .1s;font-family:inherit}
    .btn:hover{background:var(--surface-2)}
    .btn-primary{background:var(--brand);border-color:var(--brand);color:#fff;box-shadow:0 4px 12px rgba(92,89,242,.2)}
    .btn-primary:hover{filter:brightness(.96)}
    .btn-danger{background:#fff5f5;border-color:#fecaca;color:#b91c1c}
    .btn-danger:hover{background:#fee2e2}
    .btn-sm{height:32px;padding:0 12px;font-size:12px;border-radius:8px}
    .btn-link{background:none;border:none;color:var(--brand);font-size:13px;font-weight:600;cursor:pointer;padding:0;font-family:inherit}
    .btn-icon{width:32px;height:32px;padding:0;justify-content:center;border-radius:8px}

    /* ── TOOLBAR ─────────────────────────────────────────── */
    .toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px}
    .search-box{position:relative;min-width:240px}
    .search-box input{height:36px;width:100%;border:1px solid var(--line);border-radius:9px;padding:0 12px 0 36px;font-size:13px;color:var(--text);outline:none;font-family:inherit;background:var(--surface)}
    .search-box input:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(92,89,242,.1)}
    .search-box::before{content:'🔍';position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;pointer-events:none}

    /* ── MODAL ───────────────────────────────────────────── */
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:100;align-items:center;justify-content:center}
    .modal-overlay.open{display:flex}
    .modal{background:var(--surface);border-radius:16px;padding:28px;width:100%;max-width:480px;box-shadow:0 20px 48px rgba(15,23,42,.18)}
    .modal-title{font-size:18px;font-weight:800;margin-bottom:20px;letter-spacing:-.01em}
    .modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}

    /* ── FORM ────────────────────────────────────────────── */
    .form-group{margin-bottom:16px}
    label{display:block;font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
    input[type=text],input[type=number],select,textarea{width:100%;padding:9px 12px;border:1px solid var(--line);border-radius:9px;font-size:13px;color:var(--text);background:var(--surface);outline:none;transition:border-color .15s;font-family:inherit}
    input:focus,select:focus,textarea:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(92,89,242,.1)}
    .form-hint{font-size:12px;color:var(--muted);margin-top:5px;line-height:1.5}

    /* ── TOGGLE ──────────────────────────────────────────── */
    .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--line-soft)}
    .toggle-row:last-child{border-bottom:none}
    .toggle-label{font-size:14px;font-weight:600}
    .toggle-desc{font-size:12px;color:var(--muted);margin-top:2px}
    .toggle{position:relative;width:40px;height:22px;flex-shrink:0}
    .toggle input{opacity:0;width:0;height:0}
    .toggle-slider{position:absolute;inset:0;background:#cbd5e1;border-radius:99px;cursor:pointer;transition:.2s}
    .toggle-slider:before{content:'';position:absolute;width:16px;height:16px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s}
    .toggle input:checked + .toggle-slider{background:var(--brand)}
    .toggle input:checked + .toggle-slider:before{transform:translateX(18px)}

    /* ── BADGES ──────────────────────────────────────────── */
    .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid}
    .badge-success{background:var(--green-soft);color:#059669;border-color:#a7f3d0}
    .badge-warning{background:var(--amber-soft);color:#b45309;border-color:#fde68a}
    .badge-danger{background:var(--red-soft);color:#dc2626;border-color:#fecaca}
    .badge-brand{background:var(--brand-soft);color:var(--brand);border-color:#c7d2fe}
    .badge-gray{background:#f1f5f9;color:var(--muted);border-color:#e2e8f0}

    /* ── ALERT ───────────────────────────────────────────── */
    .alert{padding:12px 16px;border-radius:10px;font-size:13px;margin-bottom:16px;font-weight:500}
    .alert-error{background:var(--red-soft);color:#b91c1c;border:1px solid #fecaca}
    .alert-success{background:var(--green-soft);color:#065f46;border:1px solid #a7f3d0}
    .loading{color:var(--muted);padding:40px;text-align:center}

    /* ── MEMBER CHIPS ────────────────────────────────────── */
    .member-chip{display:inline-flex;align-items:center;gap:6px;background:#f1f5f9;padding:4px 10px;border-radius:999px;font-size:12px;margin:3px}
    .member-chip button{background:none;border:none;cursor:pointer;color:var(--muted);font-size:14px;line-height:1;padding:0}
    .member-chip button:hover{color:var(--red)}

    /* ── PRICE EDITOR ────────────────────────────────────── */
    .pe-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px;padding:14px 18px;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow)}
    .pe-group-sel{height:36px;padding:0 32px 0 12px;border:1px solid var(--line);border-radius:9px;font-size:13px;font-weight:600;color:var(--text);background:var(--surface);outline:none;cursor:pointer;min-width:220px;font-family:inherit}
    .pe-group-sel:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(92,89,242,.1)}
    .pe-cell{height:34px;width:110px;padding:0 10px;border:1px solid var(--line);border-radius:7px;font-size:13px;font-weight:600;color:var(--text);background:var(--surface);outline:none;text-align:right;font-family:inherit}
    .pe-cell:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(92,89,242,.1);background:#fafaff}
    .pe-cell-sm{width:72px}
    .pe-cell.dirty{border-color:var(--amber);background:#fffdf0}
    .pe-cell.saved{border-color:var(--green);background:var(--green-soft)}
    .pe-empty{text-align:center;padding:64px 24px;color:var(--muted)}
    .pe-empty-icon{font-size:36px;margin-bottom:14px}
    .pe-product-img{width:36px;height:36px;border-radius:7px;object-fit:cover;background:#e2e8f0;flex-shrink:0;vertical-align:middle;margin-right:10px}
    .pe-product-name{font-weight:700;color:var(--text)}
    .pe-sku{font-size:11px;color:var(--muted);margin-top:1px;font-family:monospace}
    .pe-unsaved-dot{width:7px;height:7px;border-radius:50%;background:var(--amber);display:inline-block;margin-right:4px;vertical-align:middle}
    .pe-save-indicator{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:var(--green);opacity:0;transition:opacity .3s}
    .pe-save-indicator.show{opacity:1}
  </style>
</head>
<body>

<!-- NAV -->
<nav class="nav">
  <div class="nav-brand">TradeLayer</div>
  <button class="nav-link active" onclick="navigate('dashboard')">Dashboard</button>
  <button class="nav-link" onclick="navigate('groups')">Customer Groups</button>
  <button class="nav-link" onclick="navigate('pricing')">Pricing Rules</button>
  <button class="nav-link" onclick="navigate('quantity')">Quantity Rules</button>
  <button class="nav-link" onclick="navigate('price-editor')">Price Editor</button>
  <button class="nav-link" onclick="navigate('settings')">Settings</button>
</nav>

<!-- ═══ DASHBOARD ═══════════════════════════════════════════════════════════ -->
<div id="page-dashboard" class="page active">
  <div class="page-header">
    <div>
      <div class="page-title">Dashboard</div>
      <div class="page-subtitle">B2B wholesale pricing engine for Shopify</div>
    </div>
  </div>
  <div class="summary-grid">
    <div class="summary-card" onclick="navigate('groups')">
      <div class="icon">👥</div>
      <div class="label">Customer Groups</div>
      <div class="count" id="dash-groups">—</div>
      <div class="desc">Tag-based or manual B2B buyer segments.</div>
    </div>
    <div class="summary-card" onclick="navigate('pricing')">
      <div class="icon">💰</div>
      <div class="label">Pricing Rules</div>
      <div class="count" id="dash-pricing">—</div>
      <div class="desc">Percentage discounts or fixed prices per group.</div>
    </div>
    <div class="summary-card" onclick="navigate('quantity')">
      <div class="icon">📦</div>
      <div class="label">Quantity Rules</div>
      <div class="count" id="dash-quantity">—</div>
      <div class="desc">Min, step, and max order quantities per product.</div>
    </div>
    <div class="summary-card" onclick="navigate('price-editor')">
      <div class="icon">✏️</div>
      <div class="label">Price Editor</div>
      <div class="count" style="font-size:16px;margin-top:8px;">Open</div>
      <div class="desc">SparkLayer-style spreadsheet editor for bulk price setting.</div>
    </div>
  </div>
</div>

<!-- ═══ CUSTOMER GROUPS ══════════════════════════════════════════════════════ -->
<div id="page-groups" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Customer Groups</div>
      <div class="page-subtitle">Segment B2B buyers. Assign a Shopify tag for automatic matching — no manual member management needed.</div>
    </div>
    <button class="btn btn-primary" onclick="openGroupModal()">+ Create Group</button>
  </div>
  <div id="groups-alert"></div>
  <div class="card">
    <div id="groups-table"><div class="loading">Loading…</div></div>
  </div>
</div>

<!-- ═══ PRICING RULES ════════════════════════════════════════════════════════ -->
<div id="page-pricing" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Pricing Rules</div>
      <div class="page-subtitle">Percentage discounts or fixed prices per group, customer, or product. Use the Price Editor for bulk editing.</div>
    </div>
    <button class="btn btn-primary" onclick="openPricingModal()">+ Create Rule</button>
  </div>
  <div id="pricing-alert"></div>
  <div class="card">
    <div id="pricing-table"><div class="loading">Loading…</div></div>
  </div>
</div>

<!-- ═══ QUANTITY RULES ═══════════════════════════════════════════════════════ -->
<div id="page-quantity" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Quantity Rules</div>
      <div class="page-subtitle">Minimum, step, and maximum order quantities per product or variant.</div>
    </div>
    <button class="btn btn-primary" onclick="openQuantityModal()">+ Create Rule</button>
  </div>
  <div id="quantity-alert"></div>
  <div class="card">
    <div id="quantity-table"><div class="loading">Loading…</div></div>
  </div>
</div>

<!-- ═══ PRICE EDITOR ══════════════════════════════════════════════════════════ -->
<div id="page-price-editor" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Price Editor</div>
      <div class="page-subtitle">Edit B2B prices and quantities across your full catalog. Pick a customer group, then edit inline.</div>
    </div>
  </div>
  <div id="pe-alert"></div>

  <!-- Toolbar -->
  <div class="pe-toolbar">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <select id="pe-group-sel" class="pe-group-sel" onchange="peSelectGroup(this.value)">
        <option value="">Select customer group…</option>
      </select>
      <div class="search-box">
        <input type="text" id="pe-search" placeholder="Search products…" oninput="peFilter()" autocomplete="off">
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span id="pe-dirty-badge" style="display:none" class="badge badge-warning">0 unsaved</span>
      <button class="btn btn-sm" onclick="peDiscard()">Discard</button>
      <button class="btn btn-primary btn-sm" onclick="peSaveAll()">Save changes</button>
    </div>
  </div>

  <!-- Spreadsheet -->
  <div class="card">
    <div class="table-wrap">
      <div id="pe-table">
        <div class="pe-empty">
          <div class="pe-empty-icon">👥</div>
          Select a customer group above to start editing prices.
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ SETTINGS ═════════════════════════════════════════════════════════════ -->
<div id="page-settings" class="page">
  <div class="page-header">
    <div>
      <div class="page-title">Settings</div>
      <div class="page-subtitle">Configure how TradeLayer behaves in your storefront.</div>
    </div>
  </div>
  <div id="settings-alert"></div>
  <div class="card" style="padding:24px;max-width:600px">
    <div id="settings-loading" class="loading">Loading…</div>
    <div id="settings-form" style="display:none">
      <div class="toggle-row">
        <div><div class="toggle-label">Login-based pricing</div><div class="toggle-desc">Only show B2B prices to logged-in customers.</div></div>
        <label class="toggle"><input type="checkbox" id="s-loginBased"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div><div class="toggle-label">Hide price for guests</div><div class="toggle-desc">Show a message instead of prices for non-logged-in visitors.</div></div>
        <label class="toggle"><input type="checkbox" id="s-hideGuests"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div style="flex:1;margin-right:24px">
          <div class="toggle-label">Hidden price message</div>
          <div class="toggle-desc">Text shown when prices are hidden.</div>
          <input type="text" id="s-hideMsg" placeholder="Login to see wholesale prices" style="margin-top:8px">
        </div>
      </div>
      <div class="toggle-row">
        <div><div class="toggle-label">Quick Order enabled</div><div class="toggle-desc">Show a quick-order form on product and collection pages.</div></div>
        <label class="toggle"><input type="checkbox" id="s-quickOrder"><span class="toggle-slider"></span></label>
      </div>
      <div style="margin-top:20px"><button class="btn btn-primary" onclick="saveSettings()">Save Settings</button></div>
    </div>
  </div>
</div>

<!-- ═══ MODALS ════════════════════════════════════════════════════════════════ -->

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
    <div class="form-group">
      <label>Shopify Customer Tag</label>
      <input type="text" id="g-tag" placeholder="e.g. wholesale, b2b, vip">
      <div class="form-hint">Any Shopify customer with this tag is automatically matched to this group — no manual member management needed.</div>
    </div>
    <div id="modal-group-alert"></div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal('modal-group')">Cancel</button>
      <button class="btn btn-primary" onclick="saveGroup()">Save</button>
    </div>
  </div>
</div>

<!-- Group members modal -->
<div class="modal-overlay" id="modal-members">
  <div class="modal" style="max-width:520px">
    <div class="modal-title" id="modal-members-title">Group Members</div>
    <div id="members-list" style="margin-bottom:16px;min-height:40px"></div>
    <div class="form-group">
      <label>Add Member by Customer ID</label>
      <div style="display:flex;gap:8px">
        <input type="text" id="m-customerId" placeholder="e.g. 8957206986978">
        <button class="btn btn-primary btn-sm" onclick="addMember()">Add</button>
      </div>
      <div class="form-hint">Use numeric Shopify customer ID. Found in Shopify Admin → Customers → URL.</div>
    </div>
    <div id="modal-members-alert"></div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal('modal-members')">Close</button>
    </div>
  </div>
</div>

<!-- Pricing rule modal -->
<div class="modal-overlay" id="modal-pricing">
  <div class="modal">
    <div class="modal-title" id="modal-pricing-title">Create Pricing Rule</div>
    <div class="form-group">
      <label>Customer Group</label>
      <select id="p-groupId"><option value="">— Any group —</option></select>
    </div>
    <div class="form-group">
      <label>Shopify Product ID</label>
      <input type="text" id="p-productId" placeholder="gid://shopify/Product/12345">
      <div class="form-hint">Leave blank to apply to all products in this group.</div>
    </div>
    <div class="form-group">
      <label>Shopify Variant ID</label>
      <input type="text" id="p-variantId" placeholder="Optional — leave blank for all variants">
    </div>
    <div class="form-group">
      <label>Rule Type *</label>
      <select id="p-ruleType">
        <option value="percentage_discount">Percentage Discount (%)</option>
        <option value="fixed_price">Fixed Price</option>
      </select>
    </div>
    <div class="form-group">
      <label>Value *</label>
      <input type="number" id="p-value" placeholder="e.g. 20 for 20% off or 9.99 for fixed price" step="0.01" min="0">
    </div>
    <div class="form-group">
      <label>Priority</label>
      <input type="number" id="p-priority" value="0" min="0">
      <div class="form-hint">Higher number = higher priority when multiple rules match.</div>
    </div>
    <div id="modal-pricing-alert"></div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal('modal-pricing')">Cancel</button>
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
      <input type="text" id="q-variantId" placeholder="Optional — leave blank for all variants">
    </div>
    <div class="form-group">
      <label>Minimum Quantity</label>
      <input type="number" id="q-min" value="1" min="1">
    </div>
    <div class="form-group">
      <label>Step Quantity</label>
      <input type="number" id="q-step" value="1" min="1">
      <div class="form-hint">Customers must buy in multiples of this number.</div>
    </div>
    <div class="form-group">
      <label>Maximum Quantity</label>
      <input type="number" id="q-max" placeholder="Leave blank for unlimited" min="1">
    </div>
    <div id="modal-quantity-alert"></div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal('modal-quantity')">Cancel</button>
      <button class="btn btn-primary" onclick="saveQuantityRule()">Save</button>
    </div>
  </div>
</div>

<script>
// ─── Global state ─────────────────────────────────────────────────────────────
let _groups = [];
let _editingGroupId = null;
let _editingPricingId = null;
let _editingQuantityId = null;
let _membersGroupId = null;
let _pricingRules = [];
let _quantityRules = [];

// Price Editor state
let _peGroupId = '';
let _peProducts = [];
let _pePricingRules = [];
let _peQtyRules = [];
let _peChanges = {};  // numericProductId → { price?, moq?, step?, ruleType? }
let _peFilterQuery = '';
let _peLoaded = false;

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function getToken() {
  try { if (window.shopify) return await window.shopify.idToken(); } catch(e) {}
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
  if (page === 'dashboard')    loadDashboard();
  if (page === 'groups')       loadGroups();
  if (page === 'pricing')      loadPricingRules();
  if (page === 'quantity')     loadQuantityRules();
  if (page === 'price-editor') loadPriceEditor();
  if (page === 'settings')     loadSettings();
}

function showAlert(elId, msg, type = 'error') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<div class="alert alert-' + type + '">' + esc(msg) + '</div>';
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const [g, p, q] = await Promise.all([
      apiFetch('/api/customer-groups'),
      apiFetch('/api/pricing-rules'),
      apiFetch('/api/quantity-rules'),
    ]);
    document.getElementById('dash-groups').textContent  = (g.customerGroups || []).length;
    document.getElementById('dash-pricing').textContent = (p.pricingRules || []).length;
    document.getElementById('dash-quantity').textContent= (q.quantityRules || []).length;
  } catch(e) {}
}

// ─── Customer Groups ──────────────────────────────────────────────────────────
async function loadGroups() {
  document.getElementById('groups-table').innerHTML = '<div class="loading">Loading\u2026</div>';
  try {
    const data = await apiFetch('/api/customer-groups');
    _groups = data.customerGroups || [];
    renderGroupsTable();
  } catch(e) {
    document.getElementById('groups-table').innerHTML = '<div class="loading" style="color:var(--red)">Failed to load: ' + esc(e.message) + '</div>';
  }
}

function renderGroupsTable() {
  if (!_groups.length) {
    document.getElementById('groups-table').innerHTML = '<table><thead><tr><th>Name</th><th>Tag</th><th>Description</th><th>Members</th><th>Status</th><th></th></tr></thead><tbody><tr class="empty-row"><td colspan="6">No customer groups yet. Create one to get started.</td></tr></tbody></table>';
    return;
  }
  const rows = _groups.map(g => \`<tr>
    <td>
      <div style="font-weight:700">\${esc(g.name)}</div>
      \${g.description ? \`<div style="font-size:12px;color:var(--muted);margin-top:2px">\${esc(g.description)}</div>\` : ''}
    </td>
    <td>\${g.shopifyTag ? \`<span class="badge badge-brand" style="font-family:monospace">#\${esc(g.shopifyTag)}</span>\` : '<span style="color:var(--subtle)">—</span>'}</td>
    <td>\${g.description ? esc(g.description) : '<span style="color:var(--subtle)">—</span>'}</td>
    <td><button class="btn-link" onclick="openMembersModal('\${g.id}','\${esc(g.name)}')">\${g._count?.members ?? 0} members</button></td>
    <td><span class="badge \${g.isActive ? 'badge-success' : 'badge-gray'}">\${g.isActive ? 'Active' : 'Inactive'}</span></td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-sm" onclick="editGroup('\${g.id}')">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteGroup('\${g.id}')">Delete</button>
    </td>
  </tr>\`).join('');
  document.getElementById('groups-table').innerHTML = '<table><thead><tr><th>Name</th><th>Tag</th><th>Description</th><th>Members</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function openGroupModal(g = null) {
  _editingGroupId = g ? g.id : null;
  document.getElementById('modal-group-title').textContent = g ? 'Edit Customer Group' : 'Create Customer Group';
  document.getElementById('g-name').value = g ? g.name : '';
  document.getElementById('g-desc').value = g ? (g.description || '') : '';
  document.getElementById('g-tag').value  = g ? (g.shopifyTag || '') : '';
  document.getElementById('modal-group-alert').innerHTML = '';
  document.getElementById('modal-group').classList.add('open');
}

function editGroup(id) { const g = _groups.find(x => x.id === id); if (g) openGroupModal(g); }

async function saveGroup() {
  const name        = document.getElementById('g-name').value.trim();
  const description = document.getElementById('g-desc').value.trim();
  const shopifyTag  = document.getElementById('g-tag').value.trim();
  if (!name) { showAlert('modal-group-alert', 'Name is required.'); return; }
  try {
    const body = { name, description, shopifyTag: shopifyTag || null };
    if (_editingGroupId) {
      await apiFetch('/api/customer-groups/' + _editingGroupId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiFetch('/api/customer-groups', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('modal-group');
    loadGroups();
  } catch(e) { showAlert('modal-group-alert', e.message); }
}

async function deleteGroup(id) {
  if (!confirm('Delete this group? All its members will also be removed.')) return;
  try {
    await apiFetch('/api/customer-groups/' + id, { method: 'DELETE' });
    loadGroups();
  } catch(e) { showAlert('groups-alert', e.message); }
}

// Members
async function openMembersModal(groupId, groupName) {
  _membersGroupId = groupId;
  document.getElementById('modal-members-title').textContent = groupName + ' \u2014 Members';
  document.getElementById('m-customerId').value = '';
  document.getElementById('modal-members-alert').innerHTML = '';
  document.getElementById('modal-members').classList.add('open');
  loadMembers();
}

async function loadMembers() {
  document.getElementById('members-list').innerHTML = '<span style="font-size:13px;color:var(--muted)">Loading\u2026</span>';
  try {
    const data = await apiFetch('/api/customer-groups');
    // Fallback: we don't have a get-members endpoint, show count
    const group = (data.customerGroups || []).find(g => g.id === _membersGroupId);
    if (group) {
      document.getElementById('members-list').innerHTML = '<span style="font-size:13px;color:var(--muted)">' + (group._count?.members ?? 0) + ' member(s). Use the form below to add members by ID.</span>';
    }
  } catch(e) {}
}

async function addMember() {
  const shopifyCustomerId = document.getElementById('m-customerId').value.trim();
  if (!shopifyCustomerId) { showAlert('modal-members-alert', 'Customer ID is required.'); return; }
  try {
    await apiFetch('/api/customer-groups/' + _membersGroupId + '/members', {
      method: 'POST', body: JSON.stringify({ shopifyCustomerId }),
    });
    document.getElementById('m-customerId').value = '';
    showAlert('modal-members-alert', 'Member added.', 'success');
    loadGroups();
    loadMembers();
  } catch(e) { showAlert('modal-members-alert', e.message); }
}

async function removeMember(memberId, customerId) {
  try {
    await apiFetch('/api/customer-groups/' + _membersGroupId + '/members/' + encodeURIComponent(customerId), { method: 'DELETE' });
    loadGroups();
    closeModal('modal-members');
  } catch(e) { showAlert('modal-members-alert', e.message); }
}

// ─── Pricing Rules ────────────────────────────────────────────────────────────
async function loadPricingRules() {
  document.getElementById('pricing-table').innerHTML = '<div class="loading">Loading\u2026</div>';
  try {
    const [pd, gd] = await Promise.all([apiFetch('/api/pricing-rules'), apiFetch('/api/customer-groups')]);
    _pricingRules = pd.pricingRules || [];
    _groups = gd.customerGroups || [];
    renderPricingTable();
  } catch(e) {
    document.getElementById('pricing-table').innerHTML = '<div class="loading" style="color:var(--red)">Failed: ' + esc(e.message) + '</div>';
  }
}

function renderPricingTable() {
  if (!_pricingRules.length) {
    document.getElementById('pricing-table').innerHTML = '<table><thead><tr><th>Group</th><th>Scope</th><th>Type</th><th>Value</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody><tr class="empty-row"><td colspan="7">No pricing rules yet.</td></tr></tbody></table>';
    return;
  }
  const rows = _pricingRules.map(r => \`<tr>
    <td>\${r.customerGroup ? esc(r.customerGroup.name) : r.shopifyCustomerId ? '<span class="badge badge-gray">Customer</span>' : '\u2014'}</td>
    <td>\${r.shopifyVariantId ? 'Variant' : r.shopifyProductId ? 'Product' : 'All products'}</td>
    <td><span class="badge \${r.ruleType === 'percentage_discount' ? 'badge-brand' : 'badge-success'}">\${r.ruleType === 'percentage_discount' ? '% Discount' : 'Fixed Price'}</span></td>
    <td><strong>\${r.ruleType === 'percentage_discount' ? r.value + '%' : '$' + r.value}</strong></td>
    <td>\${r.priority}</td>
    <td><span class="badge \${r.isActive ? 'badge-success' : 'badge-gray'}">\${r.isActive ? 'Active' : 'Off'}</span></td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-sm" onclick="editPricingRule('\${r.id}')">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deletePricingRule('\${r.id}')">Delete</button>
    </td>
  </tr>\`).join('');
  document.getElementById('pricing-table').innerHTML = '<table><thead><tr><th>Group</th><th>Scope</th><th>Type</th><th>Value</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function openPricingModal(r = null) {
  _editingPricingId = r ? r.id : null;
  document.getElementById('modal-pricing-title').textContent = r ? 'Edit Pricing Rule' : 'Create Pricing Rule';
  const sel = document.getElementById('p-groupId');
  sel.innerHTML = '<option value="">— Any group —</option>' + _groups.map(g => \`<option value="\${g.id}" \${r && r.customerGroupId === g.id ? 'selected' : ''}>\${esc(g.name)}</option>\`).join('');
  document.getElementById('p-productId').value = r ? (r.shopifyProductId || '') : '';
  document.getElementById('p-variantId').value = r ? (r.shopifyVariantId || '') : '';
  document.getElementById('p-ruleType').value  = r ? r.ruleType : 'percentage_discount';
  document.getElementById('p-value').value     = r ? r.value : '';
  document.getElementById('p-priority').value  = r ? r.priority : 0;
  document.getElementById('modal-pricing-alert').innerHTML = '';
  document.getElementById('modal-pricing').classList.add('open');
}

function editPricingRule(id) { const r = _pricingRules.find(x => x.id === id); if (r) openPricingModal(r); }

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
  } catch(e) { showAlert('modal-pricing-alert', e.message); }
}

async function deletePricingRule(id) {
  if (!confirm('Delete this pricing rule?')) return;
  try {
    await apiFetch('/api/pricing-rules/' + id, { method: 'DELETE' });
    loadPricingRules();
  } catch(e) { showAlert('pricing-alert', e.message); }
}

// ─── Quantity Rules ───────────────────────────────────────────────────────────
async function loadQuantityRules() {
  document.getElementById('quantity-table').innerHTML = '<div class="loading">Loading\u2026</div>';
  try {
    const data = await apiFetch('/api/quantity-rules');
    _quantityRules = data.quantityRules || [];
    renderQuantityTable();
  } catch(e) {
    document.getElementById('quantity-table').innerHTML = '<div class="loading" style="color:var(--red)">Failed: ' + esc(e.message) + '</div>';
  }
}

function renderQuantityTable() {
  if (!_quantityRules.length) {
    document.getElementById('quantity-table').innerHTML = '<table><thead><tr><th>Product ID</th><th>Variant ID</th><th>Min</th><th>Step</th><th>Max</th><th>Status</th><th></th></tr></thead><tbody><tr class="empty-row"><td colspan="7">No quantity rules yet.</td></tr></tbody></table>';
    return;
  }
  const rows = _quantityRules.map(r => \`<tr>
    <td style="font-family:monospace;font-size:12px">\${esc(r.shopifyProductId || '\u2014')}</td>
    <td style="font-family:monospace;font-size:12px">\${esc(r.shopifyVariantId || '\u2014')}</td>
    <td><strong>\${r.minQuantity}</strong></td>
    <td>\${r.stepQuantity}</td>
    <td>\${r.maxQuantity ?? '\u2014'}</td>
    <td><span class="badge \${r.isActive ? 'badge-success' : 'badge-gray'}">\${r.isActive ? 'Active' : 'Off'}</span></td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-sm" onclick="editQuantityRule('\${r.id}')">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteQuantityRule('\${r.id}')">Delete</button>
    </td>
  </tr>\`).join('');
  document.getElementById('quantity-table').innerHTML = '<table><thead><tr><th>Product ID</th><th>Variant ID</th><th>Min</th><th>Step</th><th>Max</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function openQuantityModal(r = null) {
  _editingQuantityId = r ? r.id : null;
  document.getElementById('modal-quantity-title').textContent = r ? 'Edit Quantity Rule' : 'Create Quantity Rule';
  document.getElementById('q-productId').value = r ? (r.shopifyProductId || '') : '';
  document.getElementById('q-variantId').value = r ? (r.shopifyVariantId || '') : '';
  document.getElementById('q-min').value  = r ? r.minQuantity : 1;
  document.getElementById('q-step').value = r ? r.stepQuantity : 1;
  document.getElementById('q-max').value  = r ? (r.maxQuantity ?? '') : '';
  document.getElementById('modal-quantity-alert').innerHTML = '';
  document.getElementById('modal-quantity').classList.add('open');
}

function editQuantityRule(id) { const r = _quantityRules.find(x => x.id === id); if (r) openQuantityModal(r); }

async function saveQuantityRule() {
  const shopifyProductId = document.getElementById('q-productId').value.trim();
  if (!shopifyProductId) { showAlert('modal-quantity-alert', 'Product ID is required.'); return; }
  const maxVal = document.getElementById('q-max').value.trim();
  const body = {
    shopifyProductId,
    shopifyVariantId: document.getElementById('q-variantId').value.trim() || null,
    minQuantity:  parseInt(document.getElementById('q-min').value) || 1,
    stepQuantity: parseInt(document.getElementById('q-step').value) || 1,
    maxQuantity:  maxVal ? parseInt(maxVal) : null,
  };
  try {
    if (_editingQuantityId) {
      await apiFetch('/api/quantity-rules/' + _editingQuantityId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiFetch('/api/quantity-rules', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('modal-quantity');
    loadQuantityRules();
  } catch(e) { showAlert('modal-quantity-alert', e.message); }
}

async function deleteQuantityRule(id) {
  if (!confirm('Delete this quantity rule?')) return;
  try {
    await apiFetch('/api/quantity-rules/' + id, { method: 'DELETE' });
    loadQuantityRules();
  } catch(e) { showAlert('quantity-alert', e.message); }
}

// ─── Price Editor ─────────────────────────────────────────────────────────────

// Helper: extract numeric ID from GID or plain numeric string
function peNumId(id) {
  if (!id) return null;
  const m = String(id).match(/(\d+)$/);
  return m ? m[1] : String(id);
}

async function loadPriceEditor() {
  // Load all data in parallel if not yet loaded
  if (!_peLoaded) {
    document.getElementById('pe-table').innerHTML = '<div class="loading">Loading products and prices\u2026</div>';
    try {
      const [productsData, rulesData, qtyData, groupsData] = await Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/pricing-rules'),
        apiFetch('/api/quantity-rules'),
        apiFetch('/api/customer-groups'),
      ]);
      _peProducts      = productsData.products || [];
      _pePricingRules  = rulesData.pricingRules || [];
      _peQtyRules      = qtyData.quantityRules || [];
      _groups          = groupsData.customerGroups || [];
      _peLoaded        = true;
    } catch(e) {
      document.getElementById('pe-table').innerHTML = '<div class="loading" style="color:var(--red)">Failed to load: ' + esc(e.message) + '</div>';
      return;
    }
  }

  // Populate group selector
  const sel = document.getElementById('pe-group-sel');
  sel.innerHTML = '<option value="">Select customer group\u2026</option>' +
    _groups.map(g => \`<option value="\${g.id}" \${_peGroupId === g.id ? 'selected' : ''}>\${esc(g.name)}\${g.shopifyTag ? ' (#' + esc(g.shopifyTag) + ')' : ''}</option>\`).join('');

  renderPeTable();
}

function peSelectGroup(groupId) {
  _peGroupId = groupId;
  _peChanges = {};
  peUpdateDirtyBadge();
  renderPeTable();
}

function peFilter() {
  _peFilterQuery = document.getElementById('pe-search').value.trim().toLowerCase();
  renderPeTable();
}

function renderPeTable() {
  const el = document.getElementById('pe-table');

  if (!_peGroupId) {
    el.innerHTML = '<div class="pe-empty"><div class="pe-empty-icon">👥</div>Select a customer group above to start editing prices.</div>';
    return;
  }

  const filtered = _peProducts.filter(p => {
    if (!_peFilterQuery) return true;
    const firstVariant = (p.variants || [])[0] || {};
    return String(p.title).toLowerCase().includes(_peFilterQuery) ||
           String(firstVariant.sku || '').toLowerCase().includes(_peFilterQuery);
  });

  if (!filtered.length) {
    el.innerHTML = '<div class="pe-empty"><div class="pe-empty-icon">🔍</div>No products match your search.</div>';
    return;
  }

  const rows = filtered.map(p => {
    const numId   = peNumId(p.id);
    const variant = (p.variants || [])[0] || {};
    const sku     = variant.sku || '\u2014';
    const shopifyPrice = parseFloat(variant.price || '0');

    // Current pricing rule for this product+group
    const rule = _pePricingRules.find(r =>
      r.customerGroupId === _peGroupId &&
      r.shopifyProductId &&
      peNumId(r.shopifyProductId) === numId
    );

    // Current qty rule for this product
    const qtyRule = _peQtyRules.find(r => peNumId(r.shopifyProductId) === numId);

    // Current cell values (changes override DB values)
    const ch = _peChanges[numId] || {};

    // B2B price — if rule is % discount, compute fixed equivalent; if fixed, use directly
    let currentB2bPrice = '';
    if (ch.price !== undefined) {
      currentB2bPrice = ch.price;
    } else if (rule) {
      if (rule.ruleType === 'fixed_price') {
        currentB2bPrice = parseFloat(rule.value).toFixed(2);
      } else {
        // percentage_discount → show computed fixed price
        currentB2bPrice = (shopifyPrice * (1 - parseFloat(rule.value) / 100)).toFixed(2);
      }
    }

    const currentMoq  = ch.moq  !== undefined ? ch.moq  : (qtyRule ? qtyRule.minQuantity  : '');
    const currentStep = ch.step !== undefined ? ch.step : (qtyRule ? qtyRule.stepQuantity : '');

    const isDirty = ch.price !== undefined || ch.moq !== undefined || ch.step !== undefined;

    // Margin badge
    const marginBadge = peMarginBadge(shopifyPrice, currentB2bPrice !== '' ? parseFloat(currentB2bPrice) : null);

    const imgHtml = p.image
      ? \`<img class="pe-product-img" src="\${esc(p.image)}" onerror="this.style.display='none'">\`
      : '<span style="display:inline-block;width:36px;height:36px;border-radius:7px;background:#e2e8f0;margin-right:10px;vertical-align:middle"></span>';

    return \`<tr id="pe-row-\${numId}" \${isDirty ? 'style="background:#fffdf7"' : ''}>
      <td><input type="checkbox" style="accent-color:var(--brand)"></td>
      <td>
        \${imgHtml}
        <span class="pe-product-name">\${esc(p.title)}</span>
        \${isDirty ? '<span class="pe-unsaved-dot" title="Unsaved changes"></span>' : ''}
      </td>
      <td><span class="pe-sku">\${esc(sku)}</span></td>
      <td style="font-weight:600">\${shopifyPrice > 0 ? '$' + shopifyPrice.toFixed(2) : '\u2014'}</td>
      <td>
        <input class="pe-cell \${isDirty && ch.price !== undefined ? 'dirty' : ''}"
          id="pe-price-\${numId}" type="number" step="0.01" min="0"
          value="\${esc(String(currentB2bPrice))}" placeholder="B2B price"
          oninput="peCellChange('\${numId}', 'price', this.value)"
          onblur="peCellBlur('\${numId}', 'price')">
      </td>
      <td>
        <input class="pe-cell pe-cell-sm \${isDirty && ch.moq !== undefined ? 'dirty' : ''}"
          id="pe-moq-\${numId}" type="number" min="1" step="1"
          value="\${esc(String(currentMoq))}" placeholder="1"
          oninput="peCellChange('\${numId}', 'moq', this.value)">
      </td>
      <td>
        <input class="pe-cell pe-cell-sm \${isDirty && ch.step !== undefined ? 'dirty' : ''}"
          id="pe-step-\${numId}" type="number" min="1" step="1"
          value="\${esc(String(currentStep))}" placeholder="1"
          oninput="peCellChange('\${numId}', 'step', this.value)">
      </td>
      <td>\${marginBadge}</td>
    </tr>\`;
  }).join('');

  el.innerHTML = \`<table>
    <thead><tr>
      <th style="width:36px"><input type="checkbox" style="accent-color:var(--brand)"></th>
      <th>Product</th>
      <th>SKU</th>
      <th>Shopify Price</th>
      <th>Customer Price</th>
      <th>MOQ</th>
      <th>Step</th>
      <th>Margin</th>
    </tr></thead>
    <tbody>\${rows}</tbody>
  </table>\`;
}

function peMarginBadge(shopifyPrice, b2bPrice) {
  if (b2bPrice === null || b2bPrice <= 0 || shopifyPrice <= 0) return '<span class="badge badge-gray">\u2014</span>';
  const discountPct = (1 - b2bPrice / shopifyPrice) * 100;
  if (discountPct < 0) return '<span class="badge badge-danger">Above retail</span>';
  if (discountPct <= 25) return \`<span class="badge badge-success">Safe \u2212\${discountPct.toFixed(0)}%</span>\`;
  if (discountPct <= 45) return \`<span class="badge badge-warning">Low \u2212\${discountPct.toFixed(0)}%</span>\`;
  return \`<span class="badge badge-danger">Warning \u2212\${discountPct.toFixed(0)}%</span>\`;
}

function peCellChange(numId, field, value) {
  if (!_peChanges[numId]) _peChanges[numId] = {};
  _peChanges[numId][field] = value;
  // Mark input dirty
  const inputEl = document.getElementById('pe-' + field + '-' + numId);
  if (inputEl) inputEl.classList.add('dirty');
  // Update margin live when price changes
  if (field === 'price') {
    const product = _peProducts.find(p => peNumId(p.id) === numId);
    if (product) {
      const shopifyPrice = parseFloat(((product.variants || [])[0] || {}).price || '0');
      const rowEl = document.getElementById('pe-row-' + numId);
      if (rowEl) {
        const lastTd = rowEl.querySelector('td:last-child');
        if (lastTd) lastTd.innerHTML = peMarginBadge(shopifyPrice, parseFloat(value));
      }
    }
  }
  peUpdateDirtyBadge();
}

function peCellBlur(numId, field) {
  // Remove dirty class if value matches original (user cleared)
  const inputEl = document.getElementById('pe-' + field + '-' + numId);
  if (inputEl && inputEl.value === '') {
    delete (_peChanges[numId] || {})[field];
    if (_peChanges[numId] && Object.keys(_peChanges[numId]).length === 0) delete _peChanges[numId];
    inputEl.classList.remove('dirty');
    peUpdateDirtyBadge();
  }
}

function peUpdateDirtyBadge() {
  const count = Object.keys(_peChanges).length;
  const badge = document.getElementById('pe-dirty-badge');
  if (!badge) return;
  if (count === 0) {
    badge.style.display = 'none';
  } else {
    badge.style.display = 'inline-flex';
    badge.textContent = count + ' unsaved';
  }
}

async function peSaveAll() {
  const entries = Object.entries(_peChanges);
  if (!entries.length) { showAlert('pe-alert', 'No changes to save.', 'success'); return; }

  const saveBtn = document.querySelector('.pe-toolbar .btn-primary');
  if (saveBtn) { saveBtn.textContent = 'Saving\u2026'; saveBtn.disabled = true; }

  let saved = 0, failed = 0;

  for (const [numId, ch] of entries) {
    const product = _peProducts.find(p => peNumId(p.id) === numId);
    if (!product) continue;
    const gid = 'gid://shopify/Product/' + numId;

    try {
      // Save pricing rule if price changed
      if (ch.price !== undefined && ch.price !== '') {
        await apiFetch('/api/pricing-rules/quick-update', {
          method: 'PUT',
          body: JSON.stringify({ shopifyProductId: gid, customerGroupId: _peGroupId, ruleType: 'fixed_price', value: parseFloat(ch.price) }),
        });
      }
      // Save qty rule if MOQ or step changed
      if (ch.moq !== undefined || ch.step !== undefined) {
        const existing = _peQtyRules.find(r => peNumId(r.shopifyProductId) === numId);
        const body = {
          shopifyProductId: gid,
          minQuantity:  parseInt(ch.moq  !== undefined ? ch.moq  : (existing ? existing.minQuantity  : 1)) || 1,
          stepQuantity: parseInt(ch.step !== undefined ? ch.step : (existing ? existing.stepQuantity : 1)) || 1,
        };
        await apiFetch('/api/quantity-rules/quick-update', { method: 'PUT', body: JSON.stringify(body) });
      }
      // Flash saved on input
      ['price','moq','step'].forEach(f => {
        const el = document.getElementById('pe-' + f + '-' + numId);
        if (el) { el.classList.remove('dirty'); el.classList.add('saved'); setTimeout(() => el.classList.remove('saved'), 1500); }
      });
      saved++;
    } catch(e) {
      failed++;
    }
  }

  // Reload fresh data
  try {
    const [rulesData, qtyData] = await Promise.all([apiFetch('/api/pricing-rules'), apiFetch('/api/quantity-rules')]);
    _pePricingRules = rulesData.pricingRules || [];
    _peQtyRules     = qtyData.quantityRules || [];
  } catch(e) {}

  _peChanges = {};
  peUpdateDirtyBadge();
  renderPeTable();

  if (saveBtn) { saveBtn.textContent = 'Save changes'; saveBtn.disabled = false; }
  showAlert('pe-alert', saved + ' row(s) saved' + (failed ? ', ' + failed + ' failed.' : '.'), failed ? 'error' : 'success');
}

function peDiscard() {
  _peChanges = {};
  peUpdateDirtyBadge();
  renderPeTable();
}

// ─── Settings ─────────────────────────────────────────────────────────────────
async function loadSettings() {
  document.getElementById('settings-loading').style.display = 'block';
  document.getElementById('settings-form').style.display = 'none';
  try {
    const data = await apiFetch('/api/settings');
    const s = data.settings;
    document.getElementById('s-loginBased').checked  = !!s.loginBasedPricing;
    document.getElementById('s-hideGuests').checked  = !!s.hidePriceForGuests;
    document.getElementById('s-hideMsg').value       = s.hidePriceMessage || '';
    document.getElementById('s-quickOrder').checked  = !!s.quickOrderEnabled;
    document.getElementById('settings-loading').style.display = 'none';
    document.getElementById('settings-form').style.display = 'block';
  } catch(e) {
    document.getElementById('settings-loading').innerHTML = '<span style="color:var(--red)">Failed to load settings: ' + esc(e.message) + '</span>';
  }
}

async function saveSettings() {
  const body = {
    loginBasedPricing: document.getElementById('s-loginBased').checked,
    hidePriceForGuests: document.getElementById('s-hideGuests').checked,
    hidePriceMessage:  document.getElementById('s-hideMsg').value.trim() || null,
    quickOrderEnabled: document.getElementById('s-quickOrder').checked,
  };
  try {
    await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(body) });
    showAlert('settings-alert', 'Settings saved.', 'success');
  } catch(e) { showAlert('settings-alert', e.message); }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

loadDashboard();
</script>
</body>
</html>`;
}
