// Initialize blockchain connection
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthState();
});

// Check if user is already authenticated
function checkAuthState() {
    if (api.isAuthenticated()) {
        // If user is already authenticated, redirect to orders page
        window.location.href = 'pages/orders.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    const signInTab = document.getElementById('signin-tab');
    const registerTab = document.getElementById('register-tab');
    const signInForm = document.getElementById('signin-form');
    const registerForm = document.getElementById('register-form');

    if (signInTab && registerTab) {
        signInTab.addEventListener('click', () => {
            signInTab.classList.add('active');
            registerTab.classList.remove('active');
            signInForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            signInTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            signInForm.classList.add('hidden');
        });
    }

    // Form submissions
    const signInFormElement = document.getElementById('signin-form');
    const registerFormElement = document.getElementById('register-form');
    const walletSignInBtn = document.getElementById('wallet-signin');

    if (signInFormElement) {
        signInFormElement.addEventListener('submit', handleSignIn);
    }

    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
    }

    if (walletSignInBtn) {
        walletSignInBtn.addEventListener('click', handleWalletSignIn);
    }
}

// Handle email/password sign in
async function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await api.signIn(email, password);
        api.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = 'pages/orders.html';
    } catch (error) {
        showError('Invalid email or password');
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const userType = document.getElementById('user-type').value;

    try {
        const response = await api.register({
            name,
            email,
            password,
            userType
        });
        api.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = 'pages/orders.html';
    } catch (error) {
        showError('Registration failed. Please try again.');
    }
}

// Handle wallet sign in
async function handleWalletSignIn() {
    try {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const walletAddress = accounts[0];
        const response = await api.signIn(walletAddress, '', true); // Empty password for wallet sign-in
        api.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = 'pages/orders.html';
    } catch (error) {
        showError('Wallet sign-in failed: ' + error.message);
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}

// Authentication Module
class Auth {
    constructor() {
        this.baseUrl = '/api/auth';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            this.initializeFormValidation(loginForm);
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            this.initializeFormValidation(registerForm);
        }

        // Password reset form
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
            this.initializeFormValidation(resetForm);
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
            this.initializeFormValidation(forgotForm);
        }

        // Social login buttons
        const googleBtn = document.querySelector('.social-button.google');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleSocialLogin('google'));
        }

        const facebookBtn = document.querySelector('.social-button.facebook');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => this.handleSocialLogin('facebook'));
        }
    }

    initializeFormValidation(form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });
    }

    validateInput(input) {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        let isValid = true;
        let message = '';

        // Remove existing error state
        formGroup.classList.remove('error');

        // Email validation
        if (input.type === 'email') {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!input.value) {
                isValid = false;
                message = 'Email is required';
            } else if (!emailRegex.test(input.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (input.type === 'password') {
            if (!input.value) {
                isValid = false;
                message = 'Password is required';
            } else if (input.value.length < 8) {
                isValid = false;
                message = 'Password must be at least 8 characters long';
            }
        }

        // Name validation
        if (input.id === 'name') {
            if (!input.value) {
                isValid = false;
                message = 'Name is required';
            } else if (input.value.length < 2) {
                isValid = false;
                message = 'Name must be at least 2 characters long';
            }
        }

        // Show error if validation fails
        if (!isValid) {
            formGroup.classList.add('error');
            errorMessage.textContent = message;
        }

        return isValid;
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!this.validateForm(form)) {
            return;
        }

        const button = form.querySelector('.auth-button');
        button.classList.add('loading');

        try {
            const formData = new FormData(form);
            const data = {
                email: formData.get('email'),
                password: formData.get('password'),
                remember: formData.get('rememberMe') === 'on'
            };

            const response = await this.loginUser(data);
            
            if (response.success) {
                // Store token
                localStorage.setItem('token', response.token);
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                this.showError(form, response.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            this.showError(form, 'An error occurred. Please try again later.');
            console.error('Login error:', error);
        } finally {
            button.classList.remove('loading');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!this.validateForm(form)) {
            return;
        }

        const button = form.querySelector('.auth-button');
        button.classList.add('loading');

        try {
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            const response = await this.registerUser(data);
            
            if (response.success) {
                // Show success message and redirect to login
                this.showSuccess(form, 'Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                this.showError(form, response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            this.showError(form, 'An error occurred. Please try again later.');
            console.error('Registration error:', error);
        } finally {
            button.classList.remove('loading');
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!this.validateForm(form)) {
            return;
        }

        const button = form.querySelector('.auth-button');
        button.classList.add('loading');

        try {
            const formData = new FormData(form);
            const data = {
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                token: new URLSearchParams(window.location.search).get('token')
            };

            const response = await this.resetPassword(data);
            
            if (response.success) {
                this.showSuccess(form, 'Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                this.showError(form, response.message || 'Password reset failed. Please try again.');
            }
        } catch (error) {
            this.showError(form, 'An error occurred. Please try again later.');
            console.error('Password reset error:', error);
        } finally {
            button.classList.remove('loading');
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!this.validateForm(form)) {
            return;
        }

        const button = form.querySelector('.auth-button');
        button.classList.add('loading');

        try {
            const formData = new FormData(form);
            const data = {
                email: formData.get('email')
            };

            const response = await this.sendPasswordResetEmail(data);
            
            if (response.success) {
                this.showSuccess(form, 'Password reset link sent! Please check your email.');
            } else {
                this.showError(form, response.message || 'Failed to send reset link. Please try again.');
            }
        } catch (error) {
            this.showError(form, 'An error occurred. Please try again later.');
            console.error('Forgot password error:', error);
        } finally {
            button.classList.remove('loading');
        }
    }

    handleSocialLogin(provider) {
        // Implement social login logic here
        console.log(`Social login with ${provider}`);
    }

    showError(form, message) {
        const errorDiv = form.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            const div = document.createElement('div');
            div.className = 'form-error error-message';
            div.textContent = message;
            form.insertBefore(div, form.firstChild);
        }
    }

    showSuccess(form, message) {
        const successDiv = form.querySelector('.form-success');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        } else {
            const div = document.createElement('div');
            div.className = 'form-success success-message';
            div.textContent = message;
            form.insertBefore(div, form.firstChild);
        }
    }

    // API calls
    async loginUser(data) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            throw new Error('Login request failed');
        }
    }

    async registerUser(data) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            throw new Error('Registration request failed');
        }
    }

    async resetPassword(data) {
        try {
            const response = await fetch(`${this.baseUrl}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            throw new Error('Password reset request failed');
        }
    }

    async sendPasswordResetEmail(data) {
        try {
            const response = await fetch(`${this.baseUrl}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            throw new Error('Forgot password request failed');
        }
    }
}

// Initialize authentication
const auth = new Auth(); 