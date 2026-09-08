/**
 * ===================================================================
 *  BEATING HEART ✨ INTERACTIVE JAVASCRIPT EXPERIENCE
 *  - Volumetric 3D Particle Heart simulation with parametric math
 *  - Dual-pulse (Lub-Dub) cardiac physics & mouse-tilt 3D parallax
 *  - Interactive click burst particles & ambient floating hearts
 *  - Web Audio API heartbeat synthesizer
 * ===================================================================
 */

(() => {
  // Canvas setup
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');

  // UI Elements
  const customMessageEl = document.getElementById('customMessage');
  const speedSlider = document.getElementById('speedSlider');
  const bpmLabel = document.getElementById('bpmLabel');
  const densitySlider = document.getElementById('densitySlider');
  const densityLabel = document.getElementById('densityLabel');
  const swatches = document.querySelectorAll('.color-swatch');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const editMsgBtn = document.getElementById('editMsgBtn');
  const messageModal = document.getElementById('messageModal');
  const messageInput = document.getElementById('messageInput');
  const saveModalBtn = document.getElementById('saveModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const togglePanelBtn = document.getElementById('togglePanelBtn');
  const controlPanel = document.getElementById('controlPanel');
  const hintBadge = document.getElementById('hintBadge');

  // Themes
  const THEMES = {
    ruby: {
      primary: '#ff1e56',
      secondary: '#ff0844',
      accent: '#ff758c',
      glow: 'rgba(255, 30, 86, 0.4)',
      bgCenter: 'rgba(255, 30, 86, 0.12)'
    },
    crimson: {
      primary: '#ff0844',
      secondary: '#ff4e50',
      accent: '#f9d423',
      glow: 'rgba(255, 8, 68, 0.45)',
      bgCenter: 'rgba(255, 78, 80, 0.12)'
    },
    neon: {
      primary: '#ff2a8d',
      secondary: '#9d00ff',
      accent: '#ff71ce',
      glow: 'rgba(255, 42, 141, 0.45)',
      bgCenter: 'rgba(157, 0, 255, 0.12)'
    },
    golden: {
      primary: '#ff5e62',
      secondary: '#ff9966',
      accent: '#ffd166',
      glow: 'rgba(255, 94, 98, 0.4)',
      bgCenter: 'rgba(255, 153, 102, 0.12)'
    }
  };

  let currentTheme = THEMES.ruby;

  // Configuration state
  const config = {
    bpm: 75,
    particleCount: 2800,
    heartScale: 14,
    rotationSpeed: 0.005
  };

  // Mouse & View state
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    tiltX: 0,
    tiltY: 0,
    isDown: false
  };

  // Audio Context for synthesized heartbeat
  let audioCtx = null;
  let audioEnabled = false;
  let lastBeatSoundIndex = -1;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playHeartbeatThump(intensity = 1, pitchMultiplier = 1) {
    if (!audioEnabled || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;

      // Low frequency sub-bass thump
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      // Pitch drop: simulate cardiac pressure wave
      osc.frequency.setValueAtTime(68 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(32 * pitchMultiplier, now + 0.18);

      // Lowpass filter for smooth muffled chest resonance
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.45 * intensity, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {
      console.warn('Audio playback notice:', e);
    }
  }

  // ==========================================
  // Parametric Heart Formula
  // ==========================================
  function getHeartPoint(t) {
    // Classic heart parametric equations
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x, y };
  }

  // ==========================================
  // Heart Particle Class (3D Volumetric)
  // ==========================================
  class HeartParticle {
    constructor(baseX, baseY, baseZ, size, alpha, layerRatio) {
      this.baseX = baseX;
      this.baseY = baseY;
      this.baseZ = baseZ;
      this.size = size;
      this.alpha = alpha;
      this.layerRatio = layerRatio; // 0 = inner core, 1 = outer shell
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.02 + Math.random() * 0.04;
    }

    render(heartExpansion, rotX, rotY, centerX, centerY, scale) {
      this.twinklePhase += this.twinkleSpeed;
      const flicker = 0.8 + 0.2 * Math.sin(this.twinklePhase);

      // Heart expansion scales out from origin
      const currentScale = scale * (1 + heartExpansion * (0.8 + 0.2 * this.layerRatio));

      let x = this.baseX * currentScale;
      let y = this.baseY * currentScale;
      let z = this.baseZ * currentScale;

      // 3D Rotation: Yaw (Y-axis) and Pitch (X-axis)
      // Rotate around Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const cameraDistance = 600;
      const perspective = cameraDistance / (cameraDistance + z2);

      const screenX = centerX + x1 * perspective;
      const screenY = centerY + y1 * perspective;
      const renderSize = Math.max(0.6, this.size * perspective * (1 + heartExpansion * 0.3));

      // Alpha drops slightly towards back
      const depthAlpha = Math.max(0.15, Math.min(1, (z2 + 250) / 450));
      const finalAlpha = this.alpha * flicker * depthAlpha;

      ctx.fillStyle = this.getColor(finalAlpha);
      ctx.beginPath();
      ctx.arc(screenX, screenY, renderSize, 0, Math.PI * 2);
      ctx.fill();
    }

    getColor(alpha) {
      if (this.layerRatio > 0.85) {
        // Outer edge - brightest accent
        return `rgba(255, 220, 235, ${alpha * 0.9})`;
      } else if (this.layerRatio > 0.4) {
        // Middle body - primary theme
        return hexToRgba(currentTheme.primary, alpha);
      } else {
        // Core glowing depth
        return hexToRgba(currentTheme.secondary, alpha * 0.85);
      }
    }
  }

  // ==========================================
  // Burst Particle Class (on click / touch)
  // ==========================================
  class BurstParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = 2 + Math.random() * 5;
      this.alpha = 1;
      this.decay = 0.012 + Math.random() * 0.02;
      this.color = Math.random() > 0.5 ? currentTheme.accent : currentTheme.primary;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.2;
      this.isHeart = Math.random() > 0.4; // 60% chance to be a mini heart!
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.vy -= 0.2; // slight upward lift like flame/sparkle
      this.rotation += this.rotSpeed;
      this.alpha -= this.decay;
      return this.alpha > 0;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = hexToRgba(this.color, this.alpha);

      if (this.isHeart) {
        // Draw tiny heart shape
        drawMiniHeart(ctx, 0, 0, this.size * 1.8);
      } else {
        // Glowing diamond sparkle
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.7, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ==========================================
  // Ambient Floating Background Heart
  // ==========================================
  class AmbientHeart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 30;
      this.size = 4 + Math.random() * 14;
      this.speed = 0.5 + Math.random() * 1.2;
      this.alpha = 0.1 + Math.random() * 0.35;
      this.baseAlpha = this.alpha;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.02 + Math.random() * 0.03;
      this.swayDistance = 15 + Math.random() * 30;
    }

    update() {
      this.y -= this.speed;
      this.sway += this.swaySpeed;
      this.currentX = this.x + Math.sin(this.sway) * this.swayDistance;

      if (this.y < -40) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.currentX, this.y);
      ctx.fillStyle = hexToRgba(currentTheme.primary, this.alpha);
      ctx.shadowColor = currentTheme.glow;
      ctx.shadowBlur = 10;
      drawMiniHeart(ctx, 0, 0, this.size);
      ctx.restore();
    }
  }

  function drawMiniHeart(c, x, y, size) {
    const s = size / 16;
    c.beginPath();
    c.moveTo(x, y - 4 * s);
    c.bezierCurveTo(x + 6 * s, y - 12 * s, x + 16 * s, y - 2 * s, x, y + 14 * s);
    c.bezierCurveTo(x - 16 * s, y - 2 * s, x - 6 * s, y - 12 * s, x, y - 4 * s);
    c.fill();
  }

  // ==========================================
  // Particle Generation
  // ==========================================
  let heartParticles = [];
  let burstParticles = [];
  const ambientHearts = [];

  function generateHeartParticles() {
    heartParticles = [];
    const count = config.particleCount;

    for (let i = 0; i < count; i++) {
      // Sample parametric t uniformly
      const t = Math.random() * Math.PI * 2;
      const pt = getHeartPoint(t);

      // Volume fill: distribution biased towards outer rim with rich inner core
      // Using power distribution for smooth gradient density
      const layerRatio = Math.pow(Math.random(), 0.5);
      const x = pt.x * layerRatio;
      const y = pt.y * layerRatio;

      // 3D thickness: heart is thicker at center, tapering at the edges
      const maxZ = Math.sqrt(Math.max(0, 1 - layerRatio * layerRatio)) * 10;
      const z = (Math.random() - 0.5) * 2 * maxZ;

      // Outer rim particles have slightly larger size and higher opacity
      const size = layerRatio > 0.85 ? 1.4 + Math.random() * 1.8 : 0.8 + Math.random() * 1.4;
      const alpha = layerRatio > 0.85 ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.5;

      heartParticles.push(new HeartParticle(x, y, z, size, alpha, layerRatio));
    }
  }

  // Create ambient background hearts
  for (let i = 0; i < 26; i++) {
    ambientHearts.push(new AmbientHeart());
  }

  // ==========================================
  // Cardiac Physics & Heartbeat Cycle
  // ==========================================
  let beatPhase = 0;

  function calculateHeartbeat(timeDelta) {
    // Cardiac cycle calculation
    const cycleDuration = 60 / config.bpm; // seconds per beat
    beatPhase = (beatPhase + timeDelta / cycleDuration) % 1;

    let expansion = 0;

    // Dual pulse (Lub-Dub rhythm)
    // 1st pulse: Atrial systole (0.00 to 0.16)
    if (beatPhase < 0.16) {
      const p = beatPhase / 0.16;
      expansion = Math.sin(p * Math.PI) * 0.14;
      if (lastBeatSoundIndex !== 1 && p > 0.1) {
        playHeartbeatThump(0.7, 0.95);
        lastBeatSoundIndex = 1;
      }
    }
    // 2nd pulse: Ventricular systole (0.19 to 0.42) - stronger thump
    else if (beatPhase >= 0.19 && beatPhase < 0.42) {
      const p = (beatPhase - 0.19) / 0.23;
      expansion = Math.sin(p * Math.PI) * 0.34;
      if (lastBeatSoundIndex !== 2 && p > 0.08) {
        playHeartbeatThump(1.0, 1.12);
        lastBeatSoundIndex = 2;
      }
    }
    // Rest phase / Diastole (0.42 to 1.0)
    else {
      expansion = 0;
      if (beatPhase >= 0.5) {
        lastBeatSoundIndex = -1; // Reset ready for next cycle
      }
    }

    return expansion;
  }

  // ==========================================
  // Main Animation Loop
  // ==========================================
  let lastTime = performance.now();

  function animate(currentTime) {
    requestAnimationFrame(animate);

    const timeDelta = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    // Calculate screen centers
    const centerX = width / 2;
    const centerY = height / 2 + Math.sin(currentTime * 0.0015) * 8; // subtle gentle breathing float

    // Responsive scaling based on screen size
    const baseScale = Math.min(width, height) / 36;
    const heartScale = Math.max(8.5, Math.min(18, baseScale));

    // Smooth mouse tilt interpolation
    mouse.tiltX += ((mouse.targetX - centerX) / (width / 2) - mouse.tiltX) * 0.05;
    mouse.tiltY += ((mouse.targetY - centerY) / (height / 2) - mouse.tiltY) * 0.05;

    // Natural 3D wobble
    const autoRotY = Math.sin(currentTime * 0.0008) * 0.12;
    const rotY = autoRotY + mouse.tiltX * 0.45;
    const rotX = -mouse.tiltY * 0.35;

    // Clear canvas with subtle trail persistence
    ctx.fillStyle = 'rgba(8, 3, 8, 0.35)';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Ambient Floating Hearts in background
    for (let i = 0; i < ambientHearts.length; i++) {
      ambientHearts[i].update();
      ambientHearts[i].draw();
    }

    // 2. Calculate Heartbeat Expansion
    const heartExpansion = calculateHeartbeat(timeDelta);

    // 3. Render 3D Heart Particles
    // Use 'lighter' composite mode for radiant glowing light accumulation
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < heartParticles.length; i++) {
      heartParticles[i].render(heartExpansion, rotX, rotY, centerX, centerY, heartScale);
    }
    ctx.restore();

    // 4. Update & Render Burst Particles
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const p = burstParticles[i];
      if (p.update()) {
        p.draw();
      } else {
        burstParticles.splice(i, 1);
      }
    }
  }

  // ==========================================
  // Helper Functions & Interactivity
  // ==========================================
  function spawnBurst(x, y, count = 38) {
    for (let i = 0; i < count; i++) {
      burstParticles.push(new BurstParticle(x, y));
    }
  }

  function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
  }

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Mouse & Touch interaction
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;

    // Small trail particle on move (15% chance)
    if (Math.random() < 0.18) {
      burstParticles.push(new BurstParticle(e.clientX, e.clientY));
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    // Ignore clicks on control panel and modal
    if (e.target.closest('#controlPanel') || e.target.closest('#messageModal')) {
      return;
    }

    initAudio();
    spawnBurst(e.clientX, e.clientY, 45);

    // Heart spasm effect on click: jump beat phase
    beatPhase = 0.18;
    playHeartbeatThump(1.2, 1.25);

    // Hide hint badge after first interaction
    if (hintBadge) {
      hintBadge.style.opacity = '0';
      hintBadge.style.transition = 'opacity 0.6s ease';
      setTimeout(() => hintBadge.remove(), 600);
    }
  });

  // ==========================================
  // UI Controls & Listeners
  // ==========================================

  // Speed Slider (BPM)
  speedSlider.addEventListener('input', (e) => {
    config.bpm = parseInt(e.target.value, 10);
    bpmLabel.textContent = `${config.bpm} BPM`;
  });

  // Density Slider
  densitySlider.addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value, 10);
    densityLabel.textContent = config.particleCount > 3500 ? 'High' : config.particleCount > 2200 ? 'Normal' : 'Light';
    generateHeartParticles();
  });

  // Theme Swatches
  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      swatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');

      const themeKey = swatch.dataset.theme;
      if (THEMES[themeKey]) {
        currentTheme = THEMES[themeKey];
        document.documentElement.style.setProperty('--primary-color', currentTheme.primary);
        document.documentElement.style.setProperty('--secondary-color', currentTheme.secondary);
        document.documentElement.style.setProperty('--glow-color', currentTheme.glow);
      }
    });
  });

  // Audio Toggle Button
  audioToggleBtn.addEventListener('click', () => {
    initAudio();
    audioEnabled = !audioEnabled;
    const iconSpan = audioToggleBtn.querySelector('.btn-icon');
    const textSpan = audioToggleBtn.querySelector('.btn-text');

    if (audioEnabled) {
      iconSpan.textContent = '🔊';
      textSpan.textContent = 'Heartbeat Sound: ON';
      audioToggleBtn.style.background = 'linear-gradient(135deg, #00b09b, #96c93d)';
      audioToggleBtn.style.borderColor = '#96c93d';
      playHeartbeatThump(0.8, 1.0);
    } else {
      iconSpan.textContent = '🔇';
      textSpan.textContent = 'Heartbeat Sound: OFF';
      audioToggleBtn.style.background = '';
      audioToggleBtn.style.borderColor = '';
    }
  });

  // Panel Minimize / Maximize
  togglePanelBtn.addEventListener('click', () => {
    controlPanel.classList.toggle('minimized');
    togglePanelBtn.innerHTML = controlPanel.classList.contains('minimized') ? '&plus;' : '&minus;';
  });

  // Custom Message Modal
  editMsgBtn.addEventListener('click', () => {
    messageInput.value = customMessageEl.textContent;
    messageModal.classList.add('active');
    setTimeout(() => messageInput.focus(), 150);
  });

  cancelModalBtn.addEventListener('click', () => {
    messageModal.classList.remove('active');
  });

  saveModalBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text) {
      customMessageEl.textContent = text;
    }
    messageModal.classList.remove('active');
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveModalBtn.click();
    } else if (e.key === 'Escape') {
      cancelModalBtn.click();
    }
  });

  // Close modal when clicking on backdrop
  messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) {
      messageModal.classList.remove('active');
    }
  });

  // Keyboard shortcut: Spacebar to trigger heart burst
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !messageModal.classList.contains('active')) {
      e.preventDefault();
      initAudio();
      spawnBurst(width / 2, height / 2, 50);
      beatPhase = 0.18;
      playHeartbeatThump(1.2, 1.2);
    }
  });

  // Initialization
  generateHeartParticles();
  requestAnimationFrame(animate);
})();
