(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    // Stringa di caratteri più semplice per l'effetto ASCII
    const asciiChars = " .:-=+*#%@";
    let asciiGraphics; // Buffer grafico per l'ottimizzazione

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Glitch Blocks'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();

        // Buffer per l'ottimizzazione dell'ASCII art
        asciiGraphics = createGraphics(80, 60);

        filterLabel = select('#current-filter-label');
        mainSlider = createSlider(10, 80, 40, 2);
        mainSlider.parent('slider-main-container');
        mainSlider.style('width', '100%');

        paramSlider = createSlider(0, 360, 0, 1);
        paramSlider.parent('slider-param-container');
        paramSlider.style('width', '100%');
        
        angleMode(DEGREES);
        textAlign(CENTER, CENTER);
        textFont('monospace');
    }

    window.draw = function() {
        background(0);
        
        let mainValue = mainSlider.value();
        let paramValue = paramSlider.value();
        
        push();
        translate(width, 0);
        scale(-1, 1);

        switch (currentFilter) {
            case 1:
                drawMosaicFilter(mainValue, paramValue);
                break;
            case 2:
                drawAsciiFilter(mainValue);
                break;
            case 3:
                drawGlitchBlocksFilter(mainValue, paramValue);
                break;
        }
        pop();
    }

    function drawMosaicFilter(cellSize, angle) {
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                image(webcam, -cellSize / 2, -cellSize / 2, cellSize, cellSize, x, y, cellSize, cellSize);
                pop();
            }
        }
    }

    function drawAsciiFilter(detail) {
        // Disegna una versione più piccola della webcam nel buffer grafico per ottimizzare
        asciiGraphics.image(webcam, 0, 0, asciiGraphics.width, asciiGraphics.height);
        
        let cellSize = width / asciiGraphics.width;
        fill(255); noStroke(); textSize(cellSize * 1.5);

        for (let y = 0; y < asciiGraphics.height; y++) {
            for (let x = 0; x < asciiGraphics.width; x++) {
                let c = asciiGraphics.get(x, y);
                let brightness = (red(c) + green(c) + blue(c)) / 3;
                let charIndex = floor(map(brightness, 0, 255, asciiChars.length - 1, 0));
                text(asciiChars.charAt(charIndex), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
            }
        }
    }

    function drawGlitchBlocksFilter(cellSize, param) {
        let maxOffset = map(param, 0, 360, 0, width / 4);
        
        // Aggiorna solo una parte dei blocchi ad ogni frame per non laggare
        let updatesPerFrame = 50;
        for(let i = 0; i < updatesPerFrame; i++) {
            let x = floor(random(width / cellSize)) * cellSize;
            let y = floor(random(height / cellSize)) * cellSize;

            let randomX = constrain(x + floor(random(-maxOffset, maxOffset)), 0, width - cellSize);
            let randomY = constrain(y + floor(random(-maxOffset, maxOffset)), 0, height - cellSize);

            let imgPortion = webcam.get(randomX, randomY, cellSize, cellSize);
            image(imgPortion, x, y);
        }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
            background(0); // Pulisce il canvas al cambio di filtro
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();









