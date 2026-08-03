const MANIFEST_SRC = "content/poems.json";

const canvas = document.getElementById("atmosphere");
const ctx = canvas.getContext("2d");
const poemThread = document.getElementById("poemThread");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let dpr = 1;
let particles = [];
let rafId = 0;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]
  ));
}

function poemEntryMarkup(poem) {
  const excerpt = poem.excerpt
    ? `<span class="poem-entry__excerpt">${escapeHtml(poem.excerpt)}</span>`
    : "";
  const date = poem.date
    ? `<span class="poem-entry__meta">${escapeHtml(poem.date)}</span>`
    : "";

  return `
    <li class="poem-entry">
      <a href="poem.html?slug=${encodeURIComponent(poem.slug)}">
        <span class="poem-entry__knot" aria-hidden="true"></span>
        <span class="poem-entry__body">
          <span class="poem-entry__title">${escapeHtml(poem.title)}</span>
          ${excerpt}
          ${date}
        </span>
        <span class="poem-entry__arrow" aria-hidden="true">&rarr;</span>
      </a>
    </li>
  `;
}

const GHOST_ENTRY = `
  <li class="poem-entry poem-entry--ghost">
    <span class="poem-entry__knot" aria-hidden="true"></span>
    <span class="poem-entry__body">
      <span class="poem-entry__title">Terlalu Sunyi</span>
      <span class="poem-entry__excerpt">Tak terpikirkan...</span>
    </span>
  </li>
`;

const EMPTY_ENTRY = `
  <li class="poem-entry poem-entry--ghost">
    <span class="poem-entry__knot" aria-hidden="true"></span>
    <span class="poem-entry__body">
      <span class="poem-entry__title">Belum ada puisi</span>
      <span class="poem-entry__excerpt">Kembali lagi nanti.</span>
    </span>
  </li>
`;

function renderPoems(poems) {
  if (!poems.length) {
    poemThread.innerHTML = EMPTY_ENTRY;
    return;
  }

  poemThread.innerHTML = poems.map(poemEntryMarkup).join("") + GHOST_ENTRY;
}

async function loadPoems() {
  try {
    const response = await fetch(MANIFEST_SRC, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Manifest unavailable");
    }
    const data = await response.json();
    return Array.isArray(data.poems) ? data.poems : [];
  } catch (error) {
    return [];
  }
}

function seedParticles() {
  const amount = window.innerWidth < 520 ? 20 : 34;
  particles = Array.from({ length: amount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 0.4 + Math.random() * 1,
    speedX: -0.02 + Math.random() * 0.04,
    speedY: -0.015 + Math.random() * 0.03,
    alpha: 0.05 + Math.random() * 0.13,
    drift: Math.random() * Math.PI * 2
  }));
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedParticles();
}

function drawParticlesFrame() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    particle.drift += 0.003;
    particle.x += particle.speedX + Math.sin(particle.drift) * 0.04;
    particle.y += particle.speedY;

    if (particle.x < -10) particle.x = window.innerWidth + 10;
    if (particle.x > window.innerWidth + 10) particle.x = -10;
    if (particle.y < -10) particle.y = window.innerHeight + 10;
    if (particle.y > window.innerHeight + 10) particle.y = -10;

    const color = Math.sin(particle.drift) > 0 ? "217, 184, 117" : "244, 239, 228";
    ctx.beginPath();
    ctx.fillStyle = `rgba(${color}, ${particle.alpha})`;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function animate() {
  drawParticlesFrame();
  rafId = requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));

resizeCanvas();

if (prefersReducedMotion) {
  drawParticlesFrame();
} else {
  rafId = requestAnimationFrame(animate);
}

loadPoems().then(renderPoems);
