// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the cart page
    if (window.location.pathname.includes('cart.html')) {
        return; // Skip initialization for cart page
    }

    // Theme Management
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial theme based on system preference or saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Toggle theme
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Initialize Hero Slider
    initializeHeroSlider();

    // Update cart count
    updateCartCount();

    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
            const productId = parseInt(button.getAttribute('data-id'));
            
            // Add to cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            // Show notification
            showNotification('Product added to cart!');
        }
    });

    // Featured Products
    const featuredProducts = document.querySelector('.featured-products');
    if (featuredProducts) {
        const products = window.products || [];
        const featured = products.filter(product => product.rating >= 4.5).slice(0, 4);
        
        featuredProducts.innerHTML = featured.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price.toLocaleString('en-IN')}/kg</p>
                <div class="rating">
                    ${renderStars(product.rating)}
                </div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `).join('');
    }

    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // Here you would typically send the email to your server
            showNotification('Thank you for subscribing!', 'success');
            this.reset();
        });
    }

    // Countdown Timer
    const countdownTimer = document.querySelector('.countdown-timer');
    if (countdownTimer) {
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 12); // 12 hours from now
        
        function updateTimer() {
            const now = new Date();
            const diff = endTime - now;
            
            if (diff <= 0) {
                countdownTimer.innerHTML = 'Offer Expired!';
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            countdownTimer.innerHTML = `
                <span>${hours.toString().padStart(2, '0')}</span>:
                <span>${minutes.toString().padStart(2, '0')}</span>:
                <span>${seconds.toString().padStart(2, '0')}</span>
            `;
        }
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
        
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        }
    }

    // Quick View Modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-view') || e.target.closest('.quick-view')) {
            const button = e.target.classList.contains('quick-view') ? e.target : e.target.closest('.quick-view');
            const productId = parseInt(button.getAttribute('data-id'));
            const product = window.products.find(p => p.id === productId);
            
            if (product) {
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <div class="product-details">
                            <img src="${product.image}" alt="${product.name}">
                            <div class="details">
                                <h2>${product.name}</h2>
                                <p class="price">₹${product.price.toLocaleString('en-IN')}/kg</p>
                                <div class="rating">
                                    ${renderStars(product.rating)}
                                </div>
                                <p class="description">${product.description}</p>
                                <button class="add-to-cart" data-id="${product.id}">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                const closeModal = modal.querySelector('.close-modal');
                closeModal.addEventListener('click', () => {
                    modal.remove();
                });
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                    }
                });
            }
        }
    });

    // Wishlist functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('wishlist-btn') || e.target.closest('.wishlist-btn')) {
            const button = e.target.classList.contains('wishlist-btn') ? e.target : e.target.closest('.wishlist-btn');
            const productId = parseInt(button.getAttribute('data-id'));
            
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const index = wishlist.indexOf(productId);
            
            if (index === -1) {
                wishlist.push(productId);
                button.classList.add('active');
                showNotification('Added to wishlist!', 'success');
            } else {
                wishlist.splice(index, 1);
                button.classList.remove('active');
                showNotification('Removed from wishlist!', 'info');
            }
            
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    });
});

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return `
        ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
        ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

function initializeHeroSlider() {
    const heroSlider = document.querySelector('.hero-slider');
    if (!heroSlider) return; // Skip if hero slider doesn't exist

    const slides = heroSlider.querySelectorAll('.slide');
    const prevBtn = heroSlider.querySelector('.prev-slide');
    const nextBtn = heroSlider.querySelector('.next-slide');
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${100 * (i - index)}%)`;
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Auto slide
    setInterval(nextSlide, 5000);
    
    // Show initial slide
    showSlide(currentSlide);
} 