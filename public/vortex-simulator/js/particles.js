import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const COUNT = PHYS.PARTICLE_COUNT;
const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 3);
const lifetimes = new Float32Array(COUNT);
const seeds = new Float32Array(COUNT);

let points, geometry, material;
let initialized = false;
let timeAccum = 0;

const sr = PHYS.PARTICLE_SPAWN_RADIUS;
const sh = PHYS.PARTICLE_SPAWN_HEIGHT;

export function buildParticles(scene) {
  for (let i = 0; i < COUNT; i++) {
    seedParticle(i, true);
    seeds[i] = Math.random() * 100;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(240, 248, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(200, 230, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(100, 150, 220, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);

  material = new THREE.PointsMaterial({
    size: 0.01,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
    color: 0x88bbee,
    sizeAttenuation: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
  initialized = true;
}

function seedParticle(i, initial) {
  const idx = i * 3;
  const theta = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * sr;
  const y = (Math.random() - 0.5) * sh;

  positions[idx] = r * Math.cos(theta);
  positions[idx + 1] = y;
  positions[idx + 2] = r * Math.sin(theta);

  velocities[idx] = 0;
  velocities[idx + 1] = 0;
  velocities[idx + 2] = 0;

  lifetimes[i] = (initial ? 2.0 : PHYS.PARTICLE_LIFETIME) * (0.5 + Math.random() * 0.5);
}

export function updateParticles(delta) {
  if (!initialized) return;
  timeAccum += delta;

  const vs = state.vortexStability;
  const be = state.backEmf;
  const pa = state.pulseActive;
  const pulseSnap = state.pulseSnap;
  const circ = state.vortexCirculation;
  const gen = state.ganGenerator;
  const disc = state.ganDiscriminator;
  const ganTrans = state.ganTransition;

  const dt = delta * 60;
  const coreR = 0.006;
  const circNorm = Math.min(1, circ / 50);
  const genNorm = Math.min(1, gen / (disc + 0.01));

  const pulseBurst = pa && ganTrans > 0.5 ? 0.02 : 0;
  const pulseInrush = pa && pulseSnap < 0.3 ? 0.005 : 0;

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

    const safeR = Math.max(r, coreR);

    // --- Superfluid vortex velocity field ---
    // v_theta = Gamma / (2*pi*r)  — irrotational vortex (quantum vortex signature)
    // v_r = -k_inflow / r         — Bernoulli pressure gradient inflow
    // v_z = -k_axial * y          — axial convergence toward disc plane

    // Tangential velocity: the 1/r profile defines a quantum vortex
    const vTheta = circNorm * 0.02 / (safeR + 0.003);

    // Radial inflow: faster near core (Bernoulli pressure drop)
    const vRadial = -circNorm * 0.004 / (safeR + 0.005);

    // Axial convergence: particles flow toward z=0 (the disc plane)
    const vAxial = -y * vs * 0.015;

    // Convert to Cartesian
    const cosT = x / safeR;
    const sinT = z / safeR;
    const vxTarget = -vTheta * sinT + vRadial * cosT;
    const vzTarget = vTheta * cosT + vRadial * sinT;
    const vyTarget = vAxial;

    const coupling = 0.12 * (1 + vs * 0.5);

    let ax = (vxTarget - vx) * coupling;
    let ay = (vyTarget - vy) * coupling;
    let az = (vzTarget - vz) * coupling;

    // --- Superfluid quantum fluctuations (vacuum zero-point motion) ---
    if (vs > 0.1) {
      const s = seeds[i];
      const flucAmp = 0.0003 * vs * (1 + be * 0.5);
      const flucFreq = 1.5 + be * 1.0;
      ax += Math.sin(s * 0.7 + timeAccum * flucFreq) * flucAmp;
      ay += Math.cos(s * 1.1 + timeAccum * flucFreq * 0.8) * flucAmp * 0.6;
      az += Math.sin(s * 0.9 + timeAccum * flucFreq * 1.2) * flucAmp;
    }

    // --- GAN pulse: outward shockwave then inward inrush ---
    if (pulseBurst > 0.001 && safeR < 0.25) {
      const push = pulseBurst * (1 - safeR / 0.25);
      ax += x * push * 8;
      az += z * push * 8;
      ay += Math.sin(seeds[i] + timeAccum * 8) * push * 4;
    }
    if (pulseInrush > 0.001 && safeR > coreR * 2) {
      const pull = pulseInrush / (safeR + 0.01);
      ax -= x * pull;
      az -= z * pull;
    }

    // --- Core chaos: quantum vortex core dynamics ---
    if (r < coreR * 3 && vs > 0.3) {
      const s = seeds[i];
      const chaos = 0.003 * vs * (1 + genNorm * 0.5);
      ax += Math.sin(s + timeAccum * 5 + genNorm * 3) * chaos;
      az += Math.cos(s * 1.3 + timeAccum * 4.5) * chaos;
      ay += Math.sin(s * 0.7 + timeAccum * 6) * chaos * 0.5;
    }

    // Integrate
    const drag = 0.98;
    vx = (vx + ax * dt) * drag;
    vy = (vy + ay * dt) * drag;
    vz = (vz + az * dt) * drag;

    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    if (speed > 0.08) {
      const s = 0.08 / speed;
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

  // Color: colder (blue/violet) at outer edge, hotter (cyan/white) at core
  const avgIntensity = Math.min(1, circNorm * 0.6 + genNorm * 0.3 + (pa ? 0.2 : 0));
  const hue = 0.62 - avgIntensity * 0.14 - be * 0.02;
  material.color.setHSL(hue, 0.3 + avgIntensity * 0.4, 0.3 + avgIntensity * 0.5);
  material.opacity = Math.min(1, 0.15 + vs * 0.5 + be * 0.1 + genNorm * 0.2);
  material.size = 0.006 + avgIntensity * 0.01 + genNorm * 0.004;
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
