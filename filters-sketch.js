(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    // Stringa di caratteri più semplice per l'effetto ASCII
    const asciiChars = " .:-=+*#%@";

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'RGB Shift' // Nuovo Filtro
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();

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
        
        let mainValue = mainSlider.value();
        let paramValue = paramSlider.value();
        
        push();
        translate(width, 0);
        scale(-1, 1);

        switch (currentFilter) {
            case 1:
                drawMosaicFilter(mainValue, paramValue);
                break;
            case 2:
                drawAsciiFilter(mainValue);
                break;
            case 3:
                drawRgbShiftFilter(mainValue, paramValue);
                break;
        }
        pop();
    }

    // FILTRO 1: Invariato
    function drawMosaicFilter(cellSize, angle) {
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                image(webcam, -cellSize / 2, -cellSize / 2, cellSize, cellSize, x, y, cellSize, cellSize);
                pop();
            }
        }
    }

    // FILTRO 2: ASCII Art (versione più leggera)
    function drawAsciiFilter(cellSize) {
        webcam.loadPixels();
        fill(255);
        noStroke();
        textSize(cellSize * 1.4);

        // Aggiorna solo ogni 2 frame per alleggerire
        if (frameCount % 2 === 0) {
            for (let y = 0; y < height; y += cellSize) {
                for (let x = 0; x < width; x += cellSize) {
                    if (x < width && y < height) {
                        let c = webcam.get(x, y);
                        let brightness = (red(c) + green(c) + blue(c)) / 3;
                        let charIndex = floor(map(brightness, 0, 255, asciiChars.length - 1, 0));
                        text(asciiChars.charAt(charIndex), x + cellSize / 2, y + cellSize / 2);
                    }
                }
            }
        }
    }

    // FILTRO 3: Nuovo effetto RGB Shift (leggero)
    function drawRgbShiftFilter(cellSize, param) {
        let offset = map(param, 0, 360, 0, 30);
        
        // Disabilita il campionamento per pixel per performance
        // Mostra solo tre immagini intere sfasate
        blendMode(ADD);
        tint(255, 0, 0);
        image(webcam, offset, 0);
        tint(0, 255, 0);
        image(webcam, 0, 0);
        tint(0, 0, 255);
        image(webcam, -offset, 0);
        blendMode(BLEND);
        noTint();
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
            background(0);
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();


