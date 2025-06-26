(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    let webcamBuffer;

    const asciiChars = " .:-=+*#%@";

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'RGB Shift',
        4: 'Threshold' // Nuovo Filtro
    };

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
                paramSlider.min = 0; paramSlider.max = 1; paramSlider.value(0); paramSlider.step = 1;
                break;
            case 4: // Threshold
                mainSlider.min = 0; mainSlider.max = 1; mainSlider.value(0.5); mainSlider.step = 0.01;
                paramSlider.min = 0; paramSlider.max = 1; paramSlider.value(0); paramSlider.step = 1; // Inutilizzato
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
        mainSlider = createSlider(0,0,0,0);
        mainSlider.parent('slider-main-container');
        mainSlider.style('width', '100%');

        paramSlider = createSlider(0,0,0,0);
        paramSlider.parent('slider-param-container');
        paramSlider.style('width', '100%');
        
        updateSliders();

        angleMode(DEGREES);
        textAlign(CENTER, CENTER);
        textFont('monospace');
    }

    window.draw = function() {
        // Disegna la webcam specchiata nel buffer una sola volta
        webcamBuffer.push();
        webcamBuffer.translate(width, 0);
        webcamBuffer.scale(-1, 1);
        webcamBuffer.image(webcam, 0, 0, width, height);
        webcamBuffer.pop();

        // Applica il filtro
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
                drawThresholdFilter(mainValue);
                break;
        }
    }

    function drawMosaicFilter(cellSize, angle) {
        background(0);
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
                text(asciiChars.charAt(charIndex), x + cellSize/2 + random(-distortion, distortion), y + cellSize/2 + random(-distortion, distortion));
            }
        }
    }

    function drawRgbShiftFilter(offset) {
        background(0);
        blendMode(ADD); // ADD è più d'impatto ma più chiaro, SCREEN è un'alternativa
        
        tint(255, 0, 0);
        image(webcamBuffer, offset, 0);
        
        tint(0, 255, 0);
        image(webcamBuffer, 0, 0);
        
        tint(0, 0, 255);
        image(webcamBuffer, -offset, 0);
        
        blendMode(BLEND);
        noTint();
    }

    function drawThresholdFilter(thresholdValue) {
        image(webcamBuffer, 0, 0); // Mostra l'immagine di base
        filter(THRESHOLD, thresholdValue); // Applica il filtro soglia (molto veloce)
    }


    window.keyPressed = function() {
        if (key >= '1' && key <= '4') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
            updateSliders();
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();







