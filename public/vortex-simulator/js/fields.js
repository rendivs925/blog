import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let fieldPlane, fieldPlaneTop, canvas, ctx, canvasTop, ctxTop;
let initialized = false;

export function buildFields(scene) {
  canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  fieldPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.8),
    mat
  );
  fieldPlane.rotation.x = -Math.PI / 2;
  fieldPlane.position.y = -PHYS.DISC_OFFSET - 0.01;
  scene.add(fieldPlane);

  // Upper field plane — cavity resonance between discs
  canvasTop = document.createElement('canvas');
  canvasTop.width = 64;
  canvasTop.height = 64;
  ctxTop = canvasTop.getContext('2d');
  const texTop = new THREE.CanvasTexture(canvasTop);
  const matTop = new THREE.MeshBasicMaterial({
    map: texTop,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  fieldPlaneTop = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    matTop
  );
  fieldPlaneTop.rotation.x = -Math.PI / 2;
  fieldPlaneTop.position.y = PHYS.DISC_OFFSET + 0.01;
  scene.add(fieldPlaneTop);

  initialized = true;
}

export function updateFields(time) {
  if (!initialized) return;

  const vs = state.vortexStability;
  const be = state.backEmf;
  const pulseActive = state.pulseActive;
  const pulsePhase = state.pulsePhase;
  const pulseSnap = state.pulseSnap;
  const density = state.vacuumDensityEff;

  const imageData = ctx.createImageData(128, 128);
  const data = imageData.data;
  const cx = 64, cy = 64;
  const maxR = 60;

  // Pulse shockwave radius
  const shockRadius = pulseActive ? pulsePhase * maxR * 0.85 : -1;

  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const idx = (y * 128 + x) * 4;

      if (r > maxR) {
        data[idx] = 5; data[idx + 1] = 3; data[idx + 2] = 12; data[idx + 3] = 0;
        continue;
      }

      const normR = r / maxR;
      // 1/r pressure gradient from Bernoulli in superfluid
      const pressure = vs * density * 3 * (1 / (normR + 0.05) - 0.5);
      let intensity = Math.min(1, pressure * 1.2);

      // Back-EMF creates concentric standing waves — the vacuum vibrating
      if (be > 0.01) {
        const waveFreq = 8 + be * 6 + state.rpmSmooth * 0.00005;
        const emfWave = Math.sin(r * waveFreq - time * 6 + be * 4) * 0.5 + 0.5;
        intensity *= 1 + emfWave * be * 0.35;
      }

      // Pulse shockwave ring: vacuum disruption propagating outward
      if (pulseActive) {
        const distToRing = Math.abs(r - shockRadius);
        if (distToRing < 5) {
          const ringBright = (1 - distToRing / 5) * pulseSnap * 2.5;
          intensity = Math.min(1, intensity + ringBright);
        }
        if (r < shockRadius && r > 5) {
          const inflow = pulseSnap * 0.3 * (1 - r / shockRadius);
          intensity = Math.min(1, intensity + inflow * 0.4);
        }
      }

      intensity = Math.min(1, Math.max(0, intensity));

      // Color: vacuum blue-white, warmer with back-EMF
      const rVal = Math.floor(20 + (60 + be * 40) * Math.pow(intensity, 0.8));
      const gVal = Math.floor(15 + (80 + be * 30) * Math.pow(intensity, 0.7));
      const bVal = Math.floor(40 + 180 * intensity);

      data[idx] = Math.min(255, rVal);
      data[idx + 1] = Math.min(255, gVal);
      data[idx + 2] = Math.min(255, bVal);
      data[idx + 3] = Math.floor(140 * intensity);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  fieldPlane.material.map.needsUpdate = true;
  fieldPlane.material.opacity = Math.min(0.45, 0.05 + vs * 0.28 + be * 0.08);

  // Upper plane: cavity resonance + standing wave pattern
  const imgTop = ctxTop.createImageData(64, 64);
  const dataTop = imgTop.data;
  const cx2 = 32, cy2 = 32;
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const dx = x - cx2;
      const dy = y - cy2;
      const r2 = Math.sqrt(dx * dx + dy * dy);
      const idx2 = (y * 64 + x) * 4;
      if (r2 > 30) { dataTop[idx2 + 3] = 0; continue; }

      const normR2 = r2 / 30;
      const pressure2 = vs * density * 2 * (1 / (normR2 + 0.05) - 0.5);
      let int2 = Math.min(1, pressure2 * 1.0);

      // Standing wave resonance: cos(k·r) pattern from cavity mode
      const k = 6 + vs * 4 + be * 2;
      const resWave = Math.cos(r2 * k - time * 4) * 0.5 + 0.5;
      int2 *= 1 + resWave * 0.3 * vs;

      // Parametric resonance rings
      const paramRings = Math.sin(r2 * 3 - time * 2) * 0.3 + 0.7;
      int2 *= paramRings;

      int2 = Math.min(1, Math.max(0, int2));
      const rV = Math.floor(15 + 50 * Math.pow(int2, 0.8));
      const gV = Math.floor(10 + 70 * Math.pow(int2, 0.7));
      const bV = Math.floor(30 + 150 * int2);
      dataTop[idx2] = Math.min(255, rV);
      dataTop[idx2 + 1] = Math.min(255, gV);
      dataTop[idx2 + 2] = Math.min(255, bV);
      dataTop[idx2 + 3] = Math.floor(100 * int2);
    }
  }
  ctxTop.putImageData(imgTop, 0, 0);
  fieldPlaneTop.material.map.needsUpdate = true;
  fieldPlaneTop.material.opacity = Math.min(0.25, 0.02 + vs * 0.12 + be * 0.04);
}
