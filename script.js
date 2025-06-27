// Custom cursor implementation
document.addEventListener('DOMContentLoaded', function() {
    // Create custom cursor element
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'23\' viewBox=\'0 0 20 23\'%3E%3Cpolygon points=\'0,0 0,20 6,16 10,23 13,21 9,14 16,14\' fill=\'white\' stroke=\'black\' stroke-width=\'1\'/%3E%3C/svg%3E")';
    document.body.appendChild(cursor);

    // Update cursor position
    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', function() {
        cursor.style.opacity = '0';
    });

    // Show cursor when mouse enters window
    document.addEventListener('mouseenter', function() {
        cursor.style.opacity = '1';
    });

    // Handle touch devices
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
    }
});
