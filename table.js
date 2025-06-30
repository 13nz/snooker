class Table {
    constructor(x, y, length, width, world) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.width = width;
        this.world = world;
        this.pockets = this.createPockets();
        this.cushions = [];
        this.createCushions();
    }

    // create the 6 pockets
    createPockets() {
        return [
            createVector(this.x, this.y),
            createVector(this.x + this.length / 2, this.y),
            createVector(this.x + this.length, this.y),
            createVector(this.x, this.y + this.width),
            createVector(this.x + this.length / 2, this.y + this.width),
            createVector(this.x + this.length, this.y + this.width),
        ];
    }

    // create cushions and avoid pockets
    createCushions() {
        const thickness = 20; // to ensure ball collision
        const gap = pocketDiameter;
        const halfGap = gap / 2; // for corners
        const horizontalLength = (this.length - 2 * halfGap - gap) / 2;

        const cushionSpecs = [
            // top
            [this.x + halfGap + horizontalLength / 2, this.y - thickness / 2, horizontalLength, thickness],
            [this.x + halfGap + horizontalLength + gap + horizontalLength / 2, this.y - thickness / 2, horizontalLength, thickness],
            // bottom
            [this.x + halfGap + horizontalLength / 2, this.y + this.width + thickness / 2, horizontalLength, thickness],
            [this.x + halfGap + horizontalLength + gap + horizontalLength / 2, this.y + this.width + thickness / 2, horizontalLength, thickness],
            // left
            [this.x - thickness / 2, this.y + halfGap + (this.width - 2 * halfGap) / 2, thickness, this.width - 2 * halfGap],
            // right
            [this.x + this.length + thickness / 2, this.y + halfGap + (this.width - 2 * halfGap) / 2, thickness, this.width - 2 * halfGap]
        ];

        for (let [x, y, w, h] of cushionSpecs) {
            const cushion = Matter.Bodies.rectangle(x, y, w, h, CUSHION_OPTIONS);
            Matter.World.add(this.world, cushion);
            this.cushions.push(cushion);
        }
    }

    draw() {
        push();
        // table green gradient
        let gradient = drawingContext.createLinearGradient(this.x, 0, this.x + this.length, 0);
        gradient.addColorStop(0, '#356b3b');
        gradient.addColorStop(1, '#1e3922');
        drawingContext.fillStyle = gradient;
        noStroke();
        rect(this.x, this.y, this.length, this.width, 20);
        pop();

        strokeWeight(20);
        stroke(80, 42, 42);
        noFill();
        rect(this.x - 10, this.y - 10, this.length + 20, this.width + 20, 20);

        fill(0);
        noStroke();
        let px = [0, this.length / 2, this.length];
        let py = [0, this.width];
        for (let x of px) {
            for (let y of py) {
            ellipse(this.x + x, this.y + y, pocketDiameter);
            }
        }

        // vertical line and D zone
        const baulkX = this.x + this.length * 0.25;
        const centerY = this.y + this.width / 2;
        stroke(255);
        strokeWeight(2);
        line(baulkX, this.y, baulkX, this.y + this.width);
        noFill();
        arc(baulkX, centerY, ballDiameter * 8, ballDiameter * 8, HALF_PI, -HALF_PI);
    }

    drawPockets() {
        noStroke();
        for (let p of this.pockets) {
            // gradient for pockets
            const g = drawingContext.createRadialGradient(p.x, p.y, pocketDiameter * 0.1, p.x, p.y, pocketDiameter * 0.5);
            g.addColorStop(0, "#333");
            g.addColorStop(1, "#000");
            drawingContext.fillStyle = g;
            drawingContext.beginPath();
            drawingContext.arc(p.x, p.y, pocketDiameter / 2, 0, 2 * Math.PI);
            drawingContext.fill();
        }
    }
    // show cushions for debug mode
    showCushionsDebug() {
        push();
        fill(0, 255, 255, 80);
        noStroke()
        for (let cushion of this.cushions) {
            const width = cushion.bounds.max.x - cushion.bounds.min.x;
            const height = cushion.bounds.max.y - cushion.bounds.min.y;
            const pos = cushion.position;
            const angle = cushion.angle;

            push();
            translate(pos.x, pos.y)
            rotate(angle);
            rectMode(CENTER);
            rect(0, 0, width, height);
            pop();
        }
    }

    showLuckyPocketsDebug(luckyPockets) {
        push();
        noFill();
        stroke(255, 215, 0);
        strokeWeight(3);
        luckyPockets.forEach(p => {
            ellipse(p.x, p.y, pocketDiameter * 1.4);
        });
        pop();
    }
}
