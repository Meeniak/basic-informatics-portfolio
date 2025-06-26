(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    // Buffer grafico per ottimizzazione e centratura
    let webcamBuffer;
    let asciiGraphics;

    const asciiChars = " .:-=+*#%@";

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Threshold'
    };

    function updateSliders() {
        switch(currentFilter) {
            case 1: // Mosaic
                mainSlider.elt.min = 10; mainSlider.elt.max = 100; mainSlider.value(40); mainSlider.elt.step = 2;
                paramSlider.elt.min = 0; paramSlider.elt.max = 360; paramSlider.value(0); paramSlider.elt.step = 1;
                break;
            case 2: // ASCII Art
                mainSlider.elt.min = 8; mainSlider.elt.max = 24; mainSlider.value(12); mainSlider.elt.step = 1;
                paramSlider.elt.min = 0; paramSlider.elt.max = 5; paramSlider.value(0); paramSlider.elt.step = 0.1;
                break;
            case 3: // Threshold
                mainSlider.elt.min = 0; mainSlider.elt.max = 1; mainSlider.value(0.5); mainSlider.elt.step = 0.01;
                paramSlider.elt.min = 0; paramSlider.elt.max = 1; paramSlider.value(0); paramSlider.elt.step = 1;
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
        asciiGraphics = createGraphics(80, 60);

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
        // 1. Disegna la webcam specchiata nel buffer UNA SOLA VOLTA
        webcamBuffer.push();
        webcamBuffer.translate(width, 0);
        webcamBuffer.scale(-1, 1);
        webcamBuffer.image(webcam, 0, 0, width, height);
        webcamBuffer.pop();

        // 2. Applica il filtro scelto
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
                drawThresholdFilter(mainValue);
                break;
        }
    }

    // FILTRO 1: Mosaico Rotante
    function drawMosaicFilter(cellSize, angle) {
        background(0);
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

    // FILTRO 2: ASCII Art (versione leggera e stabile)
    function drawAsciiFilter(cellSize, distortion) {
        background(0);
        
        // Usa un buffer a bassa risoluzione per ottimizzare
        asciiGraphics.image(webcamBuffer, 0, 0, asciiGraphics.width, asciiGraphics.height);
        
        let w = width / asciiGraphics.width;
        let h = height / asciiGraphics.height;
        
        fill(255); noStroke(); textSize(w * 1.5);
        
        for (let j = 0; j < asciiGraphics.height; j++) {
            for (let i = 0; i < asciiGraphics.width; i++) {
                const c = asciiGraphics.get(i, j);
                const brightness = (red(c) + green(c) + blue(c)) / 3;
                const charIndex = floor(map(brightness, 0, 255, 0, asciiChars.length - 1));
                text(asciiChars.charAt(charIndex), i * w + w / 2 + random(-distortion, distortion), j * h + h / 2 + random(-distortion, distortion));
            }
        }
    }

    // FILTRO 3: Threshold
    function drawThresholdFilter(thresholdValue) {
        // Disegna prima l'immagine della webcam e poi applica il filtro
        image(webcamBuffer, 0, 0, width, height); 
        filter(THRESHOLD, thresholdValue);
    }


    window.keyPressed = function() {
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
            updateSliders();
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();










