// Funzione auto-eseguibile per incapsulare lo script e non inquinare il global scope
(function() {
    let webcam;
    let slider;
    let filterLabel;
    let currentFilter = 1;

    // --- Variabili specifiche per i filtri ---
    
    // Stringa di caratteri usata per il filtro ASCII, ordinata da scuro a chiaro.
    const asciiChars = '    .:-i|=+*#%@'; 

    // Mappa che associa il numero del filtro al suo nome per visualizzarlo nell'interfaccia.
    // Anche se l'interfaccia non è qui, è una buona pratica tenerla per chiarezza.
    const filterNames = {
        1: 'Rotating Mosaic',
        2: 'ASCII Art',
        3: 'Thermal Vision' 
    };

    /**
     * SETUP: Eseguita una volta all'avvio dello sketch.
     * Inizializza il canvas, la webcam e gli elementi base.
     */
    window.setup = function() {
        // Crea un'area di disegno. Assumiamo che esista un contenitore con id 'canvas-wrapper'.
        // Se non esiste, il canvas verrà aggiunto al body.
        const canvas = createCanvas(640, 480); 
        
        // Inizializza la cattura video dalla webcam.
        webcam = createCapture(VIDEO);
        webcam.size(width, height);
        webcam.hide(); // Nasconde l'elemento <video> di default creato da p5.js.

        // Crea uno slider per controllare i parametri dei filtri.
        // createSlider(min, max, valoreIniziale, step)
        slider = createSlider(10, 80, 40, 2);
        
        // Impostazioni di disegno
        angleMode(DEGREES);      // Usa i gradi per le rotazioni invece dei radianti.
        textAlign(CENTER, CENTER); // Allinea il testo al centro.
        textFont('monospace');   // Imposta un font a larghezza fissa per l'ASCII art.
    }

    /**
     * DRAW: Eseguita in loop continuo, disegna ogni frame.
     */
    window.draw = function() {
        background(0); // Pulisce il canvas ad ogni frame con uno sfondo nero.
        
        // Per creare un effetto "specchio", specchiamo orizzontalmente il canvas.
        // Questo rende i movimenti più intuitivi per l'utente.
        translate(width, 0);
        scale(-1, 1);

        // Seleziona e applica il filtro corrente in base alla variabile 'currentFilter'.
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
    }

    // ===================================================================
    // --- DEFINIZIONE DEI FILTRI ---
    // ===================================================================

    /**
     * FILTRO 1: Mosaico Rotante
     * @param {number} cellSize - La dimensione di ogni cella del mosaico.
     */
    function drawMosaicFilter(cellSize) {
        webcam.loadPixels(); // Carica i dati dei pixel della webcam per poterli leggere (anche se qui usiamo get()).
        
        // Itera su una griglia invisibile che copre tutto il canvas.
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                // L'angolo di rotazione di ogni cella dipende dalla posizione orizzontale del mouse.
                let angle = map(mouseX, 0, width, 0, 360);
                
                push(); // Salva lo stato di disegno corrente (trasformazioni, colori, etc.).
                translate(x + cellSize / 2, y + cellSize / 2); // Sposta l'origine al centro della cella.
                rotate(angle); // Ruota il sistema di coordinate.
                
                // Estrae la porzione di immagine corrispondente alla cella.
                let imgPortion = webcam.get(x, y, cellSize, cellSize);
                // Disegna la porzione ruotata, centrata rispetto alla nuova origine.
                image(imgPortion, -cellSize / 2, -cellSize / 2);
                
                pop(); // Ripristina lo stato di disegno precedente.
            }
        }
    }

    /**
     * FILTRO 2: ASCII Art
     * @param {number} cellSize - La dimensione di ogni "carattere" ASCII.
     */
    function drawAsciiFilter(cellSize) {
        webcam.loadPixels(); // Carica i dati dei pixel per l'analisi.
        fill(255, 255, 255, 220); // Imposta il colore del testo a bianco semi-trasparente.
        noStroke();
        textSize(cellSize * 1.2); // La dimensione del testo è proporzionale alla cella.

        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                // Calcola la luminosità media dei pixel all'interno della cella.
                let totalBrightness = 0;
                for (let i = 0; i < cellSize; i++) {
                    for (let j = 0; j < cellSize; j++) {
                        let index = ((x + i) + (y + j) * width) * 4;
                        let r = webcam.pixels[index];
                        let g = webcam.pixels[index + 1];
                        let b = webcam.pixels[index + 2];
                        // Formula standard per la luminosità percepita dall'occhio umano.
                        totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
                    }
                }
                let avgBrightness = totalBrightness / (cellSize * cellSize);
                
                // Mappa la luminosità (0-255) a un indice nella stringa di caratteri ASCII.
                let charIndex = floor(map(avgBrightness, 0, 255, 0, asciiChars.length - 1));
                let charToDraw = asciiChars.charAt(charIndex);3
                
                // Disegna il carattere al centro della cella.
                text(charToDraw, x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    /**
     * FILTRO 3: Visione Termica
     * @param {number} cellSize - La dimensione di ogni blocco di colore.
     */
    function drawThermalFilter(cellSize) {
        webcam.loadPixels();
        noStroke(); // Non disegna i bordi dei rettangoli.

        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                // Calcola la luminosità media della cella (come nel filtro ASCII).
                let totalBrightness = 0;
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

                // Converte la luminosità in un colore "termico".
                let thermalColor = getColorForBrightness(avgBrightness);
                
                fill(thermalColor);
                rect(x, y, cellSize, cellSize); // Disegna un rettangolo colorato.
            }
        }
    }

    /**
     * Funzione di supporto per il filtro termico.
     * Converte un valore di luminosità (0-255) in un colore.
     * @param {number} brightness - Luminosità da 0 a 255.
     * @returns {p5.Color} Un oggetto colore di p5.js.
     */
    function getColorForBrightness(brightness) {
        // Mappa la luminosità su un gradiente di colori:
        // Scuro -> Blu -> Verde -> Giallo -> Rosso <- Luminoso
        if (brightness < 85) { // Da blu a ciano/verde
            return color(0, map(brightness, 0, 85, 0, 255), 255);
        } else if (brightness < 170) { // Da verde a giallo
            return color(map(brightness, 85, 170, 0, 255), 255, 0);
        } else { // Da giallo a rosso
            return color(255, map(brightness, 170, 255, 255, 0), 0);
        }
    }

    /**
     * KEYPRESSED: Eseguita ogni volta che un tasto viene premuto.
     * Gestisce il cambio di filtro e il salvataggio dell'immagine.
     */
    window.keyPressed = function() {
        // Cambia il filtro se viene premuto un tasto numerico da 1 a 3.
        if (key >= '1' && key <= '3') {
            currentFilter = parseInt(key);
            console.log(`Filtro cambiato a: ${filterNames[currentFilter]}`);
        }
        
        // Salva il canvas se viene premuto il tasto 'S'.
        if (key.toLowerCase() === 's') {
            // Per salvare correttamente l'immagine, va ridisegnata senza la trasformazione a specchio.
            push();
            resetMatrix(); // Rimuove tutte le trasformazioni (translate, scale).
            background(0); // Pulisce lo sfondo per evitare sovrapposizioni.
            
            // Ridisegna un singolo frame del filtro attivo.
            switch (currentFilter) {
                case 1: drawMosaicFilter(slider.value()); break;
                case 2: drawAsciiFilter(slider.value()); break;
                case 3: drawThermalFilter(slider.value()); break; 
            }
            
            saveCanvas('my-filtered-image', 'png'); // Salva l'immagine.
            pop();
        }
    }
})();











