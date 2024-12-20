// Load components
document.addEventListener('DOMContentLoaded', function() {
    // Load social media bar
    fetch('/components/social-media-bar.html')
        .then(response => response.text())
        .then(data => {
            // Insert the social media bar before the first script tag
            const firstScript = document.getElementsByTagName('script')[0];
            const div = document.createElement('div');
            div.innerHTML = data;
            document.body.insertBefore(div.firstElementChild, firstScript);
        })
        .catch(error => console.error('Error loading social media bar:', error));
});
