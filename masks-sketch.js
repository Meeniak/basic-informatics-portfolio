(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'Celestial Guardian',
        5: 'Jester'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(700, 700);
        canvas.parent(canvasWrapper);
        
        mic = new p5.AudioIn();
        mic.start();
        fft = new p5.FFT(0.9, 1024);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        sensitivitySlider = createSlider(1, 40, 15, 0.1);
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        scenes = {
            1: new RobotScene(),
            2: new DragonScene(),
            3: new SkullScene(),
            4: new CelestialGuardianScene(),
            5: new JesterScene()
        };
        switchScene(1); // Inizia con la scena 1 di default
    }

    window.draw = function() {
        if (currentScene?.draw) {
            currentScene.draw();
        }
    }

    // Aggiungo i controlli per cambiare scena anche qui, per coerenza
    window.keyTyped = function() {
        if (key >= '1' && key <= '5') {
            switchScene(parseInt(key));
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-mask', 'png');
        }
    }

    function switchScene(sceneId) {
        if (scenes[sceneId]) {
            currentScene = scenes[sceneId];
            maskLabel.html(`Current: ${maskNames[sceneId]}`);
        }
    }

    class Scene {
        constructor() { this.smoothedVolume = 0; }
        updateVolume() {
            let sensitivity = sensitivitySlider.value();
            let micVolume = mic.getLevel() * sensitivity;
            let mouseVolume = 0;
            if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
                mouseVolume = map(mouseX, 0, width, 0, 1.0);
            }
            let finalInput = max(micVolume, mouseVolume);
            this.smoothedVolume = lerp(this.smoothedVolume, constrain(finalInput, 0, 1.0), 0.1);
            return this.smoothedVolume;
        }
    }
    
    // --- ROBOT (INVARIATO) ---
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width / 2, height / 2 + 30);
            rectMode(CENTER);

            let antennaWobble = sin(frameCount * 0.2) * vol * 40;
            stroke(0); strokeWeight(6); noFill();
            line(-80, -150, -120, -240 + antennaWobble);
            line(80, -150, 120, -240 - antennaWobble);
            fill(0); ellipse(-120, -240 + antennaWobble, 15, 15); ellipse(120, -240 - antennaWobble, 15, 15);
            let sideDetailSize = map(vol, 0.1, 0.6, 0, 40, true);
            rect(-180, 0, 20, sideDetailSize, 5);
            rect(180, 0, 20, sideDetailSize, 5);

            let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
            let visorWidth = 280 * map(vol, 0, 0.5, 1, 1.2, true);
            noStroke(); fill(0);
            rect(0, -80, visorWidth, eyeHeight, 3);
            if (eyeHeight > 10) {
                let pupilSize = 60; let pupilXOffset = map(vol, 0.1, 0.5, 0, visorWidth / 2 - 40, true);
                fill(255); ellipse(-pupilXOffset, -80, pupilSize, pupilSize); ellipse(pupilXOffset, -80, pupilSize, pupilSize);
            }
            noFill(); stroke(0); strokeWeight(8); rect(0, -80, visorWidth, eyeHeight, 3);
            
            push();
            translate(0, 100);
            let mouthWidth = 280, mouthHeight = 90;
            noFill(); stroke(0); strokeWeight(6); rect(0, 0, mouthWidth, mouthHeight, 10);
            
            let waveform = fft.waveform();
            noFill();
            beginShape();
            stroke(0);
            strokeWeight(3);
            for (let i = 0; i < waveform.length; i++) {
                let x = map(i, 0, waveform.length, -mouthWidth/2 + 5, mouthWidth/2 - 5);
                let waveValue = (mic.getLevel() > 0.01) ? waveform[i] : sin(frameCount * 0.5 + i * 0.1) * vol;
                let y = map(waveValue, -1, 1, -mouthHeight/2 + 10, mouthHeight/2 - 10);
                vertex(x, y);
            }
            endShape();
            pop();
        }
    }

    // --- DRAGO (INVARIATO) ---
    class DragonScene extends Scene {
        constructor() { super(); }
        draw() {
            let vol = this.updateVolume();
            background(0);
            angleMode(DEGREES);
            push();
            translate(width / 2, height / 2);
            scale(1.5);
            translate(-190, -240);
            
            let anger = map(vol, 0, 0.8, 20, 100, true);
            let pp = map(vol, 0, 0.5, 40, 5, true);
            let arc1 = map(vol, 0, 0.5, -90, 20, true);
            let jawRotation = map(vol, 0, 0.5, 0, 25, true);
            let nostrilSize = constrain(5 + vol * 40, 5, 15);

            fill(255); noStroke(); rectMode(CORNER);
            rect(100, 180, 180, 50); arc(150, 225, 100, 100, 0, 180);
            push(); fill(150); ellipse(150, 225, 70, 70); pop();
            ellipse(150, 225, pp, pp);
            push(); fill(0); ellipse(135, 210, 10, 10); ellipse(260, 195, nostrilSize, nostrilSize); pop();
            arc(150, 225, 80, 80, 240, arc1, CHORD);
            triangle(100, 155, 100, 180, 130, 180);
            triangle(200, 170, 200, 180, 220, 180); triangle(220, 170, 220, 180, 240, 180); triangle(240, 170, 240, 180, 260, 180);
            if (anger > 50) triangle(130, 155, 130, 180, 160, 180);
            if (anger > 80) triangle(160, 155, 160, 180, 190, 180);
            triangle(280, 230, 260, 245, 260, 230); triangle(250, 230, 230, 245, 230, 230); triangle(220, 230, 200, 245, 200, 230);
            
            push();
            translate(150, 235); stroke(255); strokeWeight(1.5);
            if (anger > 20) rotate(jawRotation);
            rect(0, 40, 80, 49); arc(80, 40, 100, 98, 0, 90); arc(0, 90, 100, 100, 180, 270);
            triangle(130, 40, 130, 25, 110, 40); triangle(100, 40, 100, 25, 80, 40); triangle(70, 40, 70, 25, 50, 40);
            pop();
            pop();
        }
    }
    
// --- TESCHIO (VERSIONE "FURIOUS" RIFINITA) ---
class SkullScene extends Scene {
    constructor() {
        super();
        this.particles = [];
    }

    draw() {
        let vol = this.updateVolume();
        background(0);
        translate(width / 2, height / 2);
        let anger = map(vol, 0.1, 0.9, 0, 1, true);

        let shake = constrain(map(anger, 0.6, 1, 0, 20, true), 0, 20);

        push();
        translate(random(-shake, shake), random(-shake, shake));

        // MODIFICA 2: Avvicinamento Occhi - Aggiornato punto di emissione
        this.manageEyeFlames(anger);
        this.drawAngrySkull(anger);
        
        pop();
    }

    manageEyeFlames(anger) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.update();
            p.draw();
            if (p.isFinished()) {
                this.particles.splice(i, 1);
            }
        }

        if (anger > 0.7) {
            for (let i = 0; i < 2; i++) {
                // MODIFICA 2: Avvicinamento Occhi - Spostato punto di emissione particelle
                this.particles.push(new Particle(-70, -45)); // da -80 a -70
                this.particles.push(new Particle(70, -45));  // da 80 a 70
            }
        }
    }

    drawAngrySkull(anger) {
        let jawDrop = map(anger, 0.3, 1, 0, 110, true);
        let cheekFlare = map(anger, 0.2, 1, 0, 40, true);
        let crownSpike = map(anger, 0.4, 1, 0, 70, true);
        // MODIFICA 1: Deformazione Occhi Aumentata
        let eyePinch = map(anger, 0.5, 1, 0, 60, true); // da 30 a 60 per più deformazione
        let noseFlare = map(anger, 0, 1, 0, 15, true);

        noStroke();
        fill(255);

        // Cranio superiore
        beginShape();
        vertex(0, -185 - crownSpike);
        bezierVertex(-80, -190 - crownSpike, -150, -140, -160, -80 - cheekFlare);
        bezierVertex(-170, -20, -145, 50, -120, 60);
        vertex(120, 60);
        bezierVertex(145, 50, 170, -20, 160, -80 - cheekFlare);
        bezierVertex(150, -140, 80, -190 - crownSpike, 0, -185 - crownSpike);
        endShape(CLOSE);

        // Cavità nere
        fill(0);
        // MODIFICA 2: Avvicinamento Occhi - Modificate coordinate cavità
        // Cavità sinistra
        beginShape();
        vertex(-30, -100);
        bezierVertex(-90, -90 - eyePinch, -105, -40, -75, -10);
        bezierVertex(-60, -5, -35, -20, -30, -40);
        endShape(CLOSE);
        // Cavità destra
        beginShape();
        vertex(30, -100);
        bezierVertex(90, -90 - eyePinch, 105, -40, 75, -10);
        bezierVertex(60, -5, 35, -20, 30, -40);
        endShape(CLOSE);

        // Pupille Spettrali
        if (anger > 0.5) {
            let pupilAlpha = map(anger, 0.5, 1, 0, 220);
            let pupilWobble = map(anger, 0.5, 1, 0, 4);
            
            // MODIFICA 2: Avvicinamento Occhi - Spostato centro pupille
            let pupilX1 = -60 + random(-pupilWobble, pupilWobble); // da -80 a -70
            let pupilY1 = -45 + random(-pupilWobble, pupilWobble);
            let pupilX2 = 60 + random(-pupilWobble, pupilWobble);  // da 80 a 70
            let pupilY2 = -45 + random(-pupilWobble, pupilWobble);
            
            fill(255, pupilAlpha / 4);
            noStroke();
            ellipse(pupilX1, pupilY1, 25, 25);
            ellipse(pupilX2, pupilY2, 25, 25);
            
            fill(255, pupilAlpha);
            ellipse(pupilX1, pupilY1, 10, 10);
            ellipse(pupilX2, pupilY2, 10, 10);
        }

        // Naso
        fill(0);
        triangle(0, 20, -15 - noseFlare, 45, 15 + noseFlare, 45);

        // Mandibola
        push();
        translate(0, jawDrop);
        fill(255);
        beginShape();
        vertex(115, 70);
        bezierVertex(125, 75, 145 + cheekFlare, 110, 130, 160);
        vertex(-130, 160);
        bezierVertex(-145 - cheekFlare, 110, -125, 75, -115, 70);
        endShape(CLOSE);
        this.carveLowerTeeth();
        pop();
    }
    carveLowerTeeth() {
        fill(0);
        rectMode(CENTER);
        for (let i = 0; i < 5; i++) {
            let x = lerp(-50, 50, i / 4);
            // MODIFICA 3: Denti più in alto
            rect(x, 75, 14, 18, 3); // y da 85 a 75, altezza leggermente ridotta
        }
    }
}

// --- NUOVA CLASSE per definire una singola particella ---
// Puoi mettere questa classe fuori dalla classe SkullScene, ma sempre dentro
// la funzione auto-eseguibile principale.
class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        // Velocità: verso l'alto (negativo in Y), con piccola variazione orizzontale
        this.vel = createVector(random(-1.5, 1.5), random(-3, -6));
        this.lifespan = 255; // Durata (svanirà gradualmente)
        this.color = random([0, 255]); // Colore casuale bianco o nero
        this.size = random(5, 12);
    }

    update() {
        this.pos.add(this.vel);
        this.lifespan -= 5; // Svanisce
    }

    draw() {
        noStroke();
        // L'alpha (trasparenza) è legato alla durata
        fill(this.color, this.lifespan);
        ellipse(this.pos.x, this.pos.y, this.size, this.size);
    }

    isFinished() {
        return this.lifespan < 0;
    }
}
    // --- GUARDIANO CELESTE (INVARIATO) ---
    class CelestialGuardianScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width/2, height/2); angleMode(RADIANS);
            let energy = map(vol, 0.1, 1.0, 0, 1, true);

            let rotation = frameCount * 0.01;
            let haloRadius = lerp(200, 250, energy);
            stroke(255, 150); strokeWeight(2); noFill();
            for(let i=0; i<10; i++) {
                let angle = i * TWO_PI / 10 + rotation;
                let x = cos(angle) * haloRadius;
                let y = sin(angle) * haloRadius;
                push(); translate(x,y); rotate(angle);
                triangle(-15,0, 15,0, 0, -30);
                pop();
            }
            strokeWeight(1); stroke(255, 200);
            let innerRadius = lerp(150, 180, energy);
            for(let i=0; i<20; i++) {
                let angle = i * TWO_PI / 20 - rotation;
                let x = cos(angle) * innerRadius;
                let y = sin(angle) * innerRadius;
                point(x, y);
            }
            noFill(); strokeWeight(5); stroke(255); rectMode(CENTER);
            rect(0,0, 250, 350, 20);
            
            push();
            rotate(frameCount * 0.02);
            stroke(255, 150 + energy * 105); strokeWeight(3);
            let symbolSize = 60 + energy * 20;
            line(-symbolSize/2, 0, symbolSize/2, 0);
            line(0, -symbolSize/2, 0, symbolSize/2);
            ellipse(0, 0, symbolSize, symbolSize);
            pop();
            
            if (energy > 0.5) {
                for(let i = 0; i < 8; i++) {
                    let angle = i * TWO_PI / 8 + frameCount * 0.05;
                    let distance = 100 + energy * 50;
                    let x = cos(angle) * distance;
                    let y = sin(angle) * distance;
                    fill(255, 150); noStroke();
                    ellipse(x, y, 5 + energy * 10, 5 + energy * 10);
                }
            }
            let mouthSize = lerp(10, 80, energy);
            fill(255); noStroke();
            ellipse(0, 100, mouthSize, mouthSize);
            let eyeOpen = lerp(5, 50, energy);
            fill(0); stroke(255); strokeWeight(5);
            ellipse(-80, -30, 70, eyeOpen);
            ellipse(80, -30, 70, eyeOpen);
            
            if (energy > 0.6) {
                fill(255, 200); noStroke();
                ellipse(-80, -30, 20, 20);
                ellipse(80, -30, 20, 20);
            }
        }
    }
    
    // --- GIULLARE (MODIFICATO) ---
    class JesterScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            // --- MODIFICA 3: Sfondo bianco ---
            background(255); 
            translate(width/2, height/2); 
            angleMode(DEGREES);
            let energy = map(vol, 0.1, 0.8, 0, 1, true);
            
            push();
            translate(0, 50);

            // Faccia
            fill(255); noStroke();
            beginShape();
            vertex(0, -150);
            bezierVertex(-250, -100, -200, 220, 0, 250);
            bezierVertex(200, 220, 250, -100, 0, -150);
            endShape(CLOSE);
            
            // Dettagli Neri
            fill(0);
            let pupilY = lerp(0, -10, energy);
            let pupilSize = lerp(15, 25, energy);
            let tearLength = lerp(40, 100, energy);
            
            arc(-80, -30, 80, 100, 180, 360);
            arc(80, -30, 80, 100, 180, 360);
            fill(255);
            ellipse(-80, -25 + pupilY, pupilSize, pupilSize);
            ellipse(80, -25 + pupilY, pupilSize, pupilSize);

            fill(0);
            triangle(-90, 0, -70, 0, -80, tearLength);
            triangle(90, 0, 70, 0, 80, tearLength);
            
            let smileHeight = lerp(10, 100, energy);
            arc(0, 120, 150, smileHeight, 180, 360, CHORD);
            
            // Cappello
            let bellWobble = energy * 25;
            noStroke(); fill(0);
            rectMode(CENTER);
            rect(0, -145, 280, 40, 10);

            // --- MODIFICA 4: Posizionamento corretto dei campanelli ---
            // Salvo le coordinate delle punte in variabili per usarle sia per il cappello che per i campanelli.
            let middleTip = { x: random(-bellWobble, bellWobble), y: -250 };
            let leftTip   = { x: -250 + random(-bellWobble, bellWobble), y: -200 };
            let rightTip  = { x: 250 + random(-bellWobble, bellWobble), y: -200 }; // La y qui era sbagliata nel disegno del campanello

            // Disegno le punte del cappello usando le coordinate salvate
            noFill(); stroke(0); strokeWeight(40);
            beginShape(); vertex(0, -165); quadraticVertex(-100, -280, leftTip.x, leftTip.y); endShape();
            beginShape(); vertex(0, -165); quadraticVertex(100, -280, rightTip.x, rightTip.y); endShape();
            beginShape(); vertex(0, -165); quadraticVertex(0, -200, middleTip.x, middleTip.y); endShape(); // Usato quadraticVertex per una curva migliore

            // Disegno i campanelli ESATTAMENTE sulle punte
            stroke(0); strokeWeight(3); fill(255);
            ellipse(middleTip.x, middleTip.y, 40, 40);
            ellipse(leftTip.x, leftTip.y, 40, 40);
            ellipse(rightTip.x, rightTip.y, 40, 40);

            pop();
        }
    }
})();
