// --- VARIABILI GLOBALI ---
let sW, sH, r, sAnim, sOpacity, fillCol, fillCol2, strokeCol, sStrokeWeight, cStrokeToggle;
let s2Complex, s3Complex, s4Complex, s5Complex;
let currentStyle = 1;
let cometTails = [];

// --- FUNZIONE DI SETUP ---
function setup() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const canvas = createCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
    canvas.parent(canvasWrapper);
    
    angleMode(DEGREES);
    pixelDensity(1);
    
    // Controlli Generali
    sW = createSlider(10, 150, 80, 1).parent('sW-container');
    sH = createSlider(10, 150, 40, 1).parent('sH-container');
    r = createSlider(0, 360, 0, 1).parent('r-container');
    sAnim = createSlider(0, 5, 1, 0.1).parent('sAnim-container');
    sOpacity = createSlider(0, 255, 180, 1).parent('sOpacity-container');
    
    // Controlli Colore e Traccia
    fillCol = createColorPicker(color(230, 50, 120)).parent('fillCol-container');
    fillCol2 = createColorPicker(color(40, 150, 255)).parent('fillCol2-container');
    strokeCol = createColorPicker(color(0)).parent('strokeCol-container');
    sStrokeWeight = createSlider(0.5, 15, 2, 0.1).parent('strokeWeight-container');
    cStrokeToggle = createCheckbox('Show Stroke', true).parent('strokeToggle-container');

    // Controlli Specifici per Stile
    s2Complex = createSlider(1, 25, 5, 1).parent('s2-complex-container');
    s3Complex = createSlider(1, 5, 3, 1).parent('s3-complex-container');
    s4Complex = createSlider(5, 50, 15, 1).parent('s4-complex-container');
    s5Complex = createSlider(5, 50, 20, 1).parent('s5-complex-container');
    
    selectAll('input[type="range"]').forEach(s => s.style('width', '100%'));

    for (let i = 0; i < xyPoint.length / 2; i++) { 
        cometTails.push([]); 
    }
    
    updateControlsVisibility();
}

// --- CICLO DI DISEGNO PRINCIPALE ---
function draw() {
    background(255);
    translate(width / 2, height / 2);

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
        push();
        translate(xyPoint[i], xyPoint[i + 1]);
        rotate(rot);

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
        pop();
    }
}

// ========= STILI CREATIVI (1-5) =========
function gestisciTraccia(show, sCol, sWeight, alpha) {
    if (show) {
        let strokeC = color(sCol);
        strokeC.setAlpha(alpha);
        stroke(strokeC);
        strokeWeight(sWeight);
    } else {
        noStroke();
    }
}
function stileOrbitePulsanti(w, h, speed, c1, c2, sCol, alpha, showStroke, sWeight) {
    gestisciTraccia(showStroke, sCol, sWeight, alpha);
    for(let i=0; i<3; i++) {
        let col = (i%2===0)? c1 : c2;
        col.setAlpha(alpha);
        fill(col);
        let pulse=sin(frameCount*speed + i*120); let size=map(pulse,-1,1,5,h);
        let angle=frameCount*speed*0.5 + i*120; let radius=w/2*sin(frameCount*speed*0.2 + i*120);
        ellipse(cos(angle)*radius, sin(angle)*radius, size, size);
    }
}
function stileAghiRotanti(w, numLines, speed, c1, c2, alpha) {
    noFill();
    strokeWeight(3);
    for(let i=0; i<numLines; i++) {
        let col = (i % 2 === 0) ? c1 : c2;
        col.setAlpha(alpha);
        stroke(col);
        push();
        rotate(i*(360/numLines) + frameCount*speed);
        line(0,0,w,0);
        pop();
    }
}
function stileCristalliCoordinati(w, crystalCount, speed, c1, c2, sCol, alpha, showStroke, sWeight) {
    gestisciTraccia(showStroke, sCol, sWeight, alpha);
    let time = frameCount * speed;
    rotate(time * 0.5);
    let sizePulse = sin(time * 0.8);
    let raggioBase = map(sizePulse, -1, 1, w*0.1, w*0.4);
    for (let i = 0; i < crystalCount; i++) {
        push();
        let raggio = raggioBase;
        if (i === 0) {
            raggio *= 1.5; c1.setAlpha(alpha); fill(c1);
        } else {
            let orbitRadius = w*0.4; let orbitAngle = time*-1 + (i*360 / (crystalCount-1));
            translate(orbitRadius*cos(orbitAngle), orbitRadius*sin(orbitAngle));
            rotate(time*1.5); c2.setAlpha(alpha*0.9); fill(c2);
        }
        disegnaTriangoloEquilatero(0, 0, raggio);
        pop();
    }
}
function stileNastroBicolore(w, h, complexity, speed, c1, c2, alpha) {noStroke(); c1.setAlpha(alpha); c2.setAlpha(alpha); beginShape(TRIANGLE_STRIP); for(let i=-w/2; i<w/2; i+=5) {let waveOffset=sin(i*(complexity/100) + frameCount*speed); let y1=waveOffset*h; let y2=(waveOffset+0.5)*h; fill(c1); vertex(i,y1); fill(c2); vertex(i,y2);} endShape();}
function stileCometaScintillante(w, tailLength, speed, c1, c2, alpha, pointIndex) {let angle=frameCount*speed; let radius=w/2; let headPos=createVector(cos(angle)*radius, sin(angle)*radius); let tail=cometTails[pointIndex]; tail.unshift(headPos); while(tail.length > tailLength){tail.pop();} noStroke(); for(let i=0; i<tail.length; i++){let pos=tail[i]; let size=map(i,0,tail.length,8,1); let pAlpha=map(i,0,tail.length,alpha,0); c2.setAlpha(pAlpha); fill(c2); ellipse(pos.x,pos.y,size,size);} c1.setAlpha(alpha); fill(c1); ellipse(headPos.x,headPos.y,12,12);}
function disegnaTriangoloEquilatero(x, y, raggio) {let a1=-90,a2=30,a3=150; let x1=x+raggio*cos(a1); let y1=y+raggio*sin(a1); let x2=x+raggio*cos(a2); let y2=y+raggio*sin(a2); let x3=x+raggio*cos(a3); let y3=y+raggio*sin(a3); triangle(x1,y1,x2,y2,x3,y3);}

// --- FUNZIONI DI CONTROLLO E AIUTO ---
window.keyPressed = function() {
    if (key >= '1' && key <= '5') {
        currentStyle = int(key);
        updateControlsVisibility();
    }
    if (key.toLowerCase() === 's') {
        save("lettera_creativa.png");
    }
}

function updateControlsVisibility() {
    select('#group-h').hide();
    select('#group-s2-complex').hide();
    select('#group-s3-complex').hide();
    select('#group-s4-complex').hide();
    select('#group-s5-complex').hide();
    select('#group-stroke-options').hide();

    switch (currentStyle) {
        case 1:
            select('#group-h').show();
            select('#group-stroke-options').show();
            break;
        case 2:
            select('#group-s2-complex').show();
            break;
        case 3:
            select('#group-s3-complex').show();
            select('#group-stroke-options').show();
            break;
        case 4:
            select('#group-h').show();
            select('#group-s4-complex').show();
            break;
        case 5:
            select('#group-s5-complex').show();
            break;
    }
}
})();

