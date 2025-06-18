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
    
    // --- ROBOT (Spostato più in basso per centratura) ---
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width / 2, height / 2 + 30); // Spostato più in basso
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

    // --- DRAGO (Spostato leggermente a destra) ---
    class DragonScene extends Scene {
        constructor() { super(); }
        draw() {
            let vol = this.updateVolume();
            background(0);
            angleMode(DEGREES);
            push();
            translate(width / 2 + 60, height / 2); // Spostato molto più a destra
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
    
    // --- TESCHIO (TUA VERSIONE) ---
    class SkullScene extends Scene {
        constructor() { super(); this.particles = []; this.rageHasTriggered = false;}
        draw() {
            let vol = this.updateVolume();
            background(255);
            let angerLevel = vol; // Semplificato per usare il volume globale

            if (angerLevel > 0.98 && !this.rageHasTriggered) {
                this.rageFlash = 15;
                this.rageHasTriggered = true;
            }
            if (angerLevel < 0.9) {
                this.rageHasTriggered = false;
            }
            
            translate(width / 2, height / 2);
            let idleFloat = sin(frameCount * 0.03) * 3;
            translate(0, idleFloat);
            let shakeAmount = map(angerLevel, 0.7, 1, 0, 60, true);
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
            
            if (this.rageFlash > 0) {
                filter(INVERT);
                this.rageFlash--;
            }
            
            if (angerLevel > 0.8) {
                let particleCount = map(angerLevel, 0.8, 1, 1, 15);
                for (let i = 0; i < particleCount; i++) {
                    let pColor = (random(1) > 0.7) ? color(0) : color(255);
                    this.particles.push(new FlameParticle(-60, -20, pColor));
                    pColor = (random(1) > 0.7) ? color(0) : color(255);
                    this.particles.push(new FlameParticle(60, -20, pColor));
                }
            }
            
            this.drawAngrySkull(angerLevel);

            for (let p of this.particles) { p.update(); p.show(); }
            this.particles = this.particles.filter(p => !p.isFinished());
        }

        drawAngrySkull(angerLevel) {
            fill(0); noStroke();
            let jawDrop = map(angerLevel, 0, 1, 0, 140);
            let eyeSlant = map(angerLevel, 0, 1, 0, 40);
            let browDrop = map(angerLevel, 0, 1, 0, 30);
            let noseFlare = map(angerLevel, 0, 1, 0, 15);
            let cheekFlareX = map(angerLevel, 0, 1, 0, 30);
            let cheekFlareY = map(angerLevel, 0, 1, 0, 20);
            let crownSpike = map(angerLevel, 0, 1, 0, 40);
            let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);

            beginShape();
            vertex(0, -165 - crownSpike);
            bezierVertex(-80, -170 - crownSpike, -130, -120, -140 - cheekFlareX, -60);
            bezierVertex(-150 - cheekFlareX, 0, -125 - cheekFlareX, 70 + cheekFlareY, -100, 80 + cheekFlareY);
            bezierVertex(-90, 85 + cheekFlareY, -80, 100, -70, 110);
            vertex(70, 110);
            bezierVertex(80, 100, 90, 85 + cheekFlareY, 100, 80 + cheekFlareY);
            bezierVertex(125 + cheekFlareX, 70 + cheekFlareY, 150 + cheekFlareX, 0, 140 + cheekFlareX, -60);
            bezierVertex(130, -120, 80, -170 - crownSpike, 0, -165 - crownSpike);
            endShape(CLOSE);
            
            this.drawLowerJaw(jawDrop, angerLevel);

            fill(255);
            this.carveTopTeeth(angerLevel);
            
            fill(0);
            beginShape(); vertex(-40, -80 + browDrop); bezierVertex(-80, -70 - eyeSlant, -95 - cheekFlareX, -20 + eyePinch, -75, 10 + eyePinch); bezierVertex(-60, 15 + eyePinch, -45, 0, -40, -20); endShape(CLOSE);
            beginShape(); vertex(40, -80 + browDrop); bezierVertex(80, -70 - eyeSlant, 95 + cheekFlareX, -20 + eyePinch, 75, 10 + eyePinch); bezierVertex(60, 15 + eyePinch, 45, 0, 40, -20); endShape(CLOSE);
            
            beginShape(); vertex(0, 40); vertex(-12 - noseFlare, 75); vertex(12 + noseFlare, 75); endShape(CLOSE);
            
            if (angerLevel > 0.6) {
                let baseSize = map(angerLevel, 0.6, 1, 10, 45, true);
                noStroke();
                for (let i = 5; i > 0; i--) {
                    let t = i / 5;
                    fill(0, map(t, 1, 0, 10, 80));
                    ellipse(-60, -20, baseSize * t, baseSize * t);
                    ellipse(60, -20, baseSize * t, baseSize * t);
                }
            }
        }

        drawLowerJaw(yOffset, angerLevel) {
            push();
            if (angerLevel < 0.98) {
                translate(0, yOffset);
                rotate(map(yOffset, 0, 140, 0, 0.05));
            } else {
                let orbitRadius = 180 + sin(frameCount * 0.05) * 10;
                let orbitAngle = frameCount * 0.1;
                let selfRotation = frameCount * 0.3;
                translate(cos(orbitAngle) * orbitRadius, sin(orbitAngle) * orbitRadius);
                rotate(selfRotation);
            }
            let cheekFlareX = map(angerLevel, 0, 1, 0, 15);
            fill(0); noStroke();
            beginShape();
            vertex(-75 - cheekFlareX, 100);
            bezierVertex(-85 - cheekFlareX, 105, -105 - cheekFlareX, 140, -90, 190);
            bezierVertex(-60, 205, 60, 205, 90, 190);
            bezierVertex(105 + cheekFlareX, 140, 85 + cheekFlareX, 105, 75 + cheekFlareX, 100);
            vertex(70, 100);
            vertex(-70, 100);
            endShape(CLOSE);
            fill(255);
            this.carveLowerTeeth(angerLevel);
            pop();
        }

        carveTopTeeth(angerLevel) {
            let numTeeth = 8;
            let totalWidth = 140;
            for (let i = 0; i < numTeeth; i++) {
                let t = i / (numTeeth - 1);
                let x = lerp(-totalWidth / 2, totalWidth / 2, t);
                let toothWidth = totalWidth / numTeeth * 0.9;
                let toothHeight = 15 - pow(abs(t - 0.5) * 2, 2) * 8;
                beginShape(); vertex(x - toothWidth / 2, 110); vertex(x + toothWidth / 2, 110); vertex(x, 110 - toothHeight); endShape(CLOSE);
            }
        }

        carveLowerTeeth(angerLevel) {
            let numTeeth = 7;
            let totalWidth = 120;
            for (let i = 0; i < numTeeth; i++) {
                let t = i / (numTeeth - 1);
                let x = lerp(-totalWidth / 2, totalWidth / 2, t);
                let toothWidth = totalWidth / numTeeth * 0.9;
                let toothHeight = 15 - pow(abs(t - 0.5) * 2, 2) * 10;
                beginShape(); vertex(x - toothWidth / 2, 100); vertex(x + toothWidth / 2, 100); vertex(x, 100 + toothHeight); endShape(CLOSE);
            }
        }
    }

    // --- CELESTIAL GUARDIAN (TUA VERSIONE) ---
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
    
    // --- JESTER ---
    class JesterScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24, 24, 24); translate(width/2, height/2); angleMode(DEGREES);
            let energy = map(vol, 0.1, 0.8, 0, 1, true);
            
            push();
            translate(0, 50);

            fill(255); noStroke();
            beginShape();
            vertex(0, -150);
            bezierVertex(-250, -100, -200, 220, 0, 250);
            bezierVertex(200, 220, 250, -100, 0, -150);
            endShape(CLOSE);
            
            fill(0);
            let pupilY = lerp(0, -8, energy);
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
            
            let bellWobble = energy * 25;
            fill(0); noStroke();
            rectMode(CENTER);
            rect(0, -145, 280, 40, 10);

            noFill(); stroke(0); strokeWeight(40);
            beginShape(); vertex(0, -165); quadraticVertex(-100, -280, -250 + random(-bellWobble, bellWobble), -200); endShape();
            beginShape(); vertex(0, -165); quadraticVertex(100, -280, 250 + random(-bellWobble, bellWobble), -200); endShape();
            triangle(-20, -165, 20, -165, random(-bellWobble, bellWobble), -250);
            
            stroke(0); strokeWeight(3); fill(255);
            ellipse(random(-bellWobble, bellWobble), -250, 30, 30);
            ellipse(-250 + random(-bellWobble, bellWobble), -200, 30, 30);
            ellipse(250 + random(-bellWobble, bellWobble), -120, 30, 30);
            pop();
        }
    }
    
    // Helper per il teschio
    class FlameParticle {
        constructor(x,y) {
            this.pos = createVector(x + random(-15, 15), y + random(-15, 15));
            this.vel = createVector(random(-2, 2), random(-5, -12));
            this.lifespan = 1.0;
            this.decay = random(0.015, 0.04);
            this.size = random(10, 25);
            this.pColor = color(0);
        }
        isFinished() { return this.lifespan <= 0; }
        update() {
            this.pos.add(this.vel);
            this.vel.y *= 0.98;
            this.lifespan -= this.decay;
            this.size -= 0.3;
        }
        show() {
            noStroke();
            this.pColor.setAlpha(this.lifespan * 220);
            fill(this.pColor);
            ellipse(this.pos.x, this.pos.y, max(0, this.size));
        }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
