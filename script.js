document.addEventListener('DOMContentLoaded', () => {
    let animationFrameId = null;
    let isMouseDown = false;
    const effectContainer = document.createElement('div');
    effectContainer.className = 'click-effect-container';
    document.body.appendChild(effectContainer);
    
    let hexagons = [];

    // --- MOUSE DOWN: START THE EFFECT ---
    document.body.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        document.body.style.cursor = 'none'; // Hide the default cursor

        // Clear any old hexagons
        effectContainer.innerHTML = '';
        hexagons = [];

        // Create three hexagons and add them to the container
        for (let i = 0; i < 3; i++) {
            const hex = document.createElement('div');
            hex.className = 'click-hexagon';
            hexagons.push(hex);
            effectContainer.appendChild(hex);
        }

        // Move hexagons to initial click position
        moveHexagons(e.clientX, e.clientY);
        
        const startTime = performance.now();
        
        // Start the animation loop
        function animate(currentTime) {
            if (!isMouseDown) return; // Stop if mouse is released

            const elapsedTime = currentTime - startTime;

            // --- Alternating Scaling Logic ---
            // scaleFactor oscillates between 0 and 1 using Math.sin
            const scaleFactor = (Math.sin(elapsedTime * 0.004) + 1) / 2; // Range [0, 1]

            const scaleHeight = scaleFactor;
            const scaleWidth = 1 - scaleFactor; // Inversely related to height

            // Hexagon 0: Static
            hexagons[0].style.transform = `translate(-50%, -50%)`;
            // Hexagon 1: Animates height (scaleY)
            hexagons[1].style.transform = `translate(-50%, -50%) scaleY(${scaleHeight})`;
            // Hexagon 2: Animates width (scaleX)
            hexagons[2].style.transform = `translate(-50%, -50%) scaleX(${scaleWidth})`;

            animationFrameId = requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });

    // --- MOUSE MOVE: UPDATE POSITION WHILE CLICKING ---
    document.body.addEventListener('mousemove', (e) => {
        // Only move the animation if the mouse button is held down
        if (isMouseDown) {
            moveHexagons(e.clientX, e.clientY);
        }
    });

    // --- MOUSE UP: STOP THE EFFECT ---
    document.body.addEventListener('mouseup', () => {
        isMouseDown = false;
        document.body.style.cursor = 'auto'; // Restore default cursor
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        effectContainer.innerHTML = ''; // Clear the hexagons
    });

    // Helper function to position all hexagons at the cursor
    function moveHexagons(x, y) {
        hexagons.forEach(hex => {
            hex.style.left = `${x}px`;
            hex.style.top = `${y}px`;
        });
    }
});
