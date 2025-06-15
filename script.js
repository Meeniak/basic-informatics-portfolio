document.addEventListener('DOMContentLoaded', () => {
    let isMouseDown = false;
    let animationFrameId = null;

    // --- Create the custom cursor element ---
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // --- Define the SVG for the hexagon's appearance ---
    const hexagonSVG_white = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"white\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";
    const hexagonSVG_black = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"black\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";

    let scale = 1;
    let x = 0;
    let y = 0;

    // --- MOUSE MOVE: Update cursor position and color ---
    window.addEventListener('mousemove', (e) => {
        // Update position variables
        x = e.clientX;
        y = e.clientY;
        
        // Check if the cursor is over a clickable element
        const isOverClickable = e.target.closest('.gallery-item, .sub-page-header a');
        cursor.style.backgroundImage = isOverClickable ? hexagonSVG_black : hexagonSVG_white;
    });

    // --- MOUSE DOWN: Start the shrink animation ---
    window.addEventListener('mousedown', () => {
        isMouseDown = true;
        // Start the animation loop if it's not already running
        if (!animationFrameId) {
            animate();
        }
    });

    // --- MOUSE UP: Stop the shrink animation ---
    window.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    // --- Main Animation Loop ---
    const animate = (timestamp) => {
        if (isMouseDown) {
            // While mouse is down, shrink the cursor with a dynamic pulse
            const pulse = 0.85 + Math.sin(timestamp * 0.01) * 0.15; // Oscillates between 0.7 and 1.0
            scale = pulse;
        } else {
            // When mouse is up, smoothly grow back to normal size
            scale += (1 - scale) * 0.2; // Easing effect
        }

        // Apply the position and scale transformations
        cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
        
        // If the animation should stop, cancel the frame
        if (!isMouseDown && Math.abs(1 - scale) < 0.01) {
            scale = 1; // Snap to final size
            animationFrameId = null;
        } else {
            // Otherwise, continue the loop
            animationFrameId = requestAnimationFrame(animate);
        }
    };
    
    // Initial call to position the cursor correctly
    requestAnimationFrame(animate);
});
