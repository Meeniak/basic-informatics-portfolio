document.addEventListener('DOMContentLoaded', () => {
    let animationFrameId;
    const clickEffectContainer = document.createElement('div');
    document.body.appendChild(clickEffectContainer);

    // This function runs when the user presses the mouse button down
    document.body.addEventListener('mousedown', (e) => {
        // Clear any previous animations
        clickEffectContainer.innerHTML = '';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        const x = e.clientX;
        const y = e.clientY;

        // Create the three hexagons
        const hexagons = [
            createHexagon(x, y, 0), // Static hexagon
            createHexagon(x, y, 1), // Height-animating hexagon
            createHexagon(x, y, 2)  // Width-animating hexagon
        ];

        hexagons.forEach(hex => clickEffectContainer.appendChild(hex));

        const startTime = performance.now();

        // The animation loop
        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;

            // Stop the animation after 1.5 seconds
            if (elapsedTime > 1500) {
                clickEffectContainer.innerHTML = '';
                return;
            }

            // Calculate scaling factors using sin and cos for an oscillating effect
            // Math.abs keeps the scale positive
            const scaleHeight = Math.abs(Math.sin(elapsedTime * 0.003));
            const scaleWidth = Math.abs(Math.cos(elapsedTime * 0.003));
            
            // Apply transformations
            // Hexagon 1 (index 1) scales its height (scaleY)
            hexagons[1].style.transform = `translate(-50%, -50%) scaleY(${scaleHeight})`;

            // Hexagon 2 (index 2) scales its width (scaleX)
            hexagons[2].style.transform = `translate(-50%, -50%) scaleX(${scaleWidth})`;
            
            animationFrameId = requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });

    // Helper function to create a single hexagon element
    function createHexagon(x, y, type) {
        const hex = document.createElement('div');
        hex.className = 'click-hexagon';
        hex.style.left = `${x}px`;
        hex.style.top = `${y}px`;

        // The initial transform centers the hexagon on the cursor
        hex.style.transform = 'translate(-50%, -50%)';
        return hex;
    }
});
