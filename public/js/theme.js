function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    // Persist in localStorage
    localStorage.setItem('theme', newTheme);
    // Update checkbox state if present
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.checked = (newTheme === 'dark');
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.checked = (savedTheme === 'dark');
});