(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    let webcamBuffer;

    // Stringa di caratteri più semplice per l'effetto ASCII
    const asciiChars = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
    let asciiGrid = []; // Array per memorizzare i caratteri e ridurre il carico

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Colorize', // Nuovo Filtro
        4: 'Threshold'  // Nuovo Filtro
    };

    function updateSliders() {
        switch(currentFilter) {
            case 1: // Mosaic
                mainSlider.min = 10; mainSlider.max = 100; mainSlider.value(40); mainSlider.step = 2;
                paramSlider.min = 0; paramSlider.max = 360; paramSlider.value(0); paramSlider.step = 1;
                break;
            case 2: // ASCII Art
                mainSlider.min = 8; mainSlider.max = 32; mainSlider.value(12); mainSlider.step = 1;
                paramSlider.min = 0; paramSlider.max = 10; paramSlider.value(0); paramSlider.step = 0.5;
                break;
            case 3: // Colorize
                mainSlider.min = 0; mainSlider.max = 1; mainSlider.value(0); mainSlider.step = 0; // Inutilizzato
                paramSlider.min = 0; paramSlider.max = 360; paramSlider.value(180); paramSlider.step = 1;
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
        // Disegna la webcam specchiata nel buffer UNA SOLA VOLTA
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
                drawColorizeFilter(paramValue);
                break;
            case 4:
                drawThresholdFilter(mainValue);
                break;
        }
    }

    function drawMosaicFilter(cellSize, angle) {
        // Disegna il buffer come sfondo
        image(webcamBuffer, 0, 0);
        // Applica il filtro sopra
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
        
        // Aggiorna la griglia di caratteri solo ogni 3 frame per performance
        if (frameCount % 3 === 0) {
            asciiGrid = []; // Svuota la griglia
            webcamBuffer.loadPixels();
            for (let y = 0; y < height; y += cellSize) {
                let row = [];
                for (let x = 0; x < width; x += cellSize) {
                    let pixelIndex = (x + y * width) * 4;
                    let r = webcamBuffer.pixels[pixelIndex];
                    let g = webcamBuffer.pixels[pixelIndex + 1];
                    let b = webcamBuffer.pixels[pixelIndex + 2];
                    let brightness = (r + g + b) / 3;
                    let charIndex = floor(map(brightness, 0, 255, 0, asciiChars.length - 1));
                    row.push(asciiChars.charAt(charIndex));
                }
                asciiGrid.push(row);
            }
        }
        
        // Disegna la griglia memorizzata
        fill(255);
        noStroke();
        textSize(cellSize * 1.4);
        for(let y = 0; y < asciiGrid.length; y++) {
            for (let x = 0; x < asciiGrid[y].length; x++) {
                text(asciiGrid[y][x], x * cellSize + cellSize / 2 + random(-distortion, distortion), y * cellSize + cellSize / 2 + random(-distortion, distortion));
            }
        }
    }

    function drawColorizeFilter(hueValue) {
        image(webcamBuffer, 0, 0);
        // Applica una tinta colorata che cambia con lo slider
        push();
        colorMode(HSB, 360, 100, 100, 1);
        fill(hueValue, 80, 100, 0.4);
        rect(0, 0, width, height);
        pop();
    }

    function drawThresholdFilter(thresholdValue) {
        image(webcamBuffer, 0, 0);
        filter(THRESHOLD, thresholdValue);
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








