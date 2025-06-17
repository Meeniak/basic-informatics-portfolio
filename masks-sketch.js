(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'The Watcher',
        5: 'Celestial Mask'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(800, 800); // Canvas quadrato
        canvas.parent(canvasWrapper);
        
        mic = new p5.AudioIn();
        mic.start();
        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        sensitivitySlider = createSlider(1, 20, 10, 0.1);
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        scenes = {
            1: new RobotScene(),
            2: new DragonScene(),
            3: new SkullScene(),
            4: new WatcherScene(),
            5: new CelestialMaskScene()
        };
        switchScene(1);
    }

    window.draw = function() {
        if (currentScene?.draw) {
            currentScene.draw();
        }
    }

    function switchScene(sceneId) {
        currentScene = scenes[sceneId];
        maskLabel.html(`Current: ${maskNames[sceneId]}`);
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
    
    // --- ROBOT: FEDELE E CENTRATO ---
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0);
            translate(width / 2, height / 2);

            let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
            let visorScaleX = map(vol, 0, 0.5, 1, 1.2, true);
            let visorWidth = 280 * visorScaleX;
            noStroke(); fill(255); rectMode(CENTER);
            rect(0, -80, visorWidth, eyeHeight, 3);
            if (eyeHeight > 10) {
                let pupilSize = 60; let pupilXOffset = map(vol, 0.1, 0.5, 0, visorWidth / 2 - 40, true);
                fill(0); ellipse(-pupilXOffset, -80, pupilSize, pupilSize); ellipse(pupilXOffset, -80, pupilSize, pupilSize);
            }
            noFill(); stroke(255); strokeWeight(8); rect(0, -80, visorWidth, eyeHeight, 3);
            
            push();
            translate(0, 100);
            let mouthWidth = 280, mouthHeight = 90;
            noFill(); stroke(255); strokeWeight(6); rect(0, 0, mouthWidth, mouthHeight, 10);
            let spectrum = fft.analyze();
            if (spectrum?.length) {
                noStroke(); fill(255);
                let barWidth = mouthWidth / spectrum.length;
                for (let i=0; i < spectrum.length; i++) {
                    let x = map(i, 0, spectrum.length - 1, -mouthWidth/2 + barWidth/2, mouthWidth/2 - barWidth/2);
                    let h = map(spectrum[i], 0, 255, 0, mouthHeight - 10);
                    rect(x, (mouthHeight/2) - h, barWidth * 0.8, h);
                }
            }
            pop();
        }
    }

    // --- DRAGO: FEDELE E CENTRATO ---
    class DragonScene extends Scene {
        constructor() { super(); this.n = 1; this.increment = 1; }
        draw() {
            let vol = this.updateVolume();
            background(220);
            angleMode(DEGREES);
            push();
            translate(width / 2, height / 2);
            scale(1.3); // Ingrandisce il disegno
            translate(-270, -270); // Centra l'area di disegno
            
            let anger = map(vol, 0, 0.8, 20, 100, true);
            this.n += this.increment;
            if (this.n >= 30 || this.n <= 0) this.increment *= -1;
            if (anger > 80) { push(); stroke(255, this.n*5, 0); strokeWeight(this.n); noFill(); line(210, 270, 400 + this.n*5, 270); pop(); }

            let pp = map(vol, 0, 0.5, 40, 5, true);
            let arc1 = map(vol, 0, 0.5, -90, 20, true);
            let jawRotation = map(vol, 0, 0.5, 0, 25, true);

            fill(0); noStroke(); rectMode(CORNER);
            rect(100, 180, 180, 50); arc(150, 225, 100, 100, 0, 180);
            push(); fill(150); ellipse(150, 225, 70, 70); pop();
            ellipse(150, 225, pp, pp);
            push(); fill(255); ellipse(135, 210, 10, 10); ellipse(260, 195, 5 + vol*40, 5 + vol*40); pop();
            arc(150, 225, 80, 80, 240, arc1, CHORD);
            triangle(100, 155, 100, 180, 130, 180);
            triangle(200, 170, 200, 180, 220, 180); triangle(220, 170, 220, 180, 240, 180); triangle(240, 170, 240, 180, 260, 180);
            if (anger > 50) triangle(130, 155, 130, 180, 160, 180);
            if (anger > 80) triangle(160, 155, 160, 180, 190, 180);
            triangle(280, 230, 260, 245, 260, 230); triangle(250, 230, 230, 245, 230, 230); triangle(220, 230, 200, 245, 200, 230);
            
            push();
            translate(150, 235); stroke(0); strokeWeight(1.5);
            if (anger > 20) rotate(jawRotation);
            rect(0, 40, 80, 49); arc(80, 40, 100, 98, 0, 90); arc(0, 90, 100, 100, 180, 270);
            triangle(130, 40, 130, 25, 110, 40); triangle(100, 40, 100, 25, 80, 40); triangle(70, 40, 70, 25, 50, 40);
            pop();
            pop();
        }
    }
    
    // --- TESCHIO: STABILE E COMPLETO ---
    class SkullScene extends Scene {
        constructor() { super(); this.particles = []; }
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width / 2, height / 2);
            let angerLevel = map(vol, 0.1, 0.8, 0, 1, true);
            let shakeAmount = constrain(map(angerLevel, 0.7, 1, 0, 15, true), 0, 15);
            
            push(); // Contenitore per il tremore
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));

            if (angerLevel > 0.5) {
                let pCount = map(angerLevel, 0.5, 1, 0, 3, true);
                for(let i=0; i<pCount; i++) {
                    this.particles.push(new FlameParticle(-60, -20));
                    this.particles.push(new FlameParticle(60, -20));
                }
            }
            this.drawAngrySkull(angerLevel);
            pop(); // Fine contenitore tremore

            for (let p of this.particles) { p.update(); p.show(); }
            this.particles = this.particles.filter(p => p.lifespan > 0);
        }
        drawAngrySkull(angerLevel) {
            let jawDrop = map(angerLevel, 0, 1, 0, 100);
            fill(0); noStroke(); rectMode(CORNER);
            
            // Cranio e mandibola neri
            beginShape(); vertex(0,-185); bezierVertex(-80,-190,-150,-140,-160,-80); bezierVertex(-170,-20,-145,50,-120,60); vertex(120,60); bezierVertex(145,50,170,-20,160,-80); bezierVertex(150,-140,80,-190,0,-185); endShape(CLOSE);
            push(); translate(0, jawDrop);
            beginShape(); vertex(-115,70); bezierVertex(-125,75,-145,110,-130,160); bezierVertex(-100,185,100,185,130,160); bezierVertex(145,110,125,75,115,70); endShape(CLOSE);
            // Denti inferiori
            fill(255);
            for(let i=0;i<7;i++){let t=i/6,x=lerp(-60,60,t),w=120/7*.9,h=15-pow(abs(t-.5)*2,2)*10;beginShape();vertex(x-w/2,100);vertex(x+w/2,100);vertex(x,100+h);endShape(CLOSE);}
            pop();
            
            // Cavità e denti superiori disegnati sopra
            fill(255);
            let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);
            beginShape(); vertex(-40,-100); bezierVertex(-100,-90,-115,-40+eyePinch,-85,-10+eyePinch); bezierVertex(-70,-5+eyePinch,-45,-20,-40,-40); endShape(CLOSE);
            beginShape(); vertex(40,-100); bezierVertex(100,-90,115,-40+eyePinch,85,-10+eyePinch); bezierVertex(70,-5+eyePinch,45,-20,40,-40); endShape(CLOSE);
            let noseFlare = map(angerLevel, 0, 1, 0, 15);
            triangle(0, 0, -15 - noseFlare, 55, 15 + noseFlare, 55);
            for(let i=0;i<8;i++){let t=i/7,x=lerp(-70,70,t),w=140/8*.9,h=15-pow(abs(t-.5)*2,2)*8;beginShape();vertex(x-w/2,110);vertex(x+w/2,110);vertex(x,110-h);endShape(CLOSE);}
        }
    }

    // --- NUOVA MASCHERA 4 ---
    class WatcherScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2);
            
            let focus = map(vol, 0.1, 0.8, 0, 1, true);
            let blink = 1 - pow(1 - focus, 4); // Easing per un'apertura più d'impatto

            let outerFragmentsAngle = frameCount * 0.1;
            let innerFragmentsAngle = -frameCount * 0.2;

            stroke(255);
            // Frammenti esterni rotanti
            for(let i=0; i<6; i++) {
                push();
                rotate(outerFragmentsAngle + i * 60);
                strokeWeight(2);
                line(250, 0, 300, 0);
                pop();
            }
             // Frammenti interni rotanti
            for(let i=0; i<8; i++) {
                push();
                rotate(innerFragmentsAngle + i * 45);
                strokeWeight(1);
                line(180, 0, 200, 0);
                pop();
            }

            // Occhio centrale
            noFill(); strokeWeight(5);
            ellipse(0, 0, 150, 150 * blink);
            
            // Pupilla che segue il mouse
            if (blink > 0.1) {
                let angleToMouse = atan2(mouseY - height/2, mouseX - width/2);
                let pupilX = cos(angleToMouse) * 30 * focus;
                let pupilY = sin(angleToMouse) * 40 * focus;
                fill(255); noStroke();
                ellipse(pupilX, pupilY, 50 * blink, 50 * blink);
            }
        }
    }
    
    // --- MASCHERA 5 ---
    class CelestialMaskScene extends Scene {
        constructor() { super(); this.stars = Array.from({length: 100}, () => createVector(random(-width, width), random(-height, height))); }
        draw() {
            let vol = this.updateVolume();
            background(24, 24, 24); translate(width / 2, height / 2);
            
            // Costellazioni reattive
            let constellationAlpha = map(vol, 0.1, 0.7, 0, 200, true);
            if (constellationAlpha > 10) {
                stroke(255, constellationAlpha); strokeWeight(0.5);
                for(let i=0; i<this.stars.length; i+=10) {
                    line(this.stars[i].x, this.stars[i].y, this.stars[i+1].x, this.stars[i+1].y);
                    line(this.stars[i+1].x, this.stars[i+1].y, this.stars[i+3].x, this.stars[i+3].y);
                }
            }

            // Maschera principale
            let glow = map(vol, 0, 1, 0, 150, true);
            noFill(); stroke(255); strokeWeight(4);
            arc(0, 0, 300, 300, 140, 400); // Forma a mezzaluna
            // Occhi
            ellipse(-80, -20, 40, 40);
            ellipse(80, -20, 40, 40);
            // Bagliore occhi
            noStroke(); fill(255, glow);
            ellipse(-80, -20, 40, 40);
            ellipse(80, -20, 40, 40);
        }
    }
    
    // Helper per il teschio
    class FlameParticle{constructor(x,y){this.pos=createVector(x,y);this.vel=p5.Vector.random2D().mult(random(2,5));this.lifespan=255;}isFinished(){return this.lifespan<=0;}update(){this.pos.add(this.vel);this.lifespan-=5;}show(){noStroke();fill(0,this.lifespan);ellipse(this.pos.x,this.pos.y,8);}}

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
