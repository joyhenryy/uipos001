// POS Terminal Interactive Cart & Payment Handler - Minimalist Modern

let cart = [
  { id: 1, name: 'Beras Premium Ramos 5kg', price: 74000, qty: 1 },
  { id: 2, name: 'Minyak Goreng Refill 2L', price: 34500, qty: 2 },
  { id: 3, name: 'Gula Pasir Kristal Putih 1kg', price: 17500, qty: 1 }
];

let selectedPaymentMethod = 'TUNAI';

function formatRupiah(number) {
  return 'Rp ' + Number(number).toLocaleString('id-ID');
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const countEl = document.getElementById('cartItemCount');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const payTotalEl = document.getElementById('payModalTotal');
  const emptyEl = document.getElementById('cartEmpty');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (countEl) countEl.textContent = '0 item';
    if (subtotalEl) subtotalEl.textContent = formatRupiah(0);
    if (totalEl) totalEl.textContent = formatRupiah(0);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  let totalQty = 0;
  let subtotal = 0;

  container.innerHTML = cart.map(item => {
    totalQty += item.qty;
    const itemSubtotal = item.price * item.qty;
    subtotal += itemSubtotal;

    return `
      <div class="cart-item">
        <div class="cart-item-header">
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">${formatRupiah(item.price)} / unit</div>
          </div>
          <button class="btn btn-sm btn-outline btn-icon" onclick="removeCartItem(${item.id})" title="Hapus">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="updateItemQty(${item.id}, -1)">-</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" onclick="updateItemQty(${item.id}, 1)">+</button>
          </div>
          <div class="cart-item-subtotal">${formatRupiah(itemSubtotal)}</div>
        </div>
      </div>
    `;
  }).join('');

  if (countEl) countEl.textContent = `${totalQty} item`;
  if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
  if (totalEl) totalEl.textContent = formatRupiah(subtotal);
  if (payTotalEl) payTotalEl.textContent = formatRupiah(subtotal);

  updateChangeCalculation();
}

function addProductToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
}

function updateItemQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  renderCart();
}

function removeCartItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function selectPayMethod(method, elem) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.pay-method-btn').forEach(btn => btn.classList.remove('active'));
  if (elem) elem.classList.add('active');

  const cashArea = document.getElementById('cashPaymentArea');
  if (cashArea) {
    cashArea.style.display = (method === 'TUNAI') ? 'block' : 'none';
  }
}

function setCashAmount(amount) {
  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const input = document.getElementById('cashReceivedInput');
  if (!input) return;

  if (amount === 'EXACT') {
    input.value = total;
  } else {
    input.value = amount;
  }
  updateChangeCalculation();
}

function updateChangeCalculation() {
  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const input = document.getElementById('cashReceivedInput');
  const changeEl = document.getElementById('cashChangeDisplay');
  if (!input || !changeEl) return;

  const received = Number(input.value) || 0;
  const change = Math.max(0, received - total);
  changeEl.textContent = formatRupiah(change);
}

function confirmPayment() {
  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  if (total === 0) {
    alert('Keranjang belanja masih kosong.');
    return;
  }

  const payModal = document.getElementById('paymentModal');
  if (payModal) payModal.classList.remove('active');

  const now = new Date();
  const txCode = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
  
  const input = document.getElementById('cashReceivedInput');
  const received = selectedPaymentMethod === 'TUNAI' ? (Number(input?.value) || total) : total;
  const change = Math.max(0, received - total);

  // Populate Success Modal
  const modalCode = document.getElementById('successTxCode');
  const modalTotal = document.getElementById('successTxTotal');
  const modalReceived = document.getElementById('successTxReceived');
  const modalChange = document.getElementById('successTxChange');
  const modalMethod = document.getElementById('successTxMethod');

  if (modalCode) modalCode.textContent = txCode;
  if (modalTotal) modalTotal.textContent = formatRupiah(total);
  if (modalReceived) modalReceived.textContent = formatRupiah(received);
  if (modalChange) modalChange.textContent = formatRupiah(change);
  if (modalMethod) modalMethod.textContent = selectedPaymentMethod;

  const successModal = document.getElementById('successModal');
  if (successModal) successModal.classList.add('active');
}

function resetAfterSuccess() {
  const successModal = document.getElementById('successModal');
  if (successModal) successModal.classList.remove('active');
  clearCart();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const cashInput = document.getElementById('cashReceivedInput');
  if (cashInput) {
    cashInput.addEventListener('input', updateChangeCalculation);
  }

  // Search product filter in catalog
  const prodSearch = document.getElementById('productCatalogSearch');
  if (prodSearch) {
    prodSearch.addEventListener('keyup', () => {
      const q = prodSearch.value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }

  // Category filter
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-category');
      
      document.querySelectorAll('.product-card').forEach(card => {
        if (!cat || cat === 'ALL') {
          card.style.display = 'flex';
        } else {
          const itemCat = card.getAttribute('data-cat');
          card.style.display = (itemCat === cat) ? 'flex' : 'none';
        }
      });
    });
  });
});
