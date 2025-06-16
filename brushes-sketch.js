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
        6: 'Hourglass',
        7: 'Octagram',
        8: 'Marker',
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
        layerAnteprima.strokeWeight(1.5); // Leggermente più spesso per chiarezza

        switch(tipoPennello) {
            case 6: // Hourglass Preview (più pulita)
                layerAnteprima.beginShape();
                layerAnteprima.vertex(-dimensione/2, -dimensione/4);
                layerAnteprima.bezierVertex(-dimensione/8, 0, -dimensione/8, 0, -dimensione/2, dimensione/4);
                layerAnteprima.endShape();
                layerAnteprima.beginShape();
                layerAnteprima.vertex(dimensione/2, -dimensione/4);
                layerAnteprima.bezierVertex(dimensione/8, 0, dimensione/8, 0, dimensione/2, dimensione/4);
                layerAnteprima.endShape();
                break;
            case 7: // Octagram Preview (più pulita)
                layerAnteprima.beginShape();
                for(let i=0; i<8; i++) {
                    layerAnteprima.vertex(cos(TWO_PI*i/8)*dimensione/2, sin(TWO_PI*i/8)*dimensione/2);
                }
                layerAnteprima.endShape(CLOSE);
                break;
            case 8: // Marker Preview (più pulita)
                layerAnteprima.strokeWeight(dimensione/10);
                layerAnteprima.line(-dimensione/2, 0, dimensione/2, 0);
                layerAnteprima.strokeWeight(1);
                layerAnteprima.line(0,0, -dimensione/3.5, -dimensione/3.5);
                layerAnteprima.line(0,0, dimensione/3.5, -dimensione/3.5);
                break;
            // Altre anteprime...
            case 0: disegnaFormaGomma(layerAnteprima, dimensione, custom); break;
            case 1: layerAnteprima.ellipse(dimensione*0.1, -dimensione*0.2, dimensione*0.5); layerAnteprima.ellipse(-dimensione*0.2, dimensione*0.15, dimensione*0.3); layerAnteprima.ellipse(-dimensione*0.3, -dimensione*0.25, dimensione*0.2); break;
            case 2: layerAnteprima.textSize(dimensione); layerAnteprima.textAlign(CENTER, CENTER); layerAnteprima.text('A', 0, 0); break;
            case 3: layerAnteprima.beginShape(); for (let a = 0; a < TWO_PI; a += 0.5) layerAnteprima.vertex(cos(a)*dimensione/2.5, sin(a)*dimensione/2.5); layerAnteprima.endShape(CLOSE); break;
            case 4: for (let i = 0; i < 3; i++) layerAnteprima.ellipse(cos(TWO_PI*i/3) * dimensione/2, sin(TWO_PI*i/3) * dimensione/2, dimensione/5); break;
            case 5: for(let i=0; i<40; i++) { let a=noise(i)*TWO_PI*2; let r=noise(i+10)*dimensione/2; layerAnteprima.rect(cos(a)*r, sin(a)*r, 1, 1); } break;
            case 9: layerAnteprima.ellipse(0,0,dimensione); break;
            default: layerAnteprima.ellipse(0, 0, dimensione); break;
        }
        layerAnteprima.pop();
    }

    function disegnaSuTela(dimensione, trasparenza, custom, velocita, volume) {
        let c = color(red(colorePennello), green(colorePennello), blue(colorePennello), trasparenza);
        
        // --- GOMME ---
        if (tipoPennello === 9) { 
            let morbidezza = map(custom, 1, 100, 20, 100);
            for (let i = morbidezza; i > 0; i--) { let d = map(i, morbidezza, 0, dimensione, 0); let a = map(i, morbidezza, 0, 0, 255 / (morbidezza*0.1)); telaDisegno.fill(red(coloreSfondo), green(coloreSfondo), blue(coloreSfondo), a); telaDisegno.noStroke(); telaDisegno.ellipse(mouseX, mouseY, d, d); }
            return;
        } else if (tipoPennello === 0) {
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
        
        // --- FUNZIONE DI EASING PER LO SLIDER CUSTOM ---
        // Rende il controllo più graduale e meno sensibile all'inizio
        let easedCustom = pow(custom / 100, 2); // 0.0 to 1.0

        switch (tipoPennello) {
            // --- PENNELLI MODIFICATI ---
            case 3: // Organic: Sensibilità più estrema
                let sens = map(easedCustom, 0, 1, 50, 2500); // FIX
                telaDisegno.beginShape(); for (let a=0; a<TWO_PI; a+=0.3) telaDisegno.vertex(cos(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens)), sin(a)*(dimensione/2 + noise(a*5, millis()*0.005) * (volume*sens))); telaDisegno.endShape(CLOSE);
                break;
            case 4: // Orbiting Dots: Velocità più estrema
                let velRotazione = map(easedCustom, 0, 1, 0.01, 0.6); // FIX
                for (let i=0; i<3; i++) telaDisegno.ellipse(cos(TWO_PI*(i/3)+angolo)*dimensione/1.5, sin(TWO_PI*(i/3)+angolo)*dimensione/1.5, dimensione/5);
                angolo += velRotazione;
                break;
            case 5: // Spray Paint: Distribuzione circolare corretta
                telaDisegno.translate(-mouseX, -mouseY);
                let densita = map(easedCustom, 0, 1, 5, 250); // FIX
                for (let i=0; i<densita; i++) {
                    let r = sqrt(random(1)) * (dimensione / 2); // FIX per distribuzione uniforme
                    let a = random(TWO_PI);
                    telaDisegno.ellipse(mouseX + cos(a)*r, mouseY + sin(a)*r, 1, 1);
                }
                break;
            case 6: // Hourglass: Customize più estremo
                let vita = map(easedCustom, 0, 1, dimensione/4, -dimensione/3); // FIX
                telaDisegno.beginShape();
                telaDisegno.vertex(-dimensione/2, -dimensione/4);
                telaDisegno.bezierVertex(-vita, 0, -vita, 0, -dimensione/2, dimensione/4);
                telaDisegno.bezierVertex(vita, 0, vita, 0, dimensione/2, dimensione/4);
                telaDisegno.bezierVertex(-vita, 0, -vita, 0, -dimensione/2, -dimensione/4);
                telaDisegno.endShape();
                break;
            case 7: // Octagram: Customize più estremo (ora controlla la "spigolosità")
                let spigolosita = floor(map(easedCustom, 0, 1, 2, 6)); // FIX
                let vertici = [];
                for(let i=0; i<8; i++) vertici.push({x: cos(TWO_PI*i/8)*dimensione/2, y: sin(TWO_PI*i/8)*dimensione/2});
                telaDisegno.stroke(c); telaDisegno.strokeWeight(map(dimensione, 5, 200, 0.5, 5)); telaDisegno.noFill();
                telaDisegno.beginShape();
                for(let i=0; i<8; i++) {
                    let targetIndex = (i + spigolosita) % 8;
                    telaDisegno.line(vertici[i].x, vertici[i].y, vertici[targetIndex].x, vertici[targetIndex].y);
                }
                telaDisegno.endShape();
                break;
            case 8: // Marker: Customize più graduale
                let angoloObliquo = map(easedCustom, 0, 1, PI/8, PI/2.5); // FIX
                telaDisegno.stroke(c);
                telaDisegno.strokeWeight(dimensione/10);
                telaDisegno.line(-dimensione/2, 0, dimensione/2, 0);
                telaDisegno.strokeWeight(dimensione/15);
                telaDisegno.line(0,0, cos(angoloObliquo)*dimensione/2.5, sin(angoloObliquo)*dimensione/2.5);
                telaDisegno.line(0,0, cos(PI-angoloObliquo)*dimensione/2.5, sin(PI-angoloObliquo)*dimensione/2.5);
                break;
            
            // --- Pennelli precedenti (logica custom graduale) ---
            case 1: telaDisegno.translate(-mouseX, -mouseY); let freq = map(easedCustom,0,1,1,15); for (let i = 0; i < freq; i++) { telaDisegno.fill(red(c), green(c), blue(c), trasparenza * random(0.1, 1)); telaDisegno.ellipse(mouseX + random(-dimensione/2, dimensione/2), mouseY + random(-dimensione/2, dimensione/2), random(dimensione * 0.1, dimensione * 0.6)); } break;
            case 2: telaDisegno.translate(-mouseX, -mouseY); if (frameCount % floor(map(custom, 1, 100, 20, 1)) === 0) { telaDisegno.textSize(dimensione); telaDisegno.text('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(floor(random(26))), mouseX - dimensione/2.5, mouseY + dimensione/2.5); } break;
        }
        telaDisegno.pop();
    }
    
    function disegnaFormaGomma(pg, dimensione, custom) {
        let tipoForma = floor(map(custom, 1, 101, 1, 11));
        pg.push();
        if (pg === telaDisegno) { pg.noStroke(); pg.fill(coloreSfondo); } 
        else { pg.noFill(); pg.stroke(255, 100); pg.strokeWeight(1); }
        
        pg.rectMode(CENTER);
        let spessoreLinea = max(1, dimensione / 10);

        switch (tipoForma) {
            case 1: pg.rect(0, 0, dimensione, spessoreLinea); break;
            case 2: pg.rect(0, 0, spessoreLinea, dimensione); break;
            case 3: disegnaPoligono(pg, 3, dimensione/2); break;
            case 4: disegnaPoligono(pg, 4, dimensione/1.414); break;
            case 5: disegnaPoligono(pg, 5, dimensione/2); break;
            case 6: disegnaPoligono(pg, 6, dimensione/2); break;
            case 7: disegnaPoligono(pg, 8, dimensione/2); break;
            case 8: disegnaPoligono(pg, 10, dimensione/2); break;
            case 9: disegnaPoligono(pg, 12, dimensione/2); break;
            case 10: pg.ellipse(0, 0, dimensione); break;
        }
        pg.pop();
    }

    function disegnaPoligono(pg, lati, raggio) { pg.beginShape(); for (let i = 0; i < lati; i++) { let ang = map(i, 0, lati, 0, TWO_PI) - HALF_PI; pg.vertex(cos(ang) * raggio, sin(ang) * raggio); } pg.endShape(CLOSE); }
    function ottieniVelocitaMouse() { if (mouseXPrecedente === undefined) return 0; return dist(mouseX, mouseY, mouseXPrecedente, mouseYPrecedente); }
    
    window.keyPressed = function() {
        if (document.activeElement.tagName === "INPUT") return;
        if (key >= '0' && key <= '9') { tipoPennello = parseInt(key); etichettaPennello.html(`Current: ${nomiPennelli[tipoPennello]}`); }
        if (key === ' ') { telaDisegno.background(coloreSfondo); return false; }
        if (key.toLowerCase() === 's') { saveCanvas(telaDisegno, 'my-artwork', 'png'); }
    }
})();


