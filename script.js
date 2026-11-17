// --- 1. FUNGSI NAVIGASI ANTAR HALAMAN ---
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Mengatur status aktif pada menu navigasi header
    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(pageId)) {
            link.classList.add('active');
        }
    });

    // Gulir otomatis ke atas saat pindah halaman
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 2. FUNGSI MEMILIH PRODUK DARI KATALOG ---
function selectProduct(productName, price) {
    const productInput = document.getElementById('productName');
    
    if (productInput) {
        // Format harga ke Rupiah
        const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);

        productInput.value = `${productName} (${formattedPrice})`;
        
        // Berikan efek kilau/kedip pada input agar pengguna tahu produk sudah terpilih
        productInput.style.backgroundColor = '#d1fae5';
        setTimeout(() => {
            productInput.style.backgroundColor = '#ffffff';
        }, 800);
    }

    // Pindah otomatis ke halaman checkout
    showPage('checkout');
}

// --- 3. FUNGSI PROSES CHECKOUT & VALIDASI INPUT ---
function processCheckout(event) {
    event.preventDefault(); // Mencegah form melakukan reload halaman

    const productName = document.getElementById('productName').value.trim();
    const custName = document.getElementById('custName').value.trim();
    const custAddress = document.getElementById('custAddress').value.trim();
    const notification = document.getElementById('notification');

    // Validasi 1: Apakah produk sudah dipilih?
    if (!productName) {
        alert('⚠️ Mohon pilih produk terlebih dahulu dari menu Katalog!');
        showPage('catalog');
        return;
    }

    // Validasi 2: Apakah nama dan alamat kosong?
    if (custName === '' || custAddress === '') {
        alert('⚠️ Kolom Nama Lengkap dan Alamat Pengiriman wajib diisi dengan benar!');
        return;
    }

    // Simulasi proses pengiriman data dengan efek loading (menambah kesan profesional)
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Memproses Pesanan...';
    submitBtn.disabled = true;

    setTimeout(() => {
        // Kembalikan tombol seperti semula
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;

        // Tampilkan Pesan Sukses / Notifikasi Interaktif
        notification.classList.remove('hidden');
        notification.innerHTML = `
            <h3 style="margin-bottom: 0.5rem; color: #065f46;">🎉 Pesanan Berhasil Dibuat!</h3>
            <p>Terima kasih, <strong>${custName}</strong>. Pesanan untuk <em>${productName}</em> sedang dipersiapkan dan akan segera dikirim ke alamat:</p>
            <p style="margin-top: 0.5rem; font-style: italic; color: #334155;">"${custAddress}"</p>
            <p style="margin-top: 0.7rem; font-size: 0.85rem; color: #047857;">Nomor Resi Sementara: <strong>DNM-${Math.floor(100000 + Math.random() * 900000)}</strong></p>
        `;

        // Gulir layar ke arah notifikasi agar terlihat oleh pengguna
        notification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Reset form input setelah berhasil
        document.getElementById('orderForm').reset();
        document.getElementById('productName').value = '';

    }, 1000); // Simulasi jeda server 1 detik
}