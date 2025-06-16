document.addEventListener('DOMContentLoaded', () => {
    // --- Create the custom cursor element ---
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // --- Define the SVG for the hexagon's appearance ---
    const hexagonSVG_white = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"white\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";
    const hexagonSVG_black = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"black\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";

    // --- State Variables ---
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let currentScale = 1;
    let targetScale = 1;
    const easing = 0.2;

    // --- MOUSE MOVE: Update target position and color ---
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // --- UPDATED LOGIC ---
        // Check if the cursor is over any clickable element on ANY page.
        const isOverClickable = e.target.closest('.gallery-item, .sub-page-header a, #controls-panel');
        
        cursor.style.backgroundImage = isOverClickable ? hexagonSVG_black : hexagonSVG_white;
    });

    // --- MOUSE DOWN: Set target scale to shrink ---
    window.addEventListener('mousedown', () => {
        targetScale = 0.7; 
    });

    // --- MOUSE UP: Set target scale to normal ---
    window.addEventListener('mouseup', () => {
        targetScale = 1; 
    });

    // --- Permanent Animation Loop ---
    const animate = () => {
        // Smoothly move cursor position
        cursorX += (mouseX - cursorX) * easing;
        cursorY += (mouseY - cursorY) * easing;

        // Smoothly change cursor scale
        currentScale += (targetScale - currentScale) * easing;

        // Apply transformations
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(${currentScale})`;
        
        // Continue the loop
        requestAnimationFrame(animate);
    };

    // Start the animation loop
    animate();
});
