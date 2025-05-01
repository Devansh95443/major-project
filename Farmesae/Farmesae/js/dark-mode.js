// Dark Mode Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Check for existing toggle buttons - look for either class
    const existingToggle = document.querySelector('.theme-toggle') || document.querySelector('.dark-mode-toggle');
    
    // Only create a toggle if none exists
    let toggleButton;
    if (!existingToggle) {
        toggleButton = document.createElement('button');
        toggleButton.className = 'dark-mode-toggle';
        toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
        document.body.appendChild(toggleButton);
    } else {
        toggleButton = existingToggle;
    }

    // Add click event listener to toggle button
    toggleButton.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const icon = this.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Dispatch theme change event for other components to listen to
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    });

    // Update icon based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const icon = toggleButton.querySelector('i');
    icon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
});