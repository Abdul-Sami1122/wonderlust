function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    syncThemeSwitches(newTheme);
}

function syncThemeSwitches(theme) {
    const toggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile, .compact-switch');
    toggles.forEach(toggle => {
        toggle.checked = (theme === 'dark');
    });
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    syncThemeSwitches(savedTheme);
});