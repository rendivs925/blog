import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const COUNT = PHYS.PARTICLE_COUNT;
const positions = new Float32Array(COUNT * 3);
const lifetimes = new Float32Array(COUNT);
const seeds = new Float32Array(COUNT);

let points, geometry, material;
let initialized = false;
let timeAccum = 0;

export function buildParticles(scene) {
  const sr = PHYS.PARTICLE_SPAWN_RADIUS;
  const sh = PHYS.PARTICLE_SPAWN_HEIGHT;

  for (let i = 0; i < COUNT; i++) {
    seedParticle(i, sr, sh);
    seeds[i] = Math.random() * 100;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(200, 230, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(160, 200, 240, 0.6)');
  gradient.addColorStop(1, 'rgba(100, 140, 200, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);

  material = new THREE.PointsMaterial({
    size: 0.006,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.6,
    color: 0xaaccee,
    sizeAttenuation: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
  initialized = true;
}

function seedParticle(i, sr, sh) {
  const theta = Math.random() * Math.PI * 2;
  const r = sr * (0.3 + Math.random() * 0.7);
  const y = (Math.random() - 0.5) * sh * 2;
  positions[i * 3] = r * Math.cos(theta);
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = r * Math.sin(theta);
  lifetimes[i] = PHYS.PARTICLE_LIFETIME * (0.5 + Math.random() * 0.5);
}

export function updateParticles(delta) {
  if (!initialized) return;
  timeAccum += delta;

  const vs = state.vortexStability;
  const dt = delta * 60;
  const sr = PHYS.PARTICLE_SPAWN_RADIUS;
  const sh = PHYS.PARTICLE_SPAWN_HEIGHT;
  const coreR = 0.003;

  for (let i = 0; i < COUNT; i++) {
    const idx = i * 3;
    let x = positions[idx];
    let y = positions[idx + 1];
    let z = positions[idx + 2];
    const r = Math.sqrt(x * x + z * z);

    if (lifetimes[i] <= 0 || r < coreR) {
      if (r < coreR && vs > 0.3 && Math.random() < 0.15) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 0.02 + vs * 0.06;
        positions[idx] = speed * Math.sin(phi) * Math.cos(theta);
        positions[idx + 1] = speed * Math.cos(phi);
        positions[idx + 2] = speed * Math.sin(phi) * Math.sin(theta);
        lifetimes[i] = 0.3 + Math.random() * 0.5;
      } else {
        const theta = Math.random() * Math.PI * 2;
        const rr = sr * (0.3 + Math.random() * 0.7);
        positions[idx] = rr * Math.cos(theta);
        positions[idx + 1] = (Math.random() - 0.5) * sh * 2;
        positions[idx + 2] = rr * Math.sin(theta);
        lifetimes[i] = PHYS.PARTICLE_LIFETIME * (0.5 + Math.random() * 0.5);
      }
      continue;
    }

    if (r < 0.001) {
      lifetimes[i] = 0;
      continue;
    }

    const safeR = Math.max(r, coreR);

    const radialSpeed = vs * 0.0009 / (safeR + 0.005);

    const angSpeed = vs * 0.25 * (1 / (safeR + 0.005) - 3);

    const axialDir = -Math.sign(y);
    const axialSpeed = vs * 0.006 / (1 + Math.abs(y) * 3);

    const amp = vs * 0.002;
    const turbX = Math.sin(seeds[i] + timeAccum * 2.0 + Math.sin(seeds[i] * 0.1 + timeAccum * 0.5) * 0.5) * amp;
    const turbZ = Math.cos(seeds[i] + timeAccum * 2.3 + Math.cos(seeds[i] * 0.1 + timeAccum * 0.7) * 0.5) * amp;
    const turbY = Math.sin(seeds[i] + timeAccum * 1.7 + Math.sin(seeds[i] * 0.1 + timeAccum * 0.3) * 0.5) * amp * 0.75;

    const nx = x + (radialSpeed * (-x / safeR)) * dt;
    const nz = z + (radialSpeed * (-z / safeR)) * dt;

    const newTheta = Math.atan2(nz, nx) + angSpeed * dt;
    const newR = Math.sqrt(nx * nx + nz * nz);
    const rx = newR * Math.cos(newTheta);
    const rz = newR * Math.sin(newTheta);

    positions[idx] = rx + turbX * dt;
    positions[idx + 1] = y + (axialDir * axialSpeed + turbY) * dt;
    positions[idx + 2] = rz + turbZ * dt;

    lifetimes[i] -= delta;
  }

  geometry.attributes.position.needsUpdate = true;

  // Particle appearance
  const hue = 0.58 - vs * 0.1;
  material.color.setHSL(hue, 0.3 + vs * 0.4, 0.4 + vs * 0.5);
  material.opacity = 0.15 + vs * 0.55;
}

export function burstParticles(count) {
  const n = Math.min(count || 300, COUNT);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * COUNT) * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.03 + Math.random() * 0.08;
    positions[idx] = speed * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = speed * Math.cos(phi);
    positions[idx + 2] = speed * Math.sin(phi) * Math.sin(theta);
    lifetimes[idx / 3] = 0.3 + Math.random() * 0.6;
  }
}
