document.addEventListener('DOMContentLoaded', () => {
    // --- Create the custom cursor element ---
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // --- Define the SVG for the hexagon's appearance ---
    const hexagonSVG_white = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"white\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";
    const hexagonSVG_black = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"black\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";

    // --- State Variables ---
    // Target position (follows the real mouse pointer)
    let mouseX = 0;
    let mouseY = 0;
    // Current cursor position (moves smoothly towards the target)
    let cursorX = 0;
    let cursorY = 0;
    // Current and target scale for the shrink effect
    let currentScale = 1;
    let targetScale = 1;
    // Easing factor for smooth movement
    const easing = 0.2;

    // --- MOUSE MOVE: Update target position and color ---
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Check if the cursor is over a clickable element to set the color
        const isOverClickable = e.target.closest('.gallery-item, .sub-page-header a');
        cursor.style.backgroundImage = isOverClickable ? hexagonSVG_black : hexagonSVG_white;
    });

    // --- MOUSE DOWN: Set target scale to shrink ---
    window.addEventListener('mousedown', () => {
        targetScale = 0.7; // The cursor will shrink to 70% of its size
    });

    // --- MOUSE UP: Set target scale to normal ---
    window.addEventListener('mouseup', () => {
        targetScale = 1; // The cursor will grow back to its normal size
    });

    // --- Permanent Animation Loop ---
    const animate = () => {
        // Move the cursor's current position closer to the target (real mouse) position
        // This creates a smooth, slightly delayed following effect.
        cursorX += (mouseX - cursorX) * easing;
        cursorY += (mouseY - cursorY) * easing;

        // Move the cursor's current scale closer to the target scale
        // This creates a smooth shrink and grow animation.
        currentScale += (targetScale - currentScale) * easing;

        // Apply the final transformations for position and scale
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(${currentScale})`;
        
        // Continue the loop on the next frame
        requestAnimationFrame(animate);
    };

    // Start the animation loop
    animate();
});
