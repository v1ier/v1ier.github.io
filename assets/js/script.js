const AUDIO_SRC = "assets/audio/musicBackground.mp3";
const POEM_SRC = "content/poem.md";

const FALLBACK_POEM = `# Menjadi Lukamu

Hei, untukmu yang jauh di sana,  
seseorang yang datang seperti cahaya kecil  
ke dalam ruangan yang sudah lama kupikir  
tidak lagi memiliki pintu.

Kau membuatku tertawa,  
ketika tawa telah menjadi bahasa asing  
bagi bibir yang terlalu lama memeluk sepi.

Kau membuatku bahagia,  
ketika bahagia hanya terdengar seperti cerita  
yang hidup di tubuh orang lain,  
bukan di dalam diriku.

Kau membuatku mengingat,  
bukan hanya tentang runtuhnya dunia,  
tetapi tentang kemungkinan  
bahwa di antara puing-puing ini,  
masih ada sesuatu yang bisa tumbuh.

Kau membuatku menunggu,  
meski waktu selalu terasa kejam bagiku.  
Dan anehnya, untuk pertama kali,  
menunggu tidak lagi seperti hukuman,  
melainkan doa yang kupeluk diam-diam.

Kau membuat hatiku terbuka,  
hati yang sekian lama kujahit sendiri  
dengan benang ketakutan,  
dengan luka yang kusembunyikan,  
dengan nama-nama masa lalu  
yang tak pernah benar-benar pergi.

Lalu pada suatu hari,  
aku memberanikan diri membuka jahitan itu.  
Pelan-pelan.  
Dengan tangan gemetar.  
Dengan harapan yang hampir tak bernyawa.

Namun ketika hatiku mulai terbuka,  
ada suara gelap di kepalaku  
yang kembali berbisik tanpa ampun:

"Apakah aku layak untuk dicintai olehmu?"  
"Apakah aku pantas berada di hidupmu?"  
"Atau aku hanya akan menjadi luka lain  
yang suatu hari kau sesali?"

Sejak itu,  
hatiku ingin mendekat,  
tetapi kepalaku terus menariknya mundur.  
Keduanya berperang di dalam tubuhku,  
dan aku menjadi medan sunyi  
tempat cinta dan ketakutan saling menghancurkan.

Aku terjebak di antara dua sisi.  
Di satu sisi, ada dirimu.  
Di sisi lain, ada jurang yang pernah menelanku.  
Dan aku tidak tahu  
apakah langkahku menuju cinta  
atau kembali menuju kehancuran.

Cahaya terasa jauh.  
Keberanian mulai padam.  
Keputusan yang kubuat  
kembali terlihat seperti kesalahan.  
Bahkan kakiku tidak lagi percaya  
pada jalan yang ingin kutempuh.

Aku takut jatuh lagi.  
Aku takut mencintai dengan seluruh hatiku,  
lalu kehilangan diriku sendiri  
di tempat yang sama.

Kau memiliki tawa.  
Kau memiliki bahagia.  
Kau memiliki dunia  
yang mungkin lebih indah  
sebelum aku datang membawa gelapku.

Dan aku takut,  
kehadiranku bukan menjadi rumah,  
melainkan hujan panjang  
yang memadamkan semua harapan  
yang selama ini kau pelihara.

Maafkan aku,  
jika cintaku datang bersama luka.  
Maafkan aku,  
jika aku terlalu hancur  
untuk menjadi tempat pulang yang utuh.

Seharusnya mungkin aku tidak hadir  
di kehidupanmu.  
Namun hatiku, yang bodoh dan lelah ini,  
tetap menyebut namamu  
di antara sunyi dan doa.

Kini aku menyerahkan semuanya  
kepada Sang Pencipta.  
Kubiarkan waktu kembali berkuasa,  
kubiarkan takdir berbicara  
dengan bahasa yang belum mampu kupahami.

Jika Tuhan menuliskan kita untuk bersatu,  
semoga Ia sembuhkan dulu bagian diriku  
yang masih takut menerima cinta.

Namun jika tidak,  
biarlah aku mencintaimu dari kejauhan,  
dengan cara paling sunyi,  
paling gelap,  
dan paling ikhlas  
yang mampu dilakukan  
oleh hati yang pernah hancur.

vier`;

const moodSequence = [
  "arrival",
  "soft",
  "soft",
  "ember",
  "ember",
  "thread",
  "thread",
  "wound",
  "question",
  "question",
  "split",
  "abyss",
  "fall",
  "fall",
  "mirror",
  "rain",
  "sorry",
  "sorry",
  "prayer",
  "release",
  "release"
];

const loader = document.getElementById("loader");
const loadingFill = document.getElementById("loadingFill");
const loadingStatus = document.getElementById("loadingStatus");
const startButton = document.getElementById("startButton");
const music = document.getElementById("music");
const controls = document.getElementById("controls");
const pauseButton = document.getElementById("pauseButton");
const soundButton = document.getElementById("soundButton");
const restartButton = document.getElementById("restartButton");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const timelineFill = document.getElementById("timelineFill");
const poemCount = document.getElementById("poemCount");
const poemTitle = document.getElementById("poemTitle");
const poemText = document.getElementById("poemText");
const canvas = document.getElementById("atmosphere");
const ctx = canvas.getContext("2d");

music.loop = true;

let poem = parsePoem(FALLBACK_POEM);
let stages = [];
let currentStageIndex = 0;
let stageStartedAt = 0;
let stageDuration = 0;
let rafId = 0;
let canvasRafId = 0;
let pausedAt = 0;
let isPaused = false;
let hasStarted = false;
let isMuted = false;
let userVolume = 0.75;
let volumeFadeId = 0;
let audioObjectUrl = "";
let particles = [];
let rainDrops = [];
let dpr = 1;
let activeMood = "arrival";

function parsePoem(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const titleMatch = normalized.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "Menjadi Lukamu";
  const body = normalized.replace(/^#\s+.+\n*/, "").trim();
  const blocks = body
    .split(/\n\s*\n/g)
    .map((block) => block
      .split(/\n/g)
      .map((line) => line.replace(/\s{2,}$/g, "").trim())
      .filter(Boolean))
    .filter((lines) => lines.length > 0);

  return { title, blocks };
}

function buildStages() {
  stages = poem.blocks.map((lines, index) => {
    const charCount = lines.join(" ").length;
    const isFinale = index >= poem.blocks.length - 2;
    const mood = moodSequence[index] || "release";
    const extra = mood === "question" ? 2400 : isFinale ? 2800 : 0;
    const duration = Math.max(7200, Math.min(14200, 4700 + charCount * 45 + lines.length * 520 + extra));

    return {
      lines,
      mood,
      duration
    };
  });
}

function setProgress(value, status) {
  const progress = Math.max(0, Math.min(100, value));
  loadingFill.style.width = `${progress}%`;
  if (status) {
    loadingStatus.textContent = status;
  }
}

function waitForEvent(target, events, timeout = 8000) {
  return new Promise((resolve) => {
    let finished = false;
    const cleanups = [];
    const done = () => {
      if (finished) {
        return;
      }
      finished = true;
      cleanups.forEach((cleanup) => cleanup());
      resolve();
    };

    events.forEach((eventName) => {
      const handler = () => done();
      target.addEventListener(eventName, handler, { once: true });
      cleanups.push(() => target.removeEventListener(eventName, handler));
    });

    window.setTimeout(done, timeout);
  });
}

async function loadPoem() {
  setProgress(10, "Membuka puisi...");
  try {
    const response = await fetch(POEM_SRC, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Poem file unavailable");
    }
    poem = parsePoem(await response.text());
  } catch (error) {
    poem = parsePoem(FALLBACK_POEM);
  }
  buildStages();
  setProgress(24, "Menyusun bait...");
}

async function loadAudio() {
  setProgress(28, "Menyiapkan Moonlight Sonata...");
  try {
    const response = await fetch(AUDIO_SRC, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error("Audio file unavailable");
    }

    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body && response.body.getReader ? response.body.getReader() : null;

    if (!reader) {
      const blob = await response.blob();
      audioObjectUrl = URL.createObjectURL(blob);
      music.src = audioObjectUrl;
      setProgress(82, "Mengikat musik ke halaman...");
      await waitForEvent(music, ["canplaythrough", "loadeddata"], 6000);
      return;
    }

    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      chunks.push(value);
      received += value.length;

      if (total) {
        setProgress(30 + (received / total) * 50, "Menyiapkan Moonlight Sonata...");
      }
    }

    audioObjectUrl = URL.createObjectURL(new Blob(chunks, { type: "audio/mpeg" }));
    music.src = audioObjectUrl;
    music.load();
    setProgress(84, "Mengikat musik ke halaman...");
    await waitForEvent(music, ["canplaythrough", "loadeddata"], 6000);
  } catch (error) {
    music.src = AUDIO_SRC;
    music.load();
    setProgress(72, "Menyiapkan musik langsung dari folder...");
    await waitForEvent(music, ["canplaythrough", "loadeddata"], 6000);
  }
}

async function loadPage() {
  await Promise.all([
    loadPoem(),
    loadAudio(),
    document.fonts ? document.fonts.ready : Promise.resolve(),
    waitForEvent(window, ["load"], 5000)
  ]);

  setProgress(100, "Siap.");
  startButton.hidden = false;
  startButton.disabled = false;
  loadingStatus.textContent = "";
}

function renderStage(index) {
  const stage = stages[index];
  if (!stage) {
    return;
  }

  activeMood = stage.mood;
  document.body.dataset.mood = activeMood;
  poemTitle.textContent = index === 0 ? poem.title : "";
  poemCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(stages.length).padStart(2, "0")}`;
  poemText.replaceChildren();

  const lineDelay = Math.max(420, Math.min(920, (stage.duration - 2100) / Math.max(1, stage.lines.length)));
  stage.lines.forEach((line, lineIndex) => {
    const node = document.createElement("p");
    node.className = "poem-line";
    node.textContent = line;
    node.style.setProperty("--delay", `${Math.round(lineIndex * lineDelay)}ms`);

    if (line.includes('"')) {
      node.classList.add("is-question");
    }

    if (line.length <= 12) {
      node.classList.add("is-short");
    }

    if (index >= stages.length - 2) {
      node.classList.add("is-finale");
    }

    if (line.toLowerCase() === "vier") {
      node.classList.add("is-author");
    }

    poemText.appendChild(node);
  });

  stageDuration = stage.duration;
  stageStartedAt = performance.now();
}

function totalDuration() {
  return stages.reduce((total, stage) => total + stage.duration, 0);
}

function elapsedBefore(index) {
  return stages.slice(0, index).reduce((total, stage) => total + stage.duration, 0);
}

function tick(now) {
  if (!hasStarted || isPaused) {
    return;
  }

  const stageElapsed = now - stageStartedAt;
  const totalElapsed = elapsedBefore(currentStageIndex) + Math.min(stageElapsed, stageDuration);
  const progress = totalDuration() ? (totalElapsed / totalDuration()) * 100 : 0;
  timelineFill.style.width = `${Math.min(100, progress)}%`;

  if (stageElapsed >= stageDuration) {
    if (currentStageIndex < stages.length - 1) {
      currentStageIndex += 1;
      renderStage(currentStageIndex);
    } else {
      finishExperience();
      return;
    }
  }

  rafId = requestAnimationFrame(tick);
}

function clampVolume(value) {
  return Math.max(0, Math.min(1, value));
}

function syncVolumeUi() {
  const percentage = Math.round(userVolume * 100);
  volumeSlider.value = String(percentage);
  volumeValue.textContent = `${percentage}%`;
  volumeSlider.style.setProperty("--volume-level", `${percentage}%`);
}

function syncSoundLabel() {
  if (isMuted || userVolume === 0) {
    soundButton.textContent = "Sunyi";
    return;
  }

  soundButton.textContent = music.paused && hasStarted ? "Musik" : "Suara";
}

function setMusicVolume(value) {
  userVolume = clampVolume(value);
  volumeFadeId += 1;
  isMuted = userVolume === 0;
  music.muted = isMuted;
  music.volume = isMuted ? 0 : userVolume;
  syncVolumeUi();
  syncSoundLabel();
}

function fadeMusic(targetVolume, duration = 1200) {
  const fadeId = volumeFadeId + 1;
  volumeFadeId = fadeId;
  const startVolume = music.volume;
  const safeTarget = clampVolume(targetVolume);
  const startedAt = performance.now();

  function fade(now) {
    if (fadeId !== volumeFadeId) {
      return;
    }

    const progress = Math.min(1, (now - startedAt) / duration);
    music.volume = startVolume + (safeTarget - startVolume) * progress;

    if (progress < 1) {
      requestAnimationFrame(fade);
    }
  }

  requestAnimationFrame(fade);
}

async function startExperience() {
  if (hasStarted) {
    return;
  }

  hasStarted = true;
  isPaused = false;
  currentStageIndex = 0;
  document.body.classList.add("has-started");
  document.body.classList.remove("is-paused");
  controls.hidden = false;
  timelineFill.style.width = "0%";
  pauseButton.textContent = "Jeda";
  pauseButton.disabled = false;
  syncSoundLabel();

  renderStage(currentStageIndex);

  try {
    music.currentTime = 0;
    music.volume = 0;
    music.muted = isMuted;
    await music.play();
    fadeMusic(isMuted ? 0 : userVolume, 2600);
    syncSoundLabel();
  } catch (error) {
    soundButton.textContent = "Musik";
  }

  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function pauseExperience() {
  if (!hasStarted) {
    return;
  }

  if (!isPaused) {
    isPaused = true;
    pausedAt = performance.now();
    pauseButton.textContent = "Lanjut";
    document.body.classList.add("is-paused");
    cancelAnimationFrame(rafId);
    return;
  }

  isPaused = false;
  stageStartedAt += performance.now() - pausedAt;
  pauseButton.textContent = "Jeda";
  document.body.classList.remove("is-paused");
  rafId = requestAnimationFrame(tick);
}

async function toggleSound() {
  if (music.paused) {
    if (userVolume === 0) {
      userVolume = 0.75;
      syncVolumeUi();
    }

    isMuted = false;
    music.muted = false;

    try {
      await music.play();
      fadeMusic(userVolume, 900);
      syncSoundLabel();
    } catch (error) {
      soundButton.textContent = "Musik";
    }

    return;
  }

  isMuted = !isMuted;
  music.muted = isMuted;

  if (!isMuted && userVolume === 0) {
    userVolume = 0.75;
    syncVolumeUi();
  }

  if (!isMuted) {
    music.volume = userVolume;
  }

  syncSoundLabel();
}

function handleVolumeInput() {
  setMusicVolume(Number(volumeSlider.value) / 100);
}

function restartExperience() {
  currentStageIndex = 0;
  isPaused = false;
  document.body.classList.remove("is-paused");
  timelineFill.style.width = "0%";
  pauseButton.textContent = "Jeda";
  pauseButton.disabled = false;
  renderStage(currentStageIndex);

  try {
    music.currentTime = 0;
    music.play().catch(() => undefined);
    fadeMusic(isMuted ? 0 : userVolume, 800);
    syncSoundLabel();
  } catch (error) {
    // Audio is optional; the poem remains readable without it.
  }

  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function finishExperience() {
  timelineFill.style.width = "100%";
  pauseButton.textContent = "Selesai";
  pauseButton.disabled = true;
  fadeMusic(isMuted ? 0 : userVolume * 0.48, 2200);
  cancelAnimationFrame(rafId);
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedParticles();
  seedRain();
}

function seedParticles() {
  const amount = window.innerWidth < 520 ? 28 : 44;
  particles = Array.from({ length: amount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 0.4 + Math.random() * 1,
    speedX: -0.025 + Math.random() * 0.05,
    speedY: -0.018 + Math.random() * 0.04,
    alpha: 0.06 + Math.random() * 0.16,
    drift: Math.random() * Math.PI * 2
  }));
}

function paletteForMood() {
  const palettes = {
    arrival: ["217, 184, 117", "244, 239, 228"],
    soft: ["244, 239, 228", "217, 184, 117"],
    ember: ["161, 72, 63", "217, 184, 117"],
    thread: ["217, 184, 117", "244, 239, 228"],
    wound: ["109, 29, 39", "244, 239, 228"],
    question: ["161, 72, 63", "247, 213, 202"],
    split: ["170, 161, 145", "109, 29, 39"],
    abyss: ["90, 88, 82", "161, 72, 63"],
    fall: ["109, 29, 39", "170, 161, 145"],
    mirror: ["217, 184, 117", "109, 29, 39"],
    rain: ["170, 161, 145", "244, 239, 228"],
    sorry: ["161, 72, 63", "217, 184, 117"],
    prayer: ["217, 184, 117", "244, 239, 228"],
    release: ["244, 239, 228", "217, 184, 117"]
  };

  return palettes[activeMood] || palettes.arrival;
}

function makeRainDrop(initialY = Math.random() * window.innerHeight) {
  const depth = Math.random();
  const near = depth * depth;

  return {
    x: Math.random() * (window.innerWidth + 180) - 90,
    y: initialY,
    length: 10 + near * 30 + Math.random() * 12,
    speed: 3.4 + near * 9 + Math.random() * 3.5,
    wind: -1.35 - near * 2.9,
    width: 0.45 + near * 0.9,
    alpha: 0.045 + near * 0.18,
    shimmer: Math.random() * Math.PI * 2,
    shimmerSpeed: 0.006 + Math.random() * 0.012
  };
}

function seedRain() {
  const amount = window.innerWidth < 520 ? 88 : 145;
  rainDrops = Array.from({ length: amount }, () => makeRainDrop());
}

function resetRainDrop(drop) {
  Object.assign(drop, makeRainDrop(-40 - Math.random() * window.innerHeight * 0.35));
}

function rainIntensity() {
  if (["question", "abyss", "fall", "sorry"].includes(activeMood)) {
    return 1.08;
  }

  if (["release", "prayer"].includes(activeMood)) {
    return 0.72;
  }

  return 0.86;
}

function drawRain(time) {
  const intensity = rainIntensity();

  ctx.save();
  ctx.lineCap = "round";

  rainDrops.forEach((drop) => {
    drop.shimmer += drop.shimmerSpeed;
    drop.x += drop.wind;
    drop.y += drop.speed;

    if (drop.y > window.innerHeight + drop.length || drop.x < -150) {
      resetRainDrop(drop);
    }

    const sway = Math.sin(drop.shimmer + time * 0.0005) * 0.85;
    const endX = drop.x + drop.wind * 2.8 + sway;
    const endY = drop.y + drop.length;
    const alpha = Math.min(0.32, drop.alpha * intensity);
    const gradient = ctx.createLinearGradient(drop.x, drop.y, endX, endY);

    gradient.addColorStop(0, "rgba(226, 232, 236, 0)");
    gradient.addColorStop(0.38, `rgba(226, 232, 236, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(226, 232, 236, ${alpha})`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = drop.width;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });

  ctx.restore();
}

function animateCanvas(time) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const [primary, secondary] = paletteForMood();

  particles.forEach((particle) => {
    particle.drift += 0.004;
    particle.x += particle.speedX + Math.sin(particle.drift) * 0.045;
    particle.y += particle.speedY;

    if (particle.x < -10) particle.x = window.innerWidth + 10;
    if (particle.x > window.innerWidth + 10) particle.x = -10;
    if (particle.y < -10) particle.y = window.innerHeight + 10;
    if (particle.y > window.innerHeight + 10) particle.y = -10;

    const color = Math.sin(particle.drift) > 0 ? primary : secondary;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${color}, ${particle.alpha})`;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  drawRain(time);
  canvasRafId = requestAnimationFrame(animateCanvas);
}

startButton.addEventListener("click", startExperience);
pauseButton.addEventListener("click", pauseExperience);
soundButton.addEventListener("click", toggleSound);
restartButton.addEventListener("click", restartExperience);
volumeSlider.addEventListener("input", handleVolumeInput);

window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => {
  if (audioObjectUrl) {
    URL.revokeObjectURL(audioObjectUrl);
  }
  cancelAnimationFrame(rafId);
  cancelAnimationFrame(canvasRafId);
});

resizeCanvas();
syncVolumeUi();
canvasRafId = requestAnimationFrame(animateCanvas);
loadPage();
