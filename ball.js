// BALL class
class Ball {
    // constructor
    constructor(x, y, label, world, colorValue) {
        this.label = label;
        this.color = colorValue;
        this.body = Matter.Bodies.circle(x, y, ballDiameter / 2, {
            ...BALL_OPTIONS,
            label: label
        });
        Matter.World.add(world, this.body);
    }

    draw() {
        const pos = this.body.position;
        noStroke();
        fill(0, 50); // shadow
        ellipse(pos.x + ballDiameter * 0.08, pos.y + ballDiameter * 0.08, ballDiameter * 1.05);

        fill(this.color);
        ellipse(pos.x, pos.y, ballDiameter);

        fill(255, 180);
        ellipse(pos.x - ballDiameter * 0.2, pos.y - ballDiameter * 0.2, ballDiameter * 0.3);
    }

    isInPocket(pockets) {
        return pockets.some(p => dist(this.body.position.x, this.body.position.y, p.x, p.y) < pocketDiameter / 2);
    }

    remove(world) {
        Matter.World.remove(world, this.body);
    }

    setVelocity(x, y) {
        Matter.Body.setVelocity(this.body, { x, y });
    }

    // getters
    get position() {
        return this.body.position;
    }

    get velocity() {
        return this.body.velocity;
    }
}
