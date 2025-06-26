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
        4: 'Scanlines' // Nuovo Filtro
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();
        
        // Crea un buffer grafico delle stesse dimensioni del canvas
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
        background(0);
        
        // 1. Disegna la webcam specchiata nel buffer UNA SOLA VOLTA per frame
        webcamBuffer.push();
        webcamBuffer.translate(width, 0);
        webcamBuffer.scale(-1, 1);
        webcamBuffer.image(webcam, 0, 0, width, height);
        webcamBuffer.pop();

        // 2. Disegna il buffer centrato sul canvas principale
        image(webcamBuffer, 0, 0);

        // 3. Applica il filtro selezionato sull'immagine già disegnata
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
                drawScanlinesFilter(mainValue);
                break;
        }
    }

    // FILTRO 1: Mosaico Rotante
    function drawMosaicFilter(cellSize, angle) {
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                // Usa il buffer invece della webcam per performance
                image(webcamBuffer, -cellSize / 2, -cellSize / 2, cellSize, cellSize, x, y, cellSize, cellSize);
                pop();
            }
        }
    }

    // FILTRO 2: ASCII Art (versione leggera)
    function drawAsciiFilter(cellSize) {
        background(0); // Pulisce l'immagine della webcam per mostrare solo i caratteri
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

    // FILTRO 3: RGB Shift
    function drawRgbShiftFilter(offsetAmount) {
        let offset = map(offsetAmount, 0, 360, 0, 30);
        
        blendMode(ADD);
        tint(255, 0, 0);
        image(webcamBuffer, offset, 0);
        tint(0, 255, 0);
        image(webcamBuffer, 0, 0);
        tint(0, 0, 255);
        image(webcamBuffer, -offset, 0);
        blendMode(BLEND);
        noTint();
    }

    // FILTRO 4: Scanlines
    function drawScanlinesFilter(lineSize) {
        stroke(0, 150); // Linee nere semitrasparenti
        strokeWeight(lineSize / 10);
        for(let y = 0; y < height; y += 4) {
            line(0, y, width, y);
        }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '4') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();



