// Function to handle login form submission
function handleLogin(event) {
    event.preventDefault();
    const button = event.target.querySelector('.auth-button');
    button.classList.add('loading');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Simulate API call
    setTimeout(() => {
        // For demo purposes, we'll just store in localStorage
        // In a real app, this would be handled by a backend server
        const user = {
            email: email,
            name: email.split('@')[0], // Just for demo
            isLoggedIn: true
        };

        localStorage.setItem('user', JSON.stringify(user));
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        button.classList.remove('loading');
        // Fix path for redirection
        window.location.href = window.location.href.includes('/pages/') ? '../index.html' : 'index.html';
    }, 1500);

    return false;
}

// Function to handle signup form submission
function handleSignup(event) {
    event.preventDefault();
    const button = event.target.querySelector('.auth-button');
    button.classList.add('loading');

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        button.classList.remove('loading');
        return false;
    }

    // Simulate API call
    setTimeout(() => {
        // For demo purposes, we'll just store in localStorage
        // In a real app, this would be handled by a backend server
        const user = {
            name: fullName,
            email: email,
            isLoggedIn: true
        };

        localStorage.setItem('user', JSON.stringify(user));
        button.classList.remove('loading');
        // Fix path for redirection
        window.location.href = window.location.href.includes('/pages/') ? '../index.html' : 'index.html';
    }, 1500);

    return false;
}

// Function to toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Function to check authentication status
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.isLoggedIn) {
        // If we're on the login or signup page, redirect to home
        if (window.location.href.includes('/pages/login.html') || 
            window.location.href.includes('/pages/signup.html')) {
            window.location.href = '../index.html';
        }
        return true;
    }
    return false;
}

// Function to handle logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    // Fix path for redirection
    const loginPath = window.location.href.includes('/pages/') ? 'login.html' : 'pages/login.html';
    window.location.href = loginPath;
}

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Update UI based on auth status
function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const accountIcons = document.querySelectorAll('.account-icon');
    
    accountIcons.forEach(icon => {
        if (user && user.isLoggedIn) {
            icon.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${user.name}</span>
            `;
            icon.href = '#';
            icon.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        } else {
            icon.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Account</span>
            `;
            // Fix path for login
            icon.href = window.location.href.includes('/pages/') ? 'login.html' : 'pages/login.html';
            icon.onclick = null;
        }
    });
}

// Add error handling for localStorage
function isLocalStorageAvailable() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Initialize auth system
function initAuth() {
    if (!isLocalStorageAvailable()) {
        console.error('localStorage is not available. Authentication will not work properly.');
        return;
    }

    // Update auth UI when page loads
    updateAuthUI();

    // Add event listener for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'user') {
            updateAuthUI();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth); 