import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const COUNT = PHYS.PARTICLE_COUNT;
const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 3);
const lifetimes = new Float32Array(COUNT);
const seeds = new Float32Array(COUNT);
const sizes = new Float32Array(COUNT);

let points, geometry, material;
let initialized = false;
let timeAccum = 0;

const sr = PHYS.PARTICLE_SPAWN_RADIUS;
const sh = PHYS.PARTICLE_SPAWN_HEIGHT;

export function buildParticles(scene) {
  for (let i = 0; i < COUNT; i++) {
    seedParticle(i, true);
    seeds[i] = Math.random() * 100;
    sizes[i] = 0.003 + Math.random() * 0.004;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(220, 240, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(180, 215, 250, 0.7)');
  gradient.addColorStop(1, 'rgba(120, 160, 220, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);

  material = new THREE.PointsMaterial({
    size: 0.008,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.7,
    color: 0xaaccee,
    sizeAttenuation: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
  initialized = true;
}

function seedParticle(i, initial) {
  const idx = i * 3;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  // Spread across full volume: some at outer, some mid, some core
  const zone = Math.random();
  let r, y;
  if (zone < 0.35) {
    // Outer inflow zone: large radius, moderate height
    r = sr * (0.35 + Math.random() * 0.65);
    y = (Math.random() - 0.5) * sh;
  } else if (zone < 0.65) {
    // Mid circulation zone
    r = 0.06 + Math.random() * 0.14;
    y = (Math.random() - 0.5) * sh * 0.6;
  } else if (zone < 0.85) {
    // Core region
    r = Math.random() * 0.04;
    y = (Math.random() - 0.5) * 0.04;
  } else {
    // Axial jets
    r = Math.random() * 0.08;
    y = (Math.random() > 0.5 ? 1 : -1) * (PHYS.DISC_OFFSET + Math.random() * 0.15);
  }

  positions[idx] = r * Math.sin(theta);
  positions[idx + 1] = y;
  positions[idx + 2] = r * Math.cos(theta);

  velocities[idx] = (Math.random() - 0.5) * 0.002;
  velocities[idx + 1] = (Math.random() - 0.5) * 0.001;
  velocities[idx + 2] = (Math.random() - 0.5) * 0.002;

  lifetimes[i] = (initial ? 1.0 : PHYS.PARTICLE_LIFETIME) * (0.5 + Math.random() * 0.5);
}

export function updateParticles(delta) {
  if (!initialized) return;
  timeAccum += delta;

  const vs = state.vortexStability;
  const be = state.backEmf;
  const pa = state.pulseActive;
  const pulsePhase = state.pulsePhase;
  const pulseSnap = state.pulseSnap;
  const circ = state.vortexCirculation;
  const grad = state.pressureGradient;
  const gen = state.ganGenerator;
  const disc = state.ganDiscriminator;
  const ganTrans = state.ganTransition;

  const dt = delta * 60;
  const coreR = 0.005;
  const off = PHYS.DISC_OFFSET;
  const circNorm = Math.min(1, circ / 50);
  const genNorm = Math.min(1, gen / (disc + 0.01));

  // Pulse shock — affects particles across all zones
  const pulseKick = pa ? 0.008 * Math.sign(pulseSnap - 0.3) : 0;
  const pulseBurst = pa && ganTrans > 0.5 ? 0.02 : 0;

  for (let i = 0; i < COUNT; i++) {
    const idx = i * 3;
    let x = positions[idx];
    let y = positions[idx + 1];
    let z = positions[idx + 2];
    let vx = velocities[idx];
    let vy = velocities[idx + 1];
    let vz = velocities[idx + 2];
    const r = Math.sqrt(x * x + z * z);
    const absY = Math.abs(y);

    if (lifetimes[i] <= 0 || r > sr * 1.2 || absY > sh * 1.2) {
      seedParticle(i, false);
      continue;
    }

    // Determine zone
    const inOuter = r > 0.16;
    const inMid = r > 0.04 && r <= 0.16;
    const inCore = r <= 0.04 && absY < off * 0.5;
    const inAxial = absY > off * 0.5 && r < 0.08;

    // --- Forces by zone ---
    let ax = 0, ay = 0, az = 0;

    // Outer zone: slow inward drift + vacuum fluctuations
    if (inOuter) {
      const inflow = circNorm * 0.0003 / (r + 0.01);
      ax -= x * inflow / r;
      az -= z * inflow / r;
      // Vacuum density fluctuation
      const s = seeds[i];
      const fluc = Math.sin(s * 0.2 + timeAccum * 0.5) * 0.0005 * vs;
      ax += Math.sin(s * 0.5 + timeAccum) * fluc;
      az += Math.cos(s * 0.5 + timeAccum * 1.1) * fluc;
      ay += Math.sin(s * 0.3 + timeAccum * 0.7) * fluc * 0.5;
    }

    // Mid zone: circulation + angular momentum + radial inflow
    if (inMid) {
      const safeR = Math.max(r, 0.02);
      const angSpeed = vs * 0.3 * (1 / (safeR + 0.01) - 2);
      // Tangential acceleration
      const tx = -z * angSpeed * 0.02;
      const tz = x * angSpeed * 0.02;
      ax += tx;
      az += tz;
      // Radial inflow (Bernoulli)
      const inflow = circNorm * 0.002 / (safeR + 0.005);
      ax -= x * inflow / safeR;
      az -= z * inflow / safeR;
      // Axial convergence
      ay -= y * vs * 0.008;
    }

    // Core zone: chaotic acceleration + pulse effects
    if (inCore) {
      const s = seeds[i];
      ax += Math.sin(s + timeAccum * 3 + genNorm * 2) * 0.002 * (1 + genNorm);
      az += Math.cos(s * 1.3 + timeAccum * 2.7 + genNorm * 2) * 0.002 * (1 + genNorm);
      ay += Math.sin(s * 0.7 + timeAccum * 3.5) * 0.001 * (1 + genNorm);
    }

    // Axial jets: ejection above/below discs
    if (inAxial) {
      const jetStrength = vs * 0.004 * (1 + be * 0.5);
      ay += Math.sign(y) * jetStrength;
    }

    // GAN pulse burst: abrupt outward push on all particles
    if (pulseBurst > 0.001 && r < 0.3) {
      const pushStr = pulseBurst * (1 - r / 0.3);
      ax += x * pushStr * 5;
      az += z * pushStr * 5;
      ay += Math.sin(seeds[i] + timeAccum * 10) * pushStr * 2;
    }

    // GAN pulse snap: sudden inward rush after burst
    if (pulseKick < -0.001) {
      const pullStr = -pulseKick * 0.5 / (r + 0.01);
      ax -= x * pullStr;
      az -= z * pullStr;
    }

    // Damping
    const drag = PHYS.PARTICLE_DRAG;
    vx = (vx + ax * dt) * drag;
    vy = (vy + ay * dt) * drag;
    vz = (vz + az * dt) * drag;

    // Clamp velocity
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const maxSpeed = 0.05;
    if (speed > maxSpeed) {
      const s = maxSpeed / speed;
      vx *= s; vy *= s; vz *= s;
    }

    positions[idx] += vx * dt;
    positions[idx + 1] += vy * dt;
    positions[idx + 2] += vz * dt;
    velocities[idx] = vx;
    velocities[idx + 1] = vy;
    velocities[idx + 2] = vz;

    lifetimes[i] -= delta;
  }

  geometry.attributes.position.needsUpdate = true;

  // Color and size by dominant energy zone
  const avgZone =
    genNorm * 0.5 + (state.pulseActive ? 0.3 : 0) + circNorm * 0.2;
  const hue = 0.60 - avgZone * 0.2 - be * 0.03;
  const colorSat = 0.2 + avgZone * 0.5;
  const colorLit = 0.3 + avgZone * 0.5 + genNorm * 0.3;
  material.color.setHSL(hue, colorSat, colorLit);
  material.opacity = Math.min(1, 0.1 + vs * 0.5 + be * 0.1 + genNorm * 0.3);
  material.size = 0.005 + avgZone * 0.01 + genNorm * 0.006;
}

export function burstParticles(count) {
  const n = Math.min(count || 400, COUNT);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * COUNT) * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = 0.02 + Math.random() * 0.08;
    positions[idx] = speed * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = speed * Math.cos(phi);
    positions[idx + 2] = speed * Math.sin(phi) * Math.sin(theta);
    velocities[idx] = positions[idx] * 0.5;
    velocities[idx + 1] = positions[idx + 1] * 0.5;
    velocities[idx + 2] = positions[idx + 2] * 0.5;
    lifetimes[idx / 3] = 0.5 + Math.random() * 0.8;
  }
}
