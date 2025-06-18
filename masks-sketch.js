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
    
    // --- ROBOT (spostato più in basso per centratura) ---
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

    // --- DRAGO (spostato leggermente a destra) ---
    class DragonScene extends Scene {
        constructor() { super(); }
        draw() {
            let vol = this.updateVolume();
            background(0);
            angleMode(DEGREES);
            push();
            translate(width / 2 + 20, height / 2); // Spostato a destra
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
    
    // --- TESCHIO (completamente ridisegnato simmetrico con pupille pirata) ---
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
            
            noStroke(); fill(255);
            
            // Cranio perfettamente simmetrico
            beginShape();
            vertex(0, -185 - crownSpike);
            // Lato destro
            bezierVertex(80, -190-crownSpike, 150, -140, 160, -80-cheekFlare);
            bezierVertex(170, -20, 145, 50, 120, 60);
            vertex(0, 60);
            // Lato sinistro (speculare perfetto)
            vertex(-120, 60);
            bezierVertex(-145, 50, -170, -20, -160, -80-cheekFlare);
            bezierVertex(-150, -140, -80, -190-crownSpike, 0, -185-crownSpike);
            endShape(CLOSE);

            // Mandibola simmetrica
            push(); 
            translate(0, jawDrop);
            beginShape();
            vertex(0, 70);
            vertex(115, 70); 
            bezierVertex(125, 75, 145+cheekFlare, 110, 130, 160);
            vertex(-130, 160); 
            bezierVertex(-145-cheekFlare, 110, -125, 75, -115, 70);
            vertex(0, 70);
            endShape(CLOSE);
            
            // Denti sul bordo della mandibola
            this.drawTeethOnJaw();
            pop();

            // Cavità oculari simmetriche con maggiore reattività
            fill(0);
            let eyeExpansion = map(anger, 0, 1, 0, 40, true); // Più reattivi
            
            // Occhio sinistro
            beginShape(); 
            vertex(-40-eyeExpansion/2, -100); 
            bezierVertex(-100-eyeExpansion, -90, -115-eyeExpansion, -40, -85, -10); 
            bezierVertex(-70, -5, -45, -20, -40, -40); 
            endShape(CLOSE);
            
            // Occhio destro (perfettamente speculare)
            beginShape(); 
            vertex(40+eyeExpansion/2, -100); 
            bezierVertex(100+eyeExpansion, -90, 115+eyeExpansion, -40, 85, -10); 
            bezierVertex(70, -5, 45, -20, 40, -40); 
            endShape(CLOSE);
            
            // Pupille "piratate" che appaiono sopra soglia
            if (anger > 0.4) {
                fill(255);
                // Pupilla sinistra con benda pirata
                ellipse(-65, -60, 20, 20);
                fill(0);
                rect(-75, -65, 20, 10); // Benda
                
                // Pupilla destra normale
                fill(255);
                ellipse(65, -60, 20, 20);
                fill(0);
                ellipse(65, -60, 8, 8); // Pupilla normale
            }
            
            // Cavità nasale simmetrica
            fill(0);
            let noseFlare = map(anger, 0, 1, 0, 10);
            triangle(0, 20, -15 - noseFlare, 45, 15 + noseFlare, 45);
        }
        
        drawTeethOnJaw() {
            fill(0); 
            rectMode(CENTER); 
            // Denti posizionati esattamente sul bordo della mandibola
            for(let i = 0; i < 7; i++) {
                let x = lerp(-70, 70, i/6);
                rect(x, 70, 12, 20, 3); // Posizionati sul bordo a y=70
            }
        }
    }

    // --- CELESTIAL GUARDIAN (migliorato con elementi aggiuntivi) ---
    class CelestialGuardianScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0); translate(width/2, height/2); angleMode(RADIANS);
            let energy = map(vol, 0.1, 1.0, 0, 1, true);

            let rotation = frameCount * 0.01;
            let haloRadius = lerp(200, 250, energy);

            // Alone esterno pulsante
            stroke(255, 150); strokeWeight(2); noFill();
            for(let i=0; i<10; i++) {
                let angle = i * TWO_PI / 10 + rotation;
                let x = cos(angle) * haloRadius;
                let y = sin(angle) * haloRadius;
                push(); translate(x,y); rotate(angle);
                triangle(-15,0, 15,0, 0, -30);
                pop();
            }
            
            // Alone interno che reagisce al suono
            strokeWeight(1); stroke(255, 200);
            let innerRadius = lerp(150, 180, energy);
            for(let i=0; i<20; i++) {
                let angle = i * TWO_PI / 20 - rotation;
                let x = cos(angle) * innerRadius;
                let y = sin(angle) * innerRadius;
                point(x, y);
            }

            // Corpo principale
            noFill(); strokeWeight(5); stroke(255); rectMode(CENTER);
            rect(0,0, 250, 350, 20);
            
            // Simbolo mistico al centro che pulsa
            push();
            rotate(frameCount * 0.02);
            stroke(255, 150 + energy * 105); strokeWeight(3);
            let symbolSize = 60 + energy * 20;
            line(-symbolSize/2, 0, symbolSize/2, 0);
            line(0, -symbolSize/2, 0, symbolSize/2);
            ellipse(0, 0, symbolSize, symbolSize);
            pop();
            
            // Particelle di energia che volano via
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

            // Bocca tonda più reattiva
            let mouthSize = lerp(10, 80, energy);
            fill(255); noStroke();
            ellipse(0, 100, mouthSize, mouthSize);

            // Occhi più espressivi
            let eyeOpen = lerp(5, 50, energy);
            fill(0); stroke(255); strokeWeight(5);
            ellipse(-80, -30, 70, eyeOpen);
            ellipse(80, -30, 70, eyeOpen);
            
            // Pupille che si accendono con alta energia
            if (energy > 0.6) {
                fill(255, 200); noStroke();
                ellipse(-80, -30, 20, 20);
                ellipse(80, -30, 20, 20);
            }
        }
    }
    
    // --- JESTER (cappello completamente ridisegnato) ---
    class JesterScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24, 24, 24); translate(width/2, height/2); angleMode(DEGREES);
            let energy = map(vol, 0.1, 0.8, 0, 1, true);
            
            push();

            // Cappello da giullare tradizionale migliorato
            let bellWobble = energy * 15;
            noStroke(); 
            
            // Base del cappello
            fill(120, 0, 120); // Viola scuro
            ellipse(0, -120, 200, 60);
            
            // Punte del cappello con pattern a strisce
            for(let i = 0; i < 3; i++) {
                let angle = i * 120 - 60; // -60, 60, 180 gradi
                let wobbleX = cos(radians(angle)) * bellWobble;
                let wobbleY = sin(radians(angle)) * bellWobble;
                
                push();
                rotate(angle);
                
                // Punta con strisce alternate
                for(let j = 0; j < 8; j++) {
                    fill(j % 2 == 0 ? color(120, 0, 120) : color(255, 215, 0)); // Viola e oro
                    let segmentY = -120 - j * 25;
                    let segmentWidth = map(j, 0, 7, 40, 8);
                    ellipse(0, segmentY, segmentWidth, 30);
                }
                
                // Campanella alla punta
                stroke(255, 215, 0); strokeWeight(2); fill(255, 215, 0);
                let bellY = -320 + wobbleY;
                ellipse(wobbleX, bellY, 25, 25);
                
                // Filo della campanella
                stroke(255, 215, 0); strokeWeight(1);
                line(0, -295, wobbleX, bellY);
                
                pop();
            }

            // Faccia del giullare
            noStroke(); fill(255, 240, 220); // Carnagione
            ellipse(0, 0, 280, 320);
            
            // Trucco del giullare
            fill(255, 0, 0); // Rosso
            ellipse(-100, 40, 60, 60); // Guancia sinistra
            ellipse(100, 40, 60, 60);  // Guancia destra
            
            // Dettagli degli occhi
            fill(0); noStroke();
            let pupilY = lerp(3, -12, energy);
            let pupilSize = lerp(15, 30, energy);
            let tearLength = lerp(40, 120, energy);
            
            // Sopracciglia espressive
            strokeWeight(8); stroke(0);
            let browAngle = map(energy, 0, 1, 0, 20);
            push(); translate(-80, -60); rotate(-browAngle); line(-30, 0, 30, 0); pop();
            push(); translate(80, -60); rotate(browAngle); line(-30, 0, 30, 0); pop();
            
            // Occhi
            noStroke();
            arc(-80, -30, 80, 120, 180, 360);
            arc(80, -30, 80, 120, 180, 360);
            
            // Pupille che si muovono
            fill(255);
            ellipse(-80, -25 + pupilY, pupilSize, pupilSize);
            ellipse(80, -25 + pupilY, pupilSize, pupilSize);
            
            // Punto nero nelle pupille
            fill(0);
            ellipse(-80, -25 + pupilY, pupilSize/3, pupilSize/3);
            ellipse(80, -25 + pupilY, pupilSize/3, pupilSize/3);

            // Lacrime che si allungano
            fill(0, 100, 255); // Lacrime blu
            ellipse(-90, 0, 8, tearLength);
            ellipse(90, 0, 8, tearLength);
            
            // Bocca a sorriso esagerato
            fill(255, 0, 0);
            let smileWidth = lerp(100, 200, energy);
            let smileHeight = lerp(15, 80, energy);
            arc(0, 120, smileWidth, smileHeight, 0, 180, CHORD);
            
            // Denti bianchi nel sorriso
            if (energy > 0.3) {
                fill(255);
                for(let i = 0; i < 6; i++) {
                    let x = lerp(-smileWidth/3, smileWidth/3, i/5);
                    rect(x, 120, 8, smileHeight/2);
                }
            }

            pop();
        }
    }
    
    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
