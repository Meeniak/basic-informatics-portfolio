document.addEventListener('DOMContentLoaded', () => {
    let animationFrameId = null;
    let isMouseDown = false;
    const effectContainer = document.createElement('div');
    effectContainer.className = 'click-effect-container';
    document.body.appendChild(effectContainer);
    
    let hexagons = [];

    // --- MOUSE DOWN: START THE EFFECT ---
    document.body.addEventListener('mousedown', (e) => {
        // Do not trigger the animation if a link was clicked
        if (e.target.closest('a')) {
            return;
        }

        isMouseDown = true;
        document.body.style.cursor = 'none'; // Hide the default cursor

        effectContainer.innerHTML = '';
        hexagons = [];

        // Create three hexagons
        for (let i = 0; i < 3; i++) {
            const hex = document.createElement('div');
            hex.className = 'click-hexagon';
            hexagons.push(hex);
            effectContainer.appendChild(hex);
        }

        moveHexagons(e.clientX, e.clientY);
        
        const startTime = performance.now();
        
        // --- ANIMATION LOOP ---
        function animate(currentTime) {
            if (!isMouseDown) return;

            const elapsedTime = currentTime - startTime;

            // --- Corrected Alternating Scaling Logic ---
            // These functions oscillate between 0 and 1, but out of phase.
            // When one is at its max (1), the other is at its min (0).
            const scaleHeight = Math.abs(Math.cos(elapsedTime * 0.003));
            const scaleWidth = Math.abs(Math.sin(elapsedTime * 0.003));
            
            // Hexagon 0: Static (no transformation)
            hexagons[0].style.transform = `translate(-50%, -50%)`;
            // Hexagon 1: "Shrinks" and "expands" its height
            hexagons[1].style.transform = `translate(-50%, -50%) scaleY(${scaleHeight})`;
            // Hexagon 2: "Shrinks" and "expands" its width
            hexagons[2].style.transform = `translate(-50%, -50%) scaleX(${scaleWidth})`;

            animationFrameId = requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });

    // --- MOUSE MOVE: UPDATE POSITION WHILE CLICKING ---
    document.body.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            moveHexagons(e.clientX, e.clientY);
        }
    });

    // --- MOUSE UP: STOP THE EFFECT ---
    document.body.addEventListener('mouseup', () => {
        if (isMouseDown) {
            isMouseDown = false;
            document.body.style.cursor = 'auto'; // Restore default cursor
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            effectContainer.innerHTML = '';
        }
    });

    // Helper function to position all hexagons at the cursor
    function moveHexagons(x, y) {
        hexagons.forEach(hex => {
            hex.style.left = `${x}px`;
            hex.style.top = `${y}px`;
        });
    }
});
