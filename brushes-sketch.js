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
        1: 'Bubbles', 2: 'Random Letters', 3: 'Organic (sounds reactive)', 4: 'Orbiting Dots',
        5: 'Spray Paint', 6: 'Swellings', 7: 'Web', 8: 'Crystallize',
        9: 'Soft Eraser', 0: 'Shape Eraser'
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
        3: 'Organic<br>(sounds reactive)',
        4: 'Orbiting Dots',
        5: 'Spray Paint',
        6: 'Swellings',
        7: 'Web',
        8: 'Crystallize',
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
        etichettaPennello.html(nomiPennelli[tipoPennello]);

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
    
    function mostraAnteprimaPennello(dimensione, custom, volume) {
        layerAnteprima.push();
        layerAnteprima.translate(mouseX, mouseY);
        
        let brightness = red(coloreSfondo) * 0.299 + green(coloreSfondo) * 0.587 + blue(coloreSfondo) * 0.114;
        let previewColor = (brightness > 128) ? color(0, 100) : color(255, 100);

        layerAnteprima.noFill();
        layerAnteprima.stroke(previewColor);
        layerAnteprima.strokeWeight(1.5);

        switch(tipoPennello) {
            case 3:
                layerAnteprima.beginShape();
                for (let a = 0; a < TWO_PI; a += 0.5) {
                    let r = dimensione / 2 + noise(a * 10, millis() * 0.001) * (volume * 200);
                    layerAnteprima.vertex(cos(a) * r, sin(a) * r);
                }
                layerAnteprima.endShape(CLOSE);
                break;
            case 6: layerAnteprima.beginShape(); layerAnteprima.vertex(-dimensione/2, 0); layerAnteprima.bezierVertex(-dimensione/4, -dimensione/10, 0, -dimensione/8, dimensione/4, -dimensione/10); layerAnteprima.vertex(dimensione/2, 0); layerAnteprima.vertex(dimensione/4, dimensione/10); layerAnteprima.vertex(0, dimensione/8); layerAnteprima.vertex(-dimensione/4, dimensione/10); layerAnteprima.endShape(CLOSE); break;
            case 7: layerAnteprima.ellipse(0, 0, 4, 4); layerAnteprima.ellipse(-dimensione/3, -dimensione/4, 4, 4); layerAnteprima.ellipse(dimensione/2.5, -dimensione/3, 4, 4); layerAnteprima.ellipse(dimensione/4, dimensione/2.5, 4, 4); layerAnteprima.line(0,0, -dimensione/3, -dimensione/4); layerAnteprima.line(0,0, dimensione/2.5, -dimensione/3); break;
            case 8: layerAnteprima.beginShape(); layerAnteprima.vertex(0,0); layerAnteprima.vertex(-dimensione/4, -dimensione/2); layerAnteprima.vertex(-dimensione/5, -dimensione/5); layerAnteprima.vertex(-dimensione/2, 0); layerAnteprima.vertex(0,0); layerAnteprima.vertex(dimensione/3, dimensione/4); layerAnteprima.vertex(dimensione/2, dimensione/2.5); layerAnteprima.endShape(); break;
            case 0: disegnaFormaGomma(layerAnteprima, dimensione, custom); break;
            case 1: layerAnteprima.ellipse(dimensione*0.1, -dimensione*0.2, dimensione*0.5); layerAnteprima.ellipse(-dimensione*0.2, dimensione*0.15, dimensione*0.3); layerAnteprima.ellipse(-dimensione*0.3, -dimensione*0.25, dimensione*0.2); break;
            case 2: layerAnteprima.textSize(dimensione); layerAnteprima.textAlign(CENTER, CENTER); layerAnteprima.text('A', 0, 0); break;
            case 4: for (let i = 0; i < 3; i++) layerAnteprima.ellipse(cos(TWO_PI*i/3) * dimensione/2, sin(TWO_PI*i/3) * dimensione/2, dimensione/5); break;
            case 5: for(let i=0; i<40; i++) { let a=noise(i)*TWO_PI*2; let r=noise(i+10)*dimensione/2; layerAnteprima.rect(cos(a)*r, sin(a)*r, 1, 1); } break;
            case 9: layerAnteprima.ellipse(0,0,dimensione); break;
            default: layerAnteprima.ellipse(0, 0, dimensione); break;
        }
        layerAnteprima.pop();
    }

    function disegnaSuTela(dimensione, trasparenza, custom, velocita, volume) {
        let c = color(red(colorePennello), green(colorePennello), blue(colorePennello), trasparenza);
        
        if (tipoPennello === 9) { // Soft Eraser
            telaDisegno.noStroke();
            let num_steps = 80;
            let durezza = map(custom, 1, 100, 0.1, 2);
            for (let i = num_steps; i > 0; i--) {
                let r = dimensione * (i / num_steps);
                let alpha = pow(1 - (i / num_steps), durezza) * 255;
                telaDisegno.fill(red(coloreSfondo), green(coloreSfondo), blue(coloreSfondo), alpha);
                telaDisegno.ellipse(mouseX, mouseY, r, r);
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
        
        let easedCustom = pow(custom / 100, 2);

        switch (tipoPennello) {
            case 6:
                let sensSwell = map(custom, 1, 100, 0.1, 1);
                telaDisegno.strokeWeight(dimensione * 0.1 + velocita * sensSwell);
                telaDisegno.stroke(c);
                telaDisegno.noFill();
                if(velocita > 2) {
                    telaDisegno.line(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente);
                }
                break;
            case 7:
                let numPunti = floor(map(custom, 1, 100, 2, 20));
                puntiPrecedenti.push(createVector(mouseX, mouseY));
                if (puntiPrecedenti.length > numPunti) {
                    puntiPrecedenti.shift();
                }
                telaDisegno.stroke(c);
                telaDisegno.strokeWeight(map(dimensione, 5, 200, 0.5, 5));
                for (let i=0; i<puntiPrecedenti.length; i+=2) {
                    telaDisegno.line(mouseX, mouseY, puntiPrecedenti[i].x, puntiPrecedenti[i].y);
                }
                break;
            case 8:
                if (velocita > 1) {
                    let shatter = map(easedCustom, 0, 1, 10, dimensione * 2);
                    telaDisegno.stroke(c);
                    telaDisegno.strokeWeight(1);
                    telaDisegno.line(mouseX, mouseY, mouseX + random(-shatter, shatter), mouseY + random(-shatter, shatter));
                    telaDisegno.line(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente);
                }
                break;
            case 1: let freq=map(easedCustom,0,1,1,15); for (let i = 0; i < freq; i++) { telaDisegno.fill(red(c), green(c), blue(c), trasparenza * random(0.1, 1)); telaDisegno.ellipse(mouseX + random(-dimensione/2, dimensione/2), mouseY + random(-dimensione/2, dimensione/2), random(dimensione * 0.1, dimensione * 0.6)); } break;
            case 2: if (frameCount % floor(map(custom, 1, 100, 20, 1)) === 0) { telaDisegno.textSize(dimensione); telaDisegno.text('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(floor(random(26))), mouseX - dimensione/2.5, mouseY + dimensione/2.5); } break;
            case 3: telaDisegno.push(); telaDisegno.translate(mouseX,mouseY); let sens=map(easedCustom,0,1,50,2500); telaDisegno.beginShape(); for (let a=0; a<TWO_PI; a+=0.3) telaDisegno.vertex(cos(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens)), sin(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens))); telaDisegno.endShape(CLOSE); telaDisegno.pop(); break;
            case 4: telaDisegno.push(); telaDisegno.translate(mouseX,mouseY); let velRotazione=map(easedCustom,0,1,0.01,0.5); for (let i=0; i<3; i++) telaDisegno.ellipse(cos(TWO_PI*(i/3)+angolo)*dimensione/1.5, sin(TWO_PI*(i/3)+angolo)*dimensione/1.5, dimensione/5); angolo += velRotazione; telaDisegno.pop(); break;
            case 5: let densita=map(easedCustom,0,1,5,250); for (let i=0; i<densita; i++) { let r = sqrt(random(1)) * (dimensione / 2); let a = random(TWO_PI); telaDisegno.ellipse(mouseX + cos(a)*r, mouseY + sin(a)*r, 1, 1); } break;
        }
    }
    
    // --- FIX: Funzione helper per la gomma a forme semplificata e corretta ---
    function disegnaFormaGomma(pg, dimensione, custom) {
        let tipoForma = floor(map(custom, 1, 101, 1, 11));
        
        // Il contesto (fill, stroke, ecc.) è ora gestito dalla funzione chiamante
        pg.push();
        pg.rectMode(CENTER);
        let spessoreLinea = max(1, dimensione / 10);

        switch (tipoForma) {
            case 1: pg.rect(0, 0, dimensione, spessoreLinea); break;
            case 2: pg.rect(0, 0, spessoreLinea, dimensione); break;
            default: disegnaPoligono(pg, getLati(tipoForma), dimensione / 2); break;
        }
        pg.pop();
    }
    
    function getLati(tipoForma) {
        switch (tipoForma) {
            case 3: return 3; case 4: return 4; case 5: return 5;
            case 6: return 6; case 7: return 8; case 8: return 10;
            case 9: return 12; case 10: return 60;
            default: return 60;
        }
    }

    function disegnaPoligono(pg, lati, raggio) {
        let angle = TWO_PI / lati;
        pg.beginShape();
        for (let a = -PI/2; a < TWO_PI - PI/2; a += angle) {
             let sx = cos(a) * raggio;
             let sy = sin(a) * raggio;
             pg.vertex(sx, sy);
        }
        pg.endShape(CLOSE);
    }
    
    function ottieniVelocitaMouse() { if (mouseXPrecedente === undefined) return 0; return dist(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente); }
    
    window.keyPressed = function() {
        if (document.activeElement.tagName === "INPUT") return;
        if (key >= '0' && key <= '9') {
            tipoPennello = parseInt(key);
            etichettaPennello.html(nomiPennelli[tipoPennello]);
        }
        if (key === ' ') { telaDisegno.background(coloreSfondo); return false; }
        if (key.toLowerCase() === 's') { saveCanvas(telaDisegno, 'my-artwork', 'png'); }
    }
})();

