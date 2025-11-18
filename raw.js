// ==UserScript==
// @name         Toyota CRM Notifikasi Estimasi - Tab Interface
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Notifikasi estimasi dengan Firebase realtime - Tab Interface
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
    /* CSS yang sama dari kode lama TETAPKAN DI SINI */
    .paper-icon-container {
        position: relative;
        display: inline-block;
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
`);

(function() {
    'use strict';

    // 🔇 SILENT MODE - Nonaktifkan logging yang mengganggu
    const SILENT_MODE = true;

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
    let debugInfo = {
        lastFetch: null,
        totalRecords: 0,
        error: null,
        serviceAdvisor: SERVICE_ADVISOR,
        realtimeStatus: 'disconnected',
        firebaseStatus: 'disconnected',
        sqlQuery: ''
    };

    // ==================== FUNGSI YANG SAMA DARI KODE LAMA ====================
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

    // PERBAIKAN: Fungsi untuk mendapatkan nomor WhatsApp dengan handling error
    function getWhatsAppNumber(serviceAdvisor) {
        // Pastikan serviceAdvisor adalah string
        const advisorName = String(serviceAdvisor || 'Abdul Azis').trim();

        const whatsappNumbers = {
            'Abdul Azis': '087889077123',
            'Akbarudin': '085899345191',
            'Muhammad Hakiki': '081806274120',
            'Ade Purwanto': '081999704850',
            'Ahmad Baidowi': '081999704850'
        };

        const number = whatsappNumbers[advisorName] || '081315389866';

        // Pastikan return value adalah string
        return String(number);
    }

    // ATAU versi yang lebih safe:
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

            // Jika tidak ditemukan, coba match partial
            if (!number) {
                const keys = Object.keys(whatsappNumbers);
                const foundKey = keys.find(key =>
                                           advisorName.toLowerCase().includes(key.toLowerCase()) ||
                                           key.toLowerCase().includes(advisorName.toLowerCase())
                                          );
                number = foundKey ? whatsappNumbers[foundKey] : '081315389866';
            }

            // Validasi nomor
            if (typeof number !== 'string') {
                number = String(number);
            }

            // Hapus karakter non-digit
            number = number.replace(/\D/g, '');

            return number || '081315389866';

        } catch (error) {
            console.error('Error in getWhatsAppNumber:', error);
            return '081315389866';
        }
    }

    // Fungsi generate PDF A5
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

            // Handle sparepart
            let sparepartData = [];
            let totalHargaSparepart = 0;
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

                // Hitung total harga sparepart
                if (sparepartData.length > 0) {
                    totalHargaSparepart = sparepartData.reduce((total, item) => {
                        const itemTotal = parseFloat(item.total || item.subtotal || 0);
                        return total + itemTotal;
                    }, 0);
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

            // Hitung total harga keseluruhan
            const totalHargaKeseluruhan = totalHargaSparepart + totalHargaService;

            // PERBAIKAN: Handle foto URL - parsing yang lebih robust
            let fotoArray = [];
            let fotoImages = [];
            if (data.foto_url) {
                try {
                    console.log('Raw foto_url:', data.foto_url); // Debug log

                    // PERBAIKAN: Handle berbagai format foto_url
                    if (typeof data.foto_url === 'string') {
                        // Coba parse sebagai JSON string
                        try {
                            const parsed = JSON.parse(data.foto_url);
                            fotoArray = Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            // Jika gagal parse, coba split oleh koma atau treat sebagai single URL
                            if (data.foto_url.includes('[') && data.foto_url.includes(']')) {
                                // Clean the string and try to parse again
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
                    } else {
                        fotoArray = [];
                    }

                    console.log('Parsed fotoArray:', fotoArray); // Debug log

                    // Convert foto URLs ke base64 untuk PDF
                    if (fotoArray.length > 0) {
                        for (const fotoUrl of fotoArray) {
                            try {
                                // PERBAIKAN: Validasi URL sebelum convert
                                if (fotoUrl && typeof fotoUrl === 'string' && fotoUrl.startsWith('http')) {
                                    const base64Image = await getBase64FromUrl(fotoUrl);
                                    fotoImages.push(base64Image);
                                    console.log('Successfully converted image:', fotoUrl); // Debug log
                                }
                            } catch (error) {
                                console.error('Error converting image to base64:', error, 'URL:', fotoUrl);
                            }
                        }
                    }

                    console.log('Final fotoImages count:', fotoImages.length); // Debug log
                } catch (e) {
                    console.error('Error parsing foto_url:', e, 'Raw data:', data.foto_url);
                    fotoArray = [];
                }
            }

            // Dapatkan nomor WhatsApp berdasarkan Service Advisor
            const serviceAdvisor = data.service_advisor || 'Abdul Azis';
            const whatsappNumber = getWhatsAppNumber(serviceAdvisor);
            const whatsappLink = `https://wa.me/62${whatsappNumber.substring(1)}`;

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

            // Tambahkan tabel sparepart jika ada data
            if (sparepartData.length > 0) {
                content.push({
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Nama Barang', fillColor: '#e60000', color: 'white', bold: true },
                                { text: 'Harga', fillColor: '#e60000', color: 'white', bold: true },
                                { text: 'Jml', fillColor: '#e60000', color: 'white', bold: true },
                                { text: 'Total', fillColor: '#e60000', color: 'white', bold: true },
                                { text: 'Part', fillColor: '#e60000', color: 'white', bold: true }
                            ],
                            ...sparepartData.map(item => {
                                let avail = '-';
                                if (item.availability) {
                                    const val = item.availability.toLowerCase();
                                    if (val === 'ada') avail = 'Ada';
                                    else if (val === 'kosong') avail = 'Kosong';
                                    else if (val === 'bo') avail = 'BO';
                                    else if (val === 'tam') avail = 'TAM';
                                }
                                return [
                                    truncateText(item.name, 25) || '-',
                                    formatRupiah(item.price || 0),
                                    item.qty || 1,
                                    formatRupiah(item.total || item.subtotal || 0),
                                    avail
                                ];
                            }),
                            [
                                { text: 'Total Harga Sparepart', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                                { text: formatRupiah(totalHargaSparepart), bold: true },
                                ''
                            ]
                        ]
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
                                    truncateText(service.name || '-', 30),
                                    service.hour || service.jam || 0,
                                    formatRupiah(service.price || service.harga || 0),
                                    formatRupiah(service.total || service.subtotal || 0)
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

            // Tambahkan total harga keseluruhan
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
            content.push(
                { text: '*Harga dapat berubah sewaktu-waktu tanpa pemberitahuan', fontSize: 8, italics: true, margin: [0, 0, 0, 2] },
                { text: '*Ada (Dapat dilakukan penggantian), TAM (Order 3 hari), BO (Order 1 bulan), Kosong (berhenti produksi)', fontSize: 8, italics: true, margin: [0, 0, 0, 12] },
                { text: `Keterangan: ${data.keterangan || 'Tidak ada keterangan tambahan'}`, fontSize: 10 }
            );

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
                    const waLink = `https://wa.me/62${whatsappNum.substring(1)}`;

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
                                                        color: '#25D366',
                                                        link: waLink
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

    // 1. Fungsi logDebug (dengan modifikasi silent mode)
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

    // 2. Fungsi initializeSupabase()
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

    // 3. Fungsi initializeFirebase()
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

    // 4. Fungsi triggerBadgeBlinking()
    function triggerBadgeBlinking() {
        fetchNotifications().then(() => {
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.classList.add('badge-blinking');
                setTimeout(() => {
                    badge.classList.remove('badge-blinking');
                }, 10000);
                logDebug('Badge blinking triggered via Firebase');
            } else {
                changeHelpIcon();
                const newBadge = document.querySelector('.notification-badge');
                if (newBadge) {
                    newBadge.classList.add('badge-blinking');
                    setTimeout(() => {
                        newBadge.classList.remove('badge-blinking');
                    }, 10000);
                }
            }
        });
    }

    // 5. Fungsi showFirebaseToast()
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

    // 6. Fungsi loadMaterialIcons()
    function loadMaterialIcons() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        logDebug('Material Icons loaded');
    }

    // 7. Fungsi closePanelOnClickOutside()
    function closePanelOnClickOutside(e) {
        const panel = document.querySelector('.notification-panel');
        if (panel && isPanelOpen && !panel.contains(e.target)) {
            const helpButton = document.getElementById('helpLauncher-button');
            if (helpButton && !helpButton.contains(e.target)) {
                closeNotificationPanel();
            }
        }
    }

    // 8. Fungsi handleEscapeKey()
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && isPanelOpen) {
            closeNotificationPanel();
        }
    }

    // 9. Fungsi closeNotificationPanel()
    function closeNotificationPanel() {
        const panel = document.querySelector('.notification-panel');
        if (panel) {
            panel.style.display = 'none';
            isPanelOpen = false;
        }
    }

    // 10. Fungsi changeHelpIcon()
    function changeHelpIcon() {
        const helpButton = document.getElementById('helpLauncher-button');

        if (helpButton) {
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

            iconContainer.innerHTML = '';

            const materialIcon = document.createElement('span');
            materialIcon.className = 'material-icons paper-icon';
            materialIcon.textContent = 'description';
            materialIcon.style.color = notifications.length > 0 ? 'white' : '#ccc';

            iconContainer.appendChild(materialIcon);

            if (notifications.length > 0) {
                const badge = document.createElement('span');
                badge.className = 'notification-badge';
                badge.textContent = notifications.length;
                iconContainer.appendChild(badge);
            }

            helpButton.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleNotificationPanel();
            };

            logDebug('Help icon updated', { notifications: notifications.length });
        }
    }

    // 11. Fungsi toggleNotificationPanel()
    function toggleNotificationPanel() {
        const panel = document.querySelector('.notification-panel') || createNotificationPanel();
        const notificationListSent = document.getElementById('notificationListSent');

        if (!isPanelOpen) {
            loadSentNotifications();
            updateDebugInfo();
            panel.style.display = 'block';
            isPanelOpen = true;
        } else {
            closeNotificationPanel();
        }
    }

    // 12. Fungsi formatDate()
    function formatDate(dateString) {
        if (!dateString) return 'Invalid Date';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'Invalid Date' : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        } catch (e) {
            return 'Invalid Date';
        }
    }

    // 13. Fungsi parseKomponen()
    function parseKomponen(komponenData) {
        if (!komponenData) return [];

        try {
            if (typeof komponenData === 'string') {
                return JSON.parse(komponenData);
            } else if (Array.isArray(komponenData)) {
                return komponenData;
            }
        } catch (e) {
            logDebug('Error parsing komponen data:', e, 'error');
        }

        return [];
    }

    // 14. SEMUA FUNGSI PDF GENERATION (getBase64FromUrl, formatRupiah, truncateText, generatePdfA5)
    // SALIN SEMUA FUNGSI PDF DARI KODE LAMA ANDA:

    // - getBase64FromUrl(url)
    // - formatRupiah(amount)
    // - truncateText(text, maxLength)
    // - generatePdfA5(format = 'A5')

    // 15. Fungsi waitForHelpButton()
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

    // ==================== FUNGSI BARU YANG DIPERBAIKI ====================

    // PERBAIKAN 1: Firebase Realtime Listener
    function setupFirebaseRealtime() {
        try {
            const notificationsRef = firebaseDb.ref(`notifications/${SERVICE_ADVISOR}`);

            notificationsRef.on('value', (snapshot) => {
                const data = snapshot.val();

                if (data && data.trigger === true && data.service_advisor === SERVICE_ADVISOR) {
                    triggerBadgeBlinking();

                    if (data.nopol) {
                        showFirebaseToast(`Estimasi baru: ${data.nopol}`);
                    } else {
                        showFirebaseToast('Estimasi baru diterima dari teknisi!');
                    }

                    setTimeout(() => {
                        notificationsRef.update({
                            trigger: false,
                            processed_at: new Date().toISOString(),
                            processed_by: SERVICE_ADVISOR
                        });
                    }, 1000);
                }
            });

            logDebug('Firebase realtime listener setup', null, 'info');
            return true;
        } catch (error) {
            logDebug('Error setting up Firebase realtime:', error, 'error');
            return false;
        }
    }

    // PERBAIKAN 2: Panel Notifikasi dengan Tab Interface
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

    // PERBAIKAN 3: Setup Tab Listeners
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

    // PERBAIKAN 4: Load Notifikasi Sent
    async function loadSentNotifications() {
        try {
            const { data: estimasiData, error } = await supabase
            .from('estimasi')
            .select(`
                    *,
                    users:teknisi_id (full_name, email)
                `)
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

    // PERBAIKAN 5: Load Semua Estimasi (hanya sent & completed)
    async function loadAllEstimasi() {
        try {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            const fiveDaysAgoStr = fiveDaysAgo.toISOString();

            const { data: estimasiData, error } = await supabase
            .from('estimasi')
            .select(`
                    *,
                    users:teknisi_id (full_name, email)
                `)
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

    // PERBAIKAN 6: Update Panel Sent Notifications
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

    // PERBAIKAN 7: Update Panel All Estimasi dengan Tombol Aksi
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

            li.innerHTML = `
                <div class="estimasi-content">
                    <div class="vehicle-info">
                        <span>TOYOTA ${estimasi.jenis_mobil || 'Unknown'} ${estimasi.nopol || 'No Plate'}</span>
                        <span class="notification-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="components-list">
                        ${Array.isArray(estimasi.komponen) ? estimasi.komponen.join(', ') : (estimasi.komponen || 'No components')}
                    </div>
                    <div class="technician-date">
                        <span>${estimasi.users?.full_name || 'Belum ada teknisi'}</span>
                        <span>${formatDate(estimasi.created_at)}</span>
                    </div>
                </div>
                <div class="action-buttons">
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

            // Event listener untuk klik item (tampilkan/sembunyikan tombol)
            li.querySelector('.estimasi-content').addEventListener('click', function(e) {
                if (e.target.closest('.action-btn')) return;

                const actionButtons = li.querySelector('.action-buttons');
                const isVisible = actionButtons.style.display !== 'none';

                document.querySelectorAll('.action-buttons').forEach(btn => {
                    btn.style.display = 'none';
                });

                actionButtons.style.display = isVisible ? 'none' : 'flex';
            });

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

    // PERBAIKAN 8: Fungsi Ubah Status ke Sent
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

            await loadAllEstimasi();

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

    // PERBAIKAN 9: Fungsi Buka Work Order
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

    // PERBAIKAN 10: Fetch Notifications (untuk badge count)
    async function fetchNotifications() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.innerHTML = '<div class="loading-spinner"></div>';
            badge.style.background = 'transparent';
        }

        try {
            const { data: estimasiData, error } = await supabase
            .from('estimasi')
            .select(`
                *,
                users:teknisi_id (full_name, email)
            `)
            .eq('status', 'sent')
            .eq('service_advisor', SERVICE_ADVISOR)
            .order('created_at', { ascending: false });

            if (error) throw error;

            if (estimasiData && Array.isArray(estimasiData)) {
                notifications = estimasiData.map(estimasi => ({
                    ...estimasi,
                    teknisi: estimasi.teknisi_id?.full_name || estimasi.users?.full_name || 'Belum ada teknisi',
                    komponen: parseKomponen(estimasi.komponen)
                }));

                changeHelpIcon();
            } else {
                notifications = [];
                changeHelpIcon();
            }

        } catch (error) {
            logDebug('Error fetching SA data:', error, 'error');
            notifications = [];
            changeHelpIcon();
        }
    }

    // PERBAIKAN 11: Update Debug Info
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
                ${debugInfo.error ? `
                <div class="debug-item">
                    <span class="debug-label">Status:</span>
                    <span class="debug-error">Error: ${debugInfo.error}</span>
                </div>
                ` : `
                <div class="debug-item">
                    <span class="debug-label">Status:</span>
                    <span class="debug-success">Connected</span>
                </div>
                `}
            `;
        }
    }

    // PERBAIKAN 12: Inisialisasi dengan Conflict Resolution
    async function init() {
        if (window.toyotaNotifScriptRunning) {
            return;
        }
        window.toyotaNotifScriptRunning = true;

        logDebug('Initializing Toyota CRM Notifikasi dengan Tab Interface...', null, 'info');
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
        await fetchNotifications();
        createNotificationPanel();

        logDebug('Application with Tab Interface initialized successfully', null, 'info');
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
        document.removeEventListener('click', closePanelOnClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
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
        }
    };

    // Jalankan inisialisasi
    init();
})();
