document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuToggle && mobileMenuClose && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });

        function updateThemeIcon(theme) {
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Update Cart Count
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    // Initial cart count update
    updateCartCount();

    // Listen for cart updates from other pages
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            updateCartCount();
        }
    });

    // Search Functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const categorySelect = document.querySelector('.category-select select');

    if (searchInput && searchButton && categorySelect) {
        function performSearch() {
            const query = searchInput.value.trim();
            const category = categorySelect.value;
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}`;
            }
        }

        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Mobile Search
    const mobileSearchInput = document.querySelector('.mobile-search input');
    const mobileSearchButton = document.querySelector('.mobile-search button');

    if (mobileSearchInput && mobileSearchButton) {
        function performMobileSearch() {
            const query = mobileSearchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        }

        mobileSearchButton.addEventListener('click', performMobileSearch);
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performMobileSearch();
            }
        });
    }

    // Highlight Current Category
    const currentCategory = new URLSearchParams(window.location.search).get('category');
    if (currentCategory) {
        const categoryLinks = document.querySelectorAll('.category-nav a, .mobile-categories a');
        categoryLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentCategory)) {
                link.classList.add('active');
            }
        });
    }
}); 