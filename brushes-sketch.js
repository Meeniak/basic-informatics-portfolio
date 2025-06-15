// A self-invoking function to prevent variables from leaking into the global scope
(function() {
    let tipoPennello = 1;
    let colorePennello, coloreSfondo;
    let telaDisegno, layerAnteprima;

    // UI Elements
    let selettoreColore, selettoreSfondo;
    let sliderDimensione, sliderTrasparenza, sliderCustom;
    let etichettaPennello;

    // Brush-specific variables
    let mouseXPrecedente, mouseYPrecedente;
    let angolo = 0;
    let microfono;
    let puntiPrecedenti = [];

    // Corrected Brush Names and Logic
    const nomiPennelli = {
        1: 'Bubbles',
        2: 'Random Letters',
        3: 'Organic (Volume)',
        4: 'Orbiting Dots',
        5: 'Spray Paint',
        6: 'Swellings',
        7: 'Web',
        8: 'Crystallize', // New Brush
        9: 'Soft Eraser',
        0: 'Shape Eraser'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        canvas.parent(canvasWrapper);
        
        telaDisegno = createGraphics(width, height);
        layerAnteprima = createGraphics(width, height);
        coloreSfondo = color(24, 24, 24);
        telaDisegno.background(coloreSfondo);
        
        // Hide default cursor ONLY over the canvas, handled by CSS now.

        // --- UI Initialization ---
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

        sliderCustom = createSlider(1, 100, 50);
        sliderCustom.parent('custom-slider-container');
        sliderCustom.style('width', '100%');
        
        etichettaPennello = select('#current-brush-label');
        etichettaPennello.html(`Current: ${nomiPennelli[tipoPennello]}`);

        microfono = new p5.AudioIn();
        microfono.start();
    }

    window.draw = function() {
        let dimensionePennello = sliderDimensione.value();
        let trasparenzaPennello = sliderTrasparenza.value();
        let customValue = sliderCustom.value();
        
        let velocitaMouse = ottieniVelocitaMouse();
        let volume = microfono.getLevel();

        background(coloreSfondo);
        image(telaDisegno, 0, 0);

        layerAnteprima.clear();
        if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            mostraAnteprimaPennello(dimensionePennello, customValue, volume);
        }
        image(layerAnteprima, 0, 0);
        
        if (mouseIsPressed && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            disegnaSuTela(dimensionePennello, trasparenzaPennello, customValue, velocitaMouse, volume);
        }

        mouseXPrecedente = mouseX;
        mouseYPrecedente = mouseY;
    }
    
    // --- NEW PREVIEW FUNCTION ---
    function mostraAnteprimaPennello(dimensione, custom, volume) {
        layerAnteprima.push();
        layerAnteprima.translate(mouseX, mouseY);
        layerAnteprima.noFill();
        layerAnteprima.stroke(255, 100);
        layerAnteprima.strokeWeight(1);

        switch(tipoPennello) {
            case 1: // Bubbles
                for(let i=0; i<5; i++) layerAnteprima.ellipse(random(-dimensione/3, dimensione/3), random(-dimensione/3, dimensione/3), random(dimensione*0.2, dimensione*0.5));
                break;
            case 2: // Letters
                layerAnteprima.textSize(dimensione); layerAnteprima.textAlign(CENTER, CENTER); layerAnteprima.text('A', 0, 0);
                break;
            case 3: // Organic
                layerAnteprima.beginShape();
                for (let a = 0; a < TWO_PI; a += 0.5) {
                    let r = dimensione / 2 + noise(a * 10, millis() * 0.001) * (volume * 200);
                    layerAnteprima.vertex(cos(a) * r, sin(a) * r);
                }
                layerAnteprima.endShape(CLOSE);
                break;
            case 4: // Orbiting Dots
                for (let i = 0; i < 3; i++) layerAnteprima.ellipse(cos(TWO_PI*(i/3)+millis()*0.002) * dimensione/1.5, sin(TWO_PI*(i/3)+millis()*0.002) * dimensione/1.5, dimensione/5);
                break;
            case 8: // Crystallize
                for(let i=0; i<5; i++) layerAnteprima.line(0,0, random(-dimensione, dimensione), random(-dimensione, dimensione));
                break;
            case 9: // Soft Eraser
                let softness = map(custom, 1, 100, 5, 40);
                for(let i = softness; i > 0; i--) { let d = map(i, softness, 0, dimensione, 0); layerAnteprima.ellipse(0, 0, d); }
                break;
            case 0: // Shape Eraser
                let lati = floor(map(custom, 1, 100, 2, 12));
                layerAnteprima.beginShape();
                for (let i = 0; i < lati; i++) {
                    let ang = map(i, 0, lati, 0, TWO_PI);
                    layerAnteprima.vertex(cos(ang) * dimensione/2, sin(ang) * dimensione/2);
                }
                layerAnteprima.endShape(CLOSE);
                break;
            default: // Default circle preview for others
                layerAnteprima.ellipse(0, 0, dimensione);
                break;
        }
        layerAnteprima.pop();
    }

    function disegnaSuTela(dimensione, trasparenza, custom, velocita, volume) {
        let c = color(red(colorePennello), green(colorePennello), blue(colorePennello), trasparenza);
        
        if (tipoPennello === 9) { // Soft Eraser
            let morbidezza = map(custom, 1, 100, 5, 50);
            for (let i = morbidezza; i > 0; i--) {
                let d = map(i, morbidezza, 0, dimensione, 0);
                let a = map(i, morbidezza, 0, 0, 255);
                telaDisegno.fill(red(coloreSfondo), green(coloreSfondo), blue(coloreSfondo), a);
                telaDisegno.noStroke();
                telaDisegno.ellipse(mouseX, mouseY, d, d);
            }
            return;
        } else if (tipoPennello === 0) { // Shape Eraser
            telaDisegno.erase();
            let lati = floor(map(custom, 1, 100, 2, 12));
            telaDisegno.push();
            telaDisegno.translate(mouseX, mouseY);
            telaDisegno.beginShape();
            for(let i=0; i<lati; i++) { let ang = map(i, 0, lati, 0, TWO_PI); telaDisegno.vertex(cos(ang) * dimensione/2, sin(ang) * dimensione/2); }
            telaDisegno.endShape(CLOSE);
            telaDisegno.pop();
            telaDisegno.noErase();
            return;
        }

        telaDisegno.noStroke();
        telaDisegno.fill(c);

        switch (tipoPennello) {
            case 1: // Bubbles
                let freq = map(custom, 1, 100, 1, 15);
                for (let i = 0; i < freq; i++) {
                    telaDisegno.fill(red(c), green(c), blue(c), trasparenza * random(0.1, 1));
                    telaDisegno.ellipse(mouseX + random(-dimensione/2, dimensione/2), mouseY + random(-dimensione/2, dimensione/2), random(dimensione * 0.1, dimensione * 0.6));
                }
                break;
            case 2: // Letters
                if (frameCount % floor(map(custom, 1, 100, 20, 1)) === 0) {
                    telaDisegno.textSize(dimensione);
                    telaDisegno.text('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(floor(random(26))), mouseX - dimensione/2.5, mouseY + dimensione/2.5);
                }
                break;
            case 3: // Organic
                let sens = map(custom, 1, 100, 100, 800);
                telaDisegno.beginShape();
                for (let a=0; a<TWO_PI; a+=0.3) telaDisegno.vertex(mouseX + cos(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens)), mouseY + sin(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens)));
                telaDisegno.endShape(CLOSE);
                break;
            case 4: // Orbiting Dots
                let velRotazione = map(custom, 1, 100, 0.01, 0.2);
                for (let i=0; i<3; i++) telaDisegno.ellipse(mouseX + cos(TWO_PI*(i/3)+angolo) * dimensione/1.5, mouseY + sin(TWO_PI*(i/3)+angolo) * dimensione/1.5, dimensione/5);
                angolo += velRotazione;
                break;
            case 5: // Spray Paint
                let densita = map(custom, 1, 100, 5, 200);
                for (let i=0; i<densita; i++) telaDisegno.ellipse(mouseX + cos(random(TWO_PI))*random(dimensione/2), mouseY + sin(random(TWO_PI))*random(dimensione/2), 1, 1);
                break;
            case 6: // Swellings
                let sensSwell = map(custom, 1, 100, 0.1, 1);
                telaDisegno.strokeWeight(dimensione * 0.1 + velocita * sensSwell);
                telaDisegno.stroke(c); telaDisegno.noFill();
                if(velocita > 2) telaDisegno.line(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente);
                break;
            case 7: // Web
                let numPunti = floor(map(custom, 1, 100, 2, 20));
                puntiPrecedenti.push(createVector(mouseX, mouseY));
                if (puntiPrecedenti.length > numPunti) puntiPrecedenti.shift();
                telaDisegno.stroke(c); telaDisegno.strokeWeight(map(dimensione, 5, 200, 0.5, 5));
                for (let i=0; i<puntiPrecedenti.length; i+=2) telaDisegno.line(mouseX, mouseY, puntiPrecedenti[i].x, puntiPrecedenti[i].y);
                break;
            case 8: // Crystallize
                if (velocita > 1) {
                    let shatter = map(custom, 1, 100, 10, dimensione*2);
                    telaDisegno.stroke(c); telaDisegno.strokeWeight(1);
                    telaDisegno.line(mouseX, mouseY, mouseX + random(-shatter, shatter), mouseY + random(-shatter, shatter));
                    telaDisegno.line(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente);
                }
                break;
        }
    }

    function ottieniVelocitaMouse() {
        if (mouseXPrecedente === undefined) return 0;
        return dist(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente);
    }
    
    window.keyPressed = function() {
        if (document.activeElement.tagName === "INPUT") return;
        if (key >= '0' && key <= '9') {
            tipoPennello = parseInt(key);
            etichettaPennello.html(`Current: ${nomiPennelli[tipoPennello]}`);
        }
        if (key === ' ') {
            telaDisegno.background(coloreSfondo); return false; 
        }
        if (key.toLowerCase() === 's') {
            saveCanvas(telaDisegno, 'my-artwork', 'png');
        }
    }
})();
