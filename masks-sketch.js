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
        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        sensitivitySlider = createSlider(1, 25, 12, 0.1);
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        scenes = {
            1: new RobotScene(),
            2: new DragonScene(),
            3: new SkullScene(),
            4: new CelestialGuardianScene(),
            5: new JesterScene()
        };
        switchScene(1);
    }

    window.draw = function() {
        if (currentScene?.draw) {
            currentScene.draw();
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
            let rawVolume = mic.getLevel() * sensitivity;
            this.smoothedVolume = lerp(this.smoothedVolume, constrain(rawVolume, 0, 1.0), 0.1);
            return this.smoothedVolume;
        }
    }
    
    // --- ROBOT ---
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width / 2, height / 2);
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
            
            let spectrum = fft.analyze();
            if (spectrum?.length) {
                noStroke(); fill(0);
                let barCount = spectrum.length / 2;
                let barWidth = mouthWidth / barCount;
                for (let i=0; i < barCount; i++) {
                    let h = map(spectrum[i], 0, 255, 0, mouthHeight - 10);
                    let x = map(i, 0, barCount-1, -mouthWidth/2 + barWidth/2, mouthWidth/2 - barWidth/2);
                    rect(x, 0, barWidth * 0.8, h);
                }
            }
            pop();
        }
    }

    // --- DRAGO ---
    class DragonScene extends Scene {
        constructor() { super(); }
        draw() {
            let vol = this.updateVolume();
            background(0);
            angleMode(DEGREES);
            push();
            translate(width / 2, height / 2);
            scale(1.5);
            translate(-270, -270);
            
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
    
    // --- TESCHIO ---
    class SkullScene extends Scene {
        constructor() { super(); }
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width / 2, height / 2);
            let anger = map(vol, 0.1, 0.9, 0, 1, true);
            let shake = constrain(map(anger, 0.6, 1, 0, 15, true), 0, 15);
            
            push();
            translate(random(-shake, shake), random(-shake, shake));
            this.drawAngrySkull(anger);
            pop();
        }
        drawAngrySkull(anger) {
            let jawDrop = map(anger, 0.3, 1, 0, 80, true);
            let cheekFlare = map(anger, 0.2, 1, 0, 25, true);
            let crownSpike = map(anger, 0.4, 1, 0, 40, true);
            
            fill(255); noStroke();

            this.drawHalfSkull(1, cheekFlare, crownSpike);
            this.drawHalfSkull(-1, cheekFlare, crownSpike);

            push(); translate(0, jawDrop);
            this.drawHalfJaw(1, cheekFlare);
            this.drawHalfJaw(-1, cheekFlare);
            pop();
        }

        drawHalfSkull(side, cheekFlare, crownSpike) {
            push();
            scale(side, 1);
            beginShape();
            vertex(0,-185-crownSpike);
            bezierVertex(80,-190-crownSpike, 150,-140, 160,-80-cheekFlare);
            bezierVertex(170,-20, 145,50, 120,60);
            vertex(0,60);
            endShape();
            fill(0);
            beginShape();
            vertex(40,-100);
            bezierVertex(100,-90, 115,-40, 85,-10);
            bezierVertex(70,-5, 45,-20, 40,-40);
            endShape(CLOSE);
            triangle(0,20, 15,45, 0,45);
            pop();
        }

        drawHalfJaw(side, cheekFlare) {
            push();
            scale(side, 1);
            fill(255);
            beginShape();
            vertex(0,70);
            vertex(115,70);
            bezierVertex(125,75, 145+cheekFlare,110, 130,160);
            vertex(0,160);
            endShape(CLOSE);
            fill(0); rectMode(CENTER);
            for(let i=0; i<3; i++) rect(25 + i * 30, 110, 14, 18, 3);
            pop();
        }
    }

    // --- NUOVA MASCHERA 4 ---
    class CelestialGuardianScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width / 2, height / 2); angleMode(RADIANS);
            let energy = map(vol, 0.1, 1.0, 0, 1, true);

            let rotation = frameCount * 0.01;
            let haloRadius = lerp(200, 250, energy);

            // Alone di frammenti
            stroke(255, 150); strokeWeight(2); noFill();
            for(let i=0; i<10; i++) {
                let angle = i * TWO_PI / 10 + rotation;
                let x = cos(angle) * haloRadius;
                let y = sin(angle) * haloRadius;
                push();
                translate(x,y);
                rotate(angle);
                triangle(-15,0, 15,0, 0, -30);
                pop();
            }

            // Faccia
            noFill(); strokeWeight(5); stroke(255);
            rectMode(CENTER);
            rect(0,0, 250, 350, 20);

            // Runa sulla fronte
            let runeGlow = map(energy, 0.5, 1, 100, 255, true);
            fill(0, 200, 255, runeGlow); noStroke();
            textSize(60); text("⟎", 0, -120);

            // Occhi
            let eyeOpen = lerp(5, 50, energy);
            fill(0); stroke(255);
            ellipse(-80, -30, 70, eyeOpen);
            ellipse(80, -30, 70, eyeOpen);
        }
    }
    
    // --- NUOVA MASCHERA 5 ---
    class JesterScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255); translate(width/2, height/2); angleMode(DEGREES);
            let energy = map(vol, 0, 1, 0, 1, true);

            let headWobble = sin(frameCount * 5) * 5 * energy;
            push();
            translate(headWobble, 0);

            // Cappello
            fill(0); noStroke();
            let bellWobbleX1 = random(-1,1) * 30 * energy;
            let bellWobbleY1 = random(-1,1) * 30 * energy;
            let bellWobbleX2 = random(-1,1) * 30 * energy;
            let bellWobbleY2 = random(-1,1) * 30 * energy;
            
            // Punte del cappello
            beginShape(); vertex(0,-100); bezierVertex(-100,-150, -150,-250, -120+bellWobbleX1, -280+bellWobbleY1); endShape();
            beginShape(); vertex(0,-100); bezierVertex(100,-150, 150,-250, 120+bellWobbleX2, -280+bellWobbleY2); endShape();

            // Campanelle
            stroke(0); strokeWeight(2); fill(255);
            ellipse(-120 + bellWobbleX1, -280 + bellWobbleY1, 25, 25);
            ellipse(120 + bellWobbleX2, -280 + bellWobbleY2, 25, 25);

            // Faccia
            fill(0); noStroke();
            beginShape();
            vertex(0, -120);
            bezierVertex(-220, -100, -180, 200, 0, 220);
            bezierVertex(180, 200, 220, -100, 0, -120);
            endShape(CLOSE);
            
            // Dettagli bianchi
            fill(255);
            // Occhi
            arc(-80, -30, 80, 100, 180, 360);
            arc(80, -30, 80, 100, 180, 360);
            fill(0);
            ellipse(-80, -25, 20, 20);
            ellipse(80, -25, 20, 20);

            // Lacrime
            fill(255);
            rect(-80, 40, 20, 60, 5); // Lacrima più spessa
            rect(80, 40, 20, 60, 5);

            // Bocca
            let mouthOpen = lerp(20, 120, energy);
            noFill(); stroke(255); strokeWeight(4);
            arc(0, 120, 100, mouthOpen, 0, 180);

            pop();
        }
    }
    
    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
