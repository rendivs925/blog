import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const COUNT = PHYS.PARTICLE_COUNT;
const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 3);
const lifetimes = new Float32Array(COUNT);
const seeds = new Float32Array(COUNT);
const stages = new Uint8Array(COUNT);
const colors = new Float32Array(COUNT * 3);

let points, geometry, material;
let initialized = false;
let timeAccum = 0;

const sr = 0.65;
const sh = 0.9;

export function buildParticles(scene) {
  for (let i = 0; i < COUNT; i++) {
    seedParticle(i, true);
    seeds[i] = Math.random() * 100;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(220, 235, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(180, 210, 240, 0.5)');
  gradient.addColorStop(1, 'rgba(100, 140, 200, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);

  material = new THREE.PointsMaterial({
    size: 0.012,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.55,
    vertexColors: true,
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

  lifetimes[i] = (initial ? 3.0 : PHYS.PARTICLE_LIFETIME) * (0.5 + Math.random() * 0.5);
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
  const circNorm = Math.min(1, circ / 150);
  const genNorm = Math.min(1, gen / (disc + 0.01));

  const pulseBurst = pa && ganTrans > 0.5 ? 0.02 : 0;
  const pulseInrush = pa && pulseSnap < 0.3 ? 0.005 : 0;

  // Pre-compute stage colors for chain reaction visibility
  const stageColData = [
    [0.60, 0.35, 0.40],  // inflow: blue
    [0.55, 0.50, 0.55],  // circ:  cyan
    [0.72, 0.30, 0.70],  // core:  violet-white
    [0.08, 0.60, 0.50],  // eject: orange
  ];
  const stageCols = new Float32Array(12);
  const tmpCol = new THREE.Color();
  for (let si = 0; si < 4; si++) {
    tmpCol.setHSL(stageColData[si][0], stageColData[si][1], stageColData[si][2]);
    stageCols[si * 3] = tmpCol.r;
    stageCols[si * 3 + 1] = tmpCol.g;
    stageCols[si * 3 + 2] = tmpCol.b;
  }

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

    // Superfluid vortex velocity field
    // v_θ = Γ/(2πr) — quantum vortex 1/r profile
    // v_r = -k_inflow/r — Bernoulli inflow
    // v_z = -k_axial·y — axial convergence
    const vTheta = circNorm * 0.008 / (safeR + 0.003);
    const vRadial = -circNorm * 0.002 / (safeR + 0.005);
    const vAxial = -y * vs * 0.008;

    const cosT = x / safeR;
    const sinT = z / safeR;
    const vxTarget = -vTheta * sinT + vRadial * cosT;
    const vzTarget = vTheta * cosT + vRadial * sinT;
    const vyTarget = vAxial;

    const coupling = 0.08 * (1 + vs * 0.3);
    let ax = (vxTarget - vx) * coupling;
    let ay = (vyTarget - vy) * coupling;
    let az = (vzTarget - vz) * coupling;

    // Heisenberg uncertainty jitter: Δx·Δp ≥ ħ/2
    // Tracer particles in a quantum fluid inherit zero-point motion
    const hbar = 1.0545718e-34;
    const heisenbergAmp = 0.0004 * vs * (1 + be * 0.3);
    const s = seeds[i];
    ax += Math.sin(s * 1.7 + timeAccum * 2.3) * heisenbergAmp;
    ay += Math.cos(s * 2.1 + timeAccum * 1.9) * heisenbergAmp * 0.6;
    az += Math.sin(s * 1.3 + timeAccum * 2.7) * heisenbergAmp;

    // GAN pulse shockwave
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

    // Core quantum chaos
    if (r < coreR * 3 && vs > 0.3) {
      const chaos = 0.002 * vs * (1 + genNorm * 0.5);
      ax += Math.sin(s + timeAccum * 5 + genNorm * 3) * chaos;
      az += Math.cos(s * 1.3 + timeAccum * 4.5) * chaos;
      ay += Math.sin(s * 0.7 + timeAccum * 6) * chaos * 0.5;
    }

    const drag = 0.97;
    vx = (vx + ax * dt) * drag;
    vy = (vy + ay * dt) * drag;
    vz = (vz + az * dt) * drag;

    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    if (speed > 0.06) {
      const scale = 0.06 / speed;
      vx *= scale; vy *= scale; vz *= scale;
    }

    positions[idx] += vx * dt;
    positions[idx + 1] += vy * dt;
    positions[idx + 2] += vz * dt;
    velocities[idx] = vx;
    velocities[idx + 1] = vy;
    velocities[idx + 2] = vz;

    // Determine particle stage (chain reaction visibility)
    const off = PHYS.DISC_OFFSET;
    let stage;
    if (r > 0.18) stage = 0;
    else if (r > 0.03) stage = 1;
    else if (absY < off * 0.5) stage = 2;
    else stage = 3;
    stages[i] = stage;

    // Stage-based color (inflow→circ→core→eject)
    colors[idx] = stageCols[stage * 3];
    colors[idx + 1] = stageCols[stage * 3 + 1];
    colors[idx + 2] = stageCols[stage * 3 + 2];

    lifetimes[i] -= delta;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;

  const avgIntensity = Math.min(1, circNorm * 0.5 + genNorm * 0.2 + (pa ? 0.15 : 0));
  material.opacity = Math.min(0.85, 0.12 + vs * 0.35 + be * 0.08 + genNorm * 0.15);
  material.size = 0.007 + avgIntensity * 0.008;
}

export function burstParticles(count) {
  const n = Math.min(count || 300, COUNT);
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
