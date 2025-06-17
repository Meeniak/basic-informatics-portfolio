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
        const canvas = createCanvas(650, 650);
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
    
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width / 2, height / 2);
            rectMode(CENTER);

            // Antenne
            let antennaWobble = sin(frameCount * 0.2) * vol * 30;
            stroke(0); strokeWeight(6); noFill();
            line(-80, -150, -120, -220 + antennaWobble);
            line(80, -150, 120, -220 - antennaWobble);
            fill(0); ellipse(-120, -220 + antennaWobble, 15, 15); ellipse(120, -220 - antennaWobble, 15, 15);

            // Dettagli laterali
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

    class DragonScene extends Scene {
        constructor() { super(); this.n = 1; this.increment = 1; }
        draw() {
            let vol = this.updateVolume();
            background(0);
            angleMode(DEGREES);
            push();
            translate(width / 2, height / 2);
            scale(1.2);
            translate(-270, -270);
            
            let anger = map(vol, 0, 0.8, 20, 100, true);
            this.n += this.increment;
            if (this.n >= 30 || this.n <= 0) this.increment *= -1;
            if (anger > 80) { push(); stroke(255, this.n*5, 0); strokeWeight(this.n); noFill(); line(210, 270, 400 + this.n*5, 270); pop(); }

            let pp = map(vol, 0, 0.5, 40, 5, true);
            let arc1 = map(vol, 0, 0.5, -90, 20, true);
            let jawRotation = map(vol, 0, 0.5, 0, 25, true);
            let nostrilSize = constrain(5 + vol * 40, 5, 20);

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
    
    class SkullScene extends Scene {
        constructor() { super(); }
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width / 2, height / 2);
            let angerLevel = map(vol, 0.1, 0.8, 0, 1, true);
            let shakeAmount = constrain(map(angerLevel, 0.6, 1, 0, 20, true), 0, 20);
            
            push();
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
            this.drawAngrySkull(angerLevel);
            pop();
        }
        drawAngrySkull(angerLevel) {
            let jawDrop = map(angerLevel, 0.3, 1, 0, 110, true);
            let cheekFlareX = map(angerLevel, 0.2, 1, 0, 25, true);
            let crownSpike = map(angerLevel, 0.4, 1, 0, 40, true);
            
            push(); translate(0, jawDrop);
            fill(255); noStroke();
            beginShape(); vertex(-115,70); bezierVertex(-125,75,-145-cheekFlareX,110,-130,160); bezierVertex(-100,185,100,185,130,160); bezierVertex(145+cheekFlareX,110,125,75,115,70); endShape(CLOSE);
            this.carveLowerTeeth();
            pop();

            beginShape(); vertex(0,-185-crownSpike); bezierVertex(-80,-190-crownSpike,-150,-140,-160,-80-cheekFlareX); bezierVertex(-170,-20,-145,50,-120,60); vertex(120,60); bezierVertex(145,50,170,-20,160,-80-cheekFlareX); bezierVertex(150,-140,80,-190,0,-185-crownSpike); endShape(CLOSE);
            
            fill(0);
            let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);
            beginShape(); vertex(-40,-100); bezierVertex(-100,-90,-115,-40+eyePinch,-85,-10+eyePinch); bezierVertex(-70,-5+eyePinch,-45,-20,-40,-40); endShape(CLOSE);
            beginShape(); vertex(40,-100); bezierVertex(100,-90,115,-40+eyePinch,85,-10+eyePinch); bezierVertex(70,-5+eyePinch,45,-20,40,-40); endShape(CLOSE);
            let noseFlare = map(angerLevel, 0, 1, 0, 10);
            triangle(0, 20, -15 - noseFlare, 45, 15 + noseFlare, 45);
        }
        carveLowerTeeth(){ fill(0); for(let i=0;i<5;i++){ let x=lerp(-50,50,i/4); rect(x, 110, 14, 18, 3); } }
    }

    class CyberEyeScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width/2, height/2); angleMode(RADIANS);
            let focus = map(vol, 0.1, 0.9, 0, 1, true);
            
            stroke(255, 80); strokeWeight(1); noFill();
            for(let i=1; i<5; i++) {
                let d = 200 + i*40 + sin(frameCount * 0.02 * i + i) * 20 * focus;
                ellipse(0,0,d,d);
            }
            
            // Griglia prospettica
            let gridVanishing = map(focus, 0, 1, 0, 200);
            stroke(255, 50);
            for(let i=0; i<10; i++) {
                let y = lerp(-height/2, height/2, i/9);
                line(-width/2, y, -gridVanishing, 0);
                line(width/2, y, gridVanishing, 0);
            }
            
            let pupilSize = lerp(180, 30, focus);
            let irisSize = lerp(190, 100, focus);
            let pupilGlow = map(vol, 0.4, 1.0, 50, 255, true);
            noStroke();
            fill(255, 0, 0, pupilGlow);
            ellipse(0,0,irisSize, irisSize);
            fill(255);
            ellipse(0,0,pupilSize, pupilSize);

            if (vol > 0.4) {
                let y = random(-height/2, height/2);
                let h = random(5, 30);
                image(get(0, y, width, h), random(-30, 30), y);
            }
        }
    }
    
    class TribalSunScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2); angleMode(DEGREES);
            let energy = map(vol, 0, 1, 0, 1, true);
            let pulse = sin(frameCount*5)*5*energy;

            // Raggi
            stroke(255); strokeWeight(2 + 4*energy);
            for(let i=0; i<12; i++) {
                let angle = i * 30;
                let length = lerp(150, 250, energy);
                push(); rotate(angle); line(120, 0, length, 0); pop();
            }
            // Raggi interni
            strokeWeight(1);
            for(let i=0; i<12; i++) {
                let angle = i * 30 - frameCount*0.8;
                let length = lerp(80, 120, energy);
                push(); rotate(angle); line(80, 0, length, 0); pop();
            }

            // Faccia
            noStroke(); fill(24,24,24); ellipse(0,0,220+pulse,220+pulse);
            stroke(255); strokeWeight(6); noFill();
            ellipse(0,0,200+pulse,200+pulse);
            
            let eyeY = lerp(0, -15, energy);
            line(-80, -30, -40, -30 + eyeY);
            line(80, -30, 40, -30 + eyeY);
            
            let mouthY = lerp(50, 70, energy);
            line(-40, 50, 40, mouthY);
        }
    }
    
    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
