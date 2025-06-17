(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'Sentinel',
        5: 'Pulsar'
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
            4: new SentinelScene(),
            5: new PulsarScene()
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
        constructor() { super(); this.particles = []; }
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width / 2, height / 2);
            let anger = map(vol, 0.1, 0.9, 0, 1, true);
            let shake = constrain(map(anger, 0.6, 1, 0, 15, true), 0, 15);
            
            push();
            translate(random(-shake, shake), random(-shake, shake));
            this.drawAngrySkull(anger);
            pop();

            if (anger > 0.5) {
                for(let i=0; i<2; i++) {
                    this.particles.push(new FlameParticle(-60, -80));
                    this.particles.push(new FlameParticle(60, -80));
                }
            }
            for (let p of this.particles) { p.update(); p.show(); }
            this.particles = this.particles.filter(p => p.lifespan > 0);
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

    // --- SENTINEL ---
    class SentinelScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width/2, height/2); angleMode(RADIANS);
            let energy = map(vol, 0, 1, 0, 1, true);

            // Spalle
            let shoulderHeight = lerp(0, -100, energy);
            stroke(255); strokeWeight(8); noFill();
            beginShape(); vertex(-300, 300); bezierVertex(-200, 100, -150, shoulderHeight, -100, shoulderHeight); endShape();
            beginShape(); vertex(300, 300); bezierVertex(200, 100, 150, shoulderHeight, 100, shoulderHeight); endShape();
            
            // Testa
            fill(255); noStroke();
            rect(0, shoulderHeight - 40, 180, 80, 10);

            // Occhio
            let eyeOpen = lerp(0.1, 1, energy);
            fill(0);
            ellipse(0, shoulderHeight - 40, 140, 70 * eyeOpen);
            
            let pupilGlow = map(energy, 0.5, 1, 0, 255, true);
            fill(255,0,0, pupilGlow);
            ellipse(0, shoulderHeight - 40, 30, 30 * eyeOpen);
        }
    }
    
    // --- PULSAR ---
    class PulsarScene extends Scene {
        constructor() { super(); this.particles = Array.from({length: 200}, () => new StarParticle()); }
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width/2, height/2); angleMode(DEGREES);
            
            for(let p of this.particles) { p.update(vol); p.show(); }

            let energy = map(vol, 0, 1, 0, 1, true);
            let coreSize = lerp(20, 100, energy);
            let coreGlow = lerp(100, 255, energy);

            // Onde d'urto
            strokeWeight(2); noFill();
            for(let i=0; i<5; i++) {
                let d = (frameCount * 2 + i * 100) % 500;
                let alpha = map(d, 0, 500, 255, 0);
                stroke(255, alpha);
                ellipse(0,0,d,d);
            }
            
            // Nucleo
            noStroke();
            fill(255, 255, 200, coreGlow);
            ellipse(0,0,coreSize,coreSize);
        }
    }
    
    // Helpers
    class FlameParticle{constructor(x,y){this.pos=createVector(x,y);this.vel=p5.Vector.random2D().mult(random(1,4));this.lifespan=255;}isFinished(){return this.lifespan<=0;}update(){this.pos.add(this.vel);this.lifespan-=5;}show(){noStroke();fill(255,100,0,this.lifespan);ellipse(this.pos.x,this.pos.y,12);}}
    class StarParticle {
        constructor() { this.pos = p5.Vector.random2D().mult(random(width)); this.size = random(1,3); }
        update(vol) { let distFromCenter = this.pos.mag(); this.pos.mult(1 + vol * 0.001); if(distFromCenter > width/2) this.pos.set(0,0); }
        show() { noStroke(); fill(255, 100); ellipse(this.pos.x, this.pos.y, this.size); }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
