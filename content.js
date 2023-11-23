const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '9999';

// Add canvas to the webpage body
document.body.appendChild(canvas);

let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
let sitCount = 1;
let then = performance.now();

document.onmousedown = (e) => {
    if (
        e.x >= cat.x + 40 ||
        e.x <= cat.x - 40 ||
        e.y >= cat.y + 40 ||
        e.y <= cat.y - 40
    ) {
        mouse.x = e.x;
        mouse.y = e.y;
    }
}

class Cat {
    constructor() {
        this.x = 0;
        this.y = Math.floor(Math.random() * canvas.height);
        this.image = new Image();
        this.frame = 0;
        this.isLeft = true;
        this.speed = 1.4;

        this.loadImage();
    }

    loadImage() {
        this.changeAction("walks", 7); // Initial action

        this.image.onload = () => {
            this.draw();
        };
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, -40, -40, 80, 80);
        }
        ctx.restore();
    }

    driveToTarget() {
        if (sitCount % 529 === 0) {
            this.frame = 0;
        }
        const fps = 6;
        const interval = 1000 / fps;
        const currentTime = performance.now();
        let deltaTime = currentTime - then;

        if (deltaTime > interval) {
            then = currentTime - (deltaTime % interval);
            this.frame++;
        }

        // Normalize vector
        let vecX = mouse.x - this.x;
        let vecY = mouse.y - this.y;
        let dist = Math.hypot(vecX, vecY);
        vecX /= dist;
        vecY /= dist;

        // Move the cat towards the mouse position
        if (
            this.x >= mouse.x + 10 ||
            this.x <= mouse.x - 10 ||
            this.y >= mouse.y + 10 ||
            this.y <= mouse.y - 10
        ) {
            if (!this.direction()) {
                this.changeAction("walks", 7);
            }

            this.x += vecX * this.speed * 0.8;
            this.y += vecY * this.speed;

            sitCount = 1;
        } else if (sitCount % 530 === 0) {
            if (this.frame >= 17) {
                sitCount++;
            }
            this.changeAction("licks", 18);
        } else {
            sitCount++;
            this.changeAction("sits", 5);
        }
    }

    direction() {
        //get angle to mouse click
        let angle = Math.atan2(mouse.y - this.y, mouse.x - this.x)
        //converts rads to degrees and ensures we get numbers from 0-180
        let angleDedrees = Math.abs(angle * (180 / Math.PI));

        //checks whether the target is on the right or left side.
        this.isLeft = angleDedrees > 90;
    }

    changeAction(newAction, frameNumber) {
        this.frame %= frameNumber;

        let action = this.isLeft ? `cat_${newAction}_left_${Math.floor(this.frame)}` :
            `cat_${newAction}_${Math.floor(this.frame)}`;
        this.image.src = chrome.extension.getURL(`images/${action}.png`);
    }
}

// Create canvas element and context
const cat = new Cat();
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cat.draw();
  cat.driveToTarget();

  requestAnimationFrame(animate);
}

animate();