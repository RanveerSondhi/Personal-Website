const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
const stickman = document.getElementById("stickman");
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let particles = [];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stickState = {
  x: window.innerWidth - 72,
  y: window.innerHeight - 160,
  targetX: window.innerWidth - 72,
  targetY: window.innerHeight - 160,
  vx: 0,
  vy: 0,
  swing: 0,
  idleTime: 0
};

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createParticles();
}

function createParticles() {
  const count = Math.max(20, Math.min(55, Math.floor(width / 22)));
  particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.3,
      speed: Math.random() * 0.28 + 0.05,
      drift: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.4 + 0.08
    });
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, width, height);

  const grad = ctx.createRadialGradient(
    width * 0.75,
    height * 0.15,
    0,
    width * 0.75,
    height * 0.15,
    width * 0.7
  );
  grad.addColorStop(0, "rgba(200,169,107,0.08)");
  grad.addColorStop(1, "rgba(200,169,107,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  particles.forEach((p) => {
    p.y -= p.speed;
    p.x += p.drift;

    if (p.y < -5) {
      p.y = height + 5;
      p.x = Math.random() * width;
    }

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
    glow.addColorStop(0, `rgba(241, 215, 162, ${p.alpha})`);
    glow.addColorStop(1, "rgba(241, 215, 162, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function animateStickman() {
  if (!stickman || reducedMotion) return;

  const dx = stickState.targetX - stickState.x;
  const dy = stickState.targetY - stickState.y;

  stickState.vx = dx * 0.08;
  stickState.vy = dy * 0.08;

  stickState.x += stickState.vx;
  stickState.y += stickState.vy;

  stickState.idleTime += 0.04;
  const bob = Math.sin(stickState.idleTime) * 4;
  const tilt = Math.sin(stickState.idleTime * 1.2) * 4;

  stickman.style.left = stickState.x + "px";
  stickman.style.top = stickState.y + bob + "px";
  stickman.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;

  const leftArm = stickman.querySelector(".arm.left");
  const rightArm = stickman.querySelector(".arm.right");
  const leftLeg = stickman.querySelector(".leg.left");
  const rightLeg = stickman.querySelector(".leg.right");
  const scarf = stickman.querySelector(".scarf");

  const swing = Math.sin(stickState.idleTime * 2.2) * 10;

  leftArm.style.transform = `rotate(${30 + swing}deg)`;
  rightArm.style.transform = `rotate(${-30 - swing}deg)`;
  leftLeg.style.transform = `rotate(${26 - swing * 0.6}deg)`;
  rightLeg.style.transform = `rotate(${-26 + swing * 0.6}deg)`;
  scarf.style.transform = `rotate(${swing * 0.8}deg) scaleX(${1 + Math.abs(swing) * 0.01})`;
}

function loop() {
  drawBackground();
  animateStickman();
  requestAnimationFrame(loop);
}

document.addEventListener("pointerdown", (e) => {
  if (reducedMotion) return;

  if (e.target.closest("input, textarea, button, form, label")) return;

  const padding = 40;
  stickState.targetX = Math.max(padding, Math.min(window.innerWidth - padding, e.clientX));
  stickState.targetY = Math.max(90, Math.min(window.innerHeight - padding, e.clientY));
});

window.addEventListener("scroll", () => {
  if (reducedMotion) return;

  const sections = [...document.querySelectorAll("section, footer")];
  const scrollMid = window.scrollY + window.innerHeight * 0.5;

  for (const section of sections) {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollMid >= top && scrollMid <= bottom) {
      stickState.targetY = Math.min(window.innerHeight - 130, 140 + (scrollMid - top) * 0.05);
      break;
    }
  }
}, { passive: true });

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.querySelector('input[name="name"]')?.value?.trim();

  formStatus.textContent = `Thanks${name ? ", " + name : ""}. This form is a front-end demo and can be connected to Formspree, EmailJS, or a backend later.`;
});

resizeCanvas();
loop();

window.addEventListener("resize", resizeCanvas);