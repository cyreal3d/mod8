const canvas = document.getElementById('appleCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize canvas on window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Background and Apple Images
const backgroundImage = new Image();
backgroundImage.src = 'background3.jpg'; // Ensure background.jpg is in the same directory

const appleImage = new Image();
appleImage.src = 'apple.png'; // Ensure apple.png is in the same directory

// Gravity and Damping
let gravity = 0.7;
const damping = 0.8; // Energy loss on bounce (less reactive collisions)

// Apple Class
class Apple {
  constructor(x, y, size, dx, dy) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.dx = dx; // Horizontal velocity
    this.dy = dy; // Vertical velocity
    this.isDragging = false; // Is the apple being dragged?
  }

  draw() {
    ctx.drawImage(appleImage, this.x, this.y, this.size, this.size);
  }

  update() {
    if (!this.isDragging) {
      this.dy += gravity; // Apply gravity
      this.x += this.dx;
      this.y += this.dy;

      // Bounce off the ground
      if (this.y + this.size > canvas.height) {
        this.y = canvas.height - this.size; // Stop apple from going below ground
        this.dy *= -damping; // Reverse and reduce vertical velocity
      }

      // Bounce off the walls
      if (this.x + this.size > canvas.width || this.x < 0) {
        this.dx *= -1; // Reverse horizontal velocity
      }
    }

    this.draw();
  }

  isMouseOver(mx, my) {
    // Check if the mouse or touch is over this apple
    return mx > this.x && mx < this.x + this.size && my > this.y && my < this.y + this.size;
  }
}

// Create Apples (Reduced Number)
const apples = [];
const maxApples = 25; // Fewer apples for a simpler setup
for (let i = 0; i < maxApples; i++) {
  const size = 50;
  const x = Math.random() * (canvas.width - size);
  const y = Math.random() * (canvas.height / 2);
  const dx = (Math.random() - 0.5) * 3; // Reduced initial velocity
  const dy = Math.random() * -3;
  apples.push(new Apple(x, y, size, dx, dy));
}

// Dragging Variables
let draggingApple = null;
let offsetX = 0;
let offsetY = 0;

// Mouse Events
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (const apple of apples) {
    if (apple.isMouseOver(mouseX, mouseY)) {
      draggingApple = apple;
      draggingApple.isDragging = true;
      offsetX = mouseX - apple.x;
      offsetY = mouseY - apple.y;
      break;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (draggingApple) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    draggingApple.x = mouseX - offsetX;
    draggingApple.y = mouseY - offsetY;
  }
});

canvas.addEventListener('mouseup', () => {
  if (draggingApple) {
    draggingApple.isDragging = false;
    draggingApple = null;
  }
});

// Touch Events
canvas.addEventListener('touchstart', (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const touchX = touch.clientX - rect.left;
  const touchY = touch.clientY - rect.top;

  for (const apple of apples) {
    if (apple.isMouseOver(touchX, touchY)) {
      draggingApple = apple;
      draggingApple.isDragging = true;
      offsetX = touchX - apple.x;
      offsetY = touchY - apple.y;
      break;
    }
  }
});

canvas.addEventListener('touchmove', (e) => {
  if (draggingApple) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    draggingApple.x = touchX - offsetX;
    draggingApple.y = touchY - offsetY;
  }
});

canvas.addEventListener('touchend', () => {
  if (draggingApple) {
    draggingApple.isDragging = false;
    draggingApple = null;
  }
});

// Collision Detection (Less Reactive)
function resolveCollisions() {
  for (let i = 0; i < apples.length; i++) {
    for (let j = i + 1; j < apples.length; j++) {
      const apple1 = apples[i];
      const apple2 = apples[j];

      if (apple1.isDragging || apple2.isDragging) continue; // Skip dragged apples

      const dx = apple2.x - apple1.x;
      const dy = apple2.y - apple1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < apple1.size) {
        const overlap = (apple1.size - distance) / 2;
        const angle = Math.atan2(dy, dx);

        apple1.x -= Math.cos(angle) * overlap * 0.5; // Reduced reaction
        apple1.y -= Math.sin(angle) * overlap * 0.5;
        apple2.x += Math.cos(angle) * overlap * 0.5;
        apple2.y += Math.sin(angle) * overlap * 0.5;

        // Exchange velocities (gentler effect)
        [apple1.dx, apple2.dx] = [apple2.dx * 0.7, apple1.dx * 0.7];
        [apple1.dy, apple2.dy] = [apple2.dy * 0.7, apple1.dy * 0.7];
      }
    }
  }
}

// Draw the Background
function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Animate the Apples
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(); // Draw the background
  apples.forEach(apple => apple.update());
  resolveCollisions(); // Handle collisions
  requestAnimationFrame(animate);
}

// Gravity Slider
const sliderContainer = document.createElement("div");
sliderContainer.style.position = "absolute";
sliderContainer.style.top = "10px";
sliderContainer.style.left = "10px";
sliderContainer.style.background = "rgba(0, 0, 0, 0.5)";
sliderContainer.style.padding = "10px";
sliderContainer.style.borderRadius = "5px";
sliderContainer.style.color = "white";
sliderContainer.style.zIndex = "1000";

const gravityControl = document.createElement("input");
gravityControl.type = "range";
gravityControl.min = "0.1";
gravityControl.max = "2";
gravityControl.step = "0.1";
gravityControl.value = gravity;
gravityControl.style.width = "200px";

const gravityLabel = document.createElement("div");
gravityLabel.innerText = `Gravity: ${gravity}`;

sliderContainer.appendChild(gravityLabel);
sliderContainer.appendChild(gravityControl);
document.body.appendChild(sliderContainer);

gravityControl.addEventListener("input", (e) => {
  gravity = parseFloat(e.target.value);
  gravityLabel.innerText = `Gravity: ${gravity}`;
});

// Start the Animation When Images Are Loaded
let imagesLoaded = 0;
function startAnimation() {
  imagesLoaded++;
  if (imagesLoaded === 2) animate(); // Wait for both background and apple images
}

backgroundImage.onload = startAnimation;
appleImage.onload = startAnimation;
