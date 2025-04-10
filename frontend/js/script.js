// Data Produk (Simulasi database)
let products = [];
async function fetchProductsFromServer() {
    try {
        const res = await fetch('/api/products');
        console.log('Response Status:', res.status);
        console.log('Response Status Text:', res.statusText);
        console.log('Response Headers:', res.headers);
        console.log('Response:', res);

        const json = await res.json(); // ✅ langsung ambil JSON-nya
        console.log('Response JSON:', json);

        products = json.data; // Ambil array produk dari response
        console.log('Produk dari server:', products);

        loadProducts();
        loadAdminProducts();
    } catch (err) {
        console.error('Gagal ambil data produk:', err);
    }
}


// DOM Elements
const productContainer = document.getElementById('product-container');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const closeModal = document.querySelector('.close-modal');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const adminLogin = document.getElementById('admin-login');
const adminPanel = document.getElementById('adminPanel');
const adminProductTable = document.getElementById('adminProductTable');
const productForm = document.getElementById('productForm');
const adminProductForm = document.getElementById('adminProductForm');
const addProductBtn = document.getElementById('addProductBtn');
const formSubmitBtn = document.getElementById('formSubmitBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const logoutBtn = document.getElementById('logoutBtn');
const formTitle = document.getElementById('formTitle');

// Hamburger Menu Toggle
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Load Products
function loadProducts() {
    productContainer.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p class="product-desc">${product.description}</p>
                <button class="order-btn" data-id="${product._id}">Pesan Sekarang</button>
            </div>
        `;
        productContainer.appendChild(productCard);
    });

    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id');
            const product = products.find(p => p._id === productId);
            document.getElementById('productId').value = productId;
            orderModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
}

// Close Modal
closeModal.addEventListener('click', () => {
    orderModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Order Form
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const size = document.getElementById('size').value;
    const address = document.getElementById('address').value;
    const quantity = document.getElementById('quantity').value;

    const product = products.find(p => p._id === productId);
    const totalPrice = product.price * quantity;

    const message = `Halo FashionStore, saya ingin memesan:\n\n` +
                   `*Nama Produk:* ${product.name}\n` +
                   `*Harga:* Rp ${product.price.toLocaleString('id-ID')}\n` +
                   `*Ukuran:* ${size}\n` +
                   `*Jumlah:* ${quantity}\n` +
                   `*Total Harga:* Rp ${totalPrice.toLocaleString('id-ID')}\n\n` +
                   `*Data Pemesan:*\n` +
                   `Nama: ${name}\n` +
                   `No. WhatsApp: ${phone}\n` +
                   `Alamat: ${address}\n\n` +
                   `Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6281234567890?text=${encodedMessage}`, '_blank');

    orderForm.reset();
    orderModal.style.display = 'none';
    document.body.style.overflow = 'auto';

    alert('Pesanan Anda telah berhasil dikirim! Silahkan lanjutkan pembayaran via WhatsApp.');
});

// Admin Login
adminLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    const password = prompt('Masukkan password admin:');
    if (password === 'admin123') {
        adminPanel.style.display = 'block';
        await fetchProductsFromServer(); 
        loadAdminProducts();
        window.scrollTo(0, 0);
    } else if (password !== null) {
        alert('Password salah!');
    }
});

// Load Admin Products
function loadAdminProducts() {
    adminProductTable.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover;"></td>
            <td>${product.name}</td>
            <td>Rp ${product.price.toLocaleString('id-ID')}</td>
            <td>${product.description}</td>
            <td>
                <button class="crud-btn edit-btn" data-id="${product._id}">Edit</button>
                <button class="crud-btn delete-btn" data-id="${product._id}">Hapus</button>
            </td>
        `;
        adminProductTable.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id'); 
            editProduct(productId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.getAttribute('data-id');
            if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

            try {
                const res = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE'
                });

                if (!res.ok) throw new Error('Gagal menghapus produk');
                alert('Produk berhasil dihapus');
                fetchProductsFromServer();
            } catch (error) {
                console.error(error);
                alert('Gagal menghapus produk: ' + error.message);
            }
        });
    });
}

// Add Product
addProductBtn.addEventListener('click', () => {
    productForm.style.display = 'block';
    adminProductForm.reset();
    document.getElementById('adminProductId').value = '';
    formTitle.textContent = 'Tambah Produk Baru';
    formSubmitBtn.textContent = 'Simpan';
});

// Cancel Form
cancelFormBtn.addEventListener('click', () => {
    productForm.style.display = 'none';
});

// Edit Product
function editProduct(id) {
    const product = products.find(p => p._id === id);

    if (product) {
        document.getElementById('adminProductId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('availableSizes').value = Array.isArray(product.sizes) ? product.sizes.join(',') : '';

        // Reset file input
        document.getElementById('productImage').value = '';

        // Preview gambar
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = product.image;
            imagePreview.style.display = 'block';
            imagePreview.setAttribute('data-image-url', product.image);
        }

        formTitle.textContent = 'Edit Produk';
        formSubmitBtn.textContent = 'Update';
        productForm.style.display = 'block';
        window.scrollTo(0, document.body.scrollHeight);
    } else {
        alert('Produk tidak ditemukan');
    }
}


// Handle Admin Form Submission
// Handle Admin Form Submission
adminProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('adminProductId').value;
    const name = document.getElementById('productName').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const sizes = document.getElementById('availableSizes').value;
    const fileInput = document.getElementById('productImage');
    const existingImageUrl = document.getElementById('imagePreview').getAttribute('data-image-url');

    let imageUrl = existingImageUrl;

    // Upload ke Cloudinary kalau ada file baru
    if (fileInput.files && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('upload_preset', 'ml_default'); // Ganti!

        try {
            const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dcza1lxj0/image/upload', {
                method: 'POST',
                body: formData
            });

            const cloudData = await cloudRes.json();
            imageUrl = cloudData.secure_url;
        } catch (err) {
            console.error('Gagal upload gambar ke Cloudinary:', err);
            alert('Gagal upload gambar!');
            return;
        }
    }

    // Kirim data produk ke backend
    try {
        const res = await fetch(id ? `/api/products/${id}` : '/api/products', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                price,
                description,
                sizes,
                image: imageUrl
            })
        });

        if (!res.ok) throw new Error('Gagal simpan produk');

        alert('Produk berhasil disimpan!');
        productForm.style.display = 'none';
        fetchProductsFromServer();
    } catch (err) {
        console.error(err);
        alert('Gagal menyimpan produk: ' + err.message);
    }
});





// Logout
logoutBtn.addEventListener('click', () => {
    adminPanel.style.display = 'none';
});

// Init
async function init() {
    await fetchProductsFromServer(); // Tunggu produk termuat dulu
    loadProducts();
    loadAdminProducts();
}

init();
