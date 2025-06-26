(function() {
    let webcam;
    let slider;
    let filterLabel;
    let currentFilter = 1;

    // Stringa di caratteri per il filtro ASCII
    const asciiChars = '       .:-i|=+*#%@';

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Thermal Vision'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();

        // Posiziona lo slider nel suo contenitore
        slider = createSlider(10, 80, 40, 2);
        slider.parent('slider-container');
        slider.style('width', '100%');

        filterLabel = select('#current-filter-label');
        
        angleMode(DEGREES);
        textAlign(CENTER, CENTER);
        textFont('monospace');
    }

    window.draw = function() {
        background(0);
        
        // Specchia e centra la webcam
        push();
        translate(width, 0);
        scale(-1, 1);
        
        // Applica il filtro scelto
        switch (currentFilter) {
            case 1:
                drawMosaicFilter(slider.value());
                break;
            case 2:
                drawAsciiFilter(slider.value());
                break;
            case 3:
                drawThermalFilter(slider.value());
                break;
        }
        pop();
    }

    // --- FILTRI ---

    function drawMosaicFilter(cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                let angle = map(mouseX, 0, width, 0, 360);
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                image(webcam, -cellSize / 2, -cellSize / 2, cellSize, cellSize, x, y, cellSize, cellSize);
                pop();
            }
        }
    }

    function drawAsciiFilter(cellSize) {
        // Ottimizzazione: Analizza un'immagine a risoluzione più bassa
        let lowResWebcam = webcam.get();
        lowResWebcam.resize(width / cellSize, height / cellSize);
        
        lowResWebcam.loadPixels();
        fill(255, 220);
        noStroke();
        textSize(cellSize * 1.2);

        for (let y = 0; y < lowResWebcam.height; y++) {
            for (let x = 0; x < lowResWebcam.width; x++) {
                const i = (x + y * lowResWebcam.width) * 4;
                const r = lowResWebcam.pixels[i];
                const g = lowResWebcam.pixels[i + 1];
                const b = lowResWebcam.pixels[i + 2];
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                
                let charIndex = floor(map(brightness, 0, 255, 0, asciiChars.length - 1));
                text(asciiChars.charAt(charIndex), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
            }
        }
    }

    function drawThermalFilter(cellSize) {
        noStroke();
        webcam.loadPixels();
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                // Campiona solo un pixel per cella per ottimizzare
                let index = (x + y * width) * 4;
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
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();












