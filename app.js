
/* ==================================================
   VAMP — GALAXY STORE
   Main JavaScript
================================================== */

"use strict";

/* ---------- 1. КАТАЛОГ ТОВАРІВ ---------- */

const PRODUCTS = [
    {
        id: 1,
        name: "VAMP Galaxy",
        price: 449,
        oldPrice: 549,
        category: "galaxy",
        tag: "ХІТ ПРОДАЖІВ",
        symbol: "V",
        color: "#7628bb",
        description: "Космічний дизайн для великих ідей.",
        pages: 192,
        format: "A5",
        isNew: false
    },
    {
        id: 2,
        name: "VAMP Midnight",
        price: 399,
        oldPrice: null,
        category: "classic",
        tag: "БЕСТСЕЛЕР",
        symbol: "M",
        color: "#37254b",
        description: "Мінімалізм, який завжди в моді.",
        pages: 160,
        format: "A5",
        isNew: false
    },
    {
        id: 3,
        name: "VAMP Eclipse",
        price: 499,
        oldPrice: 599,
        category: "galaxy",
        tag: "−17%",
        symbol: "E",
        color: "#542069",
        description: "Глибокі відтінки та стильний дизайн.",
        pages: 224,
        format: "A5",
        isNew: true
    },
    {
        id: 4,
        name: "VAMP Lilac",
        price: 349,
        oldPrice: null,
        category: "minimal",
        tag: "NEW",
        symbol: "L",
        color: "#8655a7",
        description: "Лавандовий настрій на кожен день.",
        pages: 144,
        format: "A6",
        isNew: true
    },
    {
        id: 5,
        name: "VAMP Shadow",
        price: 429,
        oldPrice: null,
        category: "classic",
        tag: "",
        symbol: "S",
        color: "#24202c",
        description: "Стриманий чорний дизайн для твоїх планів.",
        pages: 192,
        format: "A5",
        isNew: false
    },
    {
        id: 6,
        name: "VAMP Nebula",
        price: 479,
        oldPrice: null,
        category: "galaxy",
        tag: "POPULAR",
        symbol: "N",
        color: "#6537a0",
        description: "Натхнення, яке не має меж.",
        pages: 200,
        format: "A5",
        isNew: true
    },
    {
        id: 7,
        name: "VAMP Moon",
        price: 329,
        oldPrice: null,
        category: "minimal",
        tag: "",
        symbol: "☾",
        color: "#604d7a",
        description: "Компактний блокнот для щоденних ідей.",
        pages: 128,
        format: "A6",
        isNew: false
    },
    {
        id: 8,
        name: "VAMP Universe",
        price: 599,
        oldPrice: null,
        category: "premium",
        tag: "PREMIUM",
        symbol: "U",
        color: "#47216d",
        description: "Особлива колекція для особливих задумів.",
        pages: 256,
        format: "A5",
        isNew: true
    }
];

/* ---------- 2. ЛОКАЛЬНЕ ЗБЕРЕЖЕННЯ ---------- */

const STORAGE_KEYS = {
    cart: "vamp_cart_v1",
    favorites: "vamp_favorites_v1"
};

function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        if (saved === null) {
            return fallback;
        }

        return JSON.parse(saved);
    } catch (error) {
        console.warn("Не вдалося прочитати збереження:", error);
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Не вдалося зберегти дані:", error);
    }
}

function normalizeCart(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(item =>
            item &&
            Number.isInteger(Number(item.id)) &&
            PRODUCTS.some(product => product.id === Number(item.id)) &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0
        )
        .map(item => ({
            id: Number(item.id),
            quantity: Math.min(99, Number(item.quantity))
        }));
}

function normalizeFavorites(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return [...new Set(
        value
            .map(Number)
            .filter(id => PRODUCTS.some(product => product.id === id))
    )];
}

let cart = normalizeCart(
    readStorage(STORAGE_KEYS.cart, [])
);

let favorites = normalizeFavorites(
    readStorage(STORAGE_KEYS.favorites, [])
);

function saveCart() {
    saveStorage(STORAGE_KEYS.cart, cart);
}

function saveFavorites() {
    saveStorage(STORAGE_KEYS.favorites, favorites);
}

/* ---------- 3. ДОПОМІЖНІ ФУНКЦІЇ ---------- */

function formatPrice(price) {
    return new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0
    }).format(price);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function getProduct(id) {
    return PRODUCTS.find(product => product.id === Number(id));
}

function getCartQuantity() {
    return cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}

function getCartTotal() {
    return cart.reduce((total, item) => {
        const product = getProduct(item.id);

        return total + (
            product ? product.price * item.quantity : 0
        );
    }, 0);
}

function persistAll() {
    saveCart();
    saveFavorites();
    updateCounters();
}

/* ---------- 4. СПОВІЩЕННЯ ---------- */

let toastTimer;

function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";

        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.hidden = false;

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.remove();
    }, 2800);
}

/* ---------- 5. ЛІЧИЛЬНИКИ ---------- */

function updateCounters() {
    const cartCount = document.getElementById("cartCount");
    const favoritesCount = document.getElementById("favoritesCount");

    if (cartCount) {
        cartCount.textContent = getCartQuantity();
    }

    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
}

/* ---------- 6. КАРТКИ ТОВАРІВ ---------- */

function createNotebookVisual(product, large = false) {
    return `
        <div
            class="${large ? "hero-notebook" : "notebook"}"
            style="--cover-color: ${escapeHTML(product.color)}"
            aria-label="${escapeHTML(product.name)}"
        >
            <div class="cover-symbol">
                ${escapeHTML(product.symbol)}
            </div>

            <div class="cover-name">V A M P</div>
        </div>
    `;
}

function createProductCard(product) {
    const isFavorite = favorites.includes(product.id);

    const tag = product.tag
        ? `
            <span class="product-tag">
                ${escapeHTML(product.tag)}
            </span>
        `
        : "";

    const oldPrice = product.oldPrice
        ? `
            <span class="product-old-price">
                ${formatPrice(product.oldPrice)}
            </span>
        `
        : "";

    return `
        <article class="product-card">

            <a
                href="product.html?id=${product.id}"
                class="product-visual"
                aria-label="Переглянути ${escapeHTML(product.name)}"
            >
                ${tag}

                ${createNotebookVisual(product)}

            </a>

            <button
                class="favorite-button ${isFavorite ? "saved" : ""}"
                data-favorite="${product.id}"
                aria-label="${isFavorite ? "Видалити з обраного" : "Додати в обране"}"
                aria-pressed="${isFavorite}"
                type="button"
            >
                ${isFavorite ? "♥" : "♡"}
            </button>

            <div class="product-info">

                <h3>
                    <a href="product.html?id=${product.id}">
                        ${escapeHTML(product.name)}
                    </a>
                </h3>

                <p>${escapeHTML(product.description)}</p>

                <div class="product-bottom">

                    <div class="product-price">
                        ${formatPrice(product.price)}
                        ${oldPrice}
                    </div>

                    <button
                        class="add-cart-button"
                        data-add-cart="${product.id}"
                        aria-label="Додати ${escapeHTML(product.name)} у кошик"
                        type="button"
                    >
                        +
                    </button>

                </div>

            </div>

        </article>
    `;
}

function renderProducts(containerId, products) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    if (!products.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1">
                <div class="big-icon">✧</div>
                <h2>Поки нічого немає</h2>
                <p>Спробуй обрати інші товари.</p>
                <a href="catalog.html" class="btn">
                    ПЕРЕЙТИ ДО КАТАЛОГУ
                </a>
            </div>
        `;

        return;
    }

    container.innerHTML = products
        .map(createProductCard)
        .join("");
}

/* ---------- 7. ДОДАВАННЯ В КОШИК ---------- */

function addToCart(id, quantity = 1) {
    const product = getProduct(id);

    if (!product) {
        showToast("Товар не знайдено.");
        return;
    }

    const amount = Math.max(
        1,
        Math.min(99, Math.floor(Number(quantity) || 1))
    );

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity = Math.min(
            99,
            existing.quantity + amount
        );
    } else {
        cart.push({
            id: product.id,
            quantity: amount
        });
    }

    saveCart();
    updateCounters();

    showToast(`${product.name} додано в кошик 💜`);

    document.dispatchEvent(
        new CustomEvent("vamp:cart-updated", {
            detail: {
                cart,
                total: getCartTotal()
            }
        })
    );
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== Number(id));

    saveCart();
    updateCounters();

    renderCartPage();

    document.dispatchEvent(
        new CustomEvent("vamp:cart-updated", {
            detail: {
                cart,
                total: getCartTotal()
            }
        })
    );
}

function changeCartQuantity(id, change) {
    const item = cart.find(item => item.id === Number(id));

    if (!item) {
        return;
    }

    item.quantity = Math.min(99, item.quantity + change);

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    saveCart();
    updateCounters();
    renderCartPage();

    document.dispatchEvent(
        new CustomEvent("vamp:cart-updated", {
            detail: {
                cart,
                total: getCartTotal()
            }
        })
    );
}

/* ---------- 8. ОБРАНЕ ---------- */

function toggleFavorite(id) {
    const product = getProduct(id);

    if (!product) {
        return;
    }

    if (favorites.includes(product.id)) {
        favorites = favorites.filter(
            favoriteId => favoriteId !== product.id
        );

        showToast("Видалено з обраного.");
    } else {
        favorites.push(product.id);

        showToast("Додано в обране 💜");
    }

    saveFavorites();
    updateCounters();

    refreshFavoriteButtons();

    document.dispatchEvent(
        new CustomEvent("vamp:favorites-updated", {
            detail: {
                favorites
            }
        })
    );
}

function refreshFavoriteButtons() {
    document.querySelectorAll("[data-favorite]").forEach(button => {
        const id = Number(button.dataset.favorite);
        const isFavorite = favorites.includes(id);

        button.classList.toggle("saved", isFavorite);

        button.textContent = isFavorite ? "♥" : "♡";

        button.setAttribute(
            "aria-pressed",
            String(isFavorite)
        );

        button.setAttribute(
            "aria-label",
            isFavorite
                ? "Видалити з обраного"
                : "Додати в обране"
        );
    });
}

/* ---------- 9. КОШИК НА СТОРІНЦІ ---------- */

function renderCartPage() {
    const container = document.getElementById("cartItems");

    if (!container) {
        return;
    }

    const totalElement = document.getElementById("cartTotal");
    const checkoutButton = document.getElementById("checkoutButton");

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="big-icon">♧</div>
                <h2>Твій кошик поки порожній</h2>
                <p>
                    Саме час знайти блокнот для нових ідей.
                </p>
                <a href="catalog.html" class="btn">
                    ОБРАТИ БЛОКНОТ ↗
                </a>
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = formatPrice(0);
        }

        if (checkoutButton) {
            checkoutButton.setAttribute("aria-disabled", "true");
            checkoutButton.classList.add("disabled");
        }

        return;
    }

    if (checkoutButton) {
        checkoutButton.removeAttribute("aria-disabled");
        checkoutButton.classList.remove("disabled");
    }

    container.innerHTML = cart.map(item => {
        const product = getProduct(item.id);

        if (!product) {
            return "";
        }

        return `
            <article class="cart-row">

                <a
                    href="product.html?id=${product.id}"
                    class="mini-cover"
                >
                    <span
                        class="cover-symbol"
                        style="color: ${escapeHTML(product.color)}"
                    >
                        ${escapeHTML(product.symbol)}
                    </span>
                </a>

                <div>
                    <h3>
                        <a href="product.html?id=${product.id}">
                            ${escapeHTML(product.name)}
                        </a>
                    </h3>

                    <p>${formatPrice(product.price)} / шт.</p>

                    <button
                        class="text-button"
                        data-remove-cart="${product.id}"
                        type="button"
                    >
                        Видалити
                    </button>
                </div>

                <div class="quantity-controls">

                    <button
                        data-quantity-id="${product.id}"
                        data-quantity-change="-1"
                        aria-label="Зменшити кількість"
                        type="button"
                    >−</button>

                    <span>${item.quantity}</span>

                    <button
                        data-quantity-id="${product.id}"
                        data-quantity-change="1"
                        aria-label="Збільшити кількість"
                        type="button"
                    >+</button>

                </div>

                <strong class="line-price">
                    ${formatPrice(product.price * item.quantity)}
                </strong>

            </article>
        `;
    }).join("");

    if (totalElement) {
        totalElement.textContent = formatPrice(getCartTotal());
    }
}

/* ---------- 10. СТОРІНКА ОКРЕМОГО ТОВАРУ ---------- */

function renderProductPage() {
    const container = document.getElementById("productDetails");

    if (!container) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const product = getProduct(params.get("id"));

    if (!product) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="big-icon">✧</div>
                <h2>Блокнот не знайдено</h2>
                <p>Можливо, посилання неправильне.</p>
                <a href="catalog.html" class="btn">
                    ДО КАТАЛОГУ
                </a>
            </div>
        `;

        return;
    }

    document.title = `${product.name} — VAMP`;

    const isFavorite = favorites.includes(product.id);

    container.innerHTML = `
        <div class="product-detail-layout">

            <div class="product-detail-visual product-visual">
                ${createNotebookVisual(product)}
            </div>

            <div class="product-detail-info">

                <span class="eyebrow">VAMP COLLECTION</span>

                <h1>${escapeHTML(product.name)}</h1>

                <p>${escapeHTML(product.description)}</p>

                <div class="product-price detail-price">
                    ${formatPrice(product.price)}
                </div>

                <div class="product-specs">
                    <div>
                        <span>Формат</span>
                        <strong>${escapeHTML(product.format)}</strong>
                    </div>

                    <div>
                        <span>Сторінок</span>
                        <strong>${product.pages}</strong>
                    </div>

                    <div>
                        <span>Колекція</span>
                        <strong>${escapeHTML(product.category)}</strong>
                    </div>
                </div>

                <div class="detail-actions">

                    <label for="productQuantity">
                        Кількість
                    </label>

                    <input
                        id="productQuantity"
                        type="number"
                        min="1"
                        max="99"
                        value="1"
                    >

                    <button
                        class="btn"
                        data-add-cart="${product.id}"
                        type="button"
                    >
                        ДОДАТИ В КОШИК
                    </button>

                    <button
                        class="btn btn-outline"
                        data-favorite="${product.id}"
                        aria-pressed="${isFavorite}"
                        type="button"
                    >
                        ${isFavorite ? "♥ В ОБРАНОМУ" : "♡ В ОБРАНЕ"}
                    </button>

                </div>

            </div>

        </div>
    `;

    refreshFavoriteButtons();
}

/* ---------- 11. КАТАЛОГ: ПОШУК І ФІЛЬТРИ ---------- */

function renderCatalogPage() {
    const container = document.getElementById("catalogProducts");

    if (!container) {
        return;
    }

    const searchInput = document.getElementById("catalogSearch");
    const categorySelect = document.getElementById("categoryFilter");
    const sortSelect = document.getElementById("sortFilter");
    const resultsCount = document.getElementById("resultsCount");

    const params = new URLSearchParams(window.location.search);

    if (categorySelect && params.has("category")) {
        categorySelect.value = params.get("category");
    }

    if (sortSelect && params.has("sort")) {
        sortSelect.value = params.get("sort");
    }

    function applyFilters() {
        const query = (searchInput?.value || "").trim().toLowerCase();
        const category = categorySelect?.value || "all";
        const sort = sortSelect?.value || "default";

        let filtered = PRODUCTS.filter(product => {
            const matchesQuery = [
                product.name,
                product.description,
                product.category
            ].some(value => value.toLowerCase().includes(query));

            const matchesCategory =
                category === "all" || product.category === category;

            const matchesFavorite =
                params.get("filter") !== "saved" ||
                favorites.includes(product.id);

            return (
                matchesQuery &&
                matchesCategory &&
                matchesFavorite
            );
        });

        if (sort === "price") {
            filtered.sort((a, b) => a.price - b.price);
        }

        if (sort === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        }

        if (sort === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name, "uk"));
        }

        if (sort === "new") {
            filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        }

        renderProducts("catalogProducts", filtered);

        if (resultsCount) {
            resultsCount.textContent =
                `Знайдено товарів: ${filtered.length}`;
        }
    }

    searchInput?.addEventListener("input", applyFilters);
    categorySelect?.addEventListener("change", applyFilters);
    sortSelect?.addEventListener("change", applyFilters);

    document.addEventListener("vamp:favorites-updated", applyFilters);

    applyFilters();
}

/* ---------- 12. ГОЛОВНА СТОРІНКА ---------- */

function renderHomePage() {
    renderProducts(
        "popularProducts",
        PRODUCTS.filter(product => [1, 2, 3, 6].includes(product.id))
    );

    renderProducts(
        "newProducts",
        PRODUCTS.filter(product => product.isNew)
    );
}

/* ---------- 13. КАРУСЕЛЬ ---------- */

const HERO_SLIDES = [
    {
        eyebrow: "VAMP NOTEBOOKS · YOUR UNIVERSE",
        title: "УНІВЕРСАЛЬНІ",
        highlight: "БЛОКНОТИ",
        description:
            "Створені для твоїх ідей, планів та натхнення. Стиль. Якість. Ти."
    },
    {
        eyebrow: "YOUR IDEAS. YOUR RULES.",
        title: "ТВОРИ",
        highlight: "БЕЗ МЕЖ",
        description:
            "Записуй плани, малюй ідеї та перетворюй натхнення на реальність."
    },
    {
        eyebrow: "FIND YOUR UNIVERSE",
        title: "ТВІЙ СТИЛЬ",
        highlight: "ТВІЙ VAMP",
        description:
            "Обери дизайн, який пасує саме тобі. Почни нову історію сьогодні."
    }
];

let currentSlide = 0;
let carouselTimer = null;

function showSlide(index) {
    currentSlide = (
        (index % HERO_SLIDES.length) + HERO_SLIDES.length
    ) % HERO_SLIDES.length;

    const slide = HERO_SLIDES[currentSlide];

    const eyebrow = document.querySelector(".hero-content .eyebrow");
    const title = document.getElementById("heroTitle");
    const description = document.getElementById("heroDescription");

    if (eyebrow) {
        eyebrow.textContent = slide.eyebrow;
    }

    if (title) {
        title.innerHTML = `
            ${escapeHTML(slide.title)}
            <span class="gradient-text">
                ${escapeHTML(slide.highlight)}
            </span>
        `;
    }

    if (description) {
        description.textContent = slide.description;
    }

    document.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentSlide);

        dot.setAttribute(
            "aria-pressed",
            String(i === currentSlide)
        );
    });
}

function startCarousel() {
    stopCarousel();

    carouselTimer = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5500);
}

function stopCarousel() {
    if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
    }
}

function initCarousel() {
    const hero = document.querySelector(".hero");

    if (!hero || !document.querySelector(".carousel-dot")) {
        return;
    }

    document.querySelectorAll(".carousel-dot").forEach(dot => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.slide));
            startCarousel();
        });
    });

    hero.addEventListener("mouseenter", stopCarousel);
    hero.addEventListener("mouseleave", startCarousel);

    showSlide(0);
    startCarousel();
}

/* ---------- 14. МОБІЛЬНЕ МЕНЮ ---------- */

function initMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navLinks");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");

        toggle.textContent = isOpen ? "✕" : "☰";

        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");

            toggle.textContent = "☰";
            toggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", event => {
        if (
            !nav.contains(event.target) &&
            !toggle.contains(event.target)
        ) {
            nav.classList.remove("open");

            toggle.textContent = "☰";
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}

/* ---------- 15. ПОШУК У ШАПЦІ ---------- */

function initGlobalSearch() {
    const toggle = document.getElementById("searchToggle");
    const box = document.getElementById("searchBox");
    const input = document.getElementById("globalSearch");

    if (!toggle || !box || !input) {
        return;
    }

    toggle.addEventListener("click", () => {
        box.hidden = !box.hidden;

        if (!box.hidden) {
            input.focus();
        }
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            const query = input.value.trim();

            window.location.href =
                `catalog.html?q=${encodeURIComponent(query)}`;
        }
    });
}

/* ---------- 16. ПІДПИСКА ---------- */

function initNewsletter() {
    const form = document.getElementById("newsletterForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const emailInput = document.getElementById("newsletterEmail");
        const email = emailInput?.value.trim() || "";

        if (!emailInput || !emailInput.checkValidity()) {
            emailInput?.reportValidity();
            return;
        }

        showToast(
            "Дякуємо! Демонстраційна форма прийняла твою адресу."
        );

        form.reset();

        /*
         * Для справжньої розсилки потрібно підключити
         * сервер або сервіс електронної пошти.
         * Зараз адреса нікуди не надсилається.
         */

        console.info("Демонстраційна підписка:", email);
    });
}

/* ---------- 17. ОБРОБКА КНОПОК ---------- */

function initGlobalActions() {
    document.addEventListener("click", event => {
        const addButton = event.target.closest("[data-add-cart]");

        if (addButton) {
            event.preventDefault();

            const quantityInput =
                document.getElementById("productQuantity");

            const quantity = quantityInput
                ? Number(quantityInput.value)
                : 1;

            addToCart(addButton.dataset.addCart, quantity);
            return;
        }

        const favoriteButton = event.target.closest("[data-favorite]");

        if (favoriteButton) {
            event.preventDefault();

            toggleFavorite(favoriteButton.dataset.favorite);

            return;
        }

        const removeButton = event.target.closest("[data-remove-cart]");

        if (removeButton) {
            event.preventDefault();

            removeFromCart(removeButton.dataset.removeCart);

            showToast("Товар видалено з кошика.");

            return;
        }

        const quantityButton =
            event.target.closest("[data-quantity-id]");

        if (quantityButton) {
            event.preventDefault();

            changeCartQuantity(
                quantityButton.dataset.quantityId,
                Number(quantityButton.dataset.quantityChange)
            );
        }
    });
}

/* ---------- 18. ПОЧАТКОВИЙ ЗАПУСК ---------- */

function initVamp() {
    updateCounters();

    renderHomePage();
    renderCatalogPage();
    renderCartPage();
    renderProductPage();

    initCarousel();
    initMobileMenu();
    initGlobalSearch();
    initNewsletter();
    initGlobalActions();

    console.log(
        "%c VAMP STORE ",
        "background:#7628bb;color:white;padding:8px;font-weight:bold"
    );

    console.log("VAMP успішно запущено.");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVamp);
} else {
    initVamp();
}
