// ==UserScript==
// @name         Tabel estimasi SA terbaru - Compact Fluent v3
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Tabel SA terbaru dengan design compact Fluent Windows 11 - Enhanced
// @author       You
// @match        https://tunastoyota.crm5.dynamics.com/*/webresources/xti_TSINDO.YANA.HTML.Xts_WorkOrder.AddWOLine.html*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
// ==/UserScript==

(function() {
    'use strict';

    // 🔇 SILENT MODE - Nonaktifkan logging yang mengganggu
    const SILENT_MODE = true;
    const originalLog = console.log;
    console.log = function(...args) {
        if (!SILENT_MODE && args[0] && typeof args[0] === 'string') {
            if (args[0].includes('✅') || args[0].includes('❌') || args[0].includes('🚨')) {
                originalLog.apply(console, args);
            }
        }
    };

    // Konfigurasi
    const REFRESH_INTERVAL = 2 * 60 * 1000;

    // Konfigurasi Supabase
    const supabaseUrl = 'https://pjawwektzazcxakgopou.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXd3ZWt0emF6Y3hha2dvcG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjQ5MTUsImV4cCI6MjA3Mzg0MDkxNX0.dNEB80t7LcTsvAtHHqgIeJfxcwmmZNsWxPTIAlrj11c';
    const loginEmail = 'kirangasem@gmail.com';
    const loginPassword = '123456';

    // Konstanta CRM
    const CRM_BASE_URL = "https://tunastoyota.crm5.dynamics.com/api/data/v9.0";

    let supabase;
    let currentWorkOrderId = null;
    let currentPlateNumber = null;
    let currentEstimasi = null;
    let refreshInterval;
    let currentDropdown = null;
    let isDetailCollapsed = false;
    let isUppercaseEnabled = false;

    // ==================== FUNGSI YANG SAMA DARI KODE LAMA ====================
    // SALIN FUNGSI BERIKUT DARI KODE LAMA ANDA:

    // 1. Fungsi getWorkOrderIdFromURL()
    function getWorkOrderIdFromURL() {
        try {
            const params = new URLSearchParams(window.location.search);
            const dataParam = params.get("data");
            if (!dataParam) {
                if (!SILENT_MODE) console.log('ℹ️ Parameter data tidak ditemukan di URL');
                return null;
            }

            const decoded = JSON.parse(decodeURIComponent(dataParam));
            const workorderId = decoded.headerid;

            if (workorderId) {
                if (!SILENT_MODE) console.log('✅ WorkOrder ID ditemukan dari URL:', workorderId);
                return workorderId;
            } else {
                if (!SILENT_MODE) console.log('ℹ️ headerid tidak ditemukan dalam parameter data');
                return null;
            }
        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error parsing WorkOrder ID dari URL:', error);
            return null;
        }
    }

    // 2. Fungsi getPlateNumber(workorderId)
    async function getPlateNumber(workorderId) {
        try {
            if (!SILENT_MODE) console.log('🔍 Mengambil plat nomor untuk WorkOrder:', workorderId);

            const cleanWorkOrderId = workorderId.replace(/[{}]/g, '');
            const url = `${CRM_BASE_URL}/xts_workorders(${cleanWorkOrderId})?$select=xts_platenumber`;

            const res = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0"
                },
                credentials: "include"
            });

            if (!res.ok) {
                if (!SILENT_MODE) console.error('❌ Gagal fetch plat nomor:', res.status, res.statusText);
                return null;
            }

            const data = await res.json();
            const plateNumber = data.xts_platenumber;

            if (plateNumber) {
                if (!SILENT_MODE) console.log('✅ Plat nomor ditemukan:', plateNumber);
                return plateNumber;
            } else {
                if (!SILENT_MODE) console.log('ℹ️ Plat nomor tidak tersedia untuk WorkOrder ini');
                return null;
            }
        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error mengambil plat nomor:', error);
            return null;
        }
    }

    // 3. Fungsi initializeSupabase()
    async function initializeSupabase() {
        try {
            if (!SILENT_MODE) console.log('🔗 Menginisialisasi Supabase...');
            supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            await loginToSupabase();
        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error initializing Supabase:', error);
        }
    }

    // 4. Fungsi loginToSupabase()
    async function loginToSupabase() {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword
            });
            if (error) throw error;
            if (!SILENT_MODE) console.log('✅ Login Supabase berhasil');
        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error login Supabase:', error);
        }
    }

    // 5. Fungsi getTeknisiName(teknisiId)
    async function getTeknisiName(teknisiId) {
        try {
            if (!teknisiId) return 'Tidak diketahui';

            const { data, error } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', teknisiId)
            .single();

            if (error) throw error;
            return data?.full_name || 'Tidak diketahui';
        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error getting teknisi name:', error);
            return 'Tidak diketahui';
        }
    }

    // 6. Fungsi updateStatusInfo()
    // PERBAIKAN: Fungsi updateStatusInfo dengan tampilan yang lebih proporsional
    function updateStatusInfo() {
        const statusInfoContent = document.getElementById('status-info-content');
        if (!statusInfoContent) return;

        if (currentEstimasi) {
            // ✅ ESTIMASI DITEMUKAN - TAMPILAN BESAR DAN JELAS
            statusInfoContent.innerHTML = `
            <div style="background: linear-gradient(135deg, #107c10 0%, #0c6c0c 100%); color: white; padding: 16px; border-radius: 4px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 18px;">✅</span>
                    <span style="font-size: 16px; font-weight: 600;">ESTIMASI DITEMUKAN</span>
                </div>
                <div style="font-size: 14px; opacity: 0.9;">Data estimasi berhasil dimuat dari database</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
                    <div style="font-weight: 600; color: #605e5c; font-size: 11px;">TEKNISI</div>
                    <div style="color: #323130; font-weight: 500; margin-top: 4px;">${currentEstimasi.teknisi_name || 'Tidak diketahui'}</div>
                </div>

                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
                    <div style="font-weight: 600; color: #605e5c; font-size: 11px;">TANGGAL</div>
                    <div style="color: #323130; font-weight: 500; margin-top: 4px;">${formatDate(currentEstimasi.created_at)}</div>
                </div>

                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
                    <div style="font-weight: 600; color: #605e5c; font-size: 11px;">STATUS</div>
                    <div style="color: #323130; font-weight: 500; margin-top: 4px;">
                        <span style="background: ${getStatusColor(currentEstimasi.status)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">
                            ${getStatusText(currentEstimasi.status)}
                        </span>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
                    <div style="font-weight: 600; color: #605e5c; font-size: 11px;">TOTAL</div>
                    <div style="color: #323130; font-weight: 500; margin-top: 4px; font-size: 14px; color: #107c10;">
                        Rp ${(currentEstimasi.total_harga || 0).toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            <div style="margin-top: 12px; padding: 8px; background: #e3f2fd; border-radius: 4px; border-left: 4px solid #2196f3;">
                <div style="font-size: 11px; color: #1976d2; font-weight: 600;">WORKORDER ID</div>
                <div style="font-size: 10px; color: #0d47a1; font-family: monospace; margin-top: 2px;">${currentWorkOrderId || '-'}</div>
            </div>
        `;
    } else {
        // ❌ TIDAK ADA ESTIMASI - TAMPILAN INFORMATIF
        statusInfoContent.innerHTML = `
            <div style="text-align: center; padding: 30px 20px;">
                <div style="font-size: 32px; margin-bottom: 12px; color: #ff9800;">🔍</div>
                <div style="font-size: 16px; font-weight: 600; color: #323130; margin-bottom: 8px;">Mencari Estimasi</div>
                <div style="font-size: 13px; color: #666; margin-bottom: 16px;">
                    ${currentPlateNumber ?
            `Mencari data estimasi untuk plat: <strong>${currentPlateNumber}</strong>` :
        'Menunggu data plat nomor...'
    }
                </div>
                <div style="background: #fff3cd; padding: 8px 12px; border-radius: 4px; border: 1px solid #ffeaa7;">
                    <div style="font-size: 11px; color: #856404;">
                        <strong>Info:</strong> Hanya menampilkan estimasi dengan status "sent"
                    </div>
                </div>
            </div>
        `;
    }

    // Update textarea keterangan
    const keteranganInput = document.getElementById('keterangan-edit');
    if (keteranganInput && currentEstimasi) {
        keteranganInput.value = currentEstimasi.keterangan || '';
    }
}

    // FUNGSI HELPER UNTUK STATUS
    function getStatusColor(status) {
        const colors = {
            'sent': '#ff9800',
            'completed': '#4caf50',
            'draft': '#2196f3',
            'pending': '#9e9e9e',
            'progress': '#ff9800'
        };
        return colors[status] || '#9e9e9e';
    }

    function getStatusText(status) {
        const texts = {
            'sent': 'MENUNGGU HARGA',
            'completed': 'SELESAI',
            'draft': 'DRAFT',
            'pending': 'PENDING',
            'progress': 'PROGRESS'
        };
        return texts[status] || status?.toUpperCase() || 'UNKNOWN';
    }

    // Tambahkan juga fungsi formatDate jika belum ada
    function formatDate(dateString) {
        if (!dateString) return 'Invalid Date';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'Invalid Date' : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        } catch (e) {
            return 'Invalid Date';
        }
    }

    // 7. Fungsi setupServiceEventListeners()
    function setupServiceEventListeners() {
        // Setup service search
        const serviceInputs = document.querySelectorAll('.service-name');
        serviceInputs.forEach(input => {
            input.removeEventListener('input', handleServiceSearch);
            input.addEventListener('input', handleServiceSearch);
        });

        // Setup service input listeners
        const serviceInputs2 = document.querySelectorAll('.service-hour, .service-price-edit');
        serviceInputs2.forEach(input => {
            input.removeEventListener('input', updateFinalPrice);
            input.addEventListener('input', updateFinalPrice);
        });

        // Setup edit buttons
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.removeEventListener('click', togglePriceEdit);
            button.addEventListener('click', togglePriceEdit);
        });

        // Setup action buttons
        const addButtons = document.querySelectorAll('.add-btn');
        addButtons.forEach(button => {
            button.removeEventListener('click', addServiceRow);
            button.addEventListener('click', addServiceRow);
        });

        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.removeEventListener('click', function() {
                removeServiceRow(this);
            });
            button.addEventListener('click', function() {
                removeServiceRow(this);
            });
        });
    }

    // 8. SEMUA FUNGSI SERVICE TABLE:
    // - handleServiceSearch(event)
    // - showDropdown(input, services)
    // - hideDropdown()
    // - selectService(input, service)
    // - updateFinalPriceForRow(row)
    // - updateFinalPrice(event)
    // - togglePriceEdit(event)
    // - addServiceRow()
    // - removeServiceRow(button)
    // - updateRemoveButtons()
    // - updateTotalHarga()
    // - updateGrandTotal()

    // Handle service search
    function handleServiceSearch(event) {
        const input = event.target;
        const value = input.value.trim();

        if (value.length < 3) {
            hideDropdown();
            return;
        }

        // Simulasi pencarian service
        const services = [
            { name: "TUNE UP", desc: "Service tune up mesin", hour: 1.0, price: 150000 },
            { name: "GANTI OLI", desc: "Ganti oli mesin dan filter", hour: 0.5, price: 75000 },
            { name: "SERVICE REM", desc: "Service sistem pengereman", hour: 1.5, price: 225000 },
            { name: "SPOORING", desc: "Spooring dan balancing", hour: 1.0, price: 150000 },
            { name: "GANTI KAMPAS REM", desc: "Penggantian kampas rem", hour: 2.0, price: 300000 }
        ];

        const filteredServices = services.filter(service =>
                                                 service.name.toLowerCase().includes(value.toLowerCase())
                                                );

        if (filteredServices.length > 0) {
            showDropdown(input, filteredServices);
        } else {
            hideDropdown();
        }
    }

    // Show dropdown
    function showDropdown(input, services) {
        hideDropdown();

        const dropdown = document.createElement('div');
        dropdown.className = 'service-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 4px;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        `;

        services.forEach(service => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                font-size: 12px;
            `;
            item.innerHTML = `
                <div style="font-weight: bold;">${service.name}</div>
                <div style="color: #666;">${service.desc}</div>
                <div style="color: #888;">${service.hour} jam - Rp ${service.price.toLocaleString('id-ID')}</div>
            `;
            item.addEventListener('click', () => {
                selectService(input, service);
                hideDropdown();
            });
            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);
        currentDropdown = dropdown;

        const rect = input.getBoundingClientRect();
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
        dropdown.style.width = rect.width + 'px';
    }

    // Hide dropdown
    function hideDropdown() {
        if (currentDropdown) {
            currentDropdown.remove();
            currentDropdown = null;
        }
    }

    // Select service
    function selectService(input, service) {
        const row = input.closest('tr');
        input.value = service.name;

        const descCell = row.querySelector('.service-desc');
        const hourInput = row.querySelector('.service-hour');
        const priceDisplay = row.querySelector('.service-price-display');
        const priceEdit = row.querySelector('.service-price-edit');

        descCell.textContent = service.desc;
        hourInput.value = service.hour;
        priceDisplay.textContent = 'Rp ' + service.price.toLocaleString('id-ID');
        priceEdit.value = service.price;

        // Update final price
        updateFinalPriceForRow(row);
    }

    // Update final price for a row
    function updateFinalPriceForRow(row) {
        const hourInput = row.querySelector('.service-hour');
        const priceEdit = row.querySelector('.service-price-edit');
        const finalCell = row.querySelector('.service-final');

        if (!hourInput || !priceEdit || !finalCell) return;

        const hours = parseFloat(hourInput.value) || 0;
        const price = parseFloat(priceEdit.value) || 0;

        // Hitung harga final
        let finalPrice = 0;
        if (hours > 0 && price > 0) {
            finalPrice = hours * price;
        } else if (price > 0) {
            finalPrice = price;
        }

        finalCell.textContent = 'Rp ' + finalPrice.toLocaleString('id-ID');

        // Update total
        updateTotalHarga();
        updateGrandTotal();
    }

    // Update final price
    function updateFinalPrice(event) {
        const row = event.target.closest('tr');
        updateFinalPriceForRow(row);
    }

    // Toggle price edit
    function togglePriceEdit(event) {
        const button = event.target;
        const row = button.closest('tr');
        const priceCell = row.querySelector('.service-price-cell');
        const priceDisplay = priceCell.querySelector('.service-price-display');
        const priceEdit = priceCell.querySelector('.service-price-edit');

        if (priceEdit.style.display === 'none') {
            priceDisplay.style.display = 'none';
            priceEdit.style.display = 'inline-block';
            priceEdit.focus();
            button.textContent = '💾';
            button.title = 'Simpan harga';
        } else {
            priceDisplay.style.display = 'inline';
            priceEdit.style.display = 'none';

            // Update display value
            const priceValue = parseFloat(priceEdit.value) || 0;
            priceDisplay.textContent = priceValue > 0 ? 'Rp ' + priceValue.toLocaleString('id-ID') : '-';

            button.textContent = '✏️';
            button.title = 'Edit harga';

            // Update final price
            updateFinalPriceForRow(row);
        }
    }

    // Add service row
    function addServiceRow() {
        const serviceTbody = document.getElementById('service-tbody');
        const totalRow = serviceTbody.querySelector('.total-row');
        const rows = serviceTbody.querySelectorAll('tr:not(.total-row)');
        const newIndex = rows.length;

        const newRow = document.createElement('tr');
        newRow.setAttribute('data-index', newIndex);
        newRow.innerHTML = `
            <td>
                <input type="text" class="compact-input service-name"
                       value="" placeholder="Ketik service...">
            </td>
            <td class="service-desc" style="font-size: 11px; padding: 4px;">-</td>
            <td>
                <input type="number" class="compact-input service-hour" min="0" step="0.1"
                       value="0.0" style="width: 50px; text-align: center;">
            </td>
            <td class="service-price-cell">
                <span class="service-price-display">-</span>
                <input type="number" class="compact-input service-price-edit" value="0" style="display:none; width: 80px;">
            </td>
            <td class="service-final" style="text-align: right; font-weight: 500; font-size: 11px;">-</td>
            <td>
                <div class="row-actions">
                    <button class="action-icon remove-btn" title="Hapus baris">×</button>
                    <button class="action-icon edit-btn" title="Edit harga">✏️</button>
                </div>
            </td>
        `;

        serviceTbody.insertBefore(newRow, totalRow);

        // Setup event listeners untuk baris baru
        setupServiceEventListeners();

        // Update remove buttons untuk semua baris
        updateRemoveButtons();
    }

    // Remove service row
    function removeServiceRow(button) {
        const row = button.closest('tr');
        if (row) {
            row.remove();
            updateRemoveButtons();
            updateTotalHarga();
            updateGrandTotal();
        }
    }

    // Update remove buttons
    function updateRemoveButtons() {
        const serviceTbody = document.getElementById('service-tbody');
        const rows = serviceTbody.querySelectorAll('tr:not(.total-row)');

        rows.forEach((row, index) => {
            const actionsDiv = row.querySelector('.row-actions');
            if (actionsDiv) {
                if (index === 0) {
                    actionsDiv.innerHTML = `
                        <button class="action-icon add-btn" title="Tambah baris">+</button>
                        <button class="action-icon edit-btn" title="Edit harga">✏️</button>
                    `;
                } else {
                    actionsDiv.innerHTML = `
                        <button class="action-icon remove-btn" title="Hapus baris">×</button>
                        <button class="action-icon edit-btn" title="Edit harga">✏️</button>
                    `;
                }
            }
        });

        // Setup event listeners kembali
        setupServiceEventListeners();
    }

    // Update total harga jasa
    function updateTotalHarga() {
        const serviceTbody = document.getElementById('service-tbody');
        const rows = serviceTbody.querySelectorAll('tr:not(.total-row)');
        let totalHargaJasa = 0;

        rows.forEach(row => {
            const finalCell = row.querySelector('.service-final');
            if (finalCell) {
                const finalText = finalCell.textContent.replace('Rp ', '').replace(/\./g, '');
                const finalValue = parseFloat(finalText) || 0;
                totalHargaJasa += finalValue;
            }
        });

        const totalHargaJasaElement = document.getElementById('totalHargaJasa');
        if (totalHargaJasaElement) {
            totalHargaJasaElement.textContent = 'Rp ' + totalHargaJasa.toLocaleString('id-ID');
        }

        return totalHargaJasa;
    }

    // Update grand total
    function updateGrandTotal() {
        const totalHargaJasa = updateTotalHarga();

        // Hitung total sparepart dari tabel sparepart
        let totalSparepart = 0;
        const sparepartRows = document.querySelectorAll('#sparepart-table-container tbody tr');
        sparepartRows.forEach(row => {
            const subtotalCell = row.querySelector('td:last-child');
            if (subtotalCell) {
                const subtotalText = subtotalCell.textContent.replace('Rp ', '').replace(/\./g, '');
                const subtotalValue = parseFloat(subtotalText) || 0;
                totalSparepart += subtotalValue;
            }
        });

        const totalKeseluruhan = totalSparepart + totalHargaJasa;

        // Update grand total display
        const grandTotalElement = document.getElementById('grand-total-value');
        const breakdownElement = document.getElementById('total-breakdown');

        if (grandTotalElement) {
            grandTotalElement.textContent = 'Rp ' + totalKeseluruhan.toLocaleString('id-ID');
        }

        if (breakdownElement) {
            breakdownElement.innerHTML = `
                <div>Sparepart: Rp ${totalSparepart.toLocaleString('id-ID')}</div>
                <div>Service: Rp ${totalHargaJasa.toLocaleString('id-ID')}</div>
            `;
        }
    }

    // 9. Fungsi saveEstimasi() - akan dimodifikasi

    // ==================== FUNGSI BARU YANG DIPERBAIKI ====================

    // PERBAIKAN 1: Inisialisasi dengan Loading dan Retry Mechanism
    function initializeWithRetry() {
        if (window.toyotaTableScriptRunning) {
            if (!SILENT_MODE) console.log('⚠️ Script tabel sudah berjalan');
            return;
        }
        window.toyotaTableScriptRunning = true;

        if (!SILENT_MODE) console.log('🚀 Script Tunas Toyota - Compact Fluent Work Order Line dimuat');

        // Tambahkan loading indicator
        addLoadingIndicator();

        // Tunggu hingga halaman selesai dimuat dengan retry mechanism
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initializeApp, 3000);
            });
        } else {
            setTimeout(initializeApp, 3000);
        }
    }

    // PERBAIKAN 2: Loading Indicator
    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'toyota-loading-indicator';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #0078d4;
            color: white;
            padding: 20px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        loadingDiv.innerHTML = `
            <div class="loading-spinner" style="width: 20px; height: 20px; border: 2px solid transparent; border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div>Memuat data estimasi Toyota...</div>
        `;

        // Tambahkan style untuk spinner
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(loadingDiv);
    }

    function removeLoadingIndicator() {
        const loadingDiv = document.getElementById('toyota-loading-indicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // PERBAIKAN 3: Inisialisasi App dengan Error Handling
    async function initializeApp() {
        try {
            if (!SILENT_MODE) console.log('🔧 Menginisialisasi aplikasi...');

            await initializeSupabase();
            await initializeWorkOrderData();

            // Cek jika container sudah ada
            if (document.getElementById('estimasi-compact-container')) {
                if (!SILENT_MODE) console.log('ℹ️ Tabel sudah ada');
                removeLoadingIndicator();
                return;
            }

            initCompactTable();
            removeLoadingIndicator();

        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error inisialisasi:', error);
            // Retry setelah 5 detik
            setTimeout(initializeApp, 5000);
        }
    }

    // PERBAIKAN 4: Inisialisasi WorkOrder Data yang Lebih Robust
    async function initializeWorkOrderData() {
        if (!SILENT_MODE) console.log('🔧 Menginisialisasi data WorkOrder...');

        // Dapatkan WorkOrder ID dari URL
        currentWorkOrderId = getWorkOrderIdFromURL();

        if (currentWorkOrderId) {
            // Dapatkan plat nomor
            currentPlateNumber = await getPlateNumber(currentWorkOrderId);

            if (currentPlateNumber) {
                if (!SILENT_MODE) console.log('✅ WorkOrder data initialized:', {
                    workOrderId: currentWorkOrderId,
                    plateNumber: currentPlateNumber
                });

                // Load data estimasi
                await loadEstimasiDataByPlate(currentPlateNumber);
            } else {
                if (!SILENT_MODE) console.log('⚠️ Tidak dapat mendapatkan plat nomor');
            }
        } else {
            if (!SILENT_MODE) console.log('⚠️ WorkOrder ID tidak ditemukan');
        }
    }

    // PERBAIKAN 5: Load Estimasi Data dengan Error Handling
    async function loadEstimasiDataByPlate(plateNumber) {
        try {
            if (!SILENT_MODE) console.log('📊 Loading estimasi data untuk plate:', plateNumber);

            const { data: estimasiData, error } = await supabase
            .from('estimasi')
            .select('*')
            .eq('status', 'sent')
            .eq('nopol', plateNumber)
            .order('created_at', { ascending: false });

            if (error) throw error;

            if (estimasiData && estimasiData.length > 0) {
                currentEstimasi = estimasiData[0];
                const teknisiName = await getTeknisiName(currentEstimasi.teknisi_id);
                currentEstimasi.teknisi_name = teknisiName;

                if (!SILENT_MODE) console.log('✅ Data estimasi ditemukan:', currentEstimasi.nopol);
            } else {
                currentEstimasi = null;
                if (!SILENT_MODE) console.log('ℹ️ Tidak ada data estimasi dengan status sent untuk:', plateNumber);
            }

            // ⬇️ SELALU UPDATE TAMPILAN DAN STATUS INFO
            updateEstimasiDisplay();
            updateStatusInfo(); // ⬅️ INI YANG PENTING

        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error loading estimasi data:', error);
            currentEstimasi = null;
            updateEstimasiDisplay();
            updateStatusInfo(); // ⬅️ UPDATE JUGA SAAT ERROR
        }
    }

    // PERBAIKAN 6: Init Compact Table dengan Pasti Tampil
    function initCompactTable() {
        // Hapus existing container jika ada (cleanup)
        const existingContainer = document.getElementById('estimasi-compact-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Cari container tombol utama dengan multiple selector
        const mainButtonContainer = document.querySelector('.button-container, .ms-crm-List-ButtonBar, [class*="button"], [class*="Button"]');
        if (!mainButtonContainer) {
            if (!SILENT_MODE) console.log('⚠️ Button container tidak ditemukan, mencoba lagi...');
            setTimeout(initCompactTable, 2000);
            return;
        }

        if (!SILENT_MODE) console.log('🔨 Membuat compact table container...');

        // Buat container utama
        const estimasiContainer = document.createElement('div');
        estimasiContainer.id = 'estimasi-compact-container';
        estimasiContainer.style.cssText = `
            margin: 16px;
            padding: 0;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
            display: none;
            width: calc(100% - 32px);
            max-width: calc(100vw - 64px);
            border: 1px solid #e1e5e9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        `;

        // Header dengan tombol aksi baru
        const headerContainer = document.createElement('div');
        headerContainer.style.cssText = `
            padding: 12px 16px;
            background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
            color: white;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        headerContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 16px; font-weight: 600;">📋 Estimasi Service</span>
                <span style="font-size: 13px; opacity: 0.9;">${currentPlateNumber || 'Loading...'}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="compact-btn secondary" id="refresh-btn" title="Refresh Data">
                    <span style="font-size: 14px;">🔄</span>
                </button>
                <button class="compact-btn secondary" id="uppercase-btn" title="Toggle Uppercase Sparepart">
                    <span style="font-size: 14px;">🔠</span>
                </button>
                <button class="compact-btn secondary" id="detail-toggle-btn" title="Toggle Detail">
                    <span style="font-size: 14px;">📊</span>
                </button>
                <button class="compact-btn primary" id="copy-main-btn">
                    <span style="font-size: 14px;">📥</span> Salin Service
                </button>
            </div>
        `;

        // Container untuk detail dan tabel
        const contentContainer = document.createElement('div');
        contentContainer.id = 'content-container';
        contentContainer.style.cssText = `
            display: flex;
            gap: 16px;
            padding: 16px;
            min-height: 400px;
        `;

        // Panel kiri - Detail estimasi dengan edit keterangan
        const leftPanel = document.createElement('div');
        leftPanel.id = 'left-panel';
        leftPanel.style.cssText = `
            flex: 0 0 30%;
            display: flex;
            flex-direction: column;
            gap: 16px;
        `;

        // Card detail estimasi dengan edit
        const detailCard = document.createElement('div');
        detailCard.id = 'detail-card';
        detailCard.style.cssText = `
            background: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e1e5e9;
            overflow: hidden;
        `;

        const detailHeader = document.createElement('div');
        detailHeader.style.cssText = `
            padding: 12px 16px;
            background: #f0f0f0;
            border-bottom: 1px solid #e1e5e9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        `;
        detailHeader.innerHTML = `
            <span style="font-size: 14px; font-weight: 600; color: #323130;">Detail Estimasi</span>
            <span id="detail-collapse-icon" style="font-size: 12px; color: #605e5c; transition: transform 0.2s ease;">▼</span>
        `;

        const detailContent = document.createElement('div');
        detailContent.id = 'detail-content';
        detailContent.style.cssText = `
            padding: 16px;
            max-height: 300px;
            overflow: hidden;
            transition: all 0.3s ease;
        `;

        detailCard.appendChild(detailHeader);
        detailCard.appendChild(detailContent);

        // Card edit keterangan
        const editCard = document.createElement('div');
        editCard.id = 'edit-card';
        editCard.style.cssText = `
            background: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e1e5e9;
            padding: 16px;
        `;

        // PERBAIKAN: Modifikasi editCard untuk menyertakan status info
        editCard.innerHTML = `
    <div style="font-size: 16px; font-weight: 600; color: #323130; margin-bottom: 16px;">
        ✏️ Edit Keterangan
    </div>

    <!-- CARD STATUS DIPISAH SUPAYA TIDAK MENYATU DENGAN TEXTAREA -->
    <div id="estimasi-status-info" style="
        margin-bottom: 16px;
        padding: 16px;
        background: #e8f5e9;
        border: 1px solid #c8e6c9;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    ">
        <div style="font-size: 15px; font-weight: 600; color: #2e7d32;">
            ${currentEstimasi ? '✅ Estimasi Ditemukan' : '🔍 Mencari Estimasi...'}
        </div>

        ${currentEstimasi ? `
            <div style="font-size: 13px; color: #424242; margin-top: 8px; line-height: 1.4;">
                <div><strong>Teknisi:</strong> ${currentEstimasi.teknisi_name || 'Tidak diketahui'}</div>
                <div><strong>Tanggal:</strong> ${formatDate(currentEstimasi.created_at)}</div>
                <div><strong>Status:</strong> ${currentEstimasi.status}</div>
            </div>
        ` : ''}
    </div>

    <!-- TEXTAREA TERPISAH SENDIRI -->
    <textarea id="keterangan-edit"
        style="width: 100%; height: 100px; padding: 10px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        font-size: 14px;
        font-family: 'Segoe UI', system-ui;
        resize: vertical;"
        placeholder="Tambahkan atau edit keterangan estimasi...">
        ${currentEstimasi?.keterangan || ''}
    </textarea>

    <button class="compact-btn primary" id="save-keterangan-btn"
        style="margin-top: 12px; width: 100%; font-size: 14px;">
        💾 Simpan Keterangan
    </button>
`;


        leftPanel.appendChild(detailCard);
        leftPanel.appendChild(editCard);

        // Panel kanan - Tabel sparepart dan service
        const rightPanel = document.createElement('div');
        rightPanel.id = 'right-panel';
        rightPanel.style.cssText = `
            flex: 0 0 70%;
            display: flex;
            flex-direction: column;
            gap: 16px;
        `;

        // Card tabel sparepart dengan uppercase toggle
        const sparepartCard = document.createElement('div');
        sparepartCard.style.cssText = `
            background: #ffffff;
            border-radius: 6px;
            border: 1px solid #e1e5e9;
            overflow: hidden;
            flex: 1;
            display: flex;
            flex-direction: column;
        `;

        sparepartCard.innerHTML = `
            <div style="padding: 12px 16px; background: #f8f9fa; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: 600; color: #323130;">🛠️ Data Sparepart</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span id="uppercase-status" style="font-size: 11px; color: #666;">Normal</span>
                </div>
            </div>
            <div id="sparepart-table-container" style="flex: 1; overflow: auto; max-height: 300px;">
                <!-- Tabel sparepart akan diisi di sini -->
            </div>
        `;

        rightPanel.appendChild(sparepartCard);

        // Container untuk service dan total
        const serviceTotalContainer = document.createElement('div');
        serviceTotalContainer.style.cssText = `
            display: flex;
            gap: 16px;
            margin-top: 8px;
        `;

        // Panel service
        const servicePanel = document.createElement('div');
        servicePanel.style.cssText = `
            flex: 0 0 70%;
            background: #ffffff;
            border-radius: 6px;
            border: 1px solid #e1e5e9;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;

        servicePanel.innerHTML = `
            <div style="padding: 12px 16px; background: #f8f9fa; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: 600; color: #323130;">🔧 Service & Jasa</span>
                <button class="compact-btn small primary" id="add-service-btn">
                    <span style="font-size: 12px;">+</span> Tambah
                </button>
            </div>
            <div id="service-table-container" style="flex: 1; overflow: auto; max-height: 250px;">
                <!-- Tabel service akan diisi di sini -->
            </div>
        `;

        // Panel total
        const totalPanel = document.createElement('div');
        totalPanel.style.cssText = `
            flex: 0 0 30%;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        // Card total
        const totalCard = document.createElement('div');
        totalCard.style.cssText = `
            background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
            color: white;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        `;

        totalCard.innerHTML = `
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">TOTAL ESTIMASI</div>
            <div id="grand-total-value" style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Rp 0</div>
            <div id="total-breakdown" style="font-size: 11px; opacity: 0.8; line-height: 1.4;">
                <div>Sparepart: Rp 0</div>
                <div>Service: Rp 0</div>
            </div>
        `;

        // Tombol simpan
        const saveCard = document.createElement('div');
        saveCard.style.cssText = `
            background: #ffffff;
            border-radius: 6px;
            border: 1px solid #e1e5e9;
            padding: 16px;
            text-align: center;
        `;

        const saveButton = document.createElement('button');
        saveButton.id = 'save-estimasi-btn';
        saveButton.style.cssText = `
            background: #107c10;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s ease;
        `;
        saveButton.innerHTML = '💾 Simpan Estimasi';
        saveButton.onmouseenter = () => saveButton.style.background = '#0c6c0c';
        saveButton.onmouseleave = () => saveButton.style.background = '#107c10';

        saveCard.appendChild(saveButton);
        totalPanel.appendChild(totalCard);
        totalPanel.appendChild(saveCard);

        serviceTotalContainer.appendChild(servicePanel);
        serviceTotalContainer.appendChild(totalPanel);

        rightPanel.appendChild(serviceTotalContainer);

        contentContainer.appendChild(leftPanel);
        contentContainer.appendChild(rightPanel);

        // Susun semua elemen
        estimasiContainer.appendChild(headerContainer);
        estimasiContainer.appendChild(contentContainer);

        // Tempatkan setelah tombol utama
        mainButtonContainer.parentNode.insertBefore(estimasiContainer, mainButtonContainer.nextSibling);

        // Setup event listeners
        setupEnhancedEventListeners();

        // Tampilkan container
        estimasiContainer.style.display = 'block';

        // Update display
        updateEstimasiDisplay();

        // Nonaktifkan tombol Save dan Cancel CRM
        disableCRMButtons();

        if (!SILENT_MODE) console.log('✅ Compact table container berhasil dibuat dan ditampilkan');
    }

    // PERBAIKAN 7: Setup Enhanced Event Listeners
    function setupEnhancedEventListeners() {
        // Tombol refresh
        document.getElementById('refresh-btn').addEventListener('click', async () => {
            if (currentPlateNumber) {
                await loadEstimasiDataByPlate(currentPlateNumber);
            }
        });

        // Tombol uppercase
        document.getElementById('uppercase-btn').addEventListener('click', toggleUppercaseSparepart);

        // Tombol salin dari tabel utama
        document.getElementById('copy-main-btn').addEventListener('click', copyAllFromMainTable);

        // Tombol simpan
        document.getElementById('save-estimasi-btn').addEventListener('click', saveEstimasi);

        // Tombol tambah service
        document.getElementById('add-service-btn').addEventListener('click', addServiceRow);

        // Tombol simpan keterangan
        document.getElementById('save-keterangan-btn').addEventListener('click', saveKeterangan);

        // Toggle collapse detail
        document.querySelector('#detail-card > div').addEventListener('click', toggleDetailCollapse);
        document.getElementById('detail-toggle-btn').addEventListener('click', toggleDetailCollapse);
    }

    // PERBAIKAN 8: Toggle Uppercase Sparepart
    function toggleUppercaseSparepart() {
        isUppercaseEnabled = !isUppercaseEnabled;
        const uppercaseStatus = document.getElementById('uppercase-status');
        const uppercaseBtn = document.getElementById('uppercase-btn');

        if (isUppercaseEnabled) {
            uppercaseStatus.textContent = 'UPPERCASE';
            uppercaseStatus.style.color = '#0078d4';
            uppercaseStatus.style.fontWeight = 'bold';
            uppercaseBtn.style.background = '#0078d4';
            uppercaseBtn.style.color = 'white';
        } else {
            uppercaseStatus.textContent = 'Normal';
            uppercaseStatus.style.color = '#666';
            uppercaseStatus.style.fontWeight = 'normal';
            uppercaseBtn.style.background = '#f3f2f1';
            uppercaseBtn.style.color = '#323130';
        }

        // Update tampilan sparepart
        if (currentEstimasi) {
            renderEstimasiData();
        }
    }

    // PERBAIKAN 9: Save Keterangan
    async function saveKeterangan() {
        if (!currentEstimasi) {
            alert('Tidak ada data estimasi yang tersedia');
            return;
        }

        const keteranganInput = document.getElementById('keterangan-edit');
        const newKeterangan = keteranganInput.value.trim();

        try {
            const { data, error } = await supabase
            .from('estimasi')
            .update({
                keterangan: newKeterangan,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentEstimasi.id)
            .select();

            if (error) throw error;

            currentEstimasi.keterangan = newKeterangan;
            alert('✅ Keterangan berhasil disimpan!');

            // Update tampilan
            updateEstimasiDisplay();

        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error saving keterangan:', error);
            alert('❌ Gagal menyimpan keterangan: ' + error.message);
        }
    }

    // PERBAIKAN 10: Update Estimasi Display dengan Edit Keterangan
    function updateEstimasiDisplay() {
        const estimasiContainer = document.getElementById('estimasi-compact-container');
        if (!estimasiContainer) {
            if (!SILENT_MODE) console.log('⚠️ Estimasi container belum ada');
            return;
        }

        if (currentEstimasi) {
            estimasiContainer.style.display = 'block';
            renderEstimasiData();

            // Set nilai keterangan di textarea
            const keteranganInput = document.getElementById('keterangan-edit');
            if (keteranganInput) {
                keteranganInput.value = currentEstimasi.keterangan || '';
            }

            if (!SILENT_MODE) console.log('✅ Menampilkan data estimasi untuk:', currentEstimasi.nopol);
        } else {
            estimasiContainer.style.display = 'none';
            if (!SILENT_MODE) console.log('ℹ️ Menyembunyikan estimasi container - tidak ada data');
        }
    }

    // PERBAIKAN 11: Render Estimasi Data dengan Uppercase dan Swap Name/Desc
    function renderEstimasiData() {
        if (!currentEstimasi) return;

        const detailContent = document.getElementById('detail-content');
        const sparepartTableContainer = document.getElementById('sparepart-table-container');
        const serviceTableContainer = document.getElementById('service-table-container');

        if (!detailContent || !sparepartTableContainer || !serviceTableContainer) return;

        if (!SILENT_MODE) console.log('🎨 Rendering compact estimasi data untuk:', currentEstimasi.nopol);

        // Parse data
        let komponenArray = [];
        if (Array.isArray(currentEstimasi.komponen)) {
            komponenArray = currentEstimasi.komponen;
        } else if (typeof currentEstimasi.komponen === 'string') {
            try {
                komponenArray = JSON.parse(currentEstimasi.komponen);
            } catch (e) {
                komponenArray = currentEstimasi.komponen.split(',');
            }
        }

        let sparepartData = [];
        if (Array.isArray(currentEstimasi.sparepart_data)) {
            sparepartData = currentEstimasi.sparepart_data;
        } else if (typeof currentEstimasi.sparepart_data === 'string' && currentEstimasi.sparepart_data.trim() !== '') {
            try {
                sparepartData = JSON.parse(currentEstimasi.sparepart_data);
            } catch (e) {
                if (!SILENT_MODE) console.error('❌ Gagal parse sparepart_data:', e);
            }
        }

        let serviceData = [];
        if (Array.isArray(currentEstimasi.service_data)) {
            serviceData = currentEstimasi.service_data;
        } else if (typeof currentEstimasi.service_data === 'string' && currentEstimasi.service_data.trim() !== '') {
            try {
                serviceData = JSON.parse(currentEstimasi.service_data);
            } catch (e) {
                if (!SILENT_MODE) console.error('❌ Gagal parse service_data:', e);
            }
        }

        // PERBAIKAN: Swap name dan desc untuk service data
        if (serviceData.length > 0) {
            serviceData = serviceData.map(service => {
                // Simpan nilai asli terlebih dahulu
                const originalName = service.name || '';
                const originalDesc = service.desc || '';

                // Swap values
                return {
                    ...service,
                    name: originalDesc, // desc lama menjadi name baru
                    desc: originalName  // name lama menjadi desc baru
                };
            });
        }

        // Render detail estimasi
        detailContent.innerHTML = `
            <div style="display: grid; gap: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #605e5c;">Nomor Polisi:</span>
                    <span style="font-weight: 500;">${currentEstimasi.nopol}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #605e5c;">Nomor Rangka:</span>
                    <span style="font-weight: 500;">${currentEstimasi.nomor_rangka || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #605e5c;">Jenis Mobil:</span>
                    <span style="font-weight: 500;">${currentEstimasi.jenis_mobil}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #605e5c;">Keterangan:</span>
                    <span style="font-weight: 500; text-align: right;">${currentEstimasi.keterangan || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #605e5c;">Catatan Sparepart:</span>
                    <span style="font-weight: 500; text-align: right;">${currentEstimasi.catatan_sparepart || '-'}</span>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e1e5e9;">
                    <div style="color: #605e5c; margin-bottom: 4px;">Komponen Service:</div>
                    <div style="font-size: 12px; color: #323130;">${komponenArray.join(', ')}</div>
                </div>
            </div>
        `;

        // Hitung total untuk sparepart
        const totalSparepart = sparepartData.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

        // Render tabel sparepart dengan uppercase option
        sparepartTableContainer.innerHTML = `
            <table class="compact-table">
                <thead>
                    <tr>
                        <th style="width: 40px">No</th>
                        <th>Nama Sparepart</th>
                        <th style="width: 80px">Qty</th>
                        <th style="width: 100px">Harga</th>
                        <th style="width: 100px">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${sparepartData.length > 0 ? sparepartData.map((item, index) => {
            let itemName = item.name || '';
            if (isUppercaseEnabled) {
                itemName = itemName.toUpperCase();
            }
            return `
                        <tr>
                            <td style="text-align: center;">${index + 1}</td>
                            <td style="font-size: 12px; padding: 6px 8px;">${itemName}</td>
                            <td style="text-align: center;">${item.qty || 1}</td>
                            <td style="text-align: right;">Rp ${(parseFloat(item.price) || 0).toLocaleString('id-ID')}</td>
                            <td style="text-align: right; font-weight: 500;">Rp ${(parseFloat(item.total) || 0).toLocaleString('id-ID')}</td>
                        </tr>
                    `}).join('') : `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px; color: #605e5c;">
                                Tidak ada data sparepart
                            </td>
                        </tr>
                    `}
                </tbody>
                ${sparepartData.length > 0 ? `
                <tfoot>
                    <tr style="background: #f8f9fa;">
                        <td colspan="4" style="text-align: right; padding: 8px; font-weight: 600;">Total Sparepart:</td>
                        <td style="text-align: right; padding: 8px; font-weight: bold; color: #0078d4;">
                            Rp ${totalSparepart.toLocaleString('id-ID')}
                        </td>
                    </tr>
                </tfoot>
                ` : ''}
            </table>
        `;

        // Hitung total untuk service (setelah swap)
        const totalService = serviceData.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        const totalKeseluruhan = totalSparepart + totalService;

        // Render tabel service dengan data yang sudah di-swap
        serviceTableContainer.innerHTML = `
            <table class="compact-table" id="service-table">
                <thead>
                    <tr>
                        <th style="width: 25%">Service</th>
                        <th style="width: 25%">Deskripsi</th>
                        <th style="width: 10%">Jam</th>
                        <th style="width: 15%">Harga</th>
                        <th style="width: 15%">Total</th>
                        <th style="width: 10%">Aksi</th>
                    </tr>
                </thead>
                <tbody id="service-tbody">
                    ${serviceData.length > 0 ?
            serviceData.map((service, index) => `
                            <tr data-index="${index}" class="${service.name === '-' ? 'free-service' : ''}">
                                <td>
                                    <input type="text" class="compact-input service-name"
                                           value="${service.name || ''}" placeholder="Ketik service...">
                                </td>
                                <td class="service-desc" style="font-size: 11px; padding: 4px;">${service.desc || '-'}</td>
                                <td>
                                    <input type="number" class="compact-input service-hour" min="0" step="0.1"
                                           value="${service.name === '-' ? '0' : (service.hour || '0.0')}"
                                           style="width: 50px; text-align: center;"
                                           ${service.name === '-' ? 'readonly' : ''}>
                                </td>
                                <td class="service-price-cell">
                                    <span class="service-price-display">${service.price ? 'Rp ' + (parseFloat(service.price) || 0).toLocaleString('id-ID') : '-'}</span>
                                    <input type="number" class="compact-input service-price-edit"
                                           value="${parseFloat(service.price) || '0'}" style="display:none; width: 80px;">
                                </td>
                                <td class="service-final" style="text-align: right; font-weight: 500; font-size: 11px;">
                                    ${service.total ? 'Rp ' + (parseFloat(service.total) || 0).toLocaleString('id-ID') : '-'}
                                </td>
                                <td>
                                    <div class="row-actions">
                                        ${index === 0 ?
                            '<button class="action-icon add-btn" title="Tambah baris">+</button>' :
                            '<button class="action-icon remove-btn" title="Hapus baris">×</button>'
                            }
                                        <button class="action-icon edit-btn" title="Edit harga">✏️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') :
        komponenArray.map((komponen, index) => `
                            <tr data-index="${index}" class="${komponen === '-' ? 'free-service' : ''}">
                                <td>
                                    <input type="text" class="compact-input service-name"
                                           value="${komponen}" placeholder="Ketik service...">
                                </td>
                                <td class="service-desc" style="font-size: 11px; padding: 4px;">-</td>
                                <td>
                                    <input type="number" class="compact-input service-hour" min="0" step="0.1"
                                           value="${komponen === '-' ? '0' : '0.0'}"
                                           style="width: 50px; text-align: center;"
                                           ${komponen === '-' ? 'readonly' : ''}>
                                </td>
                                <td class="service-price-cell">
                                    <span class="service-price-display">-</span>
                                    <input type="number" class="compact-input service-price-edit" value="0" style="display:none; width: 80px;">
                                </td>
                                <td class="service-final" style="text-align: right; font-weight: 500; font-size: 11px;">-</td>
                                <td>
                                    <div class="row-actions">
                                        ${index === 0 ?
                          '<button class="action-icon add-btn" title="Tambah baris">+</button>' :
                          '<button class="action-icon remove-btn" title="Hapus baris">×</button>'
                          }
                                        <button class="action-icon edit-btn" title="Edit harga">✏️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')
    }
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding: 8px; font-weight: 600;">Total Service:</td>
                        <td id="totalHargaJasa" style="text-align: right; padding: 8px; font-weight: bold; color: #0078d4;">
                            ${serviceData.length > 0 ? 'Rp ' + totalService.toLocaleString('id-ID') : 'Rp 0'}
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        `;

        // Update grand total
        document.getElementById('grand-total-value').textContent = `Rp ${totalKeseluruhan.toLocaleString('id-ID')}`;
        document.getElementById('total-breakdown').innerHTML = `
            <div>Sparepart: Rp ${totalSparepart.toLocaleString('id-ID')}</div>
            <div>Service: Rp ${totalService.toLocaleString('id-ID')}</div>
        `;

        // Setup event listeners untuk service table
        setupServiceEventListeners();

        // Update status info
        updateStatusInfo();

        if (!SILENT_MODE) console.log('✅ Compact estimasi data berhasil di-render');
    }

    // PERBAIKAN 12: Disable CRM Buttons
    function disableCRMButtons() {
        // Nonaktifkan tombol Save dan Cancel CRM
        const saveBtn = document.getElementById('submit-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';
            saveBtn.style.cursor = 'not-allowed';
            saveBtn.title = 'Tombol dinonaktifkan - Gunakan tombol Simpan Estimasi di panel Toyota';
        }

        if (cancelBtn) {
            cancelBtn.disabled = true;
            cancelBtn.style.opacity = '0.5';
            cancelBtn.style.cursor = 'not-allowed';
            cancelBtn.title = 'Tombol dinonaktifkan - Gunakan panel Toyota untuk mengelola estimasi';
        }

        if (saveBtn || cancelBtn) {
            if (!SILENT_MODE) console.log('✅ Tombol CRM Save/Cancel dinonaktifkan');
        }
    }

    // PERBAIKAN 13: Copy All From Main Table dengan Swap Name/Desc
    function copyAllFromMainTable() {
        try {
            const mainRows = document.querySelectorAll('#detail-grid-body .tr-body');

            if (mainRows.length === 0) {
                alert('Tidak ada baris di tabel utama yang bisa disalin!');
                return;
            }

            const serviceTbody = document.getElementById('service-tbody');
            if (!serviceTbody) {
                alert('Tabel service tidak ditemukan!');
                return;
            }

            // Hapus semua baris kecuali footer
            const existingRows = serviceTbody.querySelectorAll('tr:not(.total-row)');
            existingRows.forEach(row => row.remove());

            let copiedCount = 0;

            mainRows.forEach((mainRow, index) => {
                const rowId = mainRow.getAttribute('data-row');
                if (!rowId) return;

                // Ambil data dari baris utama
                const productName = document.getElementById(`productname-${rowId}`)?.value || '';
                const productDesc = document.getElementById(`productdesc-${rowId}`)?.value || '';
                const quantity = document.getElementById(`quantity-${rowId}`)?.value || '1';
                const quantityTemp = document.getElementById(`quantity-temp-${rowId}`)?.value || '1';
                const unitPrice = document.getElementById(`unitprice-${rowId}`)?.value || '0';
                const unitPriceTemp = document.getElementById(`unitprice-temp-${rowId}`)?.value || '0';
                const productType = document.getElementById(`producttype-${rowId}`)?.value || '';
                const discPercentage = document.getElementById(`discpercentage-${rowId}`)?.value || '0';
                const discPercentageTemp = document.getElementById(`discpercentage-temp-${rowId}`)?.value || '0';

                // Ambil jam kerja dari quantity (untuk service, quantity = man hour)
                let manHour = '0.0';

                if (quantityTemp && quantityTemp !== '1') {
                    manHour = quantityTemp;
                } else if (quantity && quantity !== '1') {
                    manHour = quantity;
                } else if (productType === '6') {
                    manHour = '1.0';
                }

                // Hanya salin jika tipe produk adalah service (6)
                if (productType === '6') {
                    // PERBAIKAN: SWAP name dan desc
                    const componentName = productDesc || productName; // desc menjadi name
                    const componentDesc = productName || '-'; // name menjadi desc

                    // Hitung harga final
                    const quantityNum = parseFloat(quantity) || 0;
                    const unitPriceNum = parseFloat(unitPrice) || 0;
                    const discPercentageNum = parseFloat(discPercentage) || 0;
                    const totalBeforeDisc = quantityNum * unitPriceNum;
                    const discountAmount = totalBeforeDisc * (discPercentageNum / 100);
                    const finalPrice = totalBeforeDisc - discountAmount;

                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-index', copiedCount);
                    newRow.className = componentName === '-' ? 'free-service' : '';

                    newRow.innerHTML = `
                        <td>
                            <input type="text" class="compact-input service-name"
                                   value="${componentName}" placeholder="Ketik service...">
                        </td>
                        <td class="service-desc" style="font-size: 11px; padding: 4px;">${componentDesc}</td>
                        <td>
                            <input type="number" class="compact-input service-hour" min="0" step="0.1"
                                   value="${componentName === '-' ? '0' : manHour}"
                                   style="width: 50px; text-align: center;"
                                   ${componentName === '-' ? 'readonly' : ''}>
                        </td>
                        <td class="service-price-cell">
                            <span class="service-price-display">${unitPriceNum > 0 ? 'Rp ' + unitPriceNum.toLocaleString('id-ID') : '-'}</span>
                            <input type="number" class="compact-input service-price-edit"
                                   value="${unitPriceNum}" style="display:none; width: 80px;">
                        </td>
                        <td class="service-final" style="text-align: right; font-weight: 500; font-size: 11px;">
                            ${finalPrice > 0 ? 'Rp ' + finalPrice.toLocaleString('id-ID') : '-'}
                        </td>
                        <td>
                            <div class="row-actions">
                                ${copiedCount === 0 ?
                        '<button class="action-icon add-btn" title="Tambah baris">+</button>' :
                    '<button class="action-icon remove-btn" title="Hapus baris">×</button>'
                }
                                <button class="action-icon edit-btn" title="Edit harga">✏️</button>
                            </div>
                        </td>
                    `;

                    const totalRow = serviceTbody.querySelector('.total-row');
                    serviceTbody.insertBefore(newRow, totalRow);

                    copiedCount++;

                    if (!SILENT_MODE) console.log(`✅ Disalin: ${componentName} | Jam: ${manHour} | Harga: Rp ${unitPriceNum.toLocaleString('id-ID')}`);
                }
            });

            if (copiedCount > 0) {
                alert(`✅ Berhasil menyalin ${copiedCount} baris service dari tabel utama!\n\n📝 Note: Kolom name dan desc telah di-swap.`);

                setupServiceEventListeners();

                setTimeout(() => {
                    updateTotalHarga();
                    updateGrandTotal();
                }, 100);
            } else {
                alert('ℹ️ Tidak ada baris service (tipe produk 6) di tabel utama.');
            }

        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error copying from main table:', error);
            alert('❌ Gagal menyalin data dari tabel utama: ' + error.message);
        }
    }

    // PERBAIKAN 14: Save Estimasi dengan Data yang Sudah Di-swap
    async function saveEstimasi() {
        if (!currentEstimasi) {
            alert('Tidak ada data estimasi yang tersedia');
            return;
        }

        try {
            if (!SILENT_MODE) console.log('💾 Menyimpan estimasi...');

            // Ambil semua baris service
            const serviceRows = document.querySelectorAll('#service-tbody tr:not(.total-row)');
            const serviceData = [];

            serviceRows.forEach(row => {
                const name = row.querySelector('.service-name')?.value?.trim() || '';
                const desc = row.querySelector('.service-desc')?.textContent?.trim() || '';
                const hourInput = row.querySelector('.service-hour');
                const priceDisplay = row.querySelector('.service-price-display');
                const priceEdit = row.querySelector('.service-price-edit');
                const finalCell = row.querySelector('.service-final');

                // Skip jika nama service kosong
                if (!name) return;

                // Ambil jam kerja
                const hour = parseFloat(hourInput?.value) || 0;

                // Ambil harga
                let price = 0;
                if (priceEdit && priceEdit.style.display !== 'none') {
                    price = parseFloat(priceEdit.value) || 0;
                } else {
                    const priceText = (priceDisplay?.textContent || '0').replace('Rp ', '').replace(/\./g, '');
                    price = parseFloat(priceText) || 0;
                }

                // Ambil total final
                const finalText = (finalCell?.textContent || '0').replace('Rp ', '').replace(/\./g, '');
                const total = parseFloat(finalText) || 0;

                // PERBAIKAN: Simpan dengan format yang sudah di-swap
                serviceData.push({
                    name: desc,  // desc menjadi name (kembalikan ke format asli database)
                    desc: name,  // name menjadi desc (kembalikan ke format asli database)
                    hour: hour,
                    price: price,
                    qty: 1,
                    total: total
                });
            });

            if (serviceData.length === 0) {
                alert('Tidak ada data jasa yang dapat disimpan.');
                return;
            }

            // Ambil data sparepart yang sudah ada
            let sparepartData = [];
            if (currentEstimasi.sparepart_data) {
                if (Array.isArray(currentEstimasi.sparepart_data)) {
                    sparepartData = currentEstimasi.sparepart_data;
                } else if (typeof currentEstimasi.sparepart_data === 'string') {
                    try {
                        sparepartData = JSON.parse(currentEstimasi.sparepart_data);
                    } catch (e) {
                        if (!SILENT_MODE) console.error('❌ Gagal parse sparepart_data yang ada:', e);
                    }
                }
            }

            if (!SILENT_MODE) console.log('📦 Data service yang akan disimpan:', serviceData);

            // Hitung total untuk notifikasi
            const totalService = serviceData.reduce((sum, item) => sum + (item.total || 0), 0);
            const totalSparepart = sparepartData.reduce((sum, item) => sum + (item.total || 0), 0);
            const totalKeseluruhan = totalService + totalSparepart;

            // Update kolom service_data dan status di tabel estimasi
            const { data, error } = await supabase
            .from('estimasi')
            .update({
                service_data: serviceData,
                sparepart_data: sparepartData,
                total_harga: totalKeseluruhan,
                status: 'completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', currentEstimasi.id)
            .select();

            if (error) throw error;

            alert(`✅ Estimasi berhasil disimpan dengan status COMPLETED!\n\nTotal Service: Rp ${totalService.toLocaleString('id-ID')}\nTotal Sparepart: Rp ${totalSparepart.toLocaleString('id-ID')}\nTotal Keseluruhan: Rp ${totalKeseluruhan.toLocaleString('id-ID')}`);

            // Refresh data untuk memperbarui tampilan
            await loadEstimasiDataByPlate(currentPlateNumber);

            if (!SILENT_MODE) console.log('💾 Estimasi berhasil disimpan dengan status completed:', data);

        } catch (error) {
            if (!SILENT_MODE) console.error('❌ Error saving estimasi:', error);
            alert('❌ Gagal menyimpan estimasi: ' + error.message);
        }
    }

    // PERBAIKAN 15: Toggle Detail Collapse
    function toggleDetailCollapse() {
        const detailContent = document.getElementById('detail-content');
        const collapseIcon = document.getElementById('detail-collapse-icon');

        if (!detailContent || !collapseIcon) return;

        isDetailCollapsed = !isDetailCollapsed;

        if (isDetailCollapsed) {
            detailContent.style.maxHeight = '0';
            detailContent.style.padding = '0 16px';
            detailContent.style.opacity = '0';
            collapseIcon.style.transform = 'rotate(-90deg)';
        } else {
            detailContent.style.maxHeight = '300px';
            detailContent.style.padding = '16px';
            detailContent.style.opacity = '1';
            collapseIcon.style.transform = 'rotate(0deg)';
        }
    }

    // ==================== INISIALISASI & CLEANUP ====================

    // Start auto refresh
    function startAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }

        refreshInterval = setInterval(async () => {
            if (!SILENT_MODE) console.log('🔄 Auto-refresh data estimasi...');
            if (currentPlateNumber) {
                await loadEstimasiDataByPlate(currentPlateNumber);
            }
        }, REFRESH_INTERVAL);
    }

    // Cleanup
    window.addEventListener('beforeunload', function() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        hideDropdown();
        window.toyotaTableScriptRunning = false;
    });

    // Expose functions to global scope
    window.addServiceRow = addServiceRow;
    window.removeServiceRow = removeServiceRow;
    window.togglePriceEdit = togglePriceEdit;
    window.updateFinalPrice = updateFinalPrice;

    // Tambahkan CSS Fluent Windows 11 (SALIN DARI KODE LAMA ANDA)
    const style = document.createElement('style');
    style.textContent = `
        /* SALIN SEMUA CSS DARI KODE LAMA ANDA DI SINI */
        .compact-btn {
            padding: 6px 12px;
            border: 1px solid;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .compact-btn.small {
            padding: 4px 8px;
            font-size: 12px;
        }

        .compact-btn.primary {
            background: #0078d4;
            color: white;
            border-color: #0078d4;
        }

        .compact-btn.primary:hover {
            background: #106ebe;
            border-color: #106ebe;
        }

        .compact-btn.secondary {
            background: #f3f2f1;
            color: #323130;
            border-color: #8a8886;
        }

        .compact-btn.secondary:hover {
            background: #e1dfdd;
            border-color: #605e5c;
        }

        .compact-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        .compact-table th {
            background: #f8f9fa;
            padding: 8px 12px;
            text-align: left;
            font-weight: 600;
            color: #323130;
            border-bottom: 1px solid #e1e5e9;
            font-size: 11px;
            position: sticky;
            top: 0;
        }

        .compact-table td {
            padding: 6px 12px;
            border-bottom: 1px solid #f3f2f1;
            vertical-align: middle;
        }

        .compact-table tbody tr:hover {
            background: #f8f9fa;
        }

        .compact-table tfoot tr {
            background: #f8f9fa;
            border-top: 2px solid #e1e5e9;
        }

        .compact-input {
            padding: 4px 8px;
            border: 1px solid #e1e5e9;
            border-radius: 3px;
            font-size: 12px;
            width: 100%;
            box-sizing: border-box;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .compact-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.1);
        }

        .row-actions {
            display: flex;
            gap: 4px;
            justify-content: center;
        }

        .action-icon {
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .add-btn {
            background: #107c10;
            color: white;
        }

        .add-btn:hover {
            background: #0c6c0c;
            transform: scale(1.1);
        }

        .remove-btn {
            background: #d13438;
            color: white;
        }

        .remove-btn:hover {
            background: #c3272b;
            transform: scale(1.1);
        }

        .edit-btn {
            background: #ffb900;
            color: #323130;
        }

        .edit-btn:hover {
            background: #d19d00;
            transform: scale(1.1);
        }

        .free-service {
            background-color: #fff4ce !important;
        }

        .free-service:hover {
            background-color: #ffdfb8 !important;
        }

        .service-dropdown div:hover {
            background: #f3f2f1;
        }

        #sparepart-table-container::-webkit-scrollbar,
        #service-table-container::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        #sparepart-table-container::-webkit-scrollbar-track,
        #service-table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        #sparepart-table-container::-webkit-scrollbar-thumb,
        #service-table-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        #sparepart-table-container::-webkit-scrollbar-thumb:hover,
        #service-table-container::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }

        @media (max-width: 768px) {
            #content-container {
                flex-direction: column;
            }

            #left-panel, #right-panel {
                flex: 1;
            }
        }

        #service-table-container {
            position: relative;
        }

        #service-table-container .total-row {
            position: sticky;
            bottom: 0;
            background: #f8f9fa;
            border-top: 2px solid #e1e5e9;
            z-index: 2;
        }
    `;
    document.head.appendChild(style);

    // Jalankan inisialisasi
    initializeWithRetry();
})();
