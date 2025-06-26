(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    // Buffer grafico per centrare la webcam e per le ottimizzazioni
    let webcamBuffer;

    const asciiChars = " .'`^,:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'RGB Shift',
        4: 'Posterize & Edge' // Nuovo Filtro
    };

    // Funzione per aggiornare i parametri degli slider in base al filtro
    function updateSliders() {
        switch(currentFilter) {
            case 1: // Mosaic
                mainSlider.min = 10; mainSlider.max = 100; mainSlider.value(40); mainSlider.step = 2;
                paramSlider.min = 0; paramSlider.max = 360; paramSlider.value(0); paramSlider.step = 1;
                break;
            case 2: // ASCII Art
                mainSlider.min = 4; mainSlider.max = 20; mainSlider.value(10); mainSlider.step = 1;
                paramSlider.min = 0; paramSlider.max = 10; paramSlider.value(0); paramSlider.step = 0.5;
                break;
            case 3: // RGB Shift
                mainSlider.min = 0; mainSlider.max = 50; mainSlider.value(10); mainSlider.step = 1;
                paramSlider.min = 0; paramSlider.max = 1; paramSlider.value(0); paramSlider.step = 1; // Inutilizzato
                break;
            case 4: // Posterize & Edge
                mainSlider.min = 2; mainSlider.max = 10; mainSlider.value(4); mainSlider.step = 1;
                paramSlider.min = 10; paramSlider.max = 100; paramSlider.value(30); paramSlider.step = 1;
                break;
        }
    }

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();
        
        webcamBuffer = createGraphics(width, height);

        filterLabel = select('#current-filter-label');
        mainSlider = createSlider(0,0,0,0); // Inizializzazione temporanea
        mainSlider.parent('slider-main-container');
        mainSlider.style('width', '100%');

        paramSlider = createSlider(0,0,0,0); // Inizializzazione temporanea
        paramSlider.parent('slider-param-container');
        paramSlider.style('width', '100%');
        
        updateSliders(); // Imposta i valori corretti per il filtro iniziale

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

        // 2. Disegna il buffer sul canvas principale per averlo come sfondo
        image(webcamBuffer, 0, 0, width, height);
        
        // 3. Applica il filtro selezionato
        let mainValue = mainSlider.value();
        let paramValue = paramSlider.value();
        
        switch (currentFilter) {
            case 1:
                drawMosaicFilter(mainValue, paramValue);
                break;
            case 2:
                drawAsciiFilter(mainValue, paramValue);
                break;
            case 3:
                drawRgbShiftFilter(mainValue);
                break;
            case 4:
                drawPosterizeAndEdgeFilter(mainValue, paramValue);
                break;
        }
    }

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

    function drawAsciiFilter(cellSize, distortion) {
        background(0);
        webcamBuffer.loadPixels();
        fill(255);
        noStroke();
        textSize(cellSize * 1.4);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                let pixelIndex = (x + y * width) * 4;
                let r = webcamBuffer.pixels[pixelIndex];
                let g = webcamBuffer.pixels[pixelIndex + 1];
                let b = webcamBuffer.pixels[pixelIndex + 2];
                let brightness = (r + g + b) / 3;
                
                let charIndex = floor(map(brightness, 0, 255, 0, asciiChars.length - 1));
                text(asciiChars.charAt(charIndex), x + cellSize / 2 + random(-distortion, distortion), y + cellSize / 2 + random(-distortion, distortion));
            }
        }
    }

    function drawRgbShiftFilter(offset) {
        blendMode(LIGHTEST);
        tint(255, 0, 0, 200);
        image(webcamBuffer, offset, 0);
        tint(0, 255, 0, 200);
        image(webcamBuffer, 0, 0);
        tint(0, 0, 255, 200);
        image(webcamBuffer, -offset, 0);
        blendMode(BLEND);
        noTint();
    }

    function drawPosterizeAndEdgeFilter(levels, threshold) {
        let posterized = webcamBuffer.get();
        posterized.filter(POSTERIZE, levels);
        
        image(posterized, 0, 0); // Mostra l'immagine posterizzata

        // Rilevamento dei bordi
        loadPixels(); // Carica i pixel del canvas principale
        posterized.loadPixels(); // Carica i pixel dell'immagine posterizzata
        
        for (let x = 0; x < width - 1; x++) {
            for (let y = 0; y < height - 1; y++) {
                let index = (x + y * width) * 4;
                let c1 = color(posterized.pixels[index], posterized.pixels[index+1], posterized.pixels[index+2]);
                
                let rightIndex = ((x+1) + y * width) * 4;
                let c2 = color(posterized.pixels[rightIndex], posterized.pixels[rightIndex+1], posterized.pixels[rightIndex+2]);
                
                if (dist(red(c1), green(c1), blue(c1), red(c2), green(c2), blue(c2)) > threshold) {
                    pixels[index] = 0; pixels[index+1] = 0; pixels[index+2] = 0; pixels[index+3] = 255;
                }
            }
        }
        updatePixels();
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '4') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
            updateSliders(); // Aggiorna gli slider quando cambia il filtro
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();






