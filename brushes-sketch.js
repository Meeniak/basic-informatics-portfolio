// A self-invoking function to prevent variables from leaking into the global scope
(function() {
    let tipoPennello = 1;
    let colorePennello;
    let coloreSfondo;

    // Graphics layers for drawing and preview
    let telaDisegno;
    let layerAnteprima;

    // UI Elements
    let selettoreColore, selettoreSfondo;
    let sliderDimensione, sliderTrasparenza;
    let etichettaPennello; // This will be the h3 element from the HTML

    // Brush-specific variables
    let mouseXPrecedente, mouseYPrecedente;
    let angolo = 0;
    let microfono;
    let puntiPrecedenti = []; // For the Web Brush

    // Map of brush names for the UI label
    const nomiPennelli = {
        1: 'Random Circles',
        2: 'Random Letters',
        3: 'Organic (Volume)',
        4: 'Rotating Dots',
        5: 'Spray Paint', // New
        6: 'Ribbon',      // New
        7: 'Web',         // New
        8: 'Ink Drips',   // New
        9: 'Soft Eraser', // New Eraser
        0: 'Hard Eraser'
    };


    // p5.js setup function
    window.setup = function() {
        // Create canvas and parent it to the wrapper div
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        canvas.parent(canvasWrapper);
        
        // Initialize graphics layers
        telaDisegno = createGraphics(width, height);
        layerAnteprima = createGraphics(width, height);
        coloreSfondo = color(24, 24, 24); // Dark background to match site
        telaDisegno.background(coloreSfondo);
        
        noCursor(); // We use our own custom cursor from script.js

        // --- UI Initialization ---
        // Parent UI elements to their respective containers in the HTML
        selettoreColore = createColorPicker('#FFFFFF');
        selettoreColore.parent('color-picker-container');
        selettoreColore.input(() => colorePennello = selettoreColore.color());
        colorePennello = selettoreColore.color();

        selettoreSfondo = createColorPicker(coloreSfondo);
        selettoreSfondo.parent('bg-color-picker-container');
        selettoreSfondo.input(() => {
            coloreSfondo = selettoreSfondo.color();
            telaDisegno.background(coloreSfondo);
        });

        sliderDimensione = createSlider(5, 200, 30);
        sliderDimensione.parent('size-slider-container');
        sliderDimensione.style('width', '100%');

        sliderTrasparenza = createSlider(10, 255, 200);
        sliderTrasparenza.parent('opacity-slider-container');
        sliderTrasparenza.style('width', '100%');
        
        // Get the label from the HTML to update it
        etichettaPennello = select('#current-brush-label');

        // Initialize microphone for audio-reactive brushes
        microfono = new p5.AudioIn();
        microfono.start();
        
        // Add a resize listener to make the canvas responsive
        window.addEventListener('resize', () => {
             resizeCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
             // We should also resize the graphics layers, but that would clear the drawing.
             // For a simple implementation, we'll just resize the main canvas.
        });
    }

    // p5.js draw function
    window.draw = function() {
        // Get values from sliders
        let dimensionePennello = sliderDimensione.value();
        let trasparenzaPennello = sliderTrasparenza.value();
        
        // Get interactive values
        let velocitaMouse = ottieniVelocitaMouse();
        let volume = microfono.getLevel();

        // Draw the persistent drawing layer
        background(coloreSfondo);
        image(telaDisegno, 0, 0);

        // Draw the temporary preview layer
        layerAnteprima.clear();
        if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            mostraAnteprimaPennello(dimensionePennello);
        }
        image(layerAnteprima, 0, 0);
        
        // If mouse is pressed, draw on the main canvas
        if (mouseIsPressed && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            disegnaSuTela(dimensionePennello, trasparenzaPennello, velocitaMouse, volume);
        }

        mouseXPrecedente = mouseX;
        mouseYPrecedente = mouseY;
    }

    function mostraAnteprimaPennello(dimensionePennello) {
        // A simple circle preview for most brushes
        layerAnteprima.push();
        layerAnteprima.noFill();
        layerAnteprima.stroke(255, 150); // White preview with some transparency
        layerAnteprima.strokeWeight(1);
        layerAnteprima.ellipse(mouseX, mouseY, dimensionePennello, dimensionePennello);
        layerAnteprima.pop();
    }

    function disegnaSuTela(dimensionePennello, trasparenzaPennello, velocitaMouse, volume) {
        let c = color(red(colorePennello), green(colorePennello), blue(colorePennello), trasparenzaPennello);
        
        // Eraser modes
        if (tipoPennello === 9) { // Soft Eraser
            gommaMorbida(dimensionePennello);
            return;
        } else if (tipoPennello === 0) { // Hard Eraser
            telaDisegno.erase();
            telaDisegno.ellipse(mouseX, mouseY, dimensionePennello);
            telaDisegno.noErase();
            return;
        }

        // Brush modes
        telaDisegno.noStroke();
        telaDisegno.fill(c);

        switch (tipoPennello) {
            case 1: // Random Circles
                for (let i = 0; i < 5; i++) {
                    let d = random(0.1, 0.6) * dimensionePennello;
                    let offsetX = random(-dimensionePennello / 2, dimensionePennello / 2);
                    let offsetY = random(-dimensionePennello / 2, dimensionePennello / 2);
                    telaDisegno.ellipse(mouseX + offsetX, mouseY + offsetY, d, d);
                }
                break;

            case 2: // Random Letters
                telaDisegno.textSize(dimensionePennello);
                let caratteri = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let carattereCasuale = caratteri.charAt(floor(random(caratteri.length)));
                telaDisegno.text(carattereCasuale, mouseX - dimensionePennello/2.5, mouseY + dimensionePennello/2.5);
                break;

            case 3: // Organic (Volume)
                telaDisegno.beginShape();
                for (let a = 0; a < TWO_PI; a += 0.3) {
                    let r = dimensionePennello / 2 + noise(a * 5, millis() * 0.005) * (volume * 300 + velocitaMouse * 5);
                    let x = mouseX + cos(a) * r;
                    let y = mouseY + sin(a) * r;
                    telaDisegno.vertex(x, y);
                }
                telaDisegno.endShape(CLOSE);
                break;

            case 4: // Rotating Dots
                 for (let i = 0; i < 3; i++) {
                    let offsetAngolo = TWO_PI * (i / 3) + angolo;
                    let raggio = dimensionePennello / 1.5;
                    let x = mouseX + cos(offsetAngolo) * raggio;
                    let y = mouseY + sin(offsetAngolo) * raggio;
                    telaDisegno.ellipse(x, y, dimensionePennello / 5);
                 }
                 angolo += velocitaMouse * 0.1;
                 break;

            // --- NEW BRUSHES ---
            case 5: // Spray Paint
                let densita = dimensionePennello;
                for (let i = 0; i < densita; i++) {
                    let angoloSpray = random(TWO_PI);
                    let raggioSpray = random(dimensionePennello / 2);
                    let x = mouseX + cos(angoloSpray) * raggioSpray;
                    let y = mouseY + sin(angoloSpray) * raggioSpray;
                    telaDisegno.ellipse(x, y, 1, 1);
                }
                break;

            case 6: // Ribbon
                telaDisegno.strokeWeight(dimensionePennello * (0.2 + velocitaMouse * 0.5));
                telaDisegno.stroke(c);
                telaDisegno.noFill();
                if(dist(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente) > 2) {
                    telaDisegno.line(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente);
                }
                break;

            case 7: // Web
                puntiPrecedenti.push(createVector(mouseX, mouseY));
                if (puntiPrecedenti.length > 20) {
                    puntiPrecedenti.shift();
                }
                telaDisegno.stroke(c);
                telaDisegno.strokeWeight(1);
                for (let i = 0; i < puntiPrecedenti.length; i += 4) {
                    telaDisegno.line(mouseX, mouseY, puntiPrecedenti[i].x, puntiPrecedenti[i].y);
                }
                break;
            
            case 8: // Ink Drips
                telaDisegno.ellipse(mouseX, mouseY, dimensionePennello * 0.8);
                if (velocitaMouse < 0.1 && random() < 0.1) { // Drip when slow
                    let dripX = mouseX + random(-dimensionePennello/2, dimensionePennello/2);
                    let dripY = mouseY;
                    let dripLength = random(20, 150);
                    let dripWidth = random(1, dimensionePennello * 0.2);
                    telaDisegno.rect(dripX, dripY, dripWidth, dripLength);
                }
                break;
        }
    }

    // --- NEW SOFT ERASER ---
    function gommaMorbida(dimensione) {
        let gradiente = 20; // Number of steps in the gradient
        for (let i = gradiente; i > 0; i--) {
            let d = map(i, gradiente, 0, dimensione, 0);
            let a = map(i, gradiente, 0, 0, 255); // Alpha fades out
            let col = color(red(coloreSfondo), green(coloreSfondo), blue(coloreSfondo), a);
            telaDisegno.fill(col);
            telaDisegno.noStroke();
            telaDisegno.ellipse(mouseX, mouseY, d, d);
        }
    }

    function ottieniVelocitaMouse() {
        if (mouseXPrecedente === undefined || mouseYPrecedente === undefined) return 0;
        return dist(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente);
    }
    
    // p5.js keyPressed function
    window.keyPressed = function() {
        // Prevent shortcuts if typing in an input (not needed for pickers, but good practice)
        if (document.activeElement.tagName === "INPUT") return;

        // Brush selection
        if (key >= '0' && key <= '9') {
            tipoPennello = parseInt(key);
            etichettaPennello.html(`Current: ${nomiPennelli[tipoPennello]}`);
        }
        
        // Clear canvas
        if (key === ' ') {
            telaDisegno.background(coloreSfondo);
            // Prevent default browser action for spacebar (scrolling)
            return false; 
        }

        // Save canvas
        if (key === 's' || key === 'S') {
            saveCanvas(telaDisegno, 'my-artwork', 'png');
        }
    }
})();
