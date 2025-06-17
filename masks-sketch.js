(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'Cyber Eye',
        5: 'Tribal Sun'
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
            4: new CyberEyeScene(),
            5: new TribalSunScene()
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
    
    // --- ROBOT: FFT CORRETTO ---
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0);
            translate(width / 2, height / 2);
            rectMode(CENTER);

            let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
            let visorWidth = 280 * map(vol, 0, 0.5, 1, 1.2, true);
            
            noStroke(); fill(255);
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
                    rect(x, 0, barWidth * 0.8, h); // Disegna dal centro
                }
            }
            pop();
        }
    }

    // --- DRAGO: CENTRATO E INGRANDITO ---
    class DragonScene extends Scene {
        constructor() { super(); this.n = 1; this.increment = 1; }
        draw() {
            let vol = this.updateVolume();
            background(220);
            angleMode(DEGREES);
            push();
            translate(width / 2, height / 2);
            scale(1.5);
            translate(-270, -270);
            
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
            let shakeAmount = constrain(map(angerLevel, 0.6, 1, 0, 15, true), 0, 15);
            
            push();
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
            this.drawAngrySkull(angerLevel);
            pop();
        }
        drawAngrySkull(angerLevel) {
            let jawDrop = map(angerLevel, 0.3, 1, 0, 110, true);
            let cheekFlareX = map(angerLevel, 0, 1, 0, 20);
            let crownSpike = map(angerLevel, 0, 1, 0, 30);
            
            // Mascella
            push(); translate(0, jawDrop);
            fill(0); noStroke();
            beginShape(); vertex(-115,70); bezierVertex(-125,75,-145,110,-130,160); bezierVertex(-100,185,100,185,130,160); bezierVertex(145,110,125,75,115,70); endShape(CLOSE);
            this.carveLowerTeeth();
            pop();
            
            // Cranio
            beginShape(); vertex(0,-185-crownSpike); bezierVertex(-80,-190-crownSpike,-150,-140,-160,-80-cheekFlareX); bezierVertex(-170,-20,-145,50,-120,60); vertex(120,60); bezierVertex(145,50,170,-20,160,-80-cheekFlareX); bezierVertex(150,-140,80,-190,0,-185-crownSpike); endShape(CLOSE);
            
            // Cavità
            fill(255);
            let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);
            beginShape(); vertex(-40,-100); bezierVertex(-100,-90,-115,-40+eyePinch,-85,-10+eyePinch); bezierVertex(-70,-5+eyePinch,-45,-20,-40,-40); endShape(CLOSE);
            beginShape(); vertex(40,-100); bezierVertex(100,-90,115,-40+eyePinch,85,-10+eyePinch); bezierVertex(70,-5+eyePinch,45,-20,40,-40); endShape(CLOSE);
            let noseFlare = map(angerLevel, 0, 1, 0, 10);
            triangle(0, 0, -15 - noseFlare, 45, 15 + noseFlare, 45); // Naso più corto
        }
        carveLowerTeeth(){ fill(255); for(let i=0;i<5;i++){ let x=lerp(-50,50,i/4); rect(x, 110, 14, 18, 3); } }
    }

    // --- NUOVA MASCHERA 4 ---
    class CyberEyeScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width/2, height/2); angleMode(RADIANS);
            let focus = map(vol, 0.1, 0.9, 0, 1, true);

            // Anelli esterni
            stroke(255, 80); strokeWeight(1); noFill();
            for(let i=1; i<5; i++) {
                let d = 200 + i*40 + sin(frameCount * 0.02 * i) * 20;
                ellipse(0,0,d,d);
            }

            // Occhio
            let pupilSize = lerp(180, 30, focus);
            let irisSize = lerp(190, 100, focus);
            noStroke();
            fill(255, 0, 0, 150 + focus*105);
            ellipse(0,0,irisSize, irisSize);
            fill(0);
            ellipse(0,0,pupilSize, pupilSize);

            // Glitch
            if (vol > 0.4) {
                let y = random(-height/2, height/2);
                let h = random(5, 30);
                image(get(0, y, width, h), random(-30, 30), y);
            }
        }
    }
    
    // --- NUOVA MASCHERA 5 ---
    class TribalSunScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2); angleMode(DEGREES);
            let energy = map(vol, 0, 1, 0, 1, true);

            // Raggi esterni
            stroke(255); strokeWeight(2);
            for(let i=0; i<12; i++) {
                let angle = i * 30 + frameCount * 0.5;
                let length = lerp(150, 250, energy);
                let start = 120;
                line(cos(angle)*start, sin(angle)*start, cos(angle)*length, sin(angle)*length);
            }

            // Faccia
            noStroke(); fill(24,24,24); ellipse(0,0,220,220); // Maschera per i raggi
            stroke(255); strokeWeight(6);
            ellipse(0,0,200,200);

            // Occhi
            let eyeSize = lerp(10, 30, energy);
            line(-80, -30, -40, -30 - eyeSize);
            line(80, -30, 40, -30 - eyeSize);

            // Bocca
            let mouthY = lerp(50, 70, energy);
            line(-40, 50, 40, mouthY);
        }
    }
    
    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
