(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    // Stringa di caratteri più semplice per l'effetto ASCII
    const asciiChars = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
    let asciiGraphics; // Buffer grafico per l'ottimizzazione dell'ASCII art

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Glitch Blocks' // Nuovo Filtro
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

    // FILTRO 1: Mosaico (leggero)
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

    // FILTRO 2: ASCII Art (ottimizzato)
    function drawAsciiFilter(detail) {
        // Disegna una versione più piccola della webcam nel buffer grafico
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

    // FILTRO 3: Nuovo effetto Glitch Blocks (leggero)
    function drawGlitchBlocksFilter(cellSize, param) {
        let maxOffset = map(param, 0, 360, 0, width / 2);
        
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                // Scegli una porzione casuale di video da campionare
                let randomX = x + floor(random(-maxOffset, maxOffset));
                let randomY = y + floor(random(-maxOffset, maxOffset));
                
                // Assicurati che le coordinate siano valide
                randomX = constrain(randomX, 0, width - cellSize);
                randomY = constrain(randomY, 0, height - cellSize);

                let imgPortion = webcam.get(randomX, randomY, cellSize, cellSize);
                image(imgPortion, x, y);
            }
        }
    }


    window.keyPressed = function() {
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
        }
        
        if (key.toLowerCase() === 's') {
            // ... (logica di salvataggio invariata)
        }
    }
})();
