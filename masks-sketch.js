(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'The Watcher',
        5: 'Oni Devil' // Nuova Maschera
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(800, 800);
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
            5: new OniScene()
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
    
    // --- ROBOT: Colori invertiti e FFT centrato ---
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255); // Sfondo bianco
            translate(width / 2, height / 2);
            rectMode(CENTER);

            let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
            let visorScaleX = map(vol, 0, 0.5, 1, 1.2, true);
            let visorWidth = 280 * visorScaleX;
            
            noStroke(); fill(0); // Elementi neri
            rect(0, -80, visorWidth, eyeHeight, 3);
            if (eyeHeight > 10) {
                let pupilSize = 60; let pupilXOffset = map(vol, 0.1, 0.5, 0, visorWidth / 2 - 40, true);
                fill(255); // Pupille bianche
                ellipse(-pupilXOffset, -80, pupilSize, pupilSize);
                ellipse(pupilXOffset, -80, pupilSize, pupilSize);
            }
            noFill(); stroke(0); strokeWeight(8); rect(0, -80, visorWidth, eyeHeight, 3);
            
            push();
            translate(0, 100);
            let mouthWidth = 280, mouthHeight = 90;
            noFill(); stroke(0); strokeWeight(6); rect(0, 0, mouthWidth, mouthHeight, 10);
            
            let spectrum = fft.analyze();
            if (spectrum?.length) {
                noStroke(); fill(0);
                let barWidth = mouthWidth / spectrum.length;
                // FIX: Sposta le barre verso l'alto per centrarle meglio
                translate(0, -5); 
                for (let i=0; i < spectrum.length; i++) {
                    let x = map(i, 0, spectrum.length - 1, -mouthWidth/2 + barWidth/2, mouthWidth/2 - barWidth/2);
                    let h = map(spectrum[i], 0, 255, 0, mouthHeight - 15);
                    rect(x, (mouthHeight/2) - h, barWidth * 0.8, h);
                }
            }
            pop();
        }
    }

    // --- DRAGO: Centrato e ingrandito ---
    class DragonScene extends Scene {
        constructor() { super(); this.n = 1; this.increment = 1; }
        draw() {
            let vol = this.updateVolume();
            background(220);
            angleMode(DEGREES);
            push();
            translate(width / 2, height / 2); // Centra
            scale(1.5); // Ingrandisce
            translate(-270, -270); // Sposta il punto di origine del disegno originale al centro
            
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
        constructor() { super(); }
        draw() {
            let vol = this.updateVolume();
            background(255); translate(width / 2, height / 2);
            let angerLevel = map(vol, 0.1, 0.8, 0, 1, true);
            let shakeAmount = constrain(map(angerLevel, 0.6, 1, 0, 20, true), 0, 20);
            
            push();
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
            this.drawAngrySkull(angerLevel);
            pop();
        }
        drawAngrySkull(angerLevel) {
            let jawDrop = map(angerLevel, 0.3, 1, 0, 110, true);
            let eyeSlant = map(angerLevel, 0, 1, 0, 30);
            let cheekFlareX = map(angerLevel, 0, 1, 0, 20);
            
            fill(0); noStroke();
            push(); translate(0, jawDrop);
            beginShape(); vertex(-115,70); bezierVertex(-125,75,-145,110,-130,160); bezierVertex(-100,185,100,185,130,160); bezierVertex(145,110,125,75,115,70); endShape(CLOSE);
            this.carveLowerTeeth();
            pop();

            beginShape(); vertex(0,-185); bezierVertex(-80,-190,-150,-140,-160,-80); bezierVertex(-170,-20,-145,50,-120,60); vertex(120,60); bezierVertex(145,50,170,-20,160,-80); bezierVertex(150,-140,80,-190,0,-185); endShape(CLOSE);
            this.carveTopTeeth();

            fill(255);
            let noseFlare = map(angerLevel, 0, 1, 0, 10);
            triangle(0, 20, -15 - noseFlare, 50, 15 + noseFlare, 50); // Naso più corto
            
            let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);
            beginShape(); vertex(-40,-100); bezierVertex(-100,-90,-115,-40+eyePinch,-85,-10+eyePinch); bezierVertex(-70,-5+eyePinch,-45,-20,-40,-40); endShape(CLOSE);
            beginShape(); vertex(40,-100); bezierVertex(100,-90,115,-40+eyePinch,85,-10+eyePinch); bezierVertex(70,-5+eyePinch,45,-20,40,-40); endShape(CLOSE);
        }
        carveTopTeeth(){ fill(255); for(let i=0;i<6;i++){ let x=lerp(-60,60,i/5); rect(x, 100, 15, 20, 3); } }
        carveLowerTeeth(){ fill(255); for(let i=0;i<5;i++){ let x=lerp(-50,50,i/4); rect(x, 110, 14, 18, 3); } }
    }

    // --- WATCHER (MIGLIORATO) ---
    class WatcherScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2); angleMode(RADIANS);
            let focus = map(vol, 0.1, 0.8, 0, 1, true);
            
            // Frammenti
            stroke(255); noFill(); strokeWeight(2);
            for(let i=0; i<8; i++) {
                push();
                rotate(frameCount * 0.005 * (i % 2 === 0 ? 1 : -1) + i * PI / 4);
                let dist = lerp(200, 250, (sin(frameCount * 0.02 + i) + 1) / 2);
                line(dist, 0, dist + 30, 0);
                pop();
            }

            // Occhio
            let eyeOpen = lerp(5, 160, focus);
            let pupilSize = lerp(140, 20, focus);
            strokeWeight(5); fill(0);
            ellipse(0, 0, 160, eyeOpen);
            
            // Pupilla
            if (blink > 0.1) {
                let angleToMouse = atan2(mouseY - height/2, mouseX - width/2);
                let pupilX = cos(angleToMouse) * 25 * focus;
                let pupilY = sin(angleToMouse) * 35 * focus;
                let pupilGlow = map(vol, 0.4, 1.0, 0, 255, true);
                noStroke();
                fill(255, 50 + pupilGlow);
                ellipse(pupilX, pupilY, pupilSize, pupilSize);
                fill(255);
                ellipse(pupilX, pupilY, pupilSize * 0.4, pupilSize * 0.4);
            }
        }
    }
    
    // --- NUOVA MASCHERA 5 ---
    class OniScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2);
            let anger = map(vol, 0, 1, 0, 1, true);

            // Elementi statici
            stroke(255); strokeWeight(6); noFill();
            let faceW = 300, faceH = 400;
            rect(0, 0, faceW, faceH, 20); // Faccia
            
            // Elementi reattivi
            let browAngle = lerp(10, -25, anger);
            let fangLength = lerp(0, 80, anger);
            let eyeGlow = lerp(0, 255, anger);

            // Sopracciglia
            push(); translate(-90, -100); rotate(browAngle); line(-40, 0, 40, 0); pop();
            push(); translate(90, -100); rotate(-browAngle); line(-40, 0, 40, 0); pop();
            
            // Occhi
            fill(0); ellipse(-90, -40, 80, 80); ellipse(90, -40, 80, 80);
            noStroke(); fill(255, 0, 0, eyeGlow);
            ellipse(-90, -40, 80, 80); ellipse(90, -40, 80, 80);

            // Bocca e Zanne
            fill(0); stroke(255);
            rect(0, 100, 180, 80, 10);
            fill(255); noStroke();
            triangle(-70, 100, -90, 100 + fangLength, -50, 100 + fangLength);
            triangle(70, 100, 90, 100 + fangLength, 50, 100 + fangLength);
        }
    }
    
    // Helper per il teschio
    class FlameParticle{constructor(x,y){this.pos=createVector(x,y);this.vel=p5.Vector.random2D().mult(random(2,5));this.lifespan=255;}isFinished(){return this.lifespan<=0;}update(){this.pos.add(this.vel);this.lifespan-=5;}show(){noStroke();fill(0,this.lifespan);ellipse(this.pos.x,this.pos.y,8);}}

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
