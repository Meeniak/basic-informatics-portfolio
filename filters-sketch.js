(function() {
    let webcam;
    let mainSlider, paramSlider, paramLabel;
    let filterLabel;
    let currentFilter = 1;

    let webcamBuffer;

    const asciiChars = '       .:-i|=+*#%@';

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Thermal Vision'
    };

    function updateSliders() {
        switch(currentFilter) {
            case 1: // Mosaic
                mainSlider.elt.min = 10; mainSlider.elt.max = 80; mainSlider.value(40); mainSlider.elt.step = 2;
                paramLabel.html('Rotation');
                paramSlider.elt.min = 0; paramSlider.elt.max = 360; paramSlider.value(0); paramSlider.elt.step = 1;
                paramSlider.show();
                paramLabel.show();
                break;
            case 2: // ASCII
            case 3: // Thermal
                mainSlider.elt.min = 8; mainSlider.elt.max = 40; mainSlider.value(12); mainSlider.elt.step = 1;
                paramSlider.hide();
                paramLabel.hide();
                break;
        }
    }

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        // FIX: Crea il canvas con le dimensioni del contenitore
        const canvas = createCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        // Adatta la webcam alle dimensioni del canvas
        webcam.size(width, height);
        webcam.hide();

        // Anche il buffer deve avere le stesse dimensioni
        webcamBuffer = createGraphics(width, height);

        filterLabel = select('#current-filter-label');
        mainSlider = createSlider(0,0,0,0);
        mainSlider.parent('slider-main-container');
        mainSlider.style('width', '100%');

        paramLabel = select('#param-label');
        paramSlider = createSlider(0,0,0,0);
        paramSlider.parent('slider-param-container');
        paramSlider.style('width', '100%');
        
        updateSliders();

        angleMode(DEGREES);
        textAlign(CENTER, CENTER);
        textFont('monospace');
    }

    window.draw = function() {
        // Disegna la webcam specchiata nel buffer una sola volta per frame
        webcamBuffer.push();
        webcamBuffer.translate(width, 0);
        webcamBuffer.scale(-1, 1);
        webcamBuffer.image(webcam, 0, 0, width, height);
        webcamBuffer.pop();

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
                drawThermalFilter(mainValue);
                break;
        }
    }

    function drawMosaicFilter(cellSize, angle) {
        // Disegna prima il video di base
        image(webcamBuffer, 0, 0, width, height);
        // Poi applica i tasselli sopra
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

    function drawAsciiFilter(cellSize) {
        background(0);
        webcamBuffer.loadPixels();
        fill(255, 220);
        noStroke();
        textSize(cellSize * 1.2);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
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

    function drawThermalFilter(cellSize) {
        background(0);
        noStroke();
        webcamBuffer.loadPixels();
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                let index = (x + y * width) * 4;
                let r = webcamBuffer.pixels[index];
                let g = webcamBuffer.pixels[index + 1];
                let b = webcamBuffer.pixels[index + 2];
                let brightness = (r + g + b) / 3;
                
                let thermalColor = getColorForBrightness(brightness);
                fill(thermalColor);
                rect(x, y, cellSize, cellSize);
            }
        }
    }

    function getColorForBrightness(brightness) {
        if (brightness < 85) {
            return color(0, map(brightness, 0, 85, 0, 255), 255);
        } else if (brightness < 170) {
            return color(map(brightness, 85, 170, 0, 255), 255, 0);
        } else {
            return color(255, map(brightness, 170, 255, 255, 0), 0);
        }
    }

    // Funzione che adatta il canvas se la finestra del browser viene ridimensionata
    window.windowResized = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        resizeCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        // Adatta anche il buffer
        webcamBuffer.resize(width, height);
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

