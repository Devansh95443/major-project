document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initializeTheme();
    initializeAuthTabs();
    initializeForms();
    initializeTables();
    initializeNotifications();
    initializeProfile();
    initializeSettings();
    initializeDashboard();
    initializeOrders();
    initializeSecurity();
    initializeSidebar();
    initializeTooltips();
    initializeAnimations();
    initializeLoadingStates();
    initializeScrollbars();

    // Check authentication state
    checkAuthState();
});

// Theme Management
function initializeTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = theme === 'dark';
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            showNotification('Theme updated successfully', 'success');
        });
    }
}

// Auth Tab Navigation
function initializeAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const sections = document.querySelectorAll('.auth-section');
    
    // Show login section by default
    const defaultTab = document.querySelector('.auth-tab[data-tab="login"]');
    const defaultSection = document.querySelector('.auth-section[data-tab="login"]');
    if (defaultTab && defaultSection) {
        defaultTab.classList.add('active');
        defaultSection.classList.add('active');
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and sections
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            tab.classList.add('active');
            const targetSection = document.querySelector(`.auth-section[data-tab="${targetTab}"]`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Form Handling
function initializeForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
            }
            
            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Validate form data
                if (!validateForm(data)) {
                    throw new Error('Please fill in all required fields correctly');
                }
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                showNotification('Form submitted successfully', 'success');
                form.reset();
                
                // If it's a registration form, switch to login tab
                if (form.id === 'registerForm') {
                    const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                    if (loginTab) loginTab.click();
                }
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                }
            }
        });
    });

    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });
}

// Form Validation
function validateForm(data) {
    for (const [key, value] of Object.entries(data)) {
        if (value.trim() === '' && !key.includes('optional')) {
            return false;
        }
        
        if (key === 'email' && !validateEmail(value)) {
            return false;
        }
        
        if (key === 'password' && !validatePassword(value)) {
            return false;
        }
    }
    return true;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Table Management
function initializeTables() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('click', () => {
                const id = row.dataset.id;
                if (id) {
                    // Handle row click
                    console.log('Row clicked:', id);
                }
            });
        });

        // Sort functionality
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.dataset.sort;
                const sortOrder = header.dataset.order === 'asc' ? 'desc' : 'asc';
                header.dataset.order = sortOrder;
                
                // Sort table rows
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                rows.sort((a, b) => {
                    const aValue = a.querySelector(`td[data-${sortKey}]`).textContent;
                    const bValue = b.querySelector(`td[data-${sortKey}]`).textContent;
                    
                    if (sortOrder === 'asc') {
                        return aValue.localeCompare(bValue);
                    } else {
                        return bValue.localeCompare(aValue);
                    }
                });
                
                tbody.innerHTML = '';
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    });
}

// Notification System
function initializeNotifications() {
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'success') {
    const container = document.querySelector('.notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    const close = document.createElement('span');
    close.className = 'notification-close';
    close.innerHTML = '&times;';
    close.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    notification.appendChild(icon);
    notification.appendChild(text);
    notification.appendChild(close);
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Profile Management
function initializeProfile() {
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        profileImage.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profileImage.style.backgroundImage = `url(${e.target.result})`;
                        showNotification('Profile image updated successfully', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }
}

// Settings Management
function initializeSettings() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const setting = this.dataset.setting;
            const value = this.checked;
            
            // Save setting
            localStorage.setItem(`setting_${setting}`, value);
            showNotification(`${setting} updated successfully`, 'success');
        });
    });
}

// Dashboard Management
function initializeDashboard() {
    // Initialize charts if any
    const charts = document.querySelectorAll('.chart');
    charts.forEach(chart => {
        // Add chart initialization code here
    });

    // Initialize stats
    const stats = document.querySelectorAll('.stat-card');
    stats.forEach(stat => {
        stat.addEventListener('click', () => {
            // Handle stat card click
        });
    });
}

// Orders Management
function initializeOrders() {
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const value = this.value;
            const orders = document.querySelectorAll('.order-item');
            
            orders.forEach(order => {
                if (value === 'all' || order.dataset.status === value) {
                    order.style.display = '';
                } else {
                    order.style.display = 'none';
                }
            });
        });
    }
}

// Security Management
function initializeSecurity() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    });
}

function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    const strength = calculatePasswordStrength(password);
    const colors = ['#ff4444', '#ffbb33', '#ffeb3b', '#00C851', '#007E33'];
    const texts = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    
    strengthBar.style.width = `${(strength + 1) * 20}%`;
    strengthBar.style.backgroundColor = colors[strength];
    strengthText.textContent = texts[strength];
    strengthText.style.color = colors[strength];
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength++; // Uppercase
    if (/[a-z]/.test(password)) strength++; // Lowercase
    if (/[0-9]/.test(password)) strength++; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Special characters
    
    // Normalize strength to 0-4 scale
    return Math.min(4, Math.floor(strength / 2));
}

// Sidebar Management
function initializeSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });
    }
}

// Tooltip Management
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', () => {
            const text = tooltip.dataset.tooltip;
            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'tooltip';
            tooltipElement.textContent = text;
            document.body.appendChild(tooltipElement);
            
            const rect = tooltip.getBoundingClientRect();
            tooltipElement.style.top = `${rect.top - tooltipElement.offsetHeight - 10}px`;
            tooltipElement.style.left = `${rect.left + (rect.width - tooltipElement.offsetWidth) / 2}px`;
            
            setTimeout(() => {
                tooltipElement.classList.add('show');
            }, 100);
            
            tooltip.addEventListener('mouseleave', () => {
                tooltipElement.classList.remove('show');
                setTimeout(() => {
                    tooltipElement.remove();
                }, 300);
            }, { once: true });
        });
    });
}

// Animation Management
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Loading State Management
function initializeLoadingStates() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        element.classList.add('loading');
    });
}

// Scrollbar Management
function initializeScrollbars() {
    const scrollableElements = document.querySelectorAll('.scrollable');
    scrollableElements.forEach(element => {
        element.addEventListener('scroll', () => {
            // Handle scroll events
        });
    });
}

// Authentication State
function checkAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // User is logged in
        document.querySelector('.auth-box').style.display = 'none';
        document.querySelector('.profile-section').style.display = 'block';
        loadUserProfile(currentUser);
    } else {
        // User is not logged in
        document.querySelector('.auth-box').style.display = 'block';
        document.querySelector('.profile-section').style.display = 'none';
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Event Handlers
document.addEventListener('click', function(e) {
    // Close dropdowns when clicking outside
    if (!e.target.matches('.dropdown-toggle')) {
        const dropdowns = document.querySelectorAll('.dropdown-content.show');
        dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
    }
});

// Window resize handler
window.addEventListener('resize', debounce(function() {
    // Handle responsive adjustments
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('is-mobile', isMobile);
}, 250));

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('#loginForm input[type="checkbox"]').checked;

    // Show loading state
    const submitBtn = event.target.querySelector('.btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.classList.add('hidden');
    btnLoading.classList.add('active');

    try {
        // Get saved user data
        const savedUserData = JSON.parse(localStorage.getItem('userData'));
        
        // Check if user exists and credentials match
        if (!savedUserData || savedUserData.email !== email || savedUserData.password !== password) {
            throw new Error('Invalid email or password');
        }

        // Store user data in session
        localStorage.setItem('currentUser', JSON.stringify(savedUserData));
        
        // Remember email if checkbox is checked
        if (rememberMe) {
            localStorage.setItem('rememberEmail', email);
        } else {
            localStorage.removeItem('rememberEmail');
        }

        // Show success message
        showNotification('Login successful!', 'success');
        
        // Redirect based on user type
        setTimeout(() => {
            if (savedUserData.userType === 'farmer') {
                window.location.href = 'farmer-dashboard.html';
            } else {
                window.location.href = 'customer-dashboard.html';
            }
        }, 1000);
    } catch (error) {
        showNotification(error.message || 'Login failed. Please try again.', 'error');
    } finally {
        // Reset button state
        btnText.classList.remove('hidden');
        btnLoading.classList.remove('active');
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const userType = document.getElementById('register-type').value;
    const phone = document.getElementById('register-phone')?.value.trim() || '';
    const address = document.getElementById('register-address')?.value.trim() || '';
    const termsAccepted = document.getElementById('register-terms').checked;

    // Show loading state
    const submitBtn = event.target.querySelector('.btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.classList.add('hidden');
    btnLoading.classList.add('active');

    // Validate form
    const validationErrors = validateRegistrationForm({
        name,
        email,
        password,
        confirmPassword,
        userType,
        phone,
        termsAccepted
    });

    if (validationErrors.length > 0) {
        showNotification(validationErrors.join('<br>'), 'error');
        btnText.classList.remove('hidden');
        btnLoading.classList.remove('active');
        return;
    }

    try {
        // Check if email already exists
        const existingUser = JSON.parse(localStorage.getItem('userData'));
        if (existingUser && existingUser.email === email) {
            throw new Error('Email already registered. Please use a different email or login.');
        }

        // Save user data to localStorage
        const userData = {
            name,
            email,
            password,
            userType,
            phone,
            address,
            createdAt: new Date().toISOString(),
            settings: {
                notifications: true,
                newsletter: true,
                emailVerified: false
            },
            profile: {
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                bio: '',
                location: address
            }
        };
        
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show success message
        showNotification('Registration successful! Please verify your email to continue.', 'success');
        
        // Send verification email (simulated)
        setTimeout(() => {
            // In a real app, you would send an actual verification email
            console.log('Verification email sent to:', email);
            
            // Switch to login form after 3 seconds
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            
            // Pre-fill email in login form
            document.getElementById('email').value = email;

    // Reset button state
    btnText.classList.remove('hidden');
    btnLoading.classList.remove('active');
        }, 3000);
    } catch (error) {
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
        btnText.classList.remove('hidden');
        btnLoading.classList.remove('active');
    }
}

// Validate registration form
function validateRegistrationForm(data) {
    const errors = [];

    // Name validation
    if (!data.name) {
        errors.push('Name is required');
    } else if (data.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (!data.email) {
        errors.push('Email is required');
    } else if (!isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!data.password) {
        errors.push('Password is required');
    } else {
        if (data.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(data.password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(data.password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(data.password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[^A-Za-z0-9]/.test(data.password)) {
            errors.push('Password must contain at least one special character');
        }
    }

    // Confirm password validation
    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }

    // User type validation
    if (!data.userType) {
        errors.push('Please select your user type');
    }

    // Phone validation (if provided)
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Please enter a valid phone number');
    }

    // Terms validation
    if (!data.termsAccepted) {
        errors.push('You must accept the Terms & Conditions to register');
    }

    return errors;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation helper
function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
}

// Handle forgot password form submission
async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.classList.add('hidden');
    btnLoading.classList.add('active');

    try {
        // Here you would typically call your API to send a password reset email
        showNotification('Password reset instructions have been sent to your email.', 'success');
    setTimeout(() => {
            document.querySelector('.tab-btn[data-tab="login"]').click();
        }, 2000);
    } catch (error) {
        showNotification('Failed to send reset instructions. Please try again.', 'error');
    } finally {
        // Reset button state
        btnText.classList.remove('hidden');
        btnLoading.classList.remove('active');
    }
}

// Load user profile data
function loadUserProfile(user) {
    // Update profile information
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-type').textContent = user.userType === 'farmer' ? 'Farmer' : 'Customer';
    document.getElementById('profile-join-date').textContent = new Date(user.createdAt).toLocaleDateString();

    // Update settings
    const notificationsToggle = document.getElementById('notifications');
    const newsletterToggle = document.getElementById('newsletter');
    
    if (notificationsToggle) {
        notificationsToggle.checked = user.settings?.notifications ?? true;
    }
    
    if (newsletterToggle) {
        newsletterToggle.checked = user.settings?.newsletter ?? true;
    }

    // Load user orders
    loadUserOrders(user.email);
}

// Load user orders
async function loadUserOrders(userId) {
    try {
        const orders = await api.getOrders(userId);
        renderOrders(orders);
    } catch (error) {
        showNotification('Failed to load orders. Please try again.', 'error');
    }
}

// Render orders in the UI
function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders found.</p>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: $${item.price}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <span class="order-total">Total: $${order.total}</span>
                <button class="btn-view-details" onclick="viewOrderDetails('${order.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Handle settings update
async function handleSettingsUpdate(event) {
    event.preventDefault();
    const notifications = document.getElementById('notifications').checked;
    const newsletter = document.getElementById('newsletter').checked;

    // Show loading state
    const submitBtn = event.target.querySelector('.btn-save');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.classList.add('hidden');
    btnLoading.classList.add('active');

    try {
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Update settings
        currentUser.settings = {
        notifications,
        newsletter
        };
        
        // Save updated user data
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        showNotification('Settings updated successfully', 'success');
    } catch (error) {
        showNotification('Failed to update settings. Please try again.', 'error');
    } finally {
        // Reset button state
        btnText.classList.remove('hidden');
        btnLoading.classList.remove('active');
    }
}

// Handle logout
function handleLogout() {
    // Clear session data
    localStorage.removeItem('currentUser');
    
    // Show success message
    showNotification('Logged out successfully', 'success');
    
    // Reload page to show login form
    setTimeout(() => {
    window.location.reload();
    }, 1000);
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    const strength = calculatePasswordStrength(password);
    const colors = ['#ff4444', '#ffbb33', '#ffeb3b', '#00C851', '#007E33'];
    const texts = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    
    strengthBar.style.width = `${(strength + 1) * 20}%`;
    strengthBar.style.backgroundColor = colors[strength];
    strengthText.textContent = texts[strength];
    strengthText.style.color = colors[strength];
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength++; // Uppercase
    if (/[a-z]/.test(password)) strength++; // Lowercase
    if (/[0-9]/.test(password)) strength++; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Special characters
    
    // Normalize strength to 0-4 scale
    return Math.min(4, Math.floor(strength / 2));
} 