const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// holy spaghetticode omg
const blockHeight = 30;
const originalWidth = 200;
const originalDepth = 200;
const viewX = canvas.width / 2;
const viewY = canvas.height * 0.58;

let stack = [];
let gameActive = true;
let score = 0;
let speed = 2;
let currentDirection = 'X'

function createBlock(x, z, width, depth, isMoving = false) {
    return {
        x: x,
        z: z,
        width: width,
        depth: depth,
        moving: isMoving,
        dir: 1,
        color: `hsl(${(stack.length * 15) % 360}, 65%, 55%)`
    };
}

function initGame() {
    stack = [];
    score = 0;
    speed = 2;
    currentDirection = 'X';
    gameActive = true;
    stack.push(createBlock(0, 0, originalWidth, originalDepth, false));
    stack.push(createBlock(-150, 0, originalWidth, originalDepth, true));
}

function project(x, y, z) {
    return {
        x: viewX + (x - z) * 0.8,
        y: viewY - y + (x + z) * 0.4
    };
}

function drawBlock(b, yOffset) {
    const t1 = project(b.x, yOffset, b.z);
    const t2 = project(b.x + b.width, yOffset, b.z);
    const t3 = project(b.x + b.width, yOffset, b.z +b.depth);
    const t4 =project(b.x, yOffset, b.z + b.depth);

    const b1 = project(b.x, yOffset - blockHeight, b.z);
    const b2 = project(b.x + b.width, yOffset - blockHeight, b.z);
    const b3 = project(b.x + b.width, yOffset - blockHeight, b.z + b.depth);
    const b4 = project(b.x, yOffset - blockHeight, b.z + b.depth);

    ctx.fillStyle = adjustBrightness(b.color, -20);
    ctx.beginPath();
    ctx.moveTo(t1.x, t1.y); ctx.lineTo(t4.x, t4.y); ctx.lineTo(b4.x, b4.y); ctx.lineTo(b1.x, b1.y);
    ctx.fill();

    ctx.fillStyle = adjustBrightness(b.color, -10);
    ctx.beginPath();
    ctx.moveTo(t4.x, t4.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y);
    ctx.fill();

    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y);
    ctx.fill();
}

function adjustBrightness(hslColor, percent) {
    const parts = hslColor.match(/\d+/g)
    let l = parseInt(parts[2]) + percent;
    return `hsl(${parts[0]}, ${parts[1]}%, ${l}%)`;
}

function update() {
    if (!gameActive) return;

    const active = stack[stack.length - 1];

    if (currentDirection === 'X') {
        active.x += speed * active.dir;
        if (active.x > 180) active.dir = -1;
        if (active.x < -180) active.dir = 1;
    } else {
        active.z += speed * active.dir;
        if (active.z > 180) active.dir = -1;
        if (active.z < -180) active.dir = 1;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cameraHeight = (stack.length - 1) * blockHeight;

    for (let i = 0; i < stack.length; i++) {
        const yPos = i * blockHeight - cameraHeight;
        drawBlock(stack[i], yPos);
    }

    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(score, canvas.width / 2, 60);

    if (!gameActive) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4444";
        ctx.fillText("ha imagine losing", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px sans-serif";
        ctx.fillText("click or press space to try again", canvas.width / 2, canvas.height / 2 + 20);
    }
}

function handleAction() {
    if (!gameActive) {
        initGame();
        return;
    }

    const active = stack[stack.length - 1];
    const target = stack[stack.length - 2];

    active.moving = false;

    if (currentDirection === 'X') {
        const deltaX = active.x - target.x;
        const absDeltaX = Math.abs(deltaX);

        if (absDeltaX >= target.width) {
            gameActive = false;
            return;
        }

        const newWidth = target.width - absDeltaX;
        active.width = newWidth;
        if (deltaX > 0) {
            active.x = target.x + deltaX;
        } else {
            active.x = target.x;
        }
    } else {
        const deltaZ = active.z - target.z;
        const absDeltaZ = Math.abs(deltaZ);

        if (absDeltaZ >= target.depth) {
            gameActive = false;
            return;
        }
        
        const newDepth = target.depth - absDeltaZ;
        active.depth = newDepth;
        if (deltaZ > 0) {
            active.z = target.z + deltaZ;
        } else {
            active.z = target.z;
        }
    }

    score++;
    speed += 0.25; //speed
    currentDirection = currentDirection === 'X' ? 'Z' : 'X'

    const spawnX = currentDirection === 'X' ? -180 : active.x;
    const spawnZ = currentDirection === 'Z' ? -180 : active.z;
    stack.push(createBlock(spawnX, spawnZ, active.width, active.depth, true));
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => { if (e.code === "Space") {e.preventDefault(); handleAction();} });
canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handleAction(); });
canvas.addEventListener("mousedown", (e) => { e.preventDefault(); handleAction(); });

initGame();
loop();