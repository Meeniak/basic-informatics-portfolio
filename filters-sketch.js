(function() {
    let webcam;
    let mainSlider, paramSlider;
    let filterLabel;
    let currentFilter = 1;

    // Stringa di caratteri più dettagliata per l'effetto ASCII
    const asciiChars = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Pointillism'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480);
        canvas.parent(canvasWrapper);
        
        webcam = createCapture(VIDEO, () => {
            console.log("Webcam ready.");
        });
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
        
        // Specchia l'immagine orizzontalmente
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
                drawPointillismFilter(mainValue, paramValue);
                break;
        }
        pop();
    }

    // FILTRO 1: Mosaico con rotazione controllata da slider
    function drawMosaicFilter(cellSize, angle) {
        webcam.loadPixels();
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

    // FILTRO 2: ASCII Art con più dettaglio
    function drawAsciiFilter(cellSize) {
        webcam.loadPixels();
        fill(255);
        noStroke();
        textSize(cellSize * 1.4);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                if (x < width && y < height) {
                    let c = webcam.get(x, y);
                    let brightness = (red(c) + green(c) + blue(c)) / 3;
                    let charIndex = floor(map(brightness, 0, 255, asciiChars.length - 1, 0));
                    let char = asciiChars.charAt(charIndex);
                    text(char, x + cellSize / 2, y + cellSize / 2);
                }
            }
        }
    }

    // FILTRO 3: Nuovo effetto Pointillism
    function drawPointillismFilter(pointSize, pointDensity) {
        let density = map(pointDensity, 0, 360, 100, 5000);
        noStroke();
        for (let i = 0; i < density; i++) {
            let x = floor(random(width));
            let y = floor(random(height));
            let col = webcam.get(x, y);
            fill(col);
            ellipse(x, y, pointSize / 3, pointSize / 3);
        }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
            if(currentFilter === 1) {
                paramSlider.value(0);
            }
        }
        
        if (key.toLowerCase() === 's') {
            saveCanvas('my-filter', 'png');
        }
    }
})();

