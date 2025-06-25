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
        3: 'Pointillism'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        // Canvas con proporzioni 4:3 per la webcam
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
                drawPointillismFilter(mainValue, paramValue);
                break;
        }
        pop();
    }

    // FILTRO 1: Mosaico con rotazione controllata da slider
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

    // FILTRO 2: ASCII Art più leggero
    function drawAsciiFilter(cellSize) {
        webcam.loadPixels();
        fill(255);
        noStroke();
        textSize(cellSize * 1.4);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                if (x < width && y < height) {
                    // Campiona solo il pixel centrale della cella per velocità
                    let c = webcam.get(x + cellSize/2, y + cellSize/2);
                    let brightness = (red(c) + green(c) + blue(c)) / 3;
                    let charIndex = floor(map(brightness, 0, 255, asciiChars.length - 1, 0));
                    let char = asciiChars.charAt(charIndex);
                    text(char, x + cellSize / 2, y + cellSize / 2);
                }
            }
        }
    }

    // FILTRO 3: Nuovo effetto Pointillism più leggero
    function drawPointillismFilter(pointSize, pointDensity) {
        let density = map(pointDensity, 0, 360, 500, 8000); // Meno punti per essere più fluido
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
        }
        
        if (key.toLowerCase() === 's') {
            // Salva correttamente l'immagine senza trasformazioni
            let tempG = createGraphics(width, height);
            tempG.angleMode(DEGREES);
            tempG.textFont('monospace');
            tempG.textAlign(CENTER, CENTER);
            tempG.push();
            tempG.translate(width, 0);
            tempG.scale(-1, 1);
            
            // Ridisegna il filtro corrente sul buffer temporaneo
            switch (currentFilter) {
                case 1: 
                    // Per il mosaico, è necessario ricalcolare sul buffer
                    let angle = paramSlider.value();
                    let cellSize = mainSlider.value();
                    for (let x=0; x < width; x+=cellSize) {
                        for (let y=0; y < height; y+=cellSize) {
                            tempG.push();
                            tempG.translate(x + cellSize/2, y + cellSize/2);
                            tempG.rotate(angle);
                            tempG.image(webcam, -cellSize/2, -cellSize/2, cellSize, cellSize, x, y, cellSize, cellSize);
                            tempG.pop();
                        }
                    }
                    break;
                case 2:
                    // Per l'ascii, è necessario ricalcolare sul buffer
                    tempG.background(0);
                    tempG.fill(255); tempG.noStroke();
                    let cellSizeAscii = mainSlider.value();
                    tempG.textSize(cellSizeAscii * 1.4);
                    for(let y=0; y < height; y+=cellSizeAscii) {
                        for(let x=0; x < width; x+=cellSizeAscii) {
                           if (x < width && y < height) {
                                let c = webcam.get(x,y);
                                let bright = (red(c)+green(c)+blue(c))/3;
                                let charIndex = floor(map(bright, 0, 255, asciiChars.length-1, 0));
                                tempG.text(asciiChars.charAt(charIndex), x+cellSizeAscii/2, y+cellSizeAscii/2);
                           }
                        }
                    }
                    break;
                case 3:
                    // Per il puntinismo, basta copiare l'immagine attuale
                    tempG.image(get(), 0, 0);
                    break;
            }
            tempG.pop();
            save(tempG, 'my-filter.png');
        }
    }
})();


