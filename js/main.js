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

  // ================= UNIVERSAL DROPDOWN BUTTONS & ANIMATION =================
  initCustomSelects();

  // Re-run on dynamic DOM mutations (modals, new rows, dynamic forms)
  if (window.MutationObserver) {
    const selectObserver = new MutationObserver((mutations) => {
      let shouldInit = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && (node.matches('select.form-select') || (node.querySelector && node.querySelector('select.form-select')))) {
              shouldInit = true;
              break;
            }
          }
        }
        if (shouldInit) break;
      }
      if (shouldInit) {
        initCustomSelects();
      }
    });
    selectObserver.observe(document.body, { childList: true, subtree: true });
  }
});

// Dropdown styles injection (guarantees styling parity across all pages)
function injectGlobalDropdownStyles() {
  if (document.getElementById('global-dropdown-styles')) return;
  const style = document.createElement('style');
  style.id = 'global-dropdown-styles';
  style.textContent = `
    .searchable-select-wrap,
    .custom-select-wrap {
      position: relative;
      display: inline-block;
      width: 100%;
      vertical-align: middle;
      box-sizing: border-box;
    }

    .custom-select-wrap.is-inline {
      width: auto;
      min-width: 140px;
    }

    .custom-select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 9px 34px 9px 12px;
      background-color: var(--bg-surface, #ffffff);
      border: 1px solid var(--border-subtle, #e4e4e7);
      border-radius: var(--radius-md, 6px);
      font-size: var(--text-sm, 13.5px);
      color: var(--color-black, #09090b);
      cursor: pointer;
      user-select: none;
      transition: all var(--transition-fast, 150ms);
      white-space: nowrap;
      box-sizing: border-box;
    }

    .custom-select-wrap.is-compact .custom-select-trigger {
      padding: 6px 30px 6px 10px;
      font-size: var(--text-xs, 12px);
      border-radius: var(--radius-sm, 4px);
    }

    .custom-select-trigger:focus,
    .custom-select-wrap.is-open .custom-select-trigger {
      outline: none;
      border-color: var(--color-black, #09090b);
      box-shadow: 0 0 0 1px var(--color-black, #09090b);
    }

    .custom-select-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 4px;
    }

    .input-dropdown-btn {
      position: absolute;
      right: 1px;
      top: 1px;
      bottom: 1px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--color-gray-500, #71717a);
      cursor: pointer;
      border-radius: 0 var(--radius-sm, 4px) var(--radius-sm, 4px) 0;
      transition: all var(--transition-fast, 150ms);
    }

    .custom-select-wrap.is-compact .input-dropdown-btn {
      width: 26px;
    }

    .input-dropdown-btn:hover,
    .custom-select-wrap:hover .input-dropdown-btn {
      color: var(--color-black, #09090b);
      background-color: var(--color-gray-100, #f4f4f5);
    }

    .input-dropdown-btn svg,
    .dropdown-btn svg,
    .btn-dropdown svg {
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .searchable-select-wrap.is-open .input-dropdown-btn svg,
    .custom-select-wrap.is-open .input-dropdown-btn svg,
    .dropdown-btn.is-open svg,
    .btn-dropdown.is-open svg {
      transform: rotate(180deg);
    }

    @keyframes dropdownSlideDown {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes dropdownSlideUp {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .custom-dropdown-portal {
      position: fixed;
      background: var(--bg-surface, #ffffff);
      border: 1px solid var(--border-medium, #d4d4d8);
      border-radius: var(--radius-md, 6px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.06);
      z-index: 999999;
      max-height: 250px;
      overflow-y: auto;
      animation: dropdownSlideDown 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      box-sizing: border-box;
    }

    .custom-dropdown-portal.open-upward {
      animation: dropdownSlideUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .custom-dropdown-item {
      padding: 8px 14px;
      cursor: pointer;
      border-bottom: 1px solid var(--border-subtle, #f4f4f5);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-sm, 13.5px);
      color: var(--color-black, #09090b);
      transition: background 0.1s;
    }

    .custom-dropdown-item:last-child {
      border-bottom: none;
    }

    .custom-dropdown-item:hover {
      background-color: var(--color-gray-100, #f4f4f5);
    }

    .custom-dropdown-item.is-selected {
      font-weight: 600;
      background-color: var(--color-gray-50, #fafafa);
    }
  `;
  document.head.appendChild(style);
}

let activeGlobalDropdown = null; // { wrap, trigger, select }

function getGlobalDropdownPortal() {
  let portal = document.getElementById('globalDropdownPortal');
  if (!portal) {
    const poPortal = document.getElementById('poDropdownPortal');
    if (poPortal) {
      portal = poPortal;
    } else {
      portal = document.createElement('div');
      portal.id = 'globalDropdownPortal';
      portal.className = 'custom-dropdown-portal';
      portal.style.display = 'none';
      document.body.appendChild(portal);
    }
  }
  return portal;
}

function closeGlobalDropdown() {
  const portal = getGlobalDropdownPortal();
  if (portal) {
    portal.style.display = 'none';
    portal.innerHTML = '';
  }
  document.querySelectorAll('.custom-select-wrap.is-open').forEach(w => {
    w.classList.remove('is-open');
    const trigger = w.querySelector('.custom-select-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
  activeGlobalDropdown = null;
}

function positionGlobalDropdown() {
  if (!activeGlobalDropdown) return;
  const portal = getGlobalDropdownPortal();
  if (!portal || portal.style.display === 'none') return;

  const trigger = activeGlobalDropdown.trigger;
  const rect = trigger.getBoundingClientRect();

  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    closeGlobalDropdown();
    return;
  }

  const width = Math.max(rect.width, 160);
  portal.style.width = width + 'px';
  portal.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 16)) + 'px';

  const estimatedHeight = 220;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
    portal.classList.add('open-upward');
    portal.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
    portal.style.top = 'auto';
  } else {
    portal.classList.remove('open-upward');
    portal.style.top = (rect.bottom + 4) + 'px';
    portal.style.bottom = 'auto';
  }
}

// Global window event handlers for custom dropdown
window.addEventListener('scroll', () => {
  if (activeGlobalDropdown) {
    positionGlobalDropdown();
  }
}, true);

window.addEventListener('resize', () => {
  if (activeGlobalDropdown) {
    positionGlobalDropdown();
  }
});

document.addEventListener('click', (e) => {
  const portal = getGlobalDropdownPortal();
  if (portal && portal.contains(e.target)) return;
  if (!e.target.closest('.custom-select-wrap')) {
    closeGlobalDropdown();
  }
});

window.initCustomSelects = function(root = document) {
  injectGlobalDropdownStyles();

  const selects = root.querySelectorAll('select.form-select');
  selects.forEach(select => {
    if (select.dataset.customSelectInit === 'true') {
      const existingWrap = select.parentNode ? select.parentNode.querySelector(`.custom-select-wrap[data-for-select="${select.id}"]`) : null;
      if (existingWrap) {
        const lbl = existingWrap.querySelector('.custom-select-label');
        const curOpt = select.options[select.selectedIndex];
        if (lbl && curOpt) lbl.textContent = curOpt.text;
      }
      return;
    }

    if (select.classList.contains('no-custom-select')) return;

    select.dataset.customSelectInit = 'true';
    if (!select.id) {
      select.id = 'sel_' + Math.random().toString(36).substr(2, 9);
    }

    const isAutoWidth = select.style.width === 'auto' || select.closest('.toolbar-left, .toolbar-right, .header-right');
    const isCompact = (select.style.padding && (select.style.padding.includes('7px') || select.style.padding.includes('6px') || select.style.padding.includes('5px'))) || select.classList.contains('form-select-sm');

    select.style.position = 'absolute';
    select.style.opacity = '0';
    select.style.pointerEvents = 'none';
    select.style.width = '1px';
    select.style.height = '1px';
    select.style.margin = '-1px';
    select.style.clip = 'rect(0,0,0,0)';
    select.setAttribute('tabindex', '-1');

    const wrap = document.createElement('div');
    wrap.className = 'custom-select-wrap' + (isAutoWidth ? ' is-inline' : '') + (isCompact ? ' is-compact' : '');
    wrap.dataset.forSelect = select.id;

    const selectedOption = select.options[select.selectedIndex] || select.options[0];
    const initialText = selectedOption ? selectedOption.text : 'Pilih...';

    wrap.innerHTML = `
      <div class="custom-select-trigger" tabindex="0" role="combobox" aria-expanded="false" title="${initialText}">
        <span class="custom-select-label">${initialText}</span>
      </div>
      <button type="button" class="input-dropdown-btn" title="Buka Pilihan" tabindex="-1">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
    `;

    const trigger = wrap.querySelector('.custom-select-trigger');
    const label = wrap.querySelector('.custom-select-label');
    const btn = wrap.querySelector('.input-dropdown-btn');

    select.addEventListener('change', () => {
      const opt = select.options[select.selectedIndex];
      if (opt) {
        label.textContent = opt.text;
        trigger.title = opt.text;
      }
    });

    function toggleDropdown(e) {
      e.preventDefault();
      e.stopPropagation();

      if (wrap.classList.contains('is-open')) {
        closeGlobalDropdown();
      } else {
        closeGlobalDropdown();
        if (typeof closeAllDropdowns === 'function') {
          closeAllDropdowns();
        }

        wrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        activeGlobalDropdown = { wrap, trigger, select };

        const portal = getGlobalDropdownPortal();
        portal.innerHTML = '';

        Array.from(select.options).forEach((opt, idx) => {
          const item = document.createElement('div');
          const isSelected = idx === select.selectedIndex;
          item.className = 'custom-dropdown-item' + (isSelected ? ' is-selected' : '');
          if (opt.disabled) {
            item.style.opacity = '0.5';
            item.style.cursor = 'not-allowed';
          }
          item.innerHTML = `
            <span>${opt.text}</span>
            ${isSelected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          `;

          if (!opt.disabled) {
            item.onclick = (eItem) => {
              eItem.stopPropagation();
              select.selectedIndex = idx;
              label.textContent = opt.text;
              trigger.title = opt.text;
              closeGlobalDropdown();

              select.dispatchEvent(new Event('change', { bubbles: true }));
              trigger.focus();
            };
          }

          portal.appendChild(item);
        });

        portal.style.display = 'block';
        portal.style.animation = 'none';
        portal.offsetHeight;
        portal.style.animation = '';

        positionGlobalDropdown();
      }
    }

    trigger.addEventListener('click', toggleDropdown);
    btn.addEventListener('click', toggleDropdown);

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleDropdown(e);
      } else if (e.key === 'Escape') {
        closeGlobalDropdown();
      }
    });

    select.parentNode.insertBefore(wrap, select.nextSibling);
  });
};

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
    { id: 'PROD-001', name: 'Beras Premium Ramos 5kg', sku: 'SKU-8991001', category: 'Sembako', unit: 'Sak / Karung (5kg)', buyPrice: 64250, sellPrice: 74000, stock: 42, status: 'Tersedia' },
    { id: 'PROD-002', name: 'Minyak Goreng Refill 2L', sku: 'SKU-8991002', category: 'Sembako', unit: 'Pouch (2L)', buyPrice: 29500, sellPrice: 34500, stock: 4, status: 'Kritis' },
    { id: 'PROD-003', name: 'Gula Pasir Kristal Putih 1kg', sku: 'SKU-8991003', category: 'Sembako', unit: 'Pcs', buyPrice: 15200, sellPrice: 17500, stock: 65, status: 'Tersedia' },
    { id: 'PROD-004', name: 'Susu UHT Cokelat 1L', sku: 'SKU-8992001', category: 'Minuman', unit: 'Dus (40 pcs)', buyPrice: 16500, sellPrice: 19800, stock: 18, status: 'Tersedia' },
    { id: 'PROD-005', name: 'Kopi Arabika Tubruk 200g', sku: 'SKU-8992002', category: 'Minuman', unit: 'Pcs', buyPrice: 19500, sellPrice: 24000, stock: 31, status: 'Tersedia' },
    { id: 'PROD-006', name: 'Deterjen Bubuk Konsentrat 800g', sku: 'SKU-8994001', category: 'Kebersihan', unit: 'Pcs', buyPrice: 17800, sellPrice: 21500, stock: 22, status: 'Tersedia' }
  ],

  defaultPOs: [
    { id: 'PO-2026-0901', supplier: 'PT Indofood Sukses Makmur', pic: 'Bpk. Haryanto (021) 522-8800', date: '2026-09-02', arrivalDate: null, itemsCount: 3, totalQty: '45 Dus', totalAmount: 12850000, status: 'Menunggu Verifikasi Gudang', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 30 Hari (Net 30)', notes: 'Harap sertakan faktur pajak dan surat jalan resmi bermaterai.' },
    { id: 'PO-2026-0902', supplier: 'PT Mayora Indah Tbk', pic: 'Ibu Rina Melati (021) 565-3321', date: '2026-09-03', arrivalDate: null, itemsCount: 2, totalQty: '30 Dus', totalAmount: 8400000, status: 'Menunggu Verifikasi Gudang', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 14 Hari', notes: 'Kirim pagi sebelum pukul 11:00 WIB.' },
    { id: 'PO-2026-0899', supplier: 'CV Sumber Berkah Sembako', pic: 'H. Sudirman (0812-3456-7890)', date: '2026-08-28', arrivalDate: '2026-08-30', itemsCount: 4, totalQty: '120 Sak', totalAmount: 18250000, status: 'Selesai Verifikasi', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'COD / Tunai', notes: 'Verifikasi fisik telah lengkap.' },
    { id: 'PO-2026-0895', supplier: 'PT Wings Surya', pic: 'Bpk. Gunawan (031) 843-2211', date: '2026-08-25', arrivalDate: '2026-08-28', itemsCount: 5, totalQty: '80 Karton', totalAmount: 9000000, status: 'Selesai Verifikasi', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 30 Hari', notes: 'Semua barang diterima dalam kondisi baik.' },
    { id: 'PO-2026-0903', supplier: 'PT Unilever Indonesia', pic: 'Bpk. Adrian (021) 8082-7000', date: '2026-09-04', arrivalDate: null, itemsCount: 3, totalQty: '25 Dus', totalAmount: 7500000, status: 'Draf', destination: 'Gudang Utama - Toko Berkah Jaya', paymentTerm: 'Tempo 30 Hari', notes: 'Draf pesanan bulanan.' }
  ],

  defaultReturns: [
    {
      id: 'RET-2026-0901',
      supplier: 'PT Indofood Sukses Makmur',
      pic: 'Bpk. Haryanto (Logistik Distributor)',
      phone: '(021) 522-8800 ext. 201',
      poRef: 'PO-2026-0901',
      date: '2026-09-04',
      status: 'Diajukan',
      settlement: 'Penggantian Barang Fisik Baru',
      notes: 'Kemasan pouch bocor di bagian seal bawah saat serah terima barang PO-2026-0901. Sopir ekspedisi supplier telah menandatangani bukti catatan ketidaksesuaian barang.',
      items: [
        { sku: 'SKU-8991002', name: 'Minyak Goreng Refill 2L', qty: 1, unit: 'Pouch (2L)', reason: 'Kemasan Bocor / Rusak', buyPrice: 30500, subtotal: 30500 }
      ]
    },
    {
      id: 'RET-2026-0888',
      supplier: 'PT Mayora Indah Tbk',
      pic: 'Ibu Rina Melati (Distribusi Cabang)',
      phone: '(021) 565-3321',
      poRef: 'PO-2026-0850',
      date: '2026-08-28',
      status: 'Dikonfirmasi Supplier',
      settlement: 'Penggantian Barang Fisik Baru',
      notes: 'Kemasan kaleng biskuit penyok parah di sudut bawah carton box saat bongkar muat.',
      items: [
        { sku: 'SKU-8992001', name: 'Susu UHT Cokelat 1L', qty: 4, unit: 'Dus (40 pcs)', reason: 'Cacat Pabrik', buyPrice: 16500, subtotal: 66000 }
      ]
    },
    {
      id: 'RET-2026-0870',
      supplier: 'CV Sumber Berkah Sembako',
      pic: 'H. Sudirman (Owner/Distributor)',
      phone: '0812-3456-7890',
      poRef: 'PO-2026-0822',
      date: '2026-08-18',
      status: 'Selesai',
      settlement: 'Pemotongan Pembayaran / Nota Kredit',
      notes: 'Karung beras robek saat serah terima. Diterbitkan nota kredit kompensasi faktur pengadaan.',
      items: [
        { sku: 'SKU-8991001', name: 'Beras Premium Ramos 5kg', qty: 2, unit: 'Sak / Karung (5kg)', reason: 'Kemasan Bocor / Rusak', buyPrice: 64250, subtotal: 128500 }
      ]
    }
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
    try {
      let orders = JSON.parse(raw);
      let changed = false;
      orders = orders.map(po => {
        let updated = { ...po };
        if (updated.arrivalDate === undefined) {
          if (updated.status === 'Selesai Verifikasi' || updated.status === 'Selesai') {
            updated.arrivalDate = updated.eta || updated.date || '2026-08-30';
          } else {
            updated.arrivalDate = null;
          }
          changed = true;
        }
        if (updated.totalQty && updated.totalQty.includes('SKU')) {
          updated.totalQty = updated.totalQty.replace(/\s*\(\d+\s*SKU\)/gi, '');
          changed = true;
        }
        return updated;
      });
      if (changed) this.savePOs(orders);
      return orders;
    } catch (e) { return [...this.defaultPOs]; }
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
  verifyPOArrival(id, arrivalDate) {
    let list = this.getPOs();
    list = list.map(p => p.id === id ? { 
      ...p, 
      status: 'Selesai Verifikasi', 
      arrivalDate: arrivalDate || new Date().toISOString().split('T')[0] 
    } : p);
    this.savePOs(list);
    return list;
  },

  // Purchase Returns
  getReturns() {
    const raw = localStorage.getItem('pos_returns');
    if (!raw) {
      this.saveReturns(this.defaultReturns);
      return [...this.defaultReturns];
    }
    try { return JSON.parse(raw); } catch (e) { return [...this.defaultReturns]; }
  },
  saveReturns(list) {
    localStorage.setItem('pos_returns', JSON.stringify(list));
  },
  getReturnById(id) {
    const list = this.getReturns();
    return list.find(r => r.id === id) || null;
  },
  addReturn(returnDoc) {
    const list = this.getReturns();
    list.unshift(returnDoc);
    this.saveReturns(list);
    return list;
  },
  updateReturn(id, updated) {
    let list = this.getReturns();
    list = list.map(r => r.id === id ? { ...r, ...updated } : r);
    this.saveReturns(list);
    return list;
  },

  // Utility
  formatRupiah(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }
};


