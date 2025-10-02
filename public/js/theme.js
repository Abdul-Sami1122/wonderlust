function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            // Persist in localStorage
            localStorage.setItem('theme', newTheme);
            // Update checkbox state
            document.getElementById('theme-toggle').checked = newTheme === 'dark';
        }

        // Load saved theme on page load
        window.addEventListener('load', () => {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.getElementById('theme-toggle').checked = savedTheme === 'dark';
        });