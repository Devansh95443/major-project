// Import products data
const products = window.products || [];

// Log the array to debug
console.log("Products array:", products);

// Initialize with null, we'll set these after DOM is loaded
let productsContainer = null;
let categoryTitle = null;
let showingCount = null;
let sortSelect = null;
let filterCheckboxes = null;
let priceRange = null;
let minPrice = null;
let maxPrice = null;
let applyFiltersBtn = null;
let prevPageBtn = null;
let nextPageBtn = null;
let pageNumbers = null;

// State
let currentPage = 1;
const productsPerPage = 9; // Show all products
let filteredProducts = [...products];

// Get all unique categories from products
const allCategories = [...new Set(products.map(product => product.category))];
console.log("All available categories:", allCategories);

let currentFilters = {
    categories: allCategories, // Include all categories
    minPrice: 0,
    maxPrice: 10000, // High enough to include all products
    ratings: []
};

// Reset filters and show all products
function resetFilters() {
    // Reset all filters to default values
    currentFilters = {
        categories: allCategories,
        minPrice: 0,
        maxPrice: 10000,
        ratings: []
    };
    
    // Reset filtered products to show all products
    filteredProducts = [...products];
    
    // Reset page
    currentPage = 1;
    
    // Update UI
    renderProducts();
    updatePagination();
    
    console.log("Filters reset, showing all products:", filteredProducts.length);
}

// Initialize products
document.addEventListener('DOMContentLoaded', () => {
    // Log document ready
    console.log("Document ready in products.js");
    
    // Check if we are on the products page
    if (!window.location.pathname.includes('products.html')) {
        console.log("Not on products page, skipping initialization");
        return;
    }
    
    console.log("On products page, initializing");
    
    // Select DOM elements now that the document is loaded
    productsContainer = document.querySelector('.product-grid') || document.getElementById('products-container');
    categoryTitle = document.getElementById('category-title');
    showingCount = document.getElementById('showing-count');
    sortSelect = document.getElementById('sort-by');
    filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    priceRange = document.getElementById('price-range');
    minPrice = document.getElementById('min-price');
    maxPrice = document.getElementById('max-price');
    applyFiltersBtn = document.querySelector('.apply-filters');
    prevPageBtn = document.getElementById('prev-page');
    nextPageBtn = document.getElementById('next-page');
    pageNumbers = document.getElementById('page-numbers');
    
    console.log("Products container found:", productsContainer);
    
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    // Always show all products first
    resetFilters();

    if (category) {
        // Update title for the category but keep showing all products
        if (categoryTitle) {
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        }
        
        // Uncomment this line if you want to filter by category
        // filteredProducts = products.filter(product => product.category === category);
        // currentFilters.categories = [category];
    } else {
        if (categoryTitle) {
            categoryTitle.textContent = "All Products";
        }
    }

    // Initialize filters
    initializeFilters();
    
    // Render products
    renderProducts();
    updatePagination();
    
    // Debug info
    console.log("Products to display:", filteredProducts.length);
    console.log("Products per page:", productsPerPage);
    console.log("Current page:", currentPage);
    console.log("Active filters:", currentFilters);
    console.log("All product categories:", products.map(p => p.category));
    console.log("Filtered products details:", filteredProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        image: p.image
    })));
    
    // Add event listeners to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
            const productId = parseInt(button.getAttribute('data-id'));
            
            // Get current cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Remove any duplicate items by combining quantities
            const uniqueCart = [];
            cart.forEach(item => {
                const existingItem = uniqueCart.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    uniqueCart.push({...item});
                }
            });
            cart = uniqueCart;
            
            // Find existing item
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                // Add new item with quantity 1
                const product = products.find(p => p.id === productId);
                if (product) {
                    cart.push({
                        id: productId,
                        quantity: 1,
                        name: product.name,
                        price: product.price,
                        image: product.image
                    });
                }
            }
            
            // Save cart
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                // Get fresh cart data to ensure consistency
                const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
                const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;
                cartCount.style.display = totalItems > 0 ? 'block' : 'none';
                
                // Log for debugging
                console.log('Cart count update in products.js:', {
                    cartContents: currentCart,
                    totalItems: totalItems
                });
            }
            
            // Show notification
            showNotification('Product added to cart!');
        }
    });
});

// Filter Functions
function initializeFilters() {
    // Set up event listeners for filters
    if (filterCheckboxes && filterCheckboxes.length > 0) {
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleFilterChange);
        });
    }

    if (priceRange) {
        priceRange.addEventListener('input', () => {
            const value = priceRange.value;
            if (minPrice) minPrice.value = value;
            if (maxPrice) maxPrice.value = value;
            currentFilters.minPrice = parseInt(value);
            currentFilters.maxPrice = parseInt(value);
        });
    }

    if (minPrice) {
        minPrice.addEventListener('change', () => {
            currentFilters.minPrice = parseInt(minPrice.value) || 0;
            if (priceRange) priceRange.value = currentFilters.minPrice;
        });
    }

    if (maxPrice) {
        maxPrice.addEventListener('change', () => {
            currentFilters.maxPrice = parseInt(maxPrice.value) || 500;
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPrevPage);
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextPage);
    }
}

function handleFilterChange(e) {
    const category = e.target.value;
    if (e.target.checked) {
        if (!currentFilters.categories.includes(category)) {
            currentFilters.categories.push(category);
        }
    } else {
        currentFilters.categories = currentFilters.categories.filter(c => c !== category);
    }
}

function applyFilters() {
    filteredProducts = products.filter(product => {
        const matchesCategory = currentFilters.categories.includes(product.category);
        const matchesPrice = product.price >= currentFilters.minPrice && product.price <= currentFilters.maxPrice;
        const matchesRating = currentFilters.ratings.length === 0 || currentFilters.ratings.includes(Math.floor(product.rating));
        return matchesCategory && matchesPrice && matchesRating;
    });

    currentPage = 1;
    renderProducts();
    updatePagination();
}

// Sort Function
function handleSort() {
    if (!sortSelect) return;
    
    const sortValue = sortSelect.value;
    switch (sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
    renderProducts();
}

// Pagination Functions
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
        updatePagination();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
        updatePagination();
    }
}

function updatePagination() {
    // Check if pagination elements exist
    if (!pageNumbers) {
        console.error('Page numbers element not found');
        return;
    }

    if (!prevPageBtn || !nextPageBtn) {
        console.error('Pagination buttons not found');
        return;
    }

    // Calculate total pages
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    let pageNumbersHTML = '';
    
    // Generate page number spans
    for (let i = 1; i <= totalPages; i++) {
        pageNumbersHTML += `<span class="${i === currentPage ? 'active' : ''}">${i}</span>`;
    }
    
    // Update the page numbers HTML
    pageNumbers.innerHTML = pageNumbersHTML;
    
    // Add click event to page numbers
    const pageSpans = pageNumbers.querySelectorAll('span');
    if (pageSpans.length > 0) {
        pageSpans.forEach((span, index) => {
            span.addEventListener('click', () => {
                currentPage = index + 1;
                renderProducts();
                updatePagination();
            });
        });
    }

    // Update prev/next button states
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Render Functions
function renderProducts() {
    // Create products container if not found
    if (!productsContainer) {
        console.error('Products container not found, attempting to create one');
        
        // Try to find the direct container first
        const existingGrid = document.querySelector('.product-grid') || document.getElementById('products-container');
        if (existingGrid) {
            productsContainer = existingGrid;
            console.log('Found existing products container');
        } else {
            // Look for the parent container
            const productsContainerParent = document.querySelector('.products-container');
            
            if (productsContainerParent) {
                // Create a new product grid container
                const newGrid = document.createElement('div');
                newGrid.className = 'product-grid';
                newGrid.id = 'products-container';
                productsContainerParent.appendChild(newGrid);
                
                productsContainer = newGrid;
                console.log('Created new products container in products-container');
            } else {
                // Last resort - add to main
                const main = document.querySelector('main');
                if (main) {
                    const newGrid = document.createElement('div');
                    newGrid.className = 'product-grid';
                    newGrid.id = 'products-container';
                    main.appendChild(newGrid);
                    
                    productsContainer = newGrid;
                    console.log('Created emergency products container in main');
                } else {
                    console.error('Cannot create products container: no suitable parent found');
                    return;
                }
            }
        }
    }

    // Render products into container
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = filteredProducts.slice(start, end);
    
    console.log("Rendering products:", {
        start,
        end,
        productsToShow,
        containerElement: productsContainer
    });

    if (productsToShow.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }

    productsContainer.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="../${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='../images/farmease_logo.jpg'">
                <div class="product-badge">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-details">
                    <span class="product-price">₹${product.price.toLocaleString('en-IN')}/kg</span>
                    <span class="product-rating">
                        ${renderStars(product.rating)}
                    </span>
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `).join('');

    if (showingCount) {
        showingCount.textContent = filteredProducts.length;
    }
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Utility function for notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create icon element
    const icon = document.createElement('i');
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
    
    // Create message element
    const messageText = document.createElement('span');
    messageText.textContent = message;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-notification';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    
    // Assemble notification
    notification.appendChild(icon);
    notification.appendChild(messageText);
    notification.appendChild(closeButton);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Close button functionality
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
} 