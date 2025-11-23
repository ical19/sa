// ==UserScript==
// @name         Toyota CRM Notifikasi Estimasi - Tab Interface Optimized
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Notifikasi estimasi dengan Firebase realtime - Tab Interface Optimized
// @author       You
// @match        https://tunastoyota.crm5.dynamics.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js
// @require      https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js
// @require      https://www.gstatic.com/firebasejs/9.6.10/firebase-database-compat.js
// @connect      pjawwektzazcxakgopou.supabase.co
// @connect      res.cloudinary.com
// @connect      tunas-evo-default-rtdb.asia-southeast1.firebasedatabase.app
// ==/UserScript==

GM_addStyle(`
    /* CSS tambahan untuk section */
    .acc-section {
        margin-bottom: 16px;
    }

    .acc-section-title {
        font-size: 12px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid #e0e0e0;
    }

    /* CSS tambahan untuk daftar jasa sederhana */
    .acc-service-list {
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 8px;
        background: #fafafa;
    }

    .acc-service-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 8px;
        background: white;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
    }

    .acc-service-item:last-child {
        margin-bottom: 0;
    }

    .acc-service-info {
        flex: 1;
    }

    .acc-service-name {
        font-size: 11px;
        color: #333;
        margin-bottom: 2px;
    }

    .acc-service-price {
        font-size: 10px;
        color: #666;
    }

    .acc-service-delete-btn {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background-color 0.2s;
    }

    .acc-service-delete-btn:hover {
        background: #d32f2f;
    }

    .service-deleted {
        opacity: 0.6;
        background: #ffebee;
        text-decoration: line-through;
    }

    .delete-icon {
        font-size: 12px;
    }
    /* CSS tambahan untuk daftar jasa sederhana */
    .acc-service-list {
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 8px;
        background: #fafafa;
    }

    .acc-service-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 8px;
        background: white;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
    }

    .acc-service-item:last-child {
        margin-bottom: 0;
    }

    .acc-service-info {
        flex: 1;
    }

    .acc-service-name {
        font-size: 11px;
        color: #333;
        margin-bottom: 2px;
    }

    .acc-service-price {
        font-size: 10px;
        color: #666;
    }

    .acc-service-delete-btn {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background-color 0.2s;
    }

    .acc-service-delete-btn:hover {
        background: #d32f2f;
    }

    .service-deleted {
        opacity: 0.6;
        background: #ffebee;
        text-decoration: line-through;
    }

    .delete-icon {
        font-size: 12px;
    }

    /* CSS yang sama dari kode lama TETAPKAN DI SINI */
    .paper-icon-container {
        position: relative;
        display: inline-block;
    }

    /* TAMBAHKAN DI BAGIAN CSS YANG SUDAH ADA */

/* Tombol Sudah ACC */
.acc-btn {
    background: #4caf50;
    color: white;
}

.acc-btn:hover {
    background: #388e3c;
}

/* Panel ACC dengan checkbox */
.acc-panel {
    display: none;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 12px;
    margin-top: 8px;
    animation: fadeIn 0.3s ease;
}

.acc-panel.visible {
    display: block;
}

.acc-checkbox-group {
    max-height: 150px;
    overflow-y: auto;
    margin-bottom: 12px;
}

.acc-checkbox-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    padding: 4px 0;
}

.acc-checkbox-item input[type="checkbox"] {
    margin-right: 8px;
}

.acc-checkbox-label {
    font-size: 11px;
    color: #333;
    cursor: pointer;
}

.acc-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.acc-save-btn {
    background: #4caf50;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.acc-save-btn:hover {
    background: #388e3c;
}

.acc-cancel-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
}

.acc-cancel-btn:hover {
    background: #545b62;
}

/* Style untuk komponen yang sudah di-ACC */
.components-list .acc-completed {
    text-decoration: line-through;
    color: #999;
}

.components-list .acc-pending {
    color: #333;
}

    .material-icons.paper-icon {
        font-family: 'Material Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        color: white;
        display: inline-block;
        line-height: 1;
        text-transform: none;
        letter-spacing: normal;
        word-wrap: normal;
        white-space: nowrap;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'liga';
    }

    .notification-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background-color: #f44336;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 10px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #1976d2;
        font-family: Arial, sans-serif;
        transition: all 0.3s ease;
    }

    .badge-blinking {
        animation: blink 1s infinite;
        background-color: #ff9800;
    }

    @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.3; }
        100% { opacity: 1; }
    }

    .refresh-animation {
        animation: spin 1s linear infinite;
        background: conic-gradient(#1976d2, #f44336, #1976d2);
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .notification-panel {
        position: fixed;
        top: 60px;
        right: 20px;
        width: 450px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Roboto', Arial, sans-serif;
        max-height: 80vh;
        overflow-y: auto;
        display: none;
    }

    .notification-header {
        background: #1976d2;
        color: white;
        padding: 16px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .notification-title {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
    }

    .header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .close-button:hover {
        background-color: rgba(255,255,255,0.2);
    }

    .close-button .material-icons {
        font-family: 'Material Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 18px;
        display: inline-block;
        line-height: 1;
        text-transform: none;
        letter-spacing: normal;
        word-wrap: normal;
        white-space: nowrap;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'liga';
    }

    .notification-list {
        padding: 0;
        margin: 0;
        list-style: none;
    }

    .notification-item {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        transition: background-color 0.2s;
        position: relative;
    }

    .notification-item:hover {
        background-color: #f5f5f5;
    }

    .notification-item:last-child {
        border-bottom: none;
    }

    .vehicle-info {
        font-weight: 500;
        color: #1976d2;
        margin-bottom: 8px;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .components-list {
        color: #666;
        font-size: 12px;
        margin-bottom: 8px;
        line-height: 1.4;
    }

    .technician-date {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #999;
    }

    .notification-status {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: bold;
    }

    .status-sent {
        background-color: #ff9800;
        color: white;
    }

    .status-draft {
        background-color: #2196f3;
        color: white;
    }

    .status-completed {
        background-color: #4caf50;
        color: white;
    }

    .empty-state {
        padding: 40px 20px;
        text-align: center;
        color: #666;
    }

    .loading-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .debug-info {
        background: #f8f9fa;
        border-top: 1px solid #e0e0e0;
        padding: 12px 16px;
        font-size: 11px;
        color: #666;
    }

    .debug-item {
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
    }

    .debug-label {
        font-weight: 500;
    }

    .debug-value {
        color: #1976d2;
    }

    .debug-error {
        color: #f44336;
        font-weight: 500;
    }

    .debug-success {
        color: #4caf50;
        font-weight: 500;
    }

    .sql-debug {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 8px;
        margin-top: 8px;
        font-family: monospace;
        font-size: 10px;
        color: #856404;
    }

    .realtime-status {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
    }

    .realtime-connected {
        background-color: #4caf50;
    }

    .realtime-disconnected {
        background-color: #f44336;
    }

    .firebase-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10001;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid #2e7d32;
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .firebase-toast.error {
        background: #f44336;
        border-left-color: #c62828;
    }

    /* TAB INTERFACE - PERBAIKAN BARU */
    .tab-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .tab-buttons {
        display: flex;
        background: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
    }

    .tab-button {
        flex: 1;
        padding: 12px 16px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
    }

    .tab-button:hover {
        background: #e8e8e8;
        color: #333;
    }

    .tab-button.active {
        color: #1976d2;
        border-bottom-color: #1976d2;
        background: white;
    }

    .tab-content {
        flex: 1;
        overflow: hidden;
    }

    .tab-pane {
        display: none;
        height: 100%;
        overflow-y: auto;
    }

    .tab-pane.active {
        display: block;
    }

    /* ACTION BUTTONS - PERBAIKAN BARU */
    .action-buttons {
        display: none;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;
        justify-content: flex-end;
        animation: fadeIn 0.2s ease;
    }

.action-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
}

.edit-btn {
    background: #ff9800;
    color: white;
}

.edit-btn:hover {
    background: #f57c00;
}

.print-btn {
    background: #2196f3;
    color: white;
}

.print-btn:hover {
    background: #1976d2;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ESTIMASI ITEM - PERBAIKAN BARU */
.estimasi-item {
    cursor: pointer;
    transition: background-color 0.2s;
}

.estimasi-item:hover {
    background-color: #f5f5f5;
}

.estimasi-content {
    padding: 8px 0;
}

/* PERBAIKAN: Tombol aksi yang sudah aktif */
.action-buttons.visible {
    display: flex;
}
`);

(function() {
    'use strict';

    // 🔇 SILENT MODE - Nonaktifkan logging yang mengganggu
    const SILENT_MODE = true;

    // Konfigurasi Optimasi
    const OPTIMIZATION_CONFIG = {
        debounceTime: 1000,
        cacheExpiry: 2 * 60 * 1000, // 2 menit cache
        minFetchInterval: 30 * 1000, // 30 detik minimal interval fetch
        badgeFields: ['id', 'nopol', 'status'], // Field minimal untuk badge
        panelFields: 'id, nopol, jenis_mobil, komponen, created_at, teknisi_id, status, service_advisor, users:teknisi_id(full_name, email)' // Field untuk panel
    };

    // Override console.log untuk mengurangi noise
    const originalLog = console.log;
    console.log = function(...args) {
        if (!SILENT_MODE && args[0] && typeof args[0] === 'string') {
            if (args[0].includes('✅') || args[0].includes('❌') || args[0].includes('🚨')) {
                originalLog.apply(console, args);
            }
        }
    };

    // Konfigurasi
    const SUPABASE_URL = 'https://pjawwektzazcxakgopou.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXd3ZWt0emF6Y3hha2dvcG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjQ5MTUsImV4cCI6MjA3Mzg0MDkxNX0.dNEB80t7LcTsvAtHHqgIeJfxcwmmZNsWxPTIAlrj11c';
    const SERVICE_ADVISOR = "Abdul Azis";

    // Firebase Configuration
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyAUEF9oqJGOS_14qYTI-Jz2xHCd2KpIlMs",
        authDomain: "tunas-evo.firebaseapp.com",
        databaseURL: "https://tunas-evo-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "tunas-evo",
        storageBucket: "tunas-evo.firebasestorage.app",
        messagingSenderId: "389746033999",
        appId: "1:389746033999:web:de920c80778cfe41aff13a",
        measurementId: "G-8NT82P3FFM"
    };

    let supabase;
    let firebaseApp;
    let firebaseDb;
    let notifications = [];
    let isPanelOpen = false;
    let isRealtimeConnected = false;
    let currentEstimasiId = null;

    // VARIABLE OPTIMASI BARU
    let notificationCache = {
        count: 0,
        data: [],
        timestamp: 0
    };
    let lastFetchTime = 0;
    let fetchTimeout = null;
    let isFetching = false;

    let debugInfo = {
        lastFetch: null,
        totalRecords: 0,
        error: null,
        serviceAdvisor: SERVICE_ADVISOR,
        realtimeStatus: 'disconnected',
        firebaseStatus: 'disconnected',
        sqlQuery: ''
    };

    // ==================== FUNGSI BARU UNTUK FITUR ACC ====================
    // Fungsi untuk menampilkan panel ACC dengan daftar jasa sederhana
    function showAccPanel(estimasiId, komponenData, selectedSpareparts = [], serviceData = null) {
        // Sembunyikan semua panel ACC lainnya
        document.querySelectorAll('.acc-panel').forEach(panel => {
            panel.classList.remove('visible');
        });

        // Sembunyikan semua tombol aksi lainnya
        document.querySelectorAll('.action-buttons').forEach(btn => {
            btn.classList.remove('visible');
            btn.style.display = 'none';
        });

        const estimasiItem = document.querySelector(`.estimasi-item[data-id="${estimasiId}"]`);
        if (!estimasiItem) return;

        // Cek apakah panel ACC sudah ada
        let accPanel = estimasiItem.querySelector('.acc-panel');

        if (!accPanel) {
            // Buat panel ACC baru dengan section jasa sederhana
            accPanel = document.createElement('div');
            accPanel.className = 'acc-panel';
            accPanel.innerHTML = `
            <div class="acc-section">
                <div class="acc-section-title">Sparepart yang di-ACC:</div>
                <div class="acc-checkbox-group" id="acc-checkbox-${estimasiId}">
                    <!-- Checkbox sparepart akan diisi oleh JavaScript -->
                </div>
            </div>
            <div class="acc-section">
                <div class="acc-section-title">Daftar Jasa:</div>
                <div class="acc-service-list" id="acc-service-${estimasiId}">
                    <!-- Daftar jasa akan diisi oleh JavaScript -->
                </div>
            </div>
            <div class="acc-actions">
                <button class="acc-cancel-btn" data-id="${estimasiId}">Batal</button>
                <button class="acc-save-btn" data-id="${estimasiId}">
                    <span class="material-icons" style="font-size: 14px;">save</span>
                    Simpan ACC
                </button>
            </div>
        `;

            // Tambahkan panel ACC setelah tombol aksi
            const actionButtons = estimasiItem.querySelector('.action-buttons');
            actionButtons.parentNode.insertBefore(accPanel, actionButtons.nextSibling);

            // Setup event listeners
            setupAccPanelListeners(estimasiId);
        }

        // Load data komponen ke checkbox dengan data existing
        loadKomponenToCheckbox(estimasiId, komponenData, selectedSpareparts);

        // Load data jasa ke daftar sederhana
        loadServiceList(estimasiId, serviceData);

        // Tampilkan panel ACC
        accPanel.classList.add('visible');
    }

    // Load komponen data ke checkbox dengan data existing
    function loadKomponenToCheckbox(estimasiId, komponenData, selectedSpareparts = []) {
        const checkboxGroup = document.getElementById(`acc-checkbox-${estimasiId}`);
        if (!checkboxGroup) return;

        const komponenArray = parseKomponen(komponenData);
        const selectedArray = parseKomponen(selectedSpareparts);

        checkboxGroup.innerHTML = '';

        if (komponenArray.length === 0) {
            checkboxGroup.innerHTML = '<div style="color: #999; font-size: 11px; text-align: center;">Tidak ada komponen</div>';
            return;
        }

        komponenArray.forEach((komponen, index) => {
            const isChecked = selectedArray.includes(komponen);

            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'acc-checkbox-item';
            checkboxItem.innerHTML = `
            <input type="checkbox" id="acc-${estimasiId}-${index}" value="${komponen}" ${isChecked ? 'checked' : ''}>
            <label class="acc-checkbox-label" for="acc-${estimasiId}-${index}">${komponen}</label>
        `;
            checkboxGroup.appendChild(checkboxItem);
        });
    }

    // Load data jasa ke daftar sederhana dengan tombol hapus
    async function loadServiceList(estimasiId, serviceData = null) {
        const serviceList = document.getElementById(`acc-service-${estimasiId}`);
        if (!serviceList) return;

        // Jika serviceData tidak disediakan, fetch dari database
        let services = serviceData;
        if (!services) {
            try {
                const { data: estimasi, error } = await supabase
                .from('estimasi')
                .select('service_data')
                .eq('id', estimasiId)
                .single();

                if (error) throw error;
                services = estimasi.service_data;
            } catch (error) {
                logDebug('Error fetching service data:', error, 'error');
                services = null;
            }
        }

        serviceList.innerHTML = '';

        if (!services || (Array.isArray(services) && services.length === 0)) {
            serviceList.innerHTML = '<div style="color: #999; font-size: 11px; text-align: center;">Tidak ada jasa</div>';
            return;
        }

        // Parse service data
        const serviceArray = parseServiceData(services);

        if (serviceArray.length === 0) {
            serviceList.innerHTML = '<div style="color: #999; font-size: 11px; text-align: center;">Tidak ada jasa</div>';
            return;
        }

        // Get services that are marked for deletion (stored in data attribute)
        const deletedServices = serviceList.getAttribute('data-deleted-services') || '[]';
        const deletedServicesArray = JSON.parse(deletedServices);

        serviceArray.forEach((service, index) => {
            const serviceId = `service-${estimasiId}-${index}`;
            const isDeleted = deletedServicesArray.includes(index);

            const serviceItem = document.createElement('div');
            serviceItem.className = `acc-service-item ${isDeleted ? 'service-deleted' : ''}`;
            serviceItem.setAttribute('data-service-index', index);
            serviceItem.innerHTML = `
            <div class="acc-service-info">
                <div class="acc-service-name">${service.desc || 'Unknown Service'}</div>
                <div class="acc-service-price">${formatRupiah(service.total || service.subtotal || 0)}</div>
            </div>
            <button class="acc-service-delete-btn" data-service-index="${index}" data-estimasi-id="${estimasiId}">
                <span class="material-icons delete-icon">${isDeleted ? 'undo' : 'delete'}</span>
                ${isDeleted ? 'Batal' : 'Hapus'}
            </button>
        `;

            serviceList.appendChild(serviceItem);
        });

        // Setup event listeners untuk tombol hapus
        setupServiceDeleteListeners(estimasiId);
    }

    // Setup event listeners untuk tombol hapus jasa
    function setupServiceDeleteListeners(estimasiId) {
        const serviceList = document.getElementById(`acc-service-${estimasiId}`);
        if (!serviceList) return;

        const deleteButtons = serviceList.querySelectorAll('.acc-service-delete-btn');

        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const serviceIndex = parseInt(this.getAttribute('data-service-index'));
                const estimasiId = this.getAttribute('data-estimasi-id');
                toggleServiceDelete(estimasiId, serviceIndex);
            });
        });
    }

    // Toggle status hapus jasa
    function toggleServiceDelete(estimasiId, serviceIndex) {
        const serviceList = document.getElementById(`acc-service-${estimasiId}`);
        if (!serviceList) return;

        // Get current deleted services
        const deletedServices = serviceList.getAttribute('data-deleted-services') || '[]';
        const deletedServicesArray = JSON.parse(deletedServices);

        const serviceItem = serviceList.querySelector(`[data-service-index="${serviceIndex}"]`);
        const deleteButton = serviceItem.querySelector('.acc-service-delete-btn');

        if (deletedServicesArray.includes(serviceIndex)) {
            // Remove from deleted services
            const newDeletedServices = deletedServicesArray.filter(index => index !== serviceIndex);
            serviceList.setAttribute('data-deleted-services', JSON.stringify(newDeletedServices));

            // Update UI
            serviceItem.classList.remove('service-deleted');
            deleteButton.innerHTML = `
            <span class="material-icons delete-icon">delete</span>
            Hapus
        `;
        } else {
            // Add to deleted services
            deletedServicesArray.push(serviceIndex);
            serviceList.setAttribute('data-deleted-services', JSON.stringify(deletedServicesArray));

            // Update UI
            serviceItem.classList.add('service-deleted');
            deleteButton.innerHTML = `
            <span class="material-icons delete-icon">undo</span>
            Batal
        `;
        }

        logDebug('Service delete toggled:', { estimasiId, serviceIndex, deletedServices: deletedServicesArray }, 'info');
    }

    // Setup event listeners untuk panel ACC
    function setupAccPanelListeners(estimasiId) {
        const accPanel = document.querySelector(`.acc-panel`);
        if (!accPanel) return;

        // Tombol simpan
        const saveBtn = accPanel.querySelector('.acc-save-btn');
        if (saveBtn) {
            saveBtn.onclick = () => saveAccData(estimasiId);
        }

        // Tombol batal
        const cancelBtn = accPanel.querySelector('.acc-cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                accPanel.classList.remove('visible');
            };
        }
    }

    // Simpan data ACC dengan handle hapus jasa sederhana
    async function saveAccData(estimasiId) {
        try {
            const checkboxGroup = document.getElementById(`acc-checkbox-${estimasiId}`);
            const serviceList = document.getElementById(`acc-service-${estimasiId}`);

            if (!checkboxGroup) return;

            // Get selected spareparts
            const selectedKomponen = [];
            const sparepartCheckboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]:checked');
            sparepartCheckboxes.forEach(checkbox => {
                selectedKomponen.push(checkbox.value);
            });

            // Get services to delete
            let servicesToDelete = [];
            if (serviceList) {
                const deletedServices = serviceList.getAttribute('data-deleted-services') || '[]';
                servicesToDelete = JSON.parse(deletedServices);
            }

            // Ambil data estimasi lengkap
            const { data: estimasiData, error: fetchError } = await supabase
            .from('estimasi')
            .select('komponen, status, mra_catatan, service_data')
            .eq('id', estimasiId)
            .single();

            if (fetchError) throw fetchError;

            const allKomponen = parseKomponen(estimasiData.komponen);
            const isAllKomponenSelected = allKomponen.length > 0 &&
                  selectedKomponen.length === allKomponen.length;
            const isAllUnselected = selectedKomponen.length === 0;

            // Prepare update data
            const updateData = {
                updated_at: new Date().toISOString()
            };

            // Handle services to delete - HAPUS PERMANEN dari database
            if (servicesToDelete.length > 0) {
                const originalServices = parseServiceData(estimasiData.service_data);
                const remainingServices = originalServices.filter((service, index) => {
                    return !servicesToDelete.includes(index);
                });

                // Update service_data dengan yang tersisa (permanen hapus)
                updateData.service_data = remainingServices;
            }

            if (isAllUnselected) {
                // Jika semua centangan dihapus, clear semua field ACC
                updateData.mra_selected_spareparts = null;
                updateData.mra_catatan = null;
                updateData.mra_updated_at = null;

                // Reset status ke sent jika sebelumnya completed karena ACC
                if (estimasiData.status === 'completed' && allKomponen.length > 0) {
                    updateData.status = 'sent';
                }
            } else {
                // Jika ada komponen yang dipilih, update data ACC
                updateData.mra_selected_spareparts = selectedKomponen;
                updateData.mra_catatan = `Di setujui pelanggan dari ${SERVICE_ADVISOR}`;
                updateData.mra_updated_at = new Date().toISOString();

                // Update status hanya jika semua komponen dipilih dan status sebelumnya adalah 'sent'
                if (isAllKomponenSelected && estimasiData.status === 'sent') {
                    updateData.status = 'completed';
                }
            }

            // Update data di Supabase
            const { data, error } = await supabase
            .from('estimasi')
            .update(updateData)
            .eq('id', estimasiId)
            .select();

            if (error) throw error;

            // Sembunyikan panel ACC
            const accPanel = document.querySelector(`.acc-panel`);
            if (accPanel) {
                accPanel.classList.remove('visible');
            }

            // Update tampilan
            updateKomponenDisplay(estimasiId, selectedKomponen);

            // Refresh data panel
            await loadAllEstimasi();

            // Refresh badge count
            fetchNotificationsDebounced(true);

            logDebug('ACC data saved successfully:', {
                estimasiId,
                selectedKomponen,
                servicesToDelete: servicesToDelete.length,
                oldStatus: estimasiData.status,
                newStatus: updateData.status || estimasiData.status,
                isAllSelected: isAllKomponenSelected,
                isAllUnselected: isAllUnselected
            }, 'info');

            // Show appropriate toast message
            let toastMessage = '';
            if (isAllUnselected) {
                toastMessage = 'Semua komponen ACC telah dihapus. Data ACC telah dikosongkan.';
            } else if (isAllKomponenSelected && estimasiData.status === 'sent') {
                toastMessage = `Semua komponen sudah di-ACC! Status berubah menjadi Selesai.`;
            } else {
                toastMessage = `Komponen yang di-ACC berhasil disimpan: ${selectedKomponen.length} item`;
            }

            if (servicesToDelete.length > 0) {
                toastMessage += ` | ${servicesToDelete.length} jasa dihapus permanen`;
            }

            showFirebaseToast(toastMessage);

        } catch (error) {
            logDebug('Error saving ACC data:', error, 'error');
            alert('Gagal menyimpan data ACC: ' + error.message);
        }
    }

    // Update tampilan komponen dengan coretan - handle clear data
    function updateKomponenDisplay(estimasiId, selectedKomponen) {
        const estimasiItem = document.querySelector(`.estimasi-item[data-id="${estimasiId}"]`);
        if (!estimasiItem) return;

        const componentsList = estimasiItem.querySelector('.components-list');
        if (!componentsList) return;

        // Dapatkan semua komponen asli dari data estimasi
        const vehicleInfo = estimasiItem.querySelector('.vehicle-info span').textContent;
        // Cari data komponen asli dari notifications cache atau refresh data
        const originalKomponen = findOriginalKomponen(estimasiId);

        const komponenArray = originalKomponen.length > 0 ? originalKomponen :
        parseKomponenFromText(componentsList.textContent);

        // Jika tidak ada komponen yang dipilih, tampilkan tanpa coretan
        if (!selectedKomponen || selectedKomponen.length === 0) {
            componentsList.innerHTML = komponenArray.join(', ');
            return;
        }

        // Buat HTML baru dengan coretan untuk komponen yang sudah di-ACC
        let newHtml = '';
        komponenArray.forEach(komponen => {
            const isCompleted = selectedKomponen.includes(komponen);
            const cssClass = isCompleted ? 'acc-completed' : 'acc-pending';
            newHtml += `<span class="${cssClass}">${komponen}</span>, `;
        });

        // Hapus koma terakhir
        newHtml = newHtml.replace(/,\s*$/, '');

        componentsList.innerHTML = newHtml;
    }

    // Helper function untuk mencari komponen asli dari cache
    function findOriginalKomponen(estimasiId) {
        // Cari di notification cache
        if (notificationCache.data && notificationCache.data.length > 0) {
            const estimasi = notificationCache.data.find(item => item.id === estimasiId);
            if (estimasi && estimasi.komponen) {
                return parseKomponen(estimasi.komponen);
            }
        }

        // Cari di DOM untuk data all estimasi
        const estimasiItem = document.querySelector(`.estimasi-item[data-id="${estimasiId}"]`);
        if (estimasiItem) {
            const componentsText = estimasiItem.querySelector('.components-list').textContent;
            // Remove any existing HTML tags to get original text
            const cleanText = componentsText.replace(/<[^>]*>/g, '');
            return parseKomponenFromText(cleanText);
        }

        return [];
    }

    // Parse komponen dari teks
    function parseKomponenFromText(text) {
        if (!text) return [];
        return text.split(', ').map(k => k.trim()).filter(k => k.length > 0);
    }

    // ==================== MODIFIKASI FUNGSI YANG SUDAH ADA ====================
    // Fungsi helper untuk parse komponen
    function parseKomponen(komponenData) {
        if (!komponenData) return [];

        try {
            if (typeof komponenData === 'string') {
                // Coba parse sebagai JSON
                try {
                    const parsed = JSON.parse(komponenData);
                    return Array.isArray(parsed) ? parsed : [komponenData];
                } catch (e) {
                    // Jika bukan JSON, split by comma
                    return komponenData.split(',').map(k => k.trim()).filter(k => k.length > 0);
                }
            } else if (Array.isArray(komponenData)) {
                return komponenData;
            }
        } catch (e) {
            logDebug('Error parsing komponen data:', e, 'error');
        }

        return [];
    }

    // Helper function untuk parse service data
    function parseServiceData(serviceData) {
        if (!serviceData) return [];

        try {
            if (typeof serviceData === 'string') {
                try {
                    const parsed = JSON.parse(serviceData);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    return [];
                }
            } else if (Array.isArray(serviceData)) {
                return serviceData;
            }
        } catch (e) {
            logDebug('Error parsing service data:', e, 'error');
        }

        return [];
    }

    // Fungsi untuk render komponen dengan coretan - handle null data
    function renderKomponenWithStrike(komponenData, selectedSpareparts) {
        const komponenArray = parseKomponen(komponenData);

        // Handle case when selectedSpareparts is null or empty
        if (!selectedSpareparts || selectedSpareparts.length === 0) {
            return komponenArray.join(', ');
        }

        const selectedArray = parseKomponen(selectedSpareparts);

        if (komponenArray.length === 0) {
            return 'No components';
        }

        let html = '';
        komponenArray.forEach(komponen => {
            const isCompleted = selectedArray.includes(komponen);
            const cssClass = isCompleted ? 'acc-completed' : 'acc-pending';
            html += `<span class="${cssClass}">${komponen}</span>, `;
        });

        // Hapus koma terakhir
        return html.replace(/,\s*$/, '');
    }

    // PERBAIKAN 1: Fungsi fetchNotifications yang dioptimasi
    async function fetchNotifications(forceRefresh = false) {
        const now = Date.now();

        // ✅ Gunakan cache jika tidak force refresh dan cache masih valid
        if (!forceRefresh &&
            notificationCache.timestamp &&
            (now - notificationCache.timestamp) < OPTIMIZATION_CONFIG.cacheExpiry) {
            updateBadgeDisplay(notificationCache.count);
            return notificationCache.data;
        }

        // ✅ Prevent too frequent calls
        if (isFetching || (now - lastFetchTime) < OPTIMIZATION_CONFIG.minFetchInterval) {
            return notificationCache.data;
        }

        isFetching = true;
        const badge = document.querySelector('.notification-badge');

        try {
            // ✅ Tampilkan loading spinner
            if (badge) {
                badge.innerHTML = '<div class="loading-spinner"></div>';
                badge.style.background = 'transparent';
            }

            // ✅ OPTIMIZED QUERY: Hanya ambil field yang diperlukan untuk badge
            const { count, error } = await supabase
            .from('estimasi')
            .select('id', {
                count: 'exact',
                head: true
            })
            .eq('status', 'sent')
            .eq('service_advisor', SERVICE_ADVISOR);

            if (error) throw error;

            const notificationCount = count || 0;

            // ✅ Update cache
            notificationCache = {
                count: notificationCount,
                data: Array(notificationCount).fill({}), // Simulasi data untuk kompatibilitas
                timestamp: now
            };

            lastFetchTime = now;
            debugInfo.lastFetch = new Date();
            debugInfo.totalRecords = notificationCount;

            // ✅ Update badge display
            updateBadgeDisplay(notificationCount);

            logDebug(`Notifications fetched: ${notificationCount}`, null, 'info');

            return notificationCache.data;

        } catch (error) {
            logDebug('Error fetching notifications:', error, 'error');
            debugInfo.error = error.message;

            // ✅ Fallback ke cache saat error
            updateBadgeDisplay(notificationCache.count);
            return notificationCache.data;
        } finally {
            isFetching = false;
        }
    }

    // PERBAIKAN 2: Fungsi update badge yang proper
    function updateBadgeDisplay(count) {
        notifications = notificationCache.data;

        const helpButton = document.getElementById('helpLauncher-button');
        if (!helpButton) return;

        let iconContainer = helpButton.querySelector('.paper-icon-container');
        if (!iconContainer) {
            iconContainer = document.createElement('span');
            iconContainer.className = 'paper-icon-container';

            const iconSpan = helpButton.querySelector('.Help-symbol');
            if (iconSpan) {
                iconSpan.parentNode.replaceChild(iconContainer, iconSpan);
            } else {
                helpButton.appendChild(iconContainer);
            }
        }

        // ✅ Build HTML secara langsung dengan kondisi yang tepat
        iconContainer.innerHTML = `
            <span class="material-icons paper-icon" style="color: ${count > 0 ? 'white' : '#ccc'}">
                description
            </span>
            ${count > 0 ?
            `<span class="notification-badge">${count}</span>` :
        ''
    }
        `;

        // ✅ Setup event listener
        helpButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleNotificationPanel();
        };

        logDebug('Badge updated', { count, notifications: notifications.length });
    }

    // PERBAIKAN 3: Debounced fetch untuk efisiensi
    function fetchNotificationsDebounced(force = false) {
        if (fetchTimeout) {
            clearTimeout(fetchTimeout);
        }

        fetchTimeout = setTimeout(() => {
            fetchNotifications(force);
        }, OPTIMIZATION_CONFIG.debounceTime);
    }

    // PERBAIKAN 4: Optimized Firebase Realtime Listener
    function setupFirebaseRealtime() {
        try {
            const notificationsRef = firebaseDb.ref(`notifications/${SERVICE_ADVISOR}`);

            notificationsRef.on('value', (snapshot) => {
                const data = snapshot.val();

                if (data && data.trigger === true && data.service_advisor === SERVICE_ADVISOR) {
                    // ✅ Force refresh dengan debounce
                    fetchNotificationsDebounced(true);

                    // ✅ Trigger badge blinking
                    triggerBadgeBlinking();

                    if (data.nopol) {
                        showFirebaseToast(`Estimasi baru: ${data.nopol}`);
                    } else {
                        showFirebaseToast('Estimasi baru diterima dari teknisi!');
                    }

                    // ✅ Reset trigger di Firebase
                    setTimeout(() => {
                        notificationsRef.update({
                            trigger: false,
                            processed_at: new Date().toISOString(),
                            processed_by: SERVICE_ADVISOR
                        });
                    }, 1000);
                }
            });

            debugInfo.realtimeStatus = 'connected';
            logDebug('Firebase realtime listener setup', null, 'info');
            return true;
        } catch (error) {
            debugInfo.realtimeStatus = 'error';
            logDebug('Error setting up Firebase realtime:', error, 'error');
            return false;
        }
    }

    // PERBAIKAN: Update fungsi updateAllEstimasiPanel untuk menambahkan tombol ACC dengan data existing
    function updateAllEstimasiPanel(estimasiData) {
        const notificationList = document.getElementById('notificationListAll');
        if (!notificationList) return;

        if (estimasiData.length === 0) {
            notificationList.innerHTML = `
            <li class="empty-state">
                <span class="material-icons" style="font-size: 48px; color: #ccc; margin-bottom: 16px;">description</span>
                <div>Tidak ada estimasi dalam 5 hari terakhir</div>
            </li>
        `;
            return;
        }

        notificationList.innerHTML = '';
        estimasiData.forEach(estimasi => {
            const li = document.createElement('li');
            li.className = 'notification-item estimasi-item';
            li.setAttribute('data-id', estimasi.id);

            const status = estimasi.status || 'draft';
            const statusText = status === 'sent' ? 'Menunggu Harga' :
            status === 'completed' ? 'Selesai' : 'Draft';
            const statusClass = `status-${status}`;

            // Tampilkan komponen dengan coretan jika ada data ACC
            const komponenDisplay = renderKomponenWithStrike(estimasi.komponen, estimasi.mra_selected_spareparts);

            li.innerHTML = `
            <div class="estimasi-content">
                <div class="vehicle-info">
                    <span>TOYOTA ${estimasi.jenis_mobil || 'Unknown'} ${estimasi.nopol || 'No Plate'}</span>
                    <span class="notification-status ${statusClass}">${statusText}</span>
                </div>
                <div class="components-list">
                    ${komponenDisplay}
                </div>
                <div class="technician-date">
                    <span>${estimasi.users?.full_name || 'Belum ada teknisi'}</span>
                    <span>${formatDate(estimasi.created_at)}</span>
                </div>
            </div>
            <div class="action-buttons">
                <button class="action-btn acc-btn" data-id="${estimasi.id}">
                    <span class="material-icons" style="font-size: 14px;">check_circle</span>
                    ${estimasi.mra_selected_spareparts && estimasi.mra_selected_spareparts.length > 0 ? 'Edit ACC' : 'Sudah ACC'}
                </button>
                ${status === 'completed' ? `
                <button class="action-btn edit-btn" data-id="${estimasi.id}">
                    <span class="material-icons" style="font-size: 14px;">edit</span>
                    Edit Status
                </button>
                ` : ''}
                <button class="action-btn print-btn" data-id="${estimasi.id}">
                    <span class="material-icons" style="font-size: 14px;">print</span>
                    Print
                </button>
            </div>
        `;

            // ✅ PERBAIKAN: Fix double click issue - gunakan event delegation yang lebih baik
            const estimasiContent = li.querySelector('.estimasi-content');
            const actionButtons = li.querySelector('.action-buttons');

            // Event untuk menampilkan/sembunyikan tombol aksi
            estimasiContent.addEventListener('click', function(e) {
                // Jangan trigger jika klik tombol aksi atau panel ACC
                if (e.target.closest('.action-btn') || e.target.closest('.acc-panel')) return;

                // Sembunyikan semua tombol aksi lainnya
                document.querySelectorAll('.action-buttons').forEach(btn => {
                    if (btn !== actionButtons) {
                        btn.classList.remove('visible');
                        btn.style.display = 'none';
                    }
                });

                // Sembunyikan semua panel ACC
                document.querySelectorAll('.acc-panel').forEach(panel => {
                    panel.classList.remove('visible');
                });

                // Toggle tombol aksi saat ini
                const isVisible = actionButtons.classList.contains('visible');
                if (isVisible) {
                    actionButtons.classList.remove('visible');
                    actionButtons.style.display = 'none';
                } else {
                    actionButtons.classList.add('visible');
                    actionButtons.style.display = 'flex';
                }
            });

            // PERBAIKAN: Update event listener untuk tombol ACC - load service data
            const accBtn = li.querySelector('.acc-btn');
            if (accBtn) {
                accBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const estimasiId = e.target.closest('.acc-btn').getAttribute('data-id');

                    // Fetch service data untuk estimasi ini
                    let serviceData = null;
                    try {
                        const { data: estimasi, error } = await supabase
                        .from('estimasi')
                        .select('service_data')
                        .eq('id', estimasiId)
                        .single();

                        if (!error && estimasi) {
                            serviceData = estimasi.service_data;
                        }
                    } catch (error) {
                        logDebug('Error fetching service data for ACC panel:', error, 'error');
                    }

                    showAccPanel(estimasiId, estimasi.komponen, estimasi.mra_selected_spareparts, serviceData);
                });
            }

            // Event listener untuk tombol edit
            const editBtn = li.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const estimasiId = e.target.closest('.edit-btn').getAttribute('data-id');
                    await changeStatusToSent(estimasiId);
                });
            }

            // Event listener untuk tombol print
            const printBtn = li.querySelector('.print-btn');
            if (printBtn) {
                printBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentEstimasiId = e.target.closest('.print-btn').getAttribute('data-id');
                    generatePdfA5();
                });
            }

            notificationList.appendChild(li);
        });
    }

    // ==================== FUNGSI YANG TETAP SAMA ====================

    // Fungsi untuk convert URL ke base64
    function getBase64FromUrl(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
                onload: function(response) {
                    const base64 = btoa(
                        new Uint8Array(response.response)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );
                    resolve('data:image/png;base64,' + base64);
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }

    // Fungsi format Rupiah
    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Fungsi truncate text
    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Fungsi untuk mendapatkan nomor WhatsApp
    function getWhatsAppNumber(serviceAdvisor) {
        try {
            const advisorName = String(serviceAdvisor || 'Abdul Azis').trim();

            const whatsappNumbers = {
                'Abdul Azis': '087889077123',
                'Akbarudin': '085899345191',
                'Muhammad Hakiki': '081806274120',
                'Ade Purwanto': '081999704850',
                'Ahmad Baidowi': '081999704850'
            };

            let number = whatsappNumbers[advisorName];

            if (!number) {
                const keys = Object.keys(whatsappNumbers);
                const foundKey = keys.find(key =>
                                           advisorName.toLowerCase().includes(key.toLowerCase()) ||
                                           key.toLowerCase().includes(advisorName.toLowerCase())
                                          );
                number = foundKey ? whatsappNumbers[foundKey] : '081315389866';
            }

            if (typeof number !== 'string') {
                number = String(number);
            }

            number = number.replace(/\D/g, '');
            return number || '081315389866';

        } catch (error) {
            console.error('Error in getWhatsAppNumber:', error);
            return '081315389866';
        }
    }

    // FUNGSI GENERATE PDF A5 YANG LENGKAP DENGAN FITUR ACC
    // FUNGSI HELPER UNTUK CELL DENGAN CORETAN
    function cell(text, isAcc) {
        if (isAcc) {
            return {
                text: text,
                decoration: "lineThrough",
                color: "#777"
            };
        }
        return { text: text };
    }

    async function generatePdfA5(format = 'A5') {
        try {
            if (!currentEstimasiId) {
                alert('Tidak ada data estimasi yang dipilih');
                return;
            }

            const { data, error } = await supabase
            .from('estimasi')
            .select('*')
            .eq('id', currentEstimasiId)
            .single();

            if (error) throw error;

            // Ambil data teknisi
            let teknisiNama = '-';
            if (data.teknisi_id) {
                const { data: userData, error: userError } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', data.teknisi_id)
                .single();

                if (!userError && userData) {
                    teknisiNama = userData.full_name || '-';
                }
            }

            // Ambil data sparepart yang sudah di-ACC
            const selectedSpareparts = parseKomponen(data.mra_selected_spareparts || []);

            // Handle sparepart dengan perhitungan total yang benar
            let sparepartData = [];
            let totalHargaSparepart = 0;
            let totalHargaSparepartNonAcc = 0; // Total untuk yang belum di-ACC

            if (data.sparepart_data) {
                if (Array.isArray(data.sparepart_data)) {
                    sparepartData = data.sparepart_data;
                } else if (typeof data.sparepart_data === 'string') {
                    try {
                        sparepartData = JSON.parse(data.sparepart_data);
                        if (!Array.isArray(sparepartData)) sparepartData = [];
                    } catch (e) {
                        sparepartData = [];
                    }
                }

                // Hitung total harga sparepart - hanya yang belum di-ACC
                if (sparepartData.length > 0) {
                    sparepartData.forEach(item => {
                        const itemTotal = parseFloat(item.total || item.subtotal || 0);

                        // PERBAIKAN: SAMAKAN FORMAT STRING UNTUK PERBANDINGAN
                        const isAccCompleted = selectedSpareparts
                        .map(s => s.toLowerCase().trim())
                        .includes((item.name || "").toLowerCase().trim());

                        if (!isAccCompleted) {
                            totalHargaSparepartNonAcc += itemTotal;
                        }
                        totalHargaSparepart += itemTotal; // Total semua untuk referensi
                    });
                }
            }

            // Handle service data
            let serviceData = [];
            let totalHargaService = 0;
            if (data.service_data) {
                if (Array.isArray(data.service_data)) {
                    serviceData = data.service_data;
                } else if (typeof data.service_data === 'string') {
                    try {
                        serviceData = JSON.parse(data.service_data);
                        if (!Array.isArray(serviceData)) serviceData = [];
                    } catch (e) {
                        serviceData = [];
                    }
                }

                // Hitung total harga service
                if (serviceData.length > 0) {
                    totalHargaService = serviceData.reduce((total, service) => {
                        const serviceTotal = parseFloat(service.total || service.subtotal || 0);
                        return total + serviceTotal;
                    }, 0);
                }
            }

            // Hitung total harga keseluruhan - hanya yang belum di-ACC
            const totalHargaKeseluruhan = totalHargaSparepartNonAcc + totalHargaService;

            // Handle foto URL
            let fotoArray = [];
            let fotoImages = [];
            if (data.foto_url) {
                try {
                    if (typeof data.foto_url === 'string') {
                        try {
                            const parsed = JSON.parse(data.foto_url);
                            fotoArray = Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            if (data.foto_url.includes('[') && data.foto_url.includes(']')) {
                                const cleanString = data.foto_url.replace(/\\/g, '').replace(/"/g, '"');
                                try {
                                    const reparsed = JSON.parse(cleanString);
                                    fotoArray = Array.isArray(reparsed) ? reparsed : [data.foto_url];
                                } catch (e2) {
                                    fotoArray = [data.foto_url];
                                }
                            } else {
                                fotoArray = [data.foto_url];
                            }
                        }
                    } else if (Array.isArray(data.foto_url)) {
                        fotoArray = data.foto_url;
                    }

                    // Convert foto URLs ke base64 untuk PDF
                    if (fotoArray.length > 0) {
                        for (const fotoUrl of fotoArray) {
                            try {
                                if (fotoUrl && typeof fotoUrl === 'string' && fotoUrl.startsWith('http')) {
                                    const base64Image = await getBase64FromUrl(fotoUrl);
                                    fotoImages.push(base64Image);
                                }
                            } catch (error) {
                                console.error('Error converting image to base64:', error, 'URL:', fotoUrl);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing foto_url:', e);
                    fotoArray = [];
                }
            }

            // Dapatkan nomor WhatsApp berdasarkan Service Advisor
            const serviceAdvisor = data.service_advisor || 'Abdul Azis';
            const whatsappNumber = getWhatsAppNumber(serviceAdvisor);

            // QR admin dan icons
            const qrBase64 = await getBase64FromUrl(
                "https://pjawwektzazcxakgopou.supabase.co/storage/v1/object/public/static/qrcode.png"
            );

            const whatsappIcon = await getBase64FromUrl(
                "https://pjawwektzazcxakgopou.supabase.co/storage/v1/object/public/static/whatsapp.png"
            );

            const tunasLogo = await getBase64FromUrl(
                "https://pjawwektzazcxakgopou.supabase.co/storage/v1/object/public/static/tunas.png"
            );

            // Siapkan content PDF
            const content = [
                { text: 'Estimasi Saran Perbaikan', alignment: 'center', fontSize: 12, margin: [0, 0, 0, 12] },

                { text: `Nomor Polisi: ${data.nopol}`, fontSize: 10, margin: [0, 0, 0, 3] },
                { text: `Nomor Rangka: ${data.nomor_rangka || '-'}`, fontSize: 10, margin: [0, 0, 0, 3] },
                { text: `Nama Teknisi: ${teknisiNama}`, fontSize: 10, margin: [0, 0, 0, 3] },
                { text: `Tanggal Estimasi: ${new Date(data.created_at).toLocaleDateString('id-ID')}`, fontSize: 10, margin: [0, 0, 0, 12] }
            ];

            // INFORMASI KOMPONEN YANG SUDAH DI-ACC
            if (selectedSpareparts.length > 0) {
                content.push({
                    text: 'KOMPONEN YANG SUDAH DISETUJUI:',
                    fontSize: 9,
                    bold: true,
                    margin: [0, 0, 0, 5],
                    color: '#e60000'
                });

                content.push({
                    text: selectedSpareparts.join(', '),
                    fontSize: 8,
                    margin: [0, 0, 0, 10]
                });
            }

            // Tambahkan tabel sparepart jika ada data
            if (sparepartData.length > 0) {
                const sparepartBody = [
                    [
                        { text: 'Nama Barang', fillColor: '#e60000', color: 'white', bold: true },
                        { text: 'Harga', fillColor: '#e60000', color: 'white', bold: true },
                        { text: 'Jml', fillColor: '#e60000', color: 'white', bold: true },
                        { text: 'Total', fillColor: '#e60000', color: 'white', bold: true },
                        { text: 'Part', fillColor: '#e60000', color: 'white', bold: true }
                    ]
                ];

                // Tambahkan baris data sparepart DENGAN FUNGSI CELL HELPER
                sparepartData.forEach(item => {
                    let avail = '-';
                    if (item.availability) {
                        const val = item.availability.toLowerCase();
                        if (val === 'ada') avail = 'Ada';
                        else if (val === 'kosong') avail = 'Kosong';
                        else if (val === 'bo') avail = 'BO';
                        else if (val === 'tam') avail = 'TAM';
                    }

                    // PERBAIKAN: SAMAKAN FORMAT STRING UNTUK PERBANDINGAN
                    const isAccCompleted = selectedSpareparts
                    .map(s => s.toLowerCase().trim())
                    .includes((item.name || "").toLowerCase().trim());

                    // GUNAKAN FUNGSI CELL HELPER UNTUK SETIAP CELL
                    sparepartBody.push([
                        cell(truncateText(item.name, 25) || '-', isAccCompleted),
                        cell(formatRupiah(item.price || 0), isAccCompleted),
                        cell(item.qty || 1, isAccCompleted),
                        cell(formatRupiah(item.total || item.subtotal || 0), isAccCompleted),
                        cell(avail, isAccCompleted)
                    ]);
                });

                // Baris total - hanya menampilkan total yang belum di-ACC
                sparepartBody.push([
                    { text: 'Total Harga Sparepart', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                    { text: formatRupiah(totalHargaSparepartNonAcc), bold: true },
                    ''
                ]);

                content.push({
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: sparepartBody
                    },
                    fontSize: 9,
                    margin: [0, 0, 0, 12]
                });
            }

            // Tambahkan tabel service jika ada data
            if (serviceData.length > 0) {
                content.push({
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Jenis Service', fillColor: '#2196F3', color: 'white', bold: true },
                                { text: 'Jam', fillColor: '#2196F3', color: 'white', bold: true },
                                { text: 'Harga/Jam', fillColor: '#2196F3', color: 'white', bold: true },
                                { text: 'Total', fillColor: '#2196F3', color: 'white', bold: true }
                            ],
                            ...serviceData.map(service => {
                                return [
                                    { text: truncateText(service.desc || '-', 30) },
                                    { text: service.hour || service.jam || 0 },
                                    { text: formatRupiah(service.price || service.harga || 0) },
                                    { text: formatRupiah(service.total || service.subtotal || 0) }
                                ];
                            }),
                            [
                                { text: 'Total Harga Service', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                                { text: formatRupiah(totalHargaService), bold: true }
                            ]
                        ]
                    },
                    fontSize: 9,
                    margin: [0, 0, 0, 12]
                });
            }

            // Tambahkan total harga keseluruhan - hanya yang belum di-ACC
            if (sparepartData.length > 0 || serviceData.length > 0) {
                content.push({
                    table: {
                        widths: ['*', 'auto'],
                        body: [
                            [
                                { text: 'TOTAL HARGA KESELURUHAN', alignment: 'right', bold: true, fontSize: 11 },
                                { text: formatRupiah(totalHargaKeseluruhan), bold: true, fontSize: 11, color: '#e60000' }
                            ]
                        ]
                    },
                    margin: [0, 0, 0, 12]
                });
            }

            // Tambahkan gambar jika ada
            if (fotoImages.length > 0) {
                content.push({
                    text: 'Foto Estimasi:',
                    fontSize: 10,
                    bold: true,
                    margin: [0, 10, 0, 5]
                });

                const fotoPerBaris = 3;
                const rows = [];

                for (let i = 0; i < fotoImages.length; i += fotoPerBaris) {
                    const rowImages = fotoImages.slice(i, i + fotoPerBaris);
                    const columns = rowImages.map(img => ({
                        image: img,
                        fit: [180, 145],
                        alignment: 'center',
                        margin: [2, 0, 2, 0]
                    }));

                    while (columns.length < fotoPerBaris) {
                        columns.push({ text: '', width: '*' });
                    }

                    rows.push({
                        columns: columns,
                        columnGap: 6,
                        margin: [0, 0, 0, 6]
                    });
                }

                content.push(...rows);
                content.push({ text: '', margin: [0, 0, 0, 10] });
            }

            // Tambahkan keterangan dan footer notes
            const notes = [
                { text: '*Harga dapat berubah sewaktu-waktu tanpa pemberitahuan', fontSize: 8, italics: true, margin: [0, 0, 0, 2] },
                { text: '*Ada (Dapat dilakukan penggantian), TAM (Order 3 hari), BO (Order 1 bulan), Kosong (berhenti produksi)', fontSize: 8, italics: true, margin: [0, 0, 0, 2] }
            ];

            // Tambahan informasi tentang perhitungan harga
            if (selectedSpareparts.length > 0) {
                notes.push(
                    {
                        text: '*Item bergaris coret adalah komponen yang sudah disetujui dan tidak termasuk dalam total harga',
                        fontSize: 8,
                        italics: true,
                        margin: [0, 0, 0, 2],
                        color: '#e60000'
                    }
                );
            }

            notes.push({
                text: `Keterangan: ${data.keterangan || 'Tidak ada keterangan tambahan'}`,
                fontSize: 10,
                margin: [0, 8, 0, 0]
            });

            content.push(...notes);

            const docDefinition = {
                pageSize: 'A5',
                pageMargins: [20, 80, 20, 80],

                header: {
                    margin: [20, 20, 20, 10],
                    stack: [
                        {
                            columns: [
                                {
                                    width: 'auto',
                                    image: tunasLogo,
                                    fit: [25, 25],
                                    margin: [0, 0, 8, 0]
                                },
                                {
                                    width: '*',
                                    stack: [
                                        { text: 'Tunas Toyota Batutulis', fontSize: 14, bold: true, color: '#e60000' },
                                        { text: 'Jl. Batutulis Raya No. 42, Jakarta Pusat', fontSize: 10 },
                                        { text: 'Telp: (021) 3454465', fontSize: 9 }
                                    ],
                                    alignment: 'left'
                                }
                            ]
                        },
                        {
                            margin: [0, 8, 0, 0],
                            canvas: [
                                { type: 'line', x1: 0, y1: 0, x2: 400, y2: 0, lineWidth: 1, color: '#e60000' }
                            ]
                        }
                    ]
                },

                footer: function (currentPage, pageCount) {
                    const advisorName = data.service_advisor || 'Abdul Azis';
                    const whatsappNum = getWhatsAppNumber(advisorName);

                    return {
                        margin: [20, 10, 20, 10],
                        stack: [
                            {
                                columns: [
                                    {
                                        width: '*',
                                        stack: [
                                            {
                                                text: `Hubungi ${advisorName} untuk melakukan perbaikan:`,
                                                bold: true,
                                                fontSize: 10
                                            },
                                            {
                                                margin: [0, 2, 0, 0],
                                                columns: [
                                                    {
                                                        width: 12,
                                                        image: whatsappIcon,
                                                        fit: [10, 10],
                                                        margin: [0, 0, 6, 0]
                                                    },
                                                    {
                                                        width: '*',
                                                        text: whatsappNum,
                                                        fontSize: 10,
                                                        color: '#25D366'
                                                    }
                                                ]
                                            },
                                            {
                                                text: `Service Advisor Tunas Toyota Batutulis`,
                                                fontSize: 8,
                                                color: '#666',
                                                margin: [0, 4, 0, 0]
                                            }
                                        ]
                                    },
                                    {
                                        width: 60,
                                        image: qrBase64,
                                        fit: [50, 50]
                                    }
                                ]
                            },
                            {
                                margin: [0, 5, 0, 0],
                                columns: [
                                    {
                                        width: '*',
                                        text: `Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`,
                                        fontSize: 8,
                                        color: '#6c757d',
                                        alignment: 'left'
                                    },
                                    {
                                        width: 50,
                                        text: currentPage.toString() + ' / ' + pageCount,
                                        fontSize: 8,
                                        alignment: 'right'
                                    }
                                ]
                            }
                        ]
                    };
                },

                content: content
            };

            // Download PDF
            pdfMake.createPdf(docDefinition).download(`estimasi_${data.nopol}_${new Date().getTime()}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Terjadi kesalahan saat membuat PDF: ' + error.message);
        }
    }

    // FUNGSI BANTUAN UNTUK MEMASTIKAN PDF BEKERJA
    function testPdfGeneration() {
        console.log('🧪 Testing PDF generation...');
        console.log('📋 Current Estimasi ID:', currentEstimasiId);
        console.log('📚 pdfMake available:', typeof pdfMake !== 'undefined');
        console.log('📄 vfs_fonts available:', typeof pdfMake.vfs !== 'undefined');

        // Test simple PDF
        const testDoc = {
            content: [
                { text: 'TEST PDF', alignment: 'center' },
                { text: 'Jika ini berhasil, PDF generation bekerja normal' },
                { text: new Date().toLocaleString(), margin: [0, 20, 0, 0] }
            ]
        };

        try {
            pdfMake.createPdf(testDoc).download('test.pdf');
            console.log('✅ Test PDF generated successfully');
            return true;
        } catch (error) {
            console.error('❌ Test PDF failed:', error);
            return false;
        }
    }

    // Tambahkan ke debug tools
    window.pdfDebug = {
        test: testPdfGeneration,
        getCurrentId: () => currentEstimasiId,
        setCurrentId: (id) => { currentEstimasiId = id; console.log('📝 Current ID set to:', id); }
    };

    function logDebug(message, data = null, level = 'debug') {
        if (SILENT_MODE) return;

        if (level === 'error') {
            console.error(`[ToyotaCRM-Notif] ${message}`, data);
        } else if (level === 'warn') {
            console.warn(`[ToyotaCRM-Notif] ${message}`, data);
        } else {
            console.log(`[ToyotaCRM-Notif] ${message}`, data);
        }
    }

    async function initializeSupabase() {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            logDebug('Supabase client initialized');

            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'kirangasem@gmail.com',
                password: '123456'
            });

            if (error) {
                logDebug('Login error:', error, 'error');
                return false;
            }

            logDebug('User logged in:', data.user.email);
            return true;
        } catch (error) {
            logDebug('Supabase initialization error:', error, 'error');
            return false;
        }
    }

    function initializeFirebase() {
        try {
            firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
            firebaseDb = firebase.database();
            debugInfo.firebaseStatus = 'connected';
            logDebug('Firebase Realtime Database initialized');
            return true;
        } catch (error) {
            debugInfo.firebaseStatus = 'error';
            logDebug('Firebase initialization error:', error, 'error');
            return false;
        }
    }

    function triggerBadgeBlinking() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.classList.add('badge-blinking');
            setTimeout(() => {
                badge.classList.remove('badge-blinking');
            }, 10000);
            logDebug('Badge blinking triggered via Firebase');
        }
    }

    function showFirebaseToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `firebase-toast ${type === 'error' ? 'error' : ''}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-icons" style="font-size: 20px;">
                    ${type === 'error' ? 'error' : 'notifications_active'}
                </span>
                <div style="flex: 1;">
                    <div style="font-weight: 500; font-size: 14px;">${type === 'error' ? 'Error' : 'Notifikasi Baru'}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer;">
                    <span class="material-icons" style="font-size: 16px;">close</span>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    function loadMaterialIcons() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        logDebug('Material Icons loaded');
    }

    function closePanelOnClickOutside(e) {
        const panel = document.querySelector('.notification-panel');
        if (panel && isPanelOpen && !panel.contains(e.target)) {
            const helpButton = document.getElementById('helpLauncher-button');
            if (helpButton && !helpButton.contains(e.target)) {
                closeNotificationPanel();
            }
        }
    }

    function handleEscapeKey(e) {
        if (e.key === 'Escape' && isPanelOpen) {
            closeNotificationPanel();
        }
    }

    function closeNotificationPanel() {
        const panel = document.querySelector('.notification-panel');
        if (panel) {
            panel.style.display = 'none';
            isPanelOpen = false;
            // Sembunyikan semua tombol aksi saat panel ditutup
            document.querySelectorAll('.action-buttons').forEach(btn => {
                btn.classList.remove('visible');
                btn.style.display = 'none';
            });
        }
    }

    function toggleNotificationPanel() {
        const panel = document.querySelector('.notification-panel') || createNotificationPanel();

        if (!isPanelOpen) {
            // ✅ Force refresh data saat panel dibuka
            fetchNotifications(true);
            loadSentNotifications();
            updateDebugInfo();
            panel.style.display = 'block';
            isPanelOpen = true;
        } else {
            closeNotificationPanel();
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Invalid Date';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'Invalid Date' : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        } catch (e) {
            return 'Invalid Date';
        }
    }

    async function waitForHelpButton() {
        return new Promise((resolve) => {
            const checkButton = () => {
                const helpButton = document.getElementById('helpLauncher-button');
                if (helpButton) {
                    logDebug('Help button found');
                    resolve();
                } else {
                    logDebug('Help button not found, retrying...');
                    setTimeout(checkButton, 1000);
                }
            };
            checkButton();
        });
    }

    // PERBAIKAN: Panel Notifikasi dengan Tab Interface
    function createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3 class="notification-title" id="panelTitle">Estimasi Service</h3>
                <div class="header-actions">
                    <button class="close-button" title="Tutup">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            </div>
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-button active" data-tab="sent">Menunggu Harga Jasa</button>
                    <button class="tab-button" data-tab="all">Semua Estimasi</button>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" id="tab-sent">
                        <ul class="notification-list" id="notificationListSent"></ul>
                    </div>
                    <div class="tab-pane" id="tab-all">
                        <ul class="notification-list" id="notificationListAll"></ul>
                    </div>
                </div>
            </div>
            <div class="debug-info" id="debugInfo"></div>
        `;

        document.body.appendChild(panel);

        setupTabListeners(panel);

        panel.querySelector('.close-button').addEventListener('click', (e) => {
            e.stopPropagation();
            closeNotificationPanel();
        });

        document.addEventListener('click', closePanelOnClickOutside);
        document.addEventListener('keydown', handleEscapeKey);

        return panel;
    }

    function setupTabListeners(panel) {
        const tabButtons = panel.querySelectorAll('.tab-button');
        const tabPanes = panel.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');

                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabPanes.forEach(pane => pane.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');

                if (tabId === 'sent') {
                    loadSentNotifications();
                } else if (tabId === 'all') {
                    loadAllEstimasi();
                }
            });
        });
    }

    async function loadSentNotifications() {
        try {
            const { data: estimasiData, error } = await supabase
            .from('estimasi')
            .select(OPTIMIZATION_CONFIG.panelFields)
            .eq('status', 'sent')
            .eq('service_advisor', SERVICE_ADVISOR)
            .order('created_at', { ascending: false });

            if (error) throw error;

            const sentNotifications = estimasiData || [];
            updateSentNotificationsPanel(sentNotifications);

            logDebug(`Loaded ${sentNotifications.length} sent notifications`, null, 'info');

        } catch (error) {
            logDebug('Error loading sent notifications:', error, 'error');
            updateSentNotificationsPanel([]);
        }
    }

    async function loadAllEstimasi() {
        try {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            const fiveDaysAgoStr = fiveDaysAgo.toISOString();

            // PERBAIKAN: Tambahkan field mra_catatan dan mra_updated_at
            const { data: estimasiData, error } = await supabase
            .from('estimasi')
            .select('id, nopol, jenis_mobil, komponen, created_at, teknisi_id, status, service_advisor, mra_selected_spareparts, mra_catatan, mra_updated_at, users:teknisi_id(full_name, email)')
            .eq('service_advisor', SERVICE_ADVISOR)
            .in('status', ['sent', 'completed'])
            .gte('created_at', fiveDaysAgoStr)
            .order('created_at', { ascending: false });

            if (error) throw error;

            const allEstimasi = estimasiData || [];
            updateAllEstimasiPanel(allEstimasi);

            logDebug(`Loaded ${allEstimasi.length} all estimasi`, null, 'info');

        } catch (error) {
            logDebug('Error loading all estimasi:', error, 'error');
            updateAllEstimasiPanel([]);
        }
    }

    function updateSentNotificationsPanel(sentNotifications) {
        const notificationList = document.getElementById('notificationListSent');
        if (!notificationList) return;

        if (sentNotifications.length === 0) {
            notificationList.innerHTML = `
                <li class="empty-state">
                    <span class="material-icons" style="font-size: 48px; color: #ccc; margin-bottom: 16px;">description</span>
                    <div>Tidak ada notifikasi estimasi</div>
                    <div style="font-size: 11px; color: #999; margin-top: 8px;">Service Advisor: ${SERVICE_ADVISOR}</div>
                </li>
            `;
            return;
        }

        notificationList.innerHTML = '';
        sentNotifications.forEach(notif => {
            const li = document.createElement('li');
            li.className = 'notification-item';
            li.innerHTML = `
                <div class="vehicle-info">
                    <span>TOYOTA ${notif.jenis_mobil || 'Unknown'} ${notif.nopol || 'No Plate'}</span>
                </div>
                <div class="components-list">
                    ${Array.isArray(notif.komponen) ? notif.komponen.join(', ') : (notif.komponen || 'No components')}
                </div>
                <div class="technician-date">
                    <span>${notif.users?.full_name || 'Belum ada teknisi'}</span>
                    <span>${formatDate(notif.created_at)}</span>
                </div>
            `;

            li.addEventListener('click', async () => {
                const nopol = notif.nopol;
                if (!nopol) return alert('Nomor polisi tidak ditemukan.');
                await openWorkOrderByPlate(nopol);
            });

            notificationList.appendChild(li);
        });
    }

    async function changeStatusToSent(estimasiId) {
        if (!confirm('Ubah status estimasi menjadi "Menunggu Harga Jasa"? Estimasi akan muncul di tab Menunggu Harga Jasa.')) {
            return;
        }

        try {
            const { data, error } = await supabase
            .from('estimasi')
            .update({
                status: 'sent',
                updated_at: new Date().toISOString()
            })
            .eq('id', estimasiId)
            .select();

            if (error) throw error;

            logDebug('Status changed to sent:', data, 'info');

            // Refresh data
            await loadAllEstimasi();
            // Refresh badge
            fetchNotificationsDebounced(true);

            const estimasiItem = document.querySelector(`.estimasi-item[data-id="${estimasiId}"]`);
            if (estimasiItem) {
                const nopol = estimasiItem.querySelector('.vehicle-info span').textContent.split(' ').pop();
                if (nopol && nopol !== 'No Plate') {
                    await openWorkOrderByPlate(nopol);
                }
            }

        } catch (error) {
            logDebug('Error changing status:', error, 'error');
            alert('Gagal mengubah status: ' + error.message);
        }
    }

    async function openWorkOrderByPlate(nopol) {
        if (!nopol) return alert('Nomor polisi tidak ditemukan.');

        const fetchUrl = `https://tunastoyota.crm5.dynamics.com/api/data/v9.0/xts_workorders?fetchXml=%3Cfetch%20version%3D%221.0%22%20output-format%3D%22xml-platform%22%20mapping%3D%22logical%22%20distinct%3D%22false%22%20savedqueryid%3D%22edb1eb56-b65a-4a8a-a190-2b4c80d62d79%22%20returntotalrecordcount%3D%22true%22%20page%3D%221%22%20count%3D%2250%22%20no-lock%3D%22false%22%3E%3Centity%20name%3D%22xts_workorder%22%3E%3Cattribute%20name%3D%22xts_workorderid%22%2F%3E%3Cfilter%20type%3D%22or%22%20isquickfindfields%3D%221%22%3E%3Ccondition%20attribute%3D%22xts_platenumber%22%20operator%3D%22like%22%20value%3D%22${encodeURIComponent(nopol)}%25%22%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E`;

        try {
            const res = await fetch(fetchUrl, { credentials: 'include' });
            const data = await res.json();

            if (!data.value?.length) {
                alert('Work Order tidak ditemukan untuk nopol: ' + nopol);
                return;
            }

            const workorderid = data.value[0].xts_workorderid;
            const targetUrl = `https://tunastoyota.crm5.dynamics.com/main.aspx?appid=984780dc-bd92-ec11-b400-00224815faf4&pagetype=entityrecord&etn=xts_workorder&id=${workorderid}&formid=36352158-4a51-4915-9f8e-e4539cfe3ac1`;

            const popup = window.open(targetUrl, '_blank', 'width=1200,height=800');

            const checkButton = setInterval(() => {
                try {
                    const btn = popup?.document?.getElementById('xts_workorder|NoRelationship|Form|xti.xts_workorder.addWOLine.Command40-button');
                    if (btn) {
                        clearInterval(checkButton);
                        btn.click();
                        logDebug('Tombol "Add WO Line" diklik otomatis', null, 'info');
                    }
                } catch (err) {}
            }, 2000);

            setTimeout(() => clearInterval(checkButton), 60000);

        } catch (error) {
            logDebug('Error opening work order:', error, 'error');
            alert('Gagal membuka work order: ' + error.message);
        }
    }

    function updateDebugInfo() {
        const debugElement = document.getElementById('debugInfo');
        if (debugElement) {
            debugElement.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Service Advisor:</span>
                    <span class="debug-value">${debugInfo.serviceAdvisor}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Total Records:</span>
                    <span class="debug-value">${debugInfo.totalRecords}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Last Fetch:</span>
                    <span class="debug-value">${debugInfo.lastFetch ? new Date(debugInfo.lastFetch).toLocaleTimeString() : 'Never'}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Firebase Realtime:</span>
                    <span class="debug-value">
                        <span class="realtime-status ${debugInfo.firebaseStatus === 'connected' ? 'realtime-connected' : 'realtime-disconnected'}"></span>
                        ${debugInfo.firebaseStatus}
                    </span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Cache Status:</span>
                    <span class="debug-value">${notificationCache.timestamp ? 'Active' : 'Inactive'}</span>
                </div>
                ${debugInfo.error ? `
                <div class="debug-item">
                    <span class="debug-label">Status:</span>
                    <span class="debug-error">Error: ${debugInfo.error}</span>
                </div>
                ` : `
                <div class="debug-item">
                    <span class="debug-label">Status:</span>
                    <span class="debug-success">Optimized & Connected</span>
                </div>
                `}
            `;
        }
    }

    // PERBAIKAN: Inisialisasi dengan Conflict Resolution
    async function init() {
        if (window.toyotaNotifScriptRunning) {
            return;
        }
        window.toyotaNotifScriptRunning = true;

        logDebug('Initializing Toyota CRM Notifikasi dengan Optimizations...', null, 'info');
        loadMaterialIcons();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initApp, 5000);
            });
        } else {
            setTimeout(initApp, 5000);
        }
    }

    async function initApp() {
        const supabaseReady = await initializeSupabase();
        if (!supabaseReady) {
            setTimeout(initApp, 5000);
            return;
        }

        const firebaseReady = initializeFirebase();
        if (firebaseReady) {
            setupFirebaseRealtime();
        }

        await waitForHelpButton();
        await fetchNotifications(); // Initial fetch
        createNotificationPanel();

        logDebug('Application with Optimizations initialized successfully', null, 'info');
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
        document.removeEventListener('click', closePanelOnClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        if (fetchTimeout) clearTimeout(fetchTimeout);
        window.toyotaNotifScriptRunning = false;
    });

    // Debug tools
    window.firebaseDebug = {
        status: function() {
            console.log('=== FIREBASE DEBUG ===');
            console.log('Firebase App:', firebaseApp);
            console.log('Firebase DB:', firebaseDb);
            console.log('Service Advisor:', SERVICE_ADVISOR);
            console.log('Firebase Status:', debugInfo.firebaseStatus);
            console.log('Cache Status:', notificationCache);
        },
        testTrigger: function() {
            if (firebaseDb) {
                const notificationRef = firebaseDb.ref(`notifications/${SERVICE_ADVISOR}`);
                notificationRef.update({
                    trigger: true,
                    nopol: 'B1234TEST',
                    timestamp: new Date().toISOString(),
                    message: `Estimasi baru: B1234TEST`
                });
                console.log('✅ Firebase notification triggered for:', SERVICE_ADVISOR);
            }
        },
        forceRefresh: function() {
            fetchNotifications(true);
        }
    };

    // Jalankan inisialisasi
    init();
})();
