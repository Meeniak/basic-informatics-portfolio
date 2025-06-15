document.addEventListener('DOMContentLoaded', () => {
    let animationFrameId = null;
    let isMouseDown = false;

    // Create a single container for the animated hexagons
    const effectContainer = document.createElement('div');
    effectContainer.className = 'click-effect-container';
    document.body.appendChild(effectContainer);
    
    // Define the two SVG versions for the hexagons
    const hexagonSVG_white = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"white\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";
    const hexagonSVG_black = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"23\" viewBox=\"0 0 20 23\" fill=\"none\" stroke=\"black\" stroke-width=\"1.5\"><path d=\"M10 0.866L19.5 5.75v9.742L10 20.358L0.5 15.492V5.75L10 0.866z\"/></svg>')";

    let animatedHexagons = [];

    // --- MOUSE DOWN: Start the animation ---
    document.body.addEventListener('mousedown', (e) => {
        isMouseDown = true;

        // Create two new hexagons for the animation
        animatedHexagons = [document.createElement('div'), document.createElement('div')];
        
        // Check if the cursor is over a clickable element to set the initial color
        const isOverClickable = e.target.closest('.gallery-item, .sub-page-header a');
        const initialSVG = isOverClickable ? hexagonSVG_black : hexagonSVG_white;

        animatedHexagons.forEach(hex => {
            hex.className = 'click-hexagon';
            hex.style.backgroundImage = initialSVG; // Set color
            effectContainer.appendChild(hex);
        });

        moveHexagons(e.clientX, e.clientY);
        
        const startTime = performance.now();
        
        function animate(currentTime) {
            if (!isMouseDown) return; // Stop loop if mouse is released

            const elapsedTime = currentTime - startTime;

            // This function creates a smooth oscillation between 1 and 0
            const scale = Math.abs(Math.cos(elapsedTime * 0.003));
            
            // Apply simultaneous scaling
            animatedHexagons[0].style.transform = `translate(-50%, -50%) scaleY(${scale})`; // Shrinks height
            animatedHexagons[1].style.transform = `translate(-50%, -50%) scaleX(${scale})`; // Shrinks width

            animationFrameId = requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    });

    // --- MOUSE MOVE: Update position and color ---
    document.body.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            moveHexagons(e.clientX, e.clientY);

            // Dynamically check color while moving
            const isOverClickable = e.target.closest('.gallery-item, .sub-page-header a');
            const currentSVG = isOverClickable ? hexagonSVG_black : hexagonSVG_white;
            animatedHexagons.forEach(hex => {
                hex.style.backgroundImage = currentSVG;
            });
        }
    });

    // --- MOUSE UP: Stop the animation ---
    document.body.addEventListener('mouseup', () => {
        if (isMouseDown) {
            isMouseDown = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            // Clear the animated hexagons from the container
            effectContainer.innerHTML = '';
        }
    });

    function moveHexagons(x, y) {
        animatedHexagons.forEach(hex => {
            hex.style.left = `${x}px`;
            hex.style.top = `${y}px`;
        });
    }
});
