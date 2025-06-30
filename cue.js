// CUE class
class Cue {
    constructor() {
        this.aiming = false;
        this.aimStart = null;
        this.aimEnd = null;
        this.showLine = true;
    }

    // aiming helpers
    startAiming(position) {
        this.aiming = true;
        this.aimStart = createVector(position.x, position.y);
        this.aimEnd = null;
        this.showLine = true;
    }

    updateAiming(x, y) {
        if (this.aiming) {
            this.aimEnd = createVector(x, y);
        }
    }


    endAiming(x, y) {
        this.aiming = false;
        this.aimEnd = createVector(x, y);
    }

    // shooting
    shoot(cueBallBody) {
        if (!cueBallBody || !this.aimEnd) return;
        const force = p5.Vector.sub(this.aimStart, this.aimEnd).mult(0.0005);
        Matter.Body.applyForce(cueBallBody, cueBallBody.position, { x: force.x, y: force.y });
        this.aimEnd = null;
        this.showLine = false;
    }

    draw(ballPosition) {
        if (!this.aiming) return;

        // vector from ball to mouse (direction user is dragging)
        let dragVec = createVector(mouseX - ballPosition.x, mouseY - ballPosition.y);
        let dragDist = dragVec.mag();
        if (dragDist < 1) return;

        let cueLength = 100;
        let maxPower = 100;

        // cue stick
        let cueVec = dragVec.copy().normalize().mult(cueLength);
        // brown part
        stroke(139, 69, 19);
        strokeWeight(6);
        line(
            ballPosition.x,
            ballPosition.y,
            ballPosition.x + cueVec.x,
            ballPosition.y + cueVec.y
        );

        // cue tip (grey)
        stroke(128);
        strokeWeight(8);
        point(ballPosition.x, ballPosition.y);

        // aim line showing where the ball will go
        let aimVec = dragVec.copy().normalize().mult(-min(dragDist, maxPower));

        // change color depending on distance/power
        let aimColor = color(0, 255, 0);
        if (dragDist > 30) aimColor = color(255, 255, 0);
        if (dragDist > 60) aimColor = color(255, 0, 0);

        stroke(aimColor);
        strokeWeight(2);
        line(
            ballPosition.x,
            ballPosition.y,
            ballPosition.x + aimVec.x,
            ballPosition.y + aimVec.y
        );
    }



}
