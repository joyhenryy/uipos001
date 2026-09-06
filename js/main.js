// Synchronously check sidebar collapsed state immediately
if (localStorage.getItem('sidebar_collapsed') === 'true') {
  document.documentElement.classList.add('sidebar-collapsed');
}

document.addEventListener('DOMContentLoaded', () => {
  // Modal Trigger Handlers
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal-open');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
      }
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Close modal when clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Simple Tabs Handler
  document.querySelectorAll('.tabs-nav').forEach(tabGroup => {
    const links = tabGroup.querySelectorAll('.tab-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-tab-target');
        
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        if (targetId) {
          const parent = tabGroup.parentElement;
          parent.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
          });
          const targetContent = document.getElementById(targetId);
          if (targetContent) {
            targetContent.style.display = 'block';
          }
        }
      });
    });
  });

  // Table Search Filter
  document.querySelectorAll('[data-table-filter]').forEach(input => {
    input.addEventListener('keyup', () => {
      const targetTableId = input.getAttribute('data-table-filter');
      const filterValue = input.value.toLowerCase();
      const table = document.getElementById(targetTableId);
      if (!table) return;

      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filterValue) ? '' : 'none';
      });
    });
  });

  // Simple Notification Mark All Read
  const markAllReadBtn = document.getElementById('btnMarkAllRead');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      document.querySelectorAll('.notification-unread-dot').forEach(dot => dot.remove());
      const counter = document.getElementById('unreadCount');
      if (counter) counter.textContent = '0';
    });
  }

  // Sidebar Collapse / Expand Toggle & External Floating Tooltip
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');

  if (sidebar) {
    // Create external floating tooltip outside the sidebar layer
    let tooltipEl = document.querySelector('.sidebar-floating-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'sidebar-floating-tooltip';
      document.body.appendChild(tooltipEl);
    }

    sidebar.querySelectorAll('.nav-item').forEach(item => {
      const span = item.querySelector('span');
      if (span) {
        const titleText = span.textContent.trim();
        item.setAttribute('data-tooltip', titleText);
        // Remove native title attribute to prevent default browser tooltip conflict
        item.removeAttribute('title');

        item.addEventListener('mouseenter', () => {
          if (sidebar.classList.contains('collapsed')) {
            tooltipEl.textContent = titleText;
            const rect = item.getBoundingClientRect();
            tooltipEl.style.top = (rect.top + rect.height / 2) + 'px';
            tooltipEl.style.left = (rect.right + 12) + 'px';
            tooltipEl.style.display = 'block';
            tooltipEl.style.opacity = '1';
          }
        });

        item.addEventListener('mouseleave', () => {
          tooltipEl.style.display = 'none';
          tooltipEl.style.opacity = '0';
        });
      }
    });

    // Synchronize state from localStorage
    const isInitiallyCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isInitiallyCollapsed) {
      sidebar.classList.add('collapsed');
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      sidebar.classList.remove('collapsed');
      document.documentElement.classList.remove('sidebar-collapsed');
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Enable transition only when user explicitly clicks toggle
        sidebar.classList.add('has-transition');
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        if (isCollapsed) {
          document.documentElement.classList.add('sidebar-collapsed');
        } else {
          document.documentElement.classList.remove('sidebar-collapsed');
        }
        localStorage.setItem('sidebar_collapsed', isCollapsed);
        if (!isCollapsed && tooltipEl) {
          tooltipEl.style.display = 'none';
          tooltipEl.style.opacity = '0';
        }
      });
    }
  }
});

// Centralized Store for Master Data (Categories, Units, Products, Purchase Orders)
window.PosStore = {
  defaultCategories: [
    { id: 'KAT-001', name: 'Sembako', desc: 'Bahan pangan pokok kebutuhan rumah tangga', count: 3 },
    { id: 'KAT-002', name: 'Minuman', desc: 'Minuman kemasan, serbuk & botol siap konsumsi', count: 2 },
    { id: 'KAT-003', name: 'Makanan Ringan', desc: 'Camilan, keripik, biskuit & wafer', count: 1 },
    { id: 'KAT-004', name: 'Kebersihan', desc: 'Sabun, deterjen, sampo & perawatan rumah', count: 1 },
    { id: 'KAT-005', name: 'Bumbu Dapur', desc: 'Rempah, saus, kecap, garam & penyedap rasa', count: 0 }
  ],

  defaultUnits: [
    { id: 'UNT-001', name: 'Pcs', desc: 'Satuan eceran per bungkus atau item individual', count: 3 },
    { id: 'UNT-002', name: 'Dus (40 pcs)', desc: 'Kemasan kardus karton standar isi 40 pcs', count: 2 },
    { id: 'UNT-003', name: 'Sak / Karung (5kg)', desc: 'Kemasan karung beras atau tepung 5 kilogram', count: 1 },
    { id: 'UNT-004', name: 'Karton (6 pouch)', desc: 'Kemasan karton minyak goreng isi 6 pouch 2L', count: 1 },
    { id: 'UNT-005', name: 'Botol', desc: 'Satuan kemasan botol kaca atau plastik', count: 1 },
    { id: 'UNT-006', name: 'Pouch (2L)', desc: 'Kemasan isi ulang standing pouch', count: 1 }
  ],

  defaultProducts: [
    { id: 'PROD-001', name: 'Beras Premium Ramos 5kg', sku: 'SKU-8991001', barcode: '899100100012', category: 'Sembako', unit: 'Sak / Karung (5kg)', buyPrice: 64250, sellPrice: 74000, stock: 42, status: 'Tersedia' },
    { id: 'PROD-002', name: 'Minyak Goreng Refill 2L', sku: 'SKU-8991002', barcode: '899100200025', category: 'Sembako', unit: 'Pouch (2L)', buyPrice: 29500, sellPrice: 34500, stock: 4, status: 'Kritis' },
    { id: 'PROD-003', name: 'Gula Pasir Kristal Putih 1kg', sku: 'SKU-8991003', barcode: '899100300038', category: 'Sembako', unit: 'Pcs', buyPrice: 15200, sellPrice: 17500, stock: 65, status: 'Tersedia' },
    { id: 'PROD-004', name: 'Susu UHT Cokelat 1L', sku: 'SKU-8992001', barcode: '899200100041', category: 'Minuman', unit: 'Dus (40 pcs)', buyPrice: 16500, sellPrice: 19800, stock: 18, status: 'Tersedia' },
    { id: 'PROD-005', name: 'Kopi Arabika Tubruk 200g', sku: 'SKU-8992002', barcode: '899200200054', category: 'Minuman', unit: 'Pcs', buyPrice: 19500, sellPrice: 24000, stock: 31, status: 'Tersedia' },
    { id: 'PROD-006', name: 'Deterjen Bubuk Konsentrat 800g', sku: 'SKU-8994001', barcode: '899400100067', category: 'Kebersihan', unit: 'Pcs', buyPrice: 17800, sellPrice: 21500, stock: 22, status: 'Tersedia' }
  ],

  defaultPOs: [
    { id: 'PO-2026-0901', supplier: 'PT Indofood Sukses Makmur', pic: 'Bpk. Haryanto (021) 522-8800', date: '2026-09-02', eta: '2026-09-04', itemsCount: 3, totalQty: '45 Dus (3 SKU)', totalAmount: 12850000, status: 'Menunggu Verifikasi Gudang', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 30 Hari (Net 30)', notes: 'Harap sertakan faktur pajak dan surat jalan resmi bermaterai.' },
    { id: 'PO-2026-0902', supplier: 'PT Mayora Indah Tbk', pic: 'Ibu Rina Melati (021) 565-3321', date: '2026-09-03', eta: '2026-09-05', itemsCount: 2, totalQty: '30 Dus (2 SKU)', totalAmount: 8400000, status: 'Menunggu Verifikasi Gudang', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 14 Hari', notes: 'Kirim pagi sebelum pukul 11:00 WIB.' },
    { id: 'PO-2026-0899', supplier: 'CV Sumber Berkah Sembako', pic: 'H. Sudirman (0812-3456-7890)', date: '2026-08-28', eta: '2026-08-30', itemsCount: 4, totalQty: '120 Sak (4 SKU)', totalAmount: 18250000, status: 'Selesai Verifikasi', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'COD / Tunai', notes: 'Verifikasi fisik telah lengkap.' },
    { id: 'PO-2026-0895', supplier: 'PT Wings Surya', pic: 'Bpk. Gunawan (031) 843-2211', date: '2026-08-25', eta: '2026-08-28', itemsCount: 5, totalQty: '80 Karton (5 SKU)', totalAmount: 9000000, status: 'Selesai Verifikasi', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 30 Hari', notes: 'Semua barang diterima dalam kondisi baik.' },
    { id: 'PO-2026-0903', supplier: 'PT Unilever Indonesia', pic: 'Bpk. Adrian (021) 8082-7000', date: '2026-09-04', eta: '2026-09-08', itemsCount: 3, totalQty: '25 Dus (3 SKU)', totalAmount: 7500000, status: 'Draf', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 30 Hari', notes: 'Draf pesanan bulanan.' }
  ],

  // Categories
  getCategories() {
    const raw = localStorage.getItem('pos_categories');
    if (!raw) {
      this.saveCategories(this.defaultCategories);
      return [...this.defaultCategories];
    }
    try { return JSON.parse(raw); } catch (e) { return [...this.defaultCategories]; }
  },
  saveCategories(list) {
    localStorage.setItem('pos_categories', JSON.stringify(list));
  },
  addCategory(category) {
    const list = this.getCategories();
    list.push(category);
    this.saveCategories(list);
    return list;
  },
  updateCategory(id, updated) {
    let list = this.getCategories();
    list = list.map(c => c.id === id ? { ...c, ...updated } : c);
    this.saveCategories(list);
    return list;
  },
  deleteCategory(id) {
    let list = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(list);
    return list;
  },

  // Units
  getUnits() {
    const raw = localStorage.getItem('pos_units');
    if (!raw) {
      this.saveUnits(this.defaultUnits);
      return [...this.defaultUnits];
    }
    try { return JSON.parse(raw); } catch (e) { return [...this.defaultUnits]; }
  },
  saveUnits(list) {
    localStorage.setItem('pos_units', JSON.stringify(list));
  },
  addUnit(unit) {
    const list = this.getUnits();
    list.push(unit);
    this.saveUnits(list);
    return list;
  },
  updateUnit(id, updated) {
    let list = this.getUnits();
    list = list.map(u => u.id === id ? { ...u, ...updated } : u);
    this.saveUnits(list);
    return list;
  },
  deleteUnit(id) {
    let list = this.getUnits().filter(u => u.id !== id);
    this.saveUnits(list);
    return list;
  },

  // Products
  getProducts() {
    const raw = localStorage.getItem('pos_products');
    if (!raw) {
      this.saveProducts(this.defaultProducts);
      return [...this.defaultProducts];
    }
    try { return JSON.parse(raw); } catch (e) { return [...this.defaultProducts]; }
  },
  saveProducts(list) {
    localStorage.setItem('pos_products', JSON.stringify(list));
  },
  addProduct(product) {
    const list = this.getProducts();
    list.unshift(product);
    this.saveProducts(list);
    return list;
  },
  updateProduct(id, updated) {
    let list = this.getProducts();
    list = list.map(p => (p.id === id || p.sku === id) ? { ...p, ...updated } : p);
    this.saveProducts(list);
    return list;
  },

  // Purchase Orders
  getPOs() {
    const raw = localStorage.getItem('pos_orders');
    if (!raw) {
      this.savePOs(this.defaultPOs);
      return [...this.defaultPOs];
    }
    try { return JSON.parse(raw); } catch (e) { return [...this.defaultPOs]; }
  },
  savePOs(list) {
    localStorage.setItem('pos_orders', JSON.stringify(list));
  },
  addPO(po) {
    const list = this.getPOs();
    list.unshift(po);
    this.savePOs(list);
    return list;
  },
  updatePOStatus(id, status) {
    let list = this.getPOs();
    list = list.map(p => p.id === id ? { ...p, status } : p);
    this.savePOs(list);
    return list;
  },

  // Utility
  formatRupiah(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }
};


