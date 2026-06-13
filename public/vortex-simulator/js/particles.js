import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let points, geometry, material;
const positions = new Float32Array(PHYS.PARTICLE_COUNT * 3);
const sizes = new Float32Array(PHYS.PARTICLE_COUNT);
const lifetimes = new Float32Array(PHYS.PARTICLE_COUNT);
const seeds = new Float32Array(PHYS.PARTICLE_COUNT);
const spawnRadii = new Float32Array(PHYS.PARTICLE_COUNT);
const spawnHeights = new Float32Array(PHYS.PARTICLE_COUNT);
let initialized = false;
let timeAccum = 0;

export function buildParticles(scene) {
  const sr = PHYS.PARTICLE_SPAWN_RADIUS;
  const sh = PHYS.PARTICLE_SPAWN_HEIGHT;

  for (let i = 0; i < PHYS.PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = sr * (0.5 + Math.random() * 0.5);
    const y = (Math.random() - 0.5) * sh * 2;
    positions[i * 3] = r * Math.cos(theta);
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = r * Math.sin(theta);
    sizes[i] = 0.002 + Math.random() * 0.004;
    lifetimes[i] = Math.random() * PHYS.PARTICLE_LIFETIME;
    seeds[i] = Math.random() * 100;
    spawnRadii[i] = r;
    spawnHeights[i] = y;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(100, 200, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(50, 150, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 50, 150, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);

  material = new THREE.PointsMaterial({
    size: 0.008,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.6,
    color: 0x88ccff,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
  initialized = true;
}

export function updateParticles(delta) {
  if (!initialized) return;
  timeAccum += delta;

  const vortexStr = state.vortexStability * 1.5;

  for (let i = 0; i < PHYS.PARTICLE_COUNT; i++) {
    const idx = i * 3;
    const x = positions[idx];
    const y = positions[idx + 1];
    const z = positions[idx + 2];
    const r = Math.sqrt(x * x + z * z);

    if (lifetimes[i] <= 0 || r < 0.003) {
      const theta = Math.random() * Math.PI * 2;
      const rr = PHYS.PARTICLE_SPAWN_RADIUS * (0.5 + Math.random() * 0.5);
      positions[idx] = rr * Math.cos(theta);
      positions[idx + 1] = (Math.random() - 0.5) * PHYS.PARTICLE_SPAWN_HEIGHT * 2;
      positions[idx + 2] = rr * Math.sin(theta);
      lifetimes[i] = PHYS.PARTICLE_LIFETIME * (0.5 + Math.random() * 0.5);
      continue;
    }

    if (r < 0.001) {
      lifetimes[i] = 0;
      continue;
    }

    const radialDirX = -x / r;
    const radialDirZ = -z / r;
    const radialSpeed = vortexStr * (0.02 / (r + 0.005));

    const axialDir = -Math.sign(y);
    const axialSpeed = vortexStr * 0.01 / (1 + Math.abs(y) * 2);

    const turbX = Math.sin(seeds[i] + timeAccum * 2) * 0.003;
    const turbZ = Math.cos(seeds[i] + timeAccum * 2.3) * 0.003;
    const turbY = Math.sin(seeds[i] + timeAccum * 1.7) * 0.002;

    positions[idx] += (radialDirX * radialSpeed + turbX) * delta * 60;
    positions[idx + 1] += (axialDir * axialSpeed + turbY) * delta * 60;
    positions[idx + 2] += (radialDirZ * radialSpeed + turbZ) * delta * 60;

    lifetimes[i] -= delta;
  }

  geometry.attributes.position.needsUpdate = true;

  // Particle color shifts with vortex strength
  const hue = 0.55 - state.vortexStability * 0.1;
  const sat = 0.5 + state.vortexStability * 0.4;
  const light = 0.4 + state.vortexStability * 0.3;
  material.color.setHSL(hue, sat, light);
  material.opacity = 0.2 + state.vortexStability * 0.5;
  material.size = 0.005 + state.vortexStability * 0.008;
}

export function burstParticles(count = 200) {
  for (let i = 0; i < Math.min(count, PHYS.PARTICLE_COUNT); i++) {
    const idx = Math.floor(Math.random() * PHYS.PARTICLE_COUNT) * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.05 + Math.random() * 0.1;
    positions[idx] = speed * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = speed * Math.cos(phi);
    positions[idx + 2] = speed * Math.sin(phi) * Math.sin(theta);
    lifetimes[idx / 3] = 0.3 + Math.random() * 0.5;
  }
}
