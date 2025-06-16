(function() {
    let tipoPennello = 1;
    let colorePennello, coloreSfondo;
    let telaDisegno, layerAnteprima;

    let selettoreColore, selettoreSfondo;
    let sliderDimensione, sliderTrasparenza, sliderCustom;
    let etichettaPennello;
    let brushColorDot, bgColorDot;

    let mouseXPrecedente, mouseYPrecedente;
    let angolo = 0;
    let microfono;
    let puntiPrecedenti = [];

    const nomiPennelli = {
        1: 'Bubbles',
        2: 'Random Letters',
        3: 'Organic (sounds reactive)',
        4: 'Orbiting Dots',
        5: 'Spray Paint',
        6: 'Hourglass', // Nome modificato
        7: 'Octagram', // Nome modificato
        8: 'Marker',     // Nome modificato
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
        
        brushColorDot = document.getElementById('brush-color-dot');
        bgColorDot = document.getElementById('bg-color-dot');
        
        selettoreColore = createColorPicker('#FFFFFF');
        selettoreColore.parent('color-picker-container');
        selettoreColore.input(() => {
            colorePennello = selettoreColore.color();
            brushColorDot.style.backgroundColor = selettoreColore.value();
        });
        colorePennello = selettoreColore.color();
        brushColorDot.style.backgroundColor = selettoreColore.value();

        selettoreSfondo = createColorPicker(coloreSfondo);
        selettoreSfondo.parent('bg-color-picker-container');
        selettoreSfondo.input(() => {
            coloreSfondo = selettoreSfondo.color();
            telaDisegno.background(coloreSfondo);
            bgColorDot.style.backgroundColor = selettoreSfondo.value();
        });
        bgColorDot.style.backgroundColor = selettoreSfondo.value();

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
            mostraAnteprimaPennello(dimensionePennello, customValue);
        }
        image(layerAnteprima, 0, 0);
        
        if (mouseIsPressed && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            disegnaSuTela(dimensionePennello, trasparenzaPennello, customValue, velocitaMouse, volume);
        }
        mouseXPrecedente = mouseX;
        mouseYPrecedente = mouseY;
    }
    
    function mostraAnteprimaPennello(dimensione, custom) {
        layerAnteprima.push();
        layerAnteprima.translate(mouseX, mouseY);
        layerAnteprima.noFill();
        layerAnteprima.stroke(255, 100);
        layerAnteprima.strokeWeight(1);

        switch(tipoPennello) {
            case 6: // Hourglass Preview
                layerAnteprima.beginShape();
                layerAnteprima.vertex(-dimensione/2, -dimensione/4);
                layerAnteprima.bezierVertex(-dimensione/8, 0, -dimensione/8, 0, -dimensione/2, dimensione/4);
                layerAnteprima.endShape();
                layerAnteprima.beginShape();
                layerAnteprima.vertex(dimensione/2, -dimensione/4);
                layerAnteprima.bezierVertex(dimensione/8, 0, dimensione/8, 0, dimensione/2, dimensione/4);
                layerAnteprima.endShape();
                break;
            case 7: // Octagram Preview
                let vertici = [];
                for(let i=0; i<8; i++) vertici.push({x: cos(TWO_PI*i/8)*dimensione/2, y: sin(TWO_PI*i/8)*dimensione/2});
                for(let i=0; i<8; i++) for(let j=i+1; j<8; j++) layerAnteprima.line(vertici[i].x, vertici[i].y, vertici[j].x, vertici[j].y);
                break;
            case 8: // Marker Preview
                layerAnteprima.line(-dimensione/2, 0, dimensione/2, 0);
                layerAnteprima.line(0,0, -dimensione/4, -dimensione/4);
                layerAnteprima.line(0,0, dimensione/4, -dimensione/4);
                break;
            case 0: // Shape Eraser Preview
                disegnaFormaGomma(layerAnteprima, dimensione, custom);
                break;
            // Previews for other brushes (already static)
            case 1: layerAnteprima.ellipse(dimensione*0.1, -dimensione*0.2, dimensione*0.5); layerAnteprima.ellipse(-dimensione*0.2, dimensione*0.15, dimensione*0.3); layerAnteprima.ellipse(-dimensione*0.3, -dimensione*0.25, dimensione*0.2); break;
            case 2: layerAnteprima.textSize(dimensione); layerAnteprima.textAlign(CENTER, CENTER); layerAnteprima.text('A', 0, 0); break;
            case 3: layerAnteprima.beginShape(); for (let a = 0; a < TWO_PI; a += 0.5) layerAnteprima.vertex(cos(a)*dimensione/2.5, sin(a)*dimensione/2.5); layerAnteprima.endShape(CLOSE); break;
            case 4: for (let i = 0; i < 3; i++) layerAnteprima.ellipse(cos(TWO_PI*i/3) * dimensione/2, sin(TWO_PI*i/3) * dimensione/2, dimensione/5); break;
            case 5: for(let i=0; i<40; i++) { let a=noise(i)*TWO_PI*2; let r=noise(i+10)*dimensione/2; layerAnteprima.rect(cos(a)*r, sin(a)*r, 1, 1); } break;
            case 9: layerAnteprima.ellipse(0,0,dimensione); break; // Concentric circles are fine for preview
            default: layerAnteprima.ellipse(0, 0, dimensione); break;
        }
        layerAnteprima.pop();
    }

    function disegnaSuTela(dimensione, trasparenza, custom, velocita, volume) {
        let c = color(red(colorePennello), green(colorePennello), blue(colorePennello), trasparenza);
        
        if (tipoPennello === 9) { // Soft Eraser
            // FIX: Molti più step per una sfumatura morbida
            let morbidezza = map(custom, 1, 100, 20, 100); // Da 20 a 100 step
            for (let i = morbidezza; i > 0; i--) {
                let d = map(i, morbidezza, 0, dimensione, 0);
                let a = map(i, morbidezza, 0, 0, 255 / (morbidezza*0.1)); // Calibra l'alpha per non essere troppo forte
                telaDisegno.fill(red(coloreSfondo), green(coloreSfondo), blue(coloreSfondo), a);
                telaDisegno.noStroke();
                telaDisegno.ellipse(mouseX, mouseY, d, d);
            }
            return;
        } else if (tipoPennello === 0) { // Shape Eraser
            telaDisegno.erase();
            telaDisegno.push();
            telaDisegno.translate(mouseX, mouseY);
            disegnaFormaGomma(telaDisegno, dimensione, custom);
            telaDisegno.pop();
            telaDisegno.noErase();
            return;
        }

        telaDisegno.noStroke();
        telaDisegno.fill(c);
        telaDisegno.push();
        telaDisegno.translate(mouseX, mouseY);

        switch (tipoPennello) {
            case 6: // Hourglass
                let vita = map(custom, 1, 100, dimensione/8, -dimensione/8);
                telaDisegno.beginShape();
                telaDisegno.vertex(-dimensione/2, -dimensione/4);
                telaDisegno.bezierVertex(-vita, 0, -vita, 0, -dimensione/2, dimensione/4);
                telaDisegno.bezierVertex(vita, 0, vita, 0, dimensione/2, dimensione/4);
                telaDisegno.bezierVertex(-vita, 0, -vita, 0, -dimensione/2, -dimensione/4);
                telaDisegno.endShape();
                break;
            case 7: // Octagram
                let rotazione = map(custom, 1, 100, 0, TWO_PI);
                let vertici = [];
                for(let i=0; i<8; i++) vertici.push({x: cos(TWO_PI*i/8 + rotazione)*dimensione/2, y: sin(TWO_PI*i/8 + rotazione)*dimensione/2});
                telaDisegno.beginShape();
                for(let i=0; i<8; i++) {
                    for(let j=i+1; j<8; j++) {
                        telaDisegno.line(vertici[i].x, vertici[i].y, vertici[j].x, vertici[j].y);
                    }
                }
                telaDisegno.endShape();
                break;
            case 8: // Marker
                let angoloObliquo = map(custom, 1, 100, PI/6, PI/3);
                telaDisegno.stroke(c);
                telaDisegno.strokeWeight(dimensione/10);
                telaDisegno.line(-dimensione/2, 0, dimensione/2, 0);
                telaDisegno.line(0,0, cos(angoloObliquo)*dimensione/2, sin(angoloObliquo)*dimensione/2);
                telaDisegno.line(0,0, cos(PI-angoloObliquo)*dimensione/2, sin(PI-angoloObliquo)*dimensione/2);
                telaDisegno.line(0,0, cos(angoloObliquo+PI)*dimensione/2, sin(angoloObliquo+PI)*dimensione/2);
                break;
            
            // --- Pennelli precedenti (invariati o già modificati) ---
            case 1: telaDisegno.translate(-mouseX, -mouseY); let freq=map(custom,1,100,1,15); for (let i=0; i<freq; i++) { telaDisegno.fill(red(c), green(c), blue(c), trasparenza * random(0.1, 1)); telaDisegno.ellipse(mouseX + random(-dimensione/2, dimensione/2), mouseY + random(-dimensione/2, dimensione/2), random(dimensione * 0.1, dimensione * 0.6)); } break;
            case 2: telaDisegno.translate(-mouseX, -mouseY); if (frameCount % floor(map(custom, 1, 100, 20, 1)) === 0) { telaDisegno.textSize(dimensione); telaDisegno.text('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(floor(random(26))), mouseX - dimensione/2.5, mouseY + dimensione/2.5); } break;
            case 3: let sens=map(custom, 1, 100, 100, 800); telaDisegno.beginShape(); for (let a=0; a<TWO_PI; a+=0.3) telaDisegno.vertex(cos(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens)), sin(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens))); telaDisegno.endShape(CLOSE); break;
            case 4: let velRotazione=map(custom, 1, 100, 0.01, 0.2); for (let i=0; i<3; i++) telaDisegno.ellipse(cos(TWO_PI*(i/3)+angolo)*dimensione/1.5, sin(TWO_PI*(i/3)+angolo)*dimensione/1.5, dimensione/5); angolo += velRotazione; break;
            case 5: telaDisegno.translate(-mouseX, -mouseY); let densita=map(custom, 1, 100, 5, 200); for (let i=0; i<densita; i++) telaDisegno.ellipse(mouseX + cos(random(TWO_PI))*random(dimensione/2), mouseY + sin(random(TWO_PI))*random(dimensione/2), 1, 1); break;
        }
        telaDisegno.pop();
    }
    
    // --- NEW HELPER FUNCTION FOR SHAPE ERASER ---
    function disegnaFormaGomma(pg, dimensione, custom) {
        let tipoForma = floor(map(custom, 1, 101, 1, 11)); // Map 1-100 to 10 shapes
        pg.push();
        pg.noFill(); // For previews
        if (pg === telaDisegno) pg.fill(coloreSfondo); // For actual erasing

        switch (tipoForma) {
            case 1: pg.strokeWeight(dimensione/5); pg.line(-dimensione/2, 0, dimensione/2, 0); break; // H-Line
            case 2: pg.strokeWeight(dimensione/5); pg.line(0, -dimensione/2, 0, dimensione/2); break; // V-Line
            case 3: disegnaPoligono(pg, 3, dimensione/2); break; // Triangle
            case 4: disegnaPoligono(pg, 4, dimensione/2); break; // Square
            case 5: disegnaPoligono(pg, 5, dimensione/2); break; // Pentagon
            case 6: disegnaPoligono(pg, 6, dimensione/2); break; // Hexagon
            case 7: disegnaPoligono(pg, 8, dimensione/2); break; // Octagon
            case 8: disegnaPoligono(pg, 10, dimensione/2); break; // Decagon
            case 9: disegnaPoligono(pg, 12, dimensione/2); break; // Dodecagon
            case 10: pg.ellipse(0, 0, dimensione); break; // Circle
        }
        pg.pop();
    }

    function disegnaPoligono(pg, lati, raggio) {
        pg.beginShape();
        for (let i = 0; i < lati; i++) {
            let ang = map(i, 0, lati, 0, TWO_PI);
            pg.vertex(cos(ang) * raggio, sin(ang) * raggio);
        }
        pg.endShape(CLOSE);
    }

    function ottieniVelocitaMouse() { if (mouseXPrecedente === undefined) return 0; return dist(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente); }
    
    window.keyPressed = function() {
        if (document.activeElement.tagName === "INPUT") return;
        if (key >= '0' && key <= '9') {
            tipoPennello = parseInt(key);
            etichettaPennello.html(`Current: ${nomiPennelli[tipoPennello]}`);
        }
        if (key === ' ') { telaDisegno.background(coloreSfondo); return false; }
        if (key.toLowerCase() === 's') { saveCanvas(telaDisegno, 'my-artwork', 'png'); }
    }
})();
