// js/admin.js - Admin Panel Functionality
import {
    auth,
    db,
    storage,
    collection,
    addDoc,
    getDocs,
    getDoc,
    query,
    where,
    collectionGroup,
    orderBy,
    limit,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    onSnapshot,
    onAuthStateChanged,
    signOut,
    ref,
    uploadBytes,
    getDownloadURL
} from './firebase.js?v=20260204';

// Global variables
let currentUser = null;
let currentSection = 'dashboard';
let ordersCache = [];
let userOrdersCache = [];
let guestOrdersCache = [];
let reviewsCache = [];
let ordersUnsubscribe = null;
let guestOrdersUnsubscribe = null;
let reviewsUnsubscribe = null;
let activeDateFilter = 'all';
let activeStatusFilter = 'all';
let searchQuery = '';
let reviewSearchQuery = '';
let reviewRatingFilter = 'all';
const productTitleCache = new Map();
const selectedOrderKeys = new Set();
let productsCache = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// Initialize Admin Panel
async function initializeAdmin() {
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // Check if user is admin
            const isAdmin = await checkAdminStatus(user.uid);
            if (isAdmin) {
                initializeDashboard();
            } else {
                showAlert('Access denied. Admin privileges required.', 'danger');
                window.location.href = 'admin-login.html';
            }
        } else {
            window.location.href = 'admin-login.html';
        }
    });

    // Setup event listeners
    setupEventListeners();
}

// Check if user is admin
async function checkAdminStatus(uid) {
    try {
        const adminDoc = await getDoc(doc(db, 'admins', uid));
        return adminDoc.exists();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            showSection(section);
        });
    });

    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Category form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }

    // Order filters (chips + status select)
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.currentTarget.getAttribute('data-filter');
            setDateFilter(filter);
        });
    });

    const statusFilterSelect = document.getElementById('statusFilterSelect');
    if (statusFilterSelect) {
        statusFilterSelect.addEventListener('change', (e) => {
            activeStatusFilter = e.target.value;
            renderOrdersTable();
        });
    }

    const orderSearchInput = document.getElementById('orderSearchInput');
    if (orderSearchInput) {
        orderSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            renderOrdersTable();
        });
    }

    const clearOrderFilters = document.getElementById('clearOrderFilters');
    if (clearOrderFilters) {
        clearOrderFilters.addEventListener('click', () => {
            resetOrderFilters();
        });
    }

    const ordersSelectAll = document.getElementById('ordersSelectAll');
    if (ordersSelectAll) {
        ordersSelectAll.addEventListener('change', (e) => {
            const shouldSelect = !!e.target.checked;
            const visibleRows = getFilteredOrders();
            visibleRows.forEach((order) => {
                const key = getOrderSelectionKey(order.userId, order.id, order.source || 'user');
                if (shouldSelect) {
                    selectedOrderKeys.add(key);
                } else {
                    selectedOrderKeys.delete(key);
                }
            });
            renderOrdersTable();
        });
    }

    const deleteSelectedOrdersBtn = document.getElementById('deleteSelectedOrders');
    if (deleteSelectedOrdersBtn) {
        deleteSelectedOrdersBtn.addEventListener('click', handleDeleteSelectedOrders);
    }

    const reviewSearchInput = document.getElementById('reviewSearchInput');
    if (reviewSearchInput) {
        reviewSearchInput.addEventListener('input', (e) => {
            reviewSearchQuery = e.target.value.trim().toLowerCase();
            renderReviewsTable();
        });
    }

    const reviewRatingSelect = document.getElementById('reviewRatingFilter');
    if (reviewRatingSelect) {
        reviewRatingSelect.addEventListener('change', (e) => {
            reviewRatingFilter = e.target.value;
            renderReviewsTable();
        });
    }

    const ordersBell = document.getElementById('ordersBell');
    if (ordersBell) {
        ordersBell.addEventListener('click', () => {
            openLatestNewOrder();
        });
    }

    // Image upload
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }

    // Load categories when product modal opens
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('show.bs.modal', loadCategoriesDropdown);
    }

    const exportProductsExcelBtn = document.getElementById('exportProductsExcel');
    if (exportProductsExcelBtn) {
        exportProductsExcelBtn.addEventListener('click', exportProductsToExcel);
    }

    const exportProductsPdfBtn = document.getElementById('exportProductsPdf');
    if (exportProductsPdfBtn) {
        exportProductsPdfBtn.addEventListener('click', exportProductsToPdf);
    }

    const bulkProductUploadForm = document.getElementById('bulkProductUploadForm');
    if (bulkProductUploadForm) {
        bulkProductUploadForm.addEventListener('submit', handleBulkProductUpload);
    }
}

// Initialize Dashboard
async function initializeDashboard() {
    // Migrate products from products.js to Firestore if needed
    await migrateProductsToFirestore();
    await refreshProductTitleCache();

    subscribeOrdersRealtime();
    subscribeReviewsRealtime();
    loadProducts();
    loadUsers();
    loadCategories();
    loadInventory();
}

// Show Section
function showSection(section) {
    // Update active nav link
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${section}Section`).classList.add('active');

    currentSection = section;

    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            renderOrdersTable();
            break;
        case 'reviews':
            renderReviewsTable();
            break;
        case 'users':
            loadUsers();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'inventory':
            loadInventory();
            break;
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

// Handle Logout
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('Error logging out. Please try again.', 'danger');
    }
}

// Show Alert
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 3000);
    }
}

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        updateOrderStats();
        renderRecentOrders();
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showAlert('Error loading dashboard statistics.', 'danger');
    }
}

// Load Recent Orders for Dashboard
function renderRecentOrders() {
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    if (!recentOrdersTable) return;

    const recentOrders = [...ordersCache]
        .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a))
        .slice(0, 5);

    recentOrdersTable.innerHTML = '';

    if (recentOrders.length === 0) {
        recentOrdersTable.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
        return;
    }

    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        const displayStatus = normalizeStatus(order.status);
        const statusClass = `status-${displayStatus}`;
        const statusText = formatStatus(displayStatus);
        const currencySymbol = order.currency === 'GBP' ? '£' : 'Rs.';

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.name || 'N/A'}</td>
            <td>${formatDate(order)}</td>
            <td>${currencySymbol}${order.total || 0}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="viewOrder('${order.userId}', '${order.id}', '${order.source || 'user'}')">View</button>
            </td>
        `;

        recentOrdersTable.appendChild(row);
    });
}

// Set up real-time listener for orders
function subscribeOrdersRealtime() {
    if (ordersUnsubscribe) {
        ordersUnsubscribe();
    }
    if (guestOrdersUnsubscribe) {
        guestOrdersUnsubscribe();
    }

    const ordersQuery = query(
        collectionGroup(db, 'orders'),
        orderBy('date', 'desc'),
        limit(300)
    );

    ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const incoming = [];
        let addedNewCount = 0;

        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                if (data && data.isNew) {
                    addedNewCount++;
                }
            }
        });

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const parent = docSnap.ref.parent.parent;
            incoming.push({
                id: docSnap.id,
                userId: parent ? parent.id : null,
                source: 'user',
                refPath: parent ? `users/${parent.id}/orders/${docSnap.id}` : null,
                ...data
            });
        });

        userOrdersCache = incoming;
        rebuildOrdersCache();

        if (addedNewCount > 0) {
            showNewOrderNotification(addedNewCount);
        }
    }, (error) => {
        console.error('Realtime orders listener error:', error);
        showAlert('Realtime orders listener failed. Check Firestore indexes.', 'danger');
    });

    const guestOrdersQuery = query(
        collection(db, 'guest_orders'),
        orderBy('date', 'desc'),
        limit(300)
    );

    guestOrdersUnsubscribe = onSnapshot(guestOrdersQuery, (snapshot) => {
        const incoming = [];
        let addedNewCount = 0;

        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                if (data && data.isNew) {
                    addedNewCount++;
                }
            }
        });

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            incoming.push({
                id: docSnap.id,
                userId: null,
                source: 'guest',
                refPath: `guest_orders/${docSnap.id}`,
                ...data
            });
        });

        guestOrdersCache = incoming;
        rebuildOrdersCache();

        if (addedNewCount > 0) {
            showNewOrderNotification(addedNewCount);
        }
    }, (error) => {
        console.error('Realtime guest orders listener error:', error);
        showAlert('Realtime guest orders listener failed. Check Firestore indexes.', 'danger');
    });
}

function rebuildOrdersCache() {
    ordersCache = [...userOrdersCache, ...guestOrdersCache]
        .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
    updateOrderStats();
    renderRecentOrders();
    renderOrdersTable();
    updateBellCount();
}

async function refreshProductTitleCache() {
    try {
        productTitleCache.clear();
        const productsSnapshot = await getDocs(collection(db, 'products'));
        productsSnapshot.forEach((docSnap) => {
            const product = docSnap.data() || {};
            const title = product.title || `Product ${docSnap.id}`;
            productTitleCache.set(String(docSnap.id), title);
            if (product.id !== undefined && product.id !== null) {
                productTitleCache.set(String(product.id), title);
            }
        });
    } catch (error) {
        console.error('Error building product title cache:', error);
    }
}

function subscribeReviewsRealtime() {
    if (reviewsUnsubscribe) {
        reviewsUnsubscribe();
    }

    const reviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('timestamp', 'desc'),
        limit(500)
    );

    reviewsUnsubscribe = onSnapshot(reviewsQuery, async (snapshot) => {
        if (productTitleCache.size === 0) {
            await refreshProductTitleCache();
        }

        reviewsCache = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
        }));

        if (currentSection === 'reviews') {
            renderReviewsTable();
        }
    }, (error) => {
        console.error('Realtime reviews listener error:', error);
        showAlert('Realtime reviews listener failed. Check Firestore rules/index.', 'danger');
    });
}

function getReviewTimestamp(review) {
    const ts = review?.timestamp;
    if (ts?.seconds) return ts.seconds * 1000;
    if (ts instanceof Date) return ts.getTime();
    return 0;
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

function resolveProductTitle(review) {
    const productId = String(review?.productId || '');
    if (!productId) return 'Unknown Product';
    return productTitleCache.get(productId) || `Product ID: ${productId}`;
}

function getFilteredReviews() {
    return reviewsCache.filter((review) => {
        const ratingValue = Number(review.rating || 0);
        if (reviewRatingFilter !== 'all' && ratingValue !== Number(reviewRatingFilter)) {
            return false;
        }

        if (!reviewSearchQuery) return true;

        const productTitle = resolveProductTitle(review).toLowerCase();
        const textBlob = [
            review.name,
            review.text,
            review.productId,
            productTitle
        ].filter(Boolean).join(' ').toLowerCase();

        return textBlob.includes(reviewSearchQuery);
    }).sort((a, b) => getReviewTimestamp(b) - getReviewTimestamp(a));
}

function renderReviewsTable() {
    const reviewsTable = document.getElementById('reviewsTable');
    if (!reviewsTable) return;

    const filteredReviews = getFilteredReviews();
    reviewsTable.innerHTML = '';

    if (filteredReviews.length === 0) {
        reviewsTable.innerHTML = '<tr><td colspan="5" class="text-center">No reviews found</td></tr>';
        return;
    }

    filteredReviews.forEach((review) => {
        const row = document.createElement('tr');
        const ratingValue = Math.max(0, Math.min(5, Number(review.rating || 0)));
        const stars = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
        const reviewText = String(review.text || '').trim();
        const reviewSnippet = reviewText.length > 140 ? `${reviewText.slice(0, 140)}...` : reviewText;
        const timestamp = getReviewTimestamp(review);
        const reviewDate = timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
        const productId = escapeHtml(review.productId || 'N/A');
        const productTitle = escapeHtml(resolveProductTitle(review));

        row.innerHTML = `
            <td>
                <div class="review-product-title">${productTitle}</div>
                <div class="muted-text">ID: ${productId}</div>
            </td>
            <td>${escapeHtml(review.name || 'Anonymous')}</td>
            <td>
                <span class="review-stars">${stars}</span>
                <span class="review-rating-value">(${ratingValue}/5)</span>
            </td>
            <td class="review-text-cell" title="${escapeHtml(reviewText)}">${escapeHtml(reviewSnippet || 'N/A')}</td>
            <td>${reviewDate}</td>
        `;

        reviewsTable.appendChild(row);
    });
}

// Show notification for new orders
function showNewOrderNotification(newOrderCount) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <strong>New Order${newOrderCount > 1 ? 's' : ''}!</strong> ${newOrderCount} new order${newOrderCount > 1 ? 's have' : ' has'} been placed.
        <button type="button" class="btn btn-sm btn-light ms-2" id="viewLatestOrder">View</button>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);

    const viewBtn = notification.querySelector('#viewLatestOrder');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            openLatestNewOrder();
            notification.remove();
        });
    }

    // Also show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order Received', {
            body: `${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} placed`,
            icon: 'images/roo7z-logo.png'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('New Order Received', {
                    body: `${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} placed`,
                    icon: 'images/roo7z-logo.png'
                });
            }
        });
    }
}

// Load Products
async function loadProducts() {
    try {
        const productsContainer = document.getElementById('productsTable');
        if (!productsContainer) return;

        const productsSnapshot = await getDocs(collection(db, 'products'));
        productsCache = [];

        if (productsSnapshot.empty) {
            productsContainer.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
            return;
        }

        productsContainer.innerHTML = '';
        productsSnapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            productsCache.push(product);
            const row = createProductRow(product);
            productsContainer.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading products</td></tr>';
    }
}

// Create Product Row
function createProductRow(product) {
    const row = document.createElement('tr');
    const productImage = product.img || product.imageUrl || (Array.isArray(product.images) ? product.images[0] : '') || 'images/placeholder.jpg';

    row.innerHTML = `
        <td><img src="${productImage}" alt="${product.title}" class="product-img" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td>${product.title || 'N/A'}</td>
        <td>${getCategoryName(product.category) || 'N/A'}</td>
        <td>£${product.priceGBP || 0}</td>
        <td>Rs.${product.pricePKR || 0}</td>
        <td>${product.stock || 0}</td>
        <td><span class="badge bg-${(product.stock || 0) > 0 ? 'success' : 'danger'}">${(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
        <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct('${product.id}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">Delete</button>
        </td>
    `;

    return row;
}

// Load Orders (compat wrapper)
function loadOrders(status = 'all') {
    if (status && status !== 'all') {
        activeStatusFilter = status;
    }
    renderOrdersTable();
}

function getProductsForExport() {
    return (productsCache || []).map((product, index) => ({
        'Sr #': index + 1,
        'Product ID': product.id || '',
        'Name': product.title || 'N/A',
        'Category': product.categoryName || product.category || 'N/A',
        'Price GBP': Number(product.priceGBP || 0),
        'Price PKR': Number(product.pricePKR || 0),
        'Stock': Number(product.stock || 0),
        'Status': Number(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'
    }));
}

function getExportFileStamp() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${y}${m}${d}_${hh}${mm}`;
}

function normalizeBulkKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');
}

function parseBulkNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function parseBulkList(value) {
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    return String(value || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
}

function getBulkValue(row, aliases) {
    if (!row || typeof row !== 'object') return '';
    const entries = Object.entries(row);
    for (const alias of aliases) {
        const wanted = normalizeBulkKey(alias);
        const found = entries.find(([key]) => normalizeBulkKey(key) === wanted);
        if (found) return found[1];
    }
    return '';
}

async function parseBulkProductsFile(file) {
    const name = String(file?.name || '').toLowerCase();

    if (name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.products)) return parsed.products;
        throw new Error('JSON must be an array or { products: [...] }.');
    }

    if (!window.XLSX) {
        throw new Error('Spreadsheet parser not loaded. Refresh and try again.');
    }

    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const sheet = workbook.Sheets[firstSheetName];
    return window.XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function buildProductFromBulkRow(rawRow, categoryMaps) {
    const row = rawRow && typeof rawRow === 'object' ? rawRow : {};
    const title = String(getBulkValue(row, ['title', 'name', 'producttitle']) || '').trim();
    if (!title) return null;

    const categoryRaw = String(getBulkValue(row, ['category', 'categoryname']) || '').trim();
    const categoryIdRaw = String(getBulkValue(row, ['categoryid']) || '').trim();
    const categoryId = categoryIdRaw || categoryMaps.nameToId.get(normalizeBulkKey(categoryRaw)) || '';
    const categoryName = categoryRaw || categoryMaps.idToName.get(categoryId) || '';

    const imageUrl = String(getBulkValue(row, ['img', 'image', 'imageurl', 'photo', 'photourl']) || '').trim();
    const imagesRaw = getBulkValue(row, ['images', 'gallery']);
    const images = parseBulkList(imagesRaw);
    const resolvedImage = imageUrl || images[0] || '';

    const isNewRaw = String(getBulkValue(row, ['isnew', 'new']) || '').trim().toLowerCase();
    const isNew = ['1', 'true', 'yes', 'y'].includes(isNewRaw);

    return {
        id: String(getBulkValue(row, ['id', 'productid']) || '').trim(),
        title,
        category: categoryName || categoryId,
        categoryId,
        categoryName,
        pricePKR: parseBulkNumber(getBulkValue(row, ['pricepkr', 'pkr', 'price'])),
        priceGBP: parseBulkNumber(getBulkValue(row, ['pricegbp', 'gbp'])),
        discount: parseBulkNumber(getBulkValue(row, ['discount', 'discountpercent'])),
        description: String(getBulkValue(row, ['description', 'desc']) || '').trim(),
        img: resolvedImage || 'images/placeholder.jpg',
        imageUrl: resolvedImage,
        images: images.length ? images : (resolvedImage ? [resolvedImage] : []),
        colors: parseBulkList(getBulkValue(row, ['colors', 'color'])),
        sizes: parseBulkList(getBulkValue(row, ['sizes', 'size'])),
        stock: parseBulkNumber(getBulkValue(row, ['stock', 'quantity']), 0),
        variants: parseBulkList(getBulkValue(row, ['variants', 'variant'])),
        isNew
    };
}

async function getCategoryMapsForBulk() {
    const nameToId = new Map();
    const idToName = new Map();
    const snap = await getDocs(collection(db, 'categories'));
    snap.forEach((entry) => {
        const data = entry.data() || {};
        const name = String(data.name || '').trim();
        if (name) nameToId.set(normalizeBulkKey(name), entry.id);
        idToName.set(entry.id, name || entry.id);
    });
    return { nameToId, idToName };
}

function setBulkUploadStatus(message, tone = 'muted') {
    const statusNode = document.getElementById('bulkUploadStatus');
    if (!statusNode) return;
    statusNode.className = `small mb-2 text-${tone}`;
    statusNode.textContent = message;
}

async function handleBulkProductUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById('bulkProductsFile');
    const skipDuplicates = document.getElementById('bulkSkipDuplicates')?.checked !== false;
    const submitBtn = document.getElementById('bulkUploadSubmitBtn');
    const file = fileInput?.files?.[0];

    if (!file) {
        setBulkUploadStatus('Please choose a file first.', 'danger');
        return;
    }

    submitBtn && (submitBtn.disabled = true);
    setBulkUploadStatus('Reading file...', 'muted');

    try {
        const rows = await parseBulkProductsFile(file);
        if (!rows.length) {
            setBulkUploadStatus('No rows found in the file.', 'warning');
            return;
        }

        setBulkUploadStatus('Preparing upload...', 'muted');
        const categoryMaps = await getCategoryMapsForBulk();
        const existingTitles = new Set(
            (productsCache || [])
                .map((p) => String(p?.title || '').trim().toLowerCase())
                .filter(Boolean)
        );

        let created = 0;
        let skipped = 0;
        let failed = 0;

        for (const rawRow of rows) {
            const productData = buildProductFromBulkRow(rawRow, categoryMaps);
            if (!productData) {
                skipped++;
                continue;
            }

            const titleKey = productData.title.toLowerCase();
            if (skipDuplicates && existingTitles.has(titleKey)) {
                skipped++;
                continue;
            }

            try {
                const { id, ...payload } = productData;
                const docPayload = {
                    ...payload,
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp()
                };

                if (id) {
                    await setDoc(doc(db, 'products', id), docPayload, { merge: true });
                } else {
                    await addDoc(collection(db, 'products'), docPayload);
                }
                existingTitles.add(titleKey);
                created++;
            } catch (rowError) {
                failed++;
                console.error('Bulk row upload failed:', rawRow, rowError);
            }
        }

        const resultMessage = `Bulk upload completed. Added/updated: ${created}, skipped: ${skipped}, failed: ${failed}.`;
        setBulkUploadStatus(resultMessage, failed ? 'warning' : 'success');
        showAlert(resultMessage, failed ? 'warning' : 'success');
        await loadProducts();
        await loadInventory();

        if (created > 0) {
            const modalElement = document.getElementById('bulkProductModal');
            if (modalElement && window.bootstrap?.Modal) {
                const instance = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
                instance.hide();
            }
            if (fileInput) fileInput.value = '';
        }
    } catch (error) {
        console.error('Bulk upload error:', error);
        const message = error?.message || 'Bulk upload failed.';
        setBulkUploadStatus(message, 'danger');
        showAlert(message, 'danger');
    } finally {
        submitBtn && (submitBtn.disabled = false);
    }
}

async function exportProductsToExcel() {
    try {
        if (!productsCache.length) {
            await loadProducts();
        }
        const rows = getProductsForExport();
        if (!rows.length) {
            showAlert('No products available to export.', 'info');
            return;
        }
        if (!window.XLSX) {
            showAlert('Excel export library not loaded.', 'danger');
            return;
        }
        const worksheet = window.XLSX.utils.json_to_sheet(rows);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        const fileName = `roo7z_products_${getExportFileStamp()}.xlsx`;
        window.XLSX.writeFile(workbook, fileName);
        showAlert('Products exported to Excel successfully.', 'success');
    } catch (error) {
        console.error('Error exporting products to Excel:', error);
        showAlert('Failed to export Excel file.', 'danger');
    }
}

async function exportProductsToPdf() {
    try {
        if (!productsCache.length) {
            await loadProducts();
        }
        const rows = getProductsForExport();
        if (!rows.length) {
            showAlert('No products available to export.', 'info');
            return;
        }
        const jsPdfCtor = window.jspdf?.jsPDF;
        if (!jsPdfCtor || typeof jsPdfCtor !== 'function') {
            showAlert('PDF export library not loaded.', 'danger');
            return;
        }

        const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const generatedAt = new Date().toLocaleString();
        doc.setFontSize(14);
        doc.text('Roo7z Products Report', 40, 35);
        doc.setFontSize(10);
        doc.text(`Generated: ${generatedAt}`, 40, 52);

        const tableColumns = ['Sr #', 'Name', 'Category', 'Price GBP', 'Price PKR', 'Stock', 'Status'];
        const tableRows = rows.map((row) => ([
            row['Sr #'],
            row['Name'],
            row['Category'],
            row['Price GBP'],
            row['Price PKR'],
            row['Stock'],
            row['Status']
        ]));

        doc.autoTable({
            startY: 68,
            head: [tableColumns],
            body: tableRows,
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [22, 79, 67] }
        });

        const fileName = `roo7z_products_${getExportFileStamp()}.pdf`;
        doc.save(fileName);
        showAlert('Products exported to PDF successfully.', 'success');
    } catch (error) {
        console.error('Error exporting products to PDF:', error);
        showAlert('Failed to export PDF file.', 'danger');
    }
}

function normalizeStatus(status) {
    if (!status) return 'new';
    if (status === 'pending') return 'new';
    if (status === 'paid') return 'processing';
    return status;
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function isOrderNew(order) {
    return order && order.isNew === true;
}

function getOrderTimestamp(order) {
    const dateField = order.date || order.createdAt || order.updatedAt;
    if (dateField && dateField.seconds) {
        return dateField.seconds * 1000;
    }
    if (dateField instanceof Date) {
        return dateField.getTime();
    }
    return 0;
}

function formatDate(order) {
    const ts = getOrderTimestamp(order);
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleDateString();
}

function setDateFilter(filter) {
    activeDateFilter = filter || 'all';
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === activeDateFilter);
    });
    renderOrdersTable();
}

function resetOrderFilters() {
    activeDateFilter = 'all';
    activeStatusFilter = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('orderSearchInput');
    if (searchInput) searchInput.value = '';
    const statusSelect = document.getElementById('statusFilterSelect');
    if (statusSelect) statusSelect.value = 'all';
    setDateFilter('all');
    renderOrdersTable();
}

function getFilteredOrders() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return ordersCache.filter(order => {
        const normalizedStatus = normalizeStatus(order.status);
        const orderDate = new Date(getOrderTimestamp(order) || 0);
        const matchesSearch = !searchQuery || [
            order.id,
            order.name,
            order.phone,
            order.email,
            ...(Array.isArray(order.items) ? order.items.map(item => item.title) : [])
        ].filter(Boolean).some(value => String(value).toLowerCase().includes(searchQuery));

        if (!matchesSearch) return false;

        if (activeStatusFilter !== 'all' && normalizedStatus !== activeStatusFilter) {
            return false;
        }

        if (activeDateFilter === 'new' && !isOrderNew(order)) return false;
        if (activeDateFilter === 'today' && orderDate < startOfToday) return false;
        if (activeDateFilter === 'week' && orderDate < startOfWeek) return false;
        if (activeDateFilter === 'month' && orderDate < startOfMonth) return false;

        return true;
    }).sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
}

function updateOrderStats() {
    const totals = {
        total: ordersCache.length,
        new: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0
    };

    let totalRevenuePKR = 0;
    let totalRevenueGBP = 0;
    let todayRevenuePKR = 0;
    let todayRevenueGBP = 0;
    let monthRevenuePKR = 0;
    let monthRevenueGBP = 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    ordersCache.forEach(order => {
        const status = normalizeStatus(order.status);
        if (status === 'new') totals.new += 1;
        if (status === 'processing') totals.processing += 1;
        if (status === 'delivered') totals.delivered += 1;
        if (status === 'cancelled') totals.cancelled += 1;

        if (status === 'delivered') {
            const total = Number(order.total || 0);
            const ts = getOrderTimestamp(order);
            const orderDate = new Date(ts || 0);
            const isPKR = order.currency !== 'GBP';

            if (isPKR) {
                totalRevenuePKR += total;
                if (orderDate >= startOfToday) todayRevenuePKR += total;
                if (orderDate >= startOfMonth) monthRevenuePKR += total;
            } else {
                totalRevenueGBP += total;
                if (orderDate >= startOfToday) todayRevenueGBP += total;
                if (orderDate >= startOfMonth) monthRevenueGBP += total;
            }
        }
    });

    const totalOrdersEl = document.getElementById('totalOrders');
    const newOrdersEl = document.getElementById('newOrders');
    const processingOrdersEl = document.getElementById('processingOrders');
    const deliveredOrdersEl = document.getElementById('deliveredOrders');
    const cancelledOrdersEl = document.getElementById('cancelledOrders');
    const todayRevenueEl = document.getElementById('todayRevenue');
    const monthRevenueEl = document.getElementById('monthRevenue');
    const totalRevenueEl = document.getElementById('totalRevenue');

    if (totalOrdersEl) totalOrdersEl.textContent = totals.total;
    if (newOrdersEl) newOrdersEl.textContent = totals.new;
    if (processingOrdersEl) processingOrdersEl.textContent = totals.processing;
    if (deliveredOrdersEl) deliveredOrdersEl.textContent = totals.delivered;
    if (cancelledOrdersEl) cancelledOrdersEl.textContent = totals.cancelled;

    if (todayRevenueEl) todayRevenueEl.textContent = formatRevenue(todayRevenuePKR, todayRevenueGBP);
    if (monthRevenueEl) monthRevenueEl.textContent = formatRevenue(monthRevenuePKR, monthRevenueGBP);
    if (totalRevenueEl) totalRevenueEl.textContent = formatRevenue(totalRevenuePKR, totalRevenueGBP);
}

function formatRevenue(pkr, gbp) {
    const parts = [];
    if (pkr > 0) parts.push(`Rs.${pkr.toFixed(0)}`);
    if (gbp > 0) parts.push(`£${gbp.toFixed(0)}`);
    return parts.length ? parts.join(' | ') : 'Rs.0';
}

function updateBellCount() {
    const bellCount = document.getElementById('ordersBellCount');
    if (!bellCount) return;
    const newCount = ordersCache.filter(order => isOrderNew(order)).length;
    bellCount.textContent = newCount;
    bellCount.style.display = newCount > 0 ? 'inline-flex' : 'none';
}

function openLatestNewOrder() {
    const latestNew = ordersCache
        .filter(order => isOrderNew(order))
        .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a))[0];
    if (latestNew) {
        showSection('orders');
        viewOrder(latestNew.userId, latestNew.id, latestNew.source || 'user');
    } else {
        showSection('orders');
    }
}

function renderOrdersTable() {
    const ordersContainer = document.getElementById('ordersTable');
    if (!ordersContainer) return;

    pruneInvalidSelectedOrders();
    ordersContainer.innerHTML = '';
    const filteredOrders = getFilteredOrders();

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
        updateOrdersSelectionUi(filteredOrders);
        return;
    }

    filteredOrders.forEach(order => {
        const row = createOrderRow(order);
        ordersContainer.appendChild(row);
    });

    ordersContainer.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const userId = e.currentTarget.getAttribute('data-user');
            const orderId = e.currentTarget.getAttribute('data-order');
            const source = e.currentTarget.getAttribute('data-source') || 'user';
            const nextStatus = e.currentTarget.value;
            if (orderId) {
                updateOrderStatus(userId, orderId, nextStatus, source);
            }
        });
    });

    ordersContainer.querySelectorAll('.order-select-input').forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
            const key = e.currentTarget.getAttribute('data-order-key');
            if (!key) return;
            if (e.currentTarget.checked) {
                selectedOrderKeys.add(key);
            } else {
                selectedOrderKeys.delete(key);
            }
            updateOrdersSelectionUi(filteredOrders);
        });
    });

    updateOrdersSelectionUi(filteredOrders);
}

// Create Order Row
function createOrderRow(order) {
    const row = document.createElement('tr');

    const displayStatus = normalizeStatus(order.status);
    const statusClass = `status-${displayStatus}`;
    const statusText = formatStatus(displayStatus);
    const isNew = isOrderNew(order);
    const currencySymbol = order.currency === 'GBP' ? '£' : 'Rs.';
    const items = Array.isArray(order.items) ? order.items : [];
    const orderKey = getOrderSelectionKey(order.userId, order.id, order.source || 'user');
    const isChecked = selectedOrderKeys.has(orderKey);
    const thumbnails = items.slice(0, 4).map(item => {
        const img = item.img || item.image || 'images/placeholder.jpg';
        return `<img src="${img}" alt="${item.title || 'Item'}" class="item-thumb">`;
    }).join('');
    const extraCount = items.length > 4 ? `<span class="item-more">+${items.length - 4}</span>` : '';
    const orderDate = formatDate(order);

    if (isNew) {
        row.classList.add('order-row', 'new-order');
    } else {
        row.classList.add('order-row');
    }

    row.innerHTML = `
        <td class="order-select-col">
            <input
                type="checkbox"
                class="order-select-input"
                data-order-key="${orderKey}"
                ${isChecked ? 'checked' : ''}
                aria-label="Select order ${order.id}">
        </td>
        <td>
            <div class="order-meta">
                <span class="order-id">${order.id}</span>
                ${isNew ? '<span class="new-badge">NEW</span>' : ''}
            </div>
        </td>
        <td>
            ${order.name || 'N/A'}
            <div class="muted-text">${order.phone || ''}</div>
            ${order.source === 'guest' ? '<span class="badge bg-secondary ms-2">Guest</span>' : ''}
        </td>
        <td>
            <div class="order-items">
                ${thumbnails || '<span class="muted-text">No items</span>'}
                ${extraCount}
            </div>
        </td>
        <td>${currencySymbol}${order.total || 0}</td>
        <td>
            <select class="status-select ${statusClass}" data-user="${order.userId}" data-order="${order.id}" data-source="${order.source || 'user'}">
                <option value="new" ${displayStatus === 'new' ? 'selected' : ''}>New</option>
                <option value="processing" ${displayStatus === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="shipped" ${displayStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${displayStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${displayStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
        </td>
        <td>${orderDate}</td>
        <td>
            <button class="action-btn btn-edit" onclick="viewOrder('${order.userId}', '${order.id}', '${order.source || 'user'}')">View</button>
            <button class="action-btn btn-delete" onclick="deleteOrder('${order.userId}', '${order.id}', '${order.source || 'user'}')">Delete</button>
        </td>
    `;

    return row;
}

function getOrderSelectionKey(userId, orderId, source = 'user') {
    return `${source}:${userId || ''}:${orderId || ''}`;
}

function findOrderByKey(orderKey) {
    return ordersCache.find((order) => getOrderSelectionKey(order.userId, order.id, order.source || 'user') === orderKey) || null;
}

function getOrderDocRef(userId, orderId, source = 'user') {
    return (source === 'guest' || !userId)
        ? doc(db, 'guest_orders', orderId)
        : doc(db, 'users', userId, 'orders', orderId);
}

function pruneInvalidSelectedOrders() {
    const validKeys = new Set(
        ordersCache.map((order) => getOrderSelectionKey(order.userId, order.id, order.source || 'user'))
    );
    [...selectedOrderKeys].forEach((key) => {
        if (!validKeys.has(key)) {
            selectedOrderKeys.delete(key);
        }
    });
}

function updateOrdersSelectionUi(filteredOrders = null) {
    const visibleOrders = Array.isArray(filteredOrders) ? filteredOrders : getFilteredOrders();
    const visibleKeys = visibleOrders.map((order) => getOrderSelectionKey(order.userId, order.id, order.source || 'user'));
    const selectedVisibleCount = visibleKeys.filter((key) => selectedOrderKeys.has(key)).length;

    const selectAll = document.getElementById('ordersSelectAll');
    if (selectAll) {
        if (visibleKeys.length === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            selectAll.disabled = true;
        } else {
            selectAll.disabled = false;
            selectAll.checked = selectedVisibleCount === visibleKeys.length;
            selectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleKeys.length;
        }
    }

    const deleteSelectedBtn = document.getElementById('deleteSelectedOrders');
    if (deleteSelectedBtn) {
        const selectedCount = selectedOrderKeys.size;
        deleteSelectedBtn.disabled = selectedCount === 0;
        deleteSelectedBtn.textContent = `Delete Selected (${selectedCount})`;
    }
}

async function handleDeleteSelectedOrders() {
    pruneInvalidSelectedOrders();
    const selectedKeys = [...selectedOrderKeys];
    if (selectedKeys.length === 0) {
        showAlert('Please select at least one order to delete.', 'info');
        return;
    }

    const confirmed = confirm(`Delete ${selectedKeys.length} selected order(s)? This action cannot be undone.`);
    if (!confirmed) return;

    let deletedCount = 0;
    let failedCount = 0;

    for (const key of selectedKeys) {
        const order = findOrderByKey(key);
        if (!order) {
            selectedOrderKeys.delete(key);
            continue;
        }
        try {
            await deleteDoc(getOrderDocRef(order.userId, order.id, order.source || 'user'));
            selectedOrderKeys.delete(key);
            deletedCount++;
        } catch (error) {
            failedCount++;
            console.error('Error deleting order:', order.id, error);
        }
    }

    if (deletedCount > 0) {
        showAlert(`${deletedCount} order(s) deleted successfully.`, 'success');
    }
    if (failedCount > 0) {
        showAlert(`${failedCount} order(s) could not be deleted.`, 'danger');
    }
    renderOrdersTable();
}

// Load Users
async function loadUsers() {
    try {
        const usersContainer = document.getElementById('usersTable');
        if (!usersContainer) return;

        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersContainer.innerHTML = '';

        usersSnapshot.forEach(doc => {
            const user = { id: doc.id, ...doc.data() };
            const row = createUserRow(user);
            usersContainer.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users.', 'danger');
    }
}

// Create User Row
function createUserRow(user) {
    const row = document.createElement('tr');

    const statusClass = user.blocked ? 'status-blocked' : 'status-active';
    const statusText = user.blocked ? 'Blocked' : 'Active';

    row.innerHTML = `
        <td><div class="user-avatar">${(user.username || user.email || 'U')[0].toUpperCase()}</div></td>
        <td>${user.email || 'N/A'}</td>
        <td>${user.username || 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
            <button class="action-btn ${user.blocked ? 'btn-toggle' : 'btn-block'}" onclick="toggleUserStatus('${user.id}', ${user.blocked || false})">
                ${user.blocked ? 'Activate' : 'Block'}
            </button>
        </td>
    `;

    return row;
}

// Load Categories
async function loadCategories() {
    try {
        const categoriesContainer = document.getElementById('categoriesTableBody');
        if (!categoriesContainer) return;

        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        categoriesContainer.innerHTML = '';

        categoriesSnapshot.forEach(doc => {
            const category = { id: doc.id, ...doc.data() };
            if (!category.deleted) {
                const row = createCategoryRow(category);
                categoriesContainer.appendChild(row);
            }
        });

        if (categoriesContainer.innerHTML === '') {
            categoriesContainer.innerHTML = '<tr><td colspan="4" class="text-center">No categories found</td></tr>';
        }

    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesContainer.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading categories</td></tr>';
    }
}

// Create Category Row
function createCategoryRow(category) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${category.name || 'N/A'}</td>
        <td>${category.description || 'N/A'}</td>
        <td>${category.productCount || 0}</td>
        <td>
            <button class="action-btn btn-edit" onclick="editCategory('${category.id}')">Edit</button>
            <button class="action-btn btn-delete" onclick="deleteCategory('${category.id}')">Delete</button>
        </td>
    `;

    return row;
}

// Get Category Name by ID
async function getCategoryName(categoryId) {
    if (!categoryId) return 'N/A';
    try {
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        if (categoryDoc.exists()) {
            return categoryDoc.data().name || 'N/A';
        }
        return 'N/A';
    } catch (error) {
        console.error('Error getting category name:', error);
        return 'N/A';
    }
}

// Add Default Categories
async function addDefaultCategories() {
    const defaultCategories = [
        { name: 'Pendants', description: 'Beautiful pendant jewelry collection' },
        { name: 'Rings', description: 'Elegant ring designs for every occasion' },
        { name: 'Bracelets', description: 'Stylish bracelet collection' },
        { name: 'Earrings', description: 'Trendy earrings for all styles' },
        { name: 'Oxidizing-jewels', description: 'Unique oxidized jewelry pieces' },
        { name: 'Sets', description: 'Complete jewelry sets' }
    ];

    try {
        for (const category of defaultCategories) {
            const categoryData = {
                ...category,
                productCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await addDoc(collection(db, 'categories'), categoryData);
        }
        showAlert('Default categories added successfully!', 'success');
    } catch (error) {
        console.error('Error adding default categories:', error);
        showAlert('Error adding default categories.', 'danger');
    }
}

// Sync products.js seed data to Firestore so code edits appear in dashboard too.
async function migrateProductsToFirestore() {
    try {
        const { allProducts } = await import('./products.js?v=20260404a');
        const jewelryProducts = Array.isArray(allProducts?.jewelery) ? allProducts.jewelery : [];
        const featureProducts = Array.isArray(allProducts?.features) ? allProducts.features : [];
        const seedProducts = [...jewelryProducts, ...featureProducts];

        if (seedProducts.length === 0) {
            console.log('No seed products found in products.js. Skipping migration.');
            return;
        }

        showAlert('Syncing products from code to database...', 'info');

        const existingSnapshot = await getDocs(collection(db, 'products'));
        const existingById = new Map();
        const existingByTitle = new Map();

        existingSnapshot.forEach((docSnap) => {
            const product = docSnap.data() || {};
            const normalizedExistingTitle = String(product?.title || '').toLowerCase().trim();
            const existingId = String(product?.id ?? '').trim();

            if (existingId) {
                existingById.set(existingId, { docId: docSnap.id, data: product });
            }
            if (normalizedExistingTitle) {
                existingByTitle.set(normalizedExistingTitle, { docId: docSnap.id, data: product });
            }
        });

        let createdCount = 0;
        let updatedCount = 0;

        for (const product of seedProducts) {
            if (!product || typeof product !== 'object') continue;

            const normalizedTitle = String(product?.title || '').toLowerCase().trim();
            const seedId = String(product?.id ?? '').trim();
            if (!normalizedTitle) continue;

            const existingMatch = (seedId && existingById.get(seedId)) || existingByTitle.get(normalizedTitle) || null;
            const hasExplicitStock = product?.stock !== undefined && product?.stock !== null && String(product.stock).trim() !== '';
            const existingStock = Number(existingMatch?.data?.stock);
            const resolvedStock = hasExplicitStock
                ? Number(product.stock)
                : (Number.isFinite(existingStock) ? existingStock : 10);

            const images = Array.isArray(product.images)
                ? product.images.filter((value) => typeof value === 'string' && value.trim())
                : [];
            const primaryImage = String(product.img || product.imageUrl || images[0] || '').trim();

            const productData = {
                title: String(product.title || '').trim(),
                category: product.category || '',
                categories: Array.isArray(product.categories) ? product.categories : [],
                pricePKR: Number(product.pricePKR) || 0,
                priceGBP: Number(product.priceGBP) || 0,
                discount: Number(product.discount) || 0,
                description: product.description || '',
                img: primaryImage,
                images: images.length ? images : (primaryImage ? [primaryImage] : []),
                colors: Array.isArray(product.colors) ? product.colors : [],
                sizes: Array.isArray(product.sizes) ? product.sizes : [],
                stock: Number.isFinite(resolvedStock) ? resolvedStock : 10,
                variants: Array.isArray(product.variants) ? product.variants : [],
                sets: Array.isArray(product.sets) ? product.sets : [],
                designs: Array.isArray(product.designs) ? product.designs : [],
                isNew: Boolean(product.isNew),
                deleted: false,
                source: 'products.js',
                seedSyncedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (seedId) {
                productData.id = product.id;
            } else if (existingMatch?.data?.id !== undefined) {
                productData.id = existingMatch.data.id;
            }

            if (existingMatch) {
                productData.createdAt = existingMatch.data?.createdAt || serverTimestamp();
                await setDoc(doc(db, 'products', existingMatch.docId), productData, { merge: true });
                updatedCount++;
            } else {
                productData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'products'), productData);
                createdCount++;
            }
        }

        const totalSynced = createdCount + updatedCount;
        showAlert(`${totalSynced} products synced (${updatedCount} updated, ${createdCount} created).`, 'success');
        console.log(`Seed sync complete. Updated: ${updatedCount}, Created: ${createdCount}`);

    } catch (error) {
        console.error('Error syncing products:', error);
        showAlert(`Error syncing products: ${error?.message || 'Unknown error'}`, 'danger');
    }
}

// Load Categories into Dropdown
async function loadCategoriesDropdown() {
    try {
        const categoryDropdown = document.getElementById('categorySelect');
        if (!categoryDropdown) return;

        const categoriesSnapshot = await getDocs(collection(db, 'categories'));

        // Keep the first "Select Category" option
        categoryDropdown.innerHTML = '<option value="">Select Category</option>';

        if (categoriesSnapshot.empty) {
            // If no categories, add default categories
            await addDefaultCategories();
            // Reload categories
            const newSnapshot = await getDocs(collection(db, 'categories'));
            newSnapshot.forEach(doc => {
                const category = { id: doc.id, ...doc.data() };
                if (!category.deleted) {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = category.name || doc.id;
                    categoryDropdown.appendChild(option);
                }
            });
        } else {
            // Add each category as an option
            categoriesSnapshot.forEach(doc => {
                const category = { id: doc.id, ...doc.data() };
                if (!category.deleted) {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = category.name || doc.id;
                    categoryDropdown.appendChild(option);
                }
            });
        }

    } catch (error) {
        console.error('Error loading categories dropdown:', error);
        showAlert('Error loading categories.', 'danger');
    }
}

// Load Inventory
async function loadInventory() {
    try {
        const inventoryContainer = document.getElementById('inventoryTable');
        if (!inventoryContainer) return;

        const productsSnapshot = await getDocs(collection(db, 'products'));
        inventoryContainer.innerHTML = '';

        productsSnapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            const row = createInventoryRow(product);
            inventoryContainer.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading inventory:', error);
        showAlert('Error loading inventory.', 'danger');
    }
}

// Create Inventory Row
function createInventoryRow(product) {
    const row = document.createElement('tr');
    const productImage = product.img || product.imageUrl || (Array.isArray(product.images) ? product.images[0] : '') || 'images/placeholder.jpg';

    const stockStatus = (product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock';
    const statusClass = (product.stock || 0) > 0 ? 'status-active' : 'status-blocked';

    row.innerHTML = `
        <td><img src="${productImage}" alt="${product.title}" class="product-img"></td>
        <td>${product.title}</td>
        <td>${product.variants ? product.variants.join(', ') : 'N/A'}</td>
        <td>${product.stock || 0}</td>
        <td><span class="status-badge ${statusClass}">${stockStatus}</span></td>
        <td>
            <button class="action-btn btn-edit" onclick="updateStock('${product.id}')">Update Stock</button>
        </td>
    `;

    return row;
}

// Filter Orders
function filterOrders(status) {
    activeStatusFilter = status || 'all';
    renderOrdersTable();
}

// Handle Product Submit
async function handleProductSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const categoryId = formData.get('category');
    const categorySelect = document.getElementById('categorySelect');
    const selectedOption = categorySelect
        ? categorySelect.querySelector(`option[value="${categoryId}"]`)
        : null;
    const categoryName = selectedOption ? selectedOption.textContent.trim() : '';
    const imageUrl = String(uploadedImageUrl || formData.get('imageUrl') || '').trim();
    const variantsInput = formData.get('variants')
        ? formData.get('variants').split(',').map(v => v.trim()).filter(Boolean)
        : [];
    const pinAfterPinned = variantsInput.some(v => String(v).toLowerCase() === 'afterpin');
    const cleanVariants = variantsInput.filter(v => String(v).toLowerCase() !== 'afterpin');

    const productData = {
        title: formData.get('title'),
        category: categoryName || categoryId,
        categoryId: categoryId || '',
        categoryName: categoryName || '',
        pricePKR: parseFloat(formData.get('pricePKR')) || 0,
        priceGBP: parseFloat(formData.get('priceGBP')) || 0,
        discount: parseFloat(formData.get('discount')) || 0,
        description: formData.get('description'),
        img: imageUrl || 'images/placeholder.jpg',
        imageUrl: imageUrl || '',
        colors: formData.get('colors') ? formData.get('colors').split(',').map(c => c.trim()) : [],
        sizes: formData.get('sizes') ? formData.get('sizes').split(',').map(s => s.trim()) : [],
        stock: parseInt(formData.get('stock')) || 0,
        variants: cleanVariants,
        pinAfterPinned,
        updatedAt: serverTimestamp()
    };

    try {
        const productId = formData.get('productId');
        if (productId) {
            // Update existing product
            await setDoc(doc(db, 'products', productId), productData, { merge: true });
            showAlert('Product updated successfully!', 'success');
        } else {
            // Add new product
            productData.isNew = true;
            productData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'products'), productData);
            showAlert('Product added successfully!', 'success');
        }

        // Reset form and reload products
        e.target.reset();
        uploadedImageUrl = null; // Reset uploaded image URL
        document.getElementById('productModal').querySelector('.btn-close').click();
        loadProducts();
        loadInventory();

    } catch (error) {
        console.error('Error saving product:', error);
        showAlert('Error saving product. Please try again.', 'danger');
    }
}

// Handle Category Submit
async function handleCategorySubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const categoryData = {
        name: formData.get('name'),
        description: formData.get('description'),
        productCount: 0,
        createdAt: serverTimestamp()
    };

    try {
        const categoryId = formData.get('categoryId');
        if (categoryId) {
            // Update existing category
            await setDoc(doc(db, 'categories', categoryId), categoryData, { merge: true });
            showAlert('Category updated successfully!', 'success');
        } else {
            // Add new category
            await addDoc(collection(db, 'categories'), categoryData);
            showAlert('Category added successfully!', 'success');
        }

        // Reset form and reload categories
        e.target.reset();
        document.getElementById('categoryModal').querySelector('.btn-close').click();
        loadCategories();

    } catch (error) {
        console.error('Error saving category:', error);
        showAlert('Error saving category. Please try again.', 'danger');
    }
}

// Global variable to store uploaded image URL
let uploadedImageUrl = null;

// Handle Image Upload
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showAlert('Please select a valid image file.', 'danger');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('Image file size must be less than 5MB.', 'danger');
            return;
        }

        try {
            showAlert('Uploading image...', 'info');

            // Create a unique filename
            const timestamp = Date.now();
            const fileName = `products/${timestamp}_${file.name}`;
            const storageRef = ref(storage, fileName);

            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Store the URL and update the input field
            uploadedImageUrl = downloadURL;
            const imageUrlInput = document.getElementById('imageUrl');
            if (imageUrlInput) {
                imageUrlInput.value = downloadURL;
            }

            showAlert('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('Error uploading image. Please try again.', 'danger');
        }
    }
}

// Global functions for onclick handlers
window.editProduct = async function(productId) {
    try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
            const product = productDoc.data();

            // Populate form
            const form = document.getElementById('productForm');
            form.productId.value = productId;
            form.title.value = product.title || '';
            form.category.value = product.category || '';
            form.pricePKR.value = product.pricePKR || '';
            form.priceGBP.value = product.priceGBP || '';
            form.discount.value = product.discount || '';
            form.description.value = product.description || '';
            form.imageUrl.value = product.img || product.imageUrl || (Array.isArray(product.images) ? product.images[0] : '') || '';
            form.colors.value = product.colors ? product.colors.join(', ') : '';
            form.sizes.value = product.sizes ? product.sizes.join(', ') : '';
            form.stock.value = product.stock || '';
            form.variants.value = product.variants ? product.variants.join(', ') : '';

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('productModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading product for edit:', error);
        showAlert('Error loading product details.', 'danger');
    }
};

window.deleteProduct = async function(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await setDoc(doc(db, 'products', productId), { deleted: true }, { merge: true });
            showAlert('Product deleted successfully!', 'success');
            loadProducts();
            loadInventory();
        } catch (error) {
            console.error('Error deleting product:', error);
            showAlert('Error deleting product.', 'danger');
        }
    }
};

window.viewOrder = async function(userId, orderId, source = 'user') {
    try {
        const orderRef = source === 'guest' || !userId
            ? doc(db, 'guest_orders', orderId)
            : doc(db, 'users', userId, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        if (orderDoc.exists()) {
            const order = { id: orderDoc.id, ...orderDoc.data() };
            await markOrderSeen(userId, orderId, source);
            // Show order details modal
            showOrderDetails(order);
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showAlert('Error loading order details.', 'danger');
    }
};

window.updateOrderStatus = async function(userId, orderId, status, source = 'user') {
    try {
        const orderRef = source === 'guest' || !userId
            ? doc(db, 'guest_orders', orderId)
            : doc(db, 'users', userId, 'orders', orderId);
        await setDoc(orderRef, {
            status: status,
            isNew: false,
            updatedAt: serverTimestamp()
        }, { merge: true });

        showAlert(`Order marked as ${status}!`, 'success');
        renderOrdersTable();
        updateOrderStats();
    } catch (error) {
        console.error('Error updating order status:', error);
        showAlert('Error updating order status.', 'danger');
    }
};

window.deleteOrder = async function(userId, orderId, source = 'user') {
    if (!orderId) return;

    const confirmed = confirm(`Delete order ${orderId}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
        await deleteDoc(getOrderDocRef(userId, orderId, source));
        selectedOrderKeys.delete(getOrderSelectionKey(userId, orderId, source));
        showAlert('Order deleted successfully.', 'success');
        renderOrdersTable();
    } catch (error) {
        console.error('Error deleting order:', error);
        showAlert('Error deleting order.', 'danger');
    }
};

async function markOrderSeen(userId, orderId, source = 'user') {
    if (!orderId) return;
    try {
        const orderRef = source === 'guest' || !userId
            ? doc(db, 'guest_orders', orderId)
            : doc(db, 'users', userId, 'orders', orderId);
        await setDoc(orderRef, {
            isNew: false,
            viewedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error marking order as seen:', error);
    }
}

window.toggleUserStatus = async function(userId, currentlyBlocked) {
    try {
        const newStatus = !currentlyBlocked;
        await setDoc(doc(db, 'users', userId), {
            blocked: newStatus,
            updatedAt: serverTimestamp()
        }, { merge: true });

        showAlert(`User ${newStatus ? 'blocked' : 'activated'} successfully!`, 'success');
        loadUsers();
    } catch (error) {
        console.error('Error updating user status:', error);
        showAlert('Error updating user status.', 'danger');
    }
};

window.editCategory = async function(categoryId) {
    try {
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        if (categoryDoc.exists()) {
            const category = categoryDoc.data();

            // Populate form
            const form = document.getElementById('categoryForm');
            form.categoryId.value = categoryId;
            form.name.value = category.name || '';
            form.description.value = category.description || '';

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading category for edit:', error);
        showAlert('Error loading category details.', 'danger');
    }
};

window.deleteCategory = async function(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            // Note: In a real app, you'd want to handle products in this category
            await setDoc(doc(db, 'categories', categoryId), { deleted: true }, { merge: true });
            showAlert('Category deleted successfully!', 'success');
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            showAlert('Error deleting category.', 'danger');
        }
    }
};

window.updateStock = async function(productId) {
    const newStock = prompt('Enter new stock level:');
    if (newStock !== null && !isNaN(newStock)) {
        try {
            await setDoc(doc(db, 'products', productId), {
                stock: parseInt(newStock),
                updatedAt: serverTimestamp()
            }, { merge: true });

            showAlert('Stock updated successfully!', 'success');
            loadInventory();
        } catch (error) {
            console.error('Error updating stock:', error);
            showAlert('Error updating stock.', 'danger');
        }
    }
};

// Show Order Details Modal
function showOrderDetails(order) {
    const currencySymbol = order.currency === 'GBP' ? '£' : 'Rs.';
    const isGBPOrder = order.currency === 'GBP';
    const displayStatus = normalizeStatus(order.status);
    const items = Array.isArray(order.items) ? order.items : [];
    const orderSubtotal = Number(order.subtotal || 0);
    const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0) || 1;
    const itemRows = items.map((item) => {
        const qty = Number(item.quantity || item.qty || 1);
        let unitPrice = isGBPOrder
            ? Number(item.priceGBP ?? item.unit_price ?? item.price ?? 0)
            : Number(item.pricePKR ?? item.unit_price ?? item.price ?? 0);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            if (Number.isFinite(Number(item.line_total)) && Number(item.line_total) > 0) {
                unitPrice = Number(item.line_total) / qty;
            } else if (orderSubtotal > 0) {
                unitPrice = orderSubtotal * (qty / totalQty) / qty;
            } else {
                unitPrice = 0;
            }
        }
        const lineTotal = unitPrice * qty;
        const variantMeta = [item.design, item.color, item.size].filter(Boolean).join(' | ');
        return `
            <tr>
                <td><img src="${item.img || item.image || 'images/placeholder.jpg'}" alt="${item.title || 'Item'}" class="product-img order-detail-img"></td>
                <td>${item.title || 'N/A'}${variantMeta ? `<div class="muted-text">${variantMeta}</div>` : ''}</td>
                <td>${qty}</td>
                <td>${currencySymbol}${unitPrice}</td>
                <td>${currencySymbol}${lineTotal}</td>
            </tr>
        `;
    }).join('');
    const modalContent = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Order Details - ${order.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Customer Information</h6>
                                <p><strong>Name:</strong> ${order.name || 'N/A'}</p>
                                <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
                                <p><strong>Address:</strong> ${order.address || 'N/A'}</p>
                                <p><strong>City:</strong> ${order.city || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Order Information</h6>
                                <p><strong>Status:</strong> <span class="status-badge status-${displayStatus}">${formatStatus(displayStatus)}</span></p>
                                <p><strong>Total:</strong> ${currencySymbol}${order.total || 0}</p>
                                <p><strong>Currency:</strong> ${order.currency || 'PKR'}</p>
                                <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
                                <p><strong>Date:</strong> ${order.date ? new Date(order.date.seconds * 1000).toLocaleString() : 'N/A'}</p>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h6>Items</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemRows || '<tr><td colspan="5">No items found</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalContent);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}
