// Matter.js aliases
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;

// GLOBAL variables

// basic variables
let engine, world;
let table, cue;
let cueBall = null;
let reds = [];
let colors = [];
let ballDiameter, pocketDiameter;
let tableX, tableY, tableLength, tableWidth;
let colorSpots = {};

// state variables
let score = 0;
let cueBallMustBePlaced = true;
let lastPottedType = null;

let respotMessage = "";
let respotMessageTimer = 0;
let foulMessage = "";
let foulTimer = 0;

// rewind extension
let lastBallStates = null;
let rewindCooldown = 0;
let rewindButton;

// lucky pockets extension
let luckyPockets = [];
let luckyPocketHitEffect = [];

// collision messages
let cueCollisionMessage = "";
let cueCollisionTimer = 0;


// debugging
let debugMode = false;

// constant ball attributes
const BALL_OPTIONS = {
    restitution: 0.9,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0.02,
    inertia: Infinity
};

// constant cushion atttributes
const CUSHION_OPTIONS = {
    isStatic: true,
    restitution: 0.95,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    label: 'cushion'
};


function setup() {
    // create canvas & engine
    createCanvas(windowWidth, windowHeight);
    engine = Engine.create();
    // for controlling ball speed
    engine.positionIterations = 20;
    engine.velocityIterations = 20;
    world = engine.world;
    // top down perspective so no gravity
    world.gravity.y = 0;

    // table/ball/pocket dimensions
    tableLength = windowWidth * 0.9;
    tableWidth = tableLength / 2;
    ballDiameter = tableWidth / 36;
    pocketDiameter = ballDiameter * 1.5;
    tableX = (width - tableLength) / 2;
    tableY = (height - tableWidth) / 2;

    // initialize table & cue
    table = new Table(tableX, tableY, tableLength, tableWidth, world);
    cue = new Cue();

    // constant positions
    const centerY = tableY + tableWidth / 2;
    const middleX = tableX + tableLength / 2;
    const rowSpacing = ballDiameter * 0.87;

    // positions for colored balls
    colorSpots = {
        green: { x: tableX + tableLength * 0.25, y: centerY - ballDiameter * 2 },
        brown: { x: tableX + tableLength * 0.25, y: centerY },
        yellow: { x: tableX + tableLength * 0.25, y: centerY + ballDiameter * 2 },
        blue: { x: middleX, y: centerY },
        pink: { x: tableX + tableLength * 0.75 - rowSpacing * 1.5, y: centerY },
        black: { x: tableX + tableLength - ballDiameter * 2, y: centerY }
    };

    collisionEventHandler();
    pocketEventHandler();

    // create rewind button
    rewindButton = createButton('Rewind');
    rewindButton.position(windowWidth - 80, 20);
    rewindButton.mousePressed(handleRewind);

    chooseLuckyPockets(); // choose lucky pockets
}

function draw() {
    background(30);
    // better refresh rate
    Engine.update(engine, 1000 / 120);

    // draw table, pockets, and balls
    table.draw();
    table.drawPockets();

    reds.forEach(b => b.draw());
    colors.forEach(b => b.draw());

    // draw cue ball if it's been placed
    if (cueBall) { 
        cueBall.draw();
    }

    // draw cue if user has aimed
    if (cueBall && cue.showLine) {
        cue.draw(cueBall.body.position);
    }

    // draw game instructions
    drawInstructions();
    // show preview when placing cue ball in D zone
    drawGhostCueBall();
    displayMessages();
    displayCollisionMessages();
    drawRespotMessage();
    // draw confettin effect when scoring in lucky pocket
    drawLuckyPocketEffects();
    // display rewind button & timer
    displayRewind();

    // show debug shapes
    if (debugMode) {
        table.showCushionsDebug();
        table.showLuckyPocketsDebug(luckyPockets);
    }

}

// --  User input functions  --
function mousePressed() {
    // place cue ball
    if (cueBallMustBePlaced && isInsideDZone(mouseX, mouseY)) {
        cueBall = new Ball(mouseX, mouseY, 'cue', world, color(255));
        cueBallMustBePlaced = false;
        return;
    }

    // start aiming
    if (!cueBallMustBePlaced && cueBall && allBallsStopped()) {
        let pos = cueBall.body.position;
        let distToCueBall = dist(mouseX, mouseY, pos.x, pos.y);
        if (distToCueBall < ballDiameter) {
            cue.startAiming(pos);
        }
    }
}

function mouseDragged() {
    cue.updateAiming(mouseX, mouseY);
}

function mouseReleased() {
    cue.endAiming(mouseX, mouseY);
}

function keyPressed() {
    // handle user input
    if (key === '1') {
        setupStartingBalls();
    } 
    if (key === '2') {
        setupAllBallsRandom();
    } 
    if (key === '3') {
        setupRedBallsRandom();
    }
    // shoot when pressing space (keycode == 32)
    if (keyCode === 32 && cueBall && cue.aimEnd) {
        saveSnapshot();
        cue.shoot(cueBall.body);
    }

    if (keyCode === ENTER) {
        cue.showLine = false;
    }

    // press d to show debug shapes
    if (key === 'd') {
        debugMode = !debugMode;
    }
}

// --  Ball setup functions -- 
// setup balls 
function setupStartingBalls() {
    reds.forEach(b => b.remove(world));
    colors.forEach(b => b.remove(world));
    reds = [];
    colors = [];

    if (cueBall) {
        cueBall.remove(world);
    }

    cueBall = null;
    cueBallMustBePlaced = true;

    let startX = tableX + tableLength * 0.75;
    let startY = tableY + tableWidth / 2;
    let rowSpacing = ballDiameter * 0.87;
    let colSpacing = ballDiameter;

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            let x = startX + row * rowSpacing;
            let y = startY + (col - row / 2) * colSpacing;
            reds.push(new Ball(x, y, 'red', world, color(255, 0, 0)));
        }
    }

    for (let col in colorSpots) {
        const pos = colorSpots[col];
        colors.push(new Ball(pos.x, pos.y, col, world, getBallColor(col)));
    }
}

// set up all balls randomly
function setupAllBallsRandom() {
    clearBalls();

    const allLabels = ["red", "green", "brown", "yellow", "blue", "pink", "black"];
    const numReds = 15;

    // Reds
    for (let i = 0; i < numReds; i++) {
        // random positions
        // x = from start of table + ball diameter up to table length - ball diameter
        // avoid balls being placed outside or on edges of table
        const x = random(tableX + ballDiameter, tableX + tableLength - ballDiameter);
        const y = random(tableY + ballDiameter, tableY + tableWidth - ballDiameter);
        reds.push(new Ball(x, y, "red", world, getBallColor("red")));
    }

    // Colors
    for (const label of allLabels.filter(l => l !== "red")) {
        const x = random(tableX + ballDiameter, tableX + tableLength - ballDiameter);
        const y = random(tableY + ballDiameter, tableY + tableWidth - ballDiameter);
        colors.push(new Ball(x, y, label, world, getBallColor(label)));
    }

    cueBall = null;
    cueBallMustBePlaced = true;
}

// set up only red balls randomly
function setupRedBallsRandom() {
    clearBalls();

    const numReds = 15;

    // randomly placed reds
    for (let i = 0; i < numReds; i++) {
        const x = random(tableX + ballDiameter, tableX + tableLength - ballDiameter);
        const y = random(tableY + ballDiameter, tableY + tableWidth - ballDiameter);
        reds.push(new Ball(x, y, "red", world, getBallColor("red")));
    }

    // standard spots for colored balls
    for (const label in colorSpots) {
        const pos = colorSpots[label];
        let ball = new Ball(pos.x, pos.y, label, world, getBallColor(label));
        colors.push(ball);
    }

    cueBall = null;
    cueBallMustBePlaced = true;
}

// clear any previous balls before placing new ones
function clearBalls() {
    if (cueBall) {
        cueBall.remove(world);
        cueBall = null;
    }

    reds.forEach(b => b.remove(world));
    colors.forEach(b => b.remove(world));

    reds = [];
    colors = [];
}


// get colors
function getBallColor(label) {
    switch (label) {
        case 'red': return color(255, 0, 0);
        case 'green': return color(0, 128, 0);
        case 'brown': return color(139, 69, 19);
        case 'yellow': return color(255, 255, 0);
        case 'blue': return color(0, 0, 255);
        case 'pink': return color(255, 105, 180);
        case 'black': return color(0);
        default: return color(255); // cue
    }
}

// --  Event Handlers --
function collisionEventHandler() {
    // collision event handler
    Events.on(engine, "collisionStart", (event) => {
        for (let pair of event.pairs) {
            const a = pair.bodyA;
            const b = pair.bodyB;
            const labels = [a.label, b.label];

            // check for cue ball pocketed
            if (labels.includes("cue") && labels.includes("pocket")) {
            if (cueBall) {
                // remove cue ball from world
                World.remove(world, cueBall);
                cueBall = null;
                // user must place cue bal again
                cueBallMustBePlaced = true;
                respotMessage = "Cue ball potted. Place it again in the D zone.";
                respotMessageTimer = 180;
            }
            }

            // cue ball collision messages
            if (a.label === 'cue' || b.label === 'cue') {
            const other = (a.label === 'cue') ? b : a;

            if (other.label === 'red') {
                cueCollisionMessage = "Cue hit red ball";
            } else if (['green', 'brown', 'yellow', 'blue', 'pink', 'black'].includes(other.label)) {
                cueCollisionMessage = "Cue hit color ball";
            } else if (other.label === 'cushion') {
                cueCollisionMessage = "Cue hit cushion";
            } else {
                cueCollisionMessage = "Cue hit something else";
            }

            cueCollisionTimer = 120;
            }
        }
    });
}

function pocketEventHandler() {
    // ball pocketing event handler
    Events.on(engine, "beforeUpdate", () => {
        // cue ball pocketed
        if (cueBall && cueBall.isInPocket(table.pockets)) {
            cueBall.remove(world);
            cueBall = null;
            cueBallMustBePlaced = true;
            respotMessage = "Cue ball potted. Place it again.";
            respotMessageTimer = 180;
        }

        // check if reds and color balls pocketed
        for (let ball of [...reds, ...colors]) {
            if (ball.isInPocket(table.pockets)) {
            // remove ball from worls
            ball.remove(world);

            if (ball.label === "red") {
                reds = reds.filter(b => b !== ball);

                // check for lucky pocket scoring
                const wasInLucky = table.pockets.some(p =>
                dist(ball.body.position.x, ball.body.position.y, p.x, p.y) < pocketDiameter * 0.6 &&
                luckyPockets.includes(p)
                );

                // handle scoring in lucky pocket
                if (wasInLucky) {
                score += 5;
                luckyPocketHitEffect.push({
                    x: ball.body.position.x,
                    y: ball.body.position.y,
                    timer: 60
                });
                respotMessage = "Lucky pocket! +5 points!";
                } else {
                score += 1;
                respotMessage = "Red ball potted.";
                }

                // reset lucky pockets after scoring
                chooseLuckyPockets();
            } else {
                colors = colors.filter(b => b !== ball);

                // check for two colored balls pocketed in a row
                if (lastPottedType === "color") {
                foulMessage = "Foul: Two color balls in a row.";
                foulTimer = 180;
                }

                lastPottedType = "color";
                tryRespotColorBall(ball.label);
            }

            respotMessageTimer = 180;
            }
        }
    });
}

// -- Area detection functions --

// check if all balls are stopped
function allBallsStopped() {
    let all = cueBall ? [cueBall, ...reds, ...colors] : [...reds, ...colors];
    return all.every(b => {
        const v = b.body.velocity;
        return abs(v.x) < 0.01 && abs(v.y) < 0.01;
    });
}

// check if inside D zone
function isInsideDZone(x, y) {
    const lineX = tableX + tableLength * 0.25;
    const centerY = tableY + tableWidth / 2;
    const radius = ballDiameter * 4;
    const dx = x - lineX;
    const dy = y - centerY;
    return x <= lineX && sqrt(dx * dx + dy * dy) <= radius;
}

// -- Display functions --

// draw game instructions
function drawInstructions() {
    fill(255);
    textAlign(LEFT, TOP);
    let msg = "Press 1: Starting\nPress 2: Random Reds & Colors\nPress 3: Random Reds";
    if (cueBallMustBePlaced) {
        msg += "\nClick inside D zone to place cue ball";
    }
    text(msg, 20, 20);

    text("Score: " + score, 20, 100);

    // avoid crash if cueBall is missing
    let ballsMoving = false;
    if (cueBall || reds.length || colors.length) {
        ballsMoving = !allBallsStopped();
    }

    if (ballsMoving) {
        fill(255, 100, 100);
        text("Wait: balls moving", 20, height - 40);
    }
}


// show cue ball collision messages
function displayCollisionMessages() {
    if (cueCollisionTimer > 0) {
        fill(255, 255, 0);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(cueCollisionMessage, width / 2, height - 60);
        cueCollisionTimer--;
    }
}

function displayMessages() {
    if (respotMessageTimer > 0) {
        fill(255, 255, 0);
        textAlign(RIGHT, TOP);
        text(respotMessage, width - 20, 20);
        respotMessageTimer--;
    }

    if (foulTimer > 0) {
        fill(255, 50, 50);
        textAlign(CENTER, TOP);
        text(foulMessage, width / 2, 60);
        foulTimer--;
    }
}

// display respotting messages
function drawRespotMessage() {
    if (respotMessageTimer > 0) {
        fill(255, 255, 0);
        textSize(16);
        textAlign(RIGHT, TOP);
        text(respotMessage, width - 20, 20);
        respotMessageTimer--;
    }
}

// draw preview of ball when user placing in D zone
function drawGhostCueBall() {
    if (!cueBallMustBePlaced) return;
    if (isInsideDZone(mouseX, mouseY)) {
        fill(255, 255, 255, 100);
    } else {
        fill(255, 0, 0, 80);
    }
    noStroke();
    ellipse(mouseX, mouseY, ballDiameter);
}

// -- Helper functions  --

// limit ball velocity to avoid flying off the table
function limitVelocity(ball) {
    const v = ball.body.velocity;
    const speed = sqrt(v.x * v.x + v.y * v.y);
    if (speed > 40) {
        const scale = 40 / speed;
        Body.setVelocity(ball.body, { x: v.x * scale, y: v.y * scale });
    }
}

// save game state for rewind 
function saveSnapshot() {
    if (!cueBall) return;

    lastBallStates = {
        cue: {
            pos: { x: cueBall.body.position.x, y: cueBall.body.position.y },
            vel: { x: cueBall.body.velocity.x, y: cueBall.body.velocity.y },
            label: cueBall.label
        },
        reds: reds.map(b => ({
            pos: { x: b.body.position.x, y: b.body.position.y },
            vel: { x: b.body.velocity.x, y: b.body.velocity.y },
            label: b.label
        })),
        colors: colors.map(b => ({
            pos: { x: b.body.position.x, y: b.body.position.y },
            vel: { x: b.body.velocity.x, y: b.body.velocity.y },
            label: b.label
        }))
    };
}

// try to respot ball
function tryRespotColorBall(label) {
    if (!colorSpots[label]) return;

    const spot = colorSpots[label];

    // check if spot is occupied
    const isOccupied = [...reds, ...colors].some(b => {
        const dx = b.body.position.x - spot.x;
        const dy = b.body.position.y - spot.y;
        const distSq = dx * dx + dy * dy;
        return distSq < ballDiameter * ballDiameter;
    });

    // if occupied -- dont respot
    if (isOccupied) {
        respotMessage = `${label} spot is blocked.`;
    } else {
        // respot ball
        const newBall = new Ball(spot.x, spot.y, label, world, getBallColor(label));
        colors.push(newBall);
        respotMessage = `${label} ball respotted.`;
    }

    respotMessageTimer = 180;
}

// -- Rewind extension functions --

// function to handle rewinding
function handleRewind() {
    if (!lastBallStates || rewindCooldown > 0) return;

    clearBalls();

    // restore cue ball
    if (lastBallStates.cue) {
        cueBall = new Ball(
            lastBallStates.cue.pos.x,
            lastBallStates.cue.pos.y,
            "cue",
            world,
            color(255) // white for cue ball
        );
        Body.setVelocity(cueBall.body, lastBallStates.cue.vel);
    }

    // restore red balls
    reds = lastBallStates.reds.map(b => {
        const red = new Ball(b.pos.x, b.pos.y, b.label, world, getBallColor(b.label));
        Body.setVelocity(red.body, b.vel);
        return red;
    });

    // restore color balls
    colors = lastBallStates.colors.map(b => {
        const col = new Ball(b.pos.x, b.pos.y, b.label, world, getBallColor(b.label));
        Body.setVelocity(col.body, b.vel);
        return col;
    });

    // start cooldown
    rewindCooldown = 600; // 10 seconds @ 60fps
}


// display rewind or countdown on button
function displayRewind() {
    if (rewindCooldown > 0) {
        rewindCooldown--;
        rewindButton.html(`${ceil(rewindCooldown / 60)}s`);
        rewindButton.attribute('disabled', '');
    } else {
        rewindButton.html('Rewind');
        rewindButton.removeAttribute('disabled');
    }
}

// --  Lucky pockets extension functions --

// choose 2 random lucky pockets
function chooseLuckyPockets() {
    luckyPockets = [];
    let indices = [];
    while (indices.length < 2) {
        let idx = floor(random(table.pockets.length));
        if (!indices.includes(idx)) {
            indices.push(idx);
        }
    }
    luckyPockets = indices.map(i => table.pockets[i]);
}

// draw confetti when scoring inside lucky pocket
function drawLuckyPocketEffects() {
    for (let i = luckyPocketHitEffect.length - 1; i >= 0; i--) {
        const e = luckyPocketHitEffect[i];
        if (e.timer-- <= 0) {
            luckyPocketHitEffect.splice(i, 1);
        } else {
            // draw confetti
            for (let j = 0; j < 10; j++) {
            // random angles and radius
            let angle = random(TWO_PI);
            let r = random(5, 20);
            let cx = e.x + cos(angle) * r;
            let cy = e.y + sin(angle) * r;
            // random color
            fill(random(255), random(255), random(255));
            noStroke();
            ellipse(cx, cy, 3);
            }
        }
    }
}
