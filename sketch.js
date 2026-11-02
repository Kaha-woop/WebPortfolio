const flowerPalette = [326, 338, 348, 316, 334, 352, 322, 343, 330, 355, 312, 340];

function setup() {
    createCanvas(windowWidth, windowHeight).parent("artwork");
    colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
    const state = getArtworkState();
    const now = performance.now();

    drawPinkAtmosphere(now, state.energy);
    for (const visual of state.noteVisuals) {
        drawNoteBloom(visual, now, state.energy);
    }
    drawCentralBloom(now, state.energy, state.heldNotes.length);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function drawPinkAtmosphere(now, energy) {
    background(340, 18, 98);
    noStroke();

    for (let layer = 0; layer < 5; layer += 1) {
        const drift = sin(now * 0.00012 + layer * 1.7) * width * 0.08;
        const x = width * (0.18 + layer * 0.17) + drift;
        const y = height * (0.35 + sin(now * 0.00016 + layer) * 0.11);
        fill(326 + layer * 5, 32, 99, 0.035 + energy * 0.012);
        ellipse(x, y, width * 0.38, height * 0.72);
    }

    noStroke();
    for (let mote = 0; mote < 34; mote += 1) {
        const x = (mote * 137.5 + sin(now * 0.0002 + mote) * 24 + width) % width;
        const y = (mote * 83.7 - now * (0.006 + (mote % 4) * 0.001) + height * 2) % height;
        fill(330 + (mote % 3) * 8, 24, 78, 0.28);
        circle(x, y, 1.5 + (mote % 3) * 0.4);
    }
}

function drawNoteBloom(visual, now, energy) {
    const elapsed = (now - visual.startedAt) / 1000;
    const releaseAge = visual.releasedAt === null ? 0 : (now - visual.releasedAt) / 1000;
    const fade = visual.releasedAt === null ? 1 : constrain(1 - releaseAge / 5, 0, 1);
    const bloomProgress = constrain(elapsed / 1.1, 0, 1);
    const bloom = 1 - pow(1 - bloomProgress, 3);
    const slot = visual.note % 12;
    const angle = -HALF_PI + slot * TWO_PI / 12;
    const radius = min(width, height) * (0.19 + (slot % 3) * 0.055);
    const x = width / 2 + cos(angle) * radius;
    const y = height / 2 + sin(angle) * radius * 0.72;
    const pulse = 1 + sin(now * 0.0017 + slot) * 0.025;
    const size = (38 + visual.velocity * 36 + energy * 20) * (0.16 + bloom * 0.84) * pulse;
    const hue = flowerPalette[slot];
    const flowerType = slot;
    const petalCounts = [5, 6, 7, 8, 9, 10, 11, 12, 6, 7, 9, 13];
    const petalCount = petalCounts[flowerType];
    const rotation = now * 0.00008 * (slot % 2 === 0 ? 1 : -1) + slot * 0.42;
    const stemX = width / 2 + cos(angle) * radius * 0.35;
    const stemY = height / 2 + sin(angle) * radius * 0.25;

    push();
    noFill();
    stroke(hue, 38, 68, 0.3 * fade);
    strokeWeight(1.1);
    bezier(width / 2, height / 2, stemX - sin(angle) * 24, stemY, x + cos(angle) * 18, y - 18, x, y);

    translate(x, y);
    rotate(rotation);
    const petalLength = [0.42, 0.4, 0.38, 0.36, 0.34, 0.32, 0.3, 0.28, 0.39, 0.35, 0.31, 0.24][flowerType] * size * bloom;
    const petalWidth = [0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.32, 0.34, 0.2, 0.25, 0.3, 0.36][flowerType] * size;
    const petalReach = [0.36, 0.35, 0.34, 0.33, 0.32, 0.31, 0.3, 0.29, 0.35, 0.33, 0.31, 0.28][flowerType] * size * bloom;
    const spread = 0.92 - flowerType * 0.035;

    for (let petal = 0; petal < petalCount; petal += 1) {
        push();
        rotate(petal * TWO_PI / petalCount);
        rotate((1 - bloom) * spread);
        noStroke();
        fill(hue, 38 + flowerType * 3, 96, 0.76 * fade);
        ellipse(petalReach, 0, petalLength, petalWidth);
        if (flowerType % 3 !== 0) {
            fill(hue, 28, 100, 0.45 * fade);
            ellipse(petalReach, 0, petalLength * 0.68, petalWidth * 0.32);
        }
        pop();
    }

    noStroke();
    fill(hue, 26, 100, 0.92 * fade);
    circle(0, 0, size * (0.2 + bloom * 0.08));
    fill(28, 26, 98, 0.94 * fade);
    circle(0, 0, size * 0.085);
    fill(42, 26, 100, 0.9 * fade);
    for (let seed = 0; seed < 5; seed += 1) {
        const seedAngle = seed * TWO_PI / 5;
        circle(cos(seedAngle) * size * 0.055, sin(seedAngle) * size * 0.055, size * 0.025);
    }
    pop();
}

function drawCentralBloom(now, energy, heldCount) {
    const pulse = 1 + sin(now * 0.0012) * 0.025;
    const size = (34 + energy * 22 + min(heldCount, 5) * 5) * pulse;
    const opened = 0.72 + min(heldCount, 4) * 0.07;

    push();
    translate(width / 2, height / 2);
    rotate(now * 0.000035);
    noStroke();
    for (let petal = 0; petal < 8; petal += 1) {
        push();
        rotate(petal * TWO_PI / 8);
        fill(flowerPalette[petal], 34, 98, 0.58);
        ellipse(size * 0.31 * opened, 0, size * 0.68 * opened, size * 0.29);
        pop();
    }
    fill(336, 22, 100, 0.9);
    circle(0, 0, size * 0.3);
    fill(35, 24, 98, 0.95);
    circle(0, 0, size * 0.11);
    pop();
}
