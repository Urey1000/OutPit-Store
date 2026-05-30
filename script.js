// 1. Variabel Global
let semuaProduk = []; // Menyimpan semua produk dari JSON
let keranjang = [];    // Menyimpan produk yang dimasukkan ke keranjang

// 2. Fungsi Ambil Data dari products.json
function ambilDataProduk() {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            semuaProduk = data; 
            tampilkanProduk(semuaProduk); 
        })
        .catch(error => console.error('Gagal mengambil data:', error));
}

// 3. Fungsi Menampilkan Produk ke Grid HTML
function tampilkanProduk(data) {
    const container = document.getElementById('product-list');
    container.innerHTML = ''; 

    data.forEach(produk => {
        const elemenProduk = `
            <div class="product-card">
                <img src="${produk.image}" alt="${produk.name}" style="width: 100%; border-radius: 8px; margin-bottom: 10px;">
                <h3 style="font-size: 16px; margin: 5px 0;">${produk.name}</h3>
                <p style="color: #d8b26e; font-weight: bold;">Rp ${produk.price.toLocaleString('id-ID')}</p>
                <button class="add-btn" onclick="tambahkanKeKeranjang(${produk.id})" style="width: 100%; padding: 8px; margin-top: 10px; background-color: #d8b26e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Add</button>
            </div>
        `;
        container.innerHTML += elemenProduk; 
    });
}

// 4. Fungsi Filter Kategori
function filterProducts(kategoriDipilih, tombolDipilih) {
    let semuaTombol = document.querySelectorAll('.filter-btn');
    semuaTombol.forEach(tombol => {
        tombol.classList.remove('active');
    });
    tombolDipilih.classList.add('active');

    if (kategoriDipilih === 'All') {
        tampilkanProduk(semuaProduk); 
    } else {
        const produkTersaring = semuaProduk.filter(produk => produk.category === kategoriDipilih);
        tampilkanProduk(produkTersaring); 
    }
}

// 5. Fungsi MENAMBAHKAN Produk ke Keranjang
function tambahkanKeKeranjang(idProduk) {
    // Cari apakah produk sudah ada di keranjang
    const produkDiKeranjang = keranjang.find(item => item.id === idProduk);

    if (produkDiKeranjang) {
        // Jika sudah ada, cukup tambahkan jumlahnya (quantity)
        produkDiKeranjang.jumlah += 1;
    } else {
        // Jika belum ada, cari detail produknya dari semuaProduk
        const produkAsli = semuaProduk.find(p => p.id === idProduk);
        // Masukkan ke keranjang dengan properti jumlah awal = 1
        keranjang.push({
            ...produkAsli,
            jumlah: 1
        });
    }
    
    // Perbarui tampilan keranjang belanja
    updateTampilanKeranjang();
}

// 6. Fungsi UPDATE Tampilan Keranjang (Badge, List Modal, Total Harga)
function updateTampilanKeranjang() {
    const badge = document.getElementById('cart-badge');
    const totalBarang = keranjang.reduce((total, item) => total + item.jumlah, 0);
    badge.innerText = totalBarang;

    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; 

    let totalHarga = 0;

    keranjang.forEach(item => {
        const subTotal = item.price * item.jumlah;
        totalHarga += subTotal;

        // Di sini kita menambahkan tombol minus (-) dan plus (+)
        const elemenItem = `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px; color: white;">
                <div style="flex: 2;">
                    <h4 style="margin: 0 0 5px 0;">${item.name}</h4>
                    <p style="font-size: 13px; color: #aaa; margin: 0;">Rp ${item.price.toLocaleString('id-ID')}</p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; flex: 1; justify-content: center;">
                    <button onclick="kurangiJumlah(${item.id})" style="background: #333; color: white; border: 1px solid #d8b26e; padding: 2px 8px; cursor: pointer; border-radius: 4px;">-</button>
                    <span style="font-weight: bold;">${item.jumlah}</span>
                    <button onclick="tambahJumlah(${item.id})" style="background: #333; color: white; border: 1px solid #d8b26e; padding: 2px 8px; cursor: pointer; border-radius: 4px;">+</button>
                </div>

                <div style="font-weight: bold; color: #d8b26e; flex: 1; text-align: right;">
                    Rp ${subTotal.toLocaleString('id-ID')}
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += elemenItem;
    });

    document.getElementById('total-price').innerText = totalHarga.toLocaleString('id-ID');
}
// --- FUNGSI BARU UNTUK TOMBOL + DAN - DI KERANJANG ---

// Fungsi untuk menambah jumlah barang di keranjang
function tambahJumlah(idProduk) {
    const produk = keranjang.find(item => item.id === idProduk);
    if (produk) {
        produk.jumlah += 1; // Tambah 1
        updateTampilanKeranjang(); // Perbarui tampilan
    }
}

// Fungsi untuk mengurangi jumlah barang di keranjang
function kurangiJumlah(idProduk) {
    const indexProduk = keranjang.findIndex(item => item.id === idProduk);
    
    if (indexProduk !== -1) {
        keranjang[indexProduk].jumlah -= 1; // Kurangi 1
        
        // Jika jumlahnya jadi 0, hapus produk tersebut dari keranjang
        if (keranjang[indexProduk].jumlah === 0) {
            keranjang.splice(indexProduk, 1);
        }
        
        updateTampilanKeranjang(); // Perbarui tampilan
    }
}


// 7. Event Listener untuk Buka & Tutup Modal Keranjang
const modalKeranjang = document.getElementById('cart-modal');
const tombolNavKeranjang = document.getElementById('nav-cart');
const tombolTutupKeranjang = document.getElementById('close-cart');

// Buka Modal (Hapus class 'hidden')
tombolNavKeranjang.addEventListener('click', (e) => {
    e.preventDefault(); // Mencegah halaman reload karena tag <a>
    modalKeranjang.classList.remove('hidden');
});

// Tutup Modal (Tambah class 'hidden')
tombolTutupKeranjang.addEventListener('click', () => {
    modalKeranjang.classList.add('hidden');
});

// 8. Fungsi Kirim Pesan via WhatsApp (Checkout)
const tombolCheckout = document.getElementById('checkout-btn');
tombolCheckout.addEventListener('click', () => {
    if (keranjang.length === 0) {
        alert('Keranjang kamu masih kosong nih!');
        return;
    }

    // Nomor HP Tokomu (Ganti dengan nomor WhatsApp kamu, awali dengan kode negara tanpa '+')
    const nomorWA = "6289518740007"; 
    
    // Menyusun teks template untuk pesan WhatsApp
    let teksPesan = `☆===Halo OutPit Store===☆ 
    Konfirmasi cara pembayaran 
    saya ingin memesan:\n\n`; 
    
    keranjang.forEach((item, index) => {
        teksPesan += `${index + 1}. ${item.name} (${item.jumlah}x) = Rp ${(item.price * item.jumlah).toLocaleString('id-ID')}\n`;
    });

    const totalHarga = keranjang.reduce((total, item) => total + (item.price * item.jumlah), 0);
    teksPesan += `\n*Total Keseluruhan: Rp ${totalHarga.toLocaleString('id-ID')}*`;
    
    // Encode teks agar aman dikirim via URL internet
    const urlWA = `https://api.whatsapp.com/send?phone=${6289518740007}&text=${encodeURIComponent(teksPesan)}`;
    
    // Buka link WhatsApp di tab baru
    window.open(urlWA, '_blank');
});

// Jalankan fungsi ambil data produk di awal script load
ambilDataProduk();
/* --- DOKUMENTASI: EFEK MENGETIK BERULANG (LOOPING TYPEWRITER) --- */
const teksJudul = "OutPit Store";
const tempatTeks = document.getElementById("typewriter");

let indexHuruf = 0;
let isMenghapus = false; // Penanda apakah sedang ngetik atau menghapus

function efekMengetikBerulang() {
    // Ambil potongan teks dari awal hingga sepanjang indexHuruf
    let teksSekarang = teksJudul.substring(0, indexHuruf);
    
    // Tampilkan potongan teks tersebut ke dalam HTML
    tempatTeks.innerHTML = teksSekarang;

    // Atur kecepatan standar saat ngetik (150 milidetik per huruf)
    let kecepatan = 150; 

    if (isMenghapus) {
        // Jika sedang mode menghapus, kurangi jumlah huruf dan percepat sedikit (100 milidetik)
        indexHuruf--;
        kecepatan = 100;
    } else {
        // Jika sedang mode ngetik, tambah jumlah huruf
        indexHuruf++;
    }

    // Logika ketika teks sudah selesai diketik semua
    if (!isMenghapus && indexHuruf === teksJudul.length + 1) {
        isMenghapus = true; // Ubah mode menjadi menghapus
        kecepatan = 1500;   // Beri jeda 1,5 detik agar teks terbaca dulu sebelum dihapus
    } 
    // Logika ketika teks sudah habis dihapus
    else if (isMenghapus && indexHuruf === 0) {
        isMenghapus = false; // Ubah mode kembali menjadi ngetik
        kecepatan = 500;     // Beri jeda 0,5 detik sebelum mulai ngetik lagi
    }

    // Jalankan fungsi ini lagi dan lagi sesuai kecepatan yang diatur
    setTimeout(efekMengetikBerulang, kecepatan);
}

// Jalankan fungsi ini secara otomatis saat web pertama kali dibuka
window.addEventListener('load', efekMengetikBerulang);
// 1. Buat variabel untuk menyimpan status bahasa saat ini (misal default: 'id')
let currentLang = 'id'; 

// 2. Buat fungsi yang dipanggil oleh tombol di HTML
function toggleLanguage() {
    // Ambil elemen tombol berdasarkan ID-nya
    const langBtn = document.getElementById('lang-switch');

    // 3. Cek bahasa saat ini dan ubah ke bahasa lawannya
    if (currentLang === 'id') {
        currentLang = 'en'; // Ubah status ke English
        langBtn.innerHTML = '🌐 ID'; // Ubah teks tombol menjadi ID
        
        // Panggil fungsi untuk mengubah teks di halaman ke bahasa Inggris
        ubahTeksKeEnglish(); 
    } else {
        currentLang = 'id'; // Ubah status kembali ke Indonesia
        langBtn.innerHTML = '🌐 EN'; // Ubah teks tombol menjadi EN
        
        // Panggil fungsi untuk mengubah teks di halaman ke bahasa Indonesia
        ubahTeksKeIndonesia();
    }
}

// Catatan: Kamu perlu membuat fungsi ubahTeksKeEnglish() dan ubahTeksKeIndonesia() 
// untuk benar-benar menerjemahkan konten web-mu (seperti menu filter, dll).
/* ==========================================
   DOKUMENTASI: FITUR MULTIBAHASA (ID & EN)
========================================== */

// 1. Membuat "Kamus" untuk menyimpan teks terjemahan
const kamus = {
    id: {
        filterAll: "Semua",
        cartTitle: "Keranjang Belanja",
        checkoutText: "Pesan via WhatsApp",
        closeText: "Tutup"
    },
    en: {
        filterAll: "All",
        cartTitle: "Shopping Cart",
        checkoutText: "Order via WhatsApp",
        closeText: "Close"
    }
};

// 2. Fungsi untuk mengubah semua teks ke Bahasa Inggris
function ubahTeksKeEnglish() {
    // Cari elemen berdasarkan ID, lalu ubah teksnya (innerText) sesuai kamus bahasa Inggris
    document.getElementById('filter-all').innerText = kamus.en.filterAll;
    document.getElementById('cart-title').innerText = kamus.en.cartTitle;
    document.getElementById('checkout-text').innerText = kamus.en.checkoutText;
    document.getElementById('close-text').innerText = kamus.en.closeText;
}

// 3. Fungsi untuk mengubah semua teks kembali ke Bahasa Indonesia
function ubahTeksKeIndonesia() {
    // Cari elemen berdasarkan ID, lalu ubah teksnya sesuai kamus bahasa Indonesia
    document.getElementById('filter-all').innerText = kamus.id.filterAll;
    document.getElementById('cart-title').innerText = kamus.id.cartTitle;
    document.getElementById('checkout-text').innerText = kamus.id.checkoutText;
    document.getElementById('close-text').innerText = kamus.id.closeText;
}
