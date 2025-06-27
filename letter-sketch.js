// La logica dello sketch viene inserita in una funzione "contenitore" per sicurezza
const sketch = (p) => {

    // --- VARIABILI GLOBALI DELLO SKETCH ---
    let sW, sH, r, sAnim, sOpacity, fillCol, fillCol2, strokeCol, sStrokeWeight, cStrokeToggle;
    let s2Complex, s3Complex, s4Complex, s5Complex;
    let currentStyle = 1;
    let cometTails = [];

    // --- FUNZIONE DI SETUP ---
    // Tutte le funzioni p5.js (createCanvas, background, etc.) ora usano il prefisso "p."
    p.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = p.createCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        canvas.parent(canvasWrapper);
        
        p.angleMode(p.DEGREES);
        p.pixelDensity(1);

        // Controlli Generali
        sW = p.createSlider(10, 150, 80, 1).parent('sW-container');
        sH = p.createSlider(10, 150, 40, 1).parent('sH-container');
        r = p.createSlider(0, 360, 0, 1).parent('r-container');
        sAnim = p.createSlider(0, 5, 1, 0.1).parent('sAnim-container');
        sOpacity = p.createSlider(0, 255, 180, 1).parent('sOpacity-container');
        
        // Controlli Colore e Traccia
        fillCol = p.createColorPicker(p.color(230, 50, 120)).parent('fillCol-container');
        fillCol2 = p.createColorPicker(p.color(40, 150, 255)).parent('fillCol2-container');
        strokeCol = p.createColorPicker(p.color(0)).parent('strokeCol-container');
        sStrokeWeight = p.createSlider(0.5, 15, 2, 0.1).parent('strokeWeight-container');
        cStrokeToggle = p.createCheckbox('Show Stroke', true).parent('strokeToggle-container');

        // Controlli Specifici per Stile
        s2Complex = p.createSlider(1, 25, 5, 1).parent('s2-complex-container');
        s3Complex = p.createSlider(1, 5, 3, 1).parent('s3-complex-container');
        s4Complex = p.createSlider(5, 50, 15, 1).parent('s4-complex-container');
        s5Complex = p.createSlider(5, 50, 20, 1).parent('s5-complex-container');
        
        p.selectAll('input[type="range"]').forEach(s => s.style('width', '100%'));

        // Assicurati che xyPoint sia definito nel tuo file lettere.js
        if (typeof xyPoint !== 'undefined') {
            for (let i = 0; i < xyPoint.length / 2; i++) { 
                cometTails.push([]); 
            }
        }
        
        updateControlsVisibility();
    }

    // --- CICLO DI DISEGNO PRINCIPALE ---
    p.draw = function() {
        p.background(255);
        p.translate(p.width / 2, p.height / 2);

        // Controlla se l'array dei punti esiste prima di usarlo
        if (typeof xyPoint === 'undefined' || xyPoint.length === 0) {
            p.fill(255, 0, 0);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(16);
            p.text("Errore: array 'xyPoint' non trovato.\nCarica il file lettere.js", 0, 0);
            return;
        }

        let w = sW.value();
        let h = sH.value();
        let rot = r.value();
        let animSpeed = sAnim.value();
        let opacity = sOpacity.value();
        let mainColor = fillCol.color();
        let secondaryColor = fillCol2.color();
        let strokeColor = strokeCol.color();
        let showStroke = cStrokeToggle.checked();
        let strokeWeightValue = sStrokeWeight.value();

        for (let i = 0; i < xyPoint.length; i += 2) {
            p.push();
            p.translate(xyPoint[i], xyPoint[i + 1]);
            p.rotate(rot);

            switch (currentStyle) {
                case 1:
                    stileOrbitePulsanti(w, h, animSpeed, mainColor, secondaryColor, strokeColor, opacity, showStroke, strokeWeightValue);
                    break;
                case 2:
                    stileAghiRotanti(w, s2Complex.value(), animSpeed, mainColor, secondaryColor, opacity);
                    break;
                case 3:
                    stileCristalliCoordinati(w, s3Complex.value(), animSpeed, mainColor, secondaryColor, strokeColor, opacity, showStroke, strokeWeightValue);
                    break;
                case 4:
                    stileNastroBicolore(w, h, s4Complex.value(), animSpeed, mainColor, secondaryColor, opacity);
                    break;
                case 5:
                    stileCometaScintillante(w, s5Complex.value(), animSpeed, mainColor, secondaryColor, opacity, i/2);
                    break;
            }
            p.pop();
        }
    }

    // ========= STILI CREATIVI (1-5) =========
    function gestisciTraccia(show, sCol, sWeight, alpha) {
        if (show) {
            let strokeC = p.color(sCol);
            strokeC.setAlpha(alpha);
            p.stroke(strokeC);
            p.strokeWeight(sWeight);
        } else {
            p.noStroke();
        }
    }
    function stileOrbitePulsanti(w, h, speed, c1, c2, sCol, alpha, showStroke, sWeight) {
        gestisciTraccia(showStroke, sCol, sWeight, alpha);
        for(let i=0; i<3; i++) {
            let col = (i%2===0)? c1 : c2;
            col.setAlpha(alpha);
            p.fill(col);
            let pulse = p.sin(p.frameCount*speed + i*120); 
            let size = p.map(pulse,-1,1,5,h);
            let angle = p.frameCount*speed*0.5 + i*120; 
            let radius = w/2*p.sin(p.frameCount*speed*0.2 + i*120);
            p.ellipse(p.cos(angle)*radius, p.sin(angle)*radius, size, size);
        }
    }
    function stileAghiRotanti(w, numLines, speed, c1, c2, alpha) {
        p.noFill();
        p.strokeWeight(3);
        for(let i=0; i<numLines; i++) {
            let col = (i % 2 === 0) ? c1 : c2;
            col.setAlpha(alpha);
            p.stroke(col);
            p.push();
            p.rotate(i*(360/numLines) + p.frameCount*speed);
            p.line(0,0,w,0);
            p.pop();
        }
    }
    function stileCristalliCoordinati(w, crystalCount, speed, c1, c2, sCol, alpha, showStroke, sWeight) {
        gestisciTraccia(showStroke, sCol, sWeight, alpha);
        let time = p.frameCount * speed;
        p.rotate(time * 0.5);
        let sizePulse = p.sin(time * 0.8);
        let raggioBase = p.map(sizePulse, -1, 1, w*0.1, w*0.4);
        for (let i = 0; i < crystalCount; i++) {
            p.push();
            let raggio = raggioBase;
            if (i === 0) {
                raggio *= 1.5; c1.setAlpha(alpha); p.fill(c1);
            } else {
                let orbitRadius = w*0.4; let orbitAngle = time*-1 + (i*360 / (crystalCount-1));
                p.translate(orbitRadius*p.cos(orbitAngle), orbitRadius*p.sin(orbitAngle));
                p.rotate(time*1.5); c2.setAlpha(alpha*0.9); p.fill(c2);
            }
            disegnaTriangoloEquilatero(0, 0, raggio);
            p.pop();
        }
    }
    function stileNastroBicolore(w, h, complexity, speed, c1, c2, alpha) {p.noStroke(); c1.setAlpha(alpha); c2.setAlpha(alpha); p.beginShape(p.TRIANGLE_STRIP); for(let i=-w/2; i<w/2; i+=5) {let waveOffset=p.sin(i*(complexity/100) + p.frameCount*speed); let y1=waveOffset*h; let y2=(waveOffset+0.5)*h; p.fill(c1); p.vertex(i,y1); p.fill(c2); p.vertex(i,y2);} p.endShape();}
    function stileCometaScintillante(w, tailLength, speed, c1, c2, alpha, pointIndex) {let angle=p.frameCount*speed; let radius=w/2; let headPos=p.createVector(p.cos(angle)*radius, p.sin(angle)*radius); let tail=cometTails[pointIndex]; tail.unshift(headPos); while(tail.length > tailLength){tail.pop();} p.noStroke(); for(let i=0; i<tail.length; i++){let pos=tail[i]; let size=p.map(i,0,tail.length,8,1); let pAlpha=p.map(i,0,tail.length,alpha,0); c2.setAlpha(pAlpha); p.fill(c2); p.ellipse(pos.x,pos.y,size,size);} c1.setAlpha(alpha); p.fill(c1); p.ellipse(headPos.x,headPos.y,12,12);}
    function disegnaTriangoloEquilatero(x, y, raggio) {let a1=-90,a2=30,a3=150; let x1=x+raggio*p.cos(a1); let y1=y+raggio*p.sin(a1); let x2=x+raggio*p.cos(a2); let y2=y+raggio*p.sin(a2); let x3=x+raggio*p.cos(a3); let y3=y+raggio*p.sin(a3); p.triangle(x1,y1,x2,y2,x3,y3);}

    // --- FUNZIONI DI CONTROLLO ---
    p.keyPressed = function() {
        if (p.key >= '1' && p.key <= '5') {
            currentStyle = p.int(p.key);
            updateControlsVisibility();
        }
        if (p.key.toLowerCase() === 's') {
            p.save("lettera_creativa.png");
        }
    }

    function updateControlsVisibility() {
        p.select('#group-h').hide();
        p.select('#group-s2-complex').hide();
        p.select('#group-s3-complex').hide();
        p.select('#group-s4-complex').hide();
        p.select('#group-s5-complex').hide();
        p.select('#group-stroke-options').hide();

        switch (currentStyle) {
            case 1: p.select('#group-h').show(); p.select('#group-stroke-options').show(); break;
            case 2: p.select('#group-s2-complex').show(); break;
            case 3: p.select('#group-s3-complex').show(); p.select('#group-stroke-options').show(); break;
            case 4: p.select('#group-h').show(); p.select('#group-s4-complex').show(); break;
            case 5: p.select('#group-s5-complex').show(); break;
        }
    }
};

// Avvia lo sketch p5.js solo quando il DOM è completamente caricato.
// Questa è la correzione definitiva per l'errore "Cannot read properties of null".
document.addEventListener('DOMContentLoaded', () => {
    new p5(sketch);
});



