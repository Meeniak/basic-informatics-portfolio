(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'Glitched God',
        5: 'Forest Spirit'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(800, 800); // Canvas Quadrato
        canvas.parent(canvasWrapper);
        
        mic = new p5.AudioIn();
        mic.start();
        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        sensitivitySlider = createSlider(1, 20, 8, 0.1); // Gamma più ampia
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        scenes = {
            1: new RobotScene(),
            2: new DragonScene(),
            3: new SkullScene(),
            4: new GlitchedGodScene(),
            5: new ForestSpiritScene()
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
            let visorInfo = { y: -80, width: visorWidth, height: eyeHeight };

            noStroke(); fill(255); rectMode(CENTER);
            rect(0, visorInfo.y, visorInfo.width, visorInfo.height, 3);
            if (eyeHeight > 10) {
                let pupilSize = 60; let pupilXOffset = map(vol, 0.1, 0.5, 0, visorWidth / 2 - 40, true);
                fill(0); ellipse(-pupilXOffset, visorInfo.y, pupilSize, pupilSize); ellipse(pupilXOffset, visorInfo.y, pupilSize, pupilSize);
            }
            noFill(); stroke(255); strokeWeight(8); rect(0, visorInfo.y, visorInfo.width, visorInfo.height, 3);
            
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
                    rect(x, mouthHeight/2 - h, barWidth * 0.8, h); // Corretto per disegnare dal basso
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
            translate(width/2 - 270, height/2 - 270);
            
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
        }
    }
    
    // --- TESCHIO: STABILE E COMPLETO ---
    class SkullScene extends Scene {
        constructor() { super(); this.particles = []; }
        draw() {
            let vol = this.updateVolume();
            background(255); translate(width / 2, height / 2);
            let angerLevel = map(vol, 0.1, 0.8, 0, 1, true);
            let shakeAmount = constrain(map(angerLevel, 0.7, 1, 0, 15, true), 0, 15);
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));

            if (angerLevel > 0.5) {
                let pCount = map(angerLevel, 0.5, 1, 0, 3, true);
                for(let i=0; i<pCount; i++) {
                    this.particles.push(new FlameParticle(-60, -20));
                    this.particles.push(new FlameParticle(60, -20));
                }
            }
            this.drawAngrySkull(angerLevel);
            for (let p of this.particles) { p.update(); p.show(); }
            this.particles = this.particles.filter(p => p.lifespan > 0);
        }
        drawAngrySkull(angerLevel) {
            let jawDrop = map(angerLevel, 0, 1, 0, 100);
            fill(0); noStroke();
            beginShape(); vertex(0,-185); bezierVertex(-80,-190,-150,-140,-160,-80); bezierVertex(-170,-20,-145,50,-120,60); vertex(120,60); bezierVertex(145,50,170,-20,160,-80); bezierVertex(150,-140,80,-190,0,-185); endShape(CLOSE);
            push(); translate(0, jawDrop);
            beginShape(); vertex(-115,70); bezierVertex(-125,75,-145,110,-130,160); bezierVertex(-100,185,100,185,130,160); bezierVertex(145,110,125,75,115,70); endShape(CLOSE);
            pop();
            fill(255);
            let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);
            beginShape(); vertex(-40,-100); bezierVertex(-100,-90,-115,-40+eyePinch,-85,-10+eyePinch); bezierVertex(-70,-5+eyePinch,-45,-20,-40,-40); endShape(CLOSE);
            beginShape(); vertex(40,-100); bezierVertex(100,-90,115,-40+eyePinch,85,-10+eyePinch); bezierVertex(70,-5+eyePinch,45,-20,40,-40); endShape(CLOSE);
            let noseFlare = map(angerLevel, 0, 1, 0, 15);
            triangle(0, 0, -15 - noseFlare, 55, 15 + noseFlare, 55);
        }
    }

    // --- NUOVA MASCHERA 4 ---
    class GlitchedGodScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width/2, height/2);
            let glitchAmount = map(vol, 0.3, 1.0, 0, 80, true);

            // Faccia
            noFill(); stroke(255); strokeWeight(6);
            rect(0, 0, 300, 400, 20);
            // Occhio
            let eyeSize = map(vol, 0, 1, 200, 100, true);
            let pupilSize = map(vol, 0, 1, 150, 20, true);
            ellipse(0, -80, eyeSize, eyeSize);
            fill(255); noStroke(); ellipse(0, -80, pupilSize, pupilSize);
            // Bocca
            noFill(); stroke(255);
            line(-80, 100, 80, 100);

            // Effetto Glitch
            if (glitchAmount > 5) {
                let y = random(-height/2, height/2);
                let h = random(10, 50);
                image(get(0, y, width, h), random(-glitchAmount, glitchAmount), y);
                fill(random(255), random(255), random(255), 100);
                rect(0, 0, width, height);
            }
        }
    }
    
    // --- MASCHERA 5 ---
    class ForestSpiritScene extends Scene {
        constructor() { super(); this.particles = Array.from({length: 50}, () => new LightMote()); }
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2);
            for(let p of this.particles) { p.update(vol); p.show(); }
            
            let headTilt = map(vol, 0, 1, 0, 15, true);
            let leafGrow = map(vol, 0, 1, 0, 60, true);
            let breath = sin(frameCount * 0.03) * 8;
            stroke(255); strokeWeight(4); fill(24, 24, 24);
            push();
            rotate(-headTilt);
            scale(1 + breath/400);
            ellipse(0, 0, 200 + breath, 250 + breath);
            fill(0);
            ellipse(-50, -30, 50, 70);
            ellipse(50, -30, 50, 70);
            noFill(); stroke(255);
            arc(0, 80, 60, lerp(10, 50, vol), 0, 180);
            beginShape();vertex(-100,0);bezierVertex(-150,-50,-150-leafGrow,-100,-100,-150);endShape();
            beginShape();vertex(100,0);bezierVertex(150,-50,150+leafGrow,-100,100,-150);endShape();
            pop();
        }
    }
    
    // Helpers
    class FlameParticle{constructor(x,y){this.pos=createVector(x,y);this.vel=p5.Vector.random2D().mult(random(2,5));this.lifespan=255;}isFinished(){return this.lifespan<=0;}update(){this.pos.add(this.vel);this.lifespan-=5;}show(){noStroke();fill(0,this.lifespan);ellipse(this.pos.x,this.pos.y,8);}}
    class LightMote{constructor(){this.pos=createVector(random(-width/2,width/2),random(-height/1.5,height/1.5));this.vel=createVector(random(-0.5,0.5),-random(0.2,1));this.lifespan=random(50,150);}update(vol){this.pos.add(this.vel);this.vel.y-=vol*0.05;if(this.pos.y<-height/2||this.pos.x<-width/2||this.pos.x>width/2)this.pos.set(random(-width/2,width/2),height/2);}show(){noStroke();fill(255,this.lifespan*vol*2);ellipse(this.pos.x,this.pos.y,3);}}

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
