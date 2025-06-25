(function() {
    let webcam;
    let slider;
    let filterLabel;
    let currentFilter = 1;

    // Variabili per i filtri specifici
    const asciiChars = '       .:-i|=+*#%@'; // Da scuro a chiaro
    let slitScanX = 0; // Posizione per lo slit-scan

    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Slit-Scan'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(640, 480); // Dimensioni classiche per webcam
        canvas.parent(canvasWrapper);
        
        // Inizializza la webcam
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide();

        // UI
        filterLabel = select('#current-filter-label');
        slider = createSlider(10, 80, 40, 2);
        slider.parent('slider-container');
        slider.style('width', '100%');
        
        angleMode(DEGREES);
        textAlign(CENTER, CENTER);
        textFont('monospace');
    }

    window.draw = function() {
        background(0);
        
        // Specchia l'immagine orizzontalmente
        translate(width, 0);
        scale(-1, 1);

        switch (currentFilter) {
            case 1:
                drawMosaicFilter(slider.value());
                break;
            case 2:
                drawAsciiFilter(slider.value());
                break;
            case 3:
                drawSlitScanFilter(slider.value());
                break;
        }
    }

    // FILTRO 1: Il tuo mosaico rotante (leggermente ottimizzato)
    function drawMosaicFilter(cellSize) {
        webcam.loadPixels();
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                let angle = map(mouseX, 0, width, 0, 360);
                
                push();
                translate(x + cellSize / 2, y + cellSize / 2);
                rotate(angle);
                // Usa get() per ottenere una porzione dell'immagine, è più stabile
                let imgPortion = webcam.get(x, y, cellSize, cellSize);
                image(imgPortion, -cellSize / 2, -cellSize / 2);
                pop();
            }
        }
    }

    // FILTRO 2: ASCII Art
    function drawAsciiFilter(cellSize) {
        webcam.loadPixels();
        fill(255);
        noStroke();
        textSize(cellSize * 1.2);

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                let totalBrightness = 0;
                // Calcola la luminosità media della cella
                for (let i = 0; i < cellSize; i++) {
                    for (let j = 0; j < cellSize; j++) {
                        let index = ((x + i) + (y + j) * width) * 4;
                        let r = webcam.pixels[index];
                        let g = webcam.pixels[index + 1];
                        let b = webcam.pixels[index + 2];
                        totalBrightness += (r + g + b) / 3;
                    }
                }
                let avgBrightness = totalBrightness / (cellSize * cellSize);
                
                // Mappa la luminosità a un carattere ASCII
                let charIndex = floor(map(avgBrightness, 0, 255, 0, asciiChars.length -1));
                let char = asciiChars.charAt(charIndex);
                
                text(char, x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    // FILTRO 3: Slit-Scan (distorsione temporale)
    function drawSlitScanFilter(sliceWidth) {
        // Copia una fetta verticale di video dal centro della webcam
        let slice = webcam.get(webcam.width / 2 - sliceWidth / 2, 0, sliceWidth, webcam.height);
        
        // Disegna la fetta nella posizione corrente del canvas
        image(slice, slitScanX, 0);

        // Avanza la posizione di disegno
        slitScanX += sliceWidth;

        // Se abbiamo riempito il canvas, ricomincia da capo
        if (slitScanX >= width) {
            slitScanX = 0;
        }
    }


    window.keyPressed = function() {
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            filterLabel.html(`Current: ${filterNames[currentFilter]}`);
            if(currentFilter === 3) {
                // Pulisce il canvas quando si attiva lo slit-scan
                background(0);
                slitScanX = 0;
            }
        }
        
        if (key.toLowerCase() === 's') {
            // Per salvare correttamente l'immagine, la ridisegno senza la specchiatura
            push();
            resetMatrix(); // Rimuove tutte le trasformazioni (translate, scale)
            switch (currentFilter) {
                case 1: drawMosaicFilter(slider.value()); break;
                case 2: drawAsciiFilter(slider.value()); break;
                case 3: image(get(), 0, 0); break; // Salva lo stato attuale dello slit-scan
            }
            saveCanvas('my-filter', 'png');
            pop();
        }
    }
})();
