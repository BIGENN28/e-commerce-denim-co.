const STORAGE_KEY = "denimCoStoreV2";

const products = [
    {
        id: 1,
        name: "Classic Blue Denim Jacket",
        category: "Jacket",
        price: 249000,
        image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=800&auto=format&fit=crop",
        tag: "BEST SELLER"
    },
    {
        id: 2,
        name: "Vintage Wash Denim Shorts",
        category: "Shorts",
        price: 135000,
        image: "https://images.unsplash.com/photo-1583290878567-4f6c40e53a06?q=80&w=800&auto=format&fit=crop",
        tag: "CASUAL"
    },
    {
        id: 3,
        name: "Slim Fit Black Jeans",
        category: "Jeans",
        price: 210000,
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop",
        tag: "POPULAR"
    },
    {
        id: 4,
        name: "Distressed Light Blue Jeans",
        category: "Jeans",
        price: 275000,
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop",
        tag: "NEW ARRIVAL"
    },
    {
        id: 5,
        name: "Oversized Denim Shirt",
        category: "Shirt",
        price: 195000,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
        tag: "DAILY WEAR"
    },
    {
        id: 6,
        name: "Dark Indigo Denim Vest",
        category: "Vest",
        price: 180000,
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop",
        tag: "LIMITED"
    }
];

let state = loadState();
let toastTimer;

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && Array.isArray(saved.cart) && Array.isArray(saved.orders)) {
            return {
                cart: saved.cart,
                orders: saved.orders
            };
        }
    } catch (error) {
        console.warn("Data lokal tidak dapat dibaca:", error);
    }

    return {
        cart: [],
        orders: []
    };
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateCartCount();
}

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return entities[character];
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

function updateCartCount() {
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cartCount").textContent = count;
}

function showPage(pageId) {
    const target = document.getElementById(pageId);
    if (!target) return;

    document.querySelectorAll(".page").forEach((page) => {
        page.classList.toggle("active", page.id === pageId);
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === pageId);
    });

    document.getElementById("mainNav").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");

    if (pageId === "cart") renderCart();
    if (pageId === "checkout") renderCheckoutSummary();
    if (pageId === "orders") renderOrders();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function productCard(product) {
    return `
        <article class="product-card">
            <div class="product-image-wrap">
                <img class="product-image" src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy"
                     onerror="this.src='https://placehold.co/800x600/e5e9ee/64748b?text=Denim+%26+Co.'">
                <span class="product-tag">${escapeHTML(product.tag)}</span>
            </div>
            <div class="product-info">
                <span class="product-category">${escapeHTML(product.category)}</span>
                <h3>${escapeHTML(product.name)}</h3>
                <p class="product-price">${formatRupiah(product.price)}</p>
                <div class="product-actions">
                    <button class="button button-primary" data-add="${product.id}">Tambah ke keranjang</button>
                    <button class="button button-outline" data-buy="${product.id}">Beli</button>
                </div>
            </div>
        </article>
    `;
}

function renderFeatured() {
    document.getElementById("featuredProducts").innerHTML = products
        .slice(0, 3)
        .map(productCard)
        .join("");
}

function renderCatalog() {
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
    const category = document.getElementById("categoryFilter").value;
    const sort = document.getElementById("sortFilter").value;

    let filtered = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = category === "all" || product.category === category;
        return matchesSearch && matchesCategory;
    });

    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

    document.getElementById("resultCount").textContent = `${filtered.length} produk ditemukan`;

    document.getElementById("catalogProducts").innerHTML = filtered.length
        ? filtered.map(productCard).join("")
        : `<div class="empty-state">Produk tidak ditemukan. Coba kata kunci atau kategori lain.</div>`;
}

function addToCart(productId) {
    const product = products.find((item) => item.id === Number(productId));
    if (!product) return;

    const existing = state.cart.find((item) => item.productId === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({
            productId: product.id,
            quantity: 1
        });
    }

    saveState();
    showToast(`${product.name} ditambahkan ke keranjang.`);
}

function buyNow(productId) {
    addToCart(productId);
    showPage("checkout");
}

function changeQuantity(productId, change) {
    const item = state.cart.find((cartItem) => cartItem.productId === Number(productId));
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        state.cart = state.cart.filter((cartItem) => cartItem.productId !== Number(productId));
    }

    saveState();
    renderCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter((item) => item.productId !== Number(productId));
    saveState();
    renderCart();
    showToast("Produk dihapus dari keranjang.");
}

function getCartDetails() {
    return state.cart
        .map((cartItem) => {
            const product = products.find((item) => item.id === cartItem.productId);
            if (!product) return null;

            return {
                ...product,
                quantity: cartItem.quantity,
                subtotal: product.price * cartItem.quantity
            };
        })
        .filter(Boolean);
}

function getCartTotal() {
    return getCartDetails().reduce((total, item) => total + item.subtotal, 0);
}

function summaryMarkup(title, buttonText, buttonAction) {
    const items = getCartDetails();
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
    const total = getCartTotal();

    return `
        <h2>${title}</h2>
        <div class="summary-line"><span>Jumlah item</span><strong>${totalQuantity}</strong></div>
        <div class="summary-line"><span>Subtotal</span><strong>${formatRupiah(total)}</strong></div>
        <div class="summary-line"><span>Pengiriman</span><strong>Dihitung terpisah</strong></div>
        <div class="summary-total"><span>Total sementara</span><span>${formatRupiah(total)}</span></div>
        <button class="button button-primary" ${total === 0 ? "disabled" : ""} data-action="${buttonAction}">${buttonText}</button>
    `;
}

function renderCart() {
    const container = document.getElementById("cartItems");
    const items = getCartDetails();

    if (!items.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Keranjang masih kosong</h3>
                <p style="margin: 8px 0 18px;">Yuk, temukan produk favoritmu.</p>
                <button class="button button-primary" data-go="catalog">Lihat koleksi</button>
            </div>
        `;
    } else {
        container.innerHTML = items.map((item) => `
            <article class="cart-item">
                <img src="${item.image}" alt="${escapeHTML(item.name)}"
                     onerror="this.src='https://placehold.co/300x300/e5e9ee/64748b?text=Denim'">
                <div>
                    <h3>${escapeHTML(item.name)}</h3>
                    <p>${formatRupiah(item.price)}</p>
                    <div class="quantity-control">
                        <button type="button" data-quantity="${item.id}" data-change="-1" aria-label="Kurangi jumlah">−</button>
                        <strong>${item.quantity}</strong>
                        <button type="button" data-quantity="${item.id}" data-change="1" aria-label="Tambah jumlah">+</button>
                    </div>
                </div>
                <div>
                    <strong>${formatRupiah(item.subtotal)}</strong><br>
                    <button class="remove-button" type="button" data-remove="${item.id}">Hapus</button>
                </div>
            </article>
        `).join("");
    }

    document.getElementById("cartSummary").innerHTML = summaryMarkup(
        "Ringkasan belanja",
        "Lanjut checkout",
        "checkout"
    );
}

function renderCheckoutSummary() {
    const container = document.getElementById("checkoutSummary");
    const items = getCartDetails();

    container.innerHTML = `
        <h2>Ringkasan pesanan</h2>
        ${items.length ? items.map((item) => `
            <div class="summary-line">
                <span>${escapeHTML(item.name)} × ${item.quantity}</span>
                <strong>${formatRupiah(item.subtotal)}</strong>
            </div>
        `).join("") : `<p class="summary-line">Keranjang masih kosong.</p>`}
        <div class="summary-total"><span>Total sementara</span><span>${formatRupiah(getCartTotal())}</span></div>
        <button class="button button-outline button-full" type="button" data-go="cart">Kembali ke keranjang</button>
    `;
}

function createOrder(event) {
    event.preventDefault();

    if (!state.cart.length) {
        showToast("Keranjang masih kosong. Pilih produk terlebih dahulu.");
        showPage("catalog");
        return;
    }

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const order = {
        id: `DNM-${Date.now().toString().slice(-8)}`,
        date: new Date().toLocaleString("id-ID"),
        customer: {
            name: document.getElementById("customerName").value.trim(),
            phone: document.getElementById("customerPhone").value.trim(),
            email: document.getElementById("customerEmail").value.trim(),
            address: document.getElementById("customerAddress").value.trim(),
            city: document.getElementById("customerCity").value.trim()
        },
        payment: document.getElementById("paymentMethod").value,
        note: document.getElementById("orderNote").value.trim(),
        items: getCartDetails(),
        total: getCartTotal(),
        status: "Pesanan demo dibuat"
    };

    state.orders.unshift(order);
    state.cart = [];
    saveState();

    form.reset();
    renderOrders();
    showPage("orders");
    showToast(`Pesanan ${order.id} berhasil dibuat (simulasi).`);
}

function renderOrders() {
    const container = document.getElementById("orderHistory");

    if (!state.orders.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Belum ada pesanan</h3>
                <p style="margin: 8px 0 18px;">Pesanan yang kamu buat akan muncul di sini.</p>
                <button class="button button-primary" data-go="catalog">Mulai belanja</button>
            </div>
        `;
        return;
    }

    container.innerHTML = state.orders.map((order) => `
        <article class="order-card">
            <div class="order-card-header">
                <div>
                    <h3>${escapeHTML(order.id)}</h3>
                    <p>${escapeHTML(order.date)} · ${escapeHTML(order.payment)}</p>
                </div>
                <span class="order-status">${escapeHTML(order.status)}</span>
            </div>
            ${order.items.map((item) => `
                <div class="summary-line">
                    <span>${escapeHTML(item.name)} × ${item.quantity}</span>
                    <strong>${formatRupiah(item.subtotal)}</strong>
                </div>
            `).join("")}
            <div class="summary-total"><span>Total</span><span>${formatRupiah(order.total)}</span></div>
            <p>Penerima: ${escapeHTML(order.customer.name)} · ${escapeHTML(order.customer.city)}</p>
        </article>
    `).join("");
}

document.addEventListener("click", (event) => {
    const pageLink = event.target.closest("[data-page]");
    const goButton = event.target.closest("[data-go]");
    const addButton = event.target.closest("[data-add]");
    const buyButton = event.target.closest("[data-buy]");
    const quantityButton = event.target.closest("[data-quantity]");
    const removeButton = event.target.closest("[data-remove]");
    const actionButton = event.target.closest("[data-action]");

    if (pageLink) {
        event.preventDefault();
        showPage(pageLink.dataset.page);
    }

    if (goButton) showPage(goButton.dataset.go);
    if (addButton) addToCart(addButton.dataset.add);
    if (buyButton) buyNow(buyButton.dataset.buy);

    if (quantityButton) {
        changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.change));
    }

    if (removeButton) removeFromCart(removeButton.dataset.remove);

    if (actionButton && actionButton.dataset.action === "checkout") {
        if (!state.cart.length) {
            showToast("Keranjang masih kosong.");
            return;
        }
        showPage("checkout");
    }
});

document.getElementById("cartShortcut").addEventListener("click", () => showPage("cart"));

document.getElementById("menuToggle").addEventListener("click", () => {
    const nav = document.getElementById("mainNav");
    const isOpen = nav.classList.toggle("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", String(isOpen));
});

document.getElementById("searchInput").addEventListener("input", renderCatalog);
document.getElementById("categoryFilter").addEventListener("change", renderCatalog);
document.getElementById("sortFilter").addEventListener("change", renderCatalog);
document.getElementById("checkoutForm").addEventListener("submit", createOrder);

document.getElementById("currentYear").textContent = new Date().getFullYear();

renderFeatured();
renderCatalog();
updateCartCount();
