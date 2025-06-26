(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    // Buffer grafico per ottimizzazione
    let webcamBuffer;

    const asciiChars = " .:-=+*#%@";

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'RGB Shift',
        4: 'Pixelate' // Nuovo Filtro
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();
        
        webcamBuffer = createGraphics(width, height);

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
        // 1. Disegna la webcam specchiata nel buffer UNA SOLA VOLTA
        webcamBuffer.push();
        webcamBuffer.translate(width, 0);
        webcamBuffer.scale(-1, 1);
        webcamBuffer.image(webcam, 0, 0, width, height);
        webcamBuffer.pop();

        // 2. Pulisce il canvas principale e applica il filtro
        background(0);
        
        let mainValue = mainSlider.value();
        let paramValue = paramSlider.value();
        
        switch (currentFilter) {
            case 1:
                drawMosaicFilter(mainValue, paramValue);
                break;
            case 2:
                drawAsciiFilter(mainValue);
                break;
            case 3:
                drawRgbShiftFilter(paramValue);
                break;
            case 4:
                drawPixelateFilter(mainValue);
                break;
        }
    }

    // FILTRO 1: Mosaico Rotante
    function drawMosaicFilter(cellSize, angle) {
        // Applica il filtro direttamente sul buffer
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                image(webcamBuffer, -cellSize / 2, -cellSize / 2, cellSize, cellSize, x, y, cellSize, cellSize);
                pop();
            }
        }
    }

    // FILTRO 2: ASCII Art (versione leggera)
    function drawAsciiFilter(cellSize) {
        webcamBuffer.loadPixels();
        fill(255);
        noStroke();
        textSize(cellSize * 1.2);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                // Campiona solo un pixel per cella per massima velocità
                let pixelIndex = (x + y * width) * 4;
                let r = webcamBuffer.pixels[pixelIndex];
                let g = webcamBuffer.pixels[pixelIndex + 1];
                let b = webcamBuffer.pixels[pixelIndex + 2];
                let brightness = (r + g + b) / 3;
                
                let charIndex = floor(map(brightness, 0, 255, 0, asciiChars.length - 1));
                text(asciiChars.charAt(charIndex), x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    // FILTRO 3: RGB Shift (corretto)
    function drawRgbShiftFilter(offsetAmount) {
        let offset = map(offsetAmount, 0, 360, 0, 30);
        
        // Usa una modalità di fusione più morbida per evitare il bianco totale
        blendMode(LIGHTEST);
        
        tint(255, 0, 0, 200); // Rosso con trasparenza
        image(webcamBuffer, offset, 0);
        
        tint(0, 255, 0, 200); // Verde con trasparenza
        image(webcamBuffer, 0, 0);
        
        tint(0, 0, 255, 200); // Blu con trasparenza
        image(webcamBuffer, -offset, 0);
        
        blendMode(BLEND); // Ripristina la modalità di fusione normale
        noTint();
    }

    // FILTRO 4: Pixelate (Nuovo)
    function drawPixelateFilter(pixelSize) {
        webcamBuffer.loadPixels();
        noStroke();
        for (let x = 0; x < width; x += pixelSize) {
            for (let y = 0; y < height; y += pixelSize) {
                // Prende il colore del pixel in alto a sinistra della cella
                let pixelIndex = (x + y * width) * 4;
                let r = webcamBuffer.pixels[pixelIndex];
                let g = webcamBuffer.pixels[pixelIndex + 1];
                let b = webcamBuffer.pixels[pixelIndex + 2];
                
                fill(r, g, b);
                rect(x, y, pixelSize, pixelSize);
            }
        }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '4') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
        }
        if (key.toLowerCase() === 's') {
            // Salva l'output corrente del canvas principale
            saveCanvas('my-filter', 'png');
        }
    }
})();




