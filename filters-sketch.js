(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    const asciiChars = " .:-=+*#%@";
    let asciiGraphics;

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Halftone'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();

        asciiGraphics = createGraphics(80, 60);

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
                drawHalftoneFilter(mainValue, paramValue);
                break;
        }
        pop();
    }

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

    function drawAsciiFilter(detail) {
        asciiGraphics.image(webcam, 0, 0, asciiGraphics.width, asciiGraphics.height);
        let cellSize = width / asciiGraphics.width;
        fill(255); noStroke(); textSize(cellSize * 1.5);

        for (let y = 0; y < asciiGraphics.height; y++) {
            for (let x = 0; x < asciiGraphics.width; x++) {
                let c = asciiGraphics.get(x, y);
                let brightness = (red(c) + green(c) + blue(c)) / 3;
                let charIndex = floor(map(brightness, 0, 255, asciiChars.length - 1, 0));
                text(asciiChars.charAt(charIndex), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
            }
        }
    }

    function drawHalftoneFilter(cellSize, param) {
        webcam.loadPixels();
        noStroke();
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                let c = webcam.get(x, y);
                let brightness = (red(c) + green(c) + blue(c)) / 3;
                let dotSize = map(brightness, 0, 255, cellSize, 2);
                let contrast = map(param, 0, 360, 1, 3);
                dotSize = pow(dotSize / cellSize, contrast) * cellSize;
                fill(c);
                ellipse(x + cellSize/2, y + cellSize/2, dotSize, dotSize);
            }
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


