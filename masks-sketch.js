(function() {
    // ... [tutto il codice iniziale invariato fino alle classi delle scene]

    // --- DRAGO CENTRATO ---
    class DragonScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0);
            angleMode(DEGREES);
            push();
            translate(width / 2, height / 2); // Ora centrato
            scale(1.5); // Scala originale
            
            // ... [resto del codice del drago invariato]
            pop();
        }
    }

    // --- JESTER CON CAPPELTO DRITTO ---
    class JesterScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width/2, height/2); 
            angleMode(DEGREES);
            let energy = map(vol, 0.1, 0.8, 0, 1, true);
            
            push();
            translate(0, 50);

            // Cappello dritto (rimosso rotate)
            fill(255); noStroke();
            beginShape();
            vertex(0, -150);
            bezierVertex(-250, -100, -200, 220, 0, 250);
            bezierVertex(200, 220, 250, -100, 0, -150);
            endShape(CLOSE);
            
            // Parte centrale del cappello
            fill(0);
            rectMode(CENTER);
            rect(0, -145, 280, 40, 10);
            
            // Campanelli perfettamente simmetrici
            let bellWobble = energy * 25;
            noFill(); stroke(0); strokeWeight(40);
            
            // Lati sinistro e destro simmetrici
            beginShape(); 
            vertex(0, -165); 
            bezierVertex(-100, -280, -250, -200, -250, -200);
            endShape();
            
            beginShape(); 
            vertex(0, -165); 
            bezierVertex(100, -280, 250, -200, 250, -200);
            endShape();
            
            // Parte centrale simmetrica
            triangle(-20, -165, 20, -165, 0, -280);
            
            // Campanelli
            stroke(0); strokeWeight(3); fill(255);
            ellipse(0 + random(-bellWobble, bellWobble), -280, 40, 40); // Centrale
            ellipse(-250 + random(-bellWobble, bellWobble), -200, 40, 40); // Sinistro
            ellipse(250 + random(-bellWobble, bellWobble), -200, 40, 40); // Destro
            
            // Linguette dei campanelli
            fill(0);
            triangle(0 + random(-bellWobble/2, bellWobble/2), -260, 
                    0 + random(-bellWobble/2, bellWobble/2), -270, 
                    5 + random(-bellWobble/2, bellWobble/2), -265);
            
            triangle(-250 + random(-bellWobble/2, bellWobble/2), -190, 
                    -250 + random(-bellWobble/2, bellWobble/2), -200, 
                    -245 + random(-bellWobble/2, bellWobble/2), -195);
            
            triangle(250 + random(-bellWobble/2, bellWobble/2), -190, 
                    250 + random(-bellWobble/2, bellWobble/2), -200, 
                    255 + random(-bellWobble/2, bellWobble/2), -195);

            // Faccia
            fill(0);
            let pupilY = lerp(0, -10, energy);
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
            
            pop();
        }
    }

    // ... [resto del codice invariato]
})();
