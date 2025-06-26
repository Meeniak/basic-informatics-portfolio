(function() {
    let webcam;
    let slider;
    let filterLabel;
    let currentFilter = 1;

    const asciiChars = '    .:-i|=+*#%@';

    // Aggiornato il nome del filtro 3
    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Kaleidoscope'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();

        filterLabel = select('#current-filter-label');
        slider = createSlider(10, 80, 40, 2); // Impostazione iniziale per il filtro 1
        slider.parent('slider-container');
        slider.style('width', '100%');
        
        angleMode(DEGREES);
        textAlign(CENTER, CENTER);
        textFont('monospace');
        
        filterLabel.html(`Current: ${filterNames[currentFilter]}`);
    }

    window.draw = function() {
        background(0);
        
        translate(width, 0);
        scale(-1, 1);

        switch (currentFilter) {
            case 1:
                drawMosaicFilter(slider.value());
                break;
            case 2:
                drawAsciiFilter(slider.value());
                break;
            case 3:
                // Chiama la nuova funzione filtro
                drawKaleidoscopeFilter(slider.value());
                break;
        }
    }

    // FILTRO 1: Rotating Mosaic (invariato)
    function drawMosaicFilter(cellSize) {
        webcam.loadPixels();
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                let angle = map(mouseX, 0, width, 0, 360);
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                let imgPortion = webcam.get(x, y, cellSize, cellSize);
                image(imgPortion, -cellSize / 2, -cellSize / 2);
                pop();
            }
        }
    }

    // FILTRO 2: ASCII Art (invariato)
    function drawAsciiFilter(cellSize) {
        webcam.loadPixels();
        fill(255);
        noStroke();
        textSize(cellSize * 1.2);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                let totalBrightness = 0;
                for (let i = 0; i < cellSize; i++) {
                    for (let j = 0; j < cellSize; j++) {
                        let index = ((x + i) + (y + j) * width) * 4;
                        let r = webcam.pixels[index];
                        let g = webcam.pixels[index + 1];
                        let b = webcam.pixels[index + 2];
                        totalBrightness += (r + g + b) / 3;
                    }
                }
                let avgBrightness = totalBrightness / (cellSize * cellSize);
                let charIndex = floor(map(avgBrightness, 0, 255, 0, asciiChars.length - 1));
                let char = asciiChars.charAt(charIndex);
                text(char, x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    // NUOVO FILTRO 3: Kaleidoscope
    function drawKaleidoscopeFilter(segments) {
        translate(width / 2, height / 2);
        
        let angle = 360 / segments;
        let piece = webcam.get(0, 0, 150, 150); // Prende un pezzo di immagine

        for (let i = 0; i < segments; i++) {
            push();
            rotate(i * angle);
            
            // Ogni segmento alternato viene specchiato per creare simmetria
            if (i % 2 === 0) {
                scale(1, -1);
            }

            // Disegna il pezzo di immagine
            image(piece, 0, 0, 200, 200);
            pop();
        }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);

            // Aggiorna dinamicamente i parametri dello slider in base al filtro
            switch (currentFilter) {
                case 1: // Mosaico
                    slider.attribute('min', 10);
                    slider.attribute('max', 80);
                    slider.attribute('step', 2);
                    slider.value(40);
                    break;
                case 2: // ASCII
                    slider.attribute('min', 8);
                    slider.attribute('max', 40);
                    slider.attribute('step', 1);
                    slider.value(12);
                    break;
                case 3: // Caleidoscopio
                    slider.attribute('min', 4);
                    slider.attribute('max', 30);
                    slider.attribute('step', 2);
                    slider.value(8);
                    break;
            }
        }
        
        if (key.toLowerCase() === 's') {
            push();
            resetMatrix();
            background(0); // Pulisce lo sfondo per il salvataggio
            switch (currentFilter) {
                case 1: drawMosaicFilter(slider.value()); break;
                case 2: drawAsciiFilter(slider.value()); break;
                case 3: drawKaleidoscopeFilter(slider.value()); break;
            }
            saveCanvas('my-filter', 'png');
            pop();
        }
    }
})();










