const API = '/api/products';
const $ = (id) => document.getElementById(id);
const fields = ['product_name', 'brand', 'category', 'price', 'stock_quantity', 'description'];
let products = [];

function esc(text) {
  const d = document.createElement('div');
  d.textContent = text ?? '';
  return d.innerHTML.replace(/"/g, '&quot;');
}

function money(n) {
  return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toast(message, type = 'success') {
  const t = $('toast');
  t.textContent = message;
  t.className = `toast show ${type === 'error' ? 'error' : ''}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.className = 'toast'), 2800);
}

/* ---------- Login (visual demo only) ---------- */
function showApp() {
  $('loginScreen').classList.add('hidden');
  $('app').classList.remove('hidden');
  loadProducts();
}

$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if ($('username').value.trim() === 'admin' && $('password').value === 'admin123') {
    sessionStorage.setItem('loggedIn', 'yes');
    $('loginError').textContent = '';
    showApp();
  } else {
    $('loginError').textContent = 'Wrong username or password';
  }
});

$('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('loggedIn');
  location.reload();
});

if (sessionStorage.getItem('loggedIn') === 'yes') showApp();

/* ---------- Read ---------- */
async function loadProducts() {
  try {
    const res = await fetch(API);
    products = await res.json();
    render();
  } catch (err) {
    toast('Could not load products', 'error');
  }
}

function render() {
  const current = $('categoryFilter').value;
  const cats = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  $('categoryFilter').innerHTML =
    '<option value="">All categories</option>' +
    cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  $('categoryFilter').value = cats.includes(current) ? current : '';

  const q = $('search').value.trim().toLowerCase();
  const cat = $('categoryFilter').value;
  const shown = products.filter(
    (p) =>
      (!cat || p.category === cat) &&
      (!q || [p.product_name, p.brand, p.category, p.description].some((v) => (v || '').toLowerCase().includes(q)))
  );

  $('statCount').textContent = products.length;
  $('statStock').textContent = products.reduce((s, p) => s + (p.stock_quantity || 0), 0);
  $('statValue').textContent = money(products.reduce((s, p) => s + (p.price || 0) * (p.stock_quantity || 0), 0));
  $('resultCount').textContent = `Showing ${shown.length} of ${products.length} products`;

  $('tableBody').innerHTML = shown.length
    ? shown.map((p) => `
      <tr>
        <td>#${p.id}</td>
        <td class="name">${esc(p.product_name)}</td>
        <td>${esc(p.brand)}</td>
        <td>${p.category ? `<span class="badge">${esc(p.category)}</span>` : ''}</td>
        <td>${p.price != null ? money(p.price) : ''}</td>
        <td><span class="stock ${(p.stock_quantity ?? 0) <= 10 ? 'low' : ''}">${p.stock_quantity ?? 0}</span></td>
        <td class="desc">${esc(p.description)}</td>
        <td class="actions">
          <button class="btn-sm edit" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn-sm del" data-action="delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="8" class="empty">No products found</td></tr>';
}

$('search').addEventListener('input', render);
$('categoryFilter').addEventListener('change', render);

/* ---------- Create + Update ---------- */
$('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('id').value;
  const body = {};
  fields.forEach((f) => (body[f] = $(f).value.trim()));
  body.price = body.price === '' ? null : Number(body.price);
  body.stock_quantity = body.stock_quantity === '' ? null : Number(body.stock_quantity);

  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error || 'Something went wrong', 'error');
    toast(id ? 'Product updated ✔' : 'Product added ✔');
    resetForm();
    loadProducts();
  } catch (err) {
    toast('Network error', 'error');
  }
});

/* ---------- Edit + Delete buttons ---------- */
$('tableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === 'edit') editProduct(id);
  if (btn.dataset.action === 'delete') deleteProduct(id);
});

function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  $('id').value = p.id;
  fields.forEach((f) => ($(f).value = p[f] ?? ''));
  $('formTitle').textContent = `Edit Product #${p.id}`;
  $('saveBtn').textContent = 'Update Product';
  $('cancelBtn').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return toast(data.error || 'Could not delete', 'error');
    toast('Product deleted 🗑');
    loadProducts();
  } catch (err) {
    toast('Network error', 'error');
  }
}

function resetForm() {
  $('productForm').reset();
  $('id').value = '';
  $('formTitle').textContent = 'Add New Product';
  $('saveBtn').textContent = 'Add Product';
  $('cancelBtn').classList.add('hidden');
}

$('cancelBtn').addEventListener('click', resetForm);