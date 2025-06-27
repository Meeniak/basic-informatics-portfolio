// Custom cursor implementation
document.addEventListener('DOMContentLoaded', function() {
    // Create custom cursor element
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    const hexagonSVG_white = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"white\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";
    const hexagonSVG_black = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"black\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let currentScale = 1, targetScale = 1;
    const easing = 0.2;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const isOnCanvas = e.target.closest('#canvas-wrapper');
        const isOverClickable = e.target.closest('.gallery-item, .sub-page-header a, #controls-panel');
        
        if (isOnCanvas) {
            cursor.style.opacity = '0'; // Hide custom cursor
        } else {
            cursor.style.opacity = '1'; // Show custom cursor
            cursor.style.backgroundImage = isOverClickable ? hexagonSVG_black : hexagonSVG_white;
        }
    });
    
    window.addEventListener('mousedown', (e) => {
        if(e.target.tagName === 'INPUT' && e.target.type === 'range') return;
        targetScale = 0.7;
    });
    
    window.addEventListener('mouseup', () => {
        targetScale = 1;
    });
    
    const animate = () => {
        cursorX += (mouseX - cursorX) * easing;
        cursorY += (mouseY - cursorY) * easing;
        currentScale += (targetScale - currentScale) * easing;
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(${currentScale})`;
        requestAnimationFrame(animate);
    };
    animate();
    
    // Handle touch devices
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
    }
});
