(function() {
    let webcam;
    let mainSlider, paramSlider, paramLabel;
    let filterLabel;
    let currentFilter = 1;

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
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();

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
        let mainValue = mainSlider.value();
        let paramValue = paramSlider.value();
        
        // Ogni filtro gestisce il proprio sfondo e la propria immagine
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

    function drawMirroredWebcam() {
        push();
        translate(width, 0);
        scale(-1, 1);
        image(webcam, 0, 0, width, height);
        pop();
    }

    function drawMosaicFilter(cellSize, angle) {
        background(0);
        // La webcam non viene mostrata direttamente, ma usata per i tasselli
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                // Specchia il singolo tassello per un effetto specchio corretto
                push();
                scale(-1,1);
                image(webcam, -cellSize / 2, -cellSize / 2, cellSize, cellSize, width - x - cellSize, y, cellSize, cellSize);
                pop();
                pop();
            }
        }
    }

    function drawAsciiFilter(cellSize) {
        background(0);
        let mirroredCam = webcam.get();
        mirroredCam.loadPixels();
        
        fill(255, 220);
        noStroke();
        textSize(cellSize * 1.2);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                // Indice per l'immagine specchiata
                let mirroredX = width - x - 1;
                let pixelIndex = (mirroredX + y * width) * 4;
                
                let r = mirroredCam.pixels[pixelIndex];
                let g = mirroredCam.pixels[pixelIndex + 1];
                let b = mirroredCam.pixels[pixelIndex + 2];
                let brightness = (r + g + b) / 3;
                
                let charIndex = floor(map(brightness, 0, 255, 0, asciiChars.length - 1));
                text(asciiChars.charAt(charIndex), x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    function drawThermalFilter(cellSize) {
        background(0);
        noStroke();
        webcam.loadPixels();
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                let mirroredX = width - x - 1;
                let index = (mirroredX + y * width) * 4;
                let r = webcam.pixels[index];
                let g = webcam.pixels[index + 1];
                let b = webcam.pixels[index + 2];
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













