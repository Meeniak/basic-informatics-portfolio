(function() {
    // ... [codice precedente invariato fino alle classi delle scene]

    // --- ROBOT CON OSCILLOSCOPIO IN BOCCA ---
    class RobotScene extends Scene {
        constructor() {
            super();
            this.waveform = [];
            this.waveformHistory = [];
        }
        
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width / 2, height / 2 + 30);
            rectMode(CENTER);

            // ... [parte superiore del robot invariata]
            
            // Bocca con oscilloscopio
            push();
            translate(0, 100);
            let mouthWidth = 280, mouthHeight = 90;
            noFill(); stroke(0); strokeWeight(6); rect(0, 0, mouthWidth, mouthHeight, 10);
            
            // Oscilloscopio reattivo
            this.waveform = fft.waveform();
            noFill(); stroke(0); strokeWeight(3);
            beginShape();
            for (let i = 0; i < this.waveform.length; i++) {
                let x = map(i, 0, this.waveform.length, -mouthWidth/2, mouthWidth/2);
                let y = map(this.waveform[i], -1, 1, -mouthHeight/3, mouthHeight/3);
                vertex(x, y);
            }
            endShape();
            
            // Aggiungi traccia storica
            this.waveformHistory.push([...this.waveform]);
            if (this.waveformHistory.length > 10) {
                this.waveformHistory.shift();
            }
            
            for (let h = 0; h < this.waveformHistory.length; h++) {
                stroke(0, 50 + h * 20);
                beginShape();
                for (let i = 0; i < this.waveformHistory[h].length; i++) {
                    let x = map(i, 0, this.waveformHistory[h].length, -mouthWidth/2, mouthWidth/2);
                    let y = map(this.waveformHistory[h][i], -1, 1, -mouthHeight/3, mouthHeight/3);
                    vertex(x, y);
                }
                endShape();
            }
            pop();
        }
    }

    // --- DRAGO POSIZIONATO CORRETTAMENTE ---
    class DragonScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0);
            angleMode(DEGREES);
            push();
            translate(width * 0.7, height * 0.7); // Posizione in basso a destra
            scale(1.2);
            
            // ... [resto del codice del drago invariato]
            pop();
        }
    }
    
    // --- TESCHIO CON OCCHI BIANCHI ---
    class SkullScene extends Scene {
        drawAngrySkull(angerLevel) {
            // ... [codice precedente invariato]
            
            // Occhi bianchi con bordi neri
            fill(255); stroke(0); strokeWeight(2);
            ellipse(-60, -20, 40, 25); // Occhio sinistro
            ellipse(60, -20, 40, 25);  // Occhio destro
            
            // Pupille che reagiscono al volume
            let pupilSize = map(angerLevel, 0, 1, 10, 20);
            fill(0); noStroke();
            ellipse(-60, -20 + map(angerLevel, 0, 1, 0, 5), pupilSize, pupilSize);
            ellipse(60, -20 + map(angerLevel, 0, 1, 0, 5), pupilSize, pupilSize);
            
            // ... [resto del codice invariato]
        }
    }

    // --- JESTER CON CAPPELTO INCLINATO ---
    class JesterScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width/2, height/2); angleMode(DEGREES);
            let energy = map(vol, 0.1, 0.8, 0, 1, true);
            
            push();
            translate(0, 50);

            // Cappello inclinato
            push();
            rotate(sin(frameCount * 0.1) * energy * 5); // Leggera inclinazione oscillante
            
            fill(255); noStroke();
            beginShape();
            vertex(0, -150);
            bezierVertex(-250, -100, -200, 220, 0, 250);
            bezierVertex(200, 220, 250, -100, 0, -150);
            endShape(CLOSE);
            
            // Parte centrale del cappello inclinata
            fill(0);
            rectMode(CENTER);
            rect(0, -145, 280, 40, 10);
            
            // Campanelli
            let bellWobble = energy * 25;
            noFill(); stroke(0); strokeWeight(40);
            beginShape(); vertex(0, -165); quadraticVertex(-100, -280, -250, -180); endShape();
            beginShape(); vertex(0, -165); quadraticVertex(100, -280, 250, -180); endShape();
            beginShape(); vertex(-20, -165); vertex(20, -165); vertex(0, -280); endShape();
            
            stroke(0); strokeWeight(3); fill(255);
            ellipse(0 + random(-bellWobble, bellWobble), -280 + random(-bellWobble/2, bellWobble/2), 40, 40);
            ellipse(-250 + random(-bellWobble, bellWobble), -180 + random(-bellWobble/2, bellWobble/2), 40, 40);
            ellipse(250 + random(-bellWobble, bellWobble), -180 + random(-bellWobble/2, bellWobble/2), 40, 40);
            
            pop(); // Fine rotazione cappello
            
            // ... [resto del codice del giullare invariato]
            pop();
        }
    }

    // ... [resto del codice invariato]
})();
